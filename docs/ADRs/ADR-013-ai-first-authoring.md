# ADR-013: AI-first authoring through chat; the core no longer has to run offline

**Status:** Accepted
**Date:** 2026-09-29
**Supersedes:** [ADR-011](ADR-011-claude-chat-and-data-egress.md)

## Context

ADR-011 made Claude chat an opt-in extra and held the core to running fully offline, and `docs/foundation.md` deferred chat until after the MVP. A later design canvas, [`docs/plans/define-recipe.md`](../plans/define-recipe.md), settled that the main way a recipe gets written should be a conversation, not a form: writing structured Cooklang by hand is exactly the friction the project should remove.

On 2026-09-29 the maintainer confirmed three things. The offline requirement is dropped. In the MVP, the AI's job is to **transcribe** a recipe the user already has (typed, described, or pasted from a web page) into the house style, not to invent new ones. And the app must still be usable when no Claude credentials are configured.

## Decision

1. **The core no longer has to run offline.** The Claude API may be a dependency of the main authoring path. The constraint "the core works fully offline" is withdrawn.
2. **Chat transcription is the primary way recipes are written, and it's in the MVP.** The user describes or pastes a recipe, Claude proposes Cooklang, and the engine parses, lints and formats it like any other input. Generating a new recipe from ingredients on hand is not in the MVP.
3. **The AI writes Cooklang, not structured data.** Its output is candidate Cooklang text that takes the same path as every other source (ADR-001), and the canonical text stays the source of truth (ADR-002). This closes the question the canvas tabled, whether the AI should output JSON to populate Postgres and have Cooklang generated later: that would make database rows the source of truth.
4. **AI-first, not AI-only.** With no Claude credentials configured, the app still works: pasted Cooklang text and imported `.cook` files go through the same engine. A plain Cooklang text box is not the "form-based ingredient entry" the canvas rejected.
5. **`RECIPES_FEATURE_CHAT` stays off by default.** Chat can't run without `RECIPES_ANTHROPIC_API_KEY` and `RECIPES_CLAUDE_MODEL`, and neither may have a default: one is a secret, and a pinned model ID would go stale in the code. Config validation still refuses to start with chat on and either one missing. "AI-first" shows in the product (when chat is on, it's the first way in the UI offers to add a recipe) and in the setup docs, which walk through turning it on. It doesn't show in the switch's default.
6. **Carried forward from ADR-011, unchanged:**
   - **Data-egress rule:** recipe content leaves the host only through an explicit, user-initiated action: using chat, or sharing or exporting a recipe. Nothing is sent automatically or in the background; for example, no worker job sends recipes to Claude on its own.
   - **Chat goes through the API**, which calls Claude server-side. The browser never holds the API key.
   - **Sharing is designed for now and built later.** `RECIPES_FEATURE_SHARE` exists (off). The API and data model keep a share/export seam, e.g. share tokens that map to a read-only rendering.
7. **Embeddings are unchanged.** ADR-010 (local Ollama embeddings, behind `RECIPES_FEATURE_RAG`) stands. Dropping the offline constraint doesn't open the door to a hosted embeddings service on its own: embedding runs in the background, so the data-egress rule in point 6 still rules it out. Revisiting that belongs to the semantic-search work.

## Alternatives considered

- **Keep chat an optional extra, with a manual editor as the main path (ADR-011).** Keeps the core offline, but leaves the friction the project wants to remove.
- **Form-based ingredient entry as the main path.** Rejected in the canvas: slow, and it fights the conversational flow.
- **AI outputs structured JSON, with Cooklang generated afterwards.** Would make Postgres rows the source of truth instead of the text (against ADR-002), and would give AI-written recipes a different path from every other source.
- **AI-only: require a key.** A fresh install without one would have no way to add a recipe, and `.cook` import is needed for backup and migration anyway.
- **Chat on by default.** A fresh install would refuse to start until a key and a model were set, or chat was switched off.

## Consequences

- The MVP now includes the chat authoring flow. Its open design questions (the shape of the conversation, how the engine's findings go back to Claude for another attempt, how the user reviews the result before it's saved) are collected in [`docs/plans/plan-chat-authoring.md`](../plans/plan-chat-authoring.md).
- A real installation is expected to configure Claude. Without it the app is usable, but not the way it's designed to be used. Future features may assume chat is available.
- Chat-driven writes pass through the engine like any other write. Claude proposes Cooklang; the engine decides.
- Tests never call the Claude API. Chat is tested against recorded responses or a stub, as `e2e/README.md` already requires.
- nginx doesn't buffer `/api` responses, so streamed chat replies reach the browser as they arrive.
