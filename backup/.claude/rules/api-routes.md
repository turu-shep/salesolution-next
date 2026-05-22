---
globs: app/api/**/*.ts
---

# API Route Rules

Every API route in this project MUST:

1. **Start with a JSDoc comment** describing method, path, and purpose:
```typescript
/**
 * GET /api/activity/recent
 * Get recent activity feed for the current user
 *
 * Query params:
 * - limit: number (default: 10)
 */
```

2. **Verify authentication** (no exceptions):
```typescript
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

3. **Validate input** with Zod schemas (preferred) or manual checks

4. **Return standard response format**:
- Success: `NextResponse.json({ success: true, data: { ... } })`
- Error: `NextResponse.json({ error: 'Message' }, { status: 4xx/5xx })`

5. **Wrap in try-catch** with descriptive bracket-prefixed logging:
```typescript
} catch (error) {
  console.error('[API /domain/action] Error:', error)
  return NextResponse.json({ error: 'Failed to do X' }, { status: 500 })
}
```

6. **Import the server client** — never use browser client in API routes:
```typescript
import { createClient } from '@/lib/supabase/server'
```
Use `createAdminClient` from `@/lib/supabase/admin` only when bypassing RLS is required (e.g., service-level operations).

7. **Use specific `.select()` columns** — never `select('*')`:
```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    id, status, created_at, scheduled_at, total_amount,
    customer:customer_id ( first_name, last_name )
  `)
  .eq('consultant_profile_id', profile.id)
  .order('created_at', { ascending: false })
```
