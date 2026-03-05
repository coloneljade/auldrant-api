# Auldrant API

## Mission

Client-side library for making REST API calls simple and correct.

## Philosophy

### Be Curious, Not Assumptive

- When requirements are unclear, ASK
- Understand goals before implementation
- Check in on approach, not just when stuck

### Code Quality

- Clean, direct, modern code
- Follow established patterns in the codebase
- If a pattern seems wrong, ask before "fixing"

### Research First

- Research best practices before implementing
- Check existing patterns in the codebase
- Look for improvement opportunities in touched files

### Troubleshooting

- Look at actual errors, not just symptoms
- Check for known issues upstream before debugging locally
- Break problems down systematically

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

## Available Agents

**Reviewers:** security, architecture, performance
**Experts:** web-api, troubleshooter, security, architecture, performance
**Design:** design-advisor (Double Diamond facilitation)

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

## Rules Reference

| Topic | Rule File |
|-------|-----------|
| TypeScript style, code conventions | `rules/code-quality.md` |
| Quality gates, mandatory skills, escalation | `rules/required-processes.md` |
| Implementation workflow, branching, staging | `rules/implementation-workflow.md` |
| Test writing, assertion patterns, public contracts | `rules/test-writing.md` |
| Test evaluation philosophy and coverage | `rules/test-evaluation.md` |
| Tool selection, skills vs MCP hierarchy | `rules/tool-preferences.md` |
| Binary tools principle (CLI over raw edits) | `rules/binary-tools.md` |
| Research source tiers | `rules/research-sources.md` |
| Versioning and changelog ownership | `rules/versioning.md` |
| Problem solving and architectural fixes | `rules/problem-solving.md` |
| Agent output format (BLUF, severity) | `rules/agent-output.md` |
| Web standards and specs | `rules/web-standards.md` |
| **Third-party license attribution (CRITICAL)** | `rules/third-party-licenses.md` |
