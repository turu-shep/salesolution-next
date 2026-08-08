/**
 * adaptall — the adjudicated facts behind the Adaptall-export fold-in.
 *
 * Everything here is a decision that was made by reading a page, not by a
 * heuristic, so it lives in one auditable place rather than inline in the
 * stage. Three things it holds:
 *
 *   - `EXPORT_VERDICTS` — the per-domain seat/route decision for every export
 *     domain our list does not already carry, with the evidence that settled it.
 *   - the contact title ranking, which is the part that can quietly wreck a
 *     send if it is wrong.
 *   - `distinctLocations`, which is §5m's trap written down as code.
 *
 * Tests: emails/scripts/lib/adaptall.test.mjs
 */
import { normalizeAddress } from './normalize.mjs'

// ─────────────────────────────────────────────────────────────────────────────
// Contact title ranking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ICP fit by title class, lowest number first.
 *
 * **`branch` and `sales` sort last, and that is the whole point of this table.**
 * 118 of the export's 623 contacts are Branch Managers and 59 more are titled
 * "Sales" — together 28% of the file, and the largest single title bucket by a
 * wide margin. Neither buys a $10–30K engagement at a multi-branch distributor;
 * a branch manager runs one counter. Any ranking that sorted alphabetically, or
 * by data completeness, or simply took the first row per company, would put a
 * branch manager in front of a sitting President roughly half the time —
 * `hosepower.com` alone offers 63 contacts of which one is the President.
 *
 * `other` outranks them for the same reason: an unclassified corporate title
 * (Controller, CFO's office, IT) is at least plausibly in the room. A branch
 * manager is not.
 */
export const TITLE_RANK = {
  owner: 1,
  'general-manager': 2,
  vp: 3,
  operations: 4,
  purchasing: 5,
  other: 6,
  sales: 7,
  branch: 8,
}

/** `Vice President` must never read as `President`. Neutralised before testing. */
const VICE = /\b(?:vice[\s-]?president|v\.?p\.?|svp|evp|avp)\b/gi

const CLASS_TESTS = [
  ['branch', /\bbranch\s+(?:manager|mgr)\b/i],
  ['owner', /\b(?:owner|co[\s-]?founder|founder|proprietor|president|c\.?e\.?o\.?|chief\s+executive|principal)\b/i],
  ['general-manager', /\b(?:general\s+manager|g\.?m\.?)\b/i],
  ['vp', /\b(?:vice[\s-]?president|v\.?p\.?|svp|evp|avp|chief\s+\w+\s+officer|c\.?[fot]\.?o\.?|general\s+counsel)\b/i],
  ['operations', /\boperations?\b/i],
  ['purchasing', /\b(?:purchasing|procurement|buyer|sourcing)\b/i],
  ['sales', /\b(?:sales|account\s+manager|business\s+development)\b/i],
]

/**
 * The title class for one contact.
 *
 * **Classified on the FIRST segment**, split on `;` or `|`. LinkedIn titles are
 * written primary-role-first and then padded, and the padding lies about the
 * role: `"General Manager | P&L Leadership | Scaling Operations, Sales, and
 * Commercial Execution"` is a general manager, and reading the whole string
 * files him under Operations. `"General Manager - Seal Group Triad
 * Technologies; President Tech-Syn LLC / All Seals & Hose Inc."` is a general
 * manager at the company we are joining to and a president at a *different*
 * one — whole-string matching promotes him over Triad's actual GM.
 *
 * `branch` is tested first so `"Regional Branch Manager"` cannot be read as a
 * general manager, and the vice-president neutralisation runs before the owner
 * test so `"Executive Vice President"` cannot be read as a president.
 *
 * @param {unknown} title
 * @returns {keyof TITLE_RANK}
 */
export function titleClass(title) {
  const raw = String(title ?? '').trim()
  if (!raw) return 'other'
  const first = raw.split(/[;|]/)[0].trim() || raw
  for (const candidate of [first, raw]) {
    const deviced = candidate.replace(VICE, ' __VP__ ')
    for (const [cls, rx] of CLASS_TESTS) {
      const subject = cls === 'owner' ? deviced : candidate
      if (rx.test(subject)) return cls
    }
  }
  return 'other'
}

/** Email quality, best first — the tiebreak WITHIN a title class, never across. */
function emailQuality(judged) {
  switch (judged.verdict) {
    case 'own-domain':
      return 0
    case 'domain-mismatch':
      return 2
    case 'free-provider':
      return 3
    case 'marketplace-inbox':
    case 'placeholder':
      return 4
    case 'manufacturer-inbox':
      return 5
    default:
      return 6 // no address at all
  }
}

const STATUS_RANK = { verified: 0, extrapolated: 1 }

/**
 * The most ICP-fit contact for one company.
 *
 * Title class decides, absolutely. A President with no published address still
 * beats a General Manager with a verified one, because Track 1 is a founder
 * working accounts by hand and the *name* is what he needs to get past the
 * front desk. Email quality and verification status only break ties inside a
 * class.
 *
 * @param {{contact: Record<string, any>, email: {verdict: string}}[]} judged
 */
export function bestContact(judged) {
  const ranked = judged
    .map((j) => ({
      ...j,
      cls: titleClass(j.contact.title),
      q: emailQuality(j.email),
      s: STATUS_RANK[String(j.contact.email_status ?? '').toLowerCase()] ?? 2,
    }))
    .sort(
      (a, b) =>
        TITLE_RANK[a.cls] - TITLE_RANK[b.cls] ||
        a.q - b.q ||
        a.s - b.s ||
        String(a.contact.last_name ?? '').localeCompare(String(b.contact.last_name ?? '')),
    )
  return ranked[0] ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// §5m — count distinct (company, address) pairs, never raw rows
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Branch locations per company, deduplicated on the normalized address.
 *
 * The export's US location table has 1,058 rows and 1,013 distinct
 * `(company, address)` pairs: a company appears twice at one address whenever
 * two evidence tiers found the same branch. Reading the raw row count inflates
 * every branch network by ~4%, which is enough to push a borderline company
 * across a size-band cut on an artifact of the join. §5m is explicit about it,
 * and it is the reason the value is a Set of address keys rather than a counter.
 *
 * The key is `normalizeAddress(address) | city | state` and not the address
 * alone — two companies can share a business park, and one company's
 * `"1716 N Post Rd"` in Anchorage is not its `"1716 N Post Rd"` anywhere else.
 *
 * @param {Record<string, any>[]} rows the `distributor_locations_us.csv` rows
 * @returns {Map<string, Set<string>>} company → distinct address keys
 */
export function distinctLocations(rows) {
  const byCompany = new Map()
  for (const r of rows) {
    const company = String(r.company ?? '').trim()
    if (!company) continue
    const key = [
      normalizeAddress(r.address) ?? '',
      String(r.city ?? '').trim().toLowerCase(),
      String(r.state ?? '').trim().toUpperCase(),
    ].join('|')
    if (key === '||') continue
    if (!byCompany.has(company)) byCompany.set(company, new Set())
    byCompany.get(company).add(key)
  }
  return byCompany
}

/**
 * Location-table display names → the apex the export's own companies table
 * gives them. Every pair is read off `distributor_companies.csv`, not guessed:
 * the location file abbreviates ("MFCP", "Cross Company") where the company
 * file carries the legal name ("Motion & Flow Control Products, Inc. (MFCP)").
 */
export const LOCATION_ALIASES = {
  'Applied Fluid Power': 'applied.com',
  'APPLIED IND. TECHNOLOGY': 'applied.com',
  'APPLIED IND. TECHNOLOGIES': 'applied.com',
  'OTC Industrial Technologies': 'otcindustrial.com',
  MFCP: 'mfcp.com',
  'Bridgestone HosePower': 'hosepower.com',
  'Motion Fluid Power': 'motion.com',
  'MOTION INDUSTRIES - MT01': 'motion.com',
  'SunSource / The Hope Group': 'sun-source.com',
  'Hydraulic Supply Company': 'hydraulic-supply.com',
  'Interstate Power Systems': 'istate.com',
  'Cross Company': 'crossco.com',
  'Evolution Motion Solutions': 'evolutionmotion.com',
  'Western Integrated Technologies': 'westernintech.com',
  Hydradyne: 'hydradynellc.com',
  'Geib Industries, Inc.': 'geibind.com',
  'Power Drives Inc.': 'powerdrives.com',
  'Custom Hydraulics & Design, Inc.': 'customhydraulicsdesign.com',
  'HOSE & RUBBER SUPPLY INC': 'hoseandrubber.com',
  'HOSE AND RUBBER SUPPLY INC.': 'hoseandrubber.com',
  'MID-STATE SALES INC.': 'midstate-sales.com',
  'Trompler Fluid Power Products': 'tfp-p.com',
  'Advanced Industrial Products (JJS, Inc. dba AIP)': 'aipoh.com',
  'The Hose Shop Inc.': 'hoseshop.com',
}

// ─────────────────────────────────────────────────────────────────────────────
// T1 — the seat/route verdicts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Companies to seat. **One.** Each field was read off the company's own pages
 * on 2026-08-01, and `self_declaration` is byte-exact as published.
 *
 * `hoseshop.com` is genuinely net-new AND collides with a seated row, which is
 * why it survived a domain-exact reconciliation as "absent" and would have
 * failed a name-based one as "present". `seated-v3` carries
 * `thehoseshop.com` — **a different company of the same name**, The Hose Shop
 * of Santa Cruz, CA, a Parker distributor at 121 Ingalls St. That row's
 * `self_declaration` is Santa Cruz's homepage while its address, ZIP and phone
 * are Somerset, New Jersey's: the dedupe collapsed two companies on the
 * normalized name `hose shop`. The New Jersey company has never had a row of
 * its own. See the report for the send-blocking consequence.
 */
export const SEAT = [
  {
    domain: 'hoseshop.com',
    company_display: 'The Hose Shop, Inc.',
    address_1: '400 apgar dr ste a b',
    city: 'Somerset',
    state: 'NJ',
    zip5: '08873',
    phone: '+1 732-562-1000',
    email: null,
    location_count: 3,
    evidence_depth: 2,
    distributor_type: 'Hose supplier',
    tier_raw: 'dealer_candidate',
    line_card: [
      'Hydraulic Hoses',
      'Industrial Hoses',
      'Steel Adapters',
      'Hydraulic Quick Connects',
      'Pneumatic Quick Connects',
      'Sanitary Fittings',
      'Cam & Groove',
      'Kits',
    ],
    self_declaration:
      'We have been a premier Adaptall distributor for over 30 years and can help you find a fitting or create a solution.',
    self_declaration_url: 'https://www.hoseshop.com/adaptall-products-metric-adapters-the-hose-shop.html',
    source_url:
      'https://www.hoseshop.com/|https://www.hoseshop.com/contact-us.html|https://www.hoseshop.com/manufacturers.html|https://www.hoseshop.com/adaptall-products-metric-adapters-the-hose-shop.html',
  },
]

/**
 * Every export domain `seated-v3` does not already carry, and what happened to
 * it. `seat` means it is in {@link SEAT}; everything else names the pool it
 * belongs to and why.
 *
 * **Read the geography verdicts against §5t.** The naive foreign filter cost 11
 * genuine US distributors — Ontario, *California*; a New Brunswick Ave in New
 * Jersey; "BC Fluid Power" in Kentucky — so precedence lets a complete US
 * state + ZIP settle the question first, and a record is only called non-US
 * when it has neither. Every route below clears that bar: `taylorfluid.com`
 * publishes three Canadian postal codes and no US ZIP; `connectallltd.com` is
 * filed `US / Plattsburgh NY` in the export and publishes exactly one address,
 * in Laval, Quebec. **The export's own `country` column is a claim, not a
 * verdict, and it is wrong in both directions.**
 */
export const EXPORT_VERDICTS = {
  'hoseshop.com': {
    disposition: 'seat',
    company_display: 'The Hose Shop, Inc.',
    reason: 'US industrial/hydraulic hose distributor, 3 NJ branches, own line card names 6 brands',
    evidence:
      'contact-us.html: Somerset NJ 08873 / Matawan NJ 07747 / Branchburg NJ 08876, "We are a global distributor with home offices in New Jersey"; manufacturers.html lists Adaptall, Dixon, Ingersoll Rand, Kuriyama, Stauff, Stucchi',
    source_url: 'https://www.hoseshop.com/contact-us.html',
  },
  'murdockindustrial.com': {
    disposition: 'duplicate-site',
    company_display: 'Murdock Industrial, Inc.',
    reason: 'same company as seated hosewarehouse.com — same apex owner, same Akron OH address',
    evidence:
      'seated hosewarehouse.com is Murdock Industrial at 553 Carroll St, Akron OH 44304, and its own source_url set already contains 18 murdockindustrial.com pages serving the identical catalog',
    source_url: 'https://murdockindustrial.com/pages/manufacturers-we-represent',
  },
  'taylorfluid.com': {
    disposition: 'non-us',
    company_display: 'Taylor Fluid Systems',
    reason: 'Ontario, Canada — three Canadian postal codes published, zero US state+ZIP',
    evidence:
      'homepage: "Serving the southwestern Ontario area since 1976", branches Stratford ON N5A 6S4 / London ON N5V 5E9 / Ajax ON L1S 3H2, "one of Canada\'s most comprehensive replacement parts suppliers"',
    source_url: 'https://www.taylorfluid.com/',
  },
  'connectallltd.com': {
    disposition: 'non-us',
    company_display: 'CONNECTALL LTÉE',
    reason:
      'Quebec, Canada — the export files it US/Plattsburgh NY, its own locations page publishes one address, in Laval QC',
    evidence:
      'title "CONNECTALL LTÉE: Industrial Products Distributor & Services in Quebec"; /locations/ lists exactly "Connectall, 1955 Bd Dagenais O, Laval, Quebec H7L 5R2, +1 514-335-7755". No US state+ZIP anywhere on the site. Also self-describes as a manufacturer of corrugated hose and expansion joints.',
    source_url: 'https://connectallltd.com/locations/',
  },
  'niagaraindustrial.com': {
    disposition: 'non-us',
    company_display: 'Niagara Industrial Supplies Ltd.',
    reason: 'St. Catharines, Ontario — Canadian postal code and a 905 area code',
    evidence: '606 Welland Ave, St. Catharines ON L2M 5V6, +1 905-684-6311 (export row); homepage serves a consent stub only',
    source_url: 'https://www.niagaraindustrial.com/locations/',
  },
  'greggdistributors.ca': {
    disposition: 'non-us',
    company_display: 'Gregg Distributors LP',
    reason: 'Edmonton, Alberta — .ca apex, 26 branches across AB/BC/SK',
    evidence: 'export evidence: "Canada\'s largest independent industrial distributor (~30 branches across AB/BC/SK/MB)"',
    source_url: 'https://greggdistributors.ca/',
  },
  'hydraline.ca': {
    disposition: 'non-us',
    company_display: 'Hydraline',
    reason: 'Brampton, Ontario — .ca apex, single ON branch',
    evidence: '145 Heart Lake Road South, Brampton ON L6W 3K3, +1 647-367-0084',
    source_url: 'https://hydraline.ca/about/',
  },
  'charleboistruckparts.com': {
    disposition: 'not-a-distributor',
    company_display: 'Charlebois Truck Parts',
    reason: 'automotive/truck parts, and the apex now points at a national chain',
    evidence:
      'www.charleboistruckparts.com is a CNAME to fleetpride.com; the export records the live site as dead since ~2021 and its 4 locations as a 2014 snapshot (evidence tier C)',
    source_url: 'https://www.fleetpride.com/',
  },
  'north-central-auto-parts': {
    disposition: 'not-a-distributor',
    company_display: 'NORTH CENTRAL AUTO PARTS',
    reason: 'automotive — an independent NAPA jobber, and not a domain but an Adaptall locator slug',
    evidence: 'Big Sandy MT 59520; the export resolves it to napaonline.com store 40276',
    source_url: 'https://www.napaonline.com/en/mt/big-sandy/store/40276',
  },
  'north-central-auto-parts-napa-auto-parts-big-sandy': {
    disposition: 'not-a-distributor',
    company_display: 'North Central Auto Parts (NAPA — Big Sandy)',
    reason: 'the same NAPA store, carried twice under two slugs',
    evidence: '78828 U.S. HWY 2, Big Sandy MT 59520, (406) 378-2280',
    source_url: 'https://www.napaonline.com/en/mt/big-sandy/store/40276',
  },
  'otpindustrial-solutions.com': {
    disposition: 'chain',
    company_display: 'OTP Industrial Solutions / OTC Industrial Technologies',
    reason: 'a 100+-branch national chain, and the apex is dead — the live one is otcindustrial.com',
    evidence:
      'NXDOMAIN on apex and www; 18 of its contacts are on otpnet.com or otcindustrial.com; the export\'s own company row reads "Ohio Transmission Corporation / OTP Industrial Solutions (now OTC Industrial Technologies), 100+"',
    source_url: 'https://www.otcindustrial.com/',
  },
  'oilairproducts.com': {
    disposition: 'segment-w',
    company_display: 'Oil Air Products',
    reason: 'no website and no reachable contact of any kind — a candidate, not a prospect',
    evidence:
      'NXDOMAIN on apex and www (verified against 8.8.8.8), zero Wayback snapshots ever, 11 alternate domains checked and dead; no address, phone or email could be sourced',
    source_url: 'emails/adaptall-data/data/distributor_companies.csv',
  },
  'prcindustrialsupply.com': {
    disposition: 'segment-w',
    company_display: 'PRC Industrial Supply',
    reason: 'no website and no verified address — a candidate, not a prospect',
    evidence: 'NXDOMAIN; Wayback holds only a 2014 parked page with no business content; the Portland/Westbrook ME addresses are unverified',
    source_url: 'emails/adaptall-data/data/distributor_companies.csv',
  },
  'big-sky-hydraulics-machining': {
    disposition: 'already-seated',
    company_display: 'BIG SKY HYDRAULICS & MACHINING',
    reason: 'an Adaptall locator slug, not a domain — the company is seated as bigskyhydraulics.com',
    evidence: 'Great Falls MT; seated row bigskyhydraulics.com = Big Sky Hydraulics & Machining Inc., 2315 10th St NE, Great Falls MT 59404, rank 59 / T2 / Segment A',
    source_url: 'https://www.bigskyhydraulics.com/',
  },
  'northern-hydraulics-inc': {
    disposition: 'already-pooled',
    company_display: 'NORTHERN HYDRAULICS INC',
    reason: 'an Adaptall locator slug — the company is northernhydraulics.net, already in pool-ranked-out-v7',
    evidence: 'Black Eagle MT 59414; pooled row northernhydraulics.net = Northern Hydraulics Inc., 2600 17th St NE, Black Eagle MT 59414',
    source_url: 'https://www.northernhydraulics.net/',
  },
  'hose-tech': {
    disposition: 'identity-backlog',
    company_display: 'Hose Tech',
    reason: 'named only in an Adaptall testimonial; multiple unrelated firms trade as "Hose Tech"',
    evidence: 'adaptall.com homepage testimonial "Dave P, Hose Tech"; no location or contact could be resolved',
    source_url: 'https://www.adaptall.com/',
  },
  hydraline: {
    disposition: 'identity-backlog',
    company_display: 'Hydraline',
    reason: 'a duplicate testimonial row for hydraline.ca, unresolved between three candidate entities',
    evidence: 'adaptall.com testimonial "Ian C, Hydraline"; candidates were Hydraline Engineering (UK), Hydraline Hose & Hydraulic (Palm City FL) and Northwest Hydra-Line',
    source_url: 'https://www.adaptall.com/',
  },
}
