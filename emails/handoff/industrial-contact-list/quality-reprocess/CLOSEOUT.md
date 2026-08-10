# CLOSEOUT — client-pool quality reprocess

**Executed:** 2026-08-10 (single session, founder in the loop for both gates)
**Linear:** NOT minted — MCP unauthenticated this session. Owner: mint "Client-pool quality reprocess — purge non-company serp rows" (team SAL) or say skip.
**Branch/PR:** direct commits to `main` (repo precedent for this program); no PR.
**Owner actions pending:** Linear mint above; nothing else.

## What shipped (vs. 00 §Scope IN 1–4)
1. **Census** — `emails/scripts/lib/census.mjs` (+15 RED→GREEN tests), `emails/scripts/pool-quality-census.mjs`. 3,283 serp rows scanned across seated + 6 client pools: 39 certain non-company (directories, publications, associations, city governments), 10 misattributed-snippet, 1,261 hollow-only. Report: `emails/data/quality-census-2026-08-10.csv`.
2. **Founder-signed cull** — 41 rows (39 auto-approve + bluemeteor.com PIM SaaS + rickrudolphassociates.com rep agency) → `not-a-distributor` via `emails/scripts/s4o-quality-cull.mjs`: small-shops-v9→v10 (2,811→2,774), non-us-v9→v10 (520→516), not-a-distributor-v10→v11 (3,475→3,516). Conservation 6,806=6,806 PASS; readback 0 diffs; audit `emails/data/_quality-cull-2026-08-10.json`. Founder KEPT after web-check: grovesindustrial, centuryfasteners (both seated), galco, itpgrp, accutech. Seated: zero culls.
3. **Junk report → G2 re-pick (founder, same day)** — non-us dropped from `CLIENT_POOLS` entirely; small-shops kept with a `hideSmall=1` narrowing toggle (`CLIENT_POOLS_NO_SMALL_SHOPS`, pinned at BOTH emitters, audited in exports). Country filter + derived column retired (one-country base). Client base: 14,504 → **13,947** rows; 11,173 with small shops hidden.
4. **Re-sync + verify** — total 36,168 conserved; client-visible dropped by exactly 41 pre-G2 (14,463); 01webdirectory now `pool=not-a-distributor`, invisible on every client path. 0005 columns populated by this sync (32,802 rows carry brand_tokens).

## Verification
Root suite 528/528 · dashboard suite 88/88 · dashboard `pnpm build` clean · census re-run on new generation: auto-approve 0 in every client pool · sync conservation PASS · DB counts arithmetic-exact · no data file staged.

## What we tried
First `sync_promote` call failed 57014 (statement timeout — 0005's GIN index + 3 full-table passes in one transaction); immediate retry passed. Transient/cold-cache. If it recurs: `alter function sync_promote(text) set statement_timeout` migration.

## Discrepancies vs. the package
- Live serp shares far above 01's crude greps (seated 37% serp-sourced — pipe chains hid it; small-shops 1,524 confirmed exact).
- 0005 was pasted but the post-0005 sync had NOT run at execution start.
- Package's "3 known rows" grew to 41 on inspection; classifier seed list extended twice by inspection (round 2: pnj.com via the misattribution tell).
- Scope: G2 landed as dashboard code beyond "one constant + its tests" (toggle UI + country retirement) on direct founder instruction — not parked.
- Adaptall side-quest (founder ask, not in scope): dealer list delivered — `emails/data/adaptall-dealer-list-2026-08-10.csv` (71 dealers × our-pool cross-ref); measured line-card answer: exactly 1 carrier (hoseshop.com). No new pulls; G1 stays closed.

## Deferred / residuals
- Hollow rows (1,261) stay in place — verify-by-fetch pass = own issue if wanted.
- accutech.net display name garbled ("Accutech Line Card 2023_web") — name-hygiene candidate.
- Snippet-harvest stretch (mine real companies from directory snippets, e.g. UsedRack.com) — parked per 02.
- `contacts_counters` p_country parameter now dead in SQL — remove in a future migration if it bothers anyone.

## Interplay with sibling packages
- `dashboard/` (deploy package): its 0005 owner-loop is now closed (pasted + synced). Client base semantics changed under G2 — AMENDMENT 2 docs describe the 7-pool base; this CLOSEOUT is the authority for the 6-pool + toggle shape.
- Source folders: none touched; no source tokens changed; new-source rule unaffected.
