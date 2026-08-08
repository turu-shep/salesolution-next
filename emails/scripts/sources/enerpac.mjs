#!/usr/bin/env node
/**
 * S1 source #2 — Enerpac distributor locator (Oracle Commerce OSF getFile).
 *
 *   node emails/scripts/sources/enerpac.mjs
 *   node emails/scripts/sources/enerpac.mjs --refresh
 *
 * One GET, public and unauthenticated:
 *   https://www.enerpac.com/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json
 *
 * ⚠ SECURITY BOUNDARY — read `00-sourcing-strategy.md` §7.1 before touching this.
 * Enerpac's *page source* leaks Oracle Integration Cloud service credentials.
 * They are never read, used, recorded or transmitted, and nothing in this file
 * or its cache touches them. Using leaked credentials is unauthorized access to
 * a system — categorically different from fetching a public file, and outside
 * the robots.txt override entirely. This script hits the public endpoint above
 * and nothing else.
 *
 * (Also per §7.1: the "Enerpac is robots-blocked" note in earlier research was a
 * misread. robots.txt disallows /ccstoreX/custom/v1; this path was never
 * disallowed.)
 *
 * Writes, per `01-build-plan.md` §2:
 *   emails/data/raw/enerpac-<date>.json         all 1,475 records, all countries
 *   emails/data/normalized/enerpac-<date>.json  US records, contract-shaped
 *
 * Field mapping (profiled 2026-08-01 — structured fields, no address parsing):
 *   Name             → company (via the §3.1 normalizer)
 *   Street/City/     → address_1 / city / state / zip5
 *   State-Province/
 *   Postal Code
 *   Phone            → phone_e164        URL → domain      Latitude/Longitude → lat/lng
 *   Tier             → tier_raw, VERBATIM AND UNINTERPRETED. Enerpac's 4-level
 *                      tier is NOT validated as a quality signal; Adaptall's was
 *                      inverted (73% of its "premier" tier were chains).
 *
 * NOT carried into the record, because §1's contract has no field for them —
 * all preserved losslessly in the raw payload:
 *   "Products Carried"  the per-record line card (5 Enerpac product families).
 *                       brand_authorized gets ['Enerpac'], the brand this source
 *                       actually proves. Folding families in as pseudo-brands
 *                       would inflate line-card breadth, which S3 reads as a
 *                       size proxy — a real measurement corruption.
 *   "Distributor Type"  Sales / Service / Rental / Regional Distributor
 *   "E-Mail"            populated on 64% of US records (see §7.2 / GATE-L6)
 *   Fax, Status, Authorized Service Center, Bolting Service Van
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchJson } from '../lib/fetch.mjs'
import { validateAll, capturedToday } from '../lib/contract.mjs'
import { mapEnerpac } from '../lib/map.mjs'
import { displayName } from '../lib/normalize.mjs'

const SOURCE = 'enerpac'
// The brand this locator proves is set in lib/map.mjs (mapEnerpac).
const ENDPOINT =
  'https://www.enerpac.com/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json'

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA = resolve(HERE, '..', '..', 'data')

const argv = process.argv.slice(2)
const arg = (flag) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : null
}
const refresh = argv.includes('--refresh')
const date = arg('--date') || capturedToday()

const isUS = (country) => /^(usa|u\.?s\.?a?\.?|united states)$/i.test(String(country ?? '').trim())

/**
 * Enerpac prefixes annotations onto the name field, e.g.
 * "** Temporarily Suspended ** Distributor: Nord-West Tool". They are status
 * markers, not part of the company name, and they wreck the join key. Now
 * handled by the shared `displayName()` — kept as a named export because that is
 * the behaviour this source documented.
 */
export const stripNameAnnotations = (name) => displayName(name) ?? ''

async function main() {
  const res = await fetchJson(ENDPOINT, { label: 'enerpac distributorLocator', refresh })
  const all = Array.isArray(res.data) ? res.data : []
  console.log(`fetched ${all.length} records (${(res.bytes / 1e6).toFixed(2)} MB${res.fromCache ? ', cached' : ''})`)

  // ── raw: everything, all countries, untouched ──────────────────────────────
  mkdirSync(resolve(DATA, 'raw'), { recursive: true })
  const rawPath = resolve(DATA, 'raw', `${SOURCE}-${date}.json`)
  writeFileSync(
    rawPath,
    JSON.stringify({
      source: SOURCE,
      source_url: res.source_url,
      captured: res.captured,
      captured_at: res.captured_at,
      count: all.length,
      records: all,
    }),
  )
  console.log(`raw → ${rawPath}`)

  // ── normalized: US only, contract-shaped ───────────────────────────────────
  const us = all.filter((r) => isUS(r.Country))
  // §2b decided STRIP, and the normalizer decision has to be the same in S1 and
  // S2 or the two stages disagree about what a company is.
  const records = mapEnerpac(
    { records: all, source_url: res.source_url, captured: res.captured },
    { stripBranch: true },
  )

  const { valid, invalid } = validateAll(records)
  mkdirSync(resolve(DATA, 'normalized'), { recursive: true })
  const normPath = resolve(DATA, 'normalized', `${SOURCE}-${date}.json`)
  writeFileSync(normPath, JSON.stringify(valid, null, 2))
  console.log(`normalized → ${normPath}`)

  report(all, us, valid, invalid)
}

// ── counts (build-plan §7 risk 1: measure, never restate the estimate) ───────

function report(all, us, valid, invalid) {
  const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
  const names = new Set(valid.map((r) => r.company).filter(Boolean))
  const withDomain = valid.filter((r) => r.domain).length
  const withPhone = valid.filter((r) => r.phone_e164).length
  const rawUrl = us.filter((r) => r.URL && String(r.URL).trim()).length
  const rawPhone = us.filter((r) => r.Phone && String(r.Phone).trim()).length

  const tiers = {}
  for (const r of valid) tiers[r.tier_raw ?? 'null'] = (tiers[r.tier_raw ?? 'null'] ?? 0) + 1
  const locs = {}
  for (const r of valid) if (r.company) locs[r.company] = (locs[r.company] ?? 0) + 1

  console.log(`\n── enerpac counts ─────────────────────────────────────────`)
  console.log(`raw records (all countries):            ${all.length}`)
  console.log(`US records:                             ${valid.length}`)
  console.log(`distinct companies (§3.1 normalizer):   ${names.size}`)
  console.log(`website field populated:                ${rawUrl}  ${pct(rawUrl, us.length)}   → apex domain: ${withDomain}`)
  console.log(`phone field populated:                  ${rawPhone}  ${pct(rawPhone, us.length)}`)
  console.log(`phone (10-digit, primary join key):     ${withPhone}  ${pct(withPhone, valid.length)}`)
  console.log(`tier_raw distribution (UNMAPPED):       ${JSON.stringify(tiers)}`)
  console.log(`single-location companies:              ${Object.values(locs).filter((n) => n === 1).length}`)
  console.log(
    `largest by location count:              ${Object.entries(locs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n, c]) => `${n} (${c})`)
      .join(', ')}`,
  )
  if (invalid.length) {
    console.log(`\ncontract violations: ${invalid.length}`)
    for (const bad of invalid.slice(0, 5)) console.log(`  ${bad.record.company ?? '(no company)'}: ${bad.errors.join('; ')}`)
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
