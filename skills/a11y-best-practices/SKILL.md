---
name: a11y-best-practices
description: Accessibility review rules distilled from WCAG 2.2, the WAI-ARIA Authoring Practices, ARIA in HTML and MDN, each with a source link, plus a map of what jsx-a11y and axe can and cannot catch. Load when writing or reviewing components, markup, forms, dialogs, navigation, media or tests so the result works with a keyboard, a screen reader, zoom and reduced motion.
allowed-tools: Read, Grep
---

# Accessibility best practices (WCAG 2.2, WAI-ARIA APG, ARIA in HTML, MDN)

Target: WCAG 2.2 level AA. Extracted 2026-11-08 from the w3c/wcag, w3c/aria-practices, w3c/html-aria and mdn/content repositories, the eslint-plugin-jsx-a11y rule docs, the axe-core rule list and the Testing Library query docs. See NOTICE.md for the licences.

This file is the checklist for building and reviewing: the defects that fail audits and that no linter reports, grouped by the smell you see in a diff. Each rule is tagged with the WCAG criterion it enforces, or [best practice] when breaking it is not a conformance failure. The full set (one source anchor per rule, a short quotation each) lives in `references/`. Grep there when you need the exact quote or a rule not listed here:

- `references/semantics-and-aria.md` - native elements first, roles, allowed ARIA per element, states, hiding and presentation
- `references/keyboard-and-focus.md` - operability, tab order, focus management, the keyboard contract of every APG widget pattern
- `references/names-forms-and-announcements.md` - accessible name computation, labels, errors, autocomplete, page title and language, live regions
- `references/structure-and-media.md` - headings, landmarks, tables, reading order, skip links, hiding, images, audio and video
- `references/visual-and-interaction.md` - contrast, colour, zoom, reflow, text spacing, hover content, focus appearance, target size, gestures, motion, time limits
- `references/testing-and-tooling.md` - Testing Library query priority, what axe covers, manual passes, and the table mapping every jsx-a11y rule to its criterion and to what it cannot see

This skill is self-contained. The visual criteria in section 7 are also covered from the stylesheet side by `css-best-practices` section 8; both cite the same WCAG pages.

When citing a rule in a review, link the source so the author can read the reasoning. Lead with the user impact (who cannot do what), then the fix.

## 1. ARIA where HTML would do

Smell: `role=`, `tabIndex` and `onKeyDown` on a `div` or `span`, or a native control hidden and rebuilt.

- [best practice] **No ARIA is better than bad ARIA. Use a native element whenever one exists.** A `div` with `role="button"` needs `tabindex`, `Enter` and `Space` handling and a name; a `button` has all four. https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/
- [best practice] **Do not change native semantics unless you must.** `<a role="button">` is wrong twice: a link navigates, a button acts, and the key handling differs. https://www.w3.org/TR/html-aria/#docconformance
- [WCAG 2.1.1] **Interactive content only in interactive elements.** A click handler on a `div`, `li` or `img` is unreachable by keyboard and invisible to a screen reader. Lint: `jsx-a11y/no-static-element-interactions`. https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#building_keyboard_accessibility_back_in
- [best practice] **Disclosure is `details` and `summary`; a modal is `dialog` with `showModal()`.** Both give you the role, the state and the keyboard behaviour for free. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- [WCAG 4.1.2] **Never put `aria-hidden="true"` on a focusable element or its ancestor.** The element stays in the tab order but disappears from the accessibility tree. It is also redundant next to `hidden` or `display: none`, and a modal's background should be made `inert`, not `aria-hidden`. Lint: `jsx-a11y/no-aria-hidden-on-focusable`. https://www.w3.org/TR/html-aria/#docconformance
- [best practice] **Do not add a role an element already has**, such as `<button role="button">`. Treat it as a warning: MDN keeps `role="img"` on an `img` whose source is SVG and `role="contentinfo"` on `footer` for older VoiceOver. Lint: `jsx-a11y/no-redundant-roles`. https://www.w3.org/TR/html-aria/#docconformance
- [WCAG 4.1.2] **A role requires its states and owned children.** `role="tab"` inside a `tablist` with `aria-selected`; `role="combobox"` with `aria-expanded` and `aria-controls`; `role="checkbox"` with `aria-checked`. Lint: `jsx-a11y/role-has-required-aria-props`. https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- [WCAG 4.1.2] **`aria-expanded` goes on the trigger, not on the panel it opens.** https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded
- [best practice] **The current page link is `aria-current="page"`, not `aria-selected`**, which is valid only on `tab`, `option`, `gridcell` and `row`. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current
- [best practice] **`role="menu"` and `menubar` are application menus, not site navigation.** A navigation list is `nav` with a `ul`. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role
- [best practice] **Native `disabled` by default; `aria-disabled` only for custom controls or when the control must stay in the tab order**, and then you suppress the behaviour and style it yourself. Items inside menus, listboxes, tabs and trees use `aria-disabled` so arrow keys can still reach them. Never `aria-disabled` on a link; remove the `href`. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled
- [WCAG 1.3.1] **`role="presentation"` on a data table or list destroys its structure.** Use it only on a layout wrapper. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/presentation_role

## 2. Things with no name

Smell: a `button` whose only child is an icon component, an `input` with a placeholder and no `label`, a link that says "Read more", two `nav` elements, an `iframe` without a `title`.

- [WCAG 4.1.2] **Every control, link, image and landmark that repeats needs an accessible name**, and the name is what a screen reader says and what voice control matches. https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
- [best practice] **Prefer visible text as the name; `aria-labelledby` next; `aria-label` only when nothing visible exists.** `title` and `placeholder` are not reliable names. https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#naming_techniques
- [WCAG 2.5.3] **If a control has visible text, its accessible name must contain that text**, so "Submit" spoken aloud activates the button labelled Submit. https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
- [WCAG 4.1.2] **Icon-only buttons get an `aria-label` that names the action**, not the icon: "Close", not "X" or "times-icon". https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#naming_with_aria-label
- [WCAG 3.3.2] **Form fields get a `label` with `for`**; wrapping alone fails in some assistive technology combinations, and placeholder is a hint, not a label. Lint: `jsx-a11y/label-has-associated-control`. https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
- [WCAG 1.3.1] **Groups of related fields get `fieldset` and `legend`**: radio groups, address blocks, date parts. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset
- [WCAG 2.4.4] **Link text makes sense out of context.** "Read more" repeated ten times is ten identical links in a screen reader's link list. Lint: `jsx-a11y/anchor-ambiguous-text`. https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html
- [best practice] **Hints and error messages are attached with `aria-describedby`**, not placed next to the field and hoped for. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby
- [best practice] **Repeated landmarks are distinguished by name**: `<nav aria-label="Main">`, `<nav aria-label="Footer">`. A `region` without a name is not a landmark. https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
- [WCAG 4.1.2] **`iframe` gets a `title`; `svg` used as an image gets `role="img"` and a title, or `aria-hidden="true"` when decorative.** Lint: `jsx-a11y/iframe-has-title`. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role

## 3. Keyboard dead ends

Smell: a menu that opens on `mouseenter`, `tabIndex={1}`, `tabIndex={0}` on every list item, a modal with no `Escape`, focus left on an element that was just removed, a hand-written focus trap.

- [WCAG 2.1.1] **Everything operable by pointer is operable by keyboard**, with no timing requirement. Lint: `jsx-a11y/click-events-have-key-events`. https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
- [WCAG 2.1.2] **Never trap focus except in a modal, and then `Escape` or a visible close must release it.** https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html
- [WCAG 2.4.3] **Tab order preserves meaning and operability.** No positive `tabindex`; fix the DOM order instead. Nesting a focusable element inside another is an explicit failure. Lint: `jsx-a11y/tabindex-no-positive`. https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- [best practice] **`tabindex="0"` only on things a user operates; `-1` for programmatic focus targets.** Items inside a composite widget use roving tabindex or `aria-activedescendant`, so one Tab stop per widget. https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex
- [WCAG 2.4.3] **Opening a dialog moves focus inside it; closing returns focus to the element that opened it.** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboard_interaction
- [best practice] **When focused content is removed, move focus somewhere sensible first**: the next item, the list heading, the container. Otherwise focus resets to `body`. https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_focus_discernable_predictable
- [WCAG 2.4.2] **In a single-page app, a route change updates `document.title` and makes the new page perceivable** through the app's one documented focus strategy: focus the new `h1`, focus `main`, or announce the page in a live region while focus stays put. Changing the title alone is not announced. https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html
- [best practice] **Composite widgets are one Tab stop and use arrow keys inside**: tabs, menus, listboxes, radio groups, trees, grids, toolbars. Accordions are not composites, every header stays in the Tab sequence. Each APG pattern lists the exact keys. https://www.w3.org/WAI/ARIA/apg/patterns/
- [WCAG 3.2.1] **Focus alone never triggers a change of context**; opening a menu or navigating on focus is a defect. https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html
- [WCAG 2.1.4] **Single-character shortcuts can be turned off or remapped**, or are active only while a control has focus. https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html
- [best practice] **`autofocus` is rarely right outside a modal `dialog`**, where MDN recommends it on the primary control; elsewhere it moves screen reader users past the content they needed to hear. The lint rule flags every use, so judge the dialog case by hand. Lint: `jsx-a11y/no-autofocus`. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus
- [best practice] **Disable the rest of the page with `inert` or `showModal()`**, not by sprinkling `tabindex="-1"` and `aria-hidden`. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert

## 4. Silent state changes

Smell: a spinner with no text, a toast component that mounts a new `aria-live` region each time, an inline error that appears visually only, a success banner rendered after submit with no announcement.

- [WCAG 4.1.3] **Status messages are announced without moving focus**: `role="status"` for progress and success, `role="alert"` only for errors that need attention now. Do not add `aria-live="assertive"` to `role="alert"`; MDN reports double announcements in VoiceOver. https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- [best practice] **The live region exists before the message does.** Inject text into an existing region; a region created with its content is often not announced. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- [best practice] **`aria-live="assertive"` interrupts; reserve it for errors and time-critical alerts.** https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live
- [WCAG 3.3.1] **Errors are identified in text, associated with the field, and suggest a fix**: `aria-invalid="true"` on the input after the first submit attempt, never on an untouched empty field, with the message linked by `aria-describedby` or `aria-errormessage`. https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- [WCAG 3.3.2] **Required is marked in the markup**, `required` or `aria-required`, and indicated visibly, not by colour alone. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required
- [WCAG 4.1.3] **Loading states say so**: `aria-busy` on the region being replaced and a text status, not only an animation. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy
- [WCAG 1.3.5] **Fields collecting personal data carry `autocomplete` tokens** so browsers and assistive tech can fill them. Lint: `jsx-a11y/autocomplete-valid`. https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html
- [WCAG 3.3.7] **Do not ask for the same information twice in one process**; prefill or let the user select it. https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html
- [WCAG 3.3.8] **Login does not rely on a cognitive test**: allow paste, password managers and passkeys; no transcribing codes without an alternative. https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- [WCAG 3.3.4] **Legal, financial and data-deleting submissions are reversible, checked or confirmed.** https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html

## 5. Structure that lies

Smell: `h4` chosen for its size, three `h1`s, a page with no `main`, a `div` grid that reorders cards with CSS `order`, a skip link that is `display: none`.

- [WCAG 2.4.6] **Headings describe structure, one `h1`, no skipped levels.** Style with CSS, not by picking a smaller heading. https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html
- [WCAG 1.3.1] **Information conveyed by layout is also in the markup**: lists are `ul` or `ol`, data tables have `th` with `scope` and a `caption`, groups have headings or `fieldset`. https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
- [best practice] **One `main`, landmarks for header, navigation, aside and footer**, and all content inside a landmark. `aside` is a top-level landmark, not nested in `main`; `header` and `footer` are landmarks only at body level. https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
- [WCAG 1.3.2] **Visual order matches DOM order.** CSS `order`, `flex-direction: row-reverse` and grid placement that contradict the source confuse keyboard and screen reader users. https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html
- [WCAG 2.4.1] **A skip link is the first focusable element and becomes visible on focus** wherever repeated content precedes `main`. https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
- [best practice] **Hidden means hidden everywhere**: `hidden` or `display: none` removes from the tree and the tab order; a visually-hidden utility keeps text for screen readers only; `aria-hidden` hides from the tree but not the tab order. https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/
- [WCAG 3.2.6] **Navigation and component naming stay consistent across pages**, and help is in the same place on every page that offers it. https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html
- [WCAG 1.3.3] **Instructions never rely on shape, colour, size or position alone**: not "the green button on the right". https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html
- [WCAG 3.1.1] **Page language is set** with `lang` on `html`, and changes of language on the element. Lint: `jsx-a11y/html-has-lang`. https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html

## 6. Images and media

- [WCAG 1.1.1] **Every `img` has `alt`.** Informative: what it conveys. Functional: what it does. Decorative: `alt=""`. Never "image of", the file name, or the caption repeated. Lint: `jsx-a11y/alt-text`, `jsx-a11y/img-redundant-alt`. https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html
- [WCAG 1.1.1] **Complex images get a long description in the page**, linked or adjacent, not crammed into `alt`. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#accessibility
- [WCAG 1.4.5] **No images of text** except logos; style real text instead. https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html
- [WCAG 1.2.2] **Prerecorded video has captions; prerecorded audio has a transcript**; video with meaning in the picture has audio description or a text alternative. The lint rule accepts a `track` on `audio`, which browsers do not render, so check the transcript by hand. Lint: `jsx-a11y/media-has-caption`. https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html
- [WCAG 1.4.2] **Nothing plays sound automatically for more than three seconds without a pause or volume control.** https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html
- [WCAG 2.2.2] **Anything that moves, blinks or auto-updates for more than five seconds can be paused, stopped or hidden**: carousels, tickers, animated backgrounds. Pausing on hover is not a pause control, and animation that starts on scroll into view counts as automatic. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- [WCAG 2.3.1] **Nothing flashes more than three times a second.** https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html

## 7. Visual and pointer

Shared with `css-best-practices` section 8, which covers the same criteria from the stylesheet side.

- [WCAG 1.4.3] **Text contrast is at least 4.5:1; large text 3:1.** Placeholder text and secondary-looking text that is still enabled count; truly disabled controls are exempt. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- [WCAG 1.4.11] **Controls, their states and focus indicators have 3:1 contrast against adjacent colours.** Hover styling is supplemental and exempt, but it must not drop the control or its focus ring below 3:1. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- [WCAG 1.4.1] **Colour is never the only signal**: errors also get text or an icon, links in prose also get an underline. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- [WCAG 1.4.4] **Text resizes to 200 percent without loss**, so no `user-scalable=no`, no fixed-height text containers, `rem` not `px` for type. https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- [WCAG 1.4.10] **Content reflows at 320 CSS pixels wide with no horizontal scrolling**, except for data tables, maps and diagrams. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- [WCAG 1.4.12] **User overrides of line height to 1.5, paragraph spacing to 2, letter spacing to 0.12 and word spacing to 0.16 do not clip text.** https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- [WCAG 1.4.13] **Content shown on hover or focus is dismissible with `Escape`, hoverable, and persistent until dismissed.** A tooltip that vanishes when the pointer moves onto it fails. https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
- [WCAG 2.4.7] **Focus is always visible**; never `outline: none` without a replacement of equal visibility. https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- [WCAG 2.4.11] **The focused element is not hidden behind sticky headers, footers or cookie banners.** https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- [WCAG 2.5.8] **Pointer targets are at least 24 by 24 CSS pixels** or have that much spacing around them, except inline links in text. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- [WCAG 2.5.7] **Every drag has a single-pointer alternative** such as buttons or a menu; a keyboard alternative alone does not satisfy it. Every multipoint or path gesture has a tap alternative. https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- [WCAG 2.5.2] **Actions fire on `up`, not `down`, or can be aborted**, so a slipped press does nothing. https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html
- [WCAG 2.3.3 AAA] **Motion triggered by interaction can be turned off**; honour `prefers-reduced-motion` by reducing, not removing, so `transitionend` listeners still fire, and keep motion non-essential. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- [WCAG 2.5.4] **Device motion is never the only way**: shake, tilt and point gestures have a control equivalent and can be disabled. https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html
- [WCAG 1.3.4] **Orientation is not locked** unless essential. https://www.w3.org/WAI/WCAG22/Understanding/orientation.html
- [WCAG 2.2.1] **Time limits can be turned off, adjusted or extended**, and sessions warn before expiry. https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html

## 8. Tests that prove nothing

Smell: `getByTestId` everywhere, `container.querySelector('.btn')`, an axe run treated as a full audit.

- [best practice] **Query by role and name first**: `getByRole('button', { name: 'Save' })`. It fails when the control has no accessible name, which is the bug you want to catch. https://testing-library.com/docs/queries/about/#priority
- [best practice] **Then label, placeholder, text, display value, alt, title; `getByTestId` last**, only for things with no semantic handle. https://testing-library.com/docs/queries/about/#priority
- [best practice] **Run axe in component or end-to-end tests, and know what it misses.** Automated rules catch a portion of issues; name quality, focus management, reading order and keyboard flows need a human. https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- [best practice] **Each feature gets a keyboard-only pass and a screen reader pass before it ships**, plus 200 percent zoom, 320 pixel width, reduced motion and forced colours. https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling
- [best practice] **Review in this order: semantics, names, keyboard, announcements, visual.** A wrong element makes every later fix a workaround.

## 9. Reusable components accessible by default

A component library sets the floor for every product built on it. Each component ships with:

- [best practice] **A name the consumer cannot forget.** Make the naming prop required in the type (`label`, or `aria-label` as the alternative in a union), or derive the name from required children. An icon button that renders without a name has a defect in its API, not in its usage.
- [best practice] **Semantic structure baked in.** Render the native element (`button`, `a`, `dialog`, `details`, `input` with its `label`) so the role comes with it; never ask the consumer to add a role.
- [best practice] **The keyboard contract of its APG pattern.** Tab stops, arrow keys, `Escape`, `Home` and `End` where the pattern lists them; focus moves in on open and returns on close, handled inside the component.
- [best practice] **Announcements for loading, error and success** through one live region the component owns or a shared one it is given, never a new region per render (section 4).
- [best practice] **ARIA states driven by the component's own state**: `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-busy`, `aria-current` set internally, not duplicated by consumers.
- [best practice] **An API that forwards what accessibility needs**: `id`, `ref`, `aria-*` and `data-*` passthrough, `disabled` versus `aria-disabled` as a documented choice, and markup that still works with no CSS loaded.
- [best practice] **Proof that travels with it**: tests that query by role and name (section 8) and one keyboard journey per interaction pattern, run in the library so consumers inherit them.

## 10. Relationship to lint

`eslint-plugin-jsx-a11y` catches static JSX defects: missing `alt`, a `div` with `onClick`, invalid roles and ARIA props, positive `tabindex`, labels with no control. It cannot see runtime focus, live regions, the rendered accessibility tree, colour, names built from props, or anything in a child component. The table in `references/testing-and-tooling.md` maps every rule to its WCAG criterion and to what still needs a human. If the project has no linter, the table's "Checks" column is the manual checklist and the argument for adding one.

## Modernisation

Prefer modern, native, and accessible browser features over legacy patterns, unnecessary ARIA, and custom JavaScript implementations.

When creating or reviewing interfaces:

1. **Build accessibility in from the start.** Choose semantic HTML, accessible interaction patterns, and appropriate focus management before implementing components.
2. **Identify outdated patterns.** Look for clickable `div` elements, custom controls duplicating native HTML, unnecessary ARIA roles, manual keyboard handling, and legacy accessibility workarounds.
3. **Recommend modern alternatives.** Consider native `<dialog>`, `<details>`, semantic form elements, `inert`, and other modern platform capabilities where appropriate.
4. **Propose rewrites.** When existing code uses outdated or inaccessible approaches, suggest concrete modern replacements, even if the current implementation appears functional.
5. **Explain the benefits.** Describe improvements to semantics, keyboard support, screen-reader behaviour, maintainability, or browser interoperability.
6. **Verify compatibility.** Consider supported browsers, assistive technologies, and known accessibility limitations of newer platform features.
7. **Preserve correct behaviour.** Modernisation must not introduce focus regressions, keyboard traps, or other accessibility problems.

Do not preserve legacy accessibility patterns solely because they currently work. Recommend modernisation while distinguishing accessibility failures from optional improvements.

## Relationship to project rules

Where a project's CLAUDE.md or design system is stricter (a component library that must be used, a fixed set of live regions, a testing convention), the project wins. Where they overlap, cite the source above so the reasoning is visible rather than restating the team rule.
