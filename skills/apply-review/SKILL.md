---
name: apply-review
description: Assess code review findings from a person or another AI session, and apply the justified ones when asked. Use when review notes are pasted or received, when asked "is this valid?", "apply the review" or "what do we do with this feedback", and when the same reviewer returns for a second round.
metadata:
  trigger: pasted review findings, "apply this review", "the reviewer says", "is this valid?", second-round feedback on a change
---

# Apply review

A review is a list of claims. Each claim is verified, classified and either fixed, deferred with a reason, or rejected with evidence. The work ends with tests that would have caught the fixed defects and a short report of what happened to every item.

## Modes

- **Assess** (default when findings arrive without an instruction, or the ask is whether they are valid): steps 1 to 3, then the report. No code changes.
- **Apply** (when asked to apply, fix or act on the review): every step.

## Process

1. **Read the whole review before touching anything.** Group related findings. A single root cause often appears as three symptoms.
2. **Verify each finding against the code.** Open the file and line it names. Reproduce it: a failing test, a script, a request with the exact payload. A finding that cannot be reproduced is marked unverified, not fixed on trust. A reviewer's line number can be stale; the claim can still be right.
3. **Classify and rate separately.** Type: bug (wrong behaviour reachable in use), weakness (correct today, breaks under a plausible change), scope (true, but outside what this change or project promises), or style. Impact: high (reachable in normal use, wrong outcome or data loss), medium (reachable with unusual input or timing), low (cosmetic or theoretical). The reviewer's label is input to both, not the verdict.
4. **Decide per item from type and impact together.** Fix high-impact items of any type now, and anything cheap. Defer expensive medium and low items and scope items with a written reason and a place where the reason lives (README, notes, issue). Reject only with evidence: the reproduction that did not reproduce, or the requirement that says otherwise.
5. **Fix with a regression test first.** Write the test that fails for the reported reason, then the fix, then watch it pass. The test name states the behaviour, not the ticket.
6. **Re-run the reviewer's own probe** after the fix, if they gave one. Their payload, their timing, their numbers.
7. **Check the fix did not shift the problem.** Use `references/failure-modes.md` on the changed code: a stricter parser can reject a legitimate response, a cleanup can become a hot loop, a retry can double-commit.
8. **Draft, never commit.** When fixes were applied, draft one commit per review round with the conventional-commits skill; fixes and their tests travel together. The commit is the user's to run.
9. **Report.** For every finding: fixed (with the test name), deferred (with the reason and where it is recorded), or rejected (with the evidence). State plainly when the reviewer was right about something previously claimed to be fine.

## Rules

- The reviewer's severity is input, not verdict. Re-rate from the code.
- A finding that turns on whether something is merged, deployed or enabled is handed to evidence-synthesis, not argued from the diff.
- Never fix by weakening a test or widening a type.
- A deferred item is a sentence someone else can act on later: what, why not now, what it would take.
- Do not expand scope. A review of one change is not a licence to refactor its neighbours.
- When two findings conflict, say so and pick one with a reason.
- When a finding is right but the suggested fix is wrong, fix the finding, not the suggestion.

## Second round

When the same reviewer returns: re-verify only what changed, confirm that each earlier fix still holds, and answer their follow-ups in the same fixed / deferred / rejected shape. A loop that keeps producing new findings on unchanged code, or re-opening settled ones, is usually a disagreement about scope or requirements; name it rather than keep patching.

## Output shape

A list, one line per finding, in the reviewer's order:

```
1. Fixed: <behaviour>. Test: <test name>.
2. Deferred: <behaviour>. Reason: <why not now>. Recorded in <place>.
3. Rejected: <claim>. Evidence: <what was checked>.
```

In apply mode, the commit message follows. In assess mode, each line carries a recommended action instead of a test name. Nothing else.
