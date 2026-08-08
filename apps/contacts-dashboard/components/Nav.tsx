import Link from 'next/link'

import { ALLOWED_VIEWS, DEFAULT_VIEW, viewLabel } from '@/lib/columns.mjs'
import type { SheetParams } from '@/lib/contacts'
import { toSearchParams } from '@/lib/query.mjs'

/**
 * The in-app project switcher (AMENDMENT 2 C-G2/C-G3, delta D4): Field Advisor
 * and Hosebox are lenses over the same pool, selected per request via ?view= —
 * plain links, no client state, no Supabase import, and never a row read from
 * the projects table. Switching the lens keeps the current filter.
 *
 * `admin` is a server-computed isOwner() flag: the pages pass it from the
 * request's own account, so the Admin entry renders for owners only — a
 * viewer's HTML and flight payload carry no trace of it.
 */
export function Nav({ params, active, admin }: { params: SheetParams; active?: 'sources' | 'admin'; admin?: boolean }) {
  const homeQs = params.view === DEFAULT_VIEW ? '' : `?view=${params.view}`
  const onSources = active === 'sources'
  const onAdmin = active === 'admin'
  return (
    <nav style={{ borderBottom: '1px solid var(--rule)', padding: '10px 24px', display: 'flex', gap: 16, alignItems: 'baseline' }}>
      <Link href={`/${homeQs}`}>Locations</Link>
      <Link href="/sources" aria-current={onSources ? 'page' : undefined} style={onSources ? { fontWeight: 600 } : undefined}>
        Sources
      </Link>
      {admin ? (
        <Link href="/admin" aria-current={onAdmin ? 'page' : undefined} style={onAdmin ? { fontWeight: 600 } : undefined}>
          Admin
        </Link>
      ) : null}
      <span className="muted" style={{ marginLeft: 'auto' }}>View:</span>
      {ALLOWED_VIEWS.map((view) => {
        const qs = toSearchParams({ ...params, view }).toString()
        const active = params.view === view
        return (
          <Link
            key={view}
            href={qs ? `/?${qs}` : '/'}
            aria-current={active ? 'page' : undefined}
            style={active ? { fontWeight: 600 } : undefined}
          >
            {viewLabel(view)}
          </Link>
        )
      })}
    </nav>
  )
}
