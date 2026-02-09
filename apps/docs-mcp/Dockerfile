# Multi-stage build for Journium Documentation MCP Server
# Run from monorepo root: docker build -f apps/docs-mcp/Dockerfile -t journium-docs-mcp .

FROM node:20-alpine AS builder

WORKDIR /app

# Copy docs-mcp directory (includes src, package.json, tsconfig.json, content, dist if exists)
COPY apps/docs-mcp ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Build TypeScript
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package file
COPY apps/docs-mcp/package.json ./

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy content
COPY --from=builder /app/content ./content

# Production environment
ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3100/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

CMD ["node", "dist/index.js"]
