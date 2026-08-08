# ntn — NTN Americas distributor locator (WP store-locator bulk action)

> STATUS (2026-08-03): DONE — one POST for the whole national list, and it ships the industrial-vs-automotive filter Timken made us learn to look for.

Prompts in this folder: `01-prompt.md` — reopen check: refresh the bulk call, or act if NTN starts publishing contact fields.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 1 (easy tier) + §5 (Segment B)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5e then §5i (the vertical-code rule)](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

`POST https://ntnamericas.com/wp-admin/admin-ajax.php` with `action=get_all_stores` — the WP store-locator plugin's bulk action, **no nonce required**, whole national list in one response. Per record: company, address, ZIP, website, lat/lng, store permalink, description, and **`categories_raw`** — an explicit industrial-vs-automotive filter with labels shipped decoded.

**NTN publishes neither phone nor email in this payload.**

Compliance: one public endpoint, one origin request. `emails/scripts/sources/ntn.py`.

## 2. What we pulled

**2,468 raw records @ 2026-08-01**, all US → 1,628 distinct company names. Website 89.5% · phone 0% · email 0%.

Contributed: **seated 44 · ranked-out 66 · small-shops 16** (plus 48 in Segment W).

## 3. How deep we went

Exhaustive — one bulk call, no grid. The interesting depth is `categories_raw`: this is the §5e code that Timken had and we failed to read, and here it arrives **pre-labelled**. The seated yield is small against 1,628 names for the same reason Timken's was: a bearings locator carries the automotive aftermarket alongside industrial MRO, and the pool is dominated by names like FleetPride.

## 4. What's left on the table

Nothing new to fetch. The unworked residue is inside what we already hold: 1,628 names with **no phone and no email**, so every one of them needs domain and NAP resolution before it can be mailed — the same bottleneck as the Yaskawa and SERP pools. That work belongs to `no-domain-backlog/`, not to a second NTN pull.

## 5. Registry row

| ntn | DONE | 2,468 | 44 | 2026-08-01 | nothing new to fetch; residue is NAP-resolution work | ntn/ |
