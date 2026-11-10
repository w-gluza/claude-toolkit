# Screen, presentation, hook

How a feature's UI is split, and the interaction rules that go with the split. Applies to any feature that talks to a server; a static page does not need it.

## The three parts

- **`<Feature>Screen`** owns interaction state: what is selected, what has been entered, which step the user is on. It calls the hook and passes props and callbacks down. It is the only client component in the feature that knows about the API.
- **`<Feature>`** (the plain name) is presentation: props in, callbacks out, no fetching, no `useState` beyond purely visual toggles. Testable by rendering with props.
- **`use<Feature>`** is the hook that talks to the server: the request, the parsed outcome, the latest server state, a status, an error message. It knows nothing about selections or form fields.

Local state (selection, entered values) and server state (the last outcome, the latest snapshot) stay in different places. The screen derives what it needs from both; it does not copy one into the other.

## Interaction rules

1. **Derive, do not store.** `selectedItem` is `items.find(...)` from `selectedId`, not a second state variable that can disagree.
2. **Lock while pending.** While a request is in flight, every control that could change the request's inputs is disabled, and the submit handler returns early. One request at a time per screen.
3. **A failed request leaves the user's input alone.** Clear entered values only on a confirmed outcome. A network failure, an unexpected response or a validation error keeps selections and inputs where they were, with a message that says so.
4. **A refusal is feedback, not a reset.** If the server says no, the user's selections stay so they can adjust and retry. The message says what to do next.
5. **The last outcome belongs to the last attempt.** Any new interaction (select, enter, change, clear) clears the previous outcome and error, so the screen never shows a result for a state that no longer exists. If a history is wanted, that is a separate list, not the outcome area.
6. **Server state survives clearing the outcome.** The latest snapshot lives in its own state in the hook, so clearing the result does not blank the parts of the screen that show the server's view.
7. **Initial server state comes from the server render.** The page passes the first snapshot as a prop; the hook starts from it. No fetch-on-mount effect.

## Naming

- Booleans are `isX`: `isPending`, `isSubmitting`, `isPurchasing`. Not `busy`, `loading`, `flag`.
- The hook's action and the screen's handler use the domain's verb: if the domain, the API and the server all say `confirm`, the hook returns `confirm`, the screen has `handleConfirm`, the presentation takes `onConfirm`. Button text can still say "Book" for the user; the code uses one word.
- The function that resets feedback is named for what it clears: `clearOutcome`, not `reset`.
- Primitives (`Button`, a list item) take `disabled`; only the screen and the feature component know why.

## What this is not

- Not a state-management library. `useState` in the screen and one hook is enough until a second screen needs the same server state.
- Not a rule to split every component three ways. A feature with no server call has no hook; a screen with no local state is just the presentation.
