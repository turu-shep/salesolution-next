---
name: push-task
description: Create a new Linear issue from Claude Code
---

Create a new Linear issue: $ARGUMENTS

Process:
1. Parse the task description from the arguments
2. Search the codebase to understand scope and affected areas:
   - Identify affected `/app/` routes, `/components/{feature}/` dirs, `/lib/{domain}/` modules
   - Check if it touches subscription logic, auth flows, or org hierarchy
   - Note related Supabase tables and potential RLS implications
3. Create the issue in Linear with:
   - Title: concise summary
   - Description: detailed description including affected files/areas, role impact (customer/consultant/contractor/shop), and subscription tier relevance
   - Labels: infer from context (bug, feature, improvement, tech-debt)
   - Priority: infer from context or ask me
   - Project: use the active project (ask if unclear)
4. Report back the issue ID and link
5. Add the issue to ROADMAP.md under Up Next

If the arguments describe multiple tasks, create separate issues for each and note dependencies.
