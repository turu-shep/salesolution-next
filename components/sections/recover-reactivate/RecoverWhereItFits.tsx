import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/recover-reactivate/ § — where it fits in the engine.
 *
 * Recover & Reactivate is the Retain cylinder: it squeezes the demand you
 * already earned instead of paying to bring in more. Names the neighbours and
 * links them, plus a compact "what ships" strip.
 */

type Sibling = { name: string; role: string; href: string }

const SIBLINGS: Sibling[] = [
  {
    name: 'Answer & Book',
    role: 'Books the revived quote or returning customer the moment they say yes.',
    href: '/services/answer-and-book/',
  },
  {
    name: 'Reviews & Reputation',
    role: 'Turns the customers you win back into the reviews that win the next one.',
    href: '/services/reviews-reputation/',
  },
  {
    name: 'Outbound Email',
    role: 'The cold-list version of this. Recover works your own list, outbound reaches new buyers.',
    href: '/services/outbound-email-marketing-services/',
  },
]

const SHIPS = [
  'Cold-quote follow-up automation',
  'Dormant-list reactivation campaigns',
  'Win-back offers and sequences',
  'List cleanup and segmentation',
  'Revived-revenue tracking',
  'Monthly report',
]

export function RecoverWhereItFits({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Where it fits
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The Retain cylinder. The cheapest revenue you have.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Bringing in new demand is expensive. This squeezes the demand you
          already earned, so it sits next to the cylinders around it:
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
        {SIBLINGS.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            data-cta={`recover-sibling-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            data-cta-location="recover-engine"
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
          Run it on its own, or as the Retain step inside the whole machine.{' '}
          <Link
            href="/revenue-engine/"
            data-cta="recover-whole-engine"
            data-cta-location="recover-engine"
            className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
          >
            See how the whole engine runs
          </Link>
          .
        </p>
      </div>
    </SectionRail>
  )
}
