# Phase 2 — Refresh Plan

**Date:** 2026-05-22
**Scope (locked 2026-05-22):** Tier A (4 deep refreshes) + Tier B (6 CTR rewrites) + Tier C (13 invisible-post diagnosis & disposition) + brand audit
**Date range of source data:** Last 3 months (per GSC default)
**Production workflow:** Claude drafts → Artur edits → publish via Sanity

---

## Diagnosis update (after Tier C indexation check)

Verified 2026-05-22 via sitemap inspection + WebFetch on sample of the 13:
- All 13 invisible posts ARE in `sitemap.xml`
- All return HTTP 200
- All are indexable (no `noindex`)
- All are full long-form articles (6,500–9,000 words each, dated 2023)
- `/crafting-an-effective-e-commerce-funnel-for-2024/` appears in Google `site:` results → confirmed indexed

**Conclusion:** Not a technical problem. They rank too deep (pos 100+) on the queries they target, OR target queries with no search volume on this property. Refresh effort on these is **higher** (deep rewrite with new angle), not lower. Tier C disposition table below proposes which to refresh, merge, or leave.

### Side findings (low-priority cleanup)
- `/sitemap/`, `/tag/marketing/`, `/tag/b2b-marketing/` indexed by Google but **not in the current Next sitemap**. WP-era cruft. → 301 or noindex.
- `/services/` page metadata in Google's cache reads "Digital Marketing Magic with Artur Shepel" — stale title carried over. → Force a re-crawl via GSC after this round's changes.

---

## Tier A — Deep refreshes (4 pieces)

For each: produce a brief → Claude drafts → Artur edits → publish.

### A1. `/guides/b2b-marketing-strategy-framework-with-example-7-step/` (GUIDE)

**Current state:** 375 impressions, pos 69, 0 clicks. **Biggest non-brand asset on the property.**

**Target query universe (~344 cluster impressions):**
- Primary: `b2b marketing strategy framework` (170 imp)
- Secondary: `b2b sales strategy framework` (93), `b2b marketing framework` (29), `b2b framework` (25)
- Long-tail: `b2b marketing strategy framework template`, `b2b digital marketing framework`, `b2b strategy framework`

**Angle for the refresh:**
- Reframe the 7-step framework explicitly for the **post-AIO B2B buyer journey**. Today's B2B framework content treats AI search as an afterthought; this version makes AIO citation and structured-data depth two of the seven steps.
- Lead with a downloadable framework template (matches the `template` long-tail) — wins the modifier query at scale.

**Structural changes:**
- Move from "guide-style article" → **framework + template** format (TOC at top, each of 7 steps gets a dedicated H2 with: definition / why it matters / how to apply / example).
- Add: section on AIO citation strategy as step in the framework
- Add: FAQ block (FAQPage schema) covering the long-tail variants (`b2b sales strategy framework` differences, `b2b framework template` request, `digital b2b framework` differences)
- Add: comparison table — generic B2B framework vs Sale Solution's 7-step
- Strengthen: case study / proof artifact section (citation card style — see homepage `ServicesTabs.CitationArtifact` for the visual idea)

**Schema:** Article + FAQPage. Consider HowTo schema for the 7-step structure.

**Internal links (mandatory):**
- → `/services/ai-seo/` (anchor: "GEO-driven B2B framework")
- → `/services/content-writing-services/` (anchor: "content strategy execution")
- → `/unlock-growth-audit/` (CTA at midpoint and end)

**Target meta (locked options):**
- Title: `B2B Marketing Strategy Framework: 7 Steps + Template (2026)` (under 60ch)
- Meta: `The 7-step B2B marketing strategy framework built for the AI-search era. Free downloadable template + framework example. Used to engineer B2B citations inside AI Overviews.` (under 165ch)

**Word count target:** 4,500–5,500 (long-form pillar)

**Open question for Artur:** Do we actually have a downloadable framework template to ship with this? If not, build it (it's the rank-driver for the `template` modifier).

---

### A2. `/which-reports-indicate-how-traffic-arrived-at-a-website/`

**Current state:** 202 impressions, pos 55, 0 clicks. **Best refresh candidate from the 19 posts.**

**Target query universe (~130 cluster impressions):**
- Primary: `which reports indicate how traffic arrived at a website` (20 imp, pos 40) + variants
- Secondary: `traffic website report` (72, 76), `what report shows which web pages get the most traffic and highest engagement?` (5, 61), `what report shows the percentage of traffic that previously visited a website?` (5, 62)
- Tertiary: `site traffic analysis reports`, `reports website traffic`, `traffic on website report`, `which reports show websites that send traffic to your pages`, etc.

**Angle for the refresh:**
- The original is generic. The refresh: this is a **GA4-era + AI-attribution** answer (GA4 replaced UA, GA4 has different report names), and the post needs to reflect that. Pure question-answering format wins this query type — short paragraph answers per question + a long-form deep-dive below.
- Specifically optimized for AI Overview citation: every section answers ONE common question in 2–4 sentences max, with the canonical GA4 report name and screenshot. AIO loves this format.

**Structural changes:**
- Top of post: **direct-answer block** for each of the high-impression long-tail variants — 6–8 question/answer pairs, each ~50 words.
- Body: GA4 reports tour (Acquisition → Traffic acquisition, User acquisition, Sources/Mediums). Annotated screenshots.
- New section: **"What AI search reports say about your traffic"** — covers the new behavior of AIO citation impressions, what changed since GA4.
- FAQ block schema mapping each long-tail query.

**Schema:** Article + FAQPage (must — every single one of the high-impression queries is question-format).

**Internal links:**
- → `/services/ai-seo/` (anchor: "AI-search traffic measurement")
- → `/future-proof-your-seo/` (anchor: "AIO citation tracking")
- → `/services/content-writing-services/`

**Target meta:**
- Title: `Which Reports Indicate How Traffic Arrived at a Website? (GA4, 2026)` (62ch)
- Meta: `The exact GA4 reports that show traffic source, percentage of returning visitors, and top-engagement pages. Updated for AI-search attribution.` (150ch)

**Word count target:** 2,800–3,500

---

### A3. `/future-proof-your-seo/` (LEAD-GEN PAGE — not a blog post)

**Current state:** 133 impressions, pos 34, 0 clicks. Lead-gen funnel page with a checklist offer.

**Target query universe (small but converting-intent):**
- `future-proofing seo audit` (3, pos 11)
- `futureproof seo` (3, 40)
- `future proof seo` (2, 69)
- `b2b seo agency` (3, 41)

**Angle for the refresh:**
- This is a funnel page, not a discovery page. The job is **convert + rank top-3 for the small but qualified `future-proof seo` queries**.
- Currently pos 34 = page 4 = page 1 within reach with strong on-page tuning.

**Structural changes:**
- Tighten H1 to literally match the query: `Future-Proof Your SEO: 2026 AI-Search Survival Checklist` (currently aimed at this but not phrased as the literal query).
- Add a short FAQ section near top answering: `What does future-proofing SEO mean?`, `Is SEO still worth doing with AI Overviews?`, `What's a future-proof SEO audit?`
- Strengthen schema: WebPage + FAQPage + Service.
- Already strong on conversion artifacts — preserve.

**Schema:** WebPage + FAQPage + Service + Organization (chained).

**Internal links:**
- Already wired well. Audit for new links FROM the refreshed Tier-A posts INTO this page (every Tier A piece should link here).

**Target meta:**
- Title: `Future-Proof Your SEO: 2026 AI-Search Survival Checklist | Sale Solution` (under 60ch — currently this length)
- Meta: tighten current to include "future-proof seo" exact phrase + "free audit checklist" + outcome promise. (Pull current copy to start.)

**Word count target:** Page-level — no change. Add ~400 words for the FAQ block.

---

### A4. `/b2b-data-driven-marketing-no-more-guesswork/`

**Current state:** 26 impressions, pos 41, 0 clicks. Small but coherent cluster around `data-driven b2b marketing`.

**Target query universe (~14 cluster impressions, low but qualified):**
- `data-driven b2b marketing` (5, 65)
- `data driven marketing b2b` (5, 66)
- `b2b data-driven marketing` (2, 92)
- `data driven b2b` (1, 56)
- `b2b data driven marketing` (1, 82)

**Angle for the refresh:**
- Tiny cluster, but ALL high-position (60–92). Means the post is too thin or off-target relative to what's ranking. Competitors at top likely cover **AI-driven** marketing data — refresh angle: data-driven marketing in 2026 = AI-augmented analytics + AIO citation tracking as a B2B intelligence signal.

**Structural changes:**
- Reframe intro: 2026 reality (AI changes the data, not just the channels).
- New section: **"The data sources that matter post-AIO"** — GA4, GSC, AI-search citation tracking tools, customer-data platforms.
- Add: practical framework / template (the post is currently abstract — competitors with templates win).
- FAQ block: every "data driven b2b" variant gets an answer.

**Schema:** Article + FAQPage.

**Internal links:**
- → `/services/ai-seo/`
- → `/guides/b2b-marketing-strategy-framework-with-example-7-step/` (now refreshed in A1)
- → `/unlock-growth-audit/`

**Target meta:**
- Title: `Data-Driven B2B Marketing in 2026: Framework + Tools` (under 60ch)
- Meta: `Data-driven B2B marketing for the AI-search era. The data sources, the framework, and the tools that turn signal into qualified leads.` (150ch)

**Word count target:** 2,800–3,500

---

## Tier B — CTR-only rewrites (6 pieces)

These pages are on **page 1 (or near it)** but earn zero clicks. The fix is title + meta + maybe H1, not a content rewrite.

| # | URL | Pos | Impr | Current pattern | New title (proposed) | New meta angle |
|---|-----|----:|-----:|-----------------|----------------------|----------------|
| B1 | `/the-art-of-profitable-words-mastering-b2b-content-writing/` | 6.69 | 26 | "The Art of Profitable Words: Mastering B2B Content Writing" | `B2B Content Writing: How to Write for Profit (Not Pageviews)` | Lead with outcome (profit), not craft. Mention frameworks + AIO mention. |
| B2 | `/generative-engine-optimization-basic-to-advanced/` | 5.82 | 22 | "Generative Engine Optimization: Basic to Advanced" | `Generative Engine Optimization (GEO): Basic to Advanced Guide (2026)` | Add year + "guide" — improves CTR on long-tail year modifiers like the existing `advanced generative engine optimization techniques 2026` impression. |
| B3 | `/content-marketing-101/` | 7.1 | 10 | "Content Marketing 101" | `Content Marketing 101: A 2026 Guide for B2B Teams` | "101" is generic; specify audience (B2B) + year + GEO context. |
| B4 | `/what-is-content-writing-master-the-science-of-web-writing-in-2023/` | 5 | 9 | "What Is Content Writing? Master the Science of Web Writing in 2023" | `What Is Content Writing? A 2026 Guide for AI-Era Marketers` | "2023" must go. Add year + reframe for AI era. (Slug too has "2023" — consider 301 to new slug — see Open Question.) |
| B5 | `/category/blog/` | 10.6 | 76 | Currently a hub listing | `AI-Search & B2B SEO Blog — Sale Solution` | Specify positioning. Currently it's just "Blog". |
| B6 | `/services/ai-seo/` | 4.68 | 47 | "AI Search & Generative-Engine Optimization (GEO)" | Keep — but rewrite meta to lead with outcome ("Get cited inside AI Overviews") | Position 4 with 0 clicks = title fine, meta isn't selling. |

**Effort per piece:** ~15 min. Total Tier B effort: ~90 min.

**Sequence note:** Ship Tier B *first* (before any Tier A drafting). Title/meta changes can be live within a day of decision, and the CTR lift is the fastest measurable win on this property.

---

## Tier C — Disposition for the 13 invisible posts

After diagnosis, none are a quick fix. Per-post disposition below:

| # | URL | Topic | Disposition | Rationale |
|---|-----|-------|------------|-----------|
| C1 | `/seo-mastery-enhancing-visibility-customer-attraction/` | Generic SEO mastery | **MERGE** → fold into `/services/ai-seo/` as a long-form section, then 301 | No unique angle; competing on a head-term that requires DR we don't have |
| C2 | `/on-page-seo-mastery-from-visibility-to-conversion/` | On-page SEO guide | **REFRESH with new angle** | Same generic head-term issue, BUT — on-page-for-AIO is a genuinely emerging topic. Rewrite as "On-page SEO for AI Overviews: 2026 schema-first guide." |
| C3 | `/technical-seo-mastering-website-optimization/` | Technical SEO | **REFRESH with new angle** | Same logic — rewrite as "Technical SEO for industrial e-commerce" with hydraulics/MRO examples. Closes positioning gap. |
| C4 | `/off-page-seo-in-depth-guide/` | Off-page SEO | **MERGE** → fold into A1 (B2B framework) as link-building chapter, 301 | 9000 words on a saturated head-term. Better as one chapter of pillar. |
| C5 | `/seo-strategy-template-2024-guide-goals-and-kpi/` | SEO strategy + KPIs | **REFRESH with new angle** + slug change | "SEO strategy template 2026" + KPIs reworked for AIO citation share / coverage. Slug rename + 301. |
| C6 | `/user-intent-seo-guide-to-search-behavior-understanding/` | User intent | **REFRESH with new angle** | Reframe as "User intent in the AI-Overview era — how generative search reshapes intent classes." |
| C7 | `/ultimate-guide-mastering-keyword-research-2023/` | Keyword research | **REFRESH with new angle** + slug change | Reframe as "Keyword research for AI search & GEO (2026)." Slug rename + 301. |
| C8 | `/long-tail-keywords-blueprint-2023/` | Long-tail keywords | **REFRESH with new angle** + slug change | Strong candidate — long-tail is exactly what AI search rewards. Reframe as "Long-tail keywords for AI Overviews (2026)." Slug rename + 301. |
| C9 | `/content-strategy-expert-backed-guide-2023/` | Content strategy | **MERGE** → fold into refreshed A1 + 301 | Overlaps too heavily with the B2B framework guide once refreshed. |
| C10 | `/mastering-e-commerce-content-writing-guide-2023/` | E-commerce content writing | **REFRESH with new angle** + slug change | Reframe as "E-commerce content writing for industrial buyers" — positioning play. |
| C11 | `/strategies-to-increase-e-commerce-conversion-rate/` | E-commerce CRO | **LEAVE for now** | One impression on `"how to increase ecommerce conversion rate"` (5, pos 95). Not enough signal. Revisit after Tier A+B ships. |
| C12 | `/crafting-an-effective-e-commerce-funnel-for-2024/` | E-commerce funnel | **REFRESH with new angle** + slug change | Already indexed (verified in site: results). Reframe as "Industrial e-commerce funnel: technical buyer journey 2026." |
| C13 | `/direct-vs-organic-traffic-differences-acquisition/` | Direct vs organic traffic | **LEAVE for now** | Too tangential to core positioning. Could merge into A2 (`which-reports-...`) if there's natural fit. |

**Tier C totals:**
- 7 deep refreshes with new angles (slug renames + 301s for 5 of them)
- 3 merges + 301s
- 2 leave-as-is for now
- 1 already covered (none — the "leave" count is 2)

**Tier C is the biggest scope.** Recommended sequencing: don't start Tier C until Tier A + B are shipped and we have ~6 weeks of post-publish data to validate the refresh angles work.

---

## Brand audit (parallel workstream)

**Finding from Queries.csv:** "Sales Solution" (132) + "Sales Solutions" (89) + "Sale Solution" (132) + "Salessolution" (2) + "Sales Solution" plural variants total ~370 impressions vs **52** for the canonical "salesolution".

**Scope of audit:**
1. **Canonical name decision** — keep "Sale Solution" (current) or shift to "Sales Solution"? People type the plural significantly more often. Decision is yours; it affects everything below.
2. **Schema alt-names** — add `alternateName: ["Sales Solution", "Sales Solutions"]` to Organization JSON-LD in `lib/schema.ts` regardless of #1.
3. **On-page audit** — sweep every "Sale Solution" mention in code (components, copy, metadata) and confirm consistency. The footer/header brand string is the primary signal.
4. **External cleanup** — Google Business Profile, social bios (Facebook, X, LinkedIn) — confirm consistent.
5. **Redirect strategy** — if name changes, plan 301 from `salesolution.net` to whatever new canonical (only if name actually changes; this is a big move).

**Effort:** 2–4 hours for steps 2–3 if name stays. 1–2 days if name changes (step 1).

**Recommended sequencing:** Decide #1 immediately. Do #2 with the next deploy (5 min). Do #3 in a single sweep. Defer #4 and #5 to a separate workstream.

---

## Suggested execution sequence

**Week 1 (this week):**
1. Tier B — 6 CTR-only title/meta rewrites — ship in a single deploy
2. Brand audit step 2 — `alternateName` schema fix — same deploy
3. Two Tier A briefs locked: A1 (B2B framework guide) + A2 (which-reports post)

**Weeks 2–3:**
4. Tier A drafts A1, A2 → Artur edits → publish

**Weeks 4–5:**
5. Tier A drafts A3 (future-proof page), A4 (data-driven b2b) → publish
6. Sitemap cleanup (`/sitemap/`, `/tag/*` URLs — 301 or noindex)
7. Re-export GSC at this point; measure Tier B CTR lift

**Weeks 6+:**
8. Begin Tier C deep refreshes in priority order (C2, C8, C12 first — strongest topical fit)

---

## Open questions for Artur

1. **B2B framework template** — do we have a downloadable template for A1, or should I draft one (xlsx/PDF outline + canva-style design brief)? Without it, the `template` modifier query goes unaddressed.
2. **Brand canonical name** — keep "Sale Solution" or shift to "Sales Solution"? (Drives the whole brand audit downstream.)
3. **Which Tier A piece to brief & draft first?** A1 (biggest single opportunity) or A2 (smaller but clearer mechanical refresh — good workflow-validation pass)?
4. **Slug renames in Tier C** — OK in principle to rename `/long-tail-keywords-blueprint-2023/` → `/long-tail-keywords-blueprint/` (etc) with 301s, or do you want to preserve all current slugs for SEO continuity?
5. **Tier B ship cadence** — happy to ship the 6 CTR rewrites as one Sanity update batch + one git deploy, or want to review each title/meta pair first?
