# ================================
# Auth Server Dockerfile
# ================================
# Multi-stage build for production
# ================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY packages/auth-server/package*.json ./packages/auth-server/
COPY packages/shared*/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=@spine/auth-server

# Copy source code
COPY packages/auth-server ./packages/auth-server
COPY packages/shared* ./packages/
COPY tsconfig.json ./

# Build the application
WORKDIR /app/packages/auth-server
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install production dependencies only
COPY package*.json ./
COPY packages/auth-server/package*.json ./packages/auth-server/

RUN npm ci --workspace=@spine/auth-server --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/packages/auth-server/dist ./packages/auth-server/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared* ./packages/

# Copy configuration files
COPY --chown=nodejs:nodejs packages/auth-server/.env.example ./packages/auth-server/.env.example

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Start the application
WORKDIR /app/packages/auth-server
CMD ["node", "dist/index.js"]
