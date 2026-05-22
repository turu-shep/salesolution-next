---
globs: **/*
---

# Git Workflow Rules

## Branch Naming
Always include the Linear issue ID:
```
[issue-id-lowercase]-[short-kebab-description]
```
Examples:
- `proj-123-add-timezone-support`
- `proj-456-fix-calendar-overlap`

## Commit Messages
Format: `type(scope): description [PROJ-123]`
- Include Linear issue ID in brackets at the end
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Scope: the domain area

Examples:
- `feat(booking): add timezone selection [PROJ-123]`
- `fix(auth): handle expired session edge case [PROJ-456]`

## PR Description
Must include `Closes PROJ-XXX` in the body for auto-close on merge.
Template is handled by the `/ship` command.

## Push Frequency
Push after each meaningful commit. This triggers preview deploys
so you can verify changes live.
