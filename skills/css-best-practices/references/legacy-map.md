# Legacy CSS to modern CSS

One row per pattern that still appears in diffs. Baseline column from the web-features dataset on 2026-11-08: Widely means safe everywhere, Newly means check the project's support target, Limited means progressive enhancement behind `@supports`. Statuses only move forward.

M = https://developer.mozilla.org/en-US/docs/Web/CSS

## Layout

| Old pattern | Modern replacement | Baseline | Source |
|-------------|--------------------|----------|--------|
| `float: left` columns plus a clearfix | `display: grid` or `display: flex`; `display: flow-root` if you only need a new formatting context | Widely | M/Guides/Flexible_box_layout/Relationship_with_other_layout_methods |
| `display: inline-block` rows with negative margins to kill whitespace | flexbox with `gap` | Widely | M/Reference/Properties/gap |
| `display: table` and `table-cell` for vertical centring | `display: grid; place-items: center`, or `align-content: center` on a block | Widely | M/Reference/Properties/place-items |
| `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` | grid `place-items: center`, flex `align-items: center; justify-content: center`, or `margin: auto` on a flex or grid child | Widely | M/Guides/Flexible_box_layout/Aligning_items |
| margins on every child to space siblings, plus `:last-child { margin: 0 }` | `gap` on the container | Widely | M/Reference/Properties/gap |
| `top: 0; right: 0; bottom: 0; left: 0` | `inset: 0` | Widely | M/Reference/Properties/inset |
| `padding-bottom: 56.25%` with an absolutely positioned child | `aspect-ratio: 16 / 9` | Widely | M/Reference/Properties/aspect-ratio |
| `height: 100vh` for a full-screen panel | `min-block-size: 100svh`; `dvh` only for the one element that must track the visible viewport | Widely | M/Reference/Values/length#relative_length_units_based_on_viewport |
| one `@media` per column count (`1`, `2`, `3`, `4` columns) | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` | Widely | M/Reference/Values/repeat |
| `grid-column: 2 / 4` line arithmetic for page layout | named `grid-template-areas` | Widely | M/Guides/Grid_layout/Grid_template_areas |
| child grid redefining the parent's tracks to line up | `grid-template-columns: subgrid` | Widely | M/Guides/Grid_layout/Subgrid |
| `width: calc(100% - 2rem)` to stay inside the parent | `inline-size: min(100%, 60ch)` or `max-inline-size` | Widely | M/Reference/Values/min |
| `font-size: 14px` at one breakpoint and `18px` at another | `font-size: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem)` | Widely | M/Reference/Values/clamp |
| `@media (min-width: 768px)` inside a component file | `container-type: inline-size` on the parent and `@container (inline-size > 30rem)` | Widely | M/Guides/Containment/Container_queries |
| `@media (min-width: 768px) and (max-width: 1023px)` | `@media (768px <= width < 1024px)` range syntax | Widely | M/Reference/At-rules/@media/width |
| `vw` units for sizes inside a card | `cqi` container query units | Widely | M/Guides/Containment/Container_queries#container_query_length_units |
| `margin-left`, `padding-right`, `width`, `text-align: left` | `margin-inline-start`, `padding-inline-end`, `inline-size`, `text-align: start` | Widely | M/Guides/Logical_properties_and_values |
| `margin: 0 auto` | `margin-inline: auto` | Widely | M/Reference/Properties/margin-inline |
| `margin: 0 1rem 0 0` beside logical declarations | `margin-inline-end: 1rem`; four-value shorthands are always physical | Widely | M/Guides/Logical_properties_and_values/Margins_borders_padding |
| `overflow: hidden` to contain floats | `display: flow-root` | Widely | M/Guides/Display/Block_formatting_context |
| `overflow-y: scroll` to stop layout jumping when a scrollbar appears | `scrollbar-gutter: stable` | Newly (2024-12) | M/Reference/Properties/scrollbar-gutter |
| rendering a long page in full | `content-visibility: auto` with `contain-intrinsic-size` on offscreen sections | Newly (2025-09) | M/Reference/Properties/content-visibility |

## Cascade and selectors

| Old pattern | Modern replacement | Baseline | Source |
|-------------|--------------------|----------|--------|
| `!important` to beat a vendor stylesheet | `@import url("vendor.css") layer(vendor)` and your own rules in a later layer | Widely | M/Reference/At-rules/@import#importing_css_rules_into_a_cascade_layer |
| a growing `overrides.css` at the end of the bundle | `@layer reset, base, components, utilities` declared once at the top | Widely | M/Reference/At-rules/@layer |
| `#sidebar .nav li a` | `.nav-link`, one class, flat | Widely | M/Guides/Cascade/Specificity#tips_for_handling_specificity_headaches |
| `.btn.btn` to double specificity | `:where()` on the base rule so any single class wins | Widely | M/Reference/Selectors/:where |
| `h1, h2, h3 { } .card h1, .card h2 { }` repeated lists | `:is(h1, h2, h3)` | Widely | M/Reference/Selectors/:is |
| JavaScript adding `.has-image` to a card | `.card:has(img)` | Widely (2026-06) | M/Reference/Selectors/:has |
| JavaScript adding `.is-invalid` to a field wrapper | `.field:has(:user-invalid)` | Widely | M/Reference/Selectors/:user-invalid |
| `li:nth-child(2)` that breaks when a hidden item is inserted | `li:nth-child(2 of .visible)` | Widely | M/Reference/Selectors/:nth-child |
| Sass nesting compiled to long descendant chains | native nesting, two or three levels, `&` only for compound selectors | Widely (2026-06) | M/Guides/Nesting/Using |
| BEM-style namespacing to stop leaks between components | `@scope (.card) to (.card-content)` where the support target allows | Newly (2026-03) | M/Reference/At-rules/@scope |
| `#ff6b35` repeated in six files | `--color-accent` on `:root` or the theme scope, `var(--color-accent)` in components | Widely | M/Guides/Cascading_variables/Using_custom_properties |
| `--palette-ivory`, `--palette-navy` tokens | role tokens: `--color-surface`, `--color-text`, redefined per theme | Widely | M/Guides/Cascading_variables/Using_custom_properties |
| `var(--gap)` with nothing set on some pages | `var(--gap, 1rem)` or a registered default | Widely | M/Reference/Values/var#custom_properties_with_fallbacks_for_use_when_the_property_has_not_been_set |
| animating a gradient angle via JavaScript | `@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }` then `transition` | Newly (2024-07) | M/Reference/At-rules/@property |
| `all: initial` to reset a widget | `all: revert-layer` inside a layer, or a scoped reset | not listed | M/Reference/Properties/all |
| `z-index: 9999` | `isolation: isolate` on the component root and a small named `z-index` token scale | Widely | M/Reference/Properties/isolation |
| `-webkit-` and `-moz-` prefixes written by hand | unprefixed property; the build adds prefixes from browserslist | n/a | https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix |

## Colour and typography

| Old pattern | Modern replacement | Baseline | Source |
|-------------|--------------------|----------|--------|
| a ten-step palette hand-picked in hex | `oklch(L C H)` with `L` stepped evenly | Widely | M/Reference/Values/color_value/oklch |
| `#1a73e8` plus a darker `#1557b0` for hover | `color-mix(in oklab, var(--color-accent), black 15%)`; use `in oklch` when the mix must stay vivid | Widely (2025-11) | M/Reference/Values/color_value/color-mix |
| `rgba(26, 115, 232, 0.5)` copied from the base colour | `oklch(from var(--color-accent) l c h / 50%)` | Newly (2024-09) | M/Guides/Colors/Using_relative_colors |
| `@media (prefers-color-scheme: dark) { --color-text: #fff }` duplicated per token | `color-scheme: light dark` and `--color-text: light-dark(#111, #eee)` | Newly (2024-05) | M/Reference/Values/color_value/light-dark |
| dark theme with form controls and scrollbars still light | `color-scheme: dark` on the theme root | Widely | M/Reference/Properties/color-scheme |
| `opacity: 0.6` to make text look secondary | a dedicated `--color-text-muted` token | Widely | M/Guides/Colors/Using_color_wisely |
| `font-size: 16px` | `font-size: 1rem` | n/a | M/Reference/Properties/font-size#pixels |
| `line-height: 24px` or `line-height: 1.5em` | `line-height: 1.5` | n/a | M/Reference/Properties/line-height#prefer_unitless_numbers_for_line-height_values |
| `<br>` inside a heading to balance lines | `text-wrap: balance` | Newly (2024-05) | M/Reference/Properties/text-wrap |
| orphan words at the end of paragraphs | `text-wrap: pretty` behind `@supports` | Limited | M/Reference/Properties/text-wrap |
| `word-break: break-all` for long URLs | `overflow-wrap: anywhere` | Widely | M/Guides/Text/Wrapping_breaking_text |
| `@font-face` with no `font-display` | an explicit `font-display` (usually `swap`) plus `size-adjust` on the fallback face | Widely | M/Reference/At-rules/@font-face/font-display |
| one `@font-face` per weight | one variable font with `font-weight: 100 900` | Widely | M/Guides/Fonts/Variable_fonts |
| custom checkbox built from a hidden input and a span | `accent-color: var(--color-accent)` on the native input, behind `@supports` | Limited | M/Reference/Properties/accent-color |

## Motion and interaction

| Old pattern | Modern replacement | Baseline | Source |
|-------------|--------------------|----------|--------|
| `transition: all 0.3s` | `transition: transform 200ms, opacity 200ms` | n/a | M/Guides/Transitions/Using |
| animating `width`, `height`, `top`, `left`, `margin` | `transform: translate()` and `scale()`, `opacity` | n/a | https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance |
| `will-change: transform` on every card | none by default; add it just before an animation and remove after | Widely | M/Reference/Properties/will-change |
| `transform: translateX(10px) rotate(5deg)` rewritten whenever one part changes | `translate`, `rotate`, `scale` individual properties | Widely | M/Reference/Properties/transform |
| no reduced-motion handling, or `* { animation: none !important }` | `@media (prefers-reduced-motion: reduce)` swapping non-essential motion for a still alternative, placed after the motion rules | Widely | M/Reference/At-rules/@media/prefers-reduced-motion |
| `display: none` then a `setTimeout` to add `.is-visible` for a fade-in | `@starting-style` with `transition-behavior: allow-discrete` on `display` | Newly (2024-08) | M/Reference/At-rules/@starting-style |
| `max-height: 9999px` to animate to `height: auto` | `interpolate-size: allow-keywords` behind `@supports`; `grid-template-rows: 0fr` to `1fr` as the fallback | Limited | M/Reference/Properties/interpolate-size |
| hand-rolled crossfade between routes | `document.startViewTransition()` and `view-transition-name` | Newly (2025-10) | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API |
| scroll listener that snaps carousel items | `scroll-snap-type: x mandatory` and `scroll-snap-align: start` | Widely | M/Guides/Scroll_snap |
| `window.scrollTo` with a JavaScript easing | `scroll-behavior: smooth` | Widely | M/Reference/Properties/scroll-behavior |
| `touchmove` listener to stop pull-to-refresh | `overscroll-behavior: contain` behind `@supports` | Limited | M/Reference/Properties/overscroll-behavior |
| scroll listener driving a progress bar | `animation-timeline: scroll()` | Newly (2026-10) | M/Guides/Scroll-driven_animations |
| `:focus { outline: none }` | `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px }` | Widely | M/Reference/Selectors/:focus-visible |
| `input:invalid { border-color: red }` | `input:user-invalid { border-color: var(--color-error) }` | Widely | M/Reference/Selectors/:user-invalid |
| `textarea` resized by a JavaScript input handler | `field-sizing: content` behind `@supports` | Newly (2026-06) | M/Reference/Properties/field-sizing |
| `:hover` styles that stick on touch screens | `@media (hover: hover) { .card:hover { } }` | Widely | M/Reference/At-rules/@media/hover |
| `<div class="modal">` with a hand-written focus trap and `Escape` handler | `<dialog>` with `showModal()`, styled via `::backdrop` | Widely | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog |
| `z-index: 9999` tooltip or menu with click-outside JavaScript | `popover` attribute, `:popover-open`, light dismiss in the top layer | Newly (2025-01) | https://developer.mozilla.org/en-US/docs/Web/API/Popover_API |
| `getBoundingClientRect()` to position a tooltip | `anchor-name` and `position-anchor` with `position-try-fallbacks`, behind `@supports` | Limited | M/Guides/Anchor_positioning |
| `pointer-events: none` plus `opacity: 0` to disable a region | the `inert` attribute | Widely | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert |
| `aria-hidden` plus `tabindex="-1"` on every control behind a modal | `showModal()` makes the rest of the page inert for you | Widely | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog |
