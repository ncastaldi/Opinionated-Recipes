# Security Policy

## Supported versions

Opinionated Recipes is a self-hosted web application under active development. No release has been tagged yet, so the `main` branch is the only supported version. Fixes land there.

## Reporting a vulnerability

If you find a security issue, please report it privately rather than opening a public issue. Examples: an authentication bypass, a way to read or change recipes without logging in, recipe content leaving the host without the user asking, an insecure default in `compose.yaml` or the Dockerfiles, or a vulnerable dependency.

**How to report:**
Use GitHub's private vulnerability reporting feature:
`Security` tab → `Report a vulnerability`

**Response time:**
This is a solo-maintained project. Expect an initial response within 7 days. Critical issues will be prioritized.

## Security model

- **Self-hosted, single household.** It's meant to run on your own hardware, behind your own reverse proxy (the compose file publishes only on `127.0.0.1` by default, or joins an existing Traefik).
- **Authentication:** OIDC when configured. Until then, a single shared password (`RECIPES_AUTH_PASSWORD`). Once OIDC is configured, the password is ignored entirely rather than kept as a second way in.
- **Secrets** live only in `.env`, which is gitignored. No secret has a default value; the Postgres password is required and has no fallback.
- **Data egress:** recipe content leaves the host only through an explicit user action: using the Claude chat feature (`RECIPES_FEATURE_CHAT`, off by default), or sharing or exporting a recipe. Embeddings are computed locally by Ollama.
- **Containers** run as non-root users (`node` for the API and worker, unprivileged nginx for the web app).

## Dependency vulnerabilities

Dependabot is enabled and runs weekly. It watches the ecosystems configured in [`.github/dependabot.yml`](.github/dependabot.yml):

- `npm`: the pnpm workspace (`package.json` files and the root `pnpm-lock.yaml`)
- `docker`: base images in `apps/*/Dockerfile`
- `docker-compose`: service images in `compose.yaml` (pgvector, redis, ollama)
- `github-actions`: actions pinned in `.github/workflows/`
- `pip`: the pinned lint and test tooling for the Claude Code scripts, in `requirements-dev.txt`

`scripts/check_doc_claims.sh` verifies that the ecosystems named here match what `.github/dependabot.yml` actually configures, so this list can't quietly drift out of date. If you spot a vulnerable dependency that Dependabot hasn't caught, please report it using the process above.
