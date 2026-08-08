# sullair — reopen check, not a build

Your mission: decide in under ten origin requests whether Sullair's two published
CSVs have changed enough to be worth re-ingesting. If they have not, say so and
stop.

**The source is closed and the reason is measured, not assumed.** 177 companies
is the entire published US network, both files are complete rather than a query
result, and there is no unswept axis — no metro grid, no radius loop, no
pagination. Do not go looking for one.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. Read §3's vertical-code section
   before you touch the data; it is the reason the headline count is misleading.
3. `../../strategy/01-build-plan.md` **§5i** — the standing rule that manufacturer
   locators encode vertical in their own codes. Sullair is its fourth
   independent confirmation, and `product_line_raw` sorts this source in half.
4. `../../strategy/01-build-plan.md` §5h — a wave is worth running only if it
   adds a qualification signal or a copy asset we do not already have.
5. `../../strategy/00-sourcing-strategy.md` §7.2 — Sullair ships named-person
   emails on 72.1% of US rows. That is a GATE-L6 cohort with a mandatory
   isolation safeguard, not ordinary list data.

## The reopen condition

**Reopen only if `stationary_distributor_list.csv` has grown by ≥50 rows**, which
is roughly what it would take to clear a meaningful number of in-ICP net-new
companies after chain and branch collapse. Portable-list growth is **not** a
reopen condition — see below.

### Test it

```
python3 emails/scripts/sources/sullair.py
```

The extractor caches every response, so a re-run is free unless the files
changed. Compare the new row counts against the recorded baseline:

| File | Baseline 2026-08-03 |
|---|---|
| `stationary_distributor_list.csv` | 119 US dealer rows |
| `portable_distributor_list.csv` | 357 US dealer rows |
| merged records | 650 (488 US, 176 distinct dealer companies) |

To force a live re-fetch, delete `emails/data/raw/_cache/sullair/` first —
that is the only deletion this prompt permits, it is cache rather than data, and
it costs 3 origin GETs to rebuild.

**If growth is under 50 stationary rows: report the delta and STOP.** Do not
re-fold, do not re-measure net-new, do not re-run the join.

## If it does clear the bar

1. **Route on `product_line_raw` before anything else.** `portable`-only rows are
   Caterpillar dealers and equipment-rental houses — construction and rental, the
   same contamination §5f measured at 20.5% in DataForSEO. They are **not** the
   MRO ICP. They are also not deletable: per the standing rule culled ≠ deleted,
   so they route to `emails/data/side-pools/` with a `disposition`, never to the
   bin. `stationary` is the plant-air slice that is genuinely ours.
2. **Measure net-new on domain, never on name.** The source publishes branch
   labels in the company field ("acme tools fargo", "acme tools bemidji" — one
   company on `acmetools.com`), so a name join overstates net-new by ~3×. Baseline
   figures to beat, against `emails/lists/deduped-v7.csv`: 60 net-new by exact
   domain, 55 by registrable domain, 52 entities missing on both axes, **18
   carrying the stationary line**.
3. **Watch the `id_no` trap.** The two lists run separate `id_no` namespaces for
   the same physical branch (Ring Power Pompano Beach is `605274_004` in portable
   and `602574_003` in stationary). Merging on `id_no` alone leaves ~24 US
   duplicates. The extractor already adds a name+street+city+state tier; keep it.
4. **Exclude `id_no 000000_*`.** That is Hitachi Global Air Power — Sullair's own
   parent — not a dealer. Already flagged `manufacturer_own_record`.
5. **Emails are GATE-L6 data.** 72.1% fill, and they are named individuals rather
   than role inboxes. §7.2 requires them to ship in their own isolated
   micro-campaign cohort with separately reported bounce and reply rates, and
   prefers a role address wherever a company has both. Do not blend them into the
   main list — a 2% bounce kills the program, and an isolated cohort can be killed
   without taking the sending domains down with it.

## Do not re-litigate

- **The base path.** It is `public_path = "/sites/default/files/"`, read out of
  the page's own inline script. `research/01` guessed wrong and 404'd; that open
  item is closed.
- **`/themes/custom/Sullair/library/data/usMap.csv`** is a 404 *and* commented out
  in the live page JS. Nothing loads it. It is not a missing file, it is a dead
  reference.
- **The regional `*Map.csv` files.** They carry zero company fields and map back
  onto the same lookup sheets by `id_no`. No US record is reachable only through
  one.
- **robots.** `america.sullair.com` disallows `/search/` and
  `/index.php/search/` only. The data path is not disallowed and no override is
  involved. Nothing to sign.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `sullair [NEW-STATUS]` — that
   is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
