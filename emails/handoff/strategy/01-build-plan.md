# Build plan — industrial prospect list (S1–S4)

**Status:** APPROVED to build (GATE-L1, 2026-08-01). All eight gates settled — decision log in [`00-sourcing-strategy.md`](00-sourcing-strategy.md) §9.
**Scope of this plan:** stages S1–S4 (source → normalize/dedupe → qualify → segment). S5–S7 (Apollo enrich, Truelist verify, Instantly export) are specced in the campaign pack and start when their keys land.
**Output:** `emails/lists/seated-v1.csv` + per-segment counts against the 2,500–3,500 raw target.

---

## 0. Do these first (day 1, out of band)

| # | Action | Why it's first |
|---|---|---|
| **D1** | **Buy Instantly + send domains (G2).** | The ~4-week warmup is calendar-bound. Every day it waits moves the send date one day. Nothing else on this page is time-critical; this is. |
| **D2** | Open Truelist + Apollo accounts (authorized). | Unblocks S5/S6 later. No build dependency. |
| **D3** | Fix PF-6 — DFS env alias (`.env.local` has `DATAFORSEO_*`, scripts read `DFS_*`). | Every DFS call in S1/S3 fails silently without it. |
| **D4** | Fix PF-7 — `parseCsv` has no quote handling. | Company names contain commas. Silently corrupts every CSV it touches. |

D3/D4 are autonomous and take minutes. D1 is the one that costs money and time.

---

## 1. Data contract (define once, everything conforms)

Every record, from every source, at every stage:

```
company            normalized legal-ish name (see §3 for the normalizer) — JOIN KEY ONLY
company_display    the name as published, original casing — USE THIS IN COPY
domain             apex domain, lowercase, no www — null until proven
email              contact address where a source publishes one; provenance in email_source
email_source       which source published it (see §7.2 cohort rule)
address_1, city, state, zip5
phone_e164         10-digit US normalized; primary join key BUT only ~92% populated
lat, lng
source             timken | enerpac | ad | ptda | dfs | serp | dorner | spxflow | …
source_url         exact URL fetched
captured           ISO date
brand_authorized[] brands this source proves they carry — MANUFACTURER BRANDS ONLY
line_card[]        product families/categories a source lists (NOT brands, NOT size proxy)
distributor_type   source's own type string (Sales/Service/Rental/Rep…), unmapped
tier_raw           source's own tier string, unmapped
location_count     distinct addresses for this company (after within-source dedupe)
disposition        null (seated) | chain | above-ceiling | sub-floor
                   | single-location-small | no-website | non-US | dead
                   | adjacent-trade | not-a-distributor
segment            A | B | C | W | null
evidence_depth     count of distinct sources this company appears in
```

**S1c extension (added 2026-08-01, S2 v2).** SERP self-identification is the first source that is
**domain-keyed** — no address, no phone — and the first that publishes the dealer's own words. Four
fields carry that:

```
self_declaration           the dealer's own sentence about the lines they carry, VERBATIM AS
                           PUBLISHED, original casing. This is email copy, not a data field.
                           Never title-case it, never trim it to a phrase, never paraphrase.
                           Trimming a fragment is S7's copy decision, not S2's data decision.
self_declaration_verbatim  true when read off the dealer's own page (the bounded fetch pass);
                           false when it came from a SERP snippet, which Google truncates
self_declaration_url       the exact page the declaration was read from. Required whenever
                           self_declaration is set — a quote without its page is a bug.
needs_identity_resolution  true when the record has a website and a brand claim but NO verified
                           company name, address or phone. S3 resolves it; a merge with any
                           identified record clears the flag (AND across the merged parts, not OR).
```

**Two dispositions were added with them.** `above-ceiling` is §5a's correction — a size-only catch
(≥20 distinct addresses, name not on the §3.3 blocklist) is above the revenue ceiling, not a chain;
it gets `pool-above-ceiling.csv`, mirroring `pool-small-shops.csv` at the other end.
`not-a-distributor` parks the manufacturer pages, marketplaces, job boards and trade press SERP
returns alongside dealers. `adjacent-trade` (§2a) predates both.

**Why `company_display` exists (measured 2026-08-01):** §1 originally defined `company` as the normalized name, which is lowercase and strips `inc/llc/corp`. That is correct for joining and useless for email copy — S7 needs "Acme Bearing Co.", not "acme bearing". Carry both from S1 onward.

**Why `line_card[]` is separate from `brand_authorized[]`:** Enerpac publishes product families per dealer. Folding those in as pseudo-brands would inflate line-card breadth, which S3 reads as a **size proxy** — so a single-brand dealer with six product families would score as a six-brand distributor. Keep them apart. `brand_authorized` gets `['Enerpac']` and nothing more.

**Rules that are not negotiable:**
- No record is ever deleted. Failing a filter sets `disposition` and routes to `emails/data/side-pools/`. (Artur's rule, 2026-08-01.)
- `source_url` + `captured` are required. A row without provenance is a bug, not a lead.
- Contact data never enters git (`emails/.gitignore` covers `data/`, `lists/`, `exports/`).

---

## 2. S1 — SOURCE

Build one extractor per source, each writing raw JSON to `emails/data/raw/<source>-<date>.json` before any transformation. **Raw payloads are kept this time** (earlier research deleted them after profiling) so re-runs don't re-hit the origin.

**Order — richest and easiest first, so the pipeline is testable early:**

| Order | Source | Method | Expected |
|---|---|---|---|
| 1 | ~~**Timken**~~ **DONE** | `map_id:2` only (`--map 2`); map 8 is a duplicate | **measured: 5,002 US → 1,908 companies**, website 67.6%, phone 91.8% |
| 2 | ~~**Enerpac**~~ **DONE** | `GET /ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json` | **measured: 433 US → 200 companies**, website 82.7%, phone 99.8%, **email 64%** |
| 3 | ~~**AD member locator**~~ **DONE** | 446 requests, 9 divisions × 50 metros (`DBP`/`ISC` are invalid server-side codes — 404, 100 queries lost) | **measured: 1,712 distinct — but only 493 ICP-shaped.** See §2a. |
| 4 | ~~**Dorner**~~ **DONE** | One GET, `distributorPlaces` inline | **measured: 98 companies**, website 98%, phone 99%, **email 95.9%** |
| 5 | ~~**SPX FLOW**~~ **DONE** | NOT `format=json` (that returns field *definitions*) — records come from `task=search_zip`, territory-matched, needs a ZIP grid | **measured: 171 companies** (est. was 200–450), website 88.9%, email 67.3% |
| 6 | **Lovejoy / Ballymore** | Agile Store Locator / Storemapper JSON | chain-heavy; expect ~150 net |
| 7 | **PTDA** | `research/scripts/ptda_post.py` ASP.NET postback | hundreds, needs branch rollup |
| 8 | **DFS listings** | `business_data_business_listings_search`, category × metro, 1,000/request | Segment A/C fill |
| 9 | **SERP self-identification** | 250-query program, **line-card axis state-scoped, not brand axis** | 650–800 |
| 10 | Interroll, FlexLink, mk NA, Matthews, Atlas Copco, Banjo, Kennametal | easy HTML/JSON/Excel | ~200 combined |
| 11 | **E4 headless tier** (funded) | Playwright, ~15 JS locators | +2,500–3,500 |

### 2a. AD is 3.5× smaller than modelled — for our purposes (measured 2026-08-01)

AD returned **1,712 distinct companies**, ahead of the 1,000–1,500 estimate. But the division breakdown changes what that means:

| Division | Distinct | ICP? |
|---|---|---|
| ESD (electrical supply) | 755 | no — contractor-facing |
| PLBG (plumbing) | 408 | no |
| HVAC | 351 | no |
| **BPT** (bearings & power transmission) | **261** | **yes** |
| **PVF** (pipe, valves & fittings) | **218** | **yes** |
| GSD | 198 | partial |
| WWD (waterworks) | 27 | no |
| **ISD** (industrial supply) | **18** | **yes** |
| BSDC | 6 | no |

**Only 493 distinct companies sit in the ICP-shaped divisions (BPT + PVF + ISD).** The remaining ~1,219 are electrical, plumbing and HVAC trade distributors — real businesses, wrong buyer for Catalog AI. Per the no-delete rule they route to a new side pool, **`pool-adjacent-trades.csv`**, rather than being discarded; they may suit a different offer later. 530 companies carry 2+ divisions, so classify on the union of divisions, not the first one seen.

**AD's yield curve did NOT flatten** — the last 10 of 50 metros still added 255 companies (14.9% of total). The constraint is AD's fixed 50-mile search radius, not a result cap (max 129 rows/query). **More metros would still pay, and the efficient version is to run metros 51–150 for the three ICP divisions only** rather than all nine.

### 2b. The single biggest lever in S2: branch-stripping

Distinct-company counts swing **32%** (1,981 → 1,350 across the acquired set) depending on whether the name normalizer strips branch suffixes. **Decision: strip.** Dorner calibrates it — with stripping, its counts reproduce the research figures (76 companies / 56 single-location) *exactly*. That is empirical validation against a known-good source, not a preference. S2 must still report both numbers so the lever stays visible.

**Correction to §3.1:** the "AD stores Google-Maps URLs in the website column" quirk **does not exist** — 0 of 5,438 rows. It was an artifact of the old research script's fallback regex. Keep the cleaner (harmless, other sources may need it) but don't treat it as a known defect. AD does have **302 rows with genuinely null websites** → Segment W candidates.

**Pacing (Artur confirmed slower is fine):** ≤1 request per 3s per host; 429 → exponential backoff, never parallelize against one host; cache every response; the throttled trio (ARO, Miller, Ingersoll Rand) runs overnight. **Adaptall is NOT in S1** — it's a lookup service, used in S3 only.

---

## 3. S2 — NORMALIZE + DEDUPE

**Order matters. Chain suppression runs BEFORE dedupe** or national chains dominate the line-card graph and score as "high line card" — exactly the accounts we can't sell.

1. **Normalize.** Phone → 10-digit. Company → lowercase, strip `inc|llc|corp|co|company|ltd|the`, collapse whitespace/punctuation. Address → USPS-ish abbreviations. Website field → strip Google-Maps URLs (AD stores map links in the website column), extract apex domain.
2. **Dedupe WITHIN each source first — this step is new and it is load-bearing.** Measured 2026-08-01: Timken's map 8 shares zero marker IDs with map 2 but is 99.7% the same *companies*, so ingesting both **doubles every location count** (Motion Industries 378 → 704). That silently turns step 3's ≥20-location chain threshold into ≥10 and would sweep mid-size regional independents into `disposition: chain`. Deduplicate to distinct `(company, address)` pairs per source **before** any location counting.
3. **Suppress chains.** Named blocklist: Motion Industries, Applied Industrial, FleetPride, DXP, BDI, Kaman, Grainger, Fastenal, McMaster-Carr, RS Components, SunSource. Match on normalized name **plus** a ≥20 **distinct-address** count in-dataset (per step 2, never a raw row count), so a regional independent sharing a word isn't caught. → `disposition: chain`.
4. **Roll up branches.** Same company, multiple addresses → one record, `location_count` retained (it feeds the small-shops rule and the size proxy).
5. **Dedupe across sources.** Primary key `phone_e164` — but **measured at 91.8% on Timken, not the 100% §4 assumed**, so ~8% of records join on the secondary path and it carries real load: normalized-name + zip5, tiebreak street number + zip5. Report the collision rate on the secondary key; if it is high, tighten with street number before merging. **Merging is additive** — union `brand_authorized[]` and `line_card[]`, keep every `source_url`, prefer the longest `company_display`, increment `evidence_depth`. This is the line-card graph; it's built here, not in a separate step.

**Timken map 8: settled — it is a duplicate.** 9,002 raw records, 1,895 companies, of which **1,890 already appear in map 2. Five net-new companies.** Ingest `map_id:2` only; map 8 stays in raw for provenance. This closes an open question from `research/01`.

**Watch:** Adaptall's finding that `premier`-style tier flags can be *inverted* (73% of its premier tier were chains). Never treat a source's tier string as a quality signal without checking which way it points — keep `tier_raw` unmapped until validated per source.

---

## 4. S3 — QUALIFY

Runs entirely on today's keys. Sets `disposition`, never deletes.

1. **Domain resolution.** Website field → verify apex resolves. If blank, recover from: manufacturer-published dealer email (5 sources carry one), then DFS listing lookup, then a name+city search. A company with a working email domain **has** a web presence the locator didn't record — this is what makes Segment W honest.
2. **Segment W gate.** Only after domain resolution fails on *all* routes → `disposition: no-website`, `segment: W`. Park, no sends (GATE-L2).
3. **Catalog depth (PF-3, decided).** Crawl the site for product-page count / catalog signals. **General MRO (Segment C) needs ≥1,000 SKUs; specialists (A/B) need ≥200.** Below → `disposition: sub-floor`.
4. **E-commerce detection.** DFS `domain_technologies` per domain. *Absence of detection is not proof of absence* — it tiers evidence, it never disqualifies. "Has site, no cart, thin catalog" = the sharpest Catalog AI prospect.
5. **Size proxies (floor $2M, decided).** No single field decides. Score the stack: employee count (distribution runs $300–500K revenue/employee → **$2M ≈ 4–7 people**, $5M ≈ 10–20), `location_count`, catalog depth, line-card breadth, AD membership. Below floor → `disposition: sub-floor` → **`pool-small-shops.csv`** for Artur's other project. Expect the $2–3M boundary to be genuinely fuzzy; when in doubt, seat it and let the tier sort it.
6. **Suppression join — at pull time, not send time.** Join the shared phone DNC list and any prior-contact list here. This closes the campaign pack's highest-consequence gap.

---

## 5. S4 — SEGMENT + TIER

**Segments** (pack-canonical): **A** fluid power/hydraulics · **B** bearings/PT · **C** general MRO ≥1,000 SKUs · **W** no website (parked).

**Priority tiering** — this does the work the $2M floor gave up:

| Tier | Rule | Use |
|---|---|---|
| **T1 hot** | $10–50M proxy band · `evidence_depth` ≥3 · has site, no e-comm · owner-identifiable | Track 1 founder-manual 50 — draw from **Segment B** (deepest evidence at week 1) |
| **T2** | $10–50M, `evidence_depth` 1–2 | Main Track 2 volume |
| **T3** | $5–10M | Volume |
| **T4** | **$2–5M — measured separately** | Can rarely absorb $10–30K. Do not read its silence as a copy failure. |
| **Cohort E** | manufacturer-published email only | **Isolated micro-campaign** (§7.2 safeguard) — separate bounce/reply reporting |

**Send-volume reality check (P3, decided):** the pool builds freely; sending stays inside P3's ≤100-account test. Track 1's ~50 fits. Build 3,000, send 50.

**Export:** `emails/lists/seated-v1.csv`, plus `pool-small-shops.csv`, `pool-segment-w.csv`, `pool-chains.csv` in `data/side-pools/`.

---

## 5a. S2 measured results (2026-08-01) — and the finding that changes the strategy

Ran off cached S1 payloads, zero network. `tsc` clean, eslint clean, 63/63 tests.

**Union: 2,992 companies → 2,355 seated · 637 adjacent-trade · 54 chains.** Conservation **PASS** (7,898 in = 4,233 seated + 1,487 adjacent + 2,178 chain rows). Seated is **145 short of the 2,500 low end** — S1c (SERP, AD expansion, PTDA) is still running and will close it.

Per source, post within-source dedupe: timken 1,760 · ad 1,072 · enerpac 193 · spxflow 163 · dorner 75 (sum 3,263 → union 2,992).

**Fill on the union:** website 70.3% · phone 86.2% · email 10.4% (312 records: enerpac 140, spxflow 103, dorner 69).

### The line-card graph did not materialize — and Angle 2 must be re-based

**`evidence_depth`: 2,940 companies at 1 source (98.3%), 52 at 2 (1.7%), zero at 3+.** `brand_authorized` ≥2 is **8 companies (0.3%)**.

This is not a join bug. It was validated against the ceiling — the number of normalized names two sources *literally share*: timken×ad 43, timken×enerpac 10. The dedupe is sitting on that ceiling. **Manufacturer dealer networks are far more disjoint than the strategy assumed.**

`research/01` predicted overlap would get strong "at 5+ sources." We have five and it is 0.3%. The two largest sources, covering 2,832 companies between them, share 43 names. **Adding more sources will not fix this** — extrapolating from a 1.5% pairwise share, even fifteen more locators moves multi-brand coverage into low single-digit percentages.

**What this does NOT break.** Angle 2 ("you're authorized on lines you barely list") never actually required *multi*-brand evidence. Single-brand authorization is available for **100% of locator-sourced records by construction**, and it is already a sharp email: *"You're an authorized Enerpac distributor and you don't come up for Enerpac repair in Houston."* The multi-brand version is stronger, not necessary.

**Re-base Angle 2 on two things we do have:** (1) single-brand authorization from the locator that listed them, and (2) the SERP self-identification quotes — the dealer's *own words* about the lines they carry, which is better copy than any database join because it is quotable verbatim.

**Demote §4's edge-stack claim #1** (`00-sourcing-strategy.md`) from "the line-card graph" to "single-brand authorization + self-declared line cards." The differentiator survives; the mechanism changed.

**Consequence for GATE-L4 (headless tier, funded).** Its stated justification was line-card depth. That justification is now void. Its remaining value is raw company count — which S1c may make unnecessary. **Recommend holding the build until S1c reports**, and re-deciding on volume grounds alone.

### Other S2 corrections

- **Real bug found and fixed.** The §2b normalizer split on *any* dash, collapsing "Tri-State Bearing" and eight others onto the token `tri`. Fixed to whitespace-adjacent dashes only: **+242 companies recovered.** All 13 residual merges verified by hand.
- Branch-strip lever is **20.1%** post-dedupe (2,992 vs 3,746), not the 32% measured pre-dedupe.
- Dorner calibrates 75/56, not 76/56 — exact on single-location, one company short.
- **AD ICP-shaped is 276, not §2a's 493** — that figure was pre-rollup.
- Secondary-key collision rate **1.59%**, well under the 5% tightening threshold. Phone made 190 merges, name+zip5 only 16 (7.8%).
- Map 8 re-checked at 4 net-new. Exclusion holds.
- **Chain rule over-reaches on size, not on identity.** The ≥20-address rule caught Purvis (72), IBT (35) and Hydradyne (34) — regional independents, not national chains. They are correctly *out* of the seated list, but for the wrong stated reason: they are above the revenue ceiling, not chains. Retag as `above-ceiling` and give them a side pool of their own, mirroring the small-shops pool at the other end. 22 were caught by name, 33 by the ≥20 rule; Grainger and RS Components never appeared at all.

## 5b. S1c measured results (2026-08-01) — and the line-card rescue

**SERP self-identification: the best-performing source in the program.** 246/250 queries, **cost $1.36**. 6,397 organic → 5,125 dealer-candidates → **1,474 distinct dealer domains**; hand-checked precision on two random samples (75% singletons, 80% multi-hit) → **~1,120 genuine**, which is **1.4–1.7× the 650–800 projection, with no saturation at 250 queries.** All eight Cloudflare-blocked brands recovered without touching their servers: Parker 188 · Regal Rexnord 64 · Dixon 62 · WEG 45 · ESAB 33 · Gates 30 · ifm 26 · Norton 20. **577 domains carry a quotable self-declaration; 285 upgraded to page-verbatim** by a bounded fetch pass (406/493 OK; 50 refused — 48×403, 2×429 — left alone, no bypass).

**AD expansion: +320 net-new, ICP-division pool 493 → 817 (+66%).** But **the curve has now flattened** — the last 10 of 100 metros added 26 companies (4.8%) versus 14.9% in run 1. §2a's "more metros would still pay" held for 51–150 and fails beyond. **Stop AD.**

**PTDA: 159 distinct companies** (not the "hundreds" estimated), 1,588 locations, website 100%, phone 99.5%. Nine nationals hold 75.4% of locations; **150 genuine independents**. Its `line_card` averages **8.4 of 14 categories**, with 31 companies carrying all 14. The extractor in `research/scripts/ptda_post.py` had a wrong field map — corrected, plus `ShowAll` and VIEWSTATE chaining.

### The line card is recoverable — just not by joining locators

§5a concluded the line-card graph was falsified. **That conclusion was right about the mechanism and wrong about the goal.**

S1c measured it directly: the SERP *result text* yields 0.35 brands per result, but **the dealer's own line-card page yields 2.17 brands per page, up to 24.** Depth was never missing from the world — it was missing from the *join*. **Dealers publish their own line cards; we just have to read them instead of reconstructing them.**

This is strictly better than the original plan: it is the dealer's own published claim (quotable verbatim), it needs no cross-source overlap, and coverage is bounded by "does this dealer have a line-card page," not by "do two manufacturers both list them."

**Actions:** (1) run a line-card fetch pass over seated companies with websites, populating `brand_authorized[]` properly — this rebuilds Angle 2's evidence base; (2) **GATE-L4 (headless tier) is now doubly unjustified** — it was funded for line-card depth, which page-fetching supplies far more cheaply, and the pool clears target without it. Recommend not spending it.

**Query-design finding for future SERP runs:** the best queries were **brand-agnostic** — `"master distributor" industrial "line card"` returned 58 domains, beating `"Parker Store"` at 43. Gates's retail-program term returned 3 organic results and 0 dealers; `research/04` listed it as a top open item — it's a dead end.

## 5c. S3a measured results (2026-08-01) — chains, identity, ICP, Segment W

**Seated: 3,530 — 3,184 fully identified (in range), 346 unresolved.** Conservation PASS (11,649 in = 11,649 out). Side pools: chain 58 · above-ceiling 36 · adjacent-trade 635 · non-US 147 · not-a-distributor 110 · no-website 160.

**Chain suppression fixed — 39 previously-SEATED companies were national chains.** All five Kaman subsidiaries (Minarik 19 locations, Zeller 10, Catching 6, Florida Bearings 4, Western Fluid 4), Motion Ai, 13 DXP companies on `dxpe.com`, 8 BDI divisions, `rs-online.com`, plus PTDA's "Motion" (403 addresses) and "W.W. Grainger" (225) relabelled from `above-ceiling` to `chain`.
**Design note worth keeping:** naive token containment would have been *worse* than the prefix bug it replaced — a bare `motion` token sweeps Evolution Motion Solutions, Systems in Motion and Power Motion; a bare `applied` sweeps four more. The shipped rule uses a lead-token guard and measured **zero false positives.**

**Identity resolution: 909 of 1,276 resolved (71.2%)**, 189 partial, 71 unreachable, 70 refused (403, abandoned). **JSON-LD carried it** — 547 sites publish an Organization/LocalBusiness node, supplying 521 of 776 names. 1,180 of 3,135 page reads came from cache; 1.53 network requests per domain against a cap of 3.
**Architectural finding: cross-source dedupe is not finished when S2 ends.** 19 seated companies collapsed onto phone numbers that identity resolution supplied — §3.5's primary key simply does not exist yet for domain-only sources at S2 time. **The pipeline needs a re-dedupe pass after identity resolution**, not just after S2.

**ICP classification: 1,575 of 1,640 SERP domains (96.0%) are genuine industrial distributors.** Directory 25 · trade-press 12 · manufacturer 12 · job-board 7 · marketplace 5 · general-retail 3 · **auto-parts 1 · promotional-products 0**. The enrichment agent's warning about auto-parts and promo-products contamination **does not survive measurement.** 328 kept as `icp_uncertain`.
**Methodological trap caught:** SERP snippets echo our own query language ("line card", "authorized distributor"), so snippet-weighted scoring rated **swagelok.com and esab.com — manufacturers — as strong distributors.** Our own query terms were contaminating the classifier. Snippets now discounted 0.4×; the homepage is the evidence.

**Segment W collapses on verification: 668 candidates → 508 rescued (76.0%), only 160 genuinely have no website.** `research/01` warned that a missing locator field is not proof of absence; it was right, and the effect is large — Timken's 1,622 null-website records were mostly stale manufacturer data. **Segment W is a ~160-company segment, not a ~1,600 one.** Route yields also invert the plan's §4.1 order: name+city search 303 · DFS listing 181 · email domain 24 (only 29 no-domain records carry an email at all). Cost $8.65 across 1,070 calls.

### Open — a rule the plan lacks

**Multi-company domains are ambiguous and the blocklist cannot resolve them.** `partsauthority.com` carries **60** distinct seated companies, rushtruckcenters 39, napaonline 36, mhc 27, singerindustrial 27, otcindustrial 21 — branch names that survive normalization. But blanket-blocking the domain is *wrong* for `theprontonetwork.com` (13 companies = a **buying group of independents**, exactly our ICP) and for NAPA jobbers, who are independently owned.

Two discriminators worth testing, in order of expected power:
1. **Vertical, not structure.** Parts Authority, NAPA, Rush Truck Centers and MHC are **automotive and truck** — wrong vertical regardless of the chain question. The ICP classifier only ran over SERP-sourced domains; **run it over every record** and most of this problem disappears as `not-a-distributor`.
2. **Independence test** for what survives: do the constituent companies appear in other sources on their own (`evidence_depth` > 1) or hold their own domains? Independents sharing a group site do; chain branches do not.

Also open: **`above-ceiling` currently mixes Bass Pro and Cabela's (retail — should be `not-a-distributor`) with Purvis and Hydradyne (genuine large industrial distributors).** Split it.

## 5d. S3b measured results (2026-08-01) — catalog depth, e-commerce, and the SKU floor problem

2,783 domains enriched, HTML evidence on 2,285 (82.1%); 193 refused with 403/429 and were recorded, never bypassed.

**E-commerce class:** `catalog_no_cart` **1,343 (48.3%)** · `brochure` 717 (25.8%) · `unknown` 488 (17.5%) · `ecom_full` 235 (8.4%). Platform identified on 521 (WooCommerce 321, Shopify 66, Wix 35, Magento 34, BigCommerce 29).
**Sharpest single cohort found: 226 domains with a product catalog, an RFQ button, and no cart at all.** That is the offer's thesis rendered as a query — they sell online, they just can't transact or be found.

**Validation of the free detector:** a 50-task DataForSEO sample ($0.54) agreed on commerce detection **84.2%** of the time; 5 of the 6 disagreements were DFS blanks on carts that demonstrably work. It also exposed one real defect — `$0.00` empty-cart totals were scoring as prices — now fixed. **The free detector is good enough; do not spend on per-domain DFS technology lookups.**

### ⚠ PF-3's SKU floor cannot be applied mechanically — it has to become a tiering signal

`sku_estimate` distribution: **unknown 1,539 (55.3%)** · 0 → 307 · 1–49 → 573 · 50–199 → 122 · 200–999 → 90 · 1k–5k → 60 · 5k–20k → 41 · 20k+ → 51. Only **242 clear ≥200 and 152 clear ≥1,000.**

Hand-adjudication of 21 domains / 59 URLs: 7 pass, 4 fail, 1 indeterminate; automated precision **0.60**, with 80% of sampled URLs landing in the ≥200 band. Failure modes, and they are not symmetric: category-only sitemaps **under**-count (creating false sub-floor drops), `/dept-XXX` listing pages over-count into the ≥1,000 band, datasheet URLs pollute, and JS-rendered catalogs are invisible to sitemaps entirely.

**Consequence for GATE-L3/PF-3.** Artur chose a hard floor — 1,000 SKUs for general MRO, 200 for specialists — over the "score it instead" option. **That choice is not implementable at acceptable error.** Over half the pool has no estimate at all, and the errors that do occur are biased toward *dropping real prospects*. Applying it as a gate would discard qualified companies on measurement noise.
**Implemented instead: SKU depth is a tiering input, not a filter.** No record is gated out on `sku_estimate`; it orders the list. This is the third option from the original question, forced by measurement rather than preference. Flagged for Artur to overrule if he wants the gate anyway — the no-delete rule means a wrong call here routes companies to a side pool rather than destroying them, so it is recoverable either way.

### Brand breadth is inverted, and now quantified

Share of dealers with full e-commerce, by brand count: 0 → 4.5% · 1–2 → 12.1% · 3–5 → 14.5% · **6–10 → 18.4%** · 11–20 → 15.0% · 21–40 → 20.0% · 41–64 → 36.4% · **65+ → 50.0%**.

**More brands predicts the catalog problem is already solved** (finditparts 113 brands, penntoolco 96, mrosupply 65 — all fully transactional). Ranking on breadth would have surfaced precisely the dealers who need nothing.
**Proposed ICP band: 3–20 brands, peak 6–10** (n=163, ICP-fit 10.4% — the highest of any band with n>50; 3–20 combined n=504, fit 8.3%). Caveat honestly stated: `location_count` tops out at 19 in this set because S2 already removed above-ceiling firms, so the ceiling test ran on e-commerce share and SKU magnitude rather than size directly, and n=17 above 40 brands is thin.

### The T1 seed set

**161 domains match `catalog_no_cart` AND 200 ≤ SKU < 20,000** — 153 of them already in the pool. This is the sharpest prospect definition the build has produced and should seed S4's T1 hot tier, intersected with the 3–20 brand band and the $10–50M size proxies.

## 5e. S3c measured results (2026-08-01) — the vertical filter, and why the pool shrank by a third

**Final: 2,110 seated — 1,768 fully identified, 342 unresolved.** Conservation PASS (11,649 in = 11,649 out), 0 contract violations, 114/114 tests, S3a still reproduces `deduped-v3.csv` byte-for-byte.
Pools: not-a-distributor 1,443 · adjacent-trade 784 · non-US 147 · chain 58 · no-website 40 · above-ceiling 17.

### The finding: Timken's locator is mostly automotive, and it told us so all along

**Timken's raw markers carry the source's own vertical code — we had already captured it in `tier_raw` and never read it.** Decoded: category 4 = 3,184 US markers, **95.2% automotive/truck**; category 5 = 1,813 markers, **98.8% industrial**.

**Seated Timken collapsed from 1,187 category-4 records to 15.** Our largest source was around two-thirds wrong-vertical — Timken sells bearings into both the automotive aftermarket and industrial MRO, its locator mixes them, and nothing in a company's *name* or *homepage* reliably separates "Joe's Bearing & Auto" from "Joe's Bearing & Supply". The code decided **2,165 markers that neither the name nor the homepage axis could read.** Exactly one category-5 record was routed out.

**The earlier decision to keep `tier_raw` unmapped paid for itself here.** §3's rule was "never interpret a source's tier string until it's validated, because Adaptall's `premier` flag was inverted." That caution preserved the field verbatim, which is the only reason it could be decoded three stages later. Capture source-native codes; interpret them late.

**Vertical breakdown of the 4,676-company union:** industrial 2,930 (62.7%) · **truck-fleet 1,007 (21.5%)** · other-trade 345 · **auto-parts 316** · directory 26 · manufacturer 16 · trade-press 13 · retail 8 · marketplace 8 · job-board 7. **1,478 records moved pool; 1,341 left seated.** 955 kept as `icp_uncertain` rather than guessed.

### §5c's multi-domain problem: solved, and my framing of it was wrong

All five large multi-company domains vanished to the vertical filter, not to any structural rule: partsauthority 63→0, napaonline 52→0, mhc 52→0, rushtruckcenters 49→0 — **and theprontonetwork 14→0.** I had written that Pronto "must be KEPT" as a buying group of independents. It **is** a buying group of independents — **automotive** ones (Parts Plus / Parts Authority banners). **Vertical, not structure, was the discriminator**, and the instruction to preserve it was wrong.
Two corrections the agent made against its brief, both right: "fails independence → chain" is wrong for paramountsupply, bds-usa, purvisindustries, mc-mc and bearingheadquarters — those are one company's branches the normalizer couldn't collapse, so the §3.4 rollup was reused instead. And S3a's homepage-first precedence would have **kept all 63 Parts Authority rows**, because partsauthority.com's homepage classifies as `industrial-distributor`. Singer (27→1) and OTC (21→1) resolved to `above-ceiling` — acquired brands on a parent's site, the same shape as the Kaman/DXP/BDI cases.

`above-ceiling` cleaned to **17, all genuine large industrial distributors** (Bass Pro, Cabela's and the rest left by vertical). A real gap closed on the way: §2a's AD division rule had never been run over this pool.

### ⚠ There is no suppression list — the pack's "highest-consequence gap" is still open

Eight conventional locations searched. `doNotCall` exists only as a checkbox in the /sales cockpit's **browser localStorage**; Sanity holds **0 `precallLead` documents**; `07-compliance.md` states policy without data. **The join is wired and tested, and there is nothing to join.** If any prior-contact, opt-out or existing-customer list exists anywhere — a spreadsheet, a CRM export, an inbox — it must be supplied before the first send. Nothing in this pipeline can invent it.

### The real gap: we are short for S5/S6, not for S4

The pack's arithmetic is **2,500–3,500 raw → 1,400–2,000 seated after a 30–40% cull** — and that cull is Apollo contact-finding plus Truelist verification, both of which are still ahead of us. Our 1,768 fully-identified companies × 60–70% survival ≈ **1,060–1,240 final**, which lands **below the 1,400 floor**.

**Need roughly 700–1,200 more identified industrial companies.** Cheapest routes first, in order: (1) SERP expansion — it never saturated at 250 queries and cost $1.36, with brand-agnostic patterns outperforming brand-specific ones; (2) DataForSEO business listings, specced in §2 and **never run**, at 1,000 records per request; (3) the remaining easy-tier locators (Lovejoy, Ballymore, Atlas Copco, Banjo, Kennametal, NTN, Quincy, Interroll, FlexLink, mk NA, Matthews, NORD, Gast, Yaskawa). **GATE-L4's headless tier stays unspent until these are exhausted** — three cheaper sources sit ahead of it.

**Carry the Timken lesson into all of them: capture every source-native category, type and tier code verbatim, and check whether it encodes vertical before assuming a source is industrial-only.**

## 5f. DataForSEO listings (2026-08-01) — the gap is closed, and the problem inverts

**45,554 raw → 41,773 distinct listings → 25,332 companies / 17,472 domains.** Fill: **phone 97.2% · ZIP 99.9% · website 87.5% · email 32.0%** — the best NAP density of any source in the program. Cost **$16.98**, under the $25 cap.

**Recovery note:** the stalled first attempt had actually completed all 48 API calls and then died holding 45k records in RAM before writing. Its verbatim response cache survived, so the rebuild **cost $0.00**. Worth remembering — a stalled agent is not necessarily lost spend, check the cache before re-buying.

**Sweep shape:** 30 categories across 3 batches, **US-wide single radius rather than metro-by-metro**. Each batch returned exactly its server `total_count`, so the category union is exhausted — metro slicing would only re-bill overlaps. That is a cheaper pattern than the AD metro sweep and worth reusing.

**Against a 700–1,200 company need: 16,882 new domains (13,219 clean).** The gap is not closed so much as obliterated. **GATE-L4's headless tier is now definitively unnecessary for volume** — three independent reasons have now pointed the same way, and its original line-card justification was already void. **Do not spend it.**

### `category_ids` encodes vertical — and names the next contamination

Mean 4.33 codes per record across 1,694 distinct codes. The automotive exclusion worked: **3.8% auto/truck versus the pool's 21.5%.** But it surfaced the next trap: **construction and building materials at 20.5%**, plus equipment rental 8.3% and propane/HVAC 7.2%.

**A convergent-validation result worth trusting:** 62.9% of DFS records carry no wrong-vertical marker, against §5e's independently measured 62.7% industrial share of the earlier pool. Two different sources, two different methods, same number.

**Rule for S3: never seat on a single category code.** 80.2% of records carry only one core industrial code, and codes co-occur — "Brighton Spring Services" matches `spring_supplier` *and* `truck_parts_supplier`. Weigh core-versus-cluster counts.

**Segment W reopens: 5,217 no-website records flagged, 4,245 clean companies.** Verified W was only ~160 pool-wide before, because locators list dealers who already have web presence. DFS surfaces businesses locators never listed. At §5e's measured 76% rescue rate these would still leave roughly a thousand genuine no-website industrial businesses — **materially larger than the 160 that made me call Segment W not worth a separate offer.** Flagged for re-decision at GATE-L2 once verified; still candidates, not confirmations.

### ⚠ The pipeline order must change — we now have ~10× the volume it was designed for

S3's enrichment stages were built for ~2,800 domains and were already slow. At 17,472 domains and ≤1 request per 3s per host, a single catalog-depth pass is **14+ hours**. The plan's order (qualify everything, then rank) is no longer affordable and no longer necessary.

**Revised order — filter and rank cheaply first, enrich only the slice that survives:**

1. **Merge + normalize** all sources (offline, fast).
2. **Vertical filter on `category_ids`** — kills construction, rental, propane, auto/truck before anything expensive runs.
3. **Chain suppression + dedupe** (offline).
4. **Size proxies** from signals already in hand — phone/ZIP density, `location_count`, review counts, AD/PTDA membership, line-card breadth where known.
5. **Rank and cut to ~3,000–4,000** candidates.
6. **Only then enrich** — catalog depth, e-commerce class, line-card fetch — on that slice.

This inverts the original economics: we were short and enriched everything; we are now long and should enrich selectively. **The binding constraint is no longer supply, it is qualification throughput.**

## 5g. SERP wave 2 (2026-08-01) — and a correction to §5b's query rule

**500 queries run, 497 completed.** 13,664 organic rows → 2,403 distinct dealer domains → **1,477 net-new against wave 1. Union: 2,951 dealer domains.** **819 carry a quotable self-declaration**, 481 of them net-new, stored byte-exact down to non-breaking spaces.

**Program spend: $2.36 total** — and only **$0.10 was spent this session**, because the "stalled" first attempt had already paid for and cached 472 queries. That is the second time today a stalled agent turned out to have banked its spend. **Always check the cache before re-buying.**

**It still has not saturated.** Net-new per query is 2.97 versus wave 1's 5.99 gross, but the entire decline is the step off block 1's windfall — blocks 2–10 show no downward trend, and the final block (2.10/query) beats blocks 3 through 8. A wave 3 would still return roughly 2 domains per query.

### ⚠ §5b's query-axis rule was wrong at scale — superseded

§5b told future runs to **state-scope the line-card phrase**, derived from wave 1's small sample (12 net-new of 17 versus 6 of 13). Wave 2 measured the broader axis on far more data, order-independently:

**National brand-agnostic phrasings returned 11.76 net-new per query. Geographic scoping returned 2.45–2.59.** Roughly 4–5× worse.

Wave 2 spent only 60 of its 500 queries on the national axis — that allocation was wrong, and it was wrong because of my own guidance. **Corrected rule: prefer national brand-agnostic phrasings; use geographic scoping only to mop up.** A wave 3 inverting the mix (250–300 national, ~150 geographic) would be expected to return 1,000–1,500 net-new for about $2.

**Decision: do not run wave 3.** Not because it wouldn't pay — it would — but because §5f already made supply irrelevant. We hold 25,332 DFS companies against a need of ~3,000. **The binding constraint is qualification throughput, not acquisition.** The rule above is recorded for whenever the list needs replenishment (D-01 retires zero-engagement contacts weekly), not for now.

**Automotive contamination stayed trivial:** 2.9% of wave-2 dealer domains versus 1.6% in wave 1, scored with one identical regex across both waves. The ~1.3pp rise is the price of ten new categories. Against §5e's 21.5% truck-fleet share in the locator pool, **query-side suppression clearly works.** Honest caveat from the agent: this is snippet evidence seeded by our own query terms, so **treat 2.9% as a floor, not a measurement** — the same contamination effect §5c caught rating Swagelok as a distributor. Flags are recorded verbatim; nothing was filtered on them.

**Engineering fix that outlasts this run.** The original stall lost everything because records lived in memory until a single final write. The rewritten harness appends each record to a `.jsonl` partial on completion, fsyncs every 25 queries, resumes by skipping completed keywords, and can rebuild output from partials alone; `pool.map` became `as_completed` so one slow query cannot block the write path. Reconciliation caught something else worth knowing: **the old stalled process was still alive and had written a truncated 13,497-row file over the top of the good one.** Verify partial reconciliation, not just file existence.

## 5h. The wave roadmap (set 2026-08-01, at Artur's direction)

**The test a wave must pass has changed.** Until §5f we ran waves for volume. With 25,332 companies in hand against a need of ~3,000, volume is worthless. **A wave is now worth running only if it adds a qualification signal or a copy asset we do not already have.** Rows we cannot process are a cost, not an asset.

| Wave | Source | The unique signal it adds | Verdict |
|---|---|---|---|
| **W3** | SERP, national brand-agnostic axis (~400 queries, ~$2) | The dealer's **own quotable sentence**, plus brand-authorization evidence for the 8 Cloudflare-blocked brands — reachable no other way | **Running** |
| **W4** | **USAspending.gov** by distributor NAICS (open API, no key) — specced Tier 2, **never run** | Federal award history = verified legitimacy, an **independent revenue-band proxy** (our $2M floor currently rests on weak headcount proxies), and a personalization line nothing else can write | **Running** |
| **W5** | Buying-group new-member press releases (AD, Sphere 1, NetPlus, GAWDA, MDM) | **Timing** — a distributor that just joined a buying group just decided to fight the nationals. Small N, highest intent signal available | Queued |
| — | DFS category expansion beyond the 30 swept | Nothing new — more of the same rows we already cannot qualify fast enough | **Not worth running** |
| — | SERP wave 4+ | Diminishing; the quotable-declaration yield is the only reason to return | Only for replenishment |
| — | **E4 headless locator tier (GATE-L4, funded)** | Nothing. Line-card justification void (§5a), volume justification void (§5f) | **Do not spend** |

**The real constraint is downstream.** Every new domain adds to an enrichment queue that runs at ≤1 request per 3s per host. Acquisition is cheap and fast; qualification is neither. W3 and W4 are justified on signal, but each also lengthens that queue — which is why the merge-and-rank pass (§5f's revised order) runs in parallel rather than after them.

## 5i. Small-locator tail (2026-08-01) — and the vertical-code rule, generalized

| Source | Raw | US | Distinct | Website | Phone | Email |
|---|---|---|---|---|---|---|
| Yaskawa | 1,248 | 1,248 | **232** | 0% | 98.6% | 0% |
| Interroll | 14 | 14 | 14 | 100% | 100% | 0% |
| FlexLink | 6 | 6 | 6 | 100% | 100% | 100% |
| mk North America | 76 | 76 | 4 | 5.3% | 86.8% | 100% |
| Matthews Marking | **GATED — 403** | — | — | — | — | — |

**Union 256, of which 240 net-new.** 357 origin requests, zero 429s, no bypasses. Yaskawa's 232 have **no website field at all** — they enter the domain-resolution queue.

**Matthews is now Cloudflare-403**, where `research/06` recorded it at 200 earlier the same day. Stopped and recorded; no host-switching, no bypass. Worth remembering: **a source fingerprint has a shelf life**, and a locator that was open this morning can be gated this afternoon.

### The rule: manufacturer locators encode vertical in their own codes — assume it until disproven

This is the **third independent confirmation**, and it is no longer a Timken quirk:

1. **Timken** — category 4 vs 5 split automotive from industrial; decoding it collapsed seated Timken from 1,187 records to 15 (§5e).
2. **DataForSEO** — `category_ids` separated industrial from construction, rental, propane and auto/truck (§5f).
3. **Yaskawa** — `groupList` sorts hard: D09 139 · D13 62 · D02 42 · D23 19 · D33 0. **69 of its 232 companies (29.7%) are reachable only through the HVAC and iQpump groups** — building controls, not MRO. 151 are ICP-only, 12 appear in both. A second signal corroborates it in the tier badges (`hvac-logo`, `iq-icon2`). **Do not seat Yaskawa records without reading `groupList`.**

**Standing rule for every future source:** capture all source-native category, group, type and tier codes verbatim; **assume they encode vertical and test that before seating anything**; and never interpret a code's meaning until it has been validated against the records (Adaptall's `premier` flag was inverted, and Yaskawa's D33 = factory-direct rather than a parse failure). Three sources in, the cost of skipping this check is measured in thousands of wrong-vertical records.

Two silent-failure traps fixed on the way: Yaskawa's parameter is `groupList`, not `groupSelect`, and its tier filename sits mid-path in a Liferay URL — both would have returned plausible-looking but wrong data rather than an error.

**Fold-in note:** these 240 net-new companies are *not* in the merge-and-rank pass now running, which was scoped to the sources available when it started. They need a later fold-in — as do SERP wave 3 and USAspending.

## 5j. Merge + rank at scale (2026-08-01) — `shortlist-v1.csv`

**17 sources · 60,937 deduped rows → 29,281 companies → 17,960 seated → shortlist 3,500.** Conservation **PASS** (60,937 in = 60,937 out), 0 contract violations, 164/164 tests, `tsc` and eslint clean.

Cross-source merges: phone 1,427 · name+zip5 196 · **domain 733** (the new join path). Collision rate **0.23%**. Domain-only SERP entities: 2,813 → 733 anchored to existing companies, **2,080 net-new**.

**The vertical filter is now the single largest decider — it settled 74.9% of seated records.** 4,474 routed out. Final classes: industrial 25,286 (84.2%) · other-trade 1,955 · truck-fleet 1,297 · auto-parts 874 · retail 348. Rejections by cluster: construction 550 · propane/HVAC 518 · auto/truck 394 · facility-retail 289 · rental 192 · agriculture 82 · electrical 67.
**Tuning result worth keeping: the category margin had to be 2, not `vertical.mjs`'s 4.** At 4 it rejected 5,288 raw rows; at 2 it rejects 6,911, and a 25-record random sample of the difference read **25/25 correct** — garage-door companies riding `spring_supplier`, plumbers and well-drillers riding `pump_supplier`.

**Size bands:** above-band 434 · $10–50M 2,240 · $5–10M 6,383 · $2–5M 8,903 · sub-floor 439.

**The top 100 look right.** catalog-no-cart 97/100 (the RFQ cohort supplies 40) · brand count in the 3–20 band 73/100 · `evidence_depth` ≥2 95/100 · carries a quotable declaration 74/100 · $10–50M band 66/100 · full NAP 98/100 · **unresolved identity 0/100**.
**Shortlist fill:** domain 100% · phone 97.6% · address 96.7% · email 51.9% · declaration 13.1% · `brand_authorized` ≥2 = 451.

### ⚠ The ranking is a trustworthy filter but not yet a trustworthy order

**Enrichment coverage, not volume, is the binding limit.** S3b's catalog and e-commerce data covers 2,783 domains against 17,960 seated — so **the top of the ranking is partly a map of which domains we happened to look at first.** Companies that were never enriched cannot score on the strongest signals, regardless of merit.

**§5f step 6 must now run on the shortlist before the order means anything.** Until then, treat `shortlist-v1.csv` as "3,500 companies that survived every filter" rather than "the 3,500 best companies, in order."

Related honesty note: **the cut is not a natural break.** 539 companies share the boundary score of 30, so membership at the margin is a tiebreak, not a judgement.

### Two bugs found in code that had been running for three stages

1. **`split()` was stringifying arrays.** `String(['a','b'])` → `"a,b"`, then splitting on `|` yields one element — so **every multi-brand record counted as a single brand.** The first run of this pass reported `brand_authorized ≥2 = 0`, which is what exposed it. Now 451 on the shortlist.
2. **`decodeEntities` missed double-encoded entities** (`&amp;mdash;`), leaving three companies stored as "Products &mdash; Campbell Sales and Service, Inc."

Both are fixed and **`deduped-v4.csv` changed as a result** (still 2,110 companies; three names corrected). **The lesson: a derived aggregate that reads as a clean zero is evidence of a bug, not of an empty set.** Any pipeline metric that collapses to 0 or to a suspiciously round number deserves a source-data check before it is believed.

**`icp_uncertain` had to be redefined twice.** "Thin evidence" flagged 84% (§5f had already measured that 80.2% of DFS records carry a single core code); a name-axis version still flagged 68.6%, because DFS names are bland. It now means strictly *no axis could decide* — 57.3% — and thin evidence is priced into `rank_score` instead (11,744 seated sit below a `category_core` of 5).

**Segment W stands at 4,348 candidates**, unverified. §5e measured a 76% rescue rate on the last cohort, so expect this to fall hard — but it is an order of magnitude above §5c's 160 and materially reopens GATE-L2.

## 5k. SERP wave 3 (2026-08-01) — and the query rule, corrected a second time

**389 queries completed, $2.88** (genuine spend — the cache was empty this time). **2,798 net-new dealer domains** against a 3,317 baseline: **7.00 per query, a 70.1% net-new rate. Three-wave union: 5,749 domains** — roughly double the top of §5g's 1,000–1,500 projection.

**The wave's actual purpose delivered: 2,081 of 2,798 net-new domains (74.4%) carry a quotable self-declaration**, against wave 2's 32.6%. Stored byte-exact, including 1,603 containing non-breaking spaces and 112 published in ALL CAPS. **All eight blocked brands covered — 502 net-new brand-tagged domains:** Parker 153 · ESAB 76 · WEG 65 · Gates 62 · Norton 42 · Dixon 39 · Regal Rexnord 36 · ifm 29.

### §5g's rule was confounded — it was mostly ladder depth, not query axis

§5g reported national brand-agnostic phrasings at 11.76 net-new/query versus geographic at 2.45, and I turned that into a standing rule. Wave 3 ran **explicit controls** — 30 national queries forced onto the standard ladder, 30 geographic promoted to deep — because §5g had ruled out ordering but never ruled out depth:

| | queries | net-new/query |
|---|---|---|
| national / deep | 174 | **11.56** |
| national / standard | 66 | 6.18 |
| geographic / deep | 30 | **9.33** |
| geographic / standard | 119 | 4.29 |

**Holding depth constant, the axis is worth 1.24–1.44× — not 4–5×. Holding axis constant, depth is worth 1.87–2.17×.** Geographic-deep beats national-standard outright. §5g's 11.76 was a real number for its own family; the comparison it sat inside was confounded.

**Corrected rule (second revision): pull the ladder deep first, then prefer the national axis.** Depth is the larger lever and it applies to both axes. Rolled up, national 9.63 versus geographic 4.80 is a genuine 2.0× — worth having, but half the story.

**No saturation at 1,150 cumulative queries.** Interleaved blocks ran 8.62 / 8.96 / 10.44 then five flat blocks (5.96, 5.56, 5.18, 5.92, 5.32) with no downward trend. Still ~5.3 per query.

### Two findings that prevent real damage

1. **Negated declarations.** Brokers publish the *inverse* sentence — "is **not** an authorized distributor". 2.5% of declaration records, and **30 net-new domains carry only that form.** Flagged `declaration_is_negated` and already excluded from the 2,081. **Quoting one of those back at a prospect would be a catastrophe**, and a naive regex would have done exactly that.
2. **Precision is NOT measured for this wave.** §5c's 96% figure was measured on wave-1 domains. Spot-checks here found aggregators (recruitmilitary, datanyze) classified as `dealer_candidate` while merely republishing one dealer's sentence. **Re-run the classifier before treating 2,798 as companies** — the count is domains, not verified distributors.

**Efficiency note:** 26% of spend ($0.755) went on failed ladder rungs, because the deep ladder asks for 100 results at depth 7 first and only 48% of deep queries were served there. Tune the opening rung before any future wave. **Dead ends:** sub-brand OR-pair phrasing (7 of 11 failures) and the catalog-PDF axis, which underperformed its `research/04` billing badly at 2.20/query and 2 usable declarations — the weakest axis in the wave.

**Fold-in queue** (none are in `shortlist-v1.csv`): wave-3's 2,798 domains, the small-locator tail's 240 companies, and USAspending when it lands.

## 5l. Enrich + re-rank (2026-08-01) — the order is fixed, the membership is not

Shortlist enrichment coverage **32.9% → 100%** (3,310 domains; 9 excluded as manufacturers). 2,258 line-card targets + 2,220 sitemap probes fetched. 107 line-card and 87 sitemap refusals recorded and abandoned, no bypass.

**`shortlist-v2.csv` distributions:** `catalog_no_cart` **1,966 (56.2%)** · brochure 883 · unknown 391 · `ecom_full` 196. **RFQ cohort 379.** **`brand_authorized` ≥2 = 1,070** (was 451), with 761 in the 3–20 band. SKU measured on 1,687 (48.2%) — precision unchanged, still tiering-only.

**Churn proves the order WAS an artifact.** Only **72 of the original top 100 survive**, and **all 28 that rose in had zero catalog evidence under v1**. 2,100 of 3,346 survivors moved 500+ places, mean absolute shift 784. The enrichment pass was not a refinement; it was a correction.

### ⚠ The cut line is the weakest claim in the build

**Order: now trustworthy. Membership: not.**

Measured: **≈6,513 of the 13,716 unenriched ranked-out companies would clear the cut score of 30 if simply fetched — 1.9× the entire shortlist.** Enriching only the shortlist **sharpened the selection bias rather than removing it**: companies never fetched cannot score on the strongest signals regardless of merit, so the shortlist is "3,500 companies we happened to look at that also scored well," not "the best 3,500."

**Correction in flight:** a full enrichment pass over all ~13,700 unenriched seated domains, after which a single **global re-rank on even coverage** replaces both v1 and v2. Until that lands, do not treat shortlist membership as a judgement about the companies outside it.

### The `??`-on-zero bug is now a recurring class — assume a third instance

A live instance was caught in the ranking path: `e?.brand_count ?? s.brand_count`. **`??` does not fall through on `0`**, so **394 rows shipped `brand_count = 0` while being ranked on their true value** — one company sat 5th, scored on 16 brands, published as zero. Fixed in the v2 path; **`s4-merge-rank.mjs` still carried the same line** and is being fixed now, along with a tree-wide grep for `??` and `||` applied to numeric fields where `0` is legitimate.

This is the second appearance of the same failure mode (§5j's `split()` on stringified arrays was the first). Both were caught only because a derived aggregate read as a suspiciously clean number. **Standing check: any pipeline metric that comes out as exactly 0, or suspiciously round, gets verified against source data before it is believed.**

Two tooling faults also hit live and are patched: a scheme-less `<loc>` element killed the sitemap run at record 1,586, and `ex.map` ordering starved the checkpoint writer. **The jsonl partial recovered 86 records that the JSON flush had already lost** — checkpointing has now paid for itself three separate times today.

**Also outstanding:** nine manufacturers (flowserve, grundfos, nsk, smcusa and five more) sit on the shortlist — a vertical-filter miss being fixed at the classifier level rather than by hard-coding exclusions, since §5c caught the same failure mode rating Swagelok and ESAB as distributors.

## 5m. Fold-in + bug sweep (2026-08-01) — `deduped-v6.csv`

**64,534 rows → 32,004 companies → 19,908 seated.** Conservation **PASS**, 0 contract violations, 180/180 tests, `tsc` and eslint clean. No shortlist written — the global re-rank waits for even enrichment coverage.

### The predicted third bug instance existed, was latent, and would have fired on this very fold-in

§5l said "assume a third instance." The sweep found it:

1. **`s4-merge-rank.mjs:175`** — `e?.brand_count ?? s.brand_count`, live. 1,606 domains carried `brand_count: 0` from the line-card pass; **486 of them also had a locator brand list that `??` silently discarded** (394 inside `shortlist-v1`).
2. **`lib/size.mjs:190`** — `brandCount || null`. A *measured* zero collapsed to null, **and that is precisely what let bug #1 hide.** Two instances of the same class covering for each other.
3. **The predicted third, latent and armed:** `mapLocator`'s `String(v).split('|')` applied to array-valued code fields. Interroll's `solutions_raw` and mk's `products_raw` would have glued into a single unmatchable token, **silently destroying the vertical code** — the exact field §5i just established as load-bearing. It would have fired on this fold-in.

Two more reported and deliberately not fixed (report cosmetics; a zero that is impossible today). **~110 records corrected.** The standing check earns its place: **any derived metric reading as a clean zero gets verified against source data.**

### Manufacturer contamination was 21 on the shortlist, not 9 — and the fix is list-free

A new identity axis in `lib/vertical.mjs`, ordered first, does two things. It applies the acquirer registry (354 domains) to **all 21 sources** — it had only ever run against SERP. And it adds a **list-free rule: an apex label that matches a brand in our own `brand_authorized` vocabulary is a manufacturer.** That rule alone catches 11 makers on no list at all (Gorbel, Garlock, Walter, Alfagomma, Kuriyama). Against v5 seated it flags 93 rows across 66 domains, **21 of them on `shortlist-v1`** — more than double the nine we knew about. All routed; zero seated. Also fixed: S3c classified *before* the merge, so a cluster that acquired a domain later escaped routing (Linde) — S4's relabel now catches it.

### Wave 3: raw precision is 56%, not 96% — the rank is what makes it safe

2,734 net-new by apex, 2,615 seated. Hand-checked samples tell two different stories: across the whole population **14/25 = 56%**; restricted to rank ≥30 (477 domains) **24/25 = 96%**.

**81.8% of wave-3 domains sit below the cut**, so the ranking — not the classifier — is what keeps aggregators out. **Do not treat 2,798 as prospects.** The usable figure is the ~477 that clear the cut, and those are excellent. My earlier framing of wave 3 as "2,798 net-new" overstated it as prospects; it was always a domain count.

**Negated declarations: zero leaked.** 39 negated-only domains written byte-exact to their own file; 27 are genuine grey-market disclaimers. **One correction — the NBSP framing was wrong:** all 1,603 non-breaking spaces are edge padding, none internal, so the preservation concern was smaller than stated. 60 ALL-CAPS declarations preserved; 2,629 of 2,634 byte-exact (the 5 are merge-inherited from sibling domains).

**Yaskawa reproduced §5i exactly:** `groupList` splits 143 ICP-only / 69 off-ICP-only / 12 both — 29.7% off-ICP, the same figure measured independently. 58 of the 69 routed to `adjacent-trade`. Third confirmation that manufacturer locators encode vertical in their own codes.

## 5n. Full-pool enrichment (2026-08-01) — the selection bias is closed

**13,436 domains enriched to 100% coverage in a single ~68-minute pass.** Enriched seated domains went **3,782 → 17,163 (22.0% → 99.8%)**; the only 39 left out are the deliberately-excluded manufacturer and marketplace hosts. 26,817 domain-passes, HTML evidence on 83.8%, 3,018 line cards found (250 of them PDFs) and 7,381 sitemaps.

**Made tractable by host-disjoint sharding**, not by relaxing pacing: line-card pass on shard A runs alongside the sitemap pass on shard B, then they swap, so **no origin ever sees two live processes**. Rate limits unchanged. 868 refusals (762 of them 403s) recorded and abandoned, no bypass. All four passes reconcile field-for-field against their `.jsonl` partials — 0 torn, 0 differing.

### The result: 4,967 newly-enriched companies clear the cut — 1.42× the entire shortlist

**§5l's ≈6,513 projection was 31% too high, and for an instructive reason.** It derived expected score gains from a distribution measured on **already-selected** companies. The never-looked-at pool earns a **median gain of 8, not 18**. The projection was itself contaminated by the selection effect it was built to measure. **Direction survived, magnitude did not** — worth remembering whenever a projection is extrapolated from the enriched half of a biased split.

**Enrichment cuts both ways, which is reassuring.** 2,147 companies scored *lower* once evidence arrived, and 1,631 were routed `sub-floor` out of the ranking entirely. Evidence is not a promotion mechanism.

**And the original ranking was not noise — just not optimal.** The newly-enriched pool is genuinely weaker on average: `catalog_no_cart` 44.2% vs the shortlist's 56.2%, brands-in-the-3–20-band 5.0% vs 21.7%, zero-brand 81.7% vs 50.2%. The shortlist was better than average; it simply was not the best 3,500.

**Bug class, fourth appearance.** 236 further rows hit the live `??`-on-zero case on top of v1's 394. `rank.mjs` handles it; **`s4-merge-rank.mjs`'s export line — separate from the line-175 instance already fixed — still does not.** Being cleared in the final pass.

**Two defects still to clear:** 39 seated domains are manufacturers or marketplaces (`google.com`, `bbb.org`, `3m.com`, `skf.com`, `uline.com`), plus 45 more in the ranked-out pool — the new identity axis exists but had not been applied globally. And 33 SKU estimates exceed 100k, all extrapolated from 8 sitemap children; bounded, and **safe only because nothing is gated on SKU count** — exactly why §5d refused to make it a filter.

**An unplanned dedupe signal:** two domain pairs returned byte-identical SKU estimates because they are the same site served on two domains. Identical `(sku_estimate, ecom_class, brand set)` triples across different domains catch duplicates the name, phone and domain keys all miss.

## 5o. S4 COMPLETE (2026-08-01) — `emails/lists/seated-v1.csv`

**3,000 rows, 3,000 distinct domains, one send target per row.** Inside §6's 2,500–3,500. At the pack's 60–70% survival through Apollo contact-finding and Truelist verification, that projects to **1,800–2,100 — inside the 1,400–2,000 target.** Cut at `rank_score` 45, not 30: with even coverage, 8,093 seated companies clear 30, so **the bar moved rather than the list growing.**

**Segments** (list / all seated): A 1,145 / 4,165 · B 408 / 1,180 · C 1,447 / 11,374 · **W 4,445 parked.** Hand-adjudicated 25/25 defensible.
**Tiers:** T1 44 · T2 1,377 · T3 1,104 · T4 177 (5.9%, measured separately) · T0 298 `above-band`.
**Cohort E (232) became a COLUMN, not a tier** — the §5 table shape was demoting 19 genuine T1 leads on a fact about *email provenance*, which is orthogonal to prospect quality. Isolation for send purposes is preserved; the ranking no longer penalises it.

**Fill:** domain 100% · phone 98.8% · address 98.2% · zip 97.8% · email 55.1% · declaration 23.2%. **`brand_authorized` ≥2 = 1,144 (38.1%).** Evidence depth: 1 → 62.1%, 2 → 30.0%, 3 → 5.5%, 4+ → 2.4%.
**T1 profile (44):** 40% Segment B · 29% RFQ cohort · 57% carry a declaration · 93% have an email · median score 80.

**Conservation PASS** (32,004 = 32,004). **Negated declarations leaked: 0. Provenance gaps: 0. Contract violations: 0.** 212/212 tests, `tsc` and eslint clean.

### Three of my own briefing claims were wrong, and the agent checked rather than complied

1. **The `??`-on-zero "fourth appearance" was not real.** Both instances were *already fixed* at `s4-merge-rank.mjs:175` and `size.mjs:190` before this stage's input was written — two parallel agents had reported the same two bugs against stale state, and I stacked them into a false count. Tree re-swept; residual hits are safe idioms. **Parallel agents reporting the same defect can manufacture a phantom trend.**
2. **The 39 seated manufacturers did not exist in v6.** Those were v5 counts; the fold-in's identity axis had already cleared them. Zero seated hits on re-run. Two genuinely new rules (`file-host`, `measured-miss`) then routed 21 more.
3. **My duplicate-SKU example was an estimator artifact.** `shingle.com`/`walkerindustrial.com` matched only because both were capped 8-of-39-child extrapolations, and the naive sweep flagged 5,667 domains. Rebuilt on the full sitemap fingerprint: **781 genuine duplicates routed — and the largest class was one nobody asked about, `D0` same-apex, at 731** (139 domains carried up to 4 rows each), plus a 41-domain `forklift-parts-<city>` doorway network.

**Premise correction that mattered:** §5n's "99.8% coverage" was measured against v5. **v6 added 1,975 domains afterwards, so true coverage at the start of this stage was 89.2%.** Closed by fetching the missing 2,064 under unrelaxed policy → 100.0%.

**Churn:** 50 of 100 top survivors versus v1, 65 versus v2; 979 entrants (32.6%). And on §5n's headline: of the 4,967 newly-enriched companies, **4,656 crossed score 30 but only 780 (16.8%) actually seat.** They cleared a bar that was simply too low — the finding was directionally right and materially smaller than it sounded.

### §6 failures, stated plainly

- **T1 = 44 against Track 1's 50.** The binding constraint is `evidence_depth ≥3`. Relaxing to ≥2 yields 400 candidates. **GATE:HUMAN — Artur's call**, left unsigned rather than quietly relaxed.
- **Suppression / DNC join: FAIL. There is no data anywhere.** The join is wired and tested; nothing exists to join. This remains the campaign pack's highest-consequence gap and **no send should happen until it is resolved.**
- **USAspending has not landed** — a later fold-in handles it.
- 11 identity-routed rows are real companies hosted on `weebly.com` / `myshopify.com` / `business.site`, plus one subdomain that escaped apex collapsing — the identity-resolution backlog.

## 5p. USAspending / wave 4 (2026-08-01) — a signal source, correctly demoted to enrichment

**26,964 award records → 3,975 distinct US companies, deduped 100% on UEI**, in ~2,915 requests over 2.3 hours for **$0.00**. Fill: UEI 100% · DUNS 93% · state 94.6% · full street/city/ZIP5 58% overall and **100% on the detail tier** · **website, email and phone: 0%.**

**That zero decides how the source is used.** With no contact data, every net-new company here would need full identity and domain resolution — the most expensive step in the pipeline — and we already hold a complete 3,000-row deliverable. So it folds in as an **enrichment layer keyed on name + ZIP5**, adding federal-award evidence to companies we already have, with the unmatched remainder parked as an identity-resolution backlog rather than seated.

**Vertical cleanliness is its best property: roughly 10× better than any other source.** Only 41 companies carry construction codes and nothing else, and 138 transport — against §5e's 21.5% truck-fleet contamination and §5f's 20.5% construction. Federal procurement data is simply better classified than commercial listings.

### The revenue proxy works as a ceiling, not as a floor — the hoped-for use was wrong

§5h justified this wave partly as an **independent revenue-band proxy**, because the $2M floor rests on weak headcount estimates. Measured, it does not do that job: small-business median federal spend is $266K against $616K for other-than-small — 2.3× separation with heavy overlap — and **Jamaica Bearings holds $149M in federal awards while still carrying the `small_business` flag**, because the SBA's wholesale standard is employee-based rather than revenue-based.

**Use it to exclude nationals at the top. Never treat it as evidence that a company clears $2M.** Half the justification for the wave survives; the more important half does not.

**Three findings worth carrying:**
1. **`hasNext` lies at depth.** NAICS 423610 reported `false` at page 120 with **550 awards still outstanding**. The pull paged until genuinely empty and reconciled all ten codes against the count endpoint. Any future pagination here must do the same — trusting the flag silently truncates.
2. **Do not route this source on NAICS alone.** 62.2% sit under a manufacturing NAICS, but **44.2% of those are not flagged `manufacturer_of_goods` — agencies code by the part, not the seller.** Naive routing would misclassify real distributors as manufacturers. Realistic usable yield is **2,200–2,900, not 3,975**.
3. **PSC codes are free vertical evidence** and land squarely on our segments: bearings 776, pumps 460, power transmission 101. Useful to corroborate or correct Segment A/B assignments.

## 5q. USAspending fold-in (2026-08-01) — small match, one real finding

**Match rate is low and the honest conclusion is that this source barely touches our pool.** 264 of 3,975 federal companies matched (6.6%) — 146 on name+ZIP5, 118 on a name+state tier added because HQ-versus-branch ZIP mismatch is the dominant miss. Against the deliverable: **90 of 3,000 seated (3.0%)**. **No re-rank, no `seated-v2`** — 3.0% is not material and award value is not a rank input. `seated-v1.csv` stands.

**False positives: 0 across all 268 pairs** — hand-checked in full rather than sampled. Two join insights worth keeping: **26 matches (9.8%) exist only through `alternate_names`**, because the source publishes DBAs and former names (Enerpac→Actuant, Curtiss-Wright→Enertech, Air & Liquid→Buffalo Pumps); and **41 matched rows (16.2%) inherit a *parent's* award total** (VSE Corporation → `vseaviation.com`). **Product-code descriptions are safe to quote in copy; dollar figures are not.**

**Net-new: 3,711 parked, 0 seated** — 2,772 under a new `identity-backlog` disposition, deliberately *not* `no-website`, which would have polluted the already-decided Segment W. That lands inside §5p's predicted 2,200–2,900.

**My briefing was wrong on the ceiling rule and the agent inverted it correctly.** I wrote that `small_business` should gate the ceiling exclusion; letting it veto keeps a **$149M national (Jamaica Bearings) inside a $75M list.** The flag is now corroboration on the soft tier and ignored on the hard one.

### ⚠ §5o's "zero seated manufacturers" is falsified

**Of the 90 seated companies with federal data, 24 (26.7%) self-declare `manufacturer_of_goods` to SAM.gov** — JLG, Kaydon, NHBB, EDDY Pump, Leistritz, RIX, Louis Allis, TorcUP — plus 3 caught by the ceiling signal. 26 rows named for review and correctly **not routed**: that is an ICP adjudication, not an enrichment pass's decision.

**Why this matters more than the count.** These companies passed every filter we have, **including the list-free brand-vocabulary rule, because they present as distributors on their own websites.** Only a third-party self-declaration exposed them — and we hold that declaration for **90 of 3,000**. The other 2,910 have never been tested by any signal capable of catching this. **Do not extrapolate 26.7%**; federal contractors skew heavily toward manufacturers. An audit is running to measure it properly and build a detector that works without SAM.gov.

**Bug class, fifth appearance, and the most dangerous form yet.** The fold-in's first cut read `manufacturer_of_goods` from `business_flags` instead of `business_types[]`, got `undefined` on all 3,975 records, and **reported zero manufacturers — silently, in the reassuring direction.** A related trap in the same object: `business_flags` is written 19-keys-all-false on every record including the 1,742 never profiled, so **all-false means "not profiled", not "no flags"** — observation must read `has_detail`. Both now tested. The standing check holds and should be read as: **a zero that confirms what you hoped is the most dangerous number in the pipeline.**

## 5r. Sending infrastructure — verified live 2026-08-01. **This is now the binding constraint.**

**Warmup has never run. Not "is off" — never, since the mailboxes were created 2024-08-18.** All six are `INACTIVE` with a lifetime warmup send count of zero, confirmed against the warmup-stats endpoint (0 sent, 0 spam, 0 received, no non-zero day in the visible window). **There is no clock to resume. It starts from zero on the day it is switched on**, and the list has been finished and waiting since today.

**Senders (confirmed):** 6 mailboxes — 3 on `salesolution.co`, 3 on `salesolution.io` — at 80 messages/day each, a 480/day ceiling. SMTP and IMAP both validated today. Transport is **Amazon SES**; replies land in **Zoho IMAP**. **Flag: `expires_at` reads 2025-08-18 on every mailbox, roughly 11 months past** — worth a dashboard glance.

**Auth, from DNS rather than the API** (Smartlead exposes no SPF/DKIM/DMARC for SMTP accounts, and its `warmup_reputation: "0%"` is not a health score): SPF valid on both domains, Zoho DKIM present, SES custom MAIL FROM configured, tracking CNAMEs resolve. **Gaps: DMARC is `p=none` on both**, and SES DKIM cannot be verified externally.

### Retire both domains — the recommendation, and why it costs nothing

The prior campaign ("Transformation", Dec 2025 – Mar 2026) sent **4,899 emails to 409 leads and produced 204 opens (4.2%), 0 clicks, 0 replies, 2 unsubscribes.**

Two things make that diagnostic rather than merely disappointing:
- **The open rate is flat at 3–5% across all twelve sequence steps.** There is no decay curve. A sequence that degrades over time suggests fatigue; one that starts flat and stays flat was **wrong from email one** — the pattern of mail that never reached an inbox.
- **The "0 bounces" figure is a measurement artifact, not a result.** SES delivers bounce notifications asynchronously, and they never arrive in the Zoho inbox that Smartlead reads. **The real bounce and complaint data is sitting unexamined in AWS SES.** Any deliverability claim based on that zero is unfounded.

**Verdict: retire `salesolution.co` and `salesolution.io` for outbound and buy fresh domains.** The reasoning is that warmup must run four weeks *regardless* of which domains are used — so switching costs **~$50 and zero calendar time**, while reusing domains with an unexamined 4,899-send history risks the entire program on an unknown reputation. Confirm via the SES reputation dashboard and a blacklist lookup if you want the evidence first, but the asymmetry already favours replacement.

### ⚠ Security: rotate these credentials

**The Smartlead API returns plaintext AWS SES SMTP credentials and Zoho IMAP passwords, and one password is reused across all six mailboxes.** Rotate them, and give each mailbox its own. Also permanent: **Smartlead auth rides in the query string, so its URLs are secrets — it must never be routed through `politeFetch`**, whose disk cache would write the API key to disk.

**Client status:** 10 read functions verified live (including `fetchAll` pagination across 4,899 rows). **All 8 write paths remain unverified**, and `setCampaignStatus` has unresolved POST-versus-PATCH documentation — the first thing to suspect when a write fails.

## 5s. Manufacturer audit (2026-08-01) — `seated-v2.csv` = 2,847, and ~10% contamination remains

**Measured contamination in `seated-v1`: ~445 rows, 14.8%, 95% CI 8.5–21.2%** — stratified with 269 rows hand-read, corroborated by an independent random-30 at 20.0%. The fold-in's 26.7% was directionally right and not an artifact. **Roughly one company in seven on the "finished" list was a manufacturer, not a distributor.**

**153 routed** (152 `not-a-distributor`, 1 `above-ceiling`), **every one read by hand** → **`seated-v2.csv` = 2,847**. Produced because 5% of a precision list going to JLG and RBC Bearings is material. **No backfill; cut score stays 45** — restoring 153 rows means dropping the cut to 44, which re-imports ~23 unexamined manufacturers.

**`seated-v2` does not fix this: ~294 manufacturers remain (10.3%).** The detector runs **precision 0.892 / recall 0.27** — it catches the obvious cases reliably and misses most of the rest. Reported untuned; two phrase fixes would take precision to 0.938, and the untuned number is the honest one.

**The 26 flagged rows adjudicated:** 15 genuine manufacturers routed (NHBB, JLG, RBC Bearings, Kaydon, Louis Allis, Leistritz, EDDY Pump, RIX, Yates, TorcUP…), 1 ceiling-only (**Jamaica Bearings is genuinely a distributor** — it holds AS9120, the *distributor* standard, and appears in five locators — routed `above-ceiling` on $149M, not as a manufacturer), and **10 false flags kept**. Those ten share one shape: **a distributor that fabricates on top of what it sells.** The category boundary is genuinely blurry, and **SAM.gov's `manufacturer_of_goods` runs only 58% precise (14/24) — a real signal, never a verdict.**

The hardest technical problem was **subject attribution**: `sealcompany.com` publishes "Garlock® is a leading manufacturer…" about a brand it *resells*, and the first cut routed it out. Homepage text for 2,865 of 3,000 domains was recovered offline from the existing cache rather than re-fetched.

### ⚠ Two numbers I reported were wrong

- **`brand_authorized` ≥2 is 387 (12.9%), not the 1,144 (38.1%) in §5o** — that figure was `brand_count`, a different field. I passed the inflated number on. The line-card evidence base is real but a third the size I stated.
- The fold-in's `seated_review` carries a join defect: `rbcbearings` is reported at rank 37 with no segment, while the seated row is rank 50 / Segment B / T3. **Rank 37 cannot be seated at all — the floor is 45.**

### Bug class, sixth appearance — and the worst failure mode yet

`makeRecord()` running before `toCsv()` **silently blanked every S4 column in `seated-v2`**. The output had an identical header, the correct row count, and **conservation PASSED** — while 35,927 individual fields were wrong. Nothing structural caught it. **Only a field-for-field readback did**, which is now asserted in code.

**The lesson upgrades:** structural checks — row counts, headers, conservation totals — cannot detect field-level corruption. **Any pipeline stage that writes a list must read it back and diff it field-for-field against what it intended to write.**

Also noted: signal D3 (a manufacturer's locator naming the company) has a false-positive mode — `sealfast.com` scores −10 and is a manufacturer.

## 6. Definition of done

- [ ] `seated-v1.csv` exists with per-segment + per-tier counts reported against 2,500–3,500
- [ ] Every row has `source_url` + `captured`; zero rows without provenance
- [ ] Side pools written; **total records in = seated + side pools** (proves nothing was deleted)
- [ ] Chain suppression ran before dedupe (assert on the audit log)
- [ ] Suppression/DNC join ran at pull time
- [ ] `evidence_depth` distribution reported — it predicts whether Angle 2 (G3) becomes viable
- [ ] `npx tsc --noEmit` clean, lint clean on changed files, per `AGENTS.md`
- [ ] No contact data staged into git

## 7. Risks

1. ~~**Cross-source dedupe collapses harder than modelled.**~~ **DOWNGRADED on first measurement (2026-08-01).** Timken + Enerpac union to **2,105 companies**, with Enerpac contributing **192 of its 200 as net-new** — near-zero overlap, nothing like E1's collapse. E1's poor showing was specific to Lovejoy and Ballymore being chain-dominated, not a property of locator sources generally. Keep reporting distinct-company counts per source, but the pool is tracking well ahead of the 2,500–3,500 target on two sources alone.
2. **Catalog-depth crawling is the slowest stage** and the most likely to be wrong. Timebox it; fall back to tiering on visible-category count rather than exact SKU counts.
3. **Cohort E bounces.** Unmeasured. Isolated by design — if it exceeds 2%, kill the cohort, not the campaign.
4. **Angle 1 is the only cleared copy.** The list must not outrun what we can actually send (G3 decided: Angle 1 only).
