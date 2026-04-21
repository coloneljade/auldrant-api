# Code Quality Rules

## Design Principle

**Make it easy to do the right thing and hard or impossible to do the wrong thing.**

- Use TypeScript's type system to enforce constraints at compile time (discriminated unions, required props)
- Prefer standard Web APIs over custom implementations (URL class, Fetch API, CompressionStream)

## Non-Negotiable Settings

### tsconfig.json

These strict flags are enabled and must not be disabled:

| Setting | Purpose |
|---------|---------|
| `strict: true` | All strict type checks |
| `noUnusedLocals: true` | No dead code |
| `noUnusedParameters: true` | No unused params |
| `noFallthroughCasesInSwitch: true` | Explicit switch cases |
| `noUncheckedIndexedAccess: true` | Safe index access |
| `verbatimModuleSyntax: true` | Explicit import/export types |

### biome.json

Biome lint and format rules are the source of truth. Do not:
- Suppress lint rules without strong justification
- Override formatter settings per-file
- Add inline `// biome-ignore` without explanation

## Error Suppression

**Never suppress lint errors, type errors, or warnings without explicit user approval.**

This includes:
- `// biome-ignore` directives
- `// @ts-ignore` or `// @ts-expect-error`
- Adding `any` to bypass type errors

If a lint rule conflicts with project settings, escalate the conflict to the user rather than suppressing either side.

## Minimal Dependencies

Only add a package when:
- The functionality is genuinely needed NOW (not "might need later")
- No reasonable way to implement it in < 50 lines
- The package is well-maintained and actively used

Before `bun add`, ask:
1. Can native APIs handle this?
2. Is there a lighter alternative?
3. Will this add significant bundle size?
4. Is the license approved? (See the global licensing rules — **CRITICAL**)

After `bun add` to `dependencies`, you MUST update the `NOTICES` file with the
package's full license text. No exceptions.

## Code Style

Defined in `biome.json` and `.editorconfig`. Key conventions:
- Tab indentation
- Single quotes
- Trailing commas (ES5)
- Semicolons always
- LF line endings
- 100 char line width

## TypeScript Style

- `T[]` for arrays, never `Array<T>` or `ReadonlyArray<T>`. Use `readonly T[]` when needed.
- `{ [key: string]: V }` for index signatures, never `Record<K, V>`.
- Dot notation for property access, bracket notation only for dynamic keys.
