# dorner — reopen check

Your mission: refresh the four requests if a refresh is wanted, and otherwise stop.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 116 records inline in the HTML, the best fill rates of any locator, and the branch-stripping calibration case.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 and §7.2.
4. `../../strategy/01-build-plan.md` §5a — Dorner is the normalizer calibration case.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` §2.

## The check

Reopen only for a **refresh**. It costs four requests: one `GET https://www.dornerconveyors.com/distributors?country=United+States+of+America` for the whole US set (a `distributorPlaces` JS array literal inline in the HTML — no JS execution, no API, no pagination), plus one GET per `markets[]` facet value to recover per-record market assignment (53 Automation · 54 Food · 55 Material Handling · 56 General Industry · 57 Packaging).

**If no refresh is wanted: report that, and STOP.** 116 records is the entire published US network, not a sample.

## Two things to preserve on any re-pull

- **Dorner is the branch-stripping calibration case.** It matches `research/06` exactly on record count and fill rates, and branch-stripping reproduces research's figures to within one company (75/56 vs 76/56). That single test is what made the normalizer's behaviour an explicit §2b decision rather than a default. If a re-pull ever stops matching, the normalizer changed — investigate that before accepting the new numbers.
- Email fill is 96.6%, which makes this a **GATE-L6 manufacturer-published-email source**: those addresses ship in their own micro-campaign cohort, never blended into the main list (§7.2).

Pacing: public page, 4 origin requests total, no throttling, no errors. `emails/scripts/acquire/dorner_acquire.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `dorner [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
