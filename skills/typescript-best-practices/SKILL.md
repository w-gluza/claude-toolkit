---
name: typescript-best-practices
description: TypeScript code-review rules distilled from the official handbook, release notes and TSConfig reference, each with a source link. Load when writing or reviewing types, narrowing, generics, tsconfig or module settings so invalid states are hard to represent and mistakes surface at compile time, and when upgrading to TypeScript 6.0 or 7.0.
allowed-tools: Read, Grep
---

# TypeScript best practices (from typescriptlang.org)

Target: TypeScript 7.x, with rules applying from 5.0 unless marked with a later version. Extracted 2026-11-10 from the handbook, reference pages, release notes 3.0 to 6.0 and the TSConfig reference, with the 7.0 announcement paraphrased; see NOTICE.md for the licence.

## Before applying any rule

1. Read the installed version from `node_modules/typescript/package.json` (fall back to the `typescript` entry in `package.json`). Rules marked with a version apply only from that version; on 4.x say which rules do not apply, and on 3.x or older stop and say the skill does not cover that version.
2. Read `tsconfig.json`, including any `extends` chain. Note `strict`, `module`, `moduleResolution`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` and `erasableSyntaxOnly`. A rule that depends on an option says so; do not report code as wrong under an option the project has not enabled, report the option as the finding instead.
3. Note the framework. React and Next.js files follow react-best-practices and next-best-practices for component and framework contracts; this skill covers the types inside them. Validation of external data at a trust boundary is boundary-validation; this skill says once that types check nothing at runtime and leaves the parse-and-reject shape to that skill.

## How to use this file

This file is the review checklist and the normal load: the rules that most often catch real defects, grouped by the smell you see in a diff, each tagged [correctness], [safety], [maintainability], [compatibility] or [modernisation]. Correctness and safety rules hold everywhere; the other three are defaults the project's CLAUDE.md may override. The full set (86 rules, each with a short quotation from the docs and one source anchor) lives in `references/`. Grep there for the exact wording or a rule not listed here; never read a reference file whole, each is 10 to 17 KB.

- `references/type-modelling.md` - discriminated unions, literal unions, structural typing, readonly, optional properties, tuples, type versus interface, enums versus objects, deriving types
- `references/narrowing-and-control-flow.md` - typeof and truthiness pitfalls, discriminants, exhaustiveness, control flow analysis, type predicates, assertion functions, overloads, reading errors
- `references/generics-and-utilities.md` - when a type parameter earns its place, constraints, inference, const type parameters, NoInfer, conditional and mapped types, utility types, compile cost
- `references/type-safety.md` - unknown over any, strict flags, assertions and suppressions, non-null, nullability, callback variance, spread, the runtime boundary
- `references/compiler-and-modules.md` - strict options, type-only imports, module and resolution settings, import extensions, declaration files and publishing, 6.0 deprecations and 7.0 removals
- `references/modernisation.md` - older pattern to newer feature, each with its version: satisfies, as const, const type parameters, ?. and ??, import type, override, using, decorators, enums, namespaces

When citing a rule in a review, link the typescriptlang.org source so the author can read the reasoning.

## 1. States modelled as flags

Smell: optional properties that only make sense together, a boolean per state, a `string` compared to a handful of literals, a non-null assertion inside a `kind` check.

- [correctness] **Model each state as its own union member with a literal discriminant.** `{ kind: "a" | "b"; x?: number; y?: number }` lets `kind: "a"` carry `y` and forces `shape.radius!`; `{ kind: "a"; x: number } | { kind: "b"; y: number }` does not. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
- [correctness] **Use a union of literals for a known set of values, not `string` or `number`.** `alignment: string` compared to `"left"` in the body accepts `"lef"`. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types
- [correctness] **Distinguish a missing property from one set to `undefined` when the difference matters (`exactOptionalPropertyTypes`, 4.4+).** `{ age: undefined }` assigned to `age?: number`, or `?: T | undefined` sprinkled to compile, is the smell. https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes
- [maintainability] **Prefer an `as const` object plus a derived union over `enum` in new code (`erasableSyntaxOnly`, 5.8+).** Enums stay supported; the choice is per project, and `const enum` in a published `.d.ts` is a defect either way. https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
- [maintainability] **Derive types from the runtime source of truth with `typeof`, `keyof` and indexed access.** `const ROLES = [...] as const` next to `type Role = "admin" | "editor"` restated by hand drifts. https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
- [correctness] **Do not rely on a type alias or a same-shaped class to keep two values apart.** `cancel(orderId: OrderId)` accepts a `UserId` when both alias `string`; aliases are transparent and only private or protected class members make a type nominal. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases
- [correctness] **Treat an excess property error as a bug, not an obstacle.** `fn({ ... } as Config)` or a literal moved into a variable to silence the error hides a misspelt key. https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks

## 2. Assertions where a check belongs

Smell: `as T`, `as unknown as T`, `!`, `@ts-ignore`, `any` in a signature, a type predicate whose body does not prove its claim.

- [safety] **Treat `as T` as an unchecked claim, and `as unknown as T` as a louder one.** `res.data as Order[]` and `value as unknown as Config` tell the compiler to stop checking; narrow or improve the type model first, and keep an unavoidable cast local with the check beside it. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
- [safety] **Replace `!` with a check or a type that admits the absence.** `map.get(id)!.name`, `users.find(...)!` and `private client!: Client` each defer a crash to runtime. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
- [safety] **Let an early return or throw narrow instead of asserting.** `(padding as string)` or `value!` below a guard that already excluded the other type means the guard is wrong or the cast is. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#control-flow-analysis
- [safety] **Suppress with `// @ts-expect-error` and a reason, never `// @ts-ignore`.** The former fails the build when the error goes away, so dead suppressions are found. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#ts-ignore-or-ts-expect-error
- [safety] **Make a type predicate test every property it claims.** `x is User` whose body checks only `typeof x === "object"` is a cast with a better name. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
- [safety] **Give throw-on-failure helpers an `asserts` signature or a `: never` return.** `function invariant(cond: unknown): void` followed by `(x as string)` is the smell; `asserts cond` lets the compiler narrow after the call. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
- [safety] **Narrow `catch` variables from `unknown` instead of annotating them `any` (4.4+).** `catch (err: any)` and `(err as Error).message` with no `instanceof` assume what was thrown. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables---useunknownincatchvariables

## 3. Narrowing and exhaustiveness

Smell: a `switch` over a discriminant with no `default`, `if (name)` on a value where the empty string is valid, `typeof x === "object"` treated as proof of an object.

- [correctness] **End a `switch` over a discriminant with a `default` that assigns to `never`.** A new union member then fails to compile instead of falling through silently. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
- [correctness] **Compare against `null` and `undefined`, not bare truthiness, when `0` or `""` is valid.** `if (!count) return` on `number | undefined` drops zero; `!= null` excludes both absences and nothing else. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#truthiness-narrowing
- [correctness] **Do not treat `typeof x === "object"` as proof of an object or array.** `typeof null` is `"object"`, so `for (const s of strs)` inside that check crashes on `string[] | null`. https://www.typescriptlang.org/docs/handbook/2/narrowing.html#typeof-type-guards
- [correctness] **Filter with `x !== undefined`, not `!!x` or `Boolean`, so the predicate is inferred (5.5+).** `.filter(Boolean) as string[]` keeps the cast and drops empty strings. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates
- [correctness] **Keep a hoisted or destructured discriminant `const` (4.4+, 4.6+).** Narrowing through `const isString = typeof x === "string"` or `const { kind, payload } = action` works only for `const`, so a `let` silently stops narrowing. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#control-flow-analysis-of-aliased-conditions-and-discriminants
- [maintainability] **Prefer a union parameter to overloads of the same arity.** Overloads are checked one at a time, so a caller holding the union cannot call either. https://www.typescriptlang.org/docs/handbook/2/functions.html#writing-good-overloads

## 4. any and the runtime boundary

Smell: `any` in a parameter or return, `JSON.parse(x) as T`, `await res.json()` assigned to a typed variable, `process.env.X as string`.

- [safety] **Type values of unknown shape as `unknown`, not `any`.** `(data: any)`, `JSON.parse(text) as any` and `Record<string, any>` switch checking off for everything they touch; `unknown` forces a narrowing before use. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type
- [safety] **Validate data at every runtime boundary, because types check no runtime value.** `const user: User = await res.json()` is a hope, not a check; the parse-and-reject shape is in boundary-validation. https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types
- [safety] **Use `?.` only where the type says the left side can be nullish.** `user?.id` where `user: User`, or `?.` added to silence an error, hides a violated invariant instead of surfacing it. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining
- [safety] **Do not type callables as `Function`.** It accepts any call with any arguments and returns `any`; write the signature. https://www.typescriptlang.org/docs/handbook/2/functions.html#function
- [correctness] **Declare callback parameters with function syntax, not method syntax, so `strictFunctionTypes` applies.** `onChange(value: T): void` in an interface is checked bivariantly; `onChange: (value: T) => void` is not. https://www.typescriptlang.org/tsconfig/#strictFunctionTypes

## 5. Generics

Smell: a type parameter used once, a container constrained instead of its element, `ReturnType` of an overloaded function, a conditional type that distributes by surprise.

- [maintainability] **Add a type parameter only when it relates two or more positions.** `function greet<S extends string>(s: S): void` is `(s: string) => void` with extra reading. https://www.typescriptlang.org/docs/handbook/2/functions.html#type-parameters-should-appear-twice
- [correctness] **Push the type parameter down to the element rather than constraining the container.** `function first<T extends any[]>(arr: T)` returns `any`; `function first<T>(arr: T[]): T | undefined` returns the element. https://www.typescriptlang.org/docs/handbook/2/functions.html#push-type-parameters-down
- [correctness] **Return the type parameter itself, not a value that merely matches its constraint.** `(obj: Type, n: number): Type` that returns `{ length: n }` or `fallback as Type` lies to the caller. https://www.typescriptlang.org/docs/handbook/2/functions.html#working-with-constrained-values
- [correctness] **Tie a key parameter to its object with a `keyof` constraint.** `function get<T>(obj: T, key: string) { return (obj as any)[key] }` is the smell; `K extends keyof T` returns `T[K]`. https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints
- [correctness] **Wrap a position in `NoInfer` when it must be checked against a type parameter rather than contribute to it (5.4+).** `(colors: C[], defaultColor?: C)` accepts a default that is not in the list. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type
- [correctness] **Give a `const` type parameter a `readonly` constraint (5.0+).** `<const T extends string[]>` still infers `string[]`; `readonly string[]` keeps the literals. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters
- [correctness] **Wrap both sides in a tuple when a conditional type must not distribute over a union.** `T extends string ? true : false` gives `boolean` for `string | number`; `[T] extends [string]` gives `false`. https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
- [correctness] **Do not derive a type from an overloaded function and expect a particular overload.** `ReturnType<typeof createLabel>` sees only the last signature. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types
- [maintainability] **Keep recursive conditional types shallow and tail-recursive (4.5+).** Instantiation depth is capped and type-check time grows with it; a simpler representation usually exists. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types

## 6. Readonly, declarations and derivations

- [correctness] **Type arrays and tuples that are never mutated as `readonly T[]` or `readonly [A, B]`.** `function render(items: string[])` that only iterates rejects an `as const` array for no reason and permits a `push` by accident. https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-tuple-types
- [correctness] **Remember `readonly` is shallow and not checked across assignment.** A `readonly` property holding an object still has mutable fields, and a mutable alias to the same object can write it. https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties
- [maintainability] **Use `interface` for object shapes you may extend and `type` for unions, tuples and derived types; follow the project if it has chosen.** The one semantic difference is declaration merging. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces
- [maintainability] **Prefer an object to a tuple when positions are not self-evident.** `[string, number, boolean]` reads as nothing at the call site. https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types

## 7. Modules and compiler configuration

Smell: `"strict": false` or `"skipLibCheck": true` arriving with a dependency bump, `"moduleResolution": "node"`, a value import of an interface, an overload list that starts with `unknown`.

- [safety] **Keep `strict` on and fix what it reveals.** Loosening the config to make a build pass hides the error in every file; `skipLibCheck` is the one trade-off worth making deliberately, for third-party declarations only. https://www.typescriptlang.org/tsconfig/#strict
- [safety] **Enable `noUncheckedIndexedAccess` where index signatures and arrays are read.** `users[0].name` and `config[key].value` are `undefined` at runtime for a missing entry and typed as present without it (4.1+). https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess
- [compatibility] **Set `module` for the host: `nodenext` for Node.js, `preserve` or `esnext` with `moduleResolution: bundler` for bundled code.** `"module": "esnext"` in a server project and `"moduleResolution": "node"` anywhere are the smells. https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-node18-node20-nodenext
- [compatibility] **Write relative imports with the output extension under `nodenext`.** `import { add } from "./math"` in an `.mts` file fails at runtime; `rewriteRelativeImportExtensions` (5.7+) lets source extensions be rewritten. https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution-is-host-defined
- [correctness] **Mark type-only imports and exports with `type`, and turn on `verbatimModuleSyntax` (5.0+).** `export { Props } from "./Props"` where `Props` is an interface is elided or not depending on settings; `type` makes it explicit. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
- [correctness] **Enable `noFallthroughCasesInSwitch`.** `case 0: log("even"); case 1:` runs both. https://www.typescriptlang.org/tsconfig/#noFallthroughCasesInSwitch
- [correctness] **Enable `noImplicitOverride` and write `override` (4.3+).** A renamed base method then fails to compile in every subclass that overrode it. https://www.typescriptlang.org/tsconfig/#noImplicitOverride
- [maintainability] **Order overloads specific-first and collapse same-arity overloads into optionals or unions.** `declare function fn(x: unknown): unknown` listed first shadows every other signature. https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#ordering
- [maintainability] **In declaration files use `number`, `string`, `boolean`, `object` and `unknown`, never `Number`, `String`, `Object` or `any`.** https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#general-types
- [compatibility] **Ship declarations with `declaration` and `declarationMap`, a `types` field, and `isolatedDeclarations` (5.5+) when other tools generate them.** https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html

## 8. TypeScript 6.0 and 7.0

6.0 is the bridge release: it changes defaults and deprecates what 7.0, the native compiler, removes. Check the installed version before citing these.

- [compatibility] **Set `types`, `rootDir`, `target` and `lib` explicitly rather than inheriting the 6.0 defaults.** `types` now defaults to `[]`, `rootDir` to the tsconfig directory, `target` to a floating yearly value, and `lib` already includes `dom.iterable` with `dom`. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
- [compatibility] **Replace every option 6.0 deprecated instead of hiding it with `ignoreDeprecations`.** `target: es5`, `downlevelIteration`, `moduleResolution: node`, `node10` and `classic`, `module: amd`, `umd`, `system` and `none`, `baseUrl`, `esModuleInterop: false`, `allowSyntheticDefaultImports: false`, `alwaysStrict: false`, `outFile`, `module Foo {}`, the `asserts` import keyword and `no-default-lib` are gone in 7.0. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html#preparing-for-typescript-70
- [compatibility] **Prove the build on 6.0 with `--stableTypeOrdering` and no `ignoreDeprecations` before adopting 7.0.** 7.0 checks what 6.0 checks under those conditions, sorts types deterministically so union order in emitted declarations can change, parallelises across checkers whose count should be pinned in CI, errors on `tsc file.ts` beside a tsconfig unless `--ignoreConfig` is passed, and ships no programmatic API until 7.1. https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- [compatibility] **`strict`, `noUncheckedSideEffectImports` and `esModuleInterop` are on by default from 6.0.** A project that relied on `import * as express` then `express()` must switch to a default import. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html

## 9. Modernisation

Identify these during any review, not only when asked. Each is a replacement for a pattern that still compiles; check the version first and distinguish a required correctness fix from an optional rewrite.

- [modernisation] **`?.` and `??` instead of `&&` chains and `||` defaults (3.7).** `const volume = saved.volume || 0.5` turns a legitimate `0` into the default. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
- [modernisation] **`satisfies` instead of a widening annotation or a cast (4.9+).** `const palette: Record<Colors, string | RGB> = {...}` followed by `palette.green as string` loses what the literal knew. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator
- [modernisation] **`as const` instead of hand-written literal types and readonly tuples (3.4).** `{ method: "GET" as "GET" }` and `const pair: readonly [number, number] = [10, 20]`. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
- [modernisation] **A `const` type parameter instead of `as const` at every call site (5.0+).** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters
- [modernisation] **Drop hand-written type predicates the compiler infers (5.5+).** `.filter((bird): bird is Bird => bird !== undefined)` is inferred from the body alone. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates
- [modernisation] **`NoInfer<T>` instead of a second type parameter that only blocks inference (5.4+).** `<C extends string, D extends C>(colors: C[], defaultColor?: D)`. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type
- [modernisation] **`using` and `await using` instead of `try`/`finally` for disposables (5.2+).** `close()` repeated before each `return` of a function that opens a handle. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management
- [modernisation] **Standard decorators instead of `experimentalDecorators` (5.0+)**, where the framework supports them. https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators
- [modernisation] **ES modules instead of namespaces for new code.** `module Foo {}` is deprecated in 6.0 and removed in 7.0; `namespace Foo {}` still works but a file is the unit of scope now. https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html
- [modernisation] **`Awaited<T>` instead of a hand-rolled unwrapping type (4.5+).** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements

## Relationship to a project's CLAUDE.md

A project's own TypeScript conventions usually restate a subset of these rules. Where they overlap, cite typescriptlang.org so the reasoning is visible. Where the project's CLAUDE.md is stricter (for example `type` only, no enums, no `!` anywhere), the project rule wins. Where the project has not enabled an option a rule depends on, the finding is the option, with the migration cost stated, not the code.
