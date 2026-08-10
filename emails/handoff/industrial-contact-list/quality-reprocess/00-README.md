# Client-pool quality reprocess — handoff package

**Written:** 2026-08-10, against `main` @ `116c7f0`. Execute with `PROMPT.md` in this folder.

## Mission
Purge non-company rows from the seven client-visible pools. Trigger: `01webdirectory.com` —
a web directory whose SERP snippet describes a real distributor (UsedRack.com) — was minted
as a company by the serp harvest, parked in `pool-small-shops`, and reached the client
dashboard. The serp pass is where false positives concentrate: **1,524 of 2,815
small-shops-v9 rows are serp-sourced**. The name-pattern class is small (3 rows found by
regex: 2 small-shops, 1 non-us) but the misattribution class (directories, marketplaces,
publications, associations whose snippet describes someone else) needs a real census.

## Scope
**IN:** 1. Census/classifier over serp-sourced rows in all 7 client pools (`seated`,
`above-ceiling`, `adjacent-trades`, `chains`, `non-us`, `small-shops`, `segment-w`):
non-company detection via domain patterns + empty address/phone/brand + the
snippet-describes-another-domain tell · 2. Founder-signed re-disposition of confirmed junk
to `not-a-distributor` in the NEXT generation via the pipeline's retag mechanics (roll-up
retag precedent 2026-08-03/04; never hand-edit current CSVs) · 3. Per-pool junk-rate
report → founder re-picks `CLIENT_POOLS` · 4. Re-run `sync-supabase.mjs`; verify the
dashboard reflects the cull.
**OUT:** Adaptall bulk ingestion (Gate G1) · dashboard code (v2 shipped at `116c7f0`) ·
full re-sourcing · deleting anything (culled ≠ deleted — junk moves to a reject bin,
side-pools rule).

## Gates
- **G1 GATE:HUMAN — Adaptall §8.6 re-open?** Default **NO**: the dossier
  (`../adaptall [RETIRED-TO-LOOKUPS]/00-README.md`) retired the bulk route on
  identity-exposure grounds (consent-form enumeration under Artur's real name, LIMIT-15
  cap, 28.9% website fill, inverted tier signal). The dashboard's brands-carried filter
  answers "who carries Adaptall" from line-card data — measure that count after the 0005
  re-sync BEFORE reconsidering.
- **G2 GATE:HUMAN — `CLIENT_POOLS` re-pick** after the junk report (the 2026-08-09
  "everything except reject bins" choice was made before the small-shops serp share was
  known). Interim option, founder's word: drop `small-shops` from the constant until cleaned.

## Linear
Search team SAL for "reprocess", "quality", "pools", "serp" before minting
**"Client-pool quality reprocess — purge non-company serp rows"**. Do not duplicate the
dashboard issue. One package = one issue = one PR to `main`.

## Success criteria
1. Census report exists per pool: serp rows scanned, junk candidates by class, confidence.
2. Founder-signed disposition list applied in generation N+1; conservation check PASS.
3. `01webdirectory` absent from every client pool file of the new generation.
4. Post-re-sync, the dashboard's unfiltered Locations count drops by exactly the culled count.
5. Local dashboard five tabs + emails suite untouched and green.

## Context loading
`01-current-state.md` → `02-implementation-direction.md` → the adaptall dossier (G1 only) →
`emails/handoff/industrial-contact-list/00-README.md` §source registry ·
`.claude/rules/handoff-packages.md` + `.claude/rules/plan-drift.md`.
