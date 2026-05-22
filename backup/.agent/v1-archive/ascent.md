# Field Advisor — Ascent Analysis
## Session: 2026-03-26 (Run 3)

---

## Level 3 → Level 2: Function → Component

### BookingWizard.tsx — Post-Descent
- Original L2 score: Quality 7, Robustness 6
- Revised: Quality 7, Robustness 6 (unchanged — issues are in API routes not component)
- Dead file upload UI (F5) is cosmetic, not functional risk

### BookingForm.tsx — Post-Descent
- Original L2 score: Quality 6
- Revised: Quality 6 (434 lines, no try/catch, dead upload)

### Capture Route — Post-Descent
- Original L2 score: Security 6
- Revised: Security 5 (no state machine, no amount validation — F2+F6)

### Enforcement.ts — Post-Descent
- Original L2 score: Security 6
- Revised: Security 5 (fail-open on null planFeature — F9)

### Plans.ts — Post-Descent
- Original L2 score: Quality 5
- Revised: Quality 5 (confirmed 0 try/catch, canPerformAction stub — F8)

---

## Level 2 → Level 1: Component → Module

### Booking & Scheduling — Post-Descent
- Components analyzed: 8/15 (descended: BookingWizard, BookingForm, BookingPaymentStep, BookingConfirmation)
- Components pruned: 7 (TimeSlotGrid, ServiceSelector, BookingCalendar, etc.)
- Original: Complete 9, Robust 6, Quality 7, Security 6, Tests 3
- **Revised: Complete 9, Robust 6, Quality 7, Security 5, Tests 3**
- Security dropped: capture route unvalidated (F6), PII leak (F4)

### Subscription & Billing — Post-Descent
- Components analyzed: enforcement.ts, plans.ts, checkout, upgrade, downgrade, webhook
- Original: Complete 8, Robust 6, Quality 5, Security 6, Tests 2
- **Revised: Complete 8, Robust 6, Quality 5, Security 5, Tests 2**
- Security dropped: enforcement fail-open (F9), canPerformAction stub (F8)

### Auth & Roles — Post-Descent
- Files analyzed: login, register, middleware, reset-password
- Original: Complete 8, Robust 7, Quality 8, Security 7, Tests 1
- **Revised: Complete 8, Robust 7, Quality 8, Security 7, Tests 1** (unchanged — password reset gap is minor)

### Organizations — Not re-descended (prior findings assumed stable)
- **Scores: Complete 7, Robust 6, Quality 7, Security 5, Tests 2** (unchanged)

---

## Level 1 → Level 0: Module → App

### Post-Descent App Summary
- Modules analyzed in depth: 4 (Booking, Subscription, Auth, Organizations)
- Modules pruned: 10 (all healthy or non-milestone-critical)
- Healthiest module: Video Calls (8.0/10 overall, all dimensions 8+)
- Weakest module: Subscription & Billing (4.8/10 — dragged by quality 5, tests 2, security 5)
- **App-wide health score: 6.2/10** (milestone-critical modules weighted 2x)

---

## Booking/Payment Lifecycle — End-to-End Trace

### Step 1: Discovery & Selection
- Where: `/app/profiles/page.tsx`, `/app/pro/[...slug]/page.tsx`
- Works for demo: ✅
- SSR rendering, comprehensive microsite with services

### Step 2: Availability Check
- Function: `is_time_slot_available()` via RPC in `/app/api/bookings/route.ts` L93
- Race condition protected: ❌ (TOCTOU — not atomic with booking creation)
- Timezone handling: ⚠️ (timezone not passed to RPC, defaults to America/Chicago)
- Status: ⚠️

### Step 3: Booking Creation
- API route: `/app/api/bookings/route.ts` POST
- Auth verified: N/A (intentionally unauth for customer flow)
- Input validation: ⚠️ (manual checks, no Zod)
- Price validated server-side: ✅ (looks up service_offerings.price_amount)
- Idempotency: ❌ (no double-submit protection)
- DB transaction: ❌ (separate availability check + insert)
- Status: ⚠️

### Step 4: Payment Intent
- Stripe method: PaymentIntent (manual capture within 7 days, auto otherwise)
- Created server-side: ✅
- Amount calculated server-side: ✅ (double-checked against service price)
- Metadata attached: ✅ (booking_id)
- Connect support: ✅ (transfer_data + application_fee)
- Status: ✅

### Step 5: Payment Confirmation
- Client-side: Stripe.js `confirmCardPayment()`
- Handles: succeeded, requires_capture, requires_action (3DS)
- Success UX: ✅ (redirects to confirmation page)
- Failure UX: ✅ (shows error message)
- Status: ✅

### Step 6: Post-Payment Actions
- Booking status updated: ✅ (webhook → confirmed)
- Confirmation email: ✅ (sent at booking creation, not payment — acceptable)
- Video room (Daily.co): ⚠️ (on-demand, not auto-provisioned)
- Calendar invite: ✅ (ICS endpoint exists)
- Provider notified: ❌ (no payment-success notification to consultant)
- Status: ⚠️

### Step 7: Webhook Reliability
- Handler: `/lib/stripe/webhook-handler.ts`
- Signature verification: ✅ (except dev fallback)
- Events handled: 13 event types
- Idempotency: ✅ (stripe_processed_events table + upsert)
- Failed webhook retry: ✅ (500 response triggers Stripe retry)
- Status: ✅

### Lifecycle Summary
- Steps complete: 6/7 (↑ from 5/7)
- Critical gaps (❌): TOCTOU race, no provider payment notification
- Risk areas (⚠️): timezone handling, no double-submit protection, video room on-demand
- **Milestone 1 ready: Yes** — demo-able end-to-end
- **Milestone 2 ready: Almost** — TOCTOU race is the blocker for real concurrent usage
