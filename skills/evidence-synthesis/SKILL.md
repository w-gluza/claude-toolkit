---
name: evidence-synthesis
description: Verify engineering claims against available evidence. Use when assessing whether functionality is implemented, merged, deployed, enabled, or working as claimed.
metadata:
  trigger: "is this live", "has this shipped", "is the API ready", "does X work in staging", a readiness question handed over by context-investigation
  pairs-with: context-investigation
---

# Evidence synthesis

Evaluate claims against available evidence and report what can actually be established. Distinguish statements, assumptions, and intentions from verified facts.

The deliverable is an evidence-based assessment, not an implementation or a recommendation.

## Rules

1. **Read-only.** Do not modify code, update tickets, post comments, trigger deployments, or change configuration.
2. **Claims are not evidence.** A developer's statement, ticket status, or PR description establishes what was claimed, not whether the claim is true.
3. **Every conclusion needs evidence.** Include relevant URLs, commit hashes, file paths, deployment identifiers, logs, or test results. Label unsupported conclusions as unverified.
4. **Distinguish delivery states.** Implemented, merged, deployed, enabled, and verified are separate states. Never infer one from another.
5. **Respect environment boundaries.** Evidence from local development, CI, staging, or production applies only to the environment it actually covers.
6. **Do not mistake missing evidence for failure.** If something cannot be checked, report it as unverified rather than assuming it has not happened.
7. **Preserve contradictions.** When evidence conflicts, report the disagreement rather than selecting the most convenient explanation.
8. **Do not overstate verification.** Passing tests or receiving a successful response does not prove every expected behaviour works.

## Evaluate the claim

Identify:

- **Claim:** What exactly is being asserted?
- **Scope:** Which feature, endpoint, behaviour, or change?
- **Environment:** Local, CI, staging, production, or unspecified?
- **Expected evidence:** What would establish whether the claim is true?

If the claim is ambiguous, state the interpretation being evaluated.

## Gather evidence

Inspect relevant available sources:

- Code and Git history
- Pull requests and merge status
- CI checks and test results
- Deployment records and release versions
- Feature flags and environment configuration
- API contracts and runtime responses
- Logs and monitoring
- Tickets, documentation, and developer statements

Use only sources relevant to the claim. Do not conduct an unrelated feature investigation.

Record sources that could not be accessed.

## Assess delivery status

Where relevant, evaluate each state independently:

| State | Evidence |
|---|---|
| Implemented | Relevant code exists |
| Merged | Change is included in the target branch |
| Deployed | Target environment contains the relevant change |
| Enabled | Configuration, flags, and permissions permit execution |
| Verified | Observed behaviour or relevant tests support the claim in the stated environment |

Use **Confirmed**, **Not confirmed**, or **Unverified** for each applicable state.

"Not confirmed" requires evidence supporting a negative conclusion. Missing access or insufficient evidence means "Unverified".

## Evaluate evidence quality

Consider:

- **Directness:** Does the evidence establish the claim or merely suggest it?
- **Relevance:** Does it concern the correct code, version, and environment?
- **Freshness:** Could the evidence be outdated?
- **Completeness:** Does it cover the claimed behaviour?
- **Consistency:** Do independent sources agree?

Identify evidence that is stale, incomplete, indirect, or contradictory.

## Output

Use these sections. Omit sections that are not relevant.

1. **Claim:** The statement being evaluated and its scope.
2. **Verdict:** Confirmed, Contradicted, Partially confirmed, or Unverified.
3. **Evidence:** Findings with supporting references.
4. **Delivery status:** Implementation, merge, deployment, enablement, and verification states, where applicable.
5. **Contradictions:** Conflicting claims or evidence.
6. **Limitations:** Sources not checked, missing evidence, and uncertainty.
7. **Conclusion:** A concise statement of what can and cannot be established.

Do not recommend implementation changes unless explicitly requested.
