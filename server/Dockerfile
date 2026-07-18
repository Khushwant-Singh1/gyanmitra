FROM node:22-bullseye-slim as builder
WORKDIR /app

# Install system build tools required by native modules (bcrypt, etc.)
RUN apt-get update && \
    apt-get install -y python3 build-essential make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy sources and install
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./
COPY server/tsconfig.json ./
COPY server/src ./src

# Allow native build scripts to run and install dependencies
RUN pnpm install --frozen-lockfile --unsafe-perm
RUN pnpm run build

FROM node:22-bullseye-slim
WORKDIR /app

# Copy built artifacts and node_modules from builder to avoid re-running installs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY server/package.json ./package.json

EXPOSE 8000
CMD ["node", "dist/index.js"]
