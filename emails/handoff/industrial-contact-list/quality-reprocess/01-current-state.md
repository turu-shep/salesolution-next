# 01 — Current state (verified 2026-08-10, main @ 116c7f0)

**The specimen.** `01webdirectory` lives in `emails/data/side-pools/pool-small-shops-v9.csv`
(and v7/v8; earlier in `pool-ranked-out-v6.csv`): `company=01webdirectory`,
`domain=01webdirectory.com`, `source=serp`,
`source_url=https://www.01webdirectory.com/material_handling.htm`, disposition history
`dealer_candidate` → sub-floor. **The tell:** its `self_declaration_verbatim` is the SERP
snippet of the directory page and describes a DIFFERENT company ("UsedRack.com : Minnesota
stocking distributor…"). Empty address/phone/brand fields. This is the misattribution
signature the classifier keys on.

**Adaptall — deliberate, documented, not a bug.** Exactly **1** row carries `adaptall` as a
source token (visible in the dashboard's Captured-from filter); ~10 `adaptall` mentions in
`seated-v9.csv` are lookup-enrichment fields (contact/tier provenance), not sources. The
bulk route was retired 2026-08-03 — dossier `../adaptall [RETIRED-TO-LOOKUPS]/00-README.md`:
consent-form identity gate (real-credentials precedent GATE-L5), hard LIMIT 15/query (a
national pull = hundreds of queries under Artur's real name), 28.9% website fill, tier
signal inverted (premier = chains). "Use it to answer 'is this company Adaptall-authorized',
never to build a list."

**Census baseline (crude regex, lower bound).** Directory-pattern domains:
2/2,815 `pool-small-shops-v9` · 1/521 `pool-non-us-v9` · 0 elsewhere. Serp-sourced rows in
small-shops-v9: **1,524** (grep `,serp,`). Seated/chains/above-ceiling/adjacent/segment-w
serp shares: unmeasured — the census script measures all seven.

**Dashboard side (context, not scope).** `CLIENT_POOLS` (7 pools) lives in
`apps/contacts-dashboard/lib/columns.mjs` with the 5 reject bins commented; the pools
predicate is server-enforced on every query path (Task 13 review, verified). v2 columns
`brand_tokens`/`business_type` populate only after the founder pastes `0005_client_base.sql`
and the sync re-runs — check whether that has happened before measuring anything.

**Hard guards — do not weaken.** `emails/.gitignore` wall (no data file ever staged) ·
conservation check compares live files, never frozen counts · side-pools rule: culled ≠
deleted (junk re-dispositions to a reject bin, nothing is removed from the asset) ·
generations move — every count above is compare-live at execution time.
