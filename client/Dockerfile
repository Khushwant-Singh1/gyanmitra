FROM node:22-alpine as builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfiles first for optimal caching
COPY client/package.json client/pnpm-lock.yaml ./

# Configure pnpm network retries
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-mintimeout 20000 && pnpm install --frozen-lockfile

# Copy source files after installing dependencies
COPY client/ .

RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

