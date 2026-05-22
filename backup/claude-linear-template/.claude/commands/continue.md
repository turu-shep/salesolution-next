---
name: continue
description: Resume work on the current task, checking Linear for updates
---

Resume development work. The auto-context rule should have already shown you the current state — this command is for when you want to explicitly re-sync and start working.

## Process

1. Read `.claude/state.json` to find the current in-progress task
2. If there's a Linear issue ID, check Linear for:
   - Any new comments or updates since `lastActivityTimestamp`
   - Current status
   - Any linked/blocking issues that changed
3. Read the associated plan file
4. Check git log for recent commits on this branch
5. Check `.claude/learnings/` for anything relevant to the next step's files
6. Show a brief status, then immediately start implementing the next uncompleted step
   (same process as `/implement`)
7. After completing the step, update `.claude/state.json`

If no task is in progress (state.json is empty or missing):
- Check Linear for issues assigned to me with status "Todo"
- Show the top 3 and ask which to start
- Suggest `/pull-task` to properly set one up
