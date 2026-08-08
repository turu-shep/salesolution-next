import { cookies, headers } from 'next/headers'
import { after } from 'next/server'
import { cache } from 'react'

import { isOwner, toAdminAccounts } from './admin.mjs'
import { CONTACTS_COOKIE, MAX_AGE_S, isLocalHost, readSession } from './auth.mjs'
import { describeError, serverClient } from './supabase'

/**
 * Next-facing session/account helpers. Server-only: this module reads
 * next/headers and the service-role Supabase client — no client component may
 * import it.
 *
 * The session cookie carries the account id; the account ROW carries the
 * truth. Every request re-checks `status === 'active'`, which is what makes
 * revocation immediate: `scripts/accounts.mjs revoke <email>` kills that
 * person's live sessions on their next request, cookie or no cookie.
 */

export type Account = { id: string; email: string; name: string; role: string }

/** The synthetic localhost identity — F-003 keeps this unreachable in production. */
const DEV_ACCOUNT: Account = { id: 'dev', email: 'dev@localhost', name: 'Dev (localhost)', role: 'owner' }

/**
 * The account behind this request, or null. Null unless the session verifies
 * AND the account row exists AND its status is 'active'. Any DB failure reads
 * as null — the gate fails closed, never open.
 *
 * Wrapped in React cache() so the layout gate and a page's segment guard share
 * ONE accounts read per request. The memo is request-scoped — nothing persists
 * across requests, so revocation still bites on the very next request.
 */
export const getAccount = cache(async (): Promise<Account | null> => {
  const host = (await headers()).get('host') ?? ''
  if (isLocalHost(host)) return DEV_ACCOUNT

  const token = (await cookies()).get(CONTACTS_COOKIE)?.value ?? ''
  const session = readSession(token, process.env.CONTACTS_DASHBOARD_SESSION_SECRET ?? '', MAX_AGE_S * 1000)
  if (!session) return null

  try {
    const db = serverClient()
    const { data, error } = await db
      .from('accounts')
      .select('id, email, name, role, status')
      .eq('id', session.accountId)
      .limit(1)
    if (error || !data || data.length !== 1) return null
    const row = data[0] as Account & { status: string }
    if (row.status !== 'active') return null
    return { id: row.id, email: row.email, name: row.name, role: row.role }
  } catch {
    return null
  }
})

/**
 * Route-handler guard: the account, or a 401 Response the caller returns
 * as-is. Route handlers have no form to render and never redirect.
 */
export async function requireAccount(): Promise<Account | Response> {
  const account = await getAccount()
  if (!account) return Response.json({ error: 'unauthorized' }, { status: 401 })
  return account
}

/**
 * Route-handler guard for the admin API: the account when it is an owner, or
 * the Response the caller returns as-is — 401 signed-out, 403 signed-in
 * non-owner. Pages never call this; they flight-guard with isOwner() and
 * return null instead, so a viewer gets zero admin bytes rather than a page.
 */
export async function requireOwner(): Promise<Account | Response> {
  const gate = await requireAccount()
  if (gate instanceof Response) return gate
  if (!isOwner(gate)) return Response.json({ error: 'forbidden' }, { status: 403 })
  return gate
}

/** A stats RPC row after the toAdminAccount() boundary — what /admin renders. */
export type AdminAccount = {
  email: string
  name: string
  role: string
  status: string
  createdAt: string | null
  lastSeen: string | null
  visits7d: number
  visits30d: number
  exportsTotal: number
}

/**
 * The per-account usage picture behind /admin: identity + status columns,
 * last seen, 7d/30d page visits, lifetime export count. One RPC
 * (account_activity_stats — no password_hash in its select list), then the
 * serialization boundary. Owner-only callers: the /admin page after its
 * isOwner() flight-guard.
 */
export async function fetchAccountStats(): Promise<AdminAccount[]> {
  const db = serverClient()
  const { data, error } = await db.rpc('account_activity_stats')
  if (error) throw new Error(describeError(error))
  return toAdminAccounts((data ?? []) as Record<string, unknown>[]) as AdminAccount[]
}

/**
 * The usage trail: one row per gated page render or successful login,
 * inserted AFTER the response via next/server after() — never on the
 * request's critical path. Fire-and-forget by contract: any failure (schedule
 * or insert) logs server-side and nothing else; a broken activity table must
 * never break a render or a login. The synthetic localhost dev identity is
 * not logged — it has no accounts row and its "usage" is development noise.
 * Exports are NOT logged here: export_audit already carries them with more
 * detail, and a double-write would double-count.
 */
export function logActivity(account: Pick<Account, 'id' | 'email'>, kind: 'page' | 'login', detail: string | null): void {
  if (account.id === 'dev') return
  try {
    after(async () => {
      try {
        const db = serverClient()
        const { error } = await db.from('activity_log').insert({
          account_id: account.id,
          account_email: account.email,
          kind,
          detail,
        })
        if (error) console.error('[contacts-dashboard] activity log failed:', describeError(error))
      } catch (err) {
        console.error('[contacts-dashboard] activity log failed:', describeError(err))
      }
    })
  } catch (err) {
    // after() itself refused (e.g. called outside a request scope) — still
    // nobody's render breaks over a usage row.
    console.error('[contacts-dashboard] activity log failed to schedule:', describeError(err))
  }
}

/**
 * The export audit trail: one row per export, with a name on it. Throws when
 * the insert fails — an export that cannot be audited must fail loudly, not
 * proceed silently. (Task 7's export route calls this.)
 */
export async function logExport(account: Account, view: string, filter: unknown, rowCount: number): Promise<void> {
  const db = serverClient()
  const { error } = await db.from('export_audit').insert({
    // The synthetic dev identity has no accounts row; the denormalized email
    // still names it honestly in the audit.
    account_id: account.id === 'dev' ? null : account.id,
    account_email: account.email,
    view,
    filter: filter ?? {},
    row_count: rowCount,
  })
  if (error) throw new Error(describeError(error))
}
