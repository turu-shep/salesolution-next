/**
 * suppression-bootstrap — seed the suppression list from the one source that
 * already exists in the estate: the old "Transformation" Smartlead campaign
 * (id 2796251, Dec 2025 – Mar 2026, 409 leads, 4,899 sends, 0 replies).
 *
 *   node emails/scripts/suppression-bootstrap.mjs
 *
 * Every lead in that campaign already took twelve touches from us. The pack's
 * definition of the missing suppression data is "any prior-contact, opt-out or
 * existing-customer list" — these 409 are the prior-contact list. Rows the
 * campaign recorded as unsubscribed are flagged `unsubscribed` (never
 * prunable); the rest are `prior-campaign-transformation` (Artur can prune
 * individual rows if he decides a 13th touch from a fresh domain is fine —
 * deleting rows from the CSV is the override).
 *
 * Output: emails/data/suppression/transformation-prior-contact-2026-08-02.csv
 * (email, domain, reason, source, captured). The S7 exporter picks up any
 * *.csv in emails/data/suppression/ and joins at pull time.
 *
 * Read-only against Smartlead: imports exportLeadsCsv and nothing else — no
 * campaign is touched, nothing is started, nothing is written remotely.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { exportLeadsCsv } from '../../scripts/lib/smartlead.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const TODAY = new Date().toISOString().slice(0, 10)
const CAMPAIGN_ID = 2796251
const OUT_DIR = resolve(ROOT, 'emails/data/suppression')
const OUT = join(OUT_DIR, `transformation-prior-contact-${TODAY}.csv`)

const lower = (s) => String(s || '').trim().toLowerCase()
const domainOf = (email) => (lower(email).split('@')[1] || '')

const csvText = await exportLeadsCsv(CAMPAIGN_ID)
const leads = parseCsv(csvText)
if (!leads.length) throw new Error(`campaign ${CAMPAIGN_ID} export returned no leads — refusing to write an empty suppression file`)

// Column names are Smartlead's, not ours — find the unsubscribe flag by shape.
const cols = Object.keys(leads[0])
const emailCol = cols.find((c) => /^email$/i.test(c)) || cols.find((c) => /email/i.test(c))
const unsubCol = cols.find((c) => /unsub/i.test(c))
if (!emailCol) throw new Error(`no email column in export (columns: ${cols.join(', ')})`)

const rows = []
const seen = new Set()
for (const l of leads) {
  const email = lower(l[emailCol])
  if (!email || seen.has(email)) continue
  seen.add(email)
  const unsubbed = unsubCol && /^(true|1|yes)$/i.test(String(l[unsubCol] || '').trim())
  rows.push({
    email,
    domain: domainOf(email),
    reason: unsubbed ? 'unsubscribed' : 'prior-campaign-transformation',
    source: `smartlead:${CAMPAIGN_ID}`,
    captured: TODAY,
  })
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, toCsv(rows, ['email', 'domain', 'reason', 'source', 'captured']))

// Field-for-field readback (§5s rule).
const reread = parseCsv(readFileSync(OUT, 'utf8'))
if (reread.length !== rows.length) throw new Error(`readback: ${reread.length} ≠ ${rows.length}`)
rows.forEach((rec, i) => {
  for (const k of ['email', 'domain', 'reason', 'source', 'captured'])
    if ((reread[i][k] ?? '') !== String(rec[k] ?? '')) throw new Error(`readback diff row ${i} field ${k}`)
})

// Overlap against the current list — reported, nothing modified.
const v5 = parseCsv(readFileSync(resolve(ROOT, 'emails/lists/seated-v9.csv'), 'utf8'))
const supEmails = new Set(rows.map((r) => r.email))
const supDomains = new Set(rows.map((r) => r.domain).filter(Boolean))
const hitEmail = v5.filter((r) => supEmails.has(lower(r.email))).length
const hitDomain = v5.filter((r) => supDomains.has(lower(r.domain))).length

const unsubs = rows.filter((r) => r.reason === 'unsubscribed').length
console.log(`suppression file written: ${rows.length} unique prior-contact addresses (${unsubs} unsubscribed) → ${OUT.replace(ROOT + '/', '')}`)
console.log(`unsubscribe column in export: ${unsubCol || '(none found — all rows tagged prior-campaign-transformation)'}`)
console.log(`overlap with seated-v9: ${hitEmail} by email · ${hitDomain} by domain (joined at pull time by the S7 exporter)`)
console.log('Add more files to emails/data/suppression/ (any CSV with an email and/or domain column): clients, active deals, personal network, dialer DNC.')
