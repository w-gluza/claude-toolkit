---
name: next-best-practices
description: Next.js 16 App Router code-review rules distilled from the official Next.js docs, each with a source link. Load when reviewing or writing pages, layouts, Server Functions, route handlers, proxy, caching or next.config so the code matches what the documentation prescribes.
allowed-tools: Read, Grep
---

# Next.js best practices (from nextjs.org/docs)

Target: Next.js 16.x, App Router. Extracted 2026-11-10 from the documentation shipped with next 16.4.5; see NOTICE.md for the licence.

## Before applying any rule

1. Read the installed version from `node_modules/next/package.json` (fall back to the `next` entry in `package.json`). On 15.x most rules still hold but the 16-only items below (marked "16") do not apply; on 14.x or older, stop and say the skill does not cover that version.
2. Check which router the project uses: an `app/` directory (or `src/app/`) is the App Router, a `pages/` directory is the Pages Router. These rules are for the App Router only. For a project on `pages/`, or one with both, say so and review only the `app/` side.
3. Check `next.config` for `cacheComponents`. Rules marked "(requires cacheComponents)" apply only when it is on; with it off, the project uses the older `fetch` cache, `unstable_cache` and route segment config rules instead.

## How to use this file

This file is the review checklist and the normal load: the rules that most often catch real defects, grouped by the smell you see in a diff, each tagged [correctness], [security], [performance] or [maintainability]. Correctness and security rules hold everywhere; the other two are defaults the project's CLAUDE.md may override. The full set (788 rules, each with a short quotation from the docs and one source anchor) lives in `references/`. Grep there for the exact wording or a rule not listed here; never read a reference file whole, each is 55 to 70 KB.

- `references/routing-and-navigation.md` - file conventions, layouts, loading, not-found, dynamic and parallel routes, Link, prefetching, navigation hooks, redirects, i18n
- `references/server-and-client-components.md` - the server/client boundary, directives, streaming, hydration, lazy loading, bundling
- `references/data-and-mutations.md` - fetching, Server Functions, forms, Route Handlers, proxy, request APIs, data security, authentication, CSP
- `references/caching-and-revalidation.md` - Cache Components, `use cache`, `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag`, `revalidatePath`, ISR, `unstable_cache`
- `references/metadata-and-assets.md` - metadata, Open Graph, sitemap, Image, Font, Script, CSS
- `references/errors-config-and-production.md` - error boundaries, env vars, next.config, TypeScript, build, deployment, upgrading to 16, Turbopack

When citing a rule in a review, link the nextjs.org source so the author can read the reasoning.

## 1. Request data read in the wrong place

Smell: `params`, `searchParams`, `cookies()` or `headers()` used without `await`, or read in a layout, a cached function or at the top of a page that only passes it down.

- [correctness] **Await `params`, `searchParams`, `cookies()`, `headers()` and `draftMode()`; they are promises (16).** `const { slug } = params` with no `await`, or `cookies().get('session')`, is a build error. https://nextjs.org/docs/app/guides/upgrading/version-16#async-request-apis-breaking-change
- [correctness] **`searchParams` is a plain object, not `URLSearchParams`.** `(await searchParams).get('q')` or `.has('page')` throws. https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
- [correctness] **Layouts do not receive `searchParams` or the pathname.** A layout signature destructuring `searchParams`, or computing active links from `params`, reads nothing; do it in the page or a Client Component with `usePathname`. https://nextjs.org/docs/app/api-reference/file-conventions/layout#query-params
- [correctness] **Wrap `useSearchParams` in `<Suspense>` on prerendered routes.** Without it the whole page up to the nearest boundary renders on the client. https://nextjs.org/docs/app/api-reference/functions/use-search-params#prerendering
- [correctness] **Never read `cookies()`, `headers()` or `searchParams` inside a cached scope.** A helper called under `'use cache'` that does `await headers()` fails; pass the value in as an argument. (requires cacheComponents) https://nextjs.org/docs/app/api-reference/directives/use-cache#request-time-apis
- [correctness] **Do not pass runtime-data promises into cached scopes.** `<Cached promise={cookies()} />` hangs the build until the cache timeout. (requires cacheComponents) https://nextjs.org/docs/app/api-reference/directives/use-cache#build-hangs-cache-timeout
- [performance] **Push `params`, `cookies()`, `headers()` and fetches down to the component that needs them.** Reading them at the top of a page makes the entire page dynamic when one child needs the value. https://nextjs.org/docs/app/guides/streaming#push-dynamic-access-down
- [correctness] **Keep layouts and pages pure; prefetch runs them.** `trackPageView()` in a layout or page body fires on hover, not on visit. https://nextjs.org/docs/app/guides/prefetching#triggering-unwanted-side-effects-during-prefetching

## 2. The server/client boundary

Smell: `'use client'` at the top of a page that only fetches, a function passed as a prop from a server file, a full database row handed to a client component.

- [correctness] **Never pass a plain function from a Server Component to a Client Component.** `onClose={() => ...}` from `page.tsx` cannot be serialised; pass a Server Function or move the handler into the client component. https://nextjs.org/docs/app/guides/server-and-client-boundary#crossing-the-boundary
- [security] **Pass only what a Client Component needs; props end up in the HTML.** `<Profile user={rows[0]} />` ships every column, including the ones the UI never shows. https://nextjs.org/docs/app/guides/data-security#component-level-data-access
- [security] **Mark server-only modules with `import 'server-only'`.** A data module reading `process.env.API_KEY` that a client file can import through a barrel fails at build instead of leaking. https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning
- [correctness] **A Client Component renders on the server too; output must match.** `Date.now()`, `Math.random()` or `window.innerWidth` read during render causes a hydration mismatch; read them in an effect. https://nextjs.org/docs/app/guides/server-and-client-boundary
- [correctness] **Use `ssr: false` only from within a Client Component.** `dynamic(() => import('./map'), { ssr: false })` in a server `page.tsx` is an error. https://nextjs.org/docs/app/guides/lazy-loading#importing-server-components
- [correctness] **Export `metadata` and `generateMetadata` only from Server Components.** `export const metadata` in a `'use client'` file is ignored or errors. https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
- [correctness] **`onLoad`, `onReady` and `onError` on `<Script>` need a Client Component.** They are functions, so a server layout cannot pass them. https://nextjs.org/docs/app/api-reference/components/script#onload
- [correctness] **An async component cannot be `'use client'`.** Client Components get their data through props, `use()` or a fetching hook. https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional

## 3. Server Functions and forms

Smell: a `'use server'` file where a function goes straight to the database, an action that takes a whole record, `redirect` before `revalidatePath`.

- [security] **Verify authentication and authorisation inside every Server Function.** `deletePost(id)` straight to `db.post.delete` with no session read is a public endpoint; page-level gating does not protect it. https://nextjs.org/docs/app/getting-started/mutating-data#what-are-server-functions
- [security] **Check ownership of the resource, not just the session.** `if (!session) throw` followed by a delete by id with no `authorId` check lets any signed-in user delete anything. https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization
- [security] **Never derive privileges from `searchParams`, `params` or headers.** `if ((await searchParams).isAdmin === 'true')` is attacker-controlled input. https://nextjs.org/docs/app/guides/data-security#validating-client-input
- [security] **Send an identifier plus the change, not the whole record.** `completeItem(item: Item)` updating `where: { id: item.id }` trusts every field the client sent. https://nextjs.org/docs/app/guides/server-actions#security
- [security] **Return only what the UI needs from an action.** `return db.user.update(...)` sends the full row to the browser. https://nextjs.org/docs/app/guides/data-security#controlling-return-values
- [correctness] **Every export under a file-level `'use server'` must be async.** A plain `export function formatPrice()` in `actions.ts` is a build error; move helpers to another file. https://nextjs.org/docs/app/api-reference/directives#where-to-place-a-directive
- [correctness] **Add the `prevState` parameter when an action is used with `useActionState`.** `createUser(formData)` wired to `useActionState` receives the previous state first and reads `formData.get` on the wrong argument. https://nextjs.org/docs/app/guides/forms#validation-errors
- [correctness] **Return expected errors instead of throwing them.** `throw new Error('Email is required')` trips the error boundary; return `{ error }` for `useActionState` to render. https://nextjs.org/docs/app/getting-started/error-handling#server-functions
- [correctness] **Revalidate before `redirect`.** `redirect('/posts'); revalidatePath('/posts')` never reaches the second line because `redirect` throws. https://nextjs.org/docs/app/getting-started/mutating-data#redirect-after-a-mutation
- [correctness] **Set or delete cookies only in a Server Function or Route Handler.** `cookieStore.set('theme', value)` in a page or layout render throws. https://nextjs.org/docs/app/api-reference/functions/cookies#good-to-know
- [performance] **Fetch from the source in Server Components, not from your own Route Handlers.** `fetch('http://localhost:3000/api/items')` in `page.tsx` adds a network hop to call code already on the same server. https://nextjs.org/docs/app/guides/backend-for-frontend#server-components

## 4. Redirects, not found and navigation

Smell: `redirect()` or `notFound()` inside a `try` block, `router.push` with a value from the URL, `router.refresh()` expected to clear a cache.

- [correctness] **Call `redirect()` outside `try/catch`.** It works by throwing, so `try { await save(); redirect('/done') } catch (e) { return { error } }` swallows the redirect. https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
- [correctness] **Do not wrap `notFound()` in `try/catch`** for the same reason. If a catch must exist, call `unstable_rethrow(error)` first. https://nextjs.org/docs/app/api-reference/functions/not-found#good-to-know and https://nextjs.org/docs/app/api-reference/functions/unstable_rethrow
- [correctness] **Call `notFound()` in the render path, never in a floating promise.** `fetchUser(id).then((u) => { if (!u) notFound() })` without `await` throws where nothing catches it. https://nextjs.org/docs/app/api-reference/functions/not-found
- [correctness] **Call `notFound()` before any await or Suspense boundary when the 404 status matters.** Once streaming has started the status is already 200. https://nextjs.org/docs/app/guides/streaming#status-codes
- [security] **Never pass untrusted URLs to `router.push` or `router.replace`.** `router.push(searchParams.get('next') ?? '/')` is an open redirect; allow-list or validate first. https://nextjs.org/docs/app/api-reference/functions/use-router#userouter
- [correctness] **`router.refresh()` does not invalidate server caches.** After a mutation served from a cached `fetch` or `'use cache'`, call `revalidateTag`, `updateTag` or `revalidatePath` in the action. https://nextjs.org/docs/app/api-reference/functions/use-router#userouter
- [correctness] **Add a `default.js` to every parallel route slot, including the implicit `children` slot (16).** A new `@modal` folder with `page.tsx` but no `default.tsx` fails the build. https://nextjs.org/docs/app/api-reference/file-conventions/default
- [security] **Authorise inside each parallel slot, not in the layout's conditional.** `return role === 'admin' ? admin : user` while `@admin/page.tsx` calls `getAdminStats()` unchecked still exposes the data on direct navigation. https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes#conditional-routes

## 5. Caching and revalidation

Smell: `revalidateTag` with one argument, `updateTag` in a Route Handler, a cached closure that captures a variable, `revalidatePath` on a page that is not the only reader.

- [correctness] **Always pass the second argument to `revalidateTag` (16).** `revalidateTag('posts')` is deprecated; use `revalidateTag('posts', 'max')` for stale-while-revalidate. https://nextjs.org/docs/app/api-reference/functions/revalidateTag#parameters
- [correctness] **Call `updateTag` only from Server Actions.** It fails in a Route Handler; use `revalidateTag` there. https://nextjs.org/docs/app/api-reference/functions/updateTag#usage
- [correctness] **Use `updateTag` after mutations the user must see immediately.** A create action that calls `revalidateTag('posts', 'max')` then redirects to the new post can land on a stale page. https://nextjs.org/docs/app/api-reference/functions/updateTag
- [correctness] **Account for captured variables in the cache key.** An inline `'use cache'` closure capturing `userId` serves one user's data to another unless `userId` is an argument. https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys
- [correctness] **Add closed-over variables to `keyParts` of `unstable_cache`.** `unstable_cache(async () => getUser(userId), ['user'])` has the same bug without cacheComponents. https://nextjs.org/docs/app/api-reference/functions/unstable_cache#parameters
- [correctness] **Set an explicit `cacheLife` when nesting a short-lived cache.** A `'use cache'` page without `cacheLife` that renders a `cacheLife('seconds')` component takes the inner profile and refetches far too often. (requires cacheComponents) https://nextjs.org/docs/app/api-reference/functions/cacheLife#nested-short-lived-caches
- [correctness] **`revalidatePath` does not refresh other pages sharing the data.** An edit action revalidating `/blog` leaves `/dashboard` stale if it renders the same posts; tag the data instead. https://nextjs.org/docs/app/api-reference/functions/revalidatePath#relationship-with-revalidatetag-and-updatetag
- [correctness] **Pass the destination path to `revalidatePath` when rewrites are involved.** `revalidatePath('/blog')` where `/blog` rewrites to `/news` revalidates nothing. https://nextjs.org/docs/app/api-reference/functions/revalidatePath#using-revalidatepath-with-rewrites
- [correctness] **Throw on failed upstream responses during ISR regeneration.** `if (!res.ok) return []` caches an empty page; throwing keeps the last good one. (without cacheComponents) https://nextjs.org/docs/app/guides/incremental-static-regeneration#handling-uncaught-exceptions
- [correctness] **Keep `generateStaticParams` on dynamic routes.** A diff removing it from `[slug]/page.tsx` turns a prerendered route into a fully dynamic one. (requires cacheComponents) https://nextjs.org/docs/app/guides/migrating-to-cache-components#generatestaticparams-must-return-at-least-one-param
- [correctness] **After a write, `updateTag` for cached reads and `refresh()` only for dynamic reads.** A Server Function that writes to a cached list and calls `refresh()` leaves the list stale. (requires cacheComponents) https://nextjs.org/docs/app/guides/interactive-apps#invalidate-from-mutations

## 6. Proxy (formerly middleware)

Smell: a `middleware.ts` still present on 16, `runtime: 'edge'` in proxy config, a proxy with no matcher, headers set on the response instead of the request.

- [correctness] **Rename `middleware.ts` to `proxy.ts` and export `proxy` (16).** The codemod does it; `runtime` config in that file throws because proxy runs on Node.js. https://nextjs.org/docs/app/guides/upgrading/version-16#middleware-to-proxy
- [performance] **Exclude static assets with a negative matcher.** A redirect in `proxy.ts` with no `config.matcher` runs on every image and chunk. https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
- [correctness] **Forward request headers with `NextResponse.next({ request: { headers } })`.** `NextResponse.next({ headers })` sets response headers, so the injected nonce or auth header never reaches the page. https://nextjs.org/docs/app/api-reference/functions/next-response#next

## 7. Images, fonts, metadata and styles

Smell: `<Image fill>` with no `sizes`, `priority` on 16, a remote pattern with only a hostname, `viewport` inside `metadata`.

- [performance] **Set `sizes` on every `fill` or CSS-responsive image.** Without it the browser downloads the largest candidate. https://nextjs.org/docs/app/api-reference/components/image#sizes
- [security] **Do not omit `protocol`, `port`, `pathname` or `search` in a remote pattern.** `{ protocol: 'https', hostname: 'res.cloudinary.com' }` with no `pathname` lets any path on that host through the optimiser. https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
- [maintainability] **Replace `priority` with `preload` on 16.** `priority` is deprecated. https://nextjs.org/docs/app/api-reference/components/image#priority
- [correctness] **Declare every quality you use in `images.qualities` (16).** `<Image quality={90} />` with no `images.qualities` entry requests a `q` value the optimiser now rejects with 400. https://nextjs.org/docs/app/guides/upgrading/version-16#qualities-default-breaking-change
- [correctness] **Set `metadataBase` in the root layout before using relative URLs.** Relative `openGraph.images` without it resolve wrong in production. https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
- [correctness] **Nested metadata fields are replaced, not merged, by child segments.** A page that sets `openGraph: { title }` loses the layout's `openGraph.images`; spread the parent's value in `generateMetadata`. https://nextjs.org/docs/app/api-reference/functions/generate-metadata#merging
- [correctness] **Move `themeColor`, `colorScheme` and `viewport` out of `metadata`.** They belong in a `viewport` export. https://nextjs.org/docs/app/api-reference/functions/generate-metadata#themecolor
- [correctness] **Await `params` and `id` in image, icon and sitemap route files (16).** `function Image({ params }) { const { slug } = params }` is the same promise rule as pages. https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#version-history
- [security] **Sanitise JSON-LD before embedding.** `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` unescaped is an XSS vector when any field is user-supplied. https://nextjs.org/docs/app/guides/json-ld
- [maintainability] **Import global stylesheets once, in the root layout.** `import './dashboard.css'` inside a page stays loaded after navigation and leaks styles. https://nextjs.org/docs/app/getting-started/css#global-css
- [performance] **Define each font once in a definitions file.** `Inter({...})` called in two files loads the font twice. https://nextjs.org/docs/app/api-reference/components/font#using-a-font-definitions-file

## 8. Config, build and deployment

Smell: `process.env[...]` with a computed key, `ignoreBuildErrors: true`, a `webpack()` key or `next lint` after upgrading to 16, a Dockerfile that copies only `.next/standalone`.

- [correctness] **Reference `NEXT_PUBLIC_` variables as literal `process.env.NAME` expressions.** `process.env[\`NEXT_PUBLIC_${key}\`]` or `const { NEXT_PUBLIC_URL } = process.env` is not inlined and is `undefined` in the browser. https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser
- [correctness] **Catch errors inside event handlers yourself.** `onClick={async () => { await saveItem() }}` with no try/catch and no error state fails silently; error boundaries do not see handlers. https://nextjs.org/docs/app/getting-started/error-handling#nested-error-boundaries
- [correctness] **Never set `ignoreBuildErrors` without a separate type check.** `typescript: { ignoreBuildErrors: true }` with no `tsc --noEmit` step in CI ships type errors. https://nextjs.org/docs/app/api-reference/config/typescript#disabling-typescript-errors-in-production
- [maintainability] **Remove or gate `webpack` config; Turbopack is the default (16).** A `webpack()` key left in `next.config` either errors or silently forces the old bundler. https://nextjs.org/docs/app/guides/upgrading/version-16#turbopack-by-default
- [maintainability] **Replace `next lint` with `eslint` or `biome` run directly (16).** `"lint": "next lint"` in `package.json` no longer exists, and `next build` no longer lints. https://nextjs.org/docs/app/guides/upgrading/version-16#next-lint-command
- [correctness] **Set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` on every instance** of a horizontally scaled self-hosted deployment, or Server Function calls fail across instances. https://nextjs.org/docs/app/guides/self-hosting#server-functions-encryption-key
- [correctness] **Copy `public` and `.next/static` yourself when using standalone output.** A Dockerfile that copies only `.next/standalone` 404s on every image and chunk. https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files

## Relationship to a project's CLAUDE.md

A project's own Next.js conventions usually restate a subset of these rules. Where they overlap, cite nextjs.org so the reasoning is visible. Where the project's CLAUDE.md is stricter (for example no `'use client'` in `app/` at all, or one data library), the project rule wins. The security rules in sections 3, 4 and 7 are not overridable; a future security-review skill will own them in full and this file keeps the Next-specific ones.
