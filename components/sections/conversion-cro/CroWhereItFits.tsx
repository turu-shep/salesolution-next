import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/conversion-cro/ § — where it fits in the engine.
 *
 * Conversion & CRO is a Convert cylinder: it keeps the demand the other
 * cylinders bring from leaking away at the last step. Names the neighbours and
 * links them, plus a compact "what ships" strip.
 */

type Sibling = { name: string; role: string; href: string }

const SIBLINGS: Sibling[] = [
  {
    name: 'Website Development',
    role: 'The site this optimizes. A rebuild when the bones are wrong, tuning when they are not.',
    href: '/services/website-development-design-services/',
  },
  {
    name: 'Answer & Book',
    role: 'The response side of Convert. Conversion fixes the page, this answers the call.',
    href: '/services/answer-and-book/',
  },
  {
    name: 'Paid Acquisition',
    role: 'The traffic this converts. No point buying clicks that leak at the form.',
    href: '/services/paid-acquisition/',
  },
]

const SHIPS = [
  'Funnel and drop-off analysis',
  'Quote, checkout, and form fixes',
  'A/B testing',
  'Follow-up automation',
  'Conversion tracking setup',
  'Monthly report on what moved',
]

export function CroWhereItFits({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Where it fits
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The Convert cylinder. It saves what the others bring in.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Getting traffic is only half the job. This is the part that keeps it
          from leaking away, so it sits next to the cylinders around it:
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
        {SIBLINGS.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            data-cta={`cro-sibling-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            data-cta-location="cro-engine"
            className="group flex h-full flex-col bg-surface p-7 transition-colors hover:bg-paper"
          >
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
              <span aria-hidden className="h-1 w-1 rounded-full bg-brand-500" />
              {s.name}
            </span>
            <p className="mt-3 leading-relaxed text-ink-700">{s.role}</p>
            <span
              aria-hidden
              className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-ink-900 transition-transform group-hover:translate-x-0.5"
            >
              See {s.name} →
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
          Run it on its own, or as the Convert step inside the whole machine.{' '}
          <Link
            href="/revenue-engine/"
            data-cta="cro-whole-engine"
            data-cta-location="cro-engine"
            className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
          >
            See how the whole engine runs
          </Link>
          .
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          Run inside the Revenue Engine, it carries the 120-day payback guarantee.{' '}
          <Link
            href="/industries/home-services/"
            data-cta="cro-guarantee"
            data-cta-location="cro-engine"
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
