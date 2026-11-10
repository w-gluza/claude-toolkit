# Personal defaults

Everything in this file is a preference. The engineering principles (cohesion, one-way dependencies, thin entry points, server-only isolation, no speculative layers) live in `SKILL.md` and apply everywhere. A preference here yields to an existing repo convention; apply it unchanged only in a new project or where the repo has no convention yet.

## Structure defaults

- Organise by ownership and responsibility first. Create shared directories only when code is genuinely shared.
- `app/` holds routes only: layouts, pages, route handlers (Next.js). For a one-page site with no API, keeping everything inside `app/` is acceptable.
- `features/<feature>/` holds feature-specific UI and behaviour, including the feature's own domain logic (e.g. `features/checkout/calculateTotal.ts`). Logic stays framework-free where that keeps it testable, but it lives with the feature that owns it.
- `components/` holds shared UI primitives that know nothing about any feature. No `ui/` sub-level until a second category of shared component exists.
- `lib/` holds genuinely shared utilities and integrations. Not a home for domain logic.
- `server/` holds server-only modules; database access in `server/db/`. These import `server-only` so a client import fails at build time.
- `data/` holds static content, when needed. Content and data stay out of presentation components.
- Import direction between these: `app` -> `features` -> `components`, `lib`, `server`; `components` and `lib` import nothing from `features` or `app`.
- Path alias `@/` for cross-directory imports, relative paths inside a directory. A declared alias that is unused gets removed.
- In Next.js projects, no `src/` unless team conventions or project size justify it.

## Inside a feature

Group by kind once a feature has more than a handful of files: `components/` (one kebab-case folder per component, module beside it), `hooks/`, `domain/` (pure rules and types, with tests beside them), and one `index.ts` at the feature boundary.

No pattern suffixes (`Screen`, `Container`, `Controller`, `View`): since hooks, the stateful and presentational split is still made but not named. The component that owns state and talks to the API takes the feature's plain name, sits at the feature's top level beside `index.ts` (not inside `components/`, which would repeat the feature name), and is what `index.ts` exports. The visual components in `components/` are named for the thing they draw and take props. When a visual component is made of parts nothing else uses, nest their folders under it; keep the peers the stateful component lays out at the same level as it.

```
features/checkout/
  Checkout.tsx                             owns state via the hook, lays out the peers
  components/
    basket/Basket.tsx                      presentation only, props in, callbacks out
      basket-line/BasketLine.tsx           a part of Basket, used nowhere else
    payment-panel/PaymentPanel.tsx         a peer Checkout places beside Basket
  hooks/useCheckout.ts
  domain/calculateTotal.ts, calculateTotal.test.ts, types.ts
  index.ts                                 exports Checkout
```

How the screen, the presentation component and the hook divide state and behaviour, and the interaction rules that follow, are in `screen-pattern.md`. Server-side write paths (versioned store, serialisation, retries, limiters, moving to a database) are in `concurrency.md`.

## Style defaults

- **kebab-case** for all directories (e.g. `user-profile/`, `date-picker/`). Keep framework-reserved names such as `app/`, `page.tsx`, and `route.ts` as required.
- **PascalCase** for React component filenames (e.g. `DatePicker.tsx`) and matching CSS Modules (e.g. `DatePicker.module.css`).
- **camelCase** for utilities and hooks (e.g. `formatDate.ts`, `useDebounce.ts`).
- One component per file; its CSS module and test sit beside it (`DatePicker.tsx`, `DatePicker.module.css`, `DatePicker.test.tsx`).
- CSS module class names in camelCase so `styles.primaryButton` reads without bracket access.
- Named exports and arrow-function components; default exports where the framework requires them.
- `XProps` type aliases; destructure props in the function signature where readable.
- CSS Modules for scoped styles and minimal global styling. Reuse existing design-system choices instead of introducing a styling stack.
- Barrel exports (`index.ts`) at useful public module boundaries; not in every folder, and never creating circular imports.
- Small, clear modules without artificial line limits or splitting for its own sake.
