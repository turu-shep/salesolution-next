---
name: pull-task
description: Pull the next prioritized task from Linear and set up for implementation
---

Pull and prepare the next task from Linear: $ARGUMENTS

## Process

### 1. Find the issue
- If a specific issue ID is given, fetch it directly from Linear
- Otherwise, search Linear for issues assigned to me with status "Todo" or "Backlog", sorted by priority
- Show the top 3 issues with: title, priority, labels, description preview
- Wait for me to pick one

### 2. Assess complexity
Read the full issue (description, comments, linked issues, labels). Then decide:

**If the issue is large (epic-level, touches 3+ domains, or description implies multiple distinct changes):**
- Propose a decomposition into 3-6 sub-issues
- Each sub-issue should be independently reviewable and shippable
- Show the proposed breakdown with:
  - Title for each sub-issue
  - Which files/areas it touches
  - Dependencies between sub-issues (which must come first)
- Ask me to confirm, adjust, or skip decomposition
- If confirmed: create child issues in Linear linked to the parent, then proceed with the first sub-issue

**If the issue is normal size:** proceed directly.

### 3. Search the codebase
Find related files based on the issue description:
- Search for keywords, related function names, similar patterns
- Note existing patterns and components that can be reused
- Check `.claude/learnings/` for relevant gotchas matching affected files

### 4. Create the plan
Save to `docs/plans/[issue-id].md`:
```markdown
# [ISSUE-ID] Issue Title

**Linear**: [issue link]
**Branch**: `[issue-id-lowercase]-[short-description]`
**Dependencies**: [list any blocking issues]

## Learnings to watch for
[Any relevant entries from .claude/learnings/ — or "None"]

## Steps

⬜ **Step 1**: [description]
   - Files: [list]
   - Tests: [what to test]

⬜ **Step 2**: [description]
   - Files: [list]
   - Depends on: Step 1
   - Tests: [what to test]

[...]
```

### 5. Set up the branch
```bash
git checkout -b [issue-id-lowercase]-[short-description]
git commit --allow-empty -m "chore: start work on [ISSUE-ID] [description]"
git push -u origin [branch-name]
```

### 6. Update state
- Update Linear issue status to "In Progress"
- Add a comment: "Starting implementation — [N] steps planned"
- Write `.claude/state.json`:
```json
{
  "currentIssue": { "id": "PROJ-123", "title": "...", "url": "..." },
  "currentBranch": "proj-123-short-description",
  "planFile": "docs/plans/proj-123.md",
  "currentStep": 1,
  "totalSteps": N,
  "lastActivityTimestamp": "ISO-8601"
}
```

DO NOT write any implementation code. Only produce the plan.
