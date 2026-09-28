# packages

Internal libraries shared by the apps. They're published only inside this workspace (`workspace:*`), never to npm.

| Package | Role |
|---|---|
| [`engine/`](engine/) | Cooklang parse, house-style lint/format, serialize. Pure, no I/O |
| [`config/`](config/) | Typed `RECIPES_*` env loader and every feature switch with its default |
| [`db/`](db/) | Drizzle schema, migrations, and the Postgres + pgvector client |

## What belongs here

- Code that at least two apps need, or that must stay free of any one app's framework (the engine can't depend on Fastify)

## What does not belong here

- Anything with a process lifecycle (a server, a queue consumer). That's an app
- A package with one caller. Keep it in that app until a second caller appears

## Conventions

- Package names are `@opinionated-recipes/<folder>`.
- `exports` points at `src/index.ts`. Packages ship as TypeScript source, run directly by Node 24 and bundled by Vite for the SPA, so there's no build step.
- Dependencies point one way: `engine` and `config` depend on nothing internal; `db` may use `config` for tooling; apps may use any package.
