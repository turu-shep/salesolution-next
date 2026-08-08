import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The one Supabase client. Service-role key, server-side only.
 *
 * The service-role key bypasses RLS by design — it is the database, not a
 * credential with a blast radius. It never reaches the browser: there is no
 * browser-exposed (public-prefixed) Supabase variable in this app, and no
 * client component imports this module.
 */

/** What a paused free-tier project says. Never a bare fetch error. */
export const PAUSED_MESSAGE = 'project paused — restore it in the Supabase dashboard'

let cached: SupabaseClient | null = null

export function serverClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the deployment environment.')
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

/**
 * A Supabase error turned into something an operator can act on. ~A week of
 * inactivity pauses a free-tier project, and a paused project needs a manual
 * restore in the dashboard — there is no API for it. Saying "fetch failed"
 * instead sends someone hunting a bug that isn't there.
 */
export function describeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(message)) return PAUSED_MESSAGE
  return message
}
