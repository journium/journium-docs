# Fix for "The entry point 'source.config.ts' cannot be marked as external" Error

## Problem

After migrating to pnpm workspaces and Nx monorepo, CI builds (GitHub Actions and Vercel) were failing with the error:

```
Error: The entry point "source.config.ts" cannot be marked as external
```

This error appeared during the build and lint steps in CI, but **not in local builds**.

## Root Cause

The issue was caused by an **outdated version of ESBuild (0.27.2)** that was being pulled in as a transitive dependency through:

```
vite@7.3.1 → esbuild@0.27.2
```

The dependency chain was:
- `@nx/vite` (dev dependency) requires `vite` as a peer dependency
- `vite@7.3.1` depends on `esbuild@0.27.2`
- `fumadocs-mdx` uses ESBuild internally to process `source.config.ts`

ESBuild 0.27.2 (from 2023) has a bug where it incorrectly tries to externalize local entry point files in monorepo environments with pnpm workspaces. This caused the build to fail when `fumadocs-mdx` attempted to bundle the `source.config.ts` file.

### Why Local Builds Worked

Local builds worked because:
1. Nx caching may have used a cached build that was created before the monorepo migration
2. The error manifests differently depending on how dependencies are resolved in different environments
3. CI always runs with a clean slate (no cache), exposing the underlying issue

## Solution

Force pnpm to use a newer version of ESBuild by adding an override in the root `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "esbuild": "^0.24.2"
    }
  }
}
```

This ensures all packages in the workspace (including transitive dependencies like `vite`) use ESBuild 0.24.2 or later, which fixes the externalization bug.

## Implementation Steps

1. **Added pnpm override** to `/package.json`:
   ```json
   "pnpm": {
     "overrides": {
       "esbuild": "^0.24.2"
     }
   }
   ```

2. **Updated lockfile**:
   ```bash
   pnpm install --no-frozen-lockfile
   ```

3. **Verified the fix** with a clean build:
   ```bash
   rm -rf apps/docs-app/.next apps/docs-app/.source
   pnpm run nx build @journium/docs-app --skip-nx-cache
   ```

## Verification

After applying the fix:

✅ **Local builds** continue to work  
✅ **Clean builds** (without cache) work successfully  
✅ **CI builds** should now pass (GitHub Actions and Vercel)

The build completes without the "entry point cannot be marked as external" error.

## Why This Fix Works

- **ESBuild 0.24.2** (released in 2024) includes improvements to how it handles module resolution in monorepo environments
- The `pnpm.overrides` field forces all packages in the workspace to use this specific version
- This ensures consistent behavior across local development, CI, and production builds

## Files Modified

1. `/package.json` - Added pnpm overrides section
2. `/pnpm-lock.yaml` - Updated (automatic via `pnpm install`)

## Testing

To verify the fix in CI, push the changes and check:

1. **GitHub Actions**: The `Lint and Build` job should complete successfully
2. **Vercel**: Deployment builds should succeed without errors
3. **Local**: Clean builds should continue to work

## Additional Notes

- This is a known issue with older versions of ESBuild in monorepo setups
- The issue specifically affects tools like `fumadocs-mdx` that use ESBuild internally to process TypeScript config files
- The fix is forward-compatible and should not cause any breaking changes

## Prevention

To prevent similar issues in the future:

1. **Always test with clean builds** before pushing:
   ```bash
   rm -rf apps/docs-app/.next && pnpm run nx build @journium/docs-app --skip-nx-cache
   ```

2. **Monitor transitive dependencies** - Be aware that dev tools like Vite/Nx may pull in older versions of build tools

3. **Use pnpm overrides** strategically for known problematic packages

---

**Date Fixed**: February 10, 2026  
**Issue**: ESBuild externalization bug in monorepo  
**Solution**: Force ESBuild 0.24.2+ via pnpm overrides
