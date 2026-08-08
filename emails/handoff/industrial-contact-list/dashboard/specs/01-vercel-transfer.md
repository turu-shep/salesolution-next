# Transfer the asset view to Vercel — Supabase + a second project

> **STATUS (2026-08-07):** Ready to run — decisions locked, gated on T-G1..T-G3.
> Five phases. T1 needs T-G1 before any code runs; T4 needs T-G2 and T-G3. T2
> and T3 are unblocked once T1 lands. Nothing here touches a send path, and
> nothing here changes the local dashboard.
> **`02-client-view.md` = the deployed location views (internal; audience
> reversed 2026-08-07)** — adds the sheet features, subdomains, and project
> views; door and data scope now match this file.

The local dashboard is the **ops cockpit** and stays that way: loopback-bound,
zero-dependency, Smartlead and Reports included, no auth because there is no
remote reachability. This handoff builds a second, separate surface — the
**asset view** — deployed so Artur can open the list from a phone without
running `pnpm emails:dashboard` first.

Two surfaces, two jobs. That is a deliberate split, not a duplication: the thing
that made "extend, do not build a second one" correct for the local server was
that both cockpits would show the *send pipeline*. This one shows the *asset*,
has no Smartlead import at all, and cannot reach a campaign even in principle.

---

## Decisions — locked 2026-08-07, do not reopen

| Question | Answer |
|---|---|
| Data store | **Supabase free tier.** Postgres, service-role access from the server only. Founder's pick. |
| Auth | **Both walls.** Vercel Authentication (team-only) outside, the house password gate inside. |
| Layout | **Same repo, own root directory** → `apps/contacts-dashboard/`, deployed as a **second** Vercel project with its own Root Directory setting. |
| Smartlead | **Not in the deployed v1.** Smartlead stays local-only, and no Smartlead code is imported into this app. |

If a task below appears to need one of these reversed, the task is wrong.

---

## Prerequisite reading, in order

1. `emails/handoff/industrial-contact-list/dashboard/00-README.md` — the tab
   specs. Phase 2 (Sources) and Phase 4 (Projects) are the **requirements** for
   T3 here; they were never built locally. Phase 3 (Everything) **is** built
   locally and gets ported, not redesigned.
2. `emails/README.md` §Dashboard — what the local cockpit does and what it
   refuses to do. It keeps refusing all of it after this work.
3. `docs/superpowers/specs/2026-08-01-emails-dashboard-design.md` — the six
   binding safety rails. Rails 1, 3, 4 and 5 apply to the local server and are
   untouched. Rails 6 (FS containment) and 7 (XSS via `textContent`) carry over
   to the deployed app verbatim.
4. `emails/scripts/lib/dashboard-data.mjs` — the pure resolver the sync script
   reuses: `resolveRegistry`, `currentList`, `latestPools`, `POOL_FILE`,
   `filterRows`, `paginate`, `aggregateBy`.
5. `emails/scripts/dashboard.mjs` — the I/O half, for `LISTS_DIR` / `DATA_DIR`
   and how `readTable` tolerates the column drift.
6. **The house password gate**, all four files, before writing T4:
   - `lib/sales/auth.ts` — `SALES_COOKIE`, `MAX_AGE_S`, `isLocalHost`,
     `verifyPassword`, `signSession`, `verifySession`. Cookie value is
     `<issuedAtMs>.<hmac>`, HMAC-SHA256, self-expiring, no session store.
   - `app/sales/layout.tsx` — the gate itself. A server layout that reads the
     cookie and **renders the login form in place** on failure, so there is no
     redirect loop and no separate login page. `export const dynamic = 'force-dynamic'`.
   - `app/api/sales/login/route.ts` — mints the cookie; constant-time compare;
     rate-limited through `lib/rate-limit.ts` `LOGIN_POLICY`.
   - `components/sales/SalesLogin.tsx` — the form.
   The `/strategy` twins are `lib/strategy/auth.ts`, `app/strategy/layout.tsx`,
   `app/api/strategy/login/route.ts` — same shape, separate password.
7. `docs/strategy/vercel-deploy.md` §2 and §3 — how a project in this repo gets
   imported and how env vars are scoped. §2 step 5 is the line that changes:
   Root Directory is **not** `./` for this one.
8. `docs/strategy/industrial-email-campaign/06-process-runbook.md` §"The weekly
   loop — every Friday" — where the sync gets pinned so the Supabase project
   never sleeps.

---

## Phase T1 — Supabase foundation

### T-G1 · GATE:HUMAN — Artur creates the project

Nothing in T1 runs until this is done.

1. Create a **free-tier** Supabase project. Region: **closest US region** to
   Artur — latency here is one operator opening a page, but a cross-continent
   region turns every server render into a visible pause.
2. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into **both**:
   - `.env.local` at the repo root (the sync script reads it there), and
   - the new Vercel project's Environment Variables (Production + Preview).
3. Never paste the service-role key anywhere else. It bypasses RLS by design —
   it is the database, not a credential with a blast radius.

**Free-tier facts the operator has to know, stated here so nobody discovers
them at 11pm:**

| Fact | What it means for us |
|---|---|
| 500 MB database | The current generation lands around **70 MB** as rows (typed columns plus the `raw` JSONB, which is most of it). Fits with real headroom. Re-measure after the first sync with `pg_total_relation_size('contacts')` and write the number into this file. |
| **Projects pause after ~1 week of inactivity** | The weekly sync keeps it warm. **Pair the sync with the Friday metrics ritual** in `06-process-runbook.md` §"The weekly loop — every Friday" so it happens as part of a thing that already happens. |
| A paused project needs a **manual** restore | There is no API for it. Someone opens the Supabase dashboard and clicks restore. The sync script must **detect the connection failure and print `project paused — restore it in the Supabase dashboard`**, not a bare `ECONNREFUSED` or a `fetch failed` stack. An operator who sees a network error goes looking for a bug that isn't there. |

### Tasks

**T1.1 — Migrations as committed SQL files.**

`apps/contacts-dashboard/supabase/migrations/0001_init.sql`, applied through the
Supabase SQL editor or CLI. **Migrations are committed. Data never is.**

**T1.2 — `contacts`.** Typed columns for every field a filter touches, plus one
JSONB column carrying the whole CSV row.

```sql
create table contacts (
  id               text primary key,          -- '<list_generation>:<pool>:<row_index>'
  list_generation  text not null,             -- 'seated-v6', and the pools synced with it
  pool             text not null,             -- 'seated' | 'ranked-out' | 'small-shops' | …
  domain           text,                      -- lowercased, no 'www.', null when absent
  company_display  text,
  segment          text,
  tier             text,
  cohort           text,
  icp_class        text,
  size_band        text,
  rank_score       numeric,
  state            text,
  disposition      text,
  source_tokens    text[] not null default '{}',  -- the pipe chain, split
  email            text,
  email_state      text,
  has_person       boolean not null default false,
  captured         date,
  raw              jsonb not null                 -- the full row, every column, as read
);

create index contacts_generation_idx on contacts (list_generation);
create index contacts_domain_idx     on contacts (domain);
create index contacts_pool_idx       on contacts (pool);
create index contacts_segment_idx    on contacts (segment, tier);
create index contacts_sources_idx    on contacts using gin (source_tokens);
create index contacts_raw_idx        on contacts using gin (raw jsonb_path_ops);
```

**The JSONB is the point.** Generations have run 23 → 56 columns and will keep
moving. Typed columns carry the filters; `raw` carries the drift. A new column
appears in generation N+1 and **no migration is written** — it lands in `raw`,
the drill-down renders it, and a filter gets promoted to a typed column only
when someone actually wants to filter on it.

`domain` stays nullable. ~9,006 rows carry no domain and they must not collapse
into one company or get dropped — they are individual rows with `domain is null`
and they get counted separately everywhere, same rule as the local dashboard.

**T1.3 — `verify_results`.**

```sql
create table verify_results (
  id             bigserial primary key,
  email          text not null,
  result         text not null,             -- valid | catchall | unknown | invalid
  flags          text,
  verified_date  date
);
create index verify_results_email_idx on verify_results (lower(email));
```

**No unique constraint on `email`, deliberately.** The seated verdict quartet
sums to 1,467 against 1,466 seated emailed rows — a ±1 that is probably one
duplicate-email row. A primary key on `email` would make an upsert quietly
absorb it, which is exactly the discrepancy we want surfaced. The sync prints a
duplicate-email count instead.

An email with no row here has verdict **`null`**, never `"unknown"`. `unknown`
is a real NeverBounce verdict held by ~770 rows; merging them turns "we have not
checked" into "we checked and could not tell."

**T1.4 — `sources_registry`.** Written by the sync script, never by hand.

```sql
create table sources_registry (
  token       text primary key,   -- 'dfs', 'ptda', 'adaptall'
  status      text,               -- from the FOLDER TITLE — what the founder reads
  status_row  text,               -- from the §5 registry row in the pack README
  folder      text,               -- 'dfs [DONE-DEEP]', displayed as text, never fetched
  raw_rows    integer,
  seated      integer,
  last_pull   date,
  est_left    text,               -- free text: '~400', 'unknown', ''
  synced_at   timestamptz not null default now()
);
```

Two status columns because the two disagree sometimes, and a disagreement is a
defect worth showing, not a tie to break. Folder title wins for display; both
are stored; the tab renders a warning chip naming both values.

**T1.5 — `projects` + `project_status`.** The overlay model from 00-README
Phase 4, moved into the database. `criteria.json` becomes `projects.criteria`
with the **same shape** — `base`, `filters[]`, `columns[]`, `counts`, optional
`note`. Do not redesign it; the validation rules (unknown `field` → skip the
filter and warn; unknown `op` → the whole project renders misconfigured) come
across unchanged, and for the same reason: a filter that quietly does nothing is
how a project ships to 12,000 companies it never meant to touch.

```sql
create table projects (
  name         text primary key,   -- 'catalog-ai'
  description  text,
  criteria     jsonb not null      -- { base, filters[], columns[], counts, note? }
);

create table project_status (
  project  text not null references projects(name) on delete cascade,
  domain   text not null,
  status   text not null,          -- FREE vocabulary. Never validated against an enum.
  note     text,
  updated  date,
  primary key (project, domain)
);
```

Seed both profiles from 00-README §4.5 as INSERTs in the migration —
`catalog-ai` (base `seated`) and `small-shops` (base `pool:small-shops`,
carrying its `note` caveat verbatim). Seed **no** `project_status` rows: an
empty status set reads as "nobody has done anything," which is a different
claim from "nothing recorded yet."

**T1.6 — RLS: deny-all, everywhere. This is the hard one.**

```sql
alter table contacts        enable row level security;
alter table verify_results  enable row level security;
alter table sources_registry enable row level security;
alter table projects        enable row level security;
alter table project_status  enable row level security;

-- No policies are created. RLS enabled with zero policies denies every row
-- to anon and authenticated. service_role bypasses RLS — that is the only path.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
```

Both layers, because PostgREST honors table grants *and* RLS, and a future
migration that adds a table without thinking about it should fail closed.

- **No anon policies, ever.** Not "read-only for anon", not "just the counts".
- **The browser never talks to Supabase.** No `NEXT_PUBLIC_SUPABASE_*` variable
  is created. If one exists, someone has already made the mistake — an anon key
  in client JS is public, permanently, to anyone who opens devtools.
- The service-role key lives in server-only code: `apps/contacts-dashboard/`
  server components and route handlers, read from `process.env`.

### Acceptance

- [ ] Migration applies clean on an empty project; re-applying is either a
      no-op or fails loudly, never partially.
- [ ] `select * from contacts limit 1` with the **anon** key returns zero rows
      or a permission error. Same for all five tables. Record the exact output
      in the session log — this is the test that matters most in this handoff.
- [ ] `grep -rn "NEXT_PUBLIC_SUPABASE" apps/contacts-dashboard/` prints nothing.
- [ ] Both seeded projects present, `small-shops` carrying its `note`.
- [ ] Killing the internet (or a paused project) makes a query fail with the
      **paused-project message**, not a raw fetch error.

---

## Phase T2 — the sync script

`emails/scripts/sync-supabase.mjs`. Node, no framework, same register as every
other script in that folder. Manual and on-demand — no cron, no webhook.

### Tasks

**T2.1 — Read through the existing resolver.** Import from
`emails/scripts/lib/dashboard-data.mjs`. Resolve the current generation with
`resolveRegistry` + `currentList` for the seated list and `latestPools` for the
11 pools. **Write no new version-resolution logic.** `POOL_FILE` compares
versions numerically, and the live directory holds exactly the pair that a
string sort gets backwards (`pool-chains-v10.csv` vs `-v9`). Join
`emails/data/verify-results.csv` for the verdicts.

Expect 1 + 11 files: seated plus ranked-out, segment-w, usaspending-unmatched,
not-a-distributor, small-shops, adjacent-trades, chains, duplicate-sites,
non-us, above-ceiling, identity-backlog. If the count differs, say so and stop
— a missing pool is a data question, not something to sync around.

**T2.2 — Full replace, per generation, in a transaction.**

```
begin;
delete from contacts where list_generation = $1;
insert into contacts (...) values ... ;   -- batched
commit;
```

No upserts, no diffing, no "merge". The files are the source of truth and they
get rewritten wholesale between generations; a merge would leave rows from a
generation nobody can name. Same shape for `verify_results` (full replace,
single table).

**T2.3 — Conservation check, printed, enforced.**

```
seated-v6      file 2,736   db 2,736   ok
pool-chains    file   118   db   118   ok
…
TOTAL          file 35,714  db 35,714  ok
verify-results file  1,566  db 1,566   ok   (3 duplicate emails retained)
```

File rows and DB rows **must match exactly**. Any mismatch prints the offending
file and **exits non-zero**. A sync that silently drops 40 rows produces a
dashboard that is confidently wrong, which is worse than one that is down.

**T2.4 — Source registry.** Enumerate
`emails/handoff/industrial-contact-list/` and keep every **directory** matching:

```
^(?<token>.+) \[(?<status>[A-Z-]+)\]$
```

Greedy token up to the space-bracket (tokens contain hyphens), both ends
anchored. `dfs [DONE-DEEP]`, `adaptall [RETIRED-TO-LOOKUPS]`,
`ptda [DONE-DEEP]`. Non-matching directories — `dashboard/` — are not sources.

Cross-check each folder status against the §5 registry row in the pack's
`00-README.md`. **A mismatch is a warning, not a resolution:** store both
(`status` from the folder, `status_row` from the table), print the warning, let
the tab render the chip. A mismatch means the completion ritual was half-done,
and picking a winner hides the defect instead of fixing it.

Pull `raw_rows`, `seated`, `last_pull` and `est_left` from the §5 row and each
dossier's `> **STATUS (date):**` banner. A missing or malformed banner stores
`status: unparsed` — never a crash, never a guess.

Upsert into `sources_registry` keyed on `token`, refreshing `synced_at`.

**T2.5 — Env + failure modes.** Load `.env.local` with the house `loadEnv`
pattern (`emails/scripts/lib/neverbounce.mjs` lines 23–31: read the file, match
`^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$`, never overwrite an existing `process.env`
value). Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` → one clear line
naming the variable and where it goes, exit 1. Connection refused / timeout →
the paused-project message from T1.

**T2.6 — Document the pairing.** One paragraph in `emails/README.md` §Dashboard
is not needed yet (that section describes the local server); put the note in
this file and in the Friday loop instead: *run `node emails/scripts/sync-supabase.mjs`
as part of the Friday metrics ritual — it refreshes the deployed view and keeps
the Supabase project from pausing.*

### Acceptance

- [ ] Sync runs end to end against a live Supabase project, conservation **PASS**
      on every line.
- [ ] Deliberately truncate one pool CSV by 5 rows in a scratch copy: the sync
      exits non-zero and names the file.
- [ ] Second run immediately after the first: **zero diff** — same row counts,
      same totals. Idempotent.
- [ ] Rename a source folder's status only (`dfs [DONE-DEEP]` →
      `dfs [IN-PROGRESS]`), re-sync: `status` changes, `token` does not, no row
      is created or destroyed.
- [ ] A folder whose title status and §5 row status disagree produces a warning
      line and stores both values.
- [ ] Point `SUPABASE_URL` at an unreachable host: the paused-project message
      prints, no stack trace.

---

## Phase T3 — the app

`apps/contacts-dashboard/` — a minimal Next.js App Router app with its **own**
`package.json`. The repo root stays untouched.

**No pnpm workspace.** Checked: there is no `pnpm-workspace.yaml` at the repo
root, and none gets added. Without one, `apps/contacts-dashboard/` is simply an
independent package sitting in a subdirectory, which Vercel's Root Directory
setting handles natively — it installs and builds from that folder as if it
were the repo root. Adding a workspace file would change how the **main site**
installs, for no benefit here.

### Tasks

**T3.1 — Scaffold.** Next.js App Router, TypeScript, its own lockfile, its own
`.gitignore`. Zero UI dependencies beyond what the site already uses; this is a
table with filters, not a design project. Follow the dataviz rules the local
dashboard follows: one measure per hue, status colors reserved for status,
**icon plus word, never color alone**.

**T3.2 — Data access.** A single server-side Supabase client created from
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, imported only by server
components and route handlers. Filters translate to SQL `where` clauses;
pagination is `limit`/`offset` with a hard cap of **500 rows per page**,
mirroring the local `paginate`. The client receives **filtered, paginated pages
only** — never the full set, never a count-plus-payload of 35K rows.

**There is no full-dump endpoint and no CSV-export endpoint in v1.** Not
disabled, not behind a flag — not written. Export is what the local cockpit and
the CSVs on disk are for.

All data strings render through React's default escaping; no
`dangerouslySetInnerHTML` anywhere in this app. `self_declaration_verbatim` is
scraped, untrusted, and carries embedded newlines.

**T3.3 — Everything tab.** Port the Phase 3 spec from `00-README.md`, including
the parts that are easy to lose in a rewrite:

- **Three counters, always visible**, never collapsed into one hero number:
  `companies` (unique domains) · `people` (named contacts) · `sendable`
  (verify verdict = valid). Each labeled with what it counts. They recompute on
  every filter change. The whole reason there are three is that ~23,579 and
  ~364 are both true and about 64× apart.
- **Size filters, honestly labeled.** A grouped header carrying the caption
  verbatim and always visible, not on hover: *"revenue data does not exist yet
  — these are proxies."* Under it `size_band`, `location_count`,
  `sku_estimate`, with `sku_estimate`'s unknown share (~52%) shown next to the
  control.
- **No revenue tile, no revenue filter**, and nothing labeled "revenue", until
  real revenue data lands. When it does — rows carrying a non-empty
  `contacts.raw->>'annual_revenue'` — the revenue filter **auto-enables** and
  the caption demotes to *"proxies, superseded by enrichment where available."*
  Empty means not returned; **never `0`**. A missing revenue written as zero
  puts every unenriched company under a `<$1M` filter and deletes them from
  every view.
- Other filters: segment · tier · state · disposition · source token · verify
  verdict · has-named-person · pool.
- **Per-company drill-down**: every row across every pool with its pool chip,
  the `source` chain as separate tokens, `source_url` as a link, `captured`
  date, verify verdict + date, and any project statuses. Provenance is 100%
  filled on the current files, so a blank renders as the bug it is.

**T3.4 — Sources tab.** The Phase 2 spec from `00-README.md`, **built here
once** and not in the local server. Reads `sources_registry` and `contacts`:

- Per token: rows contributed broken out per pool, unique domains, **sole-source
  domains** (what would be lost if the source were dropped), fill contributed
  (rows with email / domain / named person), last `captured` date.
- Status from `sources_registry.status` (the folder title), with the mismatch
  chip naming both values where `status` and `status_row` differ.
- **NEW badge**: a token present in `contacts.source_tokens` with **no row in
  `sources_registry`** — pinned to the top of the tab, no dismiss control. It
  clears when someone creates the folder and re-syncs. This is the founder's
  mechanism for "tell me when we're pulling from somewhere I don't know about."
  Match on the token only; a status rename must never make it flicker.
- The inverse — a registry row with no data token — renders `PLANNED`, not an
  error. That is a source that has not run yet.
- Folder path renders as **text**. Never fetched, never rendered as markdown.

**T3.5 — Pools tab.** Latest generation per disposition, counts and links into
Everything pre-filtered by pool. The simplest of the four.

**T3.6 — Projects tab.** The Phase 4 spec over `projects` + `project_status`.
**Read-only rendering.** Status writes happen through the sync script or SQL,
never through the UI in v1 — no status editor, no "mark contacted" button, no
criteria form. Rows whose domain falls outside the project's filtered set render
as "orphaned status rows" with a count, because that usually means the criteria
changed underneath the project.

**T3.7 — No Smartlead.** No import, no tab, no env var, no fetch. The deployed
app has no code path to a campaign. Grep-provable.

### Acceptance

- [ ] `pnpm build` inside `apps/contacts-dashboard/` succeeds with the repo root
      untouched — no root `package.json` edit, no `pnpm-workspace.yaml`.
- [ ] Four tabs render against live Supabase data: Everything, Sources, Pools,
      Projects.
- [ ] Three counters visible at all times and recomputing on every filter change.
- [ ] The proxy caption is in the DOM whenever a size filter is shown, and no
      element anywhere is labeled "revenue" while no revenue data exists.
- [ ] Network tab on a filtered request shows ≤500 rows in the payload. No
      request anywhere returns the full set.
- [ ] `grep -rni "smartlead" apps/contacts-dashboard/` prints nothing.
- [ ] `grep -rn "dangerouslySetInnerHTML" apps/contacts-dashboard/` prints nothing.

---

## Phase T4 — the door

Two walls, in this order: **Vercel Authentication outside, password inside.**
The outer wall means an unauthenticated request never reaches our code. The
inner wall means a Vercel team member still needs the password, and it survives
any future change to the team's membership.

### T-G2 · GATE:HUMAN — Artur creates the Vercel project

1. <https://vercel.com/new> → import this repo again as a **second project**.
2. **Project name**: `ss-contacts` (suggested).
3. **Root Directory**: `apps/contacts-dashboard` — this is the setting that
   makes the whole layout work. It is the one line that differs from
   `docs/strategy/vercel-deploy.md` §2 step 5.
4. Framework preset: Next.js (auto-detected from the subdirectory).
5. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `CONTACTS_DASHBOARD_PASSWORD`, `CONTACTS_DASHBOARD_SESSION_SECRET`.
   Production + Preview. **Nothing prefixed `NEXT_PUBLIC_`.**
6. **Settings → Deployment Protection → Vercel Authentication → ON for all
   deployments** (production included, not just previews). Team-only.

### T-G3 · GATE:HUMAN — Artur picks the password

`CONTACTS_DASHBOARD_PASSWORD` — a value he chooses, not one generated into a
file. **Not the same value as `SALES_PASSWORD`**: one password already opens
both `/sales` and `/strategy`, and a third surface on the same secret makes any
future rotation a three-place change nobody remembers to finish.
`CONTACTS_DASHBOARD_SESSION_SECRET` can be generated (`openssl rand -hex 32`)
and goes straight into Vercel + `.env.local`.

### Tasks

**T4.1 — Mirror the house gate.** A correction worth reading before you start:
**the house gate is not middleware.** It is a server-component layout gate plus
a login POST route. Mirror that shape — it is the tested pattern, it keeps the
HMAC on `node:crypto`, and it avoids the redirect loop that a middleware
implementation usually grows.

Port these, adapted:

| House file | Becomes |
|---|---|
| `lib/sales/auth.ts` | `lib/auth.ts` in the app. Same primitives: cookie value `<issuedAtMs>.<hmac>`, `signSession`, `verifySession`, constant-time `verifyPassword` via fixed-length SHA-256 digests. Cookie name `contacts_auth`. |
| `app/sales/layout.tsx` | The app's root layout. Reads the cookie, renders the login form **in place** on failure. `export const dynamic = 'force-dynamic'` — the gate must run on every request. |
| `app/api/sales/login/route.ts` | `app/api/login/route.ts`. Constant-time compare, httpOnly + `secure` + `sameSite: 'lax'` cookie, `path: '/'`. |
| `components/sales/SalesLogin.tsx` | The login form. |

**Keep the `isLocalHost` guard's production check verbatim** if you port it:

```ts
if (process.env.NODE_ENV === 'production') return false
```

That single line is what makes the Host-header bypass safe (finding F-003 — the
`Host` header is client-supplied, so without it `Host: anything.local` opens the
gate with no password). On Vercel `NODE_ENV` is `production`, so the localhost
convenience is dev-only and stays that way.

**T4.2 — Rate-limit the login.** The constant-time compare stops a timing leak
and does nothing about volume. Port the `LOGIN_POLICY` shape from
`lib/rate-limit.ts`, or the simplest in-memory equivalent — unthrottled guessing
is the whole gate otherwise (finding F-002).

**T4.3 — No unauthenticated route handlers.** Every route handler in this app
verifies the session before touching Supabase. There is no health endpoint, no
`/api/rows`, no debug route that skips the check "just for now."

### Acceptance

- [ ] Incognito, no Vercel session → the **Vercel Authentication** wall. Our app
      never renders.
- [ ] Logged into the Vercel team → the **password** form, not the dashboard.
- [ ] Correct password → dashboard, cookie set httpOnly + secure.
- [ ] Wrong password ×N → rate-limited with a `Retry-After`.
- [ ] `curl` any route handler with no cookie (from inside a Vercel-authenticated
      session) → refused, no data.
- [ ] `grep -rn "NODE_ENV === 'production'" apps/contacts-dashboard/lib/auth.ts`
      confirms the F-003 guard is present if `isLocalHost` was ported.

---

## Phase T5 — acceptance, on the deployed URL

Run this whole list against the **deployed** URL, not localhost.

- [ ] **Incognito → Vercel auth wall.** Team login → **password wall**. Password
      → dashboard. Both walls, in that order.
- [ ] **Everything renders and its three counters match the local dashboard's
      numbers for the same generation.** Reference at the time of writing:
      seated-v6 = **2,736** · companies **23,579** · sendable **364**.
      **Compare live-vs-local, not to these literals.** Generations move — the
      Phase 1 text in `00-README.md` cites seated-v9 / 2,773 from four days
      earlier, and both are correct for their date. Run the local dashboard,
      read its numbers, open the deployed one, and check that they agree *right
      now*. A mismatch means the sync is stale, not that the doc is wrong.
- [ ] **Sources tab shows the folder-title statuses**, the mismatch chips where
      the §5 rows disagree, and a `PLANNED` row for each workstream folder with
      no data token.
- [ ] **Smartlead is absent.** No tab, no import, no env var. Grep-proven.
- [ ] **Anon-key test returns nothing** — every table, zero rows or permission
      denied. Output pasted into the session log.
- [ ] **Sync is idempotent** — run it twice, second run produces zero diff.
- [ ] **The local dashboard still runs untouched**: `pnpm emails:dashboard`,
      five tabs, both grep guards printing nothing, `node --test emails/scripts/lib/`
      green.

---

## Guardrails

Non-negotiable. If a task appears to need one relaxed, the task is wrong.

1. **PII never enters git.** Migrations are committed; **data never is**.
   `emails/.gitignore` already excludes `data/`, `lists/` and `exports/` — that
   stays. Add `apps/contacts-dashboard/.gitignore` covering `.env*`, `*.csv`,
   `/data/`, `.next/`, and any local dump an agent creates while debugging.
2. **No anon-key path, ever.** No `NEXT_PUBLIC_SUPABASE_*` variable exists. The
   browser never talks to Supabase. RLS is deny-all with zero policies, and the
   grants are revoked as well.
3. **No public API routes.** Every route handler sits behind the gate. No
   full-dump endpoint, no CSV export, no health check that leaks a row count.
4. **The deployed app is the ASSET view.** The local dashboard remains the ops
   cockpit — Smartlead, Reports, blockers, the send pipeline. Do not port those
   here, and do not delete them there.
5. **Do NOT rename the `dashboard/` folder to carry a status.** The Sources tab
   parses `^(.+) \[([A-Z-]+)\]$` over this pack's directories; renaming this
   folder to `dashboard [BUILT]` would register a phantom source token named
   `dashboard` with zero rows, forever. The regex is the reason the folder name
   is boring. Keep it boring.
6. **Supabase region = closest US region.** Set once at T-G1; changing it later
   means a new project.
7. **Free-tier pause is an operator fact, not a bug.** ~1 week of inactivity
   pauses the project; the weekly sync prevents it; a manual dashboard restore
   fixes it; the sync script says so in plain words when it happens.
8. **Full replace, never merge.** Per `list_generation`, in a transaction, with
   a conservation check that exits non-zero on any mismatch.

---

## Done looks like

- [ ] Supabase free-tier project live, in the closest US region, schema migrated
      from committed SQL in `apps/contacts-dashboard/supabase/migrations/`
- [ ] RLS deny-all on all five tables, grants revoked, **anon-key test returns
      nothing** and the output is recorded
- [ ] `emails/scripts/sync-supabase.mjs` ran against the current generation with
      **conservation PASS** on every line, and a second run produced zero diff
- [ ] The sync's paused-project message verified against an unreachable host
- [ ] Vercel project `ss-contacts` deployed from Root Directory
      `apps/contacts-dashboard`, repo root untouched
- [ ] **Both walls verified**: Vercel Authentication outside, password inside,
      in that order, from incognito
- [ ] **Four tabs live**: Everything (three counters, honest size labels),
      Sources (folder-title statuses, NEW badge, mismatch chips), Pools,
      Projects (read-only)
- [ ] **Smartlead absent** — grep-proven, no import, no env var
- [ ] Counters compared **live-vs-local** for the same generation and agreeing
- [ ] The local dashboard still runs, five tabs, tests green, grep guards silent
- [ ] A `## Deployed` note added to `dashboard/00-README.md` with the URL, the
      sync command, and the Friday pairing
