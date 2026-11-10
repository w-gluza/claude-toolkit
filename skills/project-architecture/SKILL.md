---
name: project-architecture
description: Review or propose project directories, module boundaries, file placement, and naming. Use when starting an application, adding a major feature, or reconsidering an existing codebase structure.
---

# Project Architecture

Recommend the smallest structure that makes responsibilities and dependencies clear. Do not impose a template on every project.

## Workflow

1. Inspect the repository, its framework conventions, and relevant requirements. If context has already been gathered, reuse it rather than repeating discovery.
2. Identify the real boundaries: routes/UI, domain rules, server operations, persistence, external integrations, and shared code. Include only those that actually exist.
3. Read `references/preferences.md`. Everything in it is a preference that yields to an existing repo convention; the engineering principles are the ones listed below.
4. Check relevant official framework guidance, using `references/conventions.md` as a starting point. Prefer existing conventions unless changing them has a concrete benefit.
5. Propose a directory tree proportional to the project's size. Explain key module responsibilities and allowed dependencies, not just folder names.
6. Challenge. When a preference from `references/preferences.md` adds complexity in this project, say so and recommend against it. Point out meaningful risks or alternatives (for example whether introducing `features/` would help). If the existing structure is sound, recommend keeping it.

## Architecture principles

- Favour cohesion, explicit boundaries, and low coupling over fashionable patterns.
- Dependencies point one way: routes import features; features import shared code; shared code imports nothing from features or routes. State the rule for the project in one line so it can be checked with grep.
- Keep related components, styles, and tests close together.
- Keep domain logic independent of React, HTTP, and database details where doing so simplifies testing or reuse.
- Keep framework entry points thin; delegate substantial behaviour to appropriate modules.
- Isolate server-only secrets and database access from client bundles.
- Treat API contracts, validation, and persistence consistency as architectural concerns when relevant.
- Avoid layers, abstractions, or folders that do not solve a current problem.
- Do not confuse naming preferences with engineering correctness.

## Output

For a new project: propose a compact folder tree, short responsibility notes, and at most a few key decisions and trade-offs.
For an existing project: describe what to keep and only recommend changes that solve an identified problem.
Include the README text for the chosen structure and its import rule in the output, ready to paste, so the next reader and the next project get the same answer. Write it to the file only when asked.
Do not modify or reorganise files unless explicitly asked.

See `references/sources.md` for the reading behind these rules, `references/screen-pattern.md` for how a feature's screen, presentation and hook split state, and `references/concurrency.md` for write paths with shared state.
