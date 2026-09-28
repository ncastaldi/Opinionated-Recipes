# ADR-007: Every feature behind a `RECIPES_`-prefixed env-var switch; Flipt deferred

**Status:** Accepted
**Date:** 2026-09-28

## Context

The engine should come with an environment variable for every feature and switch, with reasonable defaults. [Flipt](https://github.com/flipt-io/flipt), a self-hosted feature-flag service, was raised as something to explore.

Settings will also sit alongside other services' variables in a shared compose file, so names must not collide.

## Decision

- **Every feature has an on/off switch**, `RECIPES_FEATURE_<NAME>`, with a sensible default. Core features default on (API docs, URL import, file import, export). Anything that adds cost, dependencies, or data egress defaults off (RAG, chat, share).
- **Every setting is prefixed `RECIPES_`**: `RECIPES_<AREA>_<SETTING>`. The prefix was chosen over `OR_` (ambiguous with the word "or") and `OPINIONATED_RECIPES_` (too long).
- **`packages/config` is the only code that reads `process.env`.** It declares every variable in one zod schema with its default, treats empty values as unset, validates cross-field rules (chat needs a key and a model; OIDC needs all three of its variables), and throws a single `ConfigError` listing every problem at startup. Services receive a typed `Config`, including a `FeatureFlags` object.
- A disabled feature is **not registered at all**: its routes 404 and its job handlers are absent, so it doesn't sit in a half-on state.
- **Flipt is deferred, not rejected.** If runtime toggling or per-user flags become worth a service, a Flipt-backed provider goes behind the same `FeatureFlags` shape, and callers don't change.

## Alternatives considered

- **Flipt from day one.** Runtime toggles and targeting, but another service to run and fail, for a household app whose switches change rarely and are fine to change with a restart.
- **Unprefixed names** (`FEATURE_CHAT`, `DATABASE_URL`). These collide in a shared compose file.

## Consequences

- `.env.example` is the operator-facing list and must stay in step with the schema. Every new variable gets an entry there.
- A switch change needs a restart, which is acceptable at this scale.
- Tests build configs with `loadConfig({...})` from plain objects, so switch-to-behavior wiring is testable (e.g. API docs 404 when switched off).
