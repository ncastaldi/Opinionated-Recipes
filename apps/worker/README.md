# apps/worker

The BullMQ worker. It takes jobs off the `recipes` queue in Redis and does the slow or retryable work that shouldn't block an HTTP request.

It runs as TypeScript directly on Node 24, with no build step: `pnpm dev:worker` from the repo root, or `node src/worker.ts`. It needs Redis at `RECIPES_REDIS_URL`.

## What belongs here

- Job handlers, registered by job name in `src/jobs.ts`
- URL import: fetch the page, extract the recipe, then hand the text to the engine to normalize
- Bulk jobs: re-normalizing every recipe when a house-style rule changes, and rebuilding derived tables from canonical text
- Embedding: calling Ollama (`RECIPES_OLLAMA_URL`) and writing pgvector rows, when `RECIPES_FEATURE_RAG` is on

## What does not belong here

- Cooklang parsing or house-style rules. Call `@opinionated-recipes/engine`
- HTTP routes. Producers (the API) enqueue; this app only consumes
- Reading `process.env`. Use `loadConfig()`

## Conventions

- One queue (`recipes`); job names separate the work. A job with no registered handler **fails**. It never completes silently as a no-op.
- Handlers must be idempotent (safe to retry), because BullMQ retries failed jobs.
- A handler whose feature switch is off isn't registered, so its jobs fail visibly instead of silently doing nothing.
- When the API starts enqueueing, the job names and payload types move into a small shared module that both apps import, so producer and consumer can't drift apart.
