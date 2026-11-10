---
name: react-best-practices
description: React 19 code-review rules distilled from the official react.dev docs, each with a source link. Load when reviewing or writing React components, hooks, state or effects so the code matches what the documentation prescribes.
allowed-tools: Read, Grep
---

# React best practices (from react.dev)

Target: React 19.2. Rules apply from React 19.0 unless marked with a later version. Extracted 2026-09-18 from react.dev Learn, Reference and Rules pages; see NOTICE.md for the licence.

This file is the review checklist and the normal load: the rules that most often catch real defects, grouped by the smell you see in a diff, each tagged [correctness], [performance] or [maintainability]. Correctness rules hold everywhere; the other two are defaults a framework or the project's CLAUDE.md may override. The full set (433 rules, each with a short quotation from the docs and one source anchor) lives in `references/`. Grep there for the exact wording or a rule not listed here; never read a reference file whole, each is 40 to 60 KB.

- `references/effects.md` - You Might Not Need an Effect, Synchronizing, Removing Dependencies, Separating Events from Effects, Lifecycle
- `references/state.md` - Choosing State Structure, Sharing, Preserving and Resetting, Snapshot, Queueing, Updating Objects and Arrays, Reacting to Input, Reducers
- `references/purity-hooks-refs.md` - Keeping Components Pure, Rules of React, Rules of Hooks, Custom Hooks, Refs, Context, Reducer plus Context
- `references/rendering-and-api.md` - Lists and keys, Conditional Rendering, Props, Thinking in React, useMemo, useCallback, useEffect, useState, useRef pitfalls, React 19 changes, React Compiler

When citing a rule in a review, link the react.dev source so the author can read the reasoning.

## 1. Effects that should not exist

Smell: a `useEffect` whose body calls a setter, or that watches a flag set by a user action.

- [correctness] **Derived values are computed during render, not stored.** If it can be calculated from props or state, calculate it inline or with `useMemo`. https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state
- [correctness] **No effect to reset or adjust state when a prop changes.** Reset a subtree with a `key`, or compute during render. https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes and #adjusting-some-state-when-a-prop-changes
- [correctness] **User events belong in event handlers.** An effect that fires a request or toast because `submitted` became true is wrong; put it in the handler. https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers
- [correctness] **No effect chains.** Several effects each setting state that triggers the next one means the logic should be in one handler or computed during render. https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations
- [correctness] **Do not notify the parent from an effect.** Call `onChange` in the same handler that updates local state. https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes
- [maintainability] **Do not pass data up to the parent via effect.** Lift the state so the parent owns it and passes it down. https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent
- [correctness] **Do not sync `useState` from props with an effect.** Either make it fully controlled or fully uncontrolled with a `key` reset. https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
- [performance] **Expensive computation goes in `useMemo`, not in effect plus state.** Measure first; only memoize when it is actually slow. https://react.dev/learn/you-might-not-need-an-effect#caching-expensive-calculations

Legitimate effects synchronise with something outside React: subscriptions, DOM measurement, third-party widgets, analytics on mount. https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events

## 2. Effects that exist but are written wrong

- [correctness] **Every effect that sets something up returns a cleanup.** Subscriptions, timers, fetches (ignore flag or AbortController), animations. Strict Mode double-invokes to expose the missing cleanup. https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
- [correctness] **Dependencies are not chosen, they are derived from the code.** Never suppress the linter; change the code so the dependency is not needed. https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code
- [correctness] **Object and function dependencies created in render retrigger every time.** Move them inside the effect, outside the component, or depend on primitives extracted from them. https://react.dev/learn/removing-effect-dependencies#move-dynamic-objects-and-functions-inside-your-effect
- [correctness] **Use an updater function instead of depending on the state you set.** `setCount(c => c + 1)` removes `count` from the deps. https://react.dev/learn/removing-effect-dependencies#are-you-reading-some-state-to-calculate-the-next-state
- [correctness] **Reactive values read in an effect are dependencies, no exceptions.** Props, state, and anything computed from them in the component body. https://react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values
- [correctness] **Non-reactive reads inside effects use `useEffectEvent`.** When you need the latest value without resubscribing (logging the current theme on connect, a callback prop a timer should call). Stable since React 19.2; on older versions restructure instead. https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
- [maintainability] **Think of each effect as an independent synchronisation, not a lifecycle.** Do not merge unrelated concerns into one effect. https://react.dev/learn/lifecycle-of-reactive-effects#each-effect-represents-a-separate-synchronization-process
- [correctness] **Fetching in an effect needs race protection and a cleanup.** Or let the framework or a query library (TanStack Query, SWR) own fetching, which is what the docs recommend for anything beyond a demo. https://react.dev/learn/synchronizing-with-effects#fetching-data

## 3. State shape

Smell: two `useState` calls always set together, a boolean per UI state, or state that duplicates a prop.

- [maintainability] **Group related state.** Values that always change together belong in one object. https://react.dev/learn/choosing-the-state-structure#group-related-state
- [correctness] **Avoid contradictions.** Replace `isSending` plus `isSent` with a single `status` union. https://react.dev/learn/choosing-the-state-structure#avoid-contradictions-in-state
- [maintainability] **Avoid redundant state.** Do not store what can be computed from other state or props. https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state
- [correctness] **Do not mirror props in state.** The state will not update when the prop changes. Exception: an initial value you intentionally want to ignore later, named `initialX` or `defaultX`. https://react.dev/learn/choosing-the-state-structure#don-t-mirror-props-in-state
- [correctness] **Avoid duplication.** Store the selected item's id, not a copy of the item. https://react.dev/learn/choosing-the-state-structure#avoid-duplication-in-state
- [maintainability] **Avoid deeply nested state.** Flatten to id maps when updates get awkward. https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state
- [correctness] **Treat state as read-only.** Never mutate objects or arrays in state; spread, `map`, `filter`, or `toSorted`. Mutating breaks memoisation and shows stale UI. https://react.dev/learn/updating-objects-in-state#treat-state-as-read-only and https://react.dev/learn/updating-arrays-in-state
- [correctness] **Use an updater when the next value depends on the previous one**, especially when setting several times in one event. https://react.dev/learn/queueing-a-series-of-state-updates#updating-the-same-state-multiple-times-before-the-next-render
- [correctness] **State is a snapshot.** Reading state right after `setState` gives the old value; do not build logic on it. https://react.dev/learn/state-as-a-snapshot#state-over-time
- [maintainability] **Reach for a reducer when many handlers update the same state in complex ways.** https://react.dev/learn/extracting-state-logic-into-a-reducer#comparing-usestate-and-usereducer

## 4. Where state lives

- [correctness] **Lift state to the closest common parent** when two siblings must stay in sync; pass value and setter down as props. https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example
- [correctness] **Controlled or uncontrolled, pick one per prop.** A component should not both accept `value` and hold its own copy. https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components
- [correctness] **State is tied to position in the tree.** Same component in the same slot keeps its state; different component or different position resets it. https://react.dev/learn/preserving-and-resetting-state#state-is-tied-to-a-position-in-the-render-tree
- [correctness] **Reset state with `key`, not with an effect.** https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key
- [correctness] **Never define a component inside another component.** Every render creates a new type and wipes its state. https://react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state
- [maintainability] **Context is for data many components at different depths need.** Try props and component composition (passing children) first. https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context

## 5. Purity and the Rules of React

- [correctness] **Components and hooks are pure.** Same props, state and context produce the same JSX. No reading of mutable globals, no `Date.now()` or random in render without a stable source. https://react.dev/reference/rules/components-and-hooks-must-be-pure
- [correctness] **Do not mutate anything that existed before render.** Props, state, context, hook arguments and return values are immutable. Local mutation of a value created in this render is fine. https://react.dev/reference/rules/components-and-hooks-must-be-pure#local-mutation
- [correctness] **Do not read or write `ref.current` during render.** Read it in handlers or effects. https://react.dev/reference/rules/components-and-hooks-must-be-pure#lazy-initialization
- [correctness] **Call hooks only at the top level**, never in conditions, loops, or after an early return, and only from components or other hooks. https://react.dev/reference/rules/rules-of-hooks
- [correctness] **Never call a component as a function.** Render it as JSX so React can own its state and hooks. https://react.dev/reference/rules/react-calls-components-and-hooks#never-call-component-functions-directly
- [correctness] **Do not pass hooks around as values or call them dynamically.** https://react.dev/reference/rules/react-calls-components-and-hooks#never-pass-around-hooks-as-regular-values
- [correctness] **Side effects go in handlers first, effects last.** https://react.dev/learn/keeping-components-pure#where-you-_can_-cause-side-effects

## 6. Custom hooks

- [correctness] **A custom hook shares stateful logic, not state.** Two callers get independent state. https://react.dev/learn/reusing-logic-with-custom-hooks#custom-hooks-sharing-logic-between-components
- [maintainability] **Name it `useSomething` and only if it calls hooks.** A plain function that calls no hooks must not be named `use`. https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use
- [maintainability] **Keep custom hooks focused on a concrete use case.** `useChatRoom`, not `useMount` or `useEffectOnce`; lifecycle wrappers hide missing dependencies. https://react.dev/learn/reusing-logic-with-custom-hooks#keep-your-custom-hooks-focused-on-concrete-high-level-use-cases
- [maintainability] **Before writing one, check whether the logic should be no hook at all.** Often it is a plain function or a value computed during render. https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks

## 7. Refs

- [correctness] **Refs hold values that do not affect rendering**: timer ids, DOM nodes, previous values for handlers. If the UI should change when it changes, it is state. https://react.dev/learn/referencing-values-with-refs#differences-between-refs-and-state
- [correctness] **Do not manipulate DOM that React manages.** Only touch nodes React has no reason to update. https://react.dev/learn/manipulating-the-dom-with-refs#best-practices-for-dom-manipulation-with-refs
- [maintainability] **`ref` is a regular prop; `forwardRef` is no longer needed** for new function components (React 19.0). https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
- [maintainability] **Ref callbacks may return a cleanup.** Prefer that over checking for `null` in the callback (React 19.0). https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs

## 8. Rendering

- [correctness] **`key` comes from the data and is stable.** Never `Math.random()` or an id generated in render. Index is acceptable only for a static list that never reorders or filters. https://react.dev/learn/rendering-lists#where-to-get-your-key
- [maintainability] **Keys are per sibling list**, unique among siblings, not globally. https://react.dev/learn/rendering-lists#rules-of-keys
- [correctness] **`&&` with a number on the left renders `0`.** Prefer a ternary with `null`; it is safe for every operand type and reads the same everywhere. https://react.dev/learn/conditional-rendering#logical-and-operator-
- [performance] **Do not add `useMemo` or `useCallback` everywhere.** Only when an input to a memoised child, a dependency of an effect, or a measured expensive calculation. With the React Compiler enabled, add neither by hand; the compiler memoises and hand-written calls are noise. https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere
- [performance] **`useCallback` is only worth it if the consumer is memoised** or it is an effect dependency. https://react.dev/reference/react/useCallback#should-you-add-usecallback-everywhere
- [performance] **Lazy initial state takes a function**, `useState(() => compute())`, not `useState(compute())`, when the initial value is expensive. https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
- [performance] **Write code the React Compiler can understand.** Follow the Rules of React, avoid mutating values after creation, keep components and hooks pure. The compiler skips components that break them. https://react.dev/learn/react-compiler/introduction

## 9. React 19 API notes

- `<Context>` can be rendered directly as the provider; `<Context.Provider>` still works but is the old form (React 19.0). https://react.dev/blog/2024/12/05/react-19#context-as-a-provider
- `useActionState`, `useOptimistic` and `use` are the form and data primitives (React 19.0). If the project already owns forms or data fetching with a library, do not mix the two models in one feature; pick per project and note the choice in its CLAUDE.md.
- Removed in 19: `propTypes`, `defaultProps` on function components, legacy context, string refs, `ReactDOM.render`. https://react.dev/blog/2024/04/25/react-19-upgrade-guide

## Relationship to a project's CLAUDE.md

A project's own React conventions usually restate a subset of these rules. Where they overlap, cite react.dev so the reasoning is visible. Where the project's CLAUDE.md is stricter (for example a ternary over `&&` always, or a preferred component style), the project rule wins.
