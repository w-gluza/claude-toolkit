---
name: interaction-design
description: Design or review user flows, controls, feedback and recovery using Norman's principles, usability heuristics and relevant interaction models. Use for task journeys, forms, navigation and state transitions; use visual-design for presentation alone.
---

# Interaction design

Make actions understandable, outcomes predictable and recovery possible. Evaluate a real task before selecting principles that explain an issue. A named principle supports reasoning; it does not establish that users encountered a problem.

## Workflow

1. Establish the user, goal, context, entry point and successful outcome. Reuse supplied research and constraints. State assumptions when these are missing; ask only when the answer changes the design.
2. Inspect the flow and its relevant states: initial, pending, success, empty, invalid input, service failure, cancellation and return. In a screenshot, assess only what is visible; do not invent hidden interactions.
3. Walk through choosing an action, understanding its result and continuing or recovering. Check language, navigation, information needed for decisions and preservation of user input.
4. Consult only relevant references: [Norman](references/norman-principles.md) for understanding actions and results, [Nielsen](references/nielsen-heuristics.md) for a broad usability pass, [interaction models](references/laws-of-ux.md) for targeting, decisions, grouping, familiarity and complexity.
5. Recommend the smallest coherent improvement. Describe the new behaviour, including failure and recovery, rather than saying a principle was violated. Keep legitimate expert shortcuts and essential choices.
6. Validate against the original task. Separate inspection findings from research evidence; propose a task-based check when user understanding remains uncertain.

## Decisions to check

- Can users locate the next action and understand its scope before acting? Labels should describe outcomes, particularly for destructive or costly actions.
- Does feedback distinguish pending, accepted and completed work? A spinner alone may leave uncertainty about whether a request succeeded.
- Can users correct input without losing other work? Explain the problem where correction happens and retain valid entries.
- Is there an appropriate escape, back or undo path? Prefer reversible actions where feasible; use confirmation for consequential irreversible operations, with the affected object and consequence stated.
- Are defaults appropriate and transparent? Do not improve conversion by concealing costs, consent choices or cancellation routes.
- Does progressive disclosure hide optional detail while leaving information necessary for an informed decision available?

## Deliverable

For a review, report the affected step/state, observation, likely consequence, principle or evidence, proposed behaviour and validation method. Label claims as observed, research-supported, inferred or preference; include research scope and limitations. Accept a sound interaction without manufacturing findings.

For a design task, specify the main path, alternatives, state transitions, content and recovery. Respect the existing product and system. Review does not authorise file edits; a request to implement does. Use accessibility guidance for keyboard, focus and announcements rather than treating a usability pass as an accessibility audit.
