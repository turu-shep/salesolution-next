# Contacts dashboard deploy — handoff package

**Written:** 2026-08-08, against `fix/security-2026-07-24` @ `2710c21`. HEAD is unstable (parallel sessions move `emails/` daily) — the drift re-check in `PROMPT.md` step 2 is mandatory at execution start. Execute with `PROMPT.md` in this folder.

First Salesolution package under `.claude/rules/handoff-packages.md`. Layer map: `specs/` is the why (decision history — **`specs/02-client-view.md` §AMENDMENT 2 wins every conflict in this folder**; `specs/00-tab-specs.md` holds the tab requirements), the plan is the how, this package is the runnable.

## Mission
Deploy the location asset as a **client-facing** dashboard on one Vercel URL with per-person logins: a locations sheet with per-row source provenance ("where we got and verified this"), brand/state filters, an in-app Field Advisor ⇄ Hosebox switcher, and whitelisted CSV export — over a Supabase copy of the current-generation CSVs. Why now: both client projects are active and the asset is reachable only via the founder's loopback cockpit. What breaks today: clients have no view at all, and the send-side fields they must never see sit one grep away from the location data they need.

## Scope
**IN:** 1. Supabase schema + deny-all RLS · 2. `emails/scripts/sync-supabase.mjs` (conservation check) · 3. `apps/contacts-dashboard/` scaffold · 4. per-person auth: invite/provision, revoke, export audit trail (plan task 5 **re-planned** — largest new build) · 5. locations sheet: 14-column server-enforced whitelist, source chips, provenance expander, filters (source/brand, state, US/Non-US, category range, name), three counters (Locations · Brands · States) · 6. Sources view + project switcher · 7. CSV export (whitelist columns, 10K cap, logged per account) · 8. one deployment, one DNS record.
**OUT:** Smartlead (every revision, key-security) · show-all toggle + `raw` panel (deleted — a client leak one click deep) · Pools tab (founder vocabulary) · companies/people/sendable counters · Apollo + every person-level field · internal all-columns deployment (**[default]** dropped; say so and it returns behind its own role) · category-label + country columns (pipeline tasks, own issues) · the local five-tab cockpit (untouched).

## Gates
- **G1** Supabase project + `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` in `.env.local` + Vercel env (blocks plan tasks 1–2).
- **G2** One Vercel project, root `apps/contacts-dashboard/`, **Deployment Protection OFF** (clients hold no Vercel seat).
- **G3** One DNS record — founder also picks the hostname (e.g. `locations.salesolution.net`).
- **G4** The initial account list (client viewers + founder), delivered out-of-band — never in chat or git.
- **[default]**, taken and logged: `dfs`-only rows stay (founder accepted the risk 2026-08-07 — ~44% of seated; the remedy filter must stay implementable: `source` queryable per-token, server-side) · Supabase region us-east-1 · provenance wording "Verified from the {Brand} distributor locator, {Mon YYYY}".

## Linear
**Unreachable at write time (token expired 2026-08-08)** — no IDs invented; re-auth via claude.ai connector settings or `/mcp`. At execution: search team SAL for "dashboard", "contacts", "supabase" before minting **"Deploy client locations dashboard (Supabase + Vercel, per-person logins)"**. One package = one issue = one PR to `main`.

## Success criteria
1. The URL → login page → named account in → sheet renders with Locations · Brands · States counters; no sendable/people numbers anywhere.
2. Switcher flips Field Advisor ⇄ Hosebox and the sheet re-filters.
3. Filter brand=Enerpac + state=TX → rows shrink; a multi-list row shows all its source chips; the expander links `source_url` + capture date.
4. Export → CSV rows = on-screen count, columns = the 14 whitelist only, and the export is logged with the account identity.
5. Direct API request for `raw`, an Apollo field, or another project's data → server refuses (not UI-hidden).
6. Supabase anon-key select → permission denied. Revoked account → sign-in fails.
7. Second sync run → conservation PASS, zero diff; local `pnpm emails:dashboard` five tabs untouched.

## Context loading
In order: `specs/02-client-view.md` §AMENDMENT 2 + §Consequences (the law) → `docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` (the work — **stale where the Consequences table says so**) → `01-current-state.md` + `02-implementation-direction.md` → `specs/00-tab-specs.md` (tab requirements; Pools excluded) → `emails/scripts/lib/dashboard-data.mjs` → `lib/sales/auth.ts` trio (pattern reference only; task 5 replaces it) → `.claude/rules/handoff-packages.md` + `.claude/rules/plan-drift.md`.
