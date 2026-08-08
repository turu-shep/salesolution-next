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
