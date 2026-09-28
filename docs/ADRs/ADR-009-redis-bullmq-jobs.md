# ADR-009: Redis + BullMQ for background jobs, in a separate worker service

**Status:** Accepted
**Date:** 2026-09-28

## Context

Several operations are too slow or failure-prone to run inside an HTTP request: fetching and normalizing a recipe from a URL, bulk re-normalizing every recipe when a house-style rule changes, and computing embeddings through Ollama.

## Decision

- **Redis** as the queue backend, and **BullMQ** as the queue library.
- A dedicated **`apps/worker`** service consumes the jobs. The API only enqueues.
- **One queue (`recipes`)**, with job names separating the work. A job with no registered handler **fails**; it never completes as a silent no-op.
- Handlers must be **idempotent**, because BullMQ retries.
- Redis runs with `maxmemory-policy noeviction` and append-only persistence.

## Alternatives considered

- **Postgres-backed queue (pg-boss, graphile-worker).** One less service, but BullMQ is more mature for retries, rate limiting and concurrency, and Redis is cheap to run.
- **In-process jobs in the API.** Simpler, but a slow import or embedding run would compete with requests, and a crash would lose in-flight work.

## Consequences

- BullMQ 6 treats `ioredis` as an optional peer dependency and, under native ESM, needs an already-constructed client. The worker passes `new Redis(url, { maxRetriesPerRequest: null })`. This was caught by running the stack during setup, not by the unit tests.
- When the API starts producing jobs, the job names and payload types move into a shared module both apps import, so producer and consumer can't drift.
- Verified during setup: a `ping` job round-trips API-side through Redis to the worker, and an unknown job name fails with "No handler registered".
