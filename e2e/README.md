# e2e

Playwright end-to-end specs. They drive a real Chromium against the **production build** of the SPA. `playwright.config.ts` builds `apps/web` and serves it with `vite preview` before the specs run.

Run with `pnpm test:e2e`. The first time on a new machine, install the browser with `pnpm exec playwright install chromium`. In a container that already ships Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path instead.

## What belongs here

- User journeys through the UI: open the app, import a recipe, see it rendered in house style, chat about it
- Smoke tests that prove a build boots and renders without errors
- Regression specs for UI bugs that unit tests couldn't have caught

## What does not belong here

- Anything a Vitest test can check. House-style rules, config parsing and route behavior are tested next to their code, where they run in milliseconds
- Tests that depend on a live Claude API or Ollama. Use recorded fixtures or a stub server so the suite runs offline

## Conventions

- File names: `<journey>.spec.ts`.
- Select by role and accessible name (`getByRole('heading', …)`), not CSS classes. The markup can change; what a user sees shouldn't.
- No retries are configured. A spec that only passes on a second attempt is a bug to fix, not a flake to absorb.
- Journeys that need the API will run against the compose stack once there's one worth driving. Until then, specs cover the SPA alone.
