# Ascent — 2026-04-02 (V2.0 Full Cycle)

## 2.1 — Roll-Up Protocol

### Level 3 → 2: Function findings revise component scores

#### Auth Callback — Post-Descent Revision
- Adversary-driven: [ADV-001] unsigned cookie → security score drops from 6 to 3
- User-driven: email in URL param (minor)
- Cross-persona promotion: ADV-001 flagged by Adversary (security bypass) + User (lockout) → auto-P0
- Original scores: C:8 R:7 Q:7 S:6 T:6 → Revised: C:8 R:6 Q:7 S:3 T:6

#### Rate Limiting — Post-Descent Revision
- Adversary-driven: [ADV-003] fail-open → security score drops from 7 to 5
- Architect-driven: implementation quality excellent, but env classification wrong
- Original scores: C:8 R:7 Q:9 S:7 T:3 → Revised: C:8 R:7 Q:9 S:5 T:3

#### Booking Complete — Post-Descent Revision
- All prior flags resolved → scores increase significantly
- Original (2026-03-27): C:3 R:6 Q:6 S:8 T:0 → Revised: C:9 R:8 Q:8 S:8 T:5

### Level 2 → 1: Component health aggregates to module

#### Module: Auth & Middleware — Post-Descent Revision
- Components analyzed deeply: 15
- Original → Revised: C:8 R:6 Q:8 S:3 T:6 → Overall: 5.8
- Delta from prior session (2026-03-30): Auth 6.0 → 5.8 (slight decrease due to ADV-001 discovery)

#### Module: Booking & Payment — Post-Descent Revision
- Components analyzed: 20+
- Original → Revised: C:9 R:8 Q:8 S:7 T:5 → Overall: 7.8
- Delta from prior session: 7.4 → 7.8 (post-call workflow now complete)

#### Module: Reviews — Post-Descent Revision
- All prior critical flags resolved
- Original → Revised: C:9 R:8 Q:9 S:7 T:5 → Overall: 8.0
- Delta from prior session: 7.0 → 8.0 (confirmed quality via deeper analysis)

#### Module: Subscription & Billing — Post-Descent Revision
- Original → Revised: C:8 R:7 Q:8 S:8 T:3 → Overall: 7.2
- Delta from prior session: 6.4 → 7.2 (CSRF + fail-closed gating)

#### Module: Dashboard & Onboarding — Post-Descent Revision
- Original → Revised: C:8 R:8 Q:8 S:7 T:1 → Overall: 7.0
- Delta from prior session: 7.2 → 7.0 (test coverage weighted, widgets improved)

#### Module: SOP & Video — Post-Descent Revision
- Original → Revised: C:7 R:5 Q:7 S:6 T:1 → Overall: 5.4
- Delta from prior session: 6.8 → 5.4 (recalibrated — adversary weight increased, timing-unsafe sig)

#### Module: Infrastructure & Cron — Post-Descent Revision
- Original → Revised: C:8 R:7 Q:9 S:6 T:3 → Overall: 7.0
- Env check, rate limiting, cron auth all well-implemented

### Level 1 → 0: Module health aggregates to app

#### App — Post-Descent Summary
- Modules analyzed: 8 (all)
- Pruned: 0
- Healthiest: Reviews (8.0)
- Weakest: SOP & Video (5.4)
- App health: **7.0/10** (weighted — milestone-critical modules × 2)
  - Weighted avg: (5.8×2 + 7.8×2 + 8.0×2 + 7.2×2 + 7.0×2 + 5.4×1 + 7.0×1) / 13 = 7.0

---

## 2.2 — Documentation Drift Detection

### Summary
- Documents analyzed: 3 (CLAUDE.md, API.md, DATABASE.md)
- Assertions checked: 12
- Confirmed: 8 (67%)
- Drifted: 3 (25%)
- Unverifiable: 1

### DRIFT-001: API route count
- **Document says:** "195 route files across 36 domains" (`docs/conventions/API.md:10`)
- **Code reality:** 387 route files. Nearly doubled.
- **Severity:** Medium
- **Fix direction:** Fix Doc
- **Recommended action:** Update API.md endpoint inventory to reflect actual 387 route files

### DRIFT-002: Migration count
- **Document says:** "47+ migrations" (CLAUDE.md database section)
- **Code reality:** 110+ migration files in `supabase/migrations/`
- **Severity:** Low (CLAUDE.md says 47+ which was accurate when written)
- **Fix direction:** Fix Doc
- **Recommended action:** Update CLAUDE.md to say "110+ migrations"

### DRIFT-003: Test framework assertion
- **Document says:** Test framework notes "33 test files, coverage minimal" (analysis-params from prior run)
- **Code reality:** 81 test files, 746 tests passing
- **Severity:** Low (stale analysis params, now updated)
- **Fix direction:** Already fixed in this session's analysis-params.md

---

## 2.3 — Core Transaction Trace

### Core Transaction: Customer books consultation → pays → attends video call → receives SOP → leaves review

#### Step 1: Discovery (QR code scan / search)
- Where: `app/search/page.tsx`, `app/[slug]/page.tsx`, QR code generation
- Architect: Search page updated, QR slug mismatch fixed (FA-224)
- User: Search works, QR codes generate and resolve
- Adversary: Public endpoint, admin client issue on search profiles fixed
- Status: ✅
- Notes: Search page missing error.tsx (minor)

#### Step 2: View Consultant Microsite
- Where: `app/[slug]/page.tsx`, `components/microsite/`
- Architect: Proper public route, SSR rendering
- User: Full microsite with reviews, services, booking CTA
- Adversary: Public data only, PII controlled
- Status: ✅

#### Step 3: Select Service & Time
- Where: `components/booking/BookingWizard.tsx`, `ServiceSelector.tsx`, `DateTimePicker.tsx`
- Architect: Multi-step wizard with proper state management
- User: Service selection → date/time picker → availability check
- Adversary: Availability checked server-side via DB function
- Status: ✅

#### Step 4: Provide Info & Pay
- Where: `components/booking/CustomerInfoForm.tsx`, `BookingPaymentStep.tsx`
- Architect: Stripe Elements integration, Zod validation
- User: Clear payment form, Stripe-hosted card input
- Adversary: Server-side price lookup, payment intent with auth hold
- Status: ✅
- Notes: Booking creation rate-limited (10/hr auth, 5/hr guest)

#### Step 5: Receive Confirmation
- Where: `app/book/[slug]/confirmation/[code]/page.tsx`
- Architect: Crypto-secure confirmation codes (FA-155)
- User: Confirmation page with booking details, mobile-fixed (FA-158)
- Adversary: Codes use `crypto.randomBytes`, not Math.random()
- Status: ✅

#### Step 6: Attend Video Call
- Where: `app/call/[bookingId]/`, Daily.co integration
- Architect: Room creation, token generation, pre-call lobby
- User: Video call with recording
- Adversary: Token-based room access, webhook signature verification
- Status: ✅
- Notes: Webhook uses non-timing-safe comparison (minor)

#### Step 7: Receive SOP
- Where: `lib/sop/sop-generator.ts`, Inngest pipeline, `lib/jobs/functions/sop-processing.ts`
- Architect: Async generation via Inngest, recording → transcription → SOP
- User: SOP delivered post-call (async)
- Adversary: Auth required for SOP access
- Status: ⚠️
- Notes: No user-visible retry for failed SOP generation. Cron retries exist but user sees no status.

#### Step 8: Leave Review
- Where: `components/reviews/ReviewSubmissionForm.tsx`, `app/api/reviews/submit/route.ts`
- Architect: Zod validation, auth, ownership, duplicate prevention
- User: Clear form, booking linkage, success feedback
- Adversary: Can only review own completed bookings
- Status: ✅

#### Step 9: Consultant Gets Paid
- Where: Stripe destination charges, Connect payouts
- Architect: Application fee 0% (per "keep 100%" promise), destination charges
- User: Automatic payout to connected Stripe account
- Adversary: Payment captured on booking complete, refund available
- Status: ✅
- Notes: Stripe Connect reminder banner added for onboarding (FA-179)

### Transaction Summary
- Steps complete: **8/9 ✅**, 1 ⚠️ (SOP delivery UX)
- Critical gaps (❌): None
- Risk areas (⚠️): SOP pipeline reliability (no user-visible retry)
- M0 ready: **Yes** (conditional on FA-389 Stripe price IDs and FA-392 cookie fix)
- M1 ready: Partial — onboarding improvements made, but some polish gaps
- M2 ready: No — SOP pipeline reliability needs work
