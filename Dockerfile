# File: Dockerfile
# Purpose: Local development container running the Vite dev server.
# Author: Akilesh S
# Date: 2026-10-20
FROM node:22.12.0-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.34.7 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./

EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
