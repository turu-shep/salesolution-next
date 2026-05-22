---
globs: supabase/**/*.sql, app/api/**/*.ts, lib/supabase/**/*.ts
---

# Database Rules

1. **NEVER edit existing migration files** in `/supabase/migrations/`. Current highest: `047` (+ `999` utility). New migrations get the next sequential number.

2. **All tables require RLS.** New tables MUST include RLS policies. Flag any new table for security review.

3. **Column names: snake_case** (e.g., `booking_date`, `user_id`, `consultant_profile_id`)

4. **Use specific `.select()` columns** — never `select('*')` in production code:
```typescript
const { data: profile } = await supabase
  .from('consultant_profiles')
  .select('id, user_id, display_name, slug')
  .eq('user_id', user.id)
  .single()
```

5. **Always check for null data** after Supabase queries:
```typescript
const { data, error } = await supabase.from('table').select('id, name')
if (error) throw new Error(`Failed: ${error.message}`)
if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
```

6. **Use `.single()`** when expecting exactly one row

7. **Use relational queries** for joined data instead of multiple round trips:
```typescript
const { data } = await supabase
  .from('bookings')
  .select(`
    id, status, created_at,
    customer:customer_id ( first_name, last_name ),
    service:service_id ( name, price )
  `)
```

8. **Three Supabase clients** — use the right one:
   - `createClient()` from `@/lib/supabase/server` — Server Components & API routes (respects RLS)
   - `createClient()` from `@/lib/supabase/client` — Client Components only (browser, respects RLS)
   - `createAdminClient()` from `@/lib/supabase/admin` — Service role, bypasses RLS (webhooks, cron, admin ops only)

9. **Foreign keys** reference `auth.users(id)` for user IDs, standard table references for domain entities (organizations, consultant_profiles, services, bookings)

10. **Booking availability** must use the `is_time_slot_available()` DB function — never implement availability checks in application code
