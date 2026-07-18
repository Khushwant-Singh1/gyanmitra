FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy client and frontend-server sources so we can build both
COPY client ./client
COPY frontend-server/package.json frontend-server/pnpm-lock.yaml ./
COPY frontend-server/tsconfig.json frontend-server/ ./frontend-server/
COPY frontend-server/src ./frontend-server/src

# Build client
RUN cd client && pnpm install --frozen-lockfile && pnpm run build

# Build frontend-server
RUN cd frontend-server && pnpm install --frozen-lockfile && pnpm run build

FROM node:22-alpine
WORKDIR /app

# Copy built server and client assets
COPY --from=builder /app/frontend-server/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
