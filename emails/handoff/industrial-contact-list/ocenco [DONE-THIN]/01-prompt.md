# ocenco — reopen check only; expect to close it again in five minutes

Your mission: confirm the network is still eleven rows, then stop. This source
is complete. There is no sweep to run and no query that returns more.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. It is short because the source is
   small; read it fully rather than skimming.
3. `../../strategy/01-build-plan.md` §5i — the small-locator tail. Interroll
   (14), FlexLink (6) and mk North America (4 real companies) are the shape
   this belongs to, and the lesson is that a complete-but-tiny source is a
   legitimate outcome, not a failed extraction.

Nothing here is billed.

## The work — a reopen check, not a build

**The reopen condition, stated so it can be tested rather than argued:** this
source is worth reopening only if `https://www.ocenco.com/distributors/` stops
being a static inline list — i.e. it becomes a locator widget with a query
behind it, which would imply a larger network that the page currently only
summarises.

1. **One GET**, polite posture (`emails/scripts/sources/_polite.py`: ≥3s,
   honest UA, cache the response, 403 stops it). Compare against the cached
   copy in `data/raw/_cache/linecard-ocenco/locator.html`.
2. **Count the rows.** If it is still ~11 inline entries under market
   headings, **the condition does not hold. Report that and STOP** — do not
   re-parse, do not re-write the raw file, do not touch the registry.
3. If the page *has* become a widget, treat it as a new target: pin the
   transport, read robots for whatever host serves the data (per-origin rule),
   and measure website coverage against the 67.6% benchmark before building
   anything. That is a probe, not a sweep.

**Do not** attempt to enrich the four US companies from here. Three of them
are already in the pool through other sources and the fourth is a single
domain; whatever enrichment they need belongs to the pipeline stage that owns
it, not to this folder.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner — **only if something actually changed.** A confirmed
   no-change reopen check should leave every file byte-identical and say so in
   the report.
2. **RENAME THIS FOLDER** only if the status changed — `ocenco [NEW-STATUS]`.
   A no-change check keeps `[DONE-THIN]`.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second) if the row changed.
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
