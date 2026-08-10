# 02 — Implementation direction

Design principle: **classify loudly, cull via the pipeline, delete nothing.** The census is
a read-only script; dispositions change only through the retag mechanics in the next
generation; the current CSVs are never hand-edited.

## Steps
1. **Census script** — `emails/scripts/pool-quality-census.mjs` + pure module/test in
   `emails/scripts/lib/` (house split: pure half testable, I/O half thin). Over all 7
   client pools + seated: for every serp-sourced row, classify:
   - `non-company-domain`: domain matches directory/marketplace/publication/association
     patterns (seed list from the 3 known rows; extend by inspection, not imagination)
   - `misattributed-snippet`: `self_declaration_verbatim` names a different domain/company
     than `domain` (the 01webdirectory tell)
   - `hollow`: empty `address_1` + `phone_e164` + `brand_authorized` + `line_card`
     (candidate only — many real small shops are sparse; never auto-culled)
   Output: `emails/data/quality-census-<date>.csv` (gitignored path) + a printed per-pool
   summary table. RED→GREEN tests on the classifiers with synthetic rows.
2. **Founder review** — Artur signs the disposition list (auto-approve only
   `non-company-domain` certainties; `misattributed-snippet` and `hollow` are
   founder-reviewed line by line, or by sampled batch if >100).
3. **Retag** — apply signed dispositions in the next generation roll (`seated-v10` /
   `pool-*` next versions) via the existing retag path; junk → `not-a-distributor`
   **[default: reuse that bin — no new vocabulary]**. Conservation check must PASS.
4. **Re-sync + verify** — `node emails/scripts/sync-supabase.mjs`; dashboard unfiltered
   Locations drops by exactly the culled count; `01webdirectory` gone (criterion 3).
5. **G2 re-pick** — present the per-pool junk rates; Artur re-confirms or edits
   `CLIENT_POOLS` (one constant + its tests in `apps/contacts-dashboard/lib/columns.mjs`).

## Open decisions
- Disposition bin: **[default]** reuse `not-a-distributor`; a new `non-company` bin only if
  Artur wants the distinction visible in the operator cockpit.
- Auto-approve threshold: **[default]** domain-pattern certainties only; owner reviews the rest.
- Snippet-harvest stretch (mine real companies named inside directory snippets, e.g.
  UsedRack.com): **parked — own Linear issue if wanted**; it is sourcing, not cleaning.

## Verification
Census tests green · full `pnpm test` at root green · conservation PASS on the retagged
generation · sync twice = zero diff · dashboard count walk (criterion 4) · local five-tab
dashboard untouched · no data file staged (`git status` clean under `emails/`).

## Risks
- **Over-culling sparse-but-real small shops** — mitigated: `hollow` is candidate-only,
  founder-reviewed, and culled ≠ deleted (rows survive in the reject bin).
- **Generation drift mid-execution** — counts here are 2026-08-10; re-measure live, never
  trust this doc's numbers (plan-drift mechanics apply).
- **Seated may carry serp junk too** (0 regex hits but serp rows exist) — census covers it;
  any seated cull changes campaign-facing numbers, flag loudly in the report.
