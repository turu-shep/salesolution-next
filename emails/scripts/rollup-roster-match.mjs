/**
 * rollup-roster-match — match the three roll-up rosters against every list and
 * pool (rollup-rosters workstream, step 3).
 *
 * Reads the step-2 artifacts:
 *   data/raw/rollup-rosters/rosters-<date>.json            Singer + MCE, first-hand
 *   data/raw/rollup-rosters/sunsource-roster-*.json        SunSource, second-hand, provenance-tagged
 *
 * Matches BOTH keys, separately, and reports them separately (the prompt's
 * rule): domain matching is exact on apex and trustworthy; name matching rides
 * the pipeline's own normalizeCompany() and is expected to produce false
 * positives — where the two disagree, the domain wins and the name match goes
 * to the adjudication pile. Nothing here retags anything; output is a report.
 *
 * Writes data/raw/rollup-rosters/match-<date>.json.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv } from '../../scripts/lib/csv.mjs'
import { normalizeCompany, apexDomain } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const RAW = join(EMAILS, 'data', 'raw', 'rollup-rosters')
const TODAY = new Date().toISOString().slice(0, 10)

// ── load step-2 artifacts (newest of each) ───────────────────────────────────
const newest = (prefix) =>
  readdirSync(RAW)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .sort()
    .at(-1)
const rosters = JSON.parse(readFileSync(join(RAW, newest('rosters-')), 'utf8'))
const sunsource = JSON.parse(readFileSync(join(RAW, newest('sunsource-roster-')), 'utf8'))

// ── build the roster entry list ──────────────────────────────────────────────
/** @type {{parent:string, company:string, domain:string|null, announced:string|null, evidence_url:string, tier:string, generic?:boolean, negative?:boolean}[]} */
const roster = []

// Singer: the /brands table is first-hand. Parent + every brand row.
roster.push({ parent: 'Singer Industrial', company: 'Singer Industrial', domain: 'singerindustrial.com', announced: null, evidence_url: 'https://singerindustrial.com/brands', tier: 'parent' })
for (const b of rosters.singer.brands) {
  if (!b.name || b.name === 'Company') continue // header artifact
  roster.push({ parent: 'Singer Industrial', company: b.name, domain: b.domain, announced: null, evidence_url: rosters.singer.source_url, tier: 'first-hand:/brands' })
  if (b.alt_name && normalizeCompany(b.alt_name) !== normalizeCompany(b.name))
    roster.push({ parent: 'Singer Industrial', company: b.alt_name, domain: b.domain, announced: null, evidence_url: rosters.singer.source_url, tier: 'first-hand:/brands(alt)' })
}

// Singer: acquisition-shaped press releases carry names /brands may not.
const SINGER_ACQ = [
  /joins? forces with (.+)$/i,
  /is joining forces with (.+)$/i,
  /teams up with (.+)$/i,
  /partners with (.+)$/i,
  /acquisition of (.+)$/i,
  /acquires (.+)$/i,
]
for (const r of rosters.singer.releases) {
  let name = null
  for (const re of SINGER_ACQ) {
    const m = r.title.match(re)
    if (m) {
      name = m[1].replace(/,? marking .*$/i, '').trim()
      break
    }
  }
  if (!name) continue
  roster.push({ parent: 'Singer Industrial', company: name, domain: null, announced: r.published, evidence_url: r.url, tier: 'first-hand:release' })
}

// MCE: parent + the companies page (names via a hand map — the page's text
// field is a descriptive sentence, not the company name) + dated news.
roster.push({ parent: 'Motion & Control Enterprises', company: 'Motion & Control Enterprises', domain: 'mceautomation.com', announced: null, evidence_url: 'https://mceautomation.com/about/mce-companies', tier: 'parent' })
const MCE_DOMAIN_NAMES = {
  'lonestarmachineworks.com': 'Lone Star Machine Works',
  'novahydraulics.com': 'Nova Hydraulics',
  'questenginc.com': 'Quest Engineering',
  'dascosales.com': 'Daughtridge Sales',
  'ivesequipment.com': 'Ives Equipment',
  'netechsales.com': 'North East Technical Sales',
  'romanoffindustries.com': 'Romanoff Industries',
  'generalmachinery.com': 'General Machinery',
  'airautomation.com': 'Air Automation Engineering',
  'aic-controls.com': 'Applied Industrial Controls',
  'esgcontrols.com': 'Engineered Systems Group',
  'global-controls.us': 'Global Controls',
  'industrialcontrol.com': 'Industrial Control',
  'rsainfo.com': 'RSA',
  'ultimationinc.com': 'Ultimation Industries',
  'filterresources.com': 'Filter Resources',
  'piedmontelectricmotor.com': 'Piedmont Electric Motor Repair',
  'tlr-hydraulics.com': 'TLR Hydraulics',
  'ritter1.com': 'Ritter Technology',
}
for (const e of rosters.mce.companies.entries) {
  const d = e.domain === 'store.ritter1.com' ? 'ritter1.com' : e.domain
  if (d === 'paycom.com') continue // employee portal, not a company
  const name = MCE_DOMAIN_NAMES[d]
  roster.push({ parent: 'Motion & Control Enterprises', company: name || d, domain: d, announced: null, evidence_url: rosters.mce.companies.source_url, tier: 'first-hand:companies-page', generic: !name })
}
// News names: "Acquisition Announcement: X Zelienople, PA - date —MCE…"
for (const n of rosters.mce.news.items) {
  const m = n.headline.match(/^Acquisition Announcement:\s*(.+)$/i)
  if (!m) continue
  let text = m[1].replace(/\s+Zelienople.*$/i, '').trim()
  if (/MFCP ParkerStore/i.test(text)) continue // 3 store locations bought FROM MFCP — MFCP itself stays independent
  // Pair announcements: split on '&' only after a closing paren or Inc./LLC —
  // "Power & Pumps, Inc. (“P&P”) & Industrial Control Services, Inc. (“IC”)"
  const parts = text.split(/(?<=\)|Inc\.|LLC)\s*&\s*/)
  for (let p of parts) {
    p = p
      .replace(/\s*\([^)]*\)\s*/g, ' ') // drop (“FR”)-style abbreviations
      .replace(/[“”"]/g, '')
      .replace(/[,\s]+$/g, '')
      .trim()
    if (p) roster.push({ parent: 'Motion & Control Enterprises', company: p, domain: null, announced: n.date, evidence_url: n.url, tier: 'first-hand:news' })
  }
}

// SunSource: second-hand file, provenance-tagged. negative entries ride along
// so a hit on them is REPORTED as adjudicated-independent, never retagged.
roster.push({ parent: 'SunSource', company: 'SunSource', domain: 'sunsource.com', announced: null, evidence_url: 'https://www.sun-source.com', tier: 'parent' })
roster.push({ parent: 'SunSource', company: 'SunSource', domain: 'sun-source.com', announced: null, evidence_url: 'https://www.sun-source.com', tier: 'parent' })
for (const e of sunsource.entries) {
  roster.push({
    parent: 'SunSource',
    company: e.company,
    domain: e.domain,
    announced: e.joined,
    evidence_url: e.evidence_url,
    tier: `second-hand:${e.status}`,
    generic: !!e.generic_name,
    negative: e.status === 'negative',
  })
}

// ── targets ──────────────────────────────────────────────────────────────────
const TARGETS = [
  'lists/seated-v5.csv',
  'lists/first-send-200.csv',
  'lists/first-send-200-routed.csv',
  'lists/cohort-e-v1.csv',
  'data/side-pools/pool-ranked-out-v7.csv',
  'data/side-pools/pool-above-ceiling-v8.csv',
  'data/side-pools/pool-chains-v7.csv',
  'data/side-pools/pool-small-shops-v7.csv',
  'data/side-pools/pool-segment-w-v7.csv',
  'data/side-pools/pool-adjacent-trades-v7.csv',
  'data/side-pools/pool-not-a-distributor-v10.csv',
  'data/side-pools/pool-non-us-v9.csv',
  'data/side-pools/pool-duplicate-sites-v8.csv',
  'data/side-pools/pool-identity-backlog-v1.csv',
  'data/side-pools/pool-usaspending-unmatched.csv',
]

// Whole-token subset for the loose tier. Generic single tokens never match.
const GENERIC_TOKENS = new Set([
  'industrial', 'hydraulics', 'hydraulic', 'hose', 'supply', 'rubber', 'fluid',
  'power', 'products', 'equipment', 'company', 'service', 'services', 'sales',
  'national', 'central', 'western', 'american', 'quality', 'custom', 'group',
  'technologies', 'solutions', 'controls', 'control', 'automation', 'machine',
  'machining', 'engineering', 'gasket', 'filtration', 'process', 'motor',
])
const tokens = (s) => normalizeCompany(s).split(' ').filter(Boolean)
const subsetMatch = (a, b) => {
  const [small, large] = a.length <= b.length ? [a, b] : [b, a]
  if (!small.length) return false
  const set = new Set(large)
  if (!small.every((t) => set.has(t))) return false
  // a 1-token subset only counts when the token is distinctive
  if (small.length === 1) return small[0].length >= 5 && !GENERIC_TOKENS.has(small[0])
  // a 2-token subset must not be two generic words ("industrial supply")
  if (small.length === 2 && small.every((t) => GENERIC_TOKENS.has(t))) return false
  return true
}

const rosterByDomain = new Map()
for (const r of roster) if (r.domain) rosterByDomain.set(r.domain, r)
const rosterNamed = roster
  .filter((r) => !r.generic)
  .map((r) => ({ ...r, norm: normalizeCompany(r.company), toks: tokens(r.company) }))
  .filter((r) => r.norm)

const report = { generated: TODAY, roster_size: roster.length, targets: [] }

for (const rel of TARGETS) {
  const p = join(EMAILS, rel)
  if (!existsSync(p)) {
    report.targets.push({ file: rel, missing: true })
    continue
  }
  const rows = parseCsv(readFileSync(p, 'utf8'))
  const domainHits = []
  const nameExact = []
  const nameLoose = []
  for (const row of rows) {
    const apex = apexDomain(row.domain || '')
    // Match against company AND company_display: a row can carry a bare join
    // key in `company` ("ghxinc") while the real name lives only in the
    // display field ("GHX Industrial (Gooding Rubber Co)") — matching the
    // join key alone missed a seated SunSource company on 2026-08-03.
    const rawName = [row.company, row.company_display].filter(Boolean).join(' ')
    const norm = normalizeCompany(row.company || row.company_display || '')
    const dHit = apex ? rosterByDomain.get(apex) : null
    if (dHit)
      domainHits.push({ parent: dHit.parent, roster_company: dHit.company, tier: dHit.tier, negative: !!dHit.negative, row_company: rawName, row_domain: apex, row_source: row.source || '', row_disposition: row.disposition || '' })
    if (!norm) continue
    for (const r of rosterNamed) {
      const exact = r.norm === norm
      const loose = !exact && subsetMatch(r.toks, tokens(rawName))
      if (!exact && !loose) continue
      const rec = {
        parent: r.parent, roster_company: r.company, tier: r.tier, negative: !!r.negative,
        row_company: rawName, row_domain: apex || null, row_source: row.source || '', row_disposition: row.disposition || '',
        domain_agrees: r.domain ? r.domain === apex : null,
      }
      if (exact) nameExact.push(rec)
      else nameLoose.push(rec)
    }
  }
  report.targets.push({ file: rel, rows: rows.length, domain_hits: domainHits, name_exact: nameExact, name_loose: nameLoose })
  console.log(`${rel}: ${rows.length} rows → domain ${domainHits.length} · name-exact ${nameExact.length} · name-loose ${nameLoose.length}`)
}

const outPath = join(RAW, `match-${TODAY}.json`)
writeFileSync(outPath, JSON.stringify(report, null, 2))
console.log(`\nroster entries: ${roster.length} (${rosterNamed.length} name-matchable)`)
console.log(`→ ${outPath}`)
