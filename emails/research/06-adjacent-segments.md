# Dealer-locator sourcing: adjacent segments

**Date:** 2026-08-01
**Status:** Research only. No lists were harvested. Every URL below was fetched live today with curl and a normal desktop UA. Responses were cached to an ephemeral session scratchpad, profiled in memory, and never copied into the repo; only the aggregates below are kept.
**Scope:** Eight segments untouched by `01-dealer-locator-sources.md`. **59 brands assessed**, none of them duplicates of the 46 in `01`.
**Method:** same as `01` — candidate-path probe, then link mining out of the returned HTML, then one fingerprint fetch per discovered locator, then at most one test fetch per data endpoint. Rate limit 3s per host, one worker per host.

## Verdict up front

The adjacent segments are worth about **one good source per segment, and two of the eight are empty.**

The find of the run is **SPX FLOW**. Its locator is a MetaLocator instance — one of the SaaS signatures `01` flagged as worth grepping for — and its `format=json` route answered an unauthenticated request. The field list it returned is the richest in the whole program: address, phone, fax, email, website, **Business Unit**, **Representative**, and **four kinds of territory assignment** (state, country, postal code, county). No other source in either file carries territory.

Second is **Dorner**, which ships its entire US distributor set inline in the page HTML — 116 records, 76 distinct companies, no API and no browser needed. It is also the first source in the program to carry **email addresses** on nearly every record.

Third is **NORD**, whose locator schema exposes company, email, phone and a four-way type code, against a network the brand puts at roughly 500 North American distributors.

Against that: **fasteners and packaging are barren**, drives and electrical are almost entirely Cloudflare- or Akamai-walled, and several famous names in this set (Swagelok, Busch, Videojet, Domino, Lantech) turn out to sell direct or through exclusive single-brand centers, which fails the multi-brand ICP test regardless of how open their pages are.

Net: **~320–570 new US dealer locations reachable at easy tier today**, of which perhaps 250–450 survive national-chain suppression and dedupe against the `01` sources.

---

## Master table

Difficulty key (same as `01`): **easy JSON** = public endpoint, no browser · **easy HTML** = server-rendered list · **medium** = form POST or predictable XHR · **hard JS** = needs headless browser · **gated** = bot protection or credential wall, do not pursue.

### 1. Process equipment — mixers, heat exchangers, filtration, separation

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **SPX FLOW** | Process | `spxflow.com/contact-us/sales/` → iframe `admin.metalocator.com/index.php?option=com_locator&view=directory&Itemid=18647` | **MetaLocator** SaaS in an iframe | **YES** — `…&view=location&task=load&format=json&Itemid=18647` returned 200, no auth | SAP Account ID, Address, Address 2, City, State, Postal, Phone, Fax, **Link ×2 (website) YES**, Email, category, phone2, **Representative**, **Territories by State / Country / Postal / County**, **Business Unit** | Unknown (not queried) | **easy JSON** | Best schema in the program. Territory + business unit are line-card metadata nothing else carries |
| **Graco** | Process | `graco.com/us/en/how-to-buy/find-a-distributor.html` | Adobe AEM + Bing Maps + Salesforce | `/api/` routes present, not resolved | inputs `checkLocation`, `useBingMaps` | Large (unquantified) | medium | 200 to curl, 403 to WebFetch — the `01` tooling note holds. Canonical path is `/how-to-buy/`, not `/where-to-buy/` |
| **Camfil** | Process | `camfil.com/en-us/support-and-services/support/contact-locator` | Sitecore + Google Maps + markerclusterer | No — `POST /api/contactlocator/locations` | `contextItemId`, `dataSourceItemId`, `languageCode`; records carry `contact.totalBusinessAreas` | Unknown | medium | Anti-forgery token is printed in the page (`data-antiforgery`), so it is not an auth wall. **Caveat: contacts skew to Camfil's own offices, ICP fit unproven** |
| **Pentair** | Process | `pentair.com/en-us/find-a-dealer.html` | AEM + Algolia + Google Maps + Salesforce | Not exposed | single input `q` | Large | hard JS | 556KB shell, dealer data is Algolia-fed. **Off-ICP** — pool and water-treatment contractors, not industrial distributors |
| **Nederman** | Process | `nederman.com/en-us/partners` | React SPA | Not exposed | — | Unknown | hard JS | 214KB, zero addresses and zero `tel:` in raw HTML. Page reads as a partner-program pitch, not a directory |
| **Donaldson** | Process | `shop.donaldson.com/store/en-us/storeLocator` | Apache / Communique commerce host | — | — | — | **gated** | 403 to curl on the store host. The marketing site 200s but `/where-to-buy/` redirects to a product page |
| **Alfa Laval** | Process | — | — | — | — | — | **NONE** | `/where-to-buy/`, `/support/where-to-buy/`, `/contact-us/partners/` all 404. Partner content on `alfalaval.com` is editorial, not a directory |
| **Eaton Filtration** | Process | `filtration.eaton.com` | — | — | — | — | **NONE** | `curl (60) SSL: no alternative certificate subject name matches`. Host cert does not cover it |

### 2. Conveyors + bulk material handling

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Dorner** | Conveyors | `dornerconveyors.com/distributors` (auto-scopes to `?country=United+States+of+America`) | WordPress + Google Maps; **full dataset inline as `distributorPlaces`** | Inline JSON in the HTML — no endpoint needed | id, name, address, lat, lon, address_line_1/2, tel, phone, **email (112/116)**, **url — website YES (114/116)**, country, **type**, is_leading | **116 US / 76 distinct companies** (measured) | **easy HTML** | One GET, zero JS. Only fully-open source in the program carrying **email**. Tiers: Distributor / Premium Distributor / Manufacturer's Rep / Authorized Integrator |
| **Interroll** | Conveyors | `rollingoninterroll.com/en/global-partner-network/explore/north-am/u-s-a.html` | Joomla, static, paginated (`?start=9`) | No (not needed) | company name + child page `/u-s-a/{slug}.html` per partner | **13 US** (measured, 2 pages) | **easy HTML** | Tiny but clean. Partner detail pages are individually crawlable |
| **FlexLink** | Conveyors | `partners.flexlink.com/en/partners_list` | Drupal, server-rendered, facet-filtered | No (not needed) | company names; facets `field_ptn_category_target_id`, `field_ptn_country_target_id` | US subset small (list skews Europe) | **easy HTML** | Country facet makes the US slice one request. Category facet is a partner-tier signal |
| **mk North America** | Conveyors | `mknorthamerica.com/sales-and-support/` | Static, 6KB | No (not needed) | rep names + 3 phones | ~10 reps | **easy HTML (tiny)** | Manufacturer's-rep list, not a distributor directory |
| **Hytrol** | Conveyors | `hytrol.com/contact/ip-locator/` | WordPress + custom plugin `hytrol-ip-map` | Namespace **is** public: `/wp-json/hyipmap/v1/` lists `GET /locations` | — | Unknown | **gated** | `GET /wp-json/hyipmap/v1/locations` → **401 `rest_forbidden`**. Route is discoverable, data is not. One probe, no retry |
| **QC Conveyors** | Conveyors | `qcconveyors.com/distributors/` | WordPress / Elementor | No | — | — | **not a locator** | H1 says "Contact Your Local Distributor" but the page is a distributor-program page (resources, training). 2 phones total |
| **Ashland Conveyor** | Conveyors | — | — | — | — | — | **NONE** | `/distributors`, `/where-to-buy`, `/find-a-distributor` all 404. No distributor anchor anywhere in the site HTML |
| **Span Tech** | Conveyors | — | — | — | — | — | **NONE** | Same: all candidate paths 404, no anchor. WordPress with `admin-ajax` present but no locator behind it |

### 3. Industrial electrical + controls

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Rockwell Automation** | Electrical/controls | `rockwellautomation.com/en-us/sales/partner-locator.html` | Adobe AEM | **Endpoint named in page:** `api.rockwellautomation.com/ra-eapi-cx-public-dashboard-vpcprod/api/v1/partners` | facets `distributor-choice`, `ptyp` (partner type), `styp`, `loca`, `numResults`, `sort` | ~50–70 US distributor groups, hundreds of branches | medium | The endpoint self-describes as **public-dashboard**. Not probed — needs param discovery. **ICP caveat: Rockwell distributors skew far above the $75M ceiling** |
| **Hammond Power Solutions** | Electrical/controls | `americas.hammondpowersolutions.com/partner-locator` | Sitecore MVC | No — `scController` / `scAction` postback | Country / State / County selects, `textBoxSearch`, `__RequestVerificationToken` | Unknown | medium | Same ASP.NET postback class as Kaeser in `01`. Smaller, more independent network than Rockwell — better ICP fit |
| **WAGO** | Electrical/controls | `wago.com/us/distribution` | Custom + **YellowMap** store service | Third-party: `yellowmap.de/api_rst/api/autocompleteToken`, `autocomplete.smartmaps.cloud/api/v5/Autocomplete` | Not exposed in HTML | Unknown | medium | New SaaS signature worth adding to the grep list: `yellowmap`, `smartmaps.cloud`. **ICP caveat: WAGO's US channel is catalog houses (Digi-Key/Mouser class)** |
| **Mersen** | Electrical/controls | `us.mersen.com/en/contact` | Drupal | No | contact form only (`product_category`, `states`, `company`) | — | **not a locator** | `/where-to-buy` and `/contact/distributor-locator` both 404. Lead form, no distributor names |
| **Phoenix Contact** | Electrical/controls | `phoenixcontact.com/en-us/company/partners-distributors-suppliers` | Akamai-fronted | — | — | — | **gated / NONE** | The one reachable page is editorial. `/en-us/` root and `/en-us/distributors` return 403 / 404 behind Akamai |
| **Eaton** | Electrical/controls | `eaton.com/us/en-us/locate/commercial-distribution-products.html` | — | — | — | — | **gated** | Stalls automated requests. `curl (92)` on HTTP/2, then a full 400s timeout on HTTP/1.1. Never served a byte |
| **Schneider / Square D** | Electrical/controls | `se.com/us/en/work/support/where-to-buy/` | **Akamai** (`ak_p` server-timing) | — | — | — | **gated** | 403 on the locator, the partner locator, and the site root |
| **Littelfuse** | Electrical/controls | `littelfuse.com/where-to-buy` | **AkamaiGHost** | — | — | — | **gated** | 403 on every path including root |

### 4. Gearing, drives, motors

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **NORD** | Drives | `nord.com/us/global/locator-tool.jsp` → iframe `shop.nord.com/nordlocations/iframe?lang=us&country=US` | Custom shop app + Google Maps + JsRender templates | Not exposed — XHR from `shop.nord.com` | **From the templates:** `id`, `mainAddress.company`, **`mainAddress.email`**, `mainAddress.phone`, `mainAddressHtml`, `position.lat/lng`, **`type`**. Per-record vCard at `/nordstores/vcard/{id}`. Website not in the template | **~500 NA** (brand's own claim) | medium | **Four tiers: agent / distribution / sales / service.** Largest network in this segment that is not behind a wall. Both hosts served 200 |
| **Yaskawa** | Drives | `yaskawa.com/support-training/support/sales-search` | Custom + Cloudflare (served, not challenged) | Not exposed | State + radius (50/100/200 mi) + **product category** (Industrial AC Drives, HVAC Drives, …) | Unknown | medium | The product-category filter is a line-card signal, same value as Miller's `?product_name=` in `01` |
| **Lenze** | Drives | `lenze.com/en-us/finder` | TYPO3 + ke_search + Google Maps | No — GET param `tx_kesearch_pi1[sword]` | 4 `tel:` in raw HTML; result cards JS-rendered | Unknown | medium | ke_search is a plain GET-param search, so the query path is predictable |
| **SEW-Eurodrive** | Drives | `seweurodrive.com/meta-pages/contacts_worldwide.html` | **AkamaiGHost** | — | — | — | **gated** | 403 on every path including root. Also sells direct via its own assembly centers — low ICP value even if opened |
| **Sumitomo Drive** | Drives | `sumitomodrive.com/en-us/where-to-buy` | **Cloudflare challenge** (`chlray`) | — | — | — | **gated** | 403 on every path including root |
| **Boston Gear** | Drives | `bostongear.com/where-to-buy` | **Cloudflare challenge** | — | — | — | **gated** | 403 on every path. Consistent with Regal Rexnord's 403 in `01` — same owner, same posture |
| **Bonfiglioli** | Drives | — | — | — | — | — | **NONE** | `/contacts`, `/contacts-usa`, `/distributors`, `/sales-network` all 404. No anchor on the US root |
| **Nidec / US Motors** | Drives | — | — | — | — | — | **NONE** | Every distributor path resolves to `/en/motors/404` returning HTTP 200 — a soft-404. No locator exists |

### 5. Fasteners + industrial supply brands

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Simpson Strong-Tie** | Fasteners | `strongtie.com/dealerlocator` | Next.js + **Bloomreach** headless CMS (`strongtie.bloomreach.io/delivery/site/v1/…/pages/dealerlocator`) | Bloomreach delivery API named in page, not probed | single input `search` | Large | medium | Technically the most accessible in this segment. **Off-ICP** — dealers are lumberyards and building-material retailers |
| **Henkel / Loctite** | Fasteners | `next.henkel-adhesives.com/us/en/support/find-a-distributor.html` | AEM + GraphQL | Not exposed | single input `searchTerm` | Unknown | hard JS | 558KB, no records in raw HTML. Note the canonical host is `next.henkel-adhesives.com` |
| **SPIROL** | Fasteners | `spirol.com/contact-us/` | Static, 20KB | No (not needed) | 27 `tel:` links | ~27 offices | **not distributors** | Clean, easy parse — but it is SPIROL's own global sales offices, not third parties |
| **3M** | Fasteners | `3m.com/3M/en_US/company-us/where-to-buy/` | — | — | — | — | **gated** | Full 400s timeout on both HTTP/2 and HTTP/1.1. Never served a byte |
| **PennEngineering (PEM)** | Fasteners | `pemnet.com/where-to-buy/` | **Cloudflare challenge** | — | — | — | **gated** | 403 on every path including root |
| **Bossard** | Fasteners | — | — | — | — | — | **NONE** | Root 200, `/contact/` 404. Bossard runs a direct VMI model — no dealer network to list |
| **Nord-Lock** | Fasteners | — | — | — | — | — | **NONE** | `/where-to-buy/` and `/distributors/` both 404. Contact page only |

### 6. Fluid handling / industrial hose beyond `01`

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Swagelok** | Fluid handling | `products.swagelok.com/en/locator` | SAP-Commerce-style storefront (`CSRFToken`, `/en/cart/addQuickOrder`) | No — form posts to `/en/locator` | `storelocator-country`, `storelocator-query` | ~200 sales & service centers | medium | Reachable, but **fails the ICP test**: Swagelok centers are exclusive single-brand franchises, not multi-brand independents. Do not spend headless budget here |
| **Danfoss** (incl. former Eaton hydraulics) | Fluid handling | `store.danfoss.com/en/find-a-distributor` | Commerce storefront + **Mapbox** | Not exposed | `CSRFToken`, `code`, `country-select`, `search` | Unknown | medium | The main-site path `danfoss.com/en-us/service-and-support/find-a-distributor/` **404s** — the live locator is on the `store.` subdomain |
| **STAUFF** | Fluid handling | `stauffusa.com/en/help-centre/distributors` | Custom, 238KB | Not exposed | single input `address`; H1 "Distributor Locator" | Unknown | hard JS | Zero addresses in raw HTML. A separate `loginForm` exists on the page but the locator itself is not behind it |
| **Alfagomma** | Fluid handling | — | — | — | — | — | **NONE** | `/distributors/`, `/where-to-buy/`, `/network/` all 404. WordPress with `admin-ajax` present but nothing behind it |
| **Brennan Industries** | Fluid handling | — | — | — | — | — | **NONE** | All four candidate paths 404, no anchor on the root |
| **RYCO Hydraulics** | Fluid handling | — | — | — | — | — | **unreachable** | `curl (28)` connection timeout on every path. TLS handshake never completed from here |

### 7. Air / gas / vacuum + HVACR industrial

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Gast (IDEX)** | Vacuum/air | `gastmfg.com/find-distributor/` | WordPress + `admin-ajax.php` + Google Maps | No — `POST admin-ajax.php`, action **`load_distributors`**, returns rendered HTML | params `user_lat`, `user_long`, `zipcode`, `country`, page-printed `gastData.nonce` | Unknown | medium | Same WordPress AJAX class as NTN and Quincy in `01`, and the client contract is readable in `distributor.js`. reCAPTCHA is on the CF7 contact form, **not** on the map path |
| **Copeland** | HVACR | `copeland.com/en-us/where-to-buy` | Next.js + GraphQL + `prd-commerce.copeland.com/api/v1/…` | Commerce API named in page, not probed | Not exposed | Large (HVACR wholesalers) | hard JS | Adjacent-ICP: owner-operated multi-brand HVACR wholesalers do exist in the band. Worth a headless pass if the segment is prioritized |
| **Airtech Vacuum** | Vacuum/air | `airtechvacuum.com` | JS shell / catch-all | — | — | — | hard JS | Every path (`/`, `/contact`, `/distributors`) returns an identical 9,106-byte body. Likely no locator at all |
| **Becker Pumps** | Vacuum/air | `beckerpumps.com/find-a-representative` | **Sucuri/CloudProxy** | — | — | — | **gated** | Apex root 200, but the rep page 403s from the WAF |
| **Sporlan** | HVACR | Parker division page | **AkamaiGHost** | — | — | — | **gated** | Sporlan folded into Parker — same Akamai wall as Parker in `01`. Nothing new here |
| **Busch Vacuum** | Vacuum/air | — | — | — | — | — | **NONE** | `/where-to-buy`, `/service/service-locations`, `/contact/find-your-contact` all 404. Busch runs **direct US representation** out of its own branches |

### 8. Packaging + labeling machinery

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Matthews Marking Systems** | Packaging | `matthewsmarking.com/us-distributors/` (**apex only** — `www.` is Cloudflare-403) | WordPress, static server-rendered list | No (not needed) | company name + street + city/state/ZIP. **No per-record website or phone** | **29 US** (measured) | **easy HTML** | The one open source in this segment. Note the host quirk: apex 200, `www.` 403 |
| **Domino** | Packaging | `domino-printing.com/en-us/contact-us/contact.aspx` | ASP.NET, **inline `distributors` JSON array** | Inline in the HTML | companyName, addressLine1/2, city, postcode, country, phone1, phone2, mobile, fax, **email**, **website**, websiteVanityURL, contactName, companyDesc, **technologyCoverage**, countrySupplied | **1 record, and it is Northern Ireland** | **NONE (US)** | Excellent schema, zero US yield. Domino sells direct in the US. Recorded so nobody re-checks it |
| **Videojet** | Packaging | `videojet.com/us/homepage/about-us/contact-us/sales-and-distributor-search.html` | WordPress + Marketo-style form (`data-formID`) | No | 12 `tel:` — Videojet's own regional offices | — | **not a locator** | Lead capture, no third-party distributor names. Videojet sells direct in the US |
| **Lantech** | Packaging | — | — | — | — | — | **not a locator** | `/find-a-distributor/`, `/distributors/`, `/find-a-dealer/` all 404. Lantech routes buyers through an RFQ form and hand-matches a distributor |
| **Wulftec** | Packaging | — | — | — | — | — | **gated (portal)** | All locator paths 404. Only `/login` ("Distributor Portal") and `/new_distributor` (signup) exist |
| **Loveshaw** | Packaging | — | — | — | — | — | **gated (portal)** | 301s to `signode.com`. Only distributor link is `/ourbrands/little-david/distributor-portal-request/` — an access request |
| **Nordson** | Packaging | `nordson.com/en/global-directory` | **Cloudflare** | — | — | — | **gated** | 403 on every path including root |
| **Signode** | Packaging | — | — | — | — | — | **NONE** | `/where-to-buy/` and `/distributor-locator/` both 404. Contact form + 7 `tel:` for its own facilities |

**Segment counts:** process equipment (8), conveyors & bulk (8), industrial electrical & controls (8), gearing/drives/motors (8), fasteners & industrial supply (7), fluid handling (6), air/gas/vacuum & HVACR (6), packaging & labeling (8). **59 brands assessed. 6 easy-tier (1 easy JSON, 5 easy HTML).**

---

## Fingerprinting detail — every easy-tier find

### SPX FLOW — the best schema in the program

- **Page:** `https://www.spxflow.com/contact-us/sales/` → HTTP 200, 130KB. The distributor UI is an iframe, not part of the page.
- **Iframe:** `https://admin.metalocator.com/index.php?option=com_locator&view=directory&layout=combined_bootstrap&framed=1&tmpl=component&Itemid=18647` → HTTP 200, 164KB. This is **MetaLocator**, one of the five SaaS signatures `01` recommended grepping for. First confirmed hit on that list.
- **Public endpoint:** `GET https://admin.metalocator.com/index.php?option=com_locator&view=location&tmpl=component&task=load&framed=1&format=json&Itemid=18647` → **HTTP 200, 5,470 bytes, JSON array, no auth, no token.** One test fetch, no search params, nothing harvested.
- **What that call returned:** the instance's **field definition set — 26 fields**, which is exactly what is needed to judge the source without pulling records:
  `Group Label`, `SAP Account ID`, `Address`, `Address 2`, `City`, `State`, `Postal Code`, `Phone`, `Fax`, `Date ×2`, `Country`, **`Link ×2` (type `link`)**, `Email` (type `email_form`), `Language ×2`, `category`, `phone2`, **`Representative`**, **`Territories by State`**, **`Territories by Country`**, **`Territories by Postal Code`**, **`Territory by County`**, **`Business Unit`** (type `list`), `SPX FLOW Location`.
- **Website field: YES** — two `link`-typed fields.
- **Tier / line card: YES, and better than anything in `01`.** `Business Unit` is a product-line assignment; the four territory fields say *which geography this distributor is authorized to sell into*. That is the exact sentence the cold-email angle needs, and no firmographic database carries it.
- **Count:** unknown. The directory view is search-scoped, so a national picture needs a query grid. Not attempted.
- **Anti-bot posture:** none observed. Clean 200s to curl on the SPX page, the iframe, and the JSON route. A reCAPTCHA reference exists on the MetaLocator contact form, not the data path.
- **Verdict:** build this first. It is the only easy-JSON find in eight segments, and the schema is worth more than the record count.

### Dorner — the whole US list in one page load

- **Page:** `https://www.dornerconveyors.com/distributors` → HTTP 200, redirects itself to `?country=United+States+of+America` by geo-IP. 279KB.
- **Platform:** WordPress + Google Maps JS. The map is driven by `wp-content/themes/dorner/assets/js/distributors-map.js`, but **the data never leaves the page** — it is a JS array literal, `distributorPlaces`, embedded in the HTML.
- **Measured:** **116 US records. 76 distinct company names. 56 appear at exactly one location.** 37 states represented; the heaviest are California (9), Missouri (9), Ohio (9), Illinois (8), Tennessee (7).
- **Record schema:** `id`, `name`, `address` (single formatted string), `lat`, `lon`, `marker_address_line_1`, `marker_address_line_2`, `tel` (digits), `phone` (formatted), **`email`**, **`url`**, `country`, `type` (array), `is_leading`.
- **Field completeness:** website **114/116**, **email 112/116**, phone 115/116. That is the highest fill rate of any source in either file.
- **Tier: YES** — `type` values are `Distributor` (83), `Premium Distributor` (23), `Manufacturer's Rep` (5), `Authorized Integrator` (1), 4 blank. `is_leading` is present but `false` on every record.
- **Line card:** the page also carries a `markets[]` filter (values 53–57) covering Automation / Food Industry / General Industry — a second segmentation axis, though the labels need a render to decode.
- **Chain contamination:** low but present. Motion Ai (10 sites), Bastian Solutions (8), Clayton Controls (4), United Stamping (4), Olympus Controls (3). Motion Ai belongs on the existing suppression list; the rest are regional and in-ICP.
- **Anti-bot posture:** none. One request, plain curl, no challenge.
- **Verdict:** cheapest good source in the program. One GET, zero infrastructure, and it is the first source carrying email.

> Compliance note: the array was parsed in memory to count fields and companies, then discarded. Only the aggregates above are retained. No records were written to disk beyond the single cached page fetch.

### Interroll — small, static, individually crawlable

- **Page:** `https://www.rollingoninterroll.com/en/global-partner-network/explore/north-am/u-s-a.html` → HTTP 200, 47KB, Joomla.
- **Pagination:** "Page 1 of 2", second page at `?start=9` (and `?start=10` also resolves). **13 distinct US partners across both pages** — measured, not estimated.
- **Fields on the index:** company name and a link to a per-partner child page at `/en/global-partner-network/explore/north-am/u-s-a/{slug}.html`. No address, phone, or website on the index itself.
- **Tier:** none exposed. No Platinum/Gold/Certified vocabulary anywhere in the markup.
- **Anti-bot posture:** none.
- **Verdict:** two requests for the index, thirteen for the details. Worth doing purely because it is that cheap — but it is a rounding error on volume.

### Matthews Marking Systems — clean static list, no website field

- **Page:** `https://matthewsmarking.com/us-distributors/` → HTTP 200, 70KB, WordPress. **Use the apex host.** `www.matthewsmarking.com` returns a Cloudflare 403 on every path; the apex does not.
- **Measured:** **29 US address blocks**, each a company name followed by street and city/state/ZIP. Verified samples: Associated Packaging (Gallatin TN), Alpha Industrial Supplies (Tampa FL), Colony Packaging & Machine (York PA), CodeMark Systems (Dallas TX), Colorado Scale Center (Wheat Ridge CO).
- **Website field: NO.** Four phone numbers site-wide, none tied to individual rows.
- **Tier:** none.
- **Anti-bot posture:** Cloudflare Turnstile is loaded on the page, but the list is server-rendered and the apex host served it without challenge.
- **Verdict:** small and thin on fields, but it is the only thing standing in packaging. 29 named companies with cities is enough to enrich externally.

### FlexLink — facet-filtered Drupal list

- **Page:** `https://partners.flexlink.com/en/partners_list` → HTTP 200, 141KB, Drupal.
- **Facets:** `field_ptn_country_target_id` (country) and `field_ptn_category_target_id` (partner category) as GET params, plus `title` for name search. The US slice is therefore one request.
- **Fields:** company names are server-rendered. Sample from page 1: ALS Mechatronic, AlphaChase Engineering, Automatic Feeder Company, AzLish Technologies, BPE Europe Conveyor Solutions, C&A Systems, EBS Automation, EKF Automation — the unfiltered list skews heavily European.
- **Website field:** not on the index.
- **Anti-bot posture:** none. Note the site also carries a `Partner login` link into a SharePoint tenant — out of scope, untouched.
- **Verdict:** easy but low US volume. Take it as a freebie during the conveyor pass, not as its own project.

### mk North America — rep list, included for completeness

- **Page:** `https://www.mknorthamerica.com/sales-and-support/` → HTTP 200, 6KB. Three phone numbers, a handful of rep names.
- Manufacturer's reps, not distributors. Listed so the segment tally is honest, not because it is worth building.

---

## New SaaS signatures worth adding to the grep list

`01` recommended grepping for `storelocatorwidgets`, `bullseyelocations`, `metalocator`, `storepoint`, `storerocket`, `stockist`. That paid off once (SPX FLOW → MetaLocator). Three more surfaced in this run and should join the list:

- **`yellowmap.de` / `smartmaps.cloud`** — WAGO. A European store-locator service with a REST API namespace (`/api_rst/api/`).
- **`bloomreach.io/delivery/site/v1`** — Simpson Strong-Tie. Headless CMS delivery API; page content, including locator page data, is fetched from a documented public path.
- **`admin.metalocator.com/index.php?option=com_locator`** — the exact iframe shape to grep for, since MetaLocator instances are embedded rather than same-origin. Grepping for the bare word `metalocator` finds them; grepping for `com_locator` finds them faster.

Also worth noting as a *negative* pattern: `wp-json/<custom-namespace>/v1/` is discoverable on WordPress sites but not necessarily readable. Hytrol's namespace listed a `GET /locations` route that returns 401. Discover the namespace, but do not assume the route is open.

---

## Segment-by-segment yield estimate

Estimates are for **new unique US dealer companies** — locations collapsed to companies, before dedupe against the `01` sources, after suppressing the named national chains. Confidence is stated because most of these are inferred from network size, not measured.

| # | Segment | Easy-tier sources | Measured now | Realistic reachable (easy + medium) | Confidence | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Process equipment** | SPX FLOW (JSON) | schema only, count not queried | **200–450** from SPX FLOW; +several hundred if Graco is rendered | low-medium | **Build.** One source carries the segment |
| 2 | **Conveyors + bulk** | Dorner, Interroll, FlexLink, mk NA | **76 + 13 = 89 companies** | **90–130** | **high** (mostly measured) | **Build.** Small, cheap, certain |
| 3 | **Industrial electrical + controls** | none | 0 | 60–150 via Rockwell + Hammond Power | low | **Defer.** Rockwell's distributors mostly exceed the $75M ceiling; five of eight brands are walled |
| 4 | **Gearing, drives, motors** | none | 0 | **250–400** (NORD ~500 NA locations, Yaskawa several hundred, Lenze smaller) | medium | **Build second.** Best volume in the run, but needs XHR work |
| 5 | **Fasteners + industrial supply** | none | 0 | **~0 in-ICP** | high | **Barren. Do not revisit.** |
| 6 | **Fluid handling / hose** | none | 0 | 50–150, and Swagelok's ~200 fail the multi-brand test | low | **Defer.** Danfoss store finder is the only honest target |
| 7 | **Air/gas/vacuum + HVACR** | none | 0 | 150–350 via Gast; Copeland is 1,000+ HVACR wholesalers if the segment is ever prioritized | medium | **Build Gast.** Skip the rest of the segment |
| 8 | **Packaging + labeling** | Matthews Marking | **29 companies** | **~30** | high | **Barren beyond Matthews. Do not revisit.** |

**Program total, easy tier only, available today: ~320–570 US locations → roughly 250–450 distinct companies after chain suppression and cross-file dedupe.** That is a meaningful addition to the `01` base but it does not change the shape of the program — Timken is still the anchor, and these are enrichment sources.

The more valuable outcome is not volume. It is that **four of these sources carry metadata `01` did not have**: SPX FLOW's territory assignments and business unit, Dorner's per-record email and four-way tier, NORD's four-way type code and email, and Yaskawa's product-category filter.

---

## Ranked "worth building" shortlist

Ranked on data richness × access ease × ICP fit, same basis as `01`.

1. **SPX FLOW** — `easy JSON`. The only unauthenticated JSON endpoint in eight segments, and its 26-field schema carries website, email, business unit and **four territory dimensions**. Nothing else in the program tells you which geography a distributor is authorized to sell into. Build the query grid, respect the 3s spacing, cache everything.
2. **Dorner** — `easy HTML`. 116 US records with 98% website fill and 97% email fill, plus a four-level tier, in **one GET with no JavaScript**. Lowest cost-to-value ratio in either file. Do this the same afternoon as SPX FLOW.
3. **NORD** — `medium`. Roughly 500 North American distributors behind a readable JsRender template that exposes company, email, phone, lat/lng and a four-way type code, with per-record vCards at `/nordstores/vcard/{id}`. Highest volume in the run. Cost is one XHR-discovery session against `shop.nord.com`.
4. **Gast (IDEX)** — `medium`. WordPress `admin-ajax` with action `load_distributors`, and the entire client contract is readable in an unminified `distributor.js`. This is the same pattern already earmarked for NTN and Quincy in `01`, so the work is shared across three brands. Pneumatics distributors are a strong ICP match.
5. **Yaskawa** — `medium`. State + radius + **product category** (Industrial AC Drives vs HVAC Drives). The category filter pre-segments the list the way Banjo's Agricultural/Industrial split does, and drives distributors sit squarely in the ICP band.

**Also take, cheaply, while you are in the neighborhood:** Matthews Marking (29 companies, one GET, apex host only), Interroll (13 companies, two GETs), FlexLink US facet (one GET). Together they are under ten requests for ~50 companies.

**Reachable but explicitly not recommended:**

- **Rockwell Automation** — the `public-dashboard` API is the most interesting endpoint name in the run, and the network is the largest in industrial electrical. It is not on the list because Rockwell distributors are mostly $100M+ businesses, above the ICP ceiling. Revisit only if the ICP band is ever widened.
- **Swagelok** — famous distributor model, reachable page, and a hard fail on the ICP definition. Its centers are exclusive single-brand franchises. Multi-brand is not optional in the ICP, so this stays out.
- **Simpson Strong-Tie** — the Bloomreach delivery API makes it the easiest large network here, and its dealers are lumberyards. Wrong buyer.
- **Pentair** — same shape: big network, wrong buyer (pool and water-treatment contractors).

**Barren, do not revisit:** fasteners & industrial supply (7 brands, zero in-ICP yield — 3M and PEM walled, Bossard and Nord-Lock sell direct, SPIROL lists its own offices, Simpson and Henkel off-ICP or hard JS), and packaging & labeling beyond Matthews (7 of 8 brands sell direct, are Cloudflare-403, or hide behind a distributor portal login).

---

## Compliance record for this run

Same binding rules as `01` §Compliance posture. What was actually done:

1. **Public pages only.** Two credential walls were found and left alone: Wulftec's `/login` distributor portal and Loveshaw's `distributor-portal-request`. Neither was probed.
2. **No bypassing anything.** Twelve brands returned Cloudflare, Akamai or Sucuri 403s (Schneider, Littelfuse, Phoenix Contact, SEW-Eurodrive, Sumitomo, Boston Gear, PEM, Nordson, Becker, Sporlan, Donaldson's store host, Matthews' `www.` host) and two stalled automated requests entirely (Eaton, 3M). All recorded as gated and abandoned. No UA rotation, no challenge solving, no retry loops.
3. **401 means stop.** Hytrol's `/wp-json/hyipmap/v1/locations` returned `rest_forbidden`. That was one request. There was no second.
4. **One test fetch per endpoint.** The MetaLocator `format=json` route was called exactly once, with no search parameters, and returned only the instance's field definitions. No location records were requested from it.
5. **Rate limit.** 3s between requests to the same host throughout, one worker per host, every response cached to disk so nothing was re-fetched.
6. **robots.txt.** Per Artur's 2026-08-01 decision a `Disallow` is no longer an automatic exclusion, so no source here was dropped on that basis. Access controls and credential walls remain excluded, and that is what the twelve gated brands above are.
7. **Minimize retention.** The Dorner and Domino inline arrays were parsed in memory for counts and field-fill rates, then discarded. Cached page fetches live only in an ephemeral session scratchpad and were never copied into the repo. Only the aggregates in this document are kept.

**New compliance question this run raises: email.** Dorner, NORD, SPX FLOW and Domino all publish per-dealer email addresses in their locators. `01` had no source that did. Harvested business email from a manufacturer's public directory is usable under CAN-SPAM with a real physical address and a working opt-out — but it changes the outreach surface from "we found you, here is your phone number" to a directly addressable list, and it should be a deliberate decision rather than a side effect of picking these sources. **GATE:HUMAN before any send against locator-sourced email.**

---

## Open items

- **Measure SPX FLOW.** The schema is known; the record count is not. One geo-scoped query will size it. Decide the query-grid cadence first.
- **Resolve NORD's XHR.** The iframe at `shop.nord.com/nordlocations/iframe` renders from a request that was not identified from static analysis. One session with a browser's network tab settles it, and the payoff is the biggest network in the run.
- **Decode Dorner's `markets[]` values** (53–57 → Automation / Food Industry / General Industry / …). The labels are in the rendered select, not the raw HTML.
- **Confirm Alfa Laval has no locator.** Three candidate paths 404'd and a search result pointed at `/contact-us/partners/`, which also 404'd. Either the page moved or it is gone; worth one more look before writing off the largest name in process equipment.
- **Add `yellowmap`, `smartmaps.cloud`, `bloomreach.io` and `com_locator` to the SaaS grep list** for the next sweep, alongside the six from `01`.
- **Decide the email question above** before any of these four sources is built.
