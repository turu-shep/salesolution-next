---
name: sync
description: Sync Linear project state — show current status and update local state
---

Synchronize with Linear:

## Process

1. Fetch all issues from Linear assigned to me (or the current project)
2. Group by status: Backlog, Todo, In Progress, In Review, Done (last 7 days)
3. Display a dashboard:

```
📋 Linear Status
━━━━━━━━━━━━━━━

🔴 In Progress (2)
  PROJ-142  Add timezone support          [step 4/7]
  PROJ-155  Fix calendar overlap          [step 1/3]

🟡 In Review (1)
  PROJ-138  Refactor auth middleware      [PR #42]

⚪ Up Next (3)
  PROJ-160  Add email notifications       [P1]
  PROJ-162  Dashboard analytics widget    [P2]
  PROJ-165  Update onboarding flow        [P3]

✅ Done (last 7 days): 4 issues
```

4. If `.claude/state.json` exists, verify it matches Linear:
   - Is the "current issue" still In Progress on Linear?
   - Has someone else moved it or commented?
   - Flag any discrepancies

5. Update `.claude/state.json` with fresh data from Linear

6. If there's no current task in progress, suggest the highest priority "Todo" issue and offer to `/pull-task` it.
