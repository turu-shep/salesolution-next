# Field Advisor — Unified Priority Execution Order
**Generated:** 2026-03-27
**Total incomplete tasks:** 41
**Ordered by:** Business value, dependencies, milestone urgency

---

## Tier 1: M0 Blockers — Ship Before Launch (3 tasks, ~10-14h)
*These block the core transaction loop. No launch without them.*

| # | SAL | Title | Effort | Completion | Why First |
|---|-----|-------|--------|------------|-----------|
| 1 | **FA-70** | Review submission API + UI | L (4-8h) | 30% | **#1 blocker.** Unlocks FA-168, FA-72, FA-69. Entire display ecosystem is waiting. |
| 2 | **FA-17** | Forgot password UI pages | S (1-2h) | 75% | **#2 blocker.** Login links to 404. Every locked-out user = permanent churn. API exists, just needs 2 pages. |
| 3 | **FA-168** | Post-call email triggers (review request + receipt) | M (2-4h) | 0% | **#3 blocker.** Without email, review submission rate ≈ 0%. Depends on FA-70. |

---

## Tier 2: Pre-Launch Security & Revenue (10 tasks, ~5-8h)
*Ship these before any real users touch the platform.*

| # | SAL | Title | Effort | Completion | Why Now |
|---|-----|-------|--------|------------|---------|
| 4 | **FA-188** | Search API: replace admin client with server client | XS (<30m) | 0% | Public endpoint bypasses all RLS. One-line fix. |
| 5 | **FA-100** | Fix referral tracking (signup ignores `ref=` param) | S (30m-2h) | 50% | Growth engine is inert. 30-min fix to capture `ref=` activates everything. |
| 6 | **FA-96** | Stop leaking error.message in cancel route | XS (<30m) | 0% | Exposes Stripe/DB internals to client. One-line fix. |
| 7 | **FA-239** | Add auth check to checkout success endpoint | XS (<30m) | 0% | Unauthenticated endpoint processes subscriptions. |
| 8 | **FA-233** | Billing page: alert() → toast, remove console.logs | XS (<30m) | 0% | Subscribers see browser `alert()` on their billing page. |
| 9 | **FA-267** | Dashboard router: add timeout/error fallback | XS (<30m) | 0% | Infinite spinner if auth is slow. |
| 10 | **FA-103** | Landing page: replace fake testimonials, fix CTA | S (30m-2h) | 0% | Fabricated names + broken "Talk to Sales" button. First impression killer. |
| 11 | **FA-133** | Bookings GET: add role param for multi-role users | S (30m-2h) | 0% | Dual-role users can't see customer bookings. |
| 12 | **FA-91** | Verify transfer tracking in earnings dashboard | S (30m-2h) | 0% | Consultants may see $0 earnings even after payouts. |
| 13 | **FA-159** | Stripe Checkout E2E verification | M (2-4h) | 0% | Subscription flow never verified end-to-end. |

---

## Tier 3: Almost-Done Quick Wins (4 tasks, ~3-5h)
*High completion %, small effort to close out. Advances M1.*

| # | SAL | Title | Effort | Completion | Why Now |
|---|-----|-------|--------|------------|---------|
| 14 | **FA-18** | Team invitations — close remaining gaps | S (1-2h) | 90% | End-to-end works. Missing revoke/resend/list. Quick M1 win. |
| 15 | **FA-6** | Onboarding funnels — add step persistence | S (1-2h) | 80% | All 4 flows work but state lost on refresh. |
| 16 | **FA-69** | Reviews & Ratings (parent) — close after FA-70 ships | XS (<30m) | 45%→85% | Once FA-70 ships, just verify display + update status. |
| 17 | **FA-72** | Rating sync to profile | FREE | 70% | **Zero effort.** DB trigger auto-activates when FA-70 ships. Just verify and close. |

---

## Tier 4: M1 Security & Polish (5 tasks, ~3-5h)

| # | SAL | Title | Effort | Completion | Why |
|---|-----|-------|--------|------------|-----|
| 18 | **FA-165** | Wire login through API for rate limiting | S (30m-2h) | 0% | Login has zero brute-force protection. Dead API code. |
| 19 | **FA-156** | Guard role selection page (auth check) | XS (<30m) | 0% | Unauthenticated users can reach role selection. |
| 20 | **FA-124** | Await headers() for Next.js 15 | XS (<30m) | 0% | Stripe webhook will silently break on upgrade. |
| 21 | **FA-278** | ESLint no-console + cleanup 25+ logs | S (30m-2h) | 0% | Production DevTools leak implementation details. |
| 22 | **FA-283** | Onboarding progress indicators (contractor/shop) | S (30m-2h) | 0% | Consultant has progress bar, others don't. |

---

## Tier 5: M1 Code Quality (9 tasks, ~8-12h)

| # | SAL | Title | Effort | Why |
|---|-----|-------|--------|-----|
| 23 | **FA-176** | Replace select('*') in booking routes | XS | Convention violation, over-fetching |
| 24 | **FA-212** | Remove PII from public consultant API | XS | Email + phone exposed without auth |
| 25 | **FA-226** | Fix hardcoded verified: true in search | XS | All consultants falsely show verified badge |
| 26 | **FA-221** | Fix plans comparison modal (empty array) | XS | "Compare Plans" shows empty modal |
| 27 | **FA-183** | Regenerate Supabase types, fix 30+ `as any` | M | Type safety across codebase |
| 28 | **FA-231** | Docs: update component count 29→32 | XS | Documentation drift |
| 29 | **FA-237** | Docs: update API endpoint inventory | S | Documentation drift |
| 30 | **FA-282** | Add Upstash Redis rate limiting | M | No production rate limiting anywhere |
| 31 | **FA-295** | SOP model version → env config | XS | Hardcoded claude-3-5-sonnet |

---

## Tier 6: M3 Network Effects (7 tasks — defer until M1 complete)

| # | SAL | Title | Completion | Blocked By |
|---|-----|-------|------------|------------|
| 32 | **FA-102** | Referral program setup | 55% | FA-100 (ref= bug) |
| 33 | **FA-86** | Invite contractor UI (shop-specific) | 50% | FA-95 |
| 34 | **FA-89** | Shop-initiated contractor invitations | 55% | FA-95 |
| 35 | **FA-95** | Co-branded sign-up page + pairings table | 0% | — (foundation) |
| 36 | **FA-98** | Contractor invitation acceptance flow | 20% | FA-95 |
| 37 | **FA-93** | Auto-pairing logic | 0% | FA-95 |
| 38 | **FA-92** | Contractor-shop pairing (parent epic) | 0% | FA-95 |

---

## Tier 7: M4 Scale & Polish (3 tasks — far future)

| # | SAL | Title | Blocked By |
|---|-----|-------|------------|
| 39 | **FA-94** | Contractor shop list | FA-95, FA-93 |
| 40 | **FA-101** | Link generation & tracking | FA-102 |
| 41 | **FA-107** | Invitation tracking dashboard | FA-86, FA-89 |

---

## Time-to-Milestone Estimate

| Milestone | Tasks | Effort | Target |
|-----------|-------|--------|--------|
| **M0 (Launch)** | Tiers 1-2 (13 tasks) | ~15-22h | 2026-04-15 |
| **M1 (Self-Serve)** | Tiers 3-5 (18 tasks) | ~14-22h | 2026-05-01 |
| **M3 (Network)** | Tier 6 (7 tasks) | ~20-30h | 2026-05-15+ |
| **M4 (Scale)** | Tier 7 (3 tasks) | ~8-12h | TBD |

---

## The 80/20 — Maximum Impact in Minimum Time

If you can only do **5 things** before launch:
1. **FA-70** — Review submission (completes core loop)
2. **FA-17** — Forgot password UI (stops user lockout)
3. **FA-168** — Post-call emails (triggers reviews)
4. **FA-188** — Search admin client fix (closes security hole)
5. **FA-100** — Referral `ref=` capture (activates growth engine)

These 5 tasks, totaling ~8-14h, take M0 readiness from 70% to ~90%.
