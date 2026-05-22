# Cross-Cut Analysis — 2026-04-02

## 3.1 — Pattern Detection

### Pattern 1: CSRF Coverage Gap
- Detected by: Adversary
- Instances: ~175 POST routes without CSRF protection
- Locations:
  1. `app/api/reviews/submit/route.ts` — review submission
  2. `app/api/users/avatar/route.ts` — avatar upload
  3. `app/api/users/switch-role/route.ts` — role switching
  4. `app/api/account/delete/route.ts` — account deletion
  5. `app/api/onboarding/*/route.ts` — onboarding state changes
  6. `app/api/profiles/*/route.ts` — profile modifications
  7. `app/api/settings/*/route.ts` — settings changes
  8. `app/api/services/route.ts` — service management
  9. Plus ~165 more POST routes
- Root cause: CSRF was added late (FA-344) and only applied to the most critical routes (booking + subscription). Broader rollout not completed.
- Systemic fix: Apply `withCsrfProtection` wrapper or CSRF middleware to all authenticated POST/PUT/DELETE routes. Exclude webhooks, cron, and auth routes.
- Systemic effort: M (2-4h — update ~30 user-facing POST routes, others are webhook/cron/internal)
- Individual effort × n: L (same file pattern, but many files)
- Leverage ratio: 5:1 (a middleware-level approach would cover all at once)

### Pattern 2: Rate Limiting Fail-Open
- Detected by: Adversary
- Instances: All rate-limited endpoints (9)
- Locations:
  1. `lib/rate-limit/index.ts:73-75` — checkRateLimit returns allowed:true
  2. `lib/env-check.ts:90-93` — Upstash classified as feature var
- Root cause: Upstash Redis treated as optional feature, not production requirement
- Systemic fix: Move `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `featureVars` to `productionSchema` in env-check.ts
- Systemic effort: XS (<30min)
- Leverage ratio: 10:1 (one 2-line change protects 9 endpoints)

### Pattern 3: Stale Tests After Security Changes
- Detected by: Architect
- Instances: 8 failing test suites, 52 failing tests
- Locations:
  1. `lib/middleware/securityHeaders.test.ts` — checks `Content-Security-Policy-Report-Only` but code now uses `Content-Security-Policy`
  2. Various tests checking old CSP header name
- Root cause: CSP mode changed from report-only to enforcing (FA-206) without updating tests
- Systemic fix: Update test expectations from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
- Systemic effort: XS (<30min)
- Leverage ratio: 8:1 (one header name change fixes 52 tests)

### Pattern 4: Documentation Drift on Counts
- Detected by: Architect
- Instances: 3 drifted counts
- Locations:
  1. `docs/conventions/API.md` — route count 195 vs 387
  2. `CLAUDE.md` — migration count 47+ vs 110+
  3. `.claude/rules/database.md` — migration highest 047 vs 110
- Root cause: Code grew rapidly but docs not refreshed
- Systemic fix: Update all three docs with current counts
- Systemic effort: XS (<30min)

### Pattern 5: Timing-Unsafe Signature Comparison
- Detected by: Adversary
- Instances: 1
- Locations:
  1. `app/api/webhooks/daily/route.ts:58` — `signature === expectedSignature`
- Root cause: Quick implementation, crypto best practice missed
- Systemic fix: Use `timingSafeEqual` from Node.js `crypto` module (already used in CSRF)
- Systemic effort: XS (<30min)

### Pattern 6: Missing Error Boundary
- Detected by: User
- Instances: 1 (down from 18 in prior session)
- Locations:
  1. `app/search/` — no error.tsx
- Root cause: Missed during bulk error/loading page addition
- Systemic fix: Add error.tsx to `app/search/`
- Systemic effort: XS (<30min)

### Pattern 7: Unsigned Cookie in Auth Callback
- Detected by: Adversary + User (cross-persona)
- Instances: 1
- Locations:
  1. `app/auth/callback/route.ts:19-27` — sets unsigned JSON cookie
- Root cause: Auth callback written before HMAC signing was implemented, never updated
- Systemic fix: Import and use `signPasswordCookie()` from `lib/auth/password-cookie.ts`
- Systemic effort: XS (<30min)

---

## 3.2 — Cross-Module Dependency Risks

### Auth → All Modules: Password cookie integrity
- Coupling type: implicit convention (cookie format)
- Change cascade: If cookie format changes, middleware breaks → all protected routes inaccessible
- Decouple how: Single source of truth — already exists (`lib/auth/password-cookie.ts`) but auth callback doesn't use it

### Subscription → Dashboard: Feature gating
- Coupling type: hook-based (`useFeatureAccess()`)
- Change cascade: Plan changes in DB → feature access changes → UI must update
- Decouple how: Already well-decoupled via hook pattern. Fail-closed is correct.

### Booking → Stripe → Video → SOP: Core transaction chain
- Coupling type: Data flow (booking → payment_intent → room → recording → SOP)
- Change cascade: Any step failure cascades to downstream steps
- Decouple how: Each step is independent with its own error handling. Fire-and-forget for non-critical ops. Good pattern.

---

## 3.3 — Business-Implementation Gap Analysis

### Gap: Stripe Price IDs in Database (FA-389)
- Context says: Subscription checkout should work end-to-end
- Code does: Handles NULL price IDs gracefully (422 response), but no subscriptions can be purchased until DB rows populated
- Severity: Critical (blocks milestone M0)
- Milestone: M0

### Gap: Trial Duration (FA-382)
- Context says: Trial should be 45 days
- Code does: Defaults to 90 days (`app/api/subscription/trial/start/route.ts:36`)
- Severity: Moderate (business decision, not broken code)
- Milestone: M0

### Gap: SOP Failure Visibility
- Context says: Customer should receive SOP as deliverable
- Code does: SOP generation is async via Inngest, cron retries failed SOPs, but no user-visible status or retry option
- Severity: Moderate (pipeline works, but failure is invisible to user)
- Milestone: M2
