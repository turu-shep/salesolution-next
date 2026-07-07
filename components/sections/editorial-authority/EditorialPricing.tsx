import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FullGrowthTierCard } from '@/components/services/FullGrowthTierCard'
import { cn } from '@/lib/cn'

/**
 * Editorial Authority § 05 — pricing ladder.
 *
 * Four ways in: a Single Piece trial strip up top, then three tier cards
 * below (Pillar Pack, Editorial Retainer, Full Growth Ownership). The
 * Editorial Retainer is the featured / most-engagements-start-here tier;
 * its body contains a sub-grid of the three volume sub-tiers (Focused,
 * Standard, Aggressive) instead of a flat bullet list.
 */

type VolumeTier = {
  name: string
  price: string
  cadence: string
  detail: string
}

const RETAINER_TIERS: VolumeTier[] = [
  {
    name: 'Focused',
    price: '$4K',
    cadence: '/ mo',
    detail: '4 pieces/mo · single vertical / 1 category',
  },
  {
    name: 'Standard',
    price: '$7.5K',
    cadence: '/ mo',
    detail: '8 pieces + 1 pillar/mo · 2–3 categories',
  },
  {
    name: 'Aggressive',
    price: '$15K',
    cadence: '/ mo',
    detail: '16 pieces + 3 pillars/mo · category-leader push',
  },
]

const PILLAR_PACK_INCLUDES = [
  '1 pillar page (3,000–6,000 words) + 6 cluster posts',
  'Schema, FAQ, HowTo on every piece',
  'Internal linking plan + redirects',
  '90-day AIO citation tracker',
]

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function EditorialPricing({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Pricing
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Four ways in.{' '}
          All priced.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One trial price to test the work. One fixed-scope pack to prove
          the lift on a single category. One ongoing retainer in three
          volume tiers. And Full Growth Ownership for when editorial alone
          isn&rsquo;t the whole answer.
        </p>
      </div>

      {/* Trial strip */}
      <div className="mt-12 flex flex-col gap-6 border-y border-rule bg-surface/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:mt-16">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-service-editorial-700">
            Trial
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl">
            Single Piece
          </h3>
          <p className="mt-2 max-w-xl text-sm text-ink-700">
            Trial before committing to a monthly cadence &mdash; one piece,
            your topic, full schema and SEO layer.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
            $500
            <span className="ml-1 font-mono text-xs font-normal text-ink-500">
              / article · 2,500 words
            </span>
          </p>
          <Link
            href="/contact-me/"
            data-cta="contact__pricing_card_single_piece"
            data-cta-location="pricing_card"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Try a single piece <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Three tier cards */}
      <ul className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-5">
        {/* Card 1 — Pillar Pack */}
        <li className="relative flex flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-700">
          <span
            aria-hidden
            className="block h-1 w-full bg-service-editorial-500"
          />
          <div className="border-b border-rule px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              6 weeks &middot; fixed scope
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Pillar Pack
            </h3>
            <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
              $6–14K
            </p>
          </div>
          <div className="flex-1 px-6 py-6">
            <p className="text-sm italic text-ink-500">
              &ldquo;Show me the cited-content lift on one category.&rdquo;
            </p>
            <ul className="mt-5 space-y-3">
              {PILLAR_PACK_INCLUDES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-ink-700"
                >
                  <Check className="text-service-editorial-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-rule px-6 py-4">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__pricing_card_pillar_pack"
              data-cta-location="pricing_card"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 bg-surface px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:border-ink-900"
            >
              Scope a Pillar Pack <span aria-hidden>→</span>
            </Link>
          </div>
        </li>

        {/* Card 2 — Editorial Retainer (featured) */}
        <li className="relative flex flex-col overflow-hidden border border-ink-900 bg-surface shadow-[0_30px_80px_-30px_rgba(15,20,30,0.30)] lg:-my-4">
          <span
            aria-hidden
            className="block h-1 w-full bg-service-editorial-500"
          />
          <span className="absolute -top-3 left-6 z-10 inline-flex items-center rounded-[3px] bg-service-editorial-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            Most engagements start here
          </span>
          <div className="border-b border-rule px-6 py-5 lg:pt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Ongoing &middot; 3-month minimum
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Editorial Retainer
            </h3>
            <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
              $4–15K
              <span className="ml-1 text-base font-medium text-ink-500">
                / month
              </span>
            </p>
          </div>
          <div className="flex-1 px-6 py-6">
            <p className="text-sm italic text-ink-500">
              &ldquo;We know editorial content is the lever. Run the
              program.&rdquo;
            </p>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Volume tiers
            </p>
            <ul className="mt-3 space-y-3">
              {RETAINER_TIERS.map((t) => (
                <li
                  key={t.name}
                  className="border-l-2 border-service-editorial-500 pl-3"
                >
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-sm font-semibold text-ink-900">
                      {t.name}
                    </span>
                    <span className="font-display text-sm font-semibold tabular-nums text-ink-900">
                      &mdash; {t.price}
                      <span className="font-mono text-[11px] font-normal text-ink-500">
                        {t.cadence}
                      </span>
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                    {t.detail}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-rule pt-4 text-xs leading-relaxed text-ink-500">
              Every tier includes: senior named writer, monthly topic
              research, AIO + schema engineering, 2 revisions per piece,
              monthly outcome reporting. Volume discounts: 5% over 6
              months, 15% over 12 months.
            </p>
          </div>
          <div className="border-t border-rule px-6 py-4">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__pricing_card_editorial_retainer"
              data-cta-location="pricing_card"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
            >
              Book a strategy call <span aria-hidden>→</span>
            </Link>
          </div>
        </li>

        {/* Card 3 — Full Growth Ownership */}
        <FullGrowthTierCard />
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Volume discounts:{' '}
        <span className="font-semibold text-ink-900">5%</span> over 6
        months,{' '}
        <span className="font-semibold text-ink-900">15%</span> over 12
        months on the Editorial Retainer.
      </p>
    </SectionRail>
  )
}
