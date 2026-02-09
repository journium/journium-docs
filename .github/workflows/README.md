# GitHub Actions Workflows

## Overview

This directory contains CI/CD workflows for the Journium Docs monorepo.

## Workflows

### 1. CI (`ci.yml`)

**Trigger:** Push/PR to main/master branches

**Purpose:** Fast CI checks using Nx affected commands

**Steps:**
- Lint affected projects
- Type check affected projects  
- Build affected projects

**Benefits:**
- ✅ Only tests what changed (faster)
- ✅ Uses Nx caching for speed
- ✅ Runs on every push/PR

**Key Features:**
- Nx affected commands (`nx affected -t lint`)
- Caches both pnpm store and Nx cache
- Passes environment variables for docs-app

### 2. Build All (`build-all.yml`)

**Trigger:** Manual or weekly schedule

**Purpose:** Full build verification of all projects

**Steps:**
- Lint all projects
- Type check all projects
- Build all projects
- Upload build artifacts

**Benefits:**
- ✅ Ensures everything still builds
- ✅ Catches integration issues
- ✅ Weekly health check

**Key Features:**
- Full monorepo validation
- Build artifact uploads
- Can be triggered manually

## Nx Affected Commands

The CI workflow uses Nx's "affected" detection to only run tasks on projects that changed:

```yaml
# Only lint projects affected by current changes
nx affected -t lint --base=origin/main

# Only build what changed
nx affected -t build --base=origin/main
```

### How it Works

1. **Detects changes** since `origin/main`
2. **Builds dependency graph** of all projects
3. **Runs tasks** only on:
   - Projects with direct changes
   - Projects that depend on changed projects

### Benefits

| Scenario | Old Approach | With Nx Affected |
|----------|--------------|------------------|
| Changed docs-app | Build everything | Build only docs-app |
| Changed docs-mcp | Build everything | Build only docs-mcp |
| Changed shared lib | Build everything | Build docs-app + docs-mcp |
| No changes | Build everything | Skip (use cache) |

## Environment Variables

The workflows expect these configured in GitHub:

### Repository Variables
```
NEXT_PUBLIC_ORAMA_PROJECT_ID
NEXT_PUBLIC_ORAMA_API_KEY
NEXT_PUBLIC_ORAMA_DATASOURCE_ID
```

Set these in: Repository Settings → Secrets and variables → Actions → Variables

## Caching Strategy

### pnpm Store Cache
- **Key:** OS + pnpm-lock.yaml hash
- **Path:** pnpm store directory
- **Saves:** ~2-3 minutes on install

### Nx Cache
- **Key:** OS + lockfile + source files hash
- **Path:** `.nx/cache`
- **Saves:** Minutes to hours on builds

### Cache Hit Rate
- First run: 0% (cold cache)
- Subsequent runs: ~80-90% (warm cache)
- Changed files: Partial cache hits

## Optimizations

### 1. Fetch Depth
```yaml
fetch-depth: 0
```
Required for `nx affected` to compare against base branch.

### 2. Pinned pnpm Version
```yaml
version: '10.28.2'
```
Ensures consistent behavior (don't use `latest`).

### 3. Parallel Execution
Nx automatically parallelizes tasks where possible:
```bash
nx run-many -t lint  # Lints all projects in parallel
```

### 4. Incremental Builds
Nx only rebuilds what changed, not entire workspace.

## Adding More Workflows

### Example: Deploy docs-app
```yaml
name: Deploy docs-app

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - # ... setup steps ...
      - run: pnpm run nx build docs-app
      - # ... deployment steps ...
```

### Example: Test workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - # ... setup steps ...
      - run: pnpm run nx affected -t test --base=origin/main
```

## Troubleshooting

### Affected detection not working
- Ensure `fetch-depth: 0` is set
- Check base branch name (`origin/main` vs `origin/master`)

### Nx cache misses
- Verify `.nx/cache` is in cache path
- Check cache key includes relevant file hashes
- Ensure Nx version is consistent

### pnpm install failures
- Verify `pnpm-lock.yaml` is committed
- Use `--frozen-lockfile` flag
- Pin pnpm version (don't use `latest`)

### Build failures
- Check environment variables are set
- Verify all dependencies are in `package.json`
- Test locally with same Node version

## Local Testing

Test CI workflows locally before pushing:

```bash
# Simulate affected detection
nx affected:graph

# Run what CI will run
nx affected -t lint --base=origin/main
nx affected -t typecheck --base=origin/main
nx affected -t build --base=origin/main

# Test full build
nx run-many -t build
```

## Performance Metrics

Typical CI run times (with cache):

| Task | Cold Cache | Warm Cache | Affected Only |
|------|------------|------------|---------------|
| Install | ~3 min | ~30 sec | ~30 sec |
| Lint | ~1 min | ~10 sec | ~5 sec |
| Typecheck | ~30 sec | ~5 sec | ~3 sec |
| Build | ~5 min | ~1 min | ~30 sec |
| **Total** | **~9.5 min** | **~2 min** | **~1 min** |

## Next Steps

Consider adding:
- [ ] Deployment workflows (Vercel, custom hosting)
- [ ] Test workflows (unit, e2e)
- [ ] Release workflows (versioning, changelog)
- [ ] Performance benchmarking
- [ ] Security scanning
- [ ] Dependency updates (Dependabot, Renovate)
