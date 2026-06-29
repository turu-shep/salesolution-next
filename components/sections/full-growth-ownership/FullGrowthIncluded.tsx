import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import { SERVICE_CLASSES, type ServiceKey } from '@/components/services/service-colors'

/**
 * /services/full-growth-ownership/ § 4 — Five services. One accountable owner.
 *
 * The 5-segment composite bar is the shared brand signature — rendered by
 * the canonical <CompositeBar> so its color ORDER stays identical to the
 * hero strip and the tier cards (search, catalog, editorial, dev, outbound).
 * The legend dots and card-top accents pull from the same SERVICE_CLASSES
 * token map, so there's no hardcoded hex and nothing can drift out of sync.
 *
 * SERVICES is intentionally listed in that same canonical order so the
 * legend, the bar, and the cards all read left-to-right the same way.
 */

type Service = {
  key: string
  serviceKey: Exclude<ServiceKey, 'composite'>
  name: string
  description: React.ReactNode
}

const SERVICES: Service[] = [
  {
    key: 'ai-search',
    serviceKey: 'search',
    name: 'AI Search & GEO',
    description: (
      <>
        Schema rewrites, citation engineering, AIO-aware paid acceleration.
        The core practice &mdash; most engagements lean here first.
      </>
    ),
  },
  {
    key: 'catalog',
    serviceKey: 'catalog',
    name: 'Catalog AI',
    description: (
      <>
        Product page rewrites at scale. Per-product schema, internal linking
        graph, AIO-citable FAQ blocks. Conversion + citation in one pass.
      </>
    ),
  },
  {
    key: 'editorial',
    serviceKey: 'editorial',
    name: 'Editorial Authority',
    description: (
      <>
        Pillar pages, cluster posts, engineering Q&amp;A hubs, category-level
        content. Built to be cited, not just published.
      </>
    ),
  },
  {
    key: 'website',
    serviceKey: 'dev',
    name: 'Website Development',
    description: (
      <>
        Performance-engineered builds and replatforms. Core Web Vitals
        committed in the SOW, schema baked in, you own the code.
      </>
    ),
  },
  {
    key: 'outbound',
    serviceKey: 'outbound',
    name: 'Outbound Email',
    description: (
      <>
        Deliverability-first cold outbound. Multi-touch sequences with
        branching logic, hand-built lists, reply-quality reporting.
      </>
    ),
  },
]

export function FullGrowthIncluded({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What&rsquo;s included
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Every service. Coordinated under one roof.
        </h2>
      </div>

      {/* Services-we-run strip — five colored dots + names making "all services coordinated" visually concrete */}
      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-700">
        {SERVICES.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-2">
            <ServiceColorDot service={s.serviceKey} />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>

      {/* Composite color bar — the shared brand signature. Rendered by the
          canonical component so the segment order matches the hero + tier
          cards exactly (search, catalog, editorial, dev, outbound). */}
      <CompositeBar weight="hero" className="mt-12 overflow-hidden rounded-[2px]" />

      <ul className="mt-12 grid gap-px border border-rule bg-rule md:grid-cols-2 lg:grid-cols-5">
        {SERVICES.map((s) => (
          <li key={s.key} className="flex h-full flex-col bg-paper p-6">
            <span
              aria-hidden
              className={`h-1 w-10 rounded-full ${SERVICE_CLASSES[s.serviceKey].dot}`}
            />
            <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink-900">
              {s.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              {s.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm italic text-ink-500">
        You probably don&rsquo;t need all five. The qualifier helps us
        figure out which combination fits &mdash; and we&rsquo;ll tell you
        on the first call if Full Growth Ownership isn&rsquo;t the right
        shape for your situation.
      </p>
    </SectionRail>
  )
}
