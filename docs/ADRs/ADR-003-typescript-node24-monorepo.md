# ADR-003: TypeScript on Node 24 LTS, in a pnpm workspaces monorepo

**Status:** Accepted
**Date:** 2026-09-28

## Context

The engine must parse with the reference Cooklang implementation (ADR-001). At decision time, the parser options were:

| Language | Parser | Status |
|---|---|---|
| Rust | `cooklang` crate 0.18.7 | Official, canonical |
| TypeScript/JS | `@cooklang/cooklang` 0.18.7 | The same Rust parser compiled to WASM; official |
| Python | `cooklang-py` 1.0.1 | Community |

The project also needs a web backend, a queue worker, and an SPA, and later the Anthropic SDK, an Ollama client, and pgvector support.

## Decision

- **TypeScript everywhere, on Node.js 24 LTS.** The backend, worker and SPA share one language and one set of recipe types.
- **pnpm workspaces monorepo:** services in `apps/`, shared libraries in `packages/`, one lockfile.
- **No build step for Node code.** Node 24 runs TypeScript directly via native type stripping. Workspace packages export their `src/index.ts`, Node runs it, and Vite bundles it for the SPA. The compiler settings enforce what stripping can handle: `erasableSyntaxOnly` (no enums, namespaces, or parameter properties), `verbatimModuleSyntax`, and explicit `.ts` extensions on relative imports.
- **TypeScript 6.0.x, not 7.** typescript-eslint's supported range is `<6.1.0`, and type-aware linting is a firm choice (ADR-012). Revisit when typescript-eslint supports TypeScript 7.

## Alternatives considered

- **Python 3.13 backend + TypeScript SPA.** Python has the strongest RAG/ML ecosystem, but depends on the community parser.
- **Rust backend.** Uses the canonical parser natively, but development is slower, and its web and LLM ecosystem is thinner for this project's needs.

## Consequences

- The official parser is used with no Rust toolchain in the build.
- `tsc --noEmit` is a typecheck, not a build. Images ship source plus production dependencies.
- Node 24 prints an `ExperimentalWarning` when the engine loads the parser's WASM module as ESM. It's harmless, and expected until Node stabilizes WASM ESM integration.
- Workspace packages must never be copied *into* `node_modules` (e.g. via `pnpm deploy`), because Node refuses to strip types under `node_modules`. The Dockerfiles install in place, and pnpm's symlinks resolve to the real `packages/` paths.
