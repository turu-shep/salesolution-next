# dashboard — build and deploy the contacts dashboard

Your mission: ship the industrial contact asset as a **client-facing** Next.js app on Vercel — **one** deployment behind **per-person logins**, with a Field Advisor / Hosebox project switcher, a locations sheet with honest provenance, and CSV export over a Supabase copy of the 12 current CSV files.

## Read first, in order

1. `../../../../docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` —
   **the plan IS the work.** Ten tasks, every file path, every command, every
   line of code. Start there and stay there.
2. This folder's `00-README.md`, `01-vercel-transfer.md` and `02-client-view.md`
   — the **why**. Read them for the reasoning behind a decision you are tempted
   to change, not for instructions. **`02`'s AMENDMENT 2 wins** wherever any of
   them disagree — including over `02`'s own AMENDMENT 1, which it supersedes:
   **client-facing audience, one deployment with an in-app Field Advisor /
   Hosebox switcher, per-person logins with Vercel Deployment Protection OFF,
   `dfs`-only rows kept as accepted risk, Apollo and all person/sendable fields
   removed, the 14-column whitelist enforced server-side with no show-all toggle
   and no `raw` panel, export capped at 10,000 and whitelist-bounded, Smartlead
   still excluded.** `02` §"Consequences for the implementation plan" names the
   four plan tasks that change (5 and 9 need re-planning; 6 and 8 need amending).
3. The plan's **"Spec conflicts resolved before Task 1"** table, before you
   "fix" anything back. Eleven places where the specs and the real data disagree
   already have a decision, with the reason attached.

## Execute it

Use **superpowers:subagent-driven-development** (recommended — a fresh subagent
per task, review between tasks) or **superpowers:executing-plans** (inline, with
checkpoints). Every task is TDD: failing test, run it fail, minimal
implementation, run it pass, commit.

## What only Artur can do

Four gates. The plan marks each one `GATE (founder)` at the step it blocks, and
the engineer stops there if it is unmet.

1. **Supabase project + keys** (Task 1) — create a free-tier project in the
   closest US region; put `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and
   `SUPABASE_ANON_KEY` in `.env.local`. **The first blocker: no code runs
   without it.**
2. **One Vercel project** (Task 9, re-planned) — a single deployment importing
   this repo with Root Directory `apps/contacts-dashboard`, and **Deployment
   Protection → OFF**. The client holds no Vercel seat, so team authentication
   is a door they cannot open, not a wall. The login is the wall.
3. **One DNS record** (Task 9, re-planned) — a single host at the
   `salesolution.net` registrar. Wait for "Valid Configuration" and a live
   certificate before testing. The two env-pinned subdomains are gone; project
   selection happens in the app.
4. **The initial account list** (Task 5, re-planned) — which named people at the
   client get a login, and their addresses. Plus one
   `CONTACTS_DASHBOARD_SESSION_SECRET`, distinct from `SALES_PASSWORD`. There is
   no shared house password any more: revoking one viewer must not disturb the
   rest, and an export needs a name attached to it.

## When this session's work lands

1. Add the `## Deployed` section to `./00-README.md` — the three URLs, which
   view each opens on, who holds which password, and the sync command.
2. Update the STATUS banners in `./00-README.md`, `./01-vercel-transfer.md` and
   `./02-client-view.md` to BUILT, pointing at `§Deployed`.
3. Sync the pack: one paragraph in `emails/README.md` §Dashboard, one bullet in
   `docs/strategy/industrial-email-campaign/06-process-runbook.md` §"The weekly
   loop — every Friday" pinning `node emails/scripts/sync-supabase.mjs`, and a
   note in `../99-hygiene.md` if this created anything to clean.
4. **Do NOT rename this folder to carry a status.** The Sources tab parses
   `^(.+) \[([A-Z-]+)\]$` over this pack's directories; `dashboard [BUILT]`
   would register a phantom source token named `dashboard` with zero rows,
   forever. The regex is why the folder name is boring. Keep it boring.
