---
name: test-layers
description: Decide which layer a test belongs to - unit, integration through real entry points, or end-to-end in a browser - and write it so each layer proves something the others cannot. Use when adding tests to a feature, when asked "what should we test", when coverage feels duplicated, or when a test suite is slow or flaky.
metadata:
  trigger: questions like what tests do we need, add tests, is this covered; integration test, e2e, Playwright, fake timers, flaky test, duplicated tests
---

# Test layers

Each layer answers a different question. A behaviour is proven once, at the lowest layer that can prove it, and the layers above only check that the pieces are wired together.

| Layer | Question it answers | Runs against | Speed |
|-------|---------------------|--------------|-------|
| Unit | Is this rule right? | one module, no I/O | milliseconds |
| Integration | Do the real entry points share state and agree? | real entry points (route handlers, or a rendered tree of connected components), in-memory dependencies, injected clock | tens of milliseconds |
| End-to-end | Can a person do the job through the UI? | built app in a browser | seconds |

## Where a test goes

- **A rule, a calculation, a parser, a decision**: unit, beside the code, named for the behaviour. Algorithms get an oracle test; see the algorithm-design skill rather than repeating it here.
- **Input validation**: a unit table test over the bad inputs, plus one integration case proving the entry point rejects them before touching anything.
- **Sequences across requests, shared state, agreement between endpoints or between connected components**: integration. Boot the real entry point, whether route modules or a rendered tree, with a seeded instance. Assert that what one side returns matches what the other reads.
- **Time windows**: integration with fake timers or an injected `now`. Test both sides of the boundary (`edge - 1`, `edge`) and say which side is inclusive. Never sleep.
- **Concurrency**: two tests. A stub that fails once proves the retry path; a real `Promise.all` proves the outcome under contention. Assert totals afterwards, not only statuses.
- **Interaction rules of a screen** (what stays, what clears, what is disabled while pending, what a failed request leaves behind): end-to-end, two to four journeys, role and name locators. Not twenty.
- **Visual appearance**: not asserted through CSS or layout checks. A design system or shared component library gets a visual regression snapshot per component state; elsewhere, none.

## Rules

1. **Prove it once.** If the unit test shows an expired code is refused, the integration test shows only that the refusal reaches the caller and leaves state untouched. It does not re-assert the expiry calculation.
2. **The name claims only what the assertions check.** "Does not touch the limiter" needs an assertion on the limiter. Delete the code the name describes; the test must fail.
3. **Seed, do not share.** Each integration test boots its own instance. If the app keeps a process-wide singleton, the helper that replaces it is the only place that knows how.
4. **Inject the clock.** Any code that reads the time takes a `now` argument or a clock, so tests pass a value.
5. **Refusal paths through the real entry point.** One happy path through the routes is not integration coverage.
6. **A regression test fails before the fix.** Write it first, watch it fail for the reported reason, then fix.
7. **End-to-end runs against a fresh build on a spare port.** Start with one worker and no retries so flakiness surfaces. Add workers once every test owns its own data; treat a retry count as a diagnostic, never the fix.
8. **Separate the runners.** Each runner picks only its own files, by suffix or by folder. Follow the repo's convention; where there is none, unit and integration files end in `.test.ts` and browser specs end in `.spec.ts` in their own folder.

## Checks before finishing

- Which layer proves each behaviour, and is any behaviour proven twice?
- Is there a test whose name promises more than it asserts?
- Does any test sleep, read the real clock, or depend on another test's leftovers?
- Does the integration layer exercise every refusal path, not only success?
- Is there a real-concurrency test where state is shared?

`references/patterns.md` has the mechanics: seeding a singleton, fake timers, concurrency, tables.
