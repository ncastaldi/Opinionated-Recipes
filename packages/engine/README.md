# packages/engine

The Cooklang engine, which is the core of the project. It parses Cooklang with the official parser, checks it against the house style, and writes out the one canonical form every stored recipe must take.

Pure functions only: text in, structured result or text out. No database, no HTTP, no queue, no filesystem, no clock. That keeps it fast to test exhaustively, and usable unchanged by the API, the worker, and the SPA.

## What belongs here

- Parsing, via `@cooklang/cooklang` (the official cooklang-rs parser compiled to WASM). Never a hand-rolled or third-party parser. See [ADR-001](../../docs/ADRs/ADR-001-cooklang-house-style.md)
- The house-style rules from [`docs/specs/spec-house-style.md`](../../docs/specs/spec-house-style.md): the linter that finds violations, and the formatter that fixes the ones it can
- The serializer that turns a parsed recipe back into canonical Cooklang text
- Import normalization that is pure text work (turning an already-fetched page or file into a candidate recipe)

## What does not belong here

- Fetching anything (URL imports fetch in the worker, then hand text to the engine)
- Persistence, revisions, or anything that knows a recipe has an id
- LLM calls. If a normalization step needs Claude or Ollama, the worker calls the model and the engine validates the result

## Conventions

- **A non-clean parse is a finding.** The official parser is lenient: malformed markup such as `@salt{1%tsp` produces a warning, and the component is silently dropped instead of failing. `parseRecipe()` returns `clean: false` with a plain-text `report`. Nothing may store a recipe whose parse was not clean.
- Every house-style rule gets a test with a before/after pair. The spec and the tests must agree. When a rule changes, both change in the same commit.
- The parser also exposes `parse_ast` / `parse_events` (on its raw `Parser` export), which carry source positions. That's the likely basis for the formatter, since the flattened `CooklangRecipe` loses layout.
- Node 24 prints an `ExperimentalWarning` when this package loads, because it imports a WebAssembly module as ESM. It's harmless and expected.
