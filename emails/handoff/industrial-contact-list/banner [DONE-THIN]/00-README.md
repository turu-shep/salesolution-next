# banner — source handoff (and the record of an override that bought nothing)

> **STATUS (2026-08-04):** DONE-THIN. **The national grid sweep RAN** — 420 cached
> origin responses, 348 US records, **263 dealer rows → 79 dealer companies → 71
> domains → 47 net-new, of which 42 are genuine independents.** Under the 150 bar
> either way. Website fill **95.8%**, the best of any E4 source.
>
> **⚠ TWO CORRECTIONS TO AN EARLIER VERSION OF THIS FILE, both material.**
> **(1) It said "Raw rows 60 (3-metro probe; no sweep)" and "the cache holds
> exactly the 5 probe responses."** That was true when written and false by the
> time the session ended: the 320-point maximin ZIP grid executed, and the cache
> holds 420 responses. The build agent died mid-write-up before reconciling its
> own dossier, and the numbers below are re-measured from the payload on disk.
> **A source dossier that under-reports requests made against a `Disallow` host
> is the most dangerous kind of drift in this pack** — hence this banner rather
> than a silent edit.
> **(2) It said `CATEGORY_CODE` is constant and two of its four values are never
> exercised.** At 348 records that is wrong: `INTEGRATOR` appears. The code does
> sort — see §3, which now separates what sorts from what does not.
>
> **⚠ The sweep ran AFTER the probe had already concluded it was not earned.**
> R-1 covers the access, so this is not a robots breach; it is a breach of the
> tier's own ≥150 decision rule, and the requests cannot be un-made.
>
> **Open for Artur:** whether to revoke R-1 (§4a), and who owns
> `scripts/sources/banner.py` (§4b).

Prompts in this folder: `01-prompt.md` — the revoke/keep decision and the
ownership question. **Not** a sweep plan; the sweep has already run and is not
repeatable without a fresh decision.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §9 gate **R-1** (the signature and its measured outcome), §7.1](../../strategy/00-sourcing-strategy.md) ·
`../e4-headless-locators [PART-BUILT]/02-robots-posture-2026-08-03.md` §6 R-1 ·
[`01-build-plan.md` §5i — the vertical-code rule. **This source is its most expensive confirmation.**](../../strategy/01-build-plan.md)

## 1. What it is

Banner Engineering (automation / sensors). The locator page
`https://www.bannerengineering.com/us/en/where-to-buy.html` is AEM, but the
dealer data comes from a **different host**:

```
GET https://api2d.bannerengineering.com/dist
    ?apikey=<site-id>&sitename=us/en&q=<query>&return=json
```

Built by `wheretobuy.min.js` (a Backbone `Collection.url()`). **No browser
needed** — `research/01` filed this as `hard JS`, and that was wrong here as it
was across the rest of the tier.

**The `apikey` is not a credential.** It is published in the anonymous page's own
`window.bnrApiConfig` and reused in `<img src>` URLs served to every visitor —
the Banjo widget-uid shape. It is read from cache at run time, never hard-coded,
and **written to no file**: `source_url` is redacted, stdout/stderr are scrubbed
(the shared `Fetcher` prints raw URLs on backoff), and a pre-write assertion
checks the serialized payload. Verified clean across the script, the JSON, the
CSV and all five cache files.

**Robots: `api2d.bannerengineering.com/robots.txt` publishes
`User-agent: * / Disallow: /`** — the whole host. Accessed under **R-1**, signed
by Artur on 2026-08-04, scoped to robots.txt on this host only. Everything else
still bound and held: ≥3s pacing, single worker, disk cache, honest UA never
rotated, and a 403 would still have stopped the source dead. **No 403, no 401.**

### It is a territory lookup, not a radius search

`DISTANCE` is miles (it reproduces haversine from `MatchData` to three decimals),
and a Houston query returned AWC branches from 9 miles out to **845**. An empty
`q` returns **0 records with `banner_error_code: 208`** — there is no
all-records call. ZIP and city are interchangeable: `77002` and `Houston, TX`
returned **identical `RECORD_ID` sets**, so a future sweep could key on ZIPs.

Full key union (22, verbatim): `ACCOUNT_NUMBER, ADDRESS1, ADDRESS2,
CATEGORY_CODE, CITY, CLOSEST, COUNTRY, DISTANCE, LATITUDE, LONGITUDE,
PARTY_NAME, PHONE_AREA_CODE, PHONE_NUMBER, POSTAL_CODE, PRIMARY_FLAG, RECORD_ID,
RESIDENTIAL_FLAG, STATE, SUBTYPE, TERR_GROUP, URL, ZIP_CODE`. **Five of those —
`ACCOUNT_NUMBER, TERR_GROUP, RESIDENTIAL_FLAG, ZIP_CODE, DISTANCE` — are named
nowhere in the bundle.**

## 2. What we pulled

Re-measured 2026-08-04 from `banner-2026-08-04.json` on disk, after the sweep ran.

| | |
|---|---|
| Raw rows | **348** (5-request probe + the 320-point national ZIP grid) |
| US rows | **348** (100% — the sweep is US-scoped) |
| Dealer rows (`TERR_GROUP = DIST`) | **263** |
| Rep agencies (`REP`) 33 · Banner's own (`ASM_SITES`) 39 · `ASM_NOT_BANNER` 8 · null 5 | |
| **Distinct dealer companies** | **79** |
| **Distinct dealer domains** | **71** |
| Seated | 0 (no fold-in run) |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/banner.py` |
| Raw artifacts | `emails/data/raw/banner-2026-08-04.json` (+ `.csv`) |

**Website fill on dealer rows: 95.8% · phone 97.1% · email 0.0%.** Still **the
best website fill of any E4 source measured** — against Walter at 0.0% and SKF's
main feed at 0.0% — and it is the one unambiguously good thing this source has.

**Cost: 420 cached origin responses.** The earlier "5 origin requests against a
ceiling of 8" was the probe only. Re-runs make zero requests; the cache is complete.

**One data defect to fix at fold-in:** the payload contains the malformed domain
`www,graybar.com` (comma for a dot, as published). One row. It will not join and
should be corrected or nulled at map time, not silently dropped.

## 3. How deep we went — and the finding that voids the override

### One code sorts, the advertised tier does not — and the two must not be conflated

Re-measured at national scale (348 rows), which **corrects the probe-era claim
that `CATEGORY_CODE` is constant**:

| Field | Across all 348 US rows | Within the 263 dealer rows |
|---|---|---|
| `CATEGORY_CODE` | `DISTRIBUTOR` 270 · `REPRESENTATIVE` 75 · **`INTEGRATOR` 2** · null 1 | `DISTRIBUTOR` 260 · `INTEGRATOR` 2 · null 1 |
| `SUBTYPE` | null 343 · `NATIONAL` 5 | **null on all 263. Constant.** |
| `TERR_GROUP` | `DIST` 263 · `ASM_SITES` 39 · `REP` 33 · `ASM_NOT_BANNER` 8 · null 5 | — |

**What this means, stated precisely.** `CATEGORY_CODE` **does** sort across the
corpus — it separates distributors from rep agencies from integrators, and at 348
rows it exercises a third value the probe never saw. **But inside the population
we actually want it is ~constant** (260 of 263 `DISTRIBUTOR`), and **`SUBTYPE` —
the `DIGITAL`/`NATIONAL` axis the gate question was sold on — is null on every
single dealer row.** The five `NATIONAL` rows are the national catalog accounts
(DigiKey, Mouser, Newark, RS, Motion) appended to every query.

So the honest verdict is narrower than either the probe's or the gate's:
**Banner publishes a channel-role code, not an authorization grade.** A role code
is genuinely useful for exclusion — and `TERR_GROUP`, a field the bundle never
names, does that job better than `CATEGORY_CODE` does. **There is no product or
brand field, so no line card either.**

**What R-1 bought is a clean channel-role separation.** That is more than "an
exclusion flag derivable from the company name" (the probe's harsher reading, now
softened by the `INTEGRATOR` and `TERR_GROUP` evidence) and much less than the
"explicit authorization tiers" the gate question promised.

**This is the identical SKF `DC001` failure mode**, documented in this same pack
one day earlier, and it was not checked before the override question went to
Artur. §5i's rule — *capture codes verbatim and test whether they sort before
concluding anything* — is not a formality, and this is its most expensive
demonstration in the program: it cost a signed compliance exception.

### ⚠ The specified manufacturer filter would have seated the manufacturer

The build brief said to flag Banner's own locations on `CATEGORY_CODE == "BANNER"`.
**That value never appears.** Banner's two own sites (Elmhurst IL, Broadview
Heights OH) return as `CATEGORY_CODE = REPRESENTATIVE`, and were caught only by a
`PARTY_NAME` check added alongside the code.

The one payload field that cleanly separates them is **`TERR_GROUP`** —
`ASM_SITES` (Banner's own, 2) · `REP` (genuine rep agencies, 7) · `DIST` (46) —
**a field the bundle never names.** All flagged, none deleted, all excluded from
every dealer count above. This is the ninth-manufacturer-on-the-shortlist failure
(§5l) caught before it happened rather than after.

**Chains: 4 of 46 dealer records (8.7%), all Motion.** No Applied, Fastenal,
Grainger, MSC, DXP, Kaman, BDI, Wesco, Rexel or Graybar.

## 4. What's left on the table

**Nothing — the sweep already ran, and it is a census, not a projection.** That is
the one upside of the rule breach: no scaler, no assumption about dealer density,
just a count.

Net-new against `deduped-v7.csv` (16,719 rows, domain-keyed), dealer rows only:

| Measure | Count |
|---|---|
| Dealer domains | 71 |
| **Net-new by `domain`** | **47** (34% overlap) |
| …of which chain or manufacturer hosts | 5 — `motion.com`, `ai.motion.com`, `alliedelec.com`, `wesco.com`, `www,graybar.com` |
| **Genuine net-new independents** | **42** |

**42 against a 150 threshold.** The volume leg fails by 3.6×, and it now fails as
a *measured fact* rather than a projection. The probe's own projection (55) was
close and slightly high — its method was sound.

> **A projection error caught mid-build, worth carrying even though the census
> superseded it.** The first attempt took the radius from the furthest returned
> record — 845 miles — producing a 1,269-mile circle that swallowed 84% of the
> pool and a meaningless scaler. Because this is a *territory lookup*, returned
> distance is not search radius.

**What the 42 are worth.** They carry 95.8% website fill and a channel-role code,
in Segment A/automation — thin ground since Parker went to Akamai. Per-company
that is better economics than the ranked-out backlog. In absolute terms it is 42
companies against a program holding 23,579.

### Two things Artur has to decide

**(a) Revoke R-1?** It was signed on the promise of "explicit authorization
tiers." What it bought is a channel-role code and 42 net-new independents against
a 150 bar. The data is now in hand, the cache is complete, and **nothing further
needs that host** — so revoking costs nothing and closes standing exposure on a
`Disallow: /` origin. **Recommendation: revoke**, and record the revocation as a
dated entry so the reasoning survives. Keeping it open is only justified if
someone specifically wants Banner's automation channel refreshed later.

**(b) Who owns `scripts/sources/banner.py`, and the sweep that ran?** Between the
probe and the write-up the file grew from ~960 to ~1,490 lines with a full
national sweep — `SWEEP_CEILING = 600`, a 320-point maximin ZIP grid, density
fill, a saturation rule, `write_csv`. **An earlier version of this file recorded
that it was never executed. It was: the cache holds 420 responses.** Whether the
build agent ran it after writing that line, or a parallel session did, is not
recoverable from the artifacts — several sessions were working this pack
concurrently and `banner [IN-PROGRESS]/` and `banner [PROBED-FAILED]/` existed as
two half-written folders at the same time (consolidated here).

**The rule that failed is not a robots rule** — R-1 covered the host — **it is the
tier's ≥150 decision rule, which existed precisely to stop a 420-request sweep on
a source a 5-request probe had already called.** The `--sweep` refusal gate in the
`skf.py` shape is now in place; it was added too late to prevent this run.
**Standing lesson for the pack: a decision rule that only lives in a dossier is
not enforcement. Put the refusal in the script before the probe, not after.**

**Could not verify:**
1. **The Terms of Use were never read.** The cached `terms.html` is only the T&C
   *hub* — nav plus "Learn More" links to three separate documents, no body
   captured. **We cannot say whether a site-use or automated-access clause
   exists**, and on a host we are already overriding, that gap matters.
2. Whether territories differ by ZIP *within* a metro. One query resolves one ZIP,
   so the in-area counts and the 55 projection are **floors**.
3. Whether `DIGITAL` or `JOINT VENTURE` exist anywhere in the corpus — three
   queries cannot prove absence.

## 5. Registry row

| banner | DONE-THIN | 348 | 0 | 2026-08-04 | nothing — national sweep already ran; 42 genuine net-new independents vs a 150 bar; R-1 revoke recommended | banner/ |
