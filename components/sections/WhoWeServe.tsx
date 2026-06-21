import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

import { InView } from './InView'

/**
 * Home § 02.5 — the audience splitter.
 *
 * The homepage is the cross-vertical front door; this is where it forks. Four
 * audience cards, each in the owner's own words, routing to its own hub —
 * keeping the two funnels separate (do not merge). Industrial is brand-blue (the
 * discovery face); the three Revenue Engine verticals are accent-orange (the
 * response face), matching the two-face coloring in ProblemShift.
 *
 * Card hrefs mirror lib/navigation.ts "Who We Serve" children.
 */

type Audience = {
  key: string
  eyebrow: string
  sub?: string
  pain: string
  fix: string
  href: string
  cta: string
  tone: 'brand' | 'accent'
}

const AUDIENCES: Audience[] = [
  {
    key: 'industrial',
    eyebrow: 'Industrial & technical B2B',
    sub: 'Distributors · Manufacturers',
    pain: 'Buyers ask AI for the part and it names the manufacturer, not you. Amazon and the brands keep taking business that used to be yours.',
    fix: 'Become the company AI names for your products, and stop leaking the quotes you already get.',
    href: '/industries/industrial-distribution/',
    cta: 'See the industrial playbook',
    tone: 'brand',
  },
  {
    key: 'medical',
    eyebrow: 'Medical & aesthetics',
    sub: 'Dental · Med spa · Plastic surgery',
    pain: 'Your front desk is with a patient when the phone rings, and the new consult books with whoever picked up. High-value treatment plans get presented once and never followed up.',
    fix: 'A HIPAA-compliant system that answers during treatment, books new patients, and chases the plans and recalls worth the most — then proves the revenue.',
    href: '/revenue-engine/medical/',
    cta: 'See it for medical & aesthetics',
    tone: 'accent',
  },
  {
    key: 'home-services',
    eyebrow: 'Home & local services',
    sub: 'Roofing · HVAC · Plumbing · Electrical',
    pain: 'The phone rings while you’re on a roof. You pay for leads nobody calls back, and estimates go cold.',
    fix: 'A system that answers every call, replies in seconds, books the job, and chases the quotes that stall.',
    href: '/revenue-engine/home-services/',
    cta: 'See the Revenue Engine',
    tone: 'accent',
  },
  {
    key: 'local-retail',
    eyebrow: 'Retail & consumer brands',
    sub: 'Jewelry · Flooring · Specialty goods',
    pain: 'Shoppers near you search and find a competitor. The ones who do buy rarely come back, and the customer list you already paid to build never gets sold to again.',
    fix: 'Show up first in Maps and AI for your area, bring back the shoppers who looked and left, and sell again to the customers you already won.',
    href: '/revenue-engine/local-retail/',
    cta: 'See it for retail',
    tone: 'accent',
  },
]

const TONE = {
  brand: {
    bar: 'bg-brand-500',
    dot: 'bg-brand-500',
    eyebrow: 'text-brand-700',
    cta: 'text-brand-700 decoration-brand-500/40 group-hover:decoration-brand-600',
  },
  accent: {
    bar: 'bg-accent-500',
    dot: 'bg-accent-500',
    eyebrow: 'text-accent-700',
    cta: 'text-accent-700 decoration-accent-500/40 group-hover:decoration-accent-600',
  },
} as const

export function WhoWeServe() {
  return (
    <SectionRail tone="surface">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Who we serve
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Four businesses we know cold.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          The leak looks different in each one, and so does the fix. Find the
          version that&rsquo;s yours.
        </p>
      </div>

      <InView className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a) => {
          const t = TONE[a.tone]
          return (
            <Link
              key={a.key}
              href={a.href}
              data-cta={`who-we-serve-${a.key}`}
              data-cta-location="home-who-we-serve"
              className="group flex flex-col border border-rule bg-surface transition-colors duration-200 hover:border-ink-300"
            >
              <span aria-hidden className={`h-1 w-full ${t.bar}`} />
              <div className="flex flex-1 flex-col p-6">
                <p className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] ${t.eyebrow}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                  {a.eyebrow}
                </p>
                {a.sub && (
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                    {a.sub}
                  </p>
                )}

                <p className="mt-4 text-base leading-relaxed text-ink-800">
                  {a.pain}
                </p>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  {a.fix}
                </p>

                <span className={`mt-6 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.16em] underline underline-offset-[6px] ${t.cta}`}>
                  {a.cta}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </span>
              </div>
            </Link>
          )
        })}
      </InView>
    </SectionRail>
  )
}
