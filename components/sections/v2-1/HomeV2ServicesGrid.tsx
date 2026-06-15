import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import {
  SERVICE_CLASSES,
  type ServiceKey,
} from '@/components/services/service-colors'

/**
 * /v2-1/ — 6-service scannable grid.
 *
 * Replaces the interactive ServicesTabs from the canonical homepage. The
 * tradeoff: less depth per service, but ALL prices visible without
 * clicking. Conversion > engagement on the homepage.
 *
 * Card 6 is Full Growth Ownership (composite service); it gets the 5-color
 * signature bar instead of a single service color.
 */

type Card = {
  key: ServiceKey
  name: string
  href: string
  description: string
  price: string
  bullets: [string, string]
}

const CARDS: Card[] = [
  {
    key: 'search',
    name: 'AI Search & GEO',
    href: '/services/ai-seo/',
    description:
      'Schema engineering, citation work, AIO-aware paid acceleration. Engineered to be cited inside AI Overviews, not just ranked underneath.',
    price: 'From $12–24K Sprint or $8–14K / mo',
    bullets: ['Sprint engagement', 'Operator Retainer'],
  },
  {
    key: 'catalog',
    name: 'Catalog AI',
    href: '/services/catalog-ai/',
    description:
      'AI-drafted product descriptions, schema, FAQ blocks, internal linking — with senior-editor review at Pro tier. Built for 1,000+ SKU catalogs.',
    price: 'From $3 / SKU',
    bullets: ['Standard $3 / Pro $7', 'Enterprise from $15K / mo'],
  },
  {
    key: 'editorial',
    name: 'Editorial Authority',
    href: '/services/editorial-authority/',
    description:
      'Pillar pages, cluster posts, engineering Q&A hubs — written by senior subject-matter writers. No LLM ghostwriting at the editorial layer.',
    price: 'From $500 / article or $4K / mo',
    bullets: ['Single Piece / Pillar Pack', 'Editorial Retainer'],
  },
  {
    key: 'dev',
    name: 'Website Development',
    href: '/services/website-development-design-services/',
    description:
      'Headless Next.js, Shopify Plus, or WooCommerce. Core Web Vitals committed in the SOW, schema baked in. You own the code on launch day.',
    price: 'From $15K Sprint or $40–150K Full Build',
    bullets: ['Build Sprint', 'Full Platform Build'],
  },
  {
    key: 'outbound',
    name: 'Outbound Email',
    href: '/services/outbound-email-marketing-services/',
    description:
      'Sender-reputation engineering, hand-built ICP lists, multi-touch sequences. Reply targets in the SOW; honest reporting on what landed.',
    price: 'From $9K Pilot or $6–14K / mo',
    bullets: ['Pilot engagement', 'Operator Retainer'],
  },
  {
    key: 'composite',
    name: 'Full Growth Ownership',
    href: '/services/full-growth-ownership/',
    description:
      'All five services coordinated under one operator. Fractional GTM Engineer or 4-in-1 Coordinated Retainer. Built for companies that need one owner.',
    price: 'From $20K / mo',
    bullets: ['Fractional GTM Engineer', '4-in-1 Retainer'],
  },
]

export function HomeV2ServicesGrid() {
  return (
    <SectionRail tone="paper" id="services-grid">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we ship
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Six services. All priced.{' '}
          <span className="text-ink-500">Pick your entry point.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Each runs standalone or combined under one operator. Click any
          service for the full page.
        </p>
      </div>

      <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <li
            key={card.key}
            className="group relative flex flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-700"
          >
            {/* Accent strip on top. Composite gets the 5-color bar so FGO is
                visually distinct from the five productized services. */}
            {card.key === 'composite' ? (
              <CompositeBar weight="hero" />
            ) : (
              <div
                aria-hidden
                className={`h-1.5 w-full ${SERVICE_CLASSES[card.key].bg500}`}
              />
            )}

            <Link
              href={card.href}
              data-cta={`service_${card.key}__v2_grid`}
              data-cta-location="mid_body"
              className="flex flex-1 flex-col gap-4 p-6"
            >
              <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {card.name}
              </h3>

              <p className="text-sm leading-relaxed text-ink-700">
                {card.description}
              </p>

              <p className="font-display text-lg font-semibold tabular-nums text-ink-900">
                {card.price}
              </p>

              <ul className="mt-auto space-y-1.5 text-sm text-ink-700">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ink-500"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-3 inline-flex items-center gap-2 border-t border-rule pt-4 text-sm font-semibold text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
                <ServiceColorDot service={card.key} />
                See {card.name} <span aria-hidden>&rarr;</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
