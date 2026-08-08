# lovejoy — Lovejoy couplings distributor & sales-rep search (Agile Store Locator)

> STATUS (2026-08-03): DONE — 1,147 US records that collapse to 84 companies; chain-dominated exactly as the widget sweep predicted, and it overlaps Timken heavily.

Prompts in this folder: `01-prompt.md` — reopen check: one-request refresh; report distinct companies, never raw rows.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E1 — "raw record counts flatter this sweep; the company count is the truth"](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §7 risk-1](../../strategy/01-build-plan.md) · [`research/05-widget-sweep.md`](../../../research/05-widget-sweep.md)

## 1. What it is

`GET https://www.lovejoy-inc.com/wp-admin/admin-ajax.php?action=asl_load_stores&load_all=1&layout=1` — the Agile Store Locator plugin's bulk-load action, unauthenticated, **no nonce**, whole network in one call. Per record: company, address, phone, fax, email, website, lat/lng, `categories_raw`, `brand_raw`.

Compliance: one public endpoint, one origin request. `emails/scripts/sources/lovejoy.py`.

## 2. What we pulled

**1,553 raw records @ 2026-08-01**, of which **1,147 US → 84 distinct companies.** Website 93.7% · phone 99.8% · email 3.6%.

Contributed: **seated 35 · ranked-out 12 · small-shops 0** (plus 5 in Segment W).

## 3. How deep we went

Exhaustive in one request. The depth question here is the collapse ratio — 1,147 US records to 84 companies is 13.7:1, the second-worst in the program after SPX FLOW — and it is not a dedupe defect. E1 measured it in advance: **Lovejoy and Ballymore are chain-dominated and overlap Timken heavily**, which is why the widget sweep's honest yield was 150–250 net-new companies against ~2,830 raw records. This source is most of the reason that gap exists.

## 4. What's left on the table

Nothing. The bulk action returns everything, and what it returns is mostly branches of companies we already hold.

## 5. Registry row

| lovejoy | DONE | 1,553 | 35 | 2026-08-01 | nothing — chain-dominated, overlaps Timken | lovejoy/ |
