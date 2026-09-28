# Spec: the house style

**Status:** Draft. The rules are not yet decided.
**Date:** 2026-09-28
**Implemented by:** `packages/engine` (linter, formatter, serializer). See [ADR-001](../ADRs/ADR-001-cooklang-house-style.md).

This spec defines the one canonical shape every stored recipe must take. It's the core of the project: the reason Opinionated Recipes exists is that other recipe managers don't govern how a recipe is structured, so a collection built from many sources looks like many sources.

Cooklang defines the **syntax** (how an ingredient, cookware item or timer is marked up). This spec defines the **style**: which of the many valid ways to write a recipe is *the* way here.

## What is already decided

- **The format is Cooklang**, parsed by the official parser. Anything the official parser can't parse cleanly is rejected, never stored. The parser is lenient and reports rather than fails, so "clean" means an empty parser report.
- **Every recipe, from every source, gets the same treatment.** Hand-typed, imported from a URL, imported from another app, or proposed by chat: all of it is rewritten to this spec before saving.
- **Rules are either blocking or fixable.** A fixable rule is corrected by the formatter automatically. A blocking rule needs a human (or chat) to resolve it, and the recipe isn't saved until then.
- **Every rule has a test** in `packages/engine` with a before/after example. Spec and tests change together.

## Rules to decide

The maintainer named these areas as the heart of the problem. Each needs concrete rules before the formatter is built. None are decided yet; the questions below are prompts, not proposals.

### Metadata (front matter)

- Which fields are required on every recipe (title, servings, total time, source, tags…)?
- Which are optional, and which are forbidden?
- What order do they appear in?
- What's the tag vocabulary: free-form, or a fixed list?

### Step structure

- What makes one step: one action, or one stage of the dish?
- Length limits? Sentence form (imperative, e.g. "Heat the oil…")?
- When is a recipe split into sections (`= Sauce`, `= Assembly`), and how are sections named?

### Labels and inline markup

- Where do ingredient labels go: at first use in a step, every use, or only first use overall?
- How are ingredient names normalized (singular or plural, lowercase, "yellow onion" vs "onion, yellow")?
- Where do preparation notes go: Cooklang's `(diced)` modifier, or in the step text?
- Is cookware always marked, or only non-obvious cookware?
- Must every time mentioned in a step be a `~{timer}`?

### Quantities and units

- Metric, US customary, or whatever the source used?
- Fractions or decimals (`1/2` vs `0.5`)?
- Which unit spellings are canonical (`tbsp` vs `Tbsp` vs `tablespoon`)?
- How are "to taste" and unmeasured ingredients written?

### Text and layout

- Blank lines between steps, line wrapping, notes (`>`) placement, comment (`--`) policy.

## Open questions

1. Are fixable-rule changes shown to the user before saving (a diff), or applied silently?
2. When a rule changes, do existing recipes get re-normalized automatically (a worker job) or on next edit?
3. Should the spec be versioned, with each recipe recording which spec version it conforms to?
