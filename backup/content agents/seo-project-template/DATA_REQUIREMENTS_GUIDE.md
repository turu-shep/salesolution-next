# Data Requirements Guide — What Each Input Unlocks

*This doc explains what each piece of input data enables in the content strategy process. Use it to understand the minimum viable input for each deliverable, and what you gain by providing more.*

---

## Input → Output Map

### Primary Inputs (Section 1-10)

| Input Provided | What It Unlocks |
|---------------|-----------------|
| Website URL only | Basic taxonomy mapping (via search), competitor identification |
| + GSC Pages.csv | Page-level performance audit, CTR gap analysis, collection/category performance |
| + GSC Queries.csv | Keyword opportunity analysis, position-based quick wins, topical clustering |
| + Competitor keyword CSVs | Content gap analysis, SV/KD-based prioritization, total addressable market sizing |
| + Product categories | Content → money page CTA mapping, revenue funnel modeling |
| + AOV / revenue data | Revenue projections, ROI modeling |
| + Brand voice / differentiators | On-brand content briefs, competitor positioning angles |
| + Client priorities / focus | Prevents wasted effort, aligns with what client actually wants to see |

### Secondary Inputs (Section 11)

| Input Provided | What It Unlocks |
|---------------|-----------------|
| + Domain authority / backlink data | Realistic ranking timeline estimates (DR 10 ≠ DR 50 in difficulty) |
| + SEO history (past agencies, penalties) | Avoids repeating past mistakes, explains ranking anomalies |
| + Access credentials (GSC, GA, CMS) | Direct data pulls instead of workarounds, ability to publish |
| + Stakeholder / approval workflow | Accurate timeline estimates, prevents mid-project corrections |
| + Success criteria / KPIs | Ensures deliverables match how client measures "working" |
| + Seasonal / timing data | Content calendar aligns with demand peaks, not just SV data |
| + Conversion tracking / journey data | Revenue projections based on real funnels, not estimates |
| + Geographic targeting details | Local SEO strategy, location pages, GBP optimization |
| + Brand guidelines / imagery assets | Content production is faster and on-brand from day one |
| + Technical SEO baseline | Identifies ranking blockers before investing in content |

---

## Minimum Viable Input by Deliverable

| Deliverable | Minimum Input Needed |
|------------|---------------------|
| Basic keyword research | URL + competitor names |
| Content plan (titles + keywords) | URL + 1 competitor keyword export |
| Prioritized editorial calendar | GSC Queries + 1 competitor keyword export |
| Revenue projections | GSC Pages + product categories + AOV estimate |
| Client presentation | All of the above + client focus/priorities |
| Full written articles (HTML) | Content plan + product categories + brand voice |
| Programmatic SEO strategy | Product categories + keyword pattern + site structure |

---

## Data File Specifications

### Google Search Console — Pages Export
**How to get it:** GSC → Performance → Pages tab → Export (CSV)
**Expected columns:**
```
Top pages, Clicks, Impressions, CTR, Position
```
**What it tells us:**
- Which pages get traffic vs which get impressions but no clicks (CTR gap = opportunity)
- Collection/category page performance (are money pages getting traffic?)
- Blog post performance (which content works, which doesn't)
- Overall site health metrics (total clicks, impressions, avg position)

**Ideal:** Last 3 months, up to 1,000 rows

---

### Google Search Console — Queries Export
**How to get it:** GSC → Performance → Queries tab → Export (CSV)
**Expected columns:**
```
Top queries, Clicks, Impressions, CTR, Position
```
**What it tells us:**
- What people search to find this site
- Brand vs non-brand traffic split
- Keyword clusters by intent (informational, commercial, transactional)
- Position-based quick wins (queries ranking 4-15 that could move to top 3)
- Impression-rich but low-click keywords (CTR optimization opportunities)

**Ideal:** Last 3 months, up to 1,000 rows

---

### Competitor Keyword Exports
**How to get it:** SearchAtlas, Ahrefs, SEMrush → Competitor keyword ideas / Content gap
**Common columns:**
```
keyword, sv (search volume), kd (keyword difficulty), cpc, search_intent, ranking_url, parent_keyword
```
**What it tells us:**
- Total addressable keyword market
- Content gaps (what competitors rank for that the client doesn't)
- Keyword difficulty distribution (easy vs hard wins)
- Commercial intent signals (CPC indicates buying intent)
- Search intent classification (informational, transactional, commercial, navigational)
- Competitor content structure (what URLs rank for what)

**Ideal:** 2-3 exports using different seed keywords to maximize coverage. 5,000-10,000 rows each.

**Tip for seed keyword selection:**
Pick 2-3 seeds that represent different angles of the business. For Liori, we used:
- `lab grown diamonds` (core product)
- `lab grown engagement rings` (primary category)
- `gia certified engagement rings` (quality/trust angle)

This gave us 19,000+ unique keywords with good overlap elimination.

---

### Site Taxonomy / Sitemap
**How to get it:**
- XML sitemap: Usually at `domain.com/sitemap.xml`
- Screaming Frog crawl export
- Manual: Copy main navigation + category URLs
- If unavailable: AI maps via `site:domain.com` search queries

**What it tells us:**
- Full URL structure and page hierarchy
- Category/collection architecture
- Existing content inventory (blog posts)
- Internal linking opportunities
- Content-to-category mapping possibilities

---

### Google Analytics / Revenue Data
**How to get it:** GA4 → Reports → Acquisition → Organic Search
**Useful metrics:**
- Monthly organic sessions
- Top organic landing pages
- E-commerce conversion rate from organic
- Revenue from organic traffic
- Average order value (AOV)

**What it tells us:**
- Baseline revenue from organic (to project growth)
- Which pages convert (not just attract traffic)
- AOV for revenue funnel calculations

**If not available:** We estimate AOV from industry benchmarks or product pricing.

---

## What Happens Without Each Input

### Primary Inputs

| Missing Input | Workaround | Quality Impact |
|-------------|-----------|---------------|
| No GSC data | Build plan from competitor keywords + web research | Can't identify quick-win updates or CTR gaps. New content only. |
| No competitor keywords | Manual keyword research via web search | Slower, less comprehensive. Miss long-tail opportunities. |
| No product categories | Map from website navigation via search | Might miss internal categories. Can't map content → money pages accurately. |
| No AOV / revenue data | Use industry average estimates | Revenue projections are rough estimates, not data-backed. |
| No brand voice guidance | Analyze existing site copy for tone | Content may not match client expectations. |
| No client priorities | Prioritize by data (SV × intent ÷ KD) | Risk of going in wrong direction. Liori example: data said "black diamond first" but client wanted lab-grown focus. |
| No existing content inventory | Discover via GSC or site crawl | Might propose topics that already exist as blog posts. |

### Secondary Inputs

| Missing Input | Workaround | Quality Impact |
|-------------|-----------|---------------|
| No domain authority data | Estimate from site age, content volume, brand recognition | Ranking timelines may be unrealistic. A DR 10 site won't rank for KD 45 terms in 3 months. |
| No SEO history | Treat as fresh start | May unknowingly repeat failed strategies. Won't catch penalty recovery needs. |
| No site access (blocked/gated) | Map via `site:domain.com` search queries | Slower discovery, may miss categories/pages not indexed, can't verify on-page quality. |
| No approval workflow defined | Assume direct publish | Mid-project corrections (like Liori's "not black diamond" pivot) waste effort. |
| No success criteria | Default to traffic + revenue projections | Client may measure success differently (rankings, brand queries, lead quality). |
| No seasonal data | Build flat calendar | Content may miss peak demand windows. E.g., publishing engagement ring content in July instead of pre-holiday season. |
| No conversion data | Use industry benchmarks (2-4% e-commerce, 5-10% lead gen) | Revenue funnel is theoretical, not validated against real customer behavior. |
| No geographic targeting info | Default to national strategy | Miss local SEO opportunities, location-specific content that converts well. |
| No brand guidelines | Infer from website copy | Content tone may not match client expectations. Requires more revision cycles. |
| No technical SEO baseline | Discover issues during audit phase | May build content strategy on a technically broken foundation (slow site, indexing issues). |

---

## Lessons Learned (from the Liori project)

1. **Client priorities override data.** The data showed black diamond (49K SV) as the biggest opportunity, but the client's business focus was lab-grown diamonds. Always ask "what should NOT be prioritized" upfront.

2. **GSC impression/click disconnect is gold.** The most actionable finding was that lab-grown collection pages had 248K impressions but only 253 clicks — a clear case for blog content as a bridge.

3. **Overlap audits save time.** When we built a 50-post plan, only 22 were truly new (the site already had 30+ lab-grown posts). Always check existing content before planning new.

4. **Competitor keyword exports are the richest input.** Three CSVs with 19K rows gave us more actionable data than anything else. They enabled gap analysis, SV validation, and topic discovery all at once.

5. **Category-to-CTA mapping makes the plan sellable.** A content plan with "each post links to X collection page" is far more convincing than just a list of blog titles.

6. **Revenue modeling closes the deal.** Showing the funnel (blog clicks → collection visits → product views → purchases → revenue) at conservative/moderate/aggressive scenarios gives the client confidence.

7. **Site access isn't guaranteed.** WebFetch couldn't access lioridiamonds.com directly. We worked around it with `site:` search queries. Always have a fallback.

8. **Domain authority determines timeline realism.** Without knowing DR/DA, ranking projections are guesswork. A DR 10 site targeting KD 45 keywords needs 6-12 months, not 3. Always get this number upfront.

9. **Seasonal timing changes everything.** Engagement ring searches spike Nov-Feb. Publishing a "how to propose" guide in March misses the peak window. Align the content calendar with demand cycles, not just SV data.

10. **Approval workflows add hidden time.** If a client stakeholder needs to review every post before publishing, your 5/week pace becomes 2-3/week in practice. Map the approval chain before committing to timelines.

11. **Conversion data separates good plans from great ones.** Knowing which existing posts actually drove sales (not just traffic) lets you reverse-engineer what works and replicate it. GSC shows clicks; GA4 shows conversions. Both together are 10x more valuable than either alone.
