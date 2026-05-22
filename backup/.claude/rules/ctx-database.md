---
globs: ["supabase/migrations/**", "lib/supabase/**"]
---

Before modifying database migrations or Supabase clients, read `docs/modules/database-schema.md` for the full schema overview, RLS patterns, and migration strategy.

NEVER edit existing migration files. New migrations get the next sequential number after the current highest.

After creating new migrations, update that module doc to reflect the new tables/columns.
