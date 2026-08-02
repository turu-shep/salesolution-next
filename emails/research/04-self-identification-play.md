# Dealer self-identification: recovering the blocked brands from public SERP

**Date:** 2026-08-01
**Status:** Tested, not theorized. 14 live SERP queries run against DataForSEO, 372 organic results classified, 8 dealer domains fetched and verified. Nothing harvested, no gate touched.
**Question:** Eight manufacturer locators are excluded by policy (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm — see `01-dealer-locator-sources.md`). Do the dealers of those brands identify themselves publicly on their own sites well enough to rebuild the list without the manufacturer's server?

## Verdict up front

**The play works, and it is a supplement rather than a replacement.**

14 queries produced **128 distinct US industrial distributor companies** — roughly 9 per query, from 372 organic results. Every one of the 8 domains I fetched turned out to be a real, ICP-shaped distributor. Not one was a manufacturer, a directory, or a false positive.

But it does not recover the blocked networks on volume. Full permutation lands at **1,800–2,800 unique US distributors**, which is somewhere around **45–70%** of what the eight blocked locators would plausibly have given, and only **16–24%** at a sane 250-query program. The gap is structural: a locator lists everyone the manufacturer authorized, SERP lists only who ranks.

What it does beat the locators on is copy. A locator gives you a row in a table. This gives you the dealer's own sentence about their own authorization, on a page you can then critique — which is the thing being sold. Three properties are unavailable from any locator scrape at any price:

1. **Self-declared authorization language, quotable verbatim.**
2. **A website on every record, by construction.** The locator route's worst gap (32.4% of Timken's US dealers have no website URL) cannot occur here.
3. **The dealer's own line card on one page.** Keystone Components listed 20 named manufacturers on a single URL. `01` said line-card reconstruction only gets useful at 5+ cross-referenced sources; here one page clears that bar.

There is also a fourth property nobody asked for: **the artifact that proves they're a prospect is the artifact that proves they have a problem.** You found them on page 3 of their own authorization phrase. That sentence writes the email.

---

## Queries run, with actual counts

All queries: Google, `location_name: United States`, `language_code: en`, run 2026-08-01. "Organic" counts `type: organic` items only, excluding local packs, PAA and related searches. "US dealer domains" counts distinct domains I judged to be genuine US distributors after manually removing the manufacturer, directories, job boards, forums, marketplaces, trade press, and foreign sites.

| # | Query | Depth/pages | Organic | US dealer domains | Read |
|---|---|---|---|---|---|
| Q1 | `"authorized Parker distributor"` | 100 / 7 | **70** | **16** | Hit the SERP ceiling at 70 despite asking for 100. 34 unique domains, heavy repetition (`mrostop` ×5, `thehopegroup` ×6, `fluid-power-solutions` ×6) |
| Q2 | `"Parker Store" hydraulic hose` | 100 / 7 | **68** | **32** | **Best single query in the test.** 57 unique domains. ParkerStore is a formal Parker retail program, so the phrase is near-exclusive to real dealers |
| Q3 | `"authorized Parker distributor" Texas` | 30 / 3 | **29** | 13 (**6 new**) | State-scoping the brand phrase collapses the pool. Dominated by hosted Parker catalog PDFs, not self-declarations |
| Q4 | `"Gates authorized distributor" hydraulic hose` | 30 / 3 | **29** | 3 (+3 named) | Poisoned by a 2014 Gates press release syndicated across trade media, and by Instagram OCR from one Australian dealer occupying 8 slots |
| Q5 | `"authorized ESAB distributor"` | 30 / 3 | **28** | **3** | Weak. Mostly ESAB's own domains, foreign dealers (Nigeria, Greece, UAE, Indonesia), and PDF manuals |
| Q6 | `"authorized Norton distributor" abrasives` | 30 / 3 | **28** | **6** | All 6 found by hosting Norton catalog PDFs. See the catalog-PDF pattern below |
| Q7 | `"authorized Dixon Valve distributor"` | 30 / 3 | **4** | **2** | The thinnest result in the test. Four organic results exist for this phrase |
| Q8 | `"line card" distributor hydraulics pneumatics` | 20 / 2 | **19** | **16** (+2 named) | **Highest precision of any query.** 16 of 19 results were US distributors |
| Q9 | `"authorized WEG distributor"` | 20 / 2 | **19** | **11** (+2 named) | Strong. WEG dealers self-declare consistently and rank for it |
| Q10 | `"ESAB distributor" welding supply` | 20 / 2 | **19** | 1 (+2 named) | Softening the phrase made it worse — ESAB's own site took 6 of 19 slots |
| Q11 | `"authorized ifm efector distributor"` | 20 / 2 | **2** | **1** | Effectively dead. One of the two results is a competitor *disclaiming* authorization |
| Q12 | `"line card" "authorized distributor" welding supply` | 20 / 2 | **19** | ~9 | Drifts off-vertical into electronics and auto paint. The two-phrase AND is too loose |
| Q13 | `"line card" hydraulic distributor Ohio` | 20 / 2 | **19** | **17** (**12 new**) | **The permutation result that matters.** State-scoping the *line card* phrase rotates the pool; state-scoping the *brand* phrase does not |
| Q14 | `"authorized Regal Rexnord distributor" OR "authorized Leeson distributor"` | 20 / 2 | **19** | **7** | OR-ing two brands of the same parent works and costs one query |
| | **Total** | | **372** | **128 distinct** | ~9.1 unique US distributors per query |

Brands covered: Parker, Gates, ESAB, Norton, WEG, Dixon, ifm, Regal Rexnord/Leeson — **all 8 blocked brands**, plus 3 brand-agnostic line-card queries.

### The four patterns, ranked

1. **Manufacturer retail-program terms** (`"Parker Store"`) — 32 dealers from one query. The best pattern found. Parker, Gates and others run named dealer programs, and the program name is near-unusable by anyone else. Worth hunting the equivalent term for each blocked brand before anything else.
2. **Line card + category (+ state)** (`"line card" distributor hydraulics pneumatics`) — 16–17 per query at ~85% precision, brand-agnostic, and the found page *is* the line card. This is the workhorse.
3. **`"authorized <brand> distributor"`** — 1 to 16 per query. Wildly inconsistent across brands. Fine for Parker and WEG, near-worthless for ifm and Dixon.
4. **Hosted catalog PDFs** — see below. A distinct sub-pattern, not a variant of #3.

### The catalog-PDF pattern (unplanned finding)

Manufacturers print boilerplate on every catalog page: *"Your Local Authorized Parker Distributor"*, *"call your local authorized Norton distributor to check our made-to-order non-stock availability"*. Distributors host those catalog PDFs on their own domains as a customer service. Searching the boilerplate finds the **host**, and hosting a brand's catalog is itself a strong authorization proxy.

This is where **all 6** Norton dealers came from, and where 6 of the 13 Texas Parker candidates came from. It reaches distributors who never wrote a word of authorization copy themselves — Canfield & Joseph makes no authorized-distributor claim anywhere on its own site, and was found purely by hosting `Vitrified-Toolroom-Wheels.pdf`.

Trade-off: it finds the account but yields no quotable sentence, since the words are the manufacturer's. Treat it as a **list-building** pattern, not a copy-sourcing one.

### Named-but-not-ranked dealers

Social and marketplace results frequently name a real dealer whose own site did not rank: Curry Fluid Power (LinkedIn), IR-G / Industrial Rubber & Gasket, Decatur AL (Facebook), Biedler's Hydraulics (eBay), KPaul Industrial (YouTube), A Plus Electric Motor Repair, St. Charles IL (Facebook), Phoenix Welding Supply (Instagram), Tejas Hydraulics (LinkedIn), East Texas Seals, Tyler TX (MapQuest), Stuart Hose & Pipe Co.

Roughly a **10% uplift** on top of the domain counts, but it needs a name → domain resolution step. Counted separately in the table above, and excluded from the 128.

---

## Verified dealer examples

Eight domains fetched live on 2026-08-01. Eight of eight are real US industrial distributors. Quotes are verbatim from the page.

**The Hope Group** — `https://www.thehopegroup.com/` (found: Q1, Q2)
Fluid connectors, hydraulics, pneumatics, seals, automation, compressed air, instrumentation. Self-declares *"New englands largest authorized PARKER distributor"* (casing as rendered). **10 ParkerStore locations across MA, ME, NH, CT, RI.** HQ Northborough MA. ISO 9001. Runs a second domain, `hopedirect.com`, for e-commerce — a dedupe hazard worth noting.

**Keystone Components, Inc.** — `https://keystonecomponentsinc.com/line-card/` (found: Q13)
Pneumatics and fluid power. Self-declares *"AUTHORIZED STOCKING DISTRIBUTOR SERVING NORTHERN OHIO AND WESTERN PENNSYLVANIA"*. **The line card names 20 manufacturers on one page**: Air-Vac, Alkon, Allenair, Alumi-Tec, Arrow Pneumatics, BEKO, Clippard, Colder Products, Compact Automation, Enidine, FasTest, GAST, Jun-Air, LeRoy Plastics, Linemaster, Maxpro, Motion Controls, Rotomation, Sugino, W.C. Branham. Regional single-territory independent — textbook ICP.

**Canfield & Joseph** — `https://www.canfieldjoseph.com/` (found: Q6, via a hosted Norton PDF)
Foundry supplies, surface prep, finishing, molding materials. Brands named: Norton Abrasives, DeMarco, Simpson, Fox, Electro-Nite, HA International, Smith & Richardson, DuPont, Ervin, GMA Garnet. **Since 1967. Four locations: Fort Worth TX, Kansas City MO, St. Louis MO, Tulsa OK.** Makes **no** authorized-distributor claim on its own site — proof that the catalog-PDF pattern reaches accounts the self-declaration pattern misses.

**QP Automation** — `https://qpautomation.com/weg-distributor-chicago/` (found: Q9)
Self-declares *"Your Authorized WEG Distributor in Chicago"* and *"as an authorized partner, we give you direct access to WEG's full catalog"*. Also certified on ABB, Yaskawa, Siemens. E-commerce shop plus stocked inventory. **Joliet, IL.** Small-to-mid regional. Page dated 2026-03-07 — actively maintained.

**Cruco Supply** — `https://crucosupply.com/parker-hose-fittings/` (found: Q1, Q2)
*"As a Parker Fluid Connector Distributor, Cruco Supply carries Parker's full line of high-quality products"*, sourcing *"directly from Parker Hannifin Corporation"* as an *"authorized Parker distributor"*. Also Milwaukee Tools, plus general industrial. **Sanford NC**, serving Raleigh / Greensboro / Durham / Smithfield. Large on-site inventory.

**Siegel Bros. Supply** — `https://www.siegelbros.com/manufacturers/dixon-valve-coupling-co/` (found: Q7)
*"Siegel Bros. is an authorized Dixon Valve distributor."* **80+ brands** in its manufacturer index (DeWalt, Milwaukee, Makita, Greenlee, Klein, Stanley, 3M Safety). **Two NY locations: Brooklyn and Deer Park.** Phone-to-order, no online cart. Notable because Dixon publishes **no** public locator at all by policy — this is a dealer that no locator scrape could ever have surfaced.

**Kenco Hydraulics** — `https://kencohydraulics.com/` (found: Q4)
Named brands: Danfoss, **Gates**, Char-Lynn, Stucchi, Brennan, Donaldson. Claims *"Danfoss Authorized Repair Center"*; the Gates authorization appears in category copy (*"As a Gates-authorized distributor, Kenco offers premium..."*) rather than as a site-wide badge. **PA, Philadelphia metro, since 1989.** Claims largest hydraulics service facility on the East Coast.

**Hyspeco** — `https://www.hyspeco.com/locations/parker-store-locations` (found: Q2)
**9 ParkerStore locations across IL, KS, MO.** *"Each store has an on-hand inventory of over 12,000 items."* ISO 9001:2015. Multi-branch regional — upper end of the ICP band, arguably past it.

Two fetches failed and are noted for the record: `mallory.com` returned **403** to WebFetch and `gdssupply.com` returned **429**. Both match the tooling note in `01` — WebFetch is blocked far more often than curl with a normal desktop UA. Neither is evidence about the company.

---

## Yield model

### What was measured

Four numbers do the work, all measured today:

- **A. Base rate: 9.1 unique US distributors per query** (128 / 14).
- **B. SERP ceiling is ~70, not 100.** Q1 and Q2 asked for depth 100 across 7 pages and returned 70 and 68. Nothing in the test exceeded 70 organic results, and most queries returned 19–29.
- **C. Brand phrase volume varies ~35×.** Parker's best phrase returned 68 organic; ifm returned 2. Any model that assumes a uniform per-brand yield is wrong by an order of magnitude at both ends.
- **D. Dedupe behaves differently per axis, and this is the pivotal finding:**
  - State-scoping the **brand** phrase: **6 net-new of 13** (Q3, Texas — a large state).
  - State-scoping the **line card** phrase: **12 net-new of 17** (Q13, Ohio).

The reason is mechanical. A distributor writes **one** "we are an authorized Parker distributor" page and it is a national asset, so adding a state word mostly re-ranks the same national pool and pulls in PDF noise. A line-card query anchors on a page type every distributor has *and* a geography they actually state on it, so the pool genuinely rotates. **Permute on geography along the line-card axis, not the brand axis.**

### The arithmetic

**Axis A — brand × phrase variant, national.**
8 blocked brands × 4 phrase variants = **32 queries**.
Measured first-variant yield per brand: Parker 24 (mean of Q1/Q2), WEG 12, Regal Rexnord 7, Norton 6, Gates 5, ESAB 2, Dixon 2, ifm 0.5 → mean **7.3**.
Variants 2–4 dedupe hard against variant 1; assume 40% / 25% / 15% net-new.
Per brand: 7.3 × (1 + 0.40 + 0.25 + 0.15) = 7.3 × 1.8 ≈ **13**.
× 8 brands = 105. Cross-brand overlap (dealers carry Parker *and* Gates) removes ~20%.
→ **~85 unique from 32 queries.**

**Axis B — brand × state.**
8 × 50 = **400 queries**. Measured lift is poor (finding D).
Strong brands (Parker, WEG, Regal Rexnord): 3 × [(12 dense states × 5) + (38 thin states × 1)] = 3 × 98 = 294, less a 50% haircut against Axis A → 147.
Weak brands (Gates, ESAB, Norton, Dixon, ifm): 5 × [(12 × 2) + (38 × 0.3)] = 5 × 35 = 175, less a 60% haircut → 70.
→ **~215 unique from 400 queries = 0.54 per query.** This axis is where the money goes and the returns die. Cap it at the top 15 states for the 3 strong brands only.

**Axis C — line card × category × state.**
10 ICP-relevant categories (hydraulics/pneumatics, hose & fittings, PT & bearings, welding & gas, abrasives & cutting tools, automation & sensors, motors & drives, pumps & valves, material handling, general MRO) × 50 states = **500 queries**.
Measured: 16 national (Q8), 17 with 12 net-new on a dense state (Q13).
Assume a mean of 6 net-new per cell across dense and thin states, degrading as the corpus saturates.
Naive 500 × 6 = 3,000, which ignores saturation.
→ **~2,000–2,600 from 500 queries**, and the last 100 queries return near-nothing.

**Universe sanity check.** NAICS 423840 / 423830 / 423810 (industrial supplies, PT, and related merchant wholesalers) cover on the order of **20,000–30,000 US establishments**. The subset that has a website, publishes a line card or authorization copy, *and* ranks top-30 for any of these patterns is a minority — call it 8–15%. That puts a hard ceiling of **~3,000–4,000** on this route no matter how many queries you run. A distributor with a website but no line-card page and no authorization copy is invisible to this method entirely.

### Defensible ranges

| Program | Queries | Unique US distributors | Rate |
|---|---|---|---|
| **Confirmed today** | 14 | **128** | 9.1 / query |
| **Practical** — 32 national brand×variant + 60 brand×state (3 strong brands × top-20 states) + 150 line-card (10 categories × 15 dense states) | **~250** | **650–800** | 2.6–3.2 / query |
| **Exhaustive** — full 8×50 brand×state + 10×50 line-card + all variants | **~1,000–1,200** | **1,800–2,800** | 2.0–2.3 / query |
| **Hard ceiling** (structural, not budget-limited) | — | **~3,000–4,000** | — |

Recommendation: **run the practical 250 and stop.** Axis B past the top 20 states costs 340 queries for maybe 60 accounts. Reinvest that budget in Axis C depth and in name → domain resolution for the named-but-not-ranked bucket.

### API cost

DataForSEO SERP Organic Live Advanced is priced per request with a surcharge for depth and additional pages. **Bracket, verify against the current price sheet before budgeting** — I did not derive a clean unit cost from this session, because the one cost signal I saw (a session total of ~$14.78) included pre-existing spend.

| Query shape | Est. unit | 250 queries | 1,200 queries |
|---|---|---|---|
| depth ≤10, 1 page | ~$0.002 | **$0.50** | **$2.40** |
| depth 30, 3 pages | ~$0.006 | **$1.50** | **$7.20** |
| depth 100, 7 pages | ~$0.012 | **$3.00** | **$14.40** |

**Cost is not the constraint.** Even the exhaustive program at the most expensive depth lands under $15 of API spend. The real costs are engineering time on dedupe and classification, and the fetch budget to verify domains — 1,200 SERP queries producing ~2,500 domains implies ~2,500 page fetches at 1 request per 2–3s per host, which is the actual bottleneck.

Two operational notes for whoever builds this:

- **DataForSEO hard-errors (`40101 Internal SE Server Error`) when the requested depth exceeds available results.** It bit 5 of my first 8 attempts. Probe narrow terms at depth 20 first, then escalate. Budget ~15% wasted queries, or write a retry ladder (100/7 → 30/3 → 20/2).
- **Filter foreign results aggressively.** Generic brand phrases pulled heavy contamination from India, UAE, Thailand, Brazil, Greece, Nigeria and Australia. Instagram OCR was the worst offender: one Australian Gates dealer and one Indian Norton dealer between them occupied 18 result slots across Q4 and Q6. A `.com` TLD is not a US signal.

---

## Comparison against the blocked locators

### Volume: partial recovery

The blocked locators were never queried, so their true counts are unknown. Estimating from the one measured anchor in `01` — Timken's single endpoint returned 5,002 US records collapsing to **1,972 distinct US companies, 1,261 of them single-location independents** — and given Parker is described there as the largest network in fluid power, the union of the eight blocked networks plausibly sits at **4,000–8,000 distinct US companies**, with heavy overlap between them and with Timken.

The like-for-like comparison is narrower than that, because a locator record with no website is unreachable by this route by definition. Timken's US website coverage was **67.6%**. Against a blocked-brand union of 5,000–6,000, the addressable-with-website subset is **~3,400–4,000**.

- Exhaustive program (1,800–2,800) → **~45–70% recovery**
- Practical program (650–800) → **~16–24% recovery**

Treat both denominators as estimates, not measurements.

### Quality: a genuinely better source on five axes

**What this route has that no locator scrape does:**

1. **Self-declared authorization language, usable verbatim.** *"New englands largest authorized PARKER distributor."* *"AUTHORIZED STOCKING DISTRIBUTOR SERVING NORTHERN OHIO AND WESTERN PENNSYLVANIA."* *"Siegel Bros. is an authorized Dixon Valve distributor."* A locator gives you a row; this gives you the sentence they chose, which you can quote back at them in the first line of an email.
2. **A website on every record, guaranteed.** The single biggest hole in the locator data — 1,622 of 5,002 Timken US dealers (32.4%) with no website URL — is structurally impossible here.
3. **The full line card on one page, in their words.** Keystone: 20 named manufacturers, one URL, no join required. `01` concluded that cross-source line-card reconstruction needs 5+ sources to be useful and that most dealers would show only 1–2 brands at first. This route clears that on a single fetch, with no phone-number fuzzy matching and no fighting three spellings of the same company name.
4. **The evidence and the diagnosis are the same artifact.** You found them at rank 40 for their own authorization phrase. That is the pitch, and it is only available because you found them via SERP.
5. **Rank position is free qualification.** A dealer at #40 for their own brand phrase is a warmer prospect than one at #2. Locators carry no such gradient.

Plus: it reaches accounts no locator could. Dixon publishes no public locator by policy, and Siegel Bros. turned up anyway.

**What the locators still have that this does not:**

1. **Completeness.** A locator is the manufacturer's authoritative census. SERP shows only who ranks. This is the whole reason for the 45–70% ceiling.
2. **Structured NAP on every record.** Timken shipped name, formatted address, phone (100%), lat/lng and tier in one JSON call. Here you get a domain and have to fetch the site for everything else.
3. **The null-website segment.** `01` called the 1,622 no-website Timken dealers "the strongest single segment in the dataset." They are invisible to this route by definition. This is the sharpest complementarity between the two methods: **the locators own the segment this one cannot see, and vice versa.**
4. **Tier metadata.** Banner's National / Regional / Factory Rep, Enerpac's Sales / Service / Rental, Timken's category 4/5/6, Adaptall's `premier` flag. SERP surfaces none of it unless the dealer volunteers it.

### Verdict

**Supplements. Does not replace.**

The right framing is not "which source is better" but "these two answer different questions." Locators give the **census**, including the segment with no web presence. Self-identification gives the **copy and the diagnosis**, but only for dealers who already publish and rank.

For the industrial cold-email program specifically, self-identification is the better *first* source, because every account it produces is immediately mailable with a personalized first line and a demonstrable problem — and because it is the only route left into Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon and ifm.

---

## Compliance posture

Same binding rules as `01`, all observed here:

- **Public Google SERP results and public dealer websites only.** No manufacturer locator was queried. The eight gated brands' own servers were not touched at all — that exclusion is unchanged and permanent.
- **Nothing bypassed.** Two fetches were refused (`mallory.com` 403, `gdssupply.com` 429) and were left alone. No UA spoofing, no retry against either.
- **Rate-limited.** 14 SERP queries and 10 page fetches over the session, sequential or in small parallel batches.
- **Provenance captured.** Every finding above carries its source URL and the access date (2026-08-01).
- **Nothing harvested.** Result sets were classified in memory and the working files kept only aggregate counts plus the 8 verified examples.
- **robots.txt** to be checked per host before any bulk fetch pass, which this was not.

---

## Open items

- **Find each blocked brand's retail-program term.** "Parker Store" alone returned 32 dealers — double the best generic phrase. Gates, ESAB and Norton run comparable programs whose names were not tested here. Highest-leverage next query set.
- **Build the catalog-PDF query set as its own pattern.** Search each manufacturer's printed catalog boilerplate (*"Your Local Authorized Parker Distributor"*, *"call your local authorized Norton distributor"*) to find hosting domains. This reached Canfield & Joseph, which self-declares nothing.
- **Write the name → domain resolver** for the named-but-not-ranked bucket (~10% uplift).
- **Reuse `01`'s national-chain blocklist before dedupe.** Motion, Applied, FleetPride, DXP, Kaman, Grainger, Fastenal. Also add multi-domain entities seen here: The Hope Group / `hopedirect.com`, Livingston & Haven / `store.livhaven.com`, Triad Technologies / `info.triadtechnologies.com`.
- **Cross-brand joins already work inside this route.** `advantageelectricsupply.com` surfaced on both the WEG and Leeson queries; `store.livhaven.com` on both Dixon and ifm; `fluid-power-solutions.com` on Parker and the Ohio line-card query. Worth measuring how deep a line card gets from SERP alone before investing in the headless-render tier.
- **Decide the ICP size filter.** Hyspeco (9 branches) and The Hope Group (10) are at or past the top of the $5M–$75M band. Branch count from the dealer's own locations page is the cheapest available proxy.
