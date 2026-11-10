# Components, patterns and evolution

## Reuse decision

Toolkit criteria: identify repeated purpose, compatible behaviour and real consumers. Prefer reuse when the existing contract fits. Extend when the new case belongs to that purpose and can be supported without confusing current users. Create a separate component when semantics or interaction differ substantially. Keep a one-off local when sharing would add more obligation than value.

Example: a navigation link and an action button may share visual tokens while retaining different semantics. Do not unify them behind a misleading interaction contract merely because their rectangles match.

## A useful contract

Describe purpose and exclusions, anatomy, content constraints, semantic role, states, events, controlled/uncontrolled behaviour when relevant, variants, themes and responsive adaptation. Include usage and misuse examples. Align design names and code names, documenting deliberate differences. A complete contract states what consumers can rely on without exposing every implementation detail.

## Contribution and adoption

Record the need, alternatives tried, representative consumers and evidence of usability and accessibility. Name an owner and document acceptance criteria proportionate to the project. GOV.UK's [contribution criteria](https://design-system.service.gov.uk/community/contribution-criteria/) illustrate evidence-oriented contribution review; they are not mandatory governance for other organisations.

For a breaking change, list affected consumers, replacement, transition strategy and removal condition. A small application may migrate in one change; a shared package may need deprecation across releases. Use the repository's release policy rather than inventing dates. Check uptake and remaining exceptions before claiming a migration complete.
