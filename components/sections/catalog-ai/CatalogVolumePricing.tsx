import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § 3b — Volume tier breakdowns.
 *
 * Three compact tables (Standard / Pro / Enterprise) showing how price
 * per SKU breaks at 10K and 50K, plus the ongoing-maintenance rates.
 * Lives just below `CatalogTiers` so prospects can do their own ROI math
 * without leaving the page.
 */

type Row = { volume: string; price: string; min: string }

type Tier = {
  name: string
  rows: Row[]
  maintenance: { newSku: string; quarterly: string }
}

const STANDARD: Tier = {
  name: 'Standard',
  rows: [
    { volume: '1,000 – 9,999 SKUs',   price: '$3.00 / SKU', min: '$3,000' },
    { volume: '10,000 – 49,999 SKUs', price: '$2.50 / SKU', min: '$25,000' },
    { volume: '50,000+ SKUs',         price: '$2.00 / SKU', min: '$100,000' },
  ],
  maintenance: {
    newSku: '$1.00 / SKU · 48h turnaround',
    quarterly: '25% of tier price per SKU per quarter',
  },
}

const PRO: Tier = {
  name: 'Pro',
  rows: [
    { volume: '1,000 – 9,999 SKUs',   price: '$7.00 / SKU', min: '$7,000' },
    { volume: '10,000 – 49,999 SKUs', price: '$6.00 / SKU', min: '$60,000' },
    { volume: '50,000+ SKUs',         price: '$5.00 / SKU', min: '$250,000' },
  ],
  maintenance: {
    newSku: '$2.50 / SKU · 48h turnaround',
    quarterly: '25% of tier price per SKU per quarter (includes prompt tuning)',
  },
}

const ENTERPRISE: Tier = {
  name: 'Enterprise',
  rows: [
    { volume: '50,000 – 99,999 SKUs',   price: '$15,000 / mo', min: '$5.00 / SKU initial' },
    { volume: '100,000 – 249,999 SKUs', price: '$25,000 / mo', min: '$4.00 / SKU initial' },
    { volume: '250,000+ SKUs',          price: '$50,000+ / mo', min: 'Custom initial' },
  ],
  maintenance: {
    newSku: 'Included in monthly retainer',
    quarterly: 'Continuous re-optimization included',
  },
}

const TIERS: Tier[] = [STANDARD, PRO, ENTERPRISE]

export function CatalogVolumePricing() {
  return (
    <SectionRail tone="surface">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Volume pricing
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Per-SKU rates. Volume breaks at 10K and 50K.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Pricing is the same shape across all three tiers: per-SKU base
          rate, lower per-SKU as catalog size grows, separate line for
          ongoing maintenance.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col border border-rule bg-surface"
          >
            <div className="border-b border-rule px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Tier
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
                {tier.name}
              </h3>
            </div>

            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                {tier.name} per-SKU pricing by catalog volume.
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="border-b border-rule px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
                  >
                    Volume
                  </th>
                  <th
                    scope="col"
                    className="border-b border-rule px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
                  >
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {tier.rows.map((row) => (
                  <tr key={row.volume}>
                    <td className="border-b border-rule px-5 py-3 align-top">
                      <p className="text-ink-900">{row.volume}</p>
                      <p className="mt-1 font-mono text-[11px] text-ink-500">
                        Min: {row.min}
                      </p>
                    </td>
                    <td className="border-b border-rule px-5 py-3 text-right align-top font-display font-semibold tabular-nums text-ink-900">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-rule bg-paper px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Ongoing maintenance
              </p>
              <dl className="mt-2 space-y-2 text-sm">
                <div>
                  <dt className="text-ink-500">New SKUs</dt>
                  <dd className="text-ink-900">{tier.maintenance.newSku}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Quarterly re-optimization</dt>
                  <dd className="text-ink-900">{tier.maintenance.quarterly}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>
    </SectionRail>
  )
}
