# Journium Docs MCP Server

Model Context Protocol (MCP) server for Journium documentation search and retrieval.

## Features

- Search Journium documentation
- Retrieve documentation content
- MCP server implementation with stdio transport
- Express.js HTTP server for health checks and monitoring

## Development

```bash
# From monorepo root
pnpm install
nx dev docs-mcp

# Or directly
cd apps/docs-mcp
pnpm install
pnpm run dev
```

## Build

```bash
# From monorepo root
nx build docs-mcp

# Or directly
cd apps/docs-mcp
pnpm run build
```

## Usage

### As MCP Server (stdio)
```bash
MCP_MODE=stdio pnpm run serve
```

### As HTTP Server
```bash
pnpm run serve
```

## Environment Variables

See `.env.example` for configuration options.
