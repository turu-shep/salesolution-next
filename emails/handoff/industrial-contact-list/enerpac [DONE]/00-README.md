# enerpac — Enerpac distributor locator (Oracle OSF `getFile` JSON)

> STATUS (2026-08-03): DONE — the richest fluid-power record in the program, and the source that exposed a robots.txt exclusion we had imposed on ourselves by mistake.

Prompts in this folder: `01-prompt.md` — reopen check: only if Enerpac republishes the locator; the Oracle credential wall stays untouched.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E3 and **§7.1 including the Enerpac correction**](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5a, §7 risk-1](../../strategy/01-build-plan.md) · [`research/05-widget-sweep.md`](../../../research/05-widget-sweep.md)

## 1. What it is

`GET https://www.enerpac.com/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json` — a public, unauthenticated Oracle Commerce Cloud storefront file. One request returns the whole global network. Per record: name, phone, URL, street/city/postal, lat/lng, `Tier` (4 levels), `Distributor Type` (Sales / Service / Rental / Regional) and **`Products Carried`** — a per-record line card, which is why this source ranks so high on evidence quality.

**The robots posture, stated precisely (§7.1).** `research/01` recorded Enerpac as robots-blocked and excluded it. That was our own misreading: robots.txt disallows `/ccstore**x**/custom/v1`, while the distributor data resolves through OSF `getFile` to `/ccstore/v1/files/...` — **a path robots.txt never disallowed.** Enerpac was accessible under the *old* policy all along. Artur's 2026-08-01 override ("I don't care about robots.txt") stands as forward policy and is recorded, but it was not what unlocked this source.

Separately and permanently: **Enerpac's page source leaks Oracle Integration Cloud service credentials. They were never used and never recorded.** Leaked credentials are unauthorized access to a system, categorically different from a crawl directive, and the robots override does not touch that line.

## 2. What we pulled

**1,475 raw records @ 2026-08-01** via `emails/scripts/sources/enerpac.mjs`, of which **433 are US** → **204 distinct US companies**, 131 single-location. Website 82.7% · phone 99.8% · **email 64% of US rows** (one of the six manufacturer-published-email sources under GATE-L6). Chains are essentially absent; the largest name is Hydradyne at 34.

Contributed: **seated 82 · ranked-out 58 · small-shops 18** (plus 1 in Segment W).

## 3. How deep we went

One request, whole network, nothing left behind. §7's risk-1 was tested on this source and downgraded: Timken + Enerpac union to 2,105 companies with **192 of Enerpac's 200 arriving net-new** — near-zero overlap, which is also the first evidence that killed the line-card-graph premise (§5a).

## 4. What's left on the table

Nothing. The payload is the complete network and it is on disk.

## 5. Registry row

| enerpac | DONE | 1,475 | 82 | 2026-08-01 | nothing — complete network in one payload | enerpac/ |
