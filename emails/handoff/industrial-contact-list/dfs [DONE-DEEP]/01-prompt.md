# dfs — reopen check

> **UPDATE 2026-08-04.** The generic tail this prompt names below as "the one measured item on the table" **has been bought** — Artur funded it directly, overriding §5h. 32,788 records, 17,214 net-new domains, $12.43. It is raw only; **no fold-in has run**. The reopen check below still governs any *further* DFS spend, and §4 of `./00-README.md` now carries a measured second tier plus the reason to be sceptical of it. Two mechanics are new and worth knowing before any re-buy: `["category_ids","has_not",X]` cuts the bill server-side (max 7 exclusions), and `business_listings/categories_aggregation` prices contamination at $0.034 a call **before** you buy the category.

Your mission: decide whether either DataForSEO reopen condition now holds, and if neither does, stop without spending a cent.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. Why the category union is exhausted by construction, and why more DFS rows are a cost rather than an asset.
3. `../../strategy/00-sourcing-strategy.md` §2 and §3 Tier-1 item 4.
4. `../../strategy/01-build-plan.md` §5f (the whole finding — the economics inverted here) then §5h (a wave is only worth running if it adds a *signal*, not rows).
5. `../../../data/raw/_acquisition-log-2026-08-01.md`, "DFS business listings (§2 source 8)" — the open items, including the unbought generic tail.

## The check

Reopen only if one of these two is true. Test each explicitly and write down the answer.

**(a) The seated list needs replenishment after D-01 retirements — AND the ranked-out pool has already been worked through.** Both halves. **11,024 dfs companies sit in `pool-ranked-out-v7.csv`** unranked and unworked; buying more listings while those sit there is the exact mistake §5f named.

**(b) A new vertical has been added and its categories were never in the 30 swept.** Check the 30-category list in the acquisition log against the new vertical's categories before answering.

**If neither holds: report that, and STOP.** Do not run a wave for volume — §5h retired volume as a justification.

## If you do reopen

- **Check `_cache/dfs-listings/` before re-buying.** This source has already proved twice that a stalled run banked its spend: the first attempt spent the whole $16.98 and the rebuild cost **$0.00** off the verbatim response cache.
- **GATE:HUMAN before any billed run: state the query count, the credit estimate and the hard ceiling** before the first request, not after the invoice. The last run's cap was $25.
- Reuse the sweep shape that worked: **one US-wide radius** (39.8283,-98.5795, r=7000km, `address_info.country_code = US` server-side), not metro-by-metro. Each batch returned exactly its server-reported `total_count`, which is what makes the union exhaustive by construction. Metro slicing only re-bills overlapping records.
- The one measured item on the table is **`industrial_equipment_supplier` (30,008 US listings), never swept standalone** — the generic-only tail, ~$11.16, deliberately not bought.
- **Automotive/truck categories stay excluded** per §5e. That is a scope decision, not an oversight.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `dfs [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
