/**
 * s4h-hoseshop-fix — split the two-companies-in-one-row defect (seated-v5).
 *
 * `thehoseshop.com` is The Hose Shop of Santa Cruz, CA (its own homepage says
 * so, and it is a Parker house), but the row carries the NAP of The Hose Shop,
 * Inc. of Somerset, NJ — which has its own row, `hoseshop.com`. The bad merge
 * rode the shared normalized name "hose shop". Both send-blocking docs
 * (02-list-guide; campaigns 00/01 §7) say: split it or correct its NAP first.
 *
 * The correction source is already in the raw estate with provenance: the DFS
 * business listing for thehoseshop.com (Google Business, place_id
 * ChIJp6XS9HtqjoARvIcUCBsbgLM, cid 12934367932721694652, captured 2026-08-01):
 * 121 Ingalls St, Santa Cruz, CA 95060 · +1 831-425-4673. The NJ Google cid
 * the row currently cites stays in source_url — provenance is history, not
 * current truth — and the Santa Cruz cid is appended.
 *
 * company_display: "The Hose Shop LLC" has no source anywhere in the estate.
 * Their own homepage nav reads "The Hose Shop", which is what a prospect would
 * recognise; DFS's "Hose Shop Inc" is a Google title mangle that collides with
 * the NJ company's legal name. Corrected to "The Hose Shop".
 *
 *   node emails/scripts/s4h-hoseshop-fix.mjs            # write seated-v5.csv + report
 *
 * House rules honoured: no row deleted, no other cell touched, field-for-field
 * readback of the written file against intent (the §5s lesson: structural
 * checks cannot catch cell corruption), idempotent (an existing correct v5
 * verifies instead of rewriting; an existing different v5 is an error).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SRC = resolve(ROOT, 'emails/lists/seated-v4.csv')
const OUT = resolve(ROOT, 'emails/lists/seated-v5.csv')
const REPORT = resolve(ROOT, 'emails/data/_hoseshop-fix-2026-08-02.md')

const DOMAIN = 'thehoseshop.com'

// What the defective row must still look like — if any of these drifted, the
// defect was touched by someone else and this script refuses to guess.
const EXPECT_BEFORE = {
  company_display: 'The Hose Shop LLC',
  address_1: '400 apgar dr ste a b',
  city: 'Somerset',
  state: 'NJ',
  zip5: '08873',
  phone_e164: '7325621000',
  lat: '40.5427955',
  lng: '-74.55163639999999',
}

// The Santa Cruz record, from raw/dfs-listings-2026-08-01.json (verbatim cache).
const SANTA_CRUZ_MAPS = 'https://www.google.com/maps?cid=12934367932721694652'
const FIX = {
  company_display: 'The Hose Shop',
  address_1: '121 ingalls st',
  city: 'Santa Cruz',
  state: 'CA',
  zip5: '95060',
  phone_e164: '8314254673',
  lat: '36.9591201',
  lng: '-122.0441578',
}

function intendedRows(rows) {
  const hits = rows.filter((r) => r.domain === DOMAIN)
  if (hits.length !== 1) throw new Error(`expected exactly 1 ${DOMAIN} row, found ${hits.length}`)
  const row = hits[0]
  return rows.map((r) => {
    if (r !== row) return r
    const fixed = { ...r, ...FIX }
    if (!fixed.source_url.includes(SANTA_CRUZ_MAPS)) fixed.source_url = `${r.source_url}|${SANTA_CRUZ_MAPS}`
    return fixed
  })
}

function diffRows(a, b, header) {
  const diffs = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    for (const k of header) {
      const va = a[i]?.[k] ?? ''
      const vb = b[i]?.[k] ?? ''
      if (va !== vb) diffs.push({ row: i, domain: a[i]?.domain || b[i]?.domain, field: k, from: va, to: vb })
    }
  }
  return diffs
}

const rows = parseCsv(readFileSync(SRC, 'utf8'))
const header = Object.keys(rows[0])
const before = rows.find((r) => r.domain === DOMAIN)
if (!before) throw new Error(`${DOMAIN} not found in seated-v4`)

const drifted = Object.entries(EXPECT_BEFORE).filter(([k, v]) => before[k] !== v)
const alreadyFixed = Object.entries(FIX).every(([k, v]) => before[k] === v)

const intended = intendedRows(rows)

if (existsSync(OUT)) {
  const v5 = parseCsv(readFileSync(OUT, 'utf8'))
  const diffs = diffRows(intended, v5, header)
  if (diffs.length) {
    console.error(`seated-v5.csv exists but differs from the intended fix in ${diffs.length} cell(s):`)
    for (const d of diffs.slice(0, 10)) console.error(`  row ${d.row} (${d.domain}) ${d.field}: ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}`)
    process.exit(1)
  }
  console.log(`seated-v5.csv already exists and verifies field-for-field (${v5.length} rows). Nothing to do.`)
  process.exit(0)
}

if (alreadyFixed) throw new Error('seated-v4 already carries the fix — expected the defective NJ NAP; investigate before writing v5')
if (drifted.length)
  throw new Error(`the ${DOMAIN} row drifted from the documented defect (${drifted.map(([k]) => k).join(', ')}) — refusing to fix blind`)

writeFileSync(OUT, toCsv(intended, header))

// Field-for-field readback: the file on disk, reparsed, must equal intent, and
// must differ from v4 in exactly the cells this fix names.
const reread = parseCsv(readFileSync(OUT, 'utf8'))
const wrong = diffRows(intended, reread, header)
if (wrong.length) throw new Error(`readback: written file differs from intent in ${wrong.length} cell(s) — aborting`)
const changed = diffRows(rows, reread, header)
// The Santa Cruz maps cid may already sit in source_url — both Google listings
// merged into this row, which is how the NJ NAP arrived in the first place.
const expectedChanges = Object.keys(FIX).length + (before.source_url.includes(SANTA_CRUZ_MAPS) ? 0 : 1)
if (reread.length !== rows.length) throw new Error(`row count changed: ${rows.length} → ${reread.length}`)
if (changed.length !== expectedChanges || changed.some((d) => d.domain !== DOMAIN))
  throw new Error(`expected exactly ${expectedChanges} changed cells on ${DOMAIN}, got ${changed.length}: ${changed.map((d) => `${d.domain}.${d.field}`).join(', ')}`)

const report = `# thehoseshop.com split — seated-v5.csv (2026-08-02)

**Defect (02-list-guide; campaigns 00/01 §7):** one row carried two companies.
The declaration and domain belong to The Hose Shop of Santa Cruz, CA; the NAP
belonged to The Hose Shop, Inc. of Somerset, NJ (\`hoseshop.com\`, which has its
own row and is untouched). Merge rode the shared normalized name "hose shop".

**Correction source:** DFS business listing for ${DOMAIN} in
\`raw/dfs-listings-2026-08-01.json\` — Google Business place_id
ChIJp6XS9HtqjoARvIcUCBsbgLM, cid 12934367932721694652, captured 2026-08-01.

| field | was (NJ, wrong) | now (Santa Cruz) |
|---|---|---|
${Object.keys(FIX)
  .map((k) => `| ${k} | ${JSON.stringify(EXPECT_BEFORE[k] ?? '(n/a)')} | ${JSON.stringify(FIX[k])} |`)
  .join('\n')}
| source_url | (NJ maps cid kept — provenance is history) | + \`${SANTA_CRUZ_MAPS}\` |

**company_display** note: "The Hose Shop LLC" had no source in the estate; the
company's own homepage nav reads "The Hose Shop"; DFS's Google title "Hose Shop
Inc" collides with the NJ company's legal name. Copy uses their own usage.

**Readback:** ${reread.length} rows; ${changed.length} cells changed, all on ${DOMAIN};
every other cell byte-identical to seated-v4 (field-for-field diff, per the §5s
rule). \`seated-v5.csv\` supersedes \`seated-v4.csv\`.

**Still true for this row:** its \`self_declaration\` is scraped nav junk
containing a manufacturer brand — it must fail the declaration review, so the
row routes to body E1-B. \`ecommerce_class: brochure\`.
`
writeFileSync(REPORT, report)
console.log(`seated-v5.csv written: ${reread.length} rows, ${changed.length} cells changed (all ${DOMAIN}).`)
console.log(`report: ${REPORT.replace(ROOT + '/', '')}`)
