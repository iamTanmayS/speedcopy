# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN ls -la && npm install

# Copy all files from the backend directory and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Use production env for performance
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json ./
RUN ls -la && npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Security: Run as non-privileged user
USER node

# Expose Service Port
EXPOSE 4000

# Start Application
CMD ["node", "dist/server.js"]
