---
name: systematic-debugging
description: Diagnose software bugs through reproducible evidence, hypothesis testing and root cause analysis, and fix them at the cause with a regression test when asked. Use when investigating unexpected behaviour, failing or flaky tests, regressions, intermittent failures, or errors with an unknown cause.
metadata:
  trigger: >-
    bug report, error message, stack trace, "why does this happen",
    "it sometimes fails", "it worked before", a fix that did not hold
  pairs-with: evidence-synthesis, test-layers, apply-review, conventional-commits
---

# Systematic debugging

Investigate failures systematically. Reproduce the problem, isolate the cause, test hypotheses, and verify the outcome. Do not guess at fixes or change code because something looks suspicious. A change made without a reproduction is a guess with a commit message.

This skill owns the loop from symptom to fix. Whether the fix is live in a given environment is a question for evidence-synthesis. Where the regression test belongs is answered by test-layers. A bug that arrived as a review finding goes through apply-review, which uses this skill for the reproduction and the fix.

## Modes

- **Investigate** (default when the ask is why something happens, or the bug is reported without a request to fix it): sections 1 to 4, then the report. No code changes beyond temporary probes, which are removed.
- **Fix** (when asked to fix): every section.

## Principles

1. **Reproduce before fixing.** Establish what fails, under which conditions, and what should happen instead.
2. **Evidence over intuition.** Treat suspected causes as hypotheses until supported by observations. Reading code shows what should happen; only running it shows what does.
3. **Change one variable at a time.** Prefer controlled experiments that isolate behaviour, and record each result.
4. **Protect sensitive information.** Never expose credentials, tokens, personal data or secrets when inspecting or reporting logs and requests.

## 1. Establish the failure

Identify:

- **Expected behaviour:** What should happen?
- **Actual behaviour:** What happens instead?
- **Reproduction:** Which actions or inputs trigger the failure?
- **Scope:** Which users, components, requests or environments are affected?
- **Frequency:** Always, intermittently, or under specific conditions?
- **Regression:** Did this work previously? What changed?

Write the symptom as the name of the regression test it will become. A symptom that cannot be stated that way is not yet understood.

Collect available evidence: error messages, stack traces, failing tests, logs, request details and relevant code, each with where it came from and which environment it describes.

If reproduction is not possible, describe what has been observed and what remains unknown. Do not invent reproduction steps, and do not proceed to a fix.

## 2. Isolate the problem

Narrow the investigation before changing anything.

- Read before probing: the relevant implementation, its callers and its existing tests. Debugging from the error message alone skips the context that explains it.
- When a test fails, decide first whether the defect is in the application or in the test: a fixture, a mock, the environment or the assertion itself. Never change production behaviour to satisfy an incorrect test.
- Reduce the failing input or sequence of actions to the smallest that still fails.
- Identify the first observable divergence from expected behaviour.
- Trace the relevant data and control flow.
- Bisect when the failure looks like a regression: `git bisect` over commits, binary search over the input, half the configuration or half the page at a time.
- Compare working and failing environments.
- Identify external dependencies that could affect the result.
- Distinguish the primary failure from errors caused by it.

Prefer the smallest experiment that can eliminate an entire category of causes. Do not assume the most recently modified code caused the problem.

## 3. Form and test hypotheses

For each plausible explanation:

1. State the suspected cause.
2. Identify the evidence supporting it.
3. Define an observation that would confirm or contradict it.
4. Make that observation: a log line, a debugger, a failing assertion, a probe request.
5. Record the result.
6. Reject, refine or retain the hypothesis.
7. When the evidence disproves it, revert your own experimental edits and nothing else; the user's work stays as it was.

A failed patch leaves the hypothesis unresolved, not refuted: a correct explanation can be implemented incorrectly. Check whether the experiment actually tested the hypothesis before rejecting it.

Prefer experiments that distinguish between competing explanations. When several remain, rank them by supporting evidence and diagnostic value, not convenience. If two hypotheses in a row are refuted, go back to isolating instead of forming a third.

## 4. Identify the root cause

A root cause explanation establishes:

- Where the incorrect behaviour originates.
- Why the implementation produces that behaviour: the assumption that was wrong.
- Which conditions trigger the failure.
- How the cause connects to the observed symptoms.
- Which evidence supports the explanation.

Distinguish between:

- **Root cause:** the underlying defect responsible for the failure.
- **Trigger:** the input or event that exposes it.
- **Symptom:** the observable incorrect behaviour.
- **Contributing factor:** a condition that increases the likelihood or impact of the failure.

When evidence is insufficient, report the most likely explanation as a hypothesis, labelled as one, not as a confirmed cause.

## 5. Apply a fix when requested

Only in fix mode.

- Choose the smallest change that addresses the established cause. No refactor in the same change.
- Never fix by weakening a test, widening a type, catching and ignoring, or adding a retry around the symptom.
- Follow existing project conventions and architecture.
- Preserve intended behaviour outside the affected scenario.
- Consider whether the same defect exists elsewhere and say so, without fixing it in the same change.
- Add a regression test that failed before the fix for the reported reason and passes after, named for the behaviour. Use test-layers to place it.
- Remove every temporary probe (logging, console output, sleeps, debug flags). A probe worth keeping becomes a deliberate log line with a name and a level, in its own change.
- Record anything noticed on the way under Not changed, with where it is logged.

If the investigation reveals an architectural problem, explain the trade-offs before proposing a broader change. Do not silently expand the scope of the fix. Draft the commit with conventional-commits; do not run it.

## 6. Verify the outcome

Verification must demonstrate that the original failure is resolved.

- Re-run the original reproduction.
- Verify the expected behaviour.
- Run the relevant automated tests, and walk the changed code through the apply-review failure-modes list: a stricter check can reject a legitimate input, a cleanup can become a hot loop, a retry can double-commit.
- Check important adjacent behaviours and failure paths.
- Confirm that no unintended state changes or regressions were introduced.
- State the environment every check ran in. Confirmation in staging or production is an evidence-synthesis question; do not infer it from a local pass.

A passing test suite alone does not establish that the original problem is resolved. If verification is incomplete, state exactly what was and was not checked.

## Intermittent and environment-specific failures

When failures cannot be reproduced reliably:

- Compare environment variables, configuration, versions and dependencies.
- Investigate timing, concurrency, caching and shared state.
- Check for ordering assumptions and race conditions.
- Correlate logs, traces and requests using available identifiers.
- Use controlled instrumentation where authorised.
- Distinguish environmental differences from application defects.

A flaky test is a bug with a timing or ordering cause. Find it; never silence the test with a retry count or a skip. Never treat a failure that disappears during investigation as proof that it has been fixed.

Avoid modifying production state, triggering risky operations or enabling sensitive logging without explicit authorisation.

## Output

Adapt the detail to the investigation. Use these sections when applicable:

1. **Problem:** expected and actual behaviour, scope, reproduction, environment.
2. **Evidence:** relevant observations, errors, logs, tests and source references.
3. **Investigation:** hypotheses tested and their outcomes.
4. **Root cause:** confirmed explanation, or a hypothesis labelled as one.
5. **Fix:** changes made, or the proposed correction in investigate mode. Test name.
6. **Verification:** tests and reproduction results, the environment they ran in, and limitations.
7. **Not changed:** things noticed and deferred, with where they are recorded.
8. **Remaining questions:** unresolved uncertainty or required follow-up.

Keep the report proportional to the problem. For a straightforward bug, a few lines are enough. Never claim a bug is fixed without verification evidence.

## Checks before finishing

- Does a reproduction exist, and did it fail before the fix and pass after?
- Is the root cause a wrong assumption, not a line that looked suspicious?
- Is any claim in the report without evidence or without its environment?
- Did a probe, a sleep or a retry survive into the change?
- Did the change touch anything the reproduction did not require?
