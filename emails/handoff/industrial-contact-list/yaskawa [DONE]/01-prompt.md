# yaskawa — reopen check

Your mission: refresh only if asked, and never let a Yaskawa record reach the seated list without its product-group code being read.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. Five product groups, a 46-ZIP grid, two parameter traps, and zero websites.
3. `../../strategy/00-sourcing-strategy.md` §3a E2.
4. `../../strategy/01-build-plan.md` **§5i — read this one in full** — then §5m.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` wave 3, "§5e: Yaskawa's product-group code IS a vertical code".

## The check

Reopen only for a **refresh**. There is nothing to fetch — the 46-ZIP national grid at 200 miles across all five product groups is the whole surface.

**If no refresh is wanted: report that, and STOP.**

The residue is downstream, not here: **232 companies with a phone and an address but no domain**, 95 of them in Segment W. Recovering them is identity-resolution work and it belongs to `no-domain-backlog/`.

## The standing rule, and it is the point of this source

**Never seat a Yaskawa record without reading `product_group_code`.** ~30% of them are the wrong channel and nothing in the name says so.

| Code | Label | Records | Distinct US companies |
|---|---|---|---|
| D09 | Industrial AC Drives | 583 | 139 |
| D13 | HVAC Drives | 264 | 62 |
| D23 | iQpump (water/wastewater) | 201 | 19 |
| D02 | Servo and Motion Controllers | 200 | 42 |
| D33 | Medium Voltage Drives | **0** | 0 |

151 companies are reachable only through the industrial groups; **69 (29.7%) only through D13/D23**; 12 carry both. The off-ICP-only cohort reads exactly as its code says — Air Carolinas, Air Treatment, Building Controls & Services — HVAC and building-controls wholesalers whose *names* look like industrial distributors. §5m reproduced the 29.7% independently, and the badge tokens (`hvac-logo`, `iq-icon2`) corroborate it.

**D33 returning zero is a finding, not a parse failure:** all 46 queries returned HTTP 200, echoed `Group: Medium Voltage Drives`, and served a Yaskawa outside-sales rep with zero distributor cards. Medium-voltage drives are sold factory-direct; there is no channel to harvest.

## If you do re-pull, the two traps

Each of these would have returned a plausible-looking empty pull rather than an error:

- The `<select>` is named `groupSelect` but the page's JS submits **`groupList`** — and `groupList` is a required filter.
- The dealer-tier badge filename sits **mid-path** in a Liferay URL (`/documents/20184/12766826/premier-icon.gif/<uuid>`), so a naive `rsplit('/')` captures the UUID and silently destroys the code.

A state-only search is rejected client-side, so `zipCode` + `proximityType` is the only clean axis. Pacing: `_polite.py`, every response cached, no 429 and no backoff needed across 235 origin requests. `emails/scripts/sources/yaskawa.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `yaskawa [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
