# Field Advisor — Agent Recommendations
**Generated:** 2026-03-26 (Run 3)
**Descent findings:** 14
**Ascent score adjustments:** 3 modules revised
**Cross-cut patterns:** 7
**Triple-validated tasks:** 12
**Discarded findings:** 0

## App Health Score: 6.2/10
**Weakest module:** Subscription & Billing (4.8/10)
**Strongest module:** Video Calls (8.0/10)
**Booking lifecycle:** 6/7 steps complete
**Milestone 1 readiness:** 85%
**Milestone 2 readiness:** 60%
**Milestone 3 readiness:** 35%

---

## Critical Path (execute in this order)
1. P0-1: Fix enforcement fail-open (XS, unblocks M2 billing integrity)
2. P1-1: Align password reset validation (XS, quick security win)
3. P1-2: Add state machine to capture route (XS, prevents state drift)
4. P1-3: Validate capture amount (XS, payment integrity)
5. P1-4: Implement billing failure email (M, user trust)
6. P1-5: TOCTOU race fix (M, unblocks M2 concurrent usage)

---

## P0 — Blocking (1 task, ~30min)

---

## P0-1: Fix Enforcement Fail-Open on Null Plan Feature

**Priority:** P0
**Focus Area:** Security
**Milestone:** 2 (Payment)
**Effort:** XS (< 30min)
**Cluster:** Subscription Security
**Depends on:** None
**Enables:** None
**Risk if ignored:** Free users silently get access to paid features when plan feature lookup returns null

### Evidence
- Descent Level 3: `/lib/subscription/enforcement.ts` L230-245 returns `enforcementLevel: 'none'` when planFeature is null
- Cross-cut pattern #3: Enforcement fail-open paths (1 remaining)

### What is wrong
In `getEnforcementStatus()`, when `planFeature` is null (DB query fails or feature not configured), the function returns `{ enforcementLevel: 'none', isBlocked: false }`. This means any failure in the plan lookup silently grants full access.

### What to do
1. In `/lib/subscription/enforcement.ts`, find the null planFeature handler (~L230-245)
2. Change the return to `{ enforcementLevel: 'hard_limit', isBlocked: true, reason: 'Feature not configured' }`
3. Run lint and existing tests

### Validation
- [ ] When planFeature is null, `isBlocked` returns `true`
- [ ] When planFeature is null, `enforcementLevel` is `'hard_limit'`
- [ ] Existing enforcement tests still pass

### Linear issue
**Title:** fix(subscription): enforcement fails open when plan feature is null
**Label:** bug
**Priority:** Urgent (P0)

---

## P1 — High Value (4 tasks, ~6h)

---

## P1-1: Align Password Reset Validation with Register

**Priority:** P1
**Focus Area:** Security
**Milestone:** 2 (Payment)
**Effort:** XS (< 30min)
**Cluster:** Auth Security
**Depends on:** None
**Enables:** None
**Risk if ignored:** Users can weaken their password via the reset flow (no special char required)

### Evidence
- Descent Level 3: `/app/api/auth/reset-password/confirm/route.ts` L9 — regex missing special char
- Cross-cut pattern #7

### What is wrong
The register route requires uppercase + lowercase + digit + special character. The reset-password confirm route only requires uppercase + lowercase + digit. A user can reset their password to one without special characters.

### What to do
1. In `/app/api/auth/reset-password/confirm/route.ts`, update the password regex to match register's requirements
2. Add max length 128 check (register has it, reset doesn't)
3. Run lint

### Validation
- [ ] Password without special char is rejected on reset
- [ ] Password over 128 chars is rejected on reset
- [ ] Valid passwords still work

### Linear issue
**Title:** fix(auth): align password reset validation with register requirements
**Label:** bug
**Priority:** High (P1)

---

## P1-2: Enforce State Machine in Capture Route

**Priority:** P1
**Focus Area:** Booking/Payment
**Milestone:** 2 (Payment)
**Effort:** XS (< 30min)
**Cluster:** Booking Integrity
**Depends on:** None
**Enables:** None
**Risk if ignored:** Capture route can be called on bookings in invalid states, causing state drift

### Evidence
- Descent Level 3: `/app/api/bookings/[id]/capture/route.ts` — manual status check
- Level 2: Other routes (complete, join, refund) use assertValidTransition

### What is wrong
The capture route checks `booking.status !== 'confirmed'` manually instead of using `assertValidTransition()` from `/lib/business-rules/booking-transitions.ts`. This is inconsistent with all other booking mutation routes.

### What to do
1. Import `assertValidTransition` from `/lib/business-rules/booking-transitions.ts`
2. Replace the manual status check with `assertValidTransition(booking.status, 'payment_captured')` or the appropriate target status
3. Add server-side validation that `amountCents > 0` and `amountCents <= booking.total_amount * 100`
4. Run lint

### Validation
- [ ] Capture on non-confirmed booking returns proper error
- [ ] Invalid amounts (0, negative, over-capture) return 400
- [ ] Valid capture still works

### Linear issue
**Title:** fix(booking): enforce state machine and validate amount in capture route
**Label:** bug
**Priority:** High (P1)

---

## P1-3: Implement Billing Failure Email Notification

**Priority:** P1
**Focus Area:** Subscription/Payment
**Milestone:** 2 (Payment)
**Effort:** M (2-4h)
**Cluster:** Independent
**Depends on:** None
**Enables:** None
**Risk if ignored:** Users not notified when payments fail, leading to surprise subscription loss

### Evidence
- Descent Level 3: `/app/api/subscription/billing/handle-failure/route.ts` L370-372
- Cross-cut pattern #5 (stubs)

### What is wrong
The billing failure handler has a TODO stub: `// TODO: Replace with actual email service integration`. When a payment fails, the grace period and escalation logic runs, but no email is sent to the user.

### What to do
1. In `/app/api/subscription/billing/handle-failure/route.ts`, replace the stub with a call to the existing email service
2. Use Resend client from `/lib/email/resend-client.ts`
3. Create a billing failure email template in `/lib/email/` following existing patterns
4. Include: what failed, grace period duration, how to update payment method

### Validation
- [ ] Payment failure triggers an email send attempt
- [ ] Email includes relevant billing information
- [ ] Grace period logic still works correctly

### Linear issue
**Title:** feat(subscription): implement billing failure email notification
**Label:** feature
**Priority:** High (P1)

---

## P1-4: Fix TOCTOU Race in Booking Creation

**Priority:** P1
**Focus Area:** Booking/Payment
**Milestone:** 2 (Payment)
**Effort:** M (2-4h)
**Cluster:** Booking Integrity
**Depends on:** None
**Enables:** Milestone 2 concurrent usage
**Risk if ignored:** Two users can book the same time slot simultaneously

### Evidence
- Descent Level 3: `/app/api/bookings/route.ts` L93-116
- Level 1: Booking robustness score 6

### What is wrong
The `is_time_slot_available()` check and `createBooking()` are separate operations. Two simultaneous requests can both pass the availability check and create bookings for the same slot.

### What to do
1. Option A: Add a unique partial index on `bookings(consultant_profile_id, booking_date, booking_time)` WHERE `status NOT IN ('cancelled', 'refunded')`. This makes the DB reject duplicates atomically.
2. Option B: Wrap the check + insert in a DB transaction with `SELECT FOR UPDATE` on the consultant's schedule.
3. Option A is preferred (simpler, enforced at DB level)
4. Handle the unique constraint violation (23505) in the API route, returning 409

### Validation
- [ ] Two simultaneous booking attempts for the same slot: one succeeds, one gets 409
- [ ] Cancellation frees the slot for re-booking
- [ ] Normal bookings still work

### Linear issue
**Title:** fix(booking): prevent double-booking via DB constraint (TOCTOU race)
**Label:** bug
**Priority:** High (P1)

---

## P2 — Meaningful (5 tasks, ~4h)

---

## P2-1: Strengthen Payment-Intent Auth

**Priority:** P2
**Focus Area:** Security
**Milestone:** 2 (Payment)
**Effort:** S (30min-2h)
**Depends on:** None
**Risk if ignored:** Anyone with booking ID + email can retrieve Stripe client secret

### What to do
1. Require confirmation code in addition to email for payment-intent retrieval
2. Gate on the booking's confirmation_code field

---

## P2-2: Remove canPerformAction() Stub

**Priority:** P2
**Focus Area:** Security
**Milestone:** None (latent risk)
**Effort:** XS
**Depends on:** None
**Risk if ignored:** If anything calls this function, it grants unconditional access

### What to do
1. Either implement with real logic or throw an error ("not implemented")
2. Search codebase to confirm nothing calls it

---

## P2-3: Restrict Checkout to Org Owner/Admin

**Priority:** P2
**Focus Area:** Subscription
**Milestone:** 2 (Payment)
**Effort:** S
**Depends on:** None
**Risk if ignored:** Any org member can initiate a subscription checkout

### What to do
1. In `/app/api/subscription/checkout/route.ts`, add role check (owner or admin) after membership check

---

## P2-4: Reduce Confirmation Endpoint PII

**Priority:** P2
**Focus Area:** Security
**Milestone:** 2 (Payment)
**Effort:** XS
**Depends on:** None
**Risk if ignored:** Customer phone, emails exposed to anyone with confirmation code

### What to do
1. Return only masked/partial PII (e.g., email domain, last 4 of phone)
2. Or remove PII fields from the public confirmation response

---

## P2-5: Require Webhook Signature in All Environments

**Priority:** P2
**Focus Area:** Security
**Milestone:** 2 (Payment)
**Effort:** XS
**Depends on:** None
**Risk if ignored:** Dev/staging webhook endpoint can be spoofed

### What to do
1. Remove the development-mode signature bypass in `/app/api/webhooks/stripe/route.ts`
2. Require STRIPE_WEBHOOK_SECRET in all environments

---

## P3 — Backlog (3 tasks)

- **P3-1:** Remove dead file upload UI from BookingForm.tsx
- **P3-2:** Replace remaining select('*') instances (2 locations)
- **P3-3:** External rate limiting for auth routes (Redis/edge, needed for M3 multi-instance)

---

## Effort Clusters

### Cluster: "Booking Integrity" (~3h)
Theme: Payment and booking state correctness
Files: capture/route.ts, bookings/route.ts, booking-transitions.ts
Tasks: P1-2 (state machine, XS), P1-4 (TOCTOU, M)
Combined: ~3h (context-switching savings)

### Cluster: "Auth Security" (~1h)
Theme: Password and validation consistency
Files: reset-password/confirm/route.ts, payment-intent/route.ts
Tasks: P1-1 (password reset, XS), P2-1 (payment-intent auth, S)
Combined: ~1h

### Cluster: "Subscription Security" (~1h)
Theme: Enforcement and access control
Files: enforcement.ts, plans.ts, checkout/route.ts
Tasks: P0-1 (fail-open, XS), P2-2 (stub, XS), P2-3 (checkout role, S)
Combined: ~1h

---

## Systemic Fixes (from Cross-Cut)
1. **Test coverage** — Jest config now functional (FA-298). Establish CI gate. Write tests for booking + auth + webhook paths first.
2. **Large components** — 60+ files >300 lines. Do not refactor proactively. Split when touching them.
3. **select('*')** — 2 remaining instances. Fix opportunistically.

---

## Discarded Findings
None — all 14 findings passed at least P3 threshold.

---

## Linear Import (P0 + P1 only)

| Title | Label | Priority |
|-------|-------|----------|
| fix(subscription): enforcement fails open when plan feature is null | bug | Urgent |
| fix(auth): align password reset validation with register requirements | bug | High |
| fix(booking): enforce state machine and validate amount in capture route | bug | High |
| feat(subscription): implement billing failure email notification | feature | High |
| fix(booking): prevent double-booking via DB constraint (TOCTOU race) | bug | High |
