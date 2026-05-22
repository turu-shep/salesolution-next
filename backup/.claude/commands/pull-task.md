---
name: pull-task
description: Pull the next prioritized task from Linear and set up for implementation
---

Pull and prepare the next task from Linear: $ARGUMENTS

Process:
1. If no specific issue ID given, search Linear for issues assigned to me with status "Todo" or "Backlog", sorted by priority
2. Show the top 3 issues with: title, priority, labels, description preview
3. After I pick one (or if a specific issue ID was given):
   a. Read the full issue details from Linear (description, comments, linked issues, labels)
   b. Update the issue status in Linear to "In Progress"
   c. Add a comment on the issue: "Starting implementation in Claude Code"
   d. Update ROADMAP.md — move this task to In Progress with the Linear issue ID
   e. Search the codebase for related files based on the issue description:
      - Check `/app/api/` for related API routes
      - Check `/components/{feature}/` for related UI
      - Check `/lib/{domain}/` for related business logic
      - Check `/lib/hooks/` and `/hooks/` for related hooks
      - Check `/types/` for related type definitions
   f. Create an implementation plan in docs/plans/[issue-id].md

The plan file must include:
- Linear issue ID and link at the top
- Which existing patterns/components to reuse (check `/components/{feature}/` and `/lib/{domain}/`)
- Files to create or modify
- Database changes needed (new migrations only — current highest is 047)
- Supabase RLS policy considerations (flag for security review if needed)
- Redux state changes (if modifying auth/user/subscription/navigation slices)
- Subscription/feature gating requirements (`useFeatureAccess()`)
- Step-by-step implementation order with dependencies
- Test strategy (Jest unit + Playwright E2E where applicable)

DO NOT write any code yet. Only produce the plan.

After creating the plan:
1. Create a feature branch using the Linear issue ID:
   `git checkout -b [issue-id-lowercase]-[short-description]`
   Example: `git checkout -b fa-123-timezone-support`
   This auto-links the branch to the Linear issue and triggers "In Progress" status.
2. Make an initial empty commit to establish the branch:
   `git commit --allow-empty -m "chore: start work on [FA-123] [description]"`
3. Push the branch: `git push -u origin [branch-name]`
