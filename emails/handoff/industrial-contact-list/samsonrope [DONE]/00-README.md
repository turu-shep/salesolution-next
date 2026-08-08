# samsonrope — small, clean, website-rich, and the vertical code sorts

> STATUS (2026-08-04): **DONE.** Swept complete — 16 industry options × 36
> anchor cities, 576 queries. **200 CMS items → 137 US rows → 82 US companies,
> website 88.3%** (against the 67.6% Timken benchmark), **59 net-new domains**,
> chain contamination **6.6%** — the cleanest small source in the pack.
> The 16-option industry filter **sorts** (38 distinct combinations, zero
> nulls), which makes it a usable vertical filter but **not** an authorization
> stamp. **No gates open.** robots: `Allow: /`, no override involved; the build
> gate R-L1 was signed by Artur 2026-08-04.

Prompts in this folder: `01-prompt.md` — sort the vertical code before anything
is seated, then decide the fold-in.

Prerequisite reading, in order:
[`01-build-plan.md` **§5i** (manufacturer locators encode vertical in their own codes — assume it until disproven, and never interpret a code before validating it against the records), §5a (the website criterion this source passes), §5h (a wave must add a signal we do not already have)](../../strategy/01-build-plan.md) ·
[`linecard-locators [BUILT]/02-probe-log-2026-08-03.md` §3 and §6](../linecard-locators%20%5BBUILT%5D/02-probe-log-2026-08-03.md) — where this source came from and what the probe measured before the build

## 1. What it is

Samson Rope (Ferndale WA) makes synthetic rope for arborists, cranes,
utilities, mining, defense, marine and towing. Its find-a-distributor page runs
a **JSON API on its own host** — no browser needed:

```
GET /api/FindDistributor/GetDistributors?category=<label>&SearchString=<place>&Id=<guid>
```

The page's own `validateForm()` **requires both an industry and a ≥2-character
place string**, so there is no unfiltered query and no "show everything" call.
Rows are Sitefinity CMS content items (`Title: Distributor_NNN`), and **the
same company appears as several items with different industry sets** — that is
a feature of the source, not a duplication bug.

**Access posture:** `www.samsonrope.com/robots.txt` publishes `Allow: /`.
Nothing about this source involved a robots override. No login, no CAPTCHA, no
403 or 429 in 562 origin requests.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **200** CMS items (137 US) |
| Unique domains | **76 US** |
| Distinct companies | **82 US** (116 including non-US) |
| Seated (`seated-v9`) | 0 — nothing folded in |
| Routed to pools | nothing yet |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/samsonrope.py` |
| Raw artifacts | `emails/data/raw/samsonrope-2026-08-04.json` · cache `data/raw/_cache/samsonrope/` |

Provenance 100% filled: `source`, `source_url`, `captured` on every record.

**Fill (US rows):** **website 88.3%** · phone 99.3% · email 19.0%.
**Net-new: 59 domains** against `lists/deduped-v7.csv`. **Chain rows 6.6%** —
by far the lowest contamination of anything built in this lane (CMCO is 65.5%).

## 3. How deep we went

**576 queries: all 16 industry options × 36 anchor cities.** 562 origin
requests, ≥3s apart, every response cached; a re-run costs zero.

**Why 36 anchors and not 12 — measured, not guessed.** The API **caps a result
set at 24 rows.** A first 12-city pass produced five Utility queries returning
exactly 24, and four other industries were still yielding fresh companies at
the last anchor: **the pass was incomplete by construction.** With no paging
parameter, more anchor points is the only way to see past the cap. The full
grid still clipped **17 queries at 24**, so the sweep is thorough, not
provably exhaustive — a denser anchor set would likely add a few more.

**Two behaviours the harvester handles, both discovered by looking at output:**

- **`SearchString` is text-matched against place fields before it is ranked.**
  A ZIP code ("77002") matched nothing and returned Samson's own HQ; the city
  name ("Houston") returned the real local set. The grid uses city names.
- **Samson's own HQ is returned as a fallback** on any query that matches
  nothing — **111 such rows were dropped by name.** Left in, they would have
  seated the manufacturer as its own distributor, which is exactly the
  contamination §5s spent a whole pass cleaning up elsewhere.

**16 queries returned HTTP 500** — the API answers 500 for place strings it
cannot geocode ("Fargo"). Recorded and skipped, single-attempt: riding
`_polite.Fetcher`'s ladder instead cost 345s and 5 origin hits per occurrence
and silently killed an earlier pass. (`_polite.py` was fixed for deterministic
**4xx** on 2026-08-03; **5xx was not included** — see `cmco [*]/00-README.md`
§3 for the full note and the suggested change.)

## 4. What's left on the table

**Very little to fetch, one real decision to make.**

- **Nothing meaningful left to harvest.** 17 clipped queries are the only known
  gap; a denser anchor grid would add a handful of companies at most. Not worth
  scheduling.
- **The decision is the vertical filter, and it is not mechanical.**
  `Industries` is a **comma-list** — a company can be Energy *and* Utility
  *and* Mooring. It sorts cleanly (38 combinations, zero nulls), so it is a
  usable filter, but the presumptively off-ICP options (Commercial Fishing,
  Recreational Marine, Mooring, Tug, Inland River, Entertainment) frequently
  co-occur with the on-ICP ones. **A naive "drop anything marine" rule would
  cut genuine industrial distributors that happen to carry a marine line.**
  §5i's standing rule applies exactly here: validate the code against the
  records before seating anything. `01-prompt.md` step 1 owns this.
- **State the §5h counter honestly:** a vertical code tells us *what a
  distributor sells into*, not that Samson certified them. There is **no
  authorization tier and no line card** on these records. Compared with CMCO —
  which carries both — the copy asset here is thin. What Samson offers instead
  is **clean domains at 88.3% with almost no chain contamination**, which is a
  volume argument, and it should be made as one.

## 5. Registry row

| samsonrope | DONE | 200 | 0 | 2026-08-04 | nothing to fetch (17 of 576 queries clipped at the 24-row cap); 59 net-new domains pending the §5i vertical-code sort | `samsonrope [DONE]/` |
