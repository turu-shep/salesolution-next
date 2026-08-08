# dfs — DataForSEO business listings (Google Business Profile data, category × US-wide radius)

> STATUS (2026-08-04): DONE-DEEP — still the biggest source in the program, now by 8×. **The generic tail Artur funded on 2026-08-04 has been bought and measured: 32,788 more listings, 17,214 net-new domains, $12.43.** It is raw only — **no fold-in has run**, so `seated` below is unchanged. What is left to buy is a measured second tier of ~30k specific-category listings, and §5h's caveat now has a number behind it: the tail carries **2.93 category codes per record against the first wave's 4.33**, and **63.2% of its net-new domains carry no positive industrial evidence beyond the query artifact itself**.

Prompts in this folder: `01-prompt.md` — reopen check: re-buy DFS categories only if the seated list needs replenishment or a new vertical adds categories.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §2 + §3 Tier-1 item 4](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5f](../../strategy/01-build-plan.md) (the whole finding) then §5h · [`_acquisition-log-2026-08-01.md` "DFS business listings (§2 source 8)"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`business_data/business_listings/search` on the DataForSEO API — Google Business Profile records filtered by category and a geo circle. Per record: name, full NAP, website, email, `category_ids[]` (mean 4.33 codes on wave 1, **2.93 on the wave-2 tail** — the code count is itself a quality signal), rating and review counts, `people_also_search`, and a **null `url` flag** that is the only free no-website signal in the program.

Two endpoints on the same account earn their own line. **`business_listings/categories`** returns the full 5,314-entry category taxonomy with global counts, **free** — cached at `data/raw/_cache/dfs-tail/_categories.json`. **`business_listings/categories_aggregation`** prices contamination before you buy it: for any category set it returns every co-occurring category's US count plus `websites_count`, for about $0.034. Use both before choosing categories; wave 2 did, and it is the reason five plausible-sounding categories were never bought.

Compliance posture: this is a paid API account, not a scraped origin. The ≤1-request-per-3s rule in §7 governs small businesses' own servers and does not apply here (stated explicitly in the header of `emails/scripts/s3/segment_w_verify.py`). No robots question arises.

## 2. What we pulled

**Two waves. 74,578 deduped listing rows, $29.41 all-in.**

**Wave 1 — 45,554 raw API records @ 2026-08-01** via `emails/scripts/acquire/dfs_listings.py` → **41,790 deduped listing rows** in `emails/data/raw/dfs-listings-2026-08-01.csv` → 25,332 distinct company names / 17,472 domains. Fill: phone 97.2% · ZIP 99.9% · website 87.5% · email 32.0% — the best NAP density of any source here.

**Cost $16.98**, under the $25 cap — and all of it was spent by the *stalled* first attempt. The verbatim response cache survived, so the rebuild cost **$0.00** (§5f).

Contributed: **seated 2,437 · ranked-out 11,024 · small-shops 1,156** (plus 4,198 of the 4,445-row Segment W pool).

**Wave 2 — the generic tail, 32,788 records @ 2026-08-04** via `emails/scripts/acquire/dfs_listings_tail.py` → `emails/data/raw/dfs-listings-2026-08-04.csv` → 25,079 company names / **19,505 domains**. Fill: phone 96.5% · ZIP 99.9% · website 88.2% · email 36.9% — marginally *better* NAP than wave 1. **3,857 null-website rows (11.8%), 3,722 distinct names**, all Segment W candidates. **Cost $12.43** against Artur's $13 cap ($12.21 sweep + $0.22 probes); nothing was aborted for budget.

**Contributed: nothing yet. The fold-in has not run** — a domain-resolution session held `lists/` and `data/side-pools/` on 2026-08-04, so this wave stops at raw + measurement by instruction.

Two mechanics from wave 2 that are worth reusing on any DFS buy:

- **`["category_ids","has_not",X]` is honoured server-side and reduces the billed record count.** Everything carrying one of wave 1's 30 categories is already in that payload by construction, so excluding the 7 highest-overlap ones is a refusal to buy the same rows twice, not a filter on information. Measured: 30,018 → 23,528, **saving $2.34**. The API caps `filters` at 8 elements, so 7 exclusions is the ceiling; a greedy set-cover over the local wave-1 payload picked the 7 that cover 6,489 of the 7,760 already-held records (83.6%).
- **`business_listings/categories_aggregation` is a contamination x-ray for $0.034 a call.** It returns, for any filtered set, how many US listings carry each co-occurring category. It killed five candidates before a cent went on them — `packaging_supply_store` (23,230, but co-occurring with shipping/notary/mailbox = the pack-and-ship retail cluster), `gas_cylinders_supplier` (propane), `air_filter_supplier` and `generator_shop` (both HVAC), and `belt_shop`, whose 597 US listings co-occur with `shoe_store`, `boot_store` and `hat_shop` — fashion belts. **The name lies; the codes do not.** That is §5i's vertical-code rule paying for itself at the point of purchase rather than three stages later.

## 3. How deep we went

**Wave 1:** 30 categories in 3 batches over **one US-wide radius** (39.8283,-98.5795, r=7000km, `address_info.country_code = US` server-side) instead of metro-by-metro. Each batch returned exactly its server-reported `total_count` (B1 14,013 · B2 14,138 · B3 17,403), **so the category union is exhausted by construction** — metro slicing would only have re-billed overlapping records. That is a cheaper sweep shape than the AD metro grid and is the pattern to reuse.

Stop reason, honestly: not a wall. §5f inverted the economics — 25,332 companies against a need of ~3,000 — and §5h then ruled that a wave is only worth running if it adds a *signal*, not rows. Acquisition stopped because qualification throughput became the binding constraint.

**Wave 2:** the same US-wide shape, two batches, 34 requests, both returning their full server-reported `total_count` (T1 23,528 · T2 9,260) — exhausted by construction again.

- **T1 `industrial_equipment_supplier`, minus the 7 highest-overlap wave-1 categories.** The generic-only tail §5h declined.
- **T2, five categories chosen on measured co-occurrence:** `automation_company` (US 5,542, 73% website), `laboratory_equipment_supplier` (2,093, 73%), `plastic_products_supplier` (1,308, 69%), `chemical_wholesaler` (1,273, 60%), `plastic_wholesaler` (541, 60%) — ranked by domains-per-dollar, minus records already bought in T1 or wave 1.

## 4. What's left on the table

**The generic tail is bought.** What replaced it on this list is a **measured second tier** — categories probed on 2026-08-04 for exact US counts and never swept:

| Category | US listings | Website fill | Read |
|---|---|---|---|
| `equipment_supplier` | 9,472 | 65% | construction/ag/rental-heavy (rental 1,339 · construction_equipment 1,271 · tractor 591) |
| `pipe_supplier` | 7,094 | 34% | real PVF, but half plumbing/bath — §2a's wrong buyer |
| `electronic_parts_supplier` | 5,880 | 60% | component distribution; retail tail (cell_phone_store 481) |
| `metal_supplier` | 5,509 | 54% | metals service centres, genuine |
| `hydraulic_repair_service` | 5,484 | 48% | fluid-power shops; truck-repair tail 543 |
| `steel_distributor` | 5,120 | 45% | genuine, with a drywall/insulation construction tail |
| `electric_motor_repair_shop` | 2,307 | 58% | EASA-shaped, `category.mjs` already weights it 3 |
| `tool_manufacturer` | 2,582 | 78% | best website fill measured; manufacturer, not distributor |

Roughly **30k more listings at about $12** if all eight ran with exclusions. **That is a volume buy, not a signal buy** — the same trade §5h declined, and the wave-2 numbers below are the reason to think hard before funding it.

**Measured, and this is the caveat to carry:** the tail is *thinner*, not cleaner. Like-for-like under `scripts/lib/category.mjs`:

| | wave 1 (2026-08-01) | wave 2 tail (2026-08-04) |
|---|---|---|
| mean `category_ids` per record | 4.33 | **2.93** |
| no wrong-vertical marker | 55.2% | 72.6% |
| decisively rejected on category | 16.3% | 11.4% |
| **core evidence ≤ 1.0** (nothing beyond the query artifact) | **0.0%** | **59.6%** |
| core evidence > 2.0 | 56.8% | **21.9%** |

The 72.6% "clean" share is **absence of evidence, not presence of fit** — a record with three codes has fewer chances to carry a wrong-vertical marker than one with five. Of the 17,214 net-new domains, **63.2% carry no positive industrial evidence beyond the queried category itself**; only 16.5% clear core > 2.0. These rows will need per-domain enrichment to rank at all, which is precisely the throughput constraint §5f named.

Also still in hand and unranked: **11,024 wave-1 dfs companies sit in `pool-ranked-out-v7.csv`.**

### Two things the fold-in session must fix first

**1. `scripts/lib/category.mjs` has no vocabulary for three of the categories bought.** `laboratory_equipment_supplier`, `plastic_products_supplier` and `plastic_wholesaler` are in neither `CORE_CODES` nor `CONTAM_CODES`, so **2,809 wave-2 rows (8.6%, and 30.3% of T2) score zero core** and would rank badly for the wrong reason — absence of vocabulary read as absence of fit. Lab/scientific and plastics distribution are both genuine technical-distribution verticals. Weigh them before ranking, not after.

**2. `NATIONAL_CHAINS_RX` misses most of the branch networks this wave surfaced.** 385 domains carry ≥5 listings each and cover 7,817 rows (23.8%); 200 of them are net-new, covering 3,004 rows. The regex flags only 3.7% of rows. It knows Ferguson and Motion; it does **not** know **Graybar (234 listings), Trane Supply (175), Carrier Enterprise (147), Thermo Fisher (128), White Cap (350), Core & Main (226), Brenntag (143), Greif (92), Anixter (88), MRC Global (87), Piedmont Plastics (53), Polymershapes (49), Altium Packaging (43), Keyence (41)**. Every one is a national chain or a manufacturer, all far outside the $5M–$75M ICP. **A listing-count-per-domain threshold catches them without a name list** and generalizes to the next wave — which is what §5m's "the fix is list-free" already argued for manufacturer contamination.

## 5. Registry row

| dfs | DONE-DEEP | 74,578 | 2,437 | 2026-08-04 | ~30k listings across 8 measured specific categories (~$12) — volume, not signal | dfs/ |
