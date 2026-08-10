import { CLIENT_POOLS, DEFAULT_PAGE_SIZE, selectList } from './columns.mjs'
import { applyFilters, buildFilterSpec, counterArgs, pageRange } from './query.mjs'
import { toClientCounters, toClientFacets, toClientRow, toClientSources } from './rows.mjs'
import { describeError, serverClient } from './supabase'

export type SheetParams = {
  sources: string[]
  states: string[]
  brands: string[]
  sizes: string[]
  btype: 'distributor' | 'contractor-service' | 'other' | null
  country: 'us' | 'non-us' | null
  catMin: number | null
  catMax: number | null
  q: string
  page: number
  view: 'field-advisor' | 'hosebox'
  sort: string
  dir: 'asc' | 'desc'
}

/** The values the filter controls offer. Derived from the data (pools-scoped), never hand-listed. */
export type Facets = {
  states: string[]
  sources: string[]
  brands: string[]
  sizes: string[]
}

/** Exactly the three location counters. No people or sendable figure exists in this type on purpose. */
export type Counters = {
  locations: number
  brands: number
  states: number
}

/** A row as the client is allowed to see it: opaque key, derived country, whitelist fields. */
export type ClientRow = { key: string; country: string } & Record<string, unknown>

/** A source as the client is allowed to see it: name, kind, contribution, month verified. */
export type ClientSource = {
  token: string
  display: string
  kind: string | null
  locations: number
  lastCaptured: string | null
}

/**
 * An arbitrary window, already passed through the serialization boundary
 * (lib/rows.mjs): opaque key on, internal fields off. Used by the sheet and by
 * the streamed export, so neither can ever carry a field the other hides.
 */
export async function fetchPage(params: SheetParams, offset: number, size: number): Promise<ClientRow[]> {
  const db = serverClient()
  let q = db.from('contacts').select(selectList())
  q = applyFilters(q, buildFilterSpec(params))
  const { data, error } = await q
    .order(params.sort, { ascending: params.dir === 'asc', nullsFirst: false })
    .order('id', { ascending: true })
    .range(offset, offset + size - 1)
  if (error) throw new Error(describeError(error))
  return (data ?? []).map((row) => toClientRow(row) as ClientRow)
}

/** One page of rows. The client never receives more than this. */
export async function fetchSheet(params: SheetParams): Promise<{ rows: ClientRow[]; pageSize: number }> {
  const { from, pageSize } = pageRange(params)
  return { rows: await fetchPage(params, from, pageSize), pageSize }
}

/**
 * The three location counters, computed over the WHOLE filtered set rather
 * than the page. The RPC returns seven numbers; toClientCounters() discards
 * companies / no_domain / people / sendable before anything is serialized.
 */
export async function fetchCounters(params: SheetParams): Promise<Counters> {
  const db = serverClient()
  const { data, error } = await db.rpc('contacts_counters', counterArgs(params))
  if (error) throw new Error(describeError(error))
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, string | number> | undefined
  return toClientCounters(row)
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

/**
 * The provenance stats behind the Sources page: per token, the display parts,
 * locations contributed and the month last verified, sorted by contribution.
 * The source_stats RPC returns per-token analytics the client must not see;
 * toClientSources() discards them before anything serializes. The registry
 * table (statuses, folders, estimates — pipeline ops detail) is never read in
 * any client path (AMENDMENT 2, Task 8 D2).
 *
 * p_pools is pinned to CLIENT_POOLS (Task 13 A): per-source counts cover the
 * curated client base only, so the Sources page and the sheet tell one story.
 */
export async function fetchSourceStats(): Promise<ClientSource[]> {
  const db = serverClient()
  const { data, error } = await db.rpc('source_stats', { p_pools: CLIENT_POOLS })
  if (error) throw new Error(describeError(error))
  return toClientSources((data ?? []) as Record<string, unknown>[])
}

/**
 * The values the filter controls offer. Derived from the data, never
 * hand-listed. One client_facets RPC computes the distincts server-side over
 * the curated client base (it replaced a 50-window JS pagination over the
 * whole table — Task 13 E); sources still come from source_stats, pools-scoped
 * the same way. p_pools is pinned to CLIENT_POOLS on both calls — facet values
 * from the reject bins must never become visible filter options.
 */
export async function fetchFacets(): Promise<Facets> {
  const db = serverClient()
  const [facetsRes, sourcesRes] = await Promise.all([
    db.rpc('client_facets', { p_pools: CLIENT_POOLS }),
    db.rpc('source_stats', { p_pools: CLIENT_POOLS }),
  ])
  if (facetsRes.error) throw new Error(describeError(facetsRes.error))
  if (sourcesRes.error) throw new Error(describeError(sourcesRes.error))
  const row = (Array.isArray(facetsRes.data) ? facetsRes.data[0] : facetsRes.data) as Record<string, unknown> | undefined
  const sources = ((sourcesRes.data ?? []) as { token: string }[]).map((r) => r.token).sort()
  return { ...toClientFacets(row), sources }
}

export { DEFAULT_PAGE_SIZE }
