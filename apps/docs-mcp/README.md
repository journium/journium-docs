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

All commands should be run from the **monorepo root** using Nx:

```bash
# Run in development mode with hot reload
nx dev docs-mcp

# Build TypeScript
nx build docs-mcp

# Prepare content (copy MDX files)
nx prepare-content docs-mcp

# Run built version locally
nx start docs-mcp

# Validate setup
nx validate docs-mcp
```

## Docker Deployment

### Build Docker Image (from monorepo root)

```bash
# Full build with Nx (recommended)
nx prepare-content docs-mcp    # Copy MDX files
nx build docs-mcp               # Compile TypeScript
nx docker-build docs-mcp        # Build Docker image

# Or run all steps in sequence
nx run-many -t prepare-content build docker-build -p docs-mcp
```

### Run Docker Container

```bash
# Run locally
nx docker-run docs-mcp

# Or manually
docker run --rm -p 3100:3100 journium-docs-mcp
```

### Manual Docker Build

If you prefer to run Docker commands directly:

```bash
# From monorepo root
nx prepare-content docs-mcp
nx build docs-mcp
docker build -f apps/docs-mcp/Dockerfile -t journium-docs-mcp .
```

### Environment Variables

- `PORT` - Server port (default: 3100)
- `NODE_ENV` - Environment (development/production)
- `REQUEST_TIMEOUT` - Request timeout in milliseconds (default: 300000 = 5 minutes)
- `SSE_KEEPALIVE_INTERVAL` - Time between SSE keep-alive comments in milliseconds (default: 30000 = 30 seconds)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

For more details on connection health and keep-alive configuration, see **KEEP_ALIVE.md**.

## Nx Targets

| Target | Description |
|--------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Compile TypeScript to dist/ |
| `prepare-content` | Copy MDX files from docs-app to content/ |
| `build-docker-prep` | Run prepare-content and build in sequence |
| `docker-build` | Build Docker image from monorepo root |
| `docker-run` | Run Docker container locally |
| `start` | Run production build locally |
| `validate` | Validate entire setup |

## AWS ECS Deployment

### Using Nx

```bash
# Prepare and build
nx run-many -t prepare-content build -p docs-mcp

# Build Docker image
nx docker-build docs-mcp

# Deploy (requires AWS CLI configured)
cd apps/docs-mcp && ./scripts/deploy-ecs.sh
```

### Build and Push to ECR

```bash
# Build for production
nx prepare-content docs-mcp
nx build docs-mcp
nx docker-build docs-mcp

# Tag for ECR
docker tag journium-docs-mcp:latest <account>.dkr.ecr.<region>.amazonaws.com/journium-docs-mcp:latest

# Push to ECR
docker push <account>.dkr.ecr.<region>.amazonaws.com/journium-docs-mcp:latest
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /reindex` - Manually trigger docs reindex
- `POST /mcp` - MCP protocol endpoint (stateless HTTP)

## MCP Tools

The server exposes these MCP tools:

1. **docs_search** - Search documentation by query
2. **docs_getPage** - Retrieve specific doc by route or file path
3. **docs_listRoutes** - List all available documentation routes

### Implementation Notes

The indexer automatically resolves `<include>` tags in MDX files during indexing, allowing documentation to be modular and reusable across different sections while presenting a seamless experience to AI assistants.

## Build Process

1. **prepare-content** - Copies MDX files from docs-app to local content/
2. **build** - Compiles TypeScript src/ to dist/
3. **docker-build** - Creates containerized image with everything included

## File Structure

```
apps/docs-mcp/
├── src/
│   ├── config.ts      # Environment-aware configuration
│   ├── indexer.ts     # Documentation indexing logic
│   ├── server.ts      # MCP server implementation
│   └── index.ts       # Main entry point
├── scripts/
│   ├── prepare-build.js  # Build preparation script
│   ├── deploy-ecs.sh     # AWS ECS deployment
│   └── validate.sh       # Setup validation
├── content/           # Generated during build (gitignored)
├── dist/              # Compiled TypeScript (gitignored)
├── Dockerfile         # Multi-stage Docker build (runs from monorepo root)
├── project.json       # Nx targets configuration
└── package.json       # Dependencies
```

## Testing

### Local Development
```bash
nx dev docs-mcp
# Server at http://localhost:3100/mcp
```

### Production Build
```bash
nx build docs-mcp
nx start docs-mcp
```

### Docker
```bash
nx docker-build docs-mcp
nx docker-run docs-mcp
# Test: curl http://localhost:3100/health
```

## CI/CD

The project includes GitHub Actions workflow for automated deployment. See `.github/workflows/deploy-docs-mcp.yml`.


## Notes

- All commands should be run from the monorepo root using `nx`
- Content directory is gitignored and generated during build
- Development mode uses monorepo structure
- Production mode is fully self-contained
- Supports both local development and containerized deployment
