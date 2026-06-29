import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § pricing — full FL + CA rate card for a vertical page.
 *
 * Figures match spec §1.5 verbatim. Two state cards (Florida / California)
 * each show the system-only monthly + setup and the optional media add-on.
 * Terms verbatim. The pillar uses the lighter "starting at" RevenuePricing;
 * vertical pages use this full card.
 */

export type StateRate = {
  name: string
  systemMonthly: string
  setup: string
  mediaMonthly: string
}

export function RevenueRateCard({
  id,
  eyebrow = 'Pricing',
  headline,
  intro,
  states,
  note = 'Not in Florida or California? We onboard other states case-by-case — ask on the audit.',
}: {
  id?: string
  eyebrow?: string
  headline?: React.ReactNode
  intro?: React.ReactNode
  states: StateRate[]
  note?: string
}) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {headline ?? (
              <>
                Published,{' '}
                not quoted on a call.
              </>
            )}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            {intro ?? (
              <>
                One published rate card. No discovery-call pricing games, no
                annual lock-in.
              </>
            )}
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {states.map((s) => (
              <div
                key={s.name}
                className="overflow-hidden rounded-[4px] border border-rule-strong bg-paper"
              >
                <div className="border-b border-rule px-6 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                    {s.name} · system only
                  </p>
                </div>
                <div className="px-6 py-6">
                  <p className="flex items-baseline gap-1.5 font-display font-semibold leading-none tracking-[-0.02em] text-ink-900">
                    <span className="text-4xl tabular-nums">{s.systemMonthly}</span>
                    <span className="text-lg font-normal text-ink-500">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-ink-500">+ {s.setup}</p>
                  <p className="mt-4 border-t border-rule pt-4 text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">{s.mediaMonthly}</span>{' '}
                    media management (optional)
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-ink-700">
            90-day system install · 3-month minimum · month-to-month after.
            Client-funded ad accounts, zero markup.
          </p>
          {note && <p className="mt-2 text-sm text-ink-500">{note}</p>}

          <Link
            href="#audit"
            data-cta="revenue_leak_audit__rate_card"
            data-cta-location="mid_body"
            className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
          >
            Book a Revenue Leak Audit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
