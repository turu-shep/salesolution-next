import { Counters } from '@/components/Counters'
import { Filters } from '@/components/Filters'
import { Nav } from '@/components/Nav'
import { Sheet } from '@/components/Sheet'
import { isOwner, pageDetail } from '@/lib/admin.mjs'
import { getAccount, logActivity } from '@/lib/auth-server'
import { viewLabel } from '@/lib/columns.mjs'
import { countMatching, fetchCounters, fetchFacets, fetchSheet } from '@/lib/contacts'
import type { ClientRow, Counters as CountersType, SheetParams } from '@/lib/contacts'
import { pageRange, parseSheetParams, toSearchParams } from '@/lib/query.mjs'
import { describeError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type PageData = {
  rows: ClientRow[]
  counters: CountersType
  facets: { states: string[]; sources: string[] }
  total: number
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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
  // The parser clamps every field to the SheetParams contract at runtime; the
  // cast records that here, at the one boundary where untrusted input comes in.
  const params = parseSheetParams(sp) as SheetParams
  const { pageSize } = pageRange(params)

  // The gate passed — that is a visit, whatever the data layer does next.
  // Post-response insert; can never block or break this render.
  logActivity(account, 'page', pageDetail(params.view) as string)

  // When the data source is unreachable the page still renders — chrome,
  // counter labels, a plain line — and the operator detail goes to the server
  // log, never to the client.
  let data: PageData | null = null
  try {
    const [{ rows }, counters, facets, total] = await Promise.all([
      fetchSheet(params),
      fetchCounters(params),
      fetchFacets(),
      countMatching(params),
    ])
    data = { rows, counters, facets, total }
  } catch (err) {
    console.error('[contacts-dashboard] sheet fetch failed:', describeError(err))
  }

  const lastPage = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1
  const exportHref = `/api/export?${toSearchParams(params).toString()}`

  return (
    <>
      <Nav params={params} admin={Boolean(isOwner(account))} />
      <main>
        <h1>{viewLabel(params.view)}</h1>
        <Counters counters={data ? data.counters : null} />
        {data ? (
          <>
            <Filters params={params} facets={data.facets} />
            <p className="sheet-meta">
              <a href={exportHref} className="btn btn-quiet btn-sm">Download CSV of this filter</a>{' '}
              <span className="muted">
                page {params.page} of {lastPage.toLocaleString('en-US')} · {pageSize} rows per page
              </span>
            </p>
            <Sheet rows={data.rows} params={params} />
          </>
        ) : (
          <p className="warn banner">
            Data is temporarily unavailable. Try again in a few minutes.
          </p>
        )}
      </main>
    </>
  )
}
