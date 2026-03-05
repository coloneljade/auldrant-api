---
description: Rewrite branch history before pushing. Absorbs fixups, reorders commits, and cleans messages. Use when history has noise from iterative development.
model: opus
---

# Rewrite Workflow

## Core Principle

**Clean history tells a story. Rewrite before pushing to collapse noise into logical commits.**

## Prerequisites

Refuse to proceed if any of these are not met:

- [ ] On a feature branch (not `main`, not detached HEAD)
- [ ] Working tree is clean (`git status` shows no uncommitted changes)
- [ ] No merge commits in branch history since `merge-base`
- [ ] If branch has been pushed: warn that `/push` will use `--force-with-lease` afterwards

## Step 1 -- Analyze

List all commits since the branch diverged from `main`:

```bash
MERGE_BASE=$(git merge-base HEAD main)
git log --oneline --reverse $MERGE_BASE..HEAD
```

For each commit, examine the diff and file list. Identify:

- **Explicit fixups**: `fixup!` commits created by `/commit` fixup detection -- these have named targets
- **Implicit fixups**: Same scope/files as an earlier commit, message suggests a fix
- **WIP commits**: Incomplete work that should be folded into a complete unit
- **Wrong ordering**: Setup/scaffolding after features, tests before the code they test
- **Redundant splits**: Multiple commits that are really one logical change

## Step 2 -- Propose

Design an ideal commit sequence following project conventions:

- `fixup!` commits absorbed into their named targets automatically
- Implicit fixups absorbed into their inferred parent commits
- Scaffolding/setup first, then features, tests, config, docs last
- WIPs combined into complete logical units
- Messages cleaned to follow `type(scope): subject` format
- All commits retain `--signoff` (`-s`)

## Step 3 -- Present Before/After

Always show the user what will change and wait for approval:

```
### Before (6 commits)
1. abc1234 feat(api): add web server
2. def5678 fix: build error
3. 1a2b3c4 feat(api): add frontend
4. 5e6f7a8 fix: forgot package.json
5. 9b0c1d2 test(api): add tests
6. 3e4f5a6 fix: test import

### After (3 commits)
1. feat(api): add web server -- [files from #1 + #2]
2. feat(api): add frontend -- [files from #3 + #4]
3. test(api): add integration tests -- [files from #5 + #6]

Approve this rewrite?
```

**Never execute without explicit user approval.**

## Step 4 -- Execute

Only after user approval.

### 4a. Record Original Hashes

```bash
MERGE_BASE=$(git merge-base HEAD main)
git log --format="%H" --reverse $MERGE_BASE..HEAD
```

### 4b. Create Safety Backup

```bash
git tag _rewrite-backup HEAD
```

### 4c. Reset to Branch Point

```bash
git reset --soft $MERGE_BASE
git reset HEAD  # unstage all (mixed reset, keeps working tree)
```

### 4d. Recommit Using Original Hashes

For each new commit group:

1. Identify which original commits are being combined
2. For each file, `git checkout <latest-original-hash-touching-file> -- <file>`
3. `git add <files> && git commit -s -m "..."`

### 4e. Verify

```bash
git diff _rewrite-backup --stat
```

Must be empty (same final tree). If not empty, rollback immediately.

### 4f. Clean Up

```bash
git tag -d _rewrite-backup
```

## Rollback

If verification fails:

```bash
git reset --hard _rewrite-backup
```

Report failure and confirm rollback succeeded.
