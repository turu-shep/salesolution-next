# samsonrope — sort the vertical code before anything is seated

Your mission: decide which of this source's companies are actually our buyer,
using the industry code the locator hands us — and prove the code sorts before
you trust it. Then fold in, or write down why not.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The counts and the 16-option
   industry filter are there; do not re-derive them.
3. `../../strategy/01-build-plan.md` **§5i** — the standing rule that made this
   session necessary: manufacturer locators encode vertical in their own codes,
   assume it until disproven, and **never interpret a code until it has been
   validated against the records.** Yaskawa's `groupList` alone made 29.7% of
   its companies wrong-vertical; Adaptall's `premier` flag was inverted.
4. `../../strategy/01-build-plan.md` §5a (the website criterion this source
   passes cleanly) and §5h (a wave must add a signal we do not already have —
   be honest that a vertical code is not an authorization stamp).

Nothing here is billed. Everything below is offline except step 4.

## The work

### Step 1 — test whether the industry code sorts. Offline, from the raw file.

`Industries` is a **comma-list**, not a single value — a company can be Energy
*and* Utility *and* Mooring. Before it is used as a filter:

- Tabulate the 16 options against the companies that carry them. Which options
  are ICP-shaped (Utility, Energy, Mining, Crane, Defense, General Cordage,
  Safety / Rescue) and which are presumptively off-ICP (Commercial Fishing,
  Recreational Marine, Mooring, Tug, Inland River, Entertainment, Arborist)?
- **Then check the presumption against the records.** A "Recreational Marine"
  company that also carries Utility and Energy is probably an industrial
  distributor with a marine line, not a boat shop. **The multi-value case is
  where a naive filter does damage** — decide it explicitly.
- Report how many companies each rule would move, both directions, before
  applying anything.

### Step 2 — the two structural quirks, both already visible in the data

- **One company, many CMS items.** `Title` is `Distributor_NNN` and the same
  company appears under several ids with different industry sets. Dedupe on
  company + address, and **union the industry lists rather than picking one** —
  picking one silently discards the multi-vertical evidence step 1 needs.
- **Samson's own HQ is returned as a fallback** on queries that match nothing.
  The harvester drops those by name; confirm none survived before you fold in.

### Step 3 — decide the fold-in, with the counter-argument stated

This source clears §5a on website coverage, and it is small. Before folding in:
state how many companies survive step 1's filter, how many are net-new against
`lists/deduped-v7.csv`, and what §5h signal they carry beyond a domain. **A
vertical code is not an authorization stamp** — Samson tells us what a
distributor sells into, not that Samson certified them. If the answer is
"clean domains, no new signal", say so; that is still a legitimate fold-in on
volume, but it should be argued on volume.

### Step 4 — coverage check, one query, only if step 1 leaves you unsure

The API caps a result set at **24 rows** (measured). The sweep used 36 anchor
cities to see past that cap. If a specific industry looks under-covered after
step 1 — most likely Utility, which clipped repeatedly — run **at most 5 more
anchor cities for that one industry** and report whether anything fresh
appears. **Hard ceiling: 5 queries.** If they return nothing new, the sweep is
exhausted and that is the finding.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `samsonrope [NEW-STATUS]` —
   that is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
