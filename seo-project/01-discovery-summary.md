# Phase 1 Discovery Summary

**Date:** 2026-05-22
**Inputs:** `data/Pages.csv` (26 rows), `data/Queries.csv` (54 rows)
**Date range:** `?? CONFIRM — GSC default is last 3 months unless changed`

---

## Headline finding

The site has **almost no organic traffic right now.** Across all 54 queries that registered any impressions in the period, the site received **14 total clicks** — and **11 of those came from brand-name searches** (`salesolution`, `sale solution`).

This isn't a "refresh stale content" project. It's closer to a **"diagnose and rebuild visibility"** project. The original "refresh 19 posts" framing assumed those posts had traffic to protect or grow. They don't.

---

## What's actually working

Three pages account for all 14 clicks:

| Page | Clicks | Impr | CTR | Pos | What it's winning |
|------|-------:|-----:|----:|-----|-------------------|
| `/` | 11 | 672 | 1.64% | 24.9 | Brand searches mostly |
| `/contact-me/` | 3 | 130 | 2.31% | 4.08 | Brand + contact-intent variations |
| `/guides/b2b-marketing-strategy-framework-with-example-7-step/` | 0 | 375 | 0% | 69 | **B2B framework query cluster — biggest single non-brand asset** |

---

## What's underperforming (has impressions, no clicks)

| Page | Impr | Pos | Diagnosis |
|------|-----:|-----|-----------|
| `/guides/b2b-marketing-strategy-framework-with-example-7-step/` | 375 | 69 | **Top non-brand opportunity.** Pos 69 → if moved to top 10, ~30–80 clicks/mo from this cluster |
| `/future-proof-your-seo/` | 133 | 34 | Lead-gen funnel page — improvable to page 1 |
| `/which-reports-indicate-how-traffic-arrived-at-a-website/` | 202 | 55 | **Best refresh candidate from the 19 posts.** Pos 55 on a real query cluster (~130 cluster impressions) |
| `/category/blog/` | 76 | 10.6 | Blog hub — pos 10 means it's *one slot* off page 1 visibility |
| `/services/ai-seo/` | 47 | 4.68 | **Page 1 already, just low query volume right now** |
| `/the-art-of-profitable-words-mastering-b2b-content-writing/` | 26 | 6.69 | Page 1 — meta description / title isn't winning the click |
| `/b2b-data-driven-marketing-no-more-guesswork/` | 26 | 40.69 | Has impressions, deep position |
| `/generative-engine-optimization-basic-to-advanced/` | 22 | 5.82 | **Page 1 for "advanced generative engine optimization techniques 2026"** — low volume but exactly our positioning |
| `/content-marketing-101/` | 10 | 7.1 | Page 1, very thin query base |
| `/what-is-content-writing-master-the-science-of-web-writing-in-2023/` | 9 | 5 | Page 1, very thin query base |

---

## The 13 posts that don't appear at all

Thirteen of the 19 posts in the inventory produced **zero impressions** in this period:

```
/direct-vs-organic-traffic-differences-acquisition/
/seo-mastery-enhancing-visibility-customer-attraction/
/on-page-seo-mastery-from-visibility-to-conversion/
/technical-seo-mastering-website-optimization/
/seo-strategy-template-2024-guide-goals-and-kpi/
/crafting-an-effective-e-commerce-funnel-for-2024/
/strategies-to-increase-e-commerce-conversion-rate/
/mastering-e-commerce-content-writing-guide-2023/
/user-intent-seo-guide-to-search-behavior-understanding/
/off-page-seo-in-depth-guide/
/content-strategy-expert-backed-guide-2023/
/ultimate-guide-mastering-keyword-research-2023/
/long-tail-keywords-blueprint-2023/
```

Possible causes (need to verify, not guess):
1. **Recent migration impact** — WP→Next.js cutover happened in May 2026. Could be temporary deindexing or a discovery lag.
2. **Below position 100 on everything** — they exist but are buried deep.
3. **Not indexed at all** — verifiable with `site:salesolution.net/<slug>/` checks per post.

Before refresh decisions, we should check indexation status for these 13.

---

## Query universe — clusters with real demand

### Cluster 1: B2B framework (~344 impressions, all 0 clicks)
- `b2b marketing strategy framework` (170 imp, pos 71)
- `b2b sales strategy framework` (93, 85)
- `b2b marketing framework` (29, 62)
- `b2b framework` (25, 84)
- `b2b strategy framework` (7, 73)
- `b2b marketing strategy framework template` (5, 85)
- `b2b digital marketing framework` (3, 93)
- `b2b sales strategy frameworks` (1)
- `b2b marketing frameworks` (1)

**Asset:** the `/guides/b2b-marketing-strategy-framework-with-example-7-step/` guide. It already pulls 375 impressions; getting it into top 10 is the **single biggest lift available** on this property.

### Cluster 2: Traffic-source reports (~130 impressions, all 0 clicks)
- `which reports indicate how traffic arrived at a website` (20, 40)
- `traffic website report` (72, 76)
- `which report indicate how traffic arrived at a website` (8, 37)
- `which reports indicate how traffic arrived at a website?` (5, 43)
- `what report shows the percentage of traffic that previously visited a website?` (5, 62)
- `what report shows which web pages get the most traffic and highest engagement?` (5, 61)
- + 6 more long-tail variants (~12 impressions)

**Asset:** `/which-reports-indicate-how-traffic-arrived-at-a-website/` (pos 55). Solid quantified demand — refresh target #1 of the existing 19.

### Cluster 3: Brand spelling drift
- `salesolution` (52, pos 2.54) — canonical
- `sale solution` (132, pos 63) — losing to it
- `sales solutions` (89, pos 65) — losing to it
- `sales solution` (132, pos 63) — losing to it
- `sale solution` (12 again, dup)
- `salessolution` (2, pos 7)
- `solution sales` (3, pos 7)
- `digital sales solution(s)` (3+4)

**Finding:** "Sale Solution" loses to "Sales Solution"/"Sales Solutions" plural variants in search. People type the plural and don't find the site. This is a positioning issue, not a content fix. Worth a separate decision.

### Cluster 4: GEO / AI-search (very thin, but exactly our positioning)
- `best practices for optimizing product titles for ai search 2025` (40, 84)
- `advanced generative engine optimization techniques 2026` (1, **pos 4**)
- `generative ai for marketing` (1, 21)
- `future-proofing seo audit` (3, 11)
- `futureproof seo` (3, 40)
- `future proof seo` (2, 69)

The category we want to own has **almost no measurable demand on this property yet**. We rank on hyper-specific long-tail queries that don't have search volume. Building demand here = creating the topical authority that lets us appear on more queries, not refreshing 19 posts.

### Cluster 5: B2B data-driven marketing (small)
- `data-driven b2b marketing` (5, 65)
- `data driven marketing b2b` (5, 66)
- `b2b data-driven marketing` (2, 92)
- `data driven b2b` (1, 56)
- `b2b data driven marketing` (1, 82)

**Asset:** `/b2b-data-driven-marketing-no-more-guesswork/` (pos 41). Refresh + better targeting could bring this to page 2 minimum.

---

## What this means for the plan

The original "refresh 10 HIGH-priority posts" plan was anchored on **title staleness** (the "2023" / "2024" in the slug). The data says title staleness isn't the right heuristic — most of those posts have **zero impressions**, so refreshing them produces zero ranking signal because there's no demand they're currently ranked for.

The right heuristic for THIS site is **quantified demand × proximity to page 1**:

### Tier A — Refresh now (high probable lift)
1. `/guides/b2b-marketing-strategy-framework-with-example-7-step/` — guide, not a post, but **biggest single opportunity** on the site (375 imp, pos 69 → 10).
2. `/which-reports-indicate-how-traffic-arrived-at-a-website/` — clearest refresh win from the 19 (202 imp, pos 55 → page 1).
3. `/future-proof-your-seo/` — lead-gen page, 133 imp pos 34. Page-level refresh + schema improvements.
4. `/b2b-data-driven-marketing-no-more-guesswork/` — pos 41 on a small but qualified cluster.

### Tier B — Optimize CTR (page 1 already, no clicks)
5. `/the-art-of-profitable-words-mastering-b2b-content-writing/` — pos 6.69, 0 clicks. Title/meta rewrite, not content rewrite.
6. `/generative-engine-optimization-basic-to-advanced/` — pos 5.82, 0 clicks. Same.
7. `/content-marketing-101/` — pos 7.1, 0 clicks. Same.
8. `/what-is-content-writing-master-the-science-of-web-writing-in-2023/` — pos 5, 0 clicks. Same + slug/title freshness (it has "2023" in it).
9. `/category/blog/` — pos 10.6. Hub page improvement.
10. `/services/ai-seo/` — pos 4.68, 0 clicks. CTR work + body content depth.

### Tier C — Diagnose before deciding (the 13 with zero impressions)
Verify indexation. For each: `site:salesolution.net/<slug>/` check. Then split into:
- **Indexed but invisible** → either deep refresh or merge/redirect
- **Not indexed** → submit, then wait, then re-evaluate

### Tier D — Demand-build (the GEO/AI-search category)
Net-new pillars. Skip for this round.

---

## Brand-clarity finding (separate decision)

"Sales Solution" / "Sales Solutions" / "Sale Solution" / "Salessolution" together pull ~370 impressions, with the canonical brand getting 52. People type the plural and the apostrophe-less variant more than they type the actual name. This isn't fixable with content — it's a positioning + microcopy + maybe-redirect question.

Options to consider (not deciding now):
- Add "Sales Solution" / "Sales Solutions" as alternate-name signals in Organization schema
- Audit canonical site copy to make sure the brand string is consistently displayed
- Decide whether the company name should be "Sale Solution" or "Sales Solution" going forward (separate from a content refresh)

---

## What I need from Artur

Three things, in order:

1. **Confirm GSC date range** — was the export "last 3 months" (default), or longer? Sizing the opportunities depends on the period.
2. **Pick the refresh path** — Tier-A only (4 high-leverage pieces), Tier A+B (10 pieces incl. CTR-only work), or the original "all 19 + indexation diagnosis" sweep.
3. **Brand-spelling question** — defer or address as part of this round?
