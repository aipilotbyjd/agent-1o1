# ==========================================
# Stage 1: Build stage
# ==========================================
FROM node:20-alpine AS builder

# Set workspace directory
WORKDIR /app

# Enable Corepack to use Yarn 4
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy dependency manifests
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies using frozen-lockfile/immutable mode
RUN yarn install --immutable

# Copy source code and config files
COPY . .

# Set build-time environment arguments (Vite embeds VITE_* variables at build time)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-https://api-dev.agent1o1.com/api/v1}

# Build the application
RUN yarn build

# ==========================================
# Stage 2: Serve stage (Production Ready, Lightweight, Secure)
# ==========================================
# nginx-unprivileged runs as non-root user (UID 101) by default, protecting against host privileges escalation.
FROM nginxinc/nginx-unprivileged:1.25-alpine

# Copy custom Nginx configuration for Vite/React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from builder stage to Nginx public folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port (Nginx unprivileged runs on port 8080 by default)
EXPOSE 8080

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
