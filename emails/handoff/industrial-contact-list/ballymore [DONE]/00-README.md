# ballymore — Ballymore dealer locator (Storemapper JSONP)

> STATUS (2026-08-03): DONE — the only source in the whole inventory that publishes a dealer email on 99.7% of records, and chain-dominated all the same.

Prompts in this folder: `01-prompt.md` — reopen check: refresh, decode the two category tag ids if the legend ever appears, keep Cohort-E isolation.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E1 + **§7.2 (GATE-L6, manufacturer-published emails)**](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §7 risk-1](../../strategy/01-build-plan.md) · [`research/05-widget-sweep.md`](../../../research/05-widget-sweep.md)

## 1. What it is

`GET https://www.storemapper.co/api/users/28644-.../stores.js?callback=...` — Storemapper JSONP, unauthenticated, whole network in one call. Per record: company, a single combined address string, phone, **email**, website, lat/lng, `tier_raw`, and category tags.

Two things to carry into any re-run. **The address is one combined string**; `address_1`/`city`/`state`/`zip_raw` are a best-effort split and `address_raw` is authoritative. And the **category tag ids (22459 / 22458) are undecoded** — no label is published on the page or in the payload, so they are captured verbatim and left unmapped per §3.

Compliance: one public endpoint, one origin request. `emails/scripts/sources/ballymore.py`.

## 2. What we pulled

**1,250 raw records @ 2026-08-01**, of which **1,183 US → 117 distinct companies.** Website 75.3% · phone 100% · **email 99.7% — the highest email fill anywhere in the inventory.**

Contributed: **seated 31 · ranked-out 18 · small-shops 3** (plus 23 in Segment W).

## 3. How deep we went

Exhaustive in one request. Like Lovejoy, the raw count flatters it: 1,183 US records to 117 companies. E1 called this in advance and it held.

The email fill is the reason this source matters beyond its 31 seated rows — it is a GATE-L6 cohort source, and **those addresses ship in their own micro-campaign cohort, never blended into the main list** (§7.2, non-negotiable on deliverability grounds: their bounce and complaint rates are unmeasured against a 2% kill line).

## 4. What's left on the table

Nothing to fetch. One open decoding job, cheap and optional: the two category tag ids have never been resolved to labels. If Ballymore ever publishes the legend, decode it before re-seating — the standing rule from Timken and Yaskawa is that an unread source-native code is where wrong-vertical records hide.

## 5. Registry row

| ballymore | DONE | 1,250 | 31 | 2026-08-01 | nothing — one undecoded category legend | ballymore/ |
