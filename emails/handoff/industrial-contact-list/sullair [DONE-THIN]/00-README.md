# sullair — source handoff

> **STATUS (2026-08-03):** DONE-THIN. The CSV path `research/01` left open since
> 2026-08-01 is resolved and the whole published network is in hand — but it is
> **177 companies, 60 net-new domains, and only 18 of those carry the plant-air
> line that is actually our ICP.** The rest are Caterpillar dealers and rental
> houses. Complete, cheap, and small.
> **No gates.** robots.txt does not disallow the data path; no override was
> involved and none is needed.

Prompts in this folder: `01-prompt.md` — a reopen check, not a build. The source
is exhausted; the only live question is whether the two CSVs have changed.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §7.1 (obstacle ladder — Sullair sits in none of its rows)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (the vertical-code rule — this source is its fourth independent confirmation), §5h (a wave is worth running only if it adds a signal we lack)](../../strategy/01-build-plan.md) ·
[`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md) (open item "Resolve Sullair's CSV base path" — **now closed**) ·
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §4 (how the path was found)

## 1. What it is

Sullair (compressors; owned by Hitachi Global Air Power) publishes its
distributor network as **static CSV files on its own Drupal 10 site** — not a
locator API, not a rendered SPA. The page
`https://america.sullair.com/en/distributors` loads them with `jQuery.ajax` and
parses them client-side with `jQuery.csv`.

**Access shape: plain static CSV over HTTP.** No JS render, no form, no key, no
login, no CAPTCHA. Four GETs is the entire source.

`research/01` guessed a path, got a 404, and left "resolve the base path" as an
open item for two days. The answer was in the page's own inline script all
along:

```js
public_path = "/sites/default/files/";
```

giving:

| File | What it holds |
|---|---|
| `/sites/default/files/data/stationary_distributor_list.csv` | dealer branches, plant-air line |
| `/sites/default/files/data/portable_distributor_list.csv` | dealer branches, portable line |
| `/sites/default/files/data/stationary_usMap.csv` | ZIP → `id_no` territory index, **no company fields** |
| `/themes/custom/Sullair/library/data/usMap.csv` | **HTTP 404** — also commented out in the live page JS; nothing loads it |

**Robots + access posture.** `america.sullair.com/robots.txt` disallows only
`/search/` and `/index.php/search/`. **`/sites/default/files/` is not
disallowed** — no override, no §7.1 question, nothing to sign. Cloudflare fronts
the site but served every request cleanly at ≥3s pacing. The terms page was
fetched and read: no anti-automation, anti-crawling or data-mining clause.

## 2. What we pulled

| | |
|---|---|
| Raw rows | 762 (9 blank trailing rows dropped; 103 cross-list merges) → **650 records** |
| Unique domains | **103** (99 registrable — 6 are per-state `comairco.com` subdomains) |
| US records | **488**, of which 1 is Sullair's own parent-company row |
| Distinct US companies | **176** dealers |
| Seated (`seated-v5`) | 0 — not yet folded in |
| Routed to pools | none yet |
| Last pull | 2026-08-03 |
| Extractor | `emails/scripts/sources/sullair.py` |
| Raw artifacts | `emails/data/raw/sullair-2026-08-03.json` |

Fill on US records: **website 99.4% · phone 99.6% · email 72.1%.** That email
rate is among the highest in the program, and the addresses are **named
individuals**, not role inboxes — which puts them squarely under §7.2
(manufacturer-published dealer emails: send-eligible after verification,
**isolated micro-campaign cohort**, and the §7.2 filter prefers a role address
wherever both exist).

Provenance is 100% filled: `source`, `source_url`, `captured` on every record.

Total origin cost: **4 GETs** (3× 200, 1× 404). The scripted run replays entirely
from `_polite`'s disk cache and records `origin_requests: 0`.

## 3. How deep we went

Exhaustively. Both distributor lists are **global, not US-scoped**, so there is
no geography left unswept — no metro grid, no radius loop, no pagination. The
per-region `*Map.csv` files were deliberately not fetched: the page's own
`internationalSearch()` maps their rows back onto these same lookup sheets by
`id_no`, and they carry **zero company fields**. No US record is reachable only
through a map file.

Two structural findings worth carrying:

- **The two lists run separate `id_no` namespaces for the same physical
  branch.** Ring Power's Pompano Beach yard is `605274_004` in portable and
  `602574_003` in stationary. Merging on `id_no` alone caught 79 branches and
  left 24 US duplicates behind; a second merge tier on name+street+city+state
  cleared them. Both account numbers are kept, pipe-joined. **If another source
  ever reuses these IDs, do not trust them as a cross-file key.**
- **7 dangling `id_no`** hold ZIP territory in the map with no row in either
  distributor list. Unrecoverable — the map carries no company data. Listed in
  the payload rather than guessed at.

Data quality is visibly hand-maintained: `pa.comarico.com` for comairco,
"Wesst Chester", four rows spelling out "Hawaii" and one "Guam". All normalized
through the same `STATE_ABBR` map `kennametal.py` uses.

### The vertical code, captured verbatim — fourth independent confirmation of §5i

`product_line_raw`: **portable 357 · stationary 119 · portable|stationary 11.**

This is not decoration. **It sorts the source in half, and averaging over it
would misrepresent Sullair badly.** Of the 60 net-new domains, only **18 carry
the `stationary` (plant-air) line** — the industrial-MRO slice that is actually
our ICP. The portable-only remainder reads as Caterpillar dealers and rental
houses: holtcat, ohiocat, michigancat, louisianacat, wyomingcat, zieglercat,
fabickcat, carolinacat, ringpower, altorfer, clevelandbrothers, wagnerequipment,
starrentals, puckettrents, pdqrentals. **Construction and equipment rental, not
industrial MRO** — the same contamination §5f found at 20.5% in DataForSEO.

Timken, DataForSEO, Yaskawa, now Sullair. The rule holds: capture every
source-native code verbatim, assume it encodes vertical, and test that it sorts
before seating anything.

Other codes captured uninterpreted: `main_office_raw` (null 383 · `X` 97 · `x` 6
· `X?` 2 — an HQ/branch marker, dirty as published), `no_map_raw`, `id_no_raw`.
`search_notes_raw` is in the schema and **empty on 100% of rows**.

`id_no 000000_*` is **Hitachi Global Air Power itself** (1 Sullair Way, Michigan
City IN — Sullair's parent), 11 rows. Flagged `manufacturer_own_record` and
excluded from every dealer figure here. `000000_000` is the fallback the page JS
returns when a radius search finds nothing.

## 4. What's left on the table

**Nothing to fetch. 177 companies is the entire published US network**, and both
CSVs are the complete files rather than a query result.

Net-new against `deduped-v7.csv` (16,719 rows, all domain-keyed), measured four
ways because they disagree and the disagreement matters:

| Measure | Net-new | Of |
|---|---|---|
| exact `domain` string | **60** | 103 |
| registrable domain | 55 | 99 |
| `norm_company` name | 152 | 176 |
| entities (domain **and** name both miss) | **52** | 101 |

**Use 52–60, not 152.** The by-name figure is inflated because the source lists
branch labels as company names — "acme tools fargo", "acme tools bemidji", all
one company on `acmetools.com`. Five of the 60 net-new domain strings are
per-state `comairco.com` subdomains whose apex is already in the pool.

**Against the E4 decision rule — a locator earns a full sweep at ≥150 net-new
companies plus a tier code or per-record line card — Sullair fails, and not
narrowly.** It clears the code leg (`product_line_raw` is a genuine line-card
signal) and misses the volume leg by roughly an order of magnitude: 52–60
net-new, of which **18 are in-ICP**. That is the Interroll/FlexLink/mk shape.
The measurement is the deliverable; the source is closed.

**The honest reason to keep it anyway** is not the count. It is §5a's surviving
mechanism: all 176 carry **"authorized Sullair distributor" at 100% coverage by
construction**, 99.4% have a website, and 72.1% ship a named-person email. For
the 18 in-ICP net-new that is a complete, sendable, authorization-stamped record
with no enrichment spend at all — better per-company economics than anything in
the ranked-out backlog.

**Unverified, stated as such:** whether the 6 `comairco.com` subdomains are
separate legal entities or one company with per-state sites. Counted as one in
the registrable-domain figure and six in the exact-domain figure; both are above.

## 5. Registry row

| sullair | DONE-THIN | 650 | 0 | 2026-08-03 | nothing — 177 companies is the whole published network; 52–60 net-new, 18 in-ICP | sullair/ |
