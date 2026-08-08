# Hygiene — storage, duplicates, drift, and one unexplained number

> **STATUS (2026-08-03):** Ready. Six items. H4 is investigation and must run
> before anything is deleted near it; H5 is autonomous; H6 is already done and
> recorded here so it stops being rediscovered. **Every deletion in this file is
> GATE:HUMAN** — "culled ≠ deleted" is a standing rule (Artur, 2026-08-01) and
> it applies to build artifacts as much as to records.

Measurements below were taken 2026-08-03 with `cmp`, `du -k` and `wc -l` against
the working tree. Re-measure before acting; this directory moves.

Current footprint: `data/enrichment` 1.6 GB · `data/raw` 1.2 GB ·
`data/side-pools` 52 MB · `data/cache` 11 MB.

---

## H1 — Byte-identical pool duplicates

**Evidence.** Five side-pool dispositions have a v6 and a v7 file that are
byte-identical (`cmp -s`, 2026-08-03):

| Pool | Size, each copy |
|---|---|
| `pool-above-ceiling` v6 = v7 | 700 KB |
| `pool-adjacent-trades` v6 = v7 | 1,448 KB |
| `pool-chains` v6 = v7 | 1,028 KB |
| `pool-non-us` v6 = v7 | 192 KB |
| `pool-segment-w` v6 = v7 | 1,808 KB |

**5,176 KB (5.2 MB) reclaimable** by removing the five v6 copies. An earlier
estimate put this near 7 MB; the measured figure is 5.2 MB and that is the one
to use.

Two near-misses that look like they belong on this list and do not:
`pool-small-shops` v6 vs v7 **differs** (431 vs 2,818 lines — that is H4), and
`pool-non-us` v8 vs v9 **differs**. Do not batch them in.

**Why it matters.** Not the disk. `latestPools` already resolves the highest
version numerically, so the dashboard is correct today. The cost is human: a
directory holding 34 pool files where 11 are current invites someone to open
`pool-chains.csv` — the *oldest* file, not the newest — which is already named
in `02-list-guide.md` as the easiest mistake in the directory.

**Plan.**
1. Re-run `cmp -s` on all five pairs. Byte-identity is the whole justification;
   if a pair has diverged since, it drops off this item.
2. Confirm no script reads a v6 filename directly. `s4d-seat.mjs:99` has a
   `POOL_IN` map naming v6 files explicitly — it reads them as **inputs**, so
   deleting them makes that stage non-rerunnable. Decide that consciously.
3. Present the list, sizes, and the `POOL_IN` consequence for sign-off.

**Authority.** GATE:HUMAN. Deleting build inputs trades reproducibility for
5.2 MB, and 5.2 MB is not worth much.

---

## H2 — Resumable-run leftovers (`.partial.jsonl`)

**Evidence.** 17 files, **125,040 KB (122 MB)** measured 2026-08-03. The heavy
end:

| File | Size |
|---|---|
| `data/raw/usaspending-2026-08-01.awards.partial.jsonl` | 48 MB |
| `data/raw/serp-selfid-wave3-2026-08-01.records.partial.jsonl` | 25 MB |
| `data/raw/serp-selfid-wave2-2026-08-01.records.partial.jsonl` | 22 MB |
| `data/enrichment/linecards-v3a` + `v3b` `.partial.jsonl` | 4.5 MB each |
| `data/raw/usaspending-2026-08-01.detail` / `.recipients` | 3.4 / 3.3 MB |
| `data/enrichment/_sitemap-v3a` + `v3b` `.partial.jsonl` | 3.3 MB each |

These are resume journals: a long run appends each record as it lands so a crash
costs minutes instead of hours. Once the run finishes and writes its `.json`,
the journal is dead weight.

**Plan.**
1. For each `.partial.jsonl`, confirm the completed sibling exists and its
   record count is ≥ the journal's line count. A journal **larger** than its
   sibling means the run did not finish — that file is evidence, not garbage,
   and it stays.
2. List survivors with sizes and their completed siblings.
3. Add `*.partial.jsonl` to `emails/.gitignore` regardless of the delete
   decision. They are under `data/` which is already ignored; make it explicit
   so a future writer outside `data/` inherits it.

**Authority.** GATE:HUMAN on delete. Step 1 (the audit) and step 3 (gitignore)
are autonomous.

---

## H3 — Enrichment generations v1–v4 (1.6 GB)

**Evidence.** `data/enrichment` is 1.6 GB. It holds four-plus generations of the
same work — `_ecom-*` v2/v3/v4, `_sitemap-*` v2/v3a/v3b/v4,
`_reconcile-*` v2/v3/v3a/v3b, `linecards-*` v2/v3a/v3b/v4, plus `_cache` and
`_sitemap_cache` subdirectories.

**Why it matters.** These were paid for once (§5f forbids re-fetching per-domain
work before the cut, and the S4 ranker reads the enrichment file rather than
fetching). Deleting the wrong generation means re-buying it. Deleting nothing
means nobody can tell which generation the current list was actually ranked
against.

**Plan.**
1. Build `data/enrichment/_manifest.json`: for each artifact — filename,
   generation, domain count, `captured`, and which stage script reads it
   (grep the scripts, do not guess).
2. Mark exactly one generation per family as **current**, defined as the one the
   newest consuming stage reads. Everything the current list depends on is kept
   whatever its version number.
3. Propose pruning only what is (a) superseded, (b) reproducible from a kept
   artifact, and (c) not referenced by any script. Report the reclaimed bytes
   per family so the trade is visible.
4. `_cache` / `_sitemap_cache` are `politeFetch` disk caches keyed by full URL.
   They are regenerable at the cost of re-fetching. Size them and price them
   separately from the outputs.

**Authority.** Manifest is autonomous. Every deletion is GATE:HUMAN, per family,
with the byte count and the re-fetch cost stated.

---

## H4 — `pool-small-shops` v6 → v7 swing (INVESTIGATE FIRST)

**Evidence.** `wc -l`, 2026-08-03:

```
pool-small-shops.csv       443
pool-small-shops-v6.csv    431
pool-small-shops-v7.csv  2,818     ← 6.5x
```

(Line counts include the header; `02-list-guide.md` reports v7 as 2,817 rows.)

The unversioned original and v6 sit within 12 lines of each other. Then v7 adds
2,387 lines in one step, and no written record in `01-build-plan.md` §5 or the
strategy decision log explains where they came from.

**Why this one is not a cleanup item.** `pool-small-shops` is reserved inventory
for Artur's separate small-shops project — sub-floor by size proxy, deliberately
kept rather than discarded. That project's scope is this pool's row count. Right
now that count is either 2,817 real prospects or 430 real prospects plus 2,387
misrouted ones, and nobody can say which. Deleting, deduping or building on this
pool before the answer exists is the expensive mistake.

**Plan.**
1. Read the S4 stage logs and reports around the v6 → v7 transition
   (`data/_*.json` / `_*.md` for that date; `s4d-seat.mjs` `SIDE_POOLS` and
   `POOL_IN` at line 99 name the routing).
2. Diff v6 and v7 by domain. Split the 2,387 into: net-new sourced rows,
   rows re-dispositioned out of another pool (name the source pool), and rows
   that changed because a threshold moved.
3. Check the sibling pools for the mirror image. If 2,387 rows left
   `pool-ranked-out` or `pool-not-a-distributor` in the same step, the swing is
   a routing change and the two pools' deltas should roughly cancel.
4. Test the threshold hypothesis explicitly: the sub-floor rule is a $2M revenue
   floor, and **no revenue column exists anywhere** — so the floor is applied
   through size proxies (`size_band`, `location_count`, `size_score`). A proxy
   threshold change is the most likely single cause and the easiest to confirm.
5. Write the finding into `01-build-plan.md` §5 as a dated entry, whichever way
   it lands. A 6.5× move with no written cause is the defect; the number itself
   might be perfectly correct.

**Authority.** Investigation is autonomous and should run before H1 touches the
side-pool directory. Any correction to the pool contents is GATE:HUMAN.

---

## H5 — Schema manifest per list generation

**Evidence.** Column counts across generations run **23 → 56**.
`scripts/lib/dashboard-data.mjs` survives this because it reads by column name
and tolerates absence. Nothing else does. A new consumer written against
`seated-v5`'s 54 columns and pointed at `deduped-v3` fails, and how it fails
depends on whether it indexes by name or position — silently wrong in the second
case.

**Plan.** Emit a `schema.json` alongside every list generation, written by the
stage that produced it:

```json
{
  "file": "seated-v5.csv",
  "generation": "seated-v5",
  "stage": "S4h",
  "rows": 2782,
  "column_count": 54,
  "columns": ["company", "company_display", "domain", "..."],
  "captured": "2026-08-02"
}
```

1. Write `emails/scripts/schema-manifest.mjs` — reads a CSV with `parseCsv`
   (never a newline split; `self_declaration_verbatim` embeds line breaks),
   emits the manifest next to it.
2. Backfill all 19 files in `lists/` and the 11 current pools.
3. Add the emit to the tail of each S-stage script so new generations arrive
   with one.
4. Give the dashboard's Sources tab a drift indicator: manifest column count vs.
   the current generation's, so a schema change is visible the day it happens
   instead of the day something breaks.

**Authority.** Autonomous. It writes new files and modifies none.

---

## H6 — Done 2026-08-03

Recorded so the next reader does not re-find them.

**Sourcing strategy header.** `handoff/strategy/00-sourcing-strategy.md` still
read `Status: DRAFT` two days after GATE-L1 was signed and the harvest had run
against it. Corrected to `ACTIVE — GATE-L1 APPROVED 2026-08-01`, with a
parenthetical noting the correction and its date so the record shows the lag
rather than hiding it. A stale DRAFT header on an approved strategy is not a
typo — it is an invitation to re-open settled gates.

**`fetch.mjs` cache-security note.** `emails/scripts/lib/fetch.mjs` caches every
response on disk keyed by URL, and both the key and the stored artifact contain
the full URL including its query string. The header comment now states that
plainly and names the consequence: never route an authenticated request through
`politeFetch` when the credential rides the URL. It also records why
`dashboard.mjs` does not reuse it for Smartlead — Smartlead's API key is a query
parameter, so a single cached call would write the key to disk in cleartext.

Both are comment/doc changes. No behavior changed.

## H7 — PTDA ceiling-check run-1 caches (3 files, superseded)

The PTDA rollup audit's Step-4 script (`scripts/acquire/ptda_ceiling_check.py`)
misposted its first three `Input2` name-axis queries — bare `Sheet0$` field
names without the DNN `ctl01$TemplateBody…` prefix — so the cached responses
under `data/raw/_cache/ptda-ceiling/input2-*.html.gz` (3 files, ~75 KB each)
are validation echoes, not results. Run 2 cached the corrected posts as
`input2b-*.html.gz`; run 1's misposts are recorded in
`data/raw/_ptda-ceiling-check-2026-08-03.json` so the request count stays
honest.

**Delete candidates:** `input2-transply.html.gz`, `input2-wm-f-hurst.html.gz`,
`input2-rainbow-precision.html.gz`. No evidentiary value (the JSON records the
mispost). **GATE:HUMAN — every deletion is.** Default if nobody answers: keep;
75 KB × 3 costs nothing.

## H8 — E4 evidence caches + the 12 MB Walter payload (2026-08-03)

The E4 robots-posture work created ~7 MB of cache and four new raw files. Almost
all of it should stay, and the reasons differ enough to be worth writing down.

**Keep — this is the evidence behind a live gate.** Every `_cache/e4evidence-*`
and `_cache/e4bundle*` directory holds the verbatim `robots.txt`, locator shell,
terms page and JS bundle that the per-locator verdicts in
`e4-headless-locators [*]/02-robots-posture-2026-08-03.md` were read out of. Two
of those verdicts (**R-1 Banner, R-2 Pepperl+Fuchs**) are unsigned GATE:HUMAN
questions with a default of NO. **Deleting the cache would delete the evidence
for a decision nobody has made yet**, and re-fetching it would put fresh requests
against hosts we have just decided not to touch. Largest: `e4evidence-banner`
1.1 MB, `e4evidence-pepperlfuchs` 1.7 MB, `e4bundle-pepperlfuchs` 1.7 MB,
`e4bundle2-skf` 1.1 MB. **≈7 MB total. Keep all of it.**

**Three empty directories, and the emptiness is the finding.**
`_cache/e4evidence-aro`, `_cache/e4evidence-miller`,
`_cache/e4evidence-ingersollrand` are **0 B** — all three hosts returned 429 to
every request including `robots.txt`, through five exponentially-backed-off
attempts each, so nothing was ever cached. That is the measurement that
reclassified the "429 trio" from a pace signal to an access control (strategy
§7.1, corrected 2026-08-03). They cost nothing and their existence documents a
run that happened. **Default: keep.** Harmless either way.

**`data/raw/waltersurface-2026-08-03.json` is 12 MB** — the largest single raw
file in the workspace after the Timken payloads, and it holds 12,368 records
with **zero domains**. It is not a deletion candidate: it is the input to the
no-domain-backlog workstream and the only copy of a national set that took one
request to get. Flagged here only so the next storage audit knows why one source
file is 20× the size of its neighbours. If the domain-resolution pass ever
completes and lands its output elsewhere, revisit then — **not before, and as a
GATE:HUMAN like every other deletion.**

**Genuinely re-derivable, if space is ever tight:**
`data/raw/e4-evidence-2026-08-03.json`, `e4-bundles-2026-08-03.json`,
`e4-bundles2-2026-08-03.json`, `e4-apihosts-2026-08-03.json`. These are parsed
summaries of the caches above, and all four scripts replay from disk at zero
origin cost. Combined they are well under 100 KB, so there is no reason to
bother. **Default: keep.**

**Nothing here is a recommended deletion.** The section exists because the
completion ritual requires new files to be noted, not because anything wants
cleaning.

## no-domain-backlog session artifacts (2026-08-03)

The pilot + free-pass session wrote to `data/s3/`: the keepers are
`backlog-freepass-2026-08-03.json` + `...-resolved-2026-08-03.csv` (the free
join ledger), `pilot-{w,fed}-2026-08-03.csv` (seeded pilot inputs),
`pilot-{w,fed}-result-v5-2026-08-03.json` (final-rule pilot results),
`handread-2026-08-03.json` + `handread-v4-2026-08-03.json` (the adjudication
evidence), `backlog-recovered-2026-08-03.csv` (the S3-input artifact, 282
rows), `_zip-centroids-2026-08-03.json` + `_alt-names-2026-08-03.json`
(derived sidecars, re-derivable from raw at $0).

**Superseded iterations, deletable at the usual GATE:HUMAN:**
`pilot-w-result-2026-08-03.json`, `pilot-fed-result-2026-08-03.json`,
`pilot-{w,fed}-result-v2-2026-08-03.json`, `...-v3...`, `...-v4...`,
`_dry-w-2026-08-03.json`, `_dry-fed-2026-08-03.json` — the v1–v4 rule
iterations the hand-read walked through. ~4 MB combined. They document how the
precision rules were derived (build-plan §5w tells that story in prose), so
the default is keep until §5w has survived one re-read. The `_dfs-cache`
gained ~880 entries (~9 MB) — never delete cache; it is what makes re-runs
free. **Default: keep everything.**

## H9 — DFS wave-2 cache + payload (2026-08-04), 498 MB

The generic-tail buy is the largest single storage event in the workspace to
date. Nothing here is a recommended deletion; the section exists because the
completion ritual requires new files to be noted.

**`data/raw/_cache/dfs-tail/` — 312 MB. Never delete.** 34 verbatim page
responses plus 12 probe responses, the shards, and the run log. This cache is
what makes a re-run **free**, and this source has now proved that point twice:
wave 1's stalled first attempt spent the entire $16.98 and the rebuild cost
$0.00 off exactly this kind of cache. It also holds the only record of the
filter-operator probes — which operators DataForSEO accepts on an `array.str`
field, and the 8-element `filters` ceiling — evidence that cost real money to
establish and would cost real money to re-establish. **Default: keep, permanently.**

Two files inside it are small and disproportionately useful:
`_categories.json` (the full 5,314-entry DFS business-category taxonomy with
global counts, from a **free** endpoint) and `_candidate_counts.json` (exact US
counts + website fill + co-occurrence for 34 candidate categories, which cost
$0.134 to measure). Any future category decision on this source should start
from those two rather than re-buying them.

**`data/raw/dfs-listings-2026-08-04.json` — 162 MB, `.csv` — 23 MB.** The JSON
is now the second-largest file in the workspace after
`dfs-listings-2026-08-01.json` (240 MB). Both are raw provenance for a paid
source and **neither is a deletion candidate**. The 08-01 payload in particular
is provenance for the entire current generation; the 08-04 payload is unfolded
raw with no downstream copy anywhere. If space ever forces a choice, the CSV is
the deduped view and the JSON is the complete one — **the JSON is the keeper**,
and the question is a GATE:HUMAN like every other deletion.

**Genuinely re-derivable at zero cost:** nothing in this run. The measurement
scripts (`measure_dfs_tail.mjs` and the scratch comparisons) write to stdout and
leave no artifacts, by design — every number in the acquisition-log section
replays from the payload in seconds.

---

## H10 — equipment-dealers caches + the 20 MB Bobcat national payload (2026-08-04)

**Nothing here is a duplicate and nothing should be deleted without reading the
reason column.** Total footprint **~59 MB**, most of it the national sweep the
decision rule earned.

| Path | Size | Keep or clean |
|---|---|---|
| `data/raw/bobcat-national-2026-08-04.json` | **20 MB** | **KEEP.** 2,677 records with the full Coveo `raw` object per row. It is the only complete capture of that index and re-fetching costs 181 origin requests. |
| `data/raw/bobcat-national-2026-08-04.csv` | 11 MB | **KEEP** until the fold-in lands, then it is redundant with the JSON. |
| `data/raw/_cache/bobcat/` | 23 MB, 222 files | **KEEP.** The disk cache is what makes any re-run cost 0 origin requests. |
| `data/raw/_cache/eq-evidence/` | 2.7 MB, 15 files | **KEEP** — robots bodies and JS bundles are the evidence behind `02-robots-posture-2026-08-04.md`. |
| `data/raw/_cache/caseih/` | 1.5 MB, 7 files | KEEP. |
| `data/raw/_bobcat-national.log` | 4 KB | **Clean** once the sweep numbers are read out of the payload. Nothing in it is not in the JSON. |

### Stray cache entries that are evidence, not litter — GATE:HUMAN before deleting

Three groups of files in `data/raw/_cache/bobcat/` look like debris and are not.
Per the no-delete rule, deleting any of them is a **GATE:HUMAN**; the default is
keep.

- **`search-{metro}.json` (3 files)** — the *first* Bobcat query shape, the one
  that carried the page's own `context` object and returned `totalCount: 0` on a
  clean 200. **That zero is the evidence for the correction recorded in
  `bobcat.py`'s header** ("a zero from a search API is a claim that needs its own
  test"). The working query is cached separately as `search-{metro}-bbox-*.json`
  precisely so both survive.
- **`idx-*.json` (6 files)** — the exploratory paging that established the
  pipeline forces 15 results per request regardless of `numberOfResults`.
- **`t-aq-tx.json`, `t-deep-2000.json`, `t-gb-state.json`** — the three partition
  tests behind `bobcat_national.sweep()`'s docstring: `@sfbillingstate` is
  queryable but **not facetable** (groupBy returns `values: []`), and deep paging
  works at `firstResult=2000`. Deleting these leaves the docstring asserting
  three things with nothing behind them.

### One thing that is genuinely open

`data/raw/eq-evidence-2026-08-04.json` and `data/raw/eq-apihosts-2026-08-04.json`
overlap: both carry per-host robots verdicts for the same three OEMs, written by
two passes of the same session. They do not contradict each other — the apihosts
file is the narrower, data-path-specific one — but a future reader will not know
which is authoritative. **`02-robots-posture-2026-08-04.md` is authoritative**;
both JSON files are its inputs. Merging them is optional and low value.

**Full-run addendum (2026-08-04):** the gate-signed run added
`fullrun-{w,fed}-2026-08-03.csv` (inputs), `fullrun-{w,fed}-result-2026-08-03.json`
(results — keepers), `_fullrun-{w,fed}.log`,
`handread-fullrun-{fed,w}-2026-08-04.json` (drift-check evidence), and grew
`_dfs-cache` by ~9,700 entries (~48 MB — the asset that made the balance-pause
resume free; never delete). `backlog-recovered-2026-08-03.csv` was rebuilt in
place (282 → 2,241 rows, now with `recovered_confidence`). Default: keep
everything; the v1–v4 pilot iterations from the earlier note remain the only
deletion candidates, still GATE:HUMAN.
