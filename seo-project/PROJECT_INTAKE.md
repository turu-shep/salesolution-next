# SEO Content Strategy — Project Intake

**Project:** Sale Solution — Content Refresh & Build (2026)
**Initialized:** 2026-05-22 (filled from codebase by Claude — gaps marked `?? NEEDS INPUT`)
**Status:** Draft — awaiting Artur's confirmation on flagged items

---

## 1. Client & Business Context

**Client name:** Sale Solution (legal: Sale Solution)
**Website URL:** https://salesolution.net
**Industry / niche:** AI-driven SEO / Generative Engine Optimization (GEO) for technical B2B & industrial e-commerce
**Business model:** Services — productized engagements + retainers
**Physical locations:** 17071 W Dixie Hwy, North Miami Beach, FL 33160 (operator-led; serves global clients online)
**Average deal size:** Sprint $12–24k (one-off, 4 weeks) · Operator Retainer $8–14k/mo · Embedded from $28k/mo. Typical entry point is Retainer (~$96–168k ARR per client)
**Primary revenue source:** Service fees (no products, no ads, no subscriptions)

### What does this business do? (2-3 sentences)
> Sale Solution is an operator-led AI-search consultancy that engineers how Google AI Overviews, ChatGPT, Perplexity, and AI-shopping surfaces cite a brand's category. Vertical focus on industrial e-commerce — hydraulics, MRO, technical distribution — where structured-data depth and engineering-grade content authority decide who gets cited inside the SERP versus who loses the click. The single-operator model (Artur Shepel) owns strategy, schema, content, and reporting end-to-end; no agencies-of-agencies, no PM layer.

### Who is the target customer?
> Director-of-Marketing / Head-of-Ecom / Founder at a technical-distribution or industrial e-commerce business doing $200k+/mo. The buyer is technically literate (engineers a lot of the time), buys based on competence signals not pitches, and has noticed AI Overviews eating their click-through despite holding rank. Often running on WooCommerce or headless, occasionally Shopify. Decision-maker either owns P&L or reports directly to it.

### What's the primary goal for this SEO project?
- [x] **Increase qualified-lead inflows** (the site is the lead-gen engine for the consultancy)
- [x] **Build topical authority for AI-search / GEO** so Sale Solution is the source AI engines cite when industrial buyers ask "how do we get cited in AIO?"
- [x] **Update existing 19 migrated blog posts** to current quality + 2026 voice + GEO framing
- [ ] Drive product/collection page visits — N/A (services site, no catalog)
- [x] Local search visibility (secondary) — service-areas pages exist, low priority

---

## 2. Product / Service Structure

### Service Categories (the "money pages")

```
Services hub: /services/
  ├── /services/ai-seo/                                  ← Generative Engine Optimization (flagship)
  ├── /services/content-writing-services/                ← Content writing — managed
  ├── /services/website-content-writing-packages/        ← Productized content packages (explicit pricing $500 → $15k/mo)
  ├── /services/website-development-design-services/     ← Web dev / design
  └── /services/outbound-email-marketing-services/       ← Outbound email
```

### Key Money Pages

| Page | URL | Why it matters |
|------|-----|----------------|
| AI-SEO / GEO service | `/services/ai-seo/` | Flagship offer — highest-margin, anchor for topical authority |
| Content packages | `/services/website-content-writing-packages/` | Only page with explicit pricing — direct-conversion |
| Free Growth Audit | `/unlock-growth-audit/` | Top-of-funnel lead magnet (60-pt audit, 24h turnaround) |
| AI Search Survival | `/future-proof-your-seo/` | Pain-point lead magnet (10-min checklist) |
| Book Growth Call | `/book-growth-call/` | Direct booking funnel |
| Constraint Sprint | `/constraint-sprint/` | Mid-funnel productized offer |
| Contact | `/contact-me/` | Multi-step qualifying form |

### Site Taxonomy / Navigation

**Attached file:** [x] live `app/sitemap.ts` (renders from Sanity at build time) — see also `docs/strategy/initial migration/02-information-architecture.md`

Proposed IA (already implemented in Next.js):
```
/                              ← home
/services/[slug]/              ← 5 service pages
/<post-slug>/                  ← 19 blog posts at root (preserved from WP for SEO)
/category/blog/                ← blog hub
/guides/[slug]/                ← 9 guides
/career-paths/[slug]/          ← 2 career paths
/service-areas/                ← local SEO hub (state/city pages reserved)
+ lead-gen funnels (unlock-growth-audit, future-proof-your-seo, book-growth-call, constraint-sprint)
+ legal pages
```

---

## 3. Current Search Performance

### Google Search Console Data
- [ ] **Pages export (CSV)** — Artur to drop into `seo-project/data/gsc-pages.csv`
- [ ] **Queries export (CSV)** — Artur to drop into `seo-project/data/gsc-queries.csv`
- **Date range covered:** Recommend last 16 months (max GSC depth) + last 28 days separately
- **Mode:** **Manual CSV exports** — confirmed 2026-05-22

### Google Analytics / Traffic Data
- **Monthly organic sessions:** To extract from GA4 (optional — GSC clicks is the primary lens)
- **Top landing pages by traffic:** Derivable from GSC Pages.csv
- **Conversion rate from organic:** GA4 event extract optional (`seo-project/data/ga4-organic.csv`)
- **Revenue from organic:** Lead-to-deal attribution is offline (calls/proposals); not modeled in GA4

### Current Rankings Snapshot
- **Approach:** Work from GSC position data + manual SERP checks on locked target queries
- **Ahrefs MCP:** Available but **not used** for this round per Artur's preference for manual CSV inputs

---

## 4. Competitor & Keyword Research

### Competitor Framing (locked 2026-05-22)

**Approach:** Skip agency-vs-agency competitive analysis. Competitor set = **whoever ranks for the GEO + industrial-buyer query universe we want to own**, derived from SERPs of the locked target keyword set.

That means:
- For each target query in the keyword set, pull the top 10 SERP results
- Group results by domain → the highest-frequency domains across our query universe = our real competitor set
- Typical mix to expect: industrial publishers (Thomasnet content hub, GlobalSpec), search/AI publications (Search Engine Land, Search Engine Journal), vendor blogs (HubSpot, Semrush, Ahrefs), and any operator-led niche players

### Competitor Keyword Exports
- **Mode:** None upfront. SERPs are pulled per-keyword during Phase 1 Discovery against the locked target list.
- Artur can optionally drop competitor blog URL lists into `seo-project/data/competitor-urls.txt` (one URL per line) if there are specific industrial-niche players to benchmark.

### Target Keywords — Refresh Round (focus locked: refresh 19 existing posts first)

The keyword set for this round is **anchored to the 19 existing posts' current ranking footprint** (from GSC Queries.csv when provided) — not a net-new keyword build. The job is:

1. Identify which queries each existing post currently impresses/clicks on
2. Identify which adjacent queries it *should* rank for given a 2026 + GEO rewrite
3. Plot the refresh strategy per post (preserve winners, expand losers, layer in AIO-citation framing)

Inferred clusters that the 19 posts already touch (to be confirmed once GSC data lands):

> **Primary clusters (GEO/AI-search):** generative engine optimization, GEO vs SEO, AI Overview optimization, get cited in AI Overviews, schema for AI search, H-E-E-A-T, AIO ranking, ChatGPT SEO
>
> **Industrial vertical (LIGHT TOUCH — most existing posts are generalist):** industrial e-commerce SEO, hydraulics SEO, MRO SEO, technical distribution SEO, Thomasnet/GlobalSpec optimization
>
> **Existing-post clusters (the 19 posts cover):** B2B content writing, content strategy, keyword research (incl. long-tail), on-page SEO, technical SEO, off-page SEO, e-commerce conversion rate, content marketing, user intent, e-commerce funnel, traffic acquisition

> Industrial-vertical net-new content is **deferred to round 2**, after the refresh ships.

---

## 5. Existing Content

### Blog / Content Inventory
- [x] **Has existing blog content** — exactly **19 posts** migrated from WordPress (root-level URLs preserved), plus **9 guides** at `/guides/`
- [x] **Blog URL pattern:** `/<post-slug>/` (no `/blog/` prefix — kept for SEO continuity) + hub at `/category/blog/`
- [x] **Sanity categories defined:** SEO, GEO / AI Search, Content Marketing, Content Writing, B2B, B2B Marketing, E-Commerce, Marketing Strategy, Traffic, WooCommerce

**Full 19-post inventory** (from `docs/strategy/initial migration/02-information-architecture.md`):

| Slug | Last mod | Likely refresh priority |
|------|----------|------------------------|
| /content-marketing-101/ | 2025-10-23 | LOW — recent |
| /generative-engine-optimization-basic-to-advanced/ | 2025-10-21 | LOW — recent, GEO-aligned |
| /the-art-of-profitable-words-mastering-b2b-content-writing/ | 2024-04-01 | MED |
| /direct-vs-organic-traffic-differences-acquisition/ | 2024-04-01 | MED |
| /seo-mastery-enhancing-visibility-customer-attraction/ | 2024-04-01 | HIGH — pre-AIO era SEO content |
| /on-page-seo-mastery-from-visibility-to-conversion/ | 2024-04-01 | HIGH |
| /technical-seo-mastering-website-optimization/ | 2024-04-01 | HIGH |
| /seo-strategy-template-2024-guide-goals-and-kpi/ | 2024-04-01 | HIGH — "2024" stale, KPI list pre-AIO |
| /crafting-an-effective-e-commerce-funnel-for-2024/ | 2024-02-23 | HIGH — "2024" stale |
| /which-reports-indicate-how-traffic-arrived-at-a-website/ | 2024-02-23 | MED |
| /strategies-to-increase-e-commerce-conversion-rate/ | 2024-02-23 | MED |
| /mastering-e-commerce-content-writing-guide-2023/ | 2023-11-11 | HIGH — "2023" stale |
| /what-is-content-writing-master-the-science-of-web-writing-in-2023/ | 2023-11-03 | HIGH — "2023" stale |
| /user-intent-seo-guide-to-search-behavior-understanding/ | 2023-10-24 | MED |
| /off-page-seo-in-depth-guide/ | 2023-10-24 | HIGH |
| /b2b-data-driven-marketing-no-more-guesswork/ | 2023-09-01 | MED |
| /content-strategy-expert-backed-guide-2023/ | 2023-08-30 | HIGH — "2023" stale |
| /ultimate-guide-mastering-keyword-research-2023/ | 2023-08-30 | HIGH — "2023" stale |
| /long-tail-keywords-blueprint-2023/ | 2023-08-30 | HIGH — "2023" stale |

- [x] **Top performing posts** — `?? NEEDS INPUT or PULL FROM GSC/AHREFS`

### Content Gaps / Known Weaknesses

> **Apparent gaps from inventory analysis (Claude's read):**
> - **Zero industrial-vertical posts** — site copy targets hydraulics/MRO/technical-distribution buyers, but the blog reads like a generalist content-marketing blog. Major positioning gap.
> - **GEO/AI-search coverage is thin** — only 2 posts (`generative-engine-optimization-basic-to-advanced`, `content-marketing-101`) reflect post-AIO reality. The 17 older posts treat search as pre-AI.
> - **No technical schema/structured-data deep-dives** — despite schema being the flagship competence. The "Foundations" tab on the homepage promises Product, compatibility-matrix, and AIO-parseable schema content that doesn't exist in the blog.
> - **No case studies / proof-content** — homepage cites "Northern Hydraulics 87% citation share" but there's no long-form post backing it.
> - **No buyer-side content** — nothing aimed at the "we're losing AIO clicks, what now?" persona who comes via `/future-proof-your-seo/`.

---

## 6. Brand & Voice

### Brand Voice
- [x] **Technical / expert** (primary)
- [x] **Authoritative** (no hedging)
- [x] **Direct / engineering-flavored** (operator voice, not marketing voice)
- [x] **Premium B2B** (published prices, no chase-the-lead behavior)

> **Voice signature (extracted from on-site copy):**
> - Big-statement headlines in a display serif; monospace eyebrows for metadata
> - "Engineered" / "engineering" framing throughout — pages are *engineered*, content is *engineered*, AI surfaces are *engineered to cite us*
> - Numbers and proof artifacts (JSON-LD snippets, citation cards, channel-presence bars) embedded into copy as visual proof, not decoration
> - Anti-agency language: "no PM layer", "no agencies of agencies", "one operator owns it", "published prices"
> - "Probe" / "instrument" / "operator" recur as identity words
> - Plain-spoken on outcomes: "The click is moving inline." / "AI Overviews answer more queries inside the SERP." / "Past keywords, into authority."
> - Uses em-dashes liberally, semicolons sparingly — feels written by a person, not a content team

### Key Differentiators

> 1. **Single operator owns strategy, schema, content, reporting** — vs. typical agency stitching 4 sub-vendors
> 2. **Industrial-vertical specialization** — hydraulics, MRO, technical distribution; not generalist
> 3. **Published prices** — Sprint $12–24k / Retainer $8–14k/mo / Embedded from $28k/mo
> 4. **24-hour written SOWs**
> 5. **90-day exit clause** — no annual lock-in
> 6. **GEO-first weighting** (60% GEO / 40% SEO on most engagements) — not retrofitted-SEO
> 7. **Founder-led delivery** — Artur Shepel, not an account manager

### Words to Use / Avoid

**Use:** engineered, engineering, operator, instrument, citation, AIO, GEO, schema, structured data, technical buyer, industrial e-commerce, hydraulics, MRO, technical distribution, AI Overview, parser, parseable, H-E-E-A-T, citation share, AIO citation coverage, vertical, published prices, fixed scope, 24-hour SOW, 90-day exit

**Avoid:** synergy, leverage (as verb), unlock potential, holistic, partner with (as B2B platitude), digital transformation, "in today's fast-paced", "let's connect", "thought leadership" (use "authority" instead), generic "results-driven", AOR / agency-of-record framing, "10x your X", "skyrocket", emoji in body copy

---

## 7. Constraints & Preferences

### Content Volume & Pace
- **Posts per week:** `?? CONFIRM — recommend 2 refresh-passes per week (10 HIGH posts in 5 weeks)`
- **Who writes the content:** **AI-drafted, Artur edits** (locked 2026-05-22). Workflow: Claude produces brief → Claude drafts full post per brief → Artur edits for voice, proof, and final publish.
- **Typical post length:** 2,500–4,500 words (matches the published "Niche/Vanguard" content packages — eat your own dog food)
- **Budget for content production:** N/A — internal

### Timeline & Milestones
- **Start date:** 2026-05-22
- **Deadlines:** `?? NEEDS INPUT — none locked. Suggested: HIGH-priority refresh batch (10 posts) complete by end of Q3 2026.`
- **Reporting cadence:** Self-managed; no external reporting required

### Technical Constraints
- **CMS/Platform:** Sanity (recently migrated from WordPress — see `docs/strategy/initial migration/`)
- **Can you publish directly?** [x] Yes — Artur owns publish
- **Schema markup capability:** [x] Yes — full Article/FAQPage/BlogPosting JSON-LD already wired in `lib/schema.ts`; Sanity post schema supports FAQ array
- **Site speed concerns:** [ ] No — Next.js 16 + Vercel, sub-second loads are table-stakes for the offer

---

## 8. Project Focus & Priorities

### What category / topic should be the PRIMARY focus?

> **LOCKED 2026-05-22 — Refresh existing 19 posts first.**
>
> Order of attack:
> 1. **Phase A — Refresh 10 HIGH-priority posts** (the "2023" / "2024" titled ones + pre-AIO SEO/funnel posts). See Section 5 inventory for the list.
> 2. **Phase B — Refresh remaining 9 MED/LOW posts** as a second wave.
> 3. **Phase C (deferred to round 2)** — net-new industrial-vertical pillars + GEO authority pillars. Not in scope for this round; revisit after Phase A ships.

### What should explicitly NOT be prioritized?

> **Claude's suggestion (confirm):**
> - Generalist SEO 101 content (already saturated; not differentiating)
> - Mobile-app marketing / SaaS-vertical posts
> - Affiliate-style "best X tool" listicles
> - Anything that requires posing as a generalist agency

### Is there a specific angle the client cares about?

> **GEO-first + industrial-vertical + operator-led** — but for THIS round (refresh), the angle is "drag every existing post forward into the post-AIO era while preserving any SEO equity it has." Industrial-vertical reframing is a *secondary layer* on each post where it fits the topic; primary lift is 2026 voice + GEO citation framing + schema depth.

### What does the client need to see first?

> Sequence for this round:
> 1. **Discovery summary** — GSC read of which of the 19 existing posts are bleeding impressions, holding rank, or already winning. Output: per-post status table.
> 2. **Refresh plan** — for each of the 10 HIGH-priority posts: target query map (preserve + expand), GEO angle, CTA mapping to money page, structural changes, schema additions.
> 3. **Per-post brief** before drafting each one (so Artur edits efficiently downstream).
> 4. **Editorial calendar** — refresh order + publish dates once Phase A plan is approved.

---

## 9. Deliverables Needed (refresh round)

- [x] **SEO audit** — read of existing 19 posts against GSC Pages.csv + Queries.csv
- [x] **Refresh plan** — per-post status + target query map + GEO angle + CTA mapping
- [x] **Editorial calendar** — refresh order + publish dates for the 10 HIGH posts
- [x] **Content briefs** — per-post brief before drafting (target keywords, structure, schema additions, internal links)
- [x] **Written articles (refreshed)** — Claude drafts → Artur edits. Output: Sanity-ready content (portable text blocks, FAQ array, SEO fields). Pipeline-to-Sanity adapter still TBD; first 1–2 refreshes will hand-port to validate workflow.
- [ ] **Client presentation** — N/A (internal)
- [ ] **Revenue projections** — defer; lead-to-deal is offline, hard to model in a refresh context
- [x] **KPI tracker** — per-post: clicks, impressions, CTR, position (before/after) + AIO citation observed (manual SERP check)
- [ ] **Programmatic SEO** — defer to round 2
- [x] **Internal linking map** — blog → `/services/*` / `/unlock-growth-audit/` / `/book-growth-call/` CTA strategy (built into per-post briefs)
- [x] **SERP-derived competitor view** — output from Phase 1 keyword work, not a standalone deck

---

## 10. Files Attached

| File | Type | Description |
|------|------|-------------|
| _(none yet)_ | | Awaiting GSC export or Ahrefs MCP pull |

**Inputs already available in-repo:**
- `docs/strategy/initial migration/02-information-architecture.md` — full URL inventory
- `docs/strategy/initial migration/03-content-inventory.md` — page-by-page template breakdown
- `docs/strategy/initial migration/05-seo-strategy.md` — migration & schema parity plan
- `lib/business.ts` — NAP / brand identity / founder info
- `docs/strategy/design-tokens.md` — extracted brand colors and typography
- `sanity/schemas/post.ts` — current content model (title, slug, description, body, faq, category, tags, seo, related)

---

## 11. Secondary — Deeper Context

### SEO History & Site Health

**Has this site worked with an SEO agency or consultant before?**
- [x] No — self-managed by Artur (founder is the practitioner)

**Any known Google penalties or manual actions?** `?? NEEDS INPUT — assume no, but worth confirming`

**Domain age:** salesolution.net has been live since at least 2023 based on Sanity post `publishedAt` dates and original WP migration timestamps. `?? Confirm registration year for accurate DR baselining`

**Domain authority / rating:** `?? NEEDS INPUT — pull via Ahrefs MCP site-explorer-domain-rating`

**Approximate number of referring domains:** `?? NEEDS INPUT — Ahrefs MCP`

**Past or current link building activity?** `?? NEEDS INPUT`

**Has the site ever experienced a significant traffic drop?** `?? NEEDS INPUT` — note: the recent WP→Next.js migration (May 2026) is a candidate event; verify post-migration ranking is stable

---

### Access & Credentials

| Resource | Have access? | Notes |
|----------|-------------|-------|
| Google Search Console | `?? CONFIRM` | Likely yes (founder owns the site) |
| Google Analytics (GA4) | [x] Yes | GA4 wired in code (`@next/third-parties`) |
| CMS / admin panel | [x] Yes | Sanity Studio at `/studio` (founder owns) |
| Ahrefs / SearchAtlas / SEMrush | [x] **Ahrefs (via MCP)** | This Claude session has Ahrefs MCP connected |
| Google Business Profile | `?? CONFIRM` | Address inconsistency noted (D5 locked 2026-05-19 in `lib/business.ts`) |

**Can the website be accessed directly?** [x] Yes — publicly accessible, no geo-block, no auth wall

**Who can publish content to the site?** Artur Shepel (founder)

---

### Stakeholders & Approval Workflow

**Primary point of contact:** Artur Shepel (a.shepel@salesolution.net)
**Who approves content?** [x] Artur publishes directly — no external approval gate
**Final decision-maker on strategy direction:** Artur Shepel
**Communication preference:** `?? — assume Claude session + GitHub/Linear for project work`

---

### Success Criteria & KPIs

**Claude's read from on-site copy:**
> Success metrics emphasized on `/services/ai-seo/`:
> - Revenue / ARR (primary)
> - AIO citation coverage on target queries
> - Citation share vs. competitors
> - Schema completeness rate
> - Qualified-lead inflows segmented by intent

**Specific KPIs (rank):** `?? CONFIRM — suggested order:`
- 1 — Qualified-lead inflows from organic
- 2 — AIO citation coverage on target GEO queries
- 3 — Citation share vs. named competitors (once list is locked)
- 4 — Organic sessions on `/services/*` money pages
- 5 — Keyword rankings (top 3, top 10 — leading indicator only)

**Target revenue/traffic number:** `?? NEEDS INPUT`

**When does the client expect to see measurable results?**
- [x] **1–3 months** — refresh-driven CTR + impression lift on the 19 existing posts
- [x] **3–6 months** — new GEO-authority content ranking + first AIO citations
- [x] **6–12 months** — full topical authority + measurable lead lift attributable to the content engine

---

### Seasonal & Timing Factors

**Does this business have seasonal peaks?** `?? — B2B services typically dip Dec/Aug; ramp Jan/Mar/Sep. Confirm.`

**Upcoming events, launches, promotions to align with?** `?? NEEDS INPUT`

---

### Conversion & Revenue Intelligence

**Which existing blog posts have led to actual sales or conversions?** `?? NEEDS INPUT — pull from GA4 attribution if event tracking covers blog→form flow`

**Typical customer journey:** Inferred from funnel artifact on home page (12,480 spec views → 4,920 compat-checks → 1,620 quote requests → 312 POs = 2.5% spec→PO). For Sale Solution itself (not the client funnel illustrated): `blog post → /unlock-growth-audit/ or /future-proof-your-seo/ → multi-step form → call booking → proposal → close`. Estimated 1–4 weeks from first touch to call. `?? CONFIRM`

**Customer journey length:** [x] **1–4 weeks** (likely) `?? CONFIRM`

**Conversion tracking:**
- [x] GA4 wired (see `docs/strategy/ga4.md`)
- [x] CTA-attribute tracking via `data-cta` / `data-cta-location` on Links (confirmed in `HeroProbe.tsx`)
- `?? CONFIRM event/conversion taxonomy in GA4 admin`

---

### Geographic & Local SEO

**Primary geographic markets:** US (English) — likely emphasis on US industrial buyers. North Miami Beach is the registered address but client base is national/global.

**Google Business Profile(s):** `?? CONFIRM — address inconsistency flag (D5) suggests GBP cleanup is overdue`

**Local competitors differing from national:** Probably none — this is a national/online consultancy, not a local service

**Location-specific content:**
- [x] **Maybe** — `/service-areas/` exists; state/city pages reserved. Defer until refresh + GEO pillars are done.

---

### Content Production Details

**Brand guidelines / style guide:** [x] Yes — `docs/strategy/design-tokens.md` covers visual; the brand voice in Section 6 above codifies copy voice (extract from live components)

**Legal / compliance constraints:** None known (services business; no FDA/financial constraints)

**Existing product photography / imagery:**
- [x] **Logo + favicon assets** in `app/` (`apple-icon.tsx`, `icon.tsx`, `opengraph-image.tsx`, `logo.png`)
- [x] **Stock industrial photos** likely in `public/` — `?? verify`
- AI-generated images planned for blog hero/lifestyle shots (matches the Content Pipeline template's image-gen workflow)

**Preferred content formats beyond blog posts:**
- [x] Blog posts (primary)
- [x] Guides (long-form, already 9 published)
- [x] SVG infographics (matches Content Pipeline template)
- [ ] Video — `?? OPEN — would unlock multimodal AI surface coverage; Artur's call`
- [x] Newsletter ("Weekly Turbulence Brief" referenced on `/future-proof-your-seo/`)

---

### Competitive Intelligence (Deep Dive)

**What do competitors do better?** `?? NEEDS INPUT — Artur's read`

**What does Sale Solution do better?** Operator-led delivery, vertical specialization, published prices, engineering-grade artifacts (JSON-LD, citation cards) embedded into marketing copy

**Competitor blog posts / content to emulate?** `?? NEEDS INPUT`

**Competitors NOT to be compared to?** `?? NEEDS INPUT`

---

### Technical SEO Baseline

**Mobile-responsive:** [x] Yes — Next.js 16 + Tailwind 4, responsive-first
**Site speed:** Should be excellent (Next.js + Vercel). `?? Verify with PSI on key pages`
**HTTPS:** [x] Yes
**Known technical issues:**
- D5 address inconsistency (locked 2026-05-19; GBP + WP-era citations need sweeping)
- WP `/wp-content/uploads/...` image paths need to continue resolving (handled in recent commits — `301-redirect legacy /wp-content/uploads/`)
- Trailing-slash convention preserved (`trailingSlash: true`)
**Structured data / schema:** [x] **Yes — comprehensive.** Article + FAQPage + BlogPosting JSON-LD wired via `lib/schema.ts`. Organization/Place/WebSite per Rank Math `@graph` migration plan. Sanity post schema includes native FAQ array.

---

## Quick-Start Scenario Match

**This project is best modeled as a hybrid of:**
- **Scenario D (Content refresh / audit)** for the 19 existing posts
- **Scenario A (Established site with Search Console data)** for net-new content planning — *once GSC is pulled*

---

## Next Actions

1. **Artur drops GSC exports** into `seo-project/data/`:
   - `gsc-pages.csv` — last 16 months, GSC → Performance → Pages → Export
   - `gsc-queries.csv` — last 16 months, GSC → Performance → Queries → Export
   - *(Optional)* `ga4-organic.csv` — top organic landing pages with sessions + events
2. **Claude runs Phase 1 Discovery** per `WORKFLOW_CHECKLIST.md`:
   - Match each of the 19 posts to its current GSC footprint (clicks, impressions, CTR, position)
   - Cluster the queries each post owns/should-own
   - Output: per-post status table + refresh-priority confirmation
3. **Claude produces Refresh Plan** — per-post target query map + GEO angle + CTA + schema additions
4. **Artur reviews → Claude drafts post #1** as a workflow-validation pass
5. **Iterate on cadence (target: 2 refreshes/week)**

---

## Decisions Locked (2026-05-22)

After Phase 1 Discovery (see `01-discovery-summary.md` and `02-refresh-plan.md`):

- **Focus:** Refresh existing posts first ✓
- **Production:** AI-drafted, Artur edits ✓
- **Data source:** Manual CSV exports (Pages.csv + Queries.csv, last 3 months) ✓
- **Competitor framing:** SERP-derived per locked keyword set, not agency-vs-agency ✓
- **Scope:** Tier A (4 deep refreshes) + Tier B (6 CTR-only rewrites) + Tier C (13 invisible-post diagnosis + dispositions) + brand audit ✓
- **Tier B ship pattern:** Single batch ✓
- **First Tier A draft:** A1 — B2B framework guide ✓
- **A1 template:** Claude drafts the template alongside the post ✓
- **Brand canonical name:** Keep "Sale Solution"; add `alternateName` schema only ✓ (shipped 2026-05-22 in `lib/schema.ts`)

## Open Questions Still Pending

Non-blocking; can be answered as we go:

1. **Posts/week pace going forward** — confirm 2/week or different?
2. **Tier C slug renames** — OK to rename C5/C7/C8/C10/C12 slugs with 301s, or preserve all current slugs?
3. **WP-era cruft cleanup** (`/sitemap/`, `/tag/marketing/`, `/tag/b2b-marketing/` indexed but not in Next sitemap) — 301 or noindex? Defer or address now?
4. **Top-performing existing posts** — derivable from GSC; flag here if you have priors that aren't reflected in the data.
5. **GBP / address cleanup (D5)** — defer to a separate workstream as discussed.
