# Project Type Classification Fix

## Issue

When viewing `nx graph`, the `docs-mcp` project was being classified as a **Library** instead of an **Application**.

## Why This Happened

Nx infers project types based on package structure:

### Library Indicators (what docs-mcp had):
- ✓ `"main": "dist/index.js"` in package.json
- ✓ TypeScript compilation to `dist/`
- ✓ No explicit project type specified
- ✓ Builds declarative outputs (.d.ts files)

### Application Indicators (what was missing):
- ✗ No `projectType: "application"` specified
- ✗ No application-specific tags

## Solution

Added explicit project type configuration in two places:

### 1. `apps/docs-mcp/project.json` (Created)

```json
{
  "name": "@journium/docs-mcp",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/docs-mcp/src",
  "targets": {},
  "tags": ["type:app", "platform:node"]
}
```

**Purpose:**
- Explicitly declares this as an application
- Sets source root for better tooling support
- Allows for project-specific target overrides
- Adds tags for filtering and organization

### 2. `apps/docs-mcp/package.json` (Updated)

```json
{
  "nx": {
    "tags": ["type:app", "platform:node"]
  }
}
```

**Purpose:**
- Provides Nx-specific metadata
- Tags help with:
  - Filtering projects (`nx affected -t build --projects=tag:type:app`)
  - Visual organization in nx graph
  - Lint rules (can enforce dependencies based on tags)

## Project Types in Nx

### Application
- **Purpose:** Executable, deployable artifacts
- **Examples:** Web apps, APIs, CLIs, servers
- **Characteristics:**
  - Has a main entry point
  - Deployed/run independently
  - May depend on libraries

### Library
- **Purpose:** Reusable code shared across applications
- **Examples:** UI components, utilities, data access
- **Characteristics:**
  - Exported as package
  - Not deployed independently
  - Consumed by applications

## docs-mcp Classification

**Correct Type:** Application ✅

**Reasoning:**
- It's an Express.js server (deployable)
- Has executable entry point (`src/index.ts`)
- Runs independently (not consumed by other projects)
- Serves HTTP requests and MCP protocol

## Comparison

### Before (Inferred as Library)
```
Nx inferred from:
- main: "dist/index.js" → Library pattern
- Build outputs declarations → Library pattern
- No explicit type → Defaults to library
```

### After (Explicit Application)
```
Nx reads from:
- project.json: projectType: "application" → App
- package.json: nx.tags: ["type:app"] → App
- Clear classification in nx graph
```

## Benefits

### 1. Clear Visualization
- Shows correctly in `nx graph` as application
- Groups with other apps (docs-app)
- Distinct from future libraries

### 2. Better Tooling
- IDE understands project structure
- Nx commands work as expected
- Documentation auto-generated correctly

### 3. Future-Proof
- When you add libraries, clear separation
- Dependency rules can enforce app→lib direction
- Team members understand architecture

## Tags Explained

```json
"tags": ["type:app", "platform:node"]
```

### `type:app`
- **Category:** Project type
- **Usage:** Filter by type
- **Example:** `nx affected -t build --projects=tag:type:app`

### `platform:node`
- **Category:** Runtime platform  
- **Usage:** Platform-specific operations
- **Example:** Deploy only Node.js apps to specific servers

### Future Tags (Examples)
```json
"tags": [
  "type:app",           // Application
  "platform:node",      // Node.js runtime
  "scope:api",          // API service
  "deploy:docker"       // Deployed via Docker
]
```

## Project Structure

```
apps/docs-mcp/
├── project.json          # Nx project configuration
├── package.json          # Package metadata + nx tags
├── tsconfig.json         # TypeScript config
├── src/
│   └── index.ts         # Application entry point
└── dist/                # Build output
    └── index.js         # Compiled application
```

## Verification

Check project type in Nx:

```bash
# View in graph
nx graph

# Check project details
nx show project @journium/docs-mcp

# List all applications
nx show projects --projects=tag:type:app
```

## Related Files

- `apps/docs-app/` - Also an application (Next.js)
- Future `libs/` - Will contain libraries (shared code)

## When to Use Each Type

### Use Application (`projectType: "application"`) for:
- ✅ Web servers (Express, Fastify)
- ✅ Frontend apps (Next.js, React)
- ✅ CLI tools
- ✅ Workers/services
- ✅ Anything that runs independently

### Use Library for:
- ✅ Shared UI components
- ✅ Utility functions
- ✅ Data access layers
- ✅ Type definitions
- ✅ Anything consumed by apps

## Summary

✅ **Created** `project.json` with `projectType: "application"`  
✅ **Added** Nx tags in `package.json`  
✅ **Classification** now correct in nx graph  
✅ **Future-proof** for adding libraries

The `docs-mcp` project is now properly classified as an application! 🎉
