---
name: fix-issue
description: Fix a bug from a Linear issue or description
---

Analyze and fix: $ARGUMENTS

Process:
1. If a Linear issue ID is provided, fetch full details (description, comments, linked issues)
2. If not, use the description provided in arguments
3. Understand the bug — reproduce it mentally using the codebase
4. Use subagents (the `investigator` agent) to investigate:
   - Search for the relevant files and trace the data flow
   - Check `app/` routes, `app/api/` endpoints, `lib/` logic, `components/` UI, `sanity/` queries
   - Check related tests and recent git changes
   - For content bugs: check draft vs published state first (`perspective: 'raw'`) — "missing content" is often just an unpublished draft
   - Known landmine: cryptic `jsx-runtime "module factory"` dev errors are usually a stale bundle + orphaned service worker, not a code bug — `pkill -f "next dev"; rm -rf .next; pnpm dev`
5. Identify root cause
6. Implement fix following project conventions (CLAUDE.md / AGENTS.md)
   - Validate with Zod at API boundaries
   - Keep gated areas server-gated
7. Write or update tests to cover the fix (`node --test`, co-located with source)
8. Run: `pnpm lint && pnpm test` (and `npx tsc --noEmit`; lead-form baseline excepted)
9. Commit: `git add -A && git commit -m "fix(scope): description [SAL-XXX]"`
10. If Linear issue exists:
    - Add comment with root cause analysis and fix summary
    - Update status to "In Review" or "Done"
    - Update ROADMAP.md (if present)

After fixing, explain:
- Root cause
- What changed
- How to verify the fix
- Whether this could affect other areas (other funnels/surfaces, SEO/JSON-LD, cached/ISR pages)
