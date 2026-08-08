# PROMPT — contacts dashboard deploy

Paste into a fresh session, as-is.

---

Execute the handoff package at `emails/handoff/industrial-contact-list/dashboard/`.

1. **Load context first**, in the order given by `00-README.md §Context loading`. `specs/02-client-view.md §AMENDMENT 2` is the law of this folder; the implementation plan is stale exactly where that amendment's §Consequences table says so. Do not write code before finishing the load.
2. **Reconnaissance**: drift-check every anchor in `01-current-state.md` against the live tree (`.claude/rules/plan-drift.md` mechanics). Resolution is pre-authorized: follow the code, log the discrepancy in `CLOSEOUT.md §Discrepancies` plus a decision entry, and keep going. STOP only if drift invalidates the approach or opens a gate. Parallel sessions move `emails/` daily — this re-check is mandatory. Pay special attention to the two discrepancies `01` already records (the "Everything tab built" claim and the plan-vs-amendment drift).
3. **Post the execution brief**: gate status (G1–G4), the task order, the re-planned task specs for plan tasks 5 and 9 (per-person Supabase auth with invite/revoke/export-audit; single deployment), and every open decision — **[default]** decisions are taken and logged without asking. **Wait for my go.**
4. **Execute** `docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` task-by-task with superpowers:subagent-driven-development (or superpowers:executing-plans inline), applying the AMENDMENT 2 deltas: tasks 1–4 and 10 as written · tasks 6, 7, 8 amended (no show-all toggle, no `raw` panel, whitelist enforced server-side, Pools out, switcher in) · tasks 5 and 9 from your approved re-plan. The plan carries code, tests, commits; do not re-derive what stands.
5. **Verify** per `02-implementation-direction.md §Verification`, then walk `00 §Success criteria` 1–7.
6. **Close out**: write `CLOSEOUT.md` (contract in `.claude/rules/handoff-packages.md`), update the pack registry row in `../00-README.md`, then run `/handoff` for the continuity doc.

Parallelization stance: single package, sequential tasks — no worktree siblings, no collisions with other packages.

## Variants
- **Research-only:** stop after step 3's execution brief.
- **Pre-gate build:** run plan tasks 3, 4, 6–8 (scaffold → views, amended) plus the task-5 re-plan build with a seeded dev account; park tasks 1–2 (G1) and 9 (G2–G4) until gates clear.
