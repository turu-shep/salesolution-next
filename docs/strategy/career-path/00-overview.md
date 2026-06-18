# Career-Path Wiki + Glossary — Strategy Overview

**Status:** Strategy documented; content phase starting
**Owner:** Artur Shepel (a.shepel@salesolution.net)
**Asset:** `/career-paths/` (live — 7 paths published) + `/glossary/` (live — 20 terms published)
**Strategy research date:** 2026-06-12

---

> **Multi-vertical reframe (2026-06-17, standing):** this folder was written for the *old*
> industrial-only positioning. Sale Solution now serves **three verticals** — industrial /
> technical-distribution e-commerce, home-services contractors, and dental practices (memory
> `multi-vertical-pivot`). **Standard going forward:** career paths and glossary teach the
> *universal* role/term, with examples that **span all three verticals** and show the
> vertical-specific flavor where a skill differs — never industrial-only. The reference build is
> the rebuilt `/career-paths/technical-seo-specialist/`. The industrial-specific docs below
> (esp. [04-niches.md](04-niches.md)) remain useful as the *industrial* example pool, not the
> whole picture.

## 1. What this is

A wiki-like learning hub on salesolution.net: career paths for the roles of modern AI-search
(GEO specialist, citation engineer, SEO specialist, content strategist…) plus a glossary of
AI-search / GEO / industrial e-commerce terms. Free, ungated, written by the operator.

It is **not** expected to convert to revenue. Its job is:

1. **Definitional land-grab** — own the canonical definitions for the emerging AI-search role
   and term space while the SERPs and LLM training sets have no canonical source.
2. **AI-answer citability (GEO)** — reference/definitional content is the format LLMs cite;
   citations do not require rankings.
3. **Operator credibility** — proof-of-depth artifact for sales calls and for the occasional
   sophisticated buyer who reads it.
4. **Link surface** — free reference material is one of the few white-hat link magnets
   available to a DR 10 commercial site.

## 2. The one-paragraph verdict (from 2026-06-12 research)

As a broad "careers in marketing/AI/sales" hub: **no** — career head-terms are owned by
DR 80-95 sites (Indeed, Coursera, BrightEdge, Semrush) and unreachable from DR 10; reading
lists are the weakest format in the category; authority doesn't transfer from junior-marketer
readers to industrial buyers. Narrowed to the **AI-search lane** (GEO / AI search / citation
engineering — where live SERPs contain only job listings and zero guides), with a
**buyer-facing section on every page** and a **glossary as the citable core**: **yes**, as a
cheap, capped-investment authority asset. Full evidence in
[01-assessment.md](01-assessment.md).

## 2a. Implementation status (2026-06-14)

- ✅ **Glossary system built + verified** (tsc + lint + `next build` green): `glossaryTerm`
  schema, `/glossary` hub + `/glossary/[term]` pages, `DefinedTerm`/`DefinedTermSet` JSON-LD,
  sitemap wiring. Hub stays `noindex` until 15 published terms; term pages index on publish.
- ✅ **Glossary LIVE — 20 terms published** (2026-06-14). Each definition fact-checked +
  adversarially verified (40-agent workflow); each carries an "In practice" usage example
  (15 real-verifiable with sources, 5 honestly-illustrative). Hub cleared the 15-term
  index threshold and is in the sitemap. Talent stance decided: keep "we don't hire."
- ⚠️ Verification correction: "citation engineering" is **in active public use**, not ours
  to coin — repositioned as a slice of GEO/AEO ([05 §1](05-glossary.md)).
- ✅ **Career paths: 2 published** (2026-06-14) — GEO Specialist + Citation Engineer, voiced into
  the operator register and live. `careerPath` schema extended (seniority matrix, buyer section,
  related glossary terms), detail page visually reviewed + polished. Hub now lists them (empty-hub
  hygiene issue resolved). Talent stance "we don't hire" honored.
- ✅ **Career paths: 7 published** (2026-06-16) — added the next 5 in build order: **AI Search
  Specialist** + **AEO Specialist** (P0 lane), **AI Visibility Analyst** (P1, the only Entry-level
  page), **SEO Specialist (industrial)** + **Technical SEO Specialist** (P1). Each researched →
  authoring-prompt generated (`prompts/career-paths/_generated/`) → drafted → re-voiced through the
  **humanizer pass** (operator register, 0 AI-tell hits, every verified salary/stat preserved) →
  published live (all 200, fresh content confirmed). Build order remaining: Content Strategist
  (industrial, #8), then the P2 adjacent roles.
- ✅ **Interlinking + foundations done (2026-06-14):** `glossaryRef` inline-link annotation shipped
  (schema + GROQ + renderer); AI-SEO money page links to glossary terms + both paths ("From the
  learning hub" block + inline lede link); role glossary terms link to their full paths; `llms.txt`
  corrected (real services, learning hub added, address fixed); `robots.ts` already allows all AI
  crawlers (WAF/CDN is the owner's manual check). Reusable prompts live in `/prompts/`.
- ✅ **Revenue track code done (2026-06-14):** SAL-404 — AI-SEO page now targets "geo agency"
  (title + meta + a "Looking for a GEO agency?" section + industrial long-tail), live. SAL-405 —
  GSC verification wiring added (`app/layout.tsx` + env example). **GA4 working** (`G-F0DJT7P1RQ`)
  and **GSC is connected** to the Ahrefs project (id 5379899, verified 2026-06-15 — real monthly
  data pulls). SAL-405 effectively complete. Pre-launch GSC baseline captured in
  [08-gsc-baseline-2026-06-15.md](08-gsc-baseline-2026-06-15.md) (~520 impr/mo, ~5 clicks/mo).
- ⏭ Next: SAL-406 Brand Radar (AI-citation tracking); re-pull `gsc-pages`/`gsc-keywords` once the
  dimension tables backfill; measure hub impact vs the baseline in ~4 weeks. Optional: confirm GA4
  in Vercel prod; exclude `/career-paths/*` + `/glossary/*` from GA4 goals/retargeting.
  Brand Radar; retro-link the 28 posts/guides with `glossaryRef`; the Content Strategist path
  (SEO/AEO/AI-Visibility/Technical-SEO paths now shipped 2026-06-16); grow the glossary. All have
  prompts in `/prompts/`.

## 3. Document index

| File | Purpose |
|------|---------|
| [00-overview.md](00-overview.md) | This file — summary and index |
| [01-assessment.md](01-assessment.md) | Strategic assessment: evidence, comparables, verdict, caveats |
| [02-scope-and-positioning.md](02-scope-and-positioning.md) | What we build / don't build; the rules every page follows |
| [03-roles.md](03-roles.md) | Role inventory: lanes, responsibilities by seniority, buyer framing |
| [04-niches.md](04-niches.md) | Industrial e-commerce verticals — the example pool for all content |
| [05-glossary.md](05-glossary.md) | Glossary plan + seed term list with ownership opportunities |
| [06-wiki-architecture.md](06-wiki-architecture.md) | Content model: URL structure, Sanity schema deltas, interlinking, JSON-LD |
| [07-research-backlog.md](07-research-backlog.md) | Next research tasks and write-downs, with dates |
| [08-gsc-baseline-2026-06-15.md](08-gsc-baseline-2026-06-15.md) | Pre-launch GSC baseline — the before/after anchor for the hub's impact |
| [09-career-path-build-standard.md](09-career-path-build-standard.md) | **Build standard** — decisions, fixes, and lessons; read before reworking/creating any path |
| [10-enriched-paths-vision.md](10-enriched-paths-vision.md) | **Enrichment vision** — the roadmap.sh steal/avoid + the lifted cost cap; what an enriched path/term can become and the per-page enrichment principle |
| [11-enriched-paths-tech-task.md](11-enriched-paths-tech-task.md) | **Enrichment tech task** — engineering spec: foundational steals, the optional-enrichment mechanism, phases, acceptance criteria, open questions |

## 4. Hard constraints (carry into every decision)

- **Never measure this on leads.** Metrics: referring domains, AI citations (Brand Radar),
  third-party usage of our terms. Grow & Convert's documented methodology exists because
  this traffic class doesn't convert — that's expected, not failure.
- **Cap the investment.** The repo estimate to publish the two drafted paths is 16–30 h total.
- **2026-06-14 data is in** (see [01 §1 + §3a](01-assessment.md)): the **glossary is the lead
  asset** (winnable concept terms — AEO KD 31, ai visibility KD 25, ai share of voice KD 8);
  **career/role pages are citation plays only** (geo specialist 40 vol, citation engineering 0).
  Separately, **"geo agency" (1,300 vol, KD 15, commercial)** → a buyer service page, not this hub.
- **Vertical saturation.** Every path chapter and glossary entry uses industrial e-commerce
  examples (see [04-niches.md](04-niches.md)) so the hub reinforces
  "AI search **for industrial e-commerce**", not just "AI search".
- **Hygiene first.** The hub is live, indexed, in nav, and empty — publish the two drafted
  paths quickly or `noindex` until content exists. An indexed empty hub promising content
  "this quarter" is a standing credibility cost.
