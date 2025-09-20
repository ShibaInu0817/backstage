# Stage 1: Build API Gateway (NestJS with Nx)
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy root files Nx needs
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy all source (apps + libs)
COPY . .

# Install dependencies
RUN npm install

# Run Nx build for api-gateway
RUN npx nx build @boilerplate/api-gateway --configuration=production

# Stage 2: Run API Gateway
FROM node:20-bullseye-slim

WORKDIR /app

# Copy built dist from builder (Nx outputs to apps/api-gateway/dist)
COPY --from=builder /app/apps/api-gateway/dist ./dist

# Install production dependencies inside the dist directory using the generated package.json
WORKDIR /app/dist
RUN npm install --omit=dev --no-audit --no-fund

EXPOSE 3000
CMD ["node", "main.js"]
