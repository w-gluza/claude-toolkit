# Concurrency and state reliability

Patterns for a service that holds shared mutable state, starting in one process and later moving to a database. Read when designing the server side of a feature with writes, or when reviewing one.

## Store behind an interface

```ts
type Store<S> = {
  load(): Promise<{ state: S; version: number }>;
  save(next: S, expectedVersion: number): Promise<boolean>;
};
```

The in-memory implementation and the database implementation satisfy the same shape. Tests use the in-memory one. `save` returns `false` when the version moved, which is the whole optimistic concurrency protocol: read, compute, write-if-unchanged, otherwise reload and recompute.

Hand out copies from `load` so a caller cannot mutate stored state by accident.

## Serialise per resource, keep the version check

In one process, a per-resource promise queue removes contention entirely:

```ts
const queues = new WeakMap<object, Promise<unknown>>();

const serialise = <T>(key: object, task: () => Promise<T>) => {
  const previous = queues.get(key) ?? Promise.resolve();
  const run = previous.then(task, task);
  queues.set(key, run.catch(() => undefined));
  return run;
};
```

`then(task, task)` runs the next task whether the previous resolved or rejected, and the stored tail swallows the rejection so the chain never sticks. Test both: a thrown task followed by a successful one.

Keep the version check even though the queue makes it redundant in one process. Two replicas share a database, not a queue; the version check is what protects them.

## Retry budget ends in a recoverable answer

A fixed number of reload-and-retry attempts can be exhausted by ordinary traffic. When it is, throw a named error (`ConflictError`) and map it at the HTTP boundary to 503 with `Retry-After`, never to an unhandled 500. The client shows "busy, try again"; the user's input stays.

## Idempotency for retries

If the server commits and the response is lost, a client retry commits again. The fix is an idempotency key per attempt, sent with the request and stored atomically with the result, so a repeat returns the stored result instead of writing twice. When this is out of scope, say so where the limits are documented; do not pretend the retry is safe.

## Partial failure

Two writes without a transaction can leave the first applied and the second not. Options, in order of preference: one write that carries both changes; a transaction; a compensating write with a test that forces the second write to fail. The chosen option is a decision to record.

## Limiters and other caller-keyed maps

- Sliding window per key, decided before any work the caller could use to probe state.
- Refused attempts are not recorded, or the caller can lock themselves out forever; this is a decision to write down either way.
- Expired entries are swept, but not on every call: at most once per window, or a bounded slice per call. A threshold triggers the sweep; it is not a cap on size, and the difference is stated.
- Keys are normalised identity (see boundary-validation), never raw input.

## Moving to a database

- The version column replaces the in-memory counter: `UPDATE ... SET ..., version = version + 1 WHERE id = ? AND version = ?`, zero rows means conflict.
- A limiter becomes one conditional insert: insert the attempt only if fewer than N attempts by that key exist in the window.
- Keep the in-memory implementations for tests; the database ones get a small test against a disposable branch or schema.
- The per-process queue stays; it reduces conflicts, and the version check handles the rest.
