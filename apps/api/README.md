# apps/api

The Fastify REST API. It's the only way into the system for the SPA and anything else. Every route lives under `/api`, and when `RECIPES_FEATURE_API_DOCS` is on, the OpenAPI document and interactive docs are served at `/api/docs`.

It runs as TypeScript directly on Node 24 (native type stripping), with no build step: `pnpm dev:api` from the repo root, or `node src/server.ts`.

## What belongs here

- Route plugins in `src/routes/`, one file per resource or route group, each with request and response schemas (they generate the OpenAPI docs and validate input)
- Auth: OIDC login plus the fallback-password session, and the hook that guards every recipe route
- Request-time orchestration: validate input, run it through the engine, write through `@opinionated-recipes/db`, enqueue slow work for the worker
- Feature registration in `buildApp()`, where each feature's routes are registered only when its `config.features` switch is on

## What does not belong here

- Cooklang parsing, house-style rules, or serialization. Call `@opinionated-recipes/engine`
- Slow or retryable work, such as fetching an import URL, embedding, or bulk re-normalizing. Enqueue it for `apps/worker`
- Reading `process.env`. Take the `Config` passed into `buildApp()`
- Serving the SPA. `apps/web`'s container does that and proxies `/api` here

## Conventions

- `buildApp(config)` never listens; `server.ts` is the only file that binds a port. Tests use `app.inject()` against a real app built from `loadConfig({...})`, never mocks of Fastify.
- Every recipe write goes through the engine's formatter, and a parse that isn't clean is rejected, not stored.
- A disabled feature's routes aren't registered at all, so they 404. Nothing half-works behind a runtime check.
- Relative imports carry the `.ts` extension (Node runs the source directly).
