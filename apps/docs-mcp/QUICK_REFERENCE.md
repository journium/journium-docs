# Quick Reference: MCP Server Fix for Cursor Compatibility

## The Problem
Journium MCP server configured in Cursor (`~/.cursor/mcp.json`) but not connecting.

## The Root Cause
Server was sending `Content-Length: 217` header which breaks SSE streaming required by MCP clients.

## The One-Line Fix
**File**: `apps/docs-mcp/src/index.ts` (line ~135)

```typescript
res.removeHeader("Content-Length");
```

## Why This Fixes It
- SSE (Server-Sent Events) requires indefinite streaming
- `Content-Length` signals fixed-size response → connection closes after N bytes
- MCP clients (Cursor) expect long-lived connections
- Removing `Content-Length` forces `Transfer-Encoding: chunked` ✅

## Quick Deploy & Test

```bash
# 1. Build and test locally
cd /Users/arunkpatra/codebase/journium/journium-docs
nx build docs-mcp
nx start docs-mcp

# 2. Validate fix (in another terminal)
node apps/docs-mcp/scripts/validate-mcp-compatibility.cjs http://localhost:3100/mcp
# Should show: ✅ ALL TESTS PASSED

# 3. Deploy to staging
nx docker-build docs-mcp
docker tag journium-docs-mcp:latest <registry>/journium-docs-mcp:staging
docker push <registry>/journium-docs-mcp:staging
# ... deploy to ECS ...

# 4. Validate staging
node apps/docs-mcp/scripts/validate-mcp-compatibility.cjs https://mcp.staging.journium.app/mcp

# 5. Test in Cursor
# Add to ~/.cursor/mcp.json:
# {
#   "mcpServers": {
#     "journium": {
#       "url": "https://mcp.staging.journium.app/mcp"
#     }
#   }
# }
# Restart Cursor
# Ask: "Search journium docs for insight trackers"

# 6. Deploy to production (once validated)
docker tag journium-docs-mcp:latest <registry>/journium-docs-mcp:latest
docker push <registry>/journium-docs-mcp:latest
# ... deploy to production ...
```

## Customer Setup (After Deployment)

Tell customers to add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "journium": {
      "url": "https://mcp.journium.app/mcp"
    }
  }
}
```

Then restart Cursor.

## Files Created

1. **`src/index.ts`** - The fix (res.removeHeader)
2. **`MCP_CLIENT_COMPATIBILITY.md`** - Full technical documentation
3. **`INVESTIGATION_SUMMARY.md`** - Complete investigation report
4. **`scripts/validate-mcp-compatibility.cjs`** - Automated testing tool

## Validation Tool

Always run after deployment:

```bash
node apps/docs-mcp/scripts/validate-mcp-compatibility.cjs https://mcp.journium.app/mcp
```

Exit 0 = ✅ Pass, Exit 1 = ❌ Fail

## What the Validation Checks

- ✅ `Content-Type: text/event-stream` present
- ✅ `Cache-Control: no-cache` present  
- ❌ `Content-Length` header ABSENT (critical!)
- ✅ Valid SSE message format
- ✅ MCP protocol handshake works

## Before vs After

### BEFORE (Broken)
```http
Content-Type: text/event-stream
Content-Length: 217  ❌
```

### AFTER (Fixed)
```http
Content-Type: text/event-stream
Transfer-Encoding: chunked  ✅
```

## Support Checklist

If customers report issues:

1. ✅ Is the fix deployed? `curl -I https://mcp.journium.app/mcp` (no Content-Length)
2. ✅ Do they have correct URL in `~/.cursor/mcp.json`?
3. ✅ Did they restart Cursor?
4. ✅ Run validation: `node scripts/validate-mcp-compatibility.cjs <url>`
5. ✅ Check server logs for connection attempts

## Key Insight

The issue wasn't with the MCP protocol implementation or the tools - it was an HTTP/SSE transport layer issue. The server worked perfectly for stateless requests (curl) but failed for stateful streaming connections (MCP clients).

---

**Status**: ✅ Fixed in code, ready for deployment
**Impact**: Critical - enables all Cursor users to access Journium docs via MCP
**Complexity**: Simple fix, complex diagnosis
