# 02 — Implementation direction

The plan is the implementation; this package routes and gates it. One design principle governs every delta: **the client surface is allowlisted, never filtered after the fact** — a column or row a client must not see is one the server never selects.

## Steps
1. **Re-plan first, build second.** Draft replacement specs for plan tasks 5 and 9 in the execution brief (step 3 of `PROMPT.md`), in the plan's own format: task 5 = per-person accounts on Supabase (invite/provision, revoke, session, export audit trail; `rate-limit.mjs` pattern survives, `verifyPassword`/`signSession` do not — `specs/02` §Consequences row 5). Task 9 = one Vercel project, one DNS record, Deployment Protection OFF, `DASHBOARD_PROJECT` becomes UI state (row 9).
2. Plan tasks 1–2 (schema + sync) once **G1** clears — schema keeps every column; enforcement lives in the query tier, not the sync (row 1–2).
3. Plan tasks 3–4 (scaffold + data layer) — as written.
4. Approved task-5 re-plan (auth) — buildable pre-gate with a seeded dev account; real accounts await **G4**.
5. Plan tasks 6–8 amended: sheet without show-all/`raw`, whitelist server-enforced, project switcher in, Pools out, Sources stays (it is the provenance story the client came for).
6. Plan task 7 export: 10K cap, whitelist columns, audit-logged per account.
7. Task-9 re-plan (deploy) once **G2–G4** clear; then plan task 10 (pack sync + ritual).

## Open decisions
- Account mechanism detail (Supabase Auth vs. own accounts table + server sessions) — **owner of the re-plan decides in the execution brief**; constraint: browser still never holds a Supabase key.
- Hostname — **founder decides at G3**.
- Everything else carries a **[default]** in `00 §Gates`.

## Verification
Plan's per-task test cycles + the seven walkable criteria in `00 §Success criteria`. Regressions: local dashboard serves its five tabs untouched · root `vercel.json` and site build unaffected (`pnpm build` at root) · `emails/.gitignore` wall intact (no data file staged, ever) · export audit rows appear per download.

## Risks
- **Spec-vs-plan drift is designed-in** — the §Consequences table is the reconciliation; treat any other divergence as plan-drift (follow code, log it).
- Supabase free tier pauses ~1wk idle — sync detects and names the restore path; pair syncs with the Friday ops loop.
- Generations move daily — conservation check compares live files, never frozen counts.
- GateGuard hooks intercept first writes per file — answer the four facts, retry identically.
- Parallel sessions may land the extension tabs locally mid-build — recon step 2 re-checks `dashboard.html:288`/`349` before assuming `01`'s discrepancy still holds.
