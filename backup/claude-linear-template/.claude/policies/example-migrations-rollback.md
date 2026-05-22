---
name: migrations-rollback
files: ["**/migrations/**", "**/migrate/**", "supabase/migrations/**", "db/migrate/**", "prisma/migrations/**"]
enforcement: block
triggers: ["implement", "batch", "ship"]
requires: ["rollback-sql-present", "human-approval"]
---

# Policy: Database migrations must include rollback SQL and human approval

## Why this policy exists
Migrations are the hardest things to undo in production. A broken migration without a rollback means data loss, extended downtime, or a hand-authored reverse migration under pressure. Forcing a rollback to be written at the same time as the forward migration makes "how do we undo this?" part of the design, not an afterthought.

## What it requires
Any new file in the migration directories listed above must:
1. Contain a rollback/down section (whether that's an inline `-- rollback:` block, a paired `down.sql` file, or the framework's native rollback format)
2. Be explicitly approved by the human before commit — don't auto-commit migration files

## How to satisfy it
- For raw SQL migrations: add a commented `-- rollback:` section with the reverse statements
- For Prisma/Rails/etc: the framework's `down` function must be non-trivial (not just `// TODO`)
- For destructive migrations (DROP TABLE, DROP COLUMN): the rollback should include the original schema so the column/table can be recreated (even if data can't)

## How to verify
- Check the migration file contains either:
  - A line matching `/--\s*rollback/i`
  - A non-empty `down` or `rollback` function
  - A matching `_down.sql` or `down.sql` file in the same directory
- Prompt the user for explicit approval before the commit happens

## Override
Allowed only for migrations that are truly irreversible by nature (e.g. one-way data transformations). Override with `override policy migrations-rollback` AND include in the decision log exactly why no rollback is possible and what the recovery plan is if this goes wrong.
