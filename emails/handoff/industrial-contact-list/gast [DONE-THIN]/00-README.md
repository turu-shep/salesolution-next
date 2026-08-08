# gast — Gast Manufacturing (IDEX) find-a-distributor

> STATUS (2026-08-03): DONE-THIN — 21 US distributors is the entire network, verified against a control query. Thin source, not a thin pull.

Prompts in this folder: `01-prompt.md` — reopen check: a two-request refresh; 21 is the whole network.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 (Gast listed "next up but unbuilt", on the NTN/Quincy `admin-ajax` pattern)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`research/06-adjacent-segments.md`](../../../research/06-adjacent-segments.md)

## 1. What it is

`POST https://gastmfg.com/wp-admin/admin-ajax.php` with `action=load_distributors&country=US` — the whole US list as rendered HTML. The request contract was read out of the theme's own `distributor.js`, not guessed.

**Gast publishes no type, tier or category on the record.** The only facet is country — a measured absence, not an unread field.

Compliance: public endpoint, 2 origin requests. `emails/scripts/sources/gast.py`.

## 2. What we pulled

**21 raw records @ 2026-08-01**, all US → **21 distinct companies.** Phone 100% · email 47.6% · **website 0.0%** (Gast publishes none).

Contributed: **seated 8 · ranked-out 1 · small-shops 0** (plus 10 in Segment W — the whole reason so much of this source sits in W is the missing website field, not missing businesses).

## 3. How deep we went

One country call plus one control query. Exhaustive.

## 4. What's left on the table

**Thin because the source is small — and that was tested, not assumed.** `research/06` estimated 150–350 for this segment. Measured: 21. The control that settles it is recorded in the payload: **a Los-Angeles-ZIP query returns a strict subset of the same 21 records**, so the country call is not a truncated first page. There is no grid that would return more.

The one recoverable item is downstream: 21 companies with a phone and no domain. 10 of them are parked in Segment W awaiting identity resolution (`no-domain-backlog/`).

## 5. Registry row

| gast | DONE-THIN | 21 | 8 | 2026-08-01 | nothing — 21 is the complete US network | gast/ |
