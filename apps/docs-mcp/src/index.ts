import cors from "cors";
import type { Request, Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { config } from "./config.js";
import { DocsIndex } from "./indexer.js";
import { createServer } from "./server.js";

/**
 * Configuration
 * 
 * Keep-Alive and Timeout Strategy:
 * 
 * 1. HTTP-Level Keep-Alive:
 *    - SSE connections use HTTP Connection: keep-alive header (line 157)
 *    - This keeps the TCP connection alive for long-running SSE streams
 * 
 * 2. MCP Protocol Ping:
 *    - Per MCP spec (https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping)
 *    - The SDK automatically handles incoming ping requests
 *    - No automatic periodic ping sending (must be implemented manually if needed)
 *    - Implementations SHOULD periodically issue pings to detect connection health
 * 
 * 3. Request Timeouts:
 *    - SDK default: 60 seconds (DEFAULT_REQUEST_TIMEOUT_MSEC in protocol.d.ts)
 *    - Our override: 5 minutes for long-running operations
 *    - Can be overridden per-request via RequestOptions.timeout
 *    - Progress notifications can reset timeout if resetTimeoutOnProgress: true
 * 
 * References:
 * - MCP Ping: https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping
 * - SDK Protocol: @modelcontextprotocol/sdk/shared/protocol.d.ts
 * - Known Issue: https://github.com/modelcontextprotocol/typescript-sdk/issues/245
 */
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT ?? "300000", 10); // 5 minutes (SDK default is 60s)
const DRAIN_DETECTION_TIMEOUT = 60000; // 60 seconds of no requests = draining

// Track active connections and draining state
const activeConnections = new Set<{ transport: StreamableHTTPServerTransport; server: any }>();
let isDraining = false;
let lastRequestTime = Date.now();

// Allowed origins for CORS and security
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "https://journium.app", "https://*.journium.app"];

function isValidOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // No origin header (non-browser clients)
  
  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed.includes("*")) {
      // Simple wildcard matching for subdomains
      const pattern = allowed.replace(/\*/g, ".*");
      if (new RegExp(`^${pattern}$`).test(origin)) {
        return true;
      }
    } else if (origin === allowed) {
      return true;
    }
  }
  return false;
}

async function main() {
  const port = parseInt(process.env.PORT ?? "3100", 10);

  const index = new DocsIndex(config);
  await index.rebuild();

  // Don't create MCP server here - we'll create one per connection
  const app = createMcpExpressApp({ host: "0.0.0.0" });
  
  // CORS configuration with origin validation
  app.use(cors({
    origin: (origin, callback) => {
      if (isValidOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));
  
  // Request tracking for drain detection
  app.use((req, _res, next) => {
    lastRequestTime = Date.now();
    next();
  });
  
  // Timeout configuration for long-lived SSE connections
  app.use((req, _res, next) => {
    if (req.method === "POST" || req.method === "GET") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).setTimeout?.(REQUEST_TIMEOUT);
    }
    next();
  });

  // Health check endpoint with draining status
  app.get("/health", (_req, res) => 
    res.json({ 
      ok: true, 
      draining: isDraining,
      activeConnections: activeConnections.size,
      uptime: process.uptime(),
    })
  );
  
  // Reindex endpoint
  app.post("/reindex", expressJson(), async (_req, res) => {
    await index.rebuild();
    res.json({ ok: true, count: index.listRoutes().length });
  });

  // MCP endpoint (Streamable HTTP)
  app.all("/mcp", expressJson(), async (req: Request, res: Response) => {
    // Security: Validate Origin header to prevent DNS rebinding attacks
    const origin = req.get("Origin");
    if (origin && !isValidOrigin(origin)) {
      console.warn(`Rejected request from invalid origin: ${origin}`);
      return res.status(403).json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Origin header" },
        id: null,
      });
    }

    // Validate Accept header (MCP spec requirement)
    const accept = req.get("Accept");
    if (accept && !accept.includes("application/json") && !accept.includes("text/event-stream") && accept !== "*/*") {
      console.warn(`Rejected request with invalid Accept header: ${accept}`);
      return res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Accept header must include application/json or text/event-stream" },
        id: null,
      });
    }

    // Handle MCP Protocol Version header (spec requirement for version negotiation)
    const protocolVersion = req.get("MCP-Protocol-Version") || "2025-03-26";
    const supportedVersions = ["2025-03-26", "2025-06-18", "2025-11-25"];
    
    if (protocolVersion && !supportedVersions.includes(protocolVersion)) {
      console.warn(`Unsupported MCP protocol version: ${protocolVersion}`);
      // Allow it to proceed anyway for backwards compatibility
      // but log the version for monitoring
    }
    
    console.log(`MCP request - Method: ${req.method}, Protocol Version: ${protocolVersion}`);

    // If we're draining, reject new SSE connections (but allow POST requests to complete)
    if (isDraining && req.method === "GET") {
      console.log("Rejecting new SSE connection during drain");
      return res.status(503).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Server draining" },
        id: null,
      });
    }

    // Use shared MCP server instance (not a new one per request!)
    // NOTE: Per SDK Issue #1405, each HTTP session needs its own Server instance
    // because Server.connect() overwrites the transport and breaks concurrent connections
    const server = createServer(index);
    
    // Stateless mode: no session IDs (good for scale-to-zero)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Track this connection
    const connection = { transport, server };
    activeConnections.add(connection);

    // Set up SSE-specific headers for better proxy/CDN/ALB compatibility
    if (req.method === "GET") {
      /**
       * SSE Keep-Alive Headers:
       * 
       * 1. X-Accel-Buffering: no
       *    - Disables nginx buffering to enable real-time SSE streaming
       * 
       * 2. Connection: keep-alive
       *    - Keeps TCP connection alive for long-lived SSE streams
       *    - Essential for maintaining persistent connections through load balancers
       *    - Prevents premature connection closure by proxies
       * 
       * 3. Cache-Control: no-cache, no-store, must-revalidate
       *    - Prevents intermediate caches from buffering SSE streams
       * 
       * Note: These headers provide HTTP-level keep-alive for the SSE connection.
       * For MCP-level connection health checks, clients can use the ping mechanism.
       * 
       * Reference: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
       */
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Connection", "keep-alive"); // Keep ALB connection alive
      res.setHeader("X-Accel-Buffering", "no");
      
      // Log SSE stream setup
      console.log(`SSE stream initiated. Last-Event-ID: ${req.get("Last-Event-ID") || "none"}`);
    }

    // Clean up on connection close
    res.on("close", () => {
      activeConnections.delete(connection);
      transport.close().catch((err) => {
        console.error("Error closing transport:", err);
      });
      server.close().catch((err) => {
        console.error("Error closing server:", err);
      });
      console.log(`Connection closed. Active connections: ${activeConnections.size}`);
    });

    // Handle connection errors
    res.on("error", (err) => {
      console.error("Response error:", err);
      activeConnections.delete(connection);
    });

    try {
      // Connect the transport to the server for this request
      await server.connect(transport);
      // Handle the HTTP request through the transport
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("MCP error:", err);
      activeConnections.delete(connection);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, (err?: unknown) => {
    if (err) {
      console.error("Failed to start server :", err);
      process.exit(1);
    }
    console.log(`MCP server listening on http://localhost:${port}/mcp`);
    console.log(`Configuration:`);
    console.log(`  - Request Timeout: ${REQUEST_TIMEOUT}ms`);
    console.log(`  - Allowed Origins: ${ALLOWED_ORIGINS.join(", ")}`);
  });

  // Drain detection: if no requests for 60s, assume we're being drained
  const drainCheckInterval = setInterval(() => {
    if (Date.now() - lastRequestTime > DRAIN_DETECTION_TIMEOUT) {
      if (!isDraining && activeConnections.size > 0) {
        console.log(`No requests for ${DRAIN_DETECTION_TIMEOUT}ms, assuming drain. Closing ${activeConnections.size} connections...`);
        isDraining = true;
        
        // Close all active SSE connections to force clients to reconnect to healthy instances
        for (const conn of activeConnections) {
          conn.transport.close().catch((err) => {
            console.error("Error closing transport during drain:", err);
          });
        }
        activeConnections.clear();
      }
    } else {
      // Reset draining state if we start receiving requests again
      if (isDraining) {
        console.log("Requests resumed, exiting drain mode");
        isDraining = false;
      }
    }
  }, 10000); // Check every 10 seconds

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down gracefully...");
    isDraining = true;
    clearInterval(drainCheckInterval);
    
    // Close all active connections (each has its own server instance)
    for (const conn of activeConnections) {
      conn.transport.close().catch(() => {});
      conn.server.close().catch(() => {});
    }
    activeConnections.clear();
    
    httpServer.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
    
    // Force exit after 30 seconds if graceful shutdown hangs
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };
  
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Tiny local JSON middleware (avoid version drift)
function expressJson() {
  return (req: any, res: any, next: any) => {
    if (req.body !== undefined) return next();
    let data = "";
    req.on("data", (c: Buffer) => (data += c.toString("utf-8")));
    req.on("end", () => {
      if (!data) {
        req.body = undefined;
        return next();
      }
      try {
        req.body = JSON.parse(data);
        next();
      } catch {
        res.status(400).json({ error: "Invalid JSON body" });
      }
    });
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
