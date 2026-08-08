/**
 * s4m-firstsend-backfill — route the 9 roll-up-owned rows out of the
 * first-send cohort and backfill 9 individually-verified replacements
 * (rollup-rosters workstream, deep pass 2026-08-04; §5t precedent).
 *
 * §5t set the shape: routed rows move to first-send-200-routed.csv with the
 * reason in verification/verification_note; replacements come from the ranked
 * pool and every one is read individually before it enters. This pass:
 *
 *   OUT (9) — the roll-up-owned rows suppressed on 2026-08-03, now removed so
 *   the cohort is 200 clean rows again (suppression stays as the backstop):
 *   priceeng, thehopegroup, westernintech, amazonhose, kencohydraulics,
 *   raylewisco, spartanindustrial, rwconnection, texasrubbersupply.
 *
 *   IN (9) — the next-ranked seated-v8 candidates (all rank_score 74, the top
 *   score outside the cohort after the previously-routed autopartintl.com),
 *   taken in seated file order, each verified by an individual homepage read
 *   on 2026-08-04 (distributor / US / no parent badge). Candidates skipped,
 *   with reasons, in the audit JSON: dentechindustrial + mathmec
 *   (fabricator-integrators), illinoiselectric (repair-primary),
 *   mccartyequipment (SunSource footer — retagged by S4l), motorsandcontrol
 *   (HTTP 403, unverifiable).
 *
 * The cohort file's row order is the FROZEN original ranking (positions
 * #1–#200 as read in the §5t census); backfills append at the tail like
 * §5t's #201–#205 did. The routed file is rewritten under the cohort's 56-col
 * header (its 5 §5t rows predate the Adaptall contact columns; values
 * preserved verbatim, new columns empty).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { chainDomainMatch } from './lib/dedupe.mjs'
import { apexDomain } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const TODAY = new Date().toISOString().slice(0, 10)
const APPLY = process.argv.includes('--apply')

const COHORT = 'lists/first-send-200.csv'
const ROUTED = 'lists/first-send-200-routed.csv'
// seated-v9: the post-race generation (AD fold-in + McCarty re-retag). The
// concurrent ad_member re-rank (+6) landed MID-SELECTION, so the nine now sit
// at 74–80 rather than a flat 74; the verification reads are unaffected. The
// fold-in's 39 unenriched crossers (no email, never individually read) are
// deliberately NOT considered — a cohort backfill wants verified rows; the
// next full cohort refresh can re-litigate against the new ranks.
const SEATED = 'lists/seated-v9.csv'

/** Verified replacements, in seated-v8 (frozen-rank) order. Notes are the
 * one-line individual reads (2026-08-04). */
const BACKFILL = [
  ['binkelman.com', "Binkelman Corp, Bowling Green OH. 'Industrial Products Distributor & Services' — bearings/conveyor/hydraulics/hose; AD member (footer). Verified 2026-08-04."],
  ['bkindsolutions.com', "BK Industrial Solutions, TX/LA. 'We specialize in the distribution of mechanical power transmission products'; AD + IDC-USA member; Baldor/Falk/Dodge/Rexnord lines. Verified 2026-08-04."],
  ['cbtcompany.com', "CBT Company, Cincinnati. 'more than an industrial distributor' — Rockwell/ABB/Dodge/SEW lines plus services; no parent badge. Verified 2026-08-04."],
  ['dupuyoxygen.com', "DuPuy Oxygen, Waco TX, 8 locations. 'The only locally owned welding supply distributors in Central and North-Central Texas'; Lincoln/Miller/ESAB lines; owns gas fill plants (service, not manufacture). Verified 2026-08-04."],
  ['emersonbearing.com', "Emerson Bearing, Boston. Bearings distributor ('Find the Right Bearing'), FAG/INA/NACHI/NTN/NSK lines; Action Bearing is its own NE sub-brand; no parent badge. Verified 2026-08-04."],
  ['lettsvankirk.com', "Letts Van Kirk & Associates, Kansas City KS. Municipal pump/wastewater distributor (Wilo, Vaughan, Flowserve); sister co Mid America Pump; no parent badge. Verified 2026-08-04."],
  ['mechanicalpower.net', "Mechanical Power Inc, Wauconda IL. 'Industrial parts distributor, sourcing top quality industrial components'; global sourcing, no own manufacture; no parent badge. Verified 2026-08-04."],
  ['meritpump.com', "Merit Pump & Equipment, Wooster OH. 'Authorized repair center and distributor' for Kobe/Myers/Aurora/Berkeley pumps; no parent badge. Verified 2026-08-04."],
  ['metpipe.com', "Metropolitan Pipe & Supply, Cambridge MA, since 1932. 'New England's Leading Wholesale Distributor', 36,000 stocked products, 50+ brands; no parent badge. Verified 2026-08-04."],
]

const SKIPPED = [
  { domain: 'autopartintl.com', reason: 'previously routed in §5t (four companies in one row; dead domain)' },
  { domain: 'dentechindustrial.com', reason: 'manufacturer-that-also-distributes — system integrator with in-house fabrication' },
  { domain: 'illinoiselectric.com', reason: 'repair/rebuild-primary; distribution secondary' },
  { domain: 'mathmec.com', reason: 'manufacturer-that-also-distributes — fabrication/maintenance shop' },
  { domain: 'mccartyequipment.com', reason: 'ROLLUP: SunSource footer + GHX family (Boxwood 2019-02) — retagged chain by S4l' },
  { domain: 'motorsandcontrol.com', reason: 'HTTP 403 on verification read — unverifiable, not entered' },
]

const readWithHeader = (rel) => {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  return { rows: parseCsv(text), header: text.slice(0, text.indexOf('\n')).replace(/\r$/, '').split(',') }
}

const cohort = readWithHeader(COHORT)
const routed = readWithHeader(ROUTED)
const seated = readWithHeader(SEATED)

for (const c of routed.header) if (!cohort.header.includes(c)) throw new Error(`routed column ${c} missing from cohort header`)
for (const c of seated.header) if (!cohort.header.includes(c)) throw new Error(`seated column ${c} missing from cohort header`)

// OUT: every cohort row whose apex is on the chain blocklist (the 9 roll-ups).
const stay = []
const out = []
for (const row of cohort.rows) {
  const apex = apexDomain(row.domain || '')
  const hit = apex ? chainDomainMatch(apex) : null
  if (hit) out.push({ row, apex, hit })
  else stay.push(row)
}
if (out.length !== 9) throw new Error(`expected exactly 9 roll-up rows to leave the cohort, found ${out.length}`)

// IN: the verified replacements, pulled from seated-v8 and projected onto the
// cohort header (verification columns filled from the reads above).
const byDomain = new Map(seated.rows.map((r) => [r.domain, r]))
const added = []
for (const [domain, note] of BACKFILL) {
  const src = byDomain.get(domain)
  if (!src) throw new Error(`backfill ${domain}: not found in ${SEATED}`)
  if (chainDomainMatch(apexDomain(domain))) throw new Error(`backfill ${domain}: on the chain blocklist`)
  // Selected at 74 (the top score outside the cohort pre-fold-in); the
  // concurrent ad_member re-rank lifted AD members to 80. Floor = the cohort's
  // own observed minimum (65), so no backfill ranks below any sitting member.
  if (Number(src.rank_score) < 65) throw new Error(`backfill ${domain}: rank_score ${src.rank_score} < 65 — below the cohort floor`)
  const rec = {}
  for (const c of cohort.header) rec[c] = src[c] ?? ''
  rec.verification = 'distributor'
  rec.verification_note = note
  added.push(rec)
}
const newCohort = [...stay, ...added]
if (newCohort.length !== 200) throw new Error(`cohort must stay 200 rows, got ${newCohort.length}`)
const domains = new Set(newCohort.map((r) => r.domain))
if (domains.size !== 200) throw new Error('duplicate domains in the rebuilt cohort')

// Routed file: §5t's 5 rows (padded to the 56-col header) + the 9 movers.
const PARENTS = { 'priceeng.com': 'SunSource', 'thehopegroup.com': 'SunSource', 'westernintech.com': 'SunSource', 'amazonhose.com': 'SunSource', 'kencohydraulics.com': 'Singer Industrial', 'raylewisco.com': 'Singer Industrial', 'spartanindustrial.com': 'Singer Industrial', 'rwconnection.com': 'Singer Industrial', 'texasrubbersupply.com': 'Singer Industrial' }
const routedOut = [
  ...routed.rows.map((r) => {
    const rec = {}
    for (const c of cohort.header) rec[c] = r[c] ?? ''
    return rec
  }),
  ...out.map(({ row, apex }) => ({
    ...row,
    verification: 'rollup-owned',
    verification_note: `PE roll-up subsidiary — ${PARENTS[apex] || 'chain'}; suppressed 2026-08-03 (data/suppression/rollup-owned-2026-08-03.csv, per-domain evidence), retagged chain in the seated series (S4j), removed from cohort ${TODAY} with backfill (§5t precedent).`,
  })),
]

const audit = {
  date: TODAY, applied: APPLY,
  out: out.map(({ row, apex, hit }) => ({ domain: apex, company: row.company, matched: hit })),
  in: added.map((r) => ({ domain: r.domain, company: r.company, rank_score: r.rank_score, tier: r.tier, segment: r.segment, cohort: r.cohort || '' })),
  skipped: SKIPPED,
  counts: { cohort_in: cohort.rows.length, cohort_out: newCohort.length, routed_in: routed.rows.length, routed_out: routedOut.length },
}
console.log(`cohort: ${cohort.rows.length} in → ${stay.length} stay + ${out.length} routed + ${added.length} backfilled = ${newCohort.length}`)
console.log(`routed file: ${routed.rows.length} → ${routedOut.length}`)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply.')
  for (const o of audit.out) console.log(`  OUT ${o.domain} (${o.company})`)
  for (const i of audit.in) console.log(`  IN  ${i.domain} (${i.company}) score=${i.rank_score} ${i.tier} seg${i.segment}${i.cohort ? ' cohortE' : ''}`)
  process.exit(0)
}

const diffRow = (a, b, cols) => cols.filter((c) => String(a[c] ?? '') !== String(b[c] ?? ''))
writeFileSync(join(EMAILS, COHORT), toCsv(newCohort, cohort.header))
const rereadCohort = parseCsv(readFileSync(join(EMAILS, COHORT), 'utf8'))
if (rereadCohort.length !== 200) throw new Error('readback: cohort ≠ 200')
newCohort.forEach((row, i) => {
  const bad = diffRow(row, rereadCohort[i], cohort.header)
  if (bad.length) throw new Error(`readback cohort row ${i}: ${bad.join(',')}`)
})
if (rereadCohort.some((r) => chainDomainMatch(apexDomain(r.domain || '')))) throw new Error('post-condition FAIL: chain-domain row in cohort')

writeFileSync(join(EMAILS, ROUTED), toCsv(routedOut, cohort.header))
const rereadRouted = parseCsv(readFileSync(join(EMAILS, ROUTED), 'utf8'))
if (rereadRouted.length !== routedOut.length) throw new Error('readback: routed count mismatch')
routedOut.forEach((row, i) => {
  const bad = diffRow(row, rereadRouted[i], cohort.header)
  if (bad.length) throw new Error(`readback routed row ${i}: ${bad.join(',')}`)
})
console.log('readback: cohort 200×56 and routed 14×56 — 0 diffs · post-condition: zero chain-domain rows in the cohort')
writeFileSync(join(EMAILS, `data/_firstsend-backfill-${TODAY}.json`), JSON.stringify(audit, null, 2))
console.log(`audit → emails/data/_firstsend-backfill-${TODAY}.json`)
