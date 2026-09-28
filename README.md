# Opinionated Recipes

A self-hosted recipe manager for a household that wants every recipe to look the same. Recipes are stored as [Cooklang](https://cooklang.org), and every one, whether typed in, imported from a web page, or migrated from another app, is rewritten into a single house style before it's saved.

**Status:** early. The repo is scaffolded, and a walking skeleton runs end to end (SPA → nginx → API; API → Redis → worker), but there are no recipe features yet. See [`docs/foundation.md`](docs/foundation.md) for why this exists, and `CLAUDE.md` for current state.

---

## Stack

- **Language:** TypeScript on Node.js 24 LTS, run directly via Node's native type stripping (no build step for services). pnpm workspaces monorepo.
- **Recipe format:** Cooklang, parsed by the official `@cooklang/cooklang` parser (cooklang-rs compiled to WASM)
- **API:** Fastify 5, with OpenAPI docs served at `/api/docs`
- **Data:** PostgreSQL 18 + pgvector, via Drizzle ORM. Postgres is the source of truth
- **Background jobs:** Redis 8 + a BullMQ worker
- **Web:** React 19 + Vite 8 + Tailwind CSS 4, served by nginx in its container
- **Optional AI (off by default):** local embeddings via Ollama; chat via the Claude API
- **Deployment:** Docker Compose, with an optional overlay for an existing Traefik
- **Tooling:** Vitest, Playwright, ESLint (type-aware typescript-eslint), Prettier, `tsc`

Every choice above has an ADR in [`docs/ADRs/`](docs/ADRs/).

## Quick Start

### Run it

```bash
cp .env.example .env               # set RECIPES_POSTGRES_PASSWORD at minimum
docker compose up -d --build
```

Then open <http://localhost:8080>.

Behind an existing Traefik (v3), set `RECIPES_DOMAIN` (and, if yours differ, `RECIPES_TRAEFIK_NETWORK` / `RECIPES_TRAEFIK_ENTRYPOINT`) in `.env`, then:

```bash
docker compose -f compose.yaml -f compose.traefik.yaml up -d --build
```

Every feature has an on/off switch with a default. [`.env.example`](.env.example) lists them all.

### Develop

```bash
corepack enable                    # provides the pnpm version pinned in package.json
pnpm install

pnpm test                          # unit tests (Vitest)
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test:e2e                      # Playwright; first run: pnpm exec playwright install chromium
```

To run the apps on your machine with hot reload, publish Postgres and Redis to localhost with a `compose.override.yaml`. It's gitignored, and compose loads it automatically:

```yaml
services:
  postgres: { ports: ['127.0.0.1:5432:5432'] }
  redis: { ports: ['127.0.0.1:6379:6379'] }
```

Then set `RECIPES_DATABASE_URL` in `.env` to match your Postgres password, and run:

```bash
docker compose up -d postgres redis
pnpm dev:api                       # http://localhost:3000/api/docs
pnpm dev:worker
pnpm dev:web                       # http://localhost:5173, proxies /api to the API
```

The `dev:*` scripts read `.env` from the repo root.

## Project Structure

```
apps/
  api/            Fastify REST API under /api
  worker/         BullMQ worker: imports, normalization, embeddings
  web/            React + Vite SPA; nginx serves it and proxies /api
packages/
  engine/         Cooklang parse + house style. Pure, no I/O
  config/         RECIPES_* env loader and every feature switch
  db/             Drizzle schema, migrations, Postgres + pgvector client
e2e/              Playwright specs against the production SPA build
docs/             All project documentation
scripts/          Dev-time checks and utilities (not shipped)
.claude/          Claude Code commands and skills
compose.yaml      The full stack (compose.traefik.yaml overlays Traefik)
```

For the founding brief, see `docs/foundation.md`.
For architecture decisions, see `docs/ADRs/`.
For technical specs, including the house style, see `docs/specs/`.
For SOPs and runbooks, see `docs/SOPs/`.

`.template-version` records which release of the upstream project-template repo this was scaffolded from; `/sync-from-template` reads it to pull tooling updates.

## License

[MIT](LICENSE)
