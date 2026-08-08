import { AdminActions } from '@/components/AdminActions'
import { InviteForm } from '@/components/InviteForm'
import { Nav } from '@/components/Nav'
import { isOwner, rowActions } from '@/lib/admin.mjs'
import { fetchAccountStats, getAccount } from '@/lib/auth-server'
import type { AdminAccount } from '@/lib/auth-server'
import type { SheetParams } from '@/lib/contacts'
import { parseSheetParams } from '@/lib/query.mjs'
import { describeError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * The owner screen (founder-requested, post-package scope): invite people,
 * revoke access, and see who is actually using the sheet — last seen, 7d/30d
 * visits, export counts, per account.
 */
export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Same flight-guard idiom as / and /sources, one clause stricter: the App
  // Router serializes this segment into the payload even when the layout
  // renders the login form, and here the layout gate is not enough anyway — a
  // signed-in VIEWER must get zero admin bytes too, not a 403 page. Anything
  // short of an owner contributes NOTHING (no fetch, no copy).
  const account = await getAccount()
  if (!account || !isOwner(account)) return null
  const self = account

  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(await searchParams)) {
    for (const one of Array.isArray(v) ? v : [v]) if (one !== undefined) sp.append(k, one)
  }
  // Parsed only so the Nav keeps the current lens; this page reads none of it.
  const params = parseSheetParams(sp) as SheetParams

  // Same shape as the sheet's error state: the page still renders — chrome,
  // the invite form, a plain line — and the operator detail goes to the
  // server log, never to the client. Inviting works even while the stats RPC
  // is unreachable; the two do not share a fate.
  let accounts: AdminAccount[] | null = null
  try {
    accounts = await fetchAccountStats()
  } catch (err) {
    console.error('[contacts-dashboard] account stats fetch failed:', describeError(err))
  }

  return (
    <>
      <Nav params={params} active="admin" admin />
      <main>
        <h1>Admin</h1>
        <p className="muted" style={{ maxWidth: 640 }}>
          Invite people, revoke access, and see who is actually using the sheet. A new invite shows
          its password exactly once — it is never stored. Revocation bites on the person&rsquo;s next
          request.
        </p>
        <InviteForm />
        {accounts ? (
          accounts.length ? (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last seen (UTC)</th>
                    <th>Visits 7d</th>
                    <th>Visits 30d</th>
                    <th>Exports</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.email}>
                      <td>
                        {a.name}
                        {a.email === self.email ? <span className="muted"> (you)</span> : null}
                      </td>
                      <td>{a.email}</td>
                      <td>{a.role}</td>
                      <td>{a.status === 'revoked' ? <span className="chip warn">revoked</span> : a.status}</td>
                      <td>{a.createdAt ?? '—'}</td>
                      <td>{a.lastSeen ?? '—'}</td>
                      <td>{a.visits7d.toLocaleString('en-US')}</td>
                      <td>{a.visits30d.toLocaleString('en-US')}</td>
                      <td>{a.exportsTotal.toLocaleString('en-US')}</td>
                      <td>
                        <AdminActions email={a.email} actions={rowActions(a, self.email) as string[]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No accounts yet. Invite the first one above.</p>
          )
        ) : (
          <p className="warn" style={{ display: 'inline-block', padding: '8px 12px' }}>
            Data is temporarily unavailable. Try again in a few minutes.
          </p>
        )}
      </main>
    </>
  )
}
