FROM node:22-bullseye-slim as builder
WORKDIR /app

# Install system build tools required by native modules (bcrypt, etc.)
RUN apt-get update && \
    apt-get install -y python3 build-essential make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first for caching
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml* ./

# Configure network retries and install dependencies
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-mintimeout 20000 && pnpm install --frozen-lockfile --unsafe-perm

# Copy source files after installing dependencies
COPY server/tsconfig.json ./
COPY server/src ./src

RUN pnpm run build

FROM node:22-bullseye-slim
WORKDIR /app

# Copy built artifacts and node_modules from builder to avoid re-running installs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY server/package.json ./package.json

EXPOSE 8000
CMD ["node", "dist/index.js"]

