---
globs: **/*
---

# Git Workflow Rules

## Branch Naming
For Linear-tracked work, include the issue ID:
```
[issue-id-lowercase]-[short-kebab-description]
```
Examples:
- `sal-123-glossary-hovercards`
- `sal-456-fix-lead-form-validation`
- `sal-789-revenue-engine-dental-page`

For untracked work, plain descriptive kebab-case branches are fine (e.g. `fix/security-2026-07-24` style already in the history).

## Commit Messages
Format: `type(scope): description` — append ` [SAL-123]` when the work is Linear-tracked.
- Types: feat, fix, docs, style, refactor, perf, test, chore, content
- Scope: the domain area (site, services, revenue-engine, glossary, career-paths, sanity, lead-form, probe, sales, strategy, emails, seo, infra)

Examples:
- `feat(glossary): add alias redirects for 12 terms [SAL-123]`
- `fix(lead-form): handle Turnstile timeout fallback [SAL-456]`
- `content(revenue-engine): dental proof section copy [SAL-789]`

## PR Target Branch
PRs target `main` — the repo's default and production branch. Merge to `main` deploys to production via Vercel.

## PR Description
Must include `Closes SAL-XXX` in the body for auto-close on merge (when Linear-tracked).
Template is handled by the `/ship` command.

## Push Frequency
Push after each meaningful commit. This triggers Vercel preview deploys
so you can verify changes live before merging.

## Never
- Force-push shared branches
- Auto-merge PRs
- Commit `.env.local`, `ss local env`, or anything matching the no-hardcoded-secrets policy
