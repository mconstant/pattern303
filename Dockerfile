# Build stage
FROM node:20-alpine AS builder

# Accept build arguments for environment variables
ARG VITE_TREASURY_WALLET
ARG VITE_303_TOKEN_MINT
ARG VITE_COLLECTION_ADDRESS
ARG VITE_SOLANA_NETWORK
ARG VITE_HELIUS_API_KEY

# Install build dependencies for native modules (usb, node-hid)
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_TREASURY_WALLET=$VITE_TREASURY_WALLET
ENV VITE_303_TOKEN_MINT=$VITE_303_TOKEN_MINT
ENV VITE_COLLECTION_ADDRESS=$VITE_COLLECTION_ADDRESS

# Build the application (Vite will use env vars)
RUN npm run build

# Production stage - Multi-service container
FROM node:20-alpine

# Install nginx for frontend
RUN apk add --no-cache nginx

# Setup backend service
WORKDIR /app/server
COPY server/package.json ./
RUN npm ci --production

COPY server/index.js ./

# Setup frontend
WORKDIR /app
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx' >> /start.sh && \
    echo 'cd /app/server && node index.js' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 3001

# Start both services
CMD ["/start.sh"]