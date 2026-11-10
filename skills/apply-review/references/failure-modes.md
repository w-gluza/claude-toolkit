# Failure modes to probe

Use this when verifying a review finding, when reviewing a change yourself, or after a fix to check it did not move the problem. Each line is a question with a concrete probe. Skip the ones that cannot apply.

## Concurrency

- Two requests read the same state, both write. Probe: `Promise.all` of several calls against one instance; check totals afterwards, not just statuses.
- A retry loop with a bounded budget meets more contenders than the budget. Probe: more simultaneous calls than retries; the loser must get a recoverable, documented outcome (a retry-later signal, a queue, a clear error), never an unhandled exception or a silent drop.
- A queue or lock that does not release after a throw. Probe: make the first task throw, then run a second; it must complete.
- Serialisation in one process hides the need for a version check across processes. Probe: ask what happens with two replicas.

## Malformed data

- Coercion of unknown input: `Number(x)`, `String(x)`, `+x`, template literals. Probe: an object with `toString: null` and `valueOf: null`; it throws inside the coercion.
- Negative, fractional, NaN, Infinity, `-0`, numbers above `Number.MAX_SAFE_INTEGER`. Probe each where an integer is expected.
- Strings: empty, whitespace only, leading or trailing spaces, mixed case, over the length limit, multi-byte characters where length is counted in UTF-16 units.
- Identity strings used as keys without normalisation. Probe: `"Alice"`, `" alice "`, `"ALICE"` should be one key or three, by design, and the design should be written down.
- Response bodies from your own API treated as trusted. Probe: a JSON 500, a success body with a missing field, a non-JSON body, `null`. The client must keep its previous state.
- Discriminated unions where a variant's required field is missing. Probe: every variant with each required field removed.

## Resource exhaustion

- Maps keyed by caller-supplied values that are never deleted. Probe: many unique keys, then wait past expiry; memory must be reclaimed.
- Cleanup that scans everything on every call once a threshold is passed. Probe: traffic that stays above the threshold with nothing expiring; time per call must stay flat, which usually means bounding the work per call or per window.
- Request bodies without a size limit. Probe: a body larger than any legitimate request.
- Algorithms whose cost grows with a value the caller controls. Probe: the maximum allowed value; look for an early exit tied to an invariant.

## Lost and partial outcomes

- The server commits, the response is lost, the client retries. Probe: drop the response after a successful write; a second identical request must not double-commit without an idempotency key, or the gap must be documented.
- Partial success across two writes without a transaction. Probe: fail the second write; the first must be rolled back or the state must still be valid.
- Client state cleared before the outcome is known. Probe: a failed request must leave the user's input in place.

## Time

- Boundaries: an event at exactly the window edge. Probe: `cutoff` and `cutoff + 1`; the inclusive side must be a decision, with a test.
- Clock moving backwards or jumping. Probe: a timestamp in the future stored in a window; what does the next call compute?
- Real time in tests. Probe: tests that sleep are slow and flaky; fake timers or an injected clock replace them.

## Tests

- A test name that claims more than its assertions check. Probe: delete the code the name describes; does the test fail?
- Only the happy path through the real entry point. Probe: refusal paths through the same route, not only through the unit.
- Simulated concurrency (a stub that fails once) without real concurrency (`Promise.all`). Both are needed; they catch different things.
- A regression test that passes before the fix. It is not a regression test.
