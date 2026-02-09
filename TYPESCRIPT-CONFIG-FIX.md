# TypeScript Base Configuration - Fixed

## Problem

When running `nx graph`, you got this error:
```
NX   Failed to load 1 Nx plugin(s):
  - @nx/js/typescript: unable to find tsconfig.base.json or tsconfig.json
```

## Root Cause

The `@nx/js/typescript` plugin expects a root-level TypeScript configuration file (`tsconfig.base.json` or `tsconfig.json`) that can be extended by project-level configs. This is a standard Nx monorepo pattern.

## Solution

Created `tsconfig.base.json` at the monorepo root with shared TypeScript configuration.

## File Structure

```
journium-docs/
├── tsconfig.base.json          # Root config (NEW)
├── apps/
│   ├── docs-app/
│   │   └── tsconfig.json       # Extends base + Next.js settings
│   └── docs-mcp/
│       └── tsconfig.json       # Extends base + Node.js settings
```

## Configuration Details

### `tsconfig.base.json` (Root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist", ".next", "out"]
}
```

### `apps/docs-app/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Next.js specific settings
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
    "noEmit": true,
    // ... Next.js specific options
  }
}
```

### `apps/docs-mcp/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Node.js specific settings
    "outDir": "./dist",
    "rootDir": "./src",
    // ... Node.js specific options
  }
}
```

## Benefits

### 1. Shared Configuration
- Common TypeScript settings defined once
- No duplication across projects
- Consistent compiler behavior

### 2. Easy Maintenance
- Update base config affects all projects
- Project-specific overrides still possible
- Clear inheritance chain

### 3. Nx Integration
- `@nx/js/typescript` plugin works correctly
- Type checking targets work properly
- `nx graph` command works without errors

### 4. Better IDE Support
- TypeScript language server finds root config
- Better cross-project type inference
- Consistent code completion

## Commands Now Working

```bash
✓ nx graph                    # Opens dependency graph
✓ nx show projects           # Lists all projects
✓ nx typecheck docs-mcp      # Type checks MCP server
✓ nx run-many -t typecheck   # Type checks all projects
```

## Standard Nx Pattern

This configuration follows the standard Nx monorepo pattern:

1. **Root `tsconfig.base.json`**: Shared settings and path mappings
2. **Project `tsconfig.json`**: Extends base + project-specific settings
3. **Project `tsconfig.lib.json`** (optional): For library builds
4. **Project `tsconfig.spec.json`** (optional): For test files

## What Changed

| File | Change | Reason |
|------|--------|--------|
| `tsconfig.base.json` | Created | Required by Nx @nx/js/typescript plugin |
| `apps/docs-app/tsconfig.json` | Added `extends` | Inherits from base |
| `apps/docs-mcp/tsconfig.json` | Added `extends` | Inherits from base |

## Common Settings (Inherited by All)

From `tsconfig.base.json`:
- `strict`: true (strict type checking)
- `esModuleInterop`: true (CommonJS/ESM interop)
- `skipLibCheck`: true (faster builds)
- `moduleResolution`: bundler (modern resolution)
- `sourceMap`: true (debugging support)
- `declaration`: true (type declarations)

## Project-Specific Settings

### docs-app (Next.js)
- `jsx`: "react-jsx"
- `noEmit`: true (Next.js handles compilation)
- `lib`: ["dom", "dom.iterable", "esnext"]
- Path aliases via `@/*`

### docs-mcp (Node.js)
- `outDir`: "./dist"
- `rootDir`: "./src"
- `lib`: ["ES2022"]
- No JSX support

## Verification

The fix is verified by:
```bash
$ nx graph
# Opens browser with dependency graph (no errors)

$ nx show projects
@journium/docs-app
@journium/docs-mcp
# No TypeScript plugin errors
```

## Future Projects

When adding new projects, create their `tsconfig.json` like this:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Project-specific options here
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

This ensures they inherit the base configuration automatically.

## Summary

✅ **Created** `tsconfig.base.json` at monorepo root  
✅ **Updated** project configs to extend base  
✅ **Fixed** `nx graph` command error  
✅ **Improved** TypeScript configuration consistency  
✅ **Enabled** proper Nx type checking targets

The monorepo now follows standard Nx + TypeScript best practices! 🎉
