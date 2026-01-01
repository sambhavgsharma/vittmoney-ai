# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app/client

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy .next folder from builder
COPY --from=builder --chown=nodejs:nodejs /app/client/.next ./.next

# Copy public folder if it exists
COPY --chown=nodejs:nodejs public ./public

# Change to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js application
CMD ["npm", "start"]
