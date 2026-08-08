# flexlink — FlexLink partner list (Drupal facet-filtered)

> STATUS (2026-08-03): DONE-THIN — 6 US partners out of 83 worldwide; the network is European and the US slice is complete.

Prompts in this folder: `01-prompt.md` — reopen check: an 8-request refresh; the SharePoint partner portal stays untouched.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` wave 3, "The other four"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`GET https://partners.flexlink.com/en/partners_list?field_ptn_country_target_id=85` — the US country facet on a Drupal partner list. One request for the slice, one per partner-level facet, one per partner detail page.

The **"Partner Level" column renders empty on every row**, so the level had to be recovered by re-running the US slice once per facet value: **AUTHORIZED PARTNER (49) = 1 · BUSINESS PARTNER (50) = 5.** That is §5e's lesson in miniature — the code was in the page, unreadable where you would look for it, and had to be recovered deliberately. Captured verbatim and left unmapped; per §3 it must not be read as a quality signal until validated.

**Measured absence of a vertical code:** the only facets are country and commercial partner level.

`partners.flexlink.com` links a SharePoint **Partner login — a credential wall, not attempted.**

Compliance: public pages, 8 origin requests, zero refusals. `emails/scripts/sources/flexlink.py`.

## 2. What we pulled

**6 raw records @ 2026-08-01**, all US → **6 distinct companies.** **Website, phone and email all 100%** (detail pages carry all three).

Contributed: **seated 1 · ranked-out 3 · small-shops 2.**

## 3. How deep we went

Complete. The country facet is a server-side filter over the whole partner table, so 6 of 83 is the answer, not a page-one truncation.

## 4. What's left on the table

**Thin because the source is small.** `research/06` said the list skews European and it does — 77 of 83 partners are outside the US. Nothing behind the facet is unreached; the only unreached surface is the SharePoint partner portal, which is a credential wall and stays untouched permanently.

## 5. Registry row

| flexlink | DONE-THIN | 6 | 1 | 2026-08-01 | nothing — 6 of 83 partners are US | flexlink/ |
