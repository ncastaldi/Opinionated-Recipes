# Architecture Decision Records (ADRs)

This folder contains Architecture Decision Records for the project. Each ADR documents a significant technical or structural decision — what was decided, why, what was ruled out, and what the consequences are.

ADRs are written when a decision is made and updated if circumstances change. They are not deleted — superseded decisions are marked as such and kept for historical context.

## What belongs here

- Technology choices (language, framework, database, external APIs)
- Structural patterns (adapter pattern, repository pattern, module boundaries)
- Constraint decisions (no scraping, BYOK model, CLI-only scope)
- Anything where future-you (or a new collaborator) would ask "why did we do it this way?"

## What does not belong here

- Implementation details (those go in docs/specs/)
- Project timelines or milestones (those go in docs/plans/)
- Runbooks or procedures (those go in docs/SOPs/)

## Naming convention

`ADR-NNN-short-description.md` — e.g. `ADR-001-database-choice.md`

## Status values

| Status | Meaning |
|--------|---------|
| Accepted | In effect, follow this decision |
| Draft | Under discussion, not yet binding |
| Deprecated | No longer relevant but kept for history |
| Superseded | Replaced by a later ADR — link provided |

## Index

Every ADR file in this folder gets a row here — this table, plus `CLAUDE.md`'s `## Decision log`, is how a reader finds the right file without opening each one. Keep it in sync: add a row the moment a new ADR is written, and update the Status column the moment one changes. `CLAUDE.md` should never host a decision's actual content — only a link into this table.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](ADR-001-cooklang-house-style.md) | Cooklang as the canonical format, with an opinionated house-style layer | Accepted |
| [ADR-002](ADR-002-postgres-source-of-truth.md) | Postgres is the source of truth for canonical recipe text | Accepted |
| [ADR-003](ADR-003-typescript-node24-monorepo.md) | TypeScript on Node 24 LTS, in a pnpm workspaces monorepo | Accepted |
| [ADR-004](ADR-004-fastify-drizzle.md) | Fastify for the API, Drizzle for data access | Accepted |
| [ADR-005](ADR-005-react-vite-spa.md) | A React + Vite SPA as a separate service | Accepted |
| [ADR-006](ADR-006-docker-compose-traefik.md) | Docker Compose deployment, with an optional Traefik overlay | Accepted |
| [ADR-007](ADR-007-env-var-feature-switches.md) | Every feature behind a `RECIPES_`-prefixed env-var switch; Flipt deferred | Accepted |
| [ADR-008](ADR-008-oidc-with-password-fallback.md) | OIDC authentication, with a preset-password fallback that switches itself off | Accepted |
| [ADR-009](ADR-009-redis-bullmq-jobs.md) | Redis + BullMQ for background jobs, in a separate worker service | Accepted |
| [ADR-010](ADR-010-pgvector-ollama-embeddings.md) | Semantic search and RAG with pgvector and local Ollama embeddings, behind a switch | Accepted |
| [ADR-011](ADR-011-claude-chat-and-data-egress.md) | Claude-powered chat, and the rule for when recipe content may leave the host | Superseded by ADR-013 |
| [ADR-012](ADR-012-test-and-lint-tooling.md) | Vitest, Playwright, type-aware ESLint, Prettier and `tsc` | Accepted |
| [ADR-013](ADR-013-ai-first-authoring.md) | AI-first authoring through chat; the core no longer has to run offline | Accepted |
