import Image from 'next/image'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

import { InView } from './InView'

/**
 * /industries/ showcase — the audience splitter with treated imagery.
 *
 * Image-topped cards, one per vertical. Photos are brand-graded (industrial =
 * cool brand-blue; the Revenue Engine verticals = warm accent) via
 * scripts/_gen-industry-images.mjs, so the funnel colour reads in the image
 * itself. Each card surfaces its niches as small cross-links — linked where a
 * niche page exists (Dental today), plain labels otherwise (they light up as
 * Phase 6 builds the niche pages). The card is a container, not one big <Link>,
 * so the niche links can be real anchors (no nested <a>).
 *
 * Self-contained (does not depend on the shared WhoWeServe, which the homepage
 * uses in its compact text form) — copy/hrefs mirror it.
 */

type Niche = { label: string; href?: string }

type Audience = {
  key: string
  eyebrow: string
  niches: Niche[]
  pain: string
  fix: string
  href: string
  cta: string
  tone: 'brand' | 'accent'
  alt: string
}

const AUDIENCES: Audience[] = [
  {
    key: 'industrial',
    eyebrow: 'Industrial & technical B2B',
    niches: [{ label: 'Distributors' }, { label: 'Manufacturers' }],
    pain: 'Buyers ask AI for the part and it names the manufacturer, not you. Amazon and the brands keep taking business that used to be yours.',
    fix: 'Become the company AI names for your products, and stop leaking the quotes you already get.',
    href: '/industries/industrial-distribution/',
    cta: 'See the industrial playbook',
    tone: 'brand',
    alt: 'Aisle of an industrial parts warehouse, shelves of organized fittings and components',
  },
  {
    key: 'medical',
    eyebrow: 'Medical & aesthetics',
    niches: [
      { label: 'Dental', href: '/revenue-engine/dentists/' },
      { label: 'Med spa' },
      { label: 'Plastic surgery' },
    ],
    pain: 'Your front desk is with a patient when the phone rings, and the new consult books with whoever picked up. High-value treatment plans get presented once and never followed up.',
    fix: 'A HIPAA-compliant system that answers during treatment, books new patients, and chases the plans and recalls worth the most — then proves the revenue.',
    href: '/revenue-engine/medical/',
    cta: 'See it for medical & aesthetics',
    tone: 'accent',
    alt: 'A clean, modern dental treatment room in soft daylight',
  },
  {
    key: 'home-services',
    eyebrow: 'Home & local services',
    niches: [
      { label: 'Roofing' },
      { label: 'HVAC' },
      { label: 'Plumbing' },
      { label: 'Electrical' },
    ],
    pain: 'The phone rings while you’re on a roof. You pay for leads nobody calls back, and estimates go cold.',
    fix: 'A system that answers every call, replies in seconds, books the job, and chases the quotes that stall.',
    href: '/revenue-engine/home-services/',
    cta: 'See the Revenue Engine',
    tone: 'accent',
    alt: 'A roofing contractor working on a residential roof at golden hour',
  },
  {
    key: 'local-retail',
    eyebrow: 'Retail & consumer brands',
    niches: [
      { label: 'Jewelry' },
      { label: 'Flooring' },
      { label: 'Specialty goods' },
    ],
    pain: 'Shoppers near you search and find a competitor. The ones who do buy rarely come back, and the customer list you already paid to build never gets sold to again.',
    fix: 'Show up first in Maps and AI for your area, bring back the shoppers who looked and left, and sell again to the customers you already won.',
    href: '/revenue-engine/local-retail/',
    cta: 'See it for retail',
    tone: 'accent',
    alt: 'Interior of a modern local retail showroom with tidy product displays',
  },
]

const TONE = {
  brand: {
    bar: 'bg-brand-500',
    dot: 'bg-brand-500',
    eyebrow: 'text-brand-700',
    cta: 'text-brand-700 decoration-brand-500/40 group-hover:decoration-brand-600',
    nicheLink: 'border-brand-500/40 text-brand-700 hover:border-brand-600 hover:text-brand-800',
  },
  accent: {
    bar: 'bg-accent-500',
    dot: 'bg-accent-500',
    eyebrow: 'text-accent-700',
    cta: 'text-accent-700 decoration-accent-500/40 group-hover:decoration-accent-600',
    nicheLink: 'border-accent-500/40 text-accent-700 hover:border-accent-600 hover:text-accent-800',
  },
} as const

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function IndustriesShowcase({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" size="sm" id={id}>
      <InView className="grid gap-6 md:grid-cols-2">
        {AUDIENCES.map((a) => {
          const t = TONE[a.tone]
          return (
            <div
              key={a.key}
              className="group flex flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-300"
            >
              <Link
                href={a.href}
                aria-label={a.eyebrow}
                data-cta={`industries-showcase-${a.key}`}
                data-cta-location="industries-showcase"
                className="block"
              >
                <span aria-hidden className={`block h-1 w-full ${t.bar}`} />
                <div className="relative aspect-[16/10] overflow-hidden bg-rule">
                  <Image
                    src={`/industries/${a.key}.webp`}
                    alt={a.alt}
                    fill
                    sizes="(min-width: 768px) 48vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] ${t.eyebrow}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                  {a.eyebrow}
                </p>

                {/* Niches — cross-links where a page exists, plain labels otherwise. */}
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {a.niches.map((n) =>
                    n.href ? (
                      <li key={n.label}>
                        <Link
                          href={n.href}
                          data-cta={`industries-niche-${a.key}-${slugify(n.label)}`}
                          data-cta-location="industries-showcase"
                          className={`inline-flex items-center gap-1 rounded-[3px] border px-2 py-0.5 text-[11px] font-medium transition-colors duration-200 ${t.nicheLink}`}
                        >
                          {n.label}
                          <span aria-hidden>&rarr;</span>
                        </Link>
                      </li>
                    ) : (
                      <li key={n.label}>
                        <span className="inline-flex rounded-[3px] border border-rule px-2 py-0.5 text-[11px] text-ink-500">
                          {n.label}
                        </span>
                      </li>
                    ),
                  )}
                </ul>

                <p className="mt-4 text-base leading-relaxed text-ink-800">{a.pain}</p>
                <p className="mt-4 text-base leading-relaxed text-ink-600">{a.fix}</p>

                <Link
                  href={a.href}
                  data-cta={`industries-showcase-cta-${a.key}`}
                  data-cta-location="industries-showcase"
                  className={`mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-[12px] uppercase tracking-[0.16em] underline underline-offset-[6px] ${t.cta}`}
                >
                  {a.cta}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </Link>
              </div>
            </div>
          )
        })}
      </InView>
    </SectionRail>
  )
}
