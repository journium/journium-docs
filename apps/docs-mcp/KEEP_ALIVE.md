# MCP Server Keep-Alive and Connection Health

This document explains how connection health and keep-alive mechanisms work in the Journium Documentation MCP server.

## Overview

The server implements a multi-layer approach to connection health:

1. **HTTP-Level Keep-Alive** (for SSE connections)
2. **MCP Protocol Ping** (application-level health checks)
3. **Request Timeouts** (preventing hung requests)
4. **Drain Detection** (graceful shutdown for scale-to-zero)

## 1. HTTP-Level Keep-Alive

### Purpose
Keeps TCP connections alive for long-running Server-Sent Events (SSE) streams.

### Implementation
Located in `src/index.ts`, lines 154-179:

```typescript
res.setHeader("Connection", "keep-alive");
```

### What It Does
- Prevents load balancers from closing idle connections
- Maintains persistent connections for real-time event streaming
- Works at the HTTP/TCP layer

### References
- HTTP Keep-Alive: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive)
- MCP Transports: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports

---

## 2. MCP Protocol Ping

### Purpose
Application-level health check to verify that both parties are still responsive.

### Official Specification

**From MCP Specification (2025-06-18):**

> "The Model Context Protocol includes an optional ping mechanism that allows either party
> to verify that their counterpart is still responsive and the connection is alive."

**Request Format:**
```json
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "ping"
}
```

**Response Format:**
```json
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {}
}
```

### Behavior Requirements

Per the specification:

1. **The receiver MUST respond promptly** with an empty response
2. If no response within a reasonable timeout, the sender MAY:
   - Consider the connection stale
   - Terminate the connection
   - Attempt reconnection procedures

### Implementation in This Server

**Automatic Handling:**
The `@modelcontextprotocol/sdk` automatically handles incoming ping requests. No manual handler registration is needed.

**Server-side ping method:**
```typescript
server.ping(): Promise<{ _meta?: {...} }>
```

Located in `@modelcontextprotocol/sdk/server/index.d.ts`, lines 127-135.

### Active Ping Implementation

**This server actively pings clients** to proactively detect dead connections:

```typescript
// src/index.ts - Periodic connection health check
async function pingConnections() {
  for (const conn of activeConnections) {
    try {
      await Promise.race([
        conn.server.ping(),
        timeout(PING_TIMEOUT) // 10 seconds
      ]);
      conn.lastPing = Date.now(); // Success
    } catch (error) {
      // Failed - close connection
      await conn.transport.close();
      await conn.server.close();
      activeConnections.delete(conn);
    }
  }
}

// Run every 30 seconds
setInterval(pingConnections, PING_INTERVAL);
```

**Benefits:**
- Detects client failures immediately (within `PING_INTERVAL`)
- Automatically cleans up stale connections
- Frees server resources
- Prevents memory leaks from dead connections

### Usage Patterns

**Implementations SHOULD:**
- Periodically issue pings to detect connection health
- Make ping frequency configurable
- Use timeouts appropriate for the network environment
- Avoid excessive pinging to reduce overhead

**This Server's Implementation:**

The server actively pings clients every 30 seconds (configurable via `PING_INTERVAL`):

```typescript
// Located in src/index.ts
const PING_INTERVAL = parseInt(process.env.PING_INTERVAL ?? "30000", 10); // 30 seconds
const PING_TIMEOUT = parseInt(process.env.PING_TIMEOUT ?? "10000", 10); // 10 seconds

// Periodic ping to detect dead connections
setInterval(async () => {
  await pingConnections(); // Pings all active connections
}, PING_INTERVAL);
```

**What happens during ping:**
1. Server calls `server.ping()` on each active connection
2. Waits up to `PING_TIMEOUT` for response
3. If response received → updates `lastPing` timestamp
4. If timeout or error → closes connection and removes from pool
5. Logs connection age and status

This proactively detects and cleans up dead connections.

**Important:** The SDK does NOT automatically send periodic pings. If you need automatic keep-alive pings, you must implement this manually:

```typescript
// Example: Manual periodic ping (not implemented by default)
setInterval(async () => {
  try {
    await server.ping();
  } catch (error) {
    console.error("Ping failed:", error);
    // Handle connection failure
  }
}, 30000); // Every 30 seconds
```

### References
- MCP Ping Specification: https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping
- SDK Server Interface: `@modelcontextprotocol/sdk/server/index.d.ts`

---

## 3. Request Timeouts

### Default Behavior

**SDK Default:** 60 seconds (`DEFAULT_REQUEST_TIMEOUT_MSEC`)

**Our Override:** 5 minutes (300,000ms)

Located in `src/index.ts`, line 36:

```typescript
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT ?? "300000", 10);
```

### Per-Request Configuration

You can override the timeout for individual requests using `RequestOptions`:

```typescript
// From @modelcontextprotocol/sdk/shared/protocol.d.ts
interface RequestOptions {
  timeout?: number; // Milliseconds
  resetTimeoutOnProgress?: boolean; // Reset on progress notifications
  maxTotalTimeout?: number; // Maximum total time regardless of progress
}
```

### Progress Notifications

**Important:** By default, progress notifications do NOT reset the timeout.

To enable timeout reset on progress:
```typescript
server.request(request, schema, {
  timeout: 120000, // 2 minutes
  resetTimeoutOnProgress: true, // Reset timeout when progress is sent
});
```

### Known Issue

**GitHub Issue #245:** The TypeScript SDK's timeout does not reset on progress updates by default, unlike the Python SDK.

- **Issue:** https://github.com/modelcontextprotocol/typescript-sdk/issues/245
- **Workaround:** Explicitly set `resetTimeoutOnProgress: true` for long-running operations

### References
- SDK Protocol Types: `@modelcontextprotocol/sdk/shared/protocol.d.ts`, lines 54-90
- GitHub Issue: https://github.com/modelcontextprotocol/typescript-sdk/issues/245

---

## 4. Drain Detection

### Purpose
Detect when the server is being drained (e.g., during scale-to-zero) and gracefully close connections.

### Implementation
Located in `src/index.ts`, lines 211-233:

```typescript
const DRAIN_DETECTION_TIMEOUT = 60000; // 60 seconds

// If no requests for 60s, assume we're being drained
setInterval(() => {
  if (Date.now() - lastRequestTime > DRAIN_DETECTION_TIMEOUT) {
    // Close all SSE connections to force reconnect to healthy instances
  }
}, 10000);
```

### How It Works

1. Track time of last request
2. If 60+ seconds with no requests → enter drain mode
3. Close all active SSE connections
4. Clients reconnect to healthy instances
5. Exit drain mode if requests resume

### Benefits
- Automatic detection of scale-to-zero events
- No load balancer configuration needed
- Clients automatically reconnect to active instances

---

## Best Practices

### For Clients

1. **Implement ping handling** if you need connection health checks
2. **Set appropriate timeouts** for your use case:
   ```typescript
   const result = await client.request(req, schema, {
     timeout: 180000, // 3 minutes
     resetTimeoutOnProgress: true,
   });
   ```
3. **Handle reconnection** on timeout or connection failure
4. **Send periodic pings** if the server might be idle for long periods

### For Servers (This Implementation)

1. ✅ HTTP keep-alive headers for SSE connections
2. ✅ Automatic ping response handling (via SDK)
3. ✅ Active client ping monitoring (every 30 seconds)
4. ✅ Automatic dead connection cleanup
5. ✅ Configurable request timeout (5 minutes default)
6. ✅ Drain detection for scale-to-zero

---

## Configuration

### Environment Variables

```bash
# Request timeout in milliseconds (default: 300000 = 5 minutes)
REQUEST_TIMEOUT=300000

# Ping interval in milliseconds (default: 30000 = 30 seconds)
PING_INTERVAL=30000

# Ping response timeout in milliseconds (default: 10000 = 10 seconds)
PING_TIMEOUT=10000

# Allowed origins for CORS (default: local + *.journium.app)
ALLOWED_ORIGINS="http://localhost:3000,https://journium.app"

# Server port (default: 3100)
PORT=3100
```

### Timeout Recommendations

- **Quick queries:** 60-120 seconds
- **Search operations:** 120-180 seconds
- **Long operations:** 300-600 seconds
- **Always set:** `resetTimeoutOnProgress: true` for operations that send progress

---

## References

### Official MCP Documentation

- **Ping Specification:** https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping
- **Transports:** https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- **Architecture:** https://modelcontextprotocol.io/docs/learn/architecture
- **SDKs:** https://modelcontextprotocol.io/docs/sdk

### SDK Source Code

- **Server Interface:** `@modelcontextprotocol/sdk/server/index.d.ts`
- **Protocol Types:** `@modelcontextprotocol/sdk/shared/protocol.d.ts`
- **Streamable HTTP Transport:** `@modelcontextprotocol/sdk/server/streamableHttp.d.ts`

### Related Issues

- **Timeout Issue:** https://github.com/modelcontextprotocol/typescript-sdk/issues/245
- **TypeScript SDK:** https://github.com/modelcontextprotocol/typescript-sdk

---

## Summary

| Layer | Mechanism | Implementation | Purpose |
|-------|-----------|----------------|---------|
| HTTP | `Connection: keep-alive` | Automatic (Express headers) | Keep TCP connection alive |
| MCP | Ping request/response | Automatic (SDK handles) | Application-level health check |
| MCP | Active client ping | Custom (every 30s) | Proactive dead connection detection |
| Request | Timeout configuration | Manual (5min default) | Prevent hung requests |
| Server | Drain detection | Custom logic | Graceful scale-to-zero |

**Key Features:**
- ✅ SDK handles ping responses automatically
- ✅ Server actively pings clients every 30 seconds
- ✅ Dead connections automatically removed
- ✅ Configurable ping interval and timeout
- ✅ Health endpoint shows ping statistics
