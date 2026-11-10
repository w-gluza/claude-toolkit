---
name: conventional-commits
description: Draft git commit messages in the Conventional Commits format. Use whenever work reaches a committable state, when asked for a commit message, or when reviewing commit history. Never runs git commit or git push.
metadata:
  trigger: Work ready to commit, "write a commit message", reviewing or squashing commits
  spec: https://www.conventionalcommits.org/en/v1.0.0/
---

# Conventional Commits

Draft commit messages that follow the Conventional Commits specification. The user runs `git commit` and `git push` themselves. Give the message and the exact git commands, then stop.

## Format

```
<type>(<optional scope>): <short description>
```

The default commit is the subject line alone. A body is the exception (see rule 6); a footer appears only for breaking changes.

## Types

| Type | Use for |
|------|---------|
| feat | A new feature for the user |
| fix | A bug fix |
| refactor | Code change that neither fixes a bug nor adds a feature |
| perf | Performance improvement |
| test | Adding or correcting tests |
| docs | Documentation only |
| style | Formatting, whitespace, missing semicolons; no logic change |
| build | Build system, dependencies, tooling |
| ci | CI configuration and scripts |
| chore | Maintenance that touches no source or test files |
| revert | Reverts an earlier commit; name it in the body |

## Rules

1. **Lowercase everything** in the first line: type, scope, description. No full stop at the end.
2. **Imperative mood.** "add", "fix", "remove", as in "this commit will add X". Not "added", not "adds".
3. **First line under 72 characters.** Aim for 50.
4. **Scope is optional** and names the area touched: `feat(auth):`, `fix(checkout):`. Match the repo's existing scopes before inventing one.
5. **Breaking changes** get a `!` after the type or scope, and a `BREAKING CHANGE:` footer explaining what breaks and how to migrate.
6. **Subject only by default.** Do not write a body. Add one only when the why would otherwise be lost to a reader of the history, such as a migration finished after a long dual-run, or a decision that the diff contradicts on its face. When a body is needed it explains why, never what, and wraps at 72 characters.
7. **One change per commit.** If the diff mixes a fix and a refactor, propose two commits and the `git add` commands to split them.
8. **Plain hyphens only.** No em dashes or en dashes anywhere in the message.
9. **No trailers.** No `Co-Authored-By`, no `Signed-off-by`, no AI attribution lines, no emoji.
10. **Match the repo.** Read `git log --oneline -20` first. If the repo already uses a convention, follow it, even where it differs from this file.
11. **Tests alone are `test:`.** A commit that adds or moves tests without changing behaviour is `test:`, even when it exists because of a bug report. The fix that makes a failing test pass is `fix:` and carries its tests with it.
12. **One review round, one commit.** Fixes from a single review round that share a theme (reliability, validation, cleanup) travel together under one type and one subject line. Unrelated findings get separate commits. This is the one case where a short bulleted body, one line per finding, is allowed, and only when the subject cannot name the findings itself.
13. **Say when it is a placeholder.** A commit that lands a first pass to be replaced (layout without styling, a stub implementation) says so in the subject, for example `feat(booking): add unstyled layout placeholder`.
14. **Batch by area.** When the working tree holds several unrelated changes, group them by the area touched and propose one commit per group, in the order they should land. Give every group its own `git add` list and subject.

## Examples

```
feat: add user authentication
fix: handle expired sessions
refactor: simplify payment validation
test: cover authentication edge cases
docs: document API contracts
feat(api)!: drop v1 endpoints

BREAKING CHANGE: /v1/* routes return 410. Clients must move to /v2.
```

Several areas in one working tree, batched:

```
git reset
git add src/monitoring/
git commit -m "fix(sentry): drop noisy network errors from frontend monitoring"
git add src/flags/ scripts/stale-flags.ts
git commit -m "feat(flags): schedule stale feature flag detection"
git add docs/
git commit -m "docs: describe the flag cleanup agent"
```

Review-driven fixes under one subject:

```
fix(booking): harden response handling and concurrency after review
```

The rare body, where the diff alone would mislead:

```
refactor(styles): finish stitches to vanilla-extract migration

Both libraries shipped in parallel for a year. Removing stitches
drops a runtime dependency and leaves the design-system tokens as
the only source of truth.
```

Tests only:

```
test: cover queue recovery after a thrown booking
```

## Output shape

Give exactly this, nothing more:

1. The subject line (or lines, one per batch) in a fenced block.
2. The git commands to stage and commit, in a fenced block: `git reset` first when anything is already staged, then one `git add` and `git commit -m` pair per batch. Use `git add -A` only when a single batch covers the whole tree and includes renames or deletions. Use `git commit -F-` with a heredoc only in the rare body case.

Do not run the commands.
