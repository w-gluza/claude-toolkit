---
name: next-minimal
description: Scaffold a new Next.js app with a minimal setup - no Tailwind, no fonts, no demo assets, ESLint flat config with jsx-a11y as errors, Prettier, one page with a CSS module. Use when creating or setting up a new Next.js project, or when asked to strip a fresh create-next-app down.
metadata:
  trigger: new next app, set up next, scaffold next, create-next-app, stripping a fresh Next project
  verified: 2026-11-06 with Next 16.4.5, React 19.3.1, ESLint 10.14, TypeScript 6.0.3, Prettier 3.9
---

# Next minimal

A fresh `create-next-app` ships Tailwind, Geist fonts, five SVGs, a demo page and a README. This skill produces the shape we want instead: TypeScript, App Router, ESLint, Prettier, CSS modules, one page that says Hello.

## Project metadata

Before generating application metadata, determine the project name, description, and author.

1. **Check existing project metadata.** Look for `package.json`, existing application metadata, and project documentation.
2. **Detect the author when appropriate.** Use `git config user.name` and `git config user.email` as possible hints, not authoritative values.
3. **Do not assume the Git user is the project author.** The machine may belong to a company, or the repository may have multiple contributors.
4. **Ask only for missing information.** If the author, website, or repository URL cannot be established reliably, ask the user or omit optional fields.
5. **Never invent personal details.** Do not generate placeholder names, email addresses, or URLs that could accidentally be published.

For new projects, prefer the project name and description over personal branding. Include author-specific metadata only when appropriate for the application.

## Steps

1. **Scaffold.** Run in the target folder. The `--empty` flag already skips Tailwind, fonts and demo assets.

   ```bash
   npx create-next-app@latest . --ts --app --eslint --empty --no-src-dir --skip-install
   ```

   Add `--disable-git` when the folder is already a git clone. Use the package manager the folder or monorepo already uses (look for a lockfile); for a new project default to npm and pass `--use-npm`. Commands below are in npm form; translate for pnpm, yarn or bun.

2. **Overwrite with the templates** in `templates/`:

   | Template | Target | Why |
   |----------|--------|-----|
   | `eslint.config.mjs` | root | Flat config, Next presets, the jsx-a11y rules Next registers promoted to errors, Prettier last |
   | `.prettierrc`, `.prettierignore` | root | Prettier as a real dependency, not an editor extension |
   | `next.config.ts` | root | Empty config. The scaffold's `cacheComponents` and `partialPrefetching` flags are dropped because a minimal app has no use for them yet; keep either one when the project will use the feature behind it |
   | `app/layout.tsx` | app | Bare html and body, metadata with title, description and Open Graph; no author line, no font imports |
   | `app/page.tsx`, `app/page.module.css` | app | `<p>Hello</p>` coloured by one CSS module class, proving the CSS pipeline works |
   | `package.scripts.json` | merge into `package.json` | Adds `lint`, `typecheck`, `format`, `format:check` |

   Set `title` and `description` in `app/layout.tsx` from the project metadata established above. Add `authors` only when the author was established and suits the application; the template deliberately carries none. Next adds charset, viewport and the favicon link on its own.

3. **Install at current versions.** Resolve versions at run time instead of copying a package.json, so the setup never goes stale. Pin a major only when a tool rejects the latest; the error names the supported range.

   ```bash
   npm install
   npm install -D prettier@latest eslint-config-prettier@latest eslint@latest typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest
   npm install react@latest react-dom@latest
   ```

4. **Verify.** All four must pass before the setup counts as done.

   ```bash
   npm run lint && npm run typecheck && npm run format:check && npm run build
   ```

5. **Hand over the first commit message**, do not run it:

   ```
   chore: minimal next setup with eslint and prettier
   ```

## Rules

- **`lint` script is `eslint .`**, not `next lint`. `next lint` was removed in Next 16.
- **No `@eslint/eslintrc` or FlatCompat.** Next 16 exports flat presets: import `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` directly.
- **Accessibility rules are errors, not warnings.** Warnings scroll past; an error fails `npm run lint` and CI. The template promotes the nine jsx-a11y rules Next registers to `error`. A new project passes them from the start, so there is no cost to being strict from day one.
- **Keep `AGENTS.md` and commit it.** Next writes it only when an AI assistant starts `next dev`; from a human terminal it does not appear. It points assistants at the docs shipped in `node_modules/next/dist/docs`, which is how they write correct Next 16 code. Opt out with `agentRules: false` in `next.config.ts`, never with `.gitignore`.
- **No README from the scaffold.** The project writes its own.
- **No `src` folder, no import alias changes.** Paths stay `@/*` to `./*`.

## Compatibility notes, verified 2026-11-08

Re-check these when the installed Next is newer than the version in the frontmatter.

- typescript-eslint rejected TypeScript 7.0 ("typescript-eslint does not support TS 7.0"), so `typescript@latest` resolved to 6. Re-check the tracking issue linked in that error before expecting 7 to work.
- ESLint 10 worked with eslint-config-next 16.4 even though the scaffold pins `^9`; bump it.
- eslint-plugin-jsx-a11y 6.10.2 declared `eslint` up to `^9` as a peer, so a direct install under ESLint 10 failed to resolve. The Next preset bundles its own copy, which is why the template lists nine rules instead of `jsxA11y.flatConfigs.strict`. When a release lists ESLint 10, add the plugin and map the strict config to `error`.

## Final file list

```
.gitignore           .prettierignore      .prettierrc
AGENTS.md            app/favicon.ico      app/layout.tsx
app/page.tsx         app/page.module.css  eslint.config.mjs
next.config.ts       next-env.d.ts        package.json
package-lock.json    tsconfig.json
```
