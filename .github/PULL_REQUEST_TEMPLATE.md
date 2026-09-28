## What does this PR do?

<!-- One paragraph summary of the change and why it was made -->

## Type of change

- [ ] Feature (new functionality)
- [ ] Fix (bug fix)
- [ ] Refactor (no behavior change)
- [ ] Docs (documentation only)
- [ ] Chore (dependency update, config, tooling)

## How to test it

<!-- Step by step instructions to verify this works -->

1. 
2. 
3. 

## Checklist

- [ ] `pnpm test` passes
- [ ] `pnpm lint && pnpm format:check && pnpm typecheck` passes
- [ ] `pnpm test:e2e` passes (if the UI or its build changed)
- [ ] `docker compose build` succeeds (if a Dockerfile or `compose*.yaml` changed)
- [ ] New settings or features have a `RECIPES_*` switch in `packages/config` and an entry in `.env.example`
- [ ] Every recipe write still goes through the engine; a parse that isn't clean is rejected
- [ ] No secrets, personal hostnames, or real family recipes committed
- [ ] CLAUDE.md updated if architecture or constraints changed
- [ ] Relevant docs updated (ADR, spec, SOP) if applicable

## Related

<!-- Link to issue, ADR, or planning doc if relevant -->
