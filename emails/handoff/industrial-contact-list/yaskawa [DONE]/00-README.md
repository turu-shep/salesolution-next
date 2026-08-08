# yaskawa — Yaskawa America drives distributor locator

> STATUS (2026-08-03): DONE — 232 companies, none with a website, and the third independent proof that manufacturer locators encode vertical in their own codes.

Prompts in this folder: `01-prompt.md` — reopen check: refresh only, and never re-seat without reading `product_group_code`.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 (listed "next up but unbuilt")](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i — read this one in full — then §5m](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` wave 3, "§5e: Yaskawa's product-group code IS a vertical code"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

A Liferay-hosted distributor search. `groupList` is a **required** filter with five source-native values, each labelled in the form's own `<select>`. Coverage is a 46-ZIP national grid at 200 miles — a state-only search is rejected client-side, so `zipCode` + `proximityType` is the only clean axis.

Two parameter traps, each of which would have returned a plausible-looking empty pull rather than an error: the `<select>` is named `groupSelect` but the page's JS submits **`groupList`**, and the dealer-tier badge filename sits **mid-path** in a Liferay URL (`/documents/20184/12766826/premier-icon.gif/<uuid>`), so a naive `rsplit('/')` captures the UUID and silently destroys the code.

Compliance: public pages, `_polite.py` pacing, every response cached, **no 429 and no backoff needed across 235 origin requests.** `emails/scripts/sources/yaskawa.py`.

## 2. What we pulled

**1,248 raw records @ 2026-08-01** → **232 distinct US companies.** Phone 98.6%. **Website 0.0% and email 0.0% — Yaskawa publishes neither.**

Contributed: **seated 42 · ranked-out 8 · small-shops 0** (plus **95 in Segment W** — the second-largest W contributor after DFS, entirely because there is no website field to read).

## 3. How deep we went

All five product groups swept, every record carrying its code *and* its label:

| Code | Label | Records | Distinct US companies |
|---|---|---|---|
| D09 | Industrial AC Drives | 583 | 139 |
| D13 | HVAC Drives | 264 | 62 |
| D23 | iQpump (water/wastewater) | 201 | 19 |
| D02 | Servo and Motion Controllers | 200 | 42 |
| D33 | Medium Voltage Drives | **0** | 0 |

**The code sorts hard: 151 companies are reachable only through the industrial groups, 69 (29.7%) only through D13/D23, and 12 carry both.** The off-ICP-only cohort reads exactly as its code says — Air Carolinas, Air Treatment, Building Controls & Services — HVAC and building-controls wholesalers whose *names* look like industrial distributors. A second signal corroborates it in the badge tokens (`hvac-logo`, `iq-icon2`). §5m reproduced the 29.7% independently.

**D33 returning zero is a finding, not a parse failure:** all 46 queries returned HTTP 200, echoed `Group: Medium Voltage Drives`, and served a Yaskawa outside-sales rep with zero distributor cards. Medium-voltage drives are sold factory-direct; there is no channel to harvest.

## 4. What's left on the table

Nothing to fetch — the grid plus the five groups is the whole surface.

The residue is downstream: **232 companies with a phone and an address but no domain.** 95 sit in Segment W. Recovering them is identity-resolution work — see `no-domain-backlog/`.

## 5. Registry row

| yaskawa | DONE | 1,248 | 42 | 2026-08-01 | nothing to fetch; 95 W rows need domain resolution | yaskawa/ |
