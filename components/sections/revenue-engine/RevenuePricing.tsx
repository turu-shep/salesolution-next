import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 7 — pricing.
 *
 * Per DP-2 default: a "starting at" anchor on the pillar, full rate card
 * on the vertical pages. Figures match spec §1.5 verbatim (home-services
 * Florida system-only floor); terms verbatim. Card uses the brand's
 * 3-zone anatomy (header slab / price + terms / footer CTA).
 */

const TERMS = [
  '90-day system install',
  '3-month minimum, month-to-month after',
  'Optional media management add-on',
  'Client-funded ad accounts, zero markup',
]

export function RevenuePricing({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Published,{' '}
            <span className="text-ink-500">not quoted on a call.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            One published floor. Rates vary by trade and state; the full rate
            cards live on the vertical pages.
          </p>
        </div>

        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-[4px] border border-rule-strong bg-paper">
            {/* Header slab */}
            <div className="border-b border-rule px-8 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                System only, no media
              </p>
            </div>

            {/* Price + terms */}
            <div className="px-8 py-7">
              <p className="flex items-baseline gap-2 font-display font-semibold leading-none tracking-[-0.02em] text-ink-900">
                <span className="text-5xl tabular-nums">From $2,997</span>
                <span className="text-xl font-normal text-ink-500">/mo + setup</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {TERMS.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-ink-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-600"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-rule px-8 py-5">
              <Link
                href="#audit"
                data-cta="revenue_leak_audit__pricing"
                data-cta-location="mid_body"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
              >
                Book a Revenue Leak Audit
                <span aria-hidden>→</span>
              </Link>
              <p className="mt-4 text-sm text-ink-500">
                Full rate cards:{' '}
                <Link
                  href="/revenue-engine/home-services/"
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
                >
                  home services
                </Link>{' '}
                ·{' '}
                <Link
                  href="/revenue-engine/dentists/"
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
                >
                  dental
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
