# 01 — Current state (verified 2026-08-08, fix/security-2026-07-24 @ 2710c21)

**Local dashboard** — five tabs only: registry at `emails/scripts/dashboard.html:288` (`{ id: 'overview' … }`), loaders at `:349` (`overview, list, pools, smartlead, reports`). Loopback-bound, read-only, rails in `emails/scripts/dashboard.mjs` header. **Discrepancy, recorded:** `specs/00-tab-specs.md`'s banner claims "Phase 3 (Everything) is built in the local dashboard" — at this commit no `everything` tab, no `unifyByDomain`, no `currentGeneration` exist (`dashboard.html` and `lib/dashboard-data.mjs` greps return comments only). Treat the extension tabs as **not built**; if a worktree holds that work, your recon will find it — do not assume it.

**Specs** — `specs/02-client-view.md` carries the full decision chain: original client-facing spec → AMENDMENT 1 (internal-only) → **AMENDMENT 2 (client-facing again, wins)** with the plan-delta table at §Consequences. `specs/01-vercel-transfer.md` is the base transfer spec (Supabase, sync, scaffold — still valid where the amendment doesn't touch it). `specs/00-tab-specs.md` holds the tab requirements (Pools excluded from client surface). `specs/03-prompt-legacy.md` is the superseded pre-rule prompt.

**Plan** — `docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` (committed `75c6cc0`): 10 TDD tasks with real code. **Written against AMENDMENT 1 — stale by design where §Consequences says**: tasks 5 (auth) and 9 (deployment) are RE-PLAN; 6/7/8 amended; 1–4, 10 stand.

**Data** — current seated generation `emails/lists/seated-v9.csv` at write; generations move daily — every count is compare-live, never a frozen literal. Verify ledger: `emails/data/verify-results.csv`. All list/pool CSVs gitignored (`emails/.gitignore`) — **hard guard, do not weaken**.

**Auth pattern** — `lib/sales/auth.ts`, `app/sales/layout.tsx`, `app/api/sales/login/route.ts`: layout-gate + login POST + HMAC session. Reference only — AMENDMENT 2 replaces this shape with per-person accounts; `rate-limit.mjs` pattern survives.

**Absent** — no `apps/` directory; no `SUPABASE_*` keys in `.env.local`; no `emails/data/projects/`; Linear MCP token expired.

**Hard guards** — `category_core` is a numeric weighted count, never render as a label (range filter only) · no real `country` column anywhere (US/Non-US is derived from pool membership) · the `dashboard/` folder is never renamed with a status suffix (the Sources-tab dirname regex `^(.+) \[([A-Z-]+)\]$` would parse it as a source token) · `source` must stay queryable per-token server-side (the dfs-remedy filter depends on it).
