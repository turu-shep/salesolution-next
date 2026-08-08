# banjo — Banjo Corp distributor locator (storelocatorwidgets JSONP)

> STATUS (2026-08-03): DONE — whole network in one cached call, and it ships an explicit agricultural-vs-industrial filter that must not be averaged over.

Prompts in this folder: `01-prompt.md` — reopen check: refresh, and read `filters_raw` before seating anything.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 1 + §3a E1 (Banjo is one of only two widget hits in 64 brands)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i (the vertical-code rule)](../../strategy/01-build-plan.md) · [`research/05-widget-sweep.md`](../../../research/05-widget-sweep.md)

## 1. What it is

`GET https://cdn.storelocatorwidgets.com/json/031d52ed...` — storelocatorwidgets JSONP, unauthenticated, whole network in one call. Per record: company, combined address, phone, fax, email, website, and **`filters_raw`** — an explicit **Agricultural vs Industrial** split.

That filter is this source's §5e code: an off-ICP vertical the locator publishes about itself. Captured verbatim, never averaged over.

Compliance: one public CDN endpoint; **0 origin requests on the recorded run** — it replayed entirely from cache. `emails/scripts/sources/banjo.py`.

## 2. What we pulled

**437 raw records @ 2026-08-01**, of which **334 US → 133 distinct companies.** Website 93.4% · phone 100% · email 69.8%.

Contributed: **seated 20 · ranked-out 18 · small-shops 5** (plus 4 in Segment W).

## 3. How deep we went

Complete in one call. Banjo is agricultural-leaning by nature (poly fittings and valves), so the industrial slice is a minority of the network — which the `filters_raw` code states outright rather than leaving us to guess from names. Of 64 brands swept in E1, Banjo and Timken were the only two widget hits; **they are one-offs, not a pattern**, and that finding killed the widget-sweep hypothesis.

## 4. What's left on the table

Nothing.

## 5. Registry row

| banjo | DONE | 437 | 20 | 2026-08-01 | nothing — complete, ag-leaning network | banjo/ |
