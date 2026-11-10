---
name: boundary-validation
description: Validate data where it crosses a trust boundary, in both directions - requests entering a server, responses entering a client, rows leaving a database, values from environment or config. Use when writing or reviewing API handlers, fetch wrappers, form submission, parsers, or any code that turns unknown into typed.
metadata:
  trigger: route handler, request body, fetch response, "as Type" casts on external data, Number() on input, JSON.parse, environment variables, "trust the client"
---

# Boundary validation

Code inside a boundary works with typed, checked values. Code at the boundary turns `unknown` into those values or refuses. Nothing in between coerces, guesses or casts.

## Inbound (server receiving a request)

1. **Parse, then shape, then fields.** Invalid JSON, a non-object body, and a bad field are three different answers. Each names what was wrong: `{ field, message }`.
2. **Order the checks by what they protect.** Identity first, then limits tied to identity (rate, quota), then the payload. A caller must not be able to skip a limit by sending a broken order, and a limit must not be charged to a caller who could not be identified.
3. **Normalise identity before using it as a key.** Trim, case-fold, length-check the normalised value. Three spellings of one name are one caller, or the design says why not.
4. **Never coerce unknown values.** `Number(x)`, `String(x)` and template literals on unvalidated input can throw or lie. Check `typeof`, then `Number.isSafeInteger`, then range. Echo a value back only after it passed.
5. **Server-authoritative values are looked up, not received.** Prices, permissions, limits, the current state. The client sends an identifier; the server resolves it. A request that carries a price is a request to be ignored on that field.
6. **Bound every input.** Maximum length, maximum amount, maximum body size. The bound is a named constant with a reason.
7. **Reject, do not repair.** No clamping, rounding or defaulting of bad input. Declared normalisations (trim, case-fold, a canonical format for phone numbers or dates) run before validation and are tested as part of the contract; anything else that would turn a bad value into a good one is a rejection, with the issues list and the status the table below gives.

## Outbound (client receiving a response)

1. **The client validates its own API's responses.** A deploy skew, a proxy error page or a crashed handler can return anything. Check status, then parse JSON defensively, then check shape per variant before touching state.
2. **Keep previous state on anything unexpected.** An unrecognised body leaves the last good snapshot and the user's input where they were, with a message that says so.
3. **Map status to meaning once.** One function from `(status, body)` to a typed outcome; components never see raw responses.
4. **Every variant checks every required field.** A discriminated union is only as safe as the check on each branch: `kind` first, then the fields that branch promises. Numbers are checked as safe, non-negative integers where that is the domain.

## Status codes for a refusal that is not an error

Follow the project's existing API convention first. Where there is none, these are the defaults:

| Situation | Status | Note |
|-----------|--------|------|
| Body or field invalid | 400 | issues list in the body |
| Caller is over a limit | 429 | `Retry-After` header, seconds, rounded up |
| Request is valid but the domain refuses it | 422 or 409 | 422 when the caller's input cannot be satisfied, 409 when the resource's state forbids it now |
| Transient contention, retry will likely succeed | 503 | `Retry-After` header |

A refusal returns the same typed shape as a success, with `ok: false` and a `reason`, so the client has one parser.

## Types that carry the rules

- A refusal type per reason, each with the fields that reason needs: `{ reason: "expired"; expiredAt: string }`, not an optional `expiredAt` on a shared type.
- `readonly` on data that crosses the boundary; the receiver copies if it must change it.
- The parser's output type is the only type the inside sees. External data becomes typed through a parser that checks at runtime, never through an `as` cast that stands in for one. A cast directly after a check the type system cannot express is acceptable, with the check beside it.

## Checks before finishing

- Is there any `Number(`, `String(`, `+value` or template literal applied to a value that has not been validated?
- Can the client influence a value the server should own?
- Does a malformed body reach the limiter or the domain before being rejected?
- Does the client keep its state on a JSON 500, a non-JSON body and a success with a missing field?
- Is every variant of the response union checked field by field?
- Do tests cover the refusal paths through the real entry point, not only the happy path?
