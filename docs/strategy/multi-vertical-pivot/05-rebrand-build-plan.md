# Revenue Engine rebrand — build plan (phased execution)

> Status: ACTIVE (set 2026-06-28). The ordered execution plan for the "We build Revenue Engines" rebrand. Architecture + mocks live in [04-revenue-engine-rebrand.md](./04-revenue-engine-rebrand.md); the locked positioning is in memory `revenue-engine-unified-brand`. This doc is the SEQUENCE — what we build, in what order, and why.

## Why this order (foundation-up)

Build by dependency, bottom to top. Cylinders (the services) are referenced by every industry pillar and every niche page, so they get reworked before the pages that link to them. The umbrella frames the whole company, so it sets the language everything else inherits. Discovery layer (industries) sits above the building blocks; niches sit above industries.

```
Phase 1  Homepage / umbrella        ← the company story ("We build Revenue Engines")
Phase 2  /services/ hub             ← the cylinder library directory
Phase 3  Each cylinder + add new    ← the building blocks everything links to
Phase 4  /industries/ index         ← the discovery layer entry
Phase 5  Each industry pillar (4)    ← the faceted hubs (+ the URL remap/301s)
Phase 6  Niche pages (lazy)          ← only what's earned
```

Definition of done for every phase (per AGENTS.md): `npx tsc --noEmit` clean, lint clean on changed files, `pnpm build` compiles, the **humanizer** pass run on all customer-facing copy, term-capture run after any prose, and visual QA (desktop + mobile, no overflow). Voice + guardrails per [04 §1](./04-revenue-engine-rebrand.md).

---

## Phase 1 — Homepage / umbrella

**Goal:** the homepage becomes the umbrella — "We build Revenue Engines. One per business." — and routes the visitor to their engine.
**Scope:**
- Hero eyebrow/sub to name the offer (keep "Get found. Win the sale. Keep them coming back."); the chip picker / niche router as the front door (pick business → route to industry/niche, colour-coded by funnel).
- The anti-menu wedge ("You've been sold pieces. We run the whole flow.") at company level.
- Bring → Convert → Retain as the universal architecture; the "we strengthen the cylinder that pays back hardest" loop.
- The boundary/operator proof (one operator, no ad markup, you own your data). No price, no guarantee on the umbrella — it routes.
- **Cross-cutting that rides here:** the `/revenue-engine/` **product page** (what it is + how it works + convert CTA, the dual-router) and the **nav rework** (top label "Industries"; add "The Revenue Engine" linking `/revenue-engine/`, repointing the mislabeled "Framework" link; Services dropdown header "The cylinders").
**Mock:** [04 §2](./04-revenue-engine-rebrand.md) (umbrella mock). **Reuse:** HeroProbe, WhoWeServe, FlowBlock, FrameworkTimeline, EngagementModel, Evidence, Operator, Signals, FAQ.

**Locked (2026-06-28):**
- **Value-first, mechanism-second (homepage-wide rule):** every section leads with the OUTCOME in the owner's words; "Revenue Engine / cylinders / Bring→Convert→Retain" are supporting scaffolding, never the headline a visitor must decode. The one exception is the `/revenue-engine/` product page, where the concept IS the subject.
- **Hero:** keep the outcome H1 "Get found. Win the sale. Keep them coming back."; "The Revenue Engine · one per business" drops to the eyebrow; "one per business" is delivered by the chip router (the 4 industries).
- **One router, not three:** `WhoWeServe` is the single "pick your engine" industry router (reframed to the 4 industries). `GoalIndex` is repurposed into the **cylinders/levers** section (goal → the cylinder that fixes it), not a 3rd industry router. The hero chips stay as a quick teaser.
- **No pricing on the umbrella:** cut `EngagementModel` from the homepage (pricing lives on pillars/niches/cylinders); keep a slim "how we work" (one operator, no markup, you own it) — no numbers.
- **Keepers (untouched):** `DemandSystem` (the interactive funnel) and `Evidence` (the case study).

**Status:** in progress.
- ✅ **Hero done** (HeroProbe): added the "The Revenue Engine · one per business" eyebrow above the outcome H1 (value-first); fixed the H1 orphan wrap; relabeled the "Retail" chip → "Consumer brands"; killed the false "Real client" label; bumped eyebrow contrast. Validated via the visual loop (5-agent read-only critique → serial fixes → n+1 confirm, all PASS).
- ✅ **Northern Hydraulics landmine cleared** in `AIOverviewMockup` (→ "Forge Fluid Power" PLACEHOLDER) — fixes the homepage hero AND the industrial-pillar carryover in one edit. (Still flag: swap placeholder mockup clients — Forge Fluid Power, Cedar & Co Roofing — for real consenting clients before publish.)
- ✅ **FrameworkTimeline → Bring/Convert/Retain** + **WhoWeServe → the engine router** done: value-first stations (big plain outcome "Get found/Win the sale/Keep them coming back", "Bring/Convert/Retain" demoted to kicker); Prove capstone; "illustrative targets, not past results" disclaimer; color encodes motion (blue=sell-product → Industrial+Consumer, orange=book-jobs → Medical+Home); mobile stations stack. Validated via the visual loop (5-agent critique → fixes → n+1 confirm, all PASS).
- ✅ **ProblemShift → the wedge** ("You've been sold pieces. We run the whole flow." — seams story in short declaratives, dropped the two-door CTAs). The two-leak proof block (AI-up/clicks-down chart + missed-call stats) was **cut and parked on `/drafts`** (noindex; `components/drafts/LeakProof.tsx`) for relocation to a future "why now" beat — it was off-thesis (proved two point-leaks, not the seams) and reasserted the old two-door framing. **EngagementModel cut** (pricing off the umbrella). Validated via the visual loop (all PASS).
- 📌 New noindex utility route **`/drafts`** (`app/(site)/drafts/page.tsx`) holds parked components; exempt from the sitemap-registry reconcile test via `index: false` (test passes 2/2).
- ✅ **GoalIndex → cylinders (done 2026-06-29 — Phase 3 lead-off).** Reframed from the two-door "Intent Index" into the goal→part index: 6 owner-voice "I want to ___" rows, each pointing to the ONE cylinder that fixes it (4 deep-link built `/services/*` pages; Answer & Book + Recover & Reactivate show a quiet "Coming soon" pill → product page). Value-first held (no "cylinder" in the H2 — parts named only as destinations). Validated via the visual loop (5 critiques + n+1); fixed the row-03 bait-and-switch (more-work-coming-in → **Outbound Email**, not Full Growth Ownership), de-em-dashed the sub, bumped the stake to AA.
- ✅ **FinalCTARail → the umbrella close** ("Find the hole. Then decide." + motion self-ID doors: "You sell a product" → Book a Growth Call / "You book jobs & appointments" → Revenue Leak Audit; brighter card body). Site-wide close (~28 pages). **Operator now carries "how we work"**: headline fixed to full-contrast white (no muted two-tone), + a separated boundary strip (no markup · you own your data · no lock-in · published prices) — the home for the trust points the EngagementModel cut left behind. Validated via the visual loop (all PASS). Dev-server stale-HMR flake hit mid-pass; recovered (rm -rf .next + restart) and re-confirmed clean.
- ✅ **Nav rework (Batch 1) done** — "Who We Serve" → **Industries**; "Framework" → **The Revenue Engine** (→ `/revenue-engine/`); AI Search Readiness moved into Insights (`/future-proof-your-seo/` kept, no redirect); MobileNav CTA mislabel fixed. tsc/lint/registry(2-2 unchanged)/routes-200 green; header dropdowns visually verified. Industries children stay on current targets until Phase 5. Plan: [06-product-page-and-nav-plan.md](./06-product-page-and-nav-plan.md) §2.
- ✅ **Batch 2 done — the `/revenue-engine/` product page**: repurposed in place (no 301) into the cross-vertical product page — concept-led **full-contrast** hero, ProductWedge banner, the PlanByPillar 5-step spine, new SixCylinders section (deep-links `/services/*`), iteration-loop beat, Prove (de-ROI'd to "the revenue the system brought back"), FounderNote, product FAQ, niche router, close. Guarantee/pricing/calculator left on the niches. Audit routers → `/revenue-engine/home-services/#audit` (FinalCTARail card-B + RevenueFooter); FooterSwitch excludes bare `/revenue-engine/`. New files: `lib/revenue-engine.ts` + `components/sections/revenue-engine/{ProductWedge,SixCylinders,IterationLoop}.tsx`. Also fixed the **muted two-tone HERO** (RevenueHero `titleAccent` → full-contrast ink — fixes the niche heroes too). Validated via the visual loop; tsc/lint clean.

## ✅ PHASE 1 COMPLETE (2026-06-28)
Homepage = the umbrella · `/revenue-engine/` = the product page · nav reworked. Two open items carried forward:
- **`GoalIndex` → cylinders** — deferred to Phase 3 (needs the cylinder catalog).
- ✅ **Site-wide muted two-tone H2 accent — killed (done 2026-06-29).** The muted `text-ink-400/500` second clause was the site's *whole* headline pattern, not a few stragglers. De-muted to full-contrast in **two passes — ~113 headline accents across ~110 files** (homepage + industrial pillar + every service/cylinder page incl. their per-page subdir sections + per-page FAQ `headline` props + every revenue-engine niche/product page + audit / constraint-sprint / catalog-snapshot / case-studies / career-paths / future-proof / blog / guides / book-call + Footer tagline + error/not-found). Separators, units, eyebrows, bylines, meta labels, code tokens, and cockpit UI left untouched. tsc/lint clean; visual loop PASS on homepage + industrial pillar, spot-checked on full-growth-ownership (dark), catalog-ai (light), revenue-engine (FAQ). Brand-blue accent left as an opt-in (NOT applied — full-contrast matches the hero precedent). Footer wordmark (`Logo`) was already full-contrast. **Open content item (Phase 3 catalog reconcile):** "Six cylinders / all six" is stale vs the 12-catalog on BOTH the industrial pillar AND the `/revenue-engine/` product-page FAQ ("take all six cylinders?"); plus the pillar's dim dark-bg "BRING/CONVERT/RETAIN" eyebrows — fold into the pillar/product re-sync.

**✅ Phase 2 done — `/services/` hub = the cylinder library** (system-first hero "The parts that stop your leaks. One engine."; the "one machine, not a menu" argument — 60/40 + "Five agencies, no accountability." — above the grid; the full 12-cylinder catalog incl. "Coming soon" via the shared SixCylinders + CYLINDER_GROUPS, so the hub and the product page show the identical catalog; PickAService → "Where does your system start?"; pricing demoted). Validated via the visual loop. Also **de-muted the shared two-tone headlines** (ServicesHero, SixCylinders, EngagementShapes → full-contrast — also fixes the product + service-page heroes) and **unified the primary CTA to "Book a Growth Call."** **NEXT: Phase 3 — cylinder pages (rework the 6 + build the new ones as earned).**

## Cylinder catalog — expanded 2026-06-29
Canonical list in `lib/revenue-engine.ts` (`CYLINDER_GROUPS`); rendered on `/revenue-engine/` (SixCylinders) and, in Phase 2, the `/services/` hub. Built cylinders deep-link `/services/{slug}/`; the rest render link-less ("Coming soon") until their page exists (Phase 3 builds them as earned).
- **Bring:** AI Search & GEO ✅ · Catalog AI ✅ · Editorial Authority ✅ · Outbound Email ✅ · Local SEO & Maps ✅ · Paid Acquisition ✅
- **Convert:** Website Development ✅ · Answer & Book ✅ · Conversion & CRO ✅
- **Retain:** Recover & Reactivate ✅ · Reviews & Reputation ✅ · Full Growth Ownership ✅ (the whole engine)

> **ALL 12 cylinders now have pages (2026-06-29).** The 6 new ones (Local SEO & Maps, Paid Acquisition, Answer & Book, Conversion & CRO, Recover & Reactivate, Reviews & Reputation) were built on the light `ServicesHero` template (founder confirmed keeping it, not the spine frame), each with a dark "leak" → 4-step "how" → "where it fits" + sibling cards → FAQ, plus service+breadcrumb+FAQ JSON-LD. Every page auto-deep-links from the hub, the `/revenue-engine/` product page, and homepage GoalIndex via its `slug` in `CYLINDER_GROUPS`; **zero "Coming soon" cards remain.** Sitemap registry + reconcile test updated (2/2). All built/verified via the visual loop. **Open (founder call):** none of the new pages carry proof (no client results yet) — add a trust/method element + real results when earned; do NOT fabricate. The local-service cylinders use the unified "Book a Growth Call" CTA (the dual-door close routes book-jobs buyers to the audit) — confirm if you'd rather they lead with the Revenue Leak Audit.

✅ = live page · 🔜 = new, no page yet. Founder may still add/rename — clean up later.

**Homepage section status:** Hero ✅ · DemandSystem (keeper) ✅ · ProblemShift→wedge ✅ (proof parked on /drafts) · WhoWeServe→router ✅ · FrameworkTimeline→Bring/Convert/Retain ✅ · EngagementModel cut ✅ · Evidence (keeper) ✅ · Operator→how-we-work ✅ · GoalIndex→goal-part index ✅ (2026-06-29) · FinalCTARail→close ✅. **Site-wide two-tone polish: done.**

## Phase 2 — /services/ hub (the cylinder library)

**Goal:** reframe the services hub from a commodity menu into the cylinder directory — "Six cylinders. One engine."
**Scope:**
- System-first ordering: lift the compounding thesis ("Five agencies. No accountability." / the 60/40 argument) ABOVE the card grid; recast PickAService from "Which service do I need?" (pick one) → "Where does your system start?".
- Demote per-unit pricing out of the headline (keep it as proof-of-fairness deeper / on the detail pages).
- Frame the page as the capability library every pillar + niche references.
**Reference:** the perceived-value findings in this folder's history (commodity-read fixes). **Reuse/rework:** ServicesIndex, HowServicesCombine, EngagementShapes, PickAService.
**Status:** not started.

## Phase 3 — Cylinder (service) pages: rework the 6 + add new

**Goal:** each cylinder page is a confident, keyword-true money page (slugs frozen) AND reads as a part of the engine.
**Scope:**
- Rework the six: `ai-seo`, `catalog-ai`, `editorial-authority`, `website-development-design-services`, `outbound-email-marketing-services`, `full-growth-ownership`. De-jargon per the industrial ICP (e.g. cut ARR/coverage/citation-share from cold copy on ai-seo); reconcile the Sprint price; add breadcrumb JSON-LD.
- **Add new cylinders** to cover Convert + Retain across both motions (the current 6 are Bring-heavy). **DECISION NEEDED — the full cylinder catalog**, candidates:
  - Convert: "Answer + Book" (speed-to-lead / AI receptionist / missed-call-text-back — the local-service RESPOND→BOOK), CRO / quote-and-RFQ mechanics.
  - Retain: Recover/Reactivation (cold-quote + dormant-list recovery), Reviews/Reputation engine.
  - These map to the Bring/Convert/Retain levers in `operating-concept-bring-convert-retain.md`.
- Keep `/services/*` slugs (SEO money pages). New cylinders get new `/services/{slug}/` pages.
**Status (2026-06-29): STARTED.** ✅ GoalIndex → goal→part index shipped as the lead-off (homepage — see the Phase 1 carry-forward above). Cylinder-page rework + new cylinder pages not yet started. **Blocks Phase 5** (pillars deep-link cylinders) and **Phase 6** (niches fire cylinders).

### Phase 3 execution plan + grounded findings (2026-06-29 scan)

**A. Rework the 6 built cylinder pages** (slugs frozen; each becomes a confident keyword-true money page that also reads as a part of the engine). Shared fixes confirmed by scan:
- **Breadcrumb JSON-LD is MISSING on all 6** (ai-seo, catalog-ai, editorial-authority, website-development-design-services, outbound-email-marketing-services, full-growth-ownership). Add `BreadcrumbList` to each (Home → Services → {cylinder}); the product page already has it.
- **`ai-seo` is the heaviest de-jargon job:** GEO / "generative engine" / ARR / "AIO citation coverage" sit in the META description, hero, and FAQ — the exact ICP-friction words. Lead with the plain outcome ("get named when a buyer asks AI who to use"), demote GEO/generative-engine to a second clause, cut ARR + "AIO citation coverage" from cold copy (keep them in the deeper "what we report" detail, not the glance).
- **Sprint price:** stated only on ai-seo ("$12–24k, 4 weeks"). Reconcile against the hub's `EngagementShapes` pricing during the rework (confirm one number).
- Add the "part of the engine" frame (link up to the engine / sibling cylinders) without diluting the head keyword.
- Suggested order (jargon-worst + highest-intent first): **ai-seo → catalog-ai → editorial-authority → website-development-design-services → outbound-email-marketing-services → full-growth-ownership.**

**B. Build new cylinder pages — "as earned"** (catalog locked at 12; 6 are 🔜). Recommend building the two the local-service motion most needs and that GoalIndex already points at:
1. ✅ **Answer & Book** (Convert) — BUILT 2026-06-29 at `/services/answer-and-book/`. Hero "Answer every call. Book the job. Even the 9pm ones.", dark "leak", 4-step "pick up / text back / qualify / log", "Convert cylinder" engine framing + sibling links, FAQ, service+breadcrumb+FAQ JSON-LD. Visual loop (5 critiques + n+1). GoalIndex row 5 now deep-links it (was "Coming soon").
2. ✅ **Local SEO & Maps** (Bring) — BUILT 2026-06-29 at `/services/local-seo-maps/`. Hero "Be the first name they find nearby.", map-pack "leak", 4-step "GBP / local pages / reviews / citations", "Bring cylinder" framing + siblings, FAQ + JSON-LD. Visual loop (3 focused critiques + n+1; reused the validated Answer & Book template).
   Leave **Paid Acquisition, Conversion & CRO, Recover & Reactivate, Reviews & Reputation** as "Coming soon" until a client or real search demand earns them (Recover & Reactivate is GoalIndex row 6 — promote next if dormant-list recovery becomes a lead theme).
   **Open (founder call):** both new pages — and the existing 6 — carry NO proof (the firm has no client results yet). Honest fix when earned: a trust/method element (operator-run, real-reviews-only, process) + real results once a pilot exists. Do NOT fabricate metrics.
- When a new page ships, add its `slug` to `CYLINDER_GROUPS` so the hub, product page, and GoalIndex auto-deep-link it.

**Every page change runs the visual loop + tsc/lint; copy runs the humanizer + term-capture.**

## Phase 4 — /industries/ index

**Goal:** the cross-industry index becomes "Pick the engine for your business" — the faceted discovery entry listing the 4 industry pillars.
**Scope:** reframe `/industries/` (exists) to the four-pillar router; nav "Industries" parent points here.
**Reuse/rework:** IndustriesShowcase, WhoWeServe.
**Status:** not started.

## Phase 5 — Industry pillars (4)

**Goal:** the four faceted pillars, each opening with the engine spine, then forking by motion.
**Scope:**
- Build/finalize: **Industrial distribution** (converts — fat pillar; DRAFTED EARLY, see status), **Home services** (thin, routes to niches), **Medical & aesthetics** (thin; dual-CTA router from day one), **Consumer / DTC brands** (sell-product).
- **The URL remap rides here:** `/revenue-engine/{home-services,medical,local-retail}/` → `/industries/{home-services,medical-aesthetics,consumer-brands}/` with 301s; the consumer **motion-flip scrub**; `lib/sitemap/registry.ts` + `registry.reconcile.test.mjs` update (test gate); internal-link repoint; `lib/schema.ts` breadcrumbs; the **reserved-slug guard**. Full remap table in [04 §1](./04-revenue-engine-rebrand.md).
**Mock:** [04 §3](./04-revenue-engine-rebrand.md) (industrial pillar = the template).
**Status:** Industrial pillar **drafted ahead of sequence** at [app/(site)/industries/industrial-distribution/page.tsx](../../../app/(site)/industries/industrial-distribution/page.tsx) (tsc/lint/build clean, visual QA'd). It links to cylinder pages that get reworked in Phase 3, so **revisit it after Phase 3** to re-sync. **Must-fix before publish:** the "Northern Hydraulics / northernhydraulics.net" example in the hero `AIOverviewMockup` (`INDUSTRIAL_SLIDES`) — real-company landmine; fix per [case-studies/fact-ledger.md](../case-studies/fact-ledger.md).

## Phase 6 — Niche pages (lazy)

**Goal:** flat niche conversion pages at `/revenue-engine/{niche}/`, added only when a real client or real search demand earns one.
**Scope:** seed = **Dentists** (exists; reframe + breadcrumb to Medical & aesthetics primary, no 301) and **Jewelry & luxury** (new, lead Consumer/DTC niche, sell-product motion). All others stay a card on their pillar until earned.
**Status:** not started.

---

## Cross-cutting (built inside the phase noted, tracked here so they don't slip)
- **/revenue-engine/ product page** + **nav rework** → Phase 1.
- **URL remap + 301s + sitemap registry + reserved-slug guard + schema breadcrumbs** → Phase 5.
- **Voice/humanizer + term-capture** → every phase with copy.
- **Guarantee/pricing variance by motion** (book-jobs vs sell-product) → enforced on pillars (5) and niches (6) via the typed `motion` field + guarantee-import lint test.

## Parked (after the core rebrand ships)
- **Airline-style first-screen CTA** — a hero widget that lets the visitor do the thing they came for immediately (pick business → see leak/price → book, without scrolling). Its own sub-process once Phases 1–6 land.

## Status snapshot (2026-06-28)
- ✅ Architecture + taxonomy locked → [04](./04-revenue-engine-rebrand.md).
- ✅ Mocks: umbrella + industrial pillar → [04 §2–3](./04-revenue-engine-rebrand.md).
- 🟡 Industrial pillar built early (Phase 5) — needs Phase-3 re-sync + the Northern Hydraulics fix before publish.
- ▶️ **Next per sequence: Phase 1 — Homepage / umbrella.**
