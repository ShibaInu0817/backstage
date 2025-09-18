# Stage 1: Build Backstage
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy root files (monorepo deps)
COPY package.json yarn.lock ./

# Copy monorepo code (important for workspace deps)
COPY . .

# Move into backstage app
WORKDIR /app/apps/backstage

# Install dependencies and build
RUN yarn install --frozen-lockfile --ignore-engines
RUN yarn tsc && yarn build

# Stage 2: Run Backstage
FROM node:18-bullseye-slim

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/apps/backstage ./

EXPOSE 7007
CMD ["node", "packages/backend", "--config", "app-config.yaml"]
