---
name: fix-issue
description: Fix a bug from a Linear issue or description
---

Analyze and fix: $ARGUMENTS

Process:
1. If a Linear issue ID is provided, fetch full details (description, comments, linked issues)
2. If not, use the description provided in arguments
3. Understand the bug — reproduce it mentally using the codebase
4. Use subagents to investigate:
   - Search for the relevant files and trace the data flow
   - Check `/app/api/` routes, `/lib/{domain}/` logic, and `/components/{feature}/` UI
   - Check related tests and recent git changes
   - Verify Supabase client usage (server vs client vs admin)
5. Identify root cause
6. Implement fix following project conventions (CLAUDE.md + docs/conventions/CONVENTIONS.md)
   - Verify auth patterns in API routes
   - Check subscription gating if feature-related
   - Validate with Zod at API boundaries
7. Write or update tests to cover the fix (Jest unit tests co-located with source)
8. Run: `npm run lint && npm run test`
9. Commit: `git add -A && git commit -m "fix(scope): description [LINEAR-ID]"`
10. If Linear issue exists:
    - Add comment with root cause analysis and fix summary
    - Update status to "In Review" or "Done"
    - Update ROADMAP.md

After fixing, explain:
- Root cause
- What changed
- How to verify the fix
- Whether this could affect other areas (related roles, subscription tiers, org hierarchy)
