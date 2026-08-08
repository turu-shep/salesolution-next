# kubota — fold in 511 dealers as their own segment, and write the angle

Your mission: move Kubota's **511 net-new in-band domains** into the list **as a
labelled, isolated segment**, route everything above the ceiling, dedupe the
dual-line dealers against the seated Bobcat pull **before** you count, and produce
the copy angle those rows need. **This is not a pull and there is nothing to
fetch** — the census is complete, reconciled and on disk.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, the new-source rule, and the
   **projection convention** (baseline-share is a floor) this source rewrote.
2. `./00-README.md` — this source's dossier. **§3's vertical section and §4's
   binding conditions are the whole job.** Read them before you open the data.
3. `../../strategy/00-sourcing-strategy.md` **§9**: **ICP-EQ-2** (the seat
   decision and its three conditions, in Artur's own words), **ICP-EQ** (the
   1–4-location scope), **R-3** (the robots override — signed, and the same gate
   as R-EQ-1). Also **§7.2** (the isolated-cohort safeguard this reuses).
4. `../../strategy/01-build-plan.md` **§5i** (test that a code sorts before you
   trust it), **§5l** (a name join is not a domain), **§5f** (the vertical
   contamination this source is the cleanest instance of).
5. `../bobcat [*]/00-README.md` + `01-prompt.md` — **the sibling, same
   disposition.** The 16 dual-line domains are the reason you read it. If
   Bobcat's fold-in has already run, its rows are in the workspace and your
   dedupe target changes; check before you count.

## The work

**Batch limits before anything runs: 0 origin requests, 0 billed requests, 0
credits.** Every record is already on disk at
`emails/data/raw/kubota-national-2026-08-04.json` (1,039 records) with
`kubota-national-measure-2026-08-04.json` beside it. If you find yourself writing
a fetcher, you have misread the job — and the host you would be fetching from is
the one behind R-3.

1. **Fold in the 511, and label them in the same write that seats them.** Source
   rows from `kubota-national-2026-08-04.json`, filter to `is_us` **and**
   `size_band == "in-band"` **and** a non-empty `domain`. That is 670 records /
   526 clusters / **518 domains → 511 net-new against `deduped-v7`.** Write the
   distinguishing segment value **at the moment they enter**, never as a
   follow-up pass — a follow-up pass is what leaves 511 unlabelled rows in the
   list for an afternoon. Per the pack's project-separation rule there is no
   `project` or `owner` column: the marker is a `disposition`/segment value plus
   an overlay file under `emails/data/projects/`, not a new column in the master
   CSVs.
2. **Dedupe the 16 dual-line domains against the Bobcat pull BEFORE you report a
   number.** 511 is net-new against `deduped-v7`; **495 is net-new to the
   workspace.** The 16 sit in Bobcat's seated set and would otherwise be counted
   twice. `workspace_overlap.dual_line_sample` in the payload lists them
   (`acepowerequipment.net`, `bobcatofrockford.com`, `cherryvalleytractor.com`,
   `cumminsequip.com`, `lanoequip.com`, `newsouthtractor.com`, …). A dual-line
   dealer must end up in **one** cohort, not two — decide which and record the
   decision.
3. **Route the 62 above-ceiling clusters, do not drop them.** 357 records / 62
   clusters → `pool-above-ceiling`. **Culled ≠ deleted.** They are retained
   inventory and they are never seated.
4. **Hold the `unknown` band out.** 12 records / 9 clusters cannot be sized.
   `unknown` is not `in-band`; folding them in is the flattering-number failure
   the size filter exists to prevent.
5. **Send the 8 domainless in-band clusters (11 records) to `no-domain-backlog`,
   not to the list.** They contribute nothing to the 511 and must never be added
   to it.
6. **Write the new angle.** Angle 1's industrial Catalog AI copy is **not
   cleared** for these rows and swapping the nouns is not enough. The buyer is an
   owner-operator of an **agriculture / turf / outdoor-power dealership** with a
   parts counter — 100% of the network touches ag/turf families, 80.2% also
   touches compact construction, **0% is industrial MRO.** Three measured facts
   should shape the brief rather than be discovered by the recipient:
   - **Contact fill is excellent** — 98.3% website, 100% phone, 98.9% email — so
     this cohort needs almost no enrichment spend. That is the opposite of
     Bobcat, which publishes zero emails.
   - **The emails are not uniformly usable.** 51 gmail, 29 yahoo, many named
     individuals. Verify before sending and prefer a role address where both
     exist (§7.2).
   - **The line card is real and it sorts weakly.** `hierarchical_categories`
     separates a full-line ag dealer from a mower-only shop. It cannot evidence a
     parts-counter operation, so do not write copy that assumes one; say what is
     measured.

   Run the **humanizer** skill on the draft before handing it over.
7. **Report the segment separately from day one.** Bounce and reply for this
   cohort go in their own line, not into the industrial aggregate — and,
   ideally, not into Bobcat's either. A cohort you cannot see is a cohort you
   cannot kill.

**GATE:HUMAN — none of this is gated, and that is deliberate.** ICP-EQ and
ICP-EQ-2 are decided, R-3 is signed, the credential shape opened nothing. The
only thing that would open a gate is deleting a data file, which this job does
not do. **If you find yourself wanting to blend these rows into the industrial
cohort "just for the first batch", that is not a gate you can sign** — it is
condition (1) of Artur's signature, and it is the one that protects the sending
domains.

## Do not re-litigate

- **The Algolia endpoint.** `POST S66VLP7IQV-dsn.algolia.net/1/indexes/*/queries`
  against `prod_live_kubota_usa_global_index`, filter `post_type:dealer`, pinned
  statically from bundle `403-…js` module 86473 and bundle `491-…js`
  (algoliasearch 5.53.0). Nothing was rendered and nothing needs to be. Do not go
  looking for a second index or a per-dealer detail route.
- **The robots split, and that it is not a loophole.** `www.kubotausa.com` is 27
  bytes of `Disallow: /` for the whole host and was **overridden under R-3
  (signed, Artur, 2026-08-04)** for **6 GETs only**. The Algolia host publishes
  no robots.txt (HTTP 404) and R-3 was neither extended there nor needed there.
  **The data is Kubota's; R-3 is what makes the run legitimate.** The host split
  is real under RFC 9309 and it is not the reason this was allowed.
  **R-EQ-1 in `../equipment-dealers [PART-BUILT]/` is the same gate under a
  second name and its "default NO" text is stale.** Do not re-ask it, and do not
  "double-check" by re-fetching robots on a source that makes no further
  requests.
- **The credential.** Published static app id + **search-only** key, read at
  runtime by shape and never by value, sent in headers, `_assert_no_key_leak()`
  aborting before any write. Weaker than CRED-4's minted bearer, so it opened
  nothing. **Never record the key value.** The app id is recorded on purpose — it
  is the hostname and the record provenance. The Bimba rule still binds: a
  401/403 to an anonymous request is a wall, not a puzzle.
- **The `paginationLimitedTo` trap.** Algolia caps retrievable hits at 1,000 by
  default, so `page 1` returned `{hits: [], nbHits: 0, nbPages: 0}` on a clean
  200 — which reads exactly like the end of the index and would have lost 39
  dealers. The census reconciles against the control `nbHits` and falls back to a
  two-way `validStateCodes` partition (525 + 513 → 1,039). **Completeness is
  asserted against a control count, never against a loop that stopped.** That is
  a rule, not an anecdote.
- **`Material Handling > Buckets`.** Its entire lvl1 vocabulary is that one
  entry. It is a loader attachment and it is bucketed as an attachment. Calling
  it industrial would manufacture an industrial share out of a bucket.
- **The vertical.** Settled across a **full census**, not a sample: 100% ag/turf,
  80.2% compact construction, **0% industrial MRO**, line card filled on 1,039 of
  1,039. Nine lvl0 families, none of them industrial, and going national added
  none. It is not going to come out industrial on a second pass.
- **The dead columns.** `has_kubota_tech` False on 1,039/1,039;
  `has_orange_rental_program` False on 1,039/1,039; `post_type` is the filter.
  `has_extended_warranty` sorts 1,024/15 — **a 1.4% minority flag, not a
  qualification axis.** Do not build a segment on 15 dealers.
- **The decoys.** `url` (1,039 records) and `k_commerce_url` (312 records) are
  OEM-hosted and never reach `domain`; the Kubota family is in
  `_eq_sizeband.OEM_DOMAINS`. Do not "recover" them to raise the fill rate — that
  is the Case IH collapse.
- **Domain-authoritative clustering.** A row with a domain never joins on name or
  phone, and `kubota` is a brand token, not a name. Restoring a transitive name
  join would chain "Kubota of X" and "Kubota of Y" into one cross-state blob and
  **hide real in-band companies.**
- **The projection.** Method A (baseline share) predicted 215 and undershot
  2.38×; method B (the OEM's own denominator) predicted 527 and landed within 3%
  of the actual 511. Both were recorded before the census ran. The convention is
  already updated in `../00-README.md`. **511 is a measured count** — the
  `PROJECTION … 3224 nationally` line the shared `report()` prints on a census is
  meaningless and there is no 3,224.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner — seated is `0` today and will not be after the fold-in.
2. **RENAME THIS FOLDER** to match the new status — `kubota [NEW-STATUS]` — that
   is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed. **Whatever the new
   status is, it must still carry the fact that this segment is separate** —
   `DONE-SEATED-SEPARATE` is the current name for a reason.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second). The `equipment-dealers [*]/` row also claims these counts and still
   says Kubota is behind an unsigned gate — **correct both, or they drift.**
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean. The
   4.6 MB census payload and the Algolia response cache are already on disk from
   the 2026-08-04 run.
