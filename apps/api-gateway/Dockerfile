# Stage 1: Build api-gateway
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy root package.json and lock file (so nx is available)
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY angular.json ./
COPY workspace.json ./

# Copy all source (needed for Nx build graph)
COPY . .

# Install deps (workspace-wide)
RUN npm install

# Run Nx build for api-gateway using npx
RUN npx nx build @boilerplate/api-gateway --configuration=production

# Stage 2: Run api-gateway
FROM node:20-bullseye-slim

WORKDIR /app

# Copy built dist from builder
COPY --from=builder /app/dist/apps/api-gateway ./dist

# Copy only package.json (dist may have its own pruned package.json if using Nx prune)
COPY --from=builder /app/apps/api-gateway/package.json ./package.json

# Install only production deps
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
