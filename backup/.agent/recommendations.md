# Field Advisor — Agent Recommendations v2.0
**Generated:** 2026-04-02
**Product:** Field Advisor | **Stage:** Late-build, pre-launch (M0: 13 days)
**Analysis mode:** Full Cycle — 90+ files analyzed across 8 modules
**Descent findings:** 25 | **Cross-cut patterns:** 7 | **Drift findings:** 4
**Validated tasks:** 12 | **Discarded:** 0

## Health Summary
- App health: **7.0/10** (prior: 6.8/10, delta: +0.2)
- Weakest module: SOP & Video (5.4) — flagged by: User, Adversary
- Strongest module: Reviews (8.0)
- Core transaction: **8/9 steps ✅**, 1 ⚠️ (SOP delivery UX)
- Documentation drift: 4 drifted / 15 checked (73% compliance)
- M0 readiness: **90%** — blockers: auth callback cookie (FA-392), Stripe price IDs (FA-389)
- M1 readiness: **75%** — blockers: onboarding polish, trial duration fix
- M2 readiness: **50%** — blockers: SOP pipeline reliability, user-visible retry

## Critical Path (dependency-ordered execution sequence)
1. **P0-001** Fix auth callback cookie → unblocks all post-signup flows (30min)
2. **P0-002** Verify Stripe price IDs → unblocks subscription revenue (30min)
3. **P1-003** Fix stale CSP tests → restores CI confidence (30min)
4. **P1-002** Promote Upstash to production env vars → closes rate limit fail-open (15min)
5. **P1-004** Change trial to 45 days → aligns business policy (15min)
6. **P1-001** CSRF rollout → hardens remaining POST routes (2-4h)

---

## P0 — Blocking (2 tasks, ~1h)

---

### P0-001: Fix auth callback unsigned password cookie

**Priority:** P0
**Focus Area:** Critical Path to Revenue
**Milestone:** M0
**Effort:** XS (<30min)
**Cluster:** Auth Fix | **Depends on:** None | **Enables:** All user flows
**Personas:** Adversary (primary), User (secondary)

**Business Impact:** Revenue Blocking
**Impact Detail:** After email verification or OAuth login, users are redirected through the auth callback which sets an unsigned JSON cookie. The middleware expects an HMAC-signed cookie. Result: every new user is locked out of the platform immediately after completing signup. No users = no revenue.
**Revenue Effect:** 100% of new signups blocked → $0 revenue

**Risk if ignored:** Every new user who verifies their email gets stuck on the password protection page.

### Evidence
- Level 3: `app/auth/callback/route.ts:19-27` — `JSON.stringify()` instead of `signPasswordCookie()`
- Level 3: `lib/auth/password-cookie.ts:52` — `signPasswordCookie()` exists but unused by callback
- Level 3: `app/api/auth/password/route.ts:37` — password API correctly uses `signPasswordCookie()`
- Cross-cut: Pattern 7 — unsigned cookie, single instance

### What is wrong
`app/auth/callback/route.ts` sets the `password-session` cookie as plain JSON: `JSON.stringify({ timestamp: Date.now(), verified: true })`. The middleware's `verifyPasswordCookie()` expects the format `base64(payload).base64(hmac-signature)` produced by `signPasswordCookie()`. The cookie fails HMAC verification, so users are redirected to `/password-protection`.

### What to do
1. In `app/auth/callback/route.ts`, import `signPasswordCookie` from `@/lib/auth/password-cookie`
2. Replace lines 19-27 with: `const signedCookie = await signPasswordCookie({ timestamp: Date.now(), authenticated: true })`
3. Set the cookie value to `signedCookie` instead of `JSON.stringify(...)`
4. Handle null return (missing secret) — redirect to login with error

### Validation
- [ ] After email verification, user reaches their dashboard (not password-protection page)
- [ ] After OAuth login, user reaches their dashboard
- [ ] Password protection page still works for unauthenticated access

### Task tracker issue
**Title:** fix(auth): use HMAC-signed cookie in auth callback [FA-392]
**Label:** bug
**Priority:** Urgent (P0)

---

### P0-002: Verify and populate Stripe price IDs in subscription_plans table

**Priority:** P0
**Focus Area:** Critical Path to Revenue
**Milestone:** M0
**Effort:** XS (<30min)
**Cluster:** Revenue Setup | **Depends on:** None | **Enables:** Subscription purchases
**Personas:** Adversary (primary)

**Business Impact:** Revenue Blocking
**Impact Detail:** The `subscription_plans` table may have NULL values for `stripe_price_id_monthly` and `stripe_price_id_annual`. The checkout route handles this gracefully with a 422 error, but no subscriptions can be purchased until the correct Stripe Price IDs are populated. This is a data configuration issue, not a code bug.
**Revenue Effect:** $0 subscription revenue until fixed — 75 shops × $299/mo = $22K+/mo at stake

**Risk if ignored:** Zero subscription purchases possible at launch.

### Evidence
- Level 2: `app/api/subscription/checkout/route.ts:101-107` — `resolveStripePriceId()` returns null → 422
- Level 2: No env vars for price IDs — they're stored in DB table
- Cross-cut: Gap analysis — subscription checkout is revenue entry point

### What is wrong
The `subscription_plans` database rows need `stripe_price_id_monthly` and `stripe_price_id_annual` columns populated with real Stripe Price IDs from the Stripe Dashboard. The code correctly handles missing IDs (422 response), but no checkout sessions can be created without them.

### What to do
1. In Stripe Dashboard, create Price objects for each plan (Starter $49/mo, Pro $149/mo, Business $299/mo)
2. Create annual Price objects if offering annual billing
3. Run a migration or admin script to populate `subscription_plans.stripe_price_id_monthly` and `stripe_price_id_annual`
4. Test checkout flow end-to-end with real (or test mode) Price IDs

### Validation
- [ ] Each plan in subscription_plans has non-null stripe_price_id_monthly
- [ ] Checkout session creation succeeds (returns checkoutUrl)
- [ ] User can complete Stripe Checkout and subscription is activated

### Task tracker issue
**Title:** fix(stripe): verify and populate Stripe price IDs for 3 launch plans [FA-389]
**Label:** bug
**Priority:** Urgent (P0)

---

## P1 — High Value (4 tasks, ~4h)

---

### P1-001: Expand CSRF protection to remaining user-facing POST routes

**Priority:** P1
**Focus Area:** Security Hardening
**Milestone:** M0
**Effort:** M (2-4h)
**Cluster:** Security | **Depends on:** None | **Enables:** Launch security
**Personas:** Adversary (primary)

**Business Impact:** Operational Risk
**Impact Detail:** Only 10 of ~30 user-facing POST routes have CSRF protection. Routes like account deletion, profile updates, and service management are vulnerable to cross-site request forgery. A single CSRF exploit on account deletion could generate press coverage that kills the platform before it starts.

**Risk if ignored:** Attackers can trigger state-changing actions on behalf of logged-in users.

### Evidence
- Level 0: 185 POST routes, 10 have CSRF
- Cross-cut: Pattern 1 — systemic gap
- Many routes are webhooks/cron (correctly excluded)

### What is wrong
User-facing POST routes (account, reviews, profiles, settings, services, onboarding) don't validate CSRF tokens. The `withCsrfProtection` wrapper and `validateCsrfToken` function exist and work well.

### What to do
1. Identify the ~30 user-facing POST/PUT/DELETE routes that should have CSRF (exclude webhooks, cron, auth, public booking)
2. Add `validateCsrfToken` or `withCsrfProtection` to each
3. Ensure the client-side CSRF hook (`lib/hooks/useCsrf.ts`) is used in corresponding forms
4. Test CSRF validation on key routes

### Validation
- [ ] Account deletion requires valid CSRF token
- [ ] Review submission requires valid CSRF token
- [ ] Profile update requires valid CSRF token
- [ ] Webhooks still work without CSRF tokens

### Task tracker issue
**Title:** fix(security): expand CSRF protection to all user-facing POST routes
**Label:** security
**Priority:** High (P1)

---

### P1-002: Promote Upstash Redis to production-required env vars

**Priority:** P1
**Focus Area:** Security Hardening
**Milestone:** M0
**Effort:** XS (<30min)
**Cluster:** Security | **Depends on:** None | **Enables:** Guaranteed rate limiting
**Personas:** Adversary (primary)

**Business Impact:** Operational Risk
**Impact Detail:** Rate limiting silently disables when Upstash Redis isn't configured. Since Upstash env vars are in `featureVars` (not `productionSchema`), the app starts without warning in production. All rate limits (login, booking, checkout) become no-ops.

**Risk if ignored:** Brute force attacks on login, booking spam, checkout abuse — all unthrottled.

### What to do
1. In `lib/env-check.ts`, move `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `featureVars['Rate Limiting (Upstash)']` to `productionSchema`
2. Remove the duplicate entries from `featureVars`

### Validation
- [ ] App fails to start in production without UPSTASH_REDIS_REST_URL
- [ ] Rate limiting works when Redis is configured
- [ ] Dev mode still starts with warning (not crash)

### Task tracker issue
**Title:** fix(security): promote Upstash Redis to production-required env vars
**Label:** security
**Priority:** High (P1)

---

### P1-003: Fix stale security headers tests

**Priority:** P1
**Focus Area:** Infrastructure
**Milestone:** M0
**Effort:** XS (<30min)
**Cluster:** Tests | **Depends on:** None | **Enables:** CI confidence
**Personas:** Architect (primary)

**Business Impact:** Operational Risk
**Impact Detail:** 52 tests failing across 8 suites because they check for `Content-Security-Policy-Report-Only` but the code now uses enforcing `Content-Security-Policy` (FA-206). This makes the test suite unreliable and masks real failures.

### What to do
1. In `lib/middleware/securityHeaders.test.ts`, change all references to `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
2. Run `npx jest --testPathIgnorePatterns='\.claude'` to verify all 928 tests pass

### Validation
- [ ] All 81 test suites pass
- [ ] All 928 tests pass (746 currently passing + 52 fixed + 68 skipped + 62 todo)

### Task tracker issue
**Title:** fix(tests): update CSP test assertions to match enforcing mode [FA-206]
**Label:** bug
**Priority:** High (P1)

---

### P1-004: Change trial duration from 90 to 45 days

**Priority:** P1
**Focus Area:** Revenue
**Milestone:** M0
**Effort:** XS (<30min)
**Cluster:** Revenue | **Depends on:** None | **Enables:** Correct billing policy
**Personas:** Architect (primary)

**Business Impact:** Revenue Degrading
**Impact Detail:** Trial defaults to 90 days instead of the intended 45. This delays first payment by 45 days per customer, reducing initial MRR by ~50% compared to the intended timeline.

### What to do
1. In `app/api/subscription/trial/start/route.ts:36`, change `durationDays = 90` to `durationDays = 45`
2. Update JSDoc comment on line 8

### Validation
- [ ] New trials last 45 days (not 90)
- [ ] Trial UX messages still work correctly

### Task tracker issue
**Title:** fix(subscription): change trial from 90 to 45 days [FA-382]
**Label:** bug
**Priority:** High (P1)

---

### Note: Org ownership verification — CONFIRMED WORKING
The subscription management endpoints (cancel, pause, resume, upgrade, downgrade) all include `.eq('user_id', user.id)` in the membership query, correctly filtering by the authenticated user. No fix needed — this was verified via grep across all subscription routes.

---

## P2 — Meaningful (4 tasks, ~3h)

---

### P2-001: Fix Daily.co webhook timing-unsafe signature comparison

**Priority:** P2
**Effort:** XS (<30min)
**Personas:** Adversary

Replace `signature === expectedSignature` in `app/api/webhooks/daily/route.ts:58` with `timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))` from Node.js `crypto`.

---

### P2-002: Add error.tsx to search page

**Priority:** P2
**Effort:** XS (<30min)
**Personas:** User

Add `app/search/error.tsx` following the same pattern as other route groups. Copy from any existing error.tsx.

---

### P2-003: Update drifted documentation counts

**Priority:** P2
**Effort:** XS (<30min)
**Personas:** Architect | Tags: [DRIFT]

Update: API.md route count (195→387), CLAUDE.md migration count (47+→110+), .claude/rules/database.md highest migration (047→110).

---

### P2-004: Rate limit confirmation code lookup endpoint

**Priority:** P2
**Effort:** S (30min-2h)
**Personas:** Adversary

The booking detail endpoint (`/api/bookings/[id]`) allows unauthenticated access via confirmation code. No rate limiting prevents brute-force enumeration of codes. Add IP-based rate limiting (5 attempts/min) to the confirmation code path.

---

### P2-005: SOP failure visibility for users

**Priority:** P2
**Effort:** M (2-4h)
**Milestone:** M2
**Personas:** User

Add user-visible SOP generation status and retry button on the post-call page. Currently failures are invisible — cron retries but user sees nothing.

---

### P2-006: HMAC-sign unsubscribe tokens

**Priority:** P2
**Effort:** S (30min-2h)
**Personas:** Adversary

Unsubscribe tokens are plain `base64(userId:type)` with no signature. Anyone can forge a token to unsubscribe any user. Replace with HMAC-SHA256 signed tokens using a server-side secret. Affects: `app/api/cron/re-engagement/route.ts`, `app/api/email/unsubscribe/route.ts`, and all email templates that generate unsubscribe URLs.

---

### P2-007: Register missing cron routes in vercel.json

**Priority:** P2
**Effort:** XS (<30min)
**Personas:** Architect

`vercel.json` only has 4 of 8+ cron routes registered: missing `onboarding-nudge`, `retry-failed-sops`, `peer-benchmarks`, `intake-reminders`. These routes won't execute on schedule in production.

---

## P3 — Backlog (2 tasks)

### P3-001: Make Claude model version configurable
`lib/sop/sop-generator.ts` hardcodes `claude-3-5-sonnet-20241022`. Move to env var with fallback.

### P3-002: Remove email from auth callback URL
`app/auth/callback/route.ts:40` sets email in query param. Pass via session/state instead.

---

## Effort Clusters

### Cluster: "Auth Fix" (~30min)
Theme: Auth callback cookie
Files: `app/auth/callback/route.ts`
Tasks: P0-001

### Cluster: "Revenue Setup" (~30min)
Theme: Stripe configuration
Files: Database `subscription_plans` table
Tasks: P0-002

### Cluster: "Security Quick Wins" (~1h)
Theme: Security hardening
Files: `lib/env-check.ts`, `app/api/webhooks/daily/route.ts`
Tasks: P1-002, P2-001

### Cluster: "Test & CI Health" (~30min)
Theme: Test suite fixes
Files: `lib/middleware/securityHeaders.test.ts`
Tasks: P1-003

### Cluster: "CSRF Rollout" (~2-4h)
Theme: CSRF protection expansion
Files: ~30 API route files
Tasks: P1-001

---

## Systemic Fixes (from Cross-Cut)
1. **CSRF middleware** — instead of adding to 30 routes, consider a middleware-level check for all POST/PUT/DELETE on authenticated routes
2. **Env check promotion** — 2-line change to productionSchema fixes rate limit fail-open

## Documentation Drift Fixes
1. API.md: Update route count to 387
2. CLAUDE.md: Update migration count to 110+
3. .claude/rules/database.md: Update highest migration to 110

## Business-Implementation Gaps
1. Stripe price IDs (DB data) — blocks subscription revenue
2. Trial duration mismatch — delays first payment
3. SOP failure invisibility — M2 quality issue

## Discarded Findings
None — all findings passed validation

## Task Tracker Import (P0 + P1)
- `fix(auth): use HMAC-signed cookie in auth callback [FA-392]` — Urgent
- `fix(stripe): verify and populate Stripe price IDs for 3 launch plans [FA-389]` — Urgent
- `fix(security): expand CSRF protection to all user-facing POST routes` — High
- `fix(security): promote Upstash Redis to production-required env vars` — High
- `fix(tests): update CSP test assertions to match enforcing mode` — High
- `fix(subscription): change trial from 90 to 45 days [FA-382]` — High
