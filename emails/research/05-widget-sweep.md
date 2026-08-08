# Store-locator widget sweep — extending the easy-JSON tier

**Date:** 2026-08-01
**Status:** Research only. Nothing harvested. Every endpoint below was verified with a single test request; all dealer payloads were profiled in memory and deleted, per `01`'s compliance rule 7. Only aggregate statistics are retained here.
**Method:** curl with a normal desktop UA, one request per host at a time, ≤1 request per 2–3s per host. Companion to `01-dealer-locator-sources.md` — same difficulty vocabulary, same compliance posture.
**Premise being tested:** Banjo's locator turned out to be `storelocatorwidgets.com` SaaS with a fully public JSON endpoint. If third-party locator widgets nearly always expose public JSON, grepping for their signatures is the cheapest way to widen the easy tier.

## Verdict up front

The premise is half right, and the half that is wrong matters more than the half that is right.

**Third-party widgets do expose public JSON — but the widget SaaS names from `01` almost never recur in this vertical.** Across 30 brands from `01`'s medium / hard-JS tier and 34 new US industrial brands, `storelocatorwidgets` returned **zero** further hits. So did `metalocator`, `storepoint`, `storerocket`, `stockist`, `closeby`, `mapsly`, `locally.com`, `brandify`, `where2getit`, and `wpgmza` (the Timken pattern). Banjo and Timken are one-offs, not the leading edge of a pattern.

What *does* recur is a different family: **WordPress store-locator plugins**. Three hits (WP Store Locator, Agile Store Locator, Store Locator Plus), all on mid-size brands, all with public `admin-ajax.php` endpoints. Plus one Storemapper hit. That family is the real seam.

The bigger structural finding: **platform tracks brand size, and it does so cleanly.** All 26 established brands re-swept from `01` — the ones on AEM, Sitecore, Salesforce, Angular, Nuxt, Drupal — returned zero widget signatures. Every single hit landed on a smaller brand running WordPress or a light custom stack. Future sweeps should skip the enterprise names entirely and go straight at sub-$500M manufacturers.

And the headline: **Enerpac is open, and `01` was wrong about why it wasn't.** `getDistributors` does not resolve to the robots-disallowed `/ccstorex/custom/v1` namespace. It resolves to a static file under `/ccstore/v1/files/`, which robots.txt permits. 1,475 records, one unauthenticated GET, no credentials involved. It was accessible under the old policy too.

---

## Master table — sweep results

Difficulty key matches `01`: **easy JSON** = public endpoint, no browser · **easy HTML** = server-rendered list · **medium** = form POST or predictable XHR · **hard JS** = needs headless browser · **gated** = bot protection or key required, do not pursue.

### Signature hits (6)

| Brand | Segment | Locator URL | Signature found | Public JSON endpoint | Fields (website?) | Est. count | Difficulty |
|---|---|---|---|---|---|---|---|
| **Enerpac** | Fluid power | `enerpac.com/en-us/distributors` | Oracle OSF `getFile` (not a widget) | **YES** — `GET /ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json` | Name, Street, City, State/Province, Postal Code, Country, Phone, Fax, E-Mail, **URL (website — 82.7% US)**, Tier (1–4), Distributor Type, Products Carried, Authorized Service Center, rental, Bolting Service Van, Status, Notes, Lat/Lng | **1,475 total / 433 US** (measured) | **easy JSON** |
| **Lovejoy** | PT & bearings | `lovejoy-inc.com/distributor-sales-rep-search/` | `agile-store-locator` (WP plugin) | **YES** — `GET /wp-admin/admin-ajax.php?action=asl_load_stores&load_all=1&layout=1` | title, street, city, state, postal_code, country, phone, fax, email, **website (93.7% US)**, lat/lng, categories, brand, special, customer_no, open_hours | **1,553 total / 1,147 US** (measured) | **easy JSON** |
| **Ballymore** | Material handling | `ballymore.com/dealer-locator/` | `storemapper` (SaaS, id `28644-Q2sEj6KXH5Gfx7UU`) | **YES** — `GET storemapper.co/api/users/<id>/stores.js?callback=SMcallback2` (JSONP) | name, address (single combined string), phone (100%), **email (99.8%)**, **url (74.9%)**, lat/lng, image_url (dealer logo), tier (present, unpopulated), store_category_tags, 3 custom fields | **1,250, all US** (measured) | **easy JSON** |
| **FS-Curtis** | Compressors | `us.fscurtis.com/support/distributor-finder/` | `wp-store-locator` (WPSL) | **YES** — `GET /wp-admin/admin-ajax.php?action=store_search&lat=&lng=&search_radius=&autoload=1` | store, address, address2, city, state, zip, country, phone, fax, email, **url (website)**, hours, **preferred (tier flag)**, permalink, lat/lng, distance | **server-capped at 25/request**; national total unknown | **easy JSON (radius-scoped)** |
| **Wesco Manufacturing** | Material handling | `wescomfg.com/find-a-dealer/` | `store-locator-le` (Store Locator Plus) | **YES** — `GET /wp-admin/admin-ajax.php?action=csl_ajax_onload` | name, address, address2, city, state, zip, country, phone, fax, email, **url (website)**, hours, description, tags, attributes, image, lat/lng | **hard `LIMIT 25`** in the server SQL; total unknown | **easy JSON (radius-scoped)** |
| **Bimba (IMI)** | Fluid power | `bimba.com/en/support/support/locate-a-distributor` | `bullseyelocations` — iframe to `bimba.bullseyelocations.com/pages/Attempt3` | **NO** — `ws.bullseyelocations.com/RestSearch.svc/DoSearch2?ClientId=1950` returns **401** without an ApiKey | not readable without a render | Unknown | **medium** (downgraded from hard JS) |

### False positives (2)

| Brand | Apparent signature | Actual source |
|---|---|---|
| Crown Equipment | `locatorsearch` | CSS/DOM id `dealerLocatorSearchValue` — no third-party widget |
| Lincoln Electric | `yext` | Salesforce feature-flag blob containing `EasyExternalConnections` → matches `yExt` case-insensitively |

### Clean sweeps — no widget signature (54)

**From `01`'s medium / hard-JS / unknown tiers (24, all HTTP 200 to curl):** NTN · Quincy Compressor · SMC · Xylem/Goulds · Toyota Material Handling · Crown · Hyster · Baldor · Dodge (RBC) · Gorman-Rupp · Campbell Chain · Kaeser · Clippard · Turck · Pepperl+Fuchs · Hypertherm · Lincoln Electric · SKF · Festo · ContiTech · Bosch Rexroth · Walter Surface · Banner Engineering · Sullair · Kennametal.

Every one of these is on an enterprise CMS or SPA framework. The widget hypothesis does not reach them.

**New brands with a locator page fetched and swept clean (18):** Bud Industries · ELGi · Hammond Mfg · Justrite · Muncie Power · NORD Drivesystems · Prince Manufacturing · Rex-Cut · Rolair · Trico · Viking Pump · Wilden (PSG) · Wright Tool · Alemite · Coxreels · Ideal Industries · Reelcraft · Cross Manufacturing · HydraForce · Graco.

**New brands assessed, no public locator found (12):** Ace Pumps · Bishamon · Brennan Industries · CGW · Channellock · Jenny Products · Presto Lifts · Southworth · Cornell Pump · Dynabrade · Osborn · Chicago Pneumatic. Homepages are JS-navigated and standard path guesses (`/where-to-buy/`, `/distributors/`, `/find-a-dealer/`) all 404'd. Not proof of absence — proof that a homepage-link crawl misses them.

**New brands blocked or throttled (7):** Balluff, Blackmer, Sumitomo Drive, Acuity — hard 403. Gardner Denver, Champion Pneumatic, Haskel — **429**. Note that all three 429s are Ingersoll Rand brands, the same family as ARO / Miller / Ingersoll Rand in `01`. IR runs one throttle policy across its whole portfolio.

**34 new brands assessed. 64 brands swept in total.**

---

## Enerpac — fingerprint

The policy override on 2026-08-01 unblocked this. What follows used only the public unauthenticated endpoint.

**The credential boundary held.** The page source does expose an Oracle Integration Cloud base URL and a basic-auth service account, as `01` recorded. Those values were **not used, not recorded, and not transmitted**. The decode script that read the page payload filtered on `password|secret|authorization|token|credential|username` and dropped every match before printing. Nothing in the path below touches that service.

### The correction to `01`

`01` concluded that `getDistributors` was closed because OCC custom endpoints live under `/ccstorex/custom/v1`, which robots.txt disallows. That was a reasonable inference and it was wrong. The resolution chain:

1. `/storefront/occ-public/esm/min/client-ff7a1a53.js` maps `getDistributors` to a lazily imported chunk.
2. That chunk (`index-1d295a34.js`) is four lines and fully readable: it calls the OSF endpoint **`getFile`** with the single param `thirdparty/distributorLocator/distributorLocator.json`.
3. The OCC endpoint registry at `/ccstore/v1/registry` defines `getFile` as `GET /ccstore/v1/files/{}`.
4. Enerpac's `robots.txt` disallows `/ccstorex/custom/v1` — the **`ccstorex`** namespace. `/ccstore/v1/files/` is not on the list.

So the distributor data is a plain static JSON file on a permitted path. No custom endpoint, no dynamic query, no robots conflict.

### Verified endpoint

```
GET https://www.enerpac.com/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json
→ HTTP 200 · 128,422 bytes · application/json · no auth, no cookie, no referer check
```

One request returns the entire global network. There is no radius, no pagination, no form.

### Record schema (20 fields)

`Name` · `Street` · `City` · `State/Province` · `Postal Code` · `Country` · `Phone` · `Fax` · `E-Mail` · **`URL`** · `Tier` · `Distributor Type` · `Products Carried` · `Authorized Service Center` · `rental` · `Bolting Service Van` · `Status` · `Notes` · `Latitude` · `Longitude`

### Measured counts

- **1,475 records total. 433 US.** Next largest: France 213, Australia 154, Canada 95, Germany 54.
- **204 distinct US company names. 131 appear at exactly one location.**
- **Website (`URL`): 358 / 433 US = 82.7% populated. 75 US dealers (17.3%) have no website URL.**
- **Phone: 432 / 433 (99.8%).** Status: 433 / 433 `Active`.
- **`State/Province` is empty on all 433 US records.** Address reconstruction needs City + Postal Code. This is the one real defect in the schema.

### Tier and line-card metadata

`01` called Enerpac's filter set the best qualification signal in fluid power. It was right, and the data is better than the filters suggested — the values ship *inside every record*, not just as search facets.

- **`Tier` — four levels, all populated (US):** 3 → 153, 4 → 141, 2 → 87, 1 → 52. Meaning undecoded, same situation as Timken's 4/5/6.
- **`Distributor Type` (US):** Sales + Regional Distributor 372 · Sales + Service + Regional 57 · Service + Regional 3 · Sales + Service + Rental + Regional 1.
- **`Products Carried` (US), the actual line card:** Industrial Tools 163 · Industrial + Workholding 134 · Industrial + Bolting + Workholding 67 · Industrial + Bolting 27 · Industrial + Rail + Workholding 11 · Workholding only 7 · all five lines 6 · Bolting only 5.

That last field is a line card *within one manufacturer* — which brand families a dealer carries, per record, without any cross-source join. Nothing else in the inventory does that.

### Company shape — the reason this ranks high

The top multi-branch names are **not** the national chains that dominate every other source:

> Hydradyne 34 · ARG Industrial 9 · Nefco Construction Supply 9 · Alaska Industrial Hardware 8 · Industrial Supply Co 8 · Connector Specialists 7 · DNOW 7 · Edge Construction Supply 7

Motion, Applied, FleetPride, DXP, Kaman, Grainger and Fastenal are absent or negligible. Enerpac sells through regional hydraulics and construction-supply houses, which is the ICP shape. Chain suppression barely dents this list — roughly 198 of 204 distinct companies survive it.

### Verdict

**Enerpac earns the easy tier, and it belongs near the top of the shortlist.** It is one unauthenticated GET for the whole network, it carries website + phone + email + a four-level tier + a per-record line card, and its company mix is regional independents rather than national chains. The 433 US records are fewer than Timken's 5,002, but they convert to distinct in-ICP companies at a far better rate: 204 distinct / 433 records, versus Timken's 1,972 / 5,002 before chain suppression.

Anti-bot posture: none. Clean 200s throughout. No CAPTCHA, no challenge, no throttle.

**Ranked against `01`'s shortlist of 8, Enerpac slots in at #2** — behind Timken on raw volume, ahead of Atlas Copco on everything else.

---

## Fingerprinting detail — the other five

### Lovejoy — Agile Store Locator, the largest single-call payload in the sweep

- Plugin fingerprint: `wp-content/plugins/agile-store-locator/public/css/init.css`, with `"ajax_url":"https://www.lovejoy-inc.com/wp-admin/admin-ajax.php"` in the inline config.
- **`GET /wp-admin/admin-ajax.php?action=asl_load_stores&load_all=1&layout=1` → 200, 128 KB, 1,553 records.** No nonce required for read. This is the ASL plugin's documented bulk-load action.
- **1,147 US** (Canada 266, Mexico 80). Fill rates on US records: website **1,075 (93.7%)**, phone 1,145 (99.8%), fax 1,072, email 41 (3.6%), customer_no 7.
- **`categories` is dead weight here.** 1,133 of 1,147 US records carry the identical value `18,19,20`. No segmentation signal, unlike Banjo's Agricultural/Industrial split.
- **The problem: 97 distinct US company names, 48 of them single-location.** The list is chain-dominated to an extreme degree — Motion 278, Applied Industrial 239 + 42 (two spellings), DXP 131, BDI 60, Kaman 52, IBT 26, Purvis 26. After chain suppression roughly 89 companies remain.
- **So: high record count, low company count.** Its value is line-card depth on dealers we already have, not new names.

### Ballymore — Storemapper, the only source carrying dealer email

- `data-storemapper-id="28644-Q2sEj6KXH5Gfx7UU"` on a `storemapper.co/js/widget-3.min.js` tag. The widget builds its request as `<base>/api/users/<companyId>/stores.js?callback=SMcallback2` — readable straight out of the minified bundle.
- **`GET https://www.storemapper.co/api/users/28644-Q2sEj6KXH5Gfx7UU/stores.js?callback=SMcallback2` → 200, 78 KB, JSONP, 1,250 records, all US.**
- **`email` is populated on 1,247 of 1,250 records (99.8%).** No other source in the inventory carries a dealer email address at all. Phone 100%. `url` 936 (74.9%).
- Also present: `image_url` pointing at a hosted dealer logo, `store_category_tags`, three custom fields, `google_place_id` / `gmb_review_count` / `average_google_rating` (all null on this tenant), and a `tier` field that exists but is unpopulated.
- **Weakness: `address` is one combined string** — `"153 Acme Road, Lawrence, MA"`. No separate city/state/zip. Parsing is needed before it will join on ZIP5.
- **Same chain problem as Lovejoy, worse.** 122 distinct names, 74 single-location, and the top five are Fastenal 183, Kaman 181, Indoff 170, Motion 167, Applied 156. Roughly 114 companies survive suppression.
- **Note before this gets used:** a public locator that publishes dealer email addresses is still a third-party list from our perspective. Sending to those addresses is the same CAN-SPAM regime as anything else in the pipeline — real physical address, working opt-out. The convenience of a pre-supplied email does not change the consent question, and it should not be treated as an invitation.

### FS-Curtis — WP Store Locator, radius-scoped

- Fingerprint: `wp-content/plugins/wp-store-locator/css/styles.min.css` plus the full `wpsl-*` DOM. The page ships a radius selector up to 500 mi and a **category filter**, which is a line-card signal worth reading after a render.
- **`GET /wp-admin/admin-ajax.php?action=store_search&lat=39.8&lng=-98.6&max_results=2000&search_radius=5000&autoload=1` → 200, 11.6 KB, 25 records.**
- **The 25-record ceiling is server-side.** `max_results=2000` was ignored; WPSL enforces its own admin-configured cap. A second request with different params will not lift it. National coverage requires a grid of geo-anchored queries, which is a harvest, not a fingerprint — not attempted.
- Schema is good: `url` (website), `preferred` (a boolean tier flag, `true` on the first record), phone, fax, email, hours, and a `permalink` to a per-store WordPress page at `/stores/<slug>/`. That permalink is an alternative crawl path if the grid is ever unattractive.
- **Difficulty: easy JSON, but radius-scoped.** Trivial per query, non-trivial to complete.

### Wesco Manufacturing — Store Locator Plus, radius-scoped, cap is hard-coded

- Fingerprint: `wp-content/plugins/store-locator-le/` plus the `slp_bubble_*` / `csl_*` config keys.
- **`GET /wp-admin/admin-ajax.php?action=csl_ajax_onload` → 200, 41 KB, 25 records.**
- **The response echoes its own SQL,** which ends `ORDER BY sl_distance asc LIMIT 25`. The cap is in the query, not a parameter. Same grid problem as FS-Curtis, and the plugin version (`2311.17.01`) is in the response if we ever need to check behaviour against plugin source.
- Schema: name, address, address2, city, state, zip, country (ISO-3), lat/lng, phone, fax, `email`, `url` (website), hours, description, tags, attributes, image.
- The debug verbosity here — full SQL, table prefixes, query params — is the site's own configuration, not something we induced. Worth noting only because it means the endpoint is plainly not intended as a private one.

### Bimba — Bullseye, and the line we do not cross

- The `/locate-a-distributor` page is not the SPA `01` recorded. It is an **iframe** to `https://bimba.bullseyelocations.com/pages/Attempt3?f=1` — a hosted ASP.NET WebForms locator on Bullseye's own infrastructure. Client id `1950`, readable from the tenant's asset path.
- **`GET ws.bullseyelocations.com/RestSearch.svc/DoSearch2?ClientId=1950&CountryId=1&Radius=3000&MaxResults=1000` → HTTP 401**, body `{"ResultList":[],"TotalResults":-1}`. Bullseye's REST API requires an `ApiKey`.
- **Not pursued further.** Hunting a tenant's API key out of a bundle is credential acquisition, which is the same boundary `01` drew around Enerpac's OIC service account and the same one Artur's 2026-08-01 override explicitly did *not* move. A robots directive is a request; an auth check is a control.
- **Reclassify Bimba from `hard JS` to `medium`.** The hosted Bullseye page is server-rendered WebForms with a form POST — no SPA, no bundle to reverse. That is a cheaper render target than `01` assumed, and it is the honest path to this data.

---

## New easy-tier additions — ranked by yield × ICP fit

Ranked on distinct in-ICP companies produced, then data richness, then access cost.

1. **Enerpac** — `easy JSON`. 433 US records → **204 distinct companies, 131 single-location**, and the chains are absent. Website 82.7%, phone 99.8%, four-level tier, per-record line card across five product families. One GET for the whole network. **Best new source in this sweep by a wide margin**, and it should displace Atlas Copco at #2 on `01`'s shortlist.

2. **Ballymore** — `easy JSON`. 1,250 US records but only **122 distinct / 74 single-location**. Take it for two things: **dealer email at 99.8%**, which nothing else has, and material handling, which is a thin segment. Budget for address-string parsing and aggressive chain suppression.

3. **Lovejoy** — `easy JSON`. 1,147 US records, **97 distinct / 48 single-location**, website 93.7%. Weakest ICP yield of the three bulk sources, but it is one call and it deepens the line card on PT & bearings dealers that Timken already gave us. Cheap, so take it — just do not expect new names.

4. **FS-Curtis** — `easy JSON, radius-scoped`. Schema is strong (website + `preferred` tier + email + category filter) and compressors fit the ICP well. Held back by the 25-per-request server cap: this needs a geo grid or a crawl of `/stores/<slug>/` before it produces a national list. **Decide the grid question before spending time here.**

5. **Wesco Manufacturing** — `easy JSON, radius-scoped`. Same shape and same cap as FS-Curtis, hard-coded rather than configurable. Material handling. Lower priority than FS-Curtis only because the brand is smaller.

**Not added: Bimba.** Real Bullseye signature, real public locator, but the API is key-gated and the key is off limits. It becomes a `medium` render target, not an easy-tier source.

### What this adds to the pipeline

| Measure | This sweep |
|---|---|
| New US dealer **records** available by public JSON | **~2,830** (Enerpac 433 + Lovejoy 1,147 + Ballymore 1,250) |
| **Distinct US company names** across the three | **423 gross** |
| After national-chain suppression | **~400** |
| Single-location independents | **253 gross** |
| New records with a **website** field | ~2,369 |
| New records with a **dealer email** | ~1,288 (Ballymore + Lovejoy) |
| New **null-website** candidates | ~75 (Enerpac) + ~72 (Lovejoy) + ~314 (Ballymore) |

**Read that number carefully.** ~400 distinct non-chain companies is the *gross* figure. Timken already contributes 1,972 distinct US companies, so a large share of these 400 are almost certainly already in the set — Lovejoy and Ballymore both sell through the same PT and MH distribution that Timken covers. **Net-new company count is realistically 150–250**, most of it from Enerpac, whose construction-supply and hydraulics mix does not overlap Timken's bearing distribution.

The real return is not headcount. It is that a dealer who previously showed a line card of *Timken* now shows *Timken + Enerpac + Lovejoy*, with an Enerpac tier and product-family list attached. `01` argued the insight gets strong at 5+ sources. This sweep moves the count from 3 to 6 usable sources and puts three of the new ones in the easy tier.

---

## Which signature families paid off

| Family | Brands swept | Hits | Verdict |
|---|---|---|---|
| **WordPress locator plugins** (`wp-store-locator`, `agile-store-locator`, `store-locator-le`) | 64 | **3** | **The seam.** Best yield per grep, and all three exposed public `admin-ajax.php` JSON with no nonce. One returned the full national list in a single call. |
| **Storemapper** | 64 | **1** | Worth keeping. Richest contact schema found — the only dealer email in the inventory. |
| **Bullseye** | 64 | **1** | Real, but key-gated. Detect it to reclassify difficulty, not to gain access. |
| **Oracle OSF `getFile`** (not on the original list) | 1 | **1** | **Add this to the sweep list.** Any OCC storefront may serve its locator as a static file under `/ccstore/v1/files/`. The tell is `getFile` in the client bundle's lazy-import map. Cheap to check, and it produced the best source in this sweep. |
| `storelocatorwidgets` | 64 | **0** | Banjo is a one-off. |
| `wpgmza` / WP Google Maps | 64 | **0** | Timken is a one-off. |
| `metalocator`, `storepoint`, `storerocket`, `stockist`, `closeby`, `mapsly`, `locally.com`, `brandify`, `where2getit`, `elfsight`, `super-store-finder` | 64 | **0** | Zero. Drop them from future sweeps or keep them only as cheap regex filler. |
| `yext` | 64 | 0 real | One false positive. Needs anchoring to `yext.com` or a case-sensitive match — bare `yext` collides with `EasyExternal…`. |

**Two rules for the next sweep, both earned here:**

1. **Skip enterprise brands.** AEM, Sitecore, Salesforce Experience Cloud, Angular and Nuxt sites produced zero widget hits out of 26 attempts. They build locators in-house. Spend the requests on WordPress-era manufacturers instead — check for `wp-content/plugins/` first, and only grep for widget names when that hits.
2. **Grep the client bundle's lazy-import map, not just the page.** Enerpac's endpoint was invisible in 34 KB of HTML and sat in plain sight in a 208-byte JS chunk. `getDistributors`, `getStores`, `getDealers` and `getFile` are worth grepping in every SPA bundle we already have on disk.

---

## Compliance record for this sweep

Everything in `01`'s compliance section was applied unchanged, plus the one documented override.

- **Policy override applied (Artur, 2026-08-01):** robots.txt no longer blocks Enerpac. In the event it did not matter — the endpoint used is outside the disallowed namespace, so this fetch would have been permitted under the old rule too.
- **Credential boundary held and unchanged.** Enerpac's page exposes an Oracle Integration Cloud base URL and a basic-auth service account. Not used, not recorded, not transmitted. The payload-decoding script filtered credential-shaped matches before printing anything. Bimba's Bullseye API returned 401 and **no attempt was made to obtain a key**. Using leaked or scraped credentials is unauthorized access, which is a different category from a robots directive, and the override did not touch it.
- **No bypass of anything.** The 8 hard-403 brands from `01` were not touched. Four new 403s (Balluff, Blackmer, Sumitomo Drive, Acuity) were logged and dropped. Three 429s (Gardner Denver, Champion Pneumatic, Haskel) were logged and not retried.
- **One test request per endpoint.** Six endpoints verified, six requests. The two 25-record caps were left in place rather than worked around with a geo grid.
- **Rate:** ≤1 request per 2–3s per host throughout; parallelism was across distinct hosts only.
- **Retention:** all six dealer payloads were profiled in memory and **deleted**. Only the aggregate statistics in this document remain.
- **No bulk harvesting was performed.**

---

## Open items

- **Decide the geo-grid question.** FS-Curtis and Wesco are easy JSON per request but capped at 25. A national pass means a grid of geo-anchored queries against one host. That is a volume decision, not a technical one, and it will recur on every WPSL / SLP site we find. It is the same shape as the Adaptall identity question in `01`: cheap to do, worth deciding deliberately once.
- **Decode the tier codes.** Enerpac `Tier` 1–4 and Timken `category` 4/5/6 are both undecoded. Enerpac's locator legend should name them; check after a render.
- **Parse Ballymore's combined address string** before attempting any ZIP5 join.
- **Re-run the sweep against `getFile` / `getStores` / `getDealers` in bundles already on disk** — Pepperl+Fuchs (890 KB), SKF (810 KB), Festo, ContiTech and Bosch Rexroth were all classified `hard JS` on the assumption their endpoints were obfuscated. Enerpac shows that assumption can be wrong for a 208-byte reason.
- **The 12 new brands with no locator found** need a sitemap or search-based pass, not a homepage-link crawl. Their locators may exist under non-obvious paths.
- **Reclassify Bimba to `medium` in `01`'s master table**, and correct `01`'s Enerpac row from `hard JS (robots-blocked)` to `easy JSON`.
