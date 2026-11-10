---
name: ux-writing
description: Write or review interface labels, instructions, onboarding, empty states, errors and confirmations. Use for product microcopy and content clarity tied to real actions and states; use stop-slop for general prose style.
---

# UX writing

Help people understand their situation, choose an action and know its consequence. Match the actual product behaviour; concise copy that promises the wrong outcome is a defect.

## Establish the content contract

Identify the audience, task, state, available actions, product terminology, tone and localisation requirements. Inspect the surrounding interface or ask for behaviour that materially changes the wording. Do not invent support channels, recovery options, retention periods, completion times or guarantees.

Keep repeated concepts consistent. Preserve established brand voice where it does not obscure instructions, access or consequences. Use the product's language conventions; avoid imposing a house prose style on localisation or accessible names.

## Write by state

- **Labels:** name the action or destination and make the affected object clear where necessary. Distinguish saving a draft from submitting it. Avoid generic Continue when the next action creates a consequential commitment.
- **Instructions and hints:** explain what is needed before entry, including material format constraints. Keep persistent labels; placeholders are not substitutes. Do not duplicate a long explanation in every field.
- **Onboarding:** supply the context needed for the next useful action. Keep optional education dismissible when feasible and avoid introducing features before the user needs them.
- **Empty states:** distinguish first use, no search matches, filtering and failure. Explain the applicable situation and offer a real next action without blaming the user.
- **Errors:** state the problem and feasible correction. Separate input errors from service problems; preserve input and do not tell people to correct a value when the service failed.
- **Pending and success:** distinguish received, processing and completed. State what happens next only when known. Avoid claiming Saved before persistence succeeds.
- **Confirmations:** name the object, consequence and reversibility. Use explicit action labels and an escape route. Do not add a confirmation to every low-risk action when recovery is more appropriate.

Read [patterns and examples](references/patterns.md) for concrete rewrites and source boundaries.

## Review and validate

Check copy against real states, valid actions, long/localised strings, narrow layouts and keyboard/screen-reader context where available. Visible labels and accessible names must remain consistent; use a11y-best-practices for exact requirements. Avoid idioms, unexplained acronyms, manipulative urgency and consent language that conceals choices.

Deliver a compact current/proposed/rationale list or a state-to-copy specification. Include missing behaviour and any assumption that prevents final wording. For implementation requests, inspect the result in context and check that variables and localisation placeholders remain intact. Do not create a research finding from your own preference; propose a comprehension task when understanding is uncertain.
