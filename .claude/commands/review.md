---
name: review
description: Review recent changes and post results to Linear
---

Review the recent changes: $ARGUMENTS

Use subagents (the `reviewer` / `investigator` agents) to investigate the changes, then check:

1. **Convention compliance** — read AGENTS.md and verify:
   - Naming conventions (PascalCase components, camelCase utils, kebab-case route folders)
   - Server vs Client component boundaries (`'use client'` only when interactivity required)
   - Error handling patterns
   - SSOT respected: identity from `lib/business.ts`, nav from `lib/navigation.ts`, JSON-LD from `lib/schema.ts`

2. **Sanity correctness** — per `prompts/_CONTEXT.md`:
   - `createClient` from `next-sanity` (never `@sanity/client`)
   - Draft-aware queries use `perspective: 'raw'`; interlinked drafts use weak refs
   - New doc types registered in `sanity/schemas/index.ts` AND `sanity/structure.ts`
   - Content seeded as drafts; nothing auto-published

3. **Type safety** — run `npx tsc --noEmit` and report issues (pre-existing `lib/lead-form/*` Zod errors are the known baseline)

4. **Copy & voice** — if customer-facing copy changed:
   - Operator register, kill-list, no cold jargon on ICP pages (`.agents/product-marketing-context.md`)
   - Humanizer pass done
   - New domain terms queued via `scripts/glossary-queue.mjs`

5. **Test coverage** — are there tests for new business logic?
   - `node --test` tests co-located with source in `lib/`

6. **Security** — no exposed secrets, Zod validation at API boundaries, gated areas (`/sales`, `/strategy`) stay server-gated, no server-only env vars in client code

7. **Linear sync** — are all changes reflected in Linear issue comments?

Report findings as: PASS / WARN / FAIL for each category with specific file:line references.

If a Linear issue ID is associated:
- Add a review comment on the Linear issue with the full report
- If all PASS: update status to "Done"
- If any FAIL: keep status as "In Progress" and list required fixes
