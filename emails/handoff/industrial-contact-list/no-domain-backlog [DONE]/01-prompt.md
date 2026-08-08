# no-domain-backlog — resolve domains for 8,156 companies we can name but cannot reach

Your mission: point the existing Segment W verifier at the 96% of the backlog it has never run on, and convert 8,156 nameable-but-unreachable companies into 330–530 seated prospects for about $100.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. The two pools, why they are not one problem, and the honest recovery arithmetic.
3. `../../strategy/00-sourcing-strategy.md` §4.2 (the null-website segment) and §9 **GATE-L2**.
4. `../../strategy/01-build-plan.md` **§5c** (the verifier's measured result — read the route yields), §5f (Segment W reopens), §5j, §5q (the federal residue).
5. The headers of `emails/scripts/s3/segment_w_verify.py` and `emails/scripts/s3/identity_resolve.py` — both document their own rules better than any summary.

## The work

Four steps. Steps 1 and 2 are free; step 3 is billed and gated.

### Step 1 — assess the tool before extending it (offline, half a day)

Read `emails/scripts/s3/segment_w_verify.py` end to end and answer three questions in writing:

1. **Does route 2 need coordinates?** It queries DFS business listings "inside a 50km circle around the company's own coordinates". **The federal rows have no lat/lng** — only ZIP. Either geocode from ZIP or switch that route to a ZIP-scoped query. This is the single biggest extension needed.
2. **What does corroboration mean without a phone?** The shipped rule is "same phone, or same ZIP, or same city plus a name-token overlap". Federal rows have no phone, so they lean on the two weaker arms. **Expect lower precision and plan to hand-adjudicate a sample rather than trusting the rate.**
3. **Does it handle `alternate_names`?** The federal source publishes DBAs and former names, and **26 of 264 fold-in matches (9.8%) existed only through that field.** A resolver keyed on the legal name alone will miss the same 10%.

Reuse `identity_resolve.py`'s caching, pacing and provenance patterns — it solves the mirror problem (a domain with no NAP) and its rules are the right ones: ≥3s per host, ≤3 network requests per domain, cache reads are not requests, any 403 abandons the domain.

### Step 2 — the free pass first (offline, zero spend)

Before buying a single lookup, run the routes that cost nothing:

- **Email-apex recovery** across both pools (route 1). Low yield historically — 24 of 508 — but free.
- **Re-join the federal residue against the *current* pool.** The fold-in matched against `seated-v1`; the list is now `seated-v5` and the ranked-out pool has grown. Add the name+state tier and `alternate_names`, both of which the fold-in proved carry real matches.
- **Cross-join the two pools against each other.** A federal contractor with a full street address and a DFS listing with a null URL may be the same company, and that join needs no API at all.

Report how many rows step 2 removes from the backlog. It costs nothing and it shrinks the bill for step 3.

### Step 3 — pilot, then GATE:HUMAN on the full spend

**Run 500 records first — 250 Segment W (DFS-sourced), 250 federal — at the measured ~$0.013/record ≈ $6.50.** Report per-cohort: recovery rate, route yields, cost per recovered domain, and **a hand-read sample of 30 recovered domains to measure false-corroboration precision.** A domain that "sounds similar" is not this company, and that failure mode is silent.

**GATE:HUMAN before the full run: state the number.** Full-pool projection at pilot rates is **~$100–110** (8,156 records × 1.6 calls × $0.0081). Do not start it without an explicit sign-off on that figure, and stop and re-report if actual runs >25% over.

Cache every response — a re-run must cost nothing, which is the rule that made the DataForSEO rebuild free.

### Step 4 — route the results, and do not skip the readback

Recovered domains rejoin the pipeline as normal S3 input: vertical filter, chain suppression, manufacturer detector, rank. **They do not bypass anything**, and most will rank out — that is the expected outcome, not a failure.

Anything that survives all three routes becomes verified Segment W, keeps `disposition: no-website`, and **stays parked.** Then take the verified count back to Artur: **GATE:HUMAN / GATE-L2 asks whether a verified no-website segment gets a Website Development offer**, and §5f says the answer may differ at ~1,000 companies from what it was at 160.

Mandatory on every list this touches: **field-for-field readback** (§5s). And keep the `identity-backlog` disposition distinct from `no-website` — §5q separated them deliberately so an unresolved join could not pollute an already-decided segment.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `no-domain-backlog [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
