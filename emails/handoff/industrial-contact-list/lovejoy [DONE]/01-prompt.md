# lovejoy — reopen check

Your mission: refresh the single bulk call if asked, and report distinct companies rather than raw rows when you do.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One request, 1,147 US records, 84 companies, and why that ratio is not a defect.
3. `../../strategy/00-sourcing-strategy.md` §3a E1 — "raw record counts flatter this sweep; the company count is the truth".
4. `../../strategy/01-build-plan.md` §7 risk-1.
5. `../../../research/05-widget-sweep.md`.

## The check

Reopen only for a **refresh**. One request: `GET https://www.lovejoy-inc.com/wp-admin/admin-ajax.php?action=asl_load_stores&load_all=1&layout=1` — the Agile Store Locator bulk-load action, unauthenticated, no nonce, whole network in one call.

**If no refresh is wanted: report that, and STOP.** The bulk action returns everything, and what it returns is mostly branches of companies we already hold.

## The lesson attached to this source

**Report distinct companies, never raw rows.** 1,147 US records collapse to 84 companies — 13.7:1, the second-worst ratio in the program after SPX FLOW — and that is not a dedupe defect. E1 measured it in advance: **Lovejoy and Ballymore are chain-dominated and overlap Timken heavily**, which is why the widget sweep's honest yield was 150–250 net-new companies against ~2,830 raw records. This source is most of the reason that gap exists.

If a future replenishment sweep uses E1's method, carry that lesson into how the result is reported.

Pacing: one public endpoint, one origin request. `emails/scripts/sources/lovejoy.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `lovejoy [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
