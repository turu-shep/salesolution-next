# kubota — source handoff

> **STATUS (2026-08-04):** DONE-SEATED-SEPARATE. **Kubota passed the decision
> rule outright — 511 in-band net-new domains off a complete 1,039/1,039 census
> that cost 4 origin requests — and the network is 100% agriculture / turf /
> outdoor power with 0% industrial MRO.** Both halves travel together or the
> number lies. Fill is the best in the program: **98.3% website · 100% phone ·
> 98.9% email.** Seated under gate **ICP-EQ-2** on the same three binding
> conditions Bobcat carries, reproduced in §4.
> **No gates open.** ICP-EQ, ICP-EQ-2 and **R-3** are all signed. R-3 is the
> robots override on `www.kubotausa.com` and it is what makes this run
> legitimate — read §1 before you quote anything from here.

Prompts in this folder: `01-prompt.md` — the fold-in: apply the segment marker,
route the above-ceiling clusters, dedupe the dual-line domains against the seated
Bobcat pull, write the new angle. **Not a re-pull** — the census is complete and
reconciled.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §9 — **R-3** (the robots override, and the note that it is the same gate as R-EQ-1), **ICP-EQ** (the 1–4-location scope), **ICP-EQ-2** (the seat decision and its conditions, in Artur's own words); §7.1 (the obstacle ladder and the robots-override standing counter-argument); §7.2 (the isolated-cohort safeguard); §8.1a (the size bands and the ceiling)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (capture source-native codes, then test that they sort — this source is the one that sorts *better* at scale), §5l (a name join is not a domain), §5f (vertical contamination, measured)](../../strategy/01-build-plan.md) ·
`../bobcat [*]/00-README.md` — the sibling. Same disposition, same conditions, and the 16 domains these two pulls share ·
`../equipment-dealers [*]/00-README.md` + its `02-robots-posture-2026-08-04.md` — the workstream this came out of. ⚠ **Its "Kubota behind GATE R-EQ-1, default NO" reading is stale.** R-EQ-1 and R-3 are one gate under two names, and it is signed ·
`../caseih [PROBED-FAILED]/00-README.md` — the `dealerWebsite` decoy, the failure this source pre-empted

## 1. What it is

Kubota (agricultural and compact tractors, turf, utility vehicles) publishes its
US dealer network at `https://www.kubotausa.com/find-a-dealer` — a Next.js page.
`https://www.kubotausa.com/regional-dealers` is the alternate entry point
recorded in the payload as `alt_locator_page`; the probe and the census both ran
against `/find-a-dealer`.

**The dealer data is not on Kubota's host.** It is Algolia:

| | |
|---|---|
| Serving host | `S66VLP7IQV-dsn.algolia.net` |
| Index | `prod_live_kubota_usa_global_index` |
| Call | `POST /1/indexes/*/queries`, filter `post_type:dealer` |
| How it was found | pinned statically from bundle `403-5aba9c088026b1b9.js` **module 86473** (the `useDealers` hook: `filters`, `aroundLatLng`, `aroundRadius`, `getRankingInfo`, `hitsPerPage`) plus module 97663 (the client), and bundle `491-29fea81c7925f7d9.js` — **algoliasearch 5.53.0**, from which the host template and the search path were read |

**Nothing was rendered.** No headless browser, no form, no login, no CAPTCHA, no
403 on the data path.

### ⚠ Robots — the honest half, stated up front

| Origin | Robots | Verdict |
|---|---|---|
| `www.kubotausa.com` | **27 bytes: `User-Agent: *` / `Disallow: /`** — one rule, no `Allow`, no named-agent group, the whole host | **OVERRIDDEN under gate R-3 (SIGNED, Artur 2026-08-04)**, robots.txt on this host only. Used for **6 GETs and nothing else**: 1 locator page + 5 JS bundles. |
| `S66VLP7IQV-dsn.algolia.net` | **HTTP 404 — the host publishes no robots.txt** | No stated preference either way. Same posture the pack accepted for `api.festo.com` (2026-08-03) and `bobcat.api.bobcat.com` (2026-08-04). **R-3 was not extended here and was not needed here.** |

That file is stricter than Banner's, where only the data host objected while
`www` stayed permissive. **R-3 is also filed as R-EQ-1 in
`../equipment-dealers [PART-BUILT]/`. One gate, two names.** A parallel session
opened R-EQ-1 for this exact decision and that folder still reads "default NO,
recommendation NO." It is stale. Do not re-ask the question.

**The host split is not a loophole that made R-3 unnecessary**, and the extractor
says so in its own header rather than banking it. The split is real under RFC
9309 and it is the same doctrine Banner, Festo and Bosch were decided on. It is
also true that the *data* is Kubota's and Kubota's own host states a blanket
preference against automated access. The letter and the spirit point different
ways here. **R-3 is what makes this run legitimate — not a SaaS vendor
forgetting to publish a robots.txt.**

Artur signed it knowing there was **no measured prize on the other side**: the
2026-08-03 session stopped at the gate before the data path was pinned, so the
dealer count, the fill rates and the tail size were all unknown at signature, and
**the recommendation on the record was NO.** The case for signing was Kubota's
claimed 1,100+ US dealers plus Bobcat having just proved the ICP could clear the
bar. Volume was held down on purpose afterwards: overriding a blanket preference
is not a licence to sweep, and six GETs bought the entire data path.

Everything else still binds and is enforced in code: ≥3s per host, single worker,
disk cache so re-runs cost zero, honest desktop UA never rotated, no stealth, and
**a 401/403 stops the source dead** — no retry, no UA rotation, no host switching.

### Credential: a published static search key, the weakest accepted shape

App id and a **search-only** key, both literals in the anonymous bundle. No
login, no cookie, no minting call, read-only. That is the Banner `apikey` /
Festo static Azure Search key shape the pack accepted on 2026-08-03 — strictly
*less* than CRED-4's minted bearer, so it opened nothing.

Handling, and it is checkable rather than promised:

- `_algolia_credentials()` reads the pair out of the cached bundle **at runtime
  by shape (regex), never by value.** There is no key literal in the script.
- Auth is sent in `x-algolia-*` **headers**, not query parameters — a deliberate
  deviation from the browser build's `authMode: "WithinQueryParameters"`, because
  a key in a URL is a key in a log line.
- `_assert_no_key_leak()` aborts the run **before any write** if the key appears
  in the payload. Verified: **0 occurrences** across `kubota.py` and all four
  output files.

**The app id is recorded deliberately.** It is the public half — it is the
hostname, so it is the thing whose robots.txt was read, and it is the provenance
on every record. Suppressing it would make both the robots verdict and the record
provenance unverifiable. That is the same line `bobcat.py` draws when it records
its Coveo `orgId` and never the token.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **1,039 fetched of an index reporting 1,039.** Census complete and reconciled to the control count, not budget-stopped. |
| US records | **1,039** — the index carries no non-US row under this filter |
| Clusters | **597** — in-band 526 · above-ceiling 62 · unknown 9 |
| **In-band (1–4 locations)** | **670 records · 535 distinct normalized names · 526 resolved clusters** |
| Unique domains | **587** all bands · **518** in-band |
| **Net-new domains vs `deduped-v7`** | **579** all bands · **511 in-band** |
| **Genuinely new to the workspace** | **557** all bands · **495 in-band** (after the seated Bobcat pull) |
| Seated | 0 — **decided but not folded in.** ICP-EQ-2 says seat them; nobody has run the fold-in. |
| Routed to pools | none yet. 357 records / 62 clusters are `above-ceiling` and belong in `pool-above-ceiling` when the fold-in runs. |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/kubota.py` (probe **and** census, `--national`) · `_eq_sizeband.py` (bands, written before either fetched) |
| Raw artifacts | `emails/data/raw/kubota-national-2026-08-04.json` + `kubota-national-measure-2026-08-04.json`; probe in `kubota-2026-08-04.json`, `kubota-measure-2026-08-04.json` |

**Fill, all bands: website 98.3% · domain after the OEM filter 98.3% · phone
100% · email 98.9% · lat/lng 98.9%.** In-band: website 98.4% · phone 100% ·
email 98.8%. **The website and domain figures are identical because zero decoys
survived** — `website_but_no_usable_domain: 0`. This is the best contact fill in
the program.

587 distinct domains against 671 distinct normalized company names, all bands —
**name/domain inflation 1.14×.** In-band the two nearly converge at **1.03×**.
Quote 518 in-band domains, or 526 clusters, and never a name count as "companies".

Provenance is 100% filled — `source`, `source_url`, `captured` on every record.

**Cost: 4 live origin requests against a budget of 6**, enforced in code —
`page 0`, `page 1`, `partition 0`, `partition 1`. The control query replayed from
the probe's cache, as did every bundle. Re-runs record `origin_requests: 0`,
verified.

**The probe is superseded but kept**, because it is the only thing that makes the
projection test in §3 a test: 67 records, 49 companies, 40 domains, **34 in-band
net-new**, 100% website / phone / email across three metros (Houston, Chicago,
Cleveland) at the same 100 mi radius `_eq_sizeband` uses for Bobcat and Case IH.

### The decoy trap was live, and it was caught

Every record carries `url` — a dealer page on `www.kubotausa.com`, present on
**1,039 of 1,039**. **312 records** also carry `k_commerce_url`, all of them on
`shop.kubotausa.com`. **Neither ever reaches `domain`.** Only the dealer's own
`website` is read, and `_eq_sizeband.OEM_DOMAINS` gained the whole Kubota family
on 2026-08-04 — `shop.kubotausa.com`, `start.buildmykubota.com`,
`buildmykubota.com`, `kubotacreditusa.com`, `kubotacore.com`,
`assets.kubotacore.com`, `kubotausa.wpenginepowered.com`, `landpride.com`,
`greatplainsmfg.com`, `kubotaengine.com` — so even a `website` pointing home is
discarded rather than clustered on. `url` and `k_commerce_url` are kept verbatim
as evidence and never used as a join key.

**This is the Case IH `dealerWebsite` failure, pre-empted rather than repeated.**
There, an OEM-hosted landing page read as the dealer's site, collapsed all 24
dealers into one cluster and reported a fake 88.9% fill. Here the same shape was
published twice over and neither instance survived the filter.

## 3. How deep we went

Exhaustively, and cheaply. `nbHits` for `post_type:dealer` is 1,039 and 1,039
unique records came back, so the census is complete by construction rather than
by judgement. There is no unswept axis. Four things came out of it that matter
more than the dealer count.

### 1. The vertical, measured twice, and it held

The per-record line card is `hierarchical_categories` — an Algolia lvl0/lvl1
facet tree — **filled on 100% of records, 0 records without one.** The locator UI
never mentions it. That is Bobcat's §5i shape exactly: the page publishes no
qualification signal, the index publishes a good one.

**Nine lvl0 families, the whole vocabulary, verbatim:** `Mowers` · `Hay & Farm` ·
`Tractors` · `Land Pride` · `Utility Vehicles` · `Accessories` · `Attachments` ·
`Construction` · `Material Handling`.

Buckets were named in the script **before** the numbers were read, so the split
could not be drawn to flatter:

| Bucket | National (1,039 records) | Probe (67 records) |
|---|---|---|
| Ag / turf / outdoor power | **100.0%** | 100.0% |
| Compact construction | **80.2%** | 86.6% |
| **Industrial MRO** | **0.0%** | 0.0% |
| Ag/turf and *not* compact construction | 19.8% | 13.4% |

Industrial MRO is 0% because **the published vocabulary contains no such
family.** No bearings, no power transmission, no hydraulics, no fluid power, no
cutting tools, no plant MRO.

**Going rural made it more agricultural, not less.** At 1,039 records the lvl0
vocabulary is still exactly those nine families — **no new family appeared** —
and lvl1 grew by exactly one entry, `Hay & Farm > Spreaders` (12 records, 6
clusters), which argues the same way. Compact construction *fell* from 86.6% to
80.2%. The metro probe did not flatter this source; it slightly overstated the
construction side.

The company names read the same: `Ladd Farm Mart`, `Carleton Farm Supply, Inc.`,
`Beaumont Tractor Company, Inc.`, `Rigg's Outdoor Power Equipment`.

⚠ **`Material Handling` is a trap and it is not industrial.** Its entire lvl1
vocabulary is **one entry — `Material Handling > Buckets`** (797 records). That
is a loader attachment, not forklifts, conveyors or plant handling. It is
bucketed with attachments, not with industrial, because calling it industrial
would manufacture an industrial share out of a bucket.

### 2. A reverse-SKF finding: a code that sorts BETTER at scale

| Measure | Probe (67) | National (1,039) |
|---|---|---|
| distinct lvl0 combinations | 7 | **15** |
| modal lvl0 combination share | 73.1% | **68.5%** |
| distinct lvl1 combinations | 20 | **98** |
| modal lvl1 combination share | 38.8% | **29.5%** |
| families on 100% of records | `Accessories`, `Attachments`, `Utility Vehicles` | **none** |

The probe's three universals all break at 1,030/1,039. Cardinality rose and the
modal share fell on both levels. **It is a real per-record line card and it got
more discriminating with more data.**

**Everywhere else in this program the trap ran the other way.** SKF's `DC001`,
Banner's `CATEGORY_CODE`, Lincoln Electric's five brand columns, Industrial
Scientific's `countryCode` — all rich-looking vocabularies sitting over constant
data. This is the first source in the tier where scaling *strengthened* the code
rather than exposing it.

**Size the verdict honestly, as the extractor does:** it sorts **YES but
weakly**. It separates a full-line ag dealer from a mower-only shop. It does not
separate an industrial distributor from anything, because no industrial family
exists in the vocabulary.

**`has_extended_warranty` also flipped** — constant `True` on all 67 probe
records, and at 1,039 it sorts **1,024 True / 15 False**. **That is a 1.4%
minority flag, not a qualification axis.** It flags 15 dealers. It does not
define a segment, and quoting it as one would be the same error in the opposite
direction.

**Genuinely dead columns, re-checked on the full census:**

| Field | National | Verdict |
|---|---|---|
| `has_kubota_tech` | `False` on 1,039/1,039 | Does not sort |
| `has_orange_rental_program` | `False` on 1,039/1,039 | Does not sort |
| `post_type` | `dealer` on 1,039/1,039 | Dead by construction — **it is the filter** |
| `has_k_commerce_participant` | 312 True / 727 False | Sorts, consistently, at both scales |

### 3. The pagination trap, and it would have silently lost 39 dealers

**Algolia's `paginationLimitedTo` defaults to 1,000 retrievable hits.** On a
1,039-record index, `page 0` returned 1,000 with `nbPages: 1`, and **`page 1`
returned `{hits: [], nbHits: 0, nbPages: 0}` — a clean HTTP 200 that reads
exactly like "the index ended."** Trusting the loop would have reported 1,000 of
1,039 as a complete census and dropped 39 dealers without a single error.

**Same shape as Bobcat's silent zero, new costume.** It was caught by the rule
that worked there, and the rule is the deliverable:

> **Assert completeness against an independent control count, never against a
> loop that stopped.** A search API that answers a bad request with an empty
> success will answer the end of your data the same way.

`census()` compares the union against the control `nbHits` and, on a shortfall,
falls back to a partition built from **the locator's own `validStateCodes`** (50
states, split 25/25). The two halves returned **525 + 513**, deduped by
`objectID` to exactly **1,039**, and only then was `census_complete: true`
written. Recorded strategy: `paging + 2-way state partition`.

### 4. The projection test, worth more than the dealer count

Both predictions were written into `PROBE_PROJECTIONS` in `kubota.py` **before**
the census ran, so this is a test and not a retrofit.

| Method | Predicted in-band net-new | Actual | Error |
|---|---|---|---|
| **A — measured baseline share** (the mandated one): 34 ÷ 0.1585 | **215** | 511 | **undershot 2.38×** |
| **B — the OEM's own national denominator**, from one control query: 34 ÷ (67/1,039) | **527** | 511 | **accurate to 3%** |

**This is the second consecutive undershoot for method A** — Bobcat 1.9×–2.1×,
Kubota 2.38× — and the direction is structural, not noise. `deduped-v7` is
metro-skewed industrial distribution, so dividing by *its* metro share
systematically under-counts any network more dispersed than our own list. The
three probe circles held **15.85% of our geocoded baseline but only 6.45% of
Kubota's dealers**, which made the divisor about 2.5× too large.

**The correction is now a standing convention in `../00-README.md`:** quote
baseline-share as a **floor**, and where a source publishes a national
denominator — one control query gets it — prefer that.

### ⚠ One log line nobody should quote

`caseih.report()` projects unconditionally, and `kubota.py` reuses it. On a
census run it therefore prints:

```
PROJECTION (measured-baseline-share): in-band net-new 511 / 0.1585 = 3224 nationally
```

**There is no 3,224.** 511 is a count of a completed census; the three-metro
scaler has nothing left to scale. It was **left visible with a correction printed
directly beneath it** rather than suppressed, and it is recorded in the payload as
`projection_line_in_report_is_invalid_for_a_census`. The reasoning is that a
stray four-digit number in a log is exactly what gets quoted later, and a
suppressed line cannot be argued with. Flagged here so it never is.

## 4. What's left on the table

**Nothing to fetch.** The census is complete, reconciled against the control
count, and there is no second index, no per-dealer detail route worth pulling and
no second tab. What is left is a fold-in and a copy decision.

### The counts the fold-in must keep apart

- **511 in-band net-new domains vs `deduped-v7`.** Of those, **16 are dual-line
  dealers already in the seated Bobcat pull**, so **495 are genuinely new to the
  workspace.** Net-new against `deduped-v7` is not net-new to the workspace,
  because Bobcat's rows are decided but not yet folded in.
- All bands: **579 net-new, 557 genuinely new.** Total Kubota ∩ Bobcat overlap:
  **22 of 587 domains.**
- **357 records / 62 clusters are `above-ceiling`** → `pool-above-ceiling`.
  Retained, never seated. **Culled ≠ deleted.**
- **12 records / 9 clusters are `unknown`.** Unknown is not in-band. Hold them
  out.
- **8 in-band clusters (11 records) carry no domain on any branch** → they are
  `no-domain-backlog` input, they contribute nothing to the 511, and a fold-in
  that promotes them on band evidence alone would be promoting them on weak
  evidence. (The measure file's `companies_with_no_website_on_any_branch: 7`
  counts on the name key; 8 is the cluster count.)

Reporting 526, or 535, or 671 as "the yield" would be the Walter Surface mistake
in a better costume.

### ⚠ THE BINDING CONDITIONS — reproduce these wherever these rows go

**Disposition: same as Bobcat, under gate ICP-EQ-2 (Artur, 2026-08-04) — SEAT
THEM, isolated.** The gate's text in `../../strategy/00-sourcing-strategy.md` §9
is written against Bobcat's 767; the conditions are what carry over, and they
carry over intact. In his own framing: **"would need its own angle and its own
campaign cohort — the industrial Catalog AI copy will not land on a mower
dealer."** So:

1. **A distinguishing segment marker on every row, and an isolated micro-campaign
   cohort.** Never blended into the industrial list. Same safeguard §7.2 imposes
   on manufacturer-published emails, for the same reason: a tractor dealer
   receiving bearings-distributor copy is a complaint, and **the program dies at
   2% bounce.**
2. **Angle 1's industrial copy is NOT cleared for these rows.** New copy is
   required before any send. This is not a tone edit.
3. **Bounce and reply reported separately from day one**, so the cohort can be
   killed without taking the sending domains down with it.
4. And the standing one: **these rows must not raise the headline "seated" number
   without the segment label attached.** Conflating them with industrial
   distributors is the single most expensive mistake available in this workspace.

### Two caveats to carry, stated as caveats

**(a) In-band 526 clusters is an UPPER bound, and the reason changed.** The
probe's cluster sizes were lower bounds because it could only see stores inside
three circles. **The census closes that geographic gap entirely** — every store
is visible now. It does not close the corporate one: clustering is
domain-authoritative, so a dealer group whose stores sit on separate domains
still reads as separate companies. The census collapsed the geographic blind
spot, not the multi-domain one.

**(b) Almost no cross-validation.** Only **8 of 587 domains (1.4%)** appear in
`deduped-v7`. That is consistent with "genuinely different population" and it is
the reason the net-new count is so high — but it also means **nothing in this
pull was independently confirmed by a source we already trusted.** A 1.4%
intersection is not a validation set.

### Could not verify, stated as such

1. **Whether `hierarchical_categories` reflects real dealer authorization or a
   CMS default.** It varies per record — 15 lvl0 combinations, 98 lvl1
   combinations, no family on 100% of records — which argues real. It is
   unconfirmed against any authoritative source.
2. **Employee count and SKU count are unpublished.** Recorded unavailable with a
   reason on every record. **Never imputed.**
3. **Email deliverability and the role-vs-personal split are unmeasured.** 51 of
   1,028 addresses are gmail and 29 are yahoo; many of the rest are named
   individuals at the dealer's own domain. **98.9% fill is not 98.9% usable** —
   these need verification before a send, and §7.2's preference for a role
   address where both exist still applies.
4. **1 of 1,039 records is `cluster_resolvable: false`** and one record's phone
   failed digit normalization (`phone_raw` is filled on 1,039/1,039, `phone_10`
   on 1,038). Neither moves any headline number.
5. **The 0.1585 baseline-share denominator is measured off `deduped-v7`**, which
   is itself a biased sample: what our sources happened to find, not the national
   distribution of anything. §3 is the second demonstration that it under-counts.

## 5. Registry row

| kubota | DONE-SEATED-SEPARATE | 1,039 | 0 | 2026-08-04 | nothing to fetch — full census 1,039/1,039; 511 in-band net-new domains, 495 genuinely new; 98.3% website / 100% phone / 98.9% email; 100% ag/turf, 0% industrial MRO → isolated cohort per ICP-EQ-2 | kubota/ |
