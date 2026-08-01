import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/local-seo-maps/ § — where it fits in the engine.
 *
 * Local SEO & Maps is a Bring cylinder: it creates the local demand the rest of
 * the engine converts and keeps. Names the neighbours and links them, plus a
 * compact "what ships" strip.
 */

type Sibling = { name: string; role: string; href: string; soon?: boolean }

const SIBLINGS: Sibling[] = [
  {
    name: 'Answer & Book',
    role: 'Catches the calls the map sends you, around the clock, and books them before they call the next name.',
    href: '/services/answer-and-book/',
  },
  {
    name: 'AI Search & GEO',
    role: 'Gets you named in the AI answers buyers ask before they ever open a map.',
    href: '/services/ai-seo/',
  },
  {
    name: 'Website Development',
    role: 'The fast, search-ready site the map listing sends people to once they tap through.',
    href: '/services/website-development-design-services/',
  },
]

const SHIPS = [
  'Google Business Profile setup + optimization',
  'Local and service-area landing pages',
  'Automated review generation',
  'Citation and NAP cleanup',
  'Map-pack and local rank tracking',
  'A monthly local-search report',
]

export function LocalSeoWhereItFits({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Where it fits
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The Bring cylinder. It feeds the rest of the engine.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          It puts you in front of buyers who are already looking nearby. That demand
          only pays off if the cylinders around it catch and keep it, so it sits
          right next to them:
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-3">
        {SIBLINGS.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            data-cta={`local-seo-sibling-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
            data-cta-location="local-seo-engine"
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
          Run it on its own, or as the Bring step inside the whole machine.{' '}
          <Link
            href="/revenue-engine/"
            data-cta="local-seo-whole-engine"
            data-cta-location="local-seo-engine"
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
            data-cta="local-seo-guarantee"
            data-cta-location="local-seo-engine"
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
