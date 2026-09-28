# Opinionated Recipes — Foundation
**Status**: Draft v0.1
**Date**: 2026-09-28

---

## The Problem

Recipe managers already exist, among them Mealie, Tandoor and Paprika, but none of them work the way the maintainer wants, for one specific reason: **they don't use a rigid recipe structure or format.** Nothing governs how a recipe is written. Nothing says how to structure an individual step, where to put labels, or how to format the whole thing. Whatever shape a recipe arrives in is the shape it stays in.

That matters because the goal is a collection where **every recipe is structured the same, looks the same, and is formatted the same.** A household recipe collection grows from many sources: recipes typed in by hand, recipes copied from websites, recipes carried over from other apps. Without a governing format, the collection ends up looking like its sources, not like one cookbook. The maintainer wants the opposite: when a new recipe is added or imported, it gets reworked to fit in.

## The Solution

A self-hostable service to store, retrieve, and manage kitchen recipes, built around one idea: **an opinionated engine that owns the format.**

- **Cooklang at the core.** Recipes are written in [Cooklang](https://cooklang.org), an open plain-text markup for ingredients, cookware and timers, parsed by its official parser. Building the engine around Cooklang is the first step, and features are built around the engine.
- **A house style on top.** Cooklang governs syntax, not style. The project defines its own house-style rules and a formatter that rewrites any recipe, hand-typed or imported from a URL, a recipe site, or another app's export, into the one canonical form. A recipe that can't be made to conform isn't stored.
- **Every feature is a switch.** Each feature has an environment variable with a reasonable default, so an installation can be as minimal or as full-featured as its owner wants.
- **Self-hosted as a Docker Compose stack,** with as many or as few services as it takes to be flexible, robust and scalable: a web app, an API, a background worker, Postgres (the source of truth) and Redis. It runs behind a reverse proxy such as Traefik or on its own, with authentication via OIDC or a simple preset password until OIDC is set up.
- **Then, talking to your recipes.** Once the core is built: a chat page backed by the Claude API for users to talk to and with their recipes, with retrieval over locally computed embeddings (Ollama).

## The User

The maintainer and their family, first. In the maintainer's words: "at the end of the day, the solution is for me." Once it's stable, the repository goes public, so the audience widens to self-hosters who want the same thing: a recipe collection that's consistent because the software insists on it.

## What We Are Not Building

The maintainer deliberately set no permanent exclusions. The boundary is between the **MVP**, the core Cooklang engine and the minimum around it to store, retrieve and manage recipes, and **everything after it**, which is fair game whenever it adds to the experience.

Deferred beyond the MVP, not ruled out:
- the chat page and retrieval over embeddings
- the full sharing experience (the design stays ready for it)
- notifications and recipe photos
- search ranking, conformance scoring, and recommendations

What the project won't do, as a matter of principle rather than scope, is recorded as constraints in `CLAUDE.md`. For example, it won't store a recipe that doesn't conform to the house style, and it won't send recipe content off the host without the user asking.

## Success Metric

In the maintainer's words: **the app is "working" when they can use the chat and/or the import button to bring a new recipe into their collection, and confirm it is written as expected.**

## Open Questions

- **The house-style rules themselves:** required metadata, step structure, label placement, units, layout. They're the heart of the product and not yet decided; see `docs/specs/spec-house-style.md`.
- **Which local models** (for embeddings, and possibly chat) suit the maintainer's hardware.
- **Whether a feature-flag service** (Flipt) earns its place over plain environment variables.
- **The further features** the maintainer has in mind, which are headed for the roadmap.

---
*This document is the source of truth for product intent. Architecture and technology decisions live in docs/ADRs/; this file is about why, not how.*
