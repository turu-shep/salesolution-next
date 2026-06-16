# GSC Baseline — Pre-Hub-Launch (2026-06-15)

**Purpose:** a clean before/after anchor to measure the impact of everything shipped 2026-06-14/15
— the 20-term glossary, the 2 career paths (GEO Specialist, Citation Engineer), the AI-SEO page
"geo agency" retitle, the interlinking, and the refreshed `llms.txt`. Compare the **next** GSC
export against these numbers.

## Real GSC aggregate (Ahrefs, pulled 2026-06-15) — authoritative trend
GSC **is connected** to the Ahrefs project (`Salesolution`, id 5379899, verified). Site-wide
monthly performance (the true figures — supersede the CSV for totals):

| Month | Impressions | Clicks | CTR | Avg pos |
|---|---|---|---|---|
| Dec 2025 | 502 | 1 | 0.20% | 47.7 |
| Jan 2026 | 476 | 8 | 1.68% | 32.0 |
| Feb 2026 | 330 | 3 | 0.91% | 27.3 |
| Mar 2026 | 406 | 4 | 0.99% | 25.8 |
| Apr 2026 | 439 | 9 | 2.05% | 42.6 |
| May 2026 | 974 | 4 | 0.41% | 51.5 |
| Jun 2026 (partial) | 319 | 5 | 1.57% | 49.9 |

- **Trailing 6 complete months (Dec–May): ~3,127 impressions, ~29 clicks** (~520 impr/mo,
  ~5 clicks/mo, ~0.9% CTR). This is the real pre-launch run-rate to beat.
- **May spiked to 974 impressions but at avg pos 51 with 0.41% CTR** — lots of deep-page
  impressions, almost no clicks. Classic "visible but not competitive."
- Per-page / per-keyword GSC tables in Ahrefs weren't populated yet at pull time (dimension
  backfill lags a freshly-connected GSC by days) — so page/query **detail** below comes from the
  CSV export; the **aggregate** above is the source of truth. Re-pull `gsc-pages` / `gsc-keywords`
  (project 5379899) in a few days once they backfill.

## Data provenance + caveats (read before trusting)
- Source: GSC Performance UI exports in `seo-project/data/` — `Queries.csv`, `Pages.csv`,
  file-dated **2026-05-22** (so the window ends ~May 2026; ~3-4 weeks before the hub launch).
- It's a **partial top-N snapshot**: 52 query rows, 27 page rows, no date/device/country dimension.
- The two files sample different top-N sets, so their impression totals differ (queries 845 vs
  pages 2,324) — expected; most impressions come from long-tail/anonymized queries outside the
  top-52 list. **Use the Pages totals as the site-wide figure.**
- This export **predates all the new content** — no `/glossary/*`, `/career-paths/[slug]`, or the
  geo-agency section appear in it. That's the point: it's the pre-launch line.

## Baseline numbers

### Site-wide (Pages export)
| Metric | Value |
|---|---|
| Total clicks | **14** |
| Total impressions | **2,324** |
| Pages with any impressions | 27 (top-N) |
| Clicks concentrated in | homepage (11) + contact (3) — i.e. brand/navigational |

### Queries export (52 rows, 845 impr, 9 clicks, 1.07% CTR)
- **Branded vs non-branded:** branded ≈ **35%** of impressions (295), non-brand ≈ **65%** (550).
  Nearly all clicks are brand.
- **Position bands (of the 52):** 1–3: **3** · 4–10: **5** · 11–20: **1** · 21–50: **8** ·
  **51+: 35**. Translation: the site is mostly on page 5+ for everything non-brand.
- **Theme mix (non-brand impressions):**
  - B2B / marketing-framework: **348** (biggest) — driven by one guide.
  - GA4 / "which report shows…" analytics Q&A: **132**.
  - AI / GEO: **42** (only ~5%).
  - SEO: 11 · "agency": **3** (the lone `b2b seo agency` query) · other: 14.

### Top pages (impressions / avg position)
| Impr | Pos | Page |
|---|---|---|
| 672 | 24.9 | `/` (homepage) |
| 375 | 69.3 | `/guides/b2b-marketing-strategy-framework-with-example-7-step/` |
| 202 | 55.4 | `/which-reports-indicate-how-traffic-arrived-at-a-website/` |
| 140 | 4.2 | `/terms-of-service/` (navigational) |
| 133 | 34.0 | `/future-proof-your-seo/` |
| 130 | 4.1 | `/contact-me/` |
| 93 | 5.1 | `/career-paths/` ← hub, **pre-content** |
| 86 | 3.2 | `/guides/` |
| 47 | 4.7 | `/services/ai-seo/` ← **pre geo-agency retitle** |

## What the baseline says
1. **Current GSC footprint ≠ the strategy.** The site's non-brand visibility today is a B2B
   marketing-framework guide + GA4 "which report…" informational questions — neither is the
   AI-search-for-industrial-e-commerce positioning. The hub work is a deliberate bet to shift the
   footprint toward AI/GEO terms.
2. **AI/GEO is greenfield: ~5% of impressions, "agency" ≈ 3 impressions.** Huge headroom — which
   is exactly what the glossary + the geo-agency retitle target.
3. **Two pages are already pre-positioned:** `/career-paths/` pulls 93 impr at pos ~5 *with no
   content* (now it has 2 paths + links the glossary), and `/services/ai-seo/` sits at pos ~4.7
   with 47 impr *before* the geo-agency retitle. Both should expand their query footprint.
4. **Clicks are ~nil outside brand** — consistent with DR ~10. Don't expect click movement first;
   watch **impressions and appearance for new queries** as the leading indicator.

## What to watch in the NEXT export (≈ 2026-07-15, once Google crawls the new pages)
Re-export `Queries.csv` + `Pages.csv` into `seo-project/data/` and compare:
- **New pages appearing at all:** any impressions on `/glossary/`, `/glossary/<term>/`,
  `/career-paths/geo-specialist/`, `/career-paths/citation-engineer/`.
- **AI/GEO theme impression share** rising from the ~5% / 42-impr baseline (watch queries like
  generative engine optimization, answer engine optimization, ai visibility, citation engineering).
- **"geo agency" cluster:** does `/services/ai-seo/` start showing for "geo agency" / "geo agency
  for industrial e-commerce"? (Baseline: "agency" = 3 impr, no "geo agency".)
- `/career-paths/` and `/services/ai-seo/` impression + position deltas vs the table above.
- Branded share dropping below 35% would mean non-brand discovery is growing — a good sign.

## How to refresh (no account-linking needed for this method)
1. GSC → Performance → Search results → set a comparable window → **Export** → put the two CSVs in
   `seo-project/data/` (overwrite). For more than top-N rows, use the GSC API / Looker Studio
   export; the UI caps rows.
2. Ask the agent to "compare the new GSC export against `08-gsc-baseline-2026-06-15.md`."
3. This sidesteps the GSC↔Ahrefs connection entirely — it's only needed if you want the data
   *inside* Ahrefs. (AI-citation tracking is separate — that's SAL-406 / Brand Radar.)
