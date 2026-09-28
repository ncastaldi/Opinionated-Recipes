# packages/config

The typed loader for every `RECIPES_*` environment variable, including every feature switch and its default. Services call `loadConfig()` once at startup and pass the result down.

This package is where the "every feature has an env-var switch with a sensible default" constraint is enforced. A setting that isn't declared here doesn't exist.

## What belongs here

- The zod schema for every `RECIPES_*` variable, with its default
- Feature switches (`RECIPES_FEATURE_*`) and the `FeatureFlags` shape services read them through
- Cross-field rules that decide whether a configuration is valid, e.g. chat needs an API key and a model; OIDC needs all three of its variables
- Derived settings, e.g. which auth mode is active (OIDC wins over the fallback password, which is then dropped)

## What does not belong here

- Reading `process.env` anywhere else. Every other package receives a `Config`, never the raw environment
- Secrets with defaults. A secret is optional or required, never pre-filled
- Business logic that merely *consults* a switch. Route registration and job handlers read `config.features` in their own package

## Conventions

- Variable names: `RECIPES_<AREA>_<SETTING>` for settings, `RECIPES_FEATURE_<NAME>` for on/off switches.
- An empty value means "unset" and falls back to the default. Compose and `.env` files often write `NAME=` for "not set".
- Every variable added here also gets an entry in the root [`.env.example`](../../.env.example), with its default and a one-line explanation.
- Invalid configuration throws `ConfigError` listing every problem at once, so a deployment fails at startup with the whole picture.
- If Flipt (or another flag service) is adopted later, it goes behind the `FeatureFlags` shape, so callers don't change. See [ADR-007](../../docs/ADRs/ADR-007-env-var-feature-switches.md).
