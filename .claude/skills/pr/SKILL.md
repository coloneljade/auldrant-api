---
description: Create or update a pull request with issue links. Use when ready to submit work for review. Optionally merges, waits, and cleans up when user says "and merge", "ship it", or "land it".
---

# Pull Request Workflow

## Merge Mode Detection

Merge mode activates when the user's message includes any of:

- **"and merge"** / **"then merge"**
- **"ship it"** / **"land it"**
- **"merge it"** / **"merge this"**

When merge mode is detected, run Steps 0-5 as normal, then continue to Steps 6-10.
When merge mode is NOT detected, stop after Step 5 (default behavior).

### Merge Flags

Merge flags (`--minor`, `--patch`, `--no-bump`) can appear anywhere in the user's
message. Extract them and pass through to the `/merge` comment in Step 7.

## Step 0 -- GitHub CLI Prerequisite

Before anything else, verify `gh` is available and authenticated:

```bash
command -v gh
gh auth status
```

- **Not installed**: stop immediately.
- **Not authenticated**: stop immediately.

## Step 1 -- Pre-PR Checks

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git status
```

- [ ] Branch is pushed to remote (has upstream tracking)
- [ ] Working tree is clean

If either fails, tell the user to run `/push` first.

## Step 2 -- Check for Existing PR

```bash
gh pr list --head <branch> --json number,url
```

- If a PR exists -> note the number for `gh pr edit` later
- If no PR exists -> will use `gh pr create`

## Step 3 -- Check for Related Issues

```bash
gh issue list --state open --json number,title,labels
```

- If open issues exist, present them to the user and ask which (if any) this PR fixes
- If no open issues, skip this step

## Step 4 -- Build PR

### PR Title

Derive the title from the branch name. The branch was already named deliberately
during `/push` as `type/description` -- convert it to `type: description` (or
`type(scope): description` if scope is clear from context). Under 70 characters.

### PR Body

Build the body from commit history and issue links:

```bash
git log --format="- %s" main..HEAD
```

Structure:

```markdown
## Summary
[commit log summary as bullet points]

## Fixes
Fixes #N
Fixes #M

## Test Plan
- [ ] Verified item
```

### Create or Update

**New PR:**
```bash
gh pr create --base main --title "<title>" --body "..."
```

**Existing PR:**
```bash
gh pr edit <number> --title "<title>" --body "..."
```

## Step 5 -- Output

```
## PR Complete

### Pull Request
[PR URL] -- [created | updated]

### Issues
[N issues linked | No issues linked]
```

## CHANGELOG Note

CHANGELOG entries are handled automatically by the merge bot when `/merge` is
invoked on the PR. Do not manually create or modify CHANGELOG entries.

---

## Step 6 -- Wait for CI (Merge Mode Only)

Wait for CI checks to complete before posting the merge comment:

```bash
gh pr checks <number> --watch --fail-fast
```

## Step 7 -- Post Merge Comment (Merge Mode Only)

```bash
gh pr comment <number> --body "/merge [flags]"
```

## Step 8 -- Wait for Merge (Merge Mode Only)

Poll the PR state until it merges or fails:

```bash
gh pr view <number> --json state,mergedAt
```

## Step 9 -- Local Cleanup (Merge Mode Only)

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git checkout main
git pull --ff-only origin main
git branch -d "$BRANCH"
```

## Step 10 -- Merge Mode Output

```
## PR Merged

### Pull Request
[PR URL] -- merged

### Issues
[N issues linked and closed | No issues linked]

### Local
Branch `<type>/<description>` deleted
Now on `main` at [short SHA]
```
