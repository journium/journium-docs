#!/bin/bash
set -e

echo "📦 Preparing docs-mcp for containerized build..."

# Get the script directory (apps/docs-mcp/scripts)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_ROOT="$(dirname "$(dirname "$PROJECT_DIR")")"

echo "📂 Project directory: $PROJECT_DIR"
echo "📂 Workspace root: $WORKSPACE_ROOT"

# Create content directory in docs-mcp
CONTENT_DIR="$PROJECT_DIR/content"
echo "🗂️  Creating content directory: $CONTENT_DIR"
rm -rf "$CONTENT_DIR"
mkdir -p "$CONTENT_DIR"

# Copy MDX files from docs-app
DOCS_SOURCE="$WORKSPACE_ROOT/apps/docs-app/content/docs"
echo "📋 Copying MDX files from: $DOCS_SOURCE"

if [ ! -d "$DOCS_SOURCE" ]; then
  echo "❌ Error: Source docs directory not found at $DOCS_SOURCE"
  exit 1
fi

# Copy all MDX files preserving directory structure
cp -r "$DOCS_SOURCE"/* "$CONTENT_DIR/"

# Count files
FILE_COUNT=$(find "$CONTENT_DIR" -name "*.mdx" | wc -l | tr -d ' ')
echo "✅ Copied $FILE_COUNT MDX files to content directory"

echo "✨ Build preparation complete!"
