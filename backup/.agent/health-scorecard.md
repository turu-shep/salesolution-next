# Field Advisor Health Scorecard
## Updated: 2026-04-02 | Overall: 7.3/10

| Module | Compl | Robust | Quality | Security | Tests | Overall | ARCH | USER | ADV | Trend |
|--------|-------|--------|---------|----------|-------|---------|------|------|-----|-------|
| Reviews | 9 | 8 | 9 | 7 | 5 | 8.0 | 9 | 8 | 7 | ↑ |
| Booking & Payment | 9 | 8 | 8 | 7 | 5 | 7.8 | 8 | 8 | 7 | → |
| QR / Microsite | 9 | 8 | 9 | 8 | 2 | 8.2 | 9 | 8 | 8 | → |
| Subscription & Billing | 8 | 7 | 8 | 8 | 3 | 7.2 | 8 | 7 | 8 | ↑ |
| Dashboard & Onboarding | 8 | 8 | 8 | 7 | 1 | 7.0 | 8 | 8 | 7 | → |
| Infrastructure & Cron | 8 | 7 | 9 | 7 | 3 | 7.0 | 9 | 7 | 7 | ↑ |
| Auth & Middleware | 8 | 7 | 8 | 5 | 6 | 6.6 | 8 | 7 | 5 | ↑* |
| Settings | 7 | 7 | 7 | 6 | 1 | 6.2 | 7 | 7 | 6 | → |
| SOP & Video | 7 | 5 | 7 | 6 | 1 | 5.4 | 7 | 5 | 6 | ↓ |

\* Auth security score improved by P0-001 fix (unsigned cookie → signed cookie)

## Core Transaction: 8/9 steps ✅ (1 ⚠️ SOP delivery UX)
## Doc Drift: 4 drifted / 15 checked (73%)
## Milestones: M0 92% | M1 75% | M2 50%

## History
| Date | Overall | Weakest | Transaction | Drift% | M0 | M1 | M2 | Tasks | Fixes | Mode |
|------|---------|---------|-------------|--------|----|----|----|----- |-------|------|
| 2026-03-26 (V1 Run 1) | 4.6/10 | — | 3/7 | — | — | — | — | 22 | 4 | Full V1 |
| 2026-03-26 (V1 Run 2) | 5.8/10 | — | 5/7 | — | — | — | — | 19 | 4 | Full V1 |
| 2026-03-26 (V1 Run 3) | 6.2/10 | — | 6/7 | — | — | — | — | 12 | 3 | Full V1 |
| 2026-03-27 (V2.0) | 5.2/10 | Reviews (0.8) | 6/9 | 83% | 70% | 55% | 60% | 16 | 3 | Full V2 |
| 2026-03-30 (V2.0 R2) | 6.8/10 | Middleware (5.4) | 8/8 | — | 85% | 60% | 45% | 28 | 0 | Full V2 |
| 2026-04-02 (V2.0 R3) | 7.3/10 | SOP/Video (5.4) | 8/9 | 73% | 92% | 75% | 50% | 12 | 5 | Full V2 |

## Score Change Analysis (2026-03-30 → 2026-04-02)
- **Overall: 6.8 → 7.3 (+0.5)** — steady improvement, security fixes drove gains
- **Auth: 6.0 → 6.6 (+0.6)** — P0 cookie fix raises security, CSRF partial but improving
- **Subscription: 6.4 → 7.2 (+0.8)** — CSRF on all sub routes, fail-closed gating confirmed
- **Infrastructure: new 7.0** — env check, rate limiting, cron auth all verified strong
- **SOP/Video: 6.8 → 5.4 (-1.4)** — recalibrated with higher adversary weight, timing-unsafe webhook noted (now fixed)
- **Weakest module shifted:** Middleware (5.4) → SOP/Video (5.4) — auth improved, SOP needs pipeline reliability work

## What Drove The Improvement
1. **P0 auth callback cookie fix** — users no longer locked out after signup
2. **Upstash promoted to production** — rate limiting guaranteed in production
3. **CSP tests fixed** — 52 tests no longer failing, CI health restored
4. **Daily webhook timing-safe** — signature verification hardened
5. **Search error page** — all 33/33 route groups now have error boundaries
6. **Major prior work confirmed:** CSRF on booking+subscription, crypto confirmation codes, webhook dedup, error/loading pages on 32 route groups, Stripe Connect reminders, onboarding tour fixes
