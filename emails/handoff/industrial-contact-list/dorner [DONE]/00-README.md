# dorner — Dorner Conveyors distributor locator (inline `distributorPlaces` array)

> STATUS (2026-08-03): DONE — small, complete, and the best fill rates of any locator: 98% website, 97% email, four origin requests.

Prompts in this folder: `01-prompt.md` — reopen check: a four-request refresh, nothing more.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 + §7.2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5a (Dorner is the normalizer calibration case)](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` §2](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`GET https://www.dornerconveyors.com/distributors?country=United+States+of+America` — the entire US set arrives as a `distributorPlaces` JS array literal **inline in the HTML**. No JS execution, no API, no pagination. One further GET per `markets[]` facet value recovers per-record market assignment, which the base payload does not carry (53 Automation · 54 Food · 55 Material Handling · 56 General Industry · 57 Packaging).

Compliance: public page, 4 origin requests total, no throttling, no errors. `emails/scripts/acquire/dorner_acquire.py`.

## 2. What we pulled

**116 raw records @ 2026-08-01** → 98 distinct companies (75 branch-stripped), 85 single-location. **Website 98.3% · phone 99.1% · email 96.6%** (a GATE-L6 manufacturer-published-email source). `tier_raw`: Distributor 83 · Premium Distributor 23 · Manufacturer's Rep 5 · Authorized Integrator 1 · blank 4. Markets attached to 113 of 116.

Contributed: **seated 37 · ranked-out 20 · small-shops 8.**

## 3. How deep we went

Complete — the payload is the whole US network. **Matches `research/06` exactly** on record count and fill rates, which is why Dorner became the calibration case for the §2b branch-stripping decision: branch-stripping reproduces research's figures to within one company (75/56 vs 76/56), and that single test is what made the normalizer's behaviour an explicit decision rather than a default.

## 4. What's left on the table

Nothing. 116 records is the entire published US network, not a sample.

## 5. Registry row

| dorner | DONE | 116 | 37 | 2026-08-01 | nothing — 116 is the whole US network | dorner/ |
