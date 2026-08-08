import { Nav } from '@/components/Nav'
import { isOwner } from '@/lib/admin.mjs'
import { getAccount, logActivity } from '@/lib/auth-server'
import { fetchSourceStats } from '@/lib/contacts'
import type { ClientSource, SheetParams } from '@/lib/contacts'
import { parseSheetParams } from '@/lib/query.mjs'
import { describeError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * The provenance story (AMENDMENT 2, Task 8 D1–D3): where the data came from
 * and when it was verified — per source, the display name + kind, locations
 * contributed and the month last verified, nothing else. The page reads ONE
 * RPC (source_stats) through the toClientSources() boundary; the registry and
 * projects tables are never read in any client path, and no totals line
 * exists for a companies or people figure to land in.
 */
export default async function SourcesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // The layout renders the login form in place for a signed-out request, but
  // the App Router still serializes this segment into the flight payload — a
  // layout is not a boundary for its children. So the page re-checks the gate
  // and contributes NOTHING (no fetch, no copy) without an account.
  const account = await getAccount()
  if (!account) return null

  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(await searchParams)) {
    for (const one of Array.isArray(v) ? v : [v]) if (one !== undefined) sp.append(k, one)
  }
  // Parsed only so the Nav keeps the current lens; this page reads none of it.
  const params = parseSheetParams(sp) as SheetParams

  // The gate passed — that is a visit. The lens changes nothing on this page,
  // so the detail is the bare path. Post-response insert; never blocks.
  logActivity(account, 'page', '/sources')

  // Same shape as the sheet's error state: the page still renders — chrome and
  // a plain line — and the operator detail goes to the server log, never to
  // the client.
  let sources: ClientSource[] | null = null
  try {
    sources = await fetchSourceStats()
  } catch (err) {
    console.error('[contacts-dashboard] sources fetch failed:', describeError(err))
  }

  return (
    <>
      <Nav params={params} active="sources" admin={Boolean(isOwner(account))} />
      <main>
        <h1>Sources</h1>
        <p className="muted" style={{ maxWidth: 640 }}>
          Every location in the sheet was captured from one or more of these public sources. Each row
          links its own provenance — its source chips and the &ldquo;found in N lists&rdquo; expander
          name the exact source and the month it was verified.
        </p>
        {sources ? (
          sources.length ? (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Kind</th>
                    <th>Locations contributed</th>
                    <th>Last verified</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.token}>
                      <td>{s.display}</td>
                      <td>{s.kind ?? '—'}</td>
                      <td>{s.locations.toLocaleString('en-US')}</td>
                      <td>{s.lastCaptured ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No sources recorded yet.</p>
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
