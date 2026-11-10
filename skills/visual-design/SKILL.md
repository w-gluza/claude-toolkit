---
name: visual-design
description: Design or review typography, colour, spacing, hierarchy, composition and visual consistency in interfaces. Use for visual direction, screenshots, mock-ups and rendered pages; distinguish visual judgement from accessibility conformance and CSS correctness.
---

# Visual design

Create a coherent visual language that supports the content, task and brand. Explain concrete relationships rather than asking for an interface to look cleaner or more modern.

## Establish the visual context

Inspect the supplied design, screenshot or rendered interface, its dimensions and relevant states. Identify the audience, content priorities, brand assets, existing tokens and components. Preserve an established direction unless the request or an evidenced problem warrants change. Without visual access, offer a provisional specification or code-level observations; do not claim to have assessed the rendered result.

For a new direction, state a compact rationale for type, palette, layout, imagery and density. Use available licensed assets and existing icon families. Do not assume that a particular font, eight-point scale, gradient, card layout or rounded corner is universally appropriate.

## Evaluate and propose

- **Hierarchy:** name what should attract attention first, next and last for this task. Compare emphasis from size, weight, contrast, position and space. Repeated primary styling can obscure action priority.
- **Typography:** define roles for headings, body, labels and supporting text. Check line length, wrapping, line height, weight, density and actual font rendering with representative content. Keep visual roles separate from semantic heading levels.
- **Spacing:** compare within-group and between-group distances, shared edges and rhythm. Reuse the established scale where it fits; avoid arbitrary new values and avoid forcing optical alignment into an unsuitable grid.
- **Colour:** assign roles to surfaces, content, actions and statuses. Preserve semantic meaning across states and themes. Assess actual foreground/background pairs with accessibility guidance; appearance alone cannot prove contrast compliance.
- **Composition:** inspect balance, reading sequence, alignment, content proportions and whitespace. Consider dense work tools and expressive editorial pages on their own terms.
- **Consistency and polish:** compare equivalent components, icon weight, baselines, borders, radii, shadows, truncation and image crops. Identify intended exceptions before calling them defects.

Read [visual foundations](references/foundations.md) for examples and source boundaries. Use responsive-design for behaviour across available space, design-systems for shared contracts and a11y-best-practices for conformance criteria.

## Verification and output

For each material finding, identify location/state, observation, consequence, proposed adjustment and its rationale. Distinguish a system inconsistency from a preference or an untested perceptual inference. Quote measured values only when available from the artifact or inspection tools; do not invent pixel precision from a scaled image.

For implementation requests, map changes to existing tokens and inspect the rendered result afterwards if tools are available. Include representative long content and relevant states. A screenshot cannot prove interaction, responsiveness beyond its viewport or assistive-technology behaviour. Report these limits. Do not redesign unrelated areas to make a local improvement.
