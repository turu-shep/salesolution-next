# ranked-out-backlog — 13,695 enriched companies held out by a rank cap, not by a judgement

> STATUS (2026-08-04): NOT-STARTED — **this is the largest company-count lever in the pack and it costs $0 and zero origin requests.** The seated list is cut at **rank position 3,000**, not at a quality score. 5,067 companies in `pool-ranked-out-v10` score ≥30 and 1,559 score 40–45, against a seated floor of 45. **8 companies scoring exactly 45 are ranked out while 99 companies scoring exactly 45 are seated** — separated by tie-break position alone.
> **GATE:HUMAN — raising the cut changes list membership.** Default if nobody answers: leave the cap at 3,000. Nothing here is deleted either way (culled ≠ deleted).

Prompts in this folder: `01-prompt.md` — measure the promotion curve honestly, then re-seat at an agreed threshold and prove conservation.

Prerequisite reading, in order: [`01-build-plan.md` **§5l** (the cut line is the weakest claim in the build), **§5n** (full-pool enrichment closed the selection bias), §5o (S4 complete)](../../strategy/01-build-plan.md) · [`00-sourcing-strategy.md` §8.1a (the revenue band), §9 P3 conflict — **"P3 caps sending, the pool builds freely; the list is inventory, not commitment"**](../../strategy/00-sourcing-strategy.md) · [`02-list-guide.md`](../../strategy/02-list-guide.md)

## 1. What it is

`data/side-pools/pool-ranked-out-v10.csv` — **13,695 companies, every one of them with a domain, every one of them already enriched.** They are not culled, not disqualified, and not low quality by any measured test. They are simply the rows that fell below **rank position 3,000**.

The mechanism is one line: `s4d-seat.mjs:84` reads `--cut 3000` (default), and `:382` does `ordered.slice(0, CUT)` / `ordered.slice(CUT)`. **The cut is positional. It is not a score threshold, and it never was.** 3,000 was chosen to land inside the pack's original 2,500–3,500 target, which was sized to a campaign need — not to a quality boundary discovered in the data.

§5l already named this the weakest claim in the build: *"companies never fetched cannot score on the strongest signals regardless of merit, so the shortlist is '3,500 companies we happened to look at that also scored well,' not 'the best 3,500.'"* §5n then closed the fetching half of that bias — **13,436 domains enriched to 100% coverage** — but the positional cap survived the correction untouched.

## 2. What we pulled

Nothing. This is a backlog of work already paid for, not a source.

| | |
|---|---|
| Rows | **13,695** |
| With a domain | **13,695 (100%)** |
| `ecommerce_class` filled | 99.8% — catalog_no_cart 4,942 · brochure 4,071 · unknown 2,812 · ecom_full 1,846 · empty 24 |
| `brand_count` filled | 100% (10,759 at zero, 2,936 at ≥1) |
| `rank_score` filled | 100% — min 0 · median 25 · p90 40 · max 45 |
| **Carrying an email already** | **4,850** (2,195 of them scoring ≥30) |
| Last write | 2026-08-04 (S4n); earlier S4d 2026-08-01, S4j/S4k/S4l retags and fold-in |

Measured 2026-08-04 against `pool-ranked-out-v10.csv` and `seated-v9.csv`.

## 3. How deep we went

The boundary was measured directly, and it has no natural break in it:

| `rank_score` | seated | ranked-out |
|---|---|---|
| 48 | 218 | 0 |
| 47 | 231 | 0 |
| 46 | 80 | 0 |
| **45** | **99** | **8** |
| 44 | 0 | 298 |
| 43 | 0 | 490 |
| 42 | 0 | 113 |
| 41 | 0 | 148 |
| 40 | 0 | 502 |

**The seated floor is 45 and the pool's ceiling is 45.** Eight companies at the exact seated floor sit in the pool, kept out by tie-break order. 298 more sit one point below. There is no cliff in the distribution at 45 — the cap simply landed there when the 3,000th row was reached.

**A note that stops a wrong reading.** §5l's "cut score of 30" is a **v1/v2-era number**, from before full-pool enrichment. §5n lifted the whole distribution, so today's positional cut lands at 45. Do not quote "the documented cut is 30" as though promoting everything ≥30 restores an old standard — it does not. The honest argument is the shape of the boundary above, not an appeal to a superseded constant.

## 4. What's left on the table

The promotion curve, measured, if the positional cap is replaced by a score threshold:

Re-measured 2026-08-04 against the **current** generation — `seated-v9` (2,773)
and `pool-ranked-out-v10` (13,695). The generation moved three times while this
file was being written (S4k, S4l's AD fold-in, S4n), so **always re-derive before
acting; do not quote this table blind.** The seated floor is 45 and the pool
ceiling is 45 in every generation so far.

| Threshold | Promoted from ranked-out | Resulting qualified pool | …already carrying an email |
|---|---|---|---|
| ≥ 40 | **+1,559** | ~4,332 | 622 |
| ≥ 35 | **+3,309** | ~6,082 | 1,719 |
| ≥ 30 | **+5,067** | ~7,840 | 2,195 |
| ≥ 25 | +6,957 | ~9,730 | 3,324 |

**S4l is precedent worth knowing about**: it already moved 39 AD-member rows up
across the cut on 2026-08-04. Promotion across this boundary is therefore not a
new idea — it has been done once, ad hoc, for one source. This workstream is the
same move made on a stated rule instead of a source-specific judgement.

**Cost: $0 and zero origin requests.** Every one of these companies is already acquired, already enriched, already domain-keyed. Compare against what a session spends to buy new ones: the whole E4 tier measured **~80–120 seatable companies**, the DFS generic tail costs ~$11 for the lowest-quality rows in the program, and SERP wave 4 costs ~$3 for raw domains at 56% precision.

**The counter-argument, stated so nobody has to rediscover it.** More seated rows is not more sends — §9's P3 decision already settled that (*"P3 caps sending, the pool builds freely"*), and the binding constraint on sending is deliverability and warmed domains, not list size. The 2,195 promoted rows carrying an email are **unverified**; sendability needs NeverBounce, which is a separate spend. And a lower bar means a lower mean quality — that is not a defect, it is the trade being made, and it should be made explicitly rather than by leaving a parameter at its default.

**The recommendation is ≥40 (+1,559) as the defensible floor**, because those rows are within five points of companies already seated and 622 of them already carry an email. Anything below that is a volume decision that should be made on volume grounds and labelled as one.

## 5. Registry row

| ranked-out-backlog | NOT-STARTED | 13,695 | 0 | 2026-08-04 | +1,559 at score ≥40 · +5,067 at ≥30 — $0, already enriched; GATE:HUMAN on the cut | ranked-out-backlog/ |
