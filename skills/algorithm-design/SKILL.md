---
name: algorithm-design
description: Design and implement non-trivial algorithms as small pure functions with validation, deterministic results and oracle-backed tests. Use when a task involves optimisation, search, scheduling, allocation, pricing, matching, or any logic where correctness is not obvious from reading the code.
metadata:
  trigger: words like fewest, optimal, minimum, allocate, schedule, match; dynamic programming, greedy, backtracking; any function whose correctness needs proof rather than inspection
---

# Algorithm design

Correctness first, then readability, then speed. Most application algorithms run on small inputs; a clear solution that is provably right beats a clever one that is probably right.

## Principles

1. **Pure functions.** Same inputs, same outputs. No clock, no randomness, no I/O inside the algorithm.
2. **Immutability at the boundary.** Never mutate an argument; return new values. Inside the function, mutate the structures it created itself (a working array, a DP table) when that is clearer or faster.
3. **Deterministic results.** When several answers are equally good, the tie-break is explicit and documented, so tests and users see the same answer every time.
4. **Small, focused functions.** One function sets up, one does a single step, one assembles the result. No single function that does everything. Decompose by step, not by introducing abstractions the problem does not have.
5. **No side effects.** Persistence, state updates, logging and rate limits live outside the algorithm and call it.
6. **Validate inputs.** Reject bad input with a clear error. Never silently clamp, round or repair.
7. **Explain the choice where a reader will look.** The test that holds the counterexample is named for it. The complexity and the rejected simpler approach go in the PR or commit description. A doc comment on the public entry point is allowed only when names and tests cannot carry the why; no comments on every function.

## Process

1. **State the problem precisely.** Inputs, outputs, constraints, and what "best" means. Write it down first, as the test descriptions and the entry function's signature and names.
2. **Try the simple approach first and look for the counterexample.** Greedy, a single loop, a sort. If it is correct, stop. If not, record the counterexample; it becomes a test.
3. **Pick the smallest correct approach.** Dynamic programming, backtracking, or search, bounded by the real input size. Record the complexity alongside the explanation of the choice (principle 7).
4. **Decompose.** Setup, step, assemble. Each piece is testable on its own.
5. **Test against an oracle when one is practical.** If a brute-force version can be written that is obviously correct and runs on small inputs, write it and compare results over many generated inputs. When no such oracle exists, use known-answer cases and property checks (the result satisfies every constraint; a better result cannot be found by local change). In both cases add the counterexample from step 2, the edge cases (empty, zero, maximum), an immutability check (freeze the input) and a determinism check (call twice, compare).
6. **Read it as a reviewer.** If the algorithm cannot be followed top to bottom in one pass, split it further or rename.

## Checks before finishing

- Does any function mutate its arguments?
- Is the tie-break stated?
- Is there an oracle test where one was practical, or known-answer and property tests where not, and do they cover inputs where the simple approach fails?
- Do invalid inputs throw rather than return a wrong answer?
- Is the reason for this approach, with its counterexample, findable in a test name or the PR description?
- Can the algorithm be read top to bottom without scrolling back?
