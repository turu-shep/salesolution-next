/**
 * dupsite — one site living on two domains, found through the SKU estimator.
 *
 * ## Where this came from
 *
 * The full-enrichment report flagged that two pairs of distinct domains returned
 * **byte-identical** SKU estimates — `shingle.com`/`walkerindustrial.com` at
 * 538,210 and `bevsupplies.com`/`hosemanufacturing.com` at 59,681 — and called
 * it "a dedupe signal for the list-side agent." It is, but the naive form of the
 * sweep is useless and measurement says so: grouping seated domains on
 * `(sku_estimate, ecommerce_class, brand set)` returns **348 groups covering
 * 5,667 domains**, because `sku_estimate = 14` collides fifty-one ways by
 * arithmetic alone. A rule that flags a quarter of the pool is not a signal.
 *
 * ## What actually discriminates
 *
 * Two things, and both are measured rather than asserted:
 *
 * **1. The whole sitemap fingerprint, not the estimate.** The estimate is one
 * number derived from four — URLs seen, product URLs, child sitemaps, sitemap
 * kind. Two genuinely different catalogues agreeing on all of them is a
 * different order of coincidence from agreeing on a small integer. Tightening
 * the key to the full fingerprint takes 348 groups to 175.
 *
 * **2. `sitemap_extrapolated` is a manufactured number and must be excluded.**
 * `catalog_sitemap.py` extrapolates when children remain unfetched:
 * `product_total + mean × remaining`. Two sites that both sampled 8 of 39
 * children and both saturated the URL counting cap produce the *same* synthetic
 * estimate without sharing a byte. **That is exactly what `shingle.com` and
 * `walkerindustrial.com` are** — both `sitemap_index_extrapolated`,
 * `sku_confidence: low`, `children_total: 39`, `children_fetched: 8`,
 * `sitemap_urls_seen: 360000`. They are two different companies (Shingle & Gibb
 * Automation; Walker Industrial Products) reading 3 and 19 brands respectively.
 * **The report's first example is an estimator artifact, not a duplicate site.**
 *
 * ## The rule that ships
 *
 * A fingerprint match, on a NON-extrapolated estimate, plus one corroborator:
 *
 *   D1  `sku_estimate >= 50` — at that magnitude an exact tie on four
 *       independent counts is not arithmetic coincidence.
 *   D2  domain-label kinship — a shared ≥6-character stem, or one label
 *       containing the other. Catches `deltafastener`/`deltafasteners`,
 *       `opta-group`/`optagroupllc`, and the 40-domain `forkliftparts<city>`
 *       doorway network at `sku_estimate = 8`, where D1 alone sees nothing.
 *   D3  a shared `phone_e164` — the primary join key, on records the domain and
 *       name keys both missed.
 *
 * **Nothing is deleted.** The group keeps its best-evidenced member seated; the
 * rest take `disposition: duplicate-site` and a `dup_of` pointer, and land in a
 * side pool like every other routed record.
 *
 * Tests: emails/scripts/lib/dupsite.test.mjs
 */

/**
 * D0 — two seated rows on the SAME apex domain.
 *
 * The certain case, and the one that matters most operationally: the domain is
 * the send key, so four rows on `rg-group.com` are four emails to one inbox
 * however independent the four businesses are. Measured on the ranked pool it
 * is 139 domains carrying 302 rows — divisions, dba names and acquired brands
 * the §3.4 branch rollup could not collapse because their published names do
 * not normalize together: "Wholesale Pump and Supply, Inc" / "Wholesale Pumps &
 * Supply" / "Wholesale Pump & Supply Inc"; "Alpine Bearing Company, LLC" /
 * "ALPINE BEARING WEST INC" / "ALPINE BEARING CO INC".
 *
 * §5c's warning still binds and is why this collapses rather than blocks:
 * `theprontonetwork.com` carried thirteen genuinely independent companies on a
 * buying-group site, and blanket-blocking the domain would have been wrong. So
 * the domain keeps its best-evidenced row and the rest are routed with a
 * `dup_of` pointer, not deleted.
 *
 * @param {{domain?: string|null}[]} records
 * @returns {{key: string, rule: 'D0', domains: string[], sku: number, rows: object[]}[]}
 */
export function sameApexGroups(records) {
  const byDomain = new Map()
  for (const r of records) {
    if (!r.domain) continue
    if (!byDomain.has(r.domain)) byDomain.set(r.domain, [])
    byDomain.get(r.domain).push(r)
  }
  return [...byDomain.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([domain, rows]) => ({ key: `apex#${domain}`, rule: /** @type {'D0'} */ ('D0'), domains: [domain], sku: 0, rows }))
    .sort((a, b) => b.rows.length - a.rows.length)
}

/** D1's magnitude floor. Below it, an exact tie is arithmetic, not identity. */
export const SKU_COINCIDENCE_FLOOR = 50
/** D2's shared-stem length. Five characters matches "delta"; six is the floor. */
export const KINSHIP_STEM = 6

const label = (domain) => String(domain ?? '').split('.')[0].replace(/[^a-z0-9]/g, '')

/**
 * Do two domain labels share enough to be one operator's estate?
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function labelKinship(a, b) {
  const x = label(a)
  const y = label(b)
  if (!x || !y || x === y) return false
  const n = Math.min(x.length, y.length)
  let i = 0
  while (i < n && x[i] === y[i]) i++
  if (i >= KINSHIP_STEM) return true
  if (y.length >= KINSHIP_STEM && x.includes(y)) return true
  if (x.length >= KINSHIP_STEM && y.includes(x)) return true
  return false
}

/**
 * The fingerprint. `null` when the record cannot carry one — no estimate, a
 * zero estimate (which every brochure site shares), or an extrapolated one.
 *
 * @param {Record<string, any>|null|undefined} e a catalog enrichment record
 * @returns {string|null}
 */
export function fingerprint(e) {
  if (!e) return null
  // `== null` and not `!e.sku_estimate`: a measured 0 is a legitimate value and
  // it is excluded HERE for being uninformative, not for being falsy. Writing
  // it as `!e.sku_estimate` would hide the reason. (§5l's `??`-on-zero class.)
  if (e.sku_estimate == null) return null
  if (e.sku_estimate === 0) return null
  if (e.sitemap_extrapolated === true) return null
  if (e.sitemap_urls_seen == null) return null
  return [
    e.sku_estimate,
    e.sitemap_urls_seen,
    e.sitemap_product_urls,
    e.sitemap_children_total ?? '',
    e.sitemap_kind ?? '',
    e.ecommerce_class ?? '',
  ].join('#')
}

/**
 * Find the duplicate-site groups in a seated population.
 *
 * @param {{domain: string, phone_e164?: string|null}[]} records one per domain
 * @param {Map<string, Record<string, any>>} enrichment domain → catalog record
 * @returns {{key: string, rule: 'D1'|'D2'|'D3', domains: string[], sku: number}[]}
 */
export function duplicateSiteGroups(records, enrichment) {
  const byFingerprint = new Map()
  const byDomain = new Map()
  for (const r of records) {
    if (!r.domain || byDomain.has(r.domain)) continue
    byDomain.set(r.domain, r)
    const fp = fingerprint(enrichment.get(r.domain))
    if (!fp) continue
    if (!byFingerprint.has(fp)) byFingerprint.set(fp, [])
    byFingerprint.get(fp).push(r.domain)
  }

  const out = []
  for (const [key, domains] of byFingerprint) {
    if (domains.length < 2) continue
    const sku = Number(key.split('#')[0])
    if (sku >= SKU_COINCIDENCE_FLOOR) {
      out.push({ key, rule: 'D1', domains, sku })
      continue
    }
    let kin = false
    for (let i = 0; i < domains.length && !kin; i++)
      for (let j = i + 1; j < domains.length && !kin; j++)
        if (labelKinship(domains[i], domains[j])) kin = true
    if (kin) {
      out.push({ key, rule: 'D2', domains, sku })
      continue
    }
    const phones = domains.map((d) => byDomain.get(d)?.phone_e164).filter(Boolean)
    if (phones.length > 1 && new Set(phones).size < phones.length)
      out.push({ key, rule: 'D3', domains, sku })
  }
  return out.sort((a, b) => b.domains.length - a.domains.length || b.sku - a.sku)
}
