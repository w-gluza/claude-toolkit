# Test patterns

Mechanics for the rules in SKILL.md. Examples use a bookings API; swap the names.

## Boot real route modules with a seeded instance

When the app holds its dependencies in a process-wide singleton (a store, a limiter), integration tests replace it before importing the routes, and reset the module cache so the import sees the replacement.

```ts
const bootApp = async (initial?: BookingsState) => {
  vi.resetModules();
  (globalThis as { __app?: unknown }).__app = {
    store: createInMemoryStore(initial),
    limiter: createInMemoryLimiter(),
  };
  const { POST } = await import("@/app/api/bookings/route");
  const { GET } = await import("@/app/api/bookings/summary/route");
  const book = async (body: unknown) =>
    POST(new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }));
  const summary = async () => (await GET()).json();
  return { book, summary };
};

afterEach(() => {
  delete (globalThis as { __app?: unknown }).__app;
});
```

The global is touched in this helper only. Tests call `book` and `summary`.

## Agreement between endpoints

```ts
const before = await summary();
const refused = await book({ customerId: "x", slotId: "full" });
expect(refused.status).toBe(409);
expect(await summary()).toEqual(before);

const accepted = await book({ customerId: "y", slotId: "free" });
expect(await summary()).toEqual((await accepted.json()).summary);
```

The first block proves a refusal changes nothing. The second proves the write and the read agree.

## Fake timers for windows

```ts
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});
afterEach(() => vi.useRealTimers());

it("lets the caller back in when the window passes", async () => {
  for (let i = 0; i < 3; i++) await book(order);
  expect((await book(order)).status).toBe(429);
  vi.advanceTimersByTime(2999);
  expect((await book(order)).status).toBe(429);
  vi.advanceTimersByTime(1);
  expect((await book(order)).status).toBe(200);
});
```

Where the code takes a `now` argument instead of reading the clock, pass numbers and skip the fake timers.

## Concurrency, both kinds

```ts
it("retries once when another write landed first", async () => {
  let failedOnce = false;
  const racing = {
    load: () => inner.load(),
    async save(next, expectedVersion) {
      if (!failedOnce) {
        failedOnce = true;
        await inner.save(await somethingElse(), expectedVersion);
      }
      return inner.save(next, expectedVersion);
    },
  };
  expect((await confirmBooking(order, racing)).ok).toBe(true);
});

it("commits every simultaneous booking exactly once", async () => {
  const results = await Promise.all(
    Array.from({ length: 6 }, () => confirmBooking(order, store)),
  );
  expect(results.every((r) => r.ok)).toBe(true);
  expect((await store.load()).state.confirmed).toBe(6);
});

it("keeps serving after one booking throws", async () => {
  let loads = 0;
  const flaky = {
    load: () => (++loads === 1 ? Promise.reject(new Error("hiccup")) : inner.load()),
    save: (n, v) => inner.save(n, v),
  };
  const [first, second] = await Promise.allSettled([
    confirmBooking(order, flaky),
    confirmBooking(order, flaky),
  ]);
  expect(first.status).toBe("rejected");
  expect(second.status).toBe("fulfilled");
});
```

## Tables for inputs

```ts
it.each([
  ["an object", { toString: null, valueOf: null }],
  ["a negative number", -1],
  ["a fraction", 1.5],
  ["a string", "10"],
])("rejects %s as a quantity", async (_, quantity) => {
  expect((await book({ ...order, quantity })).status).toBe(400);
});
```

One row per class of bad input. The label is the first column so the failure message reads.

## Browser journeys

```ts
test("a customer books a slot and sees the confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tuesday 10:00" }).click();
  await page.getByRole("button", { name: "Book" }).click();
  await expect(page.getByText("Booked for Tuesday 10:00")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Booked for Tuesday 10:00")).toBeVisible();
});
```

Roles and accessible names survive restyling; CSS classes do not. The reload at the end proves the server rendered what the API stored.
