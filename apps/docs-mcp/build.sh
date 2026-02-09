#!/bin/bash
# Build script for docs-mcp - run from monorepo root
# Usage: ./apps/docs-mcp/build.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$WORKSPACE_ROOT"

echo "🏗️  Building Journium Docs MCP Server"
echo "   Workspace: $WORKSPACE_ROOT"
echo ""

# Step 1: Prepare content
echo "📦 Step 1/2: Preparing content..."
node apps/docs-mcp/scripts/prepare-build.js

# Step 2: Build Docker image (TypeScript build happens inside Docker)
echo "🐳 Step 2/2: Building Docker image..."
docker build -f apps/docs-mcp/Dockerfile -t journium-docs-mcp .

echo ""
echo "✅ Build complete!"
echo "   Image: journium-docs-mcp:latest"
echo ""
echo "To run: docker run --rm -p 3100:3100 journium-docs-mcp"
