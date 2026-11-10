---
name: security-review
description: Review application code for exploitable weaknesses, distilled from OWASP ASVS, the OWASP Cheat Sheet Series, the OWASP API Security Top 10, MDN and the Next.js docs, each rule with a source link and a severity. Load when reviewing authentication, authorisation, Server Functions, route handlers, queries, HTML output, headers, secrets, uploads or dependencies, or when asked "is this secure".
allowed-tools: Read, Grep
---

# Security review (from OWASP, MDN and the Next.js docs)

Target: web applications and APIs, with Next.js as the framework examples. Extracted 2026-11-10 from OWASP ASVS 5.0.0, the OWASP Cheat Sheet Series and the OWASP API Security Top 10 2023, MDN and the Next.js 16.4.5 docs; see NOTICE.md for the licences.

The question this skill answers is "what can an attacker do with this code", including with input that is perfectly valid. A request for `/api/invoices/123` carries a real invoice id; the review asks whether the caller may see invoice 123. Whether the id is well-formed is boundary-validation's question, and this skill does not repeat its parse-and-reject rules.

## Before applying any rule

1. Name what is protected and from whom: the data, the actions, the users and roles, and the trust boundaries the change crosses (browser to server, server to database, server to third party, CI to registry). A finding without an attacker and an asset is a style note.
2. Identify the framework, the session or token mechanism and the data access layer. In Next.js, Server Functions and route handlers are public endpoints, the proxy runs before the cache and is optimistic, and anything a Client Component receives is in the HTML.
3. Review statically. Read code, configuration and tests; run the project's own tests and linters. Never probe a production system, send crafted requests to an environment you were not given, or write a working exploit. A finding is a smell in a diff with its consequence, not a demonstration.

## How to use this file

This file is the review checklist and the normal load: the rules that most often catch real defects, grouped by the smell you see in a diff, each tagged [exploitable] when the smell alone lets an attacker read, change or deny something, or [defence in depth] when it matters once another control fails. Report exploitable findings first; a defence-in-depth gap is a recommendation unless the control it backs up is also missing. The full set (74 rules, each with a short quotation, a Why, a Smell, a severity and one source link) lives in `references/`. Grep there for the exact wording or a rule not listed here; never read a reference file whole.

- `references/authentication.md` - session tokens and cookies, timeouts and logout, password storage, enumeration, throttling, JWT verification, CSRF, password reset, the Next.js data access layer
- `references/authorization.md` - object, function and property-level authorisation, tenant isolation, deny by default, server-side decisions, mass assignment, transaction gates, regression tests
- `references/injection-and-xss.md` - parameterised queries, NoSQL operators, command and template injection, deserialisation, path traversal, SSRF, output encoding, DOM sinks, sanitisers, JSON-LD
- `references/secrets-and-data-exposure.md` - secrets in source and bundles, runtime injection, logging, error messages, fail closed, URLs, response minimisation, cache and storage, TLS
- `references/web-security.md` - CSP, CORS, Fetch Metadata, postMessage, framing and COOP, HSTS, nosniff, Referrer-Policy, SRI, open redirects
- `references/api-security.md` - authentication on every endpoint, old versions, webhooks, resource limits, business-flow automation, third-party responses, misconfiguration, safe methods, uploads
- `references/dependencies-and-supply-chain.md` - lockfiles, vetting, install scripts, registries, scanning, SBOM, npm publishing, CI secrets and pipelines, DNS decommissioning

When citing a rule in a review, link the source so the author can read the reasoning, and name the ASVS requirement where there is one.

## 1. Valid id, wrong user

Smell: a lookup by a client-supplied id with no owner or tenant comparison, a role read from the request, a Server Function that goes straight to the database, a body spread onto a model.

- [exploitable] **Check that the caller may act on the specific record on every client-supplied id.** `findUnique({ where: { id: params.id } })` then return or delete with no owner or tenant comparison is the whole of broken object-level authorisation. https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/#is-the-api-vulnerable
- [exploitable] **Verify tenant membership server-side and put the tenant in every tenant-owned query.** An `X-Tenant-ID` header or `body.orgId` straight into `WHERE tenant_id = :tid`, or a repository method that takes only `resourceId`, crosses tenants. https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html#3-preventing-cross-tenant-data-access-idor-prevention
- [exploitable] **Deny every function by default and grant explicitly, whatever the path or method.** A guarded `GET` beside an unguarded `DELETE`, or an export endpoint under `/api/users/` while only `/api/admin/*` is matched. https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/#how-to-prevent
- [exploitable] **Decide on the server from verified identity, never from a client-editable value.** `(await searchParams).isAdmin`, `req.headers['x-user-id']`, or `{isAdmin && <DeleteButton />}` with no server check. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md#v83-operation-level-authorization
- [exploitable] **Re-check the caller inside every Server Function.** A `'use server'` body that goes straight to `db.` with no session read is a public endpoint; a role check only in `layout.tsx` or `proxy.ts` does not carry over. https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization
- [exploitable] **Allow-list writable fields; never bind the body onto a model.** `db.user.update({ data: req.body })`, `Object.assign(user, body)` or `...body` on a model that has `role` or `ownerId`. https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/#how-to-prevent
- [exploitable] **Return only the fields the viewer needs, never a raw record.** `return user` from a Server Action, `res.json(rows)` after `select *`, `{...record}` into Client Component props. https://nextjs.org/docs/app/guides/data-security#controlling-return-values
- [defence in depth] **Put the checks in one server-only data access layer that returns DTOs**, so a new handler cannot forget them. https://nextjs.org/docs/app/guides/data-security#data-access-layer
- [defence in depth] **Add cross-user, cross-role and cross-tenant negative tests for every new resource endpoint.** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html

## 2. Sessions, tokens and login

Smell: `jwt.decode` used as authentication, a session id from `Math.random()`, different messages for unknown email and wrong password, a mutation checked only by the session cookie.

- [exploitable] **Verify the session in the data access layer on every read and mutation; the proxy check is optimistic only.** `verifySession()` only in `proxy.ts`, or a Server Action querying by a form-supplied `userId`. https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional
- [exploitable] **Verify self-contained tokens with a pinned algorithm list, trusted keys and `exp`, `nbf` and `aud` checks.** `jwt.decode(token)` as auth, `jwt.verify` without `algorithms`, `ignoreExpiration: true`, no `audience`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x18-V9-Self-contained-Tokens.md#v91-token-source-and-integrity
- [exploitable] **Require a CSRF token or an Origin check on cookie-authenticated state changes, and never change state on GET.** A mutating `POST` or Server Action checked only by the session cookie, or `sameSite: 'none'`; SameSite is defence in depth, not the control. https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#limitations-of-samesite
- [exploitable] **Generate session tokens with a CSPRNG and rotate them on login and privilege change.** A `Math.random()` or `Date.now()` token, or `session.userId = user.id` with no regeneration. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md#v72-fundamental-session-management-security
- [exploitable] **Return the same response, status and timing whether or not the account exists.** `'No account with that email'` beside `'Wrong password'`, 404 against 401, an early return before the hash check. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v63-general-authentication-security
- [exploitable] **Make reset tokens CSPRNG, single-use and expiring, with no account change before a valid token is presented.** `randomBytes(4)`, no `expiresAt`, a token row kept after use, a lock set at request time. https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html#introduction
- [exploitable] **Store passwords with a memory-hard salted hash from a library.** Any hand-written hashing, `sha256(password)`, or a fast hash without a work factor. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- [defence in depth] **Set session cookies with `Secure`, `HttpOnly`, `SameSite` and the `__Host-` prefix, from `Set-Cookie` only**, with server-side idle and absolute timeouts and invalidation on logout. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x12-V3-Web-Frontend-Security.md#v33-cookie-setup
- [defence in depth] **Throttle per account and lock out in a way that cannot be abused to deny a victim.** https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md#v63-general-authentication-security

## 3. Data into queries, shells, URLs and the DOM

Smell: a template literal building SQL, `exec` with a concatenated string, `fetch` of a client-supplied URL, `innerHTML` or `dangerouslySetInnerHTML` with user content.

- [exploitable] **Bind every value through a parameterised query and allow-list structural parts, including behind the ORM's raw escape hatch.** `` query(`... WHERE email = '${email}'`) ``, `orm.raw("..." + value)`, `` `ORDER BY ${req.query.sort}` ``. https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#parameterized-queries
- [exploitable] **Confirm a NoSQL filter value is the expected scalar before it enters the query object.** `find({ name: req.body.name })` with no `typeof` check, `find(req.body.filter)`, a client-reachable `$where`. https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Security_Cheat_Sheet.html#prevent-nosql-injection
- [exploitable] **Call a library function instead of a shell; otherwise an argument array to an allow-listed command.** `exec("convert " + file)`, `spawn(cmd, args, { shell: true })`. https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html#defense-option-1-avoid-calling-os-commands-directly
- [exploitable] **Fetch from the server only allow-listed hosts, never a complete client-supplied URL; no redirects, no internal ranges, no raw response relay.** `fetch(req.body.url)`, `http.get(webhook.url)`, `res.send(await upstream.text())`. https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#url
- [exploitable] **Resolve file paths against a fixed base and reject anything that escapes it.** `readFile(join(uploadDir, req.query.name))` with no normalisation check. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x14-V5-File-Handling.md#v53-file-storage
- [exploitable] **Write untrusted data to the DOM through text sinks and check the URL scheme first.** `el.innerHTML = data`, `document.write(q)`, `eval(json)`, `<a href={user.website}>`, `location.href = params.get("next")`. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#safe-sinks
- [exploitable] **Put a maintained HTML sanitiser between user HTML and every framework escape hatch, enforced with Trusted Types.** `dangerouslySetInnerHTML={{ __html: post.body }}`, `v-html="comment"`, `bypassSecurityTrustHtml(input)`, `createHTML: (s) => s`. https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS#sanitization
- [exploitable] **Escape `<` in JSON-LD and any JSON embedded in a script tag.** `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` with a user-supplied field. https://nextjs.org/docs/app/guides/json-ld
- [exploitable] **Never deserialise untrusted data with a format that can instantiate types.** `unserialize`, `pickle.loads`, `yaml.load` without a safe loader, on request data. https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html

## 4. Secrets and what leaves the server

Smell: a literal key in source, `NEXT_PUBLIC_` on a secret, `err.stack` in a response, a `catch` that grants access, a token in a query string.

- [exploitable] **Keep keys and secrets out of source control and build artefacts.** A literal `apiKey: "sk_live_..."`, `password=` in a committed `.env`, a private key block in a fixture. https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#storage
- [exploitable] **Never put a secret in a `NEXT_PUBLIC_` variable or a module a Client Component can import.** `NEXT_PUBLIC_STRIPE_SECRET_KEY`, or `process.env.API_SECRET` in a file without `import 'server-only'` reached from `'use client'`. https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser
- [exploitable] **Return a generic message on unexpected errors and keep the detail server side.** `res.status(500).json({ error: err.message, stack: err.stack })`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x25-V16-Security-Logging-and-Error-Handling.md#v165-error-handling
- [exploitable] **Fail closed when a security check throws.** `catch (e) { authorised = true }`, an empty `catch {}` around `verifyToken(...)`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x25-V16-Security-Logging-and-Error-Handling.md#v165-error-handling
- [exploitable] **Keep secrets, tokens and personal data out of URLs and query strings.** `?token=`, `?api_key=`, credentials read from `searchParams` on a GET; they land in logs, history and referrers. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x23-V14-Data-Protection.md#v142-general-data-protection
- [exploitable] **Log security events, never credentials, keys or raw tokens.** `logger.info({ headers: req.headers })`, `console.log(session)`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x25-V16-Security-Logging-and-Error-Handling.md#v162-general-logging
- [defence in depth] **Inject secrets at runtime from a secret store, rotate them, and never bake them into images.** `ENV API_KEY=` or `ARG` in a Dockerfile. https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html#51-injection-of-secrets-file-in-memory
- [defence in depth] **Send `Cache-Control: no-store` on sensitive responses and keep nothing sensitive in web storage.** A token in `localStorage`, a personal-data response with no cache header. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x23-V14-Data-Protection.md#v143-client-side-data-protection

## 5. Browser and HTTP headers

Smell: `Access-Control-Allow-Origin` reflected from the request, `redirect(searchParams.get('next'))`, a `message` listener with no origin check, `'unsafe-inline'` in `script-src`.

- [exploitable] **Set `Access-Control-Allow-Origin` to a fixed value or an allow-list match, never the reflected Origin.** `res.setHeader('Access-Control-Allow-Origin', req.headers.origin)` beside `Access-Control-Allow-Credentials: true`, `cors({ origin: true })`, `origin.endsWith(...)`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x12-V3-Web-Frontend-Security.md#v34-browser-security-mechanism-headers
- [exploitable] **Redirect only to allow-listed destinations matched on the parsed URL.** `res.redirect(req.query.returnTo)`, `redirect(searchParams.get('next'))`, a guard that only checks `startsWith('/')`. https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html#validating-urls
- [exploitable] **Check `event.origin` exactly before trusting a `postMessage`, and name the target origin when sending.** `addEventListener('message', ...)` with no `e.origin ===`, `e.origin.includes('.example.com')`, `postMessage(payload, '*')`. https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging
- [exploitable] **Send `frame-ancestors` on every response, with `X-Frame-Options` as legacy only, and COOP on documents.** `X-Frame-Options: SAMEORIGIN` with no `frame-ancestors`, `ALLOW-FROM`, `frame-ancestors` in a `<meta>` tag. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x12-V3-Web-Frontend-Security.md#v34-browser-security-mechanism-headers
- [defence in depth] **Ship a strict CSP with nonces or hashes, `object-src 'none'`, `base-uri 'none'`, no `'unsafe-inline'` and no host wildcards.** In Next.js the nonce is generated per request in the proxy and the route renders dynamically. https://nextjs.org/docs/app/guides/content-security-policy
- [defence in depth] **Send HSTS with a max-age of at least a year and `includeSubDomains` on every HTTPS response**, plus `X-Content-Type-Options: nosniff` and a `Referrer-Policy` that strips path and query cross-origin. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x12-V3-Web-Frontend-Security.md#v34-browser-security-mechanism-headers
- [defence in depth] **Use Subresource Integrity on static versioned third-party assets.** A `<script src="https://cdn...">` with no `integrity`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x12-V3-Web-Frontend-Security.md#v36-external-resource-integrity

## 6. The API surface

Smell: a new route with no auth guard where its siblings have one, `limit = req.query.limit ?? 20` with no maximum, a webhook that acts on its body with no signature check, `rejectUnauthorized: false`.

- [exploitable] **Require authentication on every non-public endpoint, including internal, admin, debug, metrics and webhook routes.** A `/debug` or `/metrics` route mounted before the auth middleware. https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#access-control
- [exploitable] **Verify webhook signatures over the raw body with a constant-time compare, and reject replays.** A handler acting on `req.body.event` with no signature check, `sig === expected`, signing `JSON.stringify(req.body)`. https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html#signature-verification
- [exploitable] **Bound per-request and per-client consumption: rate limits, page and batch caps, body limits, upstream timeouts.** `limit = req.query.limit ?? 20` with no maximum, `Promise.all(req.body.ids.map(load))`, an OTP endpoint with no limiter. https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/#how-to-prevent
- [exploitable] **Protect sensitive business flows against automation.** A new `/checkout`, `/reserve` or `/votes` handler with only a global per-IP limiter and no per-user cap. https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/#is-the-api-vulnerable
- [exploitable] **Treat third-party API responses as untrusted, with timeouts, bounded redirects and TLS verification on.** `rejectUnauthorized: false`, `fetch(url)` with no `AbortSignal.timeout`, an upstream value interpolated into SQL. https://owasp.org/API-Security/editions/2023/en/0xaa-unsafe-consumption-of-apis/#how-to-prevent
- [exploitable] **Accept uploads only with an allow-listed extension verified by content, a size cap, a generated name outside the web root, and never execute them.** `dest: 'public/uploads'`, a check on `file.mimetype` alone, `fs.writeFile(join(uploadDir, file.originalname))`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x14-V5-File-Handling.md#v53-file-storage
- [exploitable] **Retire or protect old API versions and non-production hosts to the production standard.** `/v1/` left unauthenticated after `/v2/` gained a guard. https://owasp.org/API-Security/editions/2023/en/0xa9-improper-inventory-management/
- [defence in depth] **Turn off debug modes, stack traces, default credentials, directory listings, TRACE and unused methods in production.** https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/

## 7. Dependencies and the pipeline

Smell: `npm install` in CI, a package name one character off a popular one, `echo $SECRET` in a workflow, `continue-on-error` on the scanner step.

- [exploitable] **Resolve internal packages only from the expected registry.** An unscoped internal name in `package.json` with no `@org:registry=` in `.npmrc` invites dependency confusion. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x24-V15-Secure-Coding-and-Architecture.md#v152-security-architecture-and-dependencies
- [exploitable] **Check that a new dependency is the intended, maintained package.** A name one character off a popular package, a tiny download count, a first release days ago. https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html#10-understanding-typosquatting-and-slopsquatting-attacks
- [exploitable] **Keep CI secrets in the platform's secret store with least privilege, and never print them.** A token literal in a workflow, `echo $SECRET`, `permissions: write-all`. https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html#secrets-management
- [exploitable] **Scan every build, remediate by severity, and suppress per CVE, not per package.** `audit=false`, an ignore entry naming a whole package, a scanner step with `continue-on-error`. https://github.com/OWASP/ASVS/blob/master/5.0/en/0x24-V15-Secure-Coding-and-Architecture.md#v152-security-architecture-and-dependencies
- [exploitable] **Remove or repoint the DNS record before decommissioning the resource it points at.** An infrastructure change that deletes an app or bucket while its `CNAME` stays. https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html#1-manage-dns-record-lifecycle-during-decommissioning
- [defence in depth] **Commit the lockfile and install with a frozen install in CI; run installs with scripts disabled by default.** `npm install` in CI, a `package.json` change with no lockfile diff. https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html#2-enforce-the-lockfile
- [defence in depth] **Review pipeline changes behind protected branches and pin third-party steps immutably.** `uses: vendor/action@main`. https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html

## Output

Lead with the exploitable findings, each with: the file and line, the smell as seen, what an attacker gains, the rule and its source, the smallest fix, and how to confirm it (a negative test, a header check, a config diff). Then the defence-in-depth findings as recommendations. Then "Not checked": the boundaries, environments or sources the review could not see. Do not manufacture findings; a change with no attacker-reachable weakness gets "no exploitable findings" and the gaps that remain.

## Relationship to other skills and a project's CLAUDE.md

boundary-validation owns the shape of input checks; next-best-practices owns the framework contracts this skill cites for authorisation placement; apply-review carries a finding from here through to a fix; evidence-synthesis answers whether a control is actually deployed. A project's CLAUDE.md may add stricter rules and may name an accepted risk with its reason; it cannot turn an exploitable finding into a non-finding.
