# ADR-010: Semantic search and RAG with pgvector and local Ollama embeddings, behind a switch

**Status:** Accepted
**Date:** 2026-09-28

## Context

Recipes are plain text, which makes them a natural fit for embeddings, both for semantic search ("something warm and cheap for a rainy night") and for giving the chat feature (ADR-011) relevant context. Embeddings need a model: Anthropic doesn't offer an embeddings model, so the options were a hosted provider or a local one. The maintainer has hardware that can run Ollama.

At household scale (a few hundred recipes), RAG is optional rather than required: a whole collection can fit in a model's context, and Cooklang's parsed structure answers many questions with plain SQL.

## Decision

- **Embeddings are stored in Postgres with the pgvector extension**, as derived, rebuildable rows (ADR-002). No separate vector database.
- **Embeddings are computed locally by Ollama** at `RECIPES_OLLAMA_URL`, using `RECIPES_OLLAMA_EMBED_MODEL` (default `nomic-embed-text`, a starting point only).
- **The whole capability sits behind `RECIPES_FEATURE_RAG`, off by default.** It's part of the chat phase, not the MVP.
- The compose file includes an `ollama` service behind an opt-in profile. Normally Ollama runs on a separate GPU host.

## Alternatives considered

- **A hosted embeddings API (e.g. Voyage AI).** No hardware needed, but recipe content would leave the host on every embed, against the data-egress constraint (ADR-011).
- **A dedicated vector database (Qdrant, Weaviate).** One more service to run, and it splits derived data away from the source of truth.
- **No RAG, full collection in context.** Viable at small scale, and still an option. The switch keeps it optional.

## Consequences

- The vector dimension is fixed by the embedding model, so changing models means a migration plus a re-embed job.
- **Open question:** which embedding (and, if used, local chat) models suit the maintainer's hardware. To be decided with the hardware specs in hand.
- The data model must record which model produced each embedding, so a model change can be detected and re-run.
