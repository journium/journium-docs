# Quick Reference: MCP Server SSE Updates

## 🎯 Problem Solved
**Before**: SSE connections disconnecting every 60 seconds  
**After**: Stable connections for 10+ minutes with graceful draining

## 📁 Files Changed

### 1. `apps/docs-mcp/src/index.ts`
```typescript
// Added:
- Origin validation (security)
- Connection tracking
- Graceful draining (60s detection)
- Enhanced logging
- 5-minute timeouts
- Configurable CORS
```

### 2. `copilot/docs-mcp/manifest.yml`
```yaml
# Changed:
cpu: 256 → 512
memory: 512 → 1024
deregistration_delay: 30s → 300s
stickiness: true  # CRITICAL

# Added env vars:
SSE_KEEPALIVE_INTERVAL: "30000"
REQUEST_TIMEOUT: "300000"
ALLOWED_ORIGINS: "..."
```

### 3. `copilot/docs-mcp/addons/alb-timeout.yml` (NEW)
```
Lambda function sets ALB idle timeout to 600s (10 min)
Required because Copilot doesn't expose this setting
```

## ⚙️ Key Configuration

```
┌─────────────────┬──────────┬────────────────────────────┐
│ Setting         │ Value    │ Purpose                    │
├─────────────────┼──────────┼────────────────────────────┤
│ ALB Timeout     │ 600s     │ Prevent disconnection      │
│ Dereg Delay     │ 300s     │ Graceful draining          │
│ Request Timeout │ 300s     │ Long SSE connections       │
│ SSE Keepalive   │ 30s      │ Keep connection alive      │
│ Drain Detect    │ 60s      │ Detect instance draining   │
└─────────────────┴──────────┴────────────────────────────┘
```

## 🚀 Deploy

```bash
# Deploy to staging
copilot svc deploy --name docs-mcp --env staging

# Verify ALB timeout
aws elbv2 describe-load-balancer-attributes \
  --load-balancer-arn <your-alb-arn> \
  --query "Attributes[?Key=='idle_timeout.timeout_seconds'].Value" \
  --output text
# Expected: 600

# Check health
curl https://mcp.staging.journium.app/health
# Expected: {"ok":true,"draining":false,"activeConnections":0}

# Test SSE
curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp
```

## 🔍 Verify in Cursor

```
1. Start new chat
2. Tools should load: docs.search, docs.getPage, docs.listRoutes
3. Leave connected for 5+ minutes
4. Should NOT see frequent disconnections
```

## 📊 Monitor

```bash
# Health endpoint
curl https://mcp.staging.journium.app/health

# CloudWatch Logs - SSE connections
fields @timestamp, @message
| filter @message like /SSE stream initiated/
| stats count() by bin(5m)

# CloudWatch Logs - Drain events
fields @timestamp, @message
| filter @message like /assuming drain/
```

## 🐛 Troubleshoot

| Issue | Solution |
|-------|----------|
| Still disconnecting every 60s | Verify ALB timeout = 600s |
| "Invalid Origin" errors | Update ALLOWED_ORIGINS env var |
| Tools not loading in Cursor | Start new chat session |
| High memory usage | Increase memory or scale |

## 📚 Full Documentation

- `SSE-CONFIGURATION.md` - Comprehensive guide
- `UPDATE-SUMMARY.md` - Detailed change summary

## ✅ Testing Checklist

- [ ] Deploy to staging
- [ ] Verify ALB timeout (600s)
- [ ] Health endpoint works
- [ ] SSE connection stable (curl)
- [ ] MCP Inspector works
- [ ] Cursor loads tools
- [ ] No disconnections (5+ min)
- [ ] Graceful drain works
- [ ] CloudWatch logs clean

## 🔄 Rollback

```bash
git revert <commit-hash>
git push
copilot svc deploy --name docs-mcp --env staging
```

## 🎓 Key Learnings

1. **Stickiness is critical** for SSE with load balancers
2. **ALB idle timeout** must be > keepalive interval
3. **Deregistration delay** enables graceful draining
4. **Origin validation** prevents security vulnerabilities
5. **Connection tracking** essential for monitoring

## 📞 Support

Issues? Check:
1. Server logs (CloudWatch)
2. ALB attributes (AWS Console)
3. Health endpoint output
4. SSE-CONFIGURATION.md troubleshooting section
