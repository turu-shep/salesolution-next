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
}

const COMBINATIONS: Combination[] = [
  {
    services: ['search', 'editorial'],
    label: 'AI Search + Editorial Authority',
    fit: 'You want to win Google rankings and AI-answer mentions',
  },
  {
    services: ['search', 'catalog'],
    label: 'AI Search + Catalog AI',
    fit: 'Distributor with 5K+ SKUs needs both layers fixed',
  },
  {
    services: ['editorial', 'catalog'],
    label: 'Editorial Authority + Catalog AI',
    fit: 'Content at both levels: category pages and every product',
  },
  {
    services: ['dev', 'search'],
    label: 'Website Dev + AI Search (post-launch)',
    fit: 'Replatform with ongoing optimization',
  },
  {
    services: ['outbound', 'search', 'editorial'],
    label: 'Outbound + AI Search + Editorial',
    fit: 'Outreach that lands because buyers can already find you',
  },
  {
    services: ['composite'],
    label: 'The whole engine',
    fit: 'Full growth function with one operator',
  },
]

export function HowServicesCombine({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          One machine, not a menu
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The parts hand off to each other.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-700">
          <p>
            Buying one part gets you about 60% of the result it could. The
            other 40% comes from the handoffs: catalog content linking to
            editorial pillars, machine-readable product data feeding outbound
            research, AI search work compounding with the pages your writers
            publish. Most of the leaks live exactly where two parts should hand
            off and don&rsquo;t.
          </p>
          <p>
            Six vendors, no accountability. That&rsquo;s the usual setup, and
            none of them owns the handoff. We run the parts as one engine, with
            one operator who reads both revenue lines and re-aims the weakest
            part each cycle.
          </p>
        </div>
      </div>

      <div className="mt-12 overflow-x-auto border border-rule bg-surface">
        <table className="w-full min-w-[560px] border-collapse text-left">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionRail>
  )
}
