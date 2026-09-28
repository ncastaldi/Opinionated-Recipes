# apps/web

The React + Vite single-page app. It's what the family actually uses: browsing, importing, editing, and (later) chatting with recipes. It talks to the backend only through `/api`.

In development (`pnpm dev:web`), Vite proxies `/api` to the API on `localhost:3000`. In the container, nginx serves the production build and proxies `/api` to the `api` service, so the browser always sees a single origin.

## What belongs here

- Pages, components and client-side state
- Data fetching against `/api`
- Rendering recipes. Display is always of the canonical recipe, never a second formatting pipeline
- `nginx.conf` and the `Dockerfile` that serve the built bundle

## What does not belong here

- House-style rules or recipe normalization. The API runs the engine on every write; the SPA may call the engine for *live preview* only, never as the authority
- Direct calls to Postgres, Redis, Ollama, or the Claude API. All of it goes through `/api`
- Secrets. Anything in `import.meta.env` ships to every browser

## Conventions

- Components are `PascalCase` exports in `kebab-case.tsx` files (`app.tsx` exports `App`).
- Styling is Tailwind utility classes. No per-component CSS files unless Tailwind genuinely can't express something.
- TanStack Router and TanStack Query (see [ADR-005](../../docs/ADRs/ADR-005-react-vite-spa.md)) get added with the first real route and the first API call, not before.
- The UI shell is covered by the Playwright specs in [`e2e/`](../../e2e/). Add Vitest + Testing Library for component logic once there's logic worth unit-testing.
