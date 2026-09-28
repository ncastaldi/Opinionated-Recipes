# ADR-004: Fastify for the API, Drizzle for data access

**Status:** Accepted
**Date:** 2026-09-28

## Context

The API needs request validation, generated API documentation, and a clean way to switch whole features on and off by configuration (ADR-007). The data layer needs typed queries, migrations, and pgvector support (ADR-010).

## Decision

- **Fastify 5** for `apps/api`. Routes declare JSON schemas that both validate requests and generate an OpenAPI 3 document, served at `/api/docs` behind `RECIPES_FEATURE_API_DOCS`. Features are Fastify plugins registered in `buildApp()` only when their switch is on.
- **Drizzle ORM** with the `postgres` (postgres.js) driver for `packages/db`. drizzle-kit generates SQL migrations, and `casing: 'snake_case'` maps snake_case tables and columns to camelCase TypeScript.

## Alternatives considered

- **Hono:** very light and built on web standards, but a thinner plugin ecosystem.
- **NestJS:** lots of structure, but heavy with decorators and ceremony for a household-scale app.
- **Express:** familiar, but dated for new TypeScript work.
- **Prisma / Kysely** instead of Drizzle: Prisma adds a schema language and a generated client; Kysely is excellent but leaves migrations to you. Drizzle keeps both schema and migrations in TypeScript and SQL.

## Consequences

- `buildApp(config)` never listens, so tests drive a real app with `inject()`, with no mocks of the framework.
- A disabled feature's routes don't exist (404), rather than half-existing behind runtime checks.
- Migrations are generated SQL files committed in `packages/db/migrations/`, and they only move forward.
