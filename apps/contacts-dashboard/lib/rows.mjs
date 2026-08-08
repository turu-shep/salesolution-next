/**
 * rows — the serialization boundary (AMENDMENT 2 D2/D3).
 *
 * Everything the client receives passes through here, on the server, before it
 * is rendered or exported. Two rules, both enforced by construction:
 *
 * 1. The composite primary key '<generation>:<pool>:<row_index>' leaks internal
 *    routing vocabulary, so the client gets an OPAQUE key instead — stable
 *    across renders, meaningless to the reader. React keys, DOM attributes and
 *    any future row-detail call use the opaque key only.
 * 2. `pool` is consumed for the US/Non-US derivation and then dropped. `id`,
 *    `pool`, `list_generation` and anything else off the whitelist never reach
 *    HTML, JSON, serialized props, or the export.
 */
import { createHash } from 'node:crypto'

import { LOCATION_COLUMNS } from './columns.mjs'
import { countryOf } from './query.mjs'
import { monthYear, sourceDisplayParts } from './sources.mjs'

/** sha256 of the row id, first 16 hex chars. Stable, opaque, collision-safe at this scale. */
export function opaqueKey(id) {
  return createHash('sha256').update(String(id ?? '')).digest('hex').slice(0, 16)
}

/**
 * A database row -> the row the client is allowed to see: `key` (opaque),
 * `country` (derived from pool membership server-side), and the whitelist
 * columns — each an explicit null when absent, so the shape never varies.
 */
export function toClientRow(row) {
  const r = row ?? {}
  const out = { key: opaqueKey(r.id), country: countryOf(r.pool) }
  for (const col of LOCATION_COLUMNS) out[col] = r[col] ?? null
  return out
}

/**
 * The contacts_counters RPC returns seven numbers; the client gets three.
 * companies / no_domain / people / sendable are DISCARDED here, before
 * anything is serialized — no people or sendable figure may reach the page.
 */
export function toClientCounters(row) {
  const r = row ?? {}
  const n = (v) => Number(v ?? 0)
  return { locations: n(r.locations), brands: n(r.brands), states: n(r.states) }
}

/**
 * A source_stats() row -> the provenance card the client is allowed to see
 * (AMENDMENT 2, Task 8 D2). The RPC also returns with_email / with_person
 * (banned person/email vocabulary) and sole_source / domains / with_domain
 * (internal asset analytics) — all DISCARDED here, before anything serializes.
 * The capture date collapses to 'Mon YYYY' at this boundary too, so the exact
 * day never ships.
 */
export function toClientSource(row) {
  const r = row ?? {}
  const token = String(r.token ?? '')
  const { display, kind } = sourceDisplayParts(token)
  return { token, display, kind, locations: Number(r.rows ?? 0), lastCaptured: monthYear(r.last_captured) }
}

/** Every token renders, sorted by locations contributed (desc; token breaks ties so the order is stable). */
export function toClientSources(rows) {
  return (rows ?? []).map(toClientSource).sort((a, b) => b.locations - a.locations || a.token.localeCompare(b.token))
}
