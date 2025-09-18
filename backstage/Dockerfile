# Stage 1: Build Backstage
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy only package files first (for caching)
COPY package.json package-lock.json ./

# Install deps
RUN npm ci --omit=dev

# Copy all Backstage source code
COPY . .

# Build Backstage
RUN npm run build

# Stage 2: Run Backstage
FROM node:18-bullseye-slim

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app ./

EXPOSE 7007

CMD ["node", "packages/backend", "--config", "app-config.yaml"]
