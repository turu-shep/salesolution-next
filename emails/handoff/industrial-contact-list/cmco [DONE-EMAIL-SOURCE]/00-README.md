# cmco — Columbus McKinnon: fails on domains, pays on emails and authorization stamps

> STATUS (2026-08-04): **DONE-EMAIL-SOURCE.** Both locators swept complete
> (61 metros × 2 × half-stepped radii). **It fails the §5a website test
> decisively — 12.2%, against the 67.6% benchmark — and that is not the point.**
> It returns **212 email-reachable, non-chain, not-yet-seated companies, 113 of
> them carrying an authorization tier or a certification**, plus a per-record
> line card averaging 3.5 brands (§5b's own benchmark is 2.17). This is a
> **GATE-L6 source**, not a domain source.
> **No gates open here.** robots is clean (no matching rule); the build gate
> R-L2 was signed by Artur 2026-08-04. The gate that governs *sending* to these
> addresses is GATE-L6, already decided, with a mandatory safeguard — see §4.

Prompts in this folder: `01-prompt.md` — reopen check plus the two open
questions (the `preferred` anomaly and the second locator's overlap).

Prerequisite reading, in order:
[`01-build-plan.md` **§5a** (the website criterion), §5b (line-card depth — this source beats the benchmark), **§5h** (a wave must add a signal we do not have)](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` **§7.2 GATE-L6** (manufacturer-published dealer emails — the decision that makes this source usable, and its non-negotiable safeguard), §7.1](../../strategy/00-sourcing-strategy.md) ·
[`linecard-locators [BUILT]/02-probe-log-2026-08-03.md` §4 and §6](../linecard-locators%20%5BBUILT%5D/02-probe-log-2026-08-03.md) — where this source came from and what the probe measured before the build

## 1. What it is

Columbus McKinnon (Budgit, CM, Coffing, Yale, Shaw-Box, Magnetek, Duff-Norton,
Dorner and 11 more brands) runs **two** public locators, and they are separate
networks with separate routes:

| Locator | Route | Required inputs | Rows returned |
|---|---|---|---|
| `how-to-buy` | `/en-us/how-to-buy/results` | location, brand | 2,340 |
| `service-repair-centers` | `/en-us/service-repair-centers/results` | location, product | 564 |

**Neither needs a browser.** The pages mount React, but the mount div declares
same-host server routes and `submitSearch` in the site's own bundle sends
exactly `lat, lng, distance, product, brand, units, country, onlyCountry,
state, onlyState`. `brand=""` is accepted — the "required" is UI-level only.
The 2026-08-03 probe filed this as "JS-rendered, route to E4"; **that was
wrong, and reading the bundle corrected it for one GET.**

**Access posture:** `www.cmco.com/robots.txt` publishes no rule matching either
locator route — allowed, no override involved. No login, no CAPTCHA, no 403 in
183 origin requests.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **2,904** locations (how-to-buy 2,340 · service-repair 564) |
| Unique domains | **28** (the whole point of §3) |
| Distinct companies | **400** (386 non-chain) |
| Seated (`seated-v7`) | 0 — nothing folded in; 18 of the 400 are already seated from other sources |
| Routed to pools | nothing yet |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/cmco.py` |
| Raw artifacts | `emails/data/raw/cmco-2026-08-04.json` · cache `data/raw/_cache/cmco/` |

Provenance 100% filled: `source`, `source_url`, `captured` on every record.

**Fill, measured:** website **12.2%** · phone 97.8% · **email 75.0%** ·
street 100%.

## 3. How deep we went

**61 metro centers × 150-mile circles × both locators**, half-stepping the
radius 150→75→25 wherever a query returned exactly 50 rows — because **50 is a
measured page cap**, not a coincidence, and a locator that returns a round
number is clipping. Dedupe on (company, street, city). 183 origin requests,
≥3s apart, all cached, zero 403s, zero 429s.

**⚠ A shared-infrastructure gap, and it is the second half of a fix somebody
else already started today.** On 2026-08-03 `_polite.Fetcher` was corrected so
a **deterministic 4xx** raises `Blocked` on the first attempt instead of
laddering — the Continental `400` case, written up in that day's log. **The
same argument applies to 5xx and was not extended to it**, so the ladder still
retries them 15/30/60/120/120s.

Both sources built in this lane produced deterministic 5xx: this host answers
**500** to a malformed query (five origin hits, ~6 minutes, the overage in
probe log §4a), and Samson answers **500** for place strings it cannot
geocode ("Fargo"), which killed an extension pass outright.

`cmco.py` and `samsonrope.py` therefore fetch **single-attempt**: 4xx/5xx
recorded, sweep continues, 403 still stops the source dead. **`_polite.py` was
deliberately not patched** — three other sessions were running against it at
the time, and changing shared pacing code underneath live sweeps is a worse
failure than the bug. The suggested change, for whoever owns it next: treat a
5xx that repeats identically as deterministic, or cap the ladder at one retry
for 5xx.

**What is NOT swept:** the two locators' `filters` routes expose 19 brands and
8 product categories; the sweep used `brand=""` and `product=""` because each
record carries its own brand list. If a brand-scoped sweep would return rows
the geographic sweep missed, that is unmeasured.

## 4. What's left on the table

**As a domain source: nothing, and it fails.** 28 distinct domains, **16
net-new** against `deduped-v7`, chain rows **65.5%** of the pull. Judged on
§5a it is a clear skip and §5l's warning applies — we hold 13,719 ranked-out
companies already.

**As a GATE-L6 email source it is the strongest thing this lane produced:**

| | Count |
|---|---|
| Non-chain companies | 386 |
| …with a dealer email | 229 |
| …**email-reachable, non-chain, not already seated** | **212** |
| …of those, also carrying a tier or certification | **113** |
| …carrying a per-record line card (`brand`) | 237 (61%), mean **3.5 brands**, max 14 |

§7.2 decided these are **send-eligible after verification**, and its safeguard
is non-negotiable: **their own micro-campaign cohort, never blended**, bounce
and reply reported separately from day one. Two filters from the same section
apply and are not yet applied here: prefer role addresses (`info@`, `sales@`)
where both exist — **most of these are named individuals** — and keep using
these addresses for their other job, recovering domains for Segment W.

**The copy asset is the reason to bother.** A record reads: CM **Platinum**
distributor · **U.S. Hoist Technician Certified, Rigging Weld Station** ·
carries Budgit, Chester, CM, Coffing, Yale. That writes §5h's email without a
join — *"You're a CM Platinum rigging center and you don't come up for hoist
repair in Kansas City."* No other source in the program carries a tier, a
certification and a line card on the same record.

**Two honest caveats on that signal:**

1. **The tier is sparse.** `distributorLevel` is null on 78.6% of rows and
   `certifications` on 90%; per company it is better (145 and 170 of 386), but
   this is a signal for a third of the pull, not for all of it.
2. **`preferred` is anomalous and uninterpreted.** It is `True` on 2,344 of
   2,904 rows (80.7%), which is not what "preferred" ought to mean. Captured
   verbatim, not mapped, not used. Per §5i, do not seat on it until it is
   shown to sort.

**Unmeasured:** 107 companies appear in *both* locators; whether
`service-repair` is a subset, an overlap or a distinct network is not settled.

## 5. Registry row

| cmco | DONE-EMAIL-SOURCE | 2,904 | 0 | 2026-08-04 | 212 email-reachable non-chain unseated companies (113 with tier/cert) — GATE-L6 cohort work, not domains; 16 net-new domains only | `cmco [DONE-EMAIL-SOURCE]/` |
