---
description: Create clean commits from uncommitted changes after implementation. Use when finished implementing to batch-finalize all work into logical commits.
model: opus
---

# Stage Workflow

## Core Principle

**Implement freely, then create clean commits retroactively.** This is the default
finalization path after completing an implementation. All uncommitted changes are
analyzed, grouped into logical commits, and committed in one pass.

## When to Use

- Just finished implementing a plan -- all changes are uncommitted (or have WIP checkpoints)
- Want to create multiple clean commits from a batch of changes
- Default finalization step before `/push`

## When NOT to Use

- **One-off atomic commit** outside a full implementation -> use `/pre-commit` + `/commit`
- **Cleaning up already-committed history** -> use `/rewrite`
- **Nothing to stage** -> report "nothing to stage" and exit

## Prerequisites

- [ ] On a feature branch (not `main`, not detached HEAD)
- [ ] Changes exist (uncommitted changes or WIP checkpoint commits since merge-base)
- [ ] Implementation is complete and verified (builds, tests pass)

## Step 1 -- Snapshot

Capture the complete final state for verification.

```bash
MERGE_BASE=$(git merge-base HEAD main)
git add -A && git commit -s -m "_stage-snapshot"
SNAPSHOT=$(git rev-parse HEAD)
git reset --soft $MERGE_BASE && git reset HEAD
```

## Step 2 -- Analyze

Diff all changes from merge-base to understand the full scope.

```bash
git diff --stat
git diff --name-only
```

Identify logical groupings with this ordering:

1. **Scaffolding/setup** -- new project structure, build config, dependencies
2. **Core features** -- primary implementation work
3. **Tests** -- test additions or updates
4. **Config/CI** -- CI/CD, devcontainer, tooling config
5. **Documentation** -- CHANGELOG, README, docs

## Step 3 -- Propose

Present the staging plan and proceed to execution.

```
## Staging Plan

### Commit 1: type(scope): subject
Files: file1, file2, file3

### Commit 2: type(scope): subject
Files: file4, file5

[N commits total]
```

## Step 4 -- Execute

For each commit group, in order:

### Exclusive Files

```bash
git add <file1> <file2>
```

### Shared Files (Intermediate States)

Files appearing in multiple commits need intermediate state written before staging.

### Commit

```bash
git commit -s -m "type(scope): subject"
```

## Step 5 -- Verify

```bash
git diff $SNAPSHOT --stat
```

### Pass (empty diff)

Final tree matches snapshot exactly. Stage is complete.

### Fail (non-empty diff)

Rollback immediately:

```bash
git reset --hard $SNAPSHOT
```

## Output

```
## Stage Complete

### Commits Created
1. abc1234 type(scope): subject (N files)
2. def5678 type(scope): subject (N files)
...

### Verification
Final tree matches snapshot: PASS

### Next
Run `/push` when ready.
```
