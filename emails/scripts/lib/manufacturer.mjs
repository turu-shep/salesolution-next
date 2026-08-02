/**
 * Is this seated row a MANUFACTURER rather than a distributor?
 *
 * Built for `_manufacturer-audit-2026-08-01.md` after the USAspending fold-in
 * showed 24 of 90 federally-matched seated rows self-declaring
 * `manufacturer_of_goods` to SAM.gov. We hold that declaration for 90 of 3,000
 * companies; the other 2,910 had never been tested by any signal that would
 * catch it, because **these companies present as distributors on their own
 * websites**. This module is the offline replacement for the declaration.
 *
 * Two design rules carried from the build plan:
 *
 *   1. **Nothing routes on one signal.** §5f's rule about never seating on a
 *      single code cuts both ways. Both sides are scored and the difference is
 *      the verdict.
 *   2. **Subject attribution is the hard part.** `sealcompany.com` publishes
 *      "Garlock® is a leading manufacturer of…" about a brand it *resells*.
 *      A bag-of-phrases reader scores that as a manufacturer claim and routes a
 *      good distributor out of the list. Every manufacture-claim is therefore
 *      tested for whose name it is attached to ({@link ownClaim}).
 *
 * Measured on `seated-v1.csv` (3,000 rows), all 139 flagged rows hand-read:
 * **precision 0.892 before two phrase fixes, 0.938 after**. Recall against a
 * stratified hand-check is **0.27** — the detector finds roughly a quarter of
 * what is there. It is a candidate generator, not an oracle. Do not route on
 * `verdict` alone without reading the row.
 *
 * @module manufacturer
 */

/** Lowercase, punctuation-flattened. Keeps `'`, `&`, `.` and `-` — they carry brand shape. */
export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9'&.\- ]+/g, ' ')
    .replace(/\s+/g, ' ')

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Squash a list of harvested brand names into the matching vocabulary.
 *
 * Kept pure — callers pass the `brands[]` / `homepage_brands[]` arrays from
 * `data/enrichment/linecards-*.json`. Four characters is the floor: three-letter
 * brands collide with ordinary words, and two collide with everything.
 *
 * @param {Iterable<string>} brandNames
 * @returns {Set<string>}
 */
export function buildVocab(brandNames) {
  const v = new Set()
  for (const b of brandNames) {
    const s = String(b ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    if (s.length >= 4) v.add(s)
  }
  return v
}

// --- phrase tables. `\b`-anchored; plural forms are separated on purpose. ---

/** First-person: the writer is the maker. No attribution test needed. */
const M_FIRST_PERSON = [
  'we manufacture', 'we design and manufacture', 'we engineer and manufacture',
  'we develop and manufacture', 'we design, engineer and manufacture', 'we produce',
  'we are a manufacturer', 'we are the manufacturer', 'we are a leading manufacturer',
  'we are an oem', 'we are a us manufacturer', "we're a manufacturer",
  'our manufacturing facility', 'our manufacturing facilities', 'our manufacturing plant',
  'our factories', 'our production facility', 'our own factory',
  'our products are manufactured', 'our patented', 'our proprietary',
  'in-house manufacturing', 'in house manufacturing', 'manufactured in our',
  'made in our own', 'we build', 'we fabricate our own',
]

/**
 * They operate a dealer channel. Structurally exclusive with being a dealer.
 * PLURAL forms only — "authorized distributors" is a nav link to THEIR dealers;
 * "authorized distributor" (singular) is a claim about themselves. Conflating
 * the two is the single biggest false-negative source in a naive detector.
 */
const M_OWN_CHANNEL = [
  'find a distributor', 'find a dealer', 'find a rep', 'locate a distributor',
  'locate a dealer', 'locate a rep', 'distributor locator', 'dealer locator',
  'rep locator', 'rep directory', 'representative locator', 'where to buy',
  'our distributors', 'our distributor network', 'our dealers', 'our dealer network',
  'distributor network', 'dealer network', 'become a distributor', 'become a dealer',
  'authorized distributors', 'authorized dealers', 'authorized resellers',
  'distributor login', 'distributor portal', 'dealer login', 'dealer portal',
  'sales network', 'find a location near you',
]

/** Capability claims a reseller rarely publishes about itself. */
const M_CAPABILITY = [
  'as9100', 'iatf 16949', 'manufacturing capabilities', 'production capabilities',
  'contract manufacturing', 'private label manufacturing', 'patent pending',
  'u.s. patent', 'us patent', 'patented design', 'patented technology',
  'our engineering team designs', 'research and development', 'r&d',
  'our manufacturing process', 'assembly and testing facilities',
]

/** First-person reseller claims. Singular / "we" forms only. */
const D_FIRST_PERSON = [
  'an authorized distributor', 'is an authorized distributor', 'your authorized distributor',
  'an authorized dealer', 'is an authorized dealer', 'an authorized reseller',
  'a stocking distributor', 'stocking distributor of', 'full-line distributor',
  'full line distributor', 'master distributor', 'value-added distributor',
  'value added distributor', 'industrial distributor', 'we are a distributor',
  'we are distributors', 'we distribute', 'we stock', 'we carry', 'we supply',
  'we represent', 'we offer products from', 'we sell products from',
  'brands we carry', 'brands we represent', 'shop by brand', 'our suppliers',
  'top suppliers', 'our vendors', 'vendor partners', 'supplier partners',
  'lines we carry', 'products we carry', 'featured brands', 'our brands',
  'our product lines', 'distributor of', 'distributors of', 'a distributor for',
]

const D_ARTIFACT = ['line card', 'linecard', 'line-card']

/** Manufacture-claim heads, for the attribution test. */
const CLAIM = [
  'manufacturer of', 'manufacturers of', 'manufactures', 'manufacturing company',
  'is a manufacturer', 'are a manufacturer', 'leading manufacturer', 'a manufacturer',
  'designs and manufactures', 'builds and',
]

function hits(txt, list) {
  const out = []
  for (const p of list) {
    const re = new RegExp(`(^|[^a-z0-9])${esc(p)}([^a-z0-9]|$)`)
    if (re.test(txt)) out.push(p)
  }
  return out
}

/** Own-name surface forms: legal name minus suffixes, domain label, acronym. */
function ownNames(r) {
  const set = new Set()
  const clean = (s) =>
    norm(s)
      .replace(/\b(inc|llc|ltd|corp|corporation|company|co|the|and|&|lp|plc|group|holdings)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  for (const src of [r.company_display, r.company]) {
    const c = clean(src)
    if (c.length >= 4) set.add(c)
    const first = c.split(' ').filter((w) => w.length >= 4)[0]
    if (first) set.add(first)
    const words = c.split(' ').filter(Boolean)
    if (words.length >= 2) set.add(words.slice(0, 2).join(' '))
    const acro = words.filter((w) => w.length > 2).map((w) => w[0]).join('')
    if (acro.length >= 3) set.add(acro)
  }
  const label = String(r.domain ?? '').split('.')[0].replace(/[^a-z0-9]/g, '')
  if (label.length >= 4) set.add(label)
  return [...set].filter(Boolean)
}

/**
 * Is a manufacture-claim attached to the company's OWN name (or "we")?
 * Looks back 90 chars from the claim for an own-name mention with no other
 * capitalised brand in between (approximated by "no other vocab brand in the
 * window", which is what actually causes the sealcompany.com error).
 */
const squash = (s) => String(s ?? '').replace(/[^a-z0-9]/g, '')

/**
 * Is a brand one of the company's OWN surface forms? Compared space-stripped,
 * because `rbcbearings.com` is "RBC Eastern Distribution Center" in the pool and
 * "RBC Bearings" in the line card — the same company under two spellings, and
 * counting its own brand as a third party's is what made a public bearing OEM
 * read as a distributor.
 */
function isOwnBrand(b, names) {
  const sb = squash(b)
  if (sb.length < 4) return false
  return names.some((n) => {
    const sn = squash(n)
    return sn.length >= 4 && (sn.includes(sb) || sb.includes(sn))
  })
}

function ownClaim(txt, names, vocab) {
  const found = []
  for (const c of CLAIM) {
    let i = 0
    for (;;) {
      const k = txt.indexOf(c, i)
      if (k < 0) break
      i = k + c.length
      const win = txt.slice(Math.max(0, k - 90), k)
      // another party's brand sitting between the name and the claim → not ours
      let foreign = false
      for (const b of vocab) {
        if (b.length < 5 || !win.includes(b)) continue
        if (isOwnBrand(b, names)) continue
        foreign = true
        break
      }
      if (foreign) continue
      for (const n of names) {
        if (n.length >= 4 && win.includes(n)) {
          found.push(`${n} … ${c}`)
          break
        }
      }
    }
  }
  return found
}

/** Distinct OTHER-PARTY brands named on the page. A distributor names many. */
function foreignBrands(txt, names, vocab) {
  const seen = new Set()
  for (const b of vocab) {
    if (b.length < 5) continue
    if (isOwnBrand(b, names)) continue
    const re = new RegExp(`(^|[^a-z0-9])${esc(b)}([^a-z0-9]|$)`)
    if (re.test(txt)) seen.add(b)
  }
  return [...seen]
}

export function makeScorer(vocab) {
  return function scoreRow(r) {
    const home = norm(r.homepage_text)
    const lcText = norm(r.linecard_text)
    const both = home + '   ' + lcText
    const title = norm(r.homepage_title)
    const names = ownNames(r)
    const observed = home.length > 200 && (r.homepage_garbage ?? 1) < 0.15

    const sig = []
    let mfg = 0
    let dist = 0

    // ---------- manufacturer
    const m1 = hits(home, M_FIRST_PERSON)
    // "our factory-trained technicians" / "Our Factory Certified Service" are
    // things a DEALER says. `our factory` alone read them as makers.
    if (/(^| )our factory( |$)/.test(home) && !/our factory[- ](trained|certified|authoriz)/.test(home)) m1.push('our factory')
    if (m1.length) { mfg += Math.min(3, m1.length) * 2; sig.push(`M1 first-person-make ×${m1.length}: ${m1.slice(0, 3).join(' / ')}`) }

    const m2 = hits(home, M_OWN_CHANNEL)
    if (m2.length) { mfg += Math.min(3, m2.length) * 2; sig.push(`M2 runs-a-dealer-channel ×${m2.length}: ${m2.slice(0, 3).join(' / ')}`) }

    // M2b — a bare "Distributors" nav section with no first-person reseller
    // language anywhere on the page. `kaydonbearings.com` publishes
    // "Distributors — North America / International" and never once says it is
    // one. Weighed, not decisive: it is worth less than an explicit channel page.
    const d1probe = hits(home, D_FIRST_PERSON)
    if (!m2.length && !d1probe.length && /(^| )distributors( |$)/.test(home)) {
      mfg += 2
      sig.push('M2b names "Distributors" as a section, never claims to be one')
    }

    const m3 = ownClaim(home, names, vocab)
    if (m3.length) { mfg += Math.min(3, m3.length) * 2; sig.push(`M3 own-name manufacture claim ×${m3.length}: ${m3.slice(0, 2).join(' | ')}`) }

    // "bearing remanufacturing" is a repair service, not a manufacture claim —
    // but it must not mask a real one in the same title, so it is removed first
    // rather than used as a veto.
    const titleNoRe = title.replace(/remanufactur\w*/g, ' ')
    if (/manufactur|\bmfg\b|\bfoundry\b/.test(titleNoRe)) { mfg += 2; sig.push(`M4 title claims manufacture: "${r.homepage_title}"`) }

    const m5 = hits(both, M_CAPABILITY)
    if (m5.length) { mfg += Math.min(2, m5.length); sig.push(`M5 maker capability ×${m5.length}: ${m5.slice(0, 3).join(' / ')}`) }

    // ---------- distributor
    const d1 = hits(home, D_FIRST_PERSON)
    if (d1.length) { dist += Math.min(4, d1.length) * 2; sig.push(`D1 reseller language ×${d1.length}: ${d1.slice(0, 4).join(' / ')}`) }

    // D2 is deliberately weak. A "supplier" or "vendors" page on a MAKER's site
    // lists the people it buys FROM — `kaydonbearings.com/supplier.htm` is one —
    // and the harvester files that as a line card. It only counts when the page
    // actually yielded another party's brand, or the phrase "line card" is used.
    const lcOwnBrands = (r.lc_brands || []).filter((b) => !isOwnBrand(norm(b), names))
    if (hits(both, D_ARTIFACT).length || lcOwnBrands.length >= 1) {
      dist += 2
      sig.push(`D2 line-card artifact${lcOwnBrands.length ? ` (${lcOwnBrands.length} brands harvested)` : ''}`)
    }

    // D3 — THIRD-PARTY evidence. A manufacturer's own locator named this company
    // its authorized dealer. Makers do not appear in rivals' locators.
    const ba = (r.brand_authorized || []).filter((b) => !isOwnBrand(norm(b), names)).length
    if (ba >= 1) { dist += ba >= 3 ? 7 : ba >= 2 ? 5 : 3; sig.push(`D3 named by ${ba} manufacturer locator(s): ${(r.brand_authorized || []).slice(0, 5).join(', ')}`) }

    const fb = foreignBrands(both, names, vocab)
    if (fb.length >= 2) { dist += fb.length >= 6 ? 6 : fb.length >= 3 ? 4 : 2; sig.push(`D4 names ${fb.length} other-party brands: ${fb.slice(0, 6).join(', ')}`) }

    if (r.self_declaration) { dist += 3; sig.push(`D5 harvested declaration: ${String(r.self_declaration).slice(0, 70)}`) }

    // D6 — the company files itself under a reseller word in its own name or
    // title. Weak on its own (makers are called "X Supply" too) but it is the
    // counterweight M6 lacks: commodity resellers — steel, fasteners, MRO —
    // name no brands at all, so M6 fires on them by construction.
    const nameTitle = `${norm(r.company_display)} ${norm(r.company)} ${title}`
    const d6 = /(^| )(supply|supplies|distributor|distributors|distributing|distribution|wholesale|wholesaler|dealer)( |$)/.exec(nameTitle)
    if (d6) { dist += 3; sig.push(`D6 reseller word in own name/title: "${d6[2]}"`) }

    // M6 — the structural one from the brief: nobody, including the company,
    // names another manufacturer's brand, yet it publishes a product catalog.
    const sku = r.sku_estimate ?? r.cat_sku ?? null
    if (ba === 0 && lcOwnBrands.length === 0 && fb.length === 0) {
      mfg += 2
      sig.push('M6 zero brand vocabulary — no locator brand, no line-card brand, no brand named on the page')
      if (sku != null && sku >= 5) { mfg += 2; sig.push(`M6b …and it publishes an own-product catalog (sku≈${sku})`) }
    }

    const score = mfg - dist
    let verdict
    if (!observed) verdict = 'unobserved'
    else if (score >= 6) verdict = 'manufacturer'
    else if (score >= 1) verdict = 'review'
    else verdict = 'distributor'
    return { score, mfg, dist, signals: sig, verdict, observed, foreign_brands: fb.length }
  }
}
