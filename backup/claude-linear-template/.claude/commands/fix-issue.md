---
name: fix-issue
description: Fix a bug from a Linear issue or description
---

Analyze and fix: $ARGUMENTS

## Process

### 1. Understand the bug
- If a Linear issue ID is provided, fetch full details (description, comments, linked issues)
- If not, use the description provided in arguments
- Check `.claude/learnings/` for related past issues

### 2. Investigate
Use subagents to:
- Search for the relevant files and trace the data flow
- Check related tests and recent git changes (`git log --oneline -10 -- [affected files]`)
- Identify root cause

### 3. Fix
- Implement fix following project conventions (CLAUDE.md)
- Write or update tests to cover the fix
- Run linting and tests

### 4. Capture knowledge
If the root cause was non-obvious (not a simple typo, but a subtle interaction, missing edge case, or architectural gotcha):
- Create a learning in `.claude/learnings/[short-name].md`

### 5. Commit and sync
```bash
git commit -m "fix(scope): description [ISSUE-ID]"
git push
```

If a Linear issue exists:
- Add comment with root cause analysis and fix summary
- Update status to "In Review" or "Done"
- Update `.claude/state.json`

## After fixing, explain:
- Root cause
- What changed
- How to verify the fix
- Whether this could affect other areas
- Any learning created
