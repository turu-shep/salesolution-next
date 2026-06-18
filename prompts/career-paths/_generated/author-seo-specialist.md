# Prompt: Author ONE career path (draft) — SEO Specialist (Industrial E-commerce)

> Generated from `prompts/career-paths/author-path.TEMPLATE.md` for the SEO Specialist role.
> **Read `prompts/_CONTEXT.md` first.** Source of truth for the role's substance:
> `docs/strategy/career-path/03-roles.md` (section 4.1) and `04-niches.md`. The verified
> source material is pasted inline at the bottom of this file so the prompt is self-contained.

## Role to author
- **Title:** SEO Specialist
- **Slug:** `seo-specialist`  (kebab-case — note the glossary may have a same-named term;
  routes differ (`/career-paths/seo-specialist` vs `/glossary/seo-specialist`), so that's fine)
- **Role line ("For"):** SEOs at industrial distributors working 100K-SKU catalogs
- **Level:** Mid  (Entry | Mid | Senior — drives the "Start here" marker; this is Mid, NOT the Entry marker)
- **Aliases (real job titles):** ["E-commerce SEO Specialist", "Industrial SEO Specialist", "Catalog SEO Specialist"]
- **Industrial flavor (what changes inside a distributor):** The unit of work is the **template**
  — one fix × 200K SKUs, not one page at a time. Part-number queries have zero reported search
  volume but near-100% intent. Manufacturer-supplied descriptions create site-wide duplicate
  content. PIM attribute completeness decides whether facet pages are even buildable. This is
  classic SEO bent around a catalog no generic SEO has ever seen — never generic "how to become an SEO."
- **Related glossary terms to link:** ["part-number-seo", "part-number-cross-reference", "pim", "llm-seo", "ai-search-optimization"]

## Task
Create ONE `careerPath` **draft** (`drafts.career-seo-specialist`) following the established schema
(`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs`. Build portable-text with unique `_key`s. Pull the role's real
substance (responsibilities by seniority, skills/tools, buyer framing, salary evidence) from the
source material pasted at the bottom of this file — don't invent it.

### Fields to set
- `title`, `slug`, `role` (`SEOs at industrial distributors working 100K-SKU catalogs`),
  `level` (`Mid`), `duration` ("Self-paced"), `aliases`, `status:'drafting'`,
  `lastReviewed` (today), `seo` (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial (use the Lede seed below).
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow',
  level, focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete
  things, drawn from the source material. This is the "how the role improves by seniority" core.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC).
  Open with a 1-paragraph intro. Then 4–6 chapters covering the real work of the role in
  industrial e-commerce. **Each chapter ends with a `callout` (tone `tip`) "test it on your own
  site" prompt** — the format signature.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. This is the only revenue-touching surface (MarketerHire pattern): speak to the
  distributor deciding **hire vs agency vs fractional**, with honest cost reality from the salary
  evidence below. Keep the "we don't hire from these paths" stance — this section is buyer
  guidance, NOT recruiting.
- **`relatedTerms`** — references to the five slugs (`{_type:'reference',
  _ref:'glossary-<slug>'}`; targets are published so strong refs are fine):
  `part-number-seo`, `part-number-cross-reference`, `pim`, `llm-seo`, `ai-search-optimization`.

### Voice
Operator register (see `_CONTEXT.md`): terse, "X not Y", anti-marketing, concrete, blunt.
Industrial examples throughout (hydraulics cross-refs, MRO part numbers, automation obsolescence,
PIM, distributor catalogs — `04-niches.md`). Verify any factual claim (salary bands, named postings,
stats). Match `scripts/seed-career-paths.mjs` exactly for register and depth — that is the
gold-standard reference.

## Definition of done
- Draft `drafts.career-seo-specialist` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*`); changed files lint clean.
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.

---

## Source material for this role (verified — pulled from docs/strategy/career-path/03-roles.md + 04-niches.md)

Everything below is grounded in the verified docs. Use it faithfully; do not invent salary bands,
postings, or stats. Where the docs mark a threshold *speculative*, keep that hedge.

### Lede seed (operator voice — doubles as a standalone, quotable role definition)

> SEO for an industrial distributor is classic SEO bent around a catalog no generic SEO has ever
> seen: the unit of work is the template — one fix across 200,000 SKUs — and the money queries are
> part numbers with zero reported search volume and near-100% buying intent. The classic mistake is
> hiring an SEO who's never seen a 100K-SKU catalog and watching them optimize one page at a time.

(Pick one or two sentences from the above for `description`. Keep the "X, not Y" register.)

### Seniority matrix (Entry / Mid / Senior)

The role is **established** (unlike GEO/AEO), so all three levels are real and staffed. Pull
`focus` + `mustLearn` straight from these.

**Entry** — *(NOTE: this path's level marker is Mid; Entry here is the on-ramp, not the "Start here" badge.)*
- **focus:** Execute template-level fixes and learn the catalog. You are a junior SEO or e-commerce
  analyst who has never worked at catalog scale.
- **mustLearn (3–4):**
  - Why the unit of work is the **template**, not the page — one change propagates across hundreds of thousands of SKUs
  - Reading a distributor's URL/facet structure: category → subcategory → attribute facets → SKU pages
  - Spotting manufacturer-supplied descriptions that create **site-wide duplicate content** across every reseller
  - Basic part-number intent — why a string like `1756-L61` is a money query with zero reported volume

**Mid** — *(this is where the title lives — the "Start here / Mid" level for this page)*
- **focus:** Own catalog SEO end-to-end for a distributor — templates, facets, duplicate content, and part-number coverage.
- **mustLearn (3–4):**
  - Template-level title/meta/heading/schema patterns that scale across 200K SKUs without per-page work
  - Faceted-navigation strategy: which attribute facets to index, which to `noindex`/canonical, and why PIM completeness gates it
  - De-duplicating manufacturer-fed copy — rewriting at template scale or layering distributor-unique data so the catalog isn't a thin mirror
  - Part-number SEO: making SKU and cross-reference pages rank for exact part strings competitors leave to forums and gated PDFs

**Senior**
- **focus:** Set catalog SEO strategy and arbitrate it against PIM, merchandising, and replatform risk.
- **mustLearn (3–4):**
  - Tying SEO outcomes to revenue the way the Zoro posting does — SEO content as "a substantial portion of annual revenue"
  - Governing facet-page generation against PIM attribute completeness (no normalized attributes → no buildable facet pages)
  - Replatform and migration risk at catalog scale — preserving template equity, redirects, and crawl budget through an ERP/storefront change
  - Deciding where catalog SEO ends and GEO/AEO begins — the same extractable spec tables that rank also get cited

### Suggested chapter outline (4–6 H2 chapters, each closing with a "test it on your own site" tip callout)

1. **What SEO means at catalog scale** — the template is the unit of work; you fix once and it lands
   on 200K SKUs. *Tip callout:* count your indexable SKUs, then ask how many template changes it
   would take to fix a title-tag pattern across all of them — if the answer is "edit each page," that's the problem.
2. **Part-number queries: zero volume, near-100% intent** — `1756-L61 replacement`, `Gates
   equivalent of Parker 387 hose`. Keyword tools report nothing; the buyer is one search from a
   purchase order. *Tip callout:* pull your top 20 part-number search queries from internal site
   search, then check whether each resolves to an indexable, rankable page or a dead zero-results screen.
3. **Killing manufacturer-fed duplicate content** — every reseller publishes the same Parker/Rockwell
   blurb; an undifferentiated catalog is a thin mirror that ranks for nothing. *Tip callout:* copy a
   product description into Google in quotes — if dozens of competitors return the same text verbatim,
   that page has no reason to rank.
4. **Faceted navigation and the PIM gate** — facet pages are SEO gold, but you can only build the
   ones your PIM has clean attributes for; incomplete attributes mean no facet page, no spec table,
   no schema. *Tip callout:* pick one category and try to build the "by thread size" or "by pressure
   rating" facet page — if the attributes aren't normalized in PIM, you've found the real blocker.
5. **Cross-reference and interchange pages** — the highest-intent, lowest-competition content a
   distributor can own (interchange charts, equivalents, obsolescence migrations). *Tip callout:*
   take one interchange list you already own and publish it as a flat, crawlable HTML table — then
   watch whether it starts ranking for `[competitor part] equivalent` within weeks.
6. **Where catalog SEO meets AI search** — the same extractable spec tables that rank in Google get
   cited by answer engines; classic SEO is the foundation GEO/AEO is layered on, not a separate
   track. *Tip callout:* open your best spec page with JavaScript disabled — if the specs vanish,
   neither Google nor an AI crawler can read them, and both lanes lose at once.

(4 chapters minimum, 6 maximum. Every chapter ends in a `callout` with `tone:'tip'`. Keep callouts
imperative and testable, exactly like `seed-career-paths.mjs`.)

### Buyer section seeds ("Hiring this role?")

- **whatTheyDo (1 sentence):** An industrial SEO specialist makes a distributor's catalog rank for
  the queries buyers actually type — part numbers, cross-references, and spec facets — by working at
  template scale across the whole SKU base rather than optimizing one page at a time.
- **signsYouNeedOne (3–4 bullets):**
  - Buyers find competitors' part-number pages on Google but never yours
  - Your product pages run on manufacturer-supplied copy that's duplicated across every reseller
  - You can't build "by spec" facet pages because PIM attributes aren't normalized
  - You have unique interchange/cross-reference data sitting in PIM/ERP and none of it is published or crawlable
- **inHouseVsAgency (the honest call for THIS role — portable text, 2 short paragraphs):**
  - In-house becomes viable from roughly **$25–50M in online revenue** (*speculative* — the docs
    flag this threshold). Below that, the work is project-and-retainer shaped: a template/facet/dup-content
    overhaul up front, then steady maintenance — which fits an agency or fractional engagement.
  - The classic, expensive mistake is hiring a **generic SEO who has never seen a 100K-SKU catalog**.
    Catalog SEO is a different job from content-site SEO; if you hire in-house, hire someone who has
    worked at SKU scale, or you'll pay them to learn it on your catalog.
- **costReality (salary/tooling figures with sources named):** ZipRecruiter puts the average
  industrial e-commerce SEO specialist at **$67,388** (range **$53K–$90K**); Salary.com level II
  is about **$97K**; Grainger's specialist posting sits near **$66K**. Caterpillar runs a classic
  SEO Specialist req (r0000328865) in parallel with its GEO req — enterprises are splitting the
  lanes. A Zoro posting ties SEO content to "a substantial portion of annual revenue," which is the
  honest framing of what this role is worth at scale. (Sources: ZipRecruiter, Salary.com, Grainger
  / Zoro postings, Caterpillar reqs r0000328865 + r0000330321 — all per 03-roles.md §4.1.)

### Industrial angle — concrete niche examples this role should use (from 04-niches.md)

Use REAL niche examples, not generic ones. Strongest for this role:
- **Hydraulics & pneumatics (the densest cross-reference vertical):** "Gates equivalent of Parker
  387 hose," "seal kit for a Char-Lynn 104 motor," "NPT vs JIC vs ORFS." A regional Parker
  distributor's Parker-to-Gates interchange chart can out-rank Parker's own crossref tool because
  it's crawlable HTML, not a JS app. (Discount Hydraulic Hose, HFI, Tompkins publish exactly these.)
- **Industrial automation aftermarket (the canonical part-number vertical):** `1756-L61 replacement`,
  "what replaces the discontinued PowerFlex 4?", "SLC 500 → CompactLogix migration cross-reference."
  Pure part-number / migration queries with zero OEM answers outside gated PDFs (Radwell, Galco).
- **MRO broadline (duplicate-content + selection):** an independent MRO house's "food-grade vs H1/H2
  lubricants" decision table appears in answers Grainger's product-listing category pages never win.
- **Bearings & PT (standardized interchange):** SKF-to-NTN interchange table answering "NTN
  equivalent of SKF 6205-2RS1" while the national's data sits behind a login.
- **Fasteners (spec decoding):** metric-to-imperial thread/grade chart for "imperial equivalent of
  Class 10.9" — a page Fastenal never built because its catalog assumes you already know.
- **Contrast/credibility example (use sparingly):** a regional **lab & scientific** supplier can't
  win "best syringe filter" against Fisher's catalog depth — show where catalog SEO does NOT change
  the game to keep the page honest.

Cross-cutting demand line available if needed: **51% of B2B buyers now start research in AI chatbots**
(G2, Apr 2025) — but for THIS page lead with the search/catalog mechanics; AI-search is the bridge
chapter, not the whole story.

### Aliases + relatedTerms (final chosen values)

- **aliases:** `["E-commerce SEO Specialist", "Industrial SEO Specialist", "Catalog SEO Specialist"]`
- **relatedTerms (strong refs to published glossary docs — all confirmed in the whitelist):**
  `["part-number-seo", "part-number-cross-reference", "pim", "llm-seo", "ai-search-optimization"]`
  - `part-number-seo` — the role's defining money-query discipline
  - `part-number-cross-reference` — the highest-leverage citable/rankable asset (interchange charts)
  - `pim` — the gate on facet pages, spec tables, and schema; can't be skipped at a distributor
  - `llm-seo` — the bridge from catalog SEO into AI search (same extractable data, two surfaces)
  - `ai-search-optimization` — frames classic SEO as the foundation AI-search work layers onto

### Verification notes (verified vs flagged)

- **Verified (use exactly as written):** ZipRecruiter avg $67,388 ($53K–$90K); Salary.com level II
  ~$97K; Grainger specialist ~$66K; Zoro "substantial portion of annual revenue"; Caterpillar
  parallel reqs r0000328865 (classic SEO) and r0000330321 (GEO) — all from 03-roles.md §4.1 /
  §3.1, which is the project's already-verified ground truth. Niche examples (Parker-to-Gates,
  Char-Lynn 104, 1756-L61, SLC 500 → CompactLogix, SKF/NTN 6205-2RS1, Class 10.9) are from
  04-niches.md and are real published-interchange patterns, not fabricated postings.
- **Flagged as speculative (keep the hedge in copy):** the "$25–50M online revenue" in-house
  threshold is marked *speculative* in 03-roles.md — do not present it as hard. The "200K SKUs"
  figure is illustrative shorthand for "catalog scale," consistent with the docs' "100K-SKU catalog"
  and "200K SKU" phrasing; treat it as an order-of-magnitude example, not a measured constant.
- **Demand check (Ahrefs, one attempt):** keyword "industrial seo specialist" (US) returned an
  EMPTY result set from the Ahrefs Keywords Explorer overview — i.e., no measurable volume / no KD
  reported. This is the expected outcome: these role-title queries are near-zero-volume
  citation/entity plays, not traffic targets (the strategy measured "geo specialist" at 40 US vol /
  KD 0 for comparison). Not a problem; do not optimize this page for the head term.
- **Do NOT fabricate a "real-world example."** Use the niche stock examples above or a clearly
  illustrative scenario, per the project rule.
