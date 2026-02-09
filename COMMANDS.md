# Journium Docs Monorepo - Command Reference

## Project Structure

```
journium-docs/
├── apps/
│   ├── docs-app/          # Next.js documentation website
│   └── docs-mcp/          # Express.js MCP server
├── packages/              # (future shared packages)
└── libs/                  # (future shared libraries)
```

## Available Commands

### From Root (Recommended)

All commands should be run from the **root of the monorepo** using Nx:

#### Development
```bash
# Start Next.js docs app (port 3201)
nx dev docs-app

# Start MCP server in dev mode (port 3100)
nx dev docs-mcp

# Start both in parallel
nx run-many -t dev
```

#### Build
```bash
# Build Next.js docs app
nx build docs-app

# Build MCP server (TypeScript compilation)
nx build docs-mcp

# Build all projects
nx run-many -t build
```

#### Serve/Start
```bash
# Start Next.js production server
nx start docs-app

# Start MCP server (requires build first)
nx serve docs-mcp
nx start docs-mcp
```

#### Lint
```bash
# Lint docs-app
nx lint docs-app

# Lint all projects
nx run-many -t lint
```

#### Type Check
```bash
# Type check docs-mcp
nx typecheck docs-mcp

# Type check all
nx run-many -t typecheck
```

### Using npm scripts shortcuts

Convenience scripts are available in root `package.json` that require specifying the project:

```bash
# These run on the FIRST project found, so specify the project explicitly:
pnpm run dev            # Runs first project's dev (not recommended)
pnpm run build          # Runs first project's build (not recommended)

# Better: Use Nx directly
pnpm run nx dev docs-app
pnpm run nx serve docs-mcp
```

## Nx Commands

### View Project Information
```bash
# List all projects
nx show projects

# Show project details
nx show project docs-app
nx show project docs-mcp

# View dependency graph (opens in browser)
nx graph
```

### Run Multiple Projects
```bash
# Run dev for all projects in parallel
nx run-many -t dev

# Build all projects
nx run-many -t build

# Run specific targets for specific projects
nx run-many -t build -p docs-app,docs-mcp
```

### Affected Commands
```bash
# See what's affected by your changes
nx affected:graph

# Build only affected projects
nx affected -t build

# Test only affected projects
nx affected -t test
```

### Cache Management
```bash
# Clear Nx cache
nx reset

# View cache statistics
nx report
```

## Project-Specific Details

### docs-app (Next.js)

**Port:** 3201  
**Tech:** Next.js 16, React 19, Fumadocs, TailwindCSS  
**Main Targets:**
- `dev` - Development server with hot reload
- `build` - Production build
- `start` - Start production server
- `lint` - ESLint
- `sync-content` - Sync documentation content

**Direct Commands:**
```bash
cd apps/docs-app
pnpm run dev
```

### docs-mcp (Express.js + MCP)

**Port:** 3100  
**Tech:** Express.js, Model Context Protocol SDK, TypeScript  
**Main Targets:**
- `dev` - Development with tsx watch
- `build` - TypeScript compilation
- `serve` - Run built version with watch
- `start` - Run built version

**Environment:**
- Copy `.env.example` to `.env`
- Set `PORT` and `MCP_MODE` (http or stdio)

**Direct Commands:**
```bash
cd apps/docs-mcp
pnpm run dev
```

## Best Practices

### ✅ DO
- Run commands from monorepo root using `nx`
- Use `nx run-many` for parallel execution
- Use `nx affected` to only build/test what changed
- Use `nx graph` to visualize dependencies

### ❌ DON'T
- Run `pnpm run dev` without specifying project (ambiguous)
- Use `cd apps/X && pnpm run command` unless testing locally
- Forget to run `nx reset` if you see caching issues

## Dependency Management

### Installing Dependencies

```bash
# Install in specific project
pnpm add express --filter @journium/docs-mcp
pnpm add -D @types/express --filter @journium/docs-mcp

# Install in docs-app
pnpm add react-icons --filter @journium/docs-app

# Install dev dep at root (Nx plugins, etc.)
pnpm add -D @nx/node -w
```

### Shared Dependencies

For packages needed by multiple projects:
1. Create a shared library under `libs/`
2. Reference it in project dependencies
3. Nx will handle the build order automatically

## Troubleshooting

### Projects not detected
```bash
nx reset
pnpm install
nx show projects
```

### Wrong workspace detected (shows parent repo projects)
```bash
# Use the wrapper script
pnpm run nx show projects

# Or set env var
NX_WORKSPACE_ROOT_PATH=$PWD nx show projects
```

### Cache issues
```bash
nx reset
rm -rf node_modules
pnpm install
```

## Quick Reference

| Task | Command |
|------|---------|
| Dev docs-app | `nx dev docs-app` |
| Dev docs-mcp | `nx dev docs-mcp` |
| Dev both | `nx run-many -t dev` |
| Build docs-app | `nx build docs-app` |
| Build docs-mcp | `nx build docs-mcp` |
| Build all | `nx run-many -t build` |
| Serve MCP | `nx serve docs-mcp` |
| List projects | `nx show projects` |
| View graph | `nx graph` |
| Clear cache | `nx reset` |

## Environment Setup

### docs-app
Create `apps/docs-app/.env`:
```env
# Add your Next.js environment variables
```

### docs-mcp
Create `apps/docs-mcp/.env`:
```env
PORT=3100
MCP_MODE=http
```
