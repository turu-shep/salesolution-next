import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/paid-acquisition/ § — where it fits in the engine.
 *
 * Paid Acquisition is the paid lane of Bring: it buys demand the day you need
 * it, while the slower Bring cylinders compound. Names the neighbours and links
 * them, plus a compact "what ships" strip.
 */

type Sibling = { name: string; role: string; href: string; soon?: boolean }

const SIBLINGS: Sibling[] = [
  {
    name: 'Local SEO & Maps',
    role: 'The organic version of the same nearby demand, earned instead of bought.',
    href: '/services/local-seo-maps/',
  },
  {
    name: 'Website Development',
    role: 'The fast page every paid click has to land on to convert.',
    href: '/services/website-development-design-services/',
  },
  {
    name: 'Answer & Book',
    role: 'Catches the calls the ads drive and books them before they cool off.',
    href: '/services/answer-and-book/',
  },
]

const SHIPS = [
  'Campaigns in your own Google + Meta accounts',
  'Zero markup on ad spend',
  'Keyword and audience research',
  'Ad creative and copy',
  'Landing-page alignment',
  'Cost-per-booked-job tracking + monthly report',
]

export function PaidAcqWhereItFits({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Where it fits
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The paid lane of Bring. Demand on demand.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Paid buys you demand the day you need it, while the slower Bring
          cylinders compound. It does its best work next to the cylinders around
          it:
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
        {SIBLINGS.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            data-cta={`paid-acq-sibling-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            data-cta-location="paid-acq-engine"
            className="group flex h-full flex-col bg-surface p-7 transition-colors hover:bg-paper"
          >
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
              <span aria-hidden className="h-1 w-1 rounded-full bg-brand-500" />
              {s.name}
              {s.soon && (
                <span className="ml-auto rounded-full border border-rule px-1.5 py-px text-[9px] font-medium tracking-[0.1em] text-ink-500">
                  Coming soon
                </span>
              )}
            </span>
            <p className="mt-3 leading-relaxed text-ink-700">{s.role}</p>
            <span
              aria-hidden
              className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-ink-900 transition-transform group-hover:translate-x-0.5"
            >
              {s.soon ? 'See the engine' : `See ${s.name}`} →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What ships
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {SHIPS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-ink-800">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-base leading-relaxed text-ink-600">
          Run it on its own, or as the paid lane of Bring inside the whole
          machine.{' '}
          <Link
            href="/revenue-engine/"
            data-cta="paid-acq-whole-engine"
            data-cta-location="paid-acq-engine"
            className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
          >
            See how the whole engine runs
          </Link>
          .
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          Run inside the Revenue Engine, it carries the day-90 guarantee.{' '}
          <Link
            href="/industries/home-services/"
            data-cta="paid-acq-guarantee"
            data-cta-location="paid-acq-engine"
            className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
          >
            See how it works on the home services page
          </Link>
          .
        </p>
      </div>
    </SectionRail>
  )
}
