# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (usb, node-hid)
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

ENV VITE_TREASURY_WALLET=$VITE_TREASURY_WALLET
ENV VITE_303_TOKEN_MINT=$VITE_303_TOKEN_MINT

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
# CMD ["nginx", "-g", "daemon off;"]

# Create an entrypoint script to generate .env file at runtime
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]