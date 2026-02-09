# Docs MCP Server - Migration Summary

## What Changed

The docs-mcp server has been restructured for proper containerized deployment on AWS ECS.

### Before (Messy)
- ❌ Relied on monorepo workspace structure at runtime
- ❌ Used relative paths that only worked in dev mode
- ❌ No clear separation between dev and production
- ❌ Couldn't be containerized properly

### After (Clean)
- ✅ Self-contained Docker image with all content included
- ✅ Environment-aware configuration (dev vs production)
- ✅ Build process copies MDX files into the package
- ✅ Ready for AWS ECS deployment
- ✅ Proper CI/CD with GitHub Actions

## Directory Structure

```
apps/docs-mcp/
├── src/
│   ├── config.ts          # Environment-aware config
│   ├── indexer.ts         # Documentation indexer
│   ├── server.ts          # MCP server
│   └── index.ts           # Entry point
├── scripts/
│   ├── prepare-build.js   # Copy MDX files pre-build
│   ├── prepare-build.sh   # Bash version
│   └── deploy-ecs.sh      # ECS deployment script
├── content/               # Generated during build (gitignored)
│   └── (nextjs)/
│   └── js/
│   └── react/
│   └── shared/
├── dist/                  # Compiled TypeScript
├── Dockerfile             # Multi-stage Docker build
├── .dockerignore
├── package.json
├── README.md              # Usage guide
└── DEPLOYMENT.md          # AWS ECS deployment guide
```

## How It Works

### Development Mode
```bash
pnpm dev
```
- Uses monorepo structure
- Reads from `../../apps/docs-app/content/docs/`
- Hot reloading with tsx watch
- NODE_ENV defaults to development

### Production Mode (Docker)
```bash
pnpm build:docker  # Prepare content + compile TypeScript
docker build -t journium-docs-mcp .
docker run -p 3100:3100 journium-docs-mcp
```
- Self-contained image
- Content copied into `./content/` during build
- Reads from local files
- NODE_ENV=production

## Configuration

The `config.ts` file automatically selects the right configuration:

```typescript
// DEV: apps/docs-app/content/docs/**/*.mdx (from workspace root)
// PROD: content/**/*.mdx (from local directory)
```

## Build Process

1. **prepare-build.js** runs first:
   - Copies all MDX files from `apps/docs-app/content/docs/`
   - Places them in `apps/docs-mcp/content/`
   - Preserves directory structure

2. **TypeScript compilation**:
   - Compiles `src/` to `dist/`

3. **Docker build** (optional):
   - Multi-stage build for smaller image
   - Installs only production dependencies
   - Includes content directory

## Deployment Options

### 1. GitHub Actions (Automated)
- Triggers on push to main
- Builds image, pushes to ECR
- Updates ECS service
- Workflow: `.github/workflows/deploy-docs-mcp.yml`

### 2. Manual Script
```bash
./scripts/deploy-ecs.sh
```

### 3. Manual Commands
```bash
pnpm build:docker
docker build -t journium-docs-mcp .
# Push to ECR and update ECS
```

## Testing

### Local Development
```bash
cd apps/docs-mcp
pnpm dev
# Server at http://localhost:3100/mcp
```

### Production Build
```bash
pnpm build:docker
NODE_ENV=production PORT=3100 node dist/index.js
```

### Docker
```bash
pnpm docker:build
pnpm docker:run
# Test: curl http://localhost:3100/health
```

## Key Files

- **Dockerfile**: Multi-stage build, optimized for production
- **config.ts**: Environment detection, different paths for dev/prod
- **prepare-build.js**: Pre-build script to copy MDX files
- **deploy-ecs.sh**: AWS ECS deployment automation
- **DEPLOYMENT.md**: Complete AWS setup and deployment guide
- **README.md**: Usage instructions for developers

## Environment Variables

- `NODE_ENV` - "development" or "production"
- `PORT` - Server port (default: 3100)

## Next Steps

1. **Test locally**: `pnpm dev` to verify dev mode works
2. **Build Docker image**: `pnpm docker:build`
3. **Test container**: `pnpm docker:run`
4. **Set up AWS**: Follow DEPLOYMENT.md for ECR/ECS setup
5. **Deploy**: Use GitHub Actions or deploy-ecs.sh script

## Benefits

1. **Clean separation**: Dev uses workspace, prod is self-contained
2. **Simple deployment**: Single Docker image with everything
3. **Fast CI/CD**: Automated builds and deployments
4. **Easy testing**: Can test production mode locally
5. **Scalable**: Ready for ECS with multiple instances
6. **Maintainable**: Clear structure and documentation

## Files Added

- ✅ Dockerfile
- ✅ .dockerignore
- ✅ scripts/prepare-build.js
- ✅ scripts/prepare-build.sh
- ✅ scripts/deploy-ecs.sh
- ✅ .github/workflows/deploy-docs-mcp.yml
- ✅ README.md (updated)
- ✅ DEPLOYMENT.md
- ✅ content/.gitignore

## Files Modified

- ✅ src/config.ts - Environment-aware configuration
- ✅ src/indexer.ts - Uses workspaceRoot from config
- ✅ package.json - Added build:docker and docker scripts
- ✅ .gitignore - Ignores content/ directory
