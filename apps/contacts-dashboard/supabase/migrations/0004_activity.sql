-- 0004_activity.sql — usage activity + the per-account admin stats RPC.
--
-- APPLY: paste this whole file into the Supabase SQL editor and press Run.
-- Migrations are committed. Data never is.
--
-- Re-running is a no-op: the table and index are IF NOT EXISTS, the function
-- is CREATE OR REPLACE, and the revokes are idempotent. The explicit
-- transaction means a failure rolls the whole thing back rather than leaving
-- half a schema.
--
-- activity_log answers the founder's "are they really using it?": one row per
-- gated page render (kind 'page') or successful login (kind 'login'), written
-- post-response via next/server after() (lib/auth-server.ts logActivity) —
-- never on a request's critical path. Exports keep their own richer trail in
-- export_audit; nothing is double-written.

begin;

-- ── activity_log ────────────────────────────────────────────────────────────
create table if not exists activity_log (
  id            bigserial primary key,
  account_id    uuid references accounts(id) on delete set null,
  account_email text not null,          -- denormalized: usage history survives account deletion
  kind          text not null,          -- 'page' | 'login'
  detail        text,                   -- e.g. '/?view=hosebox' or '/sources'
  at            timestamptz not null default now()
);
create index if not exists activity_log_email_at_idx on activity_log (account_email, at desc);

-- ── RLS: deny-all, same as 0001/0003 ────────────────────────────────────────
-- Zero policies. RLS enabled with no policies denies every row to anon and
-- authenticated; service_role bypasses RLS — that is the only path.
alter table activity_log enable row level security;

-- Re-run the grant revokes so the new table (and its id sequence) are covered
-- at the grant layer too — both layers, exactly as 0001/0003.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- ── account_activity_stats ──────────────────────────────────────────────────
-- Everything the /admin screen shows, one row per account — LEFT JOINs so a
-- zero-activity account still appears, with null last_seen and zero counts.
-- last_seen is max(at) over ALL activity kinds; the visit counts are kind
-- 'page' only, so logins alone never inflate "visits". password_hash is
-- deliberately absent: no admin read ever selects it.
create or replace function account_activity_stats()
returns table (
  email         text,
  name          text,
  role          text,
  status        text,
  created_at    timestamptz,
  last_seen     timestamptz,
  visits_7d     bigint,
  visits_30d    bigint,
  exports_total bigint
)
language sql
stable
as $$
  select
    a.email,
    a.name,
    a.role,
    a.status,
    a.created_at,
    act.seen_at,
    coalesce(act.v7, 0),
    coalesce(act.v30, 0),
    coalesce(ex.total, 0)
  from accounts a
  left join (
    select l.account_email,
           max(l.at) as seen_at,
           count(*) filter (where l.kind = 'page' and l.at >= now() - interval '7 days')  as v7,
           count(*) filter (where l.kind = 'page' and l.at >= now() - interval '30 days') as v30
    from activity_log l
    group by l.account_email
  ) act on act.account_email = a.email
  left join (
    select e.account_email, count(*) as total
    from export_audit e
    group by e.account_email
  ) ex on ex.account_email = a.email
  order by a.created_at asc;
$$;

-- Callable by its owner and by service_role. Nothing else — the same line
-- 0002 gives every function (0003's default-privilege revoke already fails
-- new functions closed; this keeps the posture explicit).
revoke all on function account_activity_stats() from public, anon, authenticated;

commit;
