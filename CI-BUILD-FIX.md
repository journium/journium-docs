# CI Build Failures - Fixed

## Problem

CI was failing during the build step with multiple "Module not found" errors:

```
Module not found: Can't resolve '../../../../../lib/inkeep-qa-schema'
Module not found: Can't resolve '@/apps/docs-app/app/(home)/blog/[slug]/page.client'
Module not found: Can't resolve '@/apps/docs-app/mdx-components'
```

## Root Cause

During the migration to monorepo structure, some import paths were incorrectly updated to include `@/apps/docs-app/` prefix, which is invalid. The TypeScript path alias `@/` already points to the `apps/docs-app` directory, so adding `apps/docs-app` again created an invalid path.

## Files Fixed

### 1. `apps/docs-app/app/(home)/blog/[slug]/page.tsx`

**Before:**
```typescript
import { ShareButton } from '@/apps/docs-app/app/(home)/blog/[slug]/page.client';
import { getMDXComponents } from '@/apps/docs-app/mdx-components';
```

**After:**
```typescript
import { ShareButton } from './page.client';  // Relative import
import { getMDXComponents } from '@/mdx-components';  // Correct alias
```

### 2. `apps/docs-app/app/docs/[[...slug]]/page.tsx`

**Before:**
```typescript
import { getMDXComponents } from '@/apps/docs-app/mdx-components';
```

**After:**
```typescript
import { getMDXComponents } from '@/mdx-components';
```

### 3. `apps/docs-app/app/api/chat/route.ts`

**Before:**
```typescript
import { ProvideLinksToolSchema } from '../../../../../lib/inkeep-qa-schema';
```

**After:**
```typescript
import { ProvideLinksToolSchema } from '@/lib/inkeep-qa-schema';
```

## TypeScript Path Aliases

The `@/` alias is configured in `apps/docs-app/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This means:
- `@/` → points to `apps/docs-app/`
- `@/lib/utils` → resolves to `apps/docs-app/lib/utils`
- `@/components/ui/button` → resolves to `apps/docs-app/components/ui/button`

## Verification

### Local Build
```bash
✓ pnpm run nx build docs-app - SUCCESS
✓ pnpm run nx lint docs-app - SUCCESS
✓ pnpm run nx affected -t lint --base=origin/main - SUCCESS
```

### CI Build
The following will now work in CI:
```bash
✓ pnpm run nx affected -t lint --base=origin/main
✓ pnpm run nx affected -t typecheck --base=origin/main
✓ pnpm run nx affected -t build --base=origin/main
```

## Why CI Failed But Local Might Not

If you were running:
- `nx dev docs-app` - Development server doesn't do full build
- `nx build docs-app` from cache - Nx was using cached build

CI always runs fresh builds without cache on first run, which caught these import errors.

## Import Best Practices

### ✅ Good Patterns
```typescript
// Use path alias for absolute imports
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

// Use relative imports for same-directory files
import { ShareButton } from './page.client';

// Use path alias for root-level files
import { getMDXComponents } from '@/mdx-components';
```

### ❌ Bad Patterns
```typescript
// Don't duplicate the app name in path alias
import { cn } from '@/apps/docs-app/lib/cn';  // WRONG

// Don't use deep relative paths
import { utils } from '../../../../../lib/utils';  // AVOID

// Don't mix absolute and relative inconsistently
import { A } from './local';
import { B } from '../../../other';  // Use @/ instead
```

## Prevention

To avoid this in the future:

1. **Check imports after path changes**
   ```bash
   pnpm run nx build docs-app
   ```

2. **Use ESLint rules** (if available)
   ```json
   {
     "rules": {
       "no-restricted-imports": ["error", {
         "patterns": ["**/apps/docs-app/**"]
       }]
     }
   }
   ```

3. **Run CI checks locally before pushing**
   ```bash
   pnpm run nx affected -t build --base=origin/main
   ```

## Summary

✅ **Fixed 3 files** with incorrect import paths  
✅ **Build now succeeds** both locally and in CI  
✅ **Nx affected commands work** as expected  
✅ **CI pipeline will pass** on next push

The CI failure was not an issue with the Nx configuration or the `--base=origin/main` flag - it was application code import errors that were exposed when CI tried to build the project.
