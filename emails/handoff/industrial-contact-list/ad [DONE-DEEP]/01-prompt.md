# ad — work the gap between 2,253 companies pulled and 122 seated

Your mission: find out where 2,253 AD member companies went, turn AD membership into the qualification signal the strategy always claimed it was, and probe whether a denser metro grid still pays before closing this source.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. What AD is, what we pulled, how deep the sweep went, what is left.
3. `../../strategy/00-sourcing-strategy.md` §1 (why buying-group membership matters) and §3 Tier-1 item 2.
4. `../../strategy/01-build-plan.md` §2a (the forward projection that was half right), §5a (the 276-not-493 correction), §5b.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` §1 (wave 1) and §5 (the expansion and the flattening finding).

## The work

Run these in order. Nothing here is billed — AD is polite GETs, so the only budget is wall-clock at ≥3s/host.

### Step 0 — explain the 122 (offline, zero network)

2,253 distinct AD companies produced 122 seated rows. Before pulling anything new, histogram the disposition of every record whose `source` contains `ad` across `lists/seated-v5.csv` and all `data/side-pools/pool-*-v7.csv`.

Expect most of it in `adjacent-trade` (correct — electrical/HVAC/plumbing) and `ranked-out` (138). **If a large share landed in `not-a-distributor` or vanished from conservation, that is a bug and it outranks every pull below.**

Deliverable: a one-table answer to "where did AD go?"

### Step 1 — AD membership as a rank input (offline, zero network)

Join the 2,253 AD company names against `pool-ranked-out-v7.csv` on the same keys S2 uses (phone → name+ZIP5 → domain, `emails/scripts/lib/dedupe.mjs`). Every hit is a company we ranked down that a buying group already vetted for independence and scale. Report how many, and whether adding an `ad_member` term to `rank.mjs` moves anyone across the cut.

**GATE:HUMAN before re-ranking.** The cut line is already the weakest claim in the build (§5l). Report the movement, ask, and wait — do not re-rank on your own judgement.

### Step 2 — the denser-grid probe (120 requests, ~7 min)

Pick 40 fill-in points that sit between existing metro circles (largest gaps by lat/lng first; the 150 metro coordinates are in the cached responses). Run BPT + PVF + ISD only. Reuse `ad_expansion.py` unchanged — it takes a metro list and shares the cache, so re-runs are free.

**Decision rule, fixed before the run:** if net-new distinct companies per query beats 1.0, extend to 100 fill-in points; below that, close AD for good. Expected yield on the measured curve: 30–70 net-new companies from the probe.

### Step 3 — GATE:HUMAN, then the off-ICP divisions

**GATE:HUMAN — ask Artur one question before spending the wall-clock:** *are AD electrical / plumbing / HVAC / waterworks members in scope for Catalog AI, or is the segment definition binding?*

- If in scope: sweep ESD/PLBG/HVAC/GSD/WWD × metros 51–150 — 500 queries, ~30 minutes, expect 400–700 distinct companies with ~83% website fill.
- If not in scope: do not spend the wall-clock. The answer is already known from wave 1's 1,219 off-ICP companies sitting in `adjacent-trade`.

### Rules that carry into all of it

- Reuse `ad_full_sweep.py`'s fetch/parse rather than rewriting — the expansion already proved this works.
- Keep `branch_id` as the rollup key.
- Do not re-request DBP or ISC. They are AD's own dead codes, server-side 404 on every query, and one bad value poisons a combined request.
- Do not run metros 151+ on ICP divisions — single digits per division.
- Route null-website rows to Segment W rather than running the Maps-URL cleaner. **That quirk does not exist in this pull** (0 of 5,438 records); it was an artifact of the old validation script.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `ad [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
