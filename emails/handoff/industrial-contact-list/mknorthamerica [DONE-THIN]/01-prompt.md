# mknorthamerica — closed-source check

Your mission: confirm nothing about this source has changed shape, then stop. There is no reopen condition.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 76 records, 4 companies, 3 of them not mk, zero seated.
3. `../../strategy/00-sourcing-strategy.md` §3a E2.
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` wave 3, "The other four".

## The check

**DONE, and closed. There is no reopen condition — a rep finder cannot become a distributor network.**

`https://www.mknorthamerica.com/sales-and-support/` is an ASP.NET rep finder that **returns exactly one nearest rep per ZIP**. That is the structural reason the record count and the company count diverge so hard: 46 ZIPs × 2 categories saturated at 4 companies, of which 3 are not mk — Blettner Engineering (Indianapolis IN), M6 Revolutions (Trout Lake WA), NAMPRO Inc (Bloomfield). The remaining 58 records are **8 mk employees.**

**Net contribution to the send list: zero.**

The only thing that would change this verdict is mk replacing the rep finder with an actual distributor list. If you have specific evidence of that, say so and describe it. Otherwise: **report that nothing has changed, and STOP.**

**Do not revisit.** That is the acquisition log's own verdict and nothing since has changed it. **A denser ZIP grid returns the same 8 mk employees more times.**

`research/06` called mk "manufacturer's reps, not distributors"; this pull confirmed and quantified it. Thin because the source is the wrong shape, not because we stopped early.

One note if anyone re-reads the payload: the category code (1 = Conveyor Systems, 22 = Extruded Aluminum Framing) **does not sort** — all 76 records list both products, so unlike Yaskawa's this code carries no discriminating information. The consequential split here is *employer*, captured raw in `rep_company_raw` / `rep_title_raw`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `mknorthamerica [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
