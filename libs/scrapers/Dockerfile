# Multi-stage build for Playwright scrapers
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.1.0

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy all apps and libs
COPY apps ./apps
COPY libs ./libs

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build scrapers library
RUN pnpm nx build scrapers

# Production stage
FROM node:20-alpine

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Playwright to use installed Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install pnpm
RUN npm install -g pnpm@9.1.0

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist/libs/scrapers ./dist
COPY --from=builder /app/node_modules ./node_modules

# Run scrapers
CMD ["node", "dist/main.js"]
