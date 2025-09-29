# Unified Next.js AI Nail Art Generator
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm install

# Copy all source code
COPY backend/ ./

# Build the unified Next.js application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["npm", "start"]