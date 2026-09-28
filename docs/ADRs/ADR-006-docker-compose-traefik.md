# ADR-006: Docker Compose deployment, with an optional Traefik overlay

**Status:** Accepted
**Date:** 2026-09-28

## Context

The project is self-hosted, first in a homelab that already runs Traefik v3, and later by anyone once the repo is public. The requirement was "a docker compose with as many or few services as is needed to make this project flexible, robust, and scalable", with basic defaults that aren't tied to any one homelab.

## Decision

- **`compose.yaml` runs the whole stack:** `web` (nginx + SPA), `api`, `worker`, `postgres` (the `pgvector/pgvector` image), `redis`, and `ollama` behind an opt-in `ollama` profile, since Ollama usually lives on a separate GPU host that `RECIPES_OLLAMA_URL` points at.
- **Standalone by default:** only `web` is published, on `127.0.0.1:8080`, overridable via `RECIPES_HTTP_BIND` and `RECIPES_HTTP_PORT`.
- **`compose.traefik.yaml` is an overlay** that removes the host port, joins an external Traefik network, and adds router labels. Every value is a generic default overridable from `.env`: `RECIPES_DOMAIN` (`recipes.localhost`), `RECIPES_TRAEFIK_NETWORK` (`traefik`), `RECIPES_TRAEFIK_ENTRYPOINT` (`websecure`).
- **Host-specific tweaks** (GPU passthrough, ACME cert resolvers, dev ports) go in a gitignored `compose.override.yaml`.
- `RECIPES_POSTGRES_PASSWORD` is required, with no default. Compose refuses to start without it.

## Alternatives considered

- **One container running everything.** Simpler to deploy, but it can't scale the worker separately or swap Postgres/Redis for existing instances.
- **Kubernetes/Helm.** Far beyond household scale.
- **Traefik labels in the base file.** They would force a Traefik dependency on everyone, and tie defaults to one setup.

## Consequences

- Verified during setup: the images build, the stack comes up healthy, the SPA and `/api` are served through nginx, a job round-trips API-side through Redis to the worker, and the overlay produces the expected labels with no host port.
- Postgres 18 images keep data under a versioned subdirectory of `/var/lib/postgresql`, which is what the volume mounts.
- Redis runs with `maxmemory-policy noeviction`, as BullMQ requires (an evicted key is a lost job).
- Images aren't published to a registry yet. Publishing to GHCR is an open question for when the repo goes public.
