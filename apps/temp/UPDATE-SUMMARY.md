# MCP Server Updates - Summary

## Files Modified

### 1. `apps/docs-mcp/src/index.ts`
**Changes**: Complete rewrite with SSE best practices

**Key Additions**:
- Origin header validation for security
- Connection tracking and monitoring
- Graceful draining detection and handling
- Enhanced CORS configuration
- Increased timeouts for SSE (5 minutes)
- Connection cleanup on close/error
- Enhanced health endpoint with metrics
- Configurable via environment variables

**New Configuration**:
```typescript
SSE_KEEPALIVE_INTERVAL: 30000ms (30s)
REQUEST_TIMEOUT: 300000ms (5 minutes)
ALLOWED_ORIGINS: Configurable comma-separated list
DRAIN_DETECTION_TIMEOUT: 60000ms (60s)
```

### 2. `copilot/docs-mcp/manifest.yml`
**Changes**: Updated for SSE reliability

**Key Changes**:
- **CPU**: 256 → 512 units
- **Memory**: 512MB → 1024MB
- **Deregistration Delay**: 30s → 300s (5 minutes)
- **Session Stickiness**: Enabled (critical for SSE)
- **Health Check**: Detailed configuration (15s interval)

**New Environment Variables**:
```yaml
SSE_KEEPALIVE_INTERVAL: "30000"
REQUEST_TIMEOUT: "300000"
ALLOWED_ORIGINS: "http://localhost:3000,https://journium.app,https://*.journium.app"
```

### 3. `copilot/docs-mcp/addons/alb-timeout.yml`
**New File**: CloudFormation addon for ALB configuration

**Purpose**: Configure ALB idle timeout to 600s (10 minutes)

**Why**: Copilot doesn't expose this setting in manifest

**How**: Lambda function modifies ALB attributes post-deployment

### 4. `copilot/docs-mcp/SSE-CONFIGURATION.md`
**New File**: Comprehensive documentation

**Contents**:
- Architecture overview
- Configuration guide
- Deployment instructions
- Troubleshooting guide
- Best practices
- Monitoring queries

## What Problems This Solves

### ❌ Before
- SSE connections disconnecting every 60 seconds
- No graceful handling of instance draining
- No origin validation (security risk)
- No connection tracking/monitoring
- Short timeouts causing premature disconnections

### ✅ After
- SSE connections stable for 10+ minutes
- Graceful draining with automatic reconnection
- Origin validation prevents DNS rebinding attacks
- Full connection lifecycle tracking
- Proper timeout configuration throughout stack

## Deployment Instructions

### Quick Deploy
```bash
# Deploy to staging
cd journium-docs
copilot svc deploy --name docs-mcp --env staging
```

### Verify Deployment
```bash
# 1. Check health
curl https://mcp.staging.journium.app/health

# 2. Verify ALB timeout (after deployment)
aws elbv2 describe-load-balancer-attributes \
  --load-balancer-arn $(aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?contains(LoadBalancerName, 'journium-staging')].LoadBalancerArn" \
    --output text) \
  --query "Attributes[?Key=='idle_timeout.timeout_seconds'].Value" \
  --output text
# Expected: 600

# 3. Test MCP connection
curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp
```

## Expected Results

### Server Logs
```
MCP server listening on http://localhost:3100/mcp
Configuration:
  - SSE Keepalive: 30000ms
  - Request Timeout: 300000ms
  - Allowed Origins: http://localhost:3000, https://journium.app, https://*.journium.app

SSE stream initiated. Last-Event-ID: none
Connection closed. Active connections: 0
```

### Health Endpoint
```json
{
  "ok": true,
  "draining": false,
  "activeConnections": 2,
  "uptime": 3456.78
}
```

### Cursor Connection
- Tools load successfully: ✅
  - `docs.search`
  - `docs.getPage`
  - `docs.listRoutes`
- No frequent disconnections: ✅
- Stable connection during use: ✅

## Configuration Summary

| Component | Setting | Value | Purpose |
|-----------|---------|-------|---------|
| **ALB** | Idle Timeout | 600s | Prevent disconnection |
| **ALB** | Deregistration Delay | 300s | Graceful draining |
| **Server** | Request Timeout | 300s | Long connections |
| **Server** | SSE Keepalive | 30s | Keep connection alive |
| **Server** | Drain Detection | 60s | Detect draining |
| **Health Check** | Interval | 15s | Fast failure detection |
| **ECS** | CPU | 512 | Handle connections |
| **ECS** | Memory | 1024MB | Handle connections |

## Testing Checklist

- [ ] Deploy to staging
- [ ] Verify ALB idle timeout is 600s
- [ ] Check health endpoint returns metrics
- [ ] Test SSE connection with curl
- [ ] Test with MCP Inspector
- [ ] Connect from Cursor - verify tools load
- [ ] Leave Cursor connected for 5+ minutes - verify no disconnections
- [ ] Trigger a deployment - verify graceful reconnection
- [ ] Check CloudWatch logs for errors
- [ ] Monitor active connections during load

## Rollback Plan

If issues occur:

1. **Revert code changes**:
```bash
git revert <commit-hash>
git push
```

2. **Redeploy previous version**:
```bash
copilot svc deploy --name docs-mcp --env staging
```

3. **Remove addon** (if causing issues):
```bash
rm copilot/docs-mcp/addons/alb-timeout.yml
copilot svc deploy --name docs-mcp --env staging
```

## Next Steps

1. **Deploy to Staging**: Test thoroughly in staging environment
2. **Monitor**: Watch CloudWatch logs and metrics
3. **Test with Cursor**: Verify all three tools work correctly
4. **Load Test**: Test with multiple concurrent connections
5. **Deploy to Production**: Once stable in staging
6. **Update Documentation**: Add any learnings to SSE-CONFIGURATION.md

## Support & Troubleshooting

See detailed troubleshooting guide in `SSE-CONFIGURATION.md`

Common issues:
- **SSE still disconnecting**: Check ALB timeout was applied
- **Origin errors**: Update `ALLOWED_ORIGINS` environment variable
- **Tools not loading**: Start new Cursor chat session
- **High memory**: Increase memory or scale horizontally

## References

All authoritative sources documented in SSE-CONFIGURATION.md:
- MCP Specification (2025-11-25)
- AWS ALB Documentation
- AWS Copilot CLI Documentation
- Server-Sent Events Specification
