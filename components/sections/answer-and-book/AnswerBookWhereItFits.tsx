import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/answer-and-book/ § — where it fits in the engine.
 *
 * Answer & Book is the Convert cylinder: it catches the demand the Bring
 * cylinders create and turns it into booked work. Names the neighbours and
 * links them, plus a compact "what ships" strip.
 */

type Sibling = { name: string; role: string; href: string; soon?: boolean }

const SIBLINGS: Sibling[] = [
  {
    name: 'Local SEO & Maps',
    role: 'Makes the phone ring. The map pack and “near me” searches that send you the call.',
    href: '/services/local-seo-maps/',
  },
  {
    name: 'Website Development',
    role: 'The site that turns a visit into the call or the form in the first place.',
    href: '/services/website-development-design-services/',
  },
  {
    name: 'Recover & Reactivate',
    role: 'Picks up anyone who still slips through. Cold quotes and quiet customers, chased.',
    href: '/revenue-engine/',
    soon: true,
  },
]

const SHIPS = [
  '24/7 live call answering',
  'Instant missed-call text-back',
  'Online booking onto your calendar',
  'Lead qualification + spam filtering',
  'Automatic appointment reminders',
  'Call recording, transcripts, and a single inbox',
]

export function AnswerBookWhereItFits({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Where it fits
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The Convert cylinder. It catches what the others bring in.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Getting found is only half the job. Answer &amp; Book is the part of the
          engine that turns a ring into a booking. It works hardest next to the
          cylinders around it:
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
        {SIBLINGS.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            data-cta={`answer-book-sibling-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            data-cta-location="answer-book-engine"
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
          Run it on its own, or as the Convert step inside the whole machine.{' '}
          <Link
            href="/revenue-engine/"
            data-cta="answer-book-whole-engine"
            data-cta-location="answer-book-engine"
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
