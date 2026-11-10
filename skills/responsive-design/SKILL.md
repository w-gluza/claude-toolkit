---
name: responsive-design
description: Design or review how content, navigation and interactions adapt to available space, zoom and input capabilities. Use for mobile and desktop flows, responsive tables, adaptive navigation, touch interfaces and layouts that fail between breakpoints.
---

# Responsive design

Preserve the task and its meaning as space and interaction conditions change. A narrow layout is not evidence of a touch device, and a wide screen is not evidence of a mouse.

## Plan adaptation

1. Identify essential content and actions, reading order, supported locales and the existing breakpoint system. Preserve needed functionality; prioritisation should not remove a mobile user's ability to complete the task.
2. Inspect the layout with real content. Find where it stops working, then choose an adaptation: wrap, reflow, resize, change navigation, disclose secondary detail or provide a justified overflow region. Use content pressure rather than device brand names to explain breakpoints.
3. Define transition behaviour, not just two endpoint mock-ups. Include intermediate widths, short landscape viewports, long labels, text enlargement and the on-screen keyboard where relevant.
4. Check input separately: pointer precision, hover, keyboard, focus, touch and reduced motion. Preserve discoverable alternatives to hover and gestures. Do not make device assumptions from viewport width.
5. Verify continuity through layout changes: selection, draft values, expanded state and focus should remain meaningful when a navigation mode or panel changes.

Read [adaptation patterns](references/adaptation-patterns.md) for navigation, forms, tables and verification. Use CSS guidance for implementation and accessibility guidance for exact conformance requirements.

## Review prompts

- Can content reflow without accidental clipping, tiny text or page-wide horizontal scrolling? Keep genuinely two-dimensional content in an appropriate region without hiding its context.
- Does visual reordering preserve a sensible semantic reading and focus order?
- Can people reach primary actions with the keyboard open? Do sticky headers, footers and banners obscure focused fields or consume the usable height?
- Does collapsed navigation retain labels, current location, escape behaviour and a useful focus destination?
- Do targets remain selectable without accidental adjacent activation? Treat target dimensions as one part of input design; apply WCAG criteria and exceptions through a11y-best-practices.
- Does the design still communicate meaning with longer translations, right-to-left content where supported, missing images and variable data?

## Deliverable

Specify the content priority, adaptation trigger and resulting layout/interaction for each meaningful transition. Record inspected viewport, zoom and input conditions; distinguish actual device checks from emulation. A single screenshot supports only its shown state. If the environment cannot render or emulate, provide a verification plan and mark runtime behaviour unverified.
