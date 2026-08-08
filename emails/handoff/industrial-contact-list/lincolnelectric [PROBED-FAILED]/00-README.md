# lincolnelectric — source handoff

> **STATUS (2026-08-04):** PROBED-FAILED. Three metros swept to **provable
> exhaustion**, then a full stop. 271 records → **159 companies → 44 projected
> net-new domains nationally against a bar of 150**, on a payload where only
> **21.4% of records carry a website at all.** The endpoint publishes a
> five-column brand line card and every column is `false` on every one of 271
> rows. No national sweep was run and none is earned.
> **No gates.** `robots.txt` allows the data path under RFC 9309 longest-match,
> re-verified live in code before the first request. No override, nothing to
> sign.

Prompts in this folder: `01-prompt.md` — one bounded decision, not a sweep plan.
Five of the source's six tabs were never swept; the prompt says how much of that
to buy before reporting.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §2 (how the
longest-match verdict was reached — a naive prefix reader kills this source) ·
`../e4-headless-locators [*]/00-README.md` §3b (the tier verdict; **Finding 2**
is this source's, **Finding 3** is measured worst here) ·
[`01-build-plan.md` §5i (capture codes verbatim, then test that they sort), §5l (a name join is not a domain)](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §7.1 (obstacle ladder — Lincoln sits in none of its rows)](../../strategy/00-sourcing-strategy.md) ·
`../skf [*]/00-README.md` §3 and `../banner [*]/00-README.md` §3 — the same
constant-code failure, two sources earlier

## 1. What it is

Lincoln Electric (welding consumables and equipment) publishes its dealer network
through `mylincoln.lincolnelectric.com`, a **Salesforce Experience Cloud site
running Aura classic — not LWR.** That distinction is load-bearing, because
Walter Surface's `webruntime` bridge does not exist here and reusing Walter's
transport gets nothing. Counted in the cached shell: `aura` 134, `auraConfig` 15,
`fwuid` 3, `markup://` 184, `sfsites` 8, against `webruntime` **0**, `LWR.define`
**0**, `apexApiBasePath` **0**.

The shell is the generic `siteforce:communityApp` bootstrap and names no locator
component, so the wiring was read out of the site's own Aura bundles:

| Layer | What it resolves to |
|---|---|
| route | `"/store-locator"` → flexipage `StoreLocator__c`, `"is_public":"true"` |
| component | `c:myLincolnStoreLocator` |
| Apex | `@salesforce/apex/B2B_StoreLocatorController.callMethod` |
| call | `callMethod({method:"fetch", requestMap: buildRequestMap(lat,lng)})` |

**Access shape: one form-encoded POST per cell, plain `urllib`.**

```
POST /northamerica/s/sfsites/aura?r=<n>&aura.ApexAction.execute=1
Content-Type: application/x-www-form-urlencoded
message={"actions":[{"id":"<n>;a",
         "descriptor":"aura://ApexActionController/ACTION$execute",
         "callingDescriptor":"UNKNOWN",
         "params":{"namespace":"","classname":"B2B_StoreLocatorController",
                   "method":"callMethod",
                   "params":{"method":"fetch","requestMap":{…}},
                   "cacheable":false,"isContinuation":false}}]}
aura.context={"mode":"PROD","fwuid":"<from the page>", …}
aura.pageURI=/northamerica/s/store-locator?language=en_US
aura.token=null
```

**`aura.token` is the four-character literal `null`, not a secret.** The
anonymous page ships `auraConfig["token"] == null`, carries no `eikoocnekot`
cookie-name key and reports `auraConfig.attributes.authenticated == "false"`, so
Aura runs in `csrfV2` mode and the client sends the literal. **Nothing here is
session-derived and nothing was harvested from a login.** Zero 401 and zero 403
across the entire run. reCAPTCHA markers exist in the page shell — they belong to
the contact-us form and never appeared on the data path; one there would have
stopped the source.

**A headless browser ran exactly once**, to read the wire format, with a default
Chromium UA and no stealth patches. Everything after that is `urllib`. The
funded premise for this tier was "the data is behind a render"; it was not.

**Robots — allowed, and the reasoning matters more than the verdict.**
`mylincoln.lincolnelectric.com/robots.txt`, verbatim under `User-agent: *`:

```
Disallow: /
Allow: /s
Allow: /northamerica/s
Sitemap: /s/sitemap.xml
Sitemap: /northamerica/s/sitemap.xml
```

Under RFC 9309 §2.2.2 the longest matching rule wins, so `Allow: /northamerica/s`
(15 characters) beats `Disallow: /` (1 character) and both
`/northamerica/s/store-locator` and `/northamerica/s/sfsites/aura` are
**ALLOWED**. `robots_gate()` re-fetches and re-executes that match at run time
and **raises before the first data request** if the answer ever changes. A reader
who stops at `Disallow: /` gets this source exactly backwards and kills it — the
E4 posture doc caught that error once already. The legacy `.aspx` locator path
403s and was never touched. **No override, nothing to sign.**

## 2. What we pulled

| | |
|---|---|
| Raw rows | **271** (three-metro probe only — no national sweep) |
| US records | **271 / 271**, from each record's own `country_raw`, not inferred |
| Distinct companies | **159** (`norm_company`) |
| Unique domains | **24** across 58 records / 28 companies |
| Seated (`seated-v5`) | 0 — not folded in |
| Routed to pools | none yet |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/lincolnelectric.py` |
| Raw artifacts | `emails/data/raw/lincolnelectric-2026-08-04.json` |

Fill: **website 21.4% (58/271) · phone 55.7% (151/271) · email 24.0% (65/271).**
Provenance is 100% filled — `source`, `source_url`, `captured` on every record.

Per metro, all three closed `truncated 0`, `exhaustive=True`:

| Metro | Records | Companies | Domains | Sweep calls |
|---|---|---|---|---|
| houston-tx | 107 | 69 | 11 | 49 |
| chicago-il | 80 | 44 | 7 | 33 |
| cleveland-oh | 84 | 56 | 9 | 25 |

**Cost: 145 origin interactions** — 144 `urllib` requests plus the single browser
load. The breakdown: robots 1, locator page 1, 4 Aura bundles, sitemap 1, 15
recon probes, **107 sweep calls**, 15 tab-shape probes. Zero 401, zero 403, zero
CAPTCHA, no UA rotation, ≥3s/host, single worker. Every response is on disk, so a
re-run records `origin_requests: 0`. The cache holds **146** files: the 145 above
plus `_auracontext.json`, which is parsed state written to disk rather than
anything fetched.

## 3. How deep we went

Exhaustively on **one of six tabs**, and that qualifier is the whole story.

### The endpoint publishes its own SOQL, and caps at 10

Every response is `{success, query, items}` where `query` is the SOQL that was
actually executed:

```
SELECT Id, Company_Name__c, Street__c, City__c, State__c, Country__c, Zip__c,
       Website_URL__c, …, Lincoln_Electric__c, Oerlikon__c, Saffro__c,
       Business_Email__c, Fax_Number__c
FROM Distributor_Profile__c
WHERE Distributor_Query_Value__c = true AND Country__c = 'US'
  AND DISTANCE(Geolocation__c, GEOLOCATION(<lat>,<lng>), 'mi') < <range>
ORDER BY DISTANCE(…) LIMIT 10
```

**`LIMIT 10` is hardcoded server-side. Measured, not assumed:** `limit`,
`resultLimit`, `maxResults`, `pageSize` and `recordLimit` were each added to
`requestMap` in a separate deliberate request, and the emitted SOQL still said
`LIMIT 10` every time. `range` **is** honoured (`range:5` → `< 5.0`, 3 items).
There is no offset, no cursor and no page key, and the Experience Cloud sitemap
holds three files — `sitemap-view-1`, `sitemap-topic-1`, `sitemap-topicarticle-1`
— with **no distributor detail pages**, so no bulk route exists either.

That leaves subdivision as the only correct way to enumerate. `sweep_box()` runs
an **adaptive quadtree**: ask with `range = 1.5 × the cell's circumradius`, and
treat a cell as provably exhausted when **fewer than 10 rows return** or **the
10th row lies beyond the circumradius**; otherwise split into four. Half-side
starts at 50 mi (a ~100-mile box, the same geometry SKF and Continental used, so
the three are comparable) and stops subdividing at 0.5 mi. 107 calls closed 81
cells and split 26, with `cells_truncated: 0` in all three metros.

With every tab flag false the WHERE clause disappears entirely and the query
degenerates to `FROM Distributor_Profile__c LIMIT 10`, returning KE / AU / US
rows. Recorded because it proves the WHERE is assembled from `requestMap` and
nothing else. **No injection into that clause was attempted and none is on the
table.**

### ⚠ The codes: a published column is not a code — the fourth time in this tier

This is the finding worth carrying out of the source. The SOQL **SELECTs a
five-column brand line card** — `Lincoln_Electric__c`, `Oerlikon__c`,
`Saffro__c`, `Equipment__c`, `Filler_Metals__c` — the exact per-record signal
§5i says to look for.

**Every one is `false` on every one of 271 records.** The payload publishes the
line card and fills none of it.

That is now SKF's `DC001`–`DC028` over a constant field, Banner's constant
`CATEGORY_CODE`, Industrial Scientific's constant `countryCode`, and this — four
sources in one tier. **A published column is not a code, and a decoding table is
not data.** §5i's instruction to test whether a code sorts *before* seating
anything is the only reason any of the four was caught.

What does sort, measured on all 271 rows:

| Field | Sorts | True | Resolution |
|---|---|---|---|
| `hasRetailCapability` | yes | 138 / 133 | record-level |
| `moneyMatters` | yes | 138 / 133 | record-level |
| `hasGasAvailable` | yes | 46 | record-level |
| `hasDemonstrationCapability` | yes | 30 | record-level |
| `hasServiceCapability` | yes | 27 | record-level |
| `hasRentalCapability` | yes | 25 | record-level |
| `service` | yes | 20 | record-level |
| `hasEngineCapability` | yes | 17 | record-level |
| `isPlumbing` | yes | 14 | **company-level only** |
| `hasAirCompressorCapability` | yes | 13 | record-level |
| `isHVAC` | yes | 10 | **company-level only** |
| `isFourFiveStar` | yes | **2 (0.7%)** | record-level |

**Constant on all 271 rows:** `isLincolnElectric`, `isOerlikon`, `isSaffro`,
`isEquipment`, `isFillerMetals`, `isLicensedContractor`, `isRefrigeration`,
`inStorePickup` (all `false`), plus `sf_key_prefix` (`a4p`) and `country` (`US`).

Two things follow, and conflating them would misread the source badly:

1. **The `has*` flags describe what a branch can DO, not what it stocks.** Gas
   available, demo capability, engine repair, rental. That is a service profile,
   not a line card, and it must never be reported as one.
2. **`X4_5_Star_Preferred__c` is the only genuine tier field, and it ranks
   almost nothing** — true on 2 of 271 records (Weldstar, Aurora IL; OE Meyer,
   Sandusky OH). It sorts, so the code leg passes on the letter of the rule.
   Read plainly, a tier that admits 0.7% of records qualifies nobody.

**`tabs_raw` was deliberately excluded from both code legs.** It sorts 15 ways
and looks like the richest field in the payload, but it records **which of our
own queries returned the row** — a probe artifact, not a field the source
publishes. Counting it as a code would have manufactured a signal out of our
sampling design.

### Chains

**103 of 271 records (38.0%) are national chains**, 20 distinct companies:
Airgas 50, Linde 32, Fastenal 17, Praxair 4. Kept in the raw file — suppression
is a later stage's decision. Worth noting that they do not explain the domain
problem: **website fill is essentially identical chain (22.3%) versus non-chain
(20.8%)**, so the missing websites are missing across the board, not
concentrated in the rows we would strike anyway.

### What kind of companies these actually are

`htownoxygen.com`, `weldstar.com`, `youngstownoxygen.com`, `coastalws.com`,
`conroeweldingsupply.com`, `salemweldingco.com`. This is a **welding-gas and
welding-supply network — adjacent to industrial MRO rather than inside it.**
Closer to our ICP than Sullair's Caterpillar dealers, further from it than
Timken's or PTDA's bearing houses. That judgement is a read on the names and
domains, not a measurement.

## 4. What's left on the table

**~44 projected net-new companies on the domain axis, against a bar of 150.**

Projection uses the same empirical scaler as SKF and Continental, so all three
are comparable: **1,629 of `deduped-v7`'s 14,284 geocoded rows fall inside the
three 100-mile boxes = 0.11404**, so national ≈ probe ÷ 0.11404.

| Measure | Probe | Projected national |
|---|---|---|
| companies | 159 | ~1,394 |
| **net-new by domain** (24 domains, 79.2% overlap) | **5** | **~44** |
| net-new by `norm_company` (159, 11.9% overlap) | 140 | ~1,228 |

**The name axis overstates by 28× here — the worst measured anywhere in the
program.** Continental 3.0×, SKF 3.6×, Lincoln 28×. The inflation scales
inversely with website fill, for the obvious reason: 213 of 271 records carry no
website, so the name axis counts 159 companies while the domain axis can only
speak for 28 of them.

**Five net-new domains is a fragile count and should be read as one.**
`airgas.com`, `amwelding.com`, `gasandsupply.com`, `reddarc.com`,
`welderrepairservice.com`. Airgas is on that list only because the pool holds
`airgasspecialtyproducts.com`, `airgastech.com` and `sky-oxygen.com` but not the
apex `airgas.com` — and Airgas is a national chain we would strike on sight. One
domain either way moves the projection by ~9 companies.

### The email column recovers domains the website column does not

Measured during this handoff, on the same 271 records, because the payload's own
`domain_axis_caveat` says the 5 is a floor rather than a total:

| Axis | Distinct domains | Net-new vs `deduped-v7` | Projected national |
|---|---|---|---|
| `website` only (the payload's figure) | 24 | 5 | ~44 |
| `website` ∪ email domain | **41** | **19** | ~167 |
| …after striking chains and non-company addresses | 34 | **13** | **~114** |

The email column carries 17 registrable domains the website column never
publishes. Fourteen of those are net-new; strike the four national chains
(`airgas.com`, `linde.com`, `praxair.com`, `dxpe.com`) and the two addresses that
are not company domains (`ameritech.net`, an ISP, and `ourco.net`) and **13
survive.** Companies reachable by any domain rise from 28 to 42 of 159.

**This does not flip the verdict — 114 is still short of 150 — but it more than
doubles the honest floor and it costs zero further requests.** Only 3 of 65
emails are on free mail, so the recovery rate is high. Anyone re-reading this
source should measure the union axis, not the website column alone.

### Verdict against the tier rule

The rule is **≥150 projected net-new AND (a tier code OR a per-record line
card)**.

- **Volume, on the trustworthy domain axis: 44 < 150. FAIL** — and 114 on the
  most generous honest reading is still short.
- **Line card: FAIL.** All five brand columns are constant `false`.
- **Tier code: passes on the letter.** `X4_5_Star_Preferred__c` sorts
  record-level, on 0.7% of rows.

So the raw file records `code_leg: PASS` and `sweep_earned: false`, and both are
right. **This is not the SKF shape, where both legs failed outright** — it is a
source that clears the code leg on a technicality and loses the volume leg by
roughly 3×. Reporting it as "fails both legs" overstates the case; reporting the
code leg as a pass without the 0.7% overstates it in the other direction.

### Could not verify, stated as such

1. **The six tabs are not nested, and only ONE was swept.** The sweep covers
   `whereToBuy` (`Distributor_Query_Value__c = true`). In three-metro shape
   probes at 50 mi, `whereToRent` returned **30/30 rows absent** from the
   distributor tab and `wholesale` **30/30 absent**; `industrial` was 11/30,
   `specialtyGas` 7/30, `serviceLocations` 7/17. **A full national pull would
   have to sweep all six and would return materially more than 1,394.** Every
   national figure above covers the distributor tab only.
2. **No national count exists.** `LIMIT 10` is hard and there is no bulk route,
   so every national number here is a projection, never a total.
3. **Whether website fill differs outside these three metros.** 21.4% is a
   three-metro measurement.
4. **Whether `range > 300` is accepted.** 300 is the UI's own maximum
   (`milesAwayOptions`) and the extractor never asks for more than the app offers.
5. **The `/store-locator-wtb` route.** Identified from `bootstrap.js` as
   `Store_Locator_WTB__c`, sitting beside `PriceSpider_Key__c` /
   `PriceSpider_Url__c` — a third-party PriceSpider widget, not this dataset.
   **Never loaded.** If anyone opens it, the request pattern is already solved:
   `indsci [*]/00-README.md` §1 pins the whole PriceSpider/Wayvia flow.
6. **Whether sparse `Website_URL__c` / `Business_Email__c` is a real data gap or
   serializer behaviour.** The keys are *absent* from the JSON rather than null,
   which is consistent with either.

## 5. Registry row

| lincolnelectric | PROBED-FAILED | 271 | 0 | 2026-08-04 | ~44 projected net-new by domain; 21.4% website fill; brand line-card columns all `false`; 5 of 6 tabs unswept | lincolnelectric/ |
