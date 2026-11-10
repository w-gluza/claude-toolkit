---
name: css-best-practices
description: Modern CSS review rules distilled from MDN, web.dev and WCAG, each with a source link and a Baseline note. Load when writing or reviewing stylesheets, CSS modules, styled components or design tokens so the code uses current layout, cascade, colour and motion features instead of legacy workarounds.
allowed-tools: Read, Grep
---

# CSS best practices (from MDN, web.dev, WCAG)

Target: Baseline Widely available as of 2026-11-08, with Newly available features marked. Extracted from MDN CSS reference and guides, the web.dev Learn CSS course and WCAG 2.2 Understanding pages. See NOTICE.md for the licences.

This file is the review checklist: the legacy patterns that still show up in diffs, each paired with the modern replacement and the page that explains why. The full set (one source anchor per rule, Baseline status where it matters) lives in `references/`. Grep there when you need the exact wording or a rule not listed here:

- `references/layout.md` - flexbox, grid, subgrid, container queries, intrinsic sizing, logical properties, spacing, aspect ratio, viewport units
- `references/cascade-and-selectors.md` - cascade layers, nesting, `@scope`, `:is` / `:where` / `:has`, specificity, custom properties, `@property`, design tokens, resets
- `references/colour-and-typography.md` - `oklch`, `color-mix`, relative colours, `light-dark`, `color-scheme`, fluid type, `text-wrap`, units, fonts
- `references/motion-and-interaction.md` - transitions and animations, `@starting-style`, view transitions, scroll, focus, forms, `popover`, `dialog`, anchor positioning, media features, accessibility
- `references/legacy-map.md` - one table: old pattern, modern replacement, source

When citing a rule in a review, link the source so the author can read the reasoning. When a replacement is only Newly available, say so and check the project's browser support target before insisting.

## 1. Layout built with the wrong tool

Smell: `float`, `clear`, `display: table`, `display: inline-block` with negative margins, or `position: absolute` used to arrange siblings.

- **Floats are for wrapping text around an image, not layout.** Use flexbox for one axis and grid for two. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Relationship_with_other_layout_methods
- **A clearfix means a float is doing layout.** Remove the float; if you only need a new block formatting context, use `display: flow-root`. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Block_formatting_context
- **Space between siblings is `gap`, not margins on children.** Works in flexbox and grid and never leaves a stray edge margin. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap
- **Centre without absolute positioning and `transform: translate(-50%, -50%)`.** In grid, `place-items: center`; in flex, `align-items: center` with `justify-content: center` (`justify-items` is ignored in flexbox); in plain block layout, `align-content: center` (Widely since 2026-10). https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Aligning_items
- **Responsive column counts come from `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`**, not from a breakpoint per column count. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat
- **Named `grid-template-areas` over line numbers** for page and card layouts; the template reads like the design. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_template_areas
- **Nested items that must align with the parent grid use `subgrid`**, not duplicated track definitions. Baseline Widely since 2026-03. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid
- **The padding-bottom percentage hack is `aspect-ratio`.** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio
- **`top: 0; right: 0; bottom: 0; left: 0` is `inset: 0`.** Note that `inset` sets physical offsets; when the direction matters, use `inset-inline` and `inset-block`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset
- **`height: 100vh` is `min-block-size: 100svh`** so mobile toolbars do not clip content. Reserve `dvh` for the one element that must track the visible viewport; MDN warns it resizes content during scroll. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport

## 2. Components that only respond to the viewport

Smell: a component stylesheet full of `@media (min-width: ...)` rules that really describe how much room the component has.

- **Component breakpoints are container queries.** Set `container-type: inline-size` on the parent and query `@container (inline-size > 30rem)`. Baseline Widely since 2025-08. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
- **Name containers when there is more than one ancestor** so the query cannot bind to the wrong box. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-name
- **Sizes inside a component use container units** (`cqi`, `cqb`) rather than `vw`. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries#container_query_length_units
- **Viewport media queries are for page layout** and use range syntax, `@media (width >= 48em)`, not `min-width`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/width
- **Breakpoints are in `em` or `rem`, not device pixel widths**, so they respond to the user's font size. https://web.dev/learn/design/media-queries
- **Fluid values replace breakpoint steps.** `clamp(1rem, 0.5rem + 2vw, 2rem)` for one value that scales; `min()` and `max()` for caps. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp

## 3. Physical directions

Smell: `margin-left`, `padding-right`, `width`, `text-align: left`, `border-bottom` in a product that could ever be translated or set vertically.

- **Use logical properties by default.** `margin-inline-start`, `padding-block`, `inline-size`, `border-block-end`, `text-align: start`, `inset-inline`. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values
- **Shorthands map cleanly:** `margin-inline: auto` centres, `padding-block: 1rem 2rem` sets top and bottom. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-inline
- **Four-value shorthands are always physical.** `margin: 0 1rem 0 0` next to logical declarations is a mixed model; use `margin-inline-end: 1rem` or the two-value logical shorthands. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Margins_borders_padding
- **Physical properties stay only where the thing is physical**: a shadow cast downward, a sticky header at the top of the screen. https://web.dev/learn/css/logical-properties

## 4. Specificity fights

Smell: `!important`, id selectors, selectors four levels deep, a `.foo.foo` doubling trick, or an override file that grows every sprint.

- **Order the stylesheet with `@layer`** (`reset, base, tokens, components, utilities`) so later layers win regardless of specificity. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer
- **Third-party CSS goes into its own low layer** with `@import url() layer(vendor)` so your rules beat it without `!important`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@import#importing_css_rules_into_a_cascade_layer
- **`!important` never wins a specificity fight.** MDN allows it in two places: guarding required styles in the first declared layer, and beating an inline style you do not control. Inside layers it inverts the order, so earlier layers win. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/important
- **Zero-specificity hooks use `:where()`**; grouped selectors that should keep weight use `:is()`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:where
- **Parent and sibling state is `:has()`**, not a JavaScript class toggle: `.field:has(:user-invalid)`, `.card:has(img)`. Anchor it on a specific element, not `body`, `:root` or `*`, which MDN flags for performance. Baseline Widely since 2026-06. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has
- **Native nesting replaces preprocessor nesting**, kept to two or three levels; `&` is only required for compound selectors like `&.is-open`. Baseline Widely since 2026-06. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using
- **Specificity of a nested rule is the specificity of the parent's `:is()` form**; a nested id still wins. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Nesting_and_specificity
- **Never style ids, and never qualify a class with a tag** (`div.card`). https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity#tips_for_handling_specificity_headaches

## 5. Values hard-coded where a token belongs

Smell: a hex colour or a magic pixel number inside a component file, or two components that disagree about the same spacing.

- **Design decisions are custom properties on `:root` or a theme scope; components reference tokens only.** https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
- **Name tokens by role, not by colour** (`--color-surface`, not `--palette-ivory`), so a second theme can redefine them truthfully. https://web.dev/learn/design/theming
- **Give every `var()` read that could be unset a fallback** or a registered default. A property registered with a typed `syntax` and `initial-value` never falls back, so pick one mechanism. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var#custom_properties_with_fallbacks_for_use_when_the_property_has_not_been_set
- **Register tokens that animate or need a type with `@property`** so the browser can interpolate them and reject bad values. Baseline Newly since 2024-07. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property
- **Spacing is a scale on tokens, not numbers traced from a design file.** The one number worth copying is an aspect ratio. https://web.dev/learn/css/sizing
- **Theme switching is `color-scheme` plus `light-dark()`**, with `[data-theme]` or `prefers-color-scheme` setting the scheme once. `light-dark()` is Baseline Newly since 2024-05; `color-scheme` is Widely. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark

## 6. Legacy colour and type

- **New colours are written in `oklch()`**; lightness is perceptual so a scale built by stepping `L` looks even. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch
- **Tints, shades and transparency come from `color-mix()` or relative colour syntax**, not from a second hex. `color-mix()` is Widely since 2025-11; relative colours are Newly since 2024-09. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix
- **`font-size` is `rem`, a keyword or fluid `clamp()`, never `px`**, so the user's font-size setting works. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size#pixels
- **`line-height` is unitless.** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height#prefer_unitless_numbers_for_line-height_values
- **Headings get `text-wrap: balance`, body copy `text-wrap: pretty`** where supported, instead of manual `<br>`. `balance` is Newly since 2024-05; `pretty` is Limited, use it behind `@supports`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap
- **Long strings break with `overflow-wrap: anywhere`**, not `word-break: break-all`. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Text/Wrapping_breaking_text
- **Web fonts declare `font-display` explicitly** (usually `swap`) and a `size-adjust` fallback face, so text is never invisible during the block period and the swap does not shift layout. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display

## 7. Motion that hurts

Smell: `transition: all`, animating `width`, `height`, `top`, `left` or `margin`, `will-change` on everything, no reduced-motion handling, `display: none` toggled with no animation.

- **Animate `transform` and `opacity` only**; layout properties trigger reflow every frame. https://web.dev/articles/animations-guide
- **Name the transitioned properties**, never `all`, and keep durations under about 300ms for interface feedback. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using
- **Respect `prefers-reduced-motion: reduce`** by replacing non-essential motion with a still alternative such as a dissolve. The preference means reduce, not none, so no blanket `* { animation: none !important }`; place the reduced-motion block after the motion rules, since MDN's override relies on source order. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- **`will-change` is a last resort applied just before an animation**, not a permanent declaration. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change
- **Entry animations from `display: none` use `@starting-style` plus `transition-behavior: allow-discrete`**, not a JavaScript class on the next frame. Both Newly since 2024-08. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style
- **Page and state changes can use the View Transition API** instead of a hand-built crossfade. Newly since 2025-10. https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- **Scroll effects use `scroll-snap-type`, `scroll-behavior` and scroll-driven animations** before any scroll listener. Snap and smooth scrolling are Widely; scroll-driven animations are Newly since 2026-10; `overscroll-behavior` is still Limited, so wrap it in `@supports`. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap

## 8. Accessibility regressions

- **Never `outline: none` on `:focus`.** Style `:focus-visible` instead so keyboard users keep an indicator. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible
- **Focus indicators need 3:1 contrast and should not be clipped by `overflow: hidden`**; use `outline-offset`. https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- **Content must reflow at 320px wide without horizontal scroll**: no fixed widths, no `white-space: nowrap` on text blocks. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- **Pointer targets are at least 24 by 24 CSS pixels.** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **Validation styling uses `:user-invalid`, not `:invalid`**, so fields are not red before the user has typed. Widely since 2026-05. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:user-invalid
- **Hover-only interfaces also need a non-hover path**: gate hover styles with `@media (hover: hover)`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover
- **Forced-colours mode is tested**, with `forced-color-adjust` only where a colour carries meaning. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors
- **Hidden means hidden to everyone**: `display: none` or the `hidden` attribute for removed content, `inert` for a disabled region, and a visually-hidden utility only for screen-reader-only text. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert

## 9. Overlays and stacking

- **Modals are `<dialog>` with `showModal()`**; the browser handles focus trapping, `Escape` and the top layer. Style `::backdrop`. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- **Tooltips, menus and toasts are `popover`**, promoted to the top layer with light dismiss, not `z-index: 9999`. Newly since 2025-01. https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
- **Position popovers with anchor positioning** (`anchor-name`, `position-anchor`, `position-try-fallbacks`) behind `@supports`; it is still Limited, so keep the JavaScript fallback isolated. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning
- **Stop `z-index` escalation with `isolation: isolate`** on the component root so its children stack locally. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/isolation
- **`z-index` values come from a token scale** with a handful of named steps. https://web.dev/learn/css/z-index

## 10. File-level habits

- **One modern reset**, not Eric Meyer's zero-everything reset: `box-sizing: border-box` inherited, margins trimmed, media `max-inline-size: 100%`, `text-wrap` defaults. https://piccalil.li/blog/a-more-modern-css-reset/
- **No vendor prefixes in source**; the build adds them from browserslist. https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
- **No `@import` chains outside layer declarations**; bundle or use `<link>` so stylesheets download in parallel. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@import
- **Offscreen sections get `content-visibility: auto`** with `contain-intrinsic-size` to skip rendering work. Newly since 2025-09. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility
- **Check Baseline before using a feature**, and read the Baseline badge at the top of the MDN page. https://web.dev/baseline

## Baseline status key used in references

- **Widely** - Baseline Widely available: supported in the core browsers for at least 30 months. Use freely.
- **Newly** - Baseline Newly available: supported in all core browsers but recently. Use when the project's support target allows; provide a graceful fallback.
- **Limited** - not yet in every core browser. Progressive enhancement only, behind `@supports`.

Statuses are as of 2026-11-08. They only move forward, so a Newly feature may be Widely by the time you read this. Confirm on MDN.

## Modernisation

Prefer modern, native CSS features over legacy patterns, unnecessary abstractions, and JavaScript-based workarounds.

When reviewing existing CSS:

1. **Identify outdated patterns.** Look for legacy layout techniques, unnecessary wrappers, excessive specificity, duplicated declarations, and JavaScript-driven styling that modern CSS can replace. `references/legacy-map.md` lists the patterns that still appear in diffs with their replacements.
2. **Recommend modern alternatives.** Consider Grid, Flexbox, container queries, logical properties, cascade layers, native nesting, custom properties, and modern selectors where appropriate.
3. **Explain the benefit.** Describe how the change improves readability, maintainability, responsiveness, accessibility, or performance.
4. **Propose rewrites.** Show concrete before-and-after examples rather than only mentioning newer APIs.
5. **Check compatibility.** Respect the project's supported browsers and verify support for newer features against the Baseline key above.
6. **Avoid unnecessary complexity.** Modern CSS should simplify the implementation, not introduce abstractions for their own sake.

Do not preserve outdated patterns solely because they currently work. Recommend improvements while clearly distinguishing required fixes from optional modernisation.

## Relationship to project rules

Where a project's CLAUDE.md or design system is stricter (named token scale, a fixed set of breakpoints, CSS modules only), the project wins. Where they overlap, cite the source above so the reasoning is visible rather than restating the team rule.
