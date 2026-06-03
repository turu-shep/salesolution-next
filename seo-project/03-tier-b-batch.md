# Tier B — CTR Rewrite Batch (ship together)

**Date:** 2026-05-22
**Scope:** 6 pages, title + meta rewrites only (no body changes)
**Goal:** Lift CTR on pages already at or near page 1. Expected window to measurable lift: 2–4 weeks post-deploy.
**Ship pattern:** Single batch — review whole doc → 4 Sanity updates + 2 code edits → one deploy.

---

## What changed: Tier B vs prior plan

Two pages already had their year-freshness updated in Sanity (titles say "in 2026" / "Basics to Advanced"), but they're under-clicking for **other reasons** — missing meta descriptions, over-length titles, weak framing. Plan adjusted per finding.

---

## B1 — `/the-art-of-profitable-words-mastering-b2b-content-writing/`

**Current state:** Pos 6.69 · 26 impressions · 0 clicks

**Current title (66ch):** `B2B Content Writing: The Art of Profitable Words · Sale Solution`
**Current meta (truncated — incomplete):** `Discover how to turn your B2B content writing into a revenue-generating machine. Our comprehensive guide covers planning, research, SEO,`

**Issue:** Meta description is cut off at the comma after "SEO," — looks broken in SERPs. Title leads with "B2B Content Writing" which is generic head-term; "Profitable Words" buried as subtitle.

**New title (62ch):** `B2B Content Writing for Profit (Not Pageviews) · Sale Solution`
**New meta (155ch):** `B2B content writing built to drive pipeline, not vanity metrics. The framework, research process, and SEO/GEO structure used to convert technical buyers.`

**Where to update:** Sanity Studio → Posts → "The Art of Profitable Words…" → **SEO & Social** tab → `metaTitle` + `metaDescription`

---

## B2 — `/generative-engine-optimization-basic-to-advanced/`

**Current state:** Pos 5.82 · 22 impressions · 0 clicks

**Current title (73ch — TRUNCATES IN SERP):** `Generative Engine Optimization: Basics to Advanced in 2026 · Sale Solution`
**Current meta:** *(none — Google auto-generates)*

**Issue:** Title over the 60–65ch SERP display cap. No meta description = Google guesses from body text. Both fixable.

**New title (58ch):** `Generative Engine Optimization (GEO) Guide for 2026`
**New meta (162ch):** `What GEO is, why it matters now, and how to engineer your pages to get cited inside AI Overviews. From baseline schema to advanced citation tactics — for B2B teams.`

**Where to update:** Sanity Studio → Posts → "Generative Engine Optimization…" → **SEO & Social** tab → `metaTitle` + `metaDescription`

---

## B3 — `/content-marketing-101/`

**Current state:** Pos 7.1 · 10 impressions · 0 clicks

**Current title (67ch):** `Content Marketing Basics: From Zero to First Campaign in 30 Days · Sale Solution`
**Current meta:** *(none — Google auto-generates)*

**Issue:** Title was rewritten but is still too long (67 + " · Sale Solution" appendix). The "30 days" hook is good — preserve it. No meta description.

**New title (58ch):** `Content Marketing Basics: Zero to First Campaign in 30 Days`
**New meta (160ch):** `A 30-day content marketing starting point for B2B teams: positioning, the first 5 posts, distribution, and the metrics that matter in the post-AIO era.`

**Where to update:** Sanity Studio → Posts → "Content Marketing 101" → **SEO & Social** tab → `metaTitle` + `metaDescription`

---

## B4 — `/what-is-content-writing-master-the-science-of-web-writing-in-2023/`

**Current state:** Pos 5 · 9 impressions · 0 clicks

**Current title (75ch):** `What is Content Writing: Master the Web Writing Science in 2023 · Sale Solution`
**Current meta (132ch):** `Master the science of web content writing in 2023. This guide covers the essentials to engage, inform, and convert your audience.`

**Issue:** "2023" in title and meta = stale freshness signal. Title also too long.

**New title (60ch):** `What Is Content Writing? A 2026 Guide for B2B Teams`
**New meta (161ch):** `What content writing actually means in 2026 — the craft, the structure, and the rules for writing pages that get cited in AI Overviews and read by technical buyers.`

**Where to update:** Sanity Studio → Posts → "What is Content Writing…" → **SEO & Social** tab → `metaTitle` + `metaDescription`

**Note:** The slug still contains `-in-2023/`. Leaving the slug for SEO continuity in this round — slug rename + 301 deferred to Tier C if/when we touch the body.

---

## B5 — `/category/blog/`

**Current state:** Pos 10.6 · 76 impressions · 0 clicks

**Current title (23ch):** `Blog · Sale Solution`
**Current meta (148ch):** `Insights, frameworks, and field reports on AI search, GEO, technical SEO, content, and conversion for industrial e-commerce.`

**Issue:** Title is generic ("Blog"). Pos 10.6 means it's literally one slot off page 1 — title sharpness can earn that slot.

**New title (54ch):** `AI Search & B2B SEO Blog — Industrial E-commerce`
**New meta:** *Keep current — it's already strong.*

**Where to update:** **CODE EDIT** — [app/(site)/category/blog/page.tsx#L9-L14](app/(site)/category/blog/page.tsx#L9-L14). Change the `metadata.title`.

---

## B6 — `/services/ai-seo/`

**Current state:** Pos 4.68 · 47 impressions · 0 clicks

**Current title (47ch):** `AI Search & Generative-Engine Optimization (GEO)`
**Current meta (260ch — TRUNCATES badly):** `Engineer your store to be cited inside Google AI Overviews, ChatGPT, and Perplexity. Schema depth, citation engineering, AI-readable content, and AIO-aware PPC — one operator-led team. Published prices, written 24-hour proposals, 90-day exit.`

**Issue:** Title fine. Meta is **260 characters** — gets clipped to ~155 in SERP, losing the differentiation tail ("published prices, 24-hour proposals, 90-day exit"). Front-load the differentiators.

**New title:** *Keep current.*
**New meta (164ch):** `Get cited inside Google AI Overviews, ChatGPT, and Perplexity. Operator-led GEO with published prices, 24-hour proposals, and a 90-day exit. Schema depth + citation engineering.`

**Where to update:** **CODE EDIT** — [app/(site)/services/ai-seo/page.tsx#L16-L21](app/(site)/services/ai-seo/page.tsx#L16-L21). Change `metadata.description`.

---

## Implementation summary

**Sanity updates (4 posts):** B1, B2, B3, B4 — go to Sanity Studio → Posts → open each post → SEO & Social tab → paste new metaTitle + metaDescription → publish. 5 min each.

**Code edits (2 pages):** B5, B6 — two file changes:

```
app/(site)/category/blog/page.tsx        line 10  (title)
app/(site)/services/ai-seo/page.tsx     line 18  (description)
```

I can make both code edits in this session if you want — say the word.

**Deploy:** All 4 Sanity updates can be pushed via Studio (no deploy needed if ISR/revalidate is wired). The 2 code edits need a git commit + Vercel deploy.

---

## Also shipped this round

✅ **Brand schema `alternateName`** — added `'Sales Solution'` + `'Sales Solutions'` to both Organization and WebSite schema in [lib/schema.ts](lib/schema.ts). Ships with the next deploy (same as B5/B6). Tells Google those plural variants ARE the same brand entity — should pull the ~280 plural-variant impressions toward the canonical brand entity over time.

---

## What's next

A1 — the B2B framework guide pillar. I'll produce the brief + the framework template + the draft. Let me know when ready.
