# Documentation Drift Report — 2026-03-28

## Summary
- Documents analyzed: 4
- Assertions checked: 23
- Confirmed (code matches): 16 (70%)
- Drifted (code disagrees): 5 (22%)
- Unverifiable: 2 (8%)

---

## Drift Findings

### Document: CLAUDE.md

#### DRIFT-001: API response format inconsistency
- **Document says:** "API responses: { success: boolean, data?: any, error?: string }"
- **Location:** CLAUDE.md → Conventions section
- **Code reality:** 4 out of 18 API routes return non-standard formats.
  - `/app/api/bookings/create/route.ts` returns `{ booking, payment_intent }` (no success wrapper)
  - `/app/api/auth/callback/route.ts` returns raw redirect (acceptable — auth callback)
  - `/app/api/stripe/webhook/route.ts` returns `{ received: true }` (no success wrapper)
  - `/app/api/profiles/search/route.ts` returns `{ results, count }` (no success wrapper)
- **Severity:** Medium
- **Fix direction:** Fix code — standardize 3 routes (auth callback is an acceptable exception)
- **Milestone impact:** M1 — inconsistent error responses confuse frontend error handling
- **Recommended action:** Create a `createApiResponse()` utility in /lib/ and use it in all API routes

#### DRIFT-002: Test file placement convention
- **Document says:** "Tests next to source: foo.ts → foo.test.ts"
- **Location:** CLAUDE.md → Conventions section
- **Code reality:** Of 11 test files, 4 follow the convention (adjacent to source) and 7 are in a `/tests/` root directory. The convention is more violated than followed.
- **Severity:** Low
- **Fix direction:** Manual decision — either move tests or update the convention
- **Milestone impact:** None
- **Recommended action:** Decide on one pattern and document it. Not urgent.

### Document: docs/modules/booking-scheduling.md

#### DRIFT-003: Duplicate availability logic
- **Document says:** "Bookings check availability via is_time_slot_available() DB function"
- **Location:** docs/modules/booking-scheduling.md → Data Flow section
- **Code reality:** The booking creation API route (`/app/api/bookings/create/route.ts`) has an inline availability check in addition to calling `is_time_slot_available()`. The inline check is simpler and doesn't account for buffer times between bookings.
- **Severity:** High
- **Fix direction:** Fix code — remove the inline check, rely solely on the DB function
- **Milestone impact:** M2 — inconsistent availability logic could allow double-bookings
- **Recommended action:** Delete the inline availability check (lines 34-41 of route.ts). The DB function is authoritative and handles edge cases the inline check misses.

#### DRIFT-004: Post-booking email assertion
- **Document says:** "Confirmation email sent immediately after booking creation"
- **Location:** docs/modules/booking-scheduling.md → Post-Action section
- **Code reality:** Email sending is triggered by a Stripe webhook (`payment_intent.succeeded`), not by the booking creation endpoint. If the webhook fails or is delayed, no email is sent. There is no fallback.
- **Severity:** Medium
- **Fix direction:** Fix doc to reflect actual behavior, then evaluate if a fallback is needed
- **Milestone impact:** M2 — users may not receive confirmation of successful payment
- **Recommended action:** Update the module doc to describe the actual webhook-triggered flow. Add a P1 task to implement a polling fallback that checks for unconfirmed paid bookings.

### Document: docs/conventions/ARCHITECTURE.md

#### DRIFT-005: Stripe logic location
- **Document says:** "/lib/stripe/ — Stripe integration logic"
- **Location:** docs/conventions/ARCHITECTURE.md → Directory Structure
- **Code reality:** Stripe logic exists in three locations:
  - `/lib/stripe/` — 4 files (create-intent, verify-webhook, customer-portal, config) ✅
  - `/app/api/stripe/webhook/route.ts` — 120 lines of Stripe event handling logic ⚠️
  - `/components/booking/BookingForm.tsx` — 35 lines of Stripe.js client-side confirmation ⚠️
- **Severity:** Medium
- **Fix direction:** Fix code — extract webhook processing logic into /lib/stripe/webhook-handlers.ts. Client-side Stripe.js in the component is acceptable (must run in browser).
- **Milestone impact:** None directly, but the scattered logic makes it harder to audit payment security
- **Recommended action:** Extract the webhook handler's business logic into /lib/stripe/. Keep the route.ts as a thin handler that verifies signature and delegates.

---

## Unverifiable Assertions

1. **CLAUDE.md:** "Deploy to production via merge to main" — agent cannot verify deployment infrastructure
2. **docs/modules/video-calls.md:** "Daily.co rooms are provisioned within 500ms" — agent cannot measure latency

---

## Drift Summary by Severity

| Severity | Count | Documents Affected |
|----------|-------|--------------------|
| High | 1 | booking-scheduling.md |
| Medium | 3 | CLAUDE.md, booking-scheduling.md, ARCHITECTURE.md |
| Low | 1 | CLAUDE.md |

## Drift Trend
*First run — no prior data for comparison.*
