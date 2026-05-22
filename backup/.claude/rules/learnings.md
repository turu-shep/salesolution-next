---
globs: **/*
---

# Learnings System

This project uses `.claude/learnings/` to capture hard-won knowledge from failures, bugs, and surprises. Learnings are the *negative* knowledge base — things that went wrong and what to do about them. The *positive* knowledge base lives in `docs/modules/` (see `.claude/rules/module-context.md`).

## When implementing code (`/implement`, `/fix-issue`, `/continue`, `/pair`):

**Before writing code**, check `.claude/learnings/` for files whose `files` frontmatter pattern matches the files you're about to modify. If there are relevant learnings, list them in your plan and factor them into your approach.

## When to create a learning

Create a learning when:
- A test fails for a non-obvious reason and you discover why
- A build/lint/type error reveals a project-specific gotcha (not standard framework behavior)
- A PR review identifies a pattern violation you didn't catch
- A bug fix reveals a subtle interaction between components
- `/pair` reviewer catches the same class of issue twice in the same session
- A library behaves differently than its docs suggest (cite the doc and the actual behavior)

Write the learning as part of the current work and mention it in your next message so the user can edit or reject it.

## Do NOT create learnings for:
- Things already documented in CLAUDE.md, module docs, or existing rules
- Standard language/framework behavior
- One-off typos or simple mistakes
- Environment-specific issues (local setup, .env problems)

## Learning file format

Save to `.claude/learnings/[short-descriptive-name].md`:

```markdown
---
files: ["path/pattern/*", "specific-file.ts"]
type: gotcha | pattern | constraint
added: YYYY-MM-DD
---

## What happened
[1-2 sentences — concrete failure or surprise]

## Why
[1-2 sentences — root cause]

## What to do about it
[1-2 sentences — the rule to apply next time]
```

## Severity

Severity is **not** auto-assigned. If a learning needs a severity marker, a human should add it later, either manually or via `/retro` when the human reviews patterns.

The reason: when Claude auto-assigns severity based on "how bad the failure felt in the moment", severity scores become noise within a week. Without a consistent rubric that the assignor actually follows, "high" and "medium" don't mean anything useful. Better to leave the field blank than to populate it with unreliable data.

If you want to prioritize learnings, let `/retro` surface clusters — a cluster of 3+ learnings in the same area is a stronger signal than any individual severity label would be.

## Pruning

Learnings expire. If a learning's `files` no longer exist, or it's clearly superseded by a later refactor, move it to `.claude/learnings/archive/` rather than deleting — the historical context is still useful for understanding why the code is the way it is.

`/retro` and `/health` both surface learnings referencing missing files as archival candidates.
