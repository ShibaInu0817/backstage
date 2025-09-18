# Stage 1: Build Backstage backend
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install deps (Yarn v4)
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build only backend (includes frontend assets)
RUN yarn build:backend

# Stage 2: Run Backstage backend
FROM node:18-bullseye-slim

WORKDIR /app

# Copy built backend
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Install backend runtime deps only
RUN yarn workspaces focus --production backend

EXPOSE 7007

CMD ["node", "packages/backend", "--config", "app-config.yaml"]
