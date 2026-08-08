# e4-headless-locators — the tier was never headless, and the constraint was never the browser

> STATUS (2026-08-03): **PART-BUILT.** Four targets built and measured, two
> blocked on unsigned robots gates, two cleared but unbuilt. **Nothing was
> billed and no gated host was touched.**
>
> Three things this folder previously asserted are now falsified by measurement:
> that the tier needs a headless browser (it does not — 6 of 8 serve plain
> JSON/HTTP), that its robots posture is a single question (it is per-host, and
> splits 6 clear / 2 blocked), and that it is worth +2,500–3,500 companies
> (measured: **far lower, and most of what it returns has no domain**).
>
> **UPDATE 2026-08-04: both gates are now SIGNED YES** — R-1 Banner and R-2
> Pepperl+Fuchs (Artur, 2026-08-04), each scoped to the robots directive only.
> **R-2 is settled and cost nothing: the gated endpoint 403s anonymously (an
> auth boundary, stopped on the first response, no bypass), the same payload
> was found inlined in the public robots-allowed page, and it contains ZERO US
> distributors.** Built and closed → `pepperlfuchs [DONE-NO-US-DEALERS]/`.
> See `02-robots-posture-2026-08-03.md` §6 and §9 of the sourcing strategy.

Prompts in this folder: `01-prompt.md` — the original build plan, now largely
executed. `02-robots-posture-2026-08-03.md` — **the Step 0 evidence and the gate
itself; read this one first.**

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a **E4**, **§7.1 (the obstacle ladder — corrected 2026-08-03)**, §9 GATE-L4](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` **§5a**, §5b, §5f, §5h, §5i, §5l](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

The tier of manufacturer dealer locators that render client-side: an SPA shell,
data hydrated by JS. `curl` sees nothing, so `research/01` filed all of them as
`hard JS` and the strategy funded a Playwright build.

**That framing was wrong, and finding out cost eight bundle reads.** The pages
render client-side; the *data* almost always arrives from a documented HTTP
endpoint that the page's own JavaScript names in plain text. Reading the bundle
is one GET. Six of eight targets need no browser at all.

**What actually gates this tier is robots posture — and it is per-host, because
the data frequently comes from a different host than the page.** RFC 9309 is
per-origin. Banner, Festo and Bosch Rexroth all serve dealer data off a separate
host whose robots file disagrees with `www`'s. **Anyone who checks only
`www.*/robots.txt` gets Banner exactly backwards.**

| Target | Segment | Data path (from the site's own JS) | Serving host | Robots verdict | Status |
|---|---|---|---|---|---|
| **Banner Engineering** | Automation | `/dist?apikey=…&sitename=us/en&q=…&return=json` | **api2d.**bannerengineering.com | **`Disallow: /`** | **BLOCKED — GATE R-1** |
| **Pepperl+Fuchs** | Automation | `/api/protected/distributorsData` — **403s anonymously**; the same payload is inlined in the public `-gp27595` page as `window.__NUXT__` | www.pepperl-fuchs.com | **`Disallow: /api/`** on the API path; **nothing matches the page path** | **BUILT 2026-08-04 → `pepperlfuchs [DONE-NO-US-DEALERS]/`** — R-2 signed but **unused**; 0 US distributors |
| **Festo** | Fluid power | `…/locators/v1/locations?$filter=address/country eq 'us'` | **api.**festo.com | no robots.txt (404) | **BUILT** → `festo [DONE-THIN]/` |
| **Walter Surface** | Cutting/abrasives | `POST /us/webruntime/api/apex/execute` → `getAllDistributorMarkers` | www.walter.com | **`Allow: /`** | **BUILT** → `waltersurface [DONE-NO-DOMAINS]/` |
| **SKF** | Bearings/PT | `/address/distributors/location?bounding_box=…` | www.skf.com | allowed by absence | **PROBED** — see §2 |
| **Continental** | Hose & fittings | `/apis/v1/distributors?locatorType=…&radius=…` | www.continental-industry.com | **`Allow: /`** | **PROBED** — see §2 |
| **Lincoln Electric** | Welding | under `/northamerica/s/…` | mylincoln.lincolnelectric.com | **`Allow: /northamerica/s`** beats `Disallow: /` | CLEARED, unbuilt |
| **Bosch Rexroth** | Fluid power | app at `…azurecontainerapps.io/locator/` | a `-dev`-named Azure container app | no robots.txt | CLEARED, unbuilt — held on host stability |
| **Industrial Scientific** | Gas detection/safety | two `.ps-widget` mounts — **PriceSpider SaaS**; `ps-key`/`ps-config` public in the page's own meta (Banjo/Banner shape); data flow lives in PS's wtb4 recipe, not statically derivable | **cdn.pricespider.com** (third party; api host unpinned) | no robots.txt (404) on cdn | **QUEUED** — routed from `linecard-locators` probes 2026-08-03; needs one observation render, then the same ≥150 + tier/line-card rule as everyone else |

**Adjacent targets, both resolved.** **Sullair** — the CSV base path
`research/01` left open since 2026-08-01 is `/sites/default/files/`, read out of
the page's own inline script. Built → `sullair [DONE-THIN]/`. **The 429 trio
(ARO, Miller, Ingersoll Rand) is not a pace signal** — all three return 429 on
their own `robots.txt` through five exponential backoffs. Reclassified as access
controls alongside the Cloudflare eight; strategy §7.1 corrected. No escalation
attempted.

**Excluded permanently, unchanged:** Bimba (401 credential boundary) and the
eight Cloudflare/Akamai 403 brands. Their dealers are already recovered via
`serp/`.

## 2. What we pulled

Previously: *"Nothing. Zero requests, zero records, zero spend."* Now:

| Source | Records | US | Companies | Domain fill | Net-new (domain) | Verdict vs the ≥150 rule |
|---|---|---|---|---|---|---|
| **Walter Surface** | 12,368 | 12,364 | **4,991** | **0.0%** | **not computable** | volume leg ×17, code leg **fails** — and no domains |
| **Sullair** (adjacent) | 650 | 488 | 176 | 21% | **52–60** (18 in-ICP) | **fails**, ~3× under |
| **Festo** | 119 | 119 | 51 | 99.2% | **24** (~12 after strikes) | **fails**, >10× under |
| **SKF** (3-metro probe) | 92 | 92 | 21 | **0% on the main feed** | 5 → **44 projected national** | **fails both legs** |
| **Continental** (3-metro probe) | 157 | 152 | 84 | 70.4% | 13 → **82 projected national** | **fails**, ~2× under |
| **Pepperl+Fuchs** (complete) | 214 | **5** | **2** | 80% (of 5 rows) | **0** | **fails at zero** — no US distributors exist in the feed |
| **Industrial Scientific** (2 renders) | 74 | 74 | 23 | **0% on the ICP feed** | **0 usable** (5, all chains) | **fails at zero** |
| **Banner** (3-metro probe) | 60 | 60 | **16** | **97.8%** | 14 → **55 projected national** | **fails both legs — tier codes CONSTANT** |
| **Lincoln Electric** (3-metro sweep) | 271 | 271 | 159 | 21.4% | 5 → **44 projected national** | **fails**, ~3× under |
| **Bosch Rexroth** | **0** | — | — | — | — | **unresolved** — data tier returns HTTP 500 |

**All nine measured targets fail the tier's own decision rule.** Not one clears
≥150 net-new companies on the domain axis. The closest is Continental at a
projected 82, and even that is optimistic — see below. Pepperl+Fuchs and
Industrial Scientific are the floor at literally zero: P+F's entire US bucket is
four of its own offices plus a group subsidiary, and IndSci's five "net-new"
domains are all national chains.

Still **$0 billed.** Total origin cost across the whole tier is a few hundred
requests, all paced ≥3s, all cached, no UA rotation and no bypass anywhere. **One
403 was encountered** — Pepperl+Fuchs's `/api/protected/` path, answered
anonymously — and it **stopped that call immediately**; the records were then read
from the same payload inlined in the public, robots-allowed page, so the R-2
override was signed and never actually spent.

**Both projections are density-scaled against our own pool, not guessed**, and
both state the assumption that could break them. The three 100-mile probe
circles are geographically disjoint, so their coverage is additive; measure what
share of `deduped-v7`'s *geocoded* rows falls inside them, then divide observed
net-new by that share. SKF: 1,629 of 14,284 rows = 11.4%, so 5 net-new domains →
~44 national. Continental: 2,264 of 14,284 = 15.9%, so 13 → ~82. **The
denominator is a measured share of an existing list, not an estimate of the
national universe** — which is why the numbers are arguable rather than invented.
The shared assumption is that each manufacturer's dealer density tracks our
list's geography; if Continental's belt-and-hose network is thicker in the Gulf
and Rust Belt than our pool is, the projection is wrong in that direction. 14.6%
of the baseline has no lat/lng and is excluded from the denominator entirely.

**Continental's 13 net-new domains do not survive inspection intact.** The list
includes `applied.com` and `bdi-usa.com` — national chains that read as "new"
only because `deduped-v7` already excluded them by domain — plus
`summitracing.com` (automotive performance) and `kauffmantire.com` (tires),
which are the wrong vertical. **The same artifact that inflates Walter's 93.9%
is present here at small scale**, and it pushes the real figure below 82.

**Two sources publish essentially no websites, and that matters more than any
count.** Walter is 0.0%. SKF reports 9.8% — but that average is meaningless,
because `site` turns out to be a **feed partition, not a location**: the
`United States` feed is 82 records with **zero websites and zero emails**, while
a separate 10-record `Lubrication TE` side-feed carries 9 of each. **Every
website in the SKF pull comes from the lubrication side-feed.** The main dealer
feed has none.

The pipeline is domain-keyed end to end — S2 dedupes on domain, S3 must fetch a
site to classify catalog depth, §5l ranks on signals that only exist once a site
is read. **A row without a domain cannot enter any of it.** Walter's 2,562
net-new independents and SKF's 82 domainless rows are **no-domain-backlog input,
not list input**, and together they grow that workstream by roughly a third.

Chain concentration compounds it: **77% of SKF's probe records are five national
chains** (Motion 22, DXP 18, Applied 18, BDI 9, EIS 4), all $1.8B–$8B and far
above the $75M ICP ceiling.

**Provenance is 100% filled** on every record from every source: `source`,
`source_url`, `captured`.

## 3. How deep we went

The case for E4 has now been measured and come apart **four** times. The first
three are the history a fresh session would otherwise re-argue; the fourth is
new today.

1. **§5a — the line-card justification is void.** At five live sources, 98.3% of
   companies appear in exactly one source, 1.7% in two, none in three or more;
   only 8 companies (0.3%) carry 2+ brands. Validated against the literal
   shared-name ceiling. More sources cannot rescue it.
2. **§5b — depth was recoverable anyway, and cheaper.** The dealer's own
   line-card page yields 2.17 brands, up to 24, against 0.35 from a SERP snippet.
3. **§5f / §5h — the volume justification is void.** DataForSEO delivered 25,332
   companies against a need of ~3,000, and §5h changed the test: a wave is worth
   running only if it adds a qualification signal or copy asset we lack.
4. **NEW 2026-08-03 — the yield estimate is void, and not for the expected
   reason.** The tier was sized at +2,500–3,500 companies. Four sources measured:
   **Festo 24 net-new, Sullair 52–60, SKF 44 projected, Walter 2,562 — with no
   domains.** The one target that clears the volume bar is the one whose output
   cannot enter the pipeline. Strip the domainless rows and the tier's realistic
   seatable contribution is **roughly 80–120 companies**, not 2,500.

### The vertical-code rule, now at five confirmations and one honest counter-example

§5i's standing rule — manufacturer locators encode vertical in their own codes;
assume it and test it before seating — held again, twice:

- **Sullair's `product_line`** splits portable from stationary. Of 60 net-new
  domains only **18 carry the plant-air line**; the rest are Caterpillar dealers
  and rental houses. Construction and rental, not MRO.
- **Festo's `didactic`** isolates **9 companies (17.6%)** that are
  education/training-equipment resellers. All nine sit in the net-new set.

And the counter-example that keeps the rule honest: **Walter publishes no code at
all** — `getAllDistributorMarkers` returns four keys and no type, tier, category
or product line. The rule is "assume a code exists and test for it," not "a code
always exists."

**SKF looked like the richest code schema in the program and measurement said
otherwise — this is §5i working exactly as designed.** Its bundle publishes a
full decoding table: `distributor_category` DC001–DC028 (SKF Authorized,
Certified Partner, MRC, Lubrication Systems, Kaydon, RecondOil, Seal Jet,
Electric Motor, Sustainability Partner, Super Precision Partner, Maintenance
Partner, Seals) and `product_category` PC001–PC025. On that basis this file
originally claimed SKF "clearly clears the code leg."

**It does not. In the actual payload, `distributor_category` is a constant.** All
82 US rows carry the identical string `"DC001, DC028, DC021, DC011"`; the
10 lubrication rows carry `"NA"`. There is nothing to sort by. `product_category`
does sort, but only at company level — three values, identical across every
branch of a company — so it is a line card at low resolution, not per-record.
`type` is `SKF Distributor` on 100% of rows.

**A rich decoding table in a bundle is not a rich code in the data.** §5i's rule
is to capture codes verbatim and *test whether they sort before seating*, and
this is the clearest case yet of why the test is not optional: reading the
dropdown list would have produced a confident, wrong claim about the best
qualification signal we had found.

Two further corrections the probe forced, both worth carrying: the live dealer
route is **`locationNew`, not `location`** (all three call sites pass the flag),
and `research/01`'s field list is stale — `visit_website` is a CSS class in the
bundle, not a payload key. `phone_no_2`, `fax_no`, `distributor_offer`,
`distributor_category_names` and `product_category_names_translated` are all
**absent from the payload**; they are client-side render fields.

### A shared-fetcher bug this work found and fixed

Continental's `locatorType=aftermarket` returns a hard **HTTP 400** — Azure APIM
reporting a *backend* failure, so the route exists but its backend does not
answer. `_polite.py`'s retry ladder treated that as retryable and **re-sent it
five times across 345 seconds.**

That was a real defect in the shared fetcher and the opposite of what the file
exists to do. A 4xx outside 408/429 is **deterministic** — the server understood
the request and refused it — so retrying re-hammers a host with something it has
already definitively rejected, for an answer that cannot change. It affected
**every extractor in `scripts/sources/`**, not just this one.

Fixed in `_polite.py`: those codes now raise `Blocked` on the first attempt.
Verified both directions — a deterministic 400 stops at one attempt, and **429
still backs off and retries**, because that one genuinely is a timing signal.
Continental's request count is reported as **10 physical, not netted down to the
5 logical calls**, because the extra five happened.

One consequence worth carrying: **the `aftermarket` axis is untested, not
negative.** The `gad_only` and `gad_plus_aftermarket` figures in that source's
stats block are identical *because the call failed*, not because it returned
nothing new. Do not read them as a result.

## 3b. THE TIER VERDICT (2026-08-04) — nine measured, nine failed, one cause

Every E4 target has now been measured; the per-source numbers are in §2's table.
**Not one clears the decision rule.** This is no longer a series of individual
disappointments — it is a structural finding about what manufacturer locators
publish, and the three findings below are the part worth carrying out of this
tier.

### Finding 1 — locators withhold websites for exactly the companies we want

Walter 0.0%. SKF's main feed 0.0%. Industrial Scientific's ICP feed 0.0%. Lincoln
21.4%. In IndSci's case the split is perfect and inverted: **every row carrying a
website is a national chain; every ICP row carries none**, and the `url` column
is *empty rather than sparse* — structural, so sweeping harder raises the row
count without raising the usable count.

The pipeline is **domain-keyed end to end**: S2 dedupes on domain, S3 must fetch
a site to classify catalog depth, §5l ranks on signals that exist only once a
site has been read. **A row without a domain cannot enter any of it.** So the
tier's largest pulls are no-domain-backlog input, not list input.

### Finding 2 — the "tier code" was a decoding table four times running

§5i said capture codes verbatim and **test whether they sort before concluding
anything.** Four sources published a rich-looking code vocabulary over data that
does not vary:

- **SKF** — a full `DC001`–`DC028` decoding table; `distributor_category` is
  **one constant string** on all 82 US rows.
- **Banner** — `DISTRIBUTOR/BANNER/REPRESENTATIVE` × `DIGITAL/NATIONAL` in the
  bundle; across 46 dealers `CATEGORY_CODE` is **constant** and `SUBTYPE` is
  **null on every row**. `DIGITAL` and `JOINT VENTURE` never appear at all.
- **Lincoln Electric** — the SOQL SELECTs a five-column brand line card
  (`Lincoln_Electric__c`, `Oerlikon__c`, `Saffro__c`, `Equipment__c`,
  `Filler_Metals__c`) and **every one is `false` on every one of 271 rows.** The
  only genuine tier field, `X4_5_Star_Preferred__c`, sorts **2 of 271 (0.7%)**.
- **Industrial Scientific** — `countryCode` constant; `configTypes`,
  `lastMileDelivery`, `misc1/2`, `urlLabel`, `phone2` null on 100%.

**A published column is not a code, and a decoding table is not data.** The cost
of skipping that test is now measured in a signed compliance exception (§4).

Two counter-examples keep the rule honest: **Walter publishes no code at all**,
and **Sullair's `product_line` and Festo's `didactic` genuinely sort** — Festo's
isolating 17.6% education resellers, Sullair's separating 18 in-ICP companies
from 38 Caterpillar dealers and rental houses.

### Finding 3 — the name axis lies, consistently and by a lot

Net-new measured on `norm_company` versus on `domain`: Walter 93.9% → 89.4%,
Continental 3.0×, SKF 3.6×, **Lincoln 28×**. The inflation scales inversely with
website fill, because locators publish branch labels as company names. **Domain
is the only trustworthy axis**, and every number in this pack that matters is
quoted on it.

### What the tier actually returned

**Under 120 seatable, domain-carrying companies**, against an original estimate
of +2,500–3,500 — plus roughly 2,600 domainless rows that belong to
`no-domain-backlog`. Total origin cost across nine sources: a few hundred paced,
cached requests. **$0 billed.**

**Recommendation: E4 is finished. Do not open more locators on a volume thesis.**
The measured yield per source has never once approached the bar, and the reason
is structural rather than per-brand. If a specific segment's authorization stamp
is wanted, buy it deliberately and knowingly — as a signal, not as a list.

## 4. What's left on the table

**Revised down hard, and re-shaped.** The old estimate was +2,500–3,500 companies.

| What | Estimate |
|---|---|
| **Seatable, domain-carrying, from built sources** | **~80–120 companies** (Festo ~12 · Sullair 18 in-ICP · SKF ~44 projected · Walter's 11 free online-dealer domains) |
| **No-domain-backlog input** | **~2,600 companies** (Walter 2,562 + SKF's domainless share) — worth ~100–170 seatable *after* domain resolution, at that workstream's own rate |
| **R-2 Pepperl+Fuchs** | **0 — measured and closed 2026-08-04.** The feed has no US distributors at all. One live lead on a *different* host: `quotepf.com/wheretobuy`, robots-allowed, unprobed |
| **R-1 Banner** | still unsized here — signed 2026-08-04, build owned elsewhere |
| **Cleared but unbuilt (Lincoln, Bosch Rexroth)** | unsized. Both are one bundle-read from a data path |

**The honest argument for what was built** is unchanged from §5a's surviving
mechanism, and it is not about volume: every locator record carries **the brand
that listed it, at 100% coverage by construction**. A dozen Festo companies in
Segment A — the thinnest segment we have, after Parker went to Akamai — each with
a website, an email, and "authorized Festo distributor" attached, is better
per-company economics than anything in the 13,719-row ranked-out backlog.

**The counter-argument still stands and should be restated to whoever signs
R-1.** We hold 13,719 ranked-out companies we have not worked, and §5l says the
cut line is the weakest claim in the build — ≈6,513 of them would clear the cut
if simply fetched. **Buying more companies before working the ones in hand is the
mistake §5f named.** The measured yield above strengthens that argument rather
than weakening it: the tier's realistic seatable contribution is under 120
companies, against a backlog 100× larger.

**Recommendation: do not sign R-1 or R-2, and do not build Lincoln or Bosch
Rexroth on volume grounds.** Build them only if someone wants a specific
segment's authorization stamp — Lincoln for welding, Bosch Rexroth for fluid
power — and knows it is buying a signal, not a list.

## 5. Registry row

| e4-headless-locators | DONE-MEASURED | 0 | 0 | 2026-08-04 | nothing — 9 of 9 targets measured, all fail the ≥150 rule; both robots gates signed and one never spent; only Bosch Rexroth unresolved (upstream HTTP 500) | e4-headless-locators/ |
