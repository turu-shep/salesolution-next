# ocenco — the whole authorized network is nine rows on one page

> STATUS (2026-08-04): **DONE-THIN.** Complete and closed. Ocenco publishes its
> entire authorized-distributor list inline on one static page: **11 rows
> worldwide, 5 US-market rows, 4 distinct US companies, 3 domains, 1 net-new.**
> Website 80%, email 82%. **Cost: zero additional requests** — the page was
> already cached by the candidate evidence pass, so the harvest was a parse.
> No gates. robots publishes no rule matching `/distributors/`.

Prompts in this folder: `01-prompt.md` — a reopen check only; there is nothing
left to harvest.

Prerequisite reading, in order:
[`linecard-locators [BUILT]/00-README.md` §3](../linecard-locators%20%5BBUILT%5D/00-README.md) — the 92-name skim that surfaced this candidate, and the measured precision of that method ·
[`01-build-plan.md` §5i (the small-locator tail — Interroll/FlexLink/mk are the shape this belongs to)](../../strategy/01-build-plan.md)

## 1. What it is

Ocenco makes emergency escape breathing devices (SCSR/EEBD) for mining, rail,
maritime and tunnelling. Its `/distributors/` page is **static HTML with the
complete list inline**, grouped under market headings — no query, no locator
widget, no JS.

It surfaced from the `linecard-locators` skim of United Central's 92-name
supplier roster, which is fitting: **United Central is itself one of the four
US companies on this list.**

**Access posture:** `www.ocenco.com/robots.txt` publishes no rule matching
`/distributors/` — allowed, no override involved. No login, no CAPTCHA.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **11** (the whole published network, worldwide) |
| Unique domains | 8 worldwide · **3 US** |
| Seated (`seated-v7`) | 0 |
| Routed to pools | nothing |
| Last pull | 2026-08-04 |
| Extractor | parsed inline from the cached page (see §3) |
| Raw artifacts | `emails/data/raw/ocenco-2026-08-04.json` · cache `data/raw/_cache/linecard-ocenco/` |

Provenance 100% filled: `source`, `source_url`, `captured` on every record.

**Fill:** website 90.9% · email 81.8% (worldwide rows); US-scoped, website 80%.

## 3. How deep we went

Completely, and in one parse. The candidate evidence pass had already fetched
and cached the page; the harvest read that copy. **Zero additional origin
requests** — worth stating, because it is the cheapest source in the pack and
the reason is simply that somebody checked the cache before fetching.

**The four US companies:** Carroll Technologies Group, Lee Supply, United
Central Industrial Supply, Five Star Safety Equipment. Only **one** is net-new
against `deduped-v7` — United Central is already in the pool (mis-seated; that
is `rollup-rosters`' correction, not this folder's), and the others are
partially known.

⚠ §5i source-native code, captured verbatim and uninterpreted: the market
heading each distributor sits under — `Maritime & Offshore Oil`,
`U.S.A. Mining Market`, `Canada Mining Market`, `Australia Mining Market`,
`Turkey Mining Market`, `U.S.A. Industrial & Tunneling Market`. It sorts
cleanly (no nulls) and it is the field that makes `is_us` a fact rather than
an inference. Carroll Technologies appears under two markets — one company,
two rows, deliberately not merged in the raw file.

## 4. What's left on the table

**Nothing.** This is the Interroll/FlexLink/mk North America shape from §5i: a
complete network that is simply small. 11 rows is not a sampling artifact and
no query exists that would return more.

The one thing it does contribute beyond a single net-new domain is a
**corroborating signal for the mining-supply segment**: four of the six market
headings are mining, and three of the four US companies are mining-supply
distributors — the same segment United Central's line card describes. If the
ICP ever gets a mining-supply sub-segment, this is a (very small) seed for it.

Reopen only if Ocenco republishes the page as a locator widget with a query
behind it. That is unlikely and nobody should schedule a check.

## 5. Registry row

| ocenco | DONE-THIN | 11 | 0 | 2026-08-04 | nothing — 11 rows is the complete published network; 1 net-new US domain | `ocenco [DONE-THIN]/` |
