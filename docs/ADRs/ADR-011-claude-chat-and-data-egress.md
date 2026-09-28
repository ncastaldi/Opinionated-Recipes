# ADR-011: Claude-powered chat, and the rule for when recipe content may leave the host

**Status:** Accepted
**Date:** 2026-09-28

## Context

Once the core engine exists, a chat page lets users "talk to/with their recipes" through the Claude API. That is the first feature that sends recipe content off the host. The project is self-hosted and privacy-minded, but sharing a recipe with someone outside the instance is also wanted, at least as something the design is ready for.

## Decision

- **Chat uses the Claude API**, configured by `RECIPES_ANTHROPIC_API_KEY` and `RECIPES_CLAUDE_MODEL`, behind `RECIPES_FEATURE_CHAT` (**off by default**). Config validation refuses to start with chat on but no key or model. The model is deliberately not defaulted, so a pinned model ID can't go stale in the code.
- **Data-egress rule:** recipe content leaves the host **only through an explicit, user-initiated action**: using chat, or sharing or exporting a recipe. Nothing is sent automatically or in the background. Embeddings stay local (ADR-010).
- **Sharing is designed for now and built later.** `RECIPES_FEATURE_SHARE` exists (off). The API and data model will keep a share/export seam, e.g. share tokens that map to a read-only rendering, so adding the experience later needs no restructuring.
- Chat goes through the API, which calls Claude server-side. The browser never holds the API key.

## Alternatives considered

- **Local LLM for chat via Ollama.** Keeps everything on the host, and remains possible later alongside or instead of Claude. Claude was chosen for chat quality.
- **Chat on by default.** It would break the offline-by-default constraint, and would send content without the user opting in.

## Consequences

- The core runs fully offline. Claude is the only external dependency, and it's opt-in.
- Chat-driven *writes* (e.g. "add this recipe") still pass through the engine like any other write. Claude proposes Cooklang; the engine decides.
- nginx doesn't buffer `/api` responses, so streamed chat replies reach the browser as they arrive.
