import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import type { ServiceKey } from '@/components/services/service-colors'

/**
 * /services/full-growth-ownership/ § 4 — Five services. One accountable owner.
 *
 * A 5-segment composite bar (the visual signature for Full Growth
 * Ownership) sits at the top of the section. Each segment is colored with
 * the service color from the spec § 7.1. Below it: short paragraphs per
 * service describing how they fit inside this engagement.
 *
 * Colors are inlined here rather than added to tailwind config — these
 * are accent identity only, used in this one place. Section 7 of the spec
 * will roll them out site-wide as a later phase.
 */

type Service = {
  key: string
  serviceKey: Exclude<ServiceKey, 'composite'>
  name: string
  color: string
  description: React.ReactNode
}

const SERVICES: Service[] = [
  {
    key: 'ai-search',
    serviceKey: 'search',
    name: 'AI Search & GEO',
    color: '#1E3A8A',
    description: (
      <>
        Schema rewrites, citation engineering, AIO-aware paid acceleration.
        The core practice &mdash; most engagements lean here first.
      </>
    ),
  },
  {
    key: 'editorial',
    serviceKey: 'editorial',
    name: 'Editorial Authority',
    color: '#C2410C',
    description: (
      <>
        Pillar pages, cluster posts, engineering Q&amp;A hubs, category-level
        content. Built to be cited, not just published.
      </>
    ),
  },
  {
    key: 'catalog',
    serviceKey: 'catalog',
    name: 'Catalog AI',
    color: '#0E7490',
    description: (
      <>
        Product page rewrites at scale. Per-product schema, internal linking
        graph, AIO-citable FAQ blocks. Conversion + citation in one pass.
      </>
    ),
  },
  {
    key: 'website',
    serviceKey: 'dev',
    name: 'Website Development',
    color: '#374151',
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
    color: '#15803D',
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
          Every service. <span className="text-ink-500">Coordinated under one roof.</span>
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

      {/* Composite color bar — the visual signature of "all five services as one" */}
      <div
        role="img"
        aria-label="Five-service composite bar"
        className="mt-12 flex h-3 overflow-hidden rounded-[2px]"
      >
        {SERVICES.map((s) => (
          <span
            key={s.key}
            className="flex-1"
            style={{ backgroundColor: s.color }}
          />
        ))}
      </div>

      <ul className="mt-12 grid gap-px border border-rule bg-rule md:grid-cols-2 lg:grid-cols-5">
        {SERVICES.map((s) => (
          <li key={s.key} className="flex flex-col bg-paper p-6">
            <span
              aria-hidden
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: s.color }}
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

      <CompositeBar weight="divider" className="mt-12 ml-auto max-w-[180px]" />
    </SectionRail>
  )
}
