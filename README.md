# Journium Documentation Monorepo

> Multi-project monorepo for Journium documentation website and MCP server

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Nx](https://img.shields.io/badge/built%20with-Nx-143055)](https://nx.dev)

## Projects

### 📚 docs-app
Next.js 16 documentation website with:
- Interactive documentation powered by [Fumadocs](https://fumadocs.vercel.app/)
- AI-powered search
- MDX content with syntax highlighting
- Dark mode support

**Port:** 3201

### 🔌 docs-mcp
Model Context Protocol (MCP) server providing programmatic access to documentation:
- Search and retrieval capabilities
- RESTful API + MCP stdio support
- Built with Express.js and TypeScript

**Port:** 3100

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10.28.2+

### Installation

```bash
# Clone and install
git clone <repo-url>
cd journium-docs
pnpm install
```

### Development

```bash
# Start docs website
nx dev docs-app

# Start MCP server
nx dev docs-mcp

# Start both in parallel
nx run-many -t dev
```

Visit:
- Documentation: http://localhost:3201
- MCP Server: http://localhost:3100

## Common Commands

```bash
# Development
nx dev docs-app              # Start docs site
nx dev docs-mcp              # Start MCP server
nx run-many -t dev           # Start all projects

# Build
nx build docs-app            # Build docs site
nx build docs-mcp            # Build MCP server
nx run-many -t build         # Build all

# Production
nx start docs-app            # Run built docs site
nx serve docs-mcp            # Run built MCP server

# Utilities
nx graph                     # Visualize project graph
nx show projects             # List all projects
nx reset                     # Clear cache
```

📖 **See [COMMANDS.md](./COMMANDS.md) for comprehensive command reference**

## Project Structure

```
journium-docs/
├── apps/
│   ├── docs-app/           # Next.js documentation website
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── content/        # MDX documentation files
│   │   ├── lib/            # Utilities
│   │   └── public/         # Static assets
│   └── docs-mcp/           # Express.js MCP server
│       ├── src/            # TypeScript source
│       └── dist/           # Compiled output
├── packages/               # Shared packages (future)
├── libs/                   # Shared libraries (future)
├── nx.json                 # Nx configuration
├── pnpm-workspace.yaml     # pnpm workspace config
└── package.json            # Root package
```

## Architecture

This is an **Nx monorepo** using **pnpm workspaces** for dependency management:

- **Nx**: Task orchestration, caching, and dependency graph
- **pnpm**: Fast, disk-efficient package manager
- **TypeScript**: Type safety across all projects
- **Shared tooling**: ESLint, Prettier, TypeScript configs

### Benefits

✅ Unified dependency management  
✅ Intelligent build caching  
✅ Parallel task execution  
✅ Automatic dependency tracking  
✅ Consistent tooling across projects

## Adding Dependencies

```bash
# Add to docs-app
pnpm add <package> --filter @journium/docs-app

# Add to docs-mcp
pnpm add <package> --filter @journium/docs-mcp

# Add dev dependency to root
pnpm add -D <package> -w
```

## Environment Variables

### docs-app
Create `apps/docs-app/.env`:
```env
NEXT_PUBLIC_ASSET_PREFIX=
# Add other Next.js variables
```

### docs-mcp
Create `apps/docs-mcp/.env`:
```env
PORT=3100
MCP_MODE=http
```

See `.env.example` files in each project for full configuration options.

## Documentation

- [Command Reference](./COMMANDS.md) - Comprehensive guide to all commands
- [Monorepo Setup](./MONOREPO-SETUP.md) - Architecture and configuration details
- [docs-app README](./apps/docs-app/README.md) - Next.js app specifics
- [docs-mcp README](./apps/docs-mcp/README.md) - MCP server specifics

## Tech Stack

### docs-app
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TailwindCSS 4
- **Documentation:** Fumadocs, MDX
- **Syntax:** Shiki, Twoslash
- **Search:** Orama
- **Icons:** Lucide React

### docs-mcp
- **Runtime:** Node.js
- **Framework:** Express.js
- **MCP SDK:** @modelcontextprotocol/sdk
- **Language:** TypeScript
- **Dev Tools:** tsx, tsc

### Monorepo
- **Build System:** Nx 22.4
- **Package Manager:** pnpm 10.28
- **Linting:** ESLint 9
- **Type Checking:** TypeScript 5

## Development Workflow

1. **Make changes** in `apps/docs-app` or `apps/docs-mcp`
2. **Run dev server** with `nx dev <project>`
3. **Check affected** with `nx affected:graph`
4. **Build** with `nx build <project>`
5. **Test** your changes
6. **Commit** and push

Nx automatically:
- Caches successful builds
- Tracks dependencies between projects
- Only rebuilds what changed
- Runs tasks in optimal order

## Troubleshooting

### Projects not detected
```bash
nx reset && pnpm install
```

### Cache issues
```bash
nx reset
```

### Wrong workspace (shows parent repo)
```bash
# Always use the nx wrapper script
pnpm run nx <command>
```

### Port already in use
```bash
# docs-app uses 3201
# docs-mcp uses 3100
# Change in .env files if needed
```

## Contributing

1. Create feature branch
2. Make changes
3. Run `nx affected -t build,lint,test`
4. Commit and push
5. Create pull request

## License

[Add your license]

## Links

- [Nx Documentation](https://nx.dev)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
