-- 0005_client_base.sql — founder v2 (decision 2026-08-09): curated client base,
-- brands-carried tokens, estimated business type, server-side facets.
--
-- APPLY: paste this whole file into the Supabase SQL editor and press Run.
-- Migrations are committed. Data never is. AFTER pasting, re-run the sync
-- (node emails/scripts/sync-supabase.mjs) — brand_tokens and business_type are
-- derived at sync time and stay '{}'/null until a sync pass populates them.
--
-- Re-running is a no-op: columns are IF NOT EXISTS, functions CREATE OR
-- REPLACE, drops IF EXISTS, revokes idempotent. The explicit transaction rolls
-- back a failure whole.

begin;

-- ── columns ─────────────────────────────────────────────────────────────────
-- Derived by the sync (emails/scripts/lib/sync-supabase-data.mjs):
--   brand_tokens  — brand_authorized + line_card split on '|', deduped
--                   case-insensitively (first casing kept), capped at 100.
--                   The REAL "brands carried" answer; source_tokens is
--                   provenance and was never that.
--   business_type — deriveBusinessType()'s labeled heuristic:
--                   'distributor' | 'contractor-service' | 'other'.
--
-- Both tables, SAME ORDER: sync_promote() moves staging across with
-- `insert into contacts select * from contacts_staging` — positional — so the
-- two column lists must stay aligned. Append-only, contacts before staging.
alter table contacts         add column if not exists brand_tokens text[] not null default '{}';
alter table contacts_staging add column if not exists brand_tokens text[] not null default '{}';
alter table contacts         add column if not exists business_type text;
alter table contacts_staging add column if not exists business_type text;

create index if not exists contacts_brands_idx on contacts using gin (brand_tokens);

-- ── contacts_counters: + p_pools / p_brands / p_sizes / p_btype ─────────────
-- The predicate here mirrors buildFilterSpec()/applyFilters() in lib/query.mjs
-- exactly. One parse, two emitters: change one, change the other. The app pins
-- p_pools to CLIENT_POOLS on every call; null keeps the pre-0005 behavior so a
-- re-run against old app code stays sound.
--
-- DROP first, deliberately: CREATE OR REPLACE with a different parameter list
-- creates an OVERLOAD, and two candidates with defaults make every named-args
-- PostgREST call ambiguous (300 "could not choose the best candidate").
drop function if exists contacts_counters(text[], text[], text, numeric, numeric, text);

create or replace function contacts_counters(
  p_sources    text[]  default null,
  p_states     text[]  default null,
  p_country    text    default null,   -- 'us' | 'non-us' | null
  p_cat_min    numeric default null,
  p_cat_max    numeric default null,
  p_q          text    default null,
  p_pools      text[]  default null,   -- the curated client base; the app ALWAYS passes it
  p_brands     text[]  default null,   -- brands/lines carried (brand_tokens overlap)
  p_sizes      text[]  default null,   -- size_band membership
  p_btype      text    default null    -- 'distributor' | 'contractor-service' | 'other'
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
    where (p_pools   is null or c.pool = any(p_pools))
      and (p_sources is null or c.source_tokens && p_sources)
      and (p_brands  is null or c.brand_tokens  && p_brands)
      and (p_states  is null or c.state = any(p_states))
      and (p_sizes   is null or c.size_band = any(p_sizes))
      and (p_btype   is null or c.business_type = p_btype)
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

-- ── source_stats: + p_pools ─────────────────────────────────────────────────
-- Per-source counts scope to the curated client base when p_pools is passed,
-- so the Sources page and the sheet tell one story. Same drop-first reason.
drop function if exists source_stats();

create or replace function source_stats(p_pools text[] default null)
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
    where (p_pools is null or c.pool = any(p_pools))
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

-- ── client_facets ───────────────────────────────────────────────────────────
-- The filter controls' value lists, computed server-side over the client base.
-- Replaces the app's 50-window JS pagination over `contacts.state` — one call,
-- three distinct lists, and facet values from the reject bins can never become
-- visible filter options because the pools predicate runs here, in SQL.
create or replace function client_facets(p_pools text[] default null)
returns table (states text[], brands text[], sizes text[])
language sql
stable
as $$
  select
    (select coalesce(array_agg(distinct c.state order by c.state), '{}'::text[])
       from contacts c
      where (p_pools is null or c.pool = any(p_pools))
        and c.state is not null and c.state <> ''),
    (select coalesce(array_agg(distinct t.tok order by t.tok), '{}'::text[])
       from contacts c
      cross join unnest(c.brand_tokens) as t(tok)
      where (p_pools is null or c.pool = any(p_pools))),
    (select coalesce(array_agg(distinct c.size_band order by c.size_band), '{}'::text[])
       from contacts c
      where (p_pools is null or c.pool = any(p_pools))
        and c.size_band is not null and c.size_band <> '');
$$;

-- ── revokes ─────────────────────────────────────────────────────────────────
-- Functions are callable by their owner and by service_role. Nothing else —
-- the same posture as 0002/0004 (0003's default-privilege revoke already fails
-- new functions closed; this keeps it explicit, new signatures included).
revoke all on function contacts_counters(text[], text[], text, numeric, numeric, text, text[], text[], text[], text) from public, anon, authenticated;
revoke all on function source_stats(text[])                                                                          from public, anon, authenticated;
revoke all on function client_facets(text[])                                                                         from public, anon, authenticated;

commit;
