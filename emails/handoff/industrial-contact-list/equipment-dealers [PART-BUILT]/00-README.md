# equipment-dealers — one OEM cleared the bar by 5×, one failed it, one is walled

> **STATUS (2026-08-04): PART-BUILT.** ICP-EQ signed, Steps 2–5 executed, three
> OEMs measured and they came apart three different ways.
>
> - **Bobcat — BUILT, NATIONAL SWEEP COMPLETE.** Cleared both legs of the E4
>   decision rule on the three-metro probe — 372 projected in-band net-new
>   against a bar of 150, and 410 on the re-run with the fuller field list — so
>   the sweep was earned and run: **2,701 of 2,701 index records, 1,659 US
>   companies, 767 net-new in-band domains.** That is roughly **7× the entire
>   measured contribution of the E4 tier** (~80–120 companies).
> - **Case IH — PROBED, FAILS THE BAR, BUT THE MEASUREMENT IS CAPPED.** 9 in-band
>   net-new domains in the circles → **57 projected**, against a bar of 150. Best
>   qualification data in the whole program (a tier code AND a per-record line
>   card AND 100% email fill) attached to a number that does not clear. **57 is a
>   FLOOR, not a point estimate** — every Case IH endpoint caps at 100 rows and
>   all three probe states returned exactly 100.
> - **Kubota — STOPPED AT THE HOST.** `www.kubotausa.com/robots.txt` is 27 bytes:
>   `User-Agent: * / Disallow: /`. Whole host, no carve-out. **Zero dealer records
>   requested.** → **GATE R-EQ-1, unsigned, default NO, recommendation NO.**
> - **JLG** stays out. It 403s, and that is a decision rather than an obstacle.
>
> **GATE:HUMAN ×1 — R-EQ-1 (Kubota robots override). Default NO.** See
> `02-robots-posture-2026-08-04.md` §4.
>
> **NO FOLD-IN WAS RUN.** Raw payloads and measurement only. `lists/` and
> `data/side-pools/` were not touched — a parallel session owns the
> domain-resolution run. The fold-in is the next session's first job and it has a
> decision waiting for it (§4).

**Gate history, kept because it is the precedent.** `01-prompt.md` Step 1 ran on
2026-08-03 and found no dated signature anywhere. **That session stopped at the
gate with zero fetches and zero records**, which was correct and is why the
question reached Artur cleanly rather than as a fait accompli. He signed it on
2026-08-04 with both sides on the record — recorded as **ICP-EQ** in
`../../strategy/00-sourcing-strategy.md` §9. The binding conditions of that
signature (size-band filter designed BEFORE the sweep · 1–4 locations only ·
everything above to `pool-above-ceiling`, never deleted, never seated · the
per-OEM robots gate still applies per site) were all honoured and each is
evidenced below.

Prompts in this folder: `01-prompt.md` — the executable plan, now run.
`02-robots-posture-2026-08-04.md` — **the per-OEM robots evidence and the open
gate; read that one first.**

Prerequisite reading, in order: [`00-sourcing-strategy.md` **§8.1a** (revenue
floor, priority tier, $75M soft ceiling and the ceiling's REASON — decision
speed, not affordability), §7.1 (obstacle ladder), §9 (ICP-EQ)](../../strategy/00-sourcing-strategy.md)
· [`01-build-plan.md` §5a, §5h, §5i](../../strategy/01-build-plan.md) ·
[`e4-headless-locators [PART-BUILT]/00-README.md`](../e4-headless-locators%20%5BPART-BUILT%5D/00-README.md)
— the tier this work inherits its method and its ≥150 decision rule from.

## 1. What it is

The authorized dealer networks of construction, compact and agricultural
equipment OEMs. Every one runs a public dealer locator, and every dealer behind
it runs a real parts counter with a real catalogue.

**The 2026-08-03 fingerprint said "JS shell, zero names in the raw HTML" for all
three, and that was true and irrelevant.** It is the same thing E4 found on six
of eight targets: the page renders client-side, and the *data* arrives from an
endpoint the page's own code names in plain text. **No headless browser was used
or needed.**

| Target | Access shape | Data path | Serving host | Robots verdict |
|---|---|---|---|---|
| **Bobcat** | Nuxt page → **Coveo search index** | `POST /rest/search/v2` | `bobcatproduction10bzen8ct.org.coveo.com` | **`Allow: /rest/search` beats `Disallow: /`** — explicitly allowed |
| **Case IH** | Sitecore JSS + Akamai → 5 same-origin JSON endpoints | `GET /apirequest/dealer-locator/get-dealer-by-{geo-code,geographic-filter,country,dealer-name,dealer-number}` | www.caseih.com (same origin) | **allowed by absence** — none of 49 `*` rules matches |
| **Kubota** | Next.js page | not looked for | www.kubotausa.com | **`Disallow: /` — whole host. STOPPED.** |

Full evidence, the credential assessment, and the two payload traps that would
have corrupted the measurement are in `02-robots-posture-2026-08-04.md`.

## 2. What we pulled

### Bobcat — the national sweep (complete)

| | |
|---|---|
| Raw rows | **2,701** (the index's whole `totalCount`; sweep complete) |
| Distinct by source id | 2,677 |
| US records | 2,399 |
| Distinct companies | **1,809 by name · 894 by domain** (name axis inflates 2.0×) |
| US clusters after the size filter | **1,659** |
| **In size band (1–4 locations)** | **1,478 clusters (89%)** |
| Above ceiling (5+) | 79 clusters → `pool-above-ceiling` |
| Size unknown | 102 clusters — held OUT of the in-band count |
| Website fill | **60.4%** |
| Phone fill | 96.0% |
| Email fill | **0.0%** — the Coveo dealer index publishes no email field |
| **Net-new by domain, in-band** | **767** (a count, not a projection) |
| Net-new by domain, all bands | 835 |
| Seated | **0 — no fold-in was run** |
| Extractor | `emails/scripts/sources/bobcat.py` (probe) · `bobcat_national.py` (sweep) |
| Raw artifacts | `emails/data/raw/bobcat-2026-08-04.json` · `bobcat-national-2026-08-04.json` + `.csv` · `*-measure-*.json` |
| Origin requests | 181 for the sweep; ~222 across every Bobcat run including the probe and two failed query shapes |

### Case IH — three-metro probe (capped, not swept)

| | |
|---|---|
| Raw rows returned | 330 (3 metros × 10 + 3 states × 100) |
| Rows inside the three 100 mi circles | **31** |
| Distinct companies | 15 by name · 13 by domain |
| Clusters | 15 → in-band **12** · above-ceiling 1 · unknown 2 |
| Website fill | **90.3%** (on the *correct* field — see the trap in §3) |
| Phone fill | 100.0% |
| Email fill | **100.0%** — a real per-dealer address on every row |
| Net-new by domain, in-band | **9 → 57 projected nationally** |
| Seated | **0 — no fold-in was run** |
| Extractor | `emails/scripts/sources/caseih.py` |
| Raw artifacts | `emails/data/raw/caseih-2026-08-04.json` · `caseih-measure-2026-08-04.json` |
| Origin requests | 7 |

### Kubota

Nothing. **Zero dealer records requested.** Two requests were spent on the host
before its robots file had been read — the Step-2 fingerprint sweep fetched
`robots.txt` and the locator page in one pass, so the page fetch went out against
a path we learned a moment later was disallowed. Both are cached; nothing has
been requested since. **The ordering is the bug**, and it is recorded rather than
hidden.

**Provenance is 100% filled on every record from both built sources** —
`source`, `source_url`, `captured`.

## 3. How deep we went

### The size-band filter was designed before the sweep, and it earned its keep

`emails/scripts/sources/_eq_sizeband.py` was written **before either extractor
fetched a dealer**, which is a binding condition of the signature. It clusters
store rows into companies by domain → phone → corroborated name-stem (union-find,
transitive), counts distinct addresses per cluster, applies the §8.1a proxy stack
with the rule that **an unavailable proxy can only worsen a band, never improve
one**, and routes 5+ to `pool-above-ceiling`. `unknown` is **not** `in-band` — a
cluster whose size cannot be established has not been shown to be small.

It caught exactly the shape the gate warned about. Bobcat's largest clusters:

| Locations | Company | Domain |
|---|---|---|
| 19 | Bobcat of the Rockies | bobcatoftherockies.com |
| 18 | Roland Machinery Company | rolandmachinery.com |
| 17 | Bobcat of Dothan | **lepporents.com** |
| 17 | Associated Supply Company | — |
| 16 | Papé Material Handling | papemh.com |
| 15 | Hugg and Hall Equipment | — |
| 13 | Ascendum Machinery · Blain's Farm & Fleet | — |

"Bobcat of Dothan" clustering to **17 locations via `lepporents.com`** is the
$175M-group-disguised-as-four-small-dealers case, caught by domain collapse
exactly as designed. None of these is deleted; all 79 route to
`pool-above-ceiling`.

### The filter's own falsification test nearly fired, and that has to be said

`_eq_sizeband.py` states, before running: *"Most of what comes back will be over
the ceiling or unknown… If this filter returns a majority in-band, the most
likely explanation is that clustering failed."* Bobcat returned **89% in-band**.
That is on the tripwire, so it was checked rather than accepted:

- **87% of Bobcat's US clusters are single-location** (1,436 of 1,659), and only
  4% are 5+.
- **The population genuinely differs by OEM, and the NAEDA average describes the
  wrong one.** Case IH's ag-dealer probe is 47% single-location; Bobcat's
  compact-equipment network is 87%. NAEDA's *$24.4M × 7.2 locations ≈ $175M* is
  an **agricultural dealer-group** figure — it describes Case IH's world, not
  Bobcat's. The against-case in the original gate was built on it, and for Bobcat
  it is the wrong denominator.
- **Residual bias, stated, not resolved:** 169 in-band clusters are named
  "Bobcat of …". Name-stem collapse only merges when corroborated by a shared
  domain or phone, so a multi-store group whose stores share neither stays split.
  **The in-band count is an UPPER bound.** One clear miss survives in the
  net-new set: `construction.altaequipment.com` — Alta Equipment Group, ~$1.9B —
  slipped through as a subdomain.

### The domain axis is the honest one, and it costs 45% of the haul

The pipeline is domain-keyed end to end — S2 dedupes on domain, S3 must fetch a
site to classify catalog depth. **A row without a domain cannot enter any of it.**

- Bobcat in-band clusters **with** a domain: **815** → **767 net-new**
- Bobcat in-band clusters **without** a domain: **663** → **`no-domain-backlog`
  input, not list input**

So the honest headline is two numbers, not one: **767 companies the pipeline can
ingest today, and 663 more that need domain resolution first.** Reporting 1,478
as if it were the yield would be the Walter Surface mistake in a better costume.

767 of 815 in-band domains being net-new (94%) is high enough to deserve
suspicion — it is the artifact that inflated Walter's 93.9%. Here it survives
inspection: compact-equipment dealers were **outside the ICP until 2026-08-04**,
so no prior source had any reason to carry them. A chain scan over the 767 found
**10** chain-shaped domains and only one true above-ceiling miss (Alta).

### §5i — codes captured verbatim, and tested for whether they sort

Fifth and sixth confirmations of the standing rule, plus a fresh counter-example.

**Case IH publishes the best qualification data in the program.**

- `dealerClass_code` / `dealerClass_desc` — **a real tier code that sorts**:
  `D` Full-line (29) · `O` Specialty (1) · `S` **Parts & Service** (1). A
  dedicated "Parts & Service" class is directly on the angle Artur signed.
- `contract_codes` — **a per-record line card, 28 distinct value-sets**
  (`LT|PP|SF|SL|GH|AG|FW|DT|HF|TS|FT` …), from
  `dealershipAttributes.contractDetails[].codeId/codeName`.
- `cnhOwnershipGroupSAPNumber` — a **published ownership-group key** that sorts,
  which is stronger evidence of group size than any derived clustering.
- `brand` is `Case IH` on 100% of rows and **sorts nothing**.

**Bobcat has no tier code, and its declared facets are a trap.** The locator page
prints three facet field names with their default values in the anonymous HTML;
**two of the three are null on every record in the payload**
(`bobc_accountindustry_dict`, `bobc_accountbusinessactivity_dict` — the latter
being the `Rentals / Parts / Services` split that would have been the single most
useful field here). The per-record line card that actually exists is
**`account_contract_code_names`** — 100% filled, 29 distinct value-sets, listing
the Bobcat product programs the dealer is contracted for — and the page never
mentions it. **Reading the page's facet list would have produced a confident,
wrong claim about the best qualification signal**, the same mistake SKF's
decoding table nearly caused on 2026-08-03.

### Four measurement defects this session found and fixed

Recorded because each one produced a plausible, wrong number first.

1. **Case IH publishes two website fields.** `dealership.dealerWebsite` is an
   OEM-hosted landing page on `caseih.com`; `dealershipAttributes.website` is the
   dealer's own site. The first read took the wrong one, reported *88.9% website
   fill with exactly ONE distinct domain*, and the domain-first clustering then
   merged 24 unrelated dealers into a single fake above-ceiling mega-group.
   Fixed by stripping OEM-owned domains before clustering. **A locator's
   "website" field is not automatically the dealer's website.**
2. **A silent zero that looked like a measurement.** Bobcat's first query carried
   the `context` object the page's own search box sets; every metro returned
   `totalCount: 0` — clean 200, resolved pipeline, live index. It reads exactly
   like "no dealers here." Dropping `context` returns 2,701. **A zero from a
   search API needs its own test before it is written down.**
3. **`numberOfResults` is not ours to set.** The Coveo pipeline returns 15 rows
   whatever is asked for. A single call read 15 of a metro holding 120 — a 6×
   under-count that the first probe reported as a measurement (38 projected
   national). Paged properly it is 372.
4. **A cross-source clobber.** `report()` wrote its measure file off a module
   constant, so running Bobcat overwrote `caseih-measure-2026-08-04.json` with
   Bobcat's numbers. Fixed to use the passed-in source name.

### What was NOT done

No fold-in, no writes to `lists/` or `data/side-pools/`, no seating, no Apollo
enrichment, no domain resolution on the 663 domainless in-band clusters, and no
Case IH national sweep (it fails the bar as measured — see §4 for the caveat).

## 4. What's left on the table

| What | Estimate | Basis |
|---|---|---|
| **Bobcat, seatable today** | **767 companies** | counted, not projected: in-band clusters carrying a domain that `deduped-v7` does not have |
| **Bobcat, needs domain resolution first** | **663 companies** | in-band clusters with a phone and no website → `no-domain-backlog` input, which it grows by ~8% |
| **Bobcat, above ceiling** | 79 companies | `pool-above-ceiling`. Retained, never seated |
| **Case IH** | **unsized, and deliberately so** | 57 projected in-band net-new is a **FLOOR**: every endpoint caps at 100 rows and all three probe states returned exactly 100. The true figure is higher and unmeasured |
| **Kubota** | unsized | sizing it needs the requests GATE R-EQ-1 exists to withhold |

**Bobcat's 767 is the largest clean single-source yield the locator programme has
produced**, against an E4 tier whose four measured sources totalled ~80–120
seatable companies. The reason is not that the extractor is better — it is that
**the ICP moved**. Compact-equipment dealers were out of scope until 2026-08-04,
so nothing in `deduped-v7` had any reason to carry them, and 94% of the in-band
domains are genuinely new.

**The counter-argument still stands and should be restated to whoever runs the
fold-in.** §5l says the cut line is the weakest claim in the build, and ≈6,513 of
the 13,719 ranked-out companies already in hand would clear the cut if simply
fetched. **Buying more companies before working the ones in hand is the mistake
§5f named.** What is different here is that these 767 arrive with a
100%-coverage authorization stamp ("authorized Bobcat dealer") and a per-record
line card, which 11,024 of those ranked-out rows — DataForSEO listings — can
never carry.

**Three decisions the fold-in has to make, and none of them is acquisition's:**

1. **Does the parts-counter angle survive contact with the data?** Bobcat
   publishes **no email at all** and the `Rentals / Parts / Services` field that
   would have qualified a parts counter is null on every record. The line card is
   about machines, not parts. So the angle Artur signed cannot be *evidenced*
   per-record from Bobcat — only asserted. Case IH can evidence it (`S` = Parts &
   Service) and fails the volume bar. **That tension is the real finding of this
   workstream.**
2. **Which segment do these rows join?** They are not industrial distributors.
   Seating them into the main list without a segment decision would blur the
   cohort the reply-rate measurement depends on.
3. **Rental yards.** A visible share of Bobcat's tail is rental-first ("… Rents",
   "… Rental"). §7.1's own precedent culled United Rentals / Sunbelt / Herc as
   uncontactable giants; small independent rental yards are a different animal
   and nobody has decided whether they are in.

## 5. Registry row

```
| equipment-dealers | PART-BUILT | 2,708 | 0 | 2026-08-04 | Bobcat: 767 seatable net-new in-band + 663 needing domain resolution, both un-folded; Case IH capped at 100/endpoint so its 57 is a floor; Kubota behind GATE R-EQ-1 | equipment-dealers/ |
```
