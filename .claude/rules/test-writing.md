---
paths:
  - "tests/**"
---

# Test Writing

## Test Runner

This project uses `bun:test`. Import from `bun:test`:

```typescript
import { describe, expect, it } from 'bun:test';
```

## Naming Conventions

Use describe/it with natural language:

```typescript
describe('api.get', () => {
  describe('when response is JSON', () => {
    it('returns parsed data with status', () => {
      // ...
    });
  });
});
```

## AAA Comments (Required)

Every test body MUST have `// Arrange`, `// Act`, and `// Assert` section comments.

When phases merge, use combined labels:
- `// Act & Assert` — when a single call both performs the action and verifies the result
- `// Arrange & Act` — when setup and action are inseparable

When Arrange uses only parent-scope constants (defined in the enclosing `describe`),
omit it and start with `// Act`.

```typescript
it('returns null when request fails', () => {
  // Arrange
  globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 404 })));

  // Act
  const result = await api.get('/users/999');

  // Assert
  expect(result.ok).toBe(false);
  expect(result.status).toBe(404);
});
```

## Test Guidelines

| Do | Don't |
|----|-------|
| One assertion focus per test | Multiple unrelated assertions |
| Test behavior, not implementation | Test private methods directly |
| Use descriptive names | Use test1, test2 naming |
| Keep tests fast and isolated | Depend on external services |
| Make tests deterministic | Use random values without seeds |

## Public Contract Only

**Tests MUST verify public behavioral contracts, not implementation details.**

### What to Test

- Public API methods produce expected responses
- Headers are set correctly
- Error handling returns correct status codes
- Compression works correctly
- AbortController cancellation works

### What NOT to Test

- Internal helper functions
- Exact fetch call arguments (test the outcome instead)
- Implementation-specific ordering of operations

## Fetch Mocking Patterns

Mock `globalThis.fetch` for all tests:

```typescript
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('api', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends GET request', async () => {
    // Arrange
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    );

    // Act
    const result = await api.get('/users/1');

    // Assert
    expect(result.ok).toBe(true);
  });
});
```

## Trusted Sources

| Resource | When to Use |
|----------|-------------|
| [Bun Test Runner](https://bun.sh/docs/cli/test) | Test API, matchers, lifecycle hooks |
