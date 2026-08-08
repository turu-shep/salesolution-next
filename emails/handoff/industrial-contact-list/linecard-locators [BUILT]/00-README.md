# linecard-locators — a distributor's supplier list, read backwards; probed 2026-08-03

> STATUS (2026-08-04): **BUILT.** Probed 2026-08-03 under a decision rule
> committed before the first fetch; **R-L1 and R-L2 signed by Artur 2026-08-04
> and both built the same day.** Outcome: **three new sources spun out
> (`cmco`, `samsonrope`, `ocenco`), one locator captured complete and skipped
> anyway (Flexco, 33.8% website), one routed to E4 (IndSci), two dead
> (Chromalox 0% website; Zoeller 200→403 overnight), and the 92-name list
> closed — 47 skimmed, no second Flexco.**
> **The headline is not a count.** CMCO fails the website test at 12.2% and is
> still the most valuable thing here, because it publishes dealer emails,
> authorization tiers and a per-record line card — a GATE-L6 source, not a
> domain source. See `cmco [DONE-EMAIL-SOURCE]/`.
> **Two gates open, both default NO:** R-L3 (Ansul — its vendor host publishes
> `Disallow: /`) and a **retro-question about `spxflow`, which was harvested
> from that same host before the robots discipline existed.** Both in
> `02-probe-log-2026-08-03.md` §6f and strategy §9.

Prompts in this folder: `01-prompt.md` — the probe session, executed.
`03-prompt-reverse-queue.md` — **the next session: probe the ranked queue of
136 manufacturers this workstream produced, with the honest prior stated
first.** `02-probe-log-2026-08-03.md` — **the session log: the pre-committed
decision rule, per-target evidence, decisions, the request-budget honesty
note, and §6, the 2026-08-04 build session. Read it before re-litigating any
verdict here.**

Prerequisite reading, in order: [`01-build-plan.md` **§5a** (the criterion —
website coverage; Timken's 67.6% is the benchmark), §5b, §5h, §5i](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §3a, **§7.1**](../../strategy/00-sourcing-strategy.md) ·
[`e4-headless-locators [*]/00-README.md`](../e4-headless-locators%20%5BPART-BUILT%5D/00-README.md)
— where IndSci now sits, and whose measured verdict (every built E4 source
failed its own ≥150 rule) is context for every estimate below.

## 1. What it is

United Central Industrial Supply publishes its supplier list at
**`https://unitedcentral.net/suppliers-we-carry/`** — a static roster of
manufacturers it carries, pre-filtered to segments our ICP sells. Read
backwards it is a queue of manufacturer dealer locators. (United Central
itself is a SunSource division, mis-seated in `seated-v5` at the time; that correction
belongs to `rollup-rosters`.)

**The list measures 92 unique names** (the page renders it twice — 184
`<p><strong>` entries ÷ 2; Flexco appears under its legal name "Flexible
Steel Lacing"). The pre-probe breakdown in this file (4 swept + 6 closed +
25 consumer + 57 never-assessed) double-counted: the 6 ranked and 8 dead of
the 2026-08-03 validation session came *out of* the 57. Measured accounting
as of this session:

| | Count | Which |
|---|---|---|
| Already swept | 4 | Chicago Pneumatic (→`atlascopco`), Enerpac, Kennametal, Rexnord |
| Closed pre-validation | 6 | ContiTech (→E4), Dixon, Falk, Kuriyama, MSA, Parker |
| Probed this session | 6 | Flexco, Samson Rope, Columbus McKinnon, Industrial Scientific, Chromalox, Zoeller — verdicts in §3 |
| Dead from validation | 8 | Victaulic, Donaldson, Danfoss, Crosby, Harrington, Brennan, Manuli, Jason |
| Consumer / off-ICP by name | 21 | itemized in `linecard-skim-2026-08-03.json` (fresh name-based classification; the old "25" was never itemized) |
| **Skimmed, queue closed** | **47** | one homepage GET each — results in §3's candidate table |

## 2. What we pulled

**This row counts the workstream's own probe payloads only.** The two locators
that were built on 2026-08-04 spun out into their own source tokens and their
rows belong to those folders, not to this one — counting them here would
double-count them in the pack registry.

| | |
|---|---|
| Raw rows | **2,615** (Flexco 2,500 — the complete worldwide network; Samson probe 5; Chromalox 110) |
| Unique domains | 342 US (Flexco weburl rows only) |
| Seated (`seated-v9`) | 0 — probe payloads, nothing folded in |
| Routed to pools | nothing (no fold-in ran) |
| Last pull | 2026-08-04 (probes 08-03; candidate evidence + reverse index 08-04) |
| Extractor | `_linecard_evidence.py` (robots + transport, no queries) · `_linecard_probe.py` (one-query probes) · `_linecard_measure.py` (offline scoring) · `_linecard_reverse.py` (the 406-page reverse index) — all in `emails/scripts/sources/` |
| Raw artifacts | `linecard-{evidence,flexco,samsonrope,cmco,indsci,chromalox,skim}-2026-08-03.json` · `linecard-{candidates-evidence,measure,reverse}-2026-08-04.json` + caches under `data/raw/_cache/linecard-*/` |

**Spun out to their own folders** (their rows are counted there):
`cmco [DONE-EMAIL-SOURCE]/` 2,904 · `samsonrope [DONE]/` · `ocenco [DONE-THIN]/` 11.

Provenance is 100% filled — `source`, `source_url`, `captured` on every
record in every payload. No exception.

## 3. How deep we went

One polite query per locator (Samson got a second, justified in-log after the
first exposed ZIP-text matching), robots read first per origin under RFC 9309
longest-match, 403 = instant stop. Full evidence in the probe log §3.

| Target | Transport (measured) | Website coverage | Source-native codes (verbatim) | Verdict |
|---|---|---|---|---|
| **Flexco** | Static — **entire network inline in the page**: 2,500 records before any query ("Any Distance" is client-side filtering) | **33.8%** of 2,315 US rows (783 rows → 424 companies / 342 domains) · phone 97.8% · email 0% | `flexfirst` (18×`1`), name segment-suffixes `-(COAL)`/`-(IND'L)` | **SKIP** (rule 2, <55%) — but the complete payload is already saved; nothing left to fetch, ever. Chain-heavy: Motion alone 578 rows (25%), 72 companies ≥3 locations |
| **Samson Rope** | JSON GET `/api/FindDistributor/GetDistributors` (industry + place text REQUIRED — no unfiltered query); **result cap 24, measured** | **88.3%** on the built sweep — clears the benchmark | **16-option industry filter, verbatim with GUIDs**; `Industries` is a comma-list per record and **it sorts** (38 combinations, 0% null) | **BUILT 2026-08-04 → `samsonrope [DONE]/`** (R-L1 signed). Small, clean, website-rich; the code is vertical, not authorization |
| **Columbus McKinnon** | React mount fed by **same-host routes** — **NOT headless**; exact `submitSearch` contract read from the site's own bundle; **result cap 50, measured** | **12.2%** of 2,904 rows — fails §5a outright | **`distributorLevel`** (Platinum/Gold/'1'; null on 78.6% of rows), **`certifications`** (null on 90%), `preferred` (True on 80.7% — anomalous, uninterpreted), **`brand` = per-record line card, mean 3.5 brands** | **BUILT 2026-08-04 → `cmco [DONE-EMAIL-SOURCE]/`** (R-L2 signed). **Rule 4 was right for the wrong reason:** it is not a domain source, it is a **GATE-L6 email source** — 212 email-reachable non-chain unseated companies, 113 with a tier or certification |
| **Industrial Scientific** | JS-only: two `.ps-widget` mounts — **PriceSpider SaaS**; account key public in indsci's meta; PS cdn robots = 404 (no stated preference); wtb4 data flow not statically derivable | Unmeasured | none obtained | **ROUTED TO E4** (target-table row added there 2026-08-03) — needs one observation render; E4's ≥150 + tier rule governs |
| **Chromalox** (opt.) | JSON GET `/chxapi/getrepdata` → GeoJSON, 110 features / 56 US-territory | **0% — no website field exists** | `category` = product-line territory | **DEAD** (rule 3) — and it is reps + Chromalox's own sales offices (29 of 56 US features), not distributors |
| **Zoeller** (opt.) | — | — | — | **DEAD (gated)** — locator 200 at validation, **403 today**; §5i shelf-life, the Matthews shape; no bypass |

### Candidate table — the skim of the remaining names (Step 5, ran in 15s of a 10-min box)

47 queue names, one mechanical domain guess each (special-case map for 14
known spellings), one polite GET per host, brand-match verified, locator-path
grep. Full rows in `linecard-skim-2026-08-03.json`.

| Manufacturer | Locator URL | Segment |
|---|---|---|
| Ansul | `ansul.com/find-a-distributor` (verified) | fire suppression |
| Kanaflex | `kanaflex.com/distributors/` (verified) | hose — Segment A-adjacent |
| Ocenco | `ocenco.com/distributors/` (verified) | mine safety (SCSR) |
| Southwire | `southwire.com/where-to-buy` (verified) | wire & cable — electrical, above-ceiling segment (E2) |
| Laclede Chain | `lacledechain.com/find-a-rep/` (verified) | chain — **REPS, the Chromalox discount applies** |
| General Monitors | `generalmonitors.com/where-to-buy` (**brand-unverified** — likely an MSA property, and MSA is closed) | gas detection |

- **"None found" (26, fetched clean):** mining OEMs dominate (Alemite, Cab
  Products, Crown, Damascus, Ericson, Gai-Tronics, J.H. Fletcher, K&K Mine
  Products, Kennedy Metal, Koehler-Bright Star, Mefcor, Michigan Drill, Mine
  Life Line, Mining Controls, Moore, Paul's Fan, Plymouth Rubber, PIP,
  Prysmian, Splice One, The Cooper Group, Tompkins, Matco-Norca, Kanaflex
  siblings, BWI Eagle, Bussman-page) — they sell direct/regional, as expected
  for a mining-supply line card. Exact rows in the raw file.
- **Domain guess failed (15, one attempt, no retries):** American Group,
  Bluefield Mfg, Bretby, Brookville, Bussman, Drager (timeout), Eaton
  (timeout), ICP Adhesives, Pyott-Boone, Templeton Kenly, Tensar (TLS),
  Thomas & Betts, Tree Island, West Chester PIP, Zefon (403) — recorded
  "unverified", queue-closed unless someone brings a real domain.
- **Consumer/off-ICP by name (21, not fetched):** 3M, Black & Decker,
  Chevron, Energizer, Hilti, Klein, Master Lock, Milwaukee, Quickrete,
  Rust-Oleum, Stanley–Proto, WD-40, Ridge Tool, Channellock, Ames,
  Devcon-Permatex, Cyalume, Matterhorn, Blue Wolf, Sprayon, 3300 Artesian —
  itemized with reasons in the raw file.

**The 92-name list holds no second Flexco.** The six URLs above are the whole
residue, and none carries an authorization-tier signal on its face.

## 4. What's left on the table

**Both build gates were signed and executed on 2026-08-04, so most of what
this section used to list is now done and lives in its own folder.** What
remains is a queue, two gates, and one deliberate non-decision.

1. **The queue, and it is the most valuable thing left here.** The 92-name
   list is exhausted, but the *thesis* is not: 406 dealer line-card pages
   already sit in `data/raw/_cache/serp_pages/`, and read backwards they are
   406 supplier lists. `_linecard_reverse.py` turned them into
   **136 manufacturers never assessed as locator sources, 29 of them clean and
   named by ≥3 of our own distributors** — Siemens 19, ABB 18, SMC 9, Graco 9,
   Balluff 7, Omron/Turck/Clippard/Dwyer 6. Ranked, free, and un-probed.
   Full output: `data/raw/linecard-reverse-2026-08-04.json`; method, negative
   results and sampling bias in probe log §6g. **Expectation, set honestly:**
   E4 measured every one of its eight locators below the ≥150 net-new bar, and
   four of this queue's top names sit in the same automation tier that measured
   worst. The queue is worth running because it is free and ordered, not
   because it looks rich.
2. **R-L3 (GATE:HUMAN, default NO) — Ansul.** Its locator is a MetaLocator
   embed and **the vendor host publishes `Disallow: /`**. R-1 Banner's
   signature is scoped "this host only" and does not reach it. Not queried.
3. **⚠ The `spxflow` retro-question, and it is not this folder's to answer.**
   `spxflow` was harvested from that *same* vendor host on 2026-08-01, before
   the per-host robots discipline existed — 2,157 rows → 171 companies → **43
   seated rows now live in `seated-v*`**. Ratify or retire, before a send.
   Filed in strategy §9; nothing here was changed or deleted.
4. **Flexco — deliberately not folded in, and it is the largest single number
   left on this page.** The complete network is already captured in
   `linecard-flexco-2026-08-03.json` at zero marginal cost. Its
   weburl-carrying slice is 424 companies / 342 domains — of which **220 are
   net-new against `deduped-v7`, nearly four times Samson's 59.** Rule 2
   correctly skipped the *build* (33.8% coverage, and folding in the
   domainless 66% would repeat the §5f mistake), **but that rule was about
   whether to spend on a harvester, not about whether to use data we already
   hold.** Chain-heavy (Motion alone is 25% of rows), so the 220 needs the
   usual suppression pass before it means anything. **This is Artur's call and
   it costs nothing to leave open** — but it is the cheapest 220 domains
   available anywhere in this pack.
5. **IndSci** — in E4's queue with its transport pinned; its render and rule
   test happen there.
6. **Closed, do not re-litigate without new facts:** Chromalox (0% website,
   rep model), Zoeller (403), Kanaflex (recruitment page, not a locator),
   Southwire (no locator + above-ceiling segment), Laclede (rep model),
   General Monitors (404), and the 21 consumer + 26 no-locator + 15
   unresolved-domain skim closures.

## 5. Registry row

| linecard-locators | BUILT | 2,615 | 0 | 2026-08-04 | queue only: 136 unassessed manufacturers ranked by how many of our own distributors name them (29 clean, ≥3 pages); the 92-name list itself is exhausted | `linecard-locators [BUILT]/` |
