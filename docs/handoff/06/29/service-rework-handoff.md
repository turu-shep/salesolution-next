# Handoff: Revenue Engine rebrand + service rework
**Date:** 2026-06-29 · **Branch:** main · **Author:** Artur Shepel + Claude session

---

## What this was

A multi-day strategic pivot and implementation session. The business moved from "here are six services" to "we build Revenue Engines — one per business." Services became cylinders of the engine. The site was rebuilt from the homepage down, in dependency order.

Strategy docs (read these first):
- [Architecture + taxonomy + mocks](../../../strategy/multi-vertical-pivot/04-revenue-engine-rebrand.md)
- [Phase-by-phase build plan](../../../strategy/multi-vertical-pivot/05-rebrand-build-plan.md)
- [Product page + nav decisions](../../../strategy/multi-vertical-pivot/06-product-page-and-nav-plan.md)

---

## The architecture (locked)

**One spine:** "We build Revenue Engines. One per business."

**Services = cylinders** of the engine, grouped by the job they fire: Bring / Convert / Retain.

**Two independent axes — keep them separate or the IA collapses:**

| Axis | What it governs | Where it lives |
|---|---|---|
| Discovery taxonomy | How a visitor finds the niche. Industries → Niches, many-to-many. | URL structure, breadcrumbs, internal links |
| Commercial motion | How the niche sells. One per niche: book-jobs vs sell-product. | Page copy, guarantee, CTA, price |

**The four industries:**

| Industry | Motion | CTA | Guarantee |
|---|---|---|---|
| Home services | book jobs | Revenue Leak Audit | Day-90 |
| Medical & aesthetics | book appointments | Revenue Leak Audit | Day-90 + HIPAA check required |
| Industrial / technical distribution | sell product B2B | Book a Growth Call | None |
| Consumer / DTC brands | sell product B2C | Book a Growth Call | None |

**URL rules:**
- Flat niche pages: `/revenue-engine/{niche}/`
- Faceted industry pillars: `/industries/{industry}/`
- Cylinder (service) pages: `/services/{slug}/` — slugs are frozen, they rank
- Motion never appears in the URL

**Canonical data:** `lib/revenue-engine.ts` (`CYLINDER_GROUPS`, `PRODUCT_PILLAR_GROUPS`)

---

## Phase status

### ✅ Phase 1 — Homepage / umbrella (done 2026-06-28)

**Goal:** homepage = the umbrella; `/revenue-engine/` = the product page; nav reworked.

**Files changed:**

| File | What changed |
|---|---|
| `app/(site)/page.tsx` | Section order: HeroProbe → DemandSystem → ProblemShift → WhoWeServe → FrameworkTimeline → GoalIndex⏸️ → Evidence → Operator → Signals → FAQ → FinalCTARail. EngagementModel cut. |
| `app/(site)/revenue-engine/page.tsx` | Repurposed to cross-vertical product page. Concept-led hero, ProductWedge, PlanByPillar, SixCylinders, IterationLoop. Guarantee/pricing left on niches. |
| `app/(site)/drafts/page.tsx` | Noindex holding page for parked components. Exempt from sitemap registry test. |
| `components/sections/HeroProbe.tsx` | Eyebrow "The Revenue Engine · one per business"; outcome H1 kept; chip "Retail" → "Consumer brands"; full-contrast. |
| `components/sections/FrameworkTimeline.tsx` | Foundation/Amplify/Lead → Bring/Convert/Retain; plain outcome leads each station; "Illustrative targets, not past results" disclaimer; Prove capstone. |
| `components/sections/WhoWeServe.tsx` | "Four businesses we know cold" → "Pick the engine for your business."; all CTAs → "See the engine"; eyebrow → "Industries". |
| `components/sections/ProblemShift.tsx` | Wedge reframe: "You've been sold pieces. We run the whole flow." Two-leak proof block parked on `/drafts`. |
| `components/sections/Operator.tsx` | Full-contrast white headline (no muted two-tone). "How we work" boundary strip: No markup / You own / No lock-in / Published prices. |
| `components/sections/FinalCTARail.tsx` | "You sell a product" / "You book jobs & appointments" self-ID doors. Audit link → `/revenue-engine/home-services/#audit`. |
| `components/sections/AIOverviewMockup.tsx` | "Northern Hydraulics" → "Forge Fluid Power" PLACEHOLDER. **Must swap for real consenting client before publish.** |
| `components/sections/revenue-engine/RevenueHero.tsx` | `titleAccent` → full-contrast `text-ink-900`. |
| `components/sections/revenue-engine/ProductWedge.tsx` | New. Collapsed FlowBlock as a 2-sentence dark banner. |
| `components/sections/revenue-engine/SixCylinders.tsx` | New. Renders all 12 cylinders from CYLINDER_GROUPS. Built = link card; no slug = dashed "Coming soon". |
| `components/sections/revenue-engine/IterationLoop.tsx` | New. "We don't set it and leave" iteration beat. |
| `components/drafts/LeakProof.tsx` | New. Parked two-leak proof (AI-answers chart + missed-call stats). |
| `components/layout/FooterSwitch.tsx` | Narrowed to niche paths `/^\/revenue-engine\/.+/`; bare `/revenue-engine/` gets sitewide footer. |
| `components/layout/RevenueFooter.tsx` | Audit link → `/revenue-engine/home-services/#audit`. |
| `components/layout/MobileNav.tsx` | Line 116 CTA token `audit__primary_nav` → `book_call__primary_nav`. |
| `lib/navigation.ts` | "Who We Serve" → "Industries"; "Framework" → "The Revenue Engine" (`/revenue-engine/`); AI Search Readiness added to Insights. |

**Open from Phase 1 (carried forward):**
- `GoalIndex` → cylinders/levers section: deferred to Phase 3 (needs the cylinder catalog settled first). Currently renders its old UI; it's in the page section order but not yet reframed.

---

### ✅ Phase 2 — /services/ hub = the cylinder library (done 2026-06-29)

**Goal:** `/services/` hub reads as the cylinder directory, not a commodity menu.

**Files changed:**

| File | What changed |
|---|---|
| `app/(site)/services/page.tsx` | System-first hub. HowServicesCombine moved ABOVE grid. ServicesIndex replaced by SixCylinders. PickAService recast. EngagementShapes demoted to 5th position. |
| `components/sections/services/ServicesHero.tsx` | Default CTA: "Book a Growth Call". Eyebrow: `text-ink-600`. `titleAccent`: full-contrast `text-ink-900` (fixes ALL service-page heroes globally). |
| `components/sections/services/HowServicesCombine.tsx` | Recast as "one machine, not a menu." Now ABOVE the cylinder grid. |
| `components/sections/services/PickAService.tsx` | "Which service do I need?" → "Where does your system start?". Rows: "Fire first:" label. |
| `components/sections/services/EngagementShapes.tsx` | "Generic across services." → "The same shape, every service." Full-contrast titleAccent. CTA: "Book a Growth Call". |
| `lib/revenue-engine.ts` | Cylinder catalog expanded from 6 to 12. `slug` made optional. New cylinders: Local SEO & Maps, Paid Acquisition, Answer & Book, Conversion & CRO, Recover & Reactivate, Reviews & Reputation. |

---

### ▶️ Phase 3 — Cylinder (service) pages (NEXT)

**Goal:** each cylinder page reads as a part of the engine AND converts.

**Six pages to rework** (slugs frozen — they rank):

| Page | File | Key fixes needed |
|---|---|---|
| AI Search & GEO | `app/(site)/services/ai-seo/page.tsx` | De-jargon: cut ARR, citation-share, coverage from cold copy. Add "part of the engine" framing. Breadcrumb JSON-LD. Reconcile Sprint price. |
| Catalog AI | `app/(site)/services/catalog-ai/page.tsx` | Add engine framing. Breadcrumb JSON-LD. |
| Editorial Authority | `app/(site)/services/editorial-authority/page.tsx` | Add engine framing. Breadcrumb JSON-LD. |
| Website Development | `app/(site)/services/website-development-design-services/page.tsx` | Add engine framing. Breadcrumb JSON-LD. |
| Outbound Email | `app/(site)/services/outbound-email-marketing-services/page.tsx` | Add engine framing. Breadcrumb JSON-LD. |
| Full Growth Ownership | `app/(site)/services/full-growth-ownership/page.tsx` | Reframe as "the whole engine under one operator." Breadcrumb JSON-LD. |

**New cylinder pages to build** (no page yet — currently "Coming soon" cards):

Build as earned, in this priority order:
1. **Local SEO & Maps** (`/services/local-seo-maps/`) — strongest candidate; maps pack + "near me" is high-intent for home services + medical
2. **Answer & Book** (`/services/answer-and-book/`) — the RESPOND→BOOK motion; needed for the home-services and medical niches to make sense
3. Conversion & CRO, Recover & Reactivate, Reviews & Reputation, Paid Acquisition — build when a real niche needs them

**GoalIndex refactor also rides here:** once the cylinder catalog is settled, reframe `GoalIndex` from the old goal-to-funnel-door router into a goal-to-cylinder map ("I need to get more calls" → Local SEO & Maps + Answer & Book).

---

### Phase 4 — /industries/ index

**Goal:** "Pick the engine for your business" — the four-pillar router.

**Scope:** reframe `/industries/` to a clean four-pillar discovery page. Nav "Industries" parent already points here.

**Reuse:** `IndustriesShowcase`, `WhoWeServe` (already reframed as the industry router; may extract from homepage into a shared component).

---

### Phase 5 — Industry pillars × 4 + URL remap

**Goal:** four faceted pillar pages, each opening with the engine spine, then forking by motion.

**Pillar status:**

| Industry | URL | Status |
|---|---|---|
| Industrial / technical distribution | `/industries/industrial-distribution/` | Drafted early — **needs Phase 3 re-sync** (deep-links cylinder pages that will be reworked). **Northern Hydraulics fix required** (see below) before publish. |
| Home services | `/industries/home-services/` | Not started. Build after Phase 3. |
| Medical & aesthetics | `/industries/medical-aesthetics/` | Not started. Dual-CTA router (Revenue Leak Audit + Book a Growth Call for medical-supply distributors). |
| Consumer / DTC brands | `/industries/consumer-brands/` | Not started. |

**The URL remap rides here:**

| From (current) | To | Type |
|---|---|---|
| `/revenue-engine/home-services/` | `/industries/home-services/` | 301 |
| `/revenue-engine/medical/` | `/industries/medical-aesthetics/` | 301 |
| `/revenue-engine/local-retail/` | `/industries/consumer-brands/` | 301 |

After the remap:
- Update `lib/sitemap/registry.ts` + run `lib/sitemap/registry.reconcile.test.mjs` (the test gates the build)
- Repoint all internal links + footer
- Add breadcrumb JSON-LD (`lib/schema.ts`) on each pillar
- Add the reserved-slug guard in `app/(site)/[slug]/page.tsx` → `generateStaticParams` must exclude niche slugs

---

### Phase 6 — Niche pages (lazy)

**Goal:** flat conversion pages at `/revenue-engine/{niche}/`, only when earned.

**Seed niches:**
- **Dentists** (`/revenue-engine/dentists/`) — exists; reframe + add breadcrumb (Medical & aesthetics primary). No 301 needed.
- **Jewelry & luxury** (`/revenue-engine/jewelry/`) — new; lead Consumer/DTC niche, sell-product motion.

All others stay as cards on their industry pillar until a real client or real search demand earns the page.

---

## Cylinder catalog (canonical in `lib/revenue-engine.ts`)

| Pillar | Cylinder | Status |
|---|---|---|
| Bring | AI Search & GEO | ✅ live `/services/ai-seo/` |
| Bring | Catalog AI | ✅ live `/services/catalog-ai/` |
| Bring | Editorial Authority | ✅ live `/services/editorial-authority/` |
| Bring | Outbound Email | ✅ live `/services/outbound-email-marketing-services/` |
| Bring | Local SEO & Maps | 🔜 no page |
| Bring | Paid Acquisition | 🔜 no page |
| Convert | Website Development | ✅ live `/services/website-development-design-services/` |
| Convert | Answer & Book | 🔜 no page |
| Convert | Conversion & CRO | 🔜 no page |
| Retain | Recover & Reactivate | 🔜 no page |
| Retain | Reviews & Reputation | 🔜 no page |
| Retain | Full Growth Ownership | ✅ live `/services/full-growth-ownership/` |

---

## Known landmines — fix before publish

### 1. Northern Hydraulics / Forge Fluid Power
`components/sections/AIOverviewMockup.tsx` — the homepage hero mockup and the industrial pillar page both show "Forge Fluid Power" as a placeholder. This replaced "Northern Hydraulics" (a real company — naming collision hazard). **Swap for a real consenting client before publish.** See `docs/strategy/case-studies/fact-ledger.md` for the full naming decision.

### 2. HIPAA compliance for Medical & aesthetics
The medical/dental niche carries a `book appointments` motion and a day-90 guarantee. Before selling into this vertical: verify the CRM (GHL), the AI receptionist, and any call-recording tools are HIPAA-compliant. This is a legal requirement, not a copy concern. Add a compliance check to the Definition of Done for any medical niche page.

### 3. GoalIndex on the homepage
Currently renders its old UI (goal → two funnel doors). It's in the homepage section order but not yet reframed. It'll become the cylinders/levers section in Phase 3. Don't touch it until the full cylinder catalog is settled.

### 4. Industrial pillar / Phase 3 re-sync
`app/(site)/industries/industrial-distribution/page.tsx` was built early (Phase 5 sequencing, but drafted now). It deep-links cylinder pages that will be reworked in Phase 3. After Phase 3 ships, re-read this pillar and update any cylinder descriptions or links that diverged.

### 5. Two-tone muted H2 accents
Shared components are fixed (`text-ink-500` → `text-ink-900` on `titleAccent`). Inline JSX on individual pages (some service pages and section components) may still have muted second clauses. Do a pass before each phase ships: grep for `text-ink-400` and `text-ink-500` inside H2/H3 elements.

---

## Dev tooling notes

**Dev server:** `pnpm dev` is pinned to `--webpack`. Do not switch to Turbopack — it causes a "module factory not available" error from a stale service worker + corrupted bundle. Recovery if it hits: `pkill -f "next dev"; rm -rf .next; pnpm dev`, then poll for stable 200s.

**Sitemap registry test:** `lib/sitemap/registry.reconcile.test.mjs`. Run `pnpm test` after any route change. The test gates the build. Routes with `index: false` are exempt.

**Definition of done per phase:**
1. `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors)
2. `pnpm lint` clean on changed files
3. `pnpm build` compiles
4. Humanizer pass on all customer-facing copy
5. Term-capture: `node scripts/glossary-queue.mjs add "term" … --source <type>:<slug>` for any new domain terms
6. Visual QA: desktop + mobile, no overflow, no muted two-tone H2 accents

**Visual loop protocol (for phases with UI changes):**
1. One dev server, one browser at a time
2. Screenshot before and after each change
3. Up to 5 read-only critique agents (no writes)
4. Serial implementation (one fix at a time)
5. n+1 confirm screenshot after the fix
6. Never start the next phase until the current one passes the loop

---

## Parked work

- **Two-leak proof block** (`components/drafts/LeakProof.tsx`, viewable at `/drafts`) — removed from ProblemShift because it proved two point-leaks (AI-up/clicks-down chart + missed-call stats) rather than the seams argument. Relocate to a future "why now" beat once its thesis is clearer.
- **AI services research** — deep-research ran and found 5 defensible new cylinders (AI RFQ/quote intake, deeper Catalog AI pipeline, managed GEO, schema-at-scale, AI on-model photography for DTC). User paused this thread. Output is in the session transcript if needed later.
- **Airline-style first-screen CTA widget** — a hero widget that lets the visitor pick business → see leak/price → book without scrolling. Parked until Phases 1–6 land.

---

## What to do next

1. **Polish pass** — grep for `text-ink-500` inside H2/H3 across the service pages; fix any remaining muted two-tone second clauses.
2. **Phase 3** — start with the 6 existing cylinder reworks (breadcrumb JSON-LD + engine framing first, then de-jargon + Sprint price reconcile). Then build Local SEO & Maps and Answer & Book as the first new cylinder pages.
3. After Phase 3, **repoint GoalIndex** on the homepage (goal → cylinder map).
4. **Phase 4** then **Phase 5** in order. The URL remap in Phase 5 is the most complex operation — do it as a single atomic commit with the 301s, sitemap registry update, test gate, and internal-link repoints all together.
