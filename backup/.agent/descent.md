# Descent Analysis — 2026-03-27 (V2.0 First Run)

**Mode:** Full Cycle | **Personas:** Architect (0.8), User (1.8), Adversary (1.3)

---

## Level 0: App Shell

### Entry Points
- 75+ pages across 20+ route groups
- 195+ API endpoints across 30+ domains
- 1 middleware chain (password → auth → role → subscription)
- 1 cron job (booking reminders)
- Webhooks: Stripe, Daily.co, Inngest

### Routing / Navigation
- Route groups: (auth), admin, book, call, dashboard, demo, embed, invite, onboarding, pro, profiles, settings, sop
- Auth-protected: /dashboard/*, /onboarding/*, /role-selection
- Role-gated: /dashboard/{consultant|contractor|customer|shop}, /onboarding/{role}
- Subscription-gated: /consultant-organizations/create, /analytics/advanced, /video-calls, /storage/upload, /shop/shortlist
- Public: /, /auth/*, /pro/*, /book/*, /profiles/*, /privacy, /terms

### Global Infrastructure
- Root layout: ReduxProvider → PageTransitionProvider → AuthProvider → {children} + Toaster
- Middleware: 222 lines, 5-layer check (password HMAC → auth → email verified → role → subscription)
- Global error boundary: RouteErrorBoundary component — covers root, auth, dashboard, admin, onboarding, profiles, settings
- Global loading: Loader2 spinner (root level)
- Auth flow: Supabase Auth → password cookie gate → email verify → role selection → onboarding → dashboard

### Data Layer
- Database: Supabase PostgreSQL + RLS, 47+ migrations, 3 clients (server/browser/admin)
- External APIs: Stripe (payments/subscriptions), Daily.co (video), Resend (email), Anthropic/OpenAI (AI), Deepgram (speech)
- State management: Redux Toolkit (4 slices: auth, user, subscription, navigation) + React Context (AuthProvider, DashboardContext)

### Architect Pass — Level 0
- [ARCH-001] Root layout is server component wrapping client providers — correct Next.js pattern
- [ARCH-002] Middleware matcher excludes API routes from password protection — intentional, API routes handle own auth
- [ARCH-003] Middleware makes 3 DB queries per protected request (getUser, profile, roles) — performance concern at scale
- [ARCH-004] PageTransitionProvider wraps entire app including auth pages — unnecessary overhead for static pages
- [ARCH-005] No global Suspense boundary for streaming — root loading.tsx exists but layout doesn't use Suspense

### User Pass — Level 0
- [USER-001] Password protection gate blocks ALL routes including public ones — intentional for beta but will confuse launch users
- [USER-002] Root loading.tsx shows generic spinner with no context — user doesn't know what's loading
- [USER-003] Not-found page is well-designed with actionable buttons — good
- [USER-004] No global offline handling beyond PWA fallback page
- [USER-005] Robots noindex/nofollow on all pages — correct for beta, must remove at launch

### Adversary Pass — Level 0
- [ADV-001] Middleware subscription check catches errors and allows access (fail-open) — line 85-88 of subscriptionMiddleware.ts
- [ADV-002] Middleware role check uses exact path match on ROLE_ROUTES — sub-paths under /dashboard/consultant/bookings are not role-checked by middleware (handled by auth context instead)
- [ADV-003] API routes excluded from middleware matcher — each must self-authenticate (verified across core routes)
- [ADV-004] Password session uses HMAC-signed cookie with 24h duration — secure

### Combined Scores — Level 0
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Route completeness | 7 | +0 | -1 (password gate) | +0 | 6 |
| Global error coverage | 8 | +0 | +0 | +0 | 8 |
| Auth integrity | 7 | +0 | +0 | -1 (fail-open sub) | 6 |
| Infrastructure health | 7 | -1 (3 DB queries) | +0 | +0 | 6 |

**Descent decisions:**
- Auth module → DESCEND (fail-open subscription, login bypass)
- Booking module → DESCEND (core transaction)
- Subscription module → DESCEND (fail-open, checkout success no auth)
- Dashboard module → DESCEND (UX gaps, customer dashboard)
- Profile/Microsite module → DESCEND (search admin client, PII exposure)
- Onboarding module → DESCEND (forgot password missing, completeness gaps)
- Video module → CONDITIONAL DESCEND (call complete page errors)
- SOP module → PRUNE (works, not M0 critical)
- Notifications module → PRUNE (works for current scope)
- Settings module → CONDITIONAL DESCEND (billing alert() calls)

---

## Level 1: Module Descent

### Module: Booking & Payments (DESCEND)

#### Boundary
- UI: BookingWizard, BookingForm, BookingPaymentStep, BookingCalendar, BookingConfirmation, TimeSlotGrid, DateTimePicker, ServiceSelector, UpcomingBookingsList, RescheduleModal
- Logic: /lib/business-rules/booking-transitions.ts, /lib/stripe/booking-payments.ts, /lib/api/bookings.ts
- Data: /app/api/bookings/*, /app/api/bookings/[id]/* (14 endpoints)
- Types: /types/index.ts (Booking interface)
- Tests: /lib/business-rules/booking-transitions.test.ts
- Docs: docs/modules/booking-scheduling.md

#### Data Flow
Customer selects service → picks date/time → enters info → creates booking (POST /api/bookings) → creates PaymentIntent → confirms card → payment captured on completion → video room created → call → complete → SOP generated

#### Milestone Relevance
- M0: **Critical** — this IS the core transaction
- M1: Relevant (booking from self-serve onboarding)
- M2: Relevant (SOP generation post-booking)

#### Architect Pass
- [ARCH-010] Booking POST allows unauthenticated creation — correct for public microsites
- [ARCH-011] Server-side price validation in payment-intent — good pattern
- [ARCH-012] Booking state machine in booking-transitions.ts — clean, well-tested
- [ARCH-013] GET handler has dual-role ambiguity (consultant bookings overshadow customer bookings)
- [ARCH-014] `select('*')` in booking POST line 136 and room POST line 153

#### User Pass
- [USER-010] BookingWizard has 5-step flow with progress bar — good
- [USER-011] BookingPaymentStep has loading, error, processing states + trust signals — excellent
- [USER-012] Price mismatch between display and charge would show cryptic 409 error
- [USER-013] No booking cancellation UI from customer side (only API exists)
- [USER-014] Post-call: no receipt email, no review request email (TODO in complete/route.ts lines 190-193)

#### Adversary Pass
- [ADV-010] Confirmation code as bearer token — need to verify entropy
- [ADV-011] Double-booking defense: RPC + unique index — solid
- [ADV-012] Payment amount server-validated with epsilon tolerance — solid
- [ADV-013] Capture restricted to consultant role — solid
- [ADV-014] No rate limiting on booking creation — DoS/spam risk

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 6 | +0 | -2 (no review, no receipts) | +0 | 4 |
| Robustness | 7 | +0 | -1 (price mismatch UX) | +0 | 6 |
| Code Quality | 7 | -1 (select *) | +0 | +0 | 6 |
| Security | 8 | +0 | +0 | -1 (no rate limit) | 7 |
| Test Coverage | 3 | -1 | +0 | +0 | 2 |

**Cross-persona flags:** Post-call workflows (USER-014 + ARCH gap) — 2 personas
**Descent:** BookingPaymentStep → PRUNE (well-implemented), complete/route.ts → Level 3, payment-intent → PRUNE

---

### Module: Reviews (DESCEND — M0 Blocker)

#### Boundary
- UI: /components/microsite/ReviewsSection.tsx (display only)
- Logic: /lib/api/reviews.ts, /lib/api/reviewsAggregated.ts
- Data: NO API ROUTE EXISTS for submission
- Tests: None
- Docs: None specific

#### Assessment
**Reviews are the #1 M0 blocker.** The entire submission flow is missing:
- No `/app/api/reviews/` directory
- No review submission endpoint
- ReviewsSection.tsx is display-only with TODO stubs (lines 119-138)
- `handleHelpfulClick` updates local state only — no persistence
- `loadMore` function body is entirely commented out

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 1 | +0 | -2 | +0 | 0 |
| Robustness | 1 | +0 | -1 | +0 | 0 |
| Code Quality | 3 | +0 | +0 | +0 | 3 |
| Security | 5 | +0 | +0 | +0 | 5 |
| Test Coverage | 0 | +0 | +0 | +0 | 0 |

---

### Module: Auth & Onboarding (DESCEND)

#### Boundary
- UI: Login, Signup, VerifyEmail, RoleSelection, 4x Onboarding pages, EmailSignUpForm
- Logic: /lib/auth/context.tsx, /lib/auth/*, /lib/store/slices/authSlice.ts
- Data: /app/api/auth/* (10 endpoints), /app/api/onboarding/* (3 endpoints)
- Tests: /lib/auth/admin.test.ts, /lib/auth/password-cookie.test.ts
- Docs: docs/modules/auth-roles.md

#### Architect Pass
- [ARCH-020] Auth flow: Supabase Auth → password cookie → email verify → role → onboard — well-layered
- [ARCH-021] Login page calls Supabase client directly, bypassing /api/auth/login rate limiting — dead API code
- [ARCH-022] In-memory rate limiting (Map) resets on deploy — Vercel serverless = no persistence
- [ARCH-023] Role selection maps "Contractor Firm" and "Supplier/Store" to consultant baseRole with org type — confusing
- [ARCH-024] Consultant onboarding is 4-5 steps with validation; contractor/shop are simpler single pages — inconsistent complexity

#### User Pass
- [USER-020] **No forgot password UI page.** Login page links to `/forgot-password` which 404s. API routes exist but no UI.
- [USER-021] Email verification page is excellent — auto-polling, cooldown, help section, elapsed timer
- [USER-022] Consultant onboarding has progress bar; contractor and shop have none — inconsistent
- [USER-023] Shop onboarding is one long page — potentially overwhelming vs. step-by-step consultant flow
- [USER-024] Customer onboarding is simple with skip — appropriate
- [USER-025] Hardcoded subscription cost $29 in consultant onboarding (line 615 TODO)

#### Adversary Pass
- [ADV-020] Login bypasses server-side rate limiting — brute force possible via Supabase client
- [ADV-021] Role selection page doesn't guard against unauthenticated access
- [ADV-022] Registration has proper Zod validation + common password check — good
- [ADV-023] In-memory rate limits = no rate limiting on Vercel serverless

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 5 | +0 | -3 (no forgot PW) | +0 | 3 |
| Robustness | 6 | +0 | -1 (onboarding inconsistency) | +0 | 5 |
| Code Quality | 7 | -1 (dead login API) | +0 | +0 | 6 |
| Security | 5 | +0 | +0 | -2 (bypassed rate limits) | 3 |
| Test Coverage | 3 | +0 | +0 | +0 | 3 |

**Cross-persona flags:** Rate limiting bypass (ARCH-021 + ADV-020) — 2 personas
**Cross-persona flags:** No forgot password (USER-020 + functional gap) — blocks M0/M1

---

### Module: Subscription & Billing (DESCEND)

#### Boundary
- UI: 32 components in /components/subscription/
- Logic: /lib/subscription/* (8 files), /lib/stripe/* (9 files), /lib/hooks/useBilling.ts
- Data: /app/api/subscription/* (50+ endpoints)
- Tests: /lib/stripe/checkout-helpers.test.ts, /lib/stripe/webhook-handler.test.ts
- Docs: docs/modules/subscription-billing.md

#### Architect Pass
- [ARCH-030] Subscription enforcement is well-designed — feature access service with grace periods
- [ARCH-031] Dead import in plans.ts (browser client imported but unused)
- [ARCH-032] `(subscription as any)` casts in cancel route — type safety gap

#### User Pass
- [USER-030] Billing page uses browser `alert()` for manual fix flow — unprofessional
- [USER-031] Billing page has 6+ console.log statements in production path
- [USER-032] Trial start/conversion errors are caught but silently swallowed (TODO comments)
- [USER-033] Plans comparison modal receives empty array `plans={[]}`

#### Adversary Pass
- [ADV-030] Checkout success endpoint has NO auth check — anyone with session_id can probe
- [ADV-031] Cancel route leaks `error.message` to client — internal error exposure
- [ADV-032] `user.email!` non-null assertion in Connect create-account
- [ADV-033] No rate limiting on checkout, cancel, or Connect endpoints
- [ADV-034] Subscription middleware catch block allows access on error (fail-open)

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 7 | +0 | -1 (empty plans modal) | +0 | 6 |
| Robustness | 5 | +0 | -2 (alert, silent errors) | +0 | 3 |
| Code Quality | 6 | -1 (dead import, any casts) | +0 | +0 | 5 |
| Security | 5 | +0 | +0 | -2 (no auth checkout success, error leak) | 3 |
| Test Coverage | 4 | +0 | +0 | +0 | 4 |

**Cross-persona flags:** Fail-open on error (ADV-034 + ADV-001) — Adversary, repeated pattern

---

### Module: Dashboard (DESCEND)

#### Boundary
- UI: /app/dashboard/* (12 pages), /components/dashboard/* (54+ files including 40+ widgets)
- Logic: /lib/dashboard/* (8 files)
- Data: Various API endpoints
- Docs: docs/modules/dashboard-analytics.md

#### Architect Pass
- [ARCH-040] Widget system with DashboardContext + drag-and-drop layout — well-architected
- [ARCH-041] Dashboard router (/dashboard/page.tsx) calls refreshUser() with no timeout

#### User Pass
- [USER-040] **Customer dashboard has ZERO defensive states** — no loading, no error, no onboarding check
- [USER-041] Dashboard router stuck on spinner if refreshUser fails — no timeout/error fallback
- [USER-042] Consultant/contractor/shop dashboards all have loading + onboarding check — inconsistent that customer doesn't
- [USER-043] 3 console.log statements in dashboard router

#### Adversary Pass
- [ADV-040] Dashboard pages rely on AuthProvider for access control — middleware only checks /dashboard root, not sub-paths

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 7 | +0 | -2 (customer dashboard) | +0 | 5 |
| Robustness | 5 | +0 | -2 (no timeout, missing states) | +0 | 3 |
| Code Quality | 7 | +0 | -1 (console.logs) | +0 | 6 |
| Security | 7 | +0 | +0 | +0 | 7 |
| Test Coverage | 1 | +0 | +0 | +0 | 1 |

**Cross-persona flags:** Customer dashboard missing states (USER-040 + functional gap) — affects M0

---

### Module: Profiles & Microsites (DESCEND)

#### Boundary
- UI: /components/microsite/* (48 files), /app/pro/[...slug]/page.tsx
- Logic: /lib/profile/*, /lib/search/*
- Data: /app/api/profiles/*, /app/api/search/*, /app/api/consultants/*
- Docs: docs/modules/profiles-microsites.md

#### Architect Pass
- [ARCH-050] Catch-all slug route (/pro/[...slug]) with proper redirect handling — good
- [ARCH-051] Profile type casting `profileAny = profile as any` throughout microsite — types lag behind schema
- [ARCH-052] Unused `isMobile` variable in pro page

#### User Pass
- [USER-050] Microsite is feature-rich: hero, stats, services, portfolio, reviews, knowledge, contact — excellent
- [USER-051] Contact form has honeypot + timing spam protection — good
- [USER-052] Booking entry from microsite to /book/{slug} works end-to-end

#### Adversary Pass
- [ADV-050] **Search API uses createAdminClient() — bypasses RLS on public unauthenticated endpoint**
- [ADV-051] Public consultant API exposes email and phone number without auth — PII concern
- [ADV-052] Search results hardcode `verified: true` (line 134 TODO)

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 8 | +0 | +0 | +0 | 8 |
| Robustness | 7 | -1 (type casts) | +0 | +0 | 6 |
| Code Quality | 6 | -1 (as any) | +0 | +0 | 5 |
| Security | 4 | +0 | +0 | -3 (admin client, PII) | 2 |
| Test Coverage | 2 | +0 | +0 | +0 | 2 |

**Cross-persona flags:** Admin client on public endpoint (ADV-050 + ARCH concern) — 2 personas

---

### Module: Video Calls (CONDITIONAL DESCEND)

#### Architect Pass
- [ARCH-060] Daily.co integration with proper room lifecycle — solid
- [ARCH-061] `headers()` not awaited in webhook route — will break in Next.js 15

#### User Pass
- [USER-060] **Call complete page silently swallows API errors** — shows "N/A" everywhere instead of error state
- [USER-061] 10+ console.log statements in call page
- [USER-062] Call page has guest auth form for unauthenticated joining — good

#### Adversary Pass
- [ADV-060] Video room creation checks auth + booking participant — solid
- [ADV-061] Token generation is role-based (owner/participant) — correct

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 7 | +0 | -1 (call complete) | +0 | 6 |
| Robustness | 5 | -1 (headers await) | -2 (silent errors) | +0 | 3 |
| Code Quality | 6 | +0 | -1 (console.logs) | +0 | 5 |
| Security | 8 | +0 | +0 | +0 | 8 |
| Test Coverage | 1 | +0 | +0 | +0 | 1 |

---

### Module: Settings & Billing UI (CONDITIONAL DESCEND)

#### User Pass
- [USER-070] Billing page uses native `alert()` calls (lines 343, 346, 350) — jarring UX
- [USER-071] 6+ console.log statements in billing page including "Export data"
- [USER-072] TODO: error toasts for trial start/conversion failures
- [USER-073] Plans comparison modal gets empty array — broken feature

#### Combined Scores
| Dimension | Base | ARCH | USER | ADV | Final |
|-----------|------|------|------|-----|-------|
| Completeness | 6 | +0 | -1 | +0 | 5 |
| Robustness | 4 | +0 | -2 (alert, missing toasts) | +0 | 2 |
| Code Quality | 5 | +0 | -1 (console.logs) | +0 | 4 |
| Security | 7 | +0 | +0 | +0 | 7 |
| Test Coverage | 2 | +0 | +0 | +0 | 2 |

---

## Level 2-3: Deep Dives

### Function: POST /api/bookings/[id]/complete (Level 3)

#### Signature
`export async function POST(request: NextRequest, { params }: { params: { id: string } })`

#### Logic Trace
1. Authenticate user via getUser()
2. Validate request body (bookingId, endReason, feedback)
3. Look up booking, verify user is consultant or customer
4. Only consultant can markComplete
5. Validate status transition via booking-transitions
6. Update booking status to 'completed'
7. Attempt payment capture (non-fatal if fails)
8. Return success

#### Edge Cases
| Edge Case | Handled? | How | Risk if unhandled |
|-----------|----------|-----|-------------------|
| Double completion | Yes | Status transition check | Low |
| Payment capture fails | Yes | Non-fatal, logs error | Medium — consultant may not get paid |
| Missing booking | Yes | 404 response | Low |
| Unauthorized user | Yes | Role check | Critical |
| Post-call workflows | **NO** | TODO lines 190-193 | **HIGH — no review request, no receipt** |

#### Verdict
- Correct: Mostly — core logic is sound but post-call workflows are stub
- Milestone blocker: **Yes — M0** (no review request = reviews never happen)
- Fix complexity: M (need email templates + trigger logic)
- Personas flagging: User (no review prompt), Architect (incomplete workflow)

### Function: GET /api/search/profiles (Level 3)

#### Security Assessment
- Auth verified: **No** — intentionally public
- Authorized: N/A
- Input validated: Manual (query params)
- Injection safe: Yes (Supabase query builder)
- Rate limited: **No**
- **Uses createAdminClient()**: Yes — bypasses all RLS policies

#### Verdict
- Correct: Functionally yes, security no
- Milestone blocker: **Yes — M0** (search is core discovery path, admin client is security risk)
- Fix complexity: S (switch to createClient from server)
- Personas flagging: Adversary (admin client), Architect (wrong client choice)

### Function: Login Page auth flow (Level 3)

#### Assessment
- Auth verified: N/A (login endpoint)
- Rate limited: **No** — calls Supabase client directly, bypassing /api/auth/login lockout logic
- The entire /api/auth/login route with 30-min lockout after 5 failures is dead code

#### Verdict
- Correct: Functionally yes, security incomplete
- Milestone blocker: **No** (Supabase has its own rate limiting), but degrades security posture
- Fix complexity: S (route login through API or move rate limiting to middleware)
- Personas flagging: Architect (dead code), Adversary (bypassed lockout)
