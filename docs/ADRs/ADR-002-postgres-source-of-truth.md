# ADR-002: Postgres is the source of truth for canonical recipe text

**Status:** Accepted
**Date:** 2026-09-28

## Context

Cooklang recipes are plain text, so storing them as `.cook` files on a volume is the obvious default, and it was the first proposal. It gives free interoperability with CookCLI, the Cooklang mobile apps, any text editor, and git.

The project's central constraint cuts the other way: *nothing non-conforming gets stored* (ADR-001). Files on disk can be edited by anything, bypassing the formatter, which would need a watcher to detect and repair drift. Files and a database index would also be two stores that can't be updated atomically, and scaling beyond one instance would need a shared volume and file locking.

## Decision

- **PostgreSQL is the source of truth.** Each recipe row stores its canonical Cooklang text, and that text is authoritative.
- Everything else is **derived and rebuildable** from that text: parsed ingredients, cookware, timers and tags; search indexes; embeddings (ADR-010); anything cached in Redis. A job can drop and rebuild all of it from the canonical text alone.
- Revision history lives in Postgres too (a `recipe_revisions` table when the data model lands).
- **`.cook` import and export are first-class features** (`RECIPES_FEATURE_IMPORT_FILE`, `RECIPES_FEATURE_EXPORT`), so recipes stay portable. A one-way mirror to a directory, for CookCLI or git interop, can be added later behind its own switch.

## Alternatives considered

- **`.cook` files on a volume as source of truth, with Postgres as an index.** Better interop and trivial backups, but every out-of-band edit bypasses the formatter, file and index can't change atomically, and multi-instance needs shared storage.
- **SQLite.** Simpler to run, but no pgvector (ADR-010) and weaker concurrent writes from the API and worker at once.

## Consequences

- One write path: the API (and worker) run the engine, then write recipe, derived rows and revision in one transaction.
- The database is now critical state. Backups are `pg_dump` (an SOP to write), not copying a folder.
- The data is still plain Cooklang, not a proprietary schema. Export gives it back as files at any time.
- A table that can't be rebuilt from canonical text is source data by definition, and needs its own ADR.
