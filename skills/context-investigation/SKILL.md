---
name: context-investigation
description: Investigate the context around a ticket, feature or question - requirements, designs, docs, repositories, API contracts and dependencies - and report findings with evidence and contradictions. Use when asked to investigate, scope or explain a piece of work, before implementing a ticket, or when work depends on another team's API. Read-only. Hands readiness checks to evidence-synthesis.
metadata:
  trigger: new ticket, "investigate", "scope this", "what do we know about", work that depends on a backend or external API
  pairs-with: evidence-synthesis
---

# Context investigation

Collect what is known about a piece of work, identify its dependencies, and report findings supported by evidence. Investigation is the deliverable. Implementation is a separate task that begins only when explicitly requested.

This skill answers "what do we know and where does it disagree". Whether something is implemented, merged, deployed, enabled or verified is a separate question: invoke the evidence-synthesis skill for it and report its result rather than judging here.

## Rules

1. **Read-only.** Do not change code, update tickets, post comments, or open PRs. Do not recommend an implementation unless asked.
2. **Every finding names its source.** Provide a ticket URL, file path with line numbers, commit hash, design frame link, or equivalent reference. Label findings without supporting evidence as "Unverified".
3. **Disclose inaccessible sources.** List unavailable tools and sources under "Sources not checked". Never infer their contents or report "nothing found" for a source you could not access.
4. **Compare, do not assume.** When tickets, documentation, designs, and code disagree, report the conflicting versions. Only describe runtime behaviour when supported by runtime evidence.
5. **Do not grade readiness yourself.** Record each dependency and what it must provide. When its state matters, invoke evidence-synthesis and quote its verdict; otherwise mark the state "not verified".

## Gather context

Search relevant available sources, including:

- Ticket trackers (Linear, Jira, GitHub Issues)
- Design tools and comments (Figma, Miro, Zeplin)
- Documentation and decisions (Confluence, Notion, repository docs)
- Frontend and backend repositories
- Existing implementations and Git history
- API specifications and contracts
- Related PRs and dependencies

## Map dependencies

When work depends on an API or another team's change:

- Find the expected API contract.
- Locate the backend implementation.
- Compare documented and implemented behaviour.
- Identify missing endpoints, fields, and error handling.
- Name the PRs, flags, configuration and permissions the work relies on.
- Pass each dependency whose readiness matters to evidence-synthesis.

## Output

Use these sections in order. Write "None" when a section has no findings.

1. **Sources checked:** Sources inspected, with references.
2. **Sources not checked:** Unavailable or inaccessible sources and limitations.
3. **Findings:** Verified facts, each with supporting evidence.
4. **Dependencies:** Required contracts and changes, each with its readiness as reported by evidence-synthesis or marked "not verified".
5. **Contradictions:** Disagreements between requirements, documentation, designs, code, or runtime behaviour.
6. **Open questions:** Questions that remain unresolved, including those requiring human clarification.
7. **Unverified:** Claims or assumptions that could not be independently confirmed.
