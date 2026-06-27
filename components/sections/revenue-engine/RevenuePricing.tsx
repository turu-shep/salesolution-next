import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § pricing — the MODEL, not the number.
 *
 * Per the pricing decision: publish how it's priced and the terms, in full,
 * so there are no games on a call — but the exact figure depends on trade,
 * location, and scope, and comes in the audit (in writing, same day). The
 * dollar amount is deliberately not shown cold here.
 */

const MODEL = [
  {
    label: 'System only',
    body: 'The engine — demand, response, booking, recovery, and the dashboard. No ad management.',
  },
  {
    label: '+ Media management',
    body: 'Optional. If you want me running the ads too — your account, at cost, zero markup.',
  },
]

const TERMS = [
  '90-day install, one-time fee',
  '3-month minimum, month-to-month after',
  'Client-funded ad accounts, zero markup',
  'No annual lock-in',
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
            Published model.{' '}
            <span className="text-ink-500">No games on a call.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            You see exactly how this is priced before we ever talk. The number
            depends on your trade, location, and scope &mdash; you get it in the
            audit, in writing, the same day.
          </p>
        </div>

        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-[4px] border border-rule-strong bg-paper">
            <div className="border-b border-rule px-8 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                How it&rsquo;s priced
              </p>
            </div>

            <dl className="divide-y divide-rule">
              {MODEL.map((m) => (
                <div key={m.label} className="px-8 py-5">
                  <dt className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
                    {m.label}
                  </dt>
                  <dd className="mt-1.5 text-ink-700">{m.body}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-rule px-8 py-6">
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {TERMS.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-rule pt-4 text-sm leading-relaxed text-ink-500">
                If you leave after the minimum with 30 days&rsquo; notice, the
                automations switch off &mdash; but you keep your ad account,
                your data, and your Google profile.
              </p>
            </div>

            <div className="border-t border-rule px-8 py-5">
              <Link
                href="#audit"
                data-cta="revenue_leak_audit__pricing"
                data-cta-location="mid_body"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
              >
                Get your exact rate in the audit
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
