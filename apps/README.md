# apps

Deployable services. Each one becomes its own container in `compose.yaml`.

| App | Runs as | Role |
|---|---|---|
| [`api/`](api/) | `node src/server.ts` | Fastify REST API under `/api`, and the only way into the data |
| [`worker/`](worker/) | `node src/worker.ts` | BullMQ consumer for slow, retryable work: imports, re-normalizing, embeddings |
| [`web/`](web/) | nginx serving the Vite build | React SPA; proxies `/api` to the API so the browser sees one origin |

## What belongs here

- A new top-level process with its own lifecycle: something that starts, runs, and gets its own container and healthcheck

## What does not belong here

- Code shared between apps. That goes in [`packages/`](../packages/)
- One-off scripts. Those go in [`scripts/`](../scripts/)

## Conventions

- Each app has its own `package.json`, `tsconfig.json`, `README.md`, and `Dockerfile`.
- Apps depend on packages, never on each other.
- Each app reads configuration only through `@opinionated-recipes/config`.
