# ADR-001: Cooklang as the canonical format, with an opinionated house-style layer

**Status:** Accepted
**Date:** 2026-09-28

## Context

The project exists because existing recipe managers (Mealie, Tandoor, Paprika and similar) don't govern structure. Nothing dictates how a step is phrased, where labels go, or how a recipe is laid out, so a collection built from typed-in and imported recipes ends up looking like a pile of different sources. The goal is the opposite: every recipe structured, formatted and presented the same way, with new and imported recipes reworked to fit.

[Cooklang](https://cooklang.org) is an open plain-text markup for recipes. It marks ingredients (`@olive oil{2%tbsp}`), cookware (`#pot{}`) and timers (`~{5%minutes}`) inline in the step text, and carries metadata in front matter. It's human-readable, has an official parser, and has an ecosystem (CLI, mobile apps, editor plugins).

Cooklang governs **syntax**, not **style**. Two valid Cooklang files for the same dish can be structured completely differently.

## Decision

1. **Cooklang is the storage format.** The canonical form of every recipe is Cooklang text.
2. **Parsing uses the official parser only**, `@cooklang/cooklang` (the reference cooklang-rs implementation compiled to WASM). No hand-rolled or third-party parser.
3. **An opinionated house-style layer sits on top**, defined in [`docs/specs/spec-house-style.md`](../specs/spec-house-style.md) and implemented in `packages/engine` as a linter (finds violations) and a formatter (fixes what it can) plus a serializer (writes canonical text).
4. **Nothing non-conforming is stored.** Every write passes through the engine. A recipe whose parse isn't clean, or that still violates a blocking house-style rule after formatting, is rejected.

## Alternatives considered

- **A custom JSON/YAML recipe schema.** Full control over structure, but it isn't human-editable as prose, has no ecosystem, and we'd be designing a format instead of a product.
- **Cooklang without a house-style layer.** It fixes the markup, not the problem: recipes would still vary in structure.
- **The community Python parser (`cooklang-py`).** Active, but not the reference implementation. For a project whose whole point is format rigor, lagging the spec is the wrong risk.

## Consequences

- The engine is the heart of the codebase, and its tests are the most important ones.
- **The official parser is lenient.** Verified during setup: malformed markup like `@salt{1%tsp` produces a warning in a text report, and the broken component is silently dropped. It doesn't fail. `parseRecipe()` therefore returns `clean: false` plus the report, and callers must treat that as a finding. This is how the leniency is kept from undermining point 4.
- The flattened `CooklangRecipe` object loses layout, so the formatter will likely build on the parser's `parse_ast` / `parse_events` output, which carries source positions.
- House-style rules become a versioned, testable artifact. Changing a rule means a bulk re-normalize job over existing recipes (see ADR-009).
- Importers (URL, other apps' exports) only have to produce *candidate* Cooklang; the engine makes it conform.
