FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files first for optimal layer caching
COPY client/package.json client/pnpm-lock.yaml ./client/
COPY frontend-server/package.json frontend-server/pnpm-lock.yaml ./frontend-server/

# Configure pnpm network retries to prevent registry download timeouts
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-mintimeout 20000

# Install client and frontend-server dependencies
RUN cd client && pnpm install --frozen-lockfile
RUN cd frontend-server && pnpm install --frozen-lockfile

# Copy full source files
COPY client ./client
COPY frontend-server/tsconfig.json frontend-server/ ./frontend-server/
COPY frontend-server/src ./frontend-server/src

# Build client and frontend-server
RUN cd client && pnpm run build
RUN cd frontend-server && pnpm run build

FROM node:22-alpine
WORKDIR /app

# Copy built server, client assets, and package info to install production dependencies
COPY --from=builder /app/frontend-server/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY frontend-server/package.json frontend-server/pnpm-lock.yaml ./

# Install corepack & pnpm to set up production dependencies
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-mintimeout 20000 && pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]

