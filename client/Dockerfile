FROM node:22-alpine as builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy client sources
COPY client/package.json client/pnpm-lock.yaml ./
COPY client/ .

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
