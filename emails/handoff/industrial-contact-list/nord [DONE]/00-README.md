# nord — NORD Drivesystems location finder

> STATUS (2026-08-03): DONE — whole global network in one GET; the US slice seated well and the source also planted 34 manufacturer inboxes that nearly shipped.

Prompts in this folder: `01-prompt.md` — reopen check: refresh the one-request payload, or decode a newly published tier/vertical code.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 (NORD listed "next up but unbuilt") + §7.2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i, §5t, §5u (D1 — the `info.us@nord.com` fix)](../../strategy/01-build-plan.md) · [`research/06-adjacent-segments.md`](../../../research/06-adjacent-segments.md)

## 1. What it is

`GET https://shop.nord.com/stores/finder/locations?country=US&lang=en` — the endpoint the locator page's own `$.buildUrl('/stores/finder/locations')` calls. One unauthenticated request returns **the whole global network inline**; the US selector is `mainAddress.countryId == 184` (measured — NORD ships no country name). Per record: company, address, phone, fax, email, website, contact person, type legend.

Compliance: one public endpoint, one origin request, no auth, no bot wall. `emails/scripts/sources/nord.py`.

## 2. What we pulled

**1,450 raw records @ 2026-08-01**, of which **554 US → 272 distinct US companies.** Fill: website 81.8% · phone 99.6% · **email 72.6%** (a GATE-L6 manufacturer-published-email source).

Contributed: **seated 81 · ranked-out 29 · small-shops 10** (plus 17 in Segment W).

## 3. How deep we went

Exhaustive in a single request — there is no grid, radius or pagination. `research/06` estimated ~500 NA distributors; measured 554 US records / 272 companies, which lands inside it.

## 4. What's left on the table

Nothing on the endpoint.

One defect this source caused is worth remembering rather than reopening: **NORD publishes its own corporate inbox (`info.us@nord.com`) for dealers that have none, and 34 seated rows inherited it as the prospect's email** — six of them inside the first-send cohort. All 50 manufacturer-inbox rows across all sources were voided in §5u. Any re-pull must re-apply the rule: an email whose domain is a known manufacturer domain and does not match the company's own domain is invalid.

## 5. Registry row

| nord | DONE | 1,450 | 81 | 2026-08-01 | nothing — whole network in one payload | nord/ |
