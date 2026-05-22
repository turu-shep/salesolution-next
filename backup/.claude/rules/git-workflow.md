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
- `fa-123-add-timezone-support`
- `fa-456-fix-booking-calendar-overlap`
- `fa-789-refactor-subscription-hooks`

## Commit Messages
Format: `type(scope): description [FA-123]`
- Include Linear issue ID in brackets at the end
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Scope: the domain area (booking, auth, subscription, video, org, profile, etc.)

Examples:
- `feat(booking): add timezone selection to calendar [FA-123]`
- `fix(subscription): handle expired trial edge case [FA-456]`
- `test(booking): add tests for timezone conversion [FA-123]`

## PR Target Branch
All PRs must target `staging`, not `main`. Use `--base staging` when creating PRs.
`main` is the production branch — changes reach it via staging merges only.

## PR Description
Must include `Closes FA-XXX` in the body for auto-close on merge.
Template is handled by the `/ship` command.

## Push Frequency
Push after each meaningful commit. This triggers Vercel preview deploys
so you can verify changes live.
