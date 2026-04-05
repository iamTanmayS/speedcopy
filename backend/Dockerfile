# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose Core Service Port
EXPOSE 4000

# Start Application
CMD ["npm", "start"]
