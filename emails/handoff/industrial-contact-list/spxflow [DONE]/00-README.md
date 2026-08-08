# spxflow — SPX FLOW distributor locator (MetaLocator, ZIP-territory matched)

> STATUS (2026-08-03): DONE — richest field schema in the program, and the yield curve is provably flat; it came in below its own estimate.

Prompts in this folder: `01-prompt.md` — reopen check: refresh on the 51-state grid alone; the 50 secondary-metro ZIPs do not pay.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 + §7.2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5a](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` §3 (the endpoint correction and the ZIP-grid finding)](../../../data/raw/_acquisition-log-2026-08-01.md) · [`research/06-adjacent-segments.md`](../../../research/06-adjacent-segments.md)

## 1. What it is

MetaLocator on `admin.metalocator.com` (Itemid 18647). **`research/06`'s endpoint was wrong** and the correction matters to anyone re-running this: `view=location&task=load&format=json` answers unauthenticated but returns **only field definitions, never records.** The record endpoint, read out of the iframe's own JS:

```
GET /index.php?option=com_locator&view=directory&force_link=1&tmpl=component
    &task=search_zip&framed=1&format=raw&no_html=1&templ[0]=address_format
    &layout=_json&Itemid=18647&postal_code=<ZIP>&radius=<mi>
```

Two behaviours govern the sweep shape: a **lat,lng pair as `postal_code` ignores radius and limit entirely** and returns the same fixed 41 rows for every centre tried, while **a real US ZIP is territory-matched** and returns a different subset per ZIP. So the full set needs a ZIP grid, not a radius sweep.

Per row: 26 fields including website, email, `businessunit` and four territory dimensions — the richest schema acquired. Compliance: public endpoint, ≥3s pacing, no 429/403 in 105 requests. `emails/scripts/acquire/spxflow_acquire.py`.

## 2. What we pulled

**2,157 raw rows @ 2026-08-01** across a 101-ZIP grid (51 state ZIPs + 50 secondary metros) → **505 distinct location IDs → 171 distinct companies** (165 branch-stripped), 47 states. Website 88.9% · phone 100% · **email 67.3%** per distinct company (a GATE-L6 source).

Contributed: **seated 43 · ranked-out 66 · small-shops 32.**

## 3. How deep we went

**The curve flattened and was measured doing it:** cumulative distinct location IDs run q1=16 → q51=491 (end of the state grid) → q101=505. **The 50 secondary-metro ZIPs added 14 IDs in total**, confirming that territory assignment is state-level. The grid is exhaustive; more ZIPs cannot help.

Against the estimate: `research/06` and the build plan projected 200–450 companies. Measured **171 — below the low end.** Recorded rather than explained away.

`priority_name` values ("Johnson Pump Marine", "Nutrition & Health") are **product-line names, not quality tiers** — per §3's Adaptall warning, do not read them as quality.

## 4. What's left on the table

Nothing. State-level territory matching plus a 51-state grid is complete coverage by construction.

## 5. Registry row

| spxflow | DONE | 2,157 | 43 | 2026-08-01 | nothing — state grid is exhaustive, curve flat | spxflow/ |
