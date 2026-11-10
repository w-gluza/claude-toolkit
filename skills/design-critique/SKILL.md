---
name: design-critique
description: Conduct a structured, evidence-based critique of an interface or design proposal across usability, presentation, accessibility, systems and responsive behaviour. Use for a complete design review or prioritised design feedback; use a specialist skill for a single narrow concern.
---

# Design critique

Produce a useful design decision, not a catalogue of preferences. This skill coordinates a review; specialist skills hold the detailed principles. It can be used independently of a Designer agent.

## Set scope and inspect

Establish the target users, task, artifact/version, constraints and requested depth. Identify available screenshots, frames, prototype flows, implementation, design-system guidance and research. Record what is unavailable. Use connected design or browser tools when available; do not assume access to Figma or claim to inspect an inaccessible artifact.

Walk the main journey before reviewing individual components. Sample relevant states, widths and input methods proportionate to scope. A screenshot supports visual observations; it does not establish focus behaviour, screen-reader output, timing or an entire user journey.

Load only relevant skills: interaction-design for behaviour, visual-design for presentation, design-systems for shared contracts, responsive-design for adaptation and a11y-best-practices for access. Use css-best-practices when an implementation decision matters. If unavailable, state the limit and use accessible evidence; do not claim that invoking every skill makes the review complete.

## Build findings

Each finding includes:

- Location and state, with a frame, screenshot region or file/line reference where available.
- Observation separated from interpretation.
- Affected task and consequence, with a confidence label: observed, research-supported, inferred or preference.
- Principle, system contract or research supporting the concern; name research population and scope when known.
- A concrete recommendation and meaningful trade-off.
- A way to check whether the change helps.

Rate impact separately from confidence. Prioritise task blockers, harmful mistakes and access barriers, then material friction, then polish. Consider frequency, reversibility and affected users; mark unknowns instead of inventing frequencies or scores. Merge findings that share a cause and avoid double-counting one issue under several principles.

## Resolve and report

Present the most consequential findings first, followed by design decisions or questions that need an answer. Explain what works and should be preserved when that prevents an unnecessary redesign. A review may conclude that no change is warranted. Provide a short coverage/limitations note and a validation plan for consequential assumptions.

Read [design validation](references/design-validation.md) when proposing research or interpreting results. Treat heuristic review, automated checks, usability observation and product metrics as distinct evidence. Do not claim accessibility conformance or improved conversion from a critique alone.

Review requests do not authorise implementation, publication, design-file edits or messages to others. When implementation is requested, make the agreed scope concrete and verify it with the relevant specialist guidance.
