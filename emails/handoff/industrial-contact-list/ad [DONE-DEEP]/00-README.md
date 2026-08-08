# ad — Affiliated Distributors member locator (buying-group membership = the pre-applied independence filter)

> STATUS (2026-08-03): DONE-DEEP — every step of `01-prompt.md` executed and
> measured. Both exhaustion axes flat on the ICP divisions (metro rank §5b,
> geographic grid 0.38/query), off-ICP divisions swept 51–150 under Artur's
> gate answer (**5,458 raw → 576 net-new**), membership-as-rank-signal measured
> and **queued for the next re-rank** (Artur: record now, apply at next
> regeneration — fix list at `emails/data/ad-member-token-fixes-2026-08-03.csv`).
> Nothing left to pull; **folded in 2026-08-04** (`s4l-ad-foldin.mjs` → `seated-v8`,
> 39 member crossers seated, ad_member live in `lib/rank.mjs`). No gates open.

Prompts in this folder: `01-prompt.md` — explain the 122, test AD membership as
a rank input, probe a denser grid, then the off-ICP division gate. **All four
steps executed 2026-08-03**; this dossier carries the measured results.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §1 (why membership matters) + §3 Tier-1 item 2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §2a, §5a, §5b](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` §1 (wave 1) and §5 (the expansion + the flattening finding)](../../../data/raw/_acquisition-log-2026-08-01.md) · [`_acquisition-log-2026-08-03.md` (grid probe + off-ICP sweep + the offline audit)](../../../data/raw/_acquisition-log-2026-08-03.md)

## 1. What it is

`GET https://www.adhq.com/resources/member-locator?location=<metro>&industries=<division>` — a public, server-rendered member locator. One request per (division, metro). Division codes come off the form's own `industries[]` checkboxes: BPT, BSDC, DBP, ESD, GSD, HVAC, ISD, ISC, PVF, PLBG, WWD.

Per record: company, division, address, phone, website, plus `branch_id` (AD's own stable per-branch key — better than name+ZIP for rollup), lat/lng, ZIP, distance and logo. **AD publishes no email.**

Compliance: public pages, ≥3s between requests, one worker per host, every response cached. **No 429 and no 403 in 1,366 origin requests across all four runs** (wave 1: 446 · expansion: 300 · grid probe: 120 · off-ICP sweep: 500). §7's robots question does not arise.

## 2. What we pulled

**Wave 1 @ 2026-08-01** (`emails/scripts/acquire/ad_full_sweep.py`) — 11 divisions × top-50 metros = 550 queries, 446 origin requests: **5,438 raw records → 1,712 distinct companies** (1,110 branch-stripped). Website 82.4% per company, phone 73.0%.

**Expansion @ 2026-08-01** (`emails/scripts/acquire/ad_expansion.py`, which imports wave 1's fetch/parse verbatim) — 3 ICP divisions (BPT, PVF, ISD) × metros 51–150 = 300 queries: **1,232 raw → 541 distinct, 320 net-new.** The ICP-division pool went 493 → 817 (+66%) for 300 requests.

**Denser-grid probe @ 2026-08-03** (`emails/scripts/acquire/ad_grid_probe.py`) — 40 geographic fill-in points (144–527 mi from every swept center; selection algorithm in the script and the 08-03 log) × BPT/PVF/ISD = 120 queries: **107 raw → 46 net-new = 0.38/query**, against the decision line of 1.0. BPT 45 rows / 38 distinct · PVF 61 / 23 · **ISD 1 / 1**. 13 of 40 points empty in all three divisions; the one real pocket was Abilene, TX (39 rows). Website fill 57.0%.

**Off-ICP sweep @ 2026-08-03** (`emails/scripts/acquire/ad_officp_sweep.py`, gate-approved by Artur) — ESD/PLBG/HVAC/GSD/WWD × metros 51–150 = 500 queries in 1,979s: **5,458 raw → 1,324 distinct in pull → 576 net-new** vs all prior AD (the §4 estimate said 400–700). Per division: ESD 2,742 rows / 825 distinct · PLBG 1,243 / 410 · HVAC 1,043 / 315 · GSD 276 / 187 · WWD 154 / 44. Website fill 74.8% row-grain, **79.3% per net-new company**. 93 of 500 queries returned zero rows. On fold-in these route by division to `pool-adjacent-trades` unless the segment definition changes.

### Where did AD go? (the step-0 answer, measured 2026-08-03)

Row grain — records whose `source` chain carries the exact token `ad`, across
`seated-v5` + the **current** side pools (v10/v9/v8 where those exist; the
literal v7 read differs only by +2 not-a-distributor and +5 non-us rows):

| Destination | ad-token rows |
|---|---|
| seated-v5 | **122** |
| ranked-out-v7 | 138 |
| **adjacent-trades-v7** | **752** |
| duplicate-sites-v8 | 37 |
| above-ceiling-v8 | 22 |
| segment-w-v7 | 10 |
| not-a-distributor-v10 | 6 |
| non-us-v9 | 5 |
| identity-backlog-v1 | 1 |
| small-shops-v7 / chains-v7 / usaspending-unmatched | 0 |
| **Total** | **1,093** |

Company grain — the 6,670 wave rows are **1,194 branch-stripped distinct
companies** (the prompt's "2,253" was the *sum of the two waves' loose-normalized
name-string counts*: 1,713 + 541; cross-wave union 2,033; company grain 1,194).
Best-outcome waterfall by the S2 identity keys (phone → name+zip5 → domain):

| Outcome | Companies | Share |
|---|---|---|
| seated (any identity match in seated-v5) | 182 | 15.2% |
| ranked-out | 181 | 15.2% |
| **adjacent-trades** | **758** | **63.5%** |
| above-ceiling | 39 | 3.3% |
| segment-w | 14 | 1.2% |
| small-shops 6 · non-us 4 · not-a-dist. 3 · dup-sites 2 · chains 1 | 16 | 1.3% |
| unmatched by strict keys | 4 | 0.3% |

**Verdict: no bug.** Not-a-distributor holds 3 companies (6 rows) — noise, and
correct on inspection. The 4 strict-key misses were hand-traced: **zero
companies actually vanished** — all are present under post-merge identities
(mergeRecords keeps ONE phone per merged row, so a 14-branch member whose
surviving phone came from another cluster member is invisible to per-branch
keys). Example: Wyoming Bearing/PT Hose sits **seated** under
`wyoming bearing supply greeley` with the ad token intact. The gap the prompt
chased decomposes into (a) name-string double-counting (2,253 → 1,194 real
companies) and (b) the off-ICP trade split (63.5% to adjacent-trades — ESD,
PLBG, HVAC, GSD, WWD members, exactly as designed). Measure script:
`emails/scripts/acquire/measure_ad_gap.mjs`.

**Generation note (2026-08-04).** The S4j roll-up retag (a parallel session's
work: `seated-v6` / `pool-ranked-out-v8` / `pool-chains-v8`) landed after this
audit measured against v5/v7 and moved **15 ad-token rows to `chain`**: 14 from
seated — Singer-network rubber/hose members, `singerindustrial.com` among
them — and 1 from ranked-out. Current-generation ad-token counts: **seated 108
· ranked-out 137 · chains 15** (everything else in the tables above is
unchanged; conservation holds, 14+1=15). The cut score is 45 in both
generations. All 21 seated rows in the token-fix CSV survive into v6, so the
fix list stands as emitted.

One curio for S2's collision ledger: the ranked-out row whose display is
"United Electric Supply Co., a division of Main Electric Supply Co." carries
`company=specialty hose express` / `specialtyhosexpress.com` — a phone-key merge
(209-845-7171 shared) that welded AD's Fresno-area United Electric record onto a
hose company. One row; noted, not fixed here. And one ad-token ranked-out row
(`altrarentals.com`) traces to the pre-wave validation sample, not the waves —
its token is legitimate but not reproducible from the two wave files.

## 3. How deep we went

Two structural facts govern this source. The constraint is a **fixed 50-mile radius, not a result cap** — empty responses say so verbatim, and rows per query run 0 / median 5 / max 129 — so coverage is a set of circles and the gaps are geographic. And **`DBP` and `ISC` return HTTP 404 on every query**: not a block, not a throttle, AD's own dead codes. One bad value poisons a combined request (`industries=BPT,DBP` → 404 while `industries=BPT` → 200). 100 of wave 1's 550 queries returned nothing for that reason.

**Both exhaustion axes are now measured, and both are flat:**

1. **Population-ranked metros** (§5b, 2026-08-01): metros 41–50 added 14.9% of wave 1's companies; metros 141–150 added 4.8% of the expansion's. Metros 151+ project single digits per division.
2. **Geographic fill-in** (grid probe, 2026-08-03): 40 points chosen largest-gap-first, every probe circle entirely virgin ground, and the yield was **0.38 net-new/query** — a third of the pre-committed decision line. The predicted 30–70 net-new resolved to 46. `ISD` produced one row across 40 new circles on top of 28 companies across 150 metros: exhausted.

Also worth carrying: **530 companies carry more than one AD division** — a line-card-ish signal inside a single source. §5a corrected the headline early: AD's ICP-shaped count is 276 post-rollup, not the 493 quoted pre-rollup. And conservation now has a measured answer (§2): zero records lost between raw and the current generation.

## 4. What's left on the table

1. **ICP-division pulls: nothing.** Both axes measured flat (§3). Dead and not to be retried: DBP and ISC (server-side 404), metros 151+ (single digits), denser grids (0.38/query, decision rule says close), and the BSDC tail (6 distinct companies in the whole top-50 sweep — not worth 100 queries).
2. **Off-ICP divisions: nothing.** Gate answered "in scope" and the sweep ran the same day — 576 net-new companies measured (§2). The off-ICP metro axis now matches the ICP one: swept through metro 150, with the same flattening expected beyond and no reason to test it (these rows route to `pool-adjacent-trades`, which no project has claimed yet).
3. **AD membership as a rank input — EXECUTED 2026-08-04 by `s4l-ad-foldin.mjs`** (gate 2 answered "record now, apply at next regeneration"; the fold-in was that regeneration). `AD_MEMBER = 6` now lives in `lib/rank.mjs`; 113 seated + 141 ranked-out member rows refreshed; **39 crossed the cut into `seated-v8`** (vs 43 predicted — the delta is the S4k retag plus corroborated-only matching). Token attachment landed on 20 rows; domain-only cases stay in the fix CSV for manual adjudication. The measured pre-apply movement, against the empirical cut score of 45:
   - 153 ranked-out rows are AD members (137 already carry the token, 16 newly joined by the S2 keys). Movement across the cut by term weight, newly-joined rows also credited their evidence-band step: **+2 → 17 · +4 → 25 · +6 → 43 · +8 → 53 · +10 → 58 · +12 → 68.** All 43 crossers at +6 are classed `industrial-distributor`; divisions concentrate in BPT (12) and PVF (16); 27 of 43 sit in the $2–50M size bands. Gap-to-cut among all 153: median 13 points.
   - **37 rows are AD members missing the token entirely** (21 seated — 7 of them T0 — and 16 ranked-out): their `evidence_depth` under-counts. Fix list emitted to `emails/data/ad-member-token-fixes-2026-08-03.csv` (with matched AD names, divisions, and join keys; domain matches can be one-domain-many-members where AD lists a parent's brands — adjudicate from the `ad_companies` column).
   - Recommended spec at apply time: `ad_member` weight in the +4…+6 band (comparable to depth-2 evidence, below a verbatim declaration), token attachment from the fix CSV first, then the term. Decision on the exact weight belongs to the re-rank session; the cut line is already the build's weakest claim (§5l).
4. **Raw rows FOLDED IN 2026-08-04** (`s4l-ad-foldin.mjs`, report `data/_ad-foldin-2026-08-04.md`): 875 branch-stripped entities → 421 matched existing rows, 454 net-new routed **424 adjacent-trades · 24 ranked-out · 4 chains (roll-up blocklist caught them) · 2 segment-w · 0 seated** (unenriched rows cannot reach the cut — they enter the pool for the next enrichment pass). Generation: `seated-v8` (2,774) · `pool-ranked-out-v10` · `pool-adjacent-trades-v8` · `pool-segment-w-v8` · `pool-chains-v10`; conservation PASS on all five, field-level readback clean.

## 5. Registry row

| ad | DONE-DEEP | 12,235 | 152 | 2026-08-03 | nothing — pulls exhausted both axes; folded in + ad_member live (S4l 2026-08-04); residue is enrichment of the 24 new ranked-out rows | ad/ |
