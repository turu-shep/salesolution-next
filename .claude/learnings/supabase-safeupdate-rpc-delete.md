---
files: ["apps/contacts-dashboard/supabase/migrations/*.sql", "emails/scripts/sync-supabase.mjs"]
type: gotcha
added: 2026-08-08
---

## What happened

The first live `sync-supabase.mjs` run failed at the `sync_promote` RPC with HTTP 400,
Postgres code 21000, message `DELETE requires a WHERE clause` — even though the DELETE
sat inside a plpgsql function body, not a REST-layer delete.

## Why

Supabase runs the `pg-safeupdate` extension on the PostgREST connection path, and it
rejects WHERE-less DELETE/UPDATE statements *inside function bodies too* when the call
arrives via the API (service-role included). `TRUNCATE` is unaffected (a different
statement class), which is why `sync_reset()` worked while `sync_promote()` failed.

## What to do about it

Full-table deletes in any RPC this project calls through PostgREST must be written
`delete from <table> where true;` — pg-safeupdate's sanctioned full-table form, with
identical semantics. Re-apply the amended function with a paste of the migration
(CREATE OR REPLACE makes it safe); the SQL-editor path is not guarded, so a paste-run
of the old text would "work" there and still fail via the API — test through the API.
