# bobcat — fold in 767 dealers as their own segment, and write the angle

Your mission: move Bobcat's 767 net-new in-band domains into the list **as a
labelled, isolated segment**, route everything above the ceiling, and produce the
new copy angle those rows need. **This is not a sweep and there is nothing to
fetch** — the national index is already in hand, complete, on disk.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. **§3's vertical section and §4's
   binding conditions are the whole job.** Read them before you open the data.
3. `../../strategy/00-sourcing-strategy.md` **§9, gate ICP-EQ-2** — the decision
   itself, in Artur's own words, with the three conditions. Also **ICP-EQ** (the
   1–4-location scope) and **§7.2** (the isolated-cohort safeguard this reuses).
4. `../../strategy/01-build-plan.md` **§5i** (test that a code sorts before you
   trust it), **§5l** (a name join is not a domain), **§5f** (the vertical
   contamination this source is the largest instance of).
5. `../equipment-dealers [*]/00-README.md` — the workstream this came out of.
   Case IH and Kubota live there; **Kubota is still behind GATE R-EQ-1 (default
   NO)** and is not yours to open.

## The work

**Batch limits before anything runs: 0 origin requests, 0 billed requests, 0
credits.** Every record is already on disk at
`emails/data/raw/bobcat-national-2026-08-04.json` (2,677 records) with the
measured summary beside it. If you find yourself writing a fetcher, you have
misread the job.

1. **Fold in the 767, and label them at the moment they enter.** Source rows
   from `bobcat-national-2026-08-04.json`, filter to `is_us` **and**
   `size_band == "in-band"` **and** a non-empty `domain`. That is 815 clusters /
   767 net-new against `deduped-v7`. Write a distinguishing segment value on
   every row **in the same write that seats them** — never as a follow-up pass,
   because a follow-up pass is what leaves 767 unlabelled rows in the list for an
   afternoon. Per the pack's project-separation rule there is no `project` or
   `owner` column: the marker is a `disposition`/segment value plus an overlay
   file under `emails/data/projects/`, not a new column in the master CSVs.
2. **Route the above-ceiling rows, do not drop them.** 590 US records / 79
   clusters are `above-ceiling` → `pool-above-ceiling`. **Culled ≠ deleted.**
   Alta Equipment Group arrives as `construction.altaequipment.com`, a
   subdomain — the chain scan over the 767 found 10 chain-shaped domains and
   exactly one true above-ceiling miss, so a domain-apex chain check is worth one
   more pass before the seat, not after.
3. **Hold the `unknown` band out.** 120 US records / 102 clusters cannot be
   sized. `unknown` is not `in-band`; folding them in is the flattering-number
   failure the size filter exists to prevent.
4. **Send the 663 domainless in-band clusters to `no-domain-backlog`, not to the
   list.** 737 records, no website, ~8% growth on that backlog. They are not part
   of the 767 and must never be added to it.
5. **Write the new angle.** Angle 1's industrial Catalog AI copy is **not
   cleared** for these rows and rewriting the nouns is not enough. The buyer is
   an owner-operator of a turf-and-lawn or compact-equipment dealership with a
   parts counter — 75.5% of the network touches turf/lawn codes. **Two facts
   constrain the copy and both are measured:** Bobcat publishes **zero dealer
   emails**, so every contact needs enrichment before a send; and it nulls the
   `Rentals / Parts / Services` facet, so **the parts-counter premise that
   justified ICP-EQ cannot be evidenced from this source's own data.** Say that
   plainly in the brief rather than writing copy that assumes it. Run the
   **humanizer** skill on the draft before handing it over.
6. **Report the segment separately from day one.** Bounce and reply for this
   cohort go in their own line, not into the industrial aggregate. A cohort you
   cannot see is a cohort you cannot kill.

**GATE:HUMAN — none of this is gated, and that is deliberate.** ICP-EQ-2 is
already decided, CRED-4 is accepted, robots needed no override. The only thing
that would open a gate is deleting a data file, which this job does not do. **If
you find yourself wanting to blend these rows into the industrial cohort "just
for the first batch", that is not a gate you can sign — it is condition (1) of
Artur's signature, and it is the one that protects the sending domains.**

## Do not re-litigate

- **The seat decision.** ICP-EQ-2 is DECIDED: seat them. The vertical was
  measured *before* the decision, not discovered after it. Reopening the "should
  these be in the ICP at all" argument re-runs an argument Artur already had with
  himself on the record.
- **The vertical.** 75.5% turf/lawn, 46.1% compact construction, 0% industrial
  MRO, measured on 2,399 US records. An independent re-count with a different
  keyword list gives 76.3% / 44.3%. It is not going to come out industrial on a
  third pass.
- **robots.** Three origins, all read before the first request. `Allow:
  /rest/search` beats `Disallow: /` under RFC 9309 §2.2.2 on the Coveo host; the
  other two are allowed and 404-silent. **No override, nothing to sign.** Do not
  "double-check" by re-fetching robots on a source that makes no further
  requests.
- **The credential.** CRED-4, accepted. Anonymous minted bearer, `roles:
  ["queryExecutor"]`, no login, no cookie. **Never record its value.** A 401 or
  403 would be a boundary and a full stop, but nothing here asks the origin
  anything.
- **The sweep's completeness.** `totalCount` 2,701, rows fetched 2,701, distinct
  2,677. There is no unswept axis and no second page to find.
- **The line card.** `account_contract_code_names` is the per-record signal (50
  codes, 754 combinations, 1 null in 2,399). **There is no tier code.**
  `bobc_accountindustry_dict` and `bobc_accountbusinessactivity_dict` are null on
  every record despite the page publishing rich defaults for both — re-checked on
  the national set, the answer did not change. Do not go looking for a parts/
  service facet in this payload; it is empty.
- **The two silent zeros.** A `context` object returns `totalCount: 0` on a clean
  200; so do `sortCriteria: "@sfid ascending"` and `"@permanentid ascending"`.
  Eleven diagnostic requests established both. If you ever do query this pipeline
  again, a zero is a claim that needs its own test.
- **The 15-row cap.** `numberOfResults` is not ours to set. 2,701 ÷ 15 = 181
  requests, which is what the sweep cost.
- **Domain-authoritative clustering.** A row with a domain never joins on name or
  phone. The name join chained "Bobcat of Houston/Beaumont/Akron" into one
  26-store blob across four states and **hid real in-band companies**. Do not
  restore the transitive name join to "catch more groups".
- **`_bobcat-national.log`'s last projection line.** `767 / 0.1585 = 4839` is the
  three-metro scaler misapplied to a national census. **767 is a count.**

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner — seated is `0` today and will not be after the fold-in.
2. **RENAME THIS FOLDER** to match the new status — `bobcat [NEW-STATUS]` — that
   is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed. **Whatever the new
   status is, it must still carry the fact that this segment is separate** —
   `DONE-SEATED-SEPARATE` is the current name for a reason.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second). The `equipment-dealers [*]/` row also claims these counts; correct
   both or they drift.
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean. H10
   already covers the 20 MB payload and the 222-file cache.
