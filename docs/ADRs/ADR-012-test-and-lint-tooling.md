# ADR-012: Vitest, Playwright, type-aware ESLint, Prettier and `tsc`

**Status:** Accepted
**Date:** 2026-09-28

## Context

The repo is TypeScript throughout (ADR-003), with async-heavy request and queue code, a React SPA, and a formatter whose correctness is the product. Tooling should catch real bugs, not just style.

## Decision

- **Vitest** for unit and route-level tests. The root config treats each app and package as its own project; tests sit beside the code as `*.test.ts`.
- **Playwright** for end-to-end tests from day one, run against the **production build** of the SPA (`vite build` then `vite preview`), not the dev server. No retries are configured, so a test that passes only on a second try is a bug.
- **ESLint** (flat config) with **typescript-eslint's `strictTypeChecked` and `stylisticTypeChecked`** presets, plus `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` for the SPA. Type-aware rules like `no-floating-promises` catch un-awaited work in queue and request code.
- **Prettier** for formatting code and YAML. Markdown is excluded, since re-wrapping prose adds diff noise without catching anything.
- **`tsc --noEmit`** per package as a separate typecheck step.
- **TypeScript is held at 6.0.x**, because typescript-eslint doesn't yet support TypeScript 7.

## Alternatives considered

- **Biome** for lint and format. One fast tool, but no type-aware linting, which is the main reason ESLint is here.
- **Jest.** Vitest shares Vite's transform pipeline with the SPA and needs no separate TypeScript setup.

## Consequences

- CI (`.github/workflows/ci.yml`) runs lint, format, typecheck, unit tests, build, Playwright, and a container-image build on every PR.
- The Playwright web server invokes Vite directly with `exec`, not through `pnpm run`. pnpm 12 starts scripts in their own process group, so Playwright's teardown missed the preview server and waited out its full timeout. This was found and fixed during setup.
- Tests follow `.claude/skills/testing-standards/`: assert what code produces, not how, and every assertion must be able to fail. The skeleton's key tests were mutation-checked during setup.
