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
