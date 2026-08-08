# spxflow — reopen check

Your mission: refresh only if there is a reason to, and if you do, run the 51-state grid alone.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The corrected MetaLocator endpoint, ZIP-territory matching, and the flat curve.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 and §7.2.
4. `../../strategy/01-build-plan.md` §5a.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` §3 — the endpoint correction and the ZIP-grid finding.
6. `../../../research/06-adjacent-segments.md`.

## The check

Reopen only for a **refresh**. There is nothing else: state-level territory matching plus a 51-state grid is complete coverage by construction.

**If no refresh is wanted: report that, and STOP.**

## If you do refresh

- **Use the state grid alone.** The 50 secondary-metro ZIPs cost 50 requests and returned **14 additional location IDs**. Cumulative distinct IDs ran q1=16 → q51=491 → q101=505. Territory assignment is state-level; more ZIPs cannot help.
- **Use the correct endpoint.** `research/06`'s was wrong: `view=location&task=load&format=json` answers unauthenticated but returns **only field definitions, never records**. The record endpoint, read out of the iframe's own JS:

  ```
  GET /index.php?option=com_locator&view=directory&force_link=1&tmpl=component
      &task=search_zip&framed=1&format=raw&no_html=1&templ[0]=address_format
      &layout=_json&Itemid=18647&postal_code=<ZIP>&radius=<mi>
  ```

- **A lat,lng pair as `postal_code` ignores radius and limit entirely** and returns the same fixed 41 rows for every centre tried. Only a real US ZIP is territory-matched. Do not build a radius sweep.
- **`priority_name` values ("Johnson Pump Marine", "Nutrition & Health") are product-line names, not quality tiers** — per §3's Adaptall warning, do not read them as quality.
- Email fill is 67.3% per distinct company, which makes this a **GATE-L6 source**: those addresses ship in their own micro-campaign cohort, never blended into the main list (§7.2).
- Pacing: public endpoint, ≥3s, no 429/403 in 105 requests. `emails/scripts/acquire/spxflow_acquire.py`.

One thing to carry rather than explain away: `research/06` and the build plan projected 200–450 companies and we measured **171 — below the low end.** That is recorded, not resolved.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `spxflow [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
