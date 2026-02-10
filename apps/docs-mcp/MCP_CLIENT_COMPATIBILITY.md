# MCP Client Compatibility Fix

## Issue Summary

**Problem**: Cursor and other MCP clients couldn't connect to the Journium MCP server, even though direct HTTP requests worked fine.

**Root Cause**: The server was sending `Content-Length` headers on SSE (Server-Sent Events) responses, which signals to HTTP clients that the response has a fixed size. This is incompatible with SSE's streaming model and causes MCP clients to fail connection.

## Technical Details

### The Issue

Server-Sent Events (SSE) is designed for long-lived, streaming connections. When a `Content-Length` header is present:

1. HTTP clients interpret this as a fixed-size response
2. After reading N bytes, clients close the connection
3. MCP clients expect indefinite streaming and fail when the connection closes prematurely

### What Was Happening

**Journium MCP Server (BEFORE FIX)**:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Content-Length: 217  ❌ PROBLEM!

event: message
data: {"result":{...}}
```

**Mintlify MCP Server (WORKING)**:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked  ✅ CORRECT!

event: message
data: {"result":{...}}
```

### Why Direct HTTP Requests Still Worked

Tools like `curl` follow the HTTP spec strictly:
- Read exactly 217 bytes
- Close connection
- Parse the response

For **stateless** requests (single request/response), this works fine. But MCP clients need **stateful**, long-lived connections.

## The Fix

Added explicit removal of `Content-Length` header in `src/index.ts`:

```typescript
// CRITICAL: Remove Content-Length header for SSE streaming
// SSE requires chunked encoding, not fixed-length responses
// This ensures compatibility with MCP clients like Cursor that expect true streaming
res.removeHeader("Content-Length");
```

This ensures the response uses `Transfer-Encoding: chunked` automatically.

## SSE Requirements for MCP

For proper SSE/MCP compatibility:

1. ✅ **Content-Type**: `text/event-stream` (already set by SDK)
2. ✅ **Transfer-Encoding**: `chunked` (automatic when Content-Length is removed)
3. ✅ **X-Accel-Buffering**: `no` (prevents nginx buffering)
4. ✅ **Cache-Control**: `no-cache` (prevents caching)
5. ✅ **Connection**: `keep-alive` (implicit in HTTP/1.1)
6. ❌ **Content-Length**: Must NOT be present

## Testing

### Before Deployment

Test locally:

```bash
# Build the server
cd /Users/arunkpatra/codebase/journium/journium-docs
nx build docs-mcp

# Run locally
nx start docs-mcp

# Test in new terminal
curl -i -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

Verify the response headers:
- ✅ `Content-Type: text/event-stream`
- ✅ `Transfer-Encoding: chunked` (or no Content-Length)
- ❌ No `Content-Length` header

### After Deployment

1. **Update Cursor MCP Configuration**

   In `~/.cursor/mcp.json`, customers should use:
   ```json
   {
     "mcpServers": {
       "journium": {
         "url": "https://mcp.journium.app/mcp"
       }
     }
   }
   ```

2. **Verify in Cursor**

   Customers can test by asking the AI:
   ```
   "Search the journium documentation for how insight trackers work"
   ```

   The AI should successfully use the `docs.search` tool.

3. **Monitoring**

   Check server logs for:
   ```
   SSE stream initiated. Last-Event-ID: none
   ```

## Customer Setup Instructions

### Cursor IDE

1. Open Cursor settings: `Cmd/Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)"

2. Add to `~/.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "journium-docs": {
         "url": "https://mcp.journium.app/mcp"
       }
     }
   }
   ```

3. Restart Cursor

4. Test by asking the AI to search Journium docs

### Other MCP Clients

The fix ensures compatibility with any MCP client that follows the SSE spec, including:
- Claude Desktop
- VSCode with MCP extensions
- Custom MCP clients

## Production Deployment

### Build and Deploy

```bash
# From monorepo root
cd /Users/arunkpatra/codebase/journium/journium-docs

# Build
nx prepare-content docs-mcp
nx build docs-mcp

# Build Docker image
nx docker-build docs-mcp

# Tag for production
docker tag journium-docs-mcp:latest <your-registry>/journium-docs-mcp:latest

# Push
docker push <your-registry>/journium-docs-mcp:latest

# Deploy to staging first
# ... your deployment process ...

# Test staging
curl -i https://mcp.staging.journium.app/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Verify no Content-Length in response!

# Deploy to production
# ... your deployment process ...
```

## Monitoring and Validation

### Health Check

```bash
curl https://mcp.journium.app/health
```

Expected:
```json
{
  "ok": true,
  "draining": false,
  "activeConnections": 0,
  "uptime": 123.45
}
```

### Connection Test

```bash
curl -i https://mcp.journium.app/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Check response headers - should NOT have `Content-Length`.

## References

- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK - Streamable HTTP Transport](https://github.com/modelcontextprotocol/typescript-sdk)

## Support

For customer issues:
1. Verify they're using the correct URL format
2. Check that Content-Length is NOT in response headers
3. Verify their MCP client supports HTTP-based servers
4. Test with curl to confirm server is responding correctly
