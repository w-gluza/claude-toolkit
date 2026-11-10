# Adaptation patterns

Toolkit recommendations below should be tested against the product's content and tasks.

- **Navigation:** preserve orientation when moving from a visible list to a disclosure. Define opening, dismissal, focus return and behaviour when resizing while open. Do not select a hamburger pattern solely because the viewport is narrow.
- **Forms:** keep labels, hints and errors associated with fields through reflow. A single column may help sequence, but compact related inputs can remain grouped if labels and reading order stay clear. Inspect keyboard occlusion and sticky actions on an actual mobile browser when possible.
- **Tables:** identify comparison tasks before converting rows to cards. Cards can destroy column comparisons. Consider a labelled scroll region, prioritised columns with access to details or a separate detail view. Choose based on the task rather than a universal pattern.
- **Dense tools:** allow a panel or toolbar to adapt without losing selected objects or pending edits. Distinguish task-critical controls from optional detail.
- **Media:** preserve meaningful image content through cropping and avoid fixed dimensions that obscure captions or overflow. Performance decisions belong with implementation guidance.

## Verification plan

Choose widths around actual transitions, a narrow layout and a wide layout; include relevant short heights. Exercise the primary journey and a failure state. Inspect long content, text enlargement, keyboard navigation and input alternatives. Test layout changes with an open panel or focused field. Record what was checked rather than claiming coverage of every device.

Sources: Google's [responsive design course](https://web.dev/learn/design/) for adaptation and [interaction guidance](https://web.dev/learn/design/interaction/) for capability-aware design. For accessibility requirements, consult W3C's [reflow explanation](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [minimum target size explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Reflow has exceptions for content requiring two-dimensional layout; target size has exceptions and spacing provisions. Do not reduce either criterion to a blanket rule from a screenshot.
