# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Nx monorepo with pnpm workspaces containing two applications:
- **`docs-app`** — Next.js 16 documentation website (port 3201)
- **`docs-mcp`** — Express.js MCP server providing programmatic access to docs (port 3100)

## Commands

All commands run from the monorepo root using Nx:

```bash
# Development
nx dev docs-app              # Start docs website (hot reload)
nx dev docs-mcp              # Start MCP server (tsx watch)
nx run-many -t dev           # Start both in parallel

# Build
nx build docs-app
nx build docs-mcp
nx run-many -t build

# Lint / Type-check
nx lint docs-app
nx typecheck docs-mcp
nx run-many -t lint
nx run-many -t typecheck

# Production
nx start docs-app            # Serve built Next.js app
nx start docs-mcp            # Run compiled MCP server (NODE_ENV=production)

# Docker (docs-mcp only)
nx build-docker-prep docs-mcp   # Prepares content + compiles TypeScript
nx docker-build docs-mcp        # Builds Docker image
nx docker-run docs-mcp          # Runs Docker container on port 3100

# Utilities
nx reset                     # Clear Nx cache
nx graph                     # Visualize project dependency graph
nx show projects             # List all projects
```

### Adding dependencies

```bash
pnpm add <pkg> --filter @journium/docs-app
pnpm add <pkg> --filter @journium/docs-mcp
pnpm add -D <pkg> -w          # Root-level dev dependency
```

## Architecture

### docs-app (Next.js 16 App Router)

Uses **Fumadocs** as the documentation framework. Key files:

- `apps/docs-app/lib/source.ts` — Fumadocs source loader; registers `docs` and `blog` collections from MDX files and exposes `source` and `blog` objects used throughout the app.
- `apps/docs-app/app/docs/[[...slug]]/page.tsx` — Catch-all docs page; renders MDX via Fumadocs `DocsPage`, injects structured data (TechArticle schema), and wraps links with hover-card previews.
- `apps/docs-app/app/docs/layout.tsx` — Fumadocs `DocsLayout` with tabbed sidebar; tabs are auto-derived from the content directory structure (nextjs, react, angular, js).
- `apps/docs-app/app/layout.tsx` — Root layout; wraps everything in `AISearch` context and Fumadocs `RootProvider` with a custom `CustomSearchDialog`.
- `apps/docs-app/app/api/chat/route.ts` — AI chat endpoint (Vercel AI SDK).
- `apps/docs-app/app/api/search/route.ts` — Orama-powered search API.

### Content Organization

MDX documentation files live at `apps/docs-app/content/docs/`:

```
content/docs/
  (nextjs)/       # Next.js SDK documentation
  react/          # React SDK documentation
  js/             # JavaScript/vanilla SDK documentation
  angular/        # Angular SDK documentation
  .includes/      # Shared MDX partials (NOT exposed as routes)
  .snippets/      # Reusable code snippets
```

Shared content is embedded into individual pages using a custom `<include>` tag:

```mdx
<include>../../.includes/concepts/events.mdx</include>
```

The `(nextjs)` directory uses a Next.js route group (parentheses) so the URL path becomes `/docs/nextjs/...` rather than `/docs/(nextjs)/...`.

### docs-mcp (Express.js MCP Server)

The MCP server indexes the docs-app MDX files at startup and exposes three MCP tools:

- `docs_search` — Keyword-scored search (title > route > body text)
- `docs_getPage` — Retrieve full MDX/text/frontmatter for a route or file path
- `docs_listRoutes` — List all indexed routes, optionally filtered by prefix

Key design decisions:
- **One `McpServer` instance per HTTP connection** (SDK limitation: `Server.connect()` overwrites transport, breaking concurrent connections)
- **Stateless mode**: no session IDs, suitable for scale-to-zero deployments
- `/.includes/**` routes are excluded from the index so partials don't appear as standalone pages
- In dev, `workspaceRoot` resolves to the monorepo root; in production (Docker), it resolves relative to `dist/`
- The `prepare-content` Nx target copies MDX files into `apps/docs-mcp/content/` before Docker builds

### Environment Variables

**docs-app** (`apps/docs-app/.env`):
```env
NEXT_PUBLIC_ASSET_PREFIX=
```

**docs-mcp** (`apps/docs-mcp/.env`):
```env
PORT=3100
REQUEST_TIMEOUT=300000
SSE_KEEPALIVE_INTERVAL=30000
ALLOWED_ORIGINS=http://localhost:3000,https://journium.app
```
