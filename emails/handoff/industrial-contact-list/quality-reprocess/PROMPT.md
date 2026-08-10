# PROMPT — client-pool quality reprocess

Paste into a fresh session, as-is.

---

Execute the handoff package at `emails/handoff/industrial-contact-list/quality-reprocess/`.

1. **Load context first**, in the order given by `00-README.md §Context loading`. Do not
   write code before finishing the load.
2. **Reconnaissance**: drift-check every anchor in `01-current-state.md` against the live
   tree (`.claude/rules/plan-drift.md` mechanics) — generations move daily; re-measure the
   serp shares and specimen locations live. Also check whether `0005_client_base.sql` has
   been pasted and the sync re-run (the dashboard's brand/type columns populate only
   after both). Resolution is pre-authorized: follow the code/data, log the discrepancy
   (CLOSEOUT §Discrepancies + a decision entry), keep going; STOP only if drift
   invalidates the approach or opens a gate.
3. **Post the execution brief**: census plan, classifier definitions, the two open
   decisions with their **[default]**s taken and logged, gate status (G1 Adaptall —
   default NO; G2 CLIENT_POOLS re-pick pending the report). **Wait for my go.**
4. **Execute** `02-implementation-direction.md` steps 1–5. Founder-loop items: the
   disposition sign-off (step 2) and the G2 re-pick (step 5) are mine; present them and
   wait. The retag lands in the NEXT generation via the pipeline — never hand-edit
   current CSVs, never stage a data file.
5. **Verify** per `02 §Verification`, then walk `00 §Success criteria` 1–5.
6. **Close out**: write `CLOSEOUT.md` (contract in `.claude/rules/handoff-packages.md`),
   update the pack's root `00-README.md` registry/runnable table, run `/handoff`.

Parallelization stance: single package, sequential steps — no worktree siblings; do not
run alongside a generation roll or a dashboard deploy session.

## Variants
- **Census-only:** stop after step 4's census report + execution brief (no retag) — the
  report alone answers G2.
- **Research-only:** stop after step 3's execution brief.
