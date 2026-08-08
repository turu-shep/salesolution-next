/**
 * s7-export — build the per-campaign micro-batch export PREVIEW (stage S7).
 *
 *   node emails/scripts/s7-export.mjs                 # pilot: first-send-200.csv
 *   node emails/scripts/s7-export.mjs --list full     # seated-v9.csv
 *
 * Writes emails/exports/<list>-preview-<date>/:
 *   batches/<batch-id>.csv   micro-batches ≤50, campaign × body × segment, T4 isolated
 *   routed.csv               every excluded row, with its reason (nothing deleted)
 *   _MANIFEST.md             conservation, batch table, unmet send gates
 *   _DO-NOT-UPLOAD.md        sentinel — present until every send gate clears
 * and emails/data/track1-handsend-<date>.md (the named-contact hand-send sheet).
 *
 * THIS PRODUCES FILES, NOT LEADS. Nothing here talks to Smartlead — the
 * sequence brief's hard rule is leads only after Truelist verification (S6)
 * and a suppression list. The preview exists so the routing, merge fields and
 * batch shapes are reviewable (and reviewed) long before anything can send.
 *
 * Overlays, read when present:
 *   emails/data/declaration-approved.csv   domain, approved_excerpt,
 *     reviewer_initials, approved_date — only rows with BOTH excerpt and
 *     initials count. Absent approval a row routes to body E1-B. This file is
 *     produced by a human pass over declaration-review-<date>.csv; no script
 *     writes it.
 *   emails/data/segment-c-categories.csv   domain, category — a category read
 *     off the prospect's own nav. Without one a Segment C row does not send.
 *   emails/data/suppression/*.csv          any file with an email/domain
 *     column. Until at least one exists, the export is stamped BLOCKED.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { buildBatches, conservation, routeRow, toLeadRecord } from './lib/s7.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA = resolve(ROOT, 'emails/data')
const TODAY = new Date().toISOString().slice(0, 10)

const LISTS = {
  pilot: resolve(ROOT, 'emails/lists/first-send-200.csv'),
  full: resolve(ROOT, 'emails/lists/seated-v9.csv'),
}

const args = process.argv.slice(2)
const listKey = args.includes('--list') ? args[args.indexOf('--list') + 1] : 'pilot'
if (!LISTS[listKey]) {
  console.error(`unknown --list ${listKey}; use pilot | full`)
  process.exit(1)
}

const readCsvIf = (p) => (existsSync(p) ? parseCsv(readFileSync(p, 'utf8')) : null)

// ── overlays ─────────────────────────────────────────────────────────────────
const approvedRows = readCsvIf(join(DATA, 'declaration-approved.csv')) || []
const approved = new Map(
  approvedRows
    .filter((r) => r.domain && (r.approved_excerpt || '').trim() && (r.reviewer_initials || '').trim())
    .map((r) => [r.domain, r.approved_excerpt.trim()]),
)
const overlayRows = readCsvIf(join(DATA, 'segment-c-categories.csv')) || []
const segmentCOverlay = new Map(overlayRows.filter((r) => r.domain && (r.category || '').trim()).map((r) => [r.domain, r.category.trim()]))

// S6 — NeverBounce results (emails/scripts/s6-verify.mjs). Once any exist,
// only `valid` addresses batch; everything else routes out with the reason.
const verifyRows = readCsvIf(join(DATA, 'verify-results.csv')) || []
const verified = new Map(verifyRows.filter((r) => r.email).map((r) => [r.email.trim().toLowerCase(), r.result]))

const suppressionDir = join(DATA, 'suppression')
const suppressionFiles = existsSync(suppressionDir) ? readdirSync(suppressionDir).filter((f) => f.endsWith('.csv')) : []
const suppressed = { emails: new Set(), domains: new Set() }
for (const f of suppressionFiles) {
  for (const r of parseCsv(readFileSync(join(suppressionDir, f), 'utf8'))) {
    const email = (r.email || r.Email || '').toLowerCase().trim()
    const domain = (r.domain || r.Domain || '').toLowerCase().trim()
    if (email) suppressed.emails.add(email)
    if (domain) suppressed.domains.add(domain)
  }
}

// ── load + route ─────────────────────────────────────────────────────────────
const ctx = { approved, segmentCOverlay, verified }
const rows = parseCsv(readFileSync(LISTS[listKey], 'utf8'))

// Suppression joins at pull time, not send time (build plan §4.6). With no
// list on disk this suppresses nothing — and the export stays BLOCKED.
const isSuppressed = (r) =>
  suppressed.emails.has((r.email || '').toLowerCase()) || suppressed.domains.has((r.domain || '').toLowerCase())
const [suppressedRows, active] = rows.reduce(
  (acc, r) => (isSuppressed(r) ? (acc[0].push(r), acc) : (acc[1].push(r), acc)),
  [[], []],
)

const cons = conservation(active, ctx)
if (cons.total + suppressedRows.length !== rows.length)
  throw new Error(`conservation FAIL: ${rows.length} in ≠ ${cons.total} active + ${suppressedRows.length} suppressed`)
const batches = buildBatches(active, ctx)
const track1 = active.filter((r) => routeRow(r, ctx).route === 'track1')
// Suppressed rows are excluded rows too — routed.csv's contract is "every
// excluded row, with its reason", so they land here, never only in a count.
const routedRows = [
  ...suppressedRows.map((r) => ({ reason: 'suppressed', domain: r.domain, company_display: r.company_display, email: r.email, segment: r.segment, tier: r.tier, cohort: r.cohort })),
  ...active
    .map((r) => ({ r, v: routeRow(r, ctx) }))
    .filter(({ v }) => v.route === 'routed')
    .map(({ r, v }) => ({ reason: v.reason, domain: r.domain, company_display: r.company_display, email: r.email, segment: r.segment, tier: r.tier, cohort: r.cohort })),
]

// ── write ────────────────────────────────────────────────────────────────────
const OUT = resolve(ROOT, `emails/exports/${listKey}-preview-${TODAY}`)
mkdirSync(join(OUT, 'batches'), { recursive: true })

const written = []
for (const b of batches) {
  const records = b.rows.map((r) => toLeadRecord(r, b, ctx))
  const file = join(OUT, 'batches', `${b.id}.csv`)
  const header = Object.keys(records[0])
  writeFileSync(file, toCsv(records, header))
  // Field-for-field readback (§5s rule): structural checks can't catch cell
  // corruption; reparse and diff every cell against intent.
  const reread = parseCsv(readFileSync(file, 'utf8'))
  if (reread.length !== records.length) throw new Error(`readback ${b.id}: row count ${reread.length} ≠ ${records.length}`)
  records.forEach((rec, i) => {
    for (const k of header)
      if ((reread[i][k] ?? '') !== String(rec[k] ?? ''))
        throw new Error(`readback ${b.id} row ${i} field ${k}: ${JSON.stringify(reread[i][k])} ≠ ${JSON.stringify(rec[k])}`)
  })
  written.push({ id: b.id, campaign: b.campaign, body: b.body, rows: b.rows.length, file })
}

writeFileSync(join(OUT, 'routed.csv'), toCsv(routedRows, ['reason', 'domain', 'company_display', 'email', 'segment', 'tier', 'cohort']))

// ── Track 1 hand-send sheet ──────────────────────────────────────────────────
const t1Path = join(DATA, `track1-handsend-${TODAY}.md`)
const t1 = [
  `# Track 1 — hand-send sheet (${TODAY}, from ${listKey === 'pilot' ? 'first-send-200' : 'seated-v9'})`,
  '',
  'The named rows are excluded from every automated batch on purpose — Artur',
  'types the name and the observation himself (01-c1 §1; approach per',
  '`docs/strategy/industrial-email-campaign/03-angles-and-copy.md` §7).',
  'Declarations below are RAW and UNREVIEWED — quote nothing without the',
  'declaration review pass.',
  '',
]
for (const r of track1) {
  t1.push(`## ${r.contact_first_name} ${r.contact_last_name || ''} — ${r.company_display}`.trim())
  t1.push('')
  t1.push(`- title: ${r.contact_title || '(unknown)'} · segment ${r.segment} · tier ${r.tier} · ${r.city || '?'}, ${r.state || '?'}`)
  t1.push(`- domain: ${r.domain} · company email: ${r.email || '(none)'} · contact email: ${r.contact_email || '(none)'} (${r.contact_email_status || 'unverified'})`)
  if (r.contact_linkedin) t1.push(`- linkedin: ${r.contact_linkedin}`)
  if (r.verification_note) t1.push(`- verifier's note: ${r.verification_note}`)
  if (r.self_declaration) t1.push(`- declaration (raw, unreviewed): ${JSON.stringify(r.self_declaration.slice(0, 220))}`)
  t1.push('')
}
writeFileSync(t1Path, t1.join('\n'))

// ── gates + manifest ─────────────────────────────────────────────────────────
const gates = [
  { ok: suppressionFiles.length > 0, label: `suppression / DNC list present (emails/data/suppression/) — found ${suppressionFiles.length} file(s)` },
  { ok: verified.size > 0, label: `NeverBounce verification (S6) — ${verified.size} results joined; only \`valid\` batches (run emails/scripts/s6-verify.mjs to extend)` },
  { ok: false, label: 'sender warmup complete (never run; four weeks from zero) + domain retirement decision' },
  { ok: false, label: 'G6 pre-flight (PF-2/3/4/8) for the C1-E2 link + footer address; unsubscribe-link wiring' },
  { ok: approved.size > 0, label: `declaration approvals present — ${approved.size} approved (absent → every row sends E1-B)` },
]
const blocked = gates.some((g) => !g.ok)

const manifest = [
  `# S7 export preview — ${listKey} — ${TODAY}`,
  '',
  `Input: \`${LISTS[listKey].replace(ROOT + '/', '')}\` — ${rows.length} rows (${suppressedRows.length} suppressed at pull time).`,
  '',
  `**Conservation (PASS): ${rows.length} = ${cons.batch} batch + ${cons.track1} track1 + ${cons.routedTotal} routed + ${suppressedRows.length} suppressed.**`,
  '',
  '## Batches',
  '',
  '| batch | campaign | body | rows |',
  '|---|---|---|---|',
  ...written.map((w) => `| ${w.id} | ${w.campaign} | ${w.body} | ${w.rows} |`),
  '',
  '## Routed out (routed.csv)',
  '',
  ...(suppressedRows.length
    ? [`- suppressed: ${suppressedRows.length} (${suppressedRows.map((r) => r.domain || r.email).join(', ')})`]
    : []),
  ...Object.entries(cons.routed).map(([k, v]) => `- ${k}: ${v}`),
  '',
  '## Send gates',
  '',
  ...gates.map((g) => `- [${g.ok ? 'x' : ' '}] ${g.label}`),
  '',
  '## Upload mapping (for S6→upload later — NOT done by this script)',
  '',
  'Per lead at `addLeads` time: `email`, `company_name`, `website` are',
  'top-level; `hello`, `company_display`, `category`, `category_region`,',
  '`declaration`, `segment` go INSIDE `custom_fields` (top-level extras are',
  'stripped by the API). Every lead carries all six keys, empty string rather',
  'than missing. Batch → its own cloned campaign: E1-A batches get only the A',
  'variants, E1-B only B, Cohort-E only CE (variants are random A/B splitters,',
  'never routers). Campaigns 3751334/3751335 are the copy masters, not send',
  'campaigns.',
  '',
]
writeFileSync(join(OUT, '_MANIFEST.md'), manifest.join('\n'))

if (blocked) {
  writeFileSync(
    join(OUT, '_DO-NOT-UPLOAD.md'),
    `# DO NOT UPLOAD\n\nThis preview was produced ${TODAY} with unmet send gates:\n\n${gates
      .filter((g) => !g.ok)
      .map((g) => `- ${g.label}`)
      .join('\n')}\n\nDelete this file only by re-running the export with every gate green.\n`,
  )
}

console.log(`input ${rows.length} rows → batches ${cons.batch} (${written.length} files) · track1 ${cons.track1} · routed ${cons.routedTotal} · suppressed ${suppressedRows.length}`)
for (const [k, v] of Object.entries(cons.routed)) console.log(`  routed ${k}: ${v}`)
for (const w of written) console.log(`  ${w.id}: ${w.rows}`)
console.log(`gates: ${gates.filter((g) => g.ok).length}/${gates.length} green${blocked ? ' — export stamped DO-NOT-UPLOAD' : ''}`)
console.log(`out: ${OUT.replace(ROOT + '/', '')}`)
console.log(`track1 sheet: ${t1Path.replace(ROOT + '/', '')}`)
