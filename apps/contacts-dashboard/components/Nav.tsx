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
  const onHome = active === undefined
  const onSources = active === 'sources'
  const onAdmin = active === 'admin'
  return (
    <nav className="nav">
      <Link className="nav-tab" href={`/${homeQs}`} aria-current={onHome ? 'page' : undefined}>
        Locations
      </Link>
      <Link className="nav-tab" href="/sources" aria-current={onSources ? 'page' : undefined}>
        Sources
      </Link>
      {admin ? (
        <Link className="nav-tab" href="/admin" aria-current={onAdmin ? 'page' : undefined}>
          Admin
        </Link>
      ) : null}
      <span className="nav-lens">
        <span className="seg-label">View:</span>
        <span className="seg">
          {ALLOWED_VIEWS.map((view) => {
            const qs = toSearchParams({ ...params, view }).toString()
            const activeView = params.view === view
            return (
              <Link key={view} href={qs ? `/?${qs}` : '/'} aria-current={activeView ? 'page' : undefined}>
                {viewLabel(view)}
              </Link>
            )
          })}
        </span>
      </span>
    </nav>
  )
}
