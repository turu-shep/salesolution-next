---
globs: **/*
---

# Module Knowledge Base

This project uses `docs/modules/` to document feature areas — the positive knowledge base (how things work, invariants, data flows, business rules). This complements `.claude/learnings/` which captures negative knowledge (gotchas from failures).

## How it's wired

Each module doc in `docs/modules/<module-name>.md` describes one feature area. A matching `.claude/rules/ctx-<module-name>.md` file uses a `globs:` frontmatter pattern to auto-load the doc when Claude edits files in that area.

Example — `.claude/rules/ctx-auth.md`:
```markdown
---
globs: ["app/auth/**", "lib/auth/**", "middleware.ts"]
---

Before modifying auth code, read `docs/modules/auth.md` for context on the session model, token flow, and known gotchas.

After significant changes, update that module doc to reflect the new state.
```

## When to create a module doc

Create a module doc for a feature area when:
- It spans 3+ files across different layers (UI / API / DB)
- It has non-obvious invariants or business rules
- Multiple developers touch it and keep asking the same questions
- It integrates with an external service (payment, email, video, etc.)

Do NOT create module docs for:
- Things that are self-evident from reading the code
- Transient work-in-progress areas
- Anything already covered in CLAUDE.md

## Module doc format

```markdown
# <Module Name>

## Purpose
One paragraph: what this module does and why it exists.

## Key files
- `path/to/file.ts` — [role in the module]
- `path/to/dir/` — [role]

## Data model
- Tables / types / entities involved
- Relationships and foreign keys
- RLS / access control rules

## Core flows
### Flow 1: [name]
Step-by-step walkthrough of the happy path.

### Flow 2: [name]
...

## Invariants
- [Things that must always be true]

## Known gotchas
- [Subtle issues that bit us before — link to learnings if applicable]

## Integration points
- External services, other modules, cron jobs, webhooks

## Last updated
YYYY-MM-DD — [what changed]
```

## Bootstrapping module docs

Run `/scan-modules` to have Claude analyze the codebase and propose an initial set of module docs. Review and refine the output — this is a starting point, not a finished artifact.

## Keeping docs fresh

After a significant change to a module area, update the corresponding module doc. Stale module docs are worse than no docs — they mislead. The `/retro` command surfaces module docs that haven't been updated in a while.
