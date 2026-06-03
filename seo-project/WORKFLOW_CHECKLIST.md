# SEO Content Project — Workflow Checklist

*Step-by-step process for running a new SEO content strategy project in Claude Cowork. Based on the Liori Diamonds project workflow.*

---

## Phase 0: Project Setup (5 min)

- [ ] Create project folder (e.g., `/ClientName/`)
- [ ] Copy `PROJECT_INTAKE.md` into folder and fill it out
- [ ] Upload all data files to the session
- [ ] Run the `product-marketing-context` skill to build `.agents/product-marketing-context.md`
- [ ] Confirm client priorities and focus areas

---

## Phase 1: Discovery & Audit

### If GSC data is available:
- [ ] Analyze Pages.csv — page-level performance, collection/category CTR gaps
- [ ] Analyze Queries.csv — keyword clusters, brand vs non-brand split, position distribution
- [ ] Identify quick wins — queries at position 4-15 with high impressions
- [ ] Flag CTR anomalies — high impressions + low clicks = content bridge opportunity
- [ ] Build SEO analysis spreadsheet (optional but valuable for client credibility)

### If competitor keyword data is available:
- [ ] Merge and deduplicate across all keyword files
- [ ] Filter for relevant keywords (SV ≥ 50, exclude irrelevant terms)
- [ ] Cluster by topic / intent / category
- [ ] Identify content gaps (competitor ranks, client doesn't)
- [ ] Calculate total addressable search volume

### If starting from scratch (no data):
- [ ] Map site taxonomy via `site:domain.com` web searches
- [ ] Identify competitors via web search
- [ ] Build keyword seed list from product categories
- [ ] Research keyword volumes via available tools
- [ ] Analyze competitor blog content structure

### Always:
- [ ] Map site taxonomy — all URLs by category
- [ ] Inventory existing blog content — what already exists
- [ ] Identify top 5 collection / money pages
- [ ] Document the product category → URL structure

**Output:** SEO Analysis Excel (if data-rich) or Discovery Summary

---

## Phase 2: Content Plan

- [ ] Build master content plan — titles, keywords, SV, KD, funnel stage, priority
- [ ] Map each post to a target collection/category page (CTA mapping)
- [ ] Run overlap audit against existing content (avoid duplicates)
- [ ] Organize by category / topic cluster
- [ ] Prioritize using formula: `(SV × commercial_intent) ÷ KD`
- [ ] Split into phases aligned with client priorities

**Output:** Content Plan Excel (titles, keywords, metrics, categories)

---

## Phase 3: Action Plan & Calendar

- [ ] Select top N posts based on priority ranking
- [ ] Determine publishing pace (posts per week)
- [ ] Build week-by-week editorial calendar
- [ ] Mix update posts (quick wins) with new content
- [ ] Front-load client's priority topics in early weeks
- [ ] Estimate expected traffic for each post

**Output:** Action Plan Excel (calendar + expected outcomes)

---

## Phase 4: Revenue Model

- [ ] Define funnel stages: Blog → Collection → Product → Purchase
- [ ] Set conversion rates per stage (use benchmarks or client data)
- [ ] Build conservative / moderate / aggressive scenarios
- [ ] Calculate monthly and annual revenue projections
- [ ] Tie back to specific content actions

**Output:** Revenue Model (embedded in Excel or standalone)

---

## Phase 5: Client Presentation

- [ ] Build PowerPoint deck with:
  - The problem / opportunity (data-backed)
  - The strategy (phased approach)
  - Content-to-category mapping (how posts drive sales)
  - Week-by-week or month-by-month plan
  - Revenue projections (the money slide)
  - Next steps (clear actions)
- [ ] QA all slides visually
- [ ] Ensure the client's stated priorities are front and center

**Output:** Client-facing PPTX

---

## Phase 6: Content Production (optional)

- [ ] Write content briefs for each post
- [ ] Produce HTML articles with:
  - SEO-optimized title, meta, headers
  - Internal links to collection/product pages
  - CTAs mapped to relevant money pages
  - Schema markup (FAQ, Article, Product)
  - Original images/graphics where needed
- [ ] Review and QA each article

**Output:** HTML articles ready to publish

---

## Phase 7: Reporting Setup

- [ ] Create KPI tracking spreadsheet
- [ ] Define weekly metrics: posts published, indexed, blog clicks, collection visits
- [ ] Set up monthly review cadence
- [ ] Define success criteria at 1, 3, 6, 12 months

**Output:** KPI Tracker Excel

---

## Files Produced (typical project)

| File | Description |
|------|-------------|
| `{Client}_SEO_Analysis.xlsx` | Performance audit with multiple analysis sheets |
| `{Client}_Content_Plan.xlsx` | Full content plan with all posts |
| `{Client}_Action_Plan.xlsx` | Prioritized calendar with expected outcomes |
| `{Client}_Strategy.pptx` | Client-facing presentation |
| `{Client}_KPI_Tracker.xlsx` | Weekly reporting template |
| `LIORI-XX/` folders | Individual article HTML files (if content production phase) |

---

## Time Estimates

| Phase | With full data | With partial data | From scratch |
|-------|---------------|-------------------|-------------|
| Discovery & Audit | 15-20 min | 20-30 min | 30-45 min |
| Content Plan | 10-15 min | 15-20 min | 20-30 min |
| Action Plan & Calendar | 5-10 min | 5-10 min | 10-15 min |
| Revenue Model | 5 min | 5-10 min | 10 min |
| Client Presentation | 15-20 min | 15-20 min | 15-20 min |
| Per article (production) | 10-15 min each | 10-15 min each | 10-15 min each |

**Total (plan only):** 50-70 min with full data, 60-90 min from scratch
**Total (plan + 10 articles):** 3-4 hours
