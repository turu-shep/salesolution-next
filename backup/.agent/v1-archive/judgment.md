# Field Advisor — Judgment (Triple Validation)
## Session: 2026-03-26 (Run 3)

---

### Finding: F1 — TOCTOU Race in Booking Creation
- Source: Level 3, `/app/api/bookings/route.ts` L93-116
- Check 1 (multi-level): PASS — visible at L1 (robustness 6) and L3 (function analysis)
- Check 2 (milestone): PASS (Milestone 2 — concurrent usage)
- Check 3 (effort/impact): PASS — high impact (double booking), medium effort (DB constraint or transaction)
- **Verdict: P1** (not P0 because single-user demo works fine; becomes critical at M2)

### Finding: F2 — State Machine Not Enforced in Capture
- Source: Level 3, `/app/api/bookings/[id]/capture/route.ts`
- Check 1 (multi-level): PASS — L2 component analysis + L3 function analysis
- Check 2 (milestone): PASS (Milestone 2 — payment integrity)
- Check 3 (effort/impact): PASS — low effort (import + 2 lines), medium impact (state drift)
- **Verdict: P1**

### Finding: F3 — Payment-Intent Email-Only Auth
- Source: Level 3, `/app/api/bookings/payment-intent/route.ts`
- Check 1 (multi-level): FAIL — single-level finding only
- Check 2 (milestone): PASS (Milestone 2)
- Check 3 (effort/impact): Low impact (by design for unauth customers), medium effort
- **Verdict: P2** (design choice, not a bug — mark for review)

### Finding: F4 — Confirmation PII Leak
- Source: Level 3, `/app/api/bookings/confirmation/[code]/route.ts`
- Check 1 (multi-level): FAIL — single-level finding
- Check 2 (milestone): PASS (Milestone 2 — data protection)
- Check 3 (effort/impact): Medium impact (if codes guessable), low effort to restrict fields
- **Verdict: P2** (needs manual review of confirmation code entropy)

### Finding: F5 — Dead File Upload UI
- Source: Level 2, `/components/booking/BookingForm.tsx` L150-164
- Check 1 (multi-level): FAIL — single-level
- Check 2 (milestone): FAIL — not blocking any milestone
- Check 3 (effort/impact): Low impact
- **Verdict: P3**

### Finding: F6 — Capture Amount Not Validated
- Source: Level 3, `/app/api/bookings/[id]/capture/route.ts` L78
- Check 1 (multi-level): PASS — related to F2 (state machine gap)
- Check 2 (milestone): PASS (Milestone 2 — payment integrity)
- Check 3 (effort/impact): Medium impact (Stripe catches over-capture, but not zero/negative), XS effort
- **Verdict: P1**

### Finding: F7 — Booking GET uses select('*')
- Source: Level 2, `/app/api/bookings/route.ts`
- Check 1 (multi-level): PASS — cross-cut pattern #4
- Check 2 (milestone): FAIL — convention, not functional
- Check 3 (effort/impact): Low impact, XS effort
- **Verdict: P3**

### Finding: F8 — canPerformAction() Stub
- Source: Level 3, `/lib/subscription/plans.ts` L841-844
- Check 1 (multi-level): FAIL — single-level, latent risk
- Check 2 (milestone): FAIL — not called in production
- Check 3 (effort/impact): Low impact (not called), XS effort to fix
- **Verdict: P2** (remove or implement before it becomes a risk)

### Finding: F9 — Enforcement Fail-Open on Null
- Source: Level 3, `/lib/subscription/enforcement.ts` L230-245
- Check 1 (multi-level): PASS — L1 (robustness 6), L3 (function), cross-cut pattern #3
- Check 2 (milestone): PASS (Milestone 2 — billing integrity)
- Check 3 (effort/impact): High impact (free users get paid features), XS effort
- **Verdict: P0**

### Finding: F10 — Webhook Signature Skip in Dev
- Source: Level 3, `/app/api/webhooks/stripe/route.ts` L19-43
- Check 1 (multi-level): FAIL — single-level
- Check 2 (milestone): PASS (Milestone 2)
- Check 3 (effort/impact): Low impact (dev only), XS effort
- **Verdict: P2**

### Finding: F11 — Any Org Member Can Checkout
- Source: Level 3, `/app/api/subscription/checkout/route.ts` L55
- Check 1 (multi-level): FAIL — single-level
- Check 2 (milestone): PASS (Milestone 2 — billing)
- Check 3 (effort/impact): Medium impact, S effort
- **Verdict: P2**

### Finding: F12 — Billing Failure Email Stub
- Source: Level 3, `/app/api/subscription/billing/handle-failure/route.ts` L370
- Check 1 (multi-level): PASS — cross-cut pattern #5 (stubs)
- Check 2 (milestone): PASS (Milestone 2 — payment failure handling)
- Check 3 (effort/impact): Medium impact (users not notified of payment failures), M effort
- **Verdict: P1**

### Finding: F13 — Password Reset Weaker Than Register
- Source: Level 3, `/app/api/auth/reset-password/confirm/route.ts` L9
- Check 1 (multi-level): PASS — cross-cut pattern #7
- Check 2 (milestone): PASS (Milestone 2 — security)
- Check 3 (effort/impact): Medium impact (password weakening), XS effort
- **Verdict: P1**

### Finding: F14 — In-Memory Rate Limiting
- Source: Level 3, auth routes
- Check 1 (multi-level): FAIL — single-level, acknowledged
- Check 2 (milestone): PASS (Milestone 3 — multi-instance)
- Check 3 (effort/impact): Low impact for now (single instance), L effort (Redis/external store)
- **Verdict: P3**

---

## Summary
- P0: 1 (F9 — enforcement fail-open)
- P1: 4 (F1 TOCTOU, F2 capture state machine, F6 capture validation, F12 billing email, F13 password reset)
- P2: 4 (F3 payment-intent auth, F4 PII leak, F8 stub, F10 webhook dev, F11 checkout role)
- P3: 3 (F5 dead upload, F7 select(*), F14 rate limiting)
- Discarded: 0
