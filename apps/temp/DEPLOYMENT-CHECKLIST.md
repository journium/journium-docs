# Deployment Checklist - MCP Server SSE Updates

## Pre-Deployment

### Code Review
- [ ] Review changes in `apps/docs-mcp/src/index.ts`
- [ ] Review changes in `copilot/docs-mcp/manifest.yml`
- [ ] Review new addon in `copilot/docs-mcp/addons/alb-timeout.yml`
- [ ] Verify no sensitive data in code/config
- [ ] Run linter: `npm run lint` (if applicable)
- [ ] Run tests: `npm test` (if applicable)

### Environment Configuration
- [ ] Verify `ALLOWED_ORIGINS` includes all necessary origins
- [ ] Confirm timeout values are appropriate:
  - [ ] `SSE_KEEPALIVE_INTERVAL: 30000` (30s)
  - [ ] `REQUEST_TIMEOUT: 300000` (5 minutes)
- [ ] Review CPU/memory allocation (512 CPU, 1024 MB)

### Backup
- [ ] Note current git commit: `git rev-parse HEAD`
- [ ] Save current manifest: `cp copilot/docs-mcp/manifest.yml manifest.yml.backup`
- [ ] Document current ALB settings (for rollback)

## Deployment to Staging

### Build & Deploy
```bash
# Navigate to project root
cd journium-docs

# Verify correct branch
git branch --show-current

# Deploy to staging
copilot svc deploy --name docs-mcp --env staging

# Monitor deployment
watch -n 2 "copilot svc status --name docs-mcp --env staging"
```

### Deployment Verification
- [ ] Deployment completed successfully (no errors)
- [ ] Service shows "RUNNING" status
- [ ] No CloudFormation errors in AWS Console
- [ ] Lambda function created (for ALB timeout addon)

## Post-Deployment Verification

### 1. ALB Configuration
```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName, 'journium-staging')].LoadBalancerArn" \
  --output text)

# Verify idle timeout = 600s
aws elbv2 describe-load-balancer-attributes \
  --load-balancer-arn $ALB_ARN \
  --query "Attributes[?Key=='idle_timeout.timeout_seconds'].Value" \
  --output text
```
- [ ] Output is `600` ✅

### 2. Health Endpoint
```bash
curl https://mcp.staging.journium.app/health | jq
```
**Expected Output**:
```json
{
  "ok": true,
  "draining": false,
  "activeConnections": 0,
  "uptime": <some number>
}
```
- [ ] Returns 200 status
- [ ] `ok` is `true`
- [ ] `draining` is `false`
- [ ] Has `activeConnections` field
- [ ] Has `uptime` field

### 3. SSE Connection Test
```bash
# Test SSE stream (should stay connected, not disconnect after 60s)
curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp
```
- [ ] Connection establishes
- [ ] Receives SSE events
- [ ] Stays connected beyond 60 seconds
- [ ] No immediate disconnection errors

### 4. MCP Protocol Test
```bash
# Test POST endpoint
curl -X POST https://mcp.staging.journium.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```
- [ ] Returns 200 or valid response
- [ ] No CORS errors
- [ ] No Origin validation errors

### 5. CloudWatch Logs
```bash
# Get recent logs
copilot svc logs --name docs-mcp --env staging --follow
```
**Check for**:
- [ ] No error messages
- [ ] See "MCP server listening on..." message
- [ ] See configuration output
- [ ] SSE streams log properly when connected

### 6. Test with MCP Inspector
```bash
# If you have MCP Inspector running locally
# Connect to: https://mcp.staging.journium.app/mcp
```
- [ ] Can connect successfully
- [ ] Tools appear:
  - [ ] `docs.search`
  - [ ] `docs.getPage`
  - [ ] `docs.listRoutes`
- [ ] Can execute tools successfully
- [ ] Connection stays stable (5+ minutes)

### 7. Test with Cursor

**Important**: Start a NEW chat for this test

- [ ] Open Cursor
- [ ] Start new chat
- [ ] Verify `journium-devtools` appears in MCP servers list
- [ ] Tools load successfully
- [ ] Can call `docs.search` with a query
- [ ] Can call `docs.getPage` with a route
- [ ] Can call `docs.listRoutes`
- [ ] Connection stays stable (no frequent disconnections)
- [ ] Leave connected for 5 minutes - should not disconnect

### 8. Load Test (Optional but Recommended)
```bash
# Simulate multiple concurrent connections
for i in {1..10}; do
  (curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp &)
done

# Check health endpoint for active connections
curl https://mcp.staging.journium.app/health | jq .activeConnections
```
- [ ] Can handle 10+ concurrent connections
- [ ] Memory stays within limits
- [ ] CPU stays within limits
- [ ] Health endpoint reports correct connection count

## Monitoring Setup

### CloudWatch Alarms
- [ ] Set up alarm for high memory usage (>80%)
- [ ] Set up alarm for high CPU usage (>80%)
- [ ] Set up alarm for error logs
- [ ] Set up alarm for unhealthy targets

### CloudWatch Insights Queries
```sql
-- Save these queries for easy access

-- SSE Connection Rate
fields @timestamp, @message
| filter @message like /SSE stream initiated/
| stats count() by bin(5m)

-- Drain Events
fields @timestamp, @message
| filter @message like /assuming drain/
| sort @timestamp desc

-- Errors
fields @timestamp, @message
| filter @message like /Error/
| sort @timestamp desc
| limit 100

-- Active Connections Over Time
fields @timestamp, @message
| filter @message like /Active connections/
| parse @message /Active connections: (?<count>\d+)/
| stats avg(count) by bin(5m)
```
- [ ] Saved in CloudWatch Insights
- [ ] Tested and working

## Stress Test (Before Production)

### Graceful Draining Test
```bash
# 1. Establish SSE connections
for i in {1..5}; do
  (curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp > /tmp/sse-$i.log 2>&1 &)
done

# 2. Check connections
curl https://mcp.staging.journium.app/health | jq .activeConnections
# Should show 5

# 3. Trigger deployment (simulates drain)
copilot svc deploy --name docs-mcp --env staging

# 4. Monitor logs
copilot svc logs --name docs-mcp --env staging --follow

# 5. Verify graceful handling
# - Should see "assuming drain" in logs
# - Connections should close
# - New connections should get 503 during drain
# - After deployment, should work normally
```
- [ ] Drain detected within 60-90 seconds
- [ ] Connections closed gracefully
- [ ] New connections rejected during drain (503)
- [ ] Service recovers after deployment
- [ ] No errors or crashes

## Documentation

- [ ] Update team wiki/docs with new configuration
- [ ] Share deployment summary with team
- [ ] Document any issues encountered and resolutions
- [ ] Update runbooks if needed

## Rollback Plan Verification

### Test Rollback (Optional)
```bash
# 1. Note current commit
GOOD_COMMIT=$(git rev-parse HEAD)

# 2. Revert changes (test only, then revert the revert)
git revert HEAD --no-commit
copilot svc deploy --name docs-mcp --env staging
# Verify old version works

# 3. Restore good version
git reset --hard $GOOD_COMMIT
copilot svc deploy --name docs-mcp --env staging
```
- [ ] Rollback process tested (optional)
- [ ] Team knows how to rollback if needed

## Production Deployment (After Staging Success)

### Prerequisites
- [ ] Staging has been stable for 24+ hours
- [ ] No critical issues found
- [ ] Team approval obtained
- [ ] Change window scheduled (if applicable)
- [ ] On-call engineer available

### Production Deployment
```bash
# Deploy to production
copilot svc deploy --name docs-mcp --env production

# Verify (same steps as staging)
```
- [ ] Repeat all verification steps for production
- [ ] Monitor for 1 hour post-deployment
- [ ] Verify Cursor connections from production

## Sign-off

**Staging Deployment**:
- [ ] All checks passed
- [ ] Deployed by: ________________
- [ ] Date: ________________
- [ ] Git commit: ________________

**Production Deployment**:
- [ ] All checks passed
- [ ] Deployed by: ________________
- [ ] Date: ________________
- [ ] Git commit: ________________
- [ ] Approved by: ________________

## Issues Encountered

_Document any issues and their resolutions here:_

---

---

## Post-Deployment Monitoring (First 48 Hours)

- [ ] Day 1: Check logs/metrics every 2 hours
- [ ] Day 2: Check logs/metrics every 4 hours
- [ ] No SSE disconnection issues reported
- [ ] No memory/CPU issues
- [ ] Cursor users report stable connections
- [ ] CloudWatch shows no anomalies

## Success Criteria

✅ **Deployment is successful if**:
1. ALB idle timeout = 600s
2. Health endpoint returns metrics
3. SSE connections stable (no 60s disconnects)
4. Cursor loads tools without issues
5. No errors in CloudWatch logs
6. Graceful draining works during deployments
7. Memory and CPU within acceptable ranges
8. No user-reported connection issues

## Resources

- **Quick Reference**: `QUICK-REFERENCE.md`
- **Full Documentation**: `SSE-CONFIGURATION.md`
- **Update Summary**: `UPDATE-SUMMARY.md`
- **AWS Console**: [ECS Services](https://console.aws.amazon.com/ecs)
- **CloudWatch Logs**: [Log Groups](https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups)
