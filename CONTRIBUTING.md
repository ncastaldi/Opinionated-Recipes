# Contributing

Thanks for your interest in Opinionated Recipes. This document covers the expected workflow.

Read [`CLAUDE.md`](CLAUDE.md) first, especially its **Constraints**. They're non-negotiable, and most review feedback traces back to one of them.

## Workflow

No issue required. If you spot something wrong or missing, go straight to a branch.

### 1. Branch

Run `/branch-workflow` or follow the naming convention directly:

```
feature/short-description
fix/short-description
docs/short-description
refactor/short-description
test/short-description
experiment/short-description
```

Keep branch names short and descriptive.

### 2. Make your changes

Work atomically, one logical change per commit. Run `/commit-msg` or follow the Conventional Commits format directly:

```
feat(engine): enforce one action per step
fix(api): reject recipes whose parse is not clean
docs(adr): record the embedding model choice
chore(deps): bump fastify
```

Conventional Commits format is **expected**, not optional. Scopes are usually a folder name: `engine`, `config`, `db`, `api`, `worker`, `web`, `e2e`, `ci`, `docs`.

Every test follows the repo's testing standard (`.claude/skills/testing-standards/`): a test must be able to fail when the code is wrong, and it should assert what the code produces, not how.

### 3. Check locally, then open a PR

Run the same checks CI runs:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e          # first run: pnpm exec playwright install chromium
```

If you changed a Dockerfile or `compose*.yaml`, build the images too:

```bash
docker compose build
```

If you changed anything under `.claude/skills/` or `scripts/`, run the tooling checks that `skills-ci.yml` runs:

```bash
python3 -m pip install -r requirements-dev.txt   # pinned, same versions CI uses
bash scripts/validate_skills.sh
bash scripts/check_doc_claims.sh
bash scripts/check_scaffolded_project.sh
bash scripts/test_check_doc_claims.sh
bash scripts/test_check_scaffolded_project.sh
bash scripts/test_check_roadmap.sh
bash .claude/hooks/test_session-start-hook.sh
bash .claude/skills/init-project/scripts/test_check_inherited_docs.sh
bash .claude/skills/sync-from-template/scripts/test_compare_template.sh
ruff check .claude/skills
python3 -m pytest .claude/skills -q
```

**CI must be green to merge.** Two workflows gate a PR:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, format, typecheck, unit tests and build; the Playwright suite; compose validation; and a build of all three container images.
- [`.github/workflows/skills-ci.yml`](.github/workflows/skills-ci.yml): shell and Python lint and tests for the Claude Code tooling.

Fill in the PR template.

### 4. Merge

Squash or merge commit, your call.

---

## Keeping docs in sync

When you change the folder structure, add a command or skill, or change tooling, run `/sync-template` to check for drift between the structure and its documentation. After a working session, `/docs-updater` brings the READMEs and `CLAUDE.md` up to date with what changed.

Architecture decisions get an ADR in `docs/ADRs/`, plus a row in its index and a link in `CLAUDE.md`'s Decision log.

## What's in scope

- Application code in `apps/` and `packages/`, with tests
- House-style rules: a change to `docs/specs/spec-house-style.md` and the engine's tests, in the same PR
- Docs, ADRs, specs and SOPs
- CI, Dependabot, container and tooling updates
- New or improved commands in `.claude/commands/` and skills in `.claude/skills/`. See [`.claude/README.md`](.claude/README.md) for which of the two a workflow belongs in

## What's out of scope

- Anything that breaks a constraint in `CLAUDE.md`. In particular:
  - a write path that stores a recipe without running it through the engine
  - a feature with no `RECIPES_FEATURE_*` switch
  - recipe content sent off the host without an explicit user action
- Personal infrastructure in the repo: real domains, hostnames, IPs, credentials, or family recipes. Defaults are generic, and anything specific goes in `.env` or `compose.override.yaml`
