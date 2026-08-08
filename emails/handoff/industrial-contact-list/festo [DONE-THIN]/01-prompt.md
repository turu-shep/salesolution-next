# festo — strike the 12, then a reopen check

Your mission: apply the pre-seating strike list to Festo's 24 net-new domains so
the ~12 that survive fold in clean, then decide whether the source has grown
enough to be worth re-pulling. Both jobs are small. The build is done.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. **Read §1's judgement call and §3's
   vertical-code section before touching the data.** The headline 24 is not the
   number you seat.
3. `../../strategy/01-build-plan.md` **§5i** — manufacturer locators encode
   vertical in their own codes. Festo is the fifth confirmation, and `didactic`
   sorts 17.6% of this source out of ICP.
4. `../../strategy/01-build-plan.md` §5a — the surviving mechanism. Every one of
   these records carries "authorized Festo distributor" at 100% coverage by
   construction. That stamp, not the count, is why this source exists.
5. `../../strategy/00-sourcing-strategy.md` §7.2 — 47.1% of rows ship an email,
   some named-person. GATE-L6 cohort rules apply.
6. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` — why Festo
   needed no gate while Banner and Pepperl+Fuchs did.

## Job 1 — the strike list, before anything is seated

Festo returns **24 net-new domains** against `deduped-v7.csv`. **At least 12
should not be seated.** Strike them explicitly, with a `disposition`, into
`emails/data/side-pools/` — never delete, per the standing rule that culled ≠
deleted.

| Strike | Why | How to find them |
|---|---|---|
| **9 education / training resellers** | Not industrial MRO. Advanced Educational Technologies, Bluegrass Educational Technologies, Carolina Training Associates, Educational Solutions Enterprises, Industrial Training Solutions, Southern Educational Consulting & Training, Tech-Ed Systems, Advanced Technologies Consultants, Reletech | `didactic_raw == True` — the source labels them itself |
| **`digikey.com`, `us.rs-online.com`** | Catalog giants, not distributors, and both far above the $75M ceiling | by domain |
| **`mw3ds.com`** | 3D printing, wrong vertical | by domain |
| **the `facebook.com` row** | A Facebook page in the `website` field, not a domain | by domain |

**Do not average over `didactic_raw`.** It is the whole reason this source is
safe to seat — Yaskawa's `groupList` taught that lesson at 29.7% contamination,
and there it went uncaught until after seating. Here it is caught before.

Two more things to handle at fold-in, neither a strike:

- **`state` is null on all 119 rows.** `address.stateProvince` exists on the
  entity and Festo never populates it. Derive state from ZIP in **S2**, where
  that derivation belongs. Do not backfill it into the source file — that would
  launder an inference into a source field.
- **AWC, Inc. (`awc-inc.com`) is 30 of 119 locations** — a quarter of the pull
  under one banner. Branch collapse does most of the work between 119 rows and
  51 companies. Confirm the rollup ran before trusting any per-company count.

## Job 2 — the reopen check

**Reopen only if the US collection has grown by ≥100 locations** (baseline: 119,
server-confirmed via `@odata.count`). Anything smaller cannot move a source that
already fails the ≥150 net-new bar by more than 10×.

```
python3 emails/scripts/sources/festo.py
```

One request answers it — `$filter=address/country eq 'us'&$top=1000&$count=true`
returns `@odata.count` in the same payload as the rows. The extractor caches, so
a re-run is free; delete `emails/data/raw/_cache/festo/` to force a live fetch
(cache, not data — the only deletion this prompt permits, and it costs 6 GETs to
rebuild).

**If growth is under 100 locations: report the delta and STOP.**

## Do not re-litigate

- **It is not a headless target.** `research/01` filed Festo as `hard JS`. The
  SPA is an OData client over Azure AI Search and the API takes
  `$filter=address/country eq 'us'` directly. No browser, ever. Six requests
  swept the entire US network.
- **`salespartner` is not an API value.** It is the i18n label over the
  Automation/Didactic toggle. Grepping for it chases a UI string.
- **robots.** `api.festo.com/robots.txt` is a 404;
  `distributorlocator.festo.com/robots.txt` returns a body byte-identical to the
  page shell, because the SPA serves its index for unknown paths. **Neither host
  publishes a robots file.** There is nothing to override and nothing to sign.
  Pace anyway.
- **The `Authorization` value.** Read `./00-README.md` §1 before forming a view.
  It is a 32-character Azure AI Search read-only query key published to every
  anonymous visitor — the Banjo/Banner public-identifier shape, not Enerpac's
  leaked basic-auth service account. `festo.py` reads it from the cached bundle
  at run time and it is written to no file. **Never record the value anywhere.**
  If it ever starts returning 401, that changes the classification: stop, and do
  not go looking for a replacement.
- **The US count is real, not truncated.** Worldwide is 1,924; US is 119, and the
  server says so.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `festo [NEW-STATUS]` — that
   is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
