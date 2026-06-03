import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { cn } from '@/lib/cn'

/**
 * /services/full-growth-ownership/ § 3 — Two shapes.
 *
 * Side-by-side cards: Shape A (Fractional GTM Engineer) and Shape B
 * (Coordinated Retainer). Equal visual weight — buyer self-routes on Q1
 * of the qualifier. Both CTAs link to /contact-me/ (the quote intake
 * lives there until the dedicated qualifier form ships).
 */

type Shape = {
  key: 'fractional' | 'retainer'
  badge: string
  name: string
  price: string
  minimum: string
  body: React.ReactNode
  fit: React.ReactNode
  cta: { label: string; href: string }
}

const SHAPES: Shape[] = [
  {
    key: 'fractional',
    badge: 'Shape A',
    name: 'Fractional GTM Engineer',
    price: 'From $20K / month',
    minimum: '6-month minimum',
    body: (
      <>
        One operator embedded in your leadership. Sets growth strategy
        with you. Owns execution across all services. Sits in your weekly
        meetings, reviews your numbers in your dashboards, ships work on
        your timelines.
      </>
    ),
    fit: (
      <>
        $5&ndash;25M ARR companies with no current marketing / growth
        lead, currently spending $15&ndash;30K/mo across multiple
        agencies, looking for one accountable owner.
      </>
    ),
    cta: { label: 'Get a quote', href: '/contact-me/' },
  },
  {
    key: 'retainer',
    badge: 'Shape B',
    name: '4-in-1 Coordinated Retainer',
    price: 'From $12K / month',
    minimum: '3-month minimum',
    body: (
      <>
        Bundled execution across 2&ndash;5 services. Your team runs
        strategic decisions; our team runs the execution. Coordinated
        under one operator so the pieces actually compound.
      </>
    ),
    fit: (
      <>
        Companies with existing marketing leadership who want one vendor
        coordinating AI search, content, outbound, dev, and catalog
        work &mdash; instead of stitching five separate agencies together.
      </>
    ),
    cta: { label: 'Get a quote', href: '/contact-me/' },
  },
]

export function FullGrowthShapes({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <CompositeBar weight="divider" className="mb-6 max-w-[120px]" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How to engage
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Two shapes. <span className="text-ink-500">Pick the one that fits.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Same engagement model, two different operating shapes. Question
          one of the qualifier form routes you to the right one before the
          first call.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2">
        {SHAPES.map((s) => (
          <li
            key={s.key}
            className={cn(
              'relative flex flex-col border border-rule bg-surface transition-colors duration-200 hover:border-ink-700',
            )}
          >
            <div className="border-b border-rule px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {s.badge} &middot; {s.minimum}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {s.name}
              </h3>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                {s.price}
              </p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-ink-700">{s.body}</p>

              <div className="mt-6 border-l-2 border-ink-300 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Best for
                </p>
                <p className="mt-2 text-sm text-ink-700">{s.fit}</p>
              </div>
            </div>

            <div className="border-t border-rule px-6 py-4">
              <Link
                href={s.cta.href}
                data-cta={`full_growth_${s.key}__shape_card`}
                data-cta-location="mid_body"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
              >
                {s.cta.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Not sure which shape fits? Pick &ldquo;Not sure &mdash; would like
        to discuss both&rdquo; on the qualifier and we&rsquo;ll work it out
        on the first call.
      </p>
    </SectionRail>
  )
}
