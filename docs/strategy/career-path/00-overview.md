# Career-Path Wiki + Glossary — Strategy Overview

**Status:** Strategy documented; content phase starting
**Owner:** Artur Shepel (a.shepel@salesolution.net)
**Asset:** `/career-paths/` (live, code-complete, zero published content) + planned `/glossary/`
**Strategy research date:** 2026-06-12

---

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
- 🟡 **Career paths: system built + 2 P0 drafts** (2026-06-14). `careerPath` schema extended
  (seniority matrix, buyer section, related glossary terms); `/career-paths/[slug]` renders all
  new sections (verified). **GEO Specialist + Citation Engineer seeded as drafts** for operator
  voicing (`scripts/seed-career-paths.mjs`). Talent stance "we don't hire" honored.
- ⏭ Next: review/voice/publish the 2 path drafts; draft the 2 originally-promised SEO/Content
  paths; wire glossary links into the service/guide pages.

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
