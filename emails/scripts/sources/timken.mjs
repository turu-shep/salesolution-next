#!/usr/bin/env node
/**
 * S1 source #1 — Timken dealer locator (WP Google Maps / WPGMZA REST).
 *
 *   node emails/scripts/sources/timken.mjs
 *   node emails/scripts/sources/timken.mjs --map 2      # one map only
 *   node emails/scripts/sources/timken.mjs --refresh    # bypass the disk cache
 *
 * Two GETs, one per map instance:
 *   https://locations.timken.com/wp-json/wpgmza/v1/markers?filter={"map_id":"2"}
 *   …same for map_id 8
 *
 * Writes, per `01-build-plan.md` §2:
 *   emails/data/raw/timken-<date>.json         every marker from both maps,
 *                                              all countries, untouched
 *   emails/data/normalized/timken-<date>.json  US records, contract-shaped
 *
 * Field mapping (profiled 2026-08-01):
 *   title        → company (via the §3.1 normalizer)
 *   address      → ONE formatted string, "STREET, CITY, ST, ZIP, COUNTRY".
 *                  Parsed RIGHT-anchored: ~1.7% of rows carry a secondary unit
 *                  as an extra 6th part ("323 INDUSTRIAL BLVD, STE A, MCKINNEY,
 *                  TX, 75069, USA"), which left-anchored indexing gets wrong.
 *                  Right-anchored parses 100% of US rows; left-anchored, 98.3%.
 *   description  → HTML carrying a tel: link → phone_e164
 *   link         → website → apex domain
 *   lat, lng     → lat, lng
 *   category     → tier_raw, VERBATIM AND UNINTERPRETED. Adaptall proved a
 *                  source's tier flag can be inverted; nothing downstream may
 *                  read this as quality until it is validated for Timken.
 *
 * brand_authorized is ['Timken'] — that is what this locator proves.
 * disposition stays null: sourcing never culls, S3 does (and never deletes).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchJson } from '../lib/fetch.mjs'
import { validateAll, capturedToday } from '../lib/contract.mjs'
import { mapTimken, parseTimkenAddress, parseTimkenPhone } from '../lib/map.mjs'

// The field mapping lives in lib/map.mjs so S1 and S2 can never drift apart —
// S2 re-derives records from the raw payload on disk using the same function.
export { parseTimkenAddress, parseTimkenPhone }

const SOURCE = 'timken'
// The brand this locator proves is set in lib/map.mjs (mapTimken).
const MAP_IDS = ['2', '8']
const ENDPOINT = 'https://locations.timken.com/wp-json/wpgmza/v1/markers?filter='

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA = resolve(HERE, '..', '..', 'data')

const argv = process.argv.slice(2)
const arg = (flag) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : null
}
const refresh = argv.includes('--refresh')
const onlyMap = arg('--map')
const date = arg('--date') || capturedToday()

const markerUrl = (mapId) => ENDPOINT + encodeURIComponent(JSON.stringify({ map_id: mapId }))

const isUS = (country) => /^(usa|u\.?s\.?a?\.?|united states)$/i.test(String(country ?? '').trim())

// ── run ──────────────────────────────────────────────────────────────────────

async function main() {
  const maps = []

  for (const mapId of MAP_IDS) {
    if (onlyMap && onlyMap !== mapId) continue
    const url = markerUrl(mapId)
    const res = await fetchJson(url, { label: `timken map_id ${mapId}`, refresh })
    const markers = Array.isArray(res.data) ? res.data : (res.data?.markers ?? [])
    maps.push({
      map_id: mapId,
      source_url: res.source_url,
      captured: res.captured,
      captured_at: res.captured_at,
      bytes: res.bytes,
      count: markers.length,
      markers,
    })
    console.log(`map ${mapId}: ${markers.length} markers (${(res.bytes / 1e6).toFixed(1)} MB${res.fromCache ? ', cached' : ''})`)
  }

  // ── raw: everything, all countries, untouched ──────────────────────────────
  mkdirSync(resolve(DATA, 'raw'), { recursive: true })
  const rawPath = resolve(DATA, 'raw', `${SOURCE}-${date}.json`)
  writeFileSync(rawPath, JSON.stringify({ source: SOURCE, captured: date, maps }))
  console.log(`\nraw → ${rawPath}`)

  // ── normalized: US only, contract-shaped ───────────────────────────────────
  const records = []
  const perMap = {}

  for (const m of maps) {
    perMap[m.map_id] = { raw: m.count, us: 0 }
    for (const mk of m.markers) {
      if (isUS(parseTimkenAddress(mk.address).country)) perMap[m.map_id].us++
    }
    // §2b decided STRIP, and the normalizer decision has to be the same in S1
    // and S2 or the two stages disagree about what a company is.
    records.push(...mapTimken({ maps: [m] }, { mapIds: [String(m.map_id)], stripBranch: true }))
  }

  const { valid, invalid } = validateAll(records)
  mkdirSync(resolve(DATA, 'normalized'), { recursive: true })
  const normPath = resolve(DATA, 'normalized', `${SOURCE}-${date}.json`)
  writeFileSync(normPath, JSON.stringify(valid, null, 2))
  console.log(`normalized → ${normPath}`)

  report(maps, perMap, valid, invalid)
}

// ── counts (build-plan §7 risk 1: measure, never restate the estimate) ───────

function report(maps, perMap, valid, invalid) {
  const rawTotal = maps.reduce((n, m) => n + m.count, 0)
  const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
  const names = new Set(valid.map((r) => r.company).filter(Boolean))
  const withDomain = valid.filter((r) => r.domain).length
  const withPhone = valid.filter((r) => r.phone_e164).length

  console.log(`\n── timken counts ──────────────────────────────────────────`)
  for (const m of maps) console.log(`map ${m.map_id}: raw ${m.count}  US ${perMap[m.map_id].us}`)
  console.log(`raw records (all countries, both maps): ${rawTotal}`)
  console.log(`US records:                             ${valid.length}`)
  console.log(`distinct companies (§3.1 normalizer):   ${names.size}`)
  console.log(`website field populated:                ${withDomain}  ${pct(withDomain, valid.length)}`)
  console.log(`phone (10-digit, primary join key):     ${withPhone}  ${pct(withPhone, valid.length)}`)
  if (invalid.length) {
    console.log(`\ncontract violations: ${invalid.length}`)
    for (const bad of invalid.slice(0, 5)) console.log(`  ${bad.record.company ?? '(no company)'}: ${bad.errors.join('; ')}`)
  }

  // The open question the build plan asked: does map 8 duplicate map 2?
  if (maps.length === 2) {
    const [a, b] = maps.map((m) => new Set(valid.filter((r) => r.source_url === m.source_url).map((r) => r.company)))
    const shared = [...b].filter((c) => a.has(c)).length
    console.log(`\nmap 8 vs map 2 — companies: ${a.size} / ${b.size}, shared ${shared}, NET-NEW from map 8: ${b.size - shared}`)
    console.log(`union of both maps: ${new Set([...a, ...b]).size}`)
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
