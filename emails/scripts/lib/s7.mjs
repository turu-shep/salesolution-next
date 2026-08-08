/**
 * s7 — routing + merge-field logic for the campaign export (stage S7).
 *
 * Turns list rows into per-campaign micro-batches that mirror how the staged
 * Smartlead drafts will actually send (emails/handoff/campaigns/00–02):
 *
 *   - Cohort E is its own campaign, always — manufacturer-published addresses,
 *     separate bounce accounting, killable in isolation.
 *   - Rows whose email_source starts `voided:` never export (mailing a
 *     manufacturer's own inbox about their dealer's catalog).
 *   - The 11 named-contact rows route to Track 1 (Artur hand-sends; the copy's
 *     {{hello}} exists so the automated path never breaks, not for them).
 *   - Segment C without a per-row category does not send — "industrial supply"
 *     reads as a blast (01-c1 §1). An overlay file supplies categories read
 *     off the prospect's own nav, when that work happens.
 *   - E1-A (declaration variant) requires a HUMAN-approved excerpt; absent
 *     approval a row routes to E1-B. No improvising at send time.
 *   - Micro-batches of ≤50, grouped by campaign × body × segment, with T4
 *     ($2–5M) in its own batches so its silence is never read as a copy result.
 *   - Every lead carries all six custom-field keys, empty string rather than
 *     missing — Smartlead may render a literal `{{hello}}` for an absent key
 *     (emails/data/_smartlead-upload-2026-08-02.md §2).
 *
 * Pure functions; the CLI (emails/scripts/s7-export.mjs) owns file IO.
 */

export const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington DC',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// Segment defaults from 01-c1 §1. Segment C deliberately has NO default.
const CATEGORY_BY_SEGMENT = { A: 'hydraulic hose and fittings', B: 'bearings and power transmission' }

export const BATCH_SIZE = 50

/** The per-row category: A/B fixed phrases, C only from the operator overlay
 * (a category read off the prospect's own nav). null = no safe category. */
export function categoryFor(row, segmentCOverlay = new Map()) {
  if (row.segment === 'C') return segmentCOverlay.get(row.domain) || null
  return CATEGORY_BY_SEGMENT[row.segment] || null
}

/** All six custom fields, always present, empty string when empty. */
export function mergeFields(row, { approved = new Map(), segmentCOverlay = new Map() } = {}) {
  const category = categoryFor(row, segmentCOverlay) || ''
  const state = STATE_NAMES[row.state] || ''
  return {
    hello: row.contact_first_name ? `${row.contact_first_name} — ` : '',
    company_display: row.company_display || '',
    category,
    category_region: category ? (state ? `${category} in ${state}` : category) : '',
    declaration: approved.get(row.domain) || '',
    segment: row.segment || '',
  }
}

/**
 * Route one row. Returns { route, reason?, campaign?, body? }:
 *   route 'batch'  → campaign 'C1' | 'C1-CE', body 'E1-A' | 'E1-B'
 *   route 'track1' → the named-contact hand-send sheet
 *   route 'routed' → excluded, with the reason
 * Order matters: a voided cohort-E row is voided first; a named row with no
 * email still belongs on Track 1 (Artur sends by hand, address optional).
 */
export function routeRow(row, { approved = new Map(), segmentCOverlay = new Map(), verified = new Map() } = {}) {
  if ((row.email_source || '').startsWith('voided:'))
    return { route: 'routed', reason: 'voided-manufacturer-inbox' }
  if (row.contact_first_name) return { route: 'track1' }
  if (!row.email) return { route: 'routed', reason: 'no-email' }
  // S6 (NeverBounce) joins at pull time: once ANY verification results exist,
  // only `valid` addresses may batch — catchall/unknown are unverifiable, not
  // "probably fine", against a 2% bounce kill line. With no results yet the
  // rows flow through (the export is gate-blocked anyway).
  if (verified.size) {
    const state = verified.get(String(row.email).trim().toLowerCase())
    if (!state) return { route: 'routed', reason: 'unverified' }
    if (state !== 'valid') return { route: 'routed', reason: `verify-${state}` }
  }
  if (row.segment === 'C' && !categoryFor(row, segmentCOverlay))
    return { route: 'routed', reason: 'pending-segment-c-category' }
  const campaign = row.cohort === 'E' ? 'C1-CE' : 'C1'
  // Cohort E takes E1-B's shape from E2 onward and carries the fewest claims —
  // its step 1 is the wrong-inbox body, never the declaration variant.
  const body = campaign === 'C1' && approved.get(row.domain) ? 'E1-A' : 'E1-B'
  return { route: 'batch', campaign, body }
}

/**
 * Split routed batch rows into micro-batches ≤ BATCH_SIZE, grouped by
 * campaign × body × segment (+ T4 isolated). Group keys keep the observation
 * slot consistent inside a batch (00-sequence-brief "Send shape").
 */
export function buildBatches(rows, ctx = {}) {
  const groups = new Map()
  for (const row of rows) {
    const r = routeRow(row, ctx)
    if (r.route !== 'batch') continue
    const t4 = row.tier === 'T4' ? 'T4' : 'main'
    const key = `${r.campaign}|${r.body}|seg${row.segment}|${t4}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ row, ...r })
  }

  const batches = []
  for (const [key, members] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    // 1–2 contacts per company is a hard cap; this list carries one row per
    // company post-rollup, so any duplicate join key here is a build defect.
    const companies = new Set(members.map((m) => m.row.company))
    if (companies.size !== members.length)
      throw new Error(`batch group ${key}: duplicate company join keys — the per-company cap would be silently broken`)
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const chunk = members.slice(i, i + BATCH_SIZE)
      batches.push({
        id: `${key.replaceAll('|', '-')}-${String(Math.floor(i / BATCH_SIZE) + 1).padStart(2, '0')}`,
        key,
        campaign: chunk[0].campaign,
        body: chunk[0].body,
        rows: chunk.map((m) => m.row),
      })
    }
  }
  return batches
}

/** One exported lead record: send target + all six custom fields + audit trail. */
export function toLeadRecord(row, batch, ctx = {}) {
  const custom = mergeFields(row, ctx)
  return {
    email: row.email,
    company_name: row.company_display,
    website: row.domain ? `https://${row.domain}` : '',
    ...custom,
    domain: row.domain,
    tier: row.tier || '',
    cohort: row.cohort || '',
    verification: row.verification || '',
    batch: batch.id,
  }
}

/** Conservation: every input row lands in exactly one bucket. */
export function conservation(rows, ctx = {}) {
  const out = { batch: 0, track1: 0, routed: {} }
  for (const row of rows) {
    const r = routeRow(row, ctx)
    if (r.route === 'batch') out.batch++
    else if (r.route === 'track1') out.track1++
    else out.routed[r.reason] = (out.routed[r.reason] || 0) + 1
  }
  out.routedTotal = Object.values(out.routed).reduce((a, b) => a + b, 0)
  out.total = out.batch + out.track1 + out.routedTotal
  if (out.total !== rows.length)
    throw new Error(`conservation FAIL: ${rows.length} in ≠ ${out.total} out`)
  return out
}
