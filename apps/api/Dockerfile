# syntax=docker/dockerfile:1
# Build from the repo root: docker build -f apps/api/Dockerfile .
#
# No compile step: Node 24 runs the TypeScript source directly. The image is
# the workspace's production dependencies plus source.

FROM node:26-slim AS deps
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# The pnpm store lives in a build cache mount, never in an image layer.
# Dependencies are fetched keyed on the lockfile alone, so a source change does
# not re-download them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    corepack install && pnpm fetch --prod --store-dir /pnpm/store

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --prod --frozen-lockfile --store-dir /pnpm/store \
      --filter "@opinionated-recipes/api..."

FROM node:26-slim
WORKDIR /app
COPY --from=deps /app /app
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "apps/api/src/server.ts"]
