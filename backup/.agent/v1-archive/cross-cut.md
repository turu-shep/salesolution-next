# Field Advisor — Cross-Cut Analysis
## Session: 2026-03-26 (Run 3)

---

## Cross-Cut Patterns

### Pattern 1: Zero Test Coverage (systemic)
- Instances: 10/14 modules have 0 test files
- Total test files: ~11 across entire codebase
- Systemic root cause: Jest config was broken until recently (FA-298 fixed vacuous tests). No test-writing culture established yet.
- Fix: Establish CI gate requiring tests for new PRs. Write critical path tests first (booking, auth, payment).
- Effort: L (ongoing)

### Pattern 2: Large Components (>300 lines)
- Instances: 60+ files across all modules
- Worst offenders: PaymentMethodCard (687), LayoutEditor (681), SubscriptionSettings (673), TeamManagement (635), PlanComparisonModal (631)
- Root cause: Components grew organically. No splitting convention enforced.
- Fix: Not urgent — these work. Flag for refactor when touching them.
- Effort: XL (if done now), free (if done incrementally)

### Pattern 3: Enforcement Fail-Open Paths
- Instances: 1 remaining (down from 3 in Run 2)
  1. `enforcement.ts:230-245` — null planFeature returns enforcementLevel: 'none'
- Prior: check-access route was fixed to fail-closed. Service layer still has the gap.
- Fix: Return `enforcementLevel: 'hard_limit'` when planFeature is null
- Effort: XS

### Pattern 4: API Convention Violations (select('*'))
- Instances: 2 remaining
  1. `/app/api/bookings/route.ts` GET handler
  2. `/app/api/subscription/billing/handle-failure/route.ts` line 43
- Root cause: Convention not enforced by linter
- Fix: Replace with explicit column lists
- Effort: XS per instance

### Pattern 5: Stubs and Dead Code
- Instances: 3
  1. `canPerformAction()` stub in plans.ts (always returns true)
  2. Billing failure email stub in handle-failure route
  3. Dead file upload UI in BookingForm.tsx
- Fix: Remove stubs or implement them. Dead code creates confusion.
- Effort: XS-S per instance

### Pattern 6: Inconsistent State Machine Usage
- Instances: 1 (capture route skips assertValidTransition)
- All other booking mutation routes use it correctly
- Fix: Import and use assertValidTransition in capture route
- Effort: XS

### Pattern 7: Password Validation Inconsistency
- Instances: 1
  1. Register requires special char, reset-password doesn't
- Fix: Align reset-password validation with register
- Effort: XS

---

## Cross-Module Dependencies

### Booking depends on Subscription (enforcement)
- How: Booking flow should check subscription limits before allowing bookings
- Risk: If enforcement service returns wrong answer (fail-open), bookings bypass limits
- Fix: Enforce fail-closed default in enforcement service (Pattern 3)

### Webhook handler depends on Booking + Subscription state machines
- How: payment_intent.succeeded updates booking status + subscription status
- Risk: If booking-transitions.ts is incomplete, webhook handler can't transition
- Current state: Working correctly — webhook uses isValidTransition()

---

## Cross-Cut Summary
- Total patterns detected: 7
- Patterns with 5+ instances: 2 (zero test coverage, large components)
- Most dangerous pattern: Enforcement fail-open (#3) — feature gating bypass
- Most improved since Run 2: Debug endpoints removed, Stripe bypass was false alarm, price validation added
