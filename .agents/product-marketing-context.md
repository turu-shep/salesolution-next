# Product Marketing Context

*Last updated: 2026-06-17*

> This is `brand.voice_doc` (see `project.yaml`). The content engine's workflows
> read it before proposing or drafting anything (`.engine/workflows/content-next-30.js`,
> `content-briefs.js`). The SERP-research step parses the **Words to use** / **Words
> to avoid** lines verbatim, so keep those two lines single-line and comma-separated.
> Every factual claim below cites the repo file it came from. Anything unverified is
> marked **TODO** instead of invented.

---

## Product Overview

**One-liner:** Sale Solution makes industrial and local-service businesses the company AI search points to, so buyers find them before they find a competitor — without spending more on ads. (`components/sections/HeroProbe.tsx`)

**What it does:** Sale Solution is a small, operator-led firm doing SEO, GEO (generative engine optimization), and AI-search readiness for two kinds of business. (`prompts/_CONTEXT.md`) It runs as one team that builds and operates earned, paid, and owned channels together, instead of leaving a client to coordinate ten vendors. (`components/sections/DemandSystem.tsx`)

**Two product lines:**
- **The services book** — six services for industrial and technical-distribution e-commerce, sold off `/services/*`: AI Search & GEO, Catalog AI, Editorial Authority, Website Development, Outbound Email, and Full Growth Ownership (the premium tier). (`components/services/service-colors.ts`, `components/sections/case-studies/service-meta.ts`)
- **The Revenue Engine** — a done-for-you, productized offer for local service businesses (roofers and dental practices). It answers every call, replies in seconds, books the job, and chases quotes that go cold, then shows the owner which revenue it drove. (`app/(site)/revenue-engine/page.tsx`)

**Product category:** SEO / GEO / AI-search-readiness services (multi-vertical). The work is citation, authority, and AI-answer plays, not volume SEO — the site itself is low-authority (DR ~10), so that's the deliberate strategy. (`prompts/_CONTEXT.md`)

**Product type:** Service. Retainer/engagement on the industrial side; a productized monthly system on the Revenue Engine side.

**Business model:**
- **Industrial / services side** — complex, consultative sale to $5M+ businesses. Primary call-to-action is **Book a Growth Call** (`/book-growth-call/`). A written diagnostic (`/unlock-growth-audit/`) is the secondary door. Full Growth Ownership prices two ways: a flat fractional-GTM shape (6-month minimum) and a coordinated retainer priced by service count (3-month minimum); billing is monthly in advance. (`lib/navigation.ts`, `docs/strategy/multi-vertical-pivot/00-phase-plan.md`, `docs/strategy/full-growth-ownership/README.md`)
- **Revenue Engine side** — productized monthly system. **System only** (the engine: demand, response, booking, recovery, dashboard) or **+ Media management** (optional; ads run on the client's own account, at cost, zero markup). Terms: 90-day system install, 3-month minimum then month-to-month, no annual lock-in. The exact price depends on trade, location, and scope and is delivered in the audit, in writing, the same day — never quoted cold. Primary call-to-action is the **Revenue Leak Audit**. (`components/sections/revenue-engine/RevenuePricing.tsx`, `app/(site)/revenue-engine/page.tsx`)

**Founder:** Artur Shepel, Founder & AI-Growth Strategist. On the Revenue Engine the brand voice is first-person "I" — the operator speaks directly. (`lib/business.ts`, `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`)

**Canonical identity (do not drift):** Name **Sale Solution**, legal name Sale Solution, site `https://salesolution.net`. Tagline on file: "AI-Driven SEO for Technical B2B & Industrial E-commerce." Note the tagline still reads industrial-only; the business has since pivoted to multi-vertical, so don't treat it as the whole story. (`lib/business.ts`, `prompts/_CONTEXT.md`)

---

## Target Audience

The business serves **three verticals**. Roles and terms are universal across them; teach the universal skill, then make examples span all three. Never write a page as if industrial is the whole business. (`prompts/_CONTEXT.md`)

### 1. Industrial / technical-distribution e-commerce *(the `/services/*` book)*

**Who lands and decides:** the owner or president of a **$5M–$75M industrial distributor or technical manufacturer**. Usually not a trained marketer — wears the growth hat among five others. The secondary reader is a VP of Sales/Marketing or the one e-commerce manager; write for the owner and let the FAQ answer the practitioner. (`docs/strategy/icp/industrial-distribution.md`)

**Two business types, both the ICP:** multi-brand distributors (hundreds of brands, tens of thousands of SKUs, want to be named over the manufacturer and Amazon) and manufacturers (want to be found direct, by spec and model). Their customers are engineers, maintenance, and procurement who search by part number, spec, model, and cross-reference. (`docs/strategy/icp/industrial-distribution.md`)

**What they want, in their words:** more quotes from the right buyers, and to stop leaking the ones they get. They measure in revenue, quotes, and deals — not ARR, pipeline, CTR, coverage, or impressions. Their words: quotes, RFQs, counter sales, line card, "our reps," "getting found for our parts," "Amazon and the manufacturers going direct." (`docs/strategy/icp/industrial-distribution.md`)

**The villain (Artur's framing):** every owner is stuck on one of two sides, often both. **Not enough coming in** (quieter phone, fewer quotes, slipped on Google, Amazon and manufacturers taking business). **Too messed up to handle what they have** (quotes never chased, website is a parts dump nobody can search, can't tell what marketing worked). Both trace to the same change: buyers now find and pick parts through Google's AI and ChatGPT, and the catalog was built for a web that's already gone. Lead on this, not on an analyst chart. (`docs/strategy/icp/industrial-distribution.md`)

**AI literacy: "somewhat."** They've heard of ChatGPT and seen Google's AI answers. OK to say: ChatGPT, Google's AI / Google AI Overviews, "the AI answer." Do NOT use cold: schema, GEO, citation share, ERP/PIM, faceted navigation, CTR, coverage. Translate to plain stakes or cut. (`docs/strategy/icp/industrial-distribution.md`)

### 2. Home-services contractors *(roofing-forward — the Revenue Engine)*

Roofing, HVAC, plumbing, electrical. The hero speaks to "contractors who miss calls because they're on a roof." The owner pays for leads nobody calls back and sends quotes that go cold. (`app/(site)/revenue-engine/home-services/page.tsx`)

### 3. Dental practices *(the Revenue Engine)*

The pitch: "Your front desk is the most expensive channel you don't measure." Calls missed during chair time, treatment plans and recall that never get followed up. The dental setup is HIPAA-compliant — BAAs on every tool that touches patient data. (`app/(site)/revenue-engine/dentists/page.tsx`)

**The Revenue Engine buyer (both verticals):** a **problem-aware, not solution-aware** local-service owner. They feel the pain (missed calls, leads that ghost, "spent on marketing, can't tell what worked") but have no name for the fix and have never heard "engine vs fuel." They are time-poor, agency-burned, hype-allergic, price-sensitive, afraid of lock-in, and **not marketers**. Any unexplained acronym (GEO, map pack, schema, PMS, BAA) is friction. They're high market-sophistication — they've stopped believing louder promises — so the page turns on a credible mechanism, not a bigger claim. (`docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`)

**Jobs to be done (across verticals):**
- "Get found when buyers ask AI, so they pick me before a competitor." (`components/sections/HeroProbe.tsx`)
- "Stop leaking the leads and quotes I already paid to win." (`docs/strategy/icp/industrial-distribution.md`, `app/(site)/revenue-engine/page.tsx`)
- "Give me one team that builds and runs all of it, not ten vendors to coordinate." (`components/sections/DemandSystem.tsx`)
- "Show me what my marketing actually did, in revenue I can see." (`components/sections/revenue-engine/Guarantee.tsx`)

---

## Personas

| Persona | Cares about | Challenge | What we promise |
|---------|-------------|-----------|-----------------|
| Industrial distributor/manufacturer owner ($5M–$75M) | Quotes and revenue; getting found for their parts | Slipping on Google, Amazon and manufacturers going direct, a catalog AI can't read | Be the company AI names for your parts; stop leaking the quotes you get (`docs/strategy/icp/industrial-distribution.md`) |
| Roofing/HVAC/plumbing/electrical owner | Booked jobs from leads already paid for | On a roof when the phone rings; leads ghost; can't tell what worked | A system that answers every call, books the estimate, and chases cold quotes (`app/(site)/revenue-engine/home-services/page.tsx`) |
| Dental practice owner | New patients booked, recall followed up, compliance | Busiest hours are the leakiest; front desk isn't measured | HIPAA-compliant system that books during chair time and proves the revenue (`app/(site)/revenue-engine/dentists/page.tsx`) |

---

## Problems & Pain Points

**Core problem:** Buyers now ask ChatGPT and Google's AI before they ask a company, and most never scroll down to the site. If the AI doesn't name you, you lose the lead before a competitor does. (`components/sections/HeroProbe.tsx`)

**The self-diagnosis signals the brand uses on the homepage (the reader's own words):**
- Leads from Google quietly dried up, and nothing on your end changed.
- AI is eating your search traffic, and no one can tell you what to do about it.
- You're paying for more clicks, but no more people call or buy.
- Customers can't find you when they search the way they actually talk.
- Ask ChatGPT about your category and it names a competitor, not you.

Two or more usually means the problem is structural — not something more content will fix. (`components/sections/Signals.tsx`)

**Why the AI skips an industrial site (the mechanism, plain):**
1. Their pages read like everyone's (same manufacturer-supplied copy).
2. The brand looks like the expert (the manufacturer's own site is the fullest source).
3. The AI can't read their catalog (quote-only pricing, scattered product data). (`docs/strategy/icp/industrial-distribution.md`)

**The Revenue Engine leak (local-service):** owners think the problem is ad spend. It almost never is. The bleed is one-in-three calls missed, slow replies, and dead estimates — every job that didn't book is money already worked to win. (`docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`)

---

## Competitive Landscape

**Generic SEO / GEO agencies** — sell ranking reports and louder promises. Sale Solution frames against this directly: ranking isn't enough anymore; the goal is being cited inside the AI answer itself. (`components/sections/HeroProbe.tsx`, humanizer before/after on file)

**Multi-vendor sprawl** — the client stitching together separate SEO, ads, email, and CRO vendors. Sale Solution's counter: one team builds and runs earned, paid, and owned channels as one system. Not ten vendors. One system. (`components/sections/DemandSystem.tsx`)

**Lead vendors (Revenue Engine side)** — sell shared, unworked contacts and promise lead volume. Sale Solution's counter: no shared pool, no reselling your leads; it works the demand and contacts you already have, and guarantees revenue it can prove, not lead counts. (`app/(site)/revenue-engine/page.tsx`)

**Ad agencies that "burned you" (Revenue Engine side)** — sold more fuel (ads, leads). Sale Solution's counter: ads are fuel you should own at cost; the engine is the system that converts demand you already have. Keep your ads guy — the engine just makes his leads convert. (`components/sections/revenue-engine/EngineVsFuel.tsx`)

**On the industrial side, name modern competitors only per the competitor policy** (`brand/competitor-policy.yaml`). Amazon and "the manufacturers going direct" are the owner's named villains and are fair to reference, because that's how the ICP describes the threat. (`docs/strategy/icp/industrial-distribution.md`)

---

## Differentiation

**Be the answer, not the ranking.** The work is getting cited inside AI answers (GEO/AEO), not chasing positions on a results page. (`components/sections/HeroProbe.tsx`)

**One operator, one system.** Earned, paid, and owned channels built and run by one team, each entering the funnel where the buyer actually is — not everything dumped into the top. (`components/sections/DemandSystem.tsx`)

**Each phase earns the next.** The framework runs Foundation (get AI-ready) → Amplify (become the name they trust) → Lead (stay out front). The work doesn't move to the next phase until the last one has done its job. (`components/sections/FrameworkTimeline.tsx`)

**Honesty as the product.** Case studies carry an explicit disclosure badge — named, anonymized, or composite — and the disclaimer holds a no-guarantee stance on the industrial side. (`components/sections/case-studies/service-meta.ts`)

**Revenue Engine differentiators (local-service):**
- A published pricing model and terms, in full, so there are no games on a call. The number comes in the audit, in writing, the same day. (`components/sections/revenue-engine/RevenuePricing.tsx`)
- No markup on the client's ads; no reselling their leads; keep their ads guy. (`components/sections/revenue-engine/EngineVsFuel.tsx`)
- A falsifiable guarantee: "If system-attributed revenue doesn't exceed my fee by day 90, I work free until it does." System-attributed revenue is shown as plain math in the client's own dashboard. (`components/sections/revenue-engine/Guarantee.tsx`)
- The Revenue Leak Audit is a diagnosis, not a sales call — the owner keeps the numbers whether or not they hire. (`docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`)

---

## Objections

| Objection | Response | Source |
|-----------|----------|--------|
| "Will this work for me?" / "I've been burned." | Name what we *don't* do, early and specifically: no markup on your ads, no reselling your leads, no annual lock-in. | `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md` |
| "Do you guarantee a number of leads?" | No. The guarantee is revenue the system can prove against the fee, not lead counts. Volume promises are how lead vendors sell shared, unworked contacts. | `app/(site)/revenue-engine/page.tsx` |
| "Are you reselling me the same leads three other contractors got?" | No shared pool. The engine works the demand and contacts you already have. Every call is recorded and logged to you. | `app/(site)/revenue-engine/page.tsx` |
| "Is this HIPAA-compliant for a dental practice?" | Yes. BAAs on every tool that touches patient data — call tracking, SMS, CRM. | `app/(site)/revenue-engine/page.tsx` |
| "What if I cancel?" | After the minimum, leave with 30 days' notice. The automations switch off, but you keep your ad account, your data, and your Google profile. | `components/sections/revenue-engine/RevenuePricing.tsx` |
| "It's too good to be true." | Lean on the client's own numbers (the calculator) and a falsifiable day-90 guarantee, not a stock chart. | `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md` |

**Anti-persona:** Industrial businesses below the $5M ARR floor (real floor — soften industrial-exclusive language, but keep the floor). Buyers who want a one-time project rather than a system. Anyone who wants manufactured urgency, countdowns, or false scarcity — that reads as scammy to the Revenue Engine buyer. (`docs/strategy/multi-vertical-pivot/00-phase-plan.md`, `01-pillar-storyboard.md`)

---

## Customer Language

**How the industrial owner describes the problem:**
- "Our phone's quieter and we're getting fewer quotes."
- "We slipped on Google and Amazon's taking business that used to be ours."
- "Our website's a parts dump nobody can search."
- "We can't tell what marketing actually worked."
(`docs/strategy/icp/industrial-distribution.md`)

**How the local-service owner describes the problem:**
- "The phone rings while I'm on a roof / with a patient."
- "I pay for leads nobody calls back."
- "I send the quote and never hear back."
(`app/(site)/revenue-engine/page.tsx`)

**How a buyer describes the brand's promise:**
- "Buyers ask AI. Be the answer." (`components/sections/HeroProbe.tsx`)
- "Get found. Get booked. Get paid." (`app/(site)/revenue-engine/page.tsx`)
- "One team builds and runs every box. Not ten vendors. One system." (`components/sections/DemandSystem.tsx`)

**Words to use:** quotes, RFQs, counter sales, line card, revenue, booked jobs, get found, be the answer, the AI answer, ChatGPT, Google AI Overviews, get cited, one system, one operator, Revenue Leak Audit, system-attributed revenue, no markup, no lock-in, your own dashboard, GEO (second clause only)

**Words to avoid:** leverage, utilize, seamless, robust, scalable, holistic, cutting-edge, world-class, unlock, supercharge, elevate, empower, game-changer, guaranteed rankings, full-service agency, digital marketing agency, ARR (industrial copy), pipeline, CTR, impressions, coverage, schema (cold), ERP, PIM (cold), faceted navigation (cold)

> Note on the **Words to use / avoid** lines above: the engine's SERP-research step
> regex-matches each as a single comma-separated line (`.engine/skills/serp-research/scripts/pull_brief.py`).
> Keep them one line each. Parenthetical qualifiers like "(cold)" and "(industrial copy)"
> are notes for the writer, not part of the matched token — keep the core word first.

**Glossary (terms this brand owns or leans on):**

| Term | Meaning |
|------|---------|
| GEO (generative engine optimization) | Getting your pages cited inside AI-generated answers (ChatGPT, Google AI Overviews), not just ranked on a results page (`prompts/_CONTEXT.md`, `components/sections/HeroProbe.tsx`) |
| AEO (answer engine optimization) | The answer-engine slice of the same work; optimizing to be the source an AI answer names (`docs/strategy/career-path/02-scope-and-positioning.md`) |
| The Revenue Engine | The productized done-for-you system for local-service businesses: capture, respond, book, recover, prove (`app/(site)/revenue-engine/page.tsx`) |
| Engine vs. fuel | Ads are fuel the client owns at cost; the engine is the system that converts demand they already have, and keeps producing with the ads off (`components/sections/revenue-engine/EngineVsFuel.tsx`) |
| System-attributed revenue | The second line on the monthly report — recovered calls, follow-up, reactivation, review-driven organic — measured in the client's own dashboard, not estimated (`components/sections/revenue-engine/Guarantee.tsx`) |
| Revenue Leak Audit | The free ~20-minute diagnosis that shows an owner their own numbers: missed calls, response time, Google profile, the follow-up gap. Theirs to keep (`docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`) |
| The demand system | Earned, paid, and owned channels that each enter the funnel where the buyer actually is, run as one system (`components/sections/DemandSystem.tsx`) |

> Term-capture is required on every content task: gloss each domain term in plain
> words right after it, then run `node scripts/glossary-queue.mjs add "<term>" … --source <type>:<slug>`.
> (`prompts/_CONTEXT.md`)

---

## Brand Voice

Operator register, taken from the live site copy. Match it exactly.

**Tone:** Plain, confident, owner-to-owner. Anti-marketing — no fluff, no hype. Concrete over abstract. Trade-off-aware. First-person plural ("we") on the services/industrial side; first-person singular ("I") on the Revenue Engine, where the operator speaks directly. (`prompts/_CONTEXT.md`, `docs/strategy/multi-vertical-pivot/01-pillar-storyboard.md`)

**Style:** Terse, declarative. "X, not Y." constructions ("Not ten vendors. One system."). Numbers before adjectives. Vary sentence length — short fragments against longer lines. Lead with the outcome in the reader's words; demote jargon to a second clause or cut it. (`prompts/_CONTEXT.md`, `docs/strategy/icp/industrial-distribution.md`)

**Personality:** Expert, blunt, honest, calm. "You are probably not Caterpillar." Confident enough to name what we don't do.

### 5–8 concrete voice rules (with do/don't from shipping copy)

1. **Lead with the outcome in the reader's words.**
   - Do: "Buyers ask AI. Be the answer." (`HeroProbe.tsx`)
   - Don't: open with "Leveraging generative AI to elevate your organic visibility…"

2. **Numbers before adjectives.**
   - Do: "47 hours is the average reply — by then the job's booked with whoever picked up." (`01-pillar-storyboard.md`)
   - Don't: "lightning-fast response times."

3. **Name what you DON'T do, early and specifically.** Fastest trust signal for a burned buyer.
   - Do: "No markup on your ads. I don't resell your leads. Keep your ads guy." (`EngineVsFuel.tsx`)
   - Don't: "full-service, end-to-end growth partnership."

4. **"X, not Y." Terse and declarative.**
   - Do: "Published model. No games on a call." / "Not ten vendors. One system." (`RevenuePricing.tsx`, `DemandSystem.tsx`)
   - Don't: "We pride ourselves on transparent, collaborative pricing conversations."

5. **Demote jargon to a second clause, or cut it.** Buyer, not practitioner.
   - Do: "a site AI can actually read." (`FrameworkTimeline.tsx`)
   - Don't: "schema markup and structured-data optimization."

6. **Stay calm. No manufactured urgency.** Max one exclamation on a page (prefer zero), one em-dash per paragraph. No countdowns, no false scarcity — it reads scammy to this buyer. (`01-pillar-storyboard.md`)

7. **Proof beside the claim it backs**, never quarantined in a separate section. (`01-pillar-storyboard.md`)

8. **Reframe every replacement fear as additive.** The ads guy, the Google rep, the front-desk staff all stay and perform better. (`01-pillar-storyboard.md`)

### Kill-list (short)

leverage, utilize, seamless, robust, scalable, holistic, cutting-edge, world-class, unlock, supercharge, elevate, empower, game-changer, "not just X but Y," rule-of-three padding, em-dash overuse, hedging filler ("it's worth noting," "that said"), manufactured urgency, "guaranteed rankings," "full-service agency," "digital marketing agency."

### Before / after

- ✗ "We leverage cutting-edge AI to seamlessly elevate your organic visibility — unlocking next-level growth across the ever-evolving search landscape."
- ✓ "We get your pages quoted in AI answers, so buyers find you before they find a competitor." (`HeroProbe.tsx` lede + humanizer skill on file)

---

## Proof Points

**Canonical stats — single source of truth, locked 2026-05-19 (`lib/stats.ts`).** No live page may contradict these:
- $378M revenue driven for clients
- 91% client retention rate
- 2.5x average ROI in 12 months
- 96 Net Promoter Score
- 5.2x average client ROI (lifetime)
- $575k annual ARR added per client

> The 2.5x (12-month) and 5.2x (lifetime) figures coexist on purpose — the labels
> distinguish the windows. Confirm intent before collapsing. (`docs/strategy/case-studies/fact-ledger.md`)

**Case-study numbers (anonymized in Sanity; verify before any public reuse — see hazards below):**
- Catalog AI flagship: qualified leads 1,840 → 2,640/mo (+43.5%, +800/mo), no new ad spend, Aug 2024 – Jan 2025. (`docs/strategy/case-studies/fact-ledger.md`)
- Editorial Authority: AI-answer citations 4 → 34 (×8.5), organic leads 2×, over a 24-week retainer. (`docs/strategy/case-studies/fact-ledger.md`)
- Headless replatform (same hydraulics client): 8,500 SKUs, Next.js + Shopify Hydrogen, 6 months. Growth claims live only on the Catalog AI study, not here. (`docs/strategy/case-studies/fact-ledger.md`)
- Greenfield OEM launch: first AI-answer citation inside 12 weeks, 22k SKUs, Next.js + Saleor. (`docs/strategy/case-studies/fact-ledger.md`)
- Fasteners migration: CLS 0.31 → 0.02, plugins 61 → 4, 12k SKUs / 17 brands, 10 weeks. (`docs/strategy/case-studies/fact-ledger.md`)

**Logo strip / named clients on the live trust strip:** Deventor, Modern Wood Flooring, Northern Hydraulics, Hosebox, Longhorn. (`lib/client-logos.ts`)

### Client-naming rules (read before using any name)

- **Disclosure is a first-class field.** Every case study is `named`, `anonymized`, or `composite`, and the badge is shown to the reader. `anonymized` asserts a real engagement with the name withheld; `composite` asserts numbers aggregated from several engagements describing no single client. Calling a composite "anonymized" overstates; calling a real engagement "composite" needlessly weakens it. (`components/sections/case-studies/service-meta.ts`, `docs/strategy/case-studies/fact-ledger.md`)
- **Naming hazard — hard block (Northern Hydraulics).** Do **not** set a `publicName` or flip any hydraulics case study to `named` until resolved. "Northern Hydraulics" is a *real* logo-strip client (`lib/client-logos.ts`, northernhydraulics.net) that an old v2-1 prototype wrongly described as "a representative composite." The hydraulics studies must be confirmed as a real, consenting client before any naming. (`docs/strategy/case-studies/fact-ledger.md`)
- **~12K-SKU collision.** The automation distributor and the fasteners distributor are different companies that both sit near 12k SKUs. Keep them distinct. (`docs/strategy/case-studies/fact-ledger.md`)
- **Verify before publishing.** Definitions and stats must check against current sources; never publish a fabricated "real-world example" — write a clearly-illustrative scenario instead. The original build's adversarial verify pass caught real errors. (`prompts/_CONTEXT.md`)

---

## Guarantee & Risk Reversal

Two different stances by side — keep them straight:
- **Revenue Engine (local-service):** a stated, falsifiable guarantee. "If system-attributed revenue doesn't exceed my fee by day 90, I work free until it does." (`components/sections/revenue-engine/Guarantee.tsx`)
- **Industrial / services side:** a **no-guarantee** disclaimer stance. A retired "Double your investment" guarantee lives only in dead, un-imported components and directly contradicts the disclaimer — do not reinstate or re-import it. (`docs/strategy/case-studies/fact-ledger.md`)

---

## The Authority Hub (a distinct content arm — different rules)

Sale Solution also runs a wiki-style learning hub: a **glossary** of AI-search terms (`/glossary/`) and **career paths** for AI-search roles (`/career-paths/`). It is NOT measured on leads or revenue — measure it on referring domains, AI citations (Ahrefs Brand Radar), and third-party use of our terms. Career/glossary traffic doesn't convert, and that's expected. (`prompts/_CONTEXT.md`, `docs/strategy/career-path/02-scope-and-positioning.md`)

Locked rules for this arm:
- **"We don't hire from these paths."** Pure authority/citation — no recruiting framing, no rates page. (`docs/strategy/career-path/02-scope-and-positioning.md`)
- **"Citation engineering" is not ours to coin** — it's in active public use. Frame it as "a citation-focused slice of GEO/AEO," and always disambiguate from local-SEO "citation building" (NAP directory listings). (`prompts/_CONTEXT.md`)
- Every example is saturated with industrial e-commerce detail so the hub reinforces the vertical, not just the discipline. (`prompts/_CONTEXT.md`)

---

## Goals

**Two funnels, two doors — do not merge** (`docs/strategy/multi-vertical-pivot/00-phase-plan.md`):
- **Industrial / services side:** primary conversion is **Book a Growth Call** (`/book-growth-call/`); a written diagnostic (`/unlock-growth-audit/`) is the secondary door. (`lib/navigation.ts`)
- **Revenue Engine side:** primary conversion is the **Revenue Leak Audit**, only on `/revenue-engine/*`. The audit is a diagnosis the owner keeps, not a sales call. (`docs/strategy/multi-vertical-pivot/00-phase-plan.md`, `01-pillar-storyboard.md`)

**Nav today:** Services · Who We Serve (Industrial & Technical B2B / Home Services / Dental Practices) · Case Studies · Framework · Insights · Contact. Primary call-to-action: Book a Growth Call. (`lib/navigation.ts`)

---

## TODOs (flag, don't invent)

- **Canonical address is contested.** Three addresses appear on the live site. The locked one is 17071 W Dixie Hwy, North Miami Beach, FL 33160; the other two need sweeping at cutover. Phone 561-531-4339; emails leads@ / connect@salesolution.net. (`lib/business.ts`) — **TODO:** confirm the sweep is done before quoting NAP anywhere.
- **Tagline lags the pivot.** `business.tagline` still reads "AI-Driven SEO for Technical B2B & Industrial E-commerce" while the business is now multi-vertical. **TODO:** decide whether to update the canonical tagline. (`lib/business.ts`, `prompts/_CONTEXT.md`)
- **Case-study disclosure decisions are open.** All five studies are seeded `anonymized` as a safe default, not a verified decision. Engagement windows for four studies are placeholder years. **TODO (owner-only):** set disclosure per study and supply real windows + source artifacts before treating any number as locked. (`docs/strategy/case-studies/fact-ledger.md`)
- **GHL Revenue Leak Audit embed** is pending an embed ID from Artur; the audit funnel isn't fully wired. **TODO.** (`docs/strategy/multi-vertical-pivot/00-phase-plan.md`)
- **Revenue Engine dollar price** is deliberately not published cold and depends on trade/location/scope; it's delivered in the audit. No fixed monthly figure was found in the repo. **TODO:** if a content piece needs a price band, get it from Artur. (`components/sections/revenue-engine/RevenuePricing.tsx`)
- **Testimonials:** quote attributions exist in older marketing material but the repo's fact ledger flags them as needing client approval. **TODO:** capture approved, verbatim testimonials before reuse. (`docs/strategy/case-studies/fact-ledger.md`)
- **"Revenue Engine" is a working name**, renameable before it leaves orphan stage. (`docs/strategy/multi-vertical-pivot/00-phase-plan.md`)
- **No GSC/GA baseline numbers** were pulled into this doc (engine `data.gsc_dir`/`data.ga_dir` not yet populated). **TODO:** add current-metrics figures once Search Console is connected (SAL-405). (`project.yaml`)
