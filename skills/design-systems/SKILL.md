---
name: design-systems
description: Define, review or evolve shared design tokens, components, variants, states and usage patterns. Use when establishing a design system, resolving repeated UI inconsistency, designing component contracts or planning adoption and migration; avoid system-building for an isolated screen.
---

# Design systems

Create shared contracts where repeated needs justify them. A component library alone does not establish usage rules, ownership or an adoption path.

## Inventory before abstraction

Inspect existing tokens, design files, components, documentation, consuming screens and supported platforms. Identify the current source of truth and disagreements between design and code. Collect representative usages, including outliers. Keep a local solution when there is no demonstrated shared need; do not invent consumers to justify a reusable component.

## Define the contract

- **Tokens:** separate raw values from purpose where that distinction helps themes or reuse. Define names, meaning, aliases and permitted overrides. Account for colour, type, spacing, shape, elevation and motion only where used. Avoid both hard-coded repetition and a unique token for every value. See [tokens and themes](references/tokens-and-themes.md).
- **Components:** define purpose, anatomy, content slots, interaction and semantic role. Identify supported variants and valid combinations. Prefer meaningful variants over unrelated booleans that create contradictory states.
- **States:** specify applicable default, hover, focus, pressed, selected, disabled, pending, success and error behaviour. Do not apply every state to every component. Include long/localised content, keyboard operation and theme behaviour.
- **Patterns:** explain when to combine components for a task, when not to use the pattern and how it handles failure. Avoid extracting a pattern from visual resemblance alone.
- **Consistency:** compare equivalents by purpose, not just appearance. An accessible exception may be necessary; document why it differs rather than forcing uniformity.

For each proposed shared element, provide a short contract, representative usage and known limits. Coordinate public APIs with the repository's framework and engineering conventions. Use a11y-best-practices for semantics and keyboard contracts and css-best-practices for implementation mechanisms.

## Evolve and adopt

Read [components and governance](references/components-and-governance.md) for reuse criteria, change management and contribution decisions. Distinguish local correction, compatible extension and breaking change. Describe affected consumers, migration, ownership and deprecation where relevant; do not prescribe a governance committee for a small project.

For implementation, verify representative consumers, states and themes. Visual snapshots can detect appearance changes but do not establish semantics, keyboard behaviour or usability. Report unsupported combinations and design/code mismatches. Recommend a migration when asked; do not silently rewrite all consumers or publish a package.
