import type { Counters as CountersType } from '@/lib/contacts'

/**
 * Exactly three counters — Locations shown · Brands covered · States covered —
 * recomputing with every filter change (AMENDMENT 2 D3 / C-G4). The companies,
 * people and sendable figures are discarded server-side and have no element
 * here to land in. `counters` is null when the data source is unreachable; the
 * labels still render, with an em dash where a number would mislead.
 *
 * "Brands covered" counts distinct CARRIED brands/lines (brand_tokens, from
 * the line-card data) since 0005 — NOT distinct source tokens. Counting
 * sources as brands was the founder-rejected conflation (v2 amendment); the
 * caption below must always say what the number actually is.
 */

const fmt = (n: number | undefined) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

export function Counters({ counters }: { counters: CountersType | null }) {
  return (
    <>
      <ul className="counters">
        <li><b>{fmt(counters?.locations)}</b><span>Locations shown — rows in the current filter</span></li>
        <li><b>{fmt(counters?.brands)}</b><span>Brands covered — distinct brands/lines carried in the current filter</span></li>
        <li><b>{fmt(counters?.states)}</b><span>States covered — distinct non-empty states</span></li>
      </ul>
      <p className="footnote">
        A row is one address record, and rows were deduped by domain — &ldquo;locations shown&rdquo; is the number of
        records we hold, not necessarily the number of physical branches. The Locations column is each company&rsquo;s own
        claim and is a different number. Size is our estimate from public signals, not the company&rsquo;s figure; the
        Type column is estimated the same way.
      </p>
    </>
  )
}
