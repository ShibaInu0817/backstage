# Stage 1: Build Backstage
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Enable Corepack (for Yarn v4)
RUN corepack enable
ENV NODE_OPTIONS="--no-node-snapshot"
ENV PYTHON=/usr/bin/python3

# Install native build dependencies required by some Backstage packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 g++ build-essential libsqlite3-dev git \
    && rm -rf /var/lib/apt/lists/*

# Copy the full workspace so that workspaces are available during install
COPY . .

# Change to backstage directory for all subsequent operations
WORKDIR /app/backstage

# Install deps and build backend bundle
RUN yarn install --immutable
RUN yarn tsc
RUN yarn build:backend

# Stage 2: Run Backstage backend
FROM node:20-bullseye-slim

WORKDIR /app
RUN corepack enable
ENV NODE_OPTIONS="--no-node-snapshot"
ENV PYTHON=/usr/bin/python3

# Install native build dependencies needed for production install
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 g++ build-essential libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace files required by Yarn and Backstage
COPY --from=builder /app/backstage/.yarn ./.yarn
COPY --from=builder /app/backstage/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/backstage/backstage.json ./backstage.json
COPY --from=builder /app/backstage/package.json ./package.json
COPY --from=builder /app/backstage/yarn.lock ./yarn.lock

# Prepare production workspace from skeleton
COPY --from=builder /app/backstage/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz
RUN yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

# Copy configs and backend bundle
COPY --from=builder /app/backstage/app-config*.yaml ./
COPY --from=builder /app/backstage/packages/backend/dist/bundle.tar.gz ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

EXPOSE 7007
CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
