# Field Advisor Health Scorecard

## Last updated: 2026-03-26 (Run 3, Post FA-229→141)
## Overall app health: 6.2/10

| Module | Complete | Robust | Quality | Security | Tests | Overall | Trend |
|--------|----------|--------|---------|----------|-------|---------|-------|
| Auth & Roles | 8/10 | 7/10 | 8/10 | 7/10 | 1/10 | 6.2/10 | ↑ |
| Booking & Scheduling | 9/10 | 6/10 | 7/10 | 6/10 | 3/10 | 6.2/10 | ↑ |
| Subscription & Billing | 8/10 | 6/10 | 5/10 | 6/10 | 2/10 | 5.4/10 | ↑ |
| Dashboard & Analytics | 8/10 | 7/10 | 6/10 | 7/10 | 0/10 | 5.6/10 | → |
| Profiles & Microsites | 8/10 | 7/10 | 5/10 | 8/10 | 0/10 | 5.6/10 | → |
| Video Calls | 8/10 | 8/10 | 8/10 | 8/10 | 0/10 | 6.4/10 | → |
| Organizations | 7/10 | 6/10 | 7/10 | 5/10 | 2/10 | 5.4/10 | → |
| SOP & Knowledge | 8/10 | 7/10 | 6/10 | 8/10 | 0/10 | 5.8/10 | → |
| Notifications & Email | 7/10 | 7/10 | 7/10 | 8/10 | 0/10 | 5.8/10 | → |
| Navigation & Routing | 8/10 | 8/10 | 8/10 | 8/10 | 0/10 | 6.4/10 | ↑ |
| Settings & Config | 7/10 | 7/10 | 6/10 | 8/10 | 0/10 | 5.6/10 | → |
| Search, QR & Sharing | 7/10 | 7/10 | 8/10 | 8/10 | 4/10 | 6.8/10 | ↑ |
| Onboarding | 7/10 | 6/10 | 6/10 | 7/10 | 0/10 | 5.2/10 | → |
| State Management | 8/10 | 7/10 | 6/10 | 7/10 | 2/10 | 6.0/10 | → |

**Score improvements credited to FA-229→141:**
- Auth ↑: Tokens removed from login (136), password reset aligned (this session)
- Booking ↑: Rescheduling added (141), capture amount validated (this session), completeness 8→9
- Subscription ↑: Enforcement fail-open fixed (this session), upgrade/downgrade confirmed through Stripe
- Search ↑: PostgREST sanitization (137), sanitize-search.test.ts added
- Navigation ↑: Middleware confirmed HMAC-secured, API routes excluded by design

**Type safety improvements (FA-268):**
- 35 files refactored from `any` to proper types across lib/, api/, auth/, subscription/
- Quality scores stable (already counted in Run 2 assessment)

## Milestone Readiness
- Milestone 1 (Demo): **85%** — blocking: nothing critical, minor polish items
- Milestone 2 (Payment): **60%** — blocking: TOCTOU race (P1-4), billing failure email (P1-3), provider payment notification
- Milestone 3 (Beta): **35%** — blocking: test coverage, rate limiting, concurrent usage, onboarding polish

## Booking Lifecycle: 6/7 steps complete

## History
| Date | Overall | Weakest | Booking | M1% | M2% | M3% | Tasks generated | Bugs fixed |
|------|---------|---------|---------|-----|-----|-----|-----------------|------------|
| 2026-03-26 (Run 1) | 4.6/10 | Booking (3.0) | 3/7 | — | — | — | 21 | 4 |
| 2026-03-26 (Run 2) | 5.8/10 | Orgs (4.4) | 5/7 | 70% | 60% | 80% | 25 | 4 |
| 2026-03-26 (Run 3) | 6.2/10 | Orgs/Sub (5.4) | 6/7 | 85% | 60% | 35% | 12 | 3 |
