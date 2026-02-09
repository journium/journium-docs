# Multi-stage build for Journium Documentation MCP Server

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy documentation content (this will be populated during build)
# The build script will copy MDX files here before Docker build
COPY content ./content

# Set production environment
ENV NODE_ENV=production
ENV PORT=3100

# Expose port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3100/health').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# Run the server
CMD ["node", "dist/index.js"]
