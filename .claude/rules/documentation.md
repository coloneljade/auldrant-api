---
paths:
  - "src/**/*.ts"
---

# Documentation Standards

## Non-Negotiable

**All public APIs MUST be documented.**

| Language | Format | Example |
|----------|--------|---------|
| TypeScript/JS | JSDoc | `/** @param {string} name */` |

## What to Document

### Always Document (Public API)

- Exported functions and constants
- Exported types and interfaces
- Module entry points

### Document When Non-Obvious (Internal)

- Complex algorithms (explain approach)
- Non-intuitive business logic
- Workarounds with external dependencies
- Performance-critical code paths

## Inline Comments

### Good Inline Comments

```typescript
// Per RFC 9110 §9.3.1, GET requests MUST NOT have a body
const hasBody = method !== HttpMethod.GET && method !== HttpMethod.HEAD;

// Workaround: CompressionStream API requires ReadableStream input
const stream = new Blob([JSON.stringify(content)]).stream();

// Why: sorted for binary search in hot path
const sortedIds = ids.toSorted((a, b) => a - b);
```

### Bad Inline Comments

```typescript
// Increment counter
counter++;

// Check if user is null
if (user == null)

// Loop through items
for (const item of items)
```

## Refactoring Signal

If you need extensive comments to explain a code block:
- Extract to a well-named function
- The function name becomes the documentation

## TypeScript Example

```typescript
/**
 * Authenticates a user and returns a JWT token.
 * @param credentials - User login credentials
 * @returns JWT token if successful, null if authentication fails
 * @throws {ArgumentError} When credentials is null
 */
export function authenticate(credentials: LoginCredentials): string | null
```

## Trusted Sources

| Resource | When to Use |
|----------|-------------|
| [MDN Web Docs](https://developer.mozilla.org/) | Web APIs, Fetch, URL, CompressionStream |
| [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) | Type system, generics, utility types |
| [Bun docs](https://bun.sh/docs) | Runtime, bundler, test runner |
| [Biome docs](https://biomejs.dev/) | Linter rules, formatter config |
| [WHATWG Fetch spec](https://fetch.spec.whatwg.org/) | Fetch API behavior |
| [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) | HTTP semantics |
