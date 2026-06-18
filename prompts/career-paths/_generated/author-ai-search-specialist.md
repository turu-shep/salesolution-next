# Prompt: Author ONE career path (draft) — AI Search Specialist

> Generated, ready-to-run. **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's
> substance: `docs/strategy/career-path/03-roles.md` (section 3.3) + `docs/strategy/career-path/04-niches.md`.
> Everything you need is inline at the bottom under "Source material for this role." Do not invent
> substance — pull it from the seeds below.

## Role to author
- **Title:** AI Search Specialist
- **Slug:** `ai-search-specialist`  (kebab-case — a same-named glossary term may exist; routes differ
  (`/career-paths/ai-search-specialist` vs `/glossary/...`), so that's fine)
- **Role line ("For"):** the single search hire at a mid-size distributor — one program for rankings AND AI visibility
- **Level:** Mid  (drives the "Start here" marker on Entry — this role is NOT Entry, so the Entry row stays the bottom rung, not the marker)
- **Aliases (real job titles):** AI SEO Specialist · AI Search Specialist · SEO & AI Search Specialist · AI SEO Manager
- **Industrial flavor (what changes inside a distributor):** the one hire that keeps category pages ranking AND gets the catalog cited — part-number long-tail, supplier-fed content dedup, marketplace channel overlap
- **Related glossary terms to link:** `llm-seo`, `ai-search-optimization`, `generative-engine-optimization`, `answer-engine-optimization`, `ai-visibility`

## Task
Create ONE `careerPath` **draft** (`drafts.career-ai-search-specialist`) following the established schema
(`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs` (match its `p()` / `test()` / `term()` helpers, its `seniorityMatrix`
shape, its body = one `h2` per chapter each ending in a `tip` callout, and its `buyerSection` shape).
Build portable-text with unique `_key`s. Pull the role's real substance from the seeds below — don't invent it.

### Fields to set
- `title`, `slug`, `role` (the "For" line above), `level` (`Mid`), `duration` (`'Self-paced'`),
  `aliases`, `status:'drafting'`, `lastReviewed` (today), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial. (Use the **Lede seed** below.)
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete
  things. Use the **Seniority matrix** seeds below verbatim/faithfully.
- **`body`** — the chapter walk, portable text. Open with a 1-paragraph intro. Then 4–6 chapters
  (use the **Suggested chapter outline** below). One `h2` per chapter (chapters drive the TOC).
  **Each chapter ends with a `callout` (tone `tip`) "test it on your own site" prompt** — the format signature.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text], costReality }`.
  Only revenue-touching surface: speak to the distributor deciding **hire vs agency vs fractional**, with
  honest cost reality from `03-roles.md`. Keep the "we don't hire from these paths" stance — buyer guidance, NOT recruiting.
- **`relatedTerms`** — references to the five slugs above (`{_type:'reference', _ref:'glossary-<slug>'}`;
  targets are published so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt. Industrial
examples throughout (hydraulics cross-refs, MRO part numbers, automation obsolescence, PIM, distributor
catalogs). Verify any factual claim (salary bands, named postings, stats) against the seeds below — they're pre-verified.

## Definition of done
- Draft `drafts.career-ai-search-specialist` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors); changed files lint clean.
- Do NOT publish — leave as a draft. Publish/voice via `prompts/career-paths/voice-and-publish-path.md`.

---

## Source material for this role (verified — pulled from docs/strategy/career-path/03-roles.md + 04-niches.md)

This role is **section 3.3 — AI SEO / AI Search Specialist, "the bridge title."** It is the **hybrid**:
one program for rankings *and* AI visibility. It is **not** GEO-only and **not** AEO-only — it's the single
search hire a mid-size distributor actually makes. Demand evidence: the field has **not converged on one
title** (verified), and per the Semrush survey (via the Webflow 2026 SEO salary guide) **74% of enterprises
plan to hire SEO specialists with AI expertise within 12 months.** Build-order #3, Priority P0.

### Lede seed (the `description` — operator voice, doubles as a quotable definition)
> One program for rankings and AI visibility — the single search hire a mid-size distributor actually
> makes. Not a GEO-only specialist and not a classic SEO who ignores answer engines: the hybrid who keeps
> category pages ranking on Google *and* gets the catalog cited inside ChatGPT, Perplexity, and AI Overviews.

(Alternate one-liner if a tighter `description` is wanted: "The hybrid search hire. Rankings and AI
citations are one program, run by one person, because at a mid-size distributor that person is you.")

### Seniority matrix (Entry / Mid / Senior) — drawn straight from 3.3
Note the honest on-ramp story (a documented differentiator): there are **no entry-level GEO/AEO postings** —
every one wants 3–10 yrs prior SEO. So "Entry" here is *junior SEO + AI-search literacy*, not a job you
get hired into cold. The title **lives at Mid**.

**Entry — `focus`:** Junior SEO who's added AI-tool fluency. You own classic on-page and content production,
and you're learning where answer engines change the job. (~$53K; the "AI" label adds little to entry pay.)
- `mustLearn`:
  - Classic SEO fundamentals first — on-page, internal linking, technical hygiene; there is no AI-search shortcut around them
  - AI-tool fluency for production at scale (drafting, dedup, attribute cleanup) without shipping slop
  - How ChatGPT, Perplexity, Gemini, and Google AI Overviews retrieve and cite sources — vs how Google ranks a list
  - Running a prompt audit — what engines currently say about your brand and products vs competitors

**Mid — `focus`:** Owns one program for rankings *and* AI visibility. This is where the title lives
(2–5 yrs; ~$70–117K, AI skills command the top of the band). (Note: 03-roles also gives a tighter
"if a distributor hires exactly one search person" anchor of ~$70–110K — use that in the buyer section.)
- `mustLearn`:
  - Running rankings and AI visibility as a single roadmap, not two competing workstreams
  - AI-assisted SEO production at catalog scale — and deduping manufacturer-supplied descriptions so it isn't sitewide duplicate content
  - Blended visibility reporting — Google rankings/traffic alongside AI mention and citation share, in one view
  - The part-number long-tail: near-zero reported volume, near-100% buyer intent, and the place answer engines have no good source yet

**Senior — `focus`:** Becomes Head of Search owning SEO + GEO + AEO across the org ($120–150K+).
- `mustLearn`:
  - Owning SEO, GEO, and AEO as one function and resourcing the split between them
  - Guiding stakeholders through AI-Overviews traffic loss — what's actually lost, what's replaced by citations, and what to do about it
  - The measurement framework — when to trust rankings, when to trust citation/mention share, and how to report blended visibility to leadership
  - Where the catalog (PIM/ERP data) is the real lever, and prioritizing data fixes over content volume

### Suggested chapter outline (4–6 H2 chapters; each closes with a "test it on your own site" `tip` callout)
1. **The one-hire reality: rankings and AI visibility are one job** — set the frame: at a mid-size
   distributor you are the whole search function; "X not Y" — one program, not two teams; the title hasn't
   converged but the job has. *Tip:* list every place a buyer could find your product — Google, ChatGPT,
   Perplexity, a marketplace — and mark which you're actually present in.
2. **Don't skip classic SEO** — the on-ramp truth: every GEO/AEO posting wants years of SEO first; category
   pages still have to rank; AI search is a layer on solid SEO, not a replacement. *Tip:* pull your top 10
   category pages' Google positions; if they're slipping, that's the fire before the AI work.
3. **Run AI-assisted production without shipping slop** — AI for scale (drafting, attribute cleanup,
   spec-table generation) AND the distributor-specific trap: manufacturer-supplied descriptions create
   sitewide duplicate content; dedup is the actual deliverable. *Tip:* take one supplier's description used
   across 50 SKUs and check how many of your pages are near-duplicates of it and of each other.
4. **Win the part-number long-tail** — the most distributor-distinctive lane: "Gates equivalent of Parker
   387 hose," "1756-L61 replacement," "imperial equivalent of Class 10.9" — zero reported volume,
   near-100% intent, no good answer-engine source today; publish cross-reference/interchange data as flat
   crawlable HTML, not PDFs or a JS lookup widget. *Tip:* type three competitor-part-number queries your
   customers use into ChatGPT — does anyone get cited, and is it you?
5. **Make the catalog visible to engines AND to crawlers** — the recurring buyer-side blocker: login-walled
   pricing/specs and aggressive bot protection make distributors invisible to LLMs regardless of content
   quality; Product schema with MPN/GTIN at template scale; the unit of work is the template, one fix across
   100K+ SKUs. *Tip:* view-source your best spec page with JS disabled, then check robots.txt/WAF for
   OAI-SearchBot and PerplexityBot — if specs vanish or the bot is blocked, you're invisible.
6. **Report blended visibility (and survive AI-Overviews traffic loss)** — one view of Google
   rankings/traffic + AI mention and citation share; ~12% of AI-cited URLs rank in Google's top 10, so you
   can't proxy AI visibility with rankings; a fixed buyer-prompt panel run on a schedule; how to brief
   leadership when AI Overviews eats clicks. *Tip:* build a 20-prompt set of real buyer questions, run it
   monthly, and put citation share next to organic traffic in one report.

(Pick 4–6 of these — chapters 1, 3, 4, 5, 6 are the strongest if trimming to five. Keep chapter 2 if the
on-ramp/"don't skip SEO" honesty is wanted, since it's a documented differentiator.)

### Buyer section seeds ("Hiring this role?")
- **`whatTheyDo` (1 sentence):** An AI search specialist runs one program for both goals at once — keeping
  your category and product pages ranking on Google *and* getting your catalog cited inside ChatGPT,
  Perplexity, Gemini, and Google AI Overviews — instead of splitting the work across an SEO and a separate
  AI-search hire you can't justify.
- **`signsYouNeedOne` (3–4 bullets):**
  - You can fund exactly one search person, not a team — and you need both rankings and AI visibility from them
  - Buyers tell you they "found a competitor through ChatGPT," but you also can't afford to let Google rankings slide
  - Your catalog is full of manufacturer-supplied descriptions (sitewide duplicate content) and part-number queries with no good answer-engine source
  - Pricing or specs sit behind a login, or bot protection blocks AI crawlers, so you're invisible to LLMs no matter how good the content is
- **`inHouseVsAgency` (portable text, the honest call for THIS role):**
  - Para 1: "If you hire exactly one search person, make it this hybrid — someone who owns classic SEO *and*
    AI search, not a GEO-only specialist. The field hasn't agreed on a title (AI SEO Specialist, AI Search
    Specialist, SEO & AI Search Specialist all describe it), and 74% of enterprises say they'll hire an
    AI-skilled SEO within a year (Semrush, via the Webflow 2026 salary guide) — but a job title existing
    doesn't mean *you* should fill it in-house."
  - Para 2: "Below roughly **$50M in revenue (*speculative threshold*)**, a fractional operator or an agency
    almost always wins: the front-loaded work (schema, dedup, crawler access, cross-reference publishing)
    doesn't need a full-time salary, and one generalist hire rarely has both the SEO depth and the AI-search
    literacy. Above that, an in-house hybrid starts to pay off — and the real decision on this page is *one
    hybrid hire vs an agency*, not GEO-vs-SEO."
- **`costReality`:** "Mid-level pay sits around **$70–117K**, with AI skills commanding the top of the band;
  if you're hiring the single search person, budget **~$70–110K** (2025–26 US postings, per 03-roles.md;
  Webflow 2026 salary guide / Semrush). Entry is effectively a junior SEO (~$53K) — the 'AI' label adds
  little at that level, and there are essentially no true entry GEO/AEO openings. A fractional or agency
  engagement covers the front-loaded build for a fraction of fully-loaded headcount."

### Industrial angle (concrete niche examples to use — from 04-niches.md)
This role is the broadest, so saturate it with the part-number / cross-reference / dedup examples that span
verticals. Use real ones:
- **Hydraulics & pneumatics (P0, densest cross-ref vertical):** "Gates equivalent of Parker 387 hose,"
  "seal kit for a Char-Lynn 104 motor," "NPT vs JIC vs ORFS." Small distributors (Discount Hydraulic Hose,
  HFI, Tompkins) publish crawlable interchange charts that LLMs cite — beating Parker's own JS crossref tool.
- **Industrial automation, incl. obsolete (P0, canonical part-number vertical):** "1756-L61 replacement,"
  "what replaces the discontinued PowerFlex 4?", "SLC 500 → CompactLogix migration." Rockwell answers these
  only inside gated PDFs; Radwell (20M+ parts), Galco serve the open aftermarket.
- **MRO broadline (P0):** a "food-grade vs H1/H2 lubricants" decision table appearing in ChatGPT answers
  Grainger's product-listing category pages never win; strongest marketplace pressure (Amazon Business +
  the Apr 2025 Grainger partnership).
- **Fasteners (P1):** "imperial equivalent of Class 10.9," "Grade 8 vs Class 10.9," "A2 vs A4" — spec
  decoding is a native LLM use case; a metric-to-imperial thread/grade chart Fastenal never built.
- **Electrical (P1):** obsolete-breaker replacement guide (FPE/Zinsco → modern) cited for a high-intent
  query the $20B nationals leave to forums.
- **Cross-cutting demand line (use once):** **51% of B2B buyers now start research in AI chatbots**
  (G2 Buyer Behavior Report, Apr 2025) — the demand-side proof that this hybrid job exists.
- **The dedup angle is distributor-specific:** manufacturer-supplied descriptions create sitewide duplicate
  content; PIM attribute completeness determines whether facet pages are even buildable. This is the bridge
  between "AI-assisted production at scale" and "don't ship slop."

### Aliases + relatedTerms (final chosen values)
- **`aliases`:** `["AI SEO Specialist", "AI Search Specialist", "SEO & AI Search Specialist", "AI SEO Manager"]`
- **`relatedTerms` (5 — all confirmed in the published whitelist):**
  `["llm-seo", "ai-search-optimization", "generative-engine-optimization", "answer-engine-optimization", "ai-visibility"]`
  - Rationale: this is the family-spanning *hybrid* role, so the family terms fit best — `llm-seo` and
    `ai-search-optimization` are the umbrella names for "the one program," `generative-engine-optimization`
    and `answer-engine-optimization` are the two halves it bridges, and `ai-visibility` is the measurement
    side it has to report. (`query-fan-out` and `part-number-seo` were considered and are in the whitelist,
    but the five chosen are more central to the "one search hire, both goals" framing; an author may swap in
    `part-number-seo` for one of the AEO/GEO refs if the part-number chapter is emphasized — both are valid.)

### Verification notes (verified vs flagged)
**Verified (use exactly as written — pre-verified in 03-roles.md / 04-niches.md):**
- 74% of enterprises plan to hire SEO specialists with AI expertise within 12 months — Semrush survey, via
  the Webflow 2026 SEO salary guide (`webflow.jobs`). Keep the figure and attribution exact.
- Salary bands: entry ≈ junior SEO ~$53K (AI label adds little); mid ~$70–117K (AI skills top of band);
  single-search-hire anchor ~$70–110K; senior / Head of Search $120–150K+. (03-roles.md §3.3.)
- Named postings/sources for the title: Caterpillar's *original* req title ("AI SEO / Generative Engine
  Optimization (GEO) Specialist," later retitled — careers site blocks fetching, so link, don't quote
  deeply); IRA Financial "SEO and AI Search Specialist"; ZipRecruiter "AI SEO" category; continuous Upwork
  demand. The field has not converged on one title (verified).
- "No entry-level GEO/AEO postings; every one requires 3–10 yrs prior SEO" — verified negative finding,
  used for the honest on-ramp story.
- ~12% of AI-cited URLs rank in Google's top 10 (Ahrefs) — already used on the live GEO page; consistent
  with the buyer-side "rankings don't proxy AI visibility" point. (03-roles §3.4 cites a related ~15% of
  AI Overview citations from Google top-10 — if you state a number, use the 12% figure that's already live
  on the GEO path for consistency, and don't blend the two.)
- 51% of B2B buyers start research in AI chatbots — G2 Buyer Behavior Report, Apr 2025 (04-niches §1).
- Industrial examples (Parker 387/Gates, Char-Lynn 104, 1756-L61, PowerFlex 4, SLC 500→CompactLogix,
  FPE/Zinsco breakers, Class 10.9, H1/H2 lubricants) are real interchange/spec query patterns documented in
  04-niches.md. The distributor names (Discount Hydraulic Hose, HFI, Tompkins, Radwell, Galco, Fastenal,
  Grainger) are named in the doc. Use them as *illustrative patterns*, not as claims that a specific named
  company currently ranks/gets cited for a specific exact query.
- **Demand check (Ahrefs, run 2026-06-15, US):** "ai search specialist" = **10 volume** (global 20), KD
  null; "ai seo specialist" = **150 volume** (global 400), KD null. This confirms the documented
  expectation — these are near-zero-volume citation/entity plays, not traffic targets (cf. "geo specialist"
  at 40 US / KD 0). Page success is measured in referring domains + AI citations, not this volume.

**Flagged as *speculative* (mark or hedge — the docs mark these):**
- The **~$50M revenue threshold** below which fractional/agency wins for a distributor is *speculative*
  (03-roles §3.3 marks it). Hedge it ("roughly," "*speculative*") — don't state it as a hard cutoff.
- Do NOT fabricate a single named "this distributor got cited for this exact query" case study. The
  niche examples are illustrative scenarios / documented query patterns. If a concrete example is needed,
  write it as a clearly-illustrative scenario (as the live GEO/Citation paths do), not as a verified fact.
- Caterpillar careers site blocks fetching — quote its title conservatively and link to the listing rather
  than asserting current live wording.
