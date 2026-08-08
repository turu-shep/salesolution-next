# bobcat — source handoff

> **STATUS (2026-08-04):** DONE-SEATED-SEPARATE. **The first source in this
> program to clear the ≥150 decision rule — and its vertical is not industrial
> MRO.** Both facts have to travel together or the number lies. National sweep
> complete: **1,689 in-band US records · 1,502 companies · 767 net-new domains ·
> 57.1% website · 99.3% phone · 0% email.** Measured mix: **75.5% of records
> touch turf and lawn codes, 46.1% touch compact construction, none is industrial
> MRO.** Artur seated them anyway under gate **ICP-EQ-2** — a real market, a
> different one — on three binding conditions reproduced in §4.
> **No gates open.** ICP-EQ, ICP-EQ-2 and CRED-4 are all decided. Robots needed
> **no override** on any of the three origins involved.

Prompts in this folder: `01-prompt.md` — the fold-in: apply the segment marker,
route above-ceiling rows, keep them out of the industrial cohort, write the new
angle. **Not a re-sweep** — there is nothing left to fetch.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §9 — **ICP-EQ** (the ICP extension and its binding conditions), **ICP-EQ-2** (this source's disposition, in Artur's own words), **CRED-4** (the token shape); §7.2 (the isolated-cohort safeguard this reuses); §8.1a (the size bands and why the ceiling exists)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (capture source-native codes, then test that they sort — this source is the fourth confirmation), §5l (a name join is not a domain), §5f (vertical contamination, measured)](../../strategy/01-build-plan.md) ·
`../equipment-dealers [*]/00-README.md` and its `02-robots-posture-2026-08-04.md` (the workstream this came out of, and the per-origin robots working) ·
`../sullair [*]/00-README.md` §3 — the same contamination shape, one tier earlier

## 1. What it is

Bobcat (compact equipment; Doosan Bobcat) publishes its North American dealer
network at `https://www.bobcat.com/dealer`. The page is a Coveo Atomic front end,
so **three origins are in play and RFC 9309 governs each separately**:

| Origin | Role | Robots verdict |
|---|---|---|
| `www.bobcat.com` | the locator page | 15 `*` Disallow rules, all `…thank-you` pages plus `/*/*/search`. **None matches `/dealer`. Allowed.** |
| `bobcat.api.bobcat.com` | mints the search token | `robots.txt` → **HTTP 404**. No stated preference. Same posture the pack accepted for `api.festo.com`. |
| `bobcatproduction10bzen8ct.org.coveo.com` | **serves the dealer data** at `/rest/search/v2` | `Allow: /rest/search` (12 chars) **beats** `Disallow: /` (1 char) under RFC 9309 §2.2.2. **Explicitly allowed.** |

**No override was needed on any host, and nothing was signed for robots.** The
third row is the load-bearing one: that file reads as a blanket block at a
glance, and a reader who stops at the `Disallow` kills a clean source. This is
the Lincoln Electric longest-match trap a second time, on a different vendor,
inside the same week.

**Access shape: one anonymous JSON POST per page of results.** No render, no
form, no login, no CAPTCHA, no 403 on the data path.

**Credential: an anonymously-minted, short-lived Coveo bearer.** The page
publishes `orgId`, `tokenUri` and `fieldsToInclude` inline; the token endpoint
was called with no login, no cookie and no prior session and returned a JWT whose
claims are `searchHub: DL_NA_Search` and `roles: ["queryExecutor"]` — read-only,
query-only, minted for every visitor. That is a **step past** the three published-
literal shapes the pack had already accepted (Banjo's widget uid, Banner's
`apikey`, Festo's static Azure Search key), so it was surfaced rather than
quietly decided: **gate CRED-4, ACCEPTED — Artur, 2026-08-04**, as a fourth
public-identifier shape. The Bimba rule is unchanged and still binds — a 401/403
to an anonymous request is a boundary, not a puzzle. **No token value is recorded
in any file, and none ever should be.**

## 2. What we pulled

| | |
|---|---|
| Raw rows | **2,701 fetched of an index reporting 2,701 → 2,677 distinct by source id.** Sweep complete, not budget-stopped. |
| US records | **2,399** (from each record's own billing country, not inferred) |
| US clusters | **1,659** — in-band 1,478 · above-ceiling 79 · unknown 102 |
| **In-band (1–4 locations)** | **1,689 records · 1,502 distinct normalized names · 1,478 resolved clusters** |
| Unique domains | **894** all bands · **815** in-band |
| **Net-new domains vs `deduped-v7`** | **835** all bands · **767 in-band** |
| Seated | 0 — **decided but not folded in.** ICP-EQ-2 says seat them; nobody has run the fold-in. |
| Routed to pools | none yet. 590 US records / 79 clusters are banded `above-ceiling` and belong in `pool-above-ceiling` when the fold-in runs. |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/bobcat_national.py` (sweep) · `bobcat.py` (probe) · `_eq_sizeband.py` (bands, written before either fetched) |
| Raw artifacts | `emails/data/raw/bobcat-national-2026-08-04.json` + `.csv`, `bobcat-national-measure-2026-08-04.json`; probe in `bobcat-2026-08-04.json`, `bobcat-measure-2026-08-04.json` |

Fill, in-band: **website 57.1% · phone 99.3% · email 0.0%.** All bands: website
60.4% · phone 96.0% · email 0.0%. **Bobcat publishes no dealer email anywhere in
the payload**, so nothing here is a §7.2 GATE-L6 cohort and every row needs
enrichment before a send.

Provenance is 100% filled — `source`, `source_url`, `captured` on every record.

Cost: **181 origin requests** for the national sweep against a budget of 260;
~222 across all runs on this host. Every response is cached, so a re-run records
`origin_requests: 0`.

**Two numbers that are not the same number.** 1,502 is distinct normalized
company names; 1,478 is resolved clusters after domain-authoritative joining.
The gate quotes 1,502. Use 1,478 wherever you mean "companies we could actually
address as one buyer", and never add either to a headline without the segment
label from §4.

## 3. How deep we went

Exhaustively. `totalCount` was 2,701 and 2,701 rows came back, so the sweep is
complete by construction rather than by judgement. There is no unswept axis to
point at. **What matters here is not the depth — it is what the depth turned
out to contain.**

### ⚠ THE VERTICAL. Read this before quoting any count from this source

Top line-card codes across the 2,399 US records, counted individually:

| Code | Records |
|---|---|
| `Aerators - Tow Behind` | 1,587 |
| `Sod Cutters` | 1,587 |
| `Overseeders` | 1,587 |
| `Power Rakes/Dethatchers` | 1,587 |
| `Aerators - Walk Behind` | 1,585 |
| `Aerators - Stand-On` | 1,585 |
| `Mowers` | 1,189 |
| `Light Compaction` | 1,058 |
| `Compact Tractors` | 729 |
| `Utility Tractors` | 712 |

**Measured mix: 75.5% of records touch turf/lawn codes, 46.1% touch compact
construction, and none is industrial MRO.** (Those are the figures recorded in
gate ICP-EQ-2. An independent re-count during this handoff, using a different
keyword list, lands at 76.3% and 44.3% — the split is robust to how you draw the
line.)

The net-new domains read the same way: `alldadelawnmowers.com`,
`allseasonsatv.com`, `aaarentalsredwoodcity.com`, `4seasonsag-lawn.com`,
`5mrental.com`. Landscape contractors, ATV dealers, rental houses.

**This is the same contamination §5f measured in DataForSEO** (construction
20.5%, rental 8.3%) **and the same shape Sullair's portable line produced** —
38 of its 52 net-new were Caterpillar dealers and rental houses. Three
independent sources, one finding: equipment locators sell equipment, and
equipment is not maintenance supply.

### The codes: fourth confirmation of the §5i rule, and the trap is the page

| Field | Distinct (national US) | Null | Verdict |
|---|---|---|---|
| `account_contract_code_names` | **50 individual codes / 754 combinations** | **1 of 2,399** | **SORTS.** The per-record line card, and the leg the source passes on. **There is no tier code.** |
| `bobc_accountproduct_dict` | 43 individual / 921 combinations | 2 of 2,399 | SORTS. A coarser second view of the same thing. |
| `bobc_accountindustry_dict` | — | **2,399 of 2,399** | **DOES NOT SORT. Null on every record.** |
| `bobc_accountbusinessactivity_dict` | — | **2,399 of 2,399** | **DOES NOT SORT. Null on every record.** |

**The page declares all three facet fields with rich default values printed in
the anonymous HTML** — `Rentals / Parts / Services`, five industries, 29
products. Two of the three are empty on every record in the payload, including
the Rentals/Parts/Services split that would have qualified a parts counter. The
line card that actually exists is never mentioned on the page at all.

**Re-checked on the national set as instructed: the answer did not change.**
Both fields are null on all 2,399 US records (and on all 2,677 rows), exactly as
the 220-record probe found. Reading the page's own facet list would have produced
a confident, wrong claim about the best qualification signal in the source —
which is SKF's `DC001`–`DC028` lesson, Banner's constant `CATEGORY_CODE`,
Industrial Scientific's constant `countryCode`, and now this. **A published
column is not a code. Test that it sorts before seating anything.**

*Cardinality note for anyone comparing against the probe:* the probe's 228
records gave 70 combinations of `account_contract_code_names` and 111 of
`bobc_accountproduct_dict`, and both are 0-null there. Those are probe-scale
figures; the national ones are in the table above.

### Traps this sweep paid for, all three worth carrying

**1. A `context` object turns the pipeline into a silent zero.** The first
version sent the page's own `context` (`{lat, lng, country, name, language}`)
alongside `searchHub: DL_NA_Search`. Every metro returned **`totalCount: 0` with
a clean HTTP 200 and a resolved pipeline** — which reads exactly like "this
network has no dealers here" and is the most dangerous failure mode available:
a zero that looks like a measurement. Dropping `context` returns 2,701. Seven
documented query variants are cached under `data/raw/_cache/bobcat-diag/`
(`A_ctx_product` … `G_strctx`); every one carrying a context returned 0, every
one without returned the full index. **A zero from a search API is a claim that
needs its own test.**

**2. A wrong sort value does the same thing — a second silent zero on the same
pipeline.** `sortCriteria: "@sfid ascending"` and `"@permanentid ascending"` each
return HTTP 200 with `totalCount: 0` and no error; `date ascending` and `nosort`
both hold `totalCount: 2701`. Four more diagnostic requests, and it generalises
the rule past `context`: **on this pipeline any parameter value it dislikes
answers with an empty success rather than an error.** Eleven diagnostic requests
across the two findings.

**3. The pipeline caps every response at 15 rows regardless of
`numberOfResults`.** The request asks for 1,000 and gets 15, at every offset. One
early call read 15 rows of a metro holding 120 and reported it as a measurement —
a 6× undercount. That is why the national census is **181 requests**, not three,
and why the sweep had to be earned before it ran. It lives in its own file
(`bobcat_national.py`) so the probe cannot silently become a sweep.

**4. Franchise naming broke transitive clustering — and it hid real companies.**
The first clusterer joined on domain OR phone OR stripped name, transitively.
`strip_location_qualifier` reduces "Bobcat of Houston", "Bobcat of Beaumont" and
"Bobcat of Akron" all to `bobcat`, so one name key chained four genuinely
separate dealer groups plus several one-store independents into a single 26-store
"group" spanning TX, MI, OH and PA. **That is the opposite of the Case IH error:
it does not seat fake small companies, it hides real ones.** Clustering is now
**domain-authoritative** — a row carrying a domain clusters on that domain alone,
never on a name and never on a phone; only rows with no domain fall through to
phone, then to a stripped name, and a bare brand token is not a name. **Keep it
that way.**

### How the sweep was actually run

Straight `firstResult` paging over the whole index, 15 rows per request, 181
requests, deep paging verified at `firstResult=2000` before it was committed to.
**A per-state partition was considered and rejected**: `groupBy` on
`@sfbillingstate` returns no values (the field is queryable, not facetable) and a
per-state `aq` sweep would have silently dropped every record with a blank
billing state. ⚠ The payload's `method` string still describes per-state paging;
`coverage.partition` and `_bobcat-national.log` both record what was actually
done. **The log and the partition note win.**

⚠ **One line in `_bobcat-national.log` is a trap for a fast reader:**
`PROJECTION (measured-baseline-share): in-band net-new 767 / 0.1585 = 4839
nationally`. That is the three-metro scaler applied to a national census by
reporting machinery that did not know the difference. **767 is a count. There is
no 4,839.**

## 4. What's left on the table

**Nothing to fetch.** The national index is swept, `totalCount` matched rows
returned, and there is no second index, no per-dealer detail route worth pulling
and no second tab. What is left is a fold-in and a copy decision.

### The projection undershot, which is new

| | |
|---|---|
| Probe projection recorded in `bobcat_national.py` and the run log | **372** (59 in-band net-new domains ÷ the 0.1585 baseline share) |
| Probe projection reproducible from `bobcat-measure-2026-08-04.json` | **410** (65 in-band net-new ÷ 0.1585) |
| **Measured nationally** | **767** |

**The projection undershot by 1.9×–2.1×**, and that is worth flagging on its own:
every other projection in this program came in at or above the measured result.
The reason is structural — **Bobcat's groups are metro-local.** Only 1 of the
probe's 87 US domains (`buckeyepowersales.com`) appeared in more than one metro,
so three circles covering 15.85% of the geocoded baseline saw close to 15.85% of
distinct companies rather than a disproportionate share of them. Expect a
locator with metro-local groups to under-project and one with national chains to
over-project.

*Which probe figure is right is unresolved in the record itself: the extractor
and the run log say 59 → 372; the probe measure file's own `in_band` block says
65 → 410. Both cleared the 150 bar by more than 2×, so the sweep was earned
either way.*

### The size filter barely mattered here, and that is the finding

Before the band filter: 2,399 US records, 894 domains, **835** net-new. After:
1,689 records, 815 domains, **767** net-new. **The 1–4-location filter removes
only 68 net-new domains** — because the groups are metro-local rather than
national roll-ups. Contrast Case IH, where widening the clustering footprint
flipped three quarters of the network over the ceiling.

### The two counts the fold-in must keep apart

- **815 in-band clusters carry a domain → 767 net-new. Ingestible today.**
- **663 in-band clusters carry none** (737 records). They are `no-domain-backlog`
  input, which they grow by roughly 8%. They contribute **nothing** to the 767.

Reporting 1,478 as "the yield" would be the Walter Surface mistake in a better
costume.

### ⚠ THE BINDING CONDITIONS — reproduce these wherever these rows go

Gate **ICP-EQ-2, DECIDED: SEAT THEM — Artur, 2026-08-04** (`../../strategy/00-sourcing-strategy.md` §9),
on the stated basis that 1,502 owner-led dealers with parts counters are a real
market, just a different one. In his own framing: **"would need its own angle and
its own campaign cohort — the industrial Catalog AI copy will not land on a mower
dealer."** So:

1. **A distinguishing segment marker on every row, and an isolated micro-campaign
   cohort.** Never blended into the industrial list. This is the same safeguard
   §7.2 imposes on manufacturer-published emails and it is there for the same
   reason: a landscape dealer receiving bearings-distributor copy is a complaint,
   and **the program dies at 2% bounce.**
2. **Angle 1's industrial copy is NOT cleared for these rows.** New copy is
   required before any send. This is not a tone edit.
3. **Bounce and reply reported separately from day one**, so the cohort can be
   killed without taking the sending domains down with it.

And the standing one: **do not let these rows raise the headline "seated" number
without the segment label attached.** Conflating them with industrial
distributors is the single most expensive mistake available in this workspace.

### Could not verify, stated as such

1. **`location_count` is a lower bound on all 2,399 records**, even after a
   national census — a group operating under two names on two domains reads as
   two companies. Domain-authoritative clustering is the conservative choice
   against the franchise-naming failure above; it is not proof of independence.
2. **737 in-band records (663 clusters) carry no domain**, so their "1–4
   locations" rests on phone-or-name evidence, and 2 of them could not be
   resolved at all. They contribute nothing to the 767, so the headline number is
   unaffected — but a fold-in that promotes them on the strength of that band
   would be promoting them on weak evidence.
3. **The 0.1585 baseline-share denominator is measured off `deduped-v7`**, which
   is itself a biased sample: what our own sources happened to find, not the
   national distribution of anything. It is the best density model available and
   it is not a census.
4. **120 US records / 102 clusters are banded `unknown`** and are deliberately
   held out of the in-band count. Unknown is not small.

## 5. Registry row

| bobcat | DONE-SEATED-SEPARATE | 2677 | 0 | 2026-08-04 | nothing to fetch — national index swept; 767 in-band net-new domains SEATED under ICP-EQ-2 but 75.5% turf/lawn, isolated cohort + new copy required | bobcat/ |
