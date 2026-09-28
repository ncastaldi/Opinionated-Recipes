# CLAUDE.md

This file is the primary context document for Claude (and other LLM assistants) working in this repository. Keep it current: the best time to update it is at the end of a working session (`/session-end`, `/docs-updater`).

---

## Project identity

**Opinionated Recipes** is a self-hostable service to store, retrieve, and manage kitchen recipes. It's built first for the maintainer and their family, and the repo goes public once it's stable.

Its reason to exist: every recipe, whether typed in, imported from a web page, or migrated from another app, is rewritten into **one rigid, Cooklang-based house style**, so the whole collection is structured and formatted identically. Existing recipe managers don't govern structure; this one does. Read [`docs/foundation.md`](docs/foundation.md) for the full why.

## Stack

- **Runtime:** Node.js 24 LTS, running TypeScript directly via native type stripping (no build step for Node code)
- **Language:** TypeScript 6.0.x (held below 7 until typescript-eslint supports it)
- **Monorepo:** pnpm 12 workspaces (`packageManager` pinned in `package.json`; use `corepack enable`)
- **Recipe format:** Cooklang, parsed only by the official `@cooklang/cooklang` (cooklang-rs via WASM)
- **API:** Fastify 5, with `@fastify/swagger` + `@fastify/swagger-ui` serving OpenAPI at `/api/docs`
- **Database:** PostgreSQL 18 + pgvector (`pgvector/pgvector:pg18` image), Drizzle ORM + drizzle-kit, `postgres` (postgres.js) driver
- **Jobs:** Redis 8 + BullMQ 6 (with `ioredis` 6)
- **Config:** zod 4 schema in `packages/config`
- **Frontend:** React 19, Vite 8, Tailwind CSS 4. TanStack Router and Query are planned, not yet installed
- **AI (optional, off by default):** Ollama for embeddings; Claude API for chat
- **Deploy:** Docker Compose; unprivileged nginx serves the SPA; optional Traefik v3 overlay
- **Tests:** Vitest 5 (unit and route-level), Playwright (end-to-end against the production SPA build)
- **Lint/format:** ESLint 10 flat config + typescript-eslint `strictTypeChecked`, react-hooks, react-refresh; Prettier 3; `tsc --noEmit`

## Architecture

```
apps/
  api/        Fastify REST API. Every route under /api; buildApp(config) never listens, server.ts does
  worker/     BullMQ consumer of the `recipes` queue: imports, re-normalizing, embeddings
  web/        React SPA; in its container nginx serves the build and proxies /api to the api service
packages/
  engine/     Cooklang parse + house style (lint, format, serialize). Pure functions, no I/O
  config/     The only reader of process.env: every RECIPES_* setting and feature switch, with defaults
  db/         Drizzle schema, migrations, createDatabase()
e2e/          Playwright specs
compose.yaml  web, api, worker, postgres, redis (+ ollama behind a profile); compose.traefik.yaml overlays Traefik
```

**How the pieces connect.** The browser only ever talks to `web` (nginx), which serves the SPA and proxies `/api` to `api`, so there's one origin and no CORS. The API writes to Postgres and enqueues slow work in Redis; the worker consumes it. Ollama (embeddings) and the Claude API (chat) are reached only by the API and worker, and only when their switches are on.

**A recipe write** (target design, not built yet): input text → engine parses with the official parser → a parse that isn't clean is rejected → formatter applies the house style → blocking violations are rejected → canonical text, derived rows, and a revision are written in **one transaction** → follow-up jobs are enqueued (e.g. embed, when RAG is on). A URL import goes API → queue → worker fetches → the same engine path.

**Patterns enforced:**
- The **engine is pure**: no database, HTTP, queue, filesystem or clock. Callers fetch, the engine transforms.
- **Only `packages/config` reads the environment.** Everything else receives a typed `Config`.
- **Features are registered only when switched on.** Their routes 404 and their job handlers are absent otherwise.
- **Derived data must be rebuildable from canonical text.** Anything that can't be rebuilt is source data and needs an ADR.
- **One queue, job names separate the work, and a job with no handler fails.** Handlers are idempotent.
- Workspace packages export `src/index.ts` and are run in place. They must never be copied *into* `node_modules` (e.g. `pnpm deploy`), because Node won't strip types there.

## Constraints (non-negotiable)

1. **Postgres is the only source of truth.** Each recipe's canonical Cooklang text in Postgres is authoritative. Parsed data, embeddings, search indexes and anything in Redis are derived, and must be rebuildable from that text alone.
2. **Nothing non-conforming gets stored.** Every recipe, created, edited, imported, or proposed by chat, passes through the engine's house-style formatter before it's written. A parse that isn't clean (non-empty parser report) is rejected. No "raw" recipes sit alongside normalized ones.
3. **Every feature has an env-var switch with a sensible default.** Each is `RECIPES_FEATURE_<NAME>`, declared in `packages/config` and listed in `.env.example`. Nothing is hard-wired on. Every setting uses the `RECIPES_` prefix.
4. **Nothing personal ships in the repo.** No homelab hostnames, domains, IPs, credentials, or family recipes. The repo will be public. Everything is generic defaults plus `.env` or `compose.override.yaml` (both gitignored).
5. **The core works fully offline.** The Claude API is the only external service dependency; it's opt-in and off by default. Embeddings are computed locally by Ollama.
6. **Recipe content leaves the host only through an explicit, user-initiated action,** such as using chat or sharing or exporting a recipe. Nothing is sent automatically or in the background. Keep a share/export seam in the API and data model so sharing can be added later without restructuring.
7. **The fallback password is only a stopgap.** `RECIPES_AUTH_PASSWORD` works only while OIDC isn't configured, and is dropped entirely once it is. No local user accounts with passwords.
8. **Parse with the official Cooklang parser only.** Never a hand-rolled or third-party parser.
9. **Never commit `.env` or any file containing secrets.** No secret gets a default value.

## Session Config

<!--
The single source of truth for values the commands in .claude/commands/ and the
skills in .claude/skills/ need. They are read from here rather than repeated per
file, so a changed test command is a one-line edit.
-->

| Value | Setting |
|---|---|
| `TEST_COMMAND` | `pnpm test` |
| `LINT_COMMAND` | `pnpm lint && pnpm format:check && pnpm typecheck` |
| `SRC_ROOT` | `apps/ packages/` |
| `DOCS_ROOT` | docs/ |
| `ADR_PATH` | docs/ADRs/ |
| `SNAPSHOT_PATH` | docs/session-history/ |
| `ROADMAP_PATH` | docs/plans/ROADMAP.md |

End-to-end tests are separate: `pnpm test:e2e` (Playwright; builds the SPA first). Container changes: `docker compose build`.

## Code style

- **Naming:** `camelCase` for values and functions; `PascalCase` for types and React components; `kebab-case` file names (`app.tsx` exports `App`); Postgres tables and columns in `snake_case`, plural tables (`recipes`, `recipe_revisions`), mapped to camelCase by Drizzle; env vars `RECIPES_<AREA>_<SETTING>` and `RECIPES_FEATURE_<NAME>`.
- **TypeScript:** strict, with `noUncheckedIndexedAccess`. Relative imports carry the `.ts` extension. Type-only imports use `import type` (`verbatimModuleSyntax`). **No enums, namespaces, or constructor parameter properties** (`erasableSyntaxOnly`), because Node strips types and can't compile them.
- **Formatting:** Prettier, single quotes, 100 columns. YAML uses double quotes (the repo's doc-claims check expects them in `dependabot.yml`). Markdown isn't auto-formatted.
- **Errors:** fail loudly and specifically. Config problems throw one `ConfigError` listing every issue; an unknown job name fails the job; nothing is a silent no-op.
- **Logging:** the API uses Fastify's pino logger (`app.log`, `request.log`) at `RECIPES_LOG_LEVEL`. The worker logs with `console` for now.
- **Tests:** colocated as `*.test.ts`, following `.claude/skills/testing-standards/`. Build real apps from `loadConfig({...})` and drive them with `app.inject()`. Never mock the framework. Every setting needs a test proving it changes behavior.
- **Commits:** Conventional Commits, scoped by folder (`feat(engine): …`).
- **Packages:** `@opinionated-recipes/<folder>`; dependencies point one way (apps → packages; `engine` and `config` depend on nothing internal).

## Current state

### Done

- Repo scaffolded from template via `init-project`; `docs/foundation.md` and `CLAUDE.md` written; inherited docs re-pointed at this project; ADR-001 to ADR-012 recorded.
- Walking skeleton, verified locally:
  - `packages/config` (full env schema, auth-mode selection, chat validation; tested)
  - `packages/engine` (`parseRecipe()` wrapping the official parser, surfacing its lenient warnings as `clean: false`; tested)
  - `packages/db` (Drizzle config and client, empty schema)
  - `apps/api` (`/api/healthz`, OpenAPI at `/api/docs` behind its switch; tested)
  - `apps/worker` (job dispatcher with a `ping` handler; unknown jobs fail; tested)
  - `apps/web` (app shell; Playwright smoke test)
- Container stack verified end to end: all three images build; compose comes up healthy; the SPA and `/api` are served through nginx; a job round-trips through Redis to the worker; the Traefik overlay produces the expected labels.
- CI (`.github/workflows/ci.yml`) written but **not yet run on GitHub**.

### In progress

- Nothing.

### Not started

- **Decide the house-style rules** in `docs/specs/spec-house-style.md` (Draft). This blocks the formatter.
- First data model: `recipes` (canonical text) and `recipe_revisions`, the first migration, enabling the `vector` extension, and deciding who runs migrations in compose.
- Engine: linter, formatter, and serializer implementing the spec, likely built on the parser's `parse_ast`/`parse_events`.
- Recipe CRUD routes, plus a readiness check that covers Postgres and Redis.
- Auth: OIDC login and the fallback-password session; refuse recipe routes while auth mode is `unconfigured`.
- `.cook` file import and export; URL import (worker); other apps' exports.
- SPA: recipe list, view and editor (adds TanStack Router and Query).
- Embeddings and semantic search (`RECIPES_FEATURE_RAG`), then the chat page (`RECIPES_FEATURE_CHAT`).
- Sharing UX (`RECIPES_FEATURE_SHARE`).
- Later, per the maintainer: notifications, recipe photos, search ranking, conformance scoring, recommendations. Run `/roadmap init` to turn these into `docs/plans/ROADMAP.md`.

## Open questions

1. **House-style rules:** required metadata, step structure, label and ingredient placement, units and fractions, layout. See the question list in `docs/specs/spec-house-style.md`.
2. **Ollama models:** which embedding model (and any local chat model) suits the maintainer's hardware. `nomic-embed-text` is only a placeholder default.
3. **Flipt:** adopt for runtime feature flags, or stay with env vars? Deferred behind the `FeatureFlags` shape (ADR-007).
4. **Migrations in production:** does the API run them at startup, or a one-shot `migrate` compose service?
5. **Image publishing:** publish images to GHCR once the repo is public, or keep build-from-source only?
6. **Formatter UX:** are auto-fixes shown as a diff before saving, and are existing recipes re-normalized automatically when a rule changes?
7. **TypeScript 7:** upgrade once typescript-eslint supports it.

## Decision log

- [ADR-001: Cooklang house style](docs/ADRs/ADR-001-cooklang-house-style.md): Cooklang is the format; the official parser only; an opinionated house-style layer; nothing non-conforming stored
- [ADR-002: Postgres as source of truth](docs/ADRs/ADR-002-postgres-source-of-truth.md): canonical Cooklang text lives in Postgres; everything else is derived; `.cook` import and export
- [ADR-003: TypeScript on Node 24 monorepo](docs/ADRs/ADR-003-typescript-node24-monorepo.md): TypeScript everywhere, pnpm workspaces, native type stripping, TypeScript 6.0.x
- [ADR-004: Fastify and Drizzle](docs/ADRs/ADR-004-fastify-drizzle.md): schema-validated routes with generated OpenAPI; Drizzle for typed SQL and migrations
- [ADR-005: React + Vite SPA](docs/ADRs/ADR-005-react-vite-spa.md): a separate SPA service; nginx serves it and proxies `/api`
- [ADR-006: Docker Compose and Traefik](docs/ADRs/ADR-006-docker-compose-traefik.md): the whole stack in compose; a generic Traefik overlay; the Postgres password is required
- [ADR-007: Env-var feature switches](docs/ADRs/ADR-007-env-var-feature-switches.md): the `RECIPES_` prefix; one config package; Flipt deferred
- [ADR-008: OIDC with password fallback](docs/ADRs/ADR-008-oidc-with-password-fallback.md): OIDC wins; the fallback password is dropped once OIDC is configured
- [ADR-009: Redis and BullMQ jobs](docs/ADRs/ADR-009-redis-bullmq-jobs.md): a separate worker; one queue; unknown jobs fail; idempotent handlers
- [ADR-010: pgvector and Ollama embeddings](docs/ADRs/ADR-010-pgvector-ollama-embeddings.md): local embeddings in Postgres, behind `RECIPES_FEATURE_RAG`
- [ADR-011: Claude chat and data egress](docs/ADRs/ADR-011-claude-chat-and-data-egress.md): chat is opt-in; content leaves only on user action; a share seam
- [ADR-012: Test and lint tooling](docs/ADRs/ADR-012-test-and-lint-tooling.md): Vitest, Playwright against the production build, type-aware ESLint, Prettier, `tsc`

---

*Last updated: 2026-09-28 | Session: init-project (interview, scaffold, walking skeleton, docs re-pointed)*
