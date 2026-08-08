# atlascopco — Atlas Copco Compressors authorized partners (static state-by-state page)

> STATUS (2026-08-03): DONE-THIN — and this is the one thin source where the honest answer is "we stopped early": the page we took is itself partial.

Prompts in this folder: `01-prompt.md` — reopen check: this static page is done; the real reopen is the E4 headless tier.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 1 (listed as "static HTML incl. website")](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i, §5u (D1 — Atlas Copco inboxes voided)](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

`GET https://www.atlascopco.com/en-us/compressors/contact-number/authorized-partners` — one static, server-rendered page of partner blocks under state headings. No JS, no API, no facets. Per record: company, state heading, phone, website.

**No type, tier or vertical facet exists on this page** (measured absence).

Compliance: one public page, one origin request. `emails/scripts/sources/atlascopco.py`.

## 2. What we pulled

**27 raw records @ 2026-08-01**, of which **23 US → 10 distinct companies.** Website 95.7% · phone 100% · email 0%.

Contributed: **seated 4 · ranked-out 3 · small-shops 2.**

## 3. How deep we went

One request. That is the whole of the pull, and it is the whole of that page.

## 4. What's left on the table

**Thin because we stopped early — not because Atlas Copco's network is 10 companies.** The correction is recorded in the payload itself: `research/01`'s "static state-by-state (~hundreds)" **overstates this page**, which renders *a partial set of state headings* and a few dozen partner blocks, several of them Caribbean and LatAm rather than US. A compressor manufacturer of this size does not have ten US authorized partners.

The real network is behind Atlas Copco's interactive locator, which is a rendered app — so the follow-up is **not** another GET against this URL. It belongs in the headless tier: see `e4-headless-locators/`, where it needs its own robots-posture GATE:HUMAN like every other locator there.

One defect to re-apply on any future pull: **Atlas Copco corporate inboxes reached seated rows** and were voided in §5u's D1 sweep, including via `atlascopcousa.com`, which the brand rule caught rather than the domain list.

## 5. Registry row

| atlascopco | DONE-THIN | 27 | 4 | 2026-08-01 | unknown, likely 100+ behind the rendered locator (E4) | atlascopco/ |
