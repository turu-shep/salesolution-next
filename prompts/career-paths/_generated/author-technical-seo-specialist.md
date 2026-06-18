# Prompt: Author the Technical SEO Specialist career path (draft)

> This is a ready-to-run authoring prompt. **Read `prompts/_CONTEXT.md` first** — it carries the
> whole strategy, the locked decisions, the voice, and the Sanity gotchas. Source of truth for the
> role's substance: `docs/strategy/career-path/03-roles.md` §4.2 (already verified ground truth) and
> `docs/strategy/career-path/04-niches.md`. Everything you need is also inlined at the bottom of this
> file under "Source material for this role" — so this prompt is self-contained.

## Role to author
- **Title:** Technical SEO Specialist
- **Slug:** `technical-seo-specialist`  (kebab-case; a same-named glossary term may exist — routes
  differ (`/career-paths/technical-seo-specialist` vs `/glossary/...`), so that's fine)
- **Role line ("For"):** technical SEOs / SEO engineers on large distributor catalogs — the enforcement arm of GEO
- **Level:** Mid  (Entry | Mid | Senior — drives the "Start here" marker on Entry)
- **Aliases (real job titles):** ["Technical SEO Specialist", "SEO Engineer", "Technical SEO (E-commerce)"]
- **Industrial flavor (what changes inside a distributor):** faceted-nav explosion across a 100K+ SKU
  catalog, punchout/ERP storefronts, replatform risk, and — the headline — bot protection that blocks
  AI crawlers sitewide, so the catalog has zero LLM retrievability regardless of content quality. The
  new first deliverable is a GPTBot/PerplexityBot/ClaudeBot log-file access audit. Technical SEO is the
  enforcement arm of GEO.
- **Related glossary terms to link:** ["ai-crawler", "llms-txt", "generative-engine-optimization", "ai-visibility", "part-number-seo"]

## Task
Create ONE `careerPath` **draft** (`drafts.career-technical-seo-specialist`) following the established
schema (`sanity/schemas/career-path.ts`), structure, and operator voice. Pattern script:
`scripts/seed-career-paths.mjs` (match its shape exactly — `seniorityMatrix` rows, `body` as one `h2`
per chapter each closing in a `tip` callout, `buyerSection` shape, strong `relatedTerms` refs). Build
portable-text with unique `_key`s. Pull the role's real substance (responsibilities by seniority,
skills/tools, buyer framing, salary evidence) from `docs/strategy/career-path/03-roles.md` §4.2 — don't
invent it. The verified source material is inlined at the bottom of this file.

### Fields to set
- `title`, `slug`, `role` (the role line above), `level` (`Mid`), `duration` ("Self-paced"),
  `aliases`, `status:'drafting'`, `lastReviewed` (today), `seo`
  (`{_type:'seo', metaTitle, metaDescription}`).
- `description` — the lede: one or two sharp sentences, operator voice, industrial. Use the lede seed
  below (or tighten it — keep the register).
- **`seniorityMatrix`** — array of 3 rows (Entry / Mid / Senior), each `{_key, _type:'levelRow', level,
  focus, mustLearn:[...]}`. `focus` = what they own at that level; `mustLearn` = 3–4 concrete things,
  drawn from the matrix below. This is the "how the role improves by seniority" core.
- **`body`** — the chapter walk, portable text. One `h2` per chapter (chapters drive the TOC). Open with
  a 1-paragraph intro. Then ~4–6 chapters covering the real work of this role in industrial e-commerce
  (use the chapter outline below). **Each chapter ends with a `callout` (tone `tip`) "test it on your
  own site" prompt** — the format signature. Use the `test()` helper pattern from the seed script.
- **`buyerSection`** — `{ whatTheyDo, signsYouNeedOne:[...], inHouseVsAgency:[portable text],
  costReality }`. The only revenue-touching surface: speak to the distributor deciding **hire vs agency
  vs fractional**, with honest cost reality from the salary evidence below. Keep the "we don't hire from
  these paths" stance — buyer guidance, NOT recruiting.
- **`relatedTerms`** — strong references to the five slugs above (`{_type:'reference',
  _ref:'glossary-<slug>'}`; all five are published, so strong refs are fine).

### Voice
Operator register (see `_CONTEXT.md`): terse, declarative, "X not Y", anti-marketing, concrete, blunt
where the docs are blunt, trade-off-aware. Industrial examples throughout (faceted nav, punchout/ERP,
hydraulics cross-refs, MRO part numbers, automation obsolescence, PIM — see `04-niches.md` and the
inlined industrial angle). Verify any factual claim (salary bands, named postings, stats) against
`03-roles.md`; keep restated numbers exact.

### Locked decisions to respect (do not relitigate)
- Talent stance: **"we don't hire from these paths."** Pure authority/citation play. No recruiting
  framing, no rates page.
- **"Citation engineering" is a citation-focused slice of GEO/AEO, not ours to coin** — and always
  disambiguate from local-SEO "citation building" (NAP directory listings) if it comes up.
- Glossary lives at top-level `/glossary/`.

## Definition of done
- Draft `drafts.career-technical-seo-specialist` exists (verify with a `perspective:'raw'` query).
- `npx tsc --noEmit` clean (ignore pre-existing `lib/lead-form/*` Zod errors — not ours); changed files
  lint clean; `npx next build` compiles.
- Do NOT publish — leave as a draft. Publish/voice via
  `prompts/career-paths/voice-and-publish-path.md`.

---

## Source material for this role (verified — pulled from docs/strategy/career-path/03-roles.md + 04-niches.md)

Everything below is inlined so the downstream author agent needs no other file. Figures are the verified
ground truth from `03-roles.md` — restate them exactly. Where the doc marks a threshold *speculative*,
keep that hedge.

### Lede seed (operator voice — doubles as a standalone quotable definition)
> Technical SEO at catalog scale is plumbing, not content: it decides whether crawlers — Google's and
> the AI ones — can reach your SKUs at all. On a distributor site it is the enforcement arm of GEO,
> because the best spec page on earth is invisible if bot protection blocks ClaudeBot at the edge.

(Alternate one-liner if you want a tighter `description`: "Distributor sites are technical-SEO worst
cases. This is the role that makes a 100K-SKU catalog crawlable — by Google and by the AI engines —
before anyone pays for content or GEO.")

### Seniority matrix (Entry / Mid / Senior)
Drawn from `03-roles.md` §4.2 (and the catalog-scale realities it names). Each level = one `focus` line
+ 3–4 concrete `mustLearn` items.

**Entry** — *focus:* Run the audits and read the logs. You are an SEO learning where a large catalog
actually breaks.
- mustLearn:
  - Reading server log files to see who crawled what — Googlebot, Bingbot, and the AI crawlers
    (GPTBot, PerplexityBot, ClaudeBot)
  - How faceted navigation multiplies into crawl-trap URLs, and the basics of robots.txt / canonical /
    `noindex` / parameter handling
  - Checking whether AI crawlers are blocked at the edge (WAF / bot-management rules), not just in
    robots.txt
  - Bing Webmaster Tools and why Bing now matters for AI (Bing powers Copilot and ChatGPT browsing)

**Mid** — *focus:* Own crawlability and indexation for the whole catalog. (This is where the title
lives.)
- mustLearn:
  - Taming faceted-nav explosion at template scale — crawl budget, canonicalization, which facet
    combinations are allowed to exist as indexable URLs
  - A standing GPTBot/PerplexityBot/ClaudeBot log-file access audit — confirming the retrieval crawlers
    can actually reach product and category templates
  - Punchout / ERP storefront and contract-pricing quirks that hide the catalog from anonymous
    crawlers
  - Rendering reality — making spec data crawlable as HTML, not trapped in a JS catalog or PDF;
    XML sitemaps and `llms.txt` as catalog-scale signals

**Senior** — *focus:* Own crawl architecture and de-risk the replatform; set the technical standard GEO
depends on.
- mustLearn:
  - Replatform risk management — migrations, redirect maps, and not torching indexation or crawler
    access for a 100K+ SKU site
  - Setting the catalog's technical-SEO standard so GEO/AEO work has a crawlable foundation to build
    on (technical SEO as the enforcement arm of GEO)
  - Site performance and rendering at scale — Core Web Vitals, edge/CDN behavior, and how bot
    management interacts with both human and crawler traffic
  - Prioritizing lumpy, project-shaped technical work against finite engineering time

### Suggested chapter outline (4–6 H2 chapters, each closes with a "test it on your own site" tip)
Cover the REAL work of this role on an industrial catalog. One `h2` per chapter, intro paragraph first.

1. **What technical SEO becomes at catalog scale** — set the frame: the unit of work is the template
   (one fix × 200K SKUs), distributor sites are technical-SEO worst cases, and on these sites technical
   SEO is the enforcement arm of GEO. *Tip:* count your indexable URLs vs your real SKU count — if
   indexable URLs dwarf SKUs, faceted nav is generating crawl-trap pages.
2. **Read the logs: who is actually crawling you** — server log-file analysis as the foundational skill;
   separate Googlebot/Bingbot from GPTBot/PerplexityBot/ClaudeBot; lumpy crawl tells you what's
   reachable. *Tip:* pull a week of access logs and grep for `GPTBot`, `PerplexityBot`, `ClaudeBot` —
   if they're absent, either they can't reach you or they're blocked.
3. **The AI-crawler access audit (the new first deliverable)** — robots.txt is not the whole story; bot
   protection / WAF rules block AI crawlers at the edge, yielding zero LLM retrievability regardless of
   content. This is the deliverable that starts the engagement. *Tip:* request the same product URL as
   a normal browser and then with a `PerplexityBot`/`ClaudeBot` user agent — compare status codes; a
   403/challenge for the bot means you're invisible to that answer engine.
4. **Tame the faceted-nav explosion** — crawl budget, canonicalization, parameter handling, and deciding
   which facet combinations are allowed to be indexable URLs at all. *Tip:* take one category, list
   every facet-combination URL a crawler can reach from it, and decide for each: index, canonical, or
   block. Most should be blocked.
5. **Make the catalog renderable and reachable** — spec data as crawlable HTML (not a JS catalog or a
   PDF line card), XML sitemaps and `llms.txt` at scale, and the punchout/ERP and contract-pricing
   traps that hide the catalog from anonymous crawlers. *Tip:* load your top category page with
   JavaScript disabled — if the specs and part numbers vanish, so do they for most crawlers.
6. **Don't break it on replatform** — migration and redirect discipline so a relaunch doesn't torch
   indexation or crawler access; Bing Webmaster Tools as a now-relevant surface because Bing powers
   Copilot/ChatGPT browsing. *Tip:* before any replatform, snapshot your top-1,000 crawled URLs and
   their crawler access; after launch, re-run the same check before declaring success.

(Pick 4–6 of these; the AI-crawler access audit chapter is non-negotiable — it's the role's headline
deliverable.)

### Buyer section seeds ("Hiring this role?")
- **whatTheyDo (1 sentence):** A technical SEO specialist makes a large distributor catalog crawlable
  and indexable — taming faceted nav, fixing rendering, and auditing whether AI crawlers
  (GPTBot/PerplexityBot/ClaudeBot) can even reach your pages, which is the precondition for any GEO
  work paying off.
- **signsYouNeedOne (3–4 bullets):**
  - You rank fine on some pages but suspect AI engines never see your catalog at all
  - Your faceted navigation generates far more indexable URLs than you have SKUs
  - Your spec data lives in a JS catalog or PDFs, or behind punchout/contract-pricing that anonymous
    crawlers can't reach
  - You're about to replatform and don't want to lose indexation (or crawler access) in the move
- **inHouseVsAgency (the honest call for THIS role):** Demand is *lumpy* — technical SEO is
  project-shaped (audit, replatform, faceted-nav cleanup) punctuated by monitoring, not a steady
  full-time load. So buy it as a **project or retainer** for most distributors. An **in-house** hire
  only makes sense where an SEO team already exists for the specialist to plug into; a lone technical
  SEO with no content/GEO counterpart is a mishire. If you hire one search person total, it should be a
  hybrid (see the GEO Specialist and SEO Specialist paths), not a technical-SEO-only role.
- **costReality (figures + sources, exact):** ZipRecruiter puts the technical SEO specialist average at
  **~$81K (about $28–57/hr)**. Because the work is lumpy, a project or retainer usually beats a
  fully-loaded full-time hire for sub-enterprise distributors. (Source: `03-roles.md` §4.2, citing
  ZipRecruiter salary pages.)

### Industrial angle (concrete niche examples — from 04-niches.md)
Saturate the page with these; they reinforce the vertical, not just the discipline:
- **Faceted-nav / catalog scale:** a 100K+ SKU MRO or hydraulics catalog where the unit of work is the
  template — one fix across hundreds of thousands of SKUs. Faceted nav (by thread size, pressure
  rating, brand, length) multiplies into millions of crawl-trap URLs if uncontrolled.
- **Rendering / extractability:** hydraulics distributors run "brochure sites with PDF line cards" and
  configured products (hose assemblies) that resist carts — spec data trapped in PDFs or a JS catalog
  is unreachable. Pull it into crawlable HTML so a crawler (and an engine) can read it.
- **Part-number reachability:** the canonical part-number-search vertical is industrial automation
  aftermarket — "1756-L61 replacement," "what replaces the discontinued PowerFlex 4?", "SLC 500 →
  CompactLogix migration." These cross-reference/interchange pages are exactly what AI engines cite —
  but only if a crawler can reach them. (Radwell 20M+ parts, Galco, surplus specialists.)
- **Cross-reference content as the citation magnet:** Parker-to-Gates hose interchange,
  SKF-to-NTN bearing interchange, Allen-Bradley/Rockwell migration tables, obsolete-breaker
  (FPE/Zinsco → modern) replacement guides. Structured reference tables earn AI citations; essays
  don't — and none of it earns anything if bot protection blocks the retrieval crawler at the edge.
- **PIM dependency:** PIM attribute completeness determines whether facet pages are buildable at all —
  no normalized attributes, no facet pages to make crawlable. (Cross-link the `pim` and `part-number-seo`
  concepts.)
- **The buyer-side hook (recurring across the research):** distributors' login-walled pricing/specs
  (punchout, contract pricing) plus aggressive bot protection make them invisible to LLMs regardless of
  content quality. This is the Sale Solution audit hook — surfaced independently in the technical-SEO
  and e-commerce-manager research (`03-roles.md` §2.6).

### Aliases + relatedTerms (final chosen values)
- **aliases:** `["Technical SEO Specialist", "SEO Engineer", "Technical SEO (E-commerce)"]`
- **relatedTerms (all in the published whitelist; strong refs):**
  `["ai-crawler", "llms-txt", "generative-engine-optimization", "ai-visibility", "part-number-seo"]`
  - `ai-crawler` — GPTBot/PerplexityBot/ClaudeBot access is the headline deliverable.
  - `llms-txt` — the catalog-scale AI-crawler signal this role implements (note the verification caveat
    below — present it accurately).
  - `generative-engine-optimization` — this role is the enforcement arm of GEO; the crawlability
    foundation GEO builds on.
  - `ai-visibility` — what you lose entirely when crawlers are blocked; the outcome the audit protects.
  - `part-number-seo` — the high-intent, near-zero-volume catalog queries the crawlable templates serve.
  - (Considered and dropped to keep it to five: `retrieval-augmented-generation` — accurate but one
    layer removed from the plumbing focus; `part-number-cross-reference` — folded into the industrial
    angle prose rather than a strong ref, since `part-number-seo` already carries the catalog-query
    link.)

### Verification notes (verified vs flagged)
- **VERIFIED (from `03-roles.md` §4.2, the already-verified ground truth):** ZipRecruiter technical SEO
  specialist average ~$81K ($28–57/hr); distributor sites as technical-SEO worst cases (faceted-nav
  explosion, punchout/ERP storefronts, replatform risk); bot protection blocking AI crawlers sitewide →
  zero LLM retrievability regardless of content; log-file analysis now including
  GPTBot/PerplexityBot/ClaudeBot auditing; technical SEO as the enforcement arm of GEO; Bing Webmaster
  Tools newly relevant because Bing powers Copilot/ChatGPT browsing; buyer framing "demand is lumpy —
  buy as project/retainer; in-house only where an SEO team already exists."
- **VERIFIED (cross-page in `03-roles.md`):** the unit of work is the template (one fix × 200K SKUs) and
  PIM attribute completeness gating facet pages (§4.1); the ~12% of AI-cited URLs ranking in Google's
  top 10 stat is the GEO/citation-engineer figure (§3.4 cites ~15% for AI Overview citations from
  top-10) — if you use a citation/ranking stat, attribute it precisely and prefer not to lean on it
  here, since this role is plumbing, not citation strategy.
- **VERIFIED (from `04-niches.md`):** the cross-reference/interchange examples (Parker-to-Gates,
  SKF-to-NTN, Allen-Bradley/Rockwell migration, obsolete-breaker FPE/Zinsco); the automation-aftermarket
  part-number queries ("1756-L61 replacement," "SLC 500 → CompactLogix"); hydraulics "brochure sites
  with PDF line cards" and cart-resistant hose assemblies; Radwell 20M+ parts.
- **FLAGGED — `llms.txt` accuracy:** per `_CONTEXT.md`, llms.txt is a Markdown proposal introduced in
  2024 and **Google declined to support it**. Don't overstate adoption — present it as a proposed,
  not-universally-honored signal. (The `llms-txt` glossary term already carries the nuance; let the
  link do the work and keep on-page claims modest.)
- **FLAGGED — distinguish training vs retrieval crawlers:** GPTBot/ClaudeBot are largely
  *training* crawlers; OAI-SearchBot/PerplexityBot are the *retrieval* crawlers that fetch to ground a
  cited answer. The "blocked = invisible to that answer" claim is strongest for the retrieval crawlers.
  Phrase the audit accordingly (the GEO Specialist path already draws this distinction — match it).
- **FLAGGED — speculative threshold to keep hedged:** any revenue threshold for "when in-house makes
  sense" is marked *speculative* in `03-roles.md`; §4.2 itself gives no number (it only says "in-house
  only where an SEO team already exists"). Do **not** invent a dollar threshold for this role.
- **AHREFS DEMAND CHECK (one attempt, 2026-06-15):** keyword "technical seo specialist" (US) returned
  **volume 2,200 / KD 23 / CPC $8.00**. Notable: this is a *real, established* role-title query — unlike
  the near-zero-volume emerging titles (e.g. "geo specialist" at 40 vol / KD 0). The page is still a
  citation/entity play within the hub, but unlike the coined/emerging paths it can also catch genuine
  search demand. Treat that as upside, not the brief — keep the page cheap and on-strategy, and don't
  let the volume tempt a generic "how to become a technical SEO" page; it stays the industrial-distributor
  flavor (per the §4.1/§4.2 rule: "never as generic 'how to become an SEO'").
