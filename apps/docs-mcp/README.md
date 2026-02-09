# Journium Documentation MCP Server

A Model Context Protocol (MCP) server that provides searchable access to Journium documentation.

## Overview

This server indexes MDX documentation files and exposes them via MCP tools for AI assistants to query and retrieve documentation content.

## Architecture

### Development Mode
- Runs from the monorepo structure
- Reads MDX files from `../../apps/docs-app/content/docs/`
- Uses `tsx watch` for hot reloading

### Production Mode (Docker)
- Self-contained Docker image
- MDX files copied into the container at build time
- Reads from local `./content/` directory
- Optimized for deployment on AWS ECS

## Development

```bash
# Install dependencies (from workspace root)
pnpm install

# Run in development mode
pnpm dev

# Build TypeScript
pnpm build

# Run built version
pnpm start
```

## Docker Deployment

### Build Docker Image

```bash
# Prepare content and build Docker image
pnpm docker:build

# Or manually:
pnpm build:docker  # Copy MDX files and compile TypeScript
docker build -t journium-docs-mcp .
```

### Run Docker Container

```bash
# Run locally
pnpm docker:run

# Or manually:
docker run --rm -p 3100:3100 journium-docs-mcp
```

### Environment Variables

- `PORT` - Server port (default: 3100)
- `NODE_ENV` - Environment (development/production)

## AWS ECS Deployment

### 1. Build and Push to ECR

```bash
# Build for production
pnpm build:docker

# Tag for ECR
docker tag journium-docs-mcp:latest <account>.dkr.ecr.<region>.amazonaws.com/journium-docs-mcp:latest

# Push to ECR
docker push <account>.dkr.ecr.<region>.amazonaws.com/journium-docs-mcp:latest
```

### 2. ECS Task Definition

```json
{
  "family": "journium-docs-mcp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "docs-mcp",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/journium-docs-mcp:latest",
      "portMappings": [
        {
          "containerPort": 3100,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3100"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "node -e \"fetch('http://localhost:3100/health').then(r => r.ok ? process.exit(0) : process.exit(1))\""],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 5
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/journium-docs-mcp",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 3. Service Configuration

- **Launch Type**: Fargate
- **Desired Count**: 1 (or more for HA)
- **Load Balancer**: Optional, for external access
- **Auto Scaling**: Based on CPU/Memory metrics

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /reindex` - Manually trigger docs reindex
- `POST /mcp` - MCP protocol endpoint (stateless HTTP)

## MCP Tools

The server exposes these MCP tools:

1. **search_docs** - Search documentation by query
2. **get_doc_by_route** - Retrieve specific doc by route
3. **list_routes** - List all available documentation routes

## Build Process

1. **prepare-build.js** - Copies MDX files from docs-app to local content/
2. **TypeScript Build** - Compiles src/ to dist/
3. **Docker Build** - Creates containerized image with everything included

## File Structure

```
apps/docs-mcp/
├── src/
│   ├── config.ts      # Environment-aware configuration
│   ├── indexer.ts     # Documentation indexing logic
│   ├── server.ts      # MCP server implementation
│   └── index.ts       # Main entry point
├── scripts/
│   └── prepare-build.js  # Build preparation script
├── content/           # Generated during build (gitignored)
├── Dockerfile         # Multi-stage Docker build
├── .dockerignore
└── package.json
```

## Notes

- Content directory is gitignored and generated during build
- Development mode uses monorepo structure
- Production mode is fully self-contained
- Supports both local development and containerized deployment
