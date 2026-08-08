# serp — dealer self-identification through Google (the dealers publish their own authorizations)

> STATUS (2026-08-03): DONE-DEEP — three waves, $5.24 total, never saturated; stopped on qualification throughput, not on yield.

Prompts in this folder: `01-prompt.md` — reopen check: run a wave 4 only for replenishment or a new vertical, on §5k's deep-ladder-first rule.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 5 + §3a E5](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5b, §5g, §5k, §5m](../../strategy/01-build-plan.md) (the query rule is corrected twice — §5k is the current one) · [`research/04-self-identification-play.md`](../../../research/04-self-identification-play.md) · [`_acquisition-log-2026-08-01.md` §4 + the two wave entries](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

DataForSEO SERP organic (`serp_organic_live_advanced`), run against phrases distributors write about *themselves* — "authorized Parker distributor", "line card", "master distributor". The record is the dealer's own site, so this route reaches brands whose locators are Cloudflare-gated **without touching their servers** — the whole reason it exists (§7.1's recovery route for the eight 403 brands). It also reaches Dixon, which publishes no locator at all.

Compliance: a paid API in front of Google. No origin of ours is scraped. The one direct-fetch component — the page-verification pass — makes **one request per host, never a second**, and recorded 50 refusals (48×403, 2×429) without retry or bypass.

## 2. What we pulled

Three waves @ 2026-08-01, all via `emails/scripts/acquire/serp_selfid{,_wave2,_wave3}.py`:

| Wave | Queries | Organic rows | Distinct dealer domains | Cost |
|---|---|---|---|---|
| 1 | 250 planned / 246 ok | 6,397 | 1,474 (~1,120 after hand-measured 76% precision) | $1.355 |
| 2 | 500 / 497 | 13,664 | 1,477 net-new (union 2,951) | $1.005 (program $2.36) |
| 3 | 400 / 389 | 12,378 | 2,798 net-new (**union 5,749**) | $2.88 |

**Program total: 32,439 organic rows, 5,749 dealer domains, $5.24.** Plus a bounded page-fetch pass over 493 wave-1 domains (`serp_page_verify.py`): 406 fetched, **285 pages carrying a page-verbatim declaration**, and brands-per-page of 2.17 mean / 24 max against 0.35 from the SERP snippet — a 6.2× lift.

Contributed: **seated 1,046 · ranked-out 2,555 · small-shops 1,526.**

## 3. How deep we went

Four query axes (brand × variant national, brand × state, line-card × category national, line-card × category × state) run against a retry ladder for DataForSEO's `40101` depth error. Waves 2 and 3 added explicit controls, and the axis rule had to be corrected **twice**:

- §5b (wave 1, small sample): state-scope the line-card phrase. **Wrong at scale.**
- §5g (wave 2): national brand-agnostic beats geographic 4–5×. **Confounded — it was mostly ladder depth.**
- §5k (wave 3, with controls): **pull the ladder deep first, then prefer the national axis.** Depth is worth 1.87–2.17×, axis 1.24–1.44×. Geographic-deep beats national-standard outright.

Stop reason: **not saturation.** At 1,150 cumulative queries the rate is still ~5.3 net-new domains/query with no downward trend. §5h retired volume as a justification — 25,332 DFS companies were already in hand — so wave 4 was cancelled on economics, not on yield.

## 4. What's left on the table

**Unbounded, and cheap: ~5 domains per query, ~$0.007 each.** A wave 4 would still return roughly 2,000 domains for about $3. What it would *not* return is qualification capacity.

Two things temper that. Raw precision on wave 3 measured **56% across the whole population and 96% restricted to rank ≥30** (§5m) — 81.8% of wave-3 domains sit below the cut, so the *ranking*, not the classifier, is what keeps aggregators out. And 26% of wave-3 spend went on failed ladder rungs; tune the opening rung before any future wave.

## 5. Registry row

| serp | DONE-DEEP | 32,439 | 1,046 | 2026-08-01 | ~2,000 domains/wave at ~$3, uncapped | serp/ |
