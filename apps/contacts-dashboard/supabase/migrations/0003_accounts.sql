-- 0003_accounts.sql — per-person accounts + the export audit trail.
--
-- APPLY: paste this whole file into the Supabase SQL editor and press Run.
-- Migrations are committed. Data never is.
--
-- Re-running is a no-op: every object is IF NOT EXISTS and the revokes are
-- idempotent. The explicit transaction means a failure rolls the whole thing
-- back rather than leaving half a schema.
--
-- These are the app's OWN accounts (specs/02-client-view.md AMENDMENT 2) —
-- not Supabase GoTrue Auth. Only the service-role key ever reads or writes
-- them; the anon key must see nothing (supabase/anon-check.mjs proves it).

begin;

-- ── accounts ────────────────────────────────────────────────────────────────
-- One row per invited viewer. Credentials are delivered out-of-band by the
-- founder (scripts/accounts.mjs prints the password exactly once); nothing
-- here ever sends email.
create table if not exists accounts (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,          -- stored lowercase; login lowercases before lookup
  name          text not null,
  password_hash text not null,                 -- 'scrypt$N$r$p$<salt b64>$<hash b64>'
  role          text not null default 'viewer',-- 'viewer' | 'owner' (informational in v1)
  status        text not null default 'active',-- 'active' | 'revoked'; checked on EVERY request
  created_at    timestamptz not null default now(),
  invited_by    text
);

-- ── export_audit ────────────────────────────────────────────────────────────
-- Every export gets a row with a name on it (lib/auth-server.ts logExport;
-- Task 7's export route writes here).
create table if not exists export_audit (
  id            bigserial primary key,
  account_id    uuid references accounts(id) on delete set null,
  account_email text not null,                 -- denormalized: audit survives account deletion
  view          text not null,                 -- 'field-advisor' | 'hosebox' | view name
  filter        jsonb not null default '{}'::jsonb,
  row_count     integer not null,
  at            timestamptz not null default now()
);
create index if not exists export_audit_at_idx on export_audit (at desc);

-- ── RLS: deny-all, everywhere ───────────────────────────────────────────────
-- Zero policies, same as 0001. RLS enabled with no policies denies every row
-- to anon and authenticated; service_role bypasses RLS — that is the only path.
alter table accounts     enable row level security;
alter table export_audit enable row level security;

-- Re-run the grant revokes so the two new tables (and export_audit's id
-- sequence) are covered at the grant layer too — both layers, exactly as 0001.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- FUNCTIONS default-privilege revoke (routed Task-1 review finding). Postgres
-- grants EXECUTE on new functions to PUBLIC by default, so a future migration
-- that adds a function without its own revoke line would fail OPEN. After this,
-- it fails closed. (0002's per-function revokes stay; this covers what comes
-- next.)
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

commit;
