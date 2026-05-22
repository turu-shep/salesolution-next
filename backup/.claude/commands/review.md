---
name: review
description: Review recent changes and post results to Linear
---

Review the recent changes: $ARGUMENTS

Use subagents to investigate the changes, then check:

1. **Convention compliance** — read docs/conventions/CONVENTIONS.md and verify:
   - Naming conventions (PascalCase components, camelCase utils, kebab-case folders, snake_case DB)
   - Import ordering (React/Next → third-party → @/lib → @/types → @/components → relative)
   - Server vs Client component boundaries (`'use client'` only when interactivity required)
   - Error handling patterns
   - API response format: `{ success, data, error }`

2. **Architecture compliance** — read docs/conventions/ARCHITECTURE.md:
   - Data flow: Server Component → Supabase → Render (reads), Client → API → Supabase (writes)
   - Auth checked in all API routes via `supabase.auth.getUser()`
   - Subscription/feature access gated with `useFeatureAccess()` where needed
   - No direct DB mutations from client components
   - Supabase clients used correctly (server vs client vs admin)

3. **Type safety** — run `npx tsc --noEmit` and report issues

4. **Redux correctness** — if state changes involved:
   - Proper use of `useAppDispatch` / `useAppSelector` (from `/lib/store/hooks.ts`)
   - No direct store imports in components

5. **Test coverage** — are there tests for new business logic?
   - Jest unit tests co-located with source
   - Playwright E2E for user-facing flows

6. **Security** — no exposed secrets, proper RLS considerations, input validation with Zod

7. **Linear sync** — are all changes reflected in Linear issue comments?

Report findings as: PASS / WARN / FAIL for each category with specific file:line references.

If a Linear issue ID is associated:
- Add a review comment on the Linear issue with the full report
- If all PASS: update status to "Done"
- If any FAIL: keep status as "In Progress" and list required fixes
