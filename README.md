# toolkit

Reusable Claude Code skills, agents and commands, packaged as one plugin named `toolkit`.

## Layout

```
.claude-plugin/plugin.json        plugin manifest
.claude-plugin/marketplace.json   lets the repo install itself as a local marketplace
skills/<name>/SKILL.md            one folder per skill
agents/<name>.md                  one file per agent
commands/<name>.md                one file per slash command
```

## Skills

| Skill | Invoke | What it does | Source |
|-------|--------|--------------|--------|
| stop-slop | `/toolkit:stop-slop` | Removes AI writing patterns from prose and applies the house style | Hardik Pandya, MIT, with additions |
| conventional-commits | `/toolkit:conventional-commits` | Drafts commit messages in Conventional Commits format; never commits | own |
| react-best-practices | `/toolkit:react-best-practices` | React 19 review checklist distilled from react.dev, tagged by severity; 433 sourced rules in references, grepped not loaded | own; quotations from react.dev, CC BY 4.0 (see NOTICE.md) |
| a11y-best-practices | `/toolkit:a11y-best-practices` | Accessibility review checklist from WCAG 2.2, WAI-ARIA APG, ARIA in HTML and MDN; jsx-a11y and axe coverage map in references | own, from W3C and MDN |
| css-best-practices | `/toolkit:css-best-practices` | Modern CSS review checklist from MDN, web.dev and WCAG, with Baseline status and a legacy-to-modern map; sourced rules in references | own, from MDN |
| next-minimal | `/toolkit:next-minimal` | Scaffolds a Next.js app stripped to TypeScript, ESLint, Prettier and CSS modules | own |
| context-investigation | `/toolkit:context-investigation` | Read-only investigation of a ticket or question: requirements, designs, docs, contracts, dependencies; every finding sourced, contradictions and open questions reported; hands readiness checks to evidence-synthesis | own |
| evidence-synthesis | `/toolkit:evidence-synthesis` | Verifies a claim against evidence: implemented, merged, deployed, enabled and verified graded separately per environment; verdict with limitations, never a recommendation | own |
| project-architecture | `/toolkit:project-architecture` | Proposes or reviews directory structure, boundaries and naming; preferences as defaults, with sources | own |
| algorithm-design | `/toolkit:algorithm-design` | Pure, immutable, deterministic algorithms in small functions, with oracle-backed tests | own |
| apply-review | `/toolkit:apply-review` | Verifies review findings and rates type and impact separately; applies fixes only when asked, regression test per fix, deferred items recorded, drafts the commit but never runs it; failure-modes checklist in references | own |
| boundary-validation | `/toolkit:boundary-validation` | Turns unknown into typed at every boundary, both directions; no coercion, server-owned values, status codes, state kept on failure | own |
| test-layers | `/toolkit:test-layers` | Picks unit, integration or end-to-end per behaviour; proves each once; seeding, fake timers and concurrency patterns in references | own |
| systematic-debugging | `/toolkit:systematic-debugging` | Reproduces a bug, tests a causal hypothesis, fixes when asked and verifies the original failure; reports uncertainty when evidence is incomplete | own |
| systematic-debugging | `/toolkit:systematic-debugging` | Reproduce, isolate, test hypotheses, name the root cause and its trigger; fix at the cause with a regression test only when asked; intermittent-failure playbook; investigate-only by default | own |

## Install from a local clone

```bash
claude plugin validate ~/Desktop/ai-setup/toolkit
claude plugin marketplace add ~/Desktop/ai-setup/toolkit
claude plugin install toolkit@wiola
claude plugin list
```

The plugin loads in place from this folder, so edits apply at the next session or after `/reload-plugins`.

## Install from GitHub

Once pushed, on any machine:

```bash
claude plugin marketplace add <github-user>/toolkit
claude plugin install toolkit@wiola
```

## Licence

MIT (see `LICENSE`), except the third-party and documentation-derived content listed in `NOTICE.md`: stop-slop keeps its own MIT notice, the React references quote react.dev under CC BY 4.0, and the accessibility and CSS references are CC BY-SA 2.5 because they quote MDN.
