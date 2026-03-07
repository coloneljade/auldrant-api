# Auldrant API

## Mission

Client-side library for making REST API calls simple and correct.

## Quick Reference

**Reviewing code?** → `/code-review [domain]` or `/full-review`
**Need research first?** → `/research [topic]`
**Ready to finalize?** → `/stage`
**One-off commit?** → `/pre-commit` then `/commit`
**Rewriting history?** → `/rewrite`
**Ready to push?** → `/push`
**Creating a PR?** → `/pr`
**Presenting a decision?** → `/decision-brief`
**Updating config?** → `/config-update`

## Key Constraints

- **Bun only** — no npm/yarn/pnpm for package operations
- **Biome only** — no ESLint/Prettier
- **TypeScript only** — no `.js` or `.jsx` files in src
- **ESNext target** — no transpilation for older runtimes
- **Minimal dependencies** — don't add packages until they're needed
- **Client-side only** — no Node.js or server APIs (`http`, `fs`, `Buffer`)
- Never modify `.claude/` files unless user explicitly requests it

## File Conventions

### Source Structure

```
src/
  index.ts              # Library entry point (public API)
  api.ts                # Core API function
  static.ts             # Enums, types, constants
tests/
  *.test.ts             # Tests
```

### Required Files

- `package.json`, `tsconfig.json`, `vite.config.ts`
- `biome.json`, `.editorconfig`, `lefthook.yml`
- `.gitignore`, `LICENSE`

## Search Exclusions

Never read/search: `node_modules/`, `dist/`, `bun.lock`

## Local Rules

| Topic | Rule File |
|-------|-----------|
| TypeScript style, code conventions | `rules/code-quality.md` |
| Web standards and specs | `rules/web-standards.md` |
