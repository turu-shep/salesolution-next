# Field Advisor — Descent Analysis
## Session: 2026-03-26 (Run 3)

---

## Level 0: App Shell

### Route Groups
- **/auth/** — login, signup, verify-email, callback + error.tsx + layout.tsx
- **/dashboard/** — Hub + consultant (10 pages), contractor (1), customer (3), shop (1), analytics, services, inquiries
- **/settings/** — 11 pages (profile, roles, availability, services, portfolio, notifications, reviews, share, billing, org microsite, org policies)
- **/admin/** — qr-kill-switches (AdminRoute guard)
- **/onboarding/** — consultant, contractor, customer, shop
- **/book/** — [slug], [slug]/confirmation/[code]
- **/call/** — [bookingId], [bookingId]/complete, demo/*
- **/pro/** — [...slug] (microsite catch-all) + loading.tsx + not-found.tsx
- **/profiles/** — directory + [slug]
- **/api/** — 150+ routes, 30+ domain directories

### App Shell Components
- **Root Layout:** Redux → PageTransition → Auth → {children} + Toaster
- **Middleware (221 lines):** Password (HMAC, 24h) → Auth → Email verify → Role selection → Role routing → Subscription gating
- **Error boundaries:** Root + dashboard + auth + settings + admin (5 total)
- **Loading:** Root (Loader2) + microsite (skeleton)
- **Not-found:** Root + microsite

### L0 Scores
| Dimension | Score |
|-----------|-------|
| Route completeness | 8 |
| Middleware correctness | 8 |
| Global error coverage | 8 |
| Provider chain health | 8 |
| Auth flow integrity | 8 |

**Decision:** PRUNE — all 8+

---

## Level 1: Module Scores

| Module | Complete | Robust | Quality | Security | Tests | Decision |
|--------|----------|--------|---------|----------|-------|----------|
| Booking & Scheduling | 9 | 6 | 7 | 6 | 3 | DESCEND |
| Subscription & Billing | 8 | 6 | 5 | 6 | 2 | DESCEND |
| Auth & Roles | 8 | 7 | 8 | 7 | 1 | DESCEND |
| Organizations | 7 | 6 | 7 | 5 | 2 | DESCEND |
| Profiles & Microsites | 8 | 7 | 5 | 8 | 0 | PRUNE |
| Video Calls | 8 | 8 | 8 | 8 | 0 | PRUNE |
| Dashboard & Analytics | 8 | 7 | 6 | 7 | 0 | PRUNE |
| SOP & Knowledge | 8 | 7 | 6 | 8 | 0 | PRUNE |
| Notifications & Email | 7 | 7 | 7 | 8 | 0 | PRUNE |
| Navigation & Routing | 8 | 8 | 8 | 8 | 0 | PRUNE |
| Settings & Config | 7 | 7 | 6 | 8 | 0 | PRUNE |
| Search, QR & Sharing | 7 | 7 | 8 | 8 | 4 | PRUNE |
| Onboarding | 7 | 6 | 6 | 7 | 0 | PRUNE |
| State Management | 8 | 7 | 6 | 7 | 2 | PRUNE |

---

## Level 2-3: Deep Dive Findings

### Booking

**F1: TOCTOU Race in Booking Creation**
- `/app/api/bookings/route.ts` lines 93-116
- `is_time_slot_available()` check and `createBooking()` not atomic
- Risk: double-booking on concurrent requests

**F2: State Machine Not Enforced in Capture**
- `/app/api/bookings/[id]/capture/route.ts`
- Checks status manually instead of `assertValidTransition()`
- Other routes (complete, join, refund) use state machine correctly

**F3: Payment-Intent Email-Only Auth**
- `/app/api/bookings/payment-intent/route.ts`
- Anyone with booking ID + email can get Stripe clientSecret
- Design choice for unauth customers, but confirmation code would be stronger

**F4: Confirmation Endpoint PII**
- `/app/api/bookings/confirmation/[code]/route.ts`
- Returns customer email, phone, consultant email with just a confirmation code

**F5: Dead File Upload UI**
- `/components/booking/BookingForm.tsx` lines 150-164
- Attachments collected but never uploaded

**F6: Capture Amount Not Validated**
- `/app/api/bookings/[id]/capture/route.ts` line 78
- No check that amountCents > 0 and ≤ authorized amount

**F7: Booking GET uses select('*')**
- `/app/api/bookings/route.ts` GET handler

### Subscription

**F8: canPerformAction() Stub**
- `/lib/subscription/plans.ts` lines 841-844
- Always returns `true` — latent bypass risk

**F9: getEnforcementStatus() Fail-Open**
- `/lib/subscription/enforcement.ts` lines 230-245
- Null planFeature → `enforcementLevel: 'none'`, `isBlocked: false`

**F10: Webhook Signature Skip in Dev**
- `/app/api/webhooks/stripe/route.ts` lines 19-43
- Dev mode without STRIPE_WEBHOOK_SECRET skips verification

**F11: Any Org Member Can Initiate Checkout**
- `/app/api/subscription/checkout/route.ts` line 55

**F12: Billing Failure Email Stub**
- `/app/api/subscription/billing/handle-failure/route.ts` lines 370-372

### Auth

**F13: Password Reset Weaker Than Register**
- `/app/api/auth/reset-password/confirm/route.ts` line 9
- Missing special character requirement

**F14: In-Memory Rate Limiting**
- `/app/api/auth/login/route.ts`, `/app/api/auth/register/route.ts`
- Resets on restart, no cross-instance support

### Prior P0 Status
- Debug endpoints: REMOVED ✅
- Login token exposure: FIXED (FA-229) ✅
- Fail-open check-access: FIXED ✅
- ICS auth: FIXED ✅
- Receipt auth: FIXED ✅
- Hardcoded secrets: NONE FOUND ✅
- Upgrade/downgrade Stripe bypass: FALSE (properly calls Stripe) ✅
- Server-side price validation: NOW EXISTS ✅
