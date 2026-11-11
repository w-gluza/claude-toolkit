---
name: toolkit-maintenance
description: Audit a toolkit skill against its authoritative sources and propose or apply targeted updates with evidence, keeping versions, dates, attribution and cross-skill consistency intact. Use when a framework or standard releases, a source moves, a rule is reported wrong, or a skill's verification date is old.
metadata:
  trigger: new framework or standard release, "is this skill still current", "audit react-best-practices", a dead source link, a reported contradiction between a skill and the docs, a verification date older than the current major version
  pairs-with: evidence-synthesis, apply-review, conventional-commits
---

# Toolkit maintenance

Keep each skill accurate for the versions it names, sourced to the documents it quotes, and consistent with the skills around it. A newer version of a framework does not make the existing guidance wrong; evidence from its documentation does.

This skill owns the audit of a skill against its sources and the targeted update that follows. Whether a project is on a given version is not its question. Applying a pasted review of a skill goes through apply-review, which uses this skill for the source check.

## Modes

- **Audit** (default): read-only. Findings with evidence and a proposed change for each, no files edited.
- **Update** (when asked): apply the agreed findings, re-run the checks, draft the commit subject with conventional-commits, never run it.

## Principles

1. **Primary sources.** The framework's own documentation at the version in question, release notes and migration guides, W3C and WHATWG documents, MDN, maintainers' repositories. A blog post or a tutorial is a lead, not evidence.
2. **Version and date on every claim.** A finding states which version or edition changed what, and when. "The docs now say" without a version is not a finding.
3. **Classify before recommending.** Incorrect, deprecated, compatibility, modernisation, documentation, attribution or no change. Severity is separate from class: a deprecated but supported API is less urgent than a wrong security rule.
4. **Preserve intent.** Read why a rule exists, its Why and Smell, before replacing it. A rule that moved in the docs is still a rule.
5. **Smallest update.** Change the rules the evidence touches. A reorganised page, a renamed heading or a new example is a link update, not a rewrite.
6. **Attribution survives every edit.** Quotations stay short and verbatim, the Source link stays beside each rule, and the NOTICE files stay true. The toolkit's MIT licence does not cover quoted material; its own licence does.
7. **No findings to order.** If the skill is current, the report says so.
8. **Never publish.** No commit, push, tag, release or marketplace change.

## Where things live in this toolkit

- A best-practices skill states its target and extraction date in the first paragraph of SKILL.md, after the title: for example `Target: React 19.2 ... Extracted 2026-09-18 from react.dev`. Each file under `references/` repeats the date and its sources in its second line. next-minimal carries a dated `## Compatibility notes, verified ...` section instead.
- A reference rule is one bullet: `- **Rule**: "short quotation" - paraphrase. Why: ... Smell: ... Source: <url>`. The checklist in SKILL.md tags each bullet, `[correctness]`, `[security]`, `[WCAG 1.3.1]`, `[best practice]`, and links the same source.
- Licences: root `NOTICE.md` has one row per sourced folder; each sourced skill has its own `NOTICE.md` naming the source, licence and version. The react references quote react.dev and the typescript references quote typescriptlang.org under CC BY 4.0, next quotes the Next.js docs under MIT, a11y and css are CC BY-SA 2.5 because they quote MDN, and security-review is CC BY-SA 4.0 because it quotes OWASP.
- Offline sources are allowed and preferred when exact: the Next.js docs ship in `node_modules/next/dist/docs` of any project on that version. Record the package version read.
- The design skills (interaction-design, visual-design, design-systems, responsive-design, user-research, ux-writing, design-critique) paraphrase with links and quote nothing; for them the audit is link health, whether the linked page still says what the skill attributes to it, and whether the guidance still matches current accessibility criteria and platform capabilities. Keep those skills' own distinction between research evidence, heuristics and preference; a heuristic does not become wrong because a newer one is popular.

## 1. Scope the audit

State the skill, the source and version it claims, the version being audited against, and the reason: a release, a dead link, a reported contradiction, a periodic check. Do not widen to other skills unless a finding names them under cross-skill effects.

## 2. Record what the skill says now

Read SKILL.md and grep the references for the rules in scope. Note the target version, the dated lines, the rules and their sources, the NOTICE entries and the README count. The comparison is against this record, not against memory of the skill.

## 3. Verify against the source

For each rule in scope, open the cited page at the audited version. Record the URL, the version or date, what the page says now, what the rule says, and whether they agree. If the anchor is gone, find where the text moved before calling the rule unsourced. If a page cannot be opened, the rule is "not checked", never "still correct".

For a release audit, read the release notes and the upgrade or migration guide first; they list what changed and save reading every page.

## 4. Classify and assess

| Class | Meaning | Usual action |
|---|---|---|
| Incorrect | The source at this version contradicts the rule | rewrite the rule, keep its Smell if still apt |
| Deprecated | The rule relies on an API or pattern the source now phases out | add the replacement, mark the version |
| Compatibility | The rule holds only for some versions or environments | add the version condition inline, as `(16)` or `(requires cacheComponents)` |
| Modernisation | The source offers a newer approach; the rule still works | add as an option; never replace a stable pattern with an experimental one |
| Documentation | Link, anchor, quotation or example needs maintenance | fix in place |
| Attribution | Source, licence or NOTICE wording is wrong or missing | fix the NOTICE and the row |
| No change | The rule matches the source | report, do not touch |

For each finding: the rule and file, the class, the evidence with version, why it matters, whether the same guidance appears in another skill, and the smallest change.

## 5. Update, when asked

- Edit the rules named in the agreed findings and nothing else. Keep the bullet format, the tags, British spelling and plain hyphens.
- Update a reference file's dated line only when every rule in it was checked against the source; after a partial check leave the date and list the checked rules in the report. Update the SKILL.md date only when the whole skill was audited. A date must never imply more than was read.
- Update the NOTICE files if a source, licence or version changed, and the README count if rules were added or removed.
- Check the related skills for the same guidance and report, do not edit, unless they are in scope.
- Run the checks below. Draft the commit subject; the user commits.

## 6. Checks before finishing

- `claude plugin validate .` passes.
- No em or en dashes, no curly quotes: `grep -rnP '[\x{2013}\x{2014}\x{2018}\x{2019}\x{201C}\x{201D}]' skills/<name>`.
- British spelling in the toolkit's own words; quotations keep their source spelling.
- No employer or client names, project codenames or private URLs.
- Every Source link in a touched file resolves to the intended page when fetched with redirects followed (`curl -sL`, a GET; some sites reject HEAD), and its anchor is in the fetched HTML where the page is static. A link an automated fetch cannot verify is inspected another way or reported as not verified, never assumed broken.
- Rule counts in README match the references: `cat references/*.md | grep -c '^- \*\*'`. Every bullet in a reference file is a rule by convention; a bold bullet that is not a rule breaks the convention and is a finding, not a counting error.
- The dated lines and NOTICE entries match what was actually read.

## Output

Lead with the scope, the version audited against, the overall status (current, needs targeted updates, needs rework) and the verification limits. Then one entry per finding: location, class, evidence with version, impact, proposed change, how to confirm it. Finish with Sources checked, Sources not checked, Cross-skill effects, Changes made (update mode only) and Remaining uncertainty. "None" for an empty section.
