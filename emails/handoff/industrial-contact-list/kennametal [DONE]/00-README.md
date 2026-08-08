# kennametal — Kennametal find-a-distributor (the official export endpoint)

> STATUS (2026-08-03): DONE — one GET against the same endpoint the site's own "Export the List" button reads.

Prompts in this folder: `01-prompt.md` — reopen check: one-request refresh against the official export endpoint.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 1 + §7 (compliance posture)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

`GET https://www.kennametal.com/ws/v2/kmt/find-distributors?county=&stateOrProvince=&country=US` — the endpoint behind the locator's **official "Export the List" button**; the CSV that button produces is generated client-side from this exact payload. Per record: company, address, ZIP, phone, email, website, lat/lng.

**Terms check, run and recorded:** Kennametal's linked T&C page is *General Terms and Conditions of Sale* — no site-use, crawling or data-reuse clause, and no other terms page is linked from the locator. robots.txt blocks named SEO crawlers only, which is not an automatic exclusion under the 2026-08-01 override in any case.

Compliance: one public endpoint, one origin request. `emails/scripts/sources/kennametal.py`.

## 2. What we pulled

**387 raw records @ 2026-08-01**, all US → **112 distinct companies.** Website 97.9% · phone 99.7% · email 73.9%.

Contributed: **seated 23 · ranked-out 27 · small-shops 8** (plus 5 in Segment W).

## 3. How deep we went

Complete — the export endpoint returns the national list in one call, and there is no grid or pagination to go deeper into. Metalworking/tooling distributors sit slightly off the Segment A/B centre, which is why more of this source landed in `ranked-out` than seated.

## 4. What's left on the table

Nothing.

## 5. Registry row

| kennametal | DONE | 387 | 23 | 2026-08-01 | nothing — official export endpoint, complete | kennametal/ |
