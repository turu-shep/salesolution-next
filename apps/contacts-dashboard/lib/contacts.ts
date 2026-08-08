import { DEFAULT_PAGE_SIZE, selectList } from './columns.mjs'
import { applyFilters, buildFilterSpec, counterArgs, pageRange } from './query.mjs'
import { toClientCounters, toClientRow } from './rows.mjs'
import { describeError, serverClient } from './supabase'

export type SheetParams = {
  sources: string[]
  states: string[]
  country: 'us' | 'non-us' | null
  catMin: number | null
  catMax: number | null
  q: string
  page: number
  view: 'field-advisor' | 'hosebox'
  sort: string
  dir: 'asc' | 'desc'
}

/** Exactly the three location counters. No people or sendable figure exists in this type on purpose. */
export type Counters = {
  locations: number
  brands: number
  states: number
}

/** A row as the client is allowed to see it: opaque key, derived country, whitelist fields. */
export type ClientRow = { key: string; country: string } & Record<string, unknown>

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
 * Which generation the table currently holds. It holds exactly one.
 * SERVER-SIDE USE ONLY: the generation name is internal vocabulary and never
 * renders on a client-reachable page (AMENDMENT 2 D6) — this stays for the
 * sync check and the export audit trail, not for display.
 */
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

export { DEFAULT_PAGE_SIZE }
