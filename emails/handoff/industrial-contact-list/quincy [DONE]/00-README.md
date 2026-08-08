# quincy — Quincy Compressor sales & service locator (WP `admin-ajax` over a Bullseye backend)

> STATUS (2026-08-03): DONE — 111 records is the server's own US total; the highest seated-per-record ratio of any locator in the program.

Prompts in this folder: `01-prompt.md` — reopen check: a 54-request refresh, and never call the Bullseye endpoint directly.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 1 (easy tier) + §7.1 (the credential line)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

`POST https://www.quincycompressor.com/wp-admin/admin-ajax.php` with `action=fx_get_locations` — a country pass followed by a 52-state sweep, because **the country response caps at 50 rows**. Per record: company, address, phone, email, contact name, website, lat/lng.

**The compliance detail that matters here.** Quincy's server proxies Bullseye, and the echoed upstream URL carries **Quincy's own ApiKey**. It is redacted in our output and **`ws.bullseyelocations.com` was never called directly** — using someone else's key against their vendor is the Enerpac-credentials line, not a shortcut. Same rule, different vendor.

Compliance otherwise: public endpoint, `_polite.py` pacing, 54 origin requests, no 429/403. `emails/scripts/sources/quincy.py`.

## 2. What we pulled

**111 raw records @ 2026-08-01**, all US → **109 distinct companies.** Website 66.7% · phone 98.2% · email 98.2%. The server's own `total_results` for the US is **111** — so the pull is provably complete, not merely exhausted.

Contributed: **seated 27 · ranked-out 9 · small-shops 2** (plus 11 in Segment W).

## 3. How deep we went

Complete against the server's stated total. 27 of 109 companies seated is the best conversion rate of any locator here — compressor distributors are close to the ICP centre and the source carries almost no chains.

No vertical code exists: Quincy is compressors only, and `IsLeadManager` is a routing flag, not a quality tier (left unmapped per §3).

## 4. What's left on the table

Nothing. The server told us the total and we hold all of it.

## 5. Registry row

| quincy | DONE | 111 | 27 | 2026-08-01 | nothing — matches the server's own US total | quincy/ |
