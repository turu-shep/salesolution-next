# interroll — Rolling On Interroll (ROI) global partner network, USA

> STATUS (2026-08-03): DONE-THIN — 14 US partners is the published network; thin source, complete pull, best fill in its wave.

Prompts in this folder: `01-prompt.md` — reopen check: a 13-request refresh, watching the `solutions_raw` split bug.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 (one of the six easy-tier adjacent-segment brands)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i, §5m (the latent `split()` bug that would have destroyed `solutions_raw`)](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` wave 3, "The other four"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`https://www.rollingoninterroll.com/en/global-partner-network/explore/north-am/u-s-a.html` — static Joomla HTML. Two index pages plus one detail page per partner. No JS, no anti-bot.

Source-native codes, both captured verbatim and left unmapped: `partner_tier_token` (**partner 10 · accelerator 4**, published only as `/images/approved-logos/approved-*.png`) and **`solutions_raw[]`**, a per-partner Interroll technology list. `solutions_raw` is a **line card, not brands** — it routes to `line_card[]` with `brand_authorized[] = ['Interroll']`, or S3 reads a single-brand partner as a multi-brand distributor.

**Measured absence of a vertical code:** Interroll's locator exposes no market split, so the §5e Timken failure mode cannot occur here. Recorded as measured, not assumed.

Compliance: public pages, `_polite.py` pacing, 13 origin requests, zero refusals. `emails/scripts/sources/interroll.py`.

## 2. What we pulled

**14 raw records @ 2026-08-01**, all US → **14 distinct companies.** **Website 100% and phone 100%** — the best fill in wave 3.

Contributed: **seated 4 · ranked-out 4 · small-shops 5.**

## 3. How deep we went

Complete: two index pages enumerate the US country page, and every partner's detail page was read.

## 4. What's left on the table

**Thin because the source is small.** `research/06` measured 13 US partners; we measured 14. Two independent reads of the same published network, one apart. There is no hidden facet, no pagination and no radius — the US page is the list.

The wave's honest note applies here: Interroll, FlexLink and mk together contributed 23 companies for 121 requests, against `research/06`'s "under ten requests for ~50 companies". The estimate was optimistic on both counts.

## 5. Registry row

| interroll | DONE-THIN | 14 | 4 | 2026-08-01 | nothing — 14 is the published US network | interroll/ |
