# Agent Input: Project Context
> **Fill this out before running the agent.** Save as `.agent/PROJECT-CONTEXT.md` in your project root.
> The agent reads this first and uses it to calibrate every analysis decision.
> Be honest and specific — vague inputs produce generic recommendations.
>
> **V2.0 additions:** Sections 4.5 (Revenue Context) and 5.2 (Documentation Locations) are new.
> These power business impact scoring and documentation drift detection.

---

## 1. PRODUCT

### What is this product? (2-3 sentences — what it does, not how it's built)

Field Advisor is a multi-sided marketplace connecting customers with field service professionals — consultants, contractors, and shops — across the skilled trades industry. Customers discover providers via QR codes or search, view their microsite profiles, book consultations (video or on-site), pay online, join video calls, and receive AI-generated SOPs (Standard Operating Procedures) as deliverables. Providers manage their business through role-specific dashboards with booking management, availability calendars, analytics, and subscription-gated features. Shops act as network hubs — their preferred supplier status means parts and equipment recommended during consultations are routed as pre-orders to the shop, closing a discovery-to-purchase loop that keeps revenue local.

### Who uses it? List every distinct user type/role.

1. **Customers** — homeowners, property managers, facility managers, businesses needing trade services. Book consultations (video or on-site), pay, attend video calls, receive SOPs, convert to service contracts.
2. **Consultants** — retired/semi-retired master technicians, solo practitioners, or org members. Manage bookings, conduct video calls, generate SOPs, monetize decades of expertise remotely.
3. **Contractors** — active field service workers and freelance technicians. Accept jobs (video and on-site), track work, convert consultations into signed service agreements. Can be paired with shops or operate independently.
4. **Shops** — equipment dealers, parts suppliers, retail/service businesses. Invite contractors, manage teams, serve as network hubs and preferred suppliers. Receive pre-orders when their linked consultants/contractors recommend parts.
5. **Enterprise Firms** (future — M3/M4) — large contracting companies using the platform to extend workforce capacity and manage subcontractor overflow.

Users can hold multiple roles simultaneously.

### What is the core transaction? (The one thing that must work for the product to have value)

Customer books a consultation with a consultant, pays for it (Stripe destination charge), attends a video call (Daily.co), and receives an AI-generated SOP as the deliverable.

### Business model (how does this make money?)

**Current (M0–M2):** SaaS subscription ($49–$299+/mo tiers for providers). Providers keep 100% of booking fees. Platform monetizes through subscription tiers that gate features (analytics, AI tools, team management, etc.).

**Planned (M3+):** Transaction margin on parts/equipment orders routed through preferred supplier network. Lead-to-contract conversion fees. Financing facilitation referral fees on large equipment purchases. Premium placement for providers. White-label licensing for large distributors. Training/certification marketplace. The long-term vision is a transaction-fee marketplace processing high volumes across the entire skilled trades supply chain.

### Current stage

Mid-build — happy path works for booking/payment/video/SOP flows. ~75% feature-complete. Payment loop fully wired (destination charges, Connect onboarding, capture, refunds). Reviews, some onboarding flows, and polish gaps remain.

---

## 2. MARKET & ICP

### Who is the Ideal Customer Profile?

**Primary ICP (launch GTM — the paying subscribers who solve the chicken-and-egg problem):**

- **Local shops and service businesses** — HVAC shops, plumbing supply houses, hydraulics dealers, electrical supply, roofing suppliers, auto/marine repair shops, and similar skilled trade businesses. 1–20 employees, $500K–$15M revenue, owner-operator is the buyer. US-based, starting Southeast (Florida).
- **Why shops first:** The platform will be empty at launch. We cannot rely on organic marketplace traffic. Shops already have a customer base walking through their door every day. They subscribe, get QR codes, and hand them to their existing customers — driving demand-side users onto the platform without Field Advisor needing to acquire those customers directly. The shop is both the subscriber AND the distribution channel. Every shop that signs up brings 50–500 potential customers with them.
- **What they get:** A branded microsite with QR codes, the ability to connect their in-house or affiliated experts to customers via video consultation, a booking/payment system, AI-generated SOPs as deliverables they can put their name on, and a parts recommendation loop that routes orders back to their shop. It's a competitive moat against Amazon — "buy from us and get expert support included."

**Secondary ICP (M1–M2 expansion):**

- **Independent consultants and retired technicians** — solo practitioners who want to monetize decades of expertise remotely. They sign up independently or get invited by a shop. They don't need to bring customers — they plug into the shop's existing demand.
- **Active contractors and freelance technicians** — want a booking/payment system, customer acquisition channel, and access to expert guidance when they're stuck on a job site. Can be paired with shops or operate independently.

**Demand side (customers — free users brought by shops):**

- Homeowners and business owners who already buy from the shop — they scan a QR code at the counter, in a bag, on a receipt, or on equipment
- Contractors and field workers who buy parts from the shop and need expert guidance on installs/repairs
- Property and facility managers responsible for building maintenance
- General contractors needing specialist guidance on specific trade problems

**GTM reality:** At launch, 100% of demand-side users come through shops. The platform earns the right to organic/marketplace traffic only after there's enough supply-side density to make search/discovery useful. Until then, every feature decision should ask: "Does this make the shop more likely to hand out QR codes and does it make the customer more likely to scan one?"

**Geographic focus:** US-based, starting with Southeast (Florida) and expanding nationally.

### What problem does this solve for them? (in their words, not yours)

**Consultant/retired tech:** "I've got 30 years of experience and I'm done climbing ladders, but I still know more than anyone on the phone. I want to make money from what I know without leaving my house."

**Contractor:** "I'm on a job site staring at a unit I've never seen before and my options are call 10 people, watch YouTube for an hour, or fake it. I need someone who's seen this exact problem before, right now, on video."

**Shop/dealer:** "I sell the equipment but I can't back it up with fast service anymore — my best techs retired and I can't hire replacements. When a customer's unit breaks and I say 'two weeks,' they go to Amazon next time. I need a way to offer expert support without having those experts on payroll. And I need my customers to keep coming back to ME instead of ordering online."

**Shop (GTM angle):** "If I could hand my customer a QR code that connects them to one of my guys on video — and then they order the parts from me — that's a reason to walk into my store instead of going to Amazon. That's worth $49 a month."

**Customer (homeowner/facility manager):** "I've got a broken [unit] and I don't know if I need a $50 fix or a $5,000 replacement. I want to talk to someone who actually knows before I commit to a $200 service call."

### Who are the competitors or alternatives? (including "do nothing" / manual process)

1. **JustAnswer / Thumbtack / Angi:** General services marketplaces — connect customers to contractors by category. No video consultation, no SOP deliverable, no preferred supplier loop, no retired-expert monetization model. Field Advisor is trades-specific with a knowledge capture layer (SOPs) and supply chain integration (parts pre-orders to preferred suppliers).

2. **YouTube / forums / Reddit:** Free troubleshooting content. Generic, not real-time, not interactive, no accountability. Field Advisor provides live, 1:1 expert guidance tailored to the exact equipment and situation, with a recorded deliverable.

3. **Manufacturer tech support hotlines:** Long hold times, scripted responses, limited to one brand. Field Advisor experts are brand-agnostic and cross-trained across equipment types with decades of field experience.

4. **"Call a buddy" (do nothing / manual process):** Contractors text or call a friend who might know. Unreliable, uncompensated, doesn't scale. Field Advisor formalizes this into a paid, scheduled, recorded interaction with verified experts.

5. **XOi Technologies / Aquant:** Enterprise-focused field service AI platforms. Expensive ($50K+ implementations), targeted at large service organizations. Field Advisor serves the fragmented long-tail of independent contractors, small shops, and solo experts — no enterprise contract required, self-serve onboarding, subscription starts at $49/mo.

### What is the unique advantage? (one sentence — what can you do that others can't?)

Field Advisor is the only platform that closes the loop from expert diagnosis to parts pre-order to supplier revenue — turning every consultation into a transaction that keeps money in the local dealer network instead of losing it to Amazon.

---

## 3. GOALS & MILESTONES

### What are the next 1-3 milestones? (in order of priority)

**Milestone 1: M0 — Core Loop (Launch Critical)**
- What it means: Complete booking → payment → video → payout so real transactions work. Reviews system is the last gap.
- Blocker test: A real customer can book, pay, attend a video call, leave a review, and the consultant gets paid — end to end with no manual intervention.
- Target date: 2026-04-15

**Milestone 2: M1 — Self-Serve Onboarding**
- What it means: All 4 roles can fully self-onboard without manual support. Auth polish, onboarding completion tracking, team invitations.
- Blocker test: A new user of any role can sign up, complete onboarding, and reach their dashboard without contacting support.
- Target date: 2026-05-01

**Milestone 3: M2 — Knowledge Engine**
- What it means: AI-powered SOP generation becomes the key retention driver. RAG pipeline polish, template versioning, knowledge base organization.
- Blocker test: A consultant can generate, edit, version, and share SOPs that clients find genuinely useful.
- Target date: 2026-05-15

### What are the KPIs that matter right now? (max 5)

1. **Shop activation rate** — % of subscribed shops that complete full setup: profile, Stripe Connect, at least one expert linked, QR codes generated. A shop that doesn't finish setup never hands out a QR code and generates zero value. Target: >70% of subscribers reach full activation within 7 days.
2. **QR code → booking conversion** — % of QR code scans that result in a completed booking. This is the single most important funnel metric — it measures whether the end-customer experience is compelling enough that the shop's distribution effort pays off. Target: >15% scan-to-booking rate.
3. **Core loop completion rate** — % of bookings that complete the full cycle: book → pay → video call → SOP delivered → review submitted. Target: >80% of paid bookings reach SOP delivery. Currently unmeasured (review submission not yet built).
4. **Time to first booking** — days from shop subscription to first customer-initiated booking via their QR code. Proxy for product-market fit and onboarding friction. Target: <7 days. If a shop doesn't see a booking in the first week, renewal risk is extreme.
5. **Subscription renewal rate (Month 2+)** — % of shops that renew after first month. This is the ultimate signal that the platform delivers enough value. Target: >80% Month 2 renewal. Currently unmeasurable (pre-launch).

### What does NOT matter right now? (things you explicitly deprioritize)

**Deprioritized for M0 (now through 2026-04-15) — do not touch:**
Mobile native app, i18n/localization, enterprise tier features.

**Deferred to late M1 / M2 (2026-05-01 through 2026-05-15) — address once M1 core is mostly complete:**
SEO, performance optimization, advanced analytics dashboards, referral rewards tracking, moderation system, parts ordering integration. These were previously M3/M4 but are being pulled forward — once the core loop and onboarding work, these become the growth and retention levers that justify subscription pricing.

---

## 4. CURRENT STATE

### Tech stack (brief — the agent will read your code for details)

Next.js 14.2 App Router, React 18, TypeScript 5.9 (strict), Tailwind CSS 3.4, Supabase (PostgreSQL + Auth + RLS), NextAuth 4.24, Stripe (payments + Connect), Daily.co (video), Resend (email), Redux Toolkit 2.9, React Hook Form + Zod, shadcn/ui (Radix), Anthropic + OpenAI + Deepgram (AI/speech), PWA-enabled. Deployed on Vercel.

### Team structure

Solo founder. All development, design, marketing, and operations handled by one person. Offshore development contractors available through Deventor (founder's own dev shop) for overflow, but day-to-day build is solo. AI-assisted development via Cursor + Claude Code is a primary workflow — task sizing should assume one developer with AI tooling, not a team.

### What works today? (flows a user can actually complete end-to-end)

1. Auth (email/password, social sign-on, role routing): works
2. Consultant onboarding wizard: works
3. Microsite generation + QR codes: works
4. Marketplace search & discovery: works
5. Booking + availability + calendar: works
6. Payment (Stripe destination charges, capture, refunds): works
7. Video calls (Daily.co rooms, pre-call, in-call, recording): works
8. SOP/AI note generation (post-call): works
9. Subscription checkout + billing dashboard + feature gating: works
10. Notifications & email (Resend): works
11. Review display & aggregation: works (display only — no submission form yet)

### What is known-broken or missing?

1. Review submission form — display works, submit flow incomplete (~40%)
2. Forgot password page — missing
3. Onboarding completion tracking — no progress indicator
4. Team invitation accept/decline flow — incomplete (~60%)
5. Contractor & Shop onboarding validation — gaps
6. Stripe Checkout subscription flow needs E2E verification (FA-138, FA-83)
7. Some `any` types in lib/ need proper typing (FA-268)

### What are the biggest pain points in the codebase? (select all that apply)

- [x] Poor UX (missing loading/error/empty states) — partially addressed (FA-134 added error.tsx to route groups)
- [x] Incomplete core transaction flow — reviews submission is the last gap
- [x] No tests — Jest config fixed (FA-114), but coverage is minimal
- [x] Documentation gaps — module docs exist but may drift from code
- [ ] Other: Some `any` types in lib/ (FA-268 in progress)

### 4.5 Revenue context ★ V2.0

- **Average transaction value:** Unknown — pre-launch. Expected range: $50–$200 per consultation booking (set by provider). Subscriptions: $49/mo (Starter), $149/mo (Pro), $299+/mo (Business/Enterprise). Providers set their own consultation rates.

- **Current monthly transactions:** 0 — pre-launch. No live users yet. M0 milestone (2026-04-15) targets first real end-to-end transaction.

- **Revenue model details:** $49–$299+/mo subscriptions for providers. Providers keep 100% of consultation booking fees (Stripe destination charges — platform is not taking a cut on transactions at launch). Future: transaction margin on parts orders routed through preferred supplier network, lead-to-contract conversion fees, premium placement. Long-term vision is high-volume transaction-fee marketplace.

- **Biggest revenue risk you're aware of:**
  1. **Stripe Connect onboarding friction** — if providers don't complete Connect setup, no transactions can process. This is the single highest-friction step and there's no fallback. If this breaks or confuses users, the entire revenue model stalls.
  2. **Chicken-and-egg at launch (mitigated by shop-first GTM)** — with zero marketplace traffic initially, the platform needs shops to bring their own customers via QR codes. The subscription value proposition at launch is NOT "we'll send you customers" — it's "we give you the tools to serve your existing customers better and keep them coming back." If the QR code → booking → video → SOP flow isn't smooth and impressive on first use, the shop owner won't hand out more QR codes and won't renew. First impression quality is existentially important.
  3. **Review submission gap** — the core loop is incomplete without reviews. Providers won't feel confident the platform works, and customers won't trust providers without social proof. This is the last M0 blocker.

---

## 5. EXISTING PROJECT DOCS

### Does this project have a CLAUDE.md or equivalent?

Yes — `CLAUDE.md` at project root. Comprehensive: stack, commands, architecture, business rules, conventions, do-not-touch list, module knowledge base references.

### Does this project have architecture/module documentation?

Yes — extensive:
- `docs/conventions/` — ARCHITECTURE.md, CONVENTIONS.md, COMPONENTS.md, DATABASE.md, API.md, DEVELOPMENT.md
- `docs/modules/` — 15 module docs covering every feature area (auth, booking, profiles, subscriptions, video, orgs, dashboard, SOP, notifications, navigation, settings, search, database, state, pipeline)

### Does this project have a task tracker?

Linear — with MCP integration. Team: Salesolution. Project: Field Advisor. 81+ issues, 5 milestones (M0–M4).

### Does this project have existing tests?

Minimal — Jest configured (config recently fixed via FA-114), Playwright available for E2E. Coverage is low. Test framework: Jest (unit) + Playwright (E2E).

### 5.2 Documentation locations ★ V2.0

- Project constitution: `CLAUDE.md`
- Architecture docs: `docs/conventions/ARCHITECTURE.md`
- API docs: `docs/conventions/API.md`
- Database docs: `docs/conventions/DATABASE.md`
- Component docs: `docs/conventions/COMPONENTS.md`
- Module docs: `docs/modules/*.md` — one per feature area (15 files)
- Convention/style docs: `docs/conventions/CONVENTIONS.md`
- Development setup: `docs/conventions/DEVELOPMENT.md`
- Roadmap: `ROADMAP.md`
- Other: `.claude/rules/*.md` — contextual rules auto-loaded per feature area

---

## 6. AGENT PERMISSIONS

### What should the agent be allowed to do beyond analysis?

- [x] Can write tests for gaps it finds
- [x] Can fix small bugs (< 20 lines of change)
- [x] Can add missing error/loading/empty states
- [ ] Can refactor flagged components — **only with explicit approval per component**

The agent should flag refactoring opportunities but not execute them autonomously. Solo founder context means any refactor that touches multiple files needs human review before merge. Bug fixes and missing states are safe to apply directly. Tests are always welcome.

### Any files or directories the agent must NEVER modify?

- `/supabase/migrations/` — never edit existing migrations
- `/components/ui/` — shadcn/ui primitives, no modification without explicit approval
- `.env.local`, `.env.production` — secrets
- RLS policies — no modification without security review

---

## 7. WHAT DO YOU WANT FROM THIS ANALYSIS?

### Agent role: Strategic Technical Advisor

This agent is not just a code auditor. It operates as a **strategic technical advisor** with full awareness of the business model, GTM strategy, revenue goals, and competitive positioning described in this document. Every recommendation — whether it's a bug fix, a new feature, a UX change, or an architecture decision — must be evaluated through the lens of:

1. **Revenue impact** — Does this directly enable or protect subscription revenue? Does it increase the likelihood a shop renews? Does it reduce churn?
2. **Customer value** — Does this make shops more eager to hand out QR codes? Does it make end customers more likely to book, pay, and come back?
3. **Time to value** — For a solo founder with AI tooling, what's the fastest path to the highest-impact outcome?

The ultimate goal is to build a $50B market-value company. Every sprint should move toward that, even if the immediate task is fixing a loading spinner. The agent should think in terms of compounding value — what we build now should create leverage for what comes next.

### Specific analysis modes (apply all, prioritize in this order):

**1. Critical path — what blocks revenue?**
M0 is 3 weeks out (2026-04-15). The review submission flow, Stripe subscription E2E verification (FA-138, FA-83), and forgot password page are the known blockers. Surface anything else hiding on the critical path that would prevent a real shop owner from subscribing, setting up their profile, connecting Stripe, having a customer scan their QR code, book a consultation, pay, attend a video call, leave a review, and the consultant getting paid — end to end with zero manual intervention.

**2. Milestone gap assessment — what's actually left?**
Honest gap analysis for M0 and M1. What's actually left vs. what the Linear board says is left? Are there implicit dependencies, broken assumptions, or missing flows the task list doesn't capture? Flag anything where the codebase says "TODO" or "placeholder" on a critical path.

**3. UX quality audit — what makes users bounce?**
Systematic sweep of missing loading indicators, error boundaries, empty states, and dead-end screens. Solo founder means UX polish gets skipped. The first 10 shop owners to try this platform will judge it in 30 seconds — every broken or confusing screen is a lost subscription.

**4. Business value analysis — what should we build next?**
After assessing what exists, recommend what to build, change, or reprioritize based on business impact. This includes:
- New features or UX flows that increase subscription stickiness or consultation volume
- Design changes that improve conversion (signup → onboarding → first booking)
- Pricing/packaging suggestions based on feature gating analysis
- Opportunities to increase average revenue per shop (upsell triggers, usage-based features)
- Competitive moat features — things that make it painful for a shop to leave the platform
- Network effects — features that make the platform more valuable as more shops and experts join
- Data assets — what data are we collecting (or should be collecting) that becomes a strategic advantage over time

**5. Commercial opportunity radar — what else can this platform become?**
Think beyond current scope. Based on the architecture, data model, and user roles already built, what adjacent revenue streams or product extensions are low-effort to add? Examples: training/certification marketplace, insurance/warranty attachment, financing facilitation, white-label for distributors, API access for enterprise integrations. Flag anything where 80% of the infrastructure already exists and only 20% needs to be built to unlock a new revenue line.

### Success metric for this agent:
The agent's output should leave the founder with a clear, prioritized action list where every item has a business justification — not just "this is broken" but "this is broken AND it costs you $X/month in lost subscriptions because Y." Every recommendation should connect back to revenue, retention, or competitive positioning.

---

*Save this file as `.agent/PROJECT-CONTEXT.md` and run the agent.*
*Template version: 2.0*
