# Analysis Session — 2026-03-26 (Second Run)

## What was analyzed
Full codebase — all 14 modules. Recursive descent from Level 0 through Level 3 on critical paths (Booking, Subscription, Auth). Level 1 re-scoring on all remaining modules. Delta comparison against first run from earlier today.

## App Health: 4.7/10 (previous: 4.6/10, delta: +0.1)

## Milestone Readiness
- M1 (Demo): 65% (previous: 55%, +10%)
- M2 (Payment): 30% (previous: 25%, +5%)
- M3 (Beta): 25% (previous: 20%, +5%)

## Key findings (top 5)
1. **CRITICAL: Unauthenticated debug endpoints expose all user/org data** — `/api/subscription/debug-org` and `/api/test-user-profile` have zero auth and use adminClient to query any record. Must be deleted immediately.
2. **CRITICAL: Server-side feature enforcement fails open on error** — check-access API returns `hasAccess: true` on 500 errors. Network failures grant paid features to free users. (FIXED in this session — 3 locations changed to fail-closed.)
3. **CRITICAL: No server-side price validation in booking** — Client supplies `totalAmount` which is trusted without verification against service_offerings table. A malicious user could book for $0.
4. **CRITICAL: Upgrade/downgrade routes bypass Stripe entirely** — DB-only plan changes create permanent desync between Stripe billing state and app state. Stripe Checkout exists but upgrade/downgrade don't use it.
5. **HIGH: useBilling hook references 6+ nonexistent API routes** — Entire billing page is non-functional. All payment method and invoice operations silently fail.

## What improved since last session (Run 1 → Run 2)
- **Booking lifecycle: 3/7 → 5/7** — availability re-check, GET auth, payment status handling all confirmed fixed from Run 1 action phase
- **Auth security: 4.4 → 4.6** — HMAC cookie, fabricated profile fix, RouteGuard fix from FA-208 branch. Offset by NEW findings (debug endpoints, hardcoded password)
- **Subscription: 3.2 → 4.0** — Stripe Checkout now exists, cancel subscription is real, webhook handler is solid
- **Fail-open enforcement: FIXED** — All 3 fail-open locations changed to fail-closed in this session

## What regressed or was re-scored lower
- Dashboard, Profiles, Organizations, Navigation, Settings all scored lower due to **stricter criteria** in this run (deeper L2-L3 analysis exposed mock data, any-types, zero error handling in document-management). Not actual regressions — assessment refinement.

## Cross-cut patterns detected
- Fail-open security: 3 instances → systemic fix applied this session
- Unauthenticated endpoints: 4 routes → delete 3, add auth to 1
- Stripe bypass: 3 routes → redirect through Stripe Checkout
- Zero test coverage: 12/14 modules → fix Jest first, then critical paths
- Phantom API routes: 8+ → create or remove
- Remaining select('*'): 6 instances → update ESLint rule
- Mock data in production: 5+ locations → replace with real queries
- No Zod validation: 15+ API routes → add schemas
- Debug logging: 3+ → remove
- Hardcoded secrets: 2 → move to env vars

## Tasks generated
- P0: 5 (~11h) — 1 fixed in action phase (fail-open enforcement)
- P1: 7 (~14h)
- P2: 5 (~8h)
- P3: 2

## Action phase results
- Tests written: 0 (Jest config still broken)
- Bugs fixed: 4
  - P0-2: Fail-open enforcement → fail-closed (3 locations)
  - P2-2: SupplierGuard role "supplier" → "shop"
  - P3-1: Audit logger event_type uses params.action instead of hardcoded
  - Note: Debug endpoint deletion requires 3 files (exceeds 2-file action limit)
- Lines changed: 8

## Recommended focus for next session
1. **Immediate (P0 remaining):** Delete debug endpoints (P0-1), move hardcoded password to env (P0-3), add server-side price validation (P0-4). These are all XS-S effort.
2. **This week:** Stripe integration for upgrade/downgrade (P0-5, L effort). Fix useBilling phantom routes (P1-5, S effort).
3. **Next week:** TOCTOU race fix (P1-3, M effort). Booking status transitions (P1-2, S). Fix Jest config and add critical tests (P1-7, M).
4. **Ongoing:** Move admin emails to server env (P1-1). Remove tokens from login response (P1-6). Add auth to ICS (P1-4).

## Estimated work to reach next milestone
- **Milestone 1 (Demo):** ~4-6h of P0+P1 work (delete debug endpoints, move password, remove mock data, remaining security fixes)
- **Milestone 2 (Payment):** ~16-24h additional (Stripe upgrade/downgrade integration, price validation, billing UI fix, TOCTOU race, status transitions)
- **Milestone 3 (Beta):** ~30-40h total from current state (all M2 work + test coverage, concurrency, full enforcement)
