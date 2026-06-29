import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import { SERVICES, type ServiceKey } from '@/components/services/service-colors'

/**
 * "Where does your system start?" entry-point list.
 *
 * One way into the same machine, framed as "If you..." prompts. Each row
 * routes to a built cylinder page with a colored dot on either side so the
 * eye can thread from the situation to the cylinder that fires first.
 */

type Row = {
  key: ServiceKey
  situation: string
  serviceName: string
  href: string
}

const ROWS: Row[] = [
  {
    key: 'search',
    situation: 'My organic traffic is dropping because of AI Overviews',
    serviceName: SERVICES.search.name,
    href: SERVICES.search.href,
  },
  {
    key: 'catalog',
    situation:
      'My product catalog has 1,000+ SKUs and the descriptions are weak',
    serviceName: SERVICES.catalog.name,
    href: SERVICES.catalog.href,
  },
  {
    key: 'editorial',
    situation:
      "I'm not ranking on informational queries or not getting cited",
    serviceName: SERVICES.editorial.name,
    href: SERVICES.editorial.href,
  },
  {
    key: 'dev',
    situation:
      'My site is slow, on a dying platform, or needs to be replatformed',
    serviceName: SERVICES.dev.name,
    href: SERVICES.dev.href,
  },
  {
    key: 'outbound',
    situation:
      "I need predictable pipeline and don't have an outbound motion",
    serviceName: SERVICES.outbound.name,
    href: SERVICES.outbound.href,
  },
  {
    key: 'composite',
    situation:
      'I have multiple of the above and want one operator to handle it all',
    serviceName: 'Full Growth Ownership',
    href: '/services/full-growth-ownership/',
  },
]

export function PickAService({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          One machine, one way in
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Where does your system start?
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          You don&rsquo;t pick one service and stop. You pick the part that fixes
          the loudest leak first, then add the rest as it earns the next step.
          Find your situation below.
        </p>
      </div>

      <ul className="mt-12 divide-y divide-rule border-y border-rule">
        {ROWS.map((row) => (
          <li key={row.key}>
            <Link
              href={row.href}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 transition-colors duration-200 hover:bg-paper sm:gap-6 sm:py-6"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                <ServiceColorDot service={row.key} />
              </span>

              <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                <p className="text-base italic text-ink-500 sm:text-lg">
                  If you&hellip; {row.situation}
                </p>
                <p className="font-display text-base font-semibold text-ink-900 sm:text-lg">
                  Fire first:{' '}
                  <span className="underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                    {row.serviceName}
                  </span>
                </p>
              </div>

              <span
                aria-hidden
                className="font-display text-lg text-ink-400 transition-colors duration-200 group-hover:text-brand-600"
              >
                &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
