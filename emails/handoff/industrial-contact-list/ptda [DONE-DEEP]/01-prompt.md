# ptda — audit the 10:1 rollup collapse before trusting the 159

Your mission: measure whether `rollupBranches` merged independent distributors that are not the same company, and re-emit PTDA's rollup key if it did.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The ASP.NET form contract, the 23,105 → 159 collapse, and why PTDA is the right source to test the rollup on.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 3 and §5 (Segment B).
4. `../../strategy/01-build-plan.md` §2b (branch-stripping is the biggest lever in S2) and §5b.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` §6.
6. `emails/scripts/lib/dedupe.mjs:410` — `rollupBranches` itself. Read the function before measuring what it did.

## The work

All of this is **offline — zero network requests.** The raw payload is on disk at `emails/data/raw/ptda-2026-08-01.json` (plus `.csv`), and every response is cached, so a re-emit is free.

### Step 1 — provenance histogram (30 min)

For all 159 PTDA companies, report where each one landed: `seated-v5` (45), `pool-ranked-out-v7` (25), `pool-segment-w-v7` (2), and the remainder across `pool-chains-v7`, `pool-above-ceiling-v8`, `pool-adjacent-trades-v7`, `pool-not-a-distributor-v10`.

**87 companies are currently unaccounted for in the three pools we measured** — name each one and its disposition. If any PTDA company appears in no list at all, conservation is broken and that finding stops everything else.

### Step 2 — the false-merge measurement (the core task)

Take every PTDA company whose rollup absorbed >1 location — 66 groups after the nine nationals, plus the nationals themselves. **Sample 50 collapsed groups** (all 66 independents if the count allows; the nationals are a separate, easier check). For each group, pull the underlying raw rows and test:

- **Domain test (primary, free, decisive):** do all locations in the group publish the *same* apex domain? PTDA is 100% website. Two different apexes under one normalized name is a **false merge** unless one redirects to the other.
- **Phone test:** distinct area codes with no shared corporate number is corroborating evidence.
- **Geography test:** non-contiguous states with no branch language in the record.

Report a **false-merge rate with a confidence interval**, and name every false merge found. Hand-read the disagreements — the automated tests are evidence, not a verdict (§5s's rule).

### Step 3 — re-emit if wrong

If the false-merge rate exceeds ~5%, change PTDA's rollup key from `(source, company)` to `(source, company, apex_domain)` — a **source-scoped override in `s2-dedupe.mjs`, not a global change to `rollupBranches`**, because other sources have far worse website fill and would fragment. Then re-run S2→S4 and diff.

**Mandatory: field-for-field readback of every list this touches** (§5s — `makeRecord()` before `toCsv()` silently blanked 35,927 fields while conservation PASSED).

**GATE:HUMAN before any re-emit reaches `seated-v6`.** This changes list membership. Present the false-merge rate, the named merges, and the diff; wait for sign-off.

### Step 4 — the ceiling check (one hour, ~10 requests)

Compare 159 against PTDA's own published membership count. If PTDA states materially more distributor members than we hold, the grid or the category axis missed some: test by running the `Input2` company-name axis against a handful of known member names that are absent from our 159. That distinguishes "our rollup ate them" from "the search never returned them" — two different bugs with two different fixes.

Pacing on those requests: ≥3s, one worker, cache every response — the same posture that produced 0 × 429 and 0 × 403 across 1,266 origin requests.

### Expected upside, stated honestly

If the rollup is clean, this yields nothing but confidence and costs a day. If it is lossy at the rate the `hoseshop` case suggests is possible, the recoverable count is tens of Segment-B independents with 100% NAP and an 8.4/14 line card — the highest-quality rows available anywhere in this build.

One standing rule while you are in here: the 14 `Input3` values are **categories, not brands** — `line_card[]` only, never `brand_authorized[]`, or S3 reads a single-brand shop as a 14-brand distributor.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `ptda [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
