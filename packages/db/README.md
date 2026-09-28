# packages/db

The Drizzle schema, migrations, and connection factory for Postgres with the pgvector extension.

Postgres is the **source of truth**. The canonical Cooklang text of each recipe lives here, and it's authoritative. Everything else in the database (parsed ingredients and tags, embeddings, search indexes) is derived from that text and must be rebuildable from it. See [ADR-002](../../docs/ADRs/ADR-002-postgres-source-of-truth.md).

## What belongs here

- Table definitions in `src/schema.ts`, using Drizzle's `pg-core` builders
- Generated SQL migrations in `migrations/` (created by `pnpm --filter @opinionated-recipes/db db:generate`). Commit them
- `createDatabase()`, the one way a service opens a connection pool
- Query helpers that more than one app needs, once they exist

## What does not belong here

- Recipe formatting or validation. That's the engine's job, and it runs *before* anything reaches a write here
- Reading `process.env`. The connection string comes from `@opinionated-recipes/config`, including in `drizzle.config.ts`
- Seed data containing real family recipes (the repo goes public)

## Conventions

- Tables and columns are `snake_case` and plural (`recipes`, `recipe_revisions`). Drizzle's `casing: 'snake_case'` maps them to camelCase in TypeScript, so write the TypeScript names in camelCase.
- A derived table must be rebuildable by a job that reads only the canonical text. If it can't be rebuilt, it's source data and needs an ADR.
- Embedding columns use pgvector (`vector(n)`). The dimension is fixed by the embedding model, so changing models means a migration plus a re-embed job.
- Migrations only move forward. Never edit one that has been merged; add a new one.
