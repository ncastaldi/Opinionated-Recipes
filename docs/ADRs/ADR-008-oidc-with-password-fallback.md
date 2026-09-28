# ADR-008: OIDC authentication, with a preset-password fallback that switches itself off

**Status:** Accepted
**Date:** 2026-09-28

## Context

Several family members will use the app, so it needs authentication. The homelab already has an identity provider, but the project must also work for someone who has none. The requirement: "a simple pre-set password if OIDC isn't configured, but disappears as soon as it is."

## Decision

- **OIDC is the primary mode**, configured by `RECIPES_OIDC_ISSUER_URL`, `RECIPES_OIDC_CLIENT_ID` and `RECIPES_OIDC_CLIENT_SECRET`. All three are required together. Setting only some is a startup error, not a silent fallback.
- **Fallback: one shared password**, `RECIPES_AUTH_PASSWORD`, used only while OIDC is not configured.
- **OIDC always wins.** Once it's configured, `packages/config` drops the password from the resulting config entirely, so a leftover `RECIPES_AUTH_PASSWORD` can't become a second way in.
- **No local user accounts with passwords.** OIDC users are identified by their `sub` claim; the fallback mode is a single shared household login.
- With neither configured, the auth mode is `unconfigured`, and recipe routes must refuse to serve.
- Sessions are signed with `RECIPES_SESSION_SECRET` (at least 32 characters).

## Alternatives considered

- **Local username/password accounts.** More to build and secure (hashing, resets), and redundant for anyone with an identity provider.
- **Forward-auth only (proxy-level auth).** Works with some reverse proxies, but ties the app to one deployment shape and gives it no user identity.

## Consequences

- The mode selection is implemented and tested in `packages/config`. The login flows themselves are not built yet.
- Per-user data (favorites, and later sharing) is keyed on OIDC identity. Password mode is one shared identity.
