# MCP Server SSE Configuration

## Overview

This MCP server implementation includes comprehensive configuration for reliable Server-Sent Events (SSE) connections with AWS Application Load Balancer (ALB) and ECS.

## Changes Made

### 1. Server Implementation (`src/index.ts`)

#### Security Enhancements
- **Origin Header Validation**: Prevents DNS rebinding attacks by validating the `Origin` header against an allowlist
- **CORS Configuration**: Proper CORS setup with origin validation
- **Configurable Allowed Origins**: Set via `ALLOWED_ORIGINS` environment variable

#### Connection Management
- **Connection Tracking**: Tracks all active SSE connections for monitoring and graceful shutdown
- **Drain Detection**: Automatically detects when the instance is being drained (no requests for 60s)
- **Graceful Disconnection**: Closes SSE connections during drain to force clients to reconnect to healthy instances
- **Connection Cleanup**: Proper cleanup on close and error events

#### Timeout Configuration
- **Increased Request Timeout**: 5 minutes (300s) for long-lived SSE connections
- **Configurable via Environment**: `REQUEST_TIMEOUT` and `SSE_KEEPALIVE_INTERVAL` env vars

#### Monitoring & Observability
- **Enhanced Health Check**: Returns draining status and active connection count
- **Detailed Logging**: Logs connection lifecycle, SSE setup, errors, and drain events
- **Connection Metrics**: Track number of active connections

### 2. AWS Copilot Manifest (`copilot/docs-mcp/manifest.yml`)

#### ALB Configuration
- **Session Stickiness**: Enabled (`stickiness: true`) - critical for SSE
- **Deregistration Delay**: Increased from 30s to 300s (5 minutes) for graceful draining
- **Health Check Configuration**: 
  - Interval: 15s (faster failure detection)
  - Timeout: 10s
  - Healthy threshold: 2
  - Unhealthy threshold: 3

#### Resource Allocation
- **CPU**: Increased from 256 to 512 units
- **Memory**: Increased from 512MB to 1024MB for handling multiple SSE connections

#### Environment Variables
```yaml
SSE_KEEPALIVE_INTERVAL: "30000"  # 30 seconds
REQUEST_TIMEOUT: "300000"         # 5 minutes
ALLOWED_ORIGINS: "http://localhost:3000,https://journium.app,https://*.journium.app"
```

### 3. CloudFormation Addon (`copilot/docs-mcp/addons/alb-timeout.yml`)

**Purpose**: Configure ALB idle timeout to 600 seconds (10 minutes) for SSE connections.

**Why needed**: AWS Copilot doesn't expose ALB idle timeout in the manifest, so we use a CloudFormation addon with a Lambda function to modify the ALB attributes after deployment.

**What it does**:
1. Lambda function discovers the ALB by Copilot tags
2. Modifies `idle_timeout.timeout_seconds` to 600 (10 minutes)
3. Runs on Create/Update of the CloudFormation stack

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3100 | Server port |
| `NODE_ENV` | production | Node environment |
| `MCP_MODE` | http | MCP transport mode |
| `LOG_LEVEL` | info | Logging level |
| `SSE_KEEPALIVE_INTERVAL` | 30000 | SSE keepalive interval (ms) |
| `REQUEST_TIMEOUT` | 300000 | Max request duration (ms) |
| `ALLOWED_ORIGINS` | (see manifest) | Comma-separated allowed origins |

### Timeout Settings Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| **ALB Idle Timeout** | 600s (10 min) | Prevent SSE disconnection |
| **Deregistration Delay** | 300s (5 min) | Graceful connection draining |
| **Request Timeout** | 300s (5 min) | Max SSE connection duration |
| **SSE Keepalive** | 30s | Keep connection alive |
| **Health Check Interval** | 15s | Faster failure detection |
| **Drain Detection** | 60s | Detect instance draining |

## How SSE Connections Work

### Normal Operation
1. Client sends GET request to `/mcp`
2. Server validates origin and checks draining status
3. Server creates SSE stream with proper headers
4. Server sends keepalive comments every 30s (configurable)
5. Connection tracks in active connections set
6. ALB maintains connection for up to 10 minutes of idle time

### Graceful Draining
1. ECS stops sending new requests to instance during deployment
2. After 60s of no requests, server detects drain state
3. Server closes all active SSE connections
4. Clients automatically reconnect to healthy instances
5. New SSE connections are rejected during drain (503 status)
6. POST requests continue to work during drain

### Connection Lifecycle
```
Client                    Server                    ALB
   |                         |                        |
   |-- GET /mcp ------------>|                        |
   |                         |-- Validate Origin ---->|
   |                         |-- Check Drain State -->|
   |                         |-- Create SSE Stream -->|
   |<-- SSE Headers ---------|                        |
   |<-- keepalive (30s) -----|                        |
   |<-- keepalive (30s) -----|                        |
   |                         |                        |
   |                    [Drain Detected]              |
   |                         |-- Close Stream ------->|
   |<-- Connection Close ----|                        |
   |                         |                        |
   |-- Reconnect GET /mcp -->|                        |
   |<-- 503 Service Unavailable (draining)           |
```

## Deployment

### First-time Setup
```bash
# Deploy the service with the CloudFormation addon
copilot svc deploy --name docs-mcp --env staging
```

The CloudFormation addon will automatically configure the ALB idle timeout on deployment.

### Verify Configuration

1. **Check ALB Idle Timeout**:
```bash
aws elbv2 describe-load-balancer-attributes \
  --load-balancer-arn <your-alb-arn> \
  --query "Attributes[?Key=='idle_timeout.timeout_seconds'].Value" \
  --output text
```

Expected output: `600`

2. **Check Health Endpoint**:
```bash
curl https://mcp.staging.journium.app/health
```

Expected output:
```json
{
  "ok": true,
  "draining": false,
  "activeConnections": 0,
  "uptime": 123.45
}
```

3. **Test SSE Connection**:
```bash
# Using MCP Inspector or curl
curl -N -H "Accept: text/event-stream" https://mcp.staging.journium.app/mcp
```

## Troubleshooting

### SSE Connections Disconnecting

**Symptom**: "SSE stream disconnected" messages every 60 seconds

**Causes**:
1. ALB idle timeout not configured (default 60s)
2. No keepalive messages being sent
3. Proxy/CDN buffering enabled

**Solutions**:
1. Verify ALB idle timeout is 600s (see verification above)
2. Check `SSE_KEEPALIVE_INTERVAL` is set and server is sending keepalives
3. Ensure `X-Accel-Buffering: no` header is sent

### Tools Not Loading in Cursor

**Symptom**: MCP tools not available in Cursor even though server is running

**Causes**:
1. Server not properly responding to MCP protocol
2. Origin validation blocking requests
3. Session started before server was ready

**Solutions**:
1. Check server logs for errors
2. Verify `ALLOWED_ORIGINS` includes the origin Cursor is using
3. Start a new Cursor chat session
4. Test with MCP Inspector to verify tools are working

### High Memory Usage

**Symptom**: Container running out of memory

**Causes**:
1. Too many concurrent SSE connections
2. Connection leaks (not cleaning up properly)

**Solutions**:
1. Check active connection count in health endpoint
2. Increase memory in manifest if needed
3. Check logs for connection cleanup errors
4. Consider adding connection limits

## References

- [MCP Specification - Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http)
- [AWS ALB Attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html)
- [AWS Copilot Manifest](https://aws.github.io/copilot-cli/docs/manifest/lb-web-service/)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)

## Best Practices

1. **Always enable session stickiness** for SSE connections
2. **Set deregistration delay** to at least 5x your average connection duration
3. **Send keepalive messages** at intervals less than ALB idle timeout
4. **Validate Origin header** to prevent security vulnerabilities
5. **Implement graceful draining** to avoid abrupt disconnections
6. **Monitor active connections** via health endpoint
7. **Use connection tracking** to detect leaks early
8. **Test with MCP Inspector** before deploying to production

## Performance Considerations

- Each SSE connection holds memory for the duration of the connection
- With default settings, a single container can handle ~100-200 concurrent SSE connections
- For higher loads, increase CPU/memory or scale horizontally with more tasks
- Monitor CloudWatch metrics for CPU, memory, and connection counts
- Consider using ECS Service Auto Scaling based on connection count

## Security Considerations

1. **Origin Validation**: Critical for preventing DNS rebinding attacks
2. **HTTPS Only**: Always use HTTPS in production (handled by ALB)
3. **Authentication**: Consider adding authentication for production use
4. **Rate Limiting**: Add rate limiting for `/mcp` endpoint if needed
5. **Secret Management**: Store sensitive config in AWS Secrets Manager

## Monitoring Queries

### CloudWatch Logs Insights

**Track SSE Connections**:
```
fields @timestamp, @message
| filter @message like /SSE stream initiated/
| stats count() by bin(5m)
```

**Track Drain Events**:
```
fields @timestamp, @message
| filter @message like /assuming drain/
| sort @timestamp desc
```

**Track Errors**:
```
fields @timestamp, @message
| filter @message like /Error/
| sort @timestamp desc
| limit 100
```
