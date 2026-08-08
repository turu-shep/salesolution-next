# mknorthamerica — mk North America "Sales & Support Near You" (a rep finder, not a distributor network)

> STATUS (2026-08-03): DONE-THIN — 76 records collapse to 4 companies, 3 of them non-mk, 0 seated. Wrong shape of source, exhaustively confirmed.

Prompts in this folder: `01-prompt.md` — closed-source check: confirm the source shape has not changed, then stop.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` wave 3, "The other four"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`https://www.mknorthamerica.com/sales-and-support/` — an ASP.NET rep finder, no auth. One GET per (product category × ZIP), territory=USA. **It returns exactly one nearest rep per ZIP**, which is the structural reason the record count and the company count diverge so hard.

Its category code (1 = Conveyor Systems, 22 = Extruded Aluminum Framing) **does not sort**: all 76 records list both products, so unlike Yaskawa's this code carries no discriminating information. **Measured absence of a vertical code** — the consequential split here is *employer*, captured raw in `rep_company_raw` / `rep_title_raw`.

Compliance: public pages, `_polite.py` pacing, **0 origin requests on the recorded run** (full cache replay). `emails/scripts/sources/mknorthamerica.py`.

## 2. What we pulled

**76 raw records @ 2026-08-01** over a 46-ZIP × 2-category grid → **4 distinct companies, of which 3 are not mk itself**: Blettner Engineering (Indianapolis IN), M6 Revolutions (Trout Lake WA), NAMPRO Inc (Bloomfield). The remaining 58 records are **8 mk employees**. Website 5.3% · phone 86.8% · email 100%.

Contributed: **seated 0 · ranked-out 0 · small-shops 1** (plus 2 in Segment W). **Net contribution to the send list: zero.**

## 3. How deep we went

Exhaustive against the grid — 46 ZIPs × 2 categories, and the grid saturated at 4 companies because the form is designed to return one rep, not a list.

## 4. What's left on the table

**Thin because the source is the wrong shape, not because we stopped early.** `research/06` called mk "manufacturer's reps, not distributors"; this pull confirmed and quantified it — 3 independent companies exist behind 76 records. A denser ZIP grid returns the same 8 mk employees more times.

**Do not revisit.** That is the acquisition log's own verdict and nothing since has changed it.

## 5. Registry row

| mknorthamerica | DONE-THIN | 76 | 0 | 2026-08-01 | nothing — 3 real companies, do not revisit | mknorthamerica/ |
