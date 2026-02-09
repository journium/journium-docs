import cors from "cors";
import type { Request, Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { config } from "./config.js";
import { DocsIndex } from "./indexer.js";
import { createServer } from "./server.js";

async function main() {
  const port = parseInt(process.env.PORT ?? "3100", 10);

  const index = new DocsIndex(config);
  await index.rebuild();

  const app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());
  app.use((req, _res, next) => {
    // Ensure JSON body parsing for POST requests
    // (createMcpExpressApp may already do it depending on SDK version)
    if (req.method === "POST") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).setTimeout?.(60_000);
    }
    next();
  });

  // Optional: a simple health + reindex endpoint (protect if exposed publicly)
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.post("/reindex", expressJson(), async (_req, res) => {
    await index.rebuild();
    res.json({ ok: true, count: index.listRoutes().length });
  });

  // MCP endpoint (Streamable HTTP)
  app.all("/mcp", expressJson(), async (req: Request, res: Response) => {
    const server = createServer(index);

    // Stateless mode: no session IDs (good for scale-to-zero)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      // IMPORTANT: pass req.body explicitly (some Express setups won’t attach it otherwise)
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("MCP error:", err);
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
      console.error("Failed to start server:", err);
      process.exit(1);
    }
    console.log(`MCP server listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => httpServer.close(() => process.exit(0));
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
