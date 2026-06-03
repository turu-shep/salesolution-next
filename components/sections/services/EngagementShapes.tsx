import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { cn } from '@/lib/cn'

/**
 * Generic engagement shapes for the Services hub.
 *
 * Every service has three engagement shapes — Sprint, Operator Retainer,
 * Full Growth Ownership. The exact deliverables differ by service; the
 * shapes are the same. This is the generic, service-agnostic version
 * rendered on /services/ (the per-service EngagementModel takes a
 * `serviceColorKey` and is rendered on the individual service pages).
 */

type Shape = {
  key: 'sprint' | 'retainer' | 'composite'
  name: string
  cadence: string
  price: string
  forWhom: string
  body: React.ReactNode
  cta: { label: string; href: string; ctaToken: string }
  featured?: boolean
}

const SHAPES: Shape[] = [
  {
    key: 'sprint',
    name: 'Sprint',
    cadence: '4–6 weeks · fixed scope',
    price: '$9–35K',
    forWhom: '"Show me this works before we commit."',
    body: (
      <>
        Productized first engagement. Specific deliverables, fixed price,
        written SOW within 48 hours. Available on AI Search, Editorial
        Authority (as Pillar Pack), Website Development, Outbound Email.
      </>
    ),
    cta: {
      label: 'Book a strategy call',
      href: '/book-growth-call/',
      ctaToken: 'book_call__engagement_sprint',
    },
  },
  {
    key: 'retainer',
    name: 'Operator Retainer',
    cadence: 'Ongoing · quarterly review',
    price: '$4–15K / month',
    forWhom: '"We know we have the structural problem. Fix it."',
    featured: true,
    body: (
      <>
        Ongoing service execution. Direct Slack to the operator, monthly
        outcome reviews, no PMs in the middle. 3-month minimum.
      </>
    ),
    cta: {
      label: 'Book a strategy call',
      href: '/book-growth-call/',
      ctaToken: 'book_call__engagement_retainer',
    },
  },
  {
    key: 'composite',
    name: 'Full Growth Ownership',
    cadence: 'Multi-service · by scope',
    price: 'From $20K / month',
    forWhom: '"We need someone running our entire growth function."',
    body: (
      <>
        One operator across multiple services. Either Fractional GTM
        Engineer (full ownership) or 4-in-1 Coordinated Retainer (bundled
        execution). 3&ndash;6 month minimum.
      </>
    ),
    cta: {
      label: 'Get a quote',
      href: '/services/full-growth-ownership/',
      ctaToken: 'full_growth_ownership__engagement_card',
    },
  },
]

export function EngagementShapes({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How engagements are shaped
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three ways in.{' '}
          <span className="text-ink-500">Generic across services.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Every service has three engagement shapes. The exact deliverables
          differ by service; the shapes are the same.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {SHAPES.map((s) => (
          <li
            key={s.key}
            className={cn(
              'relative flex flex-col overflow-hidden border bg-surface transition-shadow duration-200',
              s.featured
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                : 'border-rule hover:border-ink-700',
            )}
          >
            {s.key === 'composite' && <CompositeBar weight="card" />}

            {s.featured && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-ink-900 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most engagements start here
              </span>
            )}

            <div className="border-b border-rule px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {s.cadence}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {s.name}
              </h3>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                {s.price}
              </p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-sm italic text-ink-500">{s.forWhom}</p>
              <p className="mt-4 text-sm text-ink-700">{s.body}</p>
            </div>

            <div className="border-t border-rule px-6 py-4">
              <Link
                href={s.cta.href}
                data-cta={s.cta.ctaToken}
                data-cta-location="mid_body"
                className={cn(
                  'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                  s.featured
                    ? 'bg-ink-900 text-white hover:bg-brand-600'
                    : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
                )}
              >
                {s.cta.label}
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
