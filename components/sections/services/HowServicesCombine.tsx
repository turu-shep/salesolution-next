import { SectionRail } from '@/components/layout/SectionRail'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import type { ServiceKey } from '@/components/services/service-colors'

/**
 * Cross-service combinations table.
 *
 * Most engagements combine two or three services. This table makes the
 * common pairings explicit with service-color dots inline in each
 * combination cell so the reader can scan which colors pair.
 */

type Combination = {
  services: ServiceKey[]
  label: string
  fit: string
  spend: string
}

const COMBINATIONS: Combination[] = [
  {
    services: ['search', 'editorial'],
    label: 'AI Search + Editorial Authority',
    fit: 'Brand wants to win organic + AIO citation share',
    spend: '$13–22K / mo',
  },
  {
    services: ['search', 'catalog'],
    label: 'AI Search + Catalog AI',
    fit: 'Distributor with 5K+ SKUs needs both layers fixed',
    spend: '$11–22K / mo (catalog initial as project + ongoing)',
  },
  {
    services: ['editorial', 'catalog'],
    label: 'Editorial Authority + Catalog AI',
    fit: 'Two-layer content strategy (category + product)',
    spend: '$11–22K / mo',
  },
  {
    services: ['dev', 'search'],
    label: 'Website Dev + AI Search (post-launch)',
    fit: 'Replatform with ongoing optimization',
    spend: 'Build project + $8–14K / mo',
  },
  {
    services: ['outbound', 'search', 'editorial'],
    label: 'Outbound + AI Search + Editorial',
    fit: 'Pipeline motion supported by visible expertise',
    spend: '$20–32K / mo',
  },
  {
    services: ['composite'],
    label: 'All 5 services',
    fit: 'Full growth function with one operator',
    spend: 'Full Growth Ownership pricing',
  },
]

export function HowServicesCombine({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Cross-service compounding
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Most engagements combine two or three services.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-700">
          <p>
            The unspoken truth of marketing-services pricing is that buying
            one service often produces 60% of the result it could. The other
            40% comes from cross-service compounding &mdash; catalog content
            linking to editorial pillars, schema feeding outbound prospect
            research, AI search optimization compounding with the citation
            work writers produce.
          </p>
          <p>
            Most agencies don&rsquo;t have all five capabilities in-house, so
            they pretend cross-service work doesn&rsquo;t matter. We&rsquo;re
            priced and structured around it.
          </p>
        </div>
      </div>

      <div className="mt-12 overflow-x-auto border border-rule bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-rule bg-paper">
              <th
                scope="col"
                className="px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
              >
                Combination
              </th>
              <th
                scope="col"
                className="px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
              >
                When this fits
              </th>
              <th
                scope="col"
                className="px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
              >
                Typical monthly spend
              </th>
            </tr>
          </thead>
          <tbody>
            {COMBINATIONS.map((c) => (
              <tr
                key={c.label}
                className="border-b border-rule last:border-b-0 align-top"
              >
                <td className="px-5 py-5">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 flex shrink-0 items-center gap-1">
                      {c.services.map((s) => (
                        <ServiceColorDot key={s} service={s} />
                      ))}
                    </span>
                    <span className="font-display text-base font-semibold text-ink-900">
                      {c.label}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-5 text-sm text-ink-700">{c.fit}</td>
                <td className="px-5 py-5 text-sm font-medium tabular-nums text-ink-900">
                  {c.spend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionRail>
  )
}
