import { DEFAULT_PAGE_SIZE, SHOW_ALL_PAGE_SIZE, selectList } from './columns.mjs'
import { applyFilters, buildFilterSpec, counterArgs, pageRange } from './query.mjs'
import { describeError, serverClient } from './supabase'

export type SheetParams = {
  sources: string[]
  states: string[]
  country: 'us' | 'non-us' | null
  catMin: number | null
  catMax: number | null
  q: string
  page: number
  showAll: boolean
  sort: string
  dir: 'asc' | 'desc'
}

export type Counters = {
  companies: number
  no_domain: number
  people: number
  sendable: number
  locations: number
  brands: number
  states: number
}

type Row = Record<string, unknown>

/** An arbitrary window. Used by the sheet and by the streamed export. */
export async function fetchPage(params: SheetParams, offset: number, size: number): Promise<Row[]> {
  const db = serverClient()
  let q = db.from('contacts').select(selectList(params.showAll))
  q = applyFilters(q, buildFilterSpec(params))
  const { data, error } = await q
    .order(params.sort, { ascending: params.dir === 'asc', nullsFirst: false })
    .order('id', { ascending: true })
    .range(offset, offset + size - 1)
  if (error) throw new Error(describeError(error))
  return (data ?? []) as unknown as Row[]
}

/** One page of rows. The client never receives more than this. */
export async function fetchSheet(params: SheetParams): Promise<{ rows: Row[]; pageSize: number }> {
  const { from, pageSize } = pageRange(params)
  return { rows: await fetchPage(params, from, pageSize), pageSize }
}

/**
 * The counters, computed over the WHOLE filtered set rather than the page.
 * `companies` and `sendable` are roughly 64x apart and both true, which is why
 * there are several counters and not one hero number.
 */
export async function fetchCounters(params: SheetParams): Promise<Counters> {
  const db = serverClient()
  const { data, error } = await db.rpc('contacts_counters', counterArgs(params))
  if (error) throw new Error(describeError(error))
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, string | number> | undefined
  const n = (v: string | number | undefined) => Number(v ?? 0)
  return {
    companies: n(row?.companies),
    no_domain: n(row?.no_domain),
    people: n(row?.people),
    sendable: n(row?.sendable),
    locations: n(row?.locations),
    brands: n(row?.brands),
    states: n(row?.states),
  }
}

/** Exact row count for the current filter, no payload. */
export async function countMatching(params: SheetParams): Promise<number> {
  const db = serverClient()
  let q = db.from('contacts').select('id', { count: 'exact', head: true })
  q = applyFilters(q, buildFilterSpec(params))
  const { count, error } = await q
  if (error) throw new Error(describeError(error))
  return count ?? 0
}

/** Which generation the table currently holds. It holds exactly one. */
export async function fetchGeneration(): Promise<string | null> {
  const db = serverClient()
  const { data, error } = await db.from('contacts').select('list_generation').limit(1)
  if (error) throw new Error(describeError(error))
  return ((data?.[0] as { list_generation?: string } | undefined)?.list_generation) ?? null
}

/** The values the state and source controls offer. Derived from the data, never hand-listed. */
export async function fetchFacets(): Promise<{ states: string[]; sources: string[] }> {
  const db = serverClient()
  const [sourcesRes, statesRes] = await Promise.all([
    db.rpc('source_stats'),
    db.from('contacts').select('state').not('state', 'is', null).order('state', { ascending: true }).limit(50000),
  ])
  if (sourcesRes.error) throw new Error(describeError(sourcesRes.error))
  if (statesRes.error) throw new Error(describeError(statesRes.error))
  const states = [...new Set(((statesRes.data ?? []) as { state: string }[]).map((r) => r.state).filter(Boolean))].sort()
  const sources = ((sourcesRes.data ?? []) as { token: string }[]).map((r) => r.token).sort()
  return { states, sources }
}

export { DEFAULT_PAGE_SIZE, SHOW_ALL_PAGE_SIZE }
