# Tokens and themes

## Working decisions

Toolkit convention, adaptable to existing systems:

- A primitive such as `blue-600` identifies a value; a semantic token such as `action-background` identifies its use. Add component tokens only when a component needs a stable independent contract.
- Store shared intent once. Resolve aliases through a defined pipeline and detect missing references and cycles. Avoid renaming existing tokens merely to impose this naming example.
- For each theme, specify foreground/background pairs and interactive states. Test those pairs; copying a light palette into dark mode does not prove usable hierarchy or contrast.
- Name the source of truth and the direction of synchronisation between design tooling and code. Generated outputs should not become competing editable sources.
- Change a shared token with a consumer inventory. A global border change can affect focus, field boundaries and dense tables even if one screen improves.

## Interchange format

When importing, exporting or sharing tokens across tools, consider the [Design Tokens Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/). It specifies types, values and references. It is a W3C Community Group report, not a W3C Recommendation. Check tool support before choosing it; adopting a token format is not a reason to replace a functioning project pipeline.

If producing a file in that format, consult the specification for the exact schema and validate it with the project's tooling. CSS custom properties alone are not that interchange format.
