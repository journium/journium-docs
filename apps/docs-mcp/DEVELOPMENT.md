# Commands

Build MCP Server (Local)

```bash
# Run in development mode with hot reload
nx dev docs-mcp

# Build TypeScript
nx build docs-mcp

# Prepare content (copy MDX files)
nx prepare-content docs-mcp

# Run built version locally
nx start docs-mcp
```

Build MCP Server (Docker)

```bash
nx docker-build docs-mcp        # Build Docker image
nx docker-run docs-mcp          # Run 

```