# Contacts Dashboard Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ⚠ **STALE IN PARTS (2026-08-08):** written against AMENDMENT 1 (internal, three URLs).
> AMENDMENT 2 in `emails/handoff/industrial-contact-list/dashboard/specs/02-client-view.md`
> reversed the audience to client-facing — its §Consequences table governs: tasks 5 and 9
> are RE-PLAN, tasks 6/7/8 amended, tasks 1–4 and 10 stand. Execute only via the package
> at `emails/handoff/industrial-contact-list/dashboard/PROMPT.md`, which carries the deltas.

**Goal:** Deploy the industrial contact asset as an internal, password-gated Next.js app on Vercel — a locations sheet with honest provenance and CSV export over a Supabase Postgres copy of the 12 current CSV files, on three URLs.

**Architecture:** A new independent package at `apps/contacts-dashboard/` (Next.js App Router, its own `package.json` and lockfile, no pnpm workspace) reads Supabase server-side with the service-role key; the browser never touches Supabase. A manual Node script, `emails/scripts/sync-supabase.mjs`, full-replaces the database from the CSVs on disk through a staging table and a promote function, with a conservation check that exits non-zero on any mismatch. The repo root — `package.json`, `vercel.json`, the main site — is not touched at all.

**Tech Stack:** Next.js 16.2.6 (App Router, React 19.2.4), TypeScript 5, `@supabase/supabase-js` v2 (`createClient`), Supabase Postgres (free tier), Node 20 stdlib for the sync (`node:fs`, `node:crypto`, bare `fetch` against PostgREST — zero new root dependencies), `node --test` for tests, pnpm.

## Global Constraints

Every task's requirements implicitly include this section.

- **Env var names, exact, no others:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_MODE`, `DASHBOARD_PROJECT`, `CONTACTS_DASHBOARD_PASSWORD`, `CONTACTS_DASHBOARD_SESSION_SECRET`. One extra, local-only and never set in Vercel: `SUPABASE_ANON_KEY`, read **only** by `apps/contacts-dashboard/supabase/anon-check.mjs`.
- **No `NEXT_PUBLIC_` variable of any kind exists in this app.** `grep -rn "NEXT_PUBLIC" apps/contacts-dashboard/` must print nothing. An anon key in client JS is public, permanently, to anyone who opens devtools.
- **RLS is deny-all with zero policies on every table, and grants are revoked from `anon` and `authenticated` as well.** `service_role` bypassing RLS is the only path, and it is used server-side only — server components and route handlers reading `process.env`.
- **The browser never talks to Supabase.** No client component imports `lib/supabase.ts`.
- **No Smartlead anywhere.** No import, no tab, no env var, no fetch. `grep -rni "smartlead" apps/contacts-dashboard/` must print nothing.
- **14-column default view + show-all toggle.** The default select list is these 15 identifiers verbatim (`company` and `company_display` render as one "Company" column, which is why 15 identifiers make 14 visible columns): `company`, `company_display`, `address_1`, `city`, `state`, `zip5`, `phone_e164`, `domain`, `category_core`, `brand_authorized`, `line_card`, `source`, `source_url`, `captured`, `location_count`.
- **Export cap 10,000 rows.** Over the cap the export refuses with `That's more than 10,000 locations. Narrow the filter and try again.` and downloads nothing. It never truncates — a truncated CSV looks complete.
- **PII never enters git.** Migrations are committed; data never is. `apps/contacts-dashboard/.gitignore` covers `.env*`, `*.csv`, `/data/`, `.next/`, `node_modules/`. `emails/.gitignore` already excludes `data/`, `lists/`, `exports/` and stays that way. Data files are gitignored and stay gitignored.
- **`apps/contacts-dashboard/` is the only new root.** No edit to the root `package.json`, no `pnpm-workspace.yaml`, no edit to the root `vercel.json` (it carries the main site's sitemap cron and must keep working). Vercel's Root Directory setting handles the subdirectory natively.
- **The app imports nothing from outside its own directory.** With Root Directory set to `apps/contacts-dashboard`, files above it are not in the build context, so an import of `emails/scripts/lib/contract.mjs` compiles locally and fails on Vercel. This is why `csvCell` exists in both packages: it is a forced duplication of eight lines across a package boundary, not an oversight. The sync script, which lives in the root package, imports the emails helpers freely — the boundary runs one way.
- **pnpm.** All installs and builds run from inside `apps/contacts-dashboard/`.
- **Next.js App Router**, standard APIs only. `@supabase/supabase-js` v2 `createClient(url, key)`. Do not invent APIs.
- **No `dangerouslySetInnerHTML` anywhere.** `grep -rn "dangerouslySetInnerHTML" apps/contacts-dashboard/` must print nothing. `self_declaration_verbatim` is scraped, untrusted, and carries embedded newlines.
- **Node is v20.16.0.** Node 20 cannot run `node --test` over `.ts`. All unit-tested logic lives in `.mjs` files with co-located `*.test.mjs`; `.ts`/`.tsx` is only the Next-facing layer. TypeScript reaches the `.mjs` modules through `"allowJs": true`.
- **The paused-project message is this exact string, in both packages:** `project paused — restore it in the Supabase dashboard`. A raw `ECONNREFUSED` or `fetch failed` sends an operator hunting a bug that isn't there.
- **Full replace, never merge.** The `contacts` table holds exactly one generation at a time.
- **No `model:` or `effort:` overrides in any agent call**, agent frontmatter, or workflow stage. The environment already routes them.
- **Branch:** all work happens on `feat/contacts-dashboard`, cut from the current branch. Commit at the end of every task with the exact command given.

## Spec conflicts resolved before Task 1 — do not "fix" these back

> ⚠️ **SUPERSEDED IN PART — `02-client-view.md` AMENDMENT 2 (2026-08-07, later the same day) reverses the audience back to client-facing.** Read `02` §AMENDMENT 2 and §"Consequences for the implementation plan" **before Task 1**. Tasks 1–4, 7 and 10 stand. **Task 5 (auth) and Task 9 (deployment) need re-planning**; Tasks 6 and 8 need amending. In one line: one deployment instead of three, an in-app Field Advisor / Hosebox switcher instead of two env-pinned subdomains, per-person logins instead of a shared password behind Vercel Authentication, Apollo and every person/sendable field removed, the 14-column whitelist enforced server-side with the show-all toggle and `raw` panel deleted, and `dfs`-only rows kept as founder-accepted risk. The paragraph below is the pre-reversal rule, kept for the record.

~~`02-client-view.md`'s **2026-08-07 amendment wins** over both its own original body and `01-vercel-transfer.md` wherever they disagree: internal-only audience, all data including Apollo and `dfs`, the two-wall door, the 14-column default with a show-all toggle, export capped at 10,000, two env-pinned subdomains, Smartlead still excluded.~~

These eleven were found checking the specs against the real data and the real house code. Each has a decision. If a task looks like it needs one reversed, re-read this table first.

| # | What the spec says | What is actually true | Decision |
|---|---|---|---|
| 1 | `01` T2.1 lists `POOL_FILE` among the resolver exports to reuse | `POOL_FILE` is a module-level const in `dashboard-data.mjs`, **not exported** | The sync imports `resolveRegistry`, `currentList`, `latestPools` only. `latestPools` already applies `POOL_FILE` internally and compares versions numerically. Never import `POOL_FILE` — it resolves to `undefined`. |
| 2 | `01` T1.2 DDL has `captured date` | `captured` is a **pipe chain** on real rows (`2026-08-01\|2026-08-03`), and `source` / `captured` chain lengths disagree on 1,089 of 2,773 seated rows | Store `captured text` verbatim **plus** a derived `captured_date date` (earliest parseable date in the chain) for sorting. Zip source↔captured per token only when the chains are the same length; otherwise every provenance line uses `captured_date`. |
| 3 | `02` treats `category_core` as a token with a `CATEGORY_LABELS` display map | `category_core` is a **numeric weighted count of core industrial codes** (`1.5`, `4.5`, `6.5`…) — there is nothing to map | The category control ships as a **numeric min/max range** on `category_core`, labeled *Core-category score — weighted count of core industrial codes, not a category name*. `CATEGORY_LABELS` is dropped. A real category-label column is a pipeline task, not a display task; say so rather than guessing. |
| 4 | `01` T1.2's typed columns | They predate `02`'s locations sheet and are missing 11 of the 15 default columns (`company`, `address_1`, `city`, `zip5`, `phone_e164`, `category_core`, `brand_authorized`, `line_card`, `source`, `source_url`, `location_count`) | The `contacts` DDL is `01`'s typed columns **plus** every column the default view renders, sorts, filters or exports. This is the spec's own promotion rule applied. |
| 5 | `01` T2.2 `delete from contacts where list_generation = $1` | Deleting only the incoming generation strands the **previous** one forever when the name advances (v9 → v10) — the exact "rows from a generation nobody can name" failure the rule exists to prevent | Full replace of the table. `sync_promote` deletes every row and inserts the staged generation in one transaction. The table holds one generation; the app never filters by generation. |
| 6 | `01` T2.2 `begin; … commit;` | PostgREST cannot run a multi-statement transaction, and adding a Postgres driver would be a new root dependency | Two unlogged staging tables (`contacts_staging`, `verify_results_staging`) plus a `sync_promote()` SQL function. Batched inserts land in staging; the promote is one implicitly-transactional function call. |
| 7 | `01` T4.1 names `lib/auth.ts` | Node 20 cannot `node --test` a `.ts` file, and the auth primitives are the code most worth testing | `apps/contacts-dashboard/lib/auth.mjs`. The F-003 grep in Verification targets the real path. |
| 8 | The task skeleton says "unauthenticated request redirects" | `01` T4.1 is explicit that the house gate is **not** a redirect — the layout renders the login form in place, which is what avoids the redirect loop | Layout renders the form in place; **route handlers return 401**. Both are verified. |
| 9 | The task skeleton says the scaffold ships a "health page" | `01` T4.3: "There is no health endpoint … no debug route that skips the check" | Task 3 ships a **server-rendered page** at `/` that Task 6 replaces with the sheet. No `/api/health`, ever. |
| 10 | `02` amendment uses `DASHBOARD_PASSWORD` / `DASHBOARD_SESSION_SECRET`; `01` uses `CONTACTS_DASHBOARD_*` | Two names for one slot means a two-name lookup and a rotation nobody finishes | One name wins: `CONTACTS_DASHBOARD_PASSWORD` and `CONTACTS_DASHBOARD_SESSION_SECRET`, with a **different value per deployment**. Distinct passwords are a value rule, not a name rule. |
| 11 | `01` T3.3 wants size-proxy filters with the "revenue data does not exist yet" caption | `02`'s amendment scopes the build to five filters and says tier/size/verification/disposition filters "are simply not in this build" | Five filters ship: source/brand, state, country, core-category range, name search. No size filter, so the proxy caption has nothing to caption. **The no-revenue rule still binds** and is grep-verified: no element anywhere is labeled "revenue". |
| 12 | `01` T3.2: "There is no full-dump endpoint and **no CSV-export endpoint** in v1. Not disabled, not behind a flag — not written." | `02`'s amendment flips that row explicitly: export exists on all three deployments, capped at 10,000, and `ss-contacts` "**gains the export** it was denied" | **Task 7 ships the export.** Do not delete it on the strength of `01` T3.2. The **full-dump** half of that rule still stands: there is no endpoint that returns everything, and the export is capped and refuses over the cap. |
| 13 | `02` says `lat`, `lng`, `tier_raw` and `distributor_type` are "reachable under the show-all toggle" | None of the four is a typed column — they live in the CSV, so they land in `raw` | They are reachable, through the **per-row `raw` panel** that show-all opens, which is exactly what `raw` is for. They are not promoted to typed columns until someone wants to filter or sort on one. Promotion is a one-line change to `TYPED_COLUMNS` plus a sync re-run. |
| 14 | `02` C1.4 amended acceptance: "A request for a column that does not exist returns 400; a request for any real column succeeds." | A silent fallback to a default sort would satisfy nobody — a request for a removed column is either a bug or someone probing, and both deserve a line in the log | The **sheet** falls back to a real sort column (a bad URL should still render). The **export route** answers `400` and logs it, which is where the acceptance check runs. |

---

### Task 1: Supabase schema as committed SQL

**Files:**
- Create: `apps/contacts-dashboard/supabase/migrations/0001_init.sql`
- Create: `apps/contacts-dashboard/supabase/migrations/0002_functions.sql`
- Test: `apps/contacts-dashboard/supabase/anon-check.mjs`

**Interfaces:**
- Consumes: nothing (first task).
- Produces — tables `contacts`, `verify_results`, `sources_registry`, `projects`, `project_status`, `contacts_staging`, `verify_results_staging`; functions with these exact signatures, called by later tasks:
  - `sync_reset() returns void`
  - `sync_promote(p_generation text) returns table (contacts_rows bigint, verify_rows bigint)`
  - `contacts_counters(p_sources text[], p_states text[], p_country text, p_cat_min numeric, p_cat_max numeric, p_q text) returns table (companies bigint, no_domain bigint, people bigint, sendable bigint, locations bigint, brands bigint, states bigint)`
  - `source_stats() returns table (token text, rows bigint, domains bigint, sole_source bigint, with_email bigint, with_domain bigint, with_person bigint, last_captured date)`
  - `pool_stats() returns table (pool text, rows bigint, domains bigint)`

- [ ] **Step 1: Cut the branch**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git checkout -b feat/contacts-dashboard
```

- [ ] **Step 2: GATE (founder) — Artur creates the Supabase project**

Nothing below runs until this is done. Stop here if it is not.

1. <https://supabase.com/dashboard> → **New project**, free tier. Region: **the closest US region to Artur**. This is set once — changing it later means a new project.
2. Project → **Settings → API**. Copy three values:
   - **Project URL** → `SUPABASE_URL`
   - **`service_role` secret** → `SUPABASE_SERVICE_ROLE_KEY`
   - **`anon` public key** → `SUPABASE_ANON_KEY`
3. Append all three to `/Users/artur/Documents/Projects/Salesolution new/.env.local` (gitignored). Format, one per line, no quotes needed:

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```

4. Paste `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` **nowhere else yet** — the Vercel projects come in Task 9. `SUPABASE_ANON_KEY` never leaves `.env.local`.

**Free-tier facts, stated here so nobody discovers them at 11pm:** 500 MB database (this generation lands around 70 MB, most of it the `raw` JSONB); **projects pause after ~1 week of inactivity**; a paused project needs a **manual** restore in the dashboard — there is no API for it. The weekly sync is what keeps it warm.

- [ ] **Step 3: Write the failing test — the anon-key check**

This is the test that matters most in the whole handoff. Zero dependencies: bare `fetch` against PostgREST.

Create `apps/contacts-dashboard/supabase/anon-check.mjs`:

```js
/**
 * anon-check — proves the anon key can read nothing.
 *
 * RLS is enabled with zero policies and the table grants are revoked, so every
 * table must answer an anon-key select with a permission error or an empty set.
 * Run it after every migration change and paste the output into the session log.
 *
 *   node apps/contacts-dashboard/supabase/anon-check.mjs
 *
 * Reads SUPABASE_URL + SUPABASE_ANON_KEY from .env.local. The anon key lives in
 * .env.local ONLY — it is never set in Vercel and the app never reads it.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const TABLES = [
  'contacts',
  'verify_results',
  'sources_registry',
  'projects',
  'project_status',
  'contacts_staging',
  'verify_results_staging',
]

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY — add both to .env.local (repo root).')
  process.exit(1)
}

let leaked = 0
for (const table of TABLES) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  const body = await res.text()
  const rows = res.ok ? JSON.parse(body) : null
  const open = res.ok && Array.isArray(rows) && rows.length > 0
  if (open) leaked++
  console.log(`${table.padEnd(24)} HTTP ${res.status}  ${open ? 'LEAKED ROWS' : 'no rows'}  ${body.slice(0, 120)}`)
}

console.log(leaked === 0 ? '\nPASS — anon reads nothing.' : `\nFAIL — ${leaked} table(s) returned rows to the anon key.`)
process.exit(leaked === 0 ? 0 : 1)
```

- [ ] **Step 4: Run the check to see it fail**

Run: `node "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard/supabase/anon-check.mjs"`
Expected: every line prints `HTTP 404` with a PostgREST body like `{"code":"42P01","message":"relation \"public.contacts\" does not exist"}`. The tables do not exist yet, so nothing is proven yet — the run confirms the script reaches the project and authenticates.

- [ ] **Step 5: Write `0001_init.sql`**

Create `apps/contacts-dashboard/supabase/migrations/0001_init.sql`:

```sql
-- 0001_init.sql — schema for the contacts dashboard.
--
-- APPLY: paste this whole file into the Supabase SQL editor and press Run.
-- Migrations are committed. Data never is.
--
-- Re-running is a no-op: every object is IF NOT EXISTS and the seeds are
-- ON CONFLICT DO NOTHING. The explicit transaction means a failure rolls the
-- whole thing back rather than leaving half a schema.

begin;

-- ── contacts ────────────────────────────────────────────────────────────────
-- Typed columns carry the filters, the sort keys and the default view.
-- `raw` carries the drift: generations have run 23 -> 56 columns and will keep
-- moving. A new column in generation N+1 needs NO migration — it lands in
-- `raw`, the details panel renders it, and it is promoted to a typed column
-- only when someone actually wants to filter or sort on it.
create table if not exists contacts (
  id               text primary key,             -- '<list_generation>:<pool>:<row_index>'
  list_generation  text not null,                -- 'seated-v9', and the pools synced with it
  pool             text not null,                -- 'seated' | 'chains' | 'non-us' | ...
  company          text,                         -- normalized key; sort stability
  company_display  text,                         -- the human form
  domain           text,                         -- lowercased, no 'www.', NULL when absent
  address_1        text,                         -- single line; there is no address_2
  city             text,
  state            text,
  zip5             text,                         -- not `zip`; no column named `zip` exists
  phone_e164       text,                         -- E.164; render formatted, store as-is
  category_core    numeric,                      -- weighted count of core industrial codes
  brand_authorized text,                         -- pipe chain
  line_card        text,                         -- pipe chain, sparse
  source           text,                         -- pipe chain, verbatim
  source_url       text,                         -- pipe chain, verbatim
  captured         text,                         -- pipe chain, verbatim ('2026-08-01|2026-08-03')
  captured_date    date,                         -- earliest parseable date in the chain; sort key
  location_count   text,                         -- the COMPANY'S OWN CLAIM. Never summed.
  segment          text,
  tier             text,
  cohort           text,
  icp_class        text,
  size_band        text,
  rank_score       numeric,
  disposition      text,
  source_tokens    text[] not null default '{}', -- the pipe chain, split
  email            text,
  email_state      text,                         -- from the CSV's contact_email_status
  has_person       boolean not null default false,
  raw              jsonb not null                -- the full row, every column, as read
);

create index if not exists contacts_generation_idx on contacts (list_generation);
create index if not exists contacts_domain_idx     on contacts (domain);
create index if not exists contacts_pool_idx       on contacts (pool);
create index if not exists contacts_state_idx      on contacts (state);
create index if not exists contacts_segment_idx    on contacts (segment, tier);
create index if not exists contacts_category_idx   on contacts (category_core);
create index if not exists contacts_sources_idx    on contacts using gin (source_tokens);
create index if not exists contacts_raw_idx        on contacts using gin (raw jsonb_path_ops);

-- `domain` stays nullable on purpose. ~9,006 rows carry no domain. They must not
-- collapse into one company and must not be dropped: they are individual rows
-- with `domain is null`, counted separately everywhere.

-- ── verify_results ──────────────────────────────────────────────────────────
-- NO unique constraint on `email`, deliberately. The seated verdict quartet sums
-- to 1,467 against 1,466 seated emailed rows — a +/-1 that is probably one
-- duplicate-email row. A primary key on `email` would let an upsert quietly
-- absorb it, which is exactly the discrepancy we want surfaced. The sync prints
-- a duplicate-email count instead.
--
-- An email with no row here has verdict NULL, never 'unknown'. `unknown` is a
-- real NeverBounce verdict held by ~770 rows; merging them turns "we have not
-- checked" into "we checked and could not tell."
create table if not exists verify_results (
  id             bigserial primary key,
  email          text not null,
  result         text not null,             -- valid | catchall | unknown | invalid | disposable
  flags          text,
  verified_date  date
);
create index if not exists verify_results_email_idx on verify_results (lower(email));

-- ── sources_registry ────────────────────────────────────────────────────────
-- Written by the sync script, never by hand. Two status columns because the two
-- disagree sometimes, and a disagreement is a defect worth showing, not a tie to
-- break. Folder title wins for display; both are stored; the tab renders a
-- warning chip naming both values.
create table if not exists sources_registry (
  token       text primary key,   -- 'dfs', 'ptda', 'adaptall'
  status      text,               -- from the FOLDER TITLE — what the founder reads
  status_row  text,               -- from the section-5 registry row in the pack README
  folder      text,               -- 'dfs [DONE-DEEP]', displayed as text, never fetched
  raw_rows    integer,
  seated      integer,
  last_pull   date,
  est_left    text,               -- free text: '~400', 'unknown', ''
  synced_at   timestamptz not null default now()
);

-- ── projects + project_status ───────────────────────────────────────────────
-- `criteria` keeps the same shape as the old criteria.json: base, filters[],
-- columns[], counts, optional note. The validation rules come across unchanged:
-- unknown `field` skips the filter and warns; unknown `op` renders the whole
-- project misconfigured. A filter that quietly does nothing is how a project
-- ships to 12,000 companies it never meant to touch.
create table if not exists projects (
  name         text primary key,   -- 'catalog-ai'
  description  text,
  criteria     jsonb not null
);

-- `status` is FREE vocabulary. Never validated against an enum, never suggested.
create table if not exists project_status (
  project  text not null references projects(name) on delete cascade,
  domain   text not null,
  status   text not null,
  note     text,
  updated  date,
  primary key (project, domain)
);

-- ── staging ─────────────────────────────────────────────────────────────────
-- PostgREST cannot run a multi-statement transaction and this repo takes no new
-- root dependencies, so batched inserts land here and `sync_promote()` moves
-- them across in one implicitly-transactional function call.
create unlogged table if not exists contacts_staging (like contacts including defaults);
create unlogged table if not exists verify_results_staging (
  email          text not null,
  result         text not null,
  flags          text,
  verified_date  date
);

-- ── seeds ───────────────────────────────────────────────────────────────────
-- Two profiles. NO project_status rows: an empty status set reads as "nobody has
-- done anything," which is a different claim from "nothing recorded yet."
insert into projects (name, description, criteria) values
  ('catalog-ai',
   'The IND-C1 working view: seated rows the catalog angle is written for.',
   '{"name":"Catalog AI","base":"seated","filters":[{"field":"ecommerce_class","op":"eq","value":"catalog_no_cart"},{"field":"cohort","op":"neq","value":"E"}],"columns":"LOCATION_COLUMNS","counts":"companies"}'::jsonb),
  ('small-shops',
   'Artur''s separate small-shops project. Sub-floor by size proxy, not waste.',
   '{"name":"Small shops","base":"pool:small-shops","filters":[],"columns":"LOCATION_COLUMNS","counts":"companies","note":"Row count is not trusted yet. The pool went 431 to 2,818 lines between v6 and v7 (6.5x) with no cause in the written record. See handoff/industrial-contact-list/99-hygiene.md H4 before building on this count."}'::jsonb),
  ('field-advisor',
   'Field Advisor lens over the full pool.',
   '{"name":"Field Advisor","base":"everything","filters":[],"columns":"LOCATION_COLUMNS","counts":"locations","note":null}'::jsonb),
  ('hosebox',
   'Hosebox lens over the full pool.',
   '{"name":"Hosebox","base":"everything","filters":[],"columns":"LOCATION_COLUMNS","counts":"locations","note":null}'::jsonb)
on conflict (name) do nothing;

-- ── RLS: deny-all, everywhere ───────────────────────────────────────────────
-- No policies are created. RLS enabled with zero policies denies every row to
-- anon and authenticated. service_role bypasses RLS — that is the only path.
-- No anon policies, ever. Not "read-only for anon", not "just the counts".
alter table contacts               enable row level security;
alter table verify_results         enable row level security;
alter table sources_registry       enable row level security;
alter table projects               enable row level security;
alter table project_status         enable row level security;
alter table contacts_staging       enable row level security;
alter table verify_results_staging enable row level security;

-- Both layers, because PostgREST honors table grants AND RLS, and a future
-- migration that adds a table without thinking about it should fail closed.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

commit;
```

- [ ] **Step 6: Write `0002_functions.sql`**

Create `apps/contacts-dashboard/supabase/migrations/0002_functions.sql`:

```sql
-- 0002_functions.sql — the five functions the sync and the app call.
--
-- APPLY: paste this whole file into the Supabase SQL editor and press Run.
-- Safe to re-run: every function is CREATE OR REPLACE.

begin;

-- ── sync_reset ──────────────────────────────────────────────────────────────
-- Clears staging before a run. PostgREST cannot express an unfiltered DELETE,
-- so the sync calls this instead of trying.
create or replace function sync_reset() returns void
language sql
as $$
  truncate contacts_staging;
  truncate verify_results_staging;
$$;

-- ── sync_promote ────────────────────────────────────────────────────────────
-- FULL REPLACE, in one transaction. Not an upsert, not a diff, not a merge.
-- The CSVs are the source of truth and they get rewritten wholesale between
-- generations; anything short of a full replace leaves rows from a generation
-- nobody can name. The table therefore holds exactly ONE generation.
create or replace function sync_promote(p_generation text)
returns table (contacts_rows bigint, verify_rows bigint)
language plpgsql
as $$
declare
  c_rows bigint;
  v_rows bigint;
begin
  -- `where true` is deliberate: Supabase runs pg-safeupdate on the PostgREST
  -- path, which rejects a WHERE-less DELETE even inside a function (21000,
  -- "DELETE requires a WHERE clause"). This is its sanctioned full-table form —
  -- the FULL REPLACE semantics above are unchanged.
  delete from contacts where true;
  insert into contacts select * from contacts_staging;
  get diagnostics c_rows = row_count;

  delete from verify_results where true;
  insert into verify_results (email, result, flags, verified_date)
    select email, result, flags, verified_date from verify_results_staging;
  get diagnostics v_rows = row_count;

  update contacts set list_generation = p_generation where list_generation is distinct from p_generation;

  truncate contacts_staging;
  truncate verify_results_staging;

  return query select c_rows, v_rows;
end;
$$;

-- ── contacts_counters ───────────────────────────────────────────────────────
-- Six counters plus the no-domain figure, over the WHOLE filtered set — never
-- over a page. `companies` and `sendable` are ~64x apart and both true, which is
-- the entire reason there are several counters and not one hero number.
--
-- The predicate here mirrors buildFilterSpec() in lib/query.mjs exactly. One
-- parse, two emitters: change one, change the other.
create or replace function contacts_counters(
  p_sources    text[]  default null,
  p_states     text[]  default null,
  p_country    text    default null,   -- 'us' | 'non-us' | null
  p_cat_min    numeric default null,
  p_cat_max    numeric default null,
  p_q          text    default null
)
returns table (
  companies bigint,
  no_domain bigint,
  people    bigint,
  sendable  bigint,
  locations bigint,
  brands    bigint,
  states    bigint
)
language sql
stable
as $$
  with filtered as (
    select c.*
    from contacts c
    where (p_sources is null or c.source_tokens && p_sources)
      and (p_states  is null or c.state = any(p_states))
      and (p_cat_min is null or c.category_core >= p_cat_min)
      and (p_cat_max is null or c.category_core <= p_cat_max)
      and (p_country is null
           or (p_country = 'non-us' and c.pool  = 'non-us')
           or (p_country = 'us'     and c.pool <> 'non-us'))
      and (p_q is null or p_q = ''
           or c.company_display ilike '%' || p_q || '%'
           or c.domain          ilike '%' || p_q || '%')
  )
  select
    (select count(distinct domain) from filtered where domain is not null),
    (select count(*)               from filtered where domain is null),
    (select count(*)               from filtered where has_person),
    (select count(*)               from filtered f
       where f.email is not null and f.email <> ''
         and exists (select 1 from verify_results v
                     where lower(v.email) = lower(f.email) and v.result = 'valid')),
    (select count(*)               from filtered),
    (select count(distinct t)      from filtered f, unnest(f.source_tokens) as t),
    (select count(distinct state)  from filtered where state is not null and state <> '');
$$;

-- ── source_stats ────────────────────────────────────────────────────────────
-- Per token: rows contributed, unique domains, and SOLE-SOURCE domains — what
-- would be lost if the source were dropped. Plus the fill it contributed and its
-- last capture date.
create or replace function source_stats()
returns table (
  token         text,
  rows          bigint,
  domains       bigint,
  sole_source   bigint,
  with_email    bigint,
  with_domain   bigint,
  with_person   bigint,
  last_captured date
)
language sql
stable
as $$
  with exploded as (
    select c.id, c.domain, c.email, c.has_person, c.captured_date,
           t.token, array_length(c.source_tokens, 1) as token_count
    from contacts c, unnest(c.source_tokens) as t(token)
  ),
  sole as (
    select domain, min(token) as token
    from exploded
    where domain is not null and token_count = 1
    group by domain
    having count(distinct token) = 1
  )
  select
    e.token,
    count(*)::bigint,
    count(distinct e.domain)::bigint,
    (select count(*) from sole s where s.token = e.token)::bigint,
    count(*) filter (where e.email is not null and e.email <> '')::bigint,
    count(*) filter (where e.domain is not null)::bigint,
    count(*) filter (where e.has_person)::bigint,
    max(e.captured_date)
  from exploded e
  group by e.token
  order by count(*) desc;
$$;

-- ── pool_stats ──────────────────────────────────────────────────────────────
create or replace function pool_stats()
returns table (pool text, rows bigint, domains bigint)
language sql
stable
as $$
  select c.pool, count(*)::bigint, count(distinct c.domain)::bigint
  from contacts c
  group by c.pool
  order by count(*) desc;
$$;

-- Functions are callable by their owner and by service_role. Nothing else.
revoke all on function sync_reset()                                                          from public, anon, authenticated;
revoke all on function sync_promote(text)                                                    from public, anon, authenticated;
revoke all on function contacts_counters(text[], text[], text, numeric, numeric, text)       from public, anon, authenticated;
revoke all on function source_stats()                                                        from public, anon, authenticated;
revoke all on function pool_stats()                                                          from public, anon, authenticated;

commit;
```

- [ ] **Step 7: Apply both migrations**

In the Supabase dashboard → **SQL Editor** → **New query**: paste the entire contents of `0001_init.sql`, press **Run**, confirm `Success`. Repeat with `0002_functions.sql`. This is a paste-into-the-SQL-editor step by design — there is no CLI login in this repo and none is being added.

- [ ] **Step 8: Run the anon check to verify it passes**

Run: `node "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard/supabase/anon-check.mjs"`
Expected: every one of the seven lines prints a permission error (`HTTP 401`/`403` with `{"code":"42501",...}`) or `HTTP 200 … no rows` with body `[]`, and the last line reads `PASS — anon reads nothing.` Exit code 0. **Paste this output into the session log** — it is the acceptance evidence for the whole handoff.

- [ ] **Step 9: Confirm the seeds and the grep guard**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
grep -rn "NEXT_PUBLIC" apps/contacts-dashboard/ ; echo "grep exit: $?"
```
Expected: no output, `grep exit: 1`.

In the Supabase SQL editor run `select name, criteria->>'note' from projects order by name;`
Expected: four rows — `catalog-ai`, `field-advisor`, `hosebox`, `small-shops` — with `small-shops` carrying its 6.5x caveat note verbatim and the other three `null`.

- [ ] **Step 10: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/supabase/
git commit -m "feat(contacts-dashboard): Supabase schema, deny-all RLS, and the anon-key check"
```

---

### Task 2: The sync script

**Files:**
- Create: `emails/scripts/lib/sync-supabase-data.mjs` (pure — no `fs`, no network, no clock)
- Create: `emails/scripts/lib/sync-supabase-data.test.mjs`
- Create: `emails/scripts/sync-supabase.mjs` (the I/O + network half)

House convention, matched deliberately: `dashboard-data.mjs` is pure and `dashboard.mjs` owns I/O. `pnpm test` at the repo root already runs `node --test emails/scripts/lib/`, so the new test file is picked up with no script change.

**Interfaces:**
- Consumes, from `emails/scripts/lib/dashboard-data.mjs` — `resolveRegistry(filenames) -> entry[]`, `currentList(entries) -> entry|null`, `latestPools(filenames) -> {disposition, file, version}[]`. **Never import `POOL_FILE`** — it is a module-level const, not an export, and resolves to `undefined`. `latestPools` already applies it and compares versions numerically, which is the whole point (`pool-chains-v11` beats `-v9`; a string sort gets that backwards).
- Consumes, from `emails/scripts/lib/contract.mjs` — `fromCsv(text) -> Record<string,string|null>[]` and `split(v) -> string[]` (splits on `|`, trims, drops empties). `fromCsv` runs on `parseCsv`, which is RFC 4180: **never split a CSV on newlines here.** Thirteen scraped declarations carry line breaks inside quoted cells, and a line-splitting reader loses 61 rows without saying so.
- Consumes, from Task 1 — the RPCs `sync_reset()`, `sync_promote(p_generation text)`.
- Produces, from `sync-supabase-data.mjs`:

```js
export const PAUSED_MESSAGE = 'project paused — restore it in the Supabase dashboard'
export const POOL_DISPOSITIONS = [...]                      // the 11 expected dispositions
export const SOURCE_DIR_RE = /^(.+) \[([A-Z-]+)\]$/
export function normDomain(v)                               // string|null -> string|null
export function firstDate(captured)                         // '2026-08-01|2026-08-03' -> '2026-08-01'
export function toContactRow(raw, ctx)                      // ctx = {generation, pool, index} -> row object
export function toVerifyRow(raw)                            // -> {email, result, flags, verified_date}
export function conservationLines(counts)                   // counts[] -> {lines: string[], ok: boolean}
export function parseSourceDirs(names)                      // -> [{token, status, folder}]
export function parseRegistryTable(markdown)                // -> Map<token, {status_row, raw_rows, seated, last_pull, est_left}>
export function parseStatusBanner(markdown)                 // -> string|null
export function isPausedError(err)                          // -> boolean
```

- [ ] **Step 1: Write the failing tests**

Create `emails/scripts/lib/sync-supabase-data.test.mjs`. The fixture CSV is an inline string: `emails/.gitignore` excludes `data/`, `lists/` and `exports/`, so a fixture written to disk under those paths would be invisible to git, and one written anywhere else risks a real row landing in the repo. Synthetic rows, inline, no exceptions.

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { fromCsv } from './contract.mjs'
import {
  PAUSED_MESSAGE,
  SOURCE_DIR_RE,
  conservationLines,
  firstDate,
  isPausedError,
  normDomain,
  parseRegistryTable,
  parseSourceDirs,
  parseStatusBanner,
  toContactRow,
  toVerifyRow,
} from './sync-supabase-data.mjs'

/** Three synthetic rows. No real company, no real contact, no real domain. */
const FIXTURE_CSV = [
  'company,company_display,domain,email,address_1,city,state,zip5,phone_e164,source,source_url,captured,brand_authorized,line_card,location_count,disposition,segment,icp_class,category_core,size_band,rank_score,tier,cohort,contact_first_name,contact_last_name,contact_email_status',
  'acme-fixture,"Acme Fixture, Inc.",WWW.Acme-Fixture.example,SALES@acme-fixture.example,1 Test Way,Springfield,IL,62701,+15555550100,timken|dfs,https://a.example/x|https://b.example/y,2026-08-01|2026-08-03,Timken,Bearings,3,seated,A,ICP-1,4.5,5-10M,71.5,T1,C,Dale,Fixture,verified',
  'beta-fixture,Beta Fixture Co,,,"2 Test Rd",Peoria,IL,61601,,serp,https://c.example/z,2026-08-01,,,1,seated,B,ICP-2,1.5,2-5M,40,T2,,,,',
  'gamma-fixture,Gamma Fixture,gamma-fixture.example,ops@gamma-fixture.example,3 Test Ln,Madison,WI,53703,+15555550101,dfs,https://d.example/w,not-a-date,,,,seated,C,ICP-3,,sub-floor,,T3,E,,,',
].join('\n')

test('normDomain lowercases, strips www., and keeps null null', () => {
  assert.equal(normDomain('WWW.Acme-Fixture.example'), 'acme-fixture.example')
  assert.equal(normDomain('  Acme-Fixture.example '), 'acme-fixture.example')
  assert.equal(normDomain(''), null)
  assert.equal(normDomain(null), null)
})

test('firstDate takes the earliest parseable date out of a pipe chain', () => {
  assert.equal(firstDate('2026-08-03|2026-08-01'), '2026-08-01')
  assert.equal(firstDate('2026-08-01'), '2026-08-01')
  assert.equal(firstDate('not-a-date'), null)
  assert.equal(firstDate(null), null)
})

test('toContactRow maps every typed column and keeps the whole row in raw', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[0], { generation: 'seated-v9', pool: 'seated', index: 0 })

  assert.equal(row.id, 'seated-v9:seated:0')
  assert.equal(row.list_generation, 'seated-v9')
  assert.equal(row.pool, 'seated')
  assert.equal(row.domain, 'acme-fixture.example')
  assert.equal(row.company_display, 'Acme Fixture, Inc.')
  assert.equal(row.zip5, '62701')
  assert.equal(row.phone_e164, '+15555550100')
  assert.equal(row.category_core, 4.5)
  assert.equal(row.rank_score, 71.5)
  assert.equal(row.location_count, '3')            // TEXT: the company's own claim, never summed
  assert.equal(row.captured, '2026-08-01|2026-08-03') // verbatim chain
  assert.equal(row.captured_date, '2026-08-01')       // derived sort key
  assert.deepEqual(row.source_tokens, ['timken', 'dfs'])
  assert.equal(row.email, 'sales@acme-fixture.example')
  assert.equal(row.email_state, 'verified')
  assert.equal(row.has_person, true)
  assert.equal(row.raw.contact_last_name, 'Fixture')
  assert.equal(Object.keys(row.raw).length, 26)    // every CSV column survives in raw
})

test('toContactRow leaves a missing domain null and never invents a person', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[1], { generation: 'seated-v9', pool: 'seated', index: 1 })
  assert.equal(row.domain, null)
  assert.equal(row.email, null)
  assert.equal(row.has_person, false)
  assert.deepEqual(row.source_tokens, ['serp'])
})

test('toContactRow nulls an unparseable numeric or date rather than guessing zero', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[2], { generation: 'seated-v9', pool: 'seated', index: 2 })
  assert.equal(row.category_core, null)
  assert.equal(row.rank_score, null)
  assert.equal(row.captured, 'not-a-date')  // stored verbatim
  assert.equal(row.captured_date, null)     // but never coerced
})

test('toVerifyRow keeps the verdict verbatim and nulls an unparseable date', () => {
  assert.deepEqual(
    toVerifyRow({ email: 'A@Example.test', result: 'valid', flags: 'has_dns', verified_date: '2026-08-02' }),
    { email: 'a@example.test', result: 'valid', flags: 'has_dns', verified_date: '2026-08-02' },
  )
  assert.equal(toVerifyRow({ email: 'b@example.test', result: 'unknown', verified_date: '' }).verified_date, null)
})

test('conservationLines passes on equal counts and fails naming the offender', () => {
  const ok = conservationLines([
    { label: 'seated-v9', file: 2773, db: 2773 },
    { label: 'pool-chains-v11', file: 118, db: 118 },
  ])
  assert.equal(ok.ok, true)
  assert.match(ok.lines[0], /seated-v9\s+file\s+2,773\s+db\s+2,773\s+ok/)

  const bad = conservationLines([
    { label: 'seated-v9', file: 2773, db: 2773 },
    { label: 'pool-chains-v11', file: 118, db: 113 },
  ])
  assert.equal(bad.ok, false)
  assert.match(bad.lines[1], /pool-chains-v11.*MISMATCH/)
})

test('parseSourceDirs keeps token+status pairs and rejects the dashboard folder', () => {
  const dirs = parseSourceDirs([
    'dfs [DONE-DEEP]',
    'adaptall [RETIRED-TO-LOOKUPS]',
    'e4-headless-locators [PART-BUILT]',
    'dashboard',
    '00-README.md',
  ])
  assert.deepEqual(dirs, [
    { token: 'adaptall', status: 'RETIRED-TO-LOOKUPS', folder: 'adaptall [RETIRED-TO-LOOKUPS]' },
    { token: 'dfs', status: 'DONE-DEEP', folder: 'dfs [DONE-DEEP]' },
    { token: 'e4-headless-locators', status: 'PART-BUILT', folder: 'e4-headless-locators [PART-BUILT]' },
  ])
  // The token group is greedy up to the space-bracket, so hyphens survive.
  assert.deepEqual(SOURCE_DIR_RE.exec('e4-headless-locators [PART-BUILT]').slice(1), [
    'e4-headless-locators',
    'PART-BUILT',
  ])
  // Guardrail 5: `dashboard` must never become a source token.
  assert.equal(dirs.some((d) => d.token === 'dashboard'), false)
})

test('parseRegistryTable reads the section-5 rows and tolerates an em-dash cell', () => {
  const md = [
    '| token | status | raw rows | seated | last pull | est. left on table | handoff |',
    '|---|---|---|---|---|---|---|',
    '| dfs | DONE-DEEP | 74,578 | 2,437 | 2026-08-04 | ~30k listings | `dfs [DONE-DEEP]/` |',
    '| equipment-dealers | PART-BUILT | — | — | 2026-08-04 | workstream row | `equipment-dealers [PART-BUILT]/` |',
  ].join('\n')
  const map = parseRegistryTable(md)
  assert.deepEqual(map.get('dfs'), {
    status_row: 'DONE-DEEP', raw_rows: 74578, seated: 2437, last_pull: '2026-08-04', est_left: '~30k listings',
  })
  assert.deepEqual(map.get('equipment-dealers'), {
    status_row: 'PART-BUILT', raw_rows: null, seated: null, last_pull: '2026-08-04', est_left: 'workstream row',
  })
})

test('parseStatusBanner returns the banner text, or null for a malformed one', () => {
  assert.equal(
    parseStatusBanner('# dfs\n\n> **STATUS (2026-08-04):** Worked to exhaustion.\n\nmore'),
    'Worked to exhaustion.',
  )
  assert.equal(parseStatusBanner('# dfs\n\nno banner here'), null)
  assert.equal(parseStatusBanner(''), null)
})

test('isPausedError recognises the shapes a paused project produces', () => {
  assert.equal(isPausedError(new TypeError('fetch failed')), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'ECONNREFUSED' } })), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'ENOTFOUND' } })), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } })), true)
  assert.equal(isPausedError(new Error('duplicate key value violates unique constraint')), false)
  assert.match(PAUSED_MESSAGE, /restore it in the Supabase dashboard/)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new" && node --test emails/scripts/lib/sync-supabase-data.test.mjs`
Expected: FAIL — `Cannot find module '.../emails/scripts/lib/sync-supabase-data.mjs'`.

- [ ] **Step 3: Write the pure module**

Create `emails/scripts/lib/sync-supabase-data.mjs`:

```js
/**
 * sync-supabase-data — the pure half of the Supabase sync.
 *
 * No `fs`, no network, no clock, same convention as `dashboard-data.mjs`. Every
 * mapping decision that could silently corrupt a count lives here so it can be
 * tested by inspection.
 *
 * Two rules worth stating twice:
 *   - A value that will not parse becomes NULL, never 0 and never ''. A missing
 *     number written as zero puts every unmeasured company under a "<$1M" style
 *     filter and deletes them from every view.
 *   - `captured` and `source_url` are PIPE CHAINS in the real files and their
 *     lengths disagree with `source` on ~40% of seated rows. Both are stored
 *     verbatim; only `captured_date` is derived, and only for sorting.
 */
import { split } from './contract.mjs'

/** What the sync says when the project is asleep. Never a bare fetch error. */
export const PAUSED_MESSAGE = 'project paused — restore it in the Supabase dashboard'

/** The 11 side pools that ride along with the seated list. A different count is a data question. */
export const POOL_DISPOSITIONS = [
  'above-ceiling',
  'adjacent-trades',
  'chains',
  'duplicate-sites',
  'identity-backlog',
  'non-us',
  'not-a-distributor',
  'ranked-out',
  'segment-w',
  'small-shops',
  'usaspending-unmatched',
]

/**
 * `{token} [{STATUS}]` — greedy token up to the space-bracket, because tokens
 * carry hyphens (`e4-headless-locators`), both ends anchored. `dashboard/` does
 * not match, and that is guardrail 5: a match would register a phantom source
 * token named `dashboard` with zero rows, forever.
 */
export const SOURCE_DIR_RE = /^(.+) \[([A-Z-]+)\]$/

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Lowercase, strip `www.`, trim. A join key, not a canonicalizer — nothing else is stripped. */
export function normDomain(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim().toLowerCase().replace(/^www\./, '')
  return s === '' ? null : s
}

function textOrNull(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function numOrNull(v) {
  const s = textOrNull(v)
  if (s === null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function dateOrNull(v) {
  const s = textOrNull(v)
  if (s === null || !ISO_DATE.test(s)) return null
  return s
}

/** The earliest parseable ISO date in a possibly-`|`-joined `captured` value. */
export function firstDate(captured) {
  const dates = split(captured).filter((d) => ISO_DATE.test(d)).sort()
  return dates.length ? dates[0] : null
}

/**
 * One CSV row -> one `contacts` row.
 *
 * `raw` carries the WHOLE row, every column, as read. That is the point: the
 * typed columns carry the filters and `raw` carries the drift, so a new column
 * in generation N+1 needs no migration.
 *
 * @param {Record<string, string|null>} raw
 * @param {{generation: string, pool: string, index: number}} ctx
 */
export function toContactRow(raw, ctx) {
  const r = raw || {}
  const first = textOrNull(r.contact_first_name)
  const last = textOrNull(r.contact_last_name)
  const email = textOrNull(r.email)
  return {
    id: `${ctx.generation}:${ctx.pool}:${ctx.index}`,
    list_generation: ctx.generation,
    pool: ctx.pool,
    company: textOrNull(r.company),
    company_display: textOrNull(r.company_display),
    domain: normDomain(r.domain),
    address_1: textOrNull(r.address_1),
    city: textOrNull(r.city),
    state: textOrNull(r.state),
    zip5: textOrNull(r.zip5),
    phone_e164: textOrNull(r.phone_e164),
    category_core: numOrNull(r.category_core),
    brand_authorized: textOrNull(r.brand_authorized),
    line_card: textOrNull(r.line_card),
    source: textOrNull(r.source),
    source_url: textOrNull(r.source_url),
    captured: textOrNull(r.captured),
    captured_date: firstDate(r.captured),
    // TEXT on purpose. This is the company's own claim about its branch count,
    // not a count of rows we hold, and it is never summed into a total.
    location_count: textOrNull(r.location_count),
    segment: textOrNull(r.segment),
    tier: textOrNull(r.tier),
    cohort: textOrNull(r.cohort),
    icp_class: textOrNull(r.icp_class),
    size_band: textOrNull(r.size_band),
    rank_score: numOrNull(r.rank_score),
    disposition: textOrNull(r.disposition),
    source_tokens: split(r.source),
    email: email === null ? null : email.toLowerCase(),
    // The CSV has no `email_state` column; `contact_email_status` is the value
    // the schema's `email_state` was named for.
    email_state: textOrNull(r.contact_email_status),
    has_person: Boolean(first || last),
    raw: r,
  }
}

/** One `verify-results.csv` row -> one `verify_results` row. Verdict verbatim. */
export function toVerifyRow(raw) {
  const r = raw || {}
  return {
    email: String(r.email ?? '').trim().toLowerCase(),
    result: String(r.result ?? '').trim(),
    flags: textOrNull(r.flags),
    verified_date: dateOrNull(r.verified_date),
  }
}

const n = (v) => Number(v).toLocaleString('en-US')

/**
 * The conservation report. File rows and DB rows must match EXACTLY. A sync that
 * silently drops 40 rows produces a dashboard that is confidently wrong, which
 * is worse than one that is down.
 *
 * @param {{label: string, file: number, db: number}[]} counts
 * @returns {{lines: string[], ok: boolean}}
 */
export function conservationLines(counts) {
  const rows = counts || []
  const width = Math.max(14, ...rows.map((c) => String(c.label).length))
  let ok = true
  const lines = rows.map((c) => {
    const good = c.file === c.db
    if (!good) ok = false
    return `${String(c.label).padEnd(width)}  file ${n(c.file).padStart(7)}   db ${n(c.db).padStart(7)}   ${good ? 'ok' : 'MISMATCH'}`
  })
  return { lines, ok }
}

/** Directory names -> the source folders, sorted by token. Non-matching names are not sources. */
export function parseSourceDirs(names) {
  const out = []
  for (const name of names || []) {
    const m = SOURCE_DIR_RE.exec(String(name))
    if (!m) continue
    out.push({ token: m[1], status: m[2], folder: String(name) })
  }
  return out.sort((a, b) => a.token.localeCompare(b.token))
}

/**
 * The pack README's registry table -> one entry per token.
 *
 * `—` is a legitimate cell and becomes null, never 0. A guessed number is worse
 * than an empty one.
 */
export function parseRegistryTable(markdown) {
  const map = new Map()
  for (const line of String(markdown || '').split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    if (cells.length < 7) continue
    const [token, status, rawRows, seated, lastPull, estLeft] = cells
    if (!/^[a-z0-9][a-z0-9-]*$/.test(token)) continue // skips the header and the |---| rule
    map.set(token, {
      status_row: status || null,
      raw_rows: intOrNull(rawRows),
      seated: intOrNull(seated),
      last_pull: dateOrNull((lastPull.match(/\d{4}-\d{2}-\d{2}/) || [])[0]),
      est_left: estLeft === '—' ? null : estLeft || null,
    })
  }
  return map
}

function intOrNull(v) {
  const s = String(v ?? '').replace(/,/g, '').trim()
  if (!/^\d+$/.test(s)) return null
  return Number(s)
}

/** `> **STATUS (2026-08-04):** text` -> `text`. A malformed or missing banner is null, never a crash. */
export function parseStatusBanner(markdown) {
  const m = /^>\s*\*\*STATUS\s*\([^)]*\):\*\*\s*(.+)$/m.exec(String(markdown || ''))
  return m ? m[1].trim() : null
}

/** Connection refused / DNS gone / timeout — the shapes a paused free-tier project produces. */
export function isPausedError(err) {
  const code = err?.cause?.code ?? err?.code ?? ''
  if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT'].includes(code)) return true
  return /fetch failed|network|socket hang up/i.test(String(err?.message ?? ''))
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new" && node --test emails/scripts/lib/sync-supabase-data.test.mjs`
Expected: PASS — 11 tests, 0 failures.

- [ ] **Step 5: Write the sync script**

Create `emails/scripts/sync-supabase.mjs`. Zero new dependencies: bare `fetch` against PostgREST, service-role key in the headers. Adding `@supabase/supabase-js` to the root `package.json` would change how the **main site** installs, for no benefit here.

```js
/**
 * sync-supabase — push the current generation into the deployed dashboard's database.
 *
 *   node emails/scripts/sync-supabase.mjs
 *
 * Manual and on-demand. No cron, no webhook. Pair it with the Friday metrics
 * ritual in docs/strategy/industrial-email-campaign/06-process-runbook.md
 * ("The weekly loop — every Friday"): it refreshes the deployed view AND keeps
 * the free-tier Supabase project from pausing after ~a week of inactivity.
 *
 * FULL REPLACE, never merge. Rows are batched into staging tables and moved
 * across by sync_promote() in one transaction; the visible table is never
 * half-written. The conservation check compares file rows to database rows on
 * every line and exits non-zero on any mismatch.
 *
 * Reads only. Writes nothing to disk. The service-role key is read from
 * .env.local and never logged.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fromCsv } from './lib/contract.mjs'
// The pure resolver. POOL_FILE is NOT exported from this module — never import it.
import { currentList, latestPools, resolveRegistry } from './lib/dashboard-data.mjs'
import {
  PAUSED_MESSAGE,
  POOL_DISPOSITIONS,
  conservationLines,
  isPausedError,
  parseRegistryTable,
  parseSourceDirs,
  parseStatusBanner,
  toContactRow,
  toVerifyRow,
} from './lib/sync-supabase-data.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')
const EMAILS_DIR = join(REPO_ROOT, 'emails')
const LISTS_DIR = join(EMAILS_DIR, 'lists')
const POOLS_DIR = join(EMAILS_DIR, 'data', 'side-pools')
const VERIFY_FILE = join(EMAILS_DIR, 'data', 'verify-results.csv')
const PACK_DIR = join(EMAILS_DIR, 'handoff', 'industrial-contact-list')

/** Batch size for a PostgREST insert. 500 keeps each request well under the body limit. */
const BATCH = 500

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const URL_BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_BASE) fail('Missing SUPABASE_URL — add it to .env.local at the repo root (Supabase → Settings → API → Project URL).')
if (!KEY) fail('Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local at the repo root (Supabase → Settings → API → service_role secret).')

function fail(message) {
  console.error(message)
  process.exit(1)
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function call(path, init) {
  let res
  try {
    res = await fetch(`${URL_BASE}${path}`, { ...init, headers: { ...HEADERS, ...(init?.headers || {}) } })
  } catch (err) {
    // A paused free-tier project looks exactly like a network bug, and an
    // operator who sees a network error goes looking for one that isn't there.
    if (isPausedError(err)) fail(PAUSED_MESSAGE)
    throw err
  }
  if (!res.ok) fail(`Supabase ${init?.method ?? 'GET'} ${path.split('?')[0]} → HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res
}

async function rpc(fn, body) {
  const res = await call(`/rest/v1/rpc/${fn}`, { method: 'POST', body: JSON.stringify(body ?? {}) })
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function insertBatches(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    await call(`/rest/v1/${table}`, {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(rows.slice(i, i + BATCH)),
    })
  }
}

/** Exact row count without a payload: PostgREST puts it in content-range. */
async function dbCount(table, query = '') {
  const res = await call(`/rest/v1/${table}?select=id&limit=1${query}`, { headers: { Prefer: 'count=exact' } })
  const range = res.headers.get('content-range') ?? ''
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : -1
}

function readCsv(path) {
  return fromCsv(readFileSync(path, 'utf8'))
}

// ── 1. resolve the current generation ────────────────────────────────────────
const seated = currentList(resolveRegistry(readdirSync(LISTS_DIR)))
if (!seated) fail(`No current seated list in ${LISTS_DIR} — resolveRegistry found no live main list.`)

const pools = latestPools(readdirSync(POOLS_DIR))
if (pools.length !== POOL_DISPOSITIONS.length) {
  const found = pools.map((p) => p.disposition).sort()
  const missing = POOL_DISPOSITIONS.filter((d) => !found.includes(d))
  const extra = found.filter((d) => !POOL_DISPOSITIONS.includes(d))
  fail(
    `Expected ${POOL_DISPOSITIONS.length} side pools, found ${pools.length}.\n` +
      `  missing: ${missing.join(', ') || 'none'}\n  unexpected: ${extra.join(', ') || 'none'}\n` +
      'A missing pool is a data question, not something to sync around. Stopping.',
  )
}

const generation = seated.name
console.log(`generation: ${generation}  (+ ${pools.length} side pools)\n`)

// ── 2. build the rows ────────────────────────────────────────────────────────
const files = [
  { label: seated.name, pool: 'seated', path: join(LISTS_DIR, seated.file) },
  ...pools.map((p) => ({ label: p.file.replace(/\.csv$/, ''), pool: p.disposition, path: join(POOLS_DIR, p.file) })),
]

const counts = []
const contactRows = []
for (const f of files) {
  const raws = readCsv(f.path)
  raws.forEach((raw, index) => contactRows.push(toContactRow(raw, { generation, pool: f.pool, index })))
  counts.push({ label: f.label, file: raws.length, db: 0 })
}

const verifyRaws = existsSync(VERIFY_FILE) ? readCsv(VERIFY_FILE) : []
const verifyRows = verifyRaws.map(toVerifyRow).filter((r) => r.email !== '')
const uniqueEmails = new Set(verifyRows.map((r) => r.email)).size
const duplicateEmails = verifyRows.length - uniqueEmails

// ── 3. stage, promote, verify ────────────────────────────────────────────────
await rpc('sync_reset')
await insertBatches('contacts_staging', contactRows)
await insertBatches('verify_results_staging', verifyRows)
const [promoted] = await rpc('sync_promote', { p_generation: generation })

for (const c of counts) {
  const pool = files.find((f) => f.label === c.label).pool
  c.db = await dbCount('contacts', `&pool=eq.${encodeURIComponent(pool)}`)
}
counts.push({ label: 'TOTAL', file: contactRows.length, db: Number(promoted.contacts_rows) })
counts.push({ label: 'verify-results', file: verifyRows.length, db: Number(promoted.verify_rows) })

const report = conservationLines(counts)
console.log(report.lines.join('\n'))
console.log(`\n${duplicateEmails} duplicate email${duplicateEmails === 1 ? '' : 's'} retained in verify_results (no unique constraint, on purpose)`)

// ── 4. source registry ───────────────────────────────────────────────────────
const dirs = parseSourceDirs(
  readdirSync(PACK_DIR).filter((name) => {
    try { return statSync(join(PACK_DIR, name)).isDirectory() } catch { return false }
  }),
)
const registry = parseRegistryTable(readFileSync(join(PACK_DIR, '00-README.md'), 'utf8'))

const registryRows = dirs.map((dir) => {
  const row = registry.get(dir.token) ?? {}
  const readme = join(PACK_DIR, dir.folder, '00-README.md')
  const banner = existsSync(readme) ? parseStatusBanner(readFileSync(readme, 'utf8')) : null
  if (banner === null) console.log(`  ${dir.token}: status unparsed (no readable STATUS banner in ${dir.folder}/00-README.md)`)
  if (row.status_row && row.status_row !== dir.status) {
    console.log(`  WARNING ${dir.token}: folder says ${dir.status}, registry row says ${row.status_row} — the completion ritual was half-done`)
  }
  return {
    token: dir.token,
    status: banner === null ? 'unparsed' : dir.status,
    status_row: row.status_row ?? null,
    folder: dir.folder,
    raw_rows: row.raw_rows ?? null,
    seated: row.seated ?? null,
    last_pull: row.last_pull ?? null,
    est_left: row.est_left ?? null,
    synced_at: new Date().toISOString(),
  }
})

await call('/rest/v1/sources_registry?on_conflict=token', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(registryRows),
})
console.log(`\nsources_registry: ${registryRows.length} folders upserted`)

// ── 5. verdict ───────────────────────────────────────────────────────────────
if (!report.ok) {
  console.error('\nCONSERVATION FAILED — the lines marked MISMATCH above did not reconcile. The database is not trustworthy for those pools.')
  process.exit(1)
}
console.log('\nconservation PASS')
```

- [ ] **Step 6: Run the sync against the live project**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new" && node emails/scripts/sync-supabase.mjs`
Expected: a `generation: seated-v9  (+ 11 side pools)` line, one conservation line per file with `ok`, a `TOTAL` line, a `verify-results` line, a duplicate-email count, any folder/row status warnings, `sources_registry: N folders upserted`, and `conservation PASS`. Exit code 0.

- [ ] **Step 7: Prove the failure modes**

Run each and confirm the stated output:

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"

# Idempotence — a second run produces the same totals, zero diff.
node emails/scripts/sync-supabase.mjs | tail -5

# Conservation actually bites. Work on a COPY; never edit a real pool file.
cp emails/data/side-pools/pool-chains-v11.csv /tmp/pool-chains-v11.backup.csv
head -n -5 /tmp/pool-chains-v11.backup.csv > emails/data/side-pools/pool-chains-v11.csv
node emails/scripts/sync-supabase.mjs ; echo "exit: $?"
cp /tmp/pool-chains-v11.backup.csv emails/data/side-pools/pool-chains-v11.csv
node emails/scripts/sync-supabase.mjs | tail -2

# Paused-project message, not a stack trace.
SUPABASE_URL=https://not-a-real-project.supabase.co node emails/scripts/sync-supabase.mjs ; echo "exit: $?"
```

Expected, in order: identical totals on the second run; a `pool-chains-v11 … MISMATCH` line and `exit: 1`; `conservation PASS` again after restoring; and `project paused — restore it in the Supabase dashboard` with `exit: 1` and no stack trace.

- [ ] **Step 8: Prove the folder-status behaviour**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new/emails/handoff/industrial-contact-list"
mv "dfs [DONE-DEEP]" "dfs [IN-PROGRESS]"
cd "/Users/artur/Documents/Projects/Salesolution new" && node emails/scripts/sync-supabase.mjs | grep -i "dfs"
cd "/Users/artur/Documents/Projects/Salesolution new/emails/handoff/industrial-contact-list" && mv "dfs [IN-PROGRESS]" "dfs [DONE-DEEP]"
cd "/Users/artur/Documents/Projects/Salesolution new" && node emails/scripts/sync-supabase.mjs | tail -2
```

Expected: while renamed, a `WARNING dfs: folder says IN-PROGRESS, registry row says DONE-DEEP` line — the token is unchanged, no row created or destroyed, and both values are stored. After restoring, `conservation PASS` and no warning.

- [ ] **Step 9: Run the whole repo test suite**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new" && pnpm test`
Expected: green, including the 11 new tests in `emails/scripts/lib/sync-supabase-data.test.mjs`.

- [ ] **Step 10: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add emails/scripts/sync-supabase.mjs emails/scripts/lib/sync-supabase-data.mjs emails/scripts/lib/sync-supabase-data.test.mjs
git commit -m "feat(emails): sync the current generation into Supabase, with a conservation check that bites"
```

---

### Task 3: App scaffold

**Files:**
- Create: `apps/contacts-dashboard/package.json`
- Create: `apps/contacts-dashboard/next.config.ts`
- Create: `apps/contacts-dashboard/tsconfig.json`
- Create: `apps/contacts-dashboard/.gitignore`
- Create: `apps/contacts-dashboard/app/layout.tsx`
- Create: `apps/contacts-dashboard/app/page.tsx`
- Create: `apps/contacts-dashboard/app/globals.css`
- Test: `pnpm build` inside `apps/contacts-dashboard/`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the package root every later task builds into, the `pnpm test` script (`node --test lib/`) later tasks add tests to, and a root layout that Task 5 turns into the auth gate.

**No pnpm workspace.** There is no `pnpm-workspace.yaml` at the repo root and none gets added — adding one would change how the **main site** installs, for no benefit here. Without it, `apps/contacts-dashboard/` is simply an independent package in a subdirectory, which Vercel's Root Directory setting handles natively: it installs and builds from that folder as if it were the repo root.

- [ ] **Step 1: Write the failing test**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm build`
Expected: FAIL — `no such file or directory`. The directory does not exist yet.

- [ ] **Step 2: Write `package.json`**

Create `apps/contacts-dashboard/package.json`. Versions are pinned to the ones the root site already runs, so there is one React and one Next in the building's head.

```json
{
  "name": "contacts-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build",
    "start": "next start",
    "test": "node --test lib/"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

Zero UI dependencies. This is a table with filters, not a design project — plain CSS in `globals.css`, no Tailwind, no component library.

- [ ] **Step 3: Write `tsconfig.json`, `next.config.ts` and `.gitignore`**

`apps/contacts-dashboard/tsconfig.json` — `allowJs` is what lets the `.ts`/`.tsx` layer import the unit-tested `.mjs` modules:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`apps/contacts-dashboard/next.config.ts`:

```ts
import type { NextConfig } from 'next'

/**
 * The contacts dashboard is internal and gated. It must never be indexed and it
 * must never be framed by anything.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
```

`apps/contacts-dashboard/.gitignore` — the root `.gitignore` anchors `/node_modules` and `/.next/` to the repo root, so neither covers this package. PII never enters git: migrations are committed, data never is.

```gitignore
# dependencies + build output (the root .gitignore anchors these to the repo root)
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts

# env — the service-role key bypasses RLS by design
.env*

# DATA NEVER ENTERS GIT. Migrations are committed; rows are not.
*.csv
/data/
/dump/
/exports/

# vercel
.vercel
```

- [ ] **Step 4: Write the root layout and the scaffold page**

`apps/contacts-dashboard/app/layout.tsx` — Task 5 turns this into the gate; for now it is the shell.

```tsx
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Contacts',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

`apps/contacts-dashboard/app/page.tsx` — a server-rendered page, not an endpoint. There is deliberately **no** `/api/health` and no debug route: `01` T4.3 says every route handler in this app verifies the session, and a health check that skips it "just for now" is the exception that stays.

```tsx
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <main>
      <h1>Contacts</h1>
      <p>Scaffold. The locations sheet lands in Task 6.</p>
    </main>
  )
}
```

`apps/contacts-dashboard/app/globals.css`:

```css
:root {
  --ink: #16181d;
  --ink-soft: #5b616e;
  --rule: #e3e5ea;
  --surface: #ffffff;
  --surface-alt: #f7f8fa;
  --accent: #1c4ed8;
  --warn: #9a5b00;
  --warn-bg: #fdf3e3;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  color: var(--ink);
  background: var(--surface);
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

main { padding: 24px; max-width: 100%; }
h1 { font-size: 18px; margin: 0 0 4px; }
a { color: var(--accent); }

table { border-collapse: collapse; width: max-content; min-width: 100%; font-size: 13px; }
th, td { border-bottom: 1px solid var(--rule); padding: 6px 10px; text-align: left; white-space: nowrap; vertical-align: top; }
th { position: sticky; top: 0; background: var(--surface-alt); font-weight: 600; }
.scroll { overflow-x: auto; }

.chip { display: inline-block; padding: 1px 6px; margin: 0 4px 2px 0; border: 1px solid var(--rule); border-radius: 10px; font-size: 12px; }
.warn { background: var(--warn-bg); color: var(--warn); border-color: var(--warn); }
.muted { color: var(--ink-soft); }
.counters { display: flex; flex-wrap: wrap; gap: 20px; margin: 0 0 12px; padding: 0; list-style: none; }
.counters b { display: block; font-size: 20px; font-weight: 600; }
.counters span { font-size: 12px; color: var(--ink-soft); }
```

- [ ] **Step 5: Install and run the build to verify it passes**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard"
pnpm install
pnpm build
```
Expected: `pnpm install` writes `apps/contacts-dashboard/pnpm-lock.yaml` and `node_modules/`; `pnpm build` prints `Compiled successfully` and a route table containing `/`.

- [ ] **Step 6: Confirm the repo root is untouched**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git status --porcelain -- package.json pnpm-lock.yaml vercel.json
ls pnpm-workspace.yaml 2>&1
git status --porcelain apps/contacts-dashboard/ | grep -c node_modules
```
Expected: no output from the first (the root `package.json`, root lockfile and `vercel.json` are unmodified); `ls: pnpm-workspace.yaml: No such file or directory`; `0` (node_modules is ignored).

- [ ] **Step 7: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/
git commit -m "feat(contacts-dashboard): scaffold the app as its own package"
```

---

### Task 4: Server data layer

**Files:**
- Create: `apps/contacts-dashboard/lib/columns.mjs`
- Create: `apps/contacts-dashboard/lib/columns.test.mjs`
- Create: `apps/contacts-dashboard/lib/query.mjs`
- Create: `apps/contacts-dashboard/lib/query.test.mjs`
- Create: `apps/contacts-dashboard/lib/mode.mjs`
- Create: `apps/contacts-dashboard/lib/mode.test.mjs`
- Create: `apps/contacts-dashboard/lib/supabase.ts`
- Create: `apps/contacts-dashboard/lib/contacts.ts`

**Interfaces:**
- Consumes, from Task 1 — the RPC `contacts_counters(p_sources text[], p_states text[], p_country text, p_cat_min numeric, p_cat_max numeric, p_q text)` returning one row of `{companies, no_domain, people, sendable, locations, brands, states}`; `source_stats()`; `pool_stats()`.
- Produces:

```js
// lib/columns.mjs
export const LOCATION_COLUMNS      // 15 identifiers -> 14 visible columns
export const ALWAYS_SELECTED       // ['id', 'pool']
export const TYPED_COLUMNS         // every typed column in the contacts table
export const DEFAULT_PAGE_SIZE     // 500
export const SHOW_ALL_PAGE_SIZE    // 100
export function selectList(showAll)   // boolean -> string for .select()
export function isRealColumn(name)    // string -> boolean, the schema guard
```

```js
// lib/query.mjs
export function escapeLike(s)                   // string -> string
export function countryOf(pool)                 // string|null -> 'United States' | 'Non-US'
export function parseSheetParams(searchParams)  // URLSearchParams -> SheetParams
export function buildFilterSpec(params)         // SheetParams -> FilterSpec
export function applyFilters(query, spec)       // (PostgrestFilterBuilder, FilterSpec) -> the same builder
export function counterArgs(params)             // SheetParams -> the six RPC args
export function pageRange(params)               // SheetParams -> {from, to, pageSize}
```

```js
// lib/mode.mjs
export function readMode(env)                   // -> {mode: 'internal', project: string|null}
```

```ts
// lib/supabase.ts
export const PAUSED_MESSAGE: string
export function serverClient(): SupabaseClient
export function describeError(err: unknown): string
```

```ts
// lib/contacts.ts
export type SheetParams = { sources: string[]; states: string[]; country: 'us' | 'non-us' | null; catMin: number | null; catMax: number | null; q: string; page: number; showAll: boolean; sort: string; dir: 'asc' | 'desc' }
export type Counters = { companies: number; no_domain: number; people: number; sendable: number; locations: number; brands: number; states: number }
export async function fetchSheet(params: SheetParams): Promise<{ rows: Record<string, unknown>[]; pageSize: number }>
export async function fetchPage(params: SheetParams, offset: number, size: number): Promise<Record<string, unknown>[]>
export async function fetchCounters(params: SheetParams): Promise<Counters>
export async function countMatching(params: SheetParams): Promise<number>
export async function fetchGeneration(): Promise<string | null>
export async function fetchFacets(): Promise<{ states: string[]; sources: string[] }>
```

`SheetParams` is declared as a TypeScript type in `lib/contacts.ts` and produced at runtime by `parseSheetParams` in `lib/query.mjs`. The field names above are the contract between them.

- [ ] **Step 1: Write the failing tests for columns and mode**

Create `apps/contacts-dashboard/lib/columns.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { ALWAYS_SELECTED, LOCATION_COLUMNS, TYPED_COLUMNS, isRealColumn, selectList } from './columns.mjs'

test('LOCATION_COLUMNS is the default view, verbatim and in order', () => {
  assert.deepEqual(LOCATION_COLUMNS, [
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
    'source', 'source_url', 'captured', 'location_count',
  ])
  // 15 identifiers, 14 visible columns: company + company_display render as one
  // "Company" cell (display for the human, company for sort stability).
  assert.equal(LOCATION_COLUMNS.length, 15)
})

test('every default column is a real column in the contacts table', () => {
  for (const c of LOCATION_COLUMNS) assert.equal(isRealColumn(c), true, `${c} is not in TYPED_COLUMNS`)
  assert.equal(isRealColumn('website'), false)   // the brief's name; the real one is `domain`
  assert.equal(isRealColumn('zip'), false)       // the real one is `zip5`
  assert.equal(isRealColumn('phone'), false)     // the real one is `phone_e164`
  assert.equal(isRealColumn('country'), false)   // derived from pool; no column exists
  assert.equal(isRealColumn('category_display'), false)
})

test('selectList opens on the default columns and widens to everything', () => {
  const dflt = selectList(false)
  assert.equal(dflt, [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(','))
  assert.equal(dflt.includes('raw'), false)      // raw is heavy; it rides the show-all path only
  assert.equal(selectList(true), '*')            // typed columns + raw, for the details panel
})

test('TYPED_COLUMNS carries the campaign and person-adjacent columns too', () => {
  for (const c of ['segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score', 'disposition', 'email', 'email_state', 'has_person', 'pool', 'list_generation', 'captured_date']) {
    assert.equal(TYPED_COLUMNS.includes(c), true, `${c} missing from TYPED_COLUMNS`)
  }
})
```

Create `apps/contacts-dashboard/lib/mode.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { readMode } from './mode.mjs'

test('readMode returns the pinned project and defaults to no pin', () => {
  assert.deepEqual(readMode({ DASHBOARD_MODE: 'internal', DASHBOARD_PROJECT: 'hosebox' }), { mode: 'internal', project: 'hosebox' })
  assert.deepEqual(readMode({ DASHBOARD_MODE: 'internal' }), { mode: 'internal', project: null })
})

test('an unset DASHBOARD_MODE is a named failure, never an implicit "show everything"', () => {
  assert.throws(() => readMode({}), /DASHBOARD_MODE/)
  assert.throws(() => readMode({ DASHBOARD_MODE: 'client' }), /DASHBOARD_MODE must be "internal"/)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './columns.mjs'` and `Cannot find module './mode.mjs'`.

- [ ] **Step 3: Write `columns.mjs` and `mode.mjs`**

`apps/contacts-dashboard/lib/columns.mjs`:

```js
/**
 * columns — one place that says what the sheet selects.
 *
 * LOCATION_COLUMNS is the DEFAULT VIEW, not a whitelist and not a ceiling. The
 * audience is the founder looking at his own asset, so nothing is withheld: the
 * show-all toggle reaches every typed column plus the `raw` JSONB. The default
 * is simply the set that answers "where is this location and how do we know,"
 * which is what makes the sheet readable.
 *
 * Four names a brief would reach for do not exist in the data, and the
 * corrections are load-bearing: `zip5` not `zip`, `phone_e164` not `phone`,
 * `domain` not `website`, and there is no `category_display` at all. Country is
 * derived from pool membership — see countryOf() in query.mjs.
 */

/** The 15 identifiers the sheet opens on. They render as 14 columns: company + company_display are one cell. */
export const LOCATION_COLUMNS = [
  'company',
  'company_display',
  'address_1',
  'city',
  'state',
  'zip5',
  'phone_e164',
  'domain',
  'category_core',
  'brand_authorized',
  'line_card',
  'source',
  'source_url',
  'captured',
  'location_count',
]

/** `id` is the React key; `pool` is what the country filter is derived from. Always selected. */
export const ALWAYS_SELECTED = ['id', 'pool']

/** Every typed column in `contacts`. The schema guard rejects anything absent from this list. */
export const TYPED_COLUMNS = [
  'id', 'list_generation', 'pool',
  'company', 'company_display', 'domain',
  'address_1', 'city', 'state', 'zip5', 'phone_e164',
  'category_core', 'brand_authorized', 'line_card',
  'source', 'source_url', 'captured', 'captured_date', 'location_count',
  'segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score',
  'disposition', 'source_tokens', 'email', 'email_state', 'has_person',
]

/** Mirrors the local dashboard's `paginate` cap. The browser never receives the full set. */
export const DEFAULT_PAGE_SIZE = 500

/** `raw` is the whole CSV row per record. 500 of those is megabytes, so show-all pages are smaller. */
export const SHOW_ALL_PAGE_SIZE = 100

/** A real column, or not. Rejects a bad `sort` before it reaches PostgREST. */
export function isRealColumn(name) {
  return TYPED_COLUMNS.includes(String(name))
}

/**
 * The `select()` string. One builder feeds both the page and the export, so the
 * two can never disagree about what a row contains.
 */
export function selectList(showAll) {
  return showAll ? '*' : [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(',')
}
```

`apps/contacts-dashboard/lib/mode.mjs`:

```js
/**
 * mode — read once, at module scope, from the server environment.
 *
 * Nothing in a request may influence either value: not a query string, not a
 * header, not a cookie, not a body. This is no longer containing anything (there
 * is no client), but it costs nothing, and an env var that decides what a
 * deployment shows should not be reachable from the internet.
 *
 * DASHBOARD_PROJECT is DEFAULT-VIEW ROUTING: it decides which saved view the
 * deployment opens on. A deployment pinned to a project that does not exist
 * fails loudly rather than opening somewhere random.
 */
export function readMode(env) {
  const e = env || {}
  const mode = e.DASHBOARD_MODE
  if (!mode) {
    throw new Error('DASHBOARD_MODE is not set. Set DASHBOARD_MODE=internal — an unset mode that defaults to "show everything" is the kind of implicit that bites later.')
  }
  if (mode !== 'internal') {
    throw new Error(`DASHBOARD_MODE must be "internal" (got "${mode}"). Client mode was dissolved on 2026-08-07 — all three deployments are internal.`)
  }
  return { mode, project: e.DASHBOARD_PROJECT ? String(e.DASHBOARD_PROJECT) : null }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 6 tests, 0 failures.

- [ ] **Step 5: Write the failing tests for the query builder**

Create `apps/contacts-dashboard/lib/query.test.mjs`. The mocked client is a recorder: a `PostgrestFilterBuilder` returns itself from every filter method, so a chainable object that records calls is a faithful stand-in and needs no network.

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { applyFilters, buildFilterSpec, counterArgs, countryOf, escapeLike, pageRange, parseSheetParams } from './query.mjs'

/** A stand-in for a PostgrestFilterBuilder: every filter method returns `this`. */
function recorder() {
  const calls = []
  const self = {}
  for (const m of ['eq', 'neq', 'gte', 'lte', 'in', 'overlaps', 'or', 'order', 'range', 'not']) {
    self[m] = (...args) => {
      calls.push([m, ...args])
      return self
    }
  }
  self.calls = calls
  return self
}

const params = (qs) => parseSheetParams(new URLSearchParams(qs))

test('parseSheetParams reads every control', () => {
  const p = params('source=timken&source=dfs&state=IL&state=WI&country=us&catMin=2&catMax=8&q=acme&page=3&sort=city&dir=desc')
  assert.deepEqual(p.sources, ['timken', 'dfs'])
  assert.deepEqual(p.states, ['IL', 'WI'])
  assert.equal(p.country, 'us')
  assert.equal(p.catMin, 2)
  assert.equal(p.catMax, 8)
  assert.equal(p.q, 'acme')
  assert.equal(p.page, 3)
  assert.equal(p.sort, 'city')
  assert.equal(p.dir, 'desc')
  assert.equal(p.showAll, false)
})

test('parseSheetParams refuses nonsense instead of passing it to the database', () => {
  const p = params('page=-4&sort=DROP TABLE&dir=sideways&catMin=abc&country=mars')
  assert.equal(p.page, 1)
  assert.equal(p.sort, 'company')     // falls back to a real column
  assert.equal(p.dir, 'asc')
  assert.equal(p.catMin, null)        // never coerced to 0
  assert.equal(p.country, null)
})

test('show=all switches the toggle and shrinks the page', () => {
  assert.equal(params('show=all').showAll, true)
  assert.deepEqual(pageRange(params('show=all&page=2')), { from: 100, to: 199, pageSize: 100 })
  assert.deepEqual(pageRange(params('page=2')), { from: 500, to: 999, pageSize: 500 })
})

test('escapeLike neutralises the LIKE wildcards so a search for "50%" means "50%"', () => {
  assert.equal(escapeLike('50%'), '50\\%')
  assert.equal(escapeLike('a_b'), 'a\\_b')
  assert.equal(escapeLike('back\\slash'), 'back\\\\slash')
})

test('countryOf derives country from pool membership and nothing else', () => {
  assert.equal(countryOf('non-us'), 'Non-US')
  assert.equal(countryOf('seated'), 'United States')
  assert.equal(countryOf(null), 'United States')
  // There is no `country` column in any file. On a non-US row `state` holds a
  // province code with no country attached, so it is never used to guess.
})

test('buildFilterSpec turns params into one spec, and applyFilters chains it', () => {
  const spec = buildFilterSpec(params('source=timken&source=dfs&state=IL&country=non-us&catMin=2&catMax=8&q=ac%25me'))
  assert.deepEqual(spec.overlaps, { column: 'source_tokens', values: ['timken', 'dfs'] })
  assert.deepEqual(spec.in, [{ column: 'state', values: ['IL'] }])
  assert.deepEqual(spec.eq, [{ column: 'pool', value: 'non-us' }])
  assert.deepEqual(spec.gte, [{ column: 'category_core', value: 2 }])
  assert.deepEqual(spec.lte, [{ column: 'category_core', value: 8 }])
  assert.equal(spec.or, 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"')

  const q = recorder()
  applyFilters(q, spec)
  assert.deepEqual(q.calls, [
    ['overlaps', 'source_tokens', ['timken', 'dfs']],
    ['in', 'state', ['IL']],
    ['eq', 'pool', 'non-us'],
    ['gte', 'category_core', 2],
    ['lte', 'category_core', 8],
    ['or', 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"'],
  ])
})

test('a comma in q stays one quoted pattern instead of splitting the or', () => {
  // PostgREST splits or-conditions on top-level commas. Unquoted, this q is a
  // 400 (the parser sees " Inc.%" as a malformed extra condition); quoted, it
  // is one pattern per field.
  const spec = buildFilterSpec(params('q=Bearings, Inc.'))
  assert.equal(spec.or, 'company_display.ilike."%Bearings, Inc.%",domain.ilike."%Bearings, Inc.%"')
})

test('a double quote in q cannot break out of the quoted pattern', () => {
  const spec = buildFilterSpec(params('q=3" pipe'))
  assert.equal(spec.or, 'company_display.ilike."%3\\" pipe%",domain.ilike."%3\\" pipe%"')
})

test('country=us excludes the non-us pool rather than guessing from state', () => {
  const q = recorder()
  applyFilters(q, buildFilterSpec(params('country=us')))
  assert.deepEqual(q.calls, [['neq', 'pool', 'non-us']])
})

test('an empty filter set touches nothing', () => {
  const q = recorder()
  applyFilters(q, buildFilterSpec(params('')))
  assert.deepEqual(q.calls, [])
})

test('counterArgs matches the contacts_counters signature exactly', () => {
  assert.deepEqual(counterArgs(params('source=dfs&state=IL&country=us&catMin=2&q=acme')), {
    p_sources: ['dfs'],
    p_states: ['IL'],
    p_country: 'us',
    p_cat_min: 2,
    p_cat_max: null,
    p_q: 'acme',
  })
  assert.deepEqual(counterArgs(params('')), {
    p_sources: null, p_states: null, p_country: null, p_cat_min: null, p_cat_max: null, p_q: null,
  })
})
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './query.mjs'`.

- [ ] **Step 7: Write `query.mjs`**

```js
/**
 * query — the one builder. The page and the export both go through it, which is
 * how they are stopped from disagreeing about what a filter means. Two code
 * paths is how an export ends up with a column the page does not show.
 *
 * Filters translate to SQL `where` clauses server-side. The browser receives
 * filtered, paginated pages only — never the full set, never a
 * count-plus-payload of 35K rows.
 *
 * The predicate here mirrors contacts_counters() in 0002_functions.sql exactly.
 * One parse, two emitters: change one, change the other.
 */
import { DEFAULT_PAGE_SIZE, SHOW_ALL_PAGE_SIZE, isRealColumn } from './columns.mjs'

const COUNTRIES = ['us', 'non-us']

/** Neutralise LIKE metacharacters so a search for "50%" is a search for "50%". */
export function escapeLike(s) {
  return String(s ?? '').replace(/[\\%_]/g, (c) => `\\${c}`)
}

/**
 * One or-branch pattern, as a PostgREST double-quoted literal. PostgREST splits
 * an `or=` string on top-level commas, so a bare q containing one either breaks
 * the parse (400) or smuggles extra OR conditions in. The quotes keep the
 * pattern one value; this layer's own escapes — backslash first, then the
 * double quote — sit on top of escapeLike's LIKE escaping underneath.
 */
function quotedPattern(pattern) {
  return `"${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Country, honestly. There is no `country` column in the seated list or in any
 * pool, including pool-non-us. The only country signal we hold is pool
 * membership, so the filter ships as two values derived server-side. A non-US
 * row's `state` holds a province or region code with no country attached, so it
 * is never used to guess. Real country values are a pipeline task, not a
 * display task here.
 */
export function countryOf(pool) {
  return String(pool ?? '') === 'non-us' ? 'Non-US' : 'United States'
}

function numOrNull(v) {
  const s = String(v ?? '').trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** URLSearchParams -> SheetParams. Every bound is clamped; nothing is trusted. */
export function parseSheetParams(searchParams) {
  const sp = searchParams ?? new URLSearchParams()
  const sortRaw = sp.get('sort') ?? ''
  const dirRaw = (sp.get('dir') ?? '').toLowerCase()
  const country = sp.get('country')
  return {
    sources: sp.getAll('source').filter(Boolean),
    states: sp.getAll('state').filter(Boolean),
    country: COUNTRIES.includes(country) ? country : null,
    catMin: numOrNull(sp.get('catMin')),
    catMax: numOrNull(sp.get('catMax')),
    q: (sp.get('q') ?? '').trim(),
    page: Math.max(1, Math.trunc(Number(sp.get('page')) || 1)),
    showAll: sp.get('show') === 'all',
    sort: isRealColumn(sortRaw) ? sortRaw : 'company',
    dir: dirRaw === 'desc' ? 'desc' : 'asc',
  }
}

/** SheetParams -> a single declarative spec. Pure; no client involved. */
export function buildFilterSpec(params) {
  const p = params
  const spec = { overlaps: null, in: [], eq: [], neq: [], gte: [], lte: [], or: null }

  if (p.sources.length) spec.overlaps = { column: 'source_tokens', values: p.sources }
  if (p.states.length) spec.in.push({ column: 'state', values: p.states })
  if (p.country === 'non-us') spec.eq.push({ column: 'pool', value: 'non-us' })
  if (p.country === 'us') spec.neq.push({ column: 'pool', value: 'non-us' })
  if (p.catMin !== null) spec.gte.push({ column: 'category_core', value: p.catMin })
  if (p.catMax !== null) spec.lte.push({ column: 'category_core', value: p.catMax })
  if (p.q) {
    const like = quotedPattern(`%${escapeLike(p.q)}%`)
    spec.or = `company_display.ilike.${like},domain.ilike.${like}`
  }
  return spec
}

/** Apply a spec to a PostgrestFilterBuilder. Order is fixed so the tests can assert it. */
export function applyFilters(query, spec) {
  let q = query
  if (spec.overlaps) q = q.overlaps(spec.overlaps.column, spec.overlaps.values)
  for (const f of spec.in) q = q.in(f.column, f.values)
  for (const f of spec.eq) q = q.eq(f.column, f.value)
  for (const f of spec.neq) q = q.neq(f.column, f.value)
  for (const f of spec.gte) q = q.gte(f.column, f.value)
  for (const f of spec.lte) q = q.lte(f.column, f.value)
  if (spec.or) q = q.or(spec.or)
  return q
}

/** The same params, shaped for the contacts_counters RPC. */
export function counterArgs(params) {
  return {
    p_sources: params.sources.length ? params.sources : null,
    p_states: params.states.length ? params.states : null,
    p_country: params.country,
    p_cat_min: params.catMin,
    p_cat_max: params.catMax,
    p_q: params.q || null,
  }
}

/** Zero-based inclusive range for `.range(from, to)`. */
export function pageRange(params) {
  const pageSize = params.showAll ? SHOW_ALL_PAGE_SIZE : DEFAULT_PAGE_SIZE
  const from = (params.page - 1) * pageSize
  return { from, to: from + pageSize - 1, pageSize }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 17 tests, 0 failures.

- [ ] **Step 9: Write the Supabase client and the fetchers**

`apps/contacts-dashboard/lib/supabase.ts` — imported only by server components and route handlers.

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The one Supabase client. Service-role key, server-side only.
 *
 * The service-role key bypasses RLS by design — it is the database, not a
 * credential with a blast radius. It never reaches the browser: there is no
 * browser-exposed (public-prefixed) Supabase variable in this app, and no
 * client component imports this module.
 */

/** What a paused free-tier project says. Never a bare fetch error. */
export const PAUSED_MESSAGE = 'project paused — restore it in the Supabase dashboard'

let cached: SupabaseClient | null = null

export function serverClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the deployment environment.')
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

/**
 * A Supabase error turned into something an operator can act on. ~A week of
 * inactivity pauses a free-tier project, and a paused project needs a manual
 * restore in the dashboard — there is no API for it. Saying "fetch failed"
 * instead sends someone hunting a bug that isn't there.
 */
export function describeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(message)) return PAUSED_MESSAGE
  return message
}
```

`apps/contacts-dashboard/lib/contacts.ts`:

```ts
import { DEFAULT_PAGE_SIZE, SHOW_ALL_PAGE_SIZE, selectList } from './columns.mjs'
import { applyFilters, buildFilterSpec, counterArgs, pageRange } from './query.mjs'
import { describeError, serverClient } from './supabase'

export type SheetParams = {
  sources: string[]
  states: string[]
  country: 'us' | 'non-us' | null
  catMin: number | null
  catMax: number | null
  q: string
  page: number
  showAll: boolean
  sort: string
  dir: 'asc' | 'desc'
}

export type Counters = {
  companies: number
  no_domain: number
  people: number
  sendable: number
  locations: number
  brands: number
  states: number
}

type Row = Record<string, unknown>

/** An arbitrary window. Used by the sheet and by the streamed export. */
export async function fetchPage(params: SheetParams, offset: number, size: number): Promise<Row[]> {
  const db = serverClient()
  let q = db.from('contacts').select(selectList(params.showAll))
  q = applyFilters(q, buildFilterSpec(params))
  const { data, error } = await q
    .order(params.sort, { ascending: params.dir === 'asc', nullsFirst: false })
    .order('id', { ascending: true })
    .range(offset, offset + size - 1)
  if (error) throw new Error(describeError(error))
  return (data ?? []) as unknown as Row[]
}

/** One page of rows. The client never receives more than this. */
export async function fetchSheet(params: SheetParams): Promise<{ rows: Row[]; pageSize: number }> {
  const { from, pageSize } = pageRange(params)
  return { rows: await fetchPage(params, from, pageSize), pageSize }
}

/**
 * The counters, computed over the WHOLE filtered set rather than the page.
 * `companies` and `sendable` are roughly 64x apart and both true, which is why
 * there are several counters and not one hero number.
 */
export async function fetchCounters(params: SheetParams): Promise<Counters> {
  const db = serverClient()
  const { data, error } = await db.rpc('contacts_counters', counterArgs(params))
  if (error) throw new Error(describeError(error))
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, string | number> | undefined
  const n = (v: string | number | undefined) => Number(v ?? 0)
  return {
    companies: n(row?.companies),
    no_domain: n(row?.no_domain),
    people: n(row?.people),
    sendable: n(row?.sendable),
    locations: n(row?.locations),
    brands: n(row?.brands),
    states: n(row?.states),
  }
}

/** Exact row count for the current filter, no payload. */
export async function countMatching(params: SheetParams): Promise<number> {
  const db = serverClient()
  let q = db.from('contacts').select('id', { count: 'exact', head: true })
  q = applyFilters(q, buildFilterSpec(params))
  const { count, error } = await q
  if (error) throw new Error(describeError(error))
  return count ?? 0
}

/** Which generation the table currently holds. It holds exactly one. */
export async function fetchGeneration(): Promise<string | null> {
  const db = serverClient()
  const { data, error } = await db.from('contacts').select('list_generation').limit(1)
  if (error) throw new Error(describeError(error))
  return ((data?.[0] as { list_generation?: string } | undefined)?.list_generation) ?? null
}

/** The values the state and source controls offer. Derived from the data, never hand-listed. */
export async function fetchFacets(): Promise<{ states: string[]; sources: string[] }> {
  const db = serverClient()
  const [sourcesRes, statesRes] = await Promise.all([
    db.rpc('source_stats'),
    db.from('contacts').select('state').not('state', 'is', null).order('state', { ascending: true }).limit(50000),
  ])
  if (sourcesRes.error) throw new Error(describeError(sourcesRes.error))
  if (statesRes.error) throw new Error(describeError(statesRes.error))
  const states = [...new Set(((statesRes.data ?? []) as { state: string }[]).map((r) => r.state).filter(Boolean))].sort()
  const sources = ((sourcesRes.data ?? []) as { token: string }[]).map((r) => r.token).sort()
  return { states, sources }
}

export { DEFAULT_PAGE_SIZE, SHOW_ALL_PAGE_SIZE }
```

- [ ] **Step 10: Verify the build and the guards**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard"
pnpm test && pnpm build
cd "/Users/artur/Documents/Projects/Salesolution new"
grep -rn "NEXT_PUBLIC" apps/contacts-dashboard/
grep -rni "smartlead" apps/contacts-dashboard/
```
Expected: tests PASS, `Compiled successfully`, and both greps print nothing.

- [ ] **Step 11: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/lib/
git commit -m "feat(contacts-dashboard): server data layer — one query builder, service-role only"
```

---

### Task 5: The auth gate

> ⚠️ **RE-PLAN before building — `02` AMENDMENT 2.** The shared password plus HMAC session below is replaced by **per-person accounts**: invite/provision, revoke one viewer without touching the rest, and an export audit trail with a name on it. `rate-limit.mjs` and the 401-not-redirect rule survive as written; `verifyPassword` and `signSession` do not.

**Files:**
- Create: `apps/contacts-dashboard/lib/auth.mjs`
- Create: `apps/contacts-dashboard/lib/auth.test.mjs`
- Create: `apps/contacts-dashboard/lib/rate-limit.mjs`
- Create: `apps/contacts-dashboard/lib/rate-limit.test.mjs`
- Create: `apps/contacts-dashboard/components/Login.tsx`
- Create: `apps/contacts-dashboard/app/api/login/route.ts`
- Modify: `apps/contacts-dashboard/app/layout.tsx` (the shell from Task 3 becomes the gate)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:

```js
// lib/auth.mjs
export const CONTACTS_COOKIE  // 'contacts_auth'
export const MAX_AGE_S        // 60 * 60 * 24 * 30
export function isLocalHost(host)                       // string -> boolean
export function verifyPassword(input, expected)          // (string, string) -> boolean, constant-time
export function signSession(secret)                      // string -> '<issuedAtMs>.<hmac>'
export function verifySession(token, secret, maxAgeMs)   // -> boolean
export function hasSession(cookieStore)                  // added in Step 7; every route handler calls it
```

```js
// lib/rate-limit.mjs
export const LOGIN_POLICY     // { max: 5, windowMs: 900000, prefix: 'rl:login' }
export function rateLimit(ip, policy)   // -> { success, remaining, reset }
```

**The house gate is not middleware.** It is a server-component layout gate plus a login POST route, and mirroring that shape is deliberate: it keeps the HMAC on `node:crypto` and it avoids the redirect loop a middleware implementation usually grows. The layout renders the login form **in place** on failure — there is no redirect and no separate login page. Route handlers, which have no form to render, answer `401`.

- [ ] **Step 1: Write the failing auth tests**

Create `apps/contacts-dashboard/lib/auth.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { CONTACTS_COOKIE, MAX_AGE_S, isLocalHost, signSession, verifyPassword, verifySession } from './auth.mjs'

function withNodeEnv(value, fn) {
  const prev = process.env.NODE_ENV
  process.env.NODE_ENV = value
  try { fn() } finally {
    if (prev === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = prev
  }
}

test('F-003: in production no Host value is ever treated as local', () => {
  withNodeEnv('production', () => {
    // The Host header is client-supplied. Without this guard,
    // `Host: anything.local` opens the gate with no password.
    for (const host of ['localhost', '127.0.0.1', 'anything.local', 'evil.local:3000', '::1']) {
      assert.equal(isLocalHost(host), false, host)
    }
  })
})

test('outside production the local hosts are open, and nothing else is', () => {
  withNodeEnv('development', () => {
    assert.equal(isLocalHost('localhost:3000'), true)
    assert.equal(isLocalHost('127.0.0.1'), true)
    assert.equal(isLocalHost('::1'), true)
    assert.equal(isLocalHost('my-box.local'), true)
    assert.equal(isLocalHost('contacts.salesolution.net'), false)
  })
})

test('verifyPassword rejects an empty expected value rather than matching it', () => {
  assert.equal(verifyPassword('', ''), false)
  assert.equal(verifyPassword('hunter2', ''), false)
  assert.equal(verifyPassword('hunter2', 'hunter2'), true)
  assert.equal(verifyPassword('hunter2', 'hunter3'), false)
  // Different lengths must not throw — the compare runs over fixed-length digests.
  assert.equal(verifyPassword('short', 'a-much-longer-secret'), false)
})

test('a signed session round-trips, and a tampered or stale one does not', () => {
  const token = signSession('s3cr3t')
  assert.match(token, /^\d+\.[0-9a-f]{64}$/)
  assert.equal(verifySession(token, 's3cr3t', MAX_AGE_S * 1000), true)
  assert.equal(verifySession(token, 'other-secret', MAX_AGE_S * 1000), false)
  assert.equal(verifySession(token.replace(/.$/, '0'), 's3cr3t', MAX_AGE_S * 1000), false)
  assert.equal(verifySession(token, 's3cr3t', -1), false)          // expired
  assert.equal(verifySession('', 's3cr3t', MAX_AGE_S * 1000), false)
  assert.equal(verifySession('nodot', 's3cr3t', MAX_AGE_S * 1000), false)
  assert.equal(verifySession(token, '', MAX_AGE_S * 1000), false)  // unconfigured secret never opens the gate
})

test('the cookie name is this app\'s own, not the house one', () => {
  assert.equal(CONTACTS_COOKIE, 'contacts_auth')
})
```

Create `apps/contacts-dashboard/lib/rate-limit.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { LOGIN_POLICY, rateLimit } from './rate-limit.mjs'

test('LOGIN_POLICY is 5 tries per 15 minutes', () => {
  assert.equal(LOGIN_POLICY.max, 5)
  assert.equal(LOGIN_POLICY.windowMs, 15 * 60 * 1000)
})

test('F-002: the sixth attempt in a window is refused with a reset time', () => {
  const ip = `test-${Math.random()}`
  for (let i = 0; i < LOGIN_POLICY.max; i++) {
    assert.equal(rateLimit(ip, LOGIN_POLICY).success, true, `attempt ${i + 1}`)
  }
  const blocked = rateLimit(ip, LOGIN_POLICY)
  assert.equal(blocked.success, false)
  assert.equal(blocked.remaining, 0)
  assert.ok(blocked.reset > Date.now())
})

test('one IP being throttled does not throttle another', () => {
  const a = `a-${Math.random()}`
  const b = `b-${Math.random()}`
  for (let i = 0; i < LOGIN_POLICY.max + 2; i++) rateLimit(a, LOGIN_POLICY)
  assert.equal(rateLimit(b, LOGIN_POLICY).success, true)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './auth.mjs'` and `Cannot find module './rate-limit.mjs'`.

- [ ] **Step 3: Write `auth.mjs` and `rate-limit.mjs`**

`apps/contacts-dashboard/lib/auth.mjs`:

```js
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Auth primitives for the contacts dashboard (server-only — imports node:crypto).
 *
 * The same shape as the house /sales gate: no DB, no session store. The cookie
 * value is `<issuedAtMs>.<hmac>`, signed with CONTACTS_DASHBOARD_SESSION_SECRET,
 * and self-expires. Verified in app/layout.tsx, minted in app/api/login/route.ts.
 *
 * This app's password is its OWN value. One password already opens both /sales
 * and /strategy; a third surface on the same secret makes any future rotation a
 * three-place change nobody remembers to finish.
 */

export const CONTACTS_COOKIE = 'contacts_auth'
export const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

/**
 * True when the request host is a local dev host (the gate is open there).
 *
 * The Host header is client-supplied, so this must never be reachable from a
 * production request — otherwise `Host: anything.local` opens the dashboard with
 * no password (finding F-003). On Vercel NODE_ENV is `production`, so the
 * localhost convenience is dev-only and stays that way.
 */
export function isLocalHost(host) {
  if (process.env.NODE_ENV === 'production') return false
  const h = String(host ?? '').toLowerCase().split(':')[0].trim()
  return LOCAL_HOSTS.has(h) || h.endsWith('.local')
}

function hmacHex(secret, value) {
  return createHmac('sha256', secret).update(value).digest('hex')
}

/** Constant-time compare via fixed-length SHA-256 digests (no length leak, no throw). */
function safeEqual(a, b) {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest())
}

/** Verify the submitted password against CONTACTS_DASHBOARD_PASSWORD, constant-time. */
export function verifyPassword(input, expected) {
  if (!expected) return false
  return safeEqual(String(input ?? ''), String(expected))
}

/** Mint a signed session token: `<issuedAtMs>.<hmac>`. */
export function signSession(secret) {
  const iat = String(Date.now())
  return `${iat}.${hmacHex(secret, iat)}`
}

/** Verify a token's signature and that it was issued within maxAgeMs. */
export function verifySession(token, secret, maxAgeMs) {
  if (!secret || !token) return false
  const dot = token.indexOf('.')
  if (dot <= 0) return false
  const iat = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = hmacHex(secret, iat)
  if (sig.length !== expected.length) return false
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  const issued = Number(iat)
  if (!Number.isFinite(issued)) return false
  return Date.now() - issued < maxAgeMs
}
```

`apps/contacts-dashboard/lib/rate-limit.mjs`:

```js
/**
 * A sliding-window limiter for the login route.
 *
 * The constant-time password compare stops a timing leak and does nothing about
 * volume; unthrottled guessing is the whole gate otherwise (finding F-002).
 * In-memory and per-instance, which is the right size here: this app has one
 * user and one password, and adding Redis for it would be a dependency to keep a
 * single operator honest.
 */

/** Password gates: 5 per 15 minutes. Enough tries to survive a few typos. */
export const LOGIN_POLICY = { max: 5, windowMs: 15 * 60 * 1000, prefix: 'rl:login' }

const hits = new Map()

export function rateLimit(ip, policy = LOGIN_POLICY) {
  const now = Date.now()
  const key = `${policy.prefix}:${ip}`
  const recent = (hits.get(key) ?? []).filter((t) => now - t < policy.windowMs)
  if (recent.length >= policy.max) {
    hits.set(key, recent)
    return { success: false, remaining: 0, reset: Math.min(...recent) + policy.windowMs }
  }
  recent.push(now)
  hits.set(key, recent)
  return { success: true, remaining: policy.max - recent.length, reset: now + policy.windowMs }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 25 tests, 0 failures.

- [ ] **Step 5: Write the login form and the login route**

`apps/contacts-dashboard/components/Login.tsx`:

```tsx
'use client'

import { useState } from 'react'

/**
 * The password wall. The root layout renders this in place of the app when a
 * request has no valid session cookie — in place, not via a redirect, which is
 * what keeps the gate free of redirect loops.
 */
export function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.assign('/')
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Wrong password.')
      setBusy(false)
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  return (
    <main>
      <form onSubmit={onSubmit} style={{ maxWidth: 320 }}>
        <h1>Contacts — private</h1>
        <p className="muted">Enter the password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-label="Password"
          style={{ width: '100%', padding: '8px 10px', marginTop: 12 }}
        />
        {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
        <button type="submit" disabled={busy || !password} style={{ width: '100%', padding: '8px 10px', marginTop: 12 }}>
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  )
}
```

`apps/contacts-dashboard/app/api/login/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'

import { CONTACTS_COOKIE, MAX_AGE_S, signSession, verifyPassword } from '@/lib/auth.mjs'
import { LOGIN_POLICY, rateLimit } from '@/lib/rate-limit.mjs'

/**
 * POST /api/login — the only route handler that does not require a session,
 * because it is the one that mints one. It touches no data: no Supabase client
 * is imported here.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.CONTACTS_DASHBOARD_PASSWORD
  const secret = process.env.CONTACTS_DASHBOARD_SESSION_SECRET
  if (!expected || !secret) {
    return NextResponse.json({ ok: false, error: 'The dashboard is not configured.' }, { status: 500 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const limit = rateLimit(ip, LOGIN_POLICY)
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} min.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!verifyPassword(password, expected)) {
    return NextResponse.json({ ok: false, error: 'Wrong password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(CONTACTS_COOKIE, signSession(secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_S,
  })
  return res
}
```

- [ ] **Step 6: Turn the root layout into the gate**

Replace `apps/contacts-dashboard/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'

import { Login } from '@/components/Login'
import { CONTACTS_COOKIE, MAX_AGE_S, isLocalHost, verifySession } from '@/lib/auth.mjs'

import './globals.css'

/** The gate must run on every request, so this subtree is never static. */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contacts',
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get('host') ?? ''
  let allowed = isLocalHost(host)

  if (!allowed) {
    const token = (await cookies()).get(CONTACTS_COOKIE)?.value ?? ''
    allowed = verifySession(token, process.env.CONTACTS_DASHBOARD_SESSION_SECRET ?? '', MAX_AGE_S * 1000)
  }

  return (
    <html lang="en">
      <body>{allowed ? children : <Login />}</body>
    </html>
  )
}
```

- [ ] **Step 7: Add the session guard every later route handler calls**

Append to `apps/contacts-dashboard/lib/auth.mjs`:

```js
/**
 * Every route handler in this app verifies the session before touching data.
 * There is no health endpoint, no /api/rows, and no debug route that skips the
 * check "just for now" — that exception is the one that stays.
 *
 * @param {{ get: (name: string) => {value: string} | undefined }} cookieStore
 * @returns {boolean}
 */
export function hasSession(cookieStore) {
  const token = cookieStore?.get(CONTACTS_COOKIE)?.value ?? ''
  return verifySession(token, process.env.CONTACTS_DASHBOARD_SESSION_SECRET ?? '', MAX_AGE_S * 1000)
}
```

- [ ] **Step 8: Verify the gate locally**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard"
pnpm test && pnpm build
NODE_ENV=production CONTACTS_DASHBOARD_PASSWORD=test-only CONTACTS_DASHBOARD_SESSION_SECRET=$(openssl rand -hex 32) pnpm start &
sleep 6
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
curl -s http://127.0.0.1:3000/ | grep -c 'Enter the password'
curl -s -X POST http://127.0.0.1:3000/api/login -H 'content-type: application/json' -d '{"password":"wrong"}' -o /dev/null -w '%{http_code}\n'
for i in 1 2 3 4 5 6; do curl -s -X POST http://127.0.0.1:3000/api/login -H 'content-type: application/json' -d '{"password":"wrong"}' -o /dev/null -w '%{http_code} '; done; echo
curl -si -X POST http://127.0.0.1:3000/api/login -H 'content-type: application/json' -d '{"password":"test-only"}' | grep -i 'set-cookie'
kill %1
```
Expected: `200` (the page renders, but it is the wall); `1` (the password form is what rendered — no data); `401`; `401 401 401 401 429 429` with a `Retry-After` on the 429s; and a `set-cookie: contacts_auth=…; Path=/; HttpOnly; Secure; SameSite=Lax` line.

- [ ] **Step 9: Confirm the F-003 guard is in place**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new" && grep -n "NODE_ENV === 'production'" apps/contacts-dashboard/lib/auth.mjs`
Expected: one line, inside `isLocalHost`. That single line is what makes the Host-header path safe.

- [ ] **Step 10: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/lib/auth.mjs apps/contacts-dashboard/lib/auth.test.mjs apps/contacts-dashboard/lib/rate-limit.mjs apps/contacts-dashboard/lib/rate-limit.test.mjs apps/contacts-dashboard/components/Login.tsx apps/contacts-dashboard/app/api/login/route.ts apps/contacts-dashboard/app/layout.tsx
git commit -m "feat(contacts-dashboard): password gate mirroring the house pattern, rate-limited"
```

---

### Task 6: The locations sheet

> ⚠️ **AMEND before building — `02` AMENDMENT 2.** Delete the **show-all columns toggle** and the per-row **`raw` panel**: both expose campaign and Apollo fields to a client one click deep. The 14-column whitelist becomes a **server-enforced security control**, not a view default. Add the project switcher. Every filter below — source/brand multi-select, state, derived US/Non-US country, core-category range, name search — ships unchanged.

**Files:**
- Create: `apps/contacts-dashboard/lib/sources.mjs`
- Create: `apps/contacts-dashboard/lib/sources.test.mjs`
- Create: `apps/contacts-dashboard/components/Counters.tsx`
- Create: `apps/contacts-dashboard/components/Filters.tsx`
- Create: `apps/contacts-dashboard/components/Sheet.tsx`
- Create: `apps/contacts-dashboard/components/Nav.tsx`
- Modify: `apps/contacts-dashboard/app/page.tsx` (the scaffold from Task 3 becomes the sheet)

**Interfaces:**
- Consumes, from Task 4 — `parseSheetParams`, `countryOf`, `pageRange` (`lib/query.mjs`); `LOCATION_COLUMNS`, `TYPED_COLUMNS`, `DEFAULT_PAGE_SIZE`, `SHOW_ALL_PAGE_SIZE` (`lib/columns.mjs`); `fetchSheet`, `fetchCounters`, `fetchFacets`, `fetchGeneration`, `countMatching`, and the `SheetParams` / `Counters` types (`lib/contacts.ts`).
- Produces:

```js
// lib/sources.mjs
export const SOURCE_PHRASE      // Record<token, string> — the noun phrase after "Verified from "
export function sourcePhrase(token)                        // string -> string, falls back to the raw token
export function sourceLabel(token)                         // string -> string, the chip text
export function monthYear(iso)                             // '2026-08-01' -> 'Aug 2026'; null -> null
export function provenanceLine(token, captured)            // -> 'Verified from the Enerpac distributor locator, Aug 2026'
export function provenanceRows(source, sourceUrl, captured) // -> {rows: [{token,label,line,url,captured}], missing: boolean}
export function newTokens(dataTokens, registryTokens)      // -> string[]
export function plannedTokens(dataTokens, registryTokens)  // -> string[]
```

**What ships, and what does not.** Five filters: source/brand multi-select, state multi-select, derived country (United States / Non-US), a core-category range, and a name search. Per-row source chips with `found in N lists`, and a provenance expander with named provenance. Both counter rows. Tier, size, verification, disposition and pool filters are **not in this build** — adding one later is a feature request, not a policy reversal.

**`category_core` is a number, not a token.** It is the weighted count of core industrial codes (`1.5`, `4.5`, `6.5` …), so a token-to-label map has nothing to map. The control ships as a min/max range, labeled for what it is. A real category-label column does not exist and is a pipeline task.

**Nothing here is labeled "revenue."** Revenue data does not exist yet. No revenue tile, no revenue filter, no element carrying the word — a missing revenue written as `0` would put every unenriched company under a `<$1M` filter and delete them from every view.

- [ ] **Step 1: Write the failing provenance tests**

Create `apps/contacts-dashboard/lib/sources.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { monthYear, newTokens, plannedTokens, provenanceLine, provenanceRows, sourceLabel, sourcePhrase } from './sources.mjs'

test('monthYear reads the month off an ISO date and refuses anything else', () => {
  assert.equal(monthYear('2026-08-01'), 'Aug 2026')
  assert.equal(monthYear('2026-01-31'), 'Jan 2026')
  assert.equal(monthYear('not-a-date'), null)
  assert.equal(monthYear(null), null)
})

test('provenanceLine ships the C-G4 wording for every token kind', () => {
  assert.equal(provenanceLine('enerpac', '2026-08-01'), 'Verified from the Enerpac distributor locator, Aug 2026')
  assert.equal(provenanceLine('timken', '2026-08-01'), 'Verified from the Timken authorized distributor list, Aug 2026')
  assert.equal(provenanceLine('serp', '2026-08-01'), "Verified from the company's own website, Aug 2026")
  assert.equal(provenanceLine('ptda', '2026-08-01'), 'Verified from the PTDA member directory, Aug 2026')
  assert.equal(provenanceLine('ad', '2026-08-01'), 'Verified from the AD member directory, Aug 2026')
  // dfs is included now — the licensing gate dissolved on 2026-08-07.
  assert.equal(provenanceLine('dfs', '2026-08-01'), 'Verified from the DataForSEO business listings, Aug 2026')
})

test('an unmapped token degrades to the raw token instead of being dropped', () => {
  // Dropping it would make "found in N lists" a lie. There is no third party to
  // leak internal vocabulary to, so the raw token is the honest fallback.
  assert.equal(sourcePhrase('adaptall-export'), 'the adaptall-export source')
  assert.equal(sourceLabel('adaptall-export'), 'adaptall-export')
  assert.equal(sourceLabel('enerpac'), 'Enerpac')
  assert.equal(provenanceLine('adaptall-export', '2026-08-01'), 'Verified from the adaptall-export source, Aug 2026')
})

test('provenanceRows zips source to url and date when the chains agree', () => {
  const out = provenanceRows(
    'timken|dfs',
    'https://a.example/x|https://b.example/y',
    '2026-08-01|2026-08-03',
  )
  assert.equal(out.missing, false)
  assert.deepEqual(out.rows.map((r) => [r.token, r.url, r.captured]), [
    ['timken', 'https://a.example/x', '2026-08-01'],
    ['dfs', 'https://b.example/y', '2026-08-03'],
  ])
  assert.equal(out.rows[0].line, 'Verified from the Timken authorized distributor list, Aug 2026')
})

test('when the chains disagree in length, every line falls back to the earliest date', () => {
  // Real data: source and captured lengths disagree on ~40% of seated rows, so
  // zipping blindly would attach the wrong date to the wrong source.
  const out = provenanceRows('timken|dfs|serp', 'https://a.example/x', '2026-08-01')
  assert.equal(out.rows.length, 3)
  assert.deepEqual(out.rows.map((r) => r.captured), ['2026-08-01', '2026-08-01', '2026-08-01'])
  assert.equal(out.rows[0].url, null)
  assert.equal(out.rows[1].url, null)
})

test('a row with no provenance is marked as the defect it is', () => {
  // Provenance is 100% filled on every current file, so a blank is a bug and
  // renders as one — never an empty row that reads as "no source".
  const out = provenanceRows(null, null, null)
  assert.equal(out.missing, true)
  assert.deepEqual(out.rows, [])
})

test('newTokens flags data arriving from a source with no folder', () => {
  assert.deepEqual(newTokens(['dfs', 'timken', 'adaptall-export'], ['dfs', 'timken', 'apollo-enrichment']), ['adaptall-export'])
  // Match on the TOKEN only: a status rename must never make the badge flicker.
  assert.deepEqual(newTokens(['dfs'], ['dfs']), [])
})

test('plannedTokens is the inverse, and it is not an error', () => {
  // A registry row with no data token is a source that has not run yet.
  assert.deepEqual(plannedTokens(['dfs'], ['dfs', 'apollo-enrichment', 'ranked-out-backlog']), ['apollo-enrichment', 'ranked-out-backlog'])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './sources.mjs'`.

- [ ] **Step 3: Write `sources.mjs`**

```js
/**
 * sources — display names and the named-provenance line.
 *
 * "Verified" is a strong word and it should be. It means: we recorded the page,
 * the date and the link, and the link is in the row. Every token below meets
 * that bar.
 *
 * This map is a DISPLAY map, not an allowlist. The licensing gate dissolved on
 * 2026-08-07 (internal audience, no redistribution), so every token renders —
 * `dfs` included — and a token with no entry falls back to the raw token rather
 * than being dropped. Dropping it would make "found in N lists" a lie.
 */

/** The noun phrase that follows "Verified from ". */
export const SOURCE_PHRASE = {
  ad: 'the AD member directory',
  adaptall: 'the Adaptall distributor lookup',
  atlascopco: 'the Atlas Copco distributor locator',
  ballymore: 'the Ballymore dealer locator',
  banjo: 'the Banjo distributor locator',
  banner: 'the Banner Engineering distributor locator',
  bobcat: 'the Bobcat dealer locator',
  boschrexroth: 'the Bosch Rexroth distributor locator',
  caseih: 'the Case IH dealer locator',
  cmco: 'the Columbus McKinnon distributor locator',
  continental: 'the Continental distributor locator',
  dfs: 'the DataForSEO business listings',
  dorner: 'the Dorner distributor locator',
  enerpac: 'the Enerpac distributor locator',
  festo: 'the Festo distributor locator',
  flexlink: 'the FlexLink partner locator',
  gast: 'the Gast distributor locator',
  indsci: 'the Industrial Scientific distributor locator',
  interroll: 'the Interroll partner locator',
  kennametal: 'the Kennametal distributor list',
  kubota: 'the Kubota dealer locator',
  lincolnelectric: 'the Lincoln Electric distributor locator',
  lovejoy: 'the Lovejoy distributor locator',
  mknorthamerica: 'the MK North America partner locator',
  nord: 'the NORD distributor locator',
  ntn: 'the NTN distributor locator',
  ocenco: 'the Ocenco distributor list',
  pepperlfuchs: 'the Pepperl+Fuchs distributor locator',
  ptda: 'the PTDA member directory',
  quincy: 'the Quincy Compressor dealer locator',
  samsonrope: 'the Samson Rope distributor locator',
  serp: "the company's own website",
  skf: 'the SKF distributor locator',
  spxflow: 'the SPX FLOW distributor locator',
  sullair: 'the Sullair distributor locator',
  timken: 'the Timken authorized distributor list',
  usaspending: 'the USAspending federal award records',
  waltersurface: 'the Walter Surface Technologies distributor locator',
  yaskawa: 'the Yaskawa distributor locator',
}

/** Chip text: the brand name where we have one, the raw token where we do not. */
export function sourceLabel(token) {
  const phrase = SOURCE_PHRASE[token]
  if (!phrase) return String(token)
  // "the Enerpac distributor locator" -> "Enerpac"; "the PTDA member directory" -> "PTDA"
  const words = phrase.replace(/^the /, '').split(' ')
  return /^[A-Z0-9+]/.test(words[0]) ? words[0] : String(token)
}

export function sourcePhrase(token) {
  return SOURCE_PHRASE[token] ?? `the ${token} source`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-08-01' -> 'Aug 2026'. Anything unparseable is null, never a guess. */
export function monthYear(iso) {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso ?? ''))
  if (!m) return null
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${month} ${m[1]}` : null
}

/** The C-G4 wording: "Verified from {phrase}, {Mon YYYY}". */
export function provenanceLine(token, captured) {
  const when = monthYear(captured)
  return when ? `Verified from ${sourcePhrase(token)}, ${when}` : `Verified from ${sourcePhrase(token)}`
}

const chain = (v) => String(v ?? '').split('|').map((s) => s.trim()).filter(Boolean)

/**
 * One provenance line per source token.
 *
 * `source`, `source_url` and `captured` are all pipe chains, and their lengths
 * disagree on roughly 40% of seated rows. Zipping blindly attaches the wrong
 * date to the wrong source, so the zip only runs when a chain is exactly as long
 * as the source chain; otherwise the earliest recorded date stands for the row
 * and the URL is withheld rather than mis-assigned.
 */
export function provenanceRows(source, sourceUrl, captured) {
  const tokens = chain(source)
  if (!tokens.length) return { rows: [], missing: true }

  const urls = chain(sourceUrl)
  const dates = chain(captured)
  const zipUrls = urls.length === tokens.length
  const zipDates = dates.length === tokens.length
  const fallbackDate = dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()[0] ?? null

  const rows = tokens.map((token, i) => {
    const when = zipDates ? dates[i] : fallbackDate
    return {
      token,
      label: sourceLabel(token),
      line: provenanceLine(token, when),
      url: zipUrls ? urls[i] : urls.length === 1 && tokens.length === 1 ? urls[0] : null,
      captured: when,
    }
  })
  return { rows, missing: false }
}

/**
 * Tokens arriving in the data from a source with no handoff folder.
 *
 * The founder's mechanism for "tell me when we're pulling from somewhere I don't
 * know about." Matched on the token only, so renaming a folder's status never
 * makes the badge flicker. It clears when someone creates the folder and
 * re-syncs — there is no dismiss control.
 */
export function newTokens(dataTokens, registryTokens) {
  const known = new Set(registryTokens ?? [])
  return [...new Set(dataTokens ?? [])].filter((t) => !known.has(t)).sort()
}

/** The inverse: a registry row with no data token. That is PLANNED, not an error. */
export function plannedTokens(dataTokens, registryTokens) {
  const seen = new Set(dataTokens ?? [])
  return [...new Set(registryTokens ?? [])].filter((t) => !seen.has(t)).sort()
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 33 tests, 0 failures.

- [ ] **Step 5: Write the nav and the counters**

`apps/contacts-dashboard/components/Nav.tsx`:

```tsx
import Link from 'next/link'

export function Nav({ generation, project }: { generation: string | null; project: string | null }) {
  return (
    <nav style={{ borderBottom: '1px solid var(--rule)', padding: '10px 24px', display: 'flex', gap: 16, alignItems: 'baseline' }}>
      <Link href="/">Locations</Link>
      <Link href="/sources">Sources</Link>
      <Link href="/pools">Pools</Link>
      <Link href="/projects">Projects</Link>
      <span className="muted" style={{ marginLeft: 'auto' }}>
        {generation ?? 'no generation synced'}
        {project ? ` · view: ${project}` : ''}
      </span>
    </nav>
  )
}
```

`apps/contacts-dashboard/components/Counters.tsx` — both sets coexist: three where you are reading locations, three where you are reading the asset. Each says what it counts.

```tsx
import type { Counters as CountersType } from '@/lib/contacts'

const fmt = (n: number) => n.toLocaleString('en-US')

export function Counters({ counters }: { counters: CountersType }) {
  return (
    <>
      <p className="muted" style={{ margin: '0 0 6px' }}>
        A row is one address record, and rows were deduped by domain — &ldquo;locations shown&rdquo; is the number of
        records we hold, not necessarily the number of physical branches. The Locations column is each company&rsquo;s own
        claim and is a different number.
      </p>
      <ul className="counters">
        <li><b>{fmt(counters.locations)}</b><span>Locations shown — rows in the current filter</span></li>
        <li><b>{fmt(counters.brands)}</b><span>Brands covered — distinct source tokens</span></li>
        <li><b>{fmt(counters.states)}</b><span>States covered — distinct non-empty states</span></li>
      </ul>
      <ul className="counters">
        <li><b>{fmt(counters.companies)}</b><span>companies — unique domains ({fmt(counters.no_domain)} rows carry no domain and are counted separately)</span></li>
        <li><b>{fmt(counters.people)}</b><span>people — rows with a named contact</span></li>
        <li><b>{fmt(counters.sendable)}</b><span>sendable — email verified valid</span></li>
      </ul>
    </>
  )
}
```

- [ ] **Step 6: Write the filters and the sheet**

`apps/contacts-dashboard/components/Filters.tsx` — a plain GET form, so filter state lives in the URL and the export can be handed the same query string.

```tsx
import type { SheetParams } from '@/lib/contacts'

export function Filters({
  params,
  facets,
}: {
  params: SheetParams
  facets: { states: string[]; sources: string[] }
}) {
  return (
    <form method="get" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', margin: '0 0 14px' }}>
      <label>
        <div className="muted">Source / brand</div>
        <select name="source" multiple size={5} defaultValue={params.sources}>
          {facets.sources.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <div className="muted">State</div>
        <select name="state" multiple size={5} defaultValue={params.states}>
          {facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>
        <div className="muted">Country</div>
        <select name="country" defaultValue={params.country ?? ''}>
          <option value="">Any</option>
          <option value="us">United States</option>
          <option value="non-us">Non-US</option>
        </select>
        <div className="muted" style={{ maxWidth: 210 }}>Derived from pool membership — no country column exists.</div>
      </label>
      <label>
        <div className="muted">Core-category score</div>
        <input type="number" step="0.5" name="catMin" placeholder="min" defaultValue={params.catMin ?? ''} style={{ width: 70 }} />
        <input type="number" step="0.5" name="catMax" placeholder="max" defaultValue={params.catMax ?? ''} style={{ width: 70 }} />
        <div className="muted" style={{ maxWidth: 240 }}>
          Weighted count of core industrial codes — not a category name. A category-label column does not exist yet.
        </div>
      </label>
      <label>
        <div className="muted">Name or domain</div>
        <input type="search" name="q" defaultValue={params.q} />
      </label>
      <label>
        <input type="checkbox" name="show" value="all" defaultChecked={params.showAll} /> Show all columns
      </label>
      <button type="submit">Apply</button>
    </form>
  )
}
```

`apps/contacts-dashboard/components/Sheet.tsx` — every string renders through React's default escaping. No `dangerouslySetInnerHTML` anywhere in this app: `self_declaration_verbatim` is scraped, untrusted, and carries embedded newlines.

```tsx
import { LOCATION_COLUMNS, TYPED_COLUMNS } from '@/lib/columns.mjs'
import { countryOf } from '@/lib/query.mjs'
import { provenanceRows } from '@/lib/sources.mjs'
import type { SheetParams } from '@/lib/contacts'

type Row = Record<string, unknown>

/** The 14 visible headings: company + company_display collapse into one cell. */
const DEFAULT_HEADINGS = [
  ['company_display', 'Company'],
  ['address_1', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['zip5', 'ZIP'],
  ['country', 'Country'],
  ['phone_e164', 'Phone'],
  ['domain', 'Website'],
  ['category_core', 'Core-category score'],
  ['brand_authorized', 'Brands authorized'],
  ['line_card', 'Line card'],
  ['source', 'Sources'],
  ['captured', 'Captured'],
  ['location_count', "Locations (company's own claim)"],
] as const

const text = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(v))

function sortHref(params: SheetParams, column: string) {
  const sp = new URLSearchParams()
  for (const s of params.sources) sp.append('source', s)
  for (const s of params.states) sp.append('state', s)
  if (params.country) sp.set('country', params.country)
  if (params.catMin !== null) sp.set('catMin', String(params.catMin))
  if (params.catMax !== null) sp.set('catMax', String(params.catMax))
  if (params.q) sp.set('q', params.q)
  if (params.showAll) sp.set('show', 'all')
  sp.set('sort', column)
  sp.set('dir', params.sort === column && params.dir === 'asc' ? 'desc' : 'asc')
  return `/?${sp.toString()}`
}

export function Sheet({ rows, params }: { rows: Row[]; params: SheetParams }) {
  const headings = params.showAll
    ? TYPED_COLUMNS.filter((c: string) => c !== 'id').map((c: string) => [c, c] as const)
    : DEFAULT_HEADINGS

  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            <th>Provenance</th>
            {headings.map(([key, label]) => (
              <th key={key}>
                {key === 'country' ? label : <a href={sortHref(params, key)}>{label}</a>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const prov = provenanceRows(row.source, row.source_url, row.captured)
            return (
              <tr key={String(row.id)}>
                <td>
                  <details>
                    <summary>
                      {prov.missing ? (
                        <span className="chip warn">provenance missing</span>
                      ) : (
                        <>
                          {prov.rows.map((p) => <span key={p.token} className="chip">{p.label}</span>)}
                          <span className="muted"> found in {prov.rows.length} list{prov.rows.length === 1 ? '' : 's'}</span>
                        </>
                      )}
                    </summary>
                    {prov.missing ? (
                      <p className="warn">No source recorded. Provenance is 100% filled on every current file, so this is a bug.</p>
                    ) : (
                      <ul>
                        {prov.rows.map((p) => (
                          <li key={p.token}>
                            {p.line}
                            {p.url ? <> · <a href={p.url} target="_blank" rel="noopener noreferrer">{p.url}</a></> : null}
                            {p.captured ? <> · captured {p.captured}</> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    {params.showAll ? (
                      <pre style={{ whiteSpace: 'pre-wrap', maxWidth: 900 }}>{JSON.stringify(row.raw ?? {}, null, 2)}</pre>
                    ) : null}
                  </details>
                </td>
                {headings.map(([key]) => (
                  <td key={key}>
                    {key === 'country'
                      ? countryOf(row.pool)
                      : key === 'domain' && row.domain
                        ? <a href={`https://${String(row.domain)}`} target="_blank" rel="noopener noreferrer">{String(row.domain)}</a>
                        : text(row[key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="muted">No rows match this filter.</p> : null}
      <p className="muted">Default view: {LOCATION_COLUMNS.length} fields as 14 columns. Tick &ldquo;show all columns&rdquo; for the full set and the raw row.</p>
    </div>
  )
}
```

- [ ] **Step 7: Wire the page**

Replace `apps/contacts-dashboard/app/page.tsx`:

```tsx
import { Counters } from '@/components/Counters'
import { Filters } from '@/components/Filters'
import { Nav } from '@/components/Nav'
import { Sheet } from '@/components/Sheet'
import { countMatching, fetchCounters, fetchFacets, fetchGeneration, fetchSheet } from '@/lib/contacts'
import { readMode } from '@/lib/mode.mjs'
import { pageRange, parseSheetParams } from '@/lib/query.mjs'

export const dynamic = 'force-dynamic'

const { project } = readMode(process.env)

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(await searchParams)) {
    for (const one of Array.isArray(v) ? v : [v]) if (one !== undefined) sp.append(k, one)
  }
  const params = parseSheetParams(sp)
  const { pageSize } = pageRange(params)

  const [{ rows }, counters, facets, generation, total] = await Promise.all([
    fetchSheet(params),
    fetchCounters(params),
    fetchFacets(),
    fetchGeneration(),
    countMatching(params),
  ])

  const exportHref = `/api/export?${sp.toString()}`
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <Nav generation={generation} project={project} />
      <main>
        <h1>Locations</h1>
        <Counters counters={counters} />
        <Filters params={params} facets={facets} />
        <p>
          <a href={exportHref}>Download CSV of this filter</a>{' '}
          <span className="muted">
            page {params.page} of {lastPage.toLocaleString('en-US')} · {pageSize} rows per page
          </span>
        </p>
        <Sheet rows={rows} params={params} />
      </main>
    </>
  )
}
```

- [ ] **Step 8: Verify against live data**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard"
pnpm test && pnpm build
DASHBOARD_MODE=internal pnpm dev
```
Open `http://localhost:3000/` and confirm: six counters, each labeled with what it counts; the five filters; 14 columns; the show-all toggle revealing the full set and a `raw` panel; source chips with `found in N lists`; a provenance expander whose links open the recorded `source_url`. Change a filter and confirm all six counters move with the sheet.

- [ ] **Step 9: Confirm the payload and the guards**

With the dev server running, in the browser devtools Network tab check the document response for a filtered request: it must carry at most 500 rows (100 with show-all on), never the full set.

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
grep -rn "dangerouslySetInnerHTML" apps/contacts-dashboard/
grep -rni "revenue" apps/contacts-dashboard/app apps/contacts-dashboard/components
grep -rni "smartlead" apps/contacts-dashboard/
```
Expected: all three print nothing.

- [ ] **Step 10: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/lib/sources.mjs apps/contacts-dashboard/lib/sources.test.mjs apps/contacts-dashboard/components/ apps/contacts-dashboard/app/page.tsx
git commit -m "feat(contacts-dashboard): the locations sheet — 14 columns, show-all, named provenance, six counters"
```

---

### Task 7: CSV export

**Files:**
- Create: `apps/contacts-dashboard/lib/csv.mjs`
- Create: `apps/contacts-dashboard/lib/csv.test.mjs`
- Create: `apps/contacts-dashboard/app/api/export/route.ts`

**Interfaces:**
- Consumes, from Task 4 — `parseSheetParams` (`lib/query.mjs`), `LOCATION_COLUMNS`, `TYPED_COLUMNS` (`lib/columns.mjs`), `fetchPage`, `countMatching` (`lib/contacts.ts`). From Task 5 — `hasSession(cookieStore)` (`lib/auth.mjs`).
- Produces:

```js
// lib/csv.mjs
export const EXPORT_CAP        // 10000
export const OVER_CAP_MESSAGE  // "That's more than 10,000 locations. Narrow the filter and try again."
export const EXPORT_BATCH      // 1000
export function csvCell(v)                        // unknown -> string
export function csvLine(values)                   // unknown[] -> string, newline-terminated
export function exportColumns(showAll)            // boolean -> string[]
export function exportFilename(project, isoDate)  // -> 'field-advisor-locations-2026-08-07.csv'
```

**The export is the current filter, not the current page and not the whole set.** It goes through the same query builder as the sheet — two code paths is how an export ends up with a column the page does not show. Over 10,000 rows it refuses with the message and downloads nothing: a truncated CSV looks complete, which is the kind of quiet wrongness this workspace keeps paying for.

- [ ] **Step 1: Write the failing tests**

Create `apps/contacts-dashboard/lib/csv.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { EXPORT_CAP, OVER_CAP_MESSAGE, csvCell, csvLine, exportColumns, exportFilename } from './csv.mjs'

test('csvCell quotes anything that would corrupt a row', () => {
  // Company names carry commas routinely, and scraped declarations carry newlines.
  assert.equal(csvCell('Hirsch Pipe & Supply Co., Inc.'), '"Hirsch Pipe & Supply Co., Inc."')
  assert.equal(csvCell('say "hi"'), '"say ""hi"""')
  assert.equal(csvCell('two\nlines'), '"two\nlines"')
  assert.equal(csvCell('plain'), 'plain')
  assert.equal(csvCell(null), '')
  assert.equal(csvCell(undefined), '')
  assert.equal(csvCell(0), '0')            // a real zero survives; only null/undefined blank out
  assert.equal(csvCell(false), 'false')
  assert.equal(csvCell({ a: 1 }), '"{""a"":1}"')
})

test('csvLine joins and terminates', () => {
  assert.equal(csvLine(['a', 'b,c', null]), 'a,"b,c",\n')
})

test('exportColumns follows the toggle — the export matches what the sheet is showing', () => {
  assert.deepEqual(exportColumns(false), [
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
    'source', 'source_url', 'captured', 'location_count',
  ])
  const all = exportColumns(true)
  assert.equal(all.includes('email'), true)      // show-all means everything, Apollo fields included
  assert.equal(all.includes('tier'), true)
  assert.equal(all.includes('raw'), false)       // the raw JSONB is a screen panel, not a CSV column
})

test('exportFilename carries the project and the date', () => {
  assert.equal(exportFilename('field-advisor', '2026-08-07'), 'field-advisor-locations-2026-08-07.csv')
  assert.equal(exportFilename(null, '2026-08-07'), 'contacts-locations-2026-08-07.csv')
})

test('the cap is 10,000 and the refusal never truncates', () => {
  assert.equal(EXPORT_CAP, 10000)
  assert.match(OVER_CAP_MESSAGE, /more than 10,000 locations/)
  assert.match(OVER_CAP_MESSAGE, /Narrow the filter/)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './csv.mjs'`.

- [ ] **Step 3: Write `csv.mjs`**

```js
/**
 * csv — the export writer.
 *
 * RFC 4180 quoting, because company names carry commas ("Hirsch Pipe & Supply
 * Co., Inc.") and scraped declarations carry newlines. A naive writer corrupts
 * every row that has one.
 */
import { LOCATION_COLUMNS, TYPED_COLUMNS } from './columns.mjs'

/** Beyond this the export refuses. It never truncates — a short CSV looks complete. */
export const EXPORT_CAP = 10000

export const OVER_CAP_MESSAGE = "That's more than 10,000 locations. Narrow the filter and try again."

/** Rows pulled per round trip while streaming. */
export const EXPORT_BATCH = 1000

export function csvCell(v) {
  if (v === undefined || v === null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function csvLine(values) {
  return `${values.map(csvCell).join(',')}\n`
}

/**
 * The columns the export writes: whatever the sheet is showing. With the toggle
 * on that means everything, campaign and Apollo fields included. `raw` is
 * excluded — it is the whole row again, and a CSV cell holding a JSON blob of
 * every other cell is noise, not data.
 */
export function exportColumns(showAll) {
  return showAll ? TYPED_COLUMNS.filter((c) => c !== 'raw') : [...LOCATION_COLUMNS]
}

export function exportFilename(project, isoDate) {
  return `${project || 'contacts'}-locations-${isoDate}.csv`
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 38 tests, 0 failures.

- [ ] **Step 5: Write the export route**

`apps/contacts-dashboard/app/api/export/route.ts`:

```ts
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { hasSession } from '@/lib/auth.mjs'
import { isRealColumn } from '@/lib/columns.mjs'
import { countMatching, fetchPage } from '@/lib/contacts'
import { EXPORT_BATCH, EXPORT_CAP, OVER_CAP_MESSAGE, csvLine, exportColumns, exportFilename } from '@/lib/csv.mjs'
import { readMode } from '@/lib/mode.mjs'
import { parseSheetParams } from '@/lib/query.mjs'

export const dynamic = 'force-dynamic'

const { project } = readMode(process.env)

/**
 * GET /api/export — the current filter as CSV.
 *
 * Session-checked like every route handler in this app. The client sends filter
 * parameters, never a column list and never rows; the columns come from the same
 * constant the sheet renders from, so the file and the screen cannot disagree.
 */
export async function GET(req: NextRequest) {
  if (!hasSession(await cookies())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  // Schema guard. The sheet falls back to a real sort column so a bad URL still
  // renders; the export refuses and logs, because a request naming a column that
  // does not exist is either a bug or someone probing, and both deserve a line.
  const requestedSort = req.nextUrl.searchParams.get('sort')
  if (requestedSort && !isRealColumn(requestedSort)) {
    console.log(`[export] rejected unknown column "${requestedSort}" at=${new Date().toISOString()}`)
    return NextResponse.json({ error: `Unknown column "${requestedSort}".` }, { status: 400 })
  }

  const params = parseSheetParams(req.nextUrl.searchParams)
  const total = await countMatching(params)
  if (total > EXPORT_CAP) {
    return NextResponse.json({ error: OVER_CAP_MESSAGE, rows: total }, { status: 413 })
  }

  const columns = exportColumns(params.showAll)
  const today = new Date().toISOString().slice(0, 10)
  const filename = exportFilename(project, today)

  // One line per export: project, filter, row count, timestamp.
  console.log(`[export] project=${project ?? 'none'} filter=${req.nextUrl.search || '(none)'} rows=${total} at=${new Date().toISOString()}`)

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(csvLine(columns)))
        for (let offset = 0; offset < total; offset += EXPORT_BATCH) {
          const rows = await fetchPage(params, offset, Math.min(EXPORT_BATCH, total - offset))
          if (!rows.length) break
          for (const row of rows) controller.enqueue(encoder.encode(csvLine(columns.map((c) => row[c]))))
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
```

- [ ] **Step 6: Verify the export end to end**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard"
pnpm test && pnpm build
DASHBOARD_MODE=internal pnpm dev
```

In another shell:
```bash
# Unauthenticated: refused, no data.
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/export?state=IL'

# Schema guard: a column that does not exist is a 400; any real column succeeds.
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/export?sort=annual_revenue' -b "contacts_auth=$COOKIE"
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/export?sort=city&state=IL' -b "contacts_auth=$COOKIE"

# From the browser (session cookie present), a narrow filter downloads.
# Read the header row and compare it against what the sheet is showing.
# Then remove every filter and confirm the refusal.
curl -s 'http://localhost:3000/api/export' -b "contacts_auth=$COOKIE" | head -c 200
```
Expected: `401` unauthenticated; `400` for `sort=annual_revenue` (no such column) and `200` for `sort=city`; a narrow filter yields a CSV whose header row is exactly the sheet's columns and whose row count matches the `Locations shown` counter; an unfiltered export answers `413` with the message `That's more than 10,000 locations. Narrow the filter and try again.` and downloads nothing; the dev-server log carries one `[export] project=… filter=… rows=… at=…` line per export and one rejection line for the bad column.

- [ ] **Step 7: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/lib/csv.mjs apps/contacts-dashboard/lib/csv.test.mjs apps/contacts-dashboard/app/api/export/route.ts
git commit -m "feat(contacts-dashboard): CSV export of the current filter, capped at 10,000, never truncated"
```

---

### Task 8: Sources, Pools and Projects

> ⚠️ **AMEND before building — `02` AMENDMENT 2.** **Pools is out of the client surface** — it is founder vocabulary and internal pipeline detail. **Projects becomes the switcher.** **Sources stays** and matters more than before: it is the provenance story the client came for. The companies / people / **sendable** counters do **not** return.

**Files:**
- Create: `apps/contacts-dashboard/lib/criteria.mjs`
- Create: `apps/contacts-dashboard/lib/criteria.test.mjs`
- Create: `apps/contacts-dashboard/lib/registry.ts`
- Create: `apps/contacts-dashboard/app/sources/page.tsx`
- Create: `apps/contacts-dashboard/app/pools/page.tsx`
- Create: `apps/contacts-dashboard/app/projects/page.tsx`

**Interfaces:**
- Consumes, from Task 1 — `source_stats()`, `pool_stats()`, and the `sources_registry`, `projects`, `project_status` tables. From Task 4 — `serverClient`, `describeError` (`lib/supabase.ts`), `applyFilters` (`lib/query.mjs`), `fetchGeneration` (`lib/contacts.ts`), `readMode` (`lib/mode.mjs`). From Task 6 — `newTokens`, `plannedTokens`, `sourceLabel` (`lib/sources.mjs`).
- Produces:

```js
// lib/criteria.mjs
export const OPS   // ['eq','neq','gte','lte','in','contains','empty','nonempty']
export function validateCriteria(criteria, knownFields)  // -> {misconfigured: boolean, reason: string|null, filters: [], warnings: string[], base: string, note: string|null}
export function applyCriteria(query, filters)            // (builder, filters) -> builder
```

```ts
// lib/registry.ts
export type SourceRow = { token: string; rows: number; domains: number; sole_source: number; with_email: number; with_domain: number; with_person: number; last_captured: string | null; status: string | null; status_row: string | null; folder: string | null; raw_rows: number | null; seated: number | null; last_pull: string | null; est_left: string | null }
export async function fetchSources(): Promise<{ sources: SourceRow[]; newOnes: string[]; planned: string[] }>
export async function fetchPools(): Promise<{ pool: string; rows: number; domains: number }[]>
export async function fetchProjects(): Promise<ProjectView[]>
export type ProjectView = { name: string; description: string | null; base: string; note: string | null; misconfigured: string | null; warnings: string[]; matched: number; statuses: { status: string; count: number }[]; orphaned: number }
```

- [ ] **Step 1: Write the failing criteria tests**

Create `apps/contacts-dashboard/lib/criteria.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { applyCriteria, validateCriteria } from './criteria.mjs'

const FIELDS = ['ecommerce_class', 'cohort', 'state', 'segment']

function recorder() {
  const calls = []
  const self = {}
  for (const m of ['eq', 'neq', 'gte', 'lte', 'in', 'ilike', 'is', 'not']) {
    self[m] = (...args) => { calls.push([m, ...args]); return self }
  }
  self.calls = calls
  return self
}

test('a valid criteria object passes with its filters intact', () => {
  const out = validateCriteria(
    { base: 'seated', filters: [{ field: 'cohort', op: 'neq', value: 'E' }], note: null },
    FIELDS,
  )
  assert.equal(out.misconfigured, null)
  assert.equal(out.base, 'seated')
  assert.deepEqual(out.filters, [{ field: 'cohort', op: 'neq', value: 'E' }])
  assert.deepEqual(out.warnings, [])
})

test('an unknown FIELD skips that filter and warns, naming it', () => {
  const out = validateCriteria(
    { base: 'seated', filters: [{ field: 'not_a_column', op: 'eq', value: 'x' }, { field: 'state', op: 'eq', value: 'IL' }] },
    FIELDS,
  )
  assert.equal(out.misconfigured, null)
  assert.deepEqual(out.filters, [{ field: 'state', op: 'eq', value: 'IL' }])
  assert.match(out.warnings[0], /not_a_column/)
})

test('an unknown OP makes the whole project misconfigured and matches nothing', () => {
  // A filter that quietly does nothing is how a project ships to 12,000
  // companies it never meant to touch.
  const out = validateCriteria({ base: 'seated', filters: [{ field: 'state', op: 'startswith', value: 'I' }] }, FIELDS)
  assert.match(out.misconfigured, /startswith/)
  assert.deepEqual(out.filters, [])
})

test('malformed criteria render as misconfigured rather than throwing', () => {
  assert.match(validateCriteria(null, FIELDS).misconfigured, /criteria/)
  assert.match(validateCriteria({ base: 'seated', filters: 'nope' }, FIELDS).misconfigured, /filters/)
})

test('the note survives verbatim so its caveat can be rendered as a banner', () => {
  const note = 'Row count is not trusted yet. The pool went 431 to 2,818 lines between v6 and v7 (6.5x).'
  assert.equal(validateCriteria({ base: 'pool:small-shops', filters: [], note }, FIELDS).note, note)
})

test('applyCriteria maps every supported op onto the builder', () => {
  const q = recorder()
  applyCriteria(q, [
    { field: 'state', op: 'eq', value: 'IL' },
    { field: 'cohort', op: 'neq', value: 'E' },
    { field: 'segment', op: 'in', value: ['A', 'B'] },
    { field: 'ecommerce_class', op: 'contains', value: 'cart' },
    { field: 'state', op: 'empty', value: null },
    { field: 'segment', op: 'nonempty', value: null },
  ])
  assert.deepEqual(q.calls, [
    ['eq', 'state', 'IL'],
    ['neq', 'cohort', 'E'],
    ['in', 'segment', ['A', 'B']],
    ['ilike', 'ecommerce_class', '%cart%'],
    ['is', 'state', null],
    ['not', 'segment', 'is', null],
  ])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: FAIL — `Cannot find module './criteria.mjs'`.

- [ ] **Step 3: Write `criteria.mjs`**

```js
/**
 * criteria — the project overlay's filter rules, moved from criteria.json into
 * the `projects.criteria` JSONB with the SAME shape: base, filters[], columns,
 * counts, optional note.
 *
 * The validation rules came across unchanged, and for the same reason: an
 * unknown `field` skips the filter and warns; an unknown `op` renders the whole
 * project misconfigured rather than silently matching everything. A filter that
 * quietly does nothing is how a project ships to 12,000 companies it never meant
 * to touch.
 */

export const OPS = ['eq', 'neq', 'gte', 'lte', 'in', 'contains', 'empty', 'nonempty']

export function validateCriteria(criteria, knownFields) {
  const bad = (reason) => ({ misconfigured: reason, base: 'everything', filters: [], warnings: [], note: null })
  if (!criteria || typeof criteria !== 'object') return bad('criteria is missing or not an object')
  if (!Array.isArray(criteria.filters)) return bad('criteria.filters must be an array')

  const known = new Set(knownFields ?? [])
  const filters = []
  const warnings = []
  for (const f of criteria.filters) {
    if (!f || typeof f !== 'object') return bad('a filter entry is not an object')
    if (!OPS.includes(f.op)) return bad(`unknown op "${f.op}" — the project matches nothing until this is fixed`)
    if (!known.has(f.field)) {
      warnings.push(`unknown field "${f.field}" — this filter is skipped`)
      continue
    }
    filters.push({ field: f.field, op: f.op, value: f.value ?? null })
  }

  return {
    misconfigured: null,
    base: typeof criteria.base === 'string' ? criteria.base : 'everything',
    filters,
    warnings,
    note: typeof criteria.note === 'string' ? criteria.note : null,
  }
}

/** Apply validated filters to a PostgrestFilterBuilder. All filters AND. */
export function applyCriteria(query, filters) {
  let q = query
  for (const f of filters ?? []) {
    if (f.op === 'eq') q = q.eq(f.field, f.value)
    else if (f.op === 'neq') q = q.neq(f.field, f.value)
    else if (f.op === 'gte') q = q.gte(f.field, f.value)
    else if (f.op === 'lte') q = q.lte(f.field, f.value)
    else if (f.op === 'in') q = q.in(f.field, Array.isArray(f.value) ? f.value : [f.value])
    else if (f.op === 'contains') q = q.ilike(f.field, `%${f.value}%`)
    else if (f.op === 'empty') q = q.is(f.field, null)
    else if (f.op === 'nonempty') q = q.not(f.field, 'is', null)
  }
  return q
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test`
Expected: PASS — 44 tests, 0 failures.

- [ ] **Step 5: Write `registry.ts`**

```ts
import { applyCriteria, validateCriteria } from './criteria.mjs'
import { TYPED_COLUMNS } from './columns.mjs'
import { newTokens, plannedTokens } from './sources.mjs'
import { describeError, serverClient } from './supabase'

export type SourceRow = {
  token: string
  rows: number
  domains: number
  sole_source: number
  with_email: number
  with_domain: number
  with_person: number
  last_captured: string | null
  status: string | null
  status_row: string | null
  folder: string | null
  raw_rows: number | null
  seated: number | null
  last_pull: string | null
  est_left: string | null
}

export type ProjectView = {
  name: string
  description: string | null
  base: string
  note: string | null
  misconfigured: string | null
  warnings: string[]
  matched: number
  statuses: { status: string; count: number }[]
  orphaned: number
}

/** Per-token stats joined to the folder-title registry, plus the NEW and PLANNED sets. */
export async function fetchSources(): Promise<{ sources: SourceRow[]; newOnes: string[]; planned: string[] }> {
  const db = serverClient()
  const [statsRes, regRes] = await Promise.all([db.rpc('source_stats'), db.from('sources_registry').select('*')])
  if (statsRes.error) throw new Error(describeError(statsRes.error))
  if (regRes.error) throw new Error(describeError(regRes.error))

  const stats = (statsRes.data ?? []) as Omit<SourceRow, 'status' | 'status_row' | 'folder' | 'raw_rows' | 'seated' | 'last_pull' | 'est_left'>[]
  const registry = new Map((regRes.data ?? []).map((r) => [r.token as string, r]))
  const dataTokens = stats.map((s) => s.token)
  const registryTokens = [...registry.keys()]

  const sources: SourceRow[] = stats.map((s) => {
    const r = registry.get(s.token)
    return {
      ...s,
      rows: Number(s.rows),
      domains: Number(s.domains),
      sole_source: Number(s.sole_source),
      with_email: Number(s.with_email),
      with_domain: Number(s.with_domain),
      with_person: Number(s.with_person),
      status: (r?.status as string) ?? null,
      status_row: (r?.status_row as string) ?? null,
      folder: (r?.folder as string) ?? null,
      raw_rows: (r?.raw_rows as number) ?? null,
      seated: (r?.seated as number) ?? null,
      last_pull: (r?.last_pull as string) ?? null,
      est_left: (r?.est_left as string) ?? null,
    }
  })

  return {
    sources,
    newOnes: newTokens(dataTokens, registryTokens),
    planned: plannedTokens(dataTokens, registryTokens),
  }
}

export async function fetchPools(): Promise<{ pool: string; rows: number; domains: number }[]> {
  const db = serverClient()
  const { data, error } = await db.rpc('pool_stats')
  if (error) throw new Error(describeError(error))
  return ((data ?? []) as { pool: string; rows: string; domains: string }[]).map((r) => ({
    pool: r.pool,
    rows: Number(r.rows),
    domains: Number(r.domains),
  }))
}

/**
 * Read-only rendering. Status writes happen through the sync script or SQL,
 * never through the UI: no status editor, no "mark contacted" button, no
 * criteria form.
 */
export async function fetchProjects(): Promise<ProjectView[]> {
  const db = serverClient()
  const { data: projects, error } = await db.from('projects').select('*').order('name')
  if (error) throw new Error(describeError(error))

  const out: ProjectView[] = []
  for (const p of projects ?? []) {
    const criteria = validateCriteria(p.criteria, TYPED_COLUMNS)
    const { data: statusRows, error: statusErr } = await db
      .from('project_status')
      .select('domain,status')
      .eq('project', p.name as string)
    if (statusErr) throw new Error(describeError(statusErr))

    let matched = 0
    let orphaned = 0
    if (!criteria.misconfigured) {
      let q = db.from('contacts').select('id', { count: 'exact', head: true })
      if (criteria.base === 'seated') q = q.eq('pool', 'seated')
      else if (criteria.base.startsWith('pool:')) q = q.eq('pool', criteria.base.slice(5))
      q = applyCriteria(q, criteria.filters)
      const { count, error: countErr } = await q
      if (countErr) throw new Error(describeError(countErr))
      matched = count ?? 0

      // Rows whose domain falls outside the project's filtered set. That usually
      // means the criteria changed underneath the project.
      for (const s of statusRows ?? []) {
        const { count: hit } = await db
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('domain', s.domain as string)
          .limit(1)
        if (!hit) orphaned++
      }
    }

    const grouped = new Map<string, number>()
    for (const s of statusRows ?? []) {
      const key = String(s.status)
      grouped.set(key, (grouped.get(key) ?? 0) + 1)
    }

    out.push({
      name: p.name as string,
      description: (p.description as string) ?? null,
      base: criteria.base,
      note: criteria.note,
      misconfigured: criteria.misconfigured,
      warnings: criteria.warnings,
      matched,
      statuses: [...grouped.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
      orphaned,
    })
  }
  return out
}
```

- [ ] **Step 6: Write the three pages**

`apps/contacts-dashboard/app/sources/page.tsx`:

```tsx
import { Nav } from '@/components/Nav'
import { fetchGeneration } from '@/lib/contacts'
import { readMode } from '@/lib/mode.mjs'
import { fetchSources } from '@/lib/registry'

export const dynamic = 'force-dynamic'

const { project } = readMode(process.env)
const fmt = (n: number | null) => (n === null ? '—' : n.toLocaleString('en-US'))

export default async function SourcesPage() {
  const [{ sources, newOnes, planned }, generation] = await Promise.all([fetchSources(), fetchGeneration()])

  return (
    <>
      <Nav generation={generation} project={project} />
      <main>
        <h1>Sources</h1>

        {newOnes.length ? (
          <p className="chip warn" role="status">
            ⚠ NEW — data is arriving from {newOnes.length} source{newOnes.length === 1 ? '' : 's'} with no handoff
            folder: {newOnes.join(', ')}. Create {'{token} [STATUS]'} under
            emails/handoff/industrial-contact-list/ and re-sync to clear this.
          </p>
        ) : null}

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th><th>Status</th><th>Rows</th><th>Domains</th><th>Sole-source domains</th>
                <th>With email</th><th>With domain</th><th>With person</th><th>Last captured</th>
                <th>Raw (registry)</th><th>Seated (registry)</th><th>Last pull</th><th>Est. left</th><th>Folder</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.token}>
                  <td>{s.token}{!s.folder ? <span className="chip warn">NEW</span> : null}</td>
                  <td>
                    {s.status ?? '—'}
                    {s.status && s.status_row && s.status !== s.status_row ? (
                      <span className="chip warn">folder: {s.status} · registry row: {s.status_row}</span>
                    ) : null}
                  </td>
                  <td>{fmt(s.rows)}</td>
                  <td>{fmt(s.domains)}</td>
                  <td>{fmt(s.sole_source)}</td>
                  <td>{fmt(s.with_email)}</td>
                  <td>{fmt(s.with_domain)}</td>
                  <td>{fmt(s.with_person)}</td>
                  <td>{s.last_captured ?? '—'}</td>
                  <td>{fmt(s.raw_rows)}</td>
                  <td>{fmt(s.seated)}</td>
                  <td>{s.last_pull ?? '—'}</td>
                  <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{s.est_left ?? '—'}</td>
                  {/* Folder path renders as TEXT. Never fetched, never rendered as markdown. */}
                  <td><code>{s.folder ?? '—'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Planned</h2>
        <p className="muted">A handoff folder with no data token. That is a source that has not run yet, not an error.</p>
        <ul>{planned.map((t) => <li key={t}>{t} — <span className="chip">PLANNED</span></li>)}</ul>
      </main>
    </>
  )
}
```

`apps/contacts-dashboard/app/pools/page.tsx`:

```tsx
import Link from 'next/link'

import { Nav } from '@/components/Nav'
import { fetchGeneration } from '@/lib/contacts'
import { readMode } from '@/lib/mode.mjs'
import { fetchPools } from '@/lib/registry'

export const dynamic = 'force-dynamic'

const { project } = readMode(process.env)

export default async function PoolsPage() {
  const [pools, generation] = await Promise.all([fetchPools(), fetchGeneration()])
  return (
    <>
      <Nav generation={generation} project={project} />
      <main>
        <h1>Pools</h1>
        <p className="muted">
          The latest generation per disposition. Side pools overlap each other; only the seated list is exclusive, so
          these row counts sum to more than the number of distinct companies.
        </p>
        <table>
          <thead><tr><th>Pool</th><th>Rows</th><th>Unique domains</th><th></th></tr></thead>
          <tbody>
            {pools.map((p) => (
              <tr key={p.pool}>
                <td>{p.pool}</td>
                <td>{p.rows.toLocaleString('en-US')}</td>
                <td>{p.domains.toLocaleString('en-US')}</td>
                <td><Link href={`/?country=${p.pool === 'non-us' ? 'non-us' : 'us'}`}>open in Locations</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}
```

`apps/contacts-dashboard/app/projects/page.tsx`:

```tsx
import { Nav } from '@/components/Nav'
import { fetchGeneration } from '@/lib/contacts'
import { readMode } from '@/lib/mode.mjs'
import { fetchProjects } from '@/lib/registry'

export const dynamic = 'force-dynamic'

const { project: pinned } = readMode(process.env)

export default async function ProjectsPage() {
  const [projects, generation] = await Promise.all([fetchProjects(), fetchGeneration()])
  return (
    <>
      <Nav generation={generation} project={pinned} />
      <main>
        <h1>Projects</h1>
        <p className="muted">Read-only. Status writes happen through the sync script or SQL, never here.</p>
        {projects.map((p) => (
          <section key={p.name} style={{ border: '1px solid var(--rule)', padding: 14, margin: '0 0 14px' }}>
            <h2>{p.name}{p.name === pinned ? <span className="chip">this deployment opens here</span> : null}</h2>
            {p.description ? <p>{p.description}</p> : null}
            {p.note ? <p className="chip warn" style={{ whiteSpace: 'normal', display: 'block' }}>{p.note}</p> : null}
            {p.misconfigured ? (
              <p className="chip warn">misconfigured — {p.misconfigured}</p>
            ) : (
              <>
                <p>base: <code>{p.base}</code> · matched: <b>{p.matched.toLocaleString('en-US')}</b></p>
                {p.warnings.map((w) => <p key={w} className="chip warn">{w}</p>)}
                <p>
                  {p.statuses.length
                    ? p.statuses.map((s) => <span key={s.status} className="chip">{s.status}: {s.count}</span>)
                    : <span className="muted">No status rows recorded yet.</span>}
                </p>
                {p.orphaned ? (
                  <p className="chip warn">
                    {p.orphaned} orphaned status row{p.orphaned === 1 ? '' : 's'} — the domain is outside the project&rsquo;s
                    filtered set, which usually means the criteria changed underneath the project.
                  </p>
                ) : null}
              </>
            )}
          </section>
        ))}
      </main>
    </>
  )
}
```

- [ ] **Step 7: Verify the three tabs**

Run: `cd "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard" && pnpm test && pnpm build && DASHBOARD_MODE=internal DASHBOARD_PROJECT=field-advisor pnpm dev`

Open each and confirm:
- `/sources` — one row per data token with rows / domains / sole-source (strictly less than domains); folder-title statuses; a mismatch chip naming both values wherever the folder and the section-5 row disagree; `PLANNED` rows for the workstream folders with no data token; a pinned NEW banner. On the current data `adaptall-export` is expected to show NEW — the folder is `adaptall [RETIRED-TO-LOOKUPS]` and the data token is `adaptall-export`, which is exactly the mechanism working.
- `/pools` — 12 rows (seated plus the 11 dispositions), each linking into Locations.
- `/projects` — four cards, `small-shops` rendering its 6.5x caveat as a banner above its count, `field-advisor` marked as the deployment's opening view, no editing controls anywhere.

Then confirm no write path exists:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
grep -rn "\.insert(\|\.update(\|\.upsert(\|\.delete(" apps/contacts-dashboard/
```
Expected: no output. The app reads; the sync writes.

- [ ] **Step 8: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add apps/contacts-dashboard/lib/criteria.mjs apps/contacts-dashboard/lib/criteria.test.mjs apps/contacts-dashboard/lib/registry.ts apps/contacts-dashboard/app/sources apps/contacts-dashboard/app/pools apps/contacts-dashboard/app/projects
git commit -m "feat(contacts-dashboard): Sources, Pools and Projects — read-only, NEW badge, mismatch chips"
```

---

### Task 9: Deployment — three Vercel projects, two subdomains, two walls

> ⚠️ **RE-PLAN before building — `02` AMENDMENT 2.** **One** Vercel project, **one** DNS record, **Deployment Protection OFF** (the client holds no Vercel seat, so team auth is a door they cannot open). `DASHBOARD_PROJECT` stops being an env pin and becomes an in-app Field Advisor / Hosebox switcher. The `ss-contacts` internal deployment is dropped **[default]** — the loopback cockpit already serves the founder. The table below describes the superseded three-deployment topology.

**Files:**
- Modify: none in code. This task is founder gates plus verification against the deployed URLs.

**Interfaces:**
- Consumes: the whole app from Tasks 3–8, and the Supabase project from Task 1.
- Produces: three live URLs, recorded in Task 10.

**One app directory serves all three deployments.** `apps/contacts-dashboard/` is built once and pinned by environment. Forking the app per view would give three codebases and a coin flip about which one is current.

**Two walls, in this order: Vercel Authentication outside, password inside.** The outer wall means an unauthenticated request never reaches our code. The inner wall means a Vercel team member still needs the password, and it survives any future change to the team's membership.

| | `ss-contacts` | Field Advisor | Hosebox |
|---|---|---|---|
| Domain | the Vercel-assigned URL | `fieldadvisor.salesolution.net` | `hosebox.salesolution.net` |
| Vercel project | `ss-contacts` | `ss-locations-fieldadvisor` | `ss-locations-hosebox` |
| Root Directory | `apps/contacts-dashboard` | same | same |
| `DASHBOARD_MODE` | `internal` | `internal` | `internal` |
| `DASHBOARD_PROJECT` | *(unset)* | `field-advisor` | `hosebox` |
| `CONTACTS_DASHBOARD_PASSWORD` | its own | its own, different | its own, different |
| `CONTACTS_DASHBOARD_SESSION_SECRET` | its own | its own | its own |
| Deployment Protection | **Vercel Authentication ON** | **Vercel Authentication ON** | **Vercel Authentication ON** |

- [ ] **Step 1: Push the branch**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git push -u origin feat/contacts-dashboard
```

- [ ] **Step 2: GATE (founder) — create the first Vercel project**

1. <https://vercel.com/new> → **Import** this repo again as a **second project** (the main site keeps its own project, untouched).
2. **Project name:** `ss-contacts`.
3. **Root Directory:** `apps/contacts-dashboard`. This is the setting that makes the whole layout work — it is the one line that differs from `docs/strategy/vercel-deploy.md` §2 step 5, where Root Directory is `./`.
4. **Framework preset:** Next.js (auto-detected from the subdirectory).
5. **Production branch:** `feat/contacts-dashboard` for now; switch it to `main` after the branch merges.
6. **Environment Variables** (Production **and** Preview), nothing prefixed `NEXT_PUBLIC_`:
   - `SUPABASE_URL` — from Task 1
   - `SUPABASE_SERVICE_ROLE_KEY` — from Task 1
   - `DASHBOARD_MODE` = `internal`
   - `CONTACTS_DASHBOARD_PASSWORD` — see the next gate
   - `CONTACTS_DASHBOARD_SESSION_SECRET` — see the next gate
   - Do **not** set `SUPABASE_ANON_KEY` here. It exists only in `.env.local`, for the anon check.
7. **Settings → Deployment Protection → Vercel Authentication → ON for all deployments** (Production included, not just Previews). Team-only.

- [ ] **Step 3: GATE (founder) — pick the passwords and the secrets**

Three distinct password values, so rotating one never touches the others:

1. `CONTACTS_DASHBOARD_PASSWORD` for `ss-contacts` — a value Artur chooses, **not** the same as `SALES_PASSWORD` (that one already opens both `/sales` and `/strategy`; a third surface on the same secret makes rotation a three-place change nobody finishes).
2. A different value again for `ss-locations-fieldadvisor`, and a third for `ss-locations-hosebox`.
3. `CONTACTS_DASHBOARD_SESSION_SECRET` per project — generate each one:

```bash
openssl rand -hex 32
```

Paste each pair into its own Vercel project (Production + Preview). Put the `ss-contacts` pair into `.env.local` too, so local dev matches.

- [ ] **Step 4: GATE (founder) — create the two subdomain projects**

Repeat Step 2 twice, changing only the name, the pinned project, and the password pair:

- **`ss-locations-fieldadvisor`** — same repo, Root Directory `apps/contacts-dashboard`, `DASHBOARD_MODE=internal`, `DASHBOARD_PROJECT=field-advisor`, its own `CONTACTS_DASHBOARD_PASSWORD` and `CONTACTS_DASHBOARD_SESSION_SECRET`, **Deployment Protection → Vercel Authentication ON**.
- **`ss-locations-hosebox`** — identical, with `DASHBOARD_PROJECT=hosebox` and its own password and secret.

- [ ] **Step 5: GATE (founder) — the two DNS records**

1. In `ss-locations-fieldadvisor` → **Settings → Domains** → add `fieldadvisor.salesolution.net`.
2. In `ss-locations-hosebox` → **Settings → Domains** → add `hosebox.salesolution.net`.
3. Create the two records Vercel's domain screen asks for, at the `salesolution.net` registrar.
4. **Wait for both to show "Valid Configuration" with a live certificate before testing.** A subdomain that resolves before its cert lands will look broken and is not.

- [ ] **Step 6: Deploy and smoke-test each URL**

For each of the three URLs, from a fresh incognito window:

1. The **Vercel login** loads first. Our app never renders.
2. Past it, the **house password form** — not the dashboard.
3. Wrong password ×6 → rate-limited, with a `Retry-After` header.
4. Correct password → the dashboard, cookie set `HttpOnly; Secure; SameSite=Lax`.
5. `fieldadvisor.salesolution.net` shows `view: field-advisor` in the nav, `hosebox.salesolution.net` shows `view: hosebox`, `ss-contacts` shows no pin. No clicking required.

Then, from a shell (replace the host):

```bash
HOST=https://fieldadvisor.salesolution.net
curl -s -o /dev/null -w 'export unauthenticated: %{http_code}\n' "$HOST/api/export?state=IL"
curl -s -o /dev/null -w 'login unauthenticated: %{http_code}\n' -X POST "$HOST/api/login" -H 'content-type: application/json' -d '{"password":"wrong"}'
```
Expected: both are stopped by the Vercel Authentication wall (a `401`, or a redirect to `vercel.com` — either way, no data).

- [ ] **Step 7: Confirm the main site is unaffected**

Open production `salesolution.net` and confirm it still serves. Check the root project's cron (`/api/cron/revalidate-sitemap/`, `0 6 * * *` in the root `vercel.json`) still runs — it is unchanged, because nothing in this work touched that file.

---

### Task 10: Close the pack — the completion ritual

**Files:**
- Modify: `emails/handoff/industrial-contact-list/dashboard/00-README.md` (STATUS banner + a new `## Deployed` section)
- Modify: `emails/handoff/industrial-contact-list/dashboard/01-vercel-transfer.md` (STATUS banner → built)
- Modify: `emails/handoff/industrial-contact-list/dashboard/02-client-view.md` (STATUS banner → built)
- Modify: `emails/README.md` (§Dashboard — one paragraph pointing at the deployed surface)
- Modify: `docs/strategy/industrial-email-campaign/06-process-runbook.md` (§"The weekly loop — every Friday")
- Modify: `emails/handoff/industrial-contact-list/99-hygiene.md` (the ledger note)

`03-prompt.md` and its row in the prompts table already exist — they shipped with this plan. This task records what the build actually produced.

**Do NOT rename the `dashboard/` folder to carry a status.** The Sources tab parses `^(.+) \[([A-Z-]+)\]$` over this pack's directories; renaming this folder to `dashboard [BUILT]` would register a phantom source token named `dashboard` with zero rows, forever. The regex is the reason the folder name is boring. Keep it boring.

- [ ] **Step 1: Record the deployed URLs**

Add a `## Deployed` section to `emails/handoff/industrial-contact-list/dashboard/00-README.md`, directly under the prompts table, filling in the real URLs:

```markdown
## Deployed

Three deployments, one app directory (`apps/contacts-dashboard/`), one Supabase
database. Both walls on all three: Vercel Authentication outside, the house
password inside.

| URL | Vercel project | Opens on | Password held by |
|---|---|---|---|
| `<the ss-contacts URL>` | `ss-contacts` | no pin — the full sheet | Artur |
| `https://fieldadvisor.salesolution.net` | `ss-locations-fieldadvisor` | `field-advisor` | Artur |
| `https://hosebox.salesolution.net` | `ss-locations-hosebox` | `hosebox` | Artur |

**Refresh the data:** `node emails/scripts/sync-supabase.mjs`. Run it as part of
the **Friday metrics ritual** — it refreshes all three views and keeps the
free-tier Supabase project from pausing after ~a week of inactivity. A paused
project needs a manual restore in the Supabase dashboard; the sync says so in
plain words when it happens.

**This tool is internal.** The moment an export or a login is handed to a client
or any third party, the dissolved C-G1 licensing question un-dissolves — `dfs`
redistribution and Apollo's no-sharing terms apply to what leaves this tool, not
just to what it renders. Re-open `02-client-view.md`'s original C-G1 before
sharing anything.
```

- [ ] **Step 2: Update the three STATUS banners**

In `dashboard/00-README.md`, replace the STATUS banner's first line with:

```markdown
> **STATUS (<today's date>):** Built and deployed. Phase 3 (Everything) runs in
> the local dashboard; Phases 2 (Sources) and 4 (Projects) are built in the
> deployed app per `01-vercel-transfer.md` and `02-client-view.md`. See
> **## Deployed** below for the three URLs.
```

In `01-vercel-transfer.md`: `> **STATUS (<today's date>):** BUILT — deployed as three Vercel projects. See dashboard/00-README.md §Deployed.`

In `02-client-view.md`: `> **STATUS (<today's date>):** BUILT — the two subdomains are live, internal, two walls, as amended 2026-08-07. See dashboard/00-README.md §Deployed.` Leave the amendment body untouched — it is the record of why the build is shaped this way.

- [ ] **Step 3: Point `emails/README.md` at the deployed surface**

Add one paragraph at the end of `emails/README.md` §Dashboard, after the "Design + safety rails" line:

```markdown
A second, separate surface — the **asset view** — is deployed on Vercel over a
Supabase copy of the same CSVs: a locations sheet with provenance, plus Sources,
Pools and Projects. It has no Smartlead import and cannot reach a campaign even
in principle. URLs, passwords and the refresh command are in
`handoff/industrial-contact-list/dashboard/00-README.md` §Deployed. The local
cockpit above is unchanged and stays the ops cockpit.
```

- [ ] **Step 4: Pin the sync to the Friday loop**

In `docs/strategy/industrial-email-campaign/06-process-runbook.md`, under §"The weekly loop — every Friday", add one bullet:

```markdown
- Run `node emails/scripts/sync-supabase.mjs`. It refreshes the deployed
  dashboard and keeps the free-tier Supabase project from pausing (~1 week of
  inactivity pauses it, and restoring is a manual click).
```

- [ ] **Step 5: Add the ledger note**

Append to `emails/handoff/industrial-contact-list/99-hygiene.md`:

```markdown
### Contacts dashboard (<today's date>)

Created: `apps/contacts-dashboard/` (its own package, its own lockfile — the repo
root is untouched, and no `pnpm-workspace.yaml` was added),
`emails/scripts/sync-supabase.mjs`, `emails/scripts/lib/sync-supabase-data.mjs`
and its test. Migrations are committed under
`apps/contacts-dashboard/supabase/migrations/`; **no data file was committed**,
and `apps/contacts-dashboard/.gitignore` covers `.env*`, `*.csv`, `/data/`,
`.next/` and `node_modules/`. Nothing to clean.
```

- [ ] **Step 6: Verify the pack is consistent**

Run:
```bash
cd "/Users/artur/Documents/Projects/Salesolution new/emails/handoff/industrial-contact-list"
ls -d dashboard
grep -n "03-prompt" dashboard/00-README.md
grep -n "## Deployed" dashboard/00-README.md
```
Expected: `dashboard` (no status bracket — the guardrail); one prompts-table row naming `03-prompt.md`; one `## Deployed` heading.

- [ ] **Step 7: Commit**

```bash
cd "/Users/artur/Documents/Projects/Salesolution new"
git add emails/handoff/industrial-contact-list/dashboard/ emails/handoff/industrial-contact-list/99-hygiene.md emails/README.md docs/strategy/industrial-email-campaign/06-process-runbook.md
git commit -m "docs(emails): record the deployed contacts dashboard and pin the sync to the Friday loop"
```

---

## Verification

Run this whole list against the **deployed** URLs, not localhost, and record the output.

- [ ] **Anon-key select returns nothing.** `node "/Users/artur/Documents/Projects/Salesolution new/apps/contacts-dashboard/supabase/anon-check.mjs"` → each of the seven tables answers with a permission error or zero rows, and the last line reads `PASS — anon reads nothing.` **Paste the exact output into the session log** — this is the test that matters most in this handoff.

- [ ] **No anon path exists in the app.** `grep -rn "NEXT_PUBLIC" apps/contacts-dashboard/` prints nothing. If one ever appears, the mistake is already made: an anon key in client JS is public, permanently.

- [ ] **Unauthenticated requests get nothing.** From incognito, on each of the three URLs: the **Vercel login** loads first and our app never renders; past it, the **password form** renders in place — not a redirect, not the dashboard. `curl` any route handler with no session cookie (from inside a Vercel-authenticated session) → `401`, no data.

- [ ] **Wrong password is throttled.** Six wrong attempts → `429` with a `Retry-After` header.

- [ ] **Project pinning works.** `fieldadvisor.salesolution.net` opens on the Field Advisor view and `hosebox.salesolution.net` on Hosebox, with no click. Point `DASHBOARD_PROJECT` at a name with no `projects` row on a Preview: the Projects page shows no card for it and the nav shows the unknown pin — fix it rather than shipping it. Set `DASHBOARD_MODE` to anything but `internal`: the build fails with the named error from `readMode`.

- [ ] **Export matches the filter, and the cap refuses.** Set a filter, download, open the CSV: the header row is exactly the columns the sheet is showing (all of them with show-all on, Apollo fields included), and the row count equals the `Locations shown` counter. Then clear every filter and export: `413` with `That's more than 10,000 locations. Narrow the filter and try again.` and **no file downloads**. The server log carries one `[export] project=… filter=… rows=… at=…` line per export.

- [ ] **The show-all toggle works.** Default 14 columns; toggle on reveals the full typed set including the Apollo/person fields, and a row's `raw` panel opens. `lat`, `lng`, `tier_raw` and `distributor_type` are reachable in that panel — they are not typed columns, and that is the promotion rule working, not a miss.

- [ ] **The schema guard answers 400.** `GET /api/export?sort=annual_revenue` → `400` plus a log line naming the column; `GET /api/export?sort=city&state=IL` → `200`. Any real column succeeds; a column that does not exist is refused rather than silently ignored.

- [ ] **Conservation on sync.** `node emails/scripts/sync-supabase.mjs` prints `ok` on every line and `conservation PASS`. Truncate a scratch copy of one pool CSV by 5 rows: the sync **exits non-zero and names the file**. Restore it and re-run: `PASS`. Run it twice in a row: identical totals, zero diff.

- [ ] **The paused-project message.** `SUPABASE_URL=https://not-a-real-project.supabase.co node emails/scripts/sync-supabase.mjs` prints `project paused — restore it in the Supabase dashboard` and exits 1 — no stack trace, no bare `fetch failed`.

- [ ] **Counters compare live-vs-local, never to a frozen literal.** Run `pnpm emails:dashboard`, read its numbers for the current generation, then open the deployed sheet unfiltered and check that they agree **right now**. Generations move — the specs cite seated-v6/2,736 and seated-v9/2,773 four days apart and both were correct on their date. A mismatch means the sync is stale, not that a document is wrong.

- [ ] **Sole-source is strictly less than domains** on every row of the Sources tab, and the per-token seated counts sum to more than the seated row count (rows carry multiple source tokens).

- [ ] **Sources statuses come from the folder titles.** Mismatch chips name both values wherever the folder and the section-5 registry row disagree, and every workstream folder with no data token renders `PLANNED`, not `NEW`. Rename a folder's **status only** and re-sync: the status changes, the token does not, and no NEW badge appears.

- [ ] **Smartlead is absent.** `grep -rni "smartlead" apps/contacts-dashboard/` prints nothing. No tab, no import, no env var, no route.

- [ ] **No XSS surface, no write path, no revenue label.** `grep -rn "dangerouslySetInnerHTML" apps/contacts-dashboard/`, `grep -rn "\.insert(\|\.update(\|\.upsert(\|\.delete(" apps/contacts-dashboard/`, and `grep -rni "revenue" apps/contacts-dashboard/app apps/contacts-dashboard/components` all print nothing.

- [ ] **The F-003 guard is present.** `grep -n "NODE_ENV === 'production'" apps/contacts-dashboard/lib/auth.mjs` returns the line inside `isLocalHost`.

- [ ] **The repo root is untouched.** `git diff --stat main -- package.json pnpm-lock.yaml vercel.json` is empty and `ls pnpm-workspace.yaml` does not exist. `salesolution.net` still serves, and the sitemap cron still runs.

- [ ] **PII never entered git.** `git log --stat feat/contacts-dashboard` shows no `.csv` and no file under `emails/data/` or `emails/lists/`.

- [ ] **The local dashboard still runs untouched.** `pnpm emails:dashboard` → five tabs; both grep guards silent; `node --test emails/scripts/lib/` green; full `pnpm test` green.

- [ ] **The `dashboard/` folder is still named `dashboard`** — no status bracket, ever. Renaming it registers a phantom source token with zero rows, forever.
