import { cookies, headers } from 'next/headers'

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
 */
export async function getAccount(): Promise<Account | null> {
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
}

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
