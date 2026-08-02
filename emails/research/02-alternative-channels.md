# Alternative + creative prospect-sourcing channels

**Scope:** US industrial equipment dealers / distributors and $5M–$75M industrial & technical distributors, for cold email.
**Explicitly out of scope** (covered elsewhere): plain Apollo firmographic search; manufacturer dealer locators.
**Researched:** 2026-08-01. All checks run from a browser user-agent, rate-limited, public endpoints only.

**Compliance posture applied throughout:** public data only. No LinkedIn scraping. No Google Maps bulk extraction. No login walls, no CAPTCHA/bot-gate bypass. Member-gated directories are killed unless a genuinely public roster page exists. Every recommended channel below has a captured source URL + capture date. Anything that returned a Cloudflare / DataDome / JS bot challenge was killed rather than worked around.

**Scoring key**
- **Uniqueness** 1–5: how unlikely a competitor's list-building is to already contain this.
- **Yield**: estimated unique US companies reachable.
- **Effort**: build + maintain cost for the extraction.

---

## 1. Trade-association member directories

Thirteen associations checked. **Verdict: almost all are login-gated.** The industry standardized on AMS platforms (iMIS, Novi AMS, MemberClicks, Salesforce) that put the roster behind auth. Two exceptions are genuinely public and both are worth building.

### 1a. PTDA — Find a Distributor — **PUBLIC, RECOMMENDED**

- URL: `https://www.ptda.org/PTDA/Members/Member-Lists/Locators/Find-a-Distributor.aspx`
- Status: HTTP 200, no login. The `distributor-list.aspx` URL that shows up in Google **404s** — the working entry point is the locator above.
- **Verified by executing a real search.** It is an ASP.NET WebForms postback (iMIS). Submitted `Input0$TextBox1=60602`, `Input1$DropDown1=1` (United States), `Input3$DropDown1` (proximity), `SubmitButton=Find`. Returned HTTP 200, 95,850 bytes, 31 table rows.
- **Fields returned per record:** company name, full street address, city/state/ZIP, phone, toll-free, fax, **website**, and distance. Example rows captured: `Motion | 1361 S Jefferson St, Chicago IL 60607 | (312) 850-3700 | www.MotionIndustries.com`; `Bearing Headquarters`-class independents appear alongside the majors.
- Also filterable by 14 product categories (bearings, belt & chain drives, gearing, hydraulics & pneumatics, linear motion, pumps, …) — useful for segmenting the pitch.
- `robots.txt` checked: disallows only iMIS system paths (`/iParts/`, `/Core/`, `/AsiCommon/`, …). The locator path is **not** disallowed.
- **Caveat on yield:** results skew to the national chains (Motion, Grainger branch records) because they have the most branches. The $5–75M independents are in there but need dedup by company name and removal of the majors.
- Est. yield: **~300 member companies**, expanding to 1,500+ branch-level records across a national ZIP sweep.
- Effort: **Medium** — needs viewstate/postback handling plus a ZIP-seed sweep and branch→company dedup.
- Uniqueness: **4/5**

### 1b. GAWDA (gases & welding) — partial

- `https://www.gawda.org/members-directory/` is reachable but the substance sits behind "Members Only".
- `https://gawdamedia.com/memdir/` (GAWDA Media) is public and returns real member content; the deeper `buyersguide.gawdamedia.com` returns a **JS challenge page** (`challenge.html?redirect_to=/`) — killed, not bypassed.
- GAWDA is documented at 260+ distributor members / 230+ suppliers.
- Verdict: **low-yield, partial.** Worth a manual pass, not an automated build.

### 1c. Killed — gated (evidence)

| Association | Directory URL | What blocked it |
|---|---|---|
| **STAFDA** (specialty tools & fasteners) | `stafda.org/member-directory/` | Page is public but data comes from `stafda.mpxapi.com/api/v1/Organizations/Members/All/{page}` behind `/signup/authenticate`. Page states: *"provided for the personal, confidential use of members… No part of this Directory may be reproduced."* **Compliance kill, not a technical one.** |
| **NAHAD** (hose) | `members.nahad.org` | Login wall; 0 external domains exposed |
| **ISA Partners** (industrial supply) | `isapartners.org/membership-directory/` → `member.isapartners.org/member-directory` | Novi AMS OAuth login |
| **NAED** (electrical) | `members.naed.org/memberdirectory` | "please log in" |
| **MHEDA** (material handling) | `mheda.org/membership-directory/` | Redirects to `members.mheda.org`; the Salesforce file link returns a 1.5KB HTML shell, not a directory |
| **FPDA** (fluid power) | `fpda.org/aws/FPDA/pt/sp/directory` | "Members Only Directory" |
| **AHTD** (automation) | `ahtd.org/custom_memberdirectory.asp` | Sign-in required |
| **BSA** (bearing specialists) | `members.bsahome.org` | **Cloudflare 403** interstitial |
| **AED** (equipment dealers) | — | No public dealer locator exists; directory is a member benefit |
| **NIBA** (belting) | `niba.org` | No directory link discoverable from homepage |
| **ISSA** (jan-san) | `issa.com/membership/member-directory/` | Redirects to homepage — path does not exist |

> **Note on AED:** worth a manual revisit only because equipment dealers are a named ICP. But there is no programmatic public surface.

---

## 2. Buying / marketing groups

**This is where the best find is.** Buying-group membership is a near-perfect ICP filter: you must be an *independent* distributor (excludes Grainger/Fastenal/Motion) and large enough to matter (excludes one-truck shops). That is the $5–75M band, pre-qualified, for free.

### 2a. Affiliated Distributors (AD) — Member Locator — **PUBLIC, TOP RECOMMENDATION**

- URL pattern (GET, no auth): `https://www.adhq.com/resources/member-locator?location=Chicago%2C+IL&industries=ISD,BPT,PVF`
- The on-page form POSTs, then **302-redirects to a plain GET URL with query params** — so results are directly addressable and cacheable. Confirmed redirect: `location: https://www.adhq.com/resources/member-locator?location=Chicago%2C+IL&industries=ISD,BPT,ISC`
- **Division codes** (from the form markup): `BPT` Bearings & Power Transmission · `ISD` Industrial, Safety and Construction · `PVF` Pipe, Valves & Fittings · `ESD` Electrical · `GSD` Gypsum Supply · `HVAC` · `PLBG` Plumbing · `WWD` Waterworks · `BSDC` · `DBP` · `ISC`.
- **Fields per record** (clean `<div class="map-row">` blocks — `company-title`, `company-industry`, `company-address`, `tel:` link, `Visit Website` link, `data-branch-id`): company name, AD division, street address, city/state/ZIP, phone, **website**, distance.
- **Yield measured, not guessed.** Swept 20 metro seeds against only 3 of 11 divisions (`ISD,BPT,PVF`), 2.5s delay between requests:

```
Chicago, IL        rows= 32  cumulative_companies=  23  with_website=  20
Houston, TX        rows= 24  cumulative_companies=  46  with_website=  41
Atlanta, GA        rows= 27  cumulative_companies=  67  with_website=  62
...
Philadelphia, PA   rows= 64  cumulative_companies= 217  with_website= 198
Detroit, MI        rows= 32  cumulative_companies= 245  with_website= 226
Milwaukee, WI      rows= 23  cumulative_companies= 301  with_website= 278

UNIQUE COMPANIES: 301 | WITH WEBSITE: 278
```

- Audited the output CSV afterwards: of the 301 records, **275 carry a real company website** (91.4%), 23 have none, and 3 were map-link artifacts from a loose fallback regex (fixed in the script). Use **275/301** as the honest capture rate.
- The curve had **not flattened** at 20 seeds. Extrapolating to a full state/ZIP sweep across all 11 divisions: **1,000–1,500 unique independent distributors**, ~91% with a website captured directly.
- Sample of what comes back — note these are exactly the target profile, not the majors: `Bearing Headquarters Co.`, `Chicago Chain & Transmission`, `Weimer Bearing & Transmission`, `Bearings and Industrial Supply Co, Inc.`, `Illco, Inc.`, `Porter Pipe & Supply Co.`, `Accent Bearings`, `Apex Industrial Automation`, `Chicago Tube & Iron`.
- Results are **not strictly geo-bounded** — a Chicago query returned Urbana IL, Akron OH and Alpena MI records, so a modest seed set covers a lot of ground.
- `https://www.adhq.com/robots.txt` returns **404 — no crawl directives at all.** No login, no bot gate, no rate limiting observed.
- Bonus: `https://www.adhq.com/industries-served/gypsum-supply/company-listing` is a **single static page linking 106 distributor domains** directly. Only the Gypsum division publishes one (confirmed against `adhq.com/sitemap.xml`, 88 URLs) — gypsum is a weaker ICP fit, but it is 106 free records in one request.
- Est. yield: **1,000–1,500**
- Effort: **Low** — plain GET, stable HTML, no JS, no auth.
- Uniqueness: **5/5**

### 2b. Sphere 1 — roster gated, but **the press releases are not** — see §8a

- `sphere1.coop/sphere1-members/` and `/member-locator/` both **302 to `/sign-in/`**. Gated.
- The workaround is legitimate and public — covered as my own addition in §8a.

### 2c. Killed

- **NetPlus Alliance** — `netplusalliance.com/distributors/` is a marketing page. No public roster; members sit behind `portal.netplusalliance.com`. Killed.
- **SupplyForce** — `supplyforce.com` redirects to `mysupplyforce.com`, a member portal. Killed.
- **Evergreen Marketing Group** — homepage returned nothing crawlable; no roster surface found. Killed.
- **IBC** — reachable, no public member roster found. Killed (low confidence — worth 10 minutes manually if AD underdelivers).

---

## 3. Industrial directories

| Directory | Status | Verdict |
|---|---|---|
| **Thomasnet** | Profiles are public to the eye, but the catalog is behind **DataDome** bot protection and there is no feed. Third-party scrapers exist on Apify; using them means paying someone else to breach the gate. | **Killed on compliance.** The compliant substitute is SERP-side extraction (§7). |
| **IndustryNet** | `industrynet.com` returns HTTP 200 and is a genuinely public buyers guide; the `/search` path I tried 404'd, so the query surface needs mapping. | **Low priority.** Public, but it is a well-known directory — uniqueness 2/5. Everyone's list has it. |
| **MacRae's Blue Book / Kompass US** | Not deep-verified. Both are commercial directories with account walls on bulk access. | **Deprioritized honestly** — low uniqueness even if reachable. |

Industrial directories are the *opposite* of "ways other companies could not find." They are the first place every list-builder looks. Recommend skipping unless a specific gap needs filling.

---

## 4. Trade-show exhibitor lists

**Honest assessment: deprioritize.** The brief asked me to say so plainly if the data is the wrong shape, and it is.

- FABTECH 2026 publishes a genuinely public exhibitor list on the a2z platform: `https://s36.a2zinc.net/clients/SME/FABTECH2026/Public/Exhibitors.aspx?CatID=211` — HTTP 200, 463KB, no login. Mirrors at `fabtech2026.smallworldlabs.com/exhibitors`.
- **But exhibitors are manufacturers, not distributors.** FABTECH, IMTS, MODEX and ProMat all sell floor space to people who make things. Our ICP buys and resells them.
- **Attendee lists are not published** by any of these shows — that is the monetized asset. The "FABTECH attendee list" products sold by BizProspex/VisitorsList/ExpoCaptive at $550 are scraped or fabricated resale lists of unverified provenance. Do not buy them.
- There is no distributor pavilion with a separately published roster on any of the four.
- **Uniqueness 3/5 but ICP fit ~1/5.** Yield of *correct-shape* records: near zero.
- One narrow exception worth noting: **association annual-meeting sponsor/exhibitor pages** (PTDA Industry Summit, NAHAD convention) sometimes name distributor attendees in recap articles. Tiny yield; folds into §8a.

---

## 5. Marketplace sellers ("thinking about opening a website")

**Verdict: killed as an automated channel — every surface is bot-gated.** The segment is strategically interesting (a seller with no real site is a live prospect for website work), but it is not reachable compliantly at scale.

| Source | Check | Result |
|---|---|---|
| eBay Business & Industrial | `ebay.com/b/Industrial-Bearings/bn_7000259723` | HTTP 200 but body is **"Pardon Our Interruption"** bot block |
| Amazon Business | `amazon.com/b?node=16310091` | Bot detection / obfuscated payload |
| MachineryTrader dealers | `machinerytrader.com/dealers` | **HTTP 403, Cloudflare** "Just a moment…" |
| Surplus Record dealers | `surplusrecord.com/dealers/` | **HTTP 403, Cloudflare** "Safety Verification" |
| BidSpotter auction houses | `bidspotter.com/en-us/auction-houses` | HTTP 202, JS robot check |

Additional problem even if the gates were open: **marketplace profiles do not disclose whether the seller owns a domain.** You would get a storefront handle and a city, then still have to resolve the company. That is a lot of work for a weak record.

- Surplus Record is documented at **1,100+ advertising dealers** and MachineryTrader at a similar scale, so the yield *would* be attractive — noting it in case a compliant path appears (e.g. their own published print directory).
- The one compliant path that exists today: DataForSEO's `merchant_amazon_sellers_live_advanced` endpoint is a licensed API, not a scrape. It returns seller identity but still not a domain. **Marginal.**
- Uniqueness: 5/5. Reachability: 1/5. **Net verdict: killed for now.**

---

## 6. Intent signals

### 6a. Job postings — **killed as scraping, viable as SERP**

- `indeed.com/jobs?q="ecommerce manager" distributor` → **HTTP 403.** Bot-gated.
- LinkedIn is out by policy.
- **The compliant version:** run the query through the SERP API instead (§7 mechanism) — `site:indeed.com "e-commerce manager" distributor`, or better, target distributor career pages directly: `"e-commerce manager" "distributor" -site:indeed.com -site:linkedin.com`. You get the *employer's own careers page*, which is public and un-gated, and the employer is the prospect.
- Signal quality is genuinely high: a distributor hiring an e-commerce or digital marketing manager has budget and an admitted gap. That is the warmest possible cold-email opener.
- Uniqueness **5/5**, yield **low-medium** (a few hundred/yr nationally), effort **medium**.
- **Recommend as a small, high-conversion tier — not as a volume channel.**

### 6b. New industrial domain registrations — **flagged, not tested**

Per the brief this belongs to the tooling agent. Noting the constraint they will hit: ICANN killed bulk WHOIS zone-file access for practical purposes, and registrant details are GDPR-redacted. Newly-registered-domain feeds (WhoisXML, DomainTools) are paid and noisy. **Expect this to be low-yield.**

### 6c. "Coming soon" / parked pages on distributor domains — **reframe as an enrichment, not a source**

You cannot search for parked pages; you can only test domains you already have. So this is not a sourcing channel — it is a **scoring pass over the AD/PTDA/USAspending lists**. See §8c, which is the better-built version of this idea and is verified working.

---

## 7. Line-card reverse search — **VERIFIED WORKING**

Distributors publish "line cards" listing every brand they are authorized to carry. That page is public, it is on their own domain, and it names them as a distributor. Reverse-searching it finds distributors that no firmographic filter surfaces.

- **Tested live** via DataForSEO SERP (`serp_organic_live_advanced`), query: `"line card" industrial distributor bearings "authorized distributor"`, US, depth 100.
- **Returned real ICP companies on page 1:** `jrkbearings.com` (JRK Bearings line card), `bartlettbearing.com` ("family-owned, Authorized Distributor", Philadelphia), `brehob.com` (Brehob Corporation, Indianapolis, "authorized distributor for more than 10 manufacturers"), `bearingsandindustrialsupply.com`, `valin.com`, `tsisolutions.us`.
- **Cross-validation:** `bearingsandindustrialsupply.com` was independently found by the AD locator sweep. Two unrelated channels converging on the same company is a good sign both are real.
- Yield per query is ~10 organic results, so volume comes from **permutation**: `"line card" + {brand} + {category} + {state}`. Brands to permute: Timken, SKF, Gates, Parker, Baldor, Dodge, Browning, Rexnord, Festo, SMC, Banner, Turck, Siemens. Also `filetype:pdf "line card" distributor` for the PDF variant.
- ~500 permutations × ~10 results × heavy overlap ≈ **800–1,500 unique domains**.
- Fully compliant: it is a search API reading public pages, no gate touched.
- Uniqueness **4/5** · Yield **medium-high** · Effort **medium-high** (query design + dedup + SERP API credits).

---

## 8. My own additions

### 8a. Buying-group / association **new-member press releases** — **MY ADDITION — VERIFIED — the most creative viable find**

The rosters are gated. **The announcements are not.** Co-ops and associations publicly brag about every new member they sign, by name, in a press release — because that is the point of a press release.

- **Proof:** `https://sphere1.coop/sphere-one-welcomes-18-new-member-distributors-to-its-cooperative/` (2026-05-14) is public, while `sphere1.coop/sphere1-members/` 302s to a sign-in wall. The release names **all 18** independent distributors in plain text:

> Acme Tools · American Fasteners Corporation · Beerman Precision · Construction Tool Service · Darragh Company · Industrial Tools and Supply · McCally Tool & Supply Co. · McQuade & Bannigan · Mills Supply · NEFCO · Pro Tool & Supply · Salisbury Supply Co. · Slims Power Tools · Straightline Contractor & Industrial Supply · Team Tools · United Supply and Sales Co. · United Tool & Fastener · Whitton Supply Co.

- `sphere1.coop/robots.txt` disallows only `/wp-admin/`. The press releases are explicitly crawlable and sitemapped.
- **Why this is the best idea in the doc:** it is a *timing* signal, not just an identity signal. A distributor that just joined a buying co-op is actively investing in competing against the nationals — the exact moment they are receptive to "your catalog is invisible to AI search." Nobody's cold-list has this, because it requires knowing the roster is gated and then going around the front.
- **Repeat across:** Sphere 1 news, AD news (`adhq.com/about/ad-news/…`), NetPlus Alliance news, GAWDA member news, MHEDA press room, plus trade press — *Industrial Distribution* (inddist.com), *Modern Distribution Management* (mdm.com), *Welding & Gases Today*. MDM in particular reports distributor acquisitions, expansions and leadership changes weekly.
- Yield: **low per release (10–20), but recurring** — a standing monthly sweep, maybe 200–400/yr across all sources, all freshly-timed.
- Uniqueness **5/5** · Effort **low-medium** (RSS/sitemap poll + named-entity extraction).

### 8b. **USAspending.gov federal-contractor data by NAICS** — **MY ADDITION — VERIFIED WORKING**

A large share of mid-market industrial distributors sell to military bases, VA hospitals, Corps of Engineers and federal labs. Every one of those transactions is **public law**. No key, no gate, no ToS problem.

- **Tested live**, no API key required:
```
POST https://api.usaspending.gov/api/v2/search/spending_by_category/recipient/
{"filters":{"time_period":[{"start_date":"2024-01-01","end_date":"2026-07-31"}],
 "naics_codes":{"require":["423840"]},"award_type_codes":["A","B","C","D"]},
 "category":"recipient","limit":15}
```
- Returned real distributors immediately: `BEARING DISTRIBUTORS INC`, `H.C. WARNER INC.`, `GIGA, INC.`, `SEA BOX, INC.`
- **Recipient detail endpoint** (`/api/v2/recipient/{recipient_id}/`) adds: full street address, UEI, DUNS, parent company, and **`business_types`** — which includes the `other_than_small_business` / small-business flag. **That flag is a free revenue-band proxy** for the $5–75M screen.
- **Volume confirmed** across the distributor NAICS codes (page 1 = 100 results, `hasNext: true` on all but one):

| NAICS | What it is | Page-1 result |
|---|---|---|
| 423840 | Industrial Supplies Merchant Wholesalers | 100, more pages |
| 423830 | Industrial Machinery & Equipment | 100, more pages |
| 423610 | Electrical Apparatus & Equipment | 100, more pages |
| 423710 | Hardware | 100, more pages |
| 423720 | Plumbing & Heating Equipment | 100, more pages |
| 423810 | Construction & Mining Machinery | 56, complete |

- Est. yield: **2,000–5,000 unique companies** across the six codes with deep paging.
- **The one gap:** no website field. You get name + address + UEI, then resolve the domain (search API or the §8c enrichment). That is a solvable, mechanical step.
- Uniqueness **5/5** — this is government spend data; no cold-email list-builder in this vertical touches it. Effort **low-medium**. Fully public, no robots.txt restriction (documented open API).

### 8c. **Tech-stack reverse enrichment as the qualification layer** — **MY ADDITION — VERIFIED WORKING**

Not a sourcing channel — the **scoring pass** that makes every list above sellable, and the properly-built version of the §6c "weak site" idea.

- **Tested live** on a company sourced from the AD sweep, via DataForSEO `domain_analytics_technologies_domain_technologies` for `bearingsandindustrialsupply.com`. Returned:
  - `domain_rank: 70`, title, meta description, `last_visited: 2026-07-28`
  - **`emails: ["sales@bearingsnow.com"]`** — a contact address, straight from the enrichment
  - Full stack: Nginx, jQuery, Google Analytics, GTM, CookieYes
  - **No e-commerce platform, no PIM, no search layer detected** — i.e. a catalog business with no catalog engine. That is the pitch, evidenced, before the first email is written.
- Run this over the AD + PTDA + USAspending union and you can segment into: no e-commerce at all · legacy platform (Magento 1, Volusion, old nopCommerce) · modern but no structured data. Each gets different copy.
- It also **recovers the missing website/email fields** that USAspending doesn't provide.
- Uniqueness **4/5** (as applied here, 5/5) · Effort **low** · Cost: DataForSEO credits per domain.

### 8d. Distributor-ERP and e-commerce vendor customer lists — **MY ADDITION — idea, not verified**

Epicor Prophet 21, DDI System, Infor, Sage, Unilog, Sana Commerce and OroCommerce all publish named customer case studies and logo walls. Those customers are, definitionally, $5–75M distributors. Two ways to use it: the named customers are ICP-confirmed prospects, and knowing their ERP is a sharp personalization hook. Flagging as unverified — worth 30 minutes.

---

## Ranked table

| # | Channel | Public / gated | Uniqueness | Est. yield (unique US cos.) | Effort | Verdict |
|---|---|---|---|---|---|---|
| 1 | **AD (Affiliated Distributors) Member Locator** | **Public** (no robots.txt, no auth) | **5/5** | **1,000–1,500** | **Low** | **BUILD FIRST** |
| 2 | **USAspending.gov NAICS recipients** (mine) | **Public** open API, no key | **5/5** | **2,000–5,000** | Low-med | **BUILD** |
| 3 | **PTDA Find-a-Distributor** | **Public**, robots-clean | 4/5 | ~300 cos. / 1,500 branches | Medium | **BUILD** |
| 4 | **New-member press releases** (mine) | **Public**, sitemapped | **5/5** | 200–400/yr, recurring | Low-med | **BUILD — best timing signal** |
| 5 | **Line-card reverse search** (SERP API) | **Public** pages via licensed API | 4/5 | 800–1,500 | Med-high | **BUILD** |
| 6 | Tech-stack enrichment (mine) | Licensed API | 4/5 | n/a — enrichment | Low | **BUILD as scoring layer** |
| 7 | AD Gypsum static company listing | **Public** | 3/5 | 106 in one page | Trivial | Take it — weak ICP fit |
| 8 | Distributor-ERP customer lists (mine) | Public | 4/5 | 100–300 | Low | Unverified — spike it |
| 9 | Job-posting intent via SERP | Public via SERP | 5/5 | Low hundreds | Medium | Small high-conversion tier |
| 10 | GAWDA / gawdamedia | Partial | 3/5 | <260 | Medium | Manual pass only |
| 11 | IndustryNet | Public | 2/5 | Unknown | Medium | Skip — everyone has it |
| 12 | Trade-show exhibitor lists | Public | 3/5 | ~0 correct-shape | Medium | **KILL — wrong side of the market** |
| 13 | Marketplace sellers (eBay/Amazon/MachineryTrader/Surplus Record/BidSpotter) | **Bot-gated** | 5/5 | Unreachable | — | **KILL — every surface blocked** |
| 14 | Thomasnet | **DataDome-gated** | 3/5 | — | — | **KILL on compliance** |
| 15 | STAFDA | Token API + confidentiality notice | — | — | — | **KILL on compliance** |
| 16 | NAHAD / ISA / NAED / MHEDA / FPDA / AHTD / AED / BSA / Sphere 1 roster / NetPlus / SupplyForce | **Login-gated** | — | — | — | **KILL — do not re-litigate** |
| 17 | New-domain WHOIS registrations | Paid + GDPR-redacted | 4/5 | Low | High | Tooling agent's call — expect low yield |

---

## Top 5 recommended

**1. AD (Affiliated Distributors) Member Locator — build this first.**
It is the single best find in the research and it is barely even scraping — the form 302s to a plain GET URL, so results are addressable by `?location=&industries=`. Twenty metro seeds against three of eleven divisions produced 301 unique companies with 275 real websites attached, and the discovery curve had not flattened. Every record is an *independent* distributor by definition of AD membership, which does the $5–75M qualification for free and excludes the nationals that waste your sends. Clean HTML, no JS, no auth, and `adhq.com` serves no robots.txt at all. Extract company, division, address, phone and website; sweep all eleven division codes across a state-level seed list; dedup branches to parent companies.

**2. USAspending.gov by NAICS — the channel nobody in this vertical uses.**
Federal contract spending is public law, published through a documented open API with no key and no bot gate. Filtering recipients by the six distributor NAICS codes returns hundreds of real industrial distributors per code with deep paging available, and the recipient detail endpoint adds street address plus a small-business flag that works as a free revenue-band proxy. It has one gap — no website — which the §8c enrichment closes mechanically. Nothing about this is gray: it is government data, offered for exactly this kind of query.

**3. New-member press releases — the most creative viable find.**
Sphere 1's member roster is behind a sign-in wall, but its press release announcing eighteen new member distributors names every one of them in plain text on a public, sitemapped page. The same pattern holds across AD news, NetPlus, GAWDA, MHEDA and the trade press. This beats the others on *timing*, not just volume: a distributor that just joined a buying co-op has openly decided to fight the nationals, which is the exact moment the "your catalog is invisible to AI search" pitch lands. Low yield per release, but it recurs monthly and no competitor's list contains it.

**4. PTDA Find-a-Distributor — the one association that stayed open.**
Twelve of thirteen associations are login-gated; PTDA is the exception and it returns a full record including the website field. Verified by running an actual search, not by reading the page. Two caveats keep it at number three rather than number one: results skew toward national chains with many branches, so branch→company dedup is mandatory, and the ASP.NET postback makes extraction fiddlier than AD's. The 14-way product-category filter is a real bonus — it lets you segment bearings shops from hydraulics shops and write to each differently.

**5. Line-card reverse search — finds distributors that firmographics cannot.**
Distributors publish line cards naming every brand they are authorized to carry, on their own public domains. Reverse-searching that phrase surfaced JRK Bearings, Bartlett Bearing, Brehob and others on the first page of a single query, and one result cross-validated against the AD sweep. Volume comes from permuting brand × category × state, which puts it at medium-high effort and real SERP-API cost. Worth it because the companies it finds are self-identified distributors that no NAICS or employee-count filter reliably catches — and the line card itself is perfect personalization fuel.

---

## Build order

1. **AD locator sweep** (11 divisions × state seeds) → base list, ~1,000–1,500 with websites
2. **USAspending NAICS pull** (6 codes, deep paging) → +2,000–5,000, needs domain resolution
3. **PTDA ZIP sweep** → +300 companies, dedup branches
4. **Tech-stack enrichment pass** over the union → recovers emails + websites, scores weak-site signal, splits the list into copy segments
5. **Line-card SERP permutations** → net-new domains outside every roster
6. **Standing monthly press-release poll** → fresh, well-timed prospects forever

Dedup across 1–5 on normalized domain; keep `source_url` + `captured_date` per record as required.

---

## Compliance notes for whoever builds this

- Everything recommended is **public and un-authenticated**. Nothing here bypasses a login, a CAPTCHA, or a bot gate.
- robots.txt verified for all four primary sources: `adhq.com` → 404 (none); `ptda.org` → allows the locator path, disallows only iMIS internals; `api.usaspending.gov` → documented open API; `sphere1.coop` → disallows only `/wp-admin/`.
- Rate limits used during research: **2.5s between AD requests**, 1–1.5s elsewhere. Keep at least that in production.
- **Do not** revisit STAFDA. Its API is technically reachable but the directory page carries an explicit confidentiality and no-reproduction notice. That is a policy decision, already made.
- **Do not** buy trade-show "attendee lists" from BizProspex, VisitorsList or ExpoCaptive — unverifiable provenance.
- Capture `source_url` + `captured_date` on every record, as the brief requires. The AD sweep script already writes both.

**Working scripts from this research** (scratchpad, portable):
`ad_sweep.py` (AD locator sweep → `ad_members.csv` with source_url + captured date), `ptda_post.py` (PTDA postback), `probe.py` / `discover.py` (gate + directory discovery).
