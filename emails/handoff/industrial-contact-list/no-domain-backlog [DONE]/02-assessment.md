# Step 1 — verifier assessment before extension (2026-08-03)

`segment_w_verify.py` read end to end (404 lines). The three questions, answered
against the code, plus two hazards the questions did not ask about.

## Q1 — Does route 2 need coordinates?

**It runs without them, but silently degrades to a nationwide title search.**
`from_dfs_listing` attaches `location_coordinate` only when the row carries
lat/lng (`segment_w_verify.py:238-239`); with neither, the payload is
`{"title": name, "limit": 10}` — ten title-ranked listings from anywhere in the
US. Precision survives (the corroboration arms still gate acceptance) but recall
collapses for common names, and every miss still bills.

Who is affected, measured:

| Cohort | lat/lng | zip5 | Consequence |
|---|---|---|---|
| Segment W (4,445) | **97.8%** | 98.9% | route 2 works as shipped; 99 rows lack coords, 97 of those have zip |
| federal identity-backlog (2,772) | **0%** | 42.7% (1,185) | route 2 unusable as shipped |

**Fix, in preference order:**

1. **Geocode from our own corpus, offline, $0.** The raw DFS pull
   (`data/raw/dfs-listings-2026-08-01.json`, 45,554 listings) carries
   `latitude`/`longitude` per listing. Median-per-ZIP gives **10,716 ZIP
   centroids** → written to `data/s3/_zip-centroids-2026-08-03.json`. Coverage:
   **997/1,185 (84.1%)** of federal rows with a zip, **88/97** of W's
   no-coord rows. This keeps the shipped, measured code path (50 km circle)
   byte-identical for every row that gains coordinates.
2. **ZIP-exact `filters` fallback** for the 188 uncovered-zip rows. The
   filter shape is proven in this repo — `acquire/dfs_listings.py:78` already
   filters `address_info.country_code`; `address_info.zip` is the same family.
   (`address_info.region` is the FULL state name, e.g. "California" — measured
   from our own raw data — if a region filter is ever wanted.)
3. **Skip route 2 entirely for rows with no zip and no city** (federal
   state-only 1,373 + no-location 214 = 1,587 rows). Without phone, zip or city
   there is NO corroboration arm that can fire, so a route-2 hit could never be
   accepted — the call would be pure spend. These rows go straight to route 3.

## Q2 — What does corroboration mean without a phone?

The shipped arms, descending strength (`segment_w_verify.py:255-264`): same
phone → same zip5 → same city + name-token overlap (≥ half the name's
non-stop tokens). Segment W has phone 84.8%, so the strong arm usually decides.
Federal rows have phone 0% — they lean entirely on the weak arms.

**The live failure mode: the zip arm accepts on zip alone.** For a phone-less
row, zip becomes the *first* arm, and the candidates are title-search results —
name-similar by construction. Two different industrial businesses in one
industrial-park zip is exactly the "sounds similar" silent failure the dossier
warns about.

**Rule change, keyed on the row (not the cohort): if a row has no phone, a zip
match must ALSO carry a name-token overlap** (same test route 3 uses: ≥1
distinctive token or ≥2 any). Rows with phone keep shipped semantics
byte-identical, so the W cohort's behavior stays comparable to §5c's measured
run. Every acceptance now logs its arm + whether tokens overlapped, so the
pilot's 30-domain hand-read can price precision **per arm** instead of trusting
one blended rate.

Expectation to hold on to: §5c's 76% came from locator nulls (mostly Timken
stale data — dealers who plainly had sites). GBP-null and federal rows are
weaker evidence of a site existing; plan for the dossier's 40–70% band, not 76%.

## Q3 — Does it handle `alternate_names`?

**No.** The verifier keys on one name (`company_display or company`,
`segment_w_verify.py:234`). The federal source publishes DBAs and former names,
and §5q measured 9.8% of fold-in matches as alternate-only. The pool CSV does
not carry the field, but `federal_uei` is 100% filled and the raw detail file
(`data/raw/usaspending-2026-08-01.detail.partial.jsonl`) carries
`alternate_names` arrays → a UEI-keyed sidecar restores them losslessly.

Most alternates are punctuation variants that normalize to the same token set
("GIGA, INC." / "GIGA  INC." / "GIGA INCORPORATED") — worthless as extra
queries. The extension therefore:

1. adds alternates' tokens to the corroboration `want` set (free recall on
   routes 2 and 3), and
2. on a full miss, retries **route 3 only, once**, with the best
   **token-distinct** alternate. One retry cap keeps the cost bound at
   (miss rate × share-with-distinct-alternates) extra calls.

## Two hazards the questions did not ask about

**H1 — the output path would clobber the historical artifact.** `CAPTURED` is
hardcoded `"2026-08-01"` (line 53) and the output path is derived from it
(line 391) — a re-run would overwrite `data/s3/segment-w-2026-08-01.json`, the
674-candidate measured record. The extension parameterizes `--captured` /
`--out`; the 2026-08-01 file is never touched. (`data/` is gitignored — there
is no git safety net for it.)

**H2 — route 2 is partly self-referential for the DFS cohort.** 4,191 of the
4,445 W rows ARE Google Business Profile listings whose `url` was null.
Re-searching business listings for them tends to return the same domainless
listing; only a *sibling* listing (branch, second profile) with a domain helps.
Two consequences: (a) the free pass gains an **offline sibling join** against
our own 45,554-listing corpus — same phone, then same name+zip, against
listings that DO carry a domain — before any API call; (b) expect route-3-heavy
yields for this cohort (§5c already measured the inversion: search 303 · DFS
181 · email 24).

## Scope correction for the billed run

The 8,156-row backlog is not 8,156 billable rows. The federal pool carries
dispositions already adjudicated during the fold-in: **not-a-distributor 909**
(SAM.gov self-declared manufacturers + placeholder names), **above-ceiling
29**, **non-US 1**. Buying domain resolution for them purchases nothing
seatable — they are out of ICP regardless of what domain they hold.

| Scope | Rows |
|---|---|
| Free joins (Step 2) | all 8,156 |
| Billable resolution (Step 3) | **7,217** = W 4,445 + identity-backlog 2,772 |
| Excluded from billing (already adjudicated out) | 939 |

## Reuse from `identity_resolve.py`, and one deliberate difference

Reused: cache-first with payload-keyed gzip entries (a cache read is not a
request, re-runs cost $0), measured cost from the API's own response body,
atomic tmp-then-replace writes, provenance stamps on every record. The
**pacing rules differ on purpose**: `identity_resolve` throttles 3s/host with
≤3 requests per domain because it fetches small businesses' own servers;
`segment_w_verify` hits a paid API built for concurrency (its header says
exactly this). Identity_resolve's origin-politeness rules apply in Step 4, when
recovered domains get identity-resolved on their own sites — not here.

## Call model going into the pilot

Per §5c: $8.65 / 1,070 calls = **$0.0081/call**, 1.6 calls/record at 76%
rescue. This pool should run cheaper per record where route 2 is skipped
(state-only federal rows: 1 call) and slightly hotter where rescue is lower
(more rows reach route 3). Pilot 500 (250 W + 250 identity-backlog, stratified,
seeded) ≈ 750–900 calls ≈ **$6–8**. Full billable pool at pilot-measured rates
is the GATE:HUMAN number — projected ~$95–110 before pilot correction, restated
at the gate with measured arithmetic.
