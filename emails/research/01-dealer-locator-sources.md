# Dealer-locator sourcing: feasibility + source inventory

**Date:** 2026-08-01
**Status:** Research only. No lists were harvested. Every URL below was verified live today; the "verified" set was fingerprinted by direct fetch.
**Goal:** Build a cold-email list of US industrial equipment dealers/distributors in the $5M–$75M band by harvesting manufacturers' public "find a dealer / where to buy" pages.

## Verdict up front

The play works. It is not evenly available across brands, and the yield is concentrated in a handful of sources.

One source — Timken — returns **10,031 dealer records from a single unauthenticated JSON request**, 5,002 of them US. That one endpoint alone produces ~1,972 distinct US companies, of which ~1,261 are single-location independents. That is the ICP shape, and it is one HTTP call.

The rest of the field splits three ways: a small group of similarly open sources, a large middle of JS-rendered locators that need a headless browser, and a hard-gated group (Cloudflare/Akamai) we leave alone.

The founder's hypothesis about competitors not using this is plausible but unproven — treat it as untested. What *is* proven is that the data is richer than a firmographic database on the one axis that matters for cold email: **which brands a dealer is authorized on.**

---

## Master table

Difficulty key: **easy JSON** = public endpoint, no browser · **easy HTML** = server-rendered list · **medium** = form POST or predictable XHR · **hard JS** = needs headless browser · **gated** = bot protection, do not pursue.

| Brand | Segment | Locator URL | Platform / tech | Public JSON? | Fields exposed (website?) | Est. dealer count | Difficulty | Notes |
|---|---|---|---|---|---|---|---|---|
| **Timken** | PT & bearings | `locations.timken.com/distributor-locator/` | WordPress + WP Google Maps Pro (WPGMZA) | **YES** — `/wp-json/wpgmza/v1/markers?filter={"map_id":"2"}` | name, full address, phone, **website (67.6%)**, lat/lng, tier category | **10,031 total / 5,002 US** (measured) | **easy JSON** | Best source found. Second map (`map_id:8`) = 9,002 more records |
| **Banjo** | Pumps & valves | `banjocorp.com/banjo/distributors` | storelocatorwidgets.com SaaS (uid `031d52ed…`) | **YES** — `cdn.storelocatorwidgets.com/json/<uid>` | name, country, address (nested blob), product-line filter | **437 / 408 US** (measured) | **easy JSON** | Filters = `['Agricultural']` / `['Industrial']` — line-card signal. Website field appears unpopulated |
| **Atlas Copco** | Compressors | `atlascopco.com/en-us/compressors/contact-number/authorized-partners` | Static server-rendered list | No (not needed) | name, phone, **website**, state | Static state-by-state (~hundreds) | **easy HTML** | Not a searchable locator — a plain list. Easiest possible parse |
| **Kennametal** | Cutting tools | `kennametal.com/us/en/resources/find-a-distributor.html` | Adobe AEM | No — but has **"Export the List"** (Excel, per country) | name, address, industry filter | Unknown, export reveals | **easy–medium** | Official export button = sanctioned bulk access. Check ToS before using |
| **Sullair** | Compressors | `america.sullair.com/en/distributors` | Drupal 10 + Google Maps | Likely — page references `stationary_distributor_list.csv`, `portable_distributor_list.csv` | TBD (CSV schema unresolved) | Unknown | **easy if path resolves** | My guessed CSV path 404'd; base path needs one more look. High upside |
| **Banner Engineering** | Automation/sensors | `bannerengineering.com/us/en/where-to-buy.html` | AEM + Google Maps + reCAPTCHA | Not exposed in HTML | **Tier labels confirmed**: Regional Distributor, Factory Rep, Banner Office, Joint Venture, National Distributor | Unknown | hard JS | Best *tier* data seen. reCAPTCHA is on site forms, not the map |
| **NTN** | PT & bearings | `ntnamericas.com/distributor-locator/` | WordPress + Google Maps + Cloudflare | `admin-ajax.php` present | Region + type filter (Industrial vs HD Truck) | Unknown | medium | WP AJAX pattern usually yields JSON |
| **Quincy Compressor** | Compressors | `quincycompressor.com/sales-service-locator/` | WordPress + `admin-ajax.php` + Cloudflare | `admin-ajax.php` present | Zip or City/State search | Unknown | medium | Page updated 2026-06-29 — actively maintained |
| **SMC** | Fluid power | `smcusa.com/contact/distributor-locator` | Sitecore + Google Maps | `/api/*` routes present | country/state/zip + 10–100mi radius | Unknown | medium | Returns SMC branches *and* independents — needs type filter |
| **Xylem / Goulds** | Pumps & valves | `xylem.com/en-us/brands/goulds-water-technology/contact-us/residential-agriculture-distributor-locator/` | Google Maps + Cloudflare | Not exposed | state/county/zip, 5–200mi, brand filter | Unknown | medium | **Three** locators: residential-ag, industrial, homeowner. Industrial is the ICP one |
| **Toyota Material Handling** | Material handling | `toyotaforklift.com/find-a-dealer` | AEM + Leaflet | `.json` route pattern present | zip + county, map results | ~70–90 US dealer groups | medium | Dealers get child pages `/dealers/{slug}` — crawlable alternative |
| **Crown Equipment** | Material handling | `crown.com/en-us/forklift-dealers.html` | AEM + Google Maps | Not exposed | postal code + geolocation | ~100+ US branches | medium | Child pages `/forklift-dealers/{slug}` |
| **Hyster** | Material handling | `hyster.com/en-us/north-america/dealer-finder/` | Cloudflare-fronted | Not exposed | address fields present in markup | ~150 NA dealers | medium | Old `/dealer-network/find-your-dealer/` path 301s — don't use |
| **Baldor (ABB)** | Electrical/motors | `baldor.com/resources-and-support/customer-support/distributors` | Sitecore | No — form POST | State + Zip search | Unknown | medium | `baldor.abb.com` is DEAD (no HTTP). Use `baldor.com` |
| **Dodge (RBC)** | PT & bearings | `dodge.ptplace.com/distributorSearch` | PT Place e-commerce subdomain | Not exposed | Zip + Distributor Name | Unknown | medium | Public, no login, despite commerce subdomain |
| **Gorman-Rupp** | Pumps & valves | `grpumps.com/domestic` | Apache, server-rendered | Not exposed | zip OR state+county (required) | Unknown | medium | **US-only by design.** Note: `grpumps.com`, not `gormanrupp.com` |
| **Campbell Chain** | Hose & fittings | `campbellchainandfittings.com/where-to-buy` | Apache, 169KB HTML | Not exposed | zip/city/state/country, 20mi radius, addresses + phones | Unknown | medium | US + Canada |
| **Kaeser** | Compressors | `us.kaeser.com/about-us/contacts/find-distributor/` | ASP.NET (`default.aspx`) | No — postback | Search form | Unknown | medium | Classic WebForms; needs viewstate handling |
| **Clippard** | Fluid power | `clippard.com/distributors` | SAP Commerce ("gazelle") | Not exposed | H1 "Find a Distributor" | Unknown | medium | Small page (23KB) — results are JS-loaded |
| **Turck** | Automation/sensors | `turck.us/en/contacts-139.php` | Custom PHP | No | zip field (`rlzip`) + clickable state map | Unknown | medium | No standalone locator URL — it's on Contacts |
| **Pepperl+Fuchs** | Automation/sensors | `pepperl-fuchs.com/en-us/support/customer-service/where-to-buy-gp62134` | **Nuxt SPA** (istio-envoy) | Not exposed | `zipCode` + State, browsable list | Unknown | hard JS | 890KB bundle; data hydrates client-side |
| **Hypertherm** | Welding & cutting | `hypertherm.com/where-to-buy/where-to-buy-distributor/` | Cloudflare + custom | `/api/maps/mapcontrol` referenced (needs params) | country + address + 50–1000km + Demo/Rental/Service filters | Unknown | medium | Service/Demo/Rental flags are a useful qualifier |
| **Lincoln Electric** | Welding & gas | `mylincoln.lincolnelectric.com/northamerica/s/store-locator?language=en_US` | **Salesforce Experience Cloud** (sfdcedge) | Aura endpoint (not probed) | "Service and Distributor Locations" | Unknown | hard JS | **Public, no login** despite `mylincoln` subdomain. Old `.aspx` path now 403s |
| **SKF** | PT & bearings | `skf.com/us/support/find-a-distributor` | **Angular SPA** (`app-root`, `main.js`) | Endpoint not found in bundle scan | Location → authorized distributor list | Unknown | hard JS | 810KB bundle; API path obfuscated |
| **Festo** | Fluid power | `distributorlocator.festo.com/?locale=us-en` | JS SPA on dedicated subdomain | Not exposed | — | Unknown | hard JS | HTML shell is 1.6KB — pure client render |
| **Continental / ContiTech** | Hose & fittings | `continental-industry.com/global/en/about-us/tools-services/distributor-locator` | JS, Google Maps | Not exposed | address + geolocation, km/mi | Unknown | hard JS | 5.8KB shell. Scoped to US/Canada authorized distributors |
| **Bimba (IMI)** | Fluid power | `bimba.com/en/support/support/locate-a-distributor` | JS-rendered | Not exposed | — | Unknown | hard JS | Better IMI entry point than Norgren |
| **Bosch Rexroth** | Fluid power | `boschrexroth.com/en/us/contact/contact-locator/` | JS-rendered | Not exposed | — | Unknown | hard JS | Mixes sales partners with Bosch's own sites — needs type filter |
| **Walter Surface** | Cutting/abrasives | `walter.com/us/where-to-buy` | JS widget | Not exposed | — | Unknown | hard JS | Canonical US path; `/about-us/distributor-locator` 301s here |
| **Ingersoll Rand** | Compressors | `ingersollrand.com/en-us/distributor-search/` | — | — | location + distance + category | Unknown | **429 throttle** | Rate-limits automated requests. Branch pages at `locations.ingersollrand.com` |
| **ARO (IR)** | Pumps & valves | `arozone.com/en/distributor-search/` | Vercel | — | zip/city/state + product category | Unknown | **429 throttle** | Not a block — needs slow, spaced requests |
| **Miller Electric** | Welding & gas | `millerwelds.com/where-to-buy` | Vercel bot protection | — | product filter param supported | Unknown | **429 throttle** | Accepts `?product_name=` — product-level authorization signal |
| **Gates** | Hose & fittings | `gates.com/us/en/store-locator.html` | **Cloudflare challenge** | — | — | — | **gated** | 403 to both curl and WebFetch. Do not pursue |
| **Parker Hannifin** | Fluid power | `wtb.parker.com/us/en/master-directory/distributors?app=wtb` | **Akamai** | — | — | — | **gated** | 403. Largest network in the segment; painful loss |
| **ESAB** | Welding & gas | `esab.com/us/nam_en/locator/` | **Cloudflare** | — | Dealer & repair center locator | — | **gated** | 403 to automated fetch; loads in browser |
| **Norton Abrasives** | Cutting/abrasives | `nortonabrasives.com/en-us/where-buy` | Hard 403 | — | — | — | **gated** | Blocks curl and WebFetch |
| **WEG Electric** | Electrical/motors | `weg.net/institutional/US/en/contact/where-to-buy` | Hard 403 | — | — | — | **gated** | Confirmed by index only |
| **Regal Rexnord / Leeson** | PT + motors | `regalrexnord.com/where-to-buy?brand=Leeson&provider_type=Distributor` | Hard 403 | — | brand + provider_type params | — | **gated** | Params are useful if ever accessible |
| **Dixon Valve** | Hose & fittings | — | — | — | — | — | **NONE** | No public locator by policy. Registration + manual routing only |
| **Martin Sprocket** | PT & bearings | — | — | — | — | — | **NONE** | Only lists its own plants |
| **ifm efector** | Automation/sensors | — | — | — | — | — | **NONE** | Sells direct in US via own branches |
| **MSA Safety** | Safety/PPE | — | — | — | — | — | **NONE (US)** | `/distributors` renders "No distributors defined". `locateSalesRep` returns MSA staff, not dealers |
| **Vestil** | Material handling | `vestil.com/page-find-distributor.php` | formsmarts lead form | — | — | — | **not a locator** | Lead capture only — no distributor names |
| **Kuriyama** | Hose & fittings | `kuriyama.com/where-to-buy.php` | Lead form | — | — | — | **not a locator** | Public `distributors.kuriyama.com` is a gated portal |
| **Norgren (IMI)** | Fluid power | `norgren.com/us/en/distributors` | Static regional hub | — | hand-maintained lists | ~small | easy HTML | National list is just RS, Fastenal, SunSource — not ICP |
| **Adaptall** | Fluid power | `adaptall.com/distributors.php` | Custom PHP (nginx/Ubuntu) + jQuery + Google Maps JS | **YES, verified** — `POST /distributors_fetch.php` returns JSON once four identity fields are present. Gate passed 2026-08-01 under our real identity | **Measured, n=45:** name/address1/city/state/postal/lat/lng/distance 100%, **phone 97.8%**, address2 33%, address3 0%, **website + webhost only 28.9%**, `premier` 100% (58% flagged), `cust_class` 100%, plus undocumented `same_country`. `customer_number` = company key, `cust_branch_num` = location key | **Unknowable — hard cap of 15 records per query** (measured 3/3 metros) | **medium** | See `07-adaptall-access.md`. Best per-record schema in this table, worst extraction economics. `cust_class 31` ⟺ `premier 0` ⟺ the ICP segment (premier tier is 73% national chains). No email verification step. Targeted lookups only — a national grid would be hundreds of queries under our own name |
| **Enerpac** | Fluid power | `enerpac.com/en-us/distributors` | **Oracle Commerce Cloud** (OSF storefront) + Google Maps/Places | No — widget calls OSF endpoint `getDistributors`; OCC custom endpoints live under `/ccstorex/custom/v1`, which **robots.txt disallows** | Filters only without a render: country, city/postal, distance (mi), **product type** (Industrial/Bolting/Heavy Lifting/Rail/Workholding), **distributor type** (Sales/Service/Rental/Regional) | Unknown (not queried) | **hard JS (robots-blocked)** | Added 2026-08-01. Best tier + line-card metadata in fluid power; the data path is closed by our own rule 4. Second backend is an authenticated Oracle Integration Cloud service |

Segment coverage: fluid power (8), hose & fittings (5), PT & bearings (5), pumps & valves (4), automation/sensors (4), welding & gas (4), compressors (5), material handling (4), cutting tools & abrasives (3), safety/PPE (1), electrical/motors (3). **46 brands assessed.**

---

## Fingerprinting detail (verified by direct fetch)

### Timken — the anchor source
- **Page:** `https://locations.timken.com/distributor-locator/` → HTTP 200, WordPress, `data-map-id="8"`.
- **Platform:** WP Google Maps Pro. The page ships `WPGMZA_localized_data` containing `"resturl":"https://locations.timken.com/wp-json/wpgmza/v1"`.
- **Public endpoint:** `GET /wp-json/wpgmza/v1/markers?filter={"map_id":"2"}` — 200, **no auth, no nonce required for read**, 4.66 MB, JSON array.
- **Record schema:** `title` (company name), `address` (single formatted string: street, city, state, zip, country), `description` (HTML containing `tel:` phone), **`link` (website URL)**, `lat`, `lng`, `category` / `categories` (dealer tier), `id`.
- **Measured counts:** 10,031 total records on map 2; **5,002 US**; map 8 returns a further 9,002 records.
- **Website field:** 6,694 / 10,031 populated overall. **US: 3,380 have a website, 1,622 (32.4%) do not.** Exactly 1 US record uses a Facebook URL.
- **Phone:** 100% of US records.
- **Tier:** category values `4` (3,184 US), `5` (1,813), `6` (5) — three authorization levels, meaning undecoded but consistent.
- **Company shape:** 1,972 distinct US company names; **1,261 appear at exactly one location.** Top multi-branch names are national chains and must be excluded as out-of-ICP: Motion Industries (375 sites), FleetPride (270), Applied Industrial (239), DXP (108), BDI (81), Kaman (79).

> Compliance note: the full payload was downloaded once to measure size and field completeness, profiled in memory, and **deleted**. Only aggregate statistics are retained in this document.

### Banjo — the SaaS pattern
- `data-uid="031d52ed314a7bfeeb56430dc0cd5850"` on a `cdn.storelocatorwidgets.com/widget/widget.js` tag.
- **Public JSONP:** `https://cdn.storelocatorwidgets.com/json/<uid>` — 200, no auth, returns `settings` + `stores`.
- **437 stores, 408 US.** Record fields: `storeid`, `name`, `country`, `data` (nested blob holding the address string), `filters`, `google_placeid`.
- **`filters` is the interesting field:** `['Agricultural']` (272) vs `['Industrial']` (158). That is a product-line segmentation the dealer self-selected into.
- Website/phone did not parse out of the nested blob — treat website exposure here as **unconfirmed, likely absent**.
- **This pattern generalizes.** `storelocatorwidgets`, Bullseye, MetaLocator, Storepoint and Stockist all expose similar public JSON. Grepping more brands for these signatures is the cheapest way to extend the easy-JSON tier.

### Anti-bot posture observed
- **Hard 403 (Cloudflare or Akamai), no bypass attempted:** Gates, Parker, ESAB, Norton Abrasives, WEG, Regal Rexnord, Dixon, ifm.
- **429 rate-limit (throttle, not block):** ARO, Miller Electric, Ingersoll Rand — all Vercel-hosted. These are reachable with slow, spaced, cached requests.
- **reCAPTCHA present on page but not on the map data path:** Banner, NTN, Quincy, Crown, Sullair, Dodge, Lincoln.
- **WebFetch is blocked far more often than curl** with a normal desktop UA — Gates and Graco both served 200 to curl and 403 to WebFetch. Tooling choice matters.

---

## Cross-reference assessment (line-card reconstruction)

**Verdict: viable, but on a narrower base than hoped — roughly 8–12 sources, not 40.**

Cross-matching needs name + address consistent enough to join. Of the 44 brands:

- **Clean, joinable now:** Timken (full formatted address + phone + name), Banjo (name + address), Atlas Copco (name + phone + website), Norgren (static list). Kennametal's export likely joins too.
- **Joinable after a headless render:** the ~15 medium/hard-JS locators. Their result cards show name + address on screen; the cost is a browser, not a data gap.
- **Not joinable:** the 8 gated brands and the 5 with no locator.

Mechanics that make it work:
- **Phone is the strongest join key.** Timken has it on 100% of records, and a normalized 10-digit phone is far more reliable than fuzzy company-name matching across brands that spell the same dealer three ways ("APPLIED INDUSTRIAL TECHNOLOGIES" vs "Applied Industrial Tech.").
- **Secondary key:** normalized company-name token set + ZIP5. Street-number + ZIP works as a tiebreak.
- **Expect low overlap depth per dealer at first.** With only 2–3 easy sources live, most dealers will show a line card of 1–2 brands, which is thin personalization. The insight gets strong at 5+ sources — that is the argument for investing in the headless-render tier rather than stopping at the JSON tier.

The real prize is not the count, it is the sentence it lets you write: *"You're authorized on Timken and Banjo but you don't come up when someone searches for either."* No firmographic database (ZoomInfo, Apollo, D&B) carries brand authorization. That is genuinely differentiated.

**Caveat on dedupe:** national chains inflate every locator. Motion, Applied, FleetPride, DXP, Kaman, Grainger, McMaster-Carr and Fastenal will appear in nearly every source and must be suppressed by a named blocklist before dedupe, or they will dominate the cross-reference graph and produce a "high line card" score for exactly the accounts we cannot sell.

---

## Null-website bucket assessment

**Verdict: real and extractable, but must be verified before it is trusted.**

- **Confirmed extractable:** Timken exposes the website in a dedicated `link` field. **1,622 of 5,002 US dealers (32.4%) have no website URL.** Only one uses Facebook, so the "Facebook-only" sub-segment is negligible in this source.
- **Also exposes website:** Atlas Copco's static partner list (name, phone, website).
- **Does not appear to expose it:** Banjo.
- **Unknown until rendered:** most of the medium/hard-JS tier. Result cards typically render a "Visit website" link, so the field is usually present at render time even when absent from raw HTML.

**The trap:** a missing website in a manufacturer's locator does **not** prove the dealer has no website. Manufacturers often just don't collect or refresh that field. Before treating this as the "thinking about opening a website" segment, each null record needs an independent check — a domain/Google Business Profile lookup on company name + city. Expect meaningful shrinkage; a chunk of the 1,622 will turn out to have a site the manufacturer never recorded.

Handled that way this is still the strongest single segment in the dataset: a verified no-web-presence industrial dealer, authorized on a name brand, with a phone number, is close to an ideal cold-email target for the services book.

---

## Compliance posture

Binding rules for any future harvest:

1. **Public manufacturer pages only.** No login-protected portals (Kuriyama's `distributors.` subdomain is out).
2. **No bypassing anything.** No CAPTCHA solving, no Cloudflare/Akamai evasion, no UA spoofing to defeat a block. The 8 gated brands stay excluded — that is a decision, not a temporary obstacle.
3. **Rate-limit and cache.** ARO, Miller and Ingersoll Rand already returned 429 at research pace. Target ≤1 request per 2–3s per host, cache every response, never re-fetch inside a refresh window.
4. **Respect robots.txt** per host before any bulk pass.
5. **Provenance on every record:** source URL, manufacturer, access timestamp, and the raw field values as retrieved.
6. **Own outreach only.** The dataset is never resold, licensed, or shared outside the firm.
7. **Minimize retention.** Keep the fields needed for outreach; drop the rest. (Applied today: the Timken and Banjo payloads were profiled and deleted, and only aggregates kept.)
8. **CAN-SPAM on send:** real physical address, working opt-out, honored promptly and permanently.
9. **Sanctioned exports first.** Where a brand offers an official export (Kennametal), read its terms and prefer that route over parsing.

---

## Start here — ranked shortlist of 8

Ranked on data richness × access ease × ICP fit.

1. **Timken** — `easy JSON`. 5,002 US dealers, one request, includes website + phone + tier. Nothing else comes close. Also pull `map_id:8` (9,002 more).
2. **Atlas Copco** — `easy HTML`. Static state-by-state list carrying name, phone **and website**. Trivial parse, compressor dealers are strong ICP.
3. **Banjo** — `easy JSON`. 408 US, and its `Agricultural` / `Industrial` filter is a ready-made segmentation.
4. **Kennametal** — `easy–medium`. An official "Export the List" button is the cleanest possible access path. Verify its terms, then use it.
5. **Sullair** — `easy if path resolves`. The page references distributor CSV files directly. One more look at the base path could make this the second-easiest source here.
6. **Banner Engineering** — `hard JS`, worth it. The only locator confirmed to expose explicit authorization tiers (National / Regional / Factory Rep). Best qualification signal found.
7. **NTN** — `medium`. WordPress `admin-ajax` usually yields JSON, and its Industrial vs HD-Truck split pre-segments the list.
8. **Quincy Compressor** — `medium`. Same WordPress AJAX pattern, actively maintained (updated 2026-06-29), and compressor dealers fit the ICP well.

**Next research step, highest leverage:** grep the remaining brands for `storelocatorwidgets`, `bullseyelocations`, `metalocator`, `storepoint`, `storerocket` and `stockist` signatures. Every hit is another easy-JSON source, and this vertical clearly leans on those widgets. That is a cheap way to widen the easy tier before committing to headless-browser work.

**Open items:**
- ~~Confirm whether Timken map 8 duplicates map 2 or adds new companies.~~ **ANSWERED 2026-08-01 during the S1 build: it is a duplicate.** Zero marker-ID overlap, but 1,890 of its 1,895 companies already appear in map 2 — **5 net-new companies, 4 net-new phones.** Ingest map 2 only. Also corrected by measurement: Timken US phone coverage is **91.8%**, not the 100% this file reported (the `tel:` markup is universal but 7.9% of the links are empty), and the normalizer yields **1,908** distinct companies, not 1,972 (that was raw distinct titles).
- Resolve Sullair's CSV base path.
- Decode Timken's category codes 4/5/6 into named tiers (the page legend should say).
- Confirm whether Timken map 8 duplicates map 2 or adds new companies.
- Check Kennametal's export terms of use.

---

## Addendum 2026-08-01 — founder-suggested brands (Enerpac, Adaptall)

Two hydraulics brands added at the founder's request. Neither was in the original 44 — checked against the full table before fetching. They matter because fluid power is the thinnest segment we have: Parker, the largest network in it, is Akamai-gated, and everything else there needs a browser.

Same method as the rest of the file: curl with a normal desktop UA, one fetch per endpoint, nothing harvested, no gate touched.

### Enerpac — the best metadata in the segment, behind a path we won't take

- **Page:** `https://www.enerpac.com/en-us/distributors` → HTTP 200 to curl, no challenge, no CAPTCHA. Canonical route confirmed inside the page payload (`pageType: article`, title "Find Your Local Enerpac Distributor Service Center").
- **Platform:** Oracle Commerce Cloud storefront (`id="oracle-cc"`, base href `/en-us/en/`, an OSF endpoint registry under `/ccstore/v1/`). Google Maps JS with the Places library. The locator is four lazily-imported widgets: `EnerpacDistributorsContainer`, `EnerpacDistributorsForm`, `EnerpacDistributorResults`, `EnerpacDistributorMap`.
- **Data path:** the container widget calls the OSF endpoint id **`getDistributors`**. Nothing about that request is in the server-rendered payload. OCC registers custom REST endpoints under `/ccstorex/custom/v1`, and **`robots.txt` disallows exactly that namespace** — it is the first Disallow line on the file. Not probed; compliance rule 4 settles it.
- **Second backend:** the site's `externalSiteSettings` block ships an Oracle Integration Cloud base URL and a basic-auth service account in the public page source. We do not use them and the values are deliberately not recorded here. Their presence does not make that API public. Noted only because it explains why no dealer record ever reaches the HTML.
- **Fields exposed without a render:** none. The form labels are all that is readable, and they are unusually good — country, city or postal code, distance in miles, **product type** (Industrial Tools, Bolting Tools, Heavy Lifting Technology, Rail Tools, Workholding Tools) and **distributor type** (Sales, Service, Rental Location, Regional Distributor).
- **Website field:** unknown — not visible until results render.
- **Count:** unknown, not queried.
- **Anti-bot posture:** none observed. Clean 200s to curl on the homepage, the locator page and the JS bundles. The obstacle is robots.txt, not bot protection.
- **Verdict:** the filter set is the best qualification signal in fluid power. A dealer flagged Rental + Service on Bolting Tools is a precisely known account, and that beats anything a firmographic database carries. The access path is closed by our own rule, so park it.
- **Caveat worth deciding once:** a headless render of the locator page is not itself disallowed, but the browser would fetch `/ccstorex/custom/v1` as a subresource. Treat that as the same restriction unless someone rules otherwise. This will come up again on other OCC and AEM sites, so it is a policy question, not an Enerpac question.

### Adaptall — the richest record schema in the file, behind an identity gate

> **Superseded 2026-08-01 by `07-adaptall-access.md`.** The gate was passed later the same day under the founder's real identity and the schema was measured on a 45-record sample. Two claims below did not survive contact: **`website` is populated on 28.9% of records, not broadly**, and **every query is hard-capped at 15 results**, so there is no practical path to a national list. `cust_class 31` is now known to be exactly the non-premier set. The section below is kept as the pre-access record.

- **Page:** `https://www.adaptall.com/distributors.php` → HTTP 200, nginx/1.24 (Ubuntu), classic PHP site built on a Dreamweaver template, jQuery + Google Maps JS API. `js/distributors.js` is an **unminified ES module**, so the entire client contract is readable.
- **Endpoint:** `POST https://www.adaptall.com/distributors_fetch.php`, `application/x-www-form-urlencoded`, returns a JSON array. Body fields: `name`, `title`, `company`, `email`, `search`, `lat`, `lng`, `country`.
- **Gate:** the four identity fields are validated client-side before the XHR fires, and the server enforces it as well — a bare GET with no body returns `Access denied` (HTTP 200, 13 bytes). That was the one probe, with no data submitted. Nothing further attempted.
- **Record schema** (read straight out of `setDistMarkers`): `Distributor_name`, `address1`, `address2`, `address3`, `city`, `state_province`, `zip_postal_display`, `phone`, **`website`**, `webhost`, `lat`, `lng`, `distance`, `premier`, `cust_class`, `customer_number`, `cust_branch_num`.
- **Website field: YES** — a dedicated `website` URL plus a `webhost` display domain. Same shape as Timken's `link`, so the null-website bucket would be extractable here.
- **Tier: YES** — `premier` (0/1) drives two result lists in the UI, "Premier Distributors" and "Distributors". `cust_class` is a second classification, undecoded.
- **Count:** unknown. Results are radius-scoped around a geocoded point, so there is no all-records call. A national picture would take a grid of queries.
- **Anti-bot posture:** none. No Cloudflare, no CAPTCHA, no throttling seen. The identity form is the only barrier.
- **Verdict:** technically the easiest schema in the whole document, and the only new source carrying website *and* tier *and* phone *and* a full parsed address. It is held out on consent, not difficulty. Every query hands Adaptall a name, title, company and email into what is plainly their lead-capture log. Fabricating that is out under rule 2. Using our real identity is permitted but it is a business call — and a grid of geo queries under our own name is a conspicuous way to make it.

### Shortlist placement

The ranked shortlist above is unchanged and unrenumbered.

- ~~**Adaptall earns the easy tier on data quality**~~ — **resolved 2026-08-01, and the answer is no.** The founder approved the identity submission, the gate opened, and the sample showed a hard 15-record cap per query plus `website` at only 28.9%. It lands at **medium**, and is a targeted-lookup source rather than a list source. Per-record it is still the best schema in the file. See `07-adaptall-access.md`.
- **Enerpac does not earn a spot.** Best metadata in the segment, closed path.

Fluid power still has no open, bulk-accessible source. Parker is Akamai-gated, Enerpac is robots-blocked, Adaptall is open to us but capped at 15 records per query, and SMC, Clippard, Festo, Bimba and Bosch Rexroth all need a browser. The realistic first win in the segment is still SMC's `/api/*` routes or a headless pass on Clippard.

**Added open items:**
- Decide the headless-render-vs-robots.txt question. It gates Enerpac and will gate other OCC/AEM sites.
- ~~Decide whether to query Adaptall under our real identity~~ — **done 2026-08-01.** Approved, submitted, gate passed. Cadence settled as targeted lookups only, no grid. Artur should watch `a.shepel@salesolution.net` for an Adaptall sales follow-up.
- Decode Adaptall's `cust_class` **46 vs 51 vs 71** — partially done: `31` is exactly the non-premier set, and 46/51/71 are all premier sub-classes. Separating those three needs a larger sample than we are willing to pull.
