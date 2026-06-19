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
 * itself. Self-contained (does not depend on the shared WhoWeServe, which the
 * homepage uses in its compact text form) — copy/hrefs mirror it.
 */

type Audience = {
  key: string
  eyebrow: string
  sub: string
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
    sub: 'Distributors · Manufacturers',
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
    sub: 'Dental · Med spa · Plastic surgery',
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
    sub: 'Roofing · HVAC · Plumbing · Electrical',
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
    sub: 'Jewelry · Flooring · Specialty goods',
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
  },
  accent: {
    bar: 'bg-accent-500',
    dot: 'bg-accent-500',
    eyebrow: 'text-accent-700',
    cta: 'text-accent-700 decoration-accent-500/40 group-hover:decoration-accent-600',
  },
} as const

export function IndustriesShowcase({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" size="sm" id={id}>
      <InView className="grid gap-6 md:grid-cols-2">
        {AUDIENCES.map((a) => {
          const t = TONE[a.tone]
          return (
            <Link
              key={a.key}
              href={a.href}
              data-cta={`industries-showcase-${a.key}`}
              data-cta-location="industries-showcase"
              className="group flex flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-300"
            >
              <span aria-hidden className={`h-1 w-full ${t.bar}`} />
              <div className="relative aspect-[16/10] overflow-hidden bg-rule">
                <Image
                  src={`/industries/${a.key}.webp`}
                  alt={a.alt}
                  fill
                  sizes="(min-width: 768px) 48vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] ${t.eyebrow}`}>
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                  {a.eyebrow}
                </p>
                <p className="mt-2 text-sm leading-snug text-ink-500">{a.sub}</p>

                <p className="mt-4 text-base leading-relaxed text-ink-800">{a.pain}</p>
                <p className="mt-4 text-base leading-relaxed text-ink-600">{a.fix}</p>

                <span className={`mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-[12px] uppercase tracking-[0.16em] underline underline-offset-[6px] ${t.cta}`}>
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
