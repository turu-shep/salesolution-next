# Analysis Parameters — Generated 2026-04-02

## Product Understanding
- Product type: Multi-sided Marketplace (SaaS + Marketplace hybrid)
- Core transaction: Customer books consultation → pays (Stripe) → attends video call (Daily.co) → receives AI-generated SOP
- User roles: Customer, Consultant, Contractor, Shop (multi-role capable)
- Business model: SaaS subscription ($49–$299+/mo for providers); providers keep 100% of booking fees; future: transaction margin on parts orders
- Stage: Late-build (~97% feature-complete, pre-launch, M0 target 2026-04-15)
- Transaction value: $50–$200/consultation (set by provider); subscriptions $49–$299+/mo
- Current volume: 0 — pre-launch

## Stack Summary
- Framework: Next.js 14.2.33 (App Router), React 18.2, TypeScript 5.9.2
- Database: Supabase (PostgreSQL + RLS), 110+ migrations
- Auth: Supabase Auth + NextAuth 4.24 + password-protection gate
- Payments: Stripe (Connect destination charges, subscriptions, webhooks)
- Deployment: Vercel (preview per branch, production on main merge)
- Test framework: Jest (unit) + Playwright (E2E), coverage minimal
- Key libraries: Redux Toolkit 2.9, React Hook Form + Zod, shadcn/ui (Radix), @dnd-kit, Daily.co, Resend, Anthropic SDK, OpenAI, Deepgram

## Milestones
### Milestone 1 (M0): Core Loop — Launch Critical
- Blocker test: Real customer books → pays → video call → leaves review → consultant gets paid — E2E, zero manual intervention
- Systems required: Booking, Payments (Stripe), Video (Daily.co), Reviews, Payouts (Connect)
- Readiness estimate: ~90% — most flows verified working; Stripe price ID verification (FA-389), HMAC cookie (FA-392) remain
- Target: 2026-04-15 (13 days)

### Milestone 2 (M1): Self-Serve Onboarding
- Blocker test: Any new user of any role signs up → completes onboarding → reaches dashboard without contacting support
- Systems required: Auth, Onboarding (all 4 roles), Email verification, Forgot password, Role routing
- Readiness estimate: ~75% — forgot password exists, onboarding tour fixed, contractor payout step added, Connect reminder banner added
- Target: 2026-05-01

### Milestone 3 (M2): Knowledge Engine
- Blocker test: Consultant generates → edits → versions → shares SOPs that clients find useful
- Systems required: SOP generation, RAG pipeline, Template versioning, Knowledge base
- Readiness estimate: ~50% — pipeline works but reliability concerns; Inngest health check added
- Target: 2026-05-15

## Focus Areas (derived from PROJECT-CONTEXT §4 + §7)
### Focus A: Critical Path to Revenue (M0 blockers — 13 days)
- Why: M0 is 13 days away. FA-389 (Stripe price IDs), FA-392 (HMAC cookie), E2E smoke test (FA-377) are known blockers.
- Where to look: Stripe checkout flow, payment capture, webhook handling, booking confirmation, payout flow, subscription checkout

### Focus B: UX Quality — First Impression (shop owner in 30 seconds)
- Why: First 10 shop owners judge in 30 seconds. Error/loading states now added to 18+ route groups but need verification.
- Where to look: Dashboard pages, onboarding flows, booking flow, microsite, search page

### Focus C: Security & Hardening (launch readiness)
- Why: Major security work done since last session (CSRF, CSP, rate limiting, crypto codes, env audit). Need to verify completeness.
- Where to look: CSRF middleware, CSP headers, rate limiting on all public endpoints, webhook verification, auth routes

## Explicitly Deprioritized
- Mobile native app
- i18n/localization
- Enterprise tier features
- SEO optimization
- Performance optimization (unless blocking)
- Advanced analytics dashboards
- Referral rewards tracking
- Moderation system
- Parts ordering integration

## Persona Calibration
Based on stage "late-build, pre-launch marketplace", focus areas, and business model:
- Architect weight: 0.8 — Code quality matters but shipping M0 matters more. Refactoring is deferred.
- User weight: 1.8 — First impression is existentially important. UX gaps = lost subscriptions.
- Adversary weight: 1.5 — Elevated from 1.3. Major security work done; verify it's actually solid before real money flows.

Rationale: Pre-revenue marketplace 13 days from launch. User persona weighted highest because UX gaps directly kill conversion. Adversary weight increased because security hardening has been a focus and needs validation — real Stripe charges and real user data on day one means zero tolerance for auth/payment vulnerabilities.

## Business Impact Calibration
- Transaction value: $49–$299/mo subscription + $50–$200/consultation
- Revenue model: SaaS subscription (primary), consultation fees pass-through
- Stage multiplier: Pre-revenue → 13 days to launch. Every day of delayed launch = delayed first $. A broken core loop on launch day = zero shops renew after Month 1.
- Target: 75 shops at $299/mo = $22K+ MRR by month 4

## Documentation Drift Scope
Documents to cross-reference against code:
- `CLAUDE.md`: conventions, architecture claims, command list, do-not-touch list
- `docs/conventions/ARCHITECTURE.md`: system design, directory structure, design decisions
- `docs/conventions/API.md`: endpoint inventory, response format, rate limits
- `docs/conventions/DATABASE.md`: table inventory, migration count, RLS claims
- `docs/conventions/COMPONENTS.md`: component inventory, directory count, patterns
- `docs/conventions/CONVENTIONS.md`: naming, import order, error handling patterns
- `docs/modules/booking-scheduling.md`: booking lifecycle, availability, reminders
- `docs/modules/subscription-billing.md`: plans, enforcement, trials, grace periods
- `docs/modules/auth-roles.md`: auth flow, role mechanics, onboarding
- `docs/modules/video-calls.md`: Daily.co integration, room lifecycle

## Agent Permissions
- Code modification: Tests + small fixes (< 20 lines) + missing error/loading/empty states
- Off-limits files: `/supabase/migrations/` (existing), `/components/ui/`, `.env.*`, RLS policies
- Task tracker: Linear — MCP available: Yes

## Scoring Thresholds
Based on stage "late-build, pre-launch" and team "solo founder + AI tooling":
- "Good enough" threshold: 6 (shipping > perfecting)
- Refactor appetite: Low (only if blocking M0)
- Test expectation: Critical paths (core transaction, auth, payments)
