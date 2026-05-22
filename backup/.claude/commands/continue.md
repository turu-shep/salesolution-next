---
name: continue
description: Resume work on the current task, checking Linear for updates
---

Resume development work:

1. Read ROADMAP.md to find the current In Progress task
2. If there's a Linear issue ID, check Linear for:
   - Any new comments or updates since last session
   - Current status
   - Any linked/blocking issues
3. Read the associated plan in docs/plans/ (if one exists)
4. Check git log for recent commits to understand where we left off
5. Find the next uncompleted step (marked with unchecked box)
6. Implement it following the same process as /implement (including Linear updates):
   - Reuse existing patterns from `/components/{feature}/` and `/lib/{domain}/`
   - Follow conventions in CLAUDE.md and docs/conventions/
   - Lint after changes, write tests for business logic/API routes
   - Mark step done in plan, commit with conventional format including [LINEAR-ID]
   - Post progress comment to Linear issue
7. Update ROADMAP.md progress after completing each step

If no task is in progress:
- Check Linear for issues assigned to me with status "Todo"
- Show the top 3 and ask which to start
