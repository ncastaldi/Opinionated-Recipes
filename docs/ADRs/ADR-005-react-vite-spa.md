# ADR-005: A React + Vite SPA as a separate service

**Status:** Accepted
**Date:** 2026-09-28

## Context

The product needs a web UI for browsing, importing, editing, and later a chat page (ADR-011). The deployment is a compose stack with each concern in its own service (ADR-006).

## Decision

- **A separate single-page app**, `apps/web`, not server-rendered by the API.
- **React 19 + Vite**, with **TanStack Router** (routing) and **TanStack Query** (server state) added with the first real route and API call, and **Tailwind CSS** for styling.
- In its container, **nginx serves the production build and proxies `/api`** to the API service, so the browser sees one origin (no CORS) whether it runs standalone or behind Traefik. In development, Vite's proxy does the same.

## Alternatives considered

- **Server-rendered (e.g. HTMX + templates in the API).** Fewer moving parts, but a streaming chat UI and a rich recipe editor are awkward in that model.
- **Svelte 5 / Vue 3 / SolidJS.** All viable. React has the largest ecosystem (editors, streaming chat UI, drag-and-drop import) and is the easiest for outside contributors once the repo is public.

## Consequences

- The SPA can import `@opinionated-recipes/engine` for live preview, but the API's engine run is always the authority.
- nginx runs unprivileged on port 8080. The API upstream port comes from `RECIPES_API_PORT` via nginx's envsubst templates.
- Styling is utility classes. Per-component CSS files are the exception.
