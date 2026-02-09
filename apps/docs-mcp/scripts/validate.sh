#!/bin/bash
# Validation script to ensure docs-mcp is correctly configured

set -e

echo "🔍 Validating Journium Docs MCP Server Setup"
echo "=============================================="
echo ""

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$PROJECT_DIR"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
  echo -e "${GREEN}✓${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check 1: Required files exist
echo "📋 Checking required files..."
required_files=(
  "Dockerfile"
  ".dockerignore"
  "src/config.ts"
  "src/index.ts"
  "src/indexer.ts"
  "src/server.ts"
  "scripts/prepare-build.js"
  "package.json"
  "tsconfig.json"
  "README.md"
  "DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    success "$file exists"
  else
    error "$file is missing!"
  fi
done
echo ""

# Check 2: package.json scripts
echo "📦 Checking package.json scripts..."
required_scripts=("dev" "build" "build:docker" "start" "docker:build" "docker:run")
for script in "${required_scripts[@]}"; do
  if grep -q "\"$script\":" package.json; then
    success "Script '$script' exists"
  else
    error "Script '$script' is missing in package.json!"
  fi
done
echo ""

# Check 3: Source directory structure
echo "📂 Checking source directory..."
if [ ! -d "../../apps/docs-app/content/docs" ]; then
  warning "Documentation source not found at ../../apps/docs-app/content/docs"
  warning "This is required for development mode"
else
  doc_count=$(find ../../apps/docs-app/content/docs -name "*.mdx" | wc -l | tr -d ' ')
  success "Found $doc_count MDX files in source directory"
fi
echo ""

# Check 4: Test build preparation
echo "🔨 Testing build preparation..."
if [ -d "content" ]; then
  rm -rf content
fi

node scripts/prepare-build.js

if [ -d "content" ]; then
  copied_count=$(find content -name "*.mdx" | wc -l | tr -d ' ')
  if [ "$copied_count" -gt 0 ]; then
    success "Build preparation successful ($copied_count files copied)"
  else
    error "No MDX files were copied!"
  fi
else
  error "Content directory was not created!"
fi
echo ""

# Check 5: TypeScript compilation
echo "🔧 Testing TypeScript compilation..."
if pnpm build > /dev/null 2>&1; then
  if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    success "TypeScript compilation successful"
  else
    error "Compilation succeeded but dist/index.js not found!"
  fi
else
  error "TypeScript compilation failed!"
fi
echo ""

# Check 6: Configuration validation
echo "⚙️  Validating configuration..."
if grep -q "getConfig()" src/config.ts; then
  success "Environment-aware configuration detected"
else
  warning "Config may not be environment-aware"
fi

if grep -q "NODE_ENV" src/config.ts; then
  success "NODE_ENV check present in config"
else
  warning "NODE_ENV not used in config"
fi
echo ""

# Check 7: Docker files
echo "🐳 Checking Docker configuration..."
if grep -q "FROM node:20-alpine" Dockerfile; then
  success "Dockerfile uses Node.js 20"
else
  warning "Dockerfile may not use recommended Node version"
fi

if grep -q "COPY content ./content" Dockerfile; then
  success "Dockerfile copies content directory"
else
  error "Dockerfile doesn't copy content directory!"
fi

if grep -q "NODE_ENV=production" Dockerfile; then
  success "Dockerfile sets production environment"
else
  warning "Dockerfile may not set NODE_ENV"
fi
echo ""

# Check 8: Content gitignore
echo "🙈 Checking gitignore..."
if [ -f "content/.gitignore" ]; then
  success "content/.gitignore exists"
else
  warning "content/.gitignore not found (content will be tracked by git)"
fi

if grep -q "content/" .gitignore; then
  success ".gitignore ignores content directory"
else
  warning ".gitignore may not ignore content directory"
fi
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ Validation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test dev mode:        pnpm dev"
echo "  2. Build Docker image:   pnpm docker:build"
echo "  3. Test container:       pnpm docker:run"
echo "  4. Deploy to ECS:        ./scripts/deploy-ecs.sh"
echo ""
echo "For detailed instructions, see:"
echo "  - README.md for usage"
echo "  - DEPLOYMENT.md for AWS setup"
echo "  - MIGRATION.md for what changed"
