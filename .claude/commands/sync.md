---
name: sync
description: Sync Linear project state with local ROADMAP.md
---

Synchronize Linear with ROADMAP.md:

Linear context: team **SAL**, project **"SS SEO"**.

1. Fetch all issues from Linear assigned to me (or the current project)
2. Group by status: Backlog, Todo, In Progress, In Review, Done
3. Compare with current ROADMAP.md (repo root). If ROADMAP.md doesn't exist, create it — it's the local mirror of Linear state, nothing more (strategy lives in `docs/strategy/`, not here)
4. Update ROADMAP.md to reflect Linear's state:
   - Completed = Linear "Done" issues (with completion date)
   - In Progress = Linear "In Progress" issues
   - Up Next = Linear "Todo" issues (ordered by priority)
   - Ideas = Linear "Backlog" issues
5. Flag any discrepancies:
   - Issues in ROADMAP.md but not in Linear — offer to create them
   - Issues in Linear but not in ROADMAP.md — add them
6. Show a summary of changes made

This is safe to run anytime — it only updates ROADMAP.md, never deletes Linear issues.
