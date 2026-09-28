# API Documentation

This folder contains hand-written API documentation, integration guides, and reference material for the Opinionated Recipes API (`apps/api`).

The API generates its own reference docs. Fastify builds an OpenAPI 3 document from each route's schema, and while `RECIPES_FEATURE_API_DOCS` is on (the default), serves it at:

- `/api/docs`: interactive docs (Swagger UI)
- `/api/docs/json`: the raw OpenAPI document

Those paths are the same through the web container (nginx proxies `/api`) and against the API directly (`http://localhost:3000/api/docs` under `pnpm dev:api`). With the switch off, both paths return 404.

What lives in this folder is the documentation a generator can't produce: context, intent, and integration guidance.

## Conventions the API follows

- Every route lives under `/api`. The SPA and the API share one origin, so the browser never needs CORS.
- Request and response bodies are JSON and validated against the route's schema. The schema is the contract, and the OpenAPI document is generated from it.
- A disabled feature's routes aren't registered, so they return 404, not 403.
- Recipe bodies are Cooklang text. Every write runs through the engine's house-style formatter; a recipe whose parse isn't clean is rejected with the parser's report.

## What belongs here

- Endpoint guides that explain the "why" behind API design choices
- Authentication and authorization flow documentation (OIDC, and the fallback password that switches off once OIDC is configured)
- Integration guides for external consumers of this API
- Postman collections or Bruno request files
- Versioning and deprecation policy
- Rate limiting and error code reference

## What does not belong here

- Auto-generated OpenAPI/Swagger specs (the API serves those live at `/api/docs/json`)
- Architecture decisions about the API design (those go in docs/ADRs/)
- Deployment or infrastructure docs (those go in docs/SOPs/)
