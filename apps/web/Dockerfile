# syntax=docker/dockerfile:1
# Build from the repo root: docker build -f apps/web/Dockerfile .

FROM node:26-slim AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    corepack install && pnpm fetch --store-dir /pnpm/store

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --store-dir /pnpm/store \
      --filter "@opinionated-recipes/web..." \
 && pnpm --filter @opinionated-recipes/web run build

# Unprivileged nginx: runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine
# The official image renders /etc/nginx/templates/*.template with envsubst at
# startup, so the API upstream port comes from RECIPES_API_PORT.
ENV RECIPES_API_PORT=3000
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
