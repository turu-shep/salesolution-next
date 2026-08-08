#!/usr/bin/env node
/**
 * S4i — the no-domain backlog's free pass. Zero API spend by construction:
 * every join below runs against data already on disk.
 *
 * Handoff: `emails/handoff/industrial-contact-list/no-domain-backlog [STATUS]/01-prompt.md`
 * step 2, extended per `02-assessment.md` H2. The mandate: before buying a
 * single lookup, remove every backlog row that data we already own can
 * resolve, and report how much the bill for step 3 shrinks.
 *
 * The joins, in precedence order (first resolution wins; conflicts recorded,
 * never auto-picked):
 *
 *   email-apex   route 1 of the verifier, read from its --dry output. The
 *                verifier stays the single source of truth for mailbox rules.
 *   sibling-phone   a backlog row's phone appears on a listing in our own raw
 *                DFS corpus that DOES carry a domain. Same corroboration
 *                strength as verifier route 2's phone arm — sourced from cache
 *                we already own instead of a paid call.
 *   sibling-namezip   corpus again, name+zip5 — the program's secondary key
 *                (measured 1.59% collision at S2).
 *   pool-phone   the row's phone matches a CURRENT-generation company that has
 *                a domain (seated-v5 / ranked-out-v7 / latest side pools).
 *                That is a dedupe finding, not a discovery — §5c predicted S2
 *                leaves phone-key gaps for domain-less sources.
 *   pool-namezip / pool-namestate   the fold-in's own two tiers, re-run for
 *                the federal residue against the CURRENT universe (it matched
 *                against seated-v1), with `alternate_names` re-attached by UEI.
 *
 * Plus one join that resolves nothing but consolidates billing:
 *
 *   crossjoin    Segment W × federal residue. Both sides lack a domain; a
 *                match means one company is parked twice. The W row (richer
 *                NAP) becomes the primary; the federal row rides along instead
 *                of billing its own verification.
 *
 * Nothing here rewrites a pool file. Output is a ledger; the pool regeneration
 * happens ONCE, in step 4, after the billed run. `identity-backlog` and
 * `no-website` dispositions stay distinct throughout (§5q).
 *
 * Outputs:
 *   data/s3/backlog-freepass-<date>.json    the full ledger + summary
 *   data/s3/backlog-freepass-resolved-<date>.csv   flat rows for exclusion
 *
 * Usage: node emails/scripts/s4i-backlog-freepass.mjs [--date 2026-08-03]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fromCsv } from './lib/contract.mjs'
import { joinName, joinNames, matchKeys } from './lib/federal.mjs'
import { apexDomain, normalizePhone, normalizeZip5 } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-03')

const readCsv = (p) => fromCsv(readFileSync(p, 'utf8'))
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))

/**
 * Hosts a Google Business Profile "website" field can point at that are not
 * the business's own site. Subset of the verifier's NOT_OWN_SITE, reduced to
 * what a listing owner actually sets: socials and rented site-builders.
 */
const NOT_OWN_SITE = new Set([
  'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
  'youtube.com', 'yelp.com', 'business.site', 'google.com', 'goo.gl',
  'sites.google.com', 'wix.com', 'wixsite.com', 'squarespace.com',
  'godaddysites.com', 'weebly.com', 'yellowpages.com', 'mapquest.com',
])

const cleanApex = (raw) => {
  const a = apexDomain(raw)
  return a && !NOT_OWN_SITE.has(a) ? a : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

const W = readCsv(resolve(ROOT, 'data', 'side-pools', 'pool-segment-w-v7.csv'))
const FED = readCsv(resolve(ROOT, 'data', 'side-pools', 'pool-usaspending-unmatched.csv'))

// Alternate names, re-attached by UEI so joinNames() sees them (§5q: 9.8% of
// fold-in matches were alternate-only).
const altNames = existsSync(resolve(ROOT, 'data', 's3', '_alt-names-2026-08-03.json'))
  ? readJson(resolve(ROOT, 'data', 's3', '_alt-names-2026-08-03.json'))
  : {}
for (const r of FED) {
  const a = altNames[r.federal_uei]
  if (a) r.alternate_names = a
}

// The CURRENT generation: seated-v5 + ranked-out-v7 + the latest side pools,
// which reproduces the pack README's 35,714 exactly. The two backlog pools are
// excluded from the match universe — W is handled by the crossjoin, and a pool
// matching itself is meaningless.
const UNIVERSE_FILES = [
  ['seated-v5', 'lists/seated-v5.csv'],
  ['ranked-out-v7', 'data/side-pools/pool-ranked-out-v7.csv'],
  ['above-ceiling-v8', 'data/side-pools/pool-above-ceiling-v8.csv'],
  ['adjacent-trades-v7', 'data/side-pools/pool-adjacent-trades-v7.csv'],
  ['chains-v7', 'data/side-pools/pool-chains-v7.csv'],
  ['duplicate-sites-v8', 'data/side-pools/pool-duplicate-sites-v8.csv'],
  ['identity-backlog-v1', 'data/side-pools/pool-identity-backlog-v1.csv'],
  ['non-us-v9', 'data/side-pools/pool-non-us-v9.csv'],
  ['not-a-distributor-v10', 'data/side-pools/pool-not-a-distributor-v10.csv'],
  ['small-shops-v7', 'data/side-pools/pool-small-shops-v7.csv'],
]
const universe = []
const origin = new Map()
for (const [name, p] of UNIVERSE_FILES) {
  for (const r of readCsv(resolve(ROOT, p))) {
    universe.push(r)
    origin.set(r, name)
  }
}

// The raw DFS corpus — listing-level granularity, one row per Google Business
// Profile, ~40k of them carrying a domain. Branch listings carry their own
// zips, which the company-grain universe rows do not.
const corpus = readJson(resolve(ROOT, 'data', 'raw', 'dfs-listings-2026-08-01.json')).records

// The verifier's --dry outputs: route 1 (email-apex) resolutions, zero calls.
const dryW = readJson(resolve(ROOT, 'data', 's3', '_dry-w-2026-08-03.json')).records

// ─────────────────────────────────────────────────────────────────────────────
// Index
// ─────────────────────────────────────────────────────────────────────────────

const rowKey = (r) => (r.domain ? `d:${r.domain}` : `n:${r.company}|${r.zip5 ?? ''}`)

// Corpus: phone → apex domains, and name+zip5 → apex domains.
const corpusByPhone = new Map()
const corpusByNameZip = new Map()
let corpusWithDomain = 0
for (const c of corpus) {
  const apex = cleanApex(c.domain || c.website)
  if (!apex) continue
  corpusWithDomain++
  const ph = normalizePhone(c.phone)
  if (ph) {
    if (!corpusByPhone.has(ph)) corpusByPhone.set(ph, new Set())
    corpusByPhone.get(ph).add(apex)
  }
  const nm = joinName(c.company_display)
  const zp = normalizeZip5(c.zip)
  if (nm && zp) {
    const k = `${nm}|${zp}`
    if (!corpusByNameZip.has(k)) corpusByNameZip.set(k, new Set())
    corpusByNameZip.get(k).add(apex)
  }
}

// Universe: phone → rows (domain-bearing only), plus the fold-in's name keys.
const uniByPhone = new Map()
const uniByZipKey = new Map()
const uniByStateKey = new Map()
const uniByName = new Map()
for (const r of universe) {
  const ph = normalizePhone(r.phone_e164)
  if (ph && r.domain) {
    if (!uniByPhone.has(ph)) uniByPhone.set(ph, new Set())
    uniByPhone.get(ph).add(r)
  }
  const k = matchKeys(r)
  for (const n of k.names) {
    if (!uniByName.has(n)) uniByName.set(n, new Set())
    uniByName.get(n).add(r)
  }
  for (const zk of k.zipKeys) {
    if (!uniByZipKey.has(zk)) uniByZipKey.set(zk, new Set())
    uniByZipKey.get(zk).add(r)
  }
  for (const sk of k.stateKeys) {
    if (!uniByStateKey.has(sk)) uniByStateKey.set(sk, new Set())
    uniByStateKey.get(sk).add(r)
  }
}
const uniNameAmbiguity = (n) => {
  const rows = uniByName.get(n)
  return rows ? new Set([...rows].map(rowKey)).size : 0
}

// W: name+zip5 and unambiguous name+state, for the crossjoin.
const wByZipKey = new Map()
const wByStateKey = new Map()
const wNameCount = new Map()
W.forEach((r, i) => {
  const k = matchKeys(r)
  for (const n of k.names) wNameCount.set(n, (wNameCount.get(n) ?? 0) + 1)
  for (const zk of k.zipKeys) {
    if (!wByZipKey.has(zk)) wByZipKey.set(zk, new Set())
    wByZipKey.get(zk).add(i)
  }
  for (const sk of k.stateKeys) {
    if (!wByStateKey.has(sk)) wByStateKey.set(sk, new Set())
    wByStateKey.get(sk).add(i)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Resolve
// ─────────────────────────────────────────────────────────────────────────────

/** One resolution slot per backlog row; first join to fill it wins. */
const res = new Map() // key → {key, cohort, company, resolution, domain, detail}
const conflicts = []
const claim = (key, cohort, company, resolution, domain, detail) => {
  const prev = res.get(key)
  if (prev) {
    if (domain && prev.domain && prev.domain !== domain)
      conflicts.push({ key, company, kept: prev, dropped: { resolution, domain, detail } })
    return false
  }
  res.set(key, { key, cohort, company, resolution, domain: domain ?? null, detail })
  return true
}

const wKey = (i) => `w:${i}`
const fedKey = (r) => `uei:${r.federal_uei}`

// join 1 — email-apex, from the verifier's own dry run. The dry run read the
// same CSV (domain is empty on every row, so nothing was filtered); match its
// records back by company|zip5 and assert nothing was lost.
if (dryW.length !== W.length) throw new Error(`dry-run W count ${dryW.length} != pool ${W.length}`)
const dryByCompanyZip = new Map(dryW.map((r) => [`${r.company}|${r.zip5 ?? ''}`, r]))
W.forEach((r, i) => {
  const d = dryByCompanyZip.get(`${r.company}|${r.zip5 ?? ''}`)
  if (d?.recovered_domain && d.route === 'email-domain')
    claim(wKey(i), 'segment-w', r.company_display, 'email-apex', d.recovered_domain, 'published email address')
})

// join 2 — sibling-phone against our own corpus. One distinct domain accepts;
// several distinct domains is ambiguity, recorded and left unresolved.
const ambiguous = []
W.forEach((r, i) => {
  const ph = normalizePhone(r.phone_e164)
  if (!ph) return
  const domains = corpusByPhone.get(ph)
  if (!domains?.size) return
  if (domains.size === 1) {
    claim(wKey(i), 'segment-w', r.company_display, 'sibling-phone', [...domains][0], `phone ${ph} on own-corpus listing with domain`)
  } else {
    ambiguous.push({ key: wKey(i), company: r.company_display, join: 'sibling-phone', domains: [...domains].sort() })
  }
})

// join 3 — sibling name+zip5, for what phone did not settle.
W.forEach((r, i) => {
  if (res.has(wKey(i))) return
  const k = matchKeys(r)
  const hits = new Set()
  for (const zk of k.zipKeys) for (const d of corpusByNameZip.get(zk) ?? []) hits.add(d)
  if (!hits.size) return
  if (hits.size === 1) {
    claim(wKey(i), 'segment-w', r.company_display, 'sibling-namezip', [...hits][0], 'name+zip5 on own-corpus listing with domain')
  } else {
    ambiguous.push({ key: wKey(i), company: r.company_display, join: 'sibling-namezip', domains: [...hits].sort() })
  }
})

// join 4 — pool-phone: the W row IS a company we already track under a domain.
W.forEach((r, i) => {
  if (res.has(wKey(i))) return
  const ph = normalizePhone(r.phone_e164)
  if (!ph) return
  const rows = uniByPhone.get(ph)
  if (!rows?.size) return
  const domains = new Set([...rows].map((u) => u.domain))
  if (domains.size === 1) {
    const u = [...rows][0]
    claim(wKey(i), 'segment-w', r.company_display, 'pool-phone', u.domain, `same phone as ${origin.get(u)} row "${u.company_display}"`)
  } else {
    ambiguous.push({ key: wKey(i), company: r.company_display, join: 'pool-phone', domains: [...domains].sort() })
  }
})

// join 5 — the federal re-join against the CURRENT universe, both tiers,
// alternates attached. A hit on a domain-bearing row resolves; a hit on a
// domain-less row only links (recorded, not resolved).
const fedLinked = []
for (const r of FED) {
  const k = matchKeys(r)
  if (!k.names.length) continue
  const zipHits = new Set()
  for (const zk of k.zipKeys) for (const u of uniByZipKey.get(zk) ?? []) zipHits.add(u)
  let tier = 'pool-namezip'
  let hits = zipHits
  if (!hits.size) {
    tier = 'pool-namestate'
    const stateHits = new Set()
    for (const n of k.names) {
      if (uniNameAmbiguity(n) !== 1) continue
      if (!k.state) continue
      for (const u of uniByStateKey.get(`${n}|${k.state}`) ?? []) stateHits.add(u)
    }
    hits = stateHits
  }
  if (!hits.size) continue
  const domains = new Set([...hits].map((u) => u.domain).filter(Boolean))
  if (domains.size === 1) {
    const u = [...hits].find((x) => x.domain)
    claim(fedKey(r), 'federal', r.company_display, tier, u.domain, `matches ${origin.get(u)} row "${u.company_display}" (${tier === 'pool-namezip' ? 'name+zip5' : 'name+state, unambiguous'})`)
  } else if (domains.size > 1) {
    ambiguous.push({ key: fedKey(r), company: r.company_display, join: tier, domains: [...domains].sort() })
  } else {
    fedLinked.push({ key: fedKey(r), company: r.company_display, tier, linked_to: [...hits].map((u) => `${origin.get(u)}:${u.company_display}`) })
  }
}

// join 6 — federal × corpus, name+zip5 at listing grain (branch zips).
for (const r of FED) {
  if (res.has(fedKey(r))) continue
  const k = matchKeys(r)
  const hits = new Set()
  for (const zk of k.zipKeys) for (const d of corpusByNameZip.get(zk) ?? []) hits.add(d)
  if (!hits.size) continue
  if (hits.size === 1) {
    claim(fedKey(r), 'federal', r.company_display, 'sibling-namezip', [...hits][0], 'name+zip5 on own-corpus listing with domain')
  } else {
    ambiguous.push({ key: fedKey(r), company: r.company_display, join: 'sibling-namezip', domains: [...hits].sort() })
  }
}

// join 7 — the crossjoin. Resolves nothing; consolidates billing. Tier-2 only
// where the name is unambiguous on BOTH sides (the fold-in's own guard).
const pairs = []
const pairedFed = new Set()
const fedNameCount = new Map()
for (const r of FED) for (const n of joinNames(r)) fedNameCount.set(n, (fedNameCount.get(n) ?? 0) + 1)
for (const r of FED) {
  if (res.has(fedKey(r)) || pairedFed.has(fedKey(r))) continue
  const k = matchKeys(r)
  const zipHits = new Set()
  for (const zk of k.zipKeys) for (const i of wByZipKey.get(zk) ?? []) zipHits.add(i)
  let tier = 'name+zip5'
  let hits = zipHits
  if (!hits.size) {
    tier = 'name+state'
    const stateHits = new Set()
    for (const n of k.names) {
      if ((wNameCount.get(n) ?? 0) !== 1) continue
      if ((fedNameCount.get(n) ?? 0) !== 1) continue
      if (!k.state) continue
      for (const i of wByStateKey.get(`${n}|${k.state}`) ?? []) stateHits.add(i)
    }
    hits = stateHits
  }
  if (hits.size !== 1) continue // 0 = no pair; >1 = ambiguous, leave both billable
  const i = [...hits][0]
  pairedFed.add(fedKey(r))
  pairs.push({ federal: fedKey(r), federal_company: r.company_display, w: wKey(i), w_company: W[i].company_display, tier })
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

const resolved = [...res.values()]
const by = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] ?? 0) + 1), m), {})

const wResolved = resolved.filter((r) => r.cohort === 'segment-w')
const fedResolved = resolved.filter((r) => r.cohort === 'federal')
const wResolvedKeys = new Set(wResolved.map((r) => r.key))
const fedResolvedKeys = new Set(fedResolved.map((r) => r.key))

// Billable scope after the free pass. The federal rows already adjudicated out
// (not-a-distributor / above-ceiling / non-US) were never billable.
const fedBillable = FED.filter((r) => r.disposition === 'identity-backlog')
const wLeft = W.filter((_, i) => !wResolvedKeys.has(wKey(i)))
const fedLeft = fedBillable.filter((r) => !fedResolvedKeys.has(fedKey(r)) && !pairedFed.has(fedKey(r)))

const summary = {
  captured: DATE,
  inputs: {
    segment_w: W.length,
    federal: FED.length,
    federal_identity_backlog: fedBillable.length,
    universe_rows: universe.length,
    corpus_listings: corpus.length,
    corpus_with_domain: corpusWithDomain,
  },
  resolved: {
    total: resolved.length,
    segment_w: wResolved.length,
    federal: fedResolved.length,
    by_join: by(resolved, (r) => r.resolution),
    federal_resolved_by_disposition: by(
      FED.filter((r) => fedResolvedKeys.has(fedKey(r))), (r) => r.disposition),
  },
  crossjoin_pairs: pairs.length,
  ambiguous: ambiguous.length,
  conflicts: conflicts.length,
  federal_linked_no_domain: fedLinked.length,
  billable_after_free_pass: {
    segment_w: wLeft.length,
    federal_identity_backlog: fedLeft.length,
    federal_rides_crossjoin: fedBillable.filter((r) => pairedFed.has(fedKey(r))).length,
    total: wLeft.length + fedLeft.length,
  },
  reconciliation_9006_vs_8156: {
    no_domain_rows_current_generation: 9006,
    backlog_scope: 8156,
    delta: 850,
    delta_by_pool: { 'adjacent-trades-v7': 473, 'not-a-distributor-v10': 358, 'chains-v7': 14, 'above-ceiling-v8': 5 },
    note: 'the 850 carry no domain but were adjudicated out for reasons independent of web presence; the backlog correctly excludes them',
  },
}

// Conservation: every W row is exactly one of resolved / left; federal
// identity-backlog rows are resolved / paired / left.
if (wResolved.length + wLeft.length !== W.length)
  throw new Error('W conservation fail')
const fedIbResolved = fedBillable.filter((r) => fedResolvedKeys.has(fedKey(r))).length
const fedIbPaired = fedBillable.filter((r) => pairedFed.has(fedKey(r))).length
if (fedIbResolved + fedIbPaired + fedLeft.length !== fedBillable.length)
  throw new Error('federal conservation fail')

const ledger = {
  source: 'backlog-freepass', captured: DATE, summary,
  resolved, crossjoin_pairs: pairs, ambiguous, conflicts,
  federal_linked_no_domain: fedLinked,
}
const outJson = resolve(ROOT, 'data', 's3', `backlog-freepass-${DATE}.json`)
writeFileSync(outJson, JSON.stringify(ledger, null, 1))

const esc = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csvRows = [['key', 'cohort', 'company', 'resolution', 'domain', 'detail']]
for (const r of resolved) csvRows.push([r.key, r.cohort, r.company, r.resolution, r.domain, r.detail])
const outCsv = resolve(ROOT, 'data', 's3', `backlog-freepass-resolved-${DATE}.csv`)
writeFileSync(outCsv, csvRows.map((r) => r.map(esc).join(',')).join('\n') + '\n')

console.log(JSON.stringify(summary, null, 2))
console.log(`-> ${outJson}`)
console.log(`-> ${outCsv}`)
