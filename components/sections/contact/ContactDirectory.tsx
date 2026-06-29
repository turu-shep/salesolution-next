import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * The four contact channels rendered as an editorial directory, not as
 * marketing cards. Each row: mono channel label, the value at H3 size,
 * a single line of context. Hairline rules between rows.
 *
 * Pulls phone, email, address, and LinkedIn from lib/business.ts so the
 * canonical NAP is the single source of truth.
 */

type Row = {
  label: string
  value: React.ReactNode
  href?: string
  context: string
  external?: boolean
}

export function ContactDirectory() {
  const rows: Row[] = [
    {
      label: 'Phone',
      value: business.phoneDisplay,
      href: `tel:${business.phone}`,
      context: 'Mon–Fri 9am–6pm ET · goes straight to Artur',
    },
    {
      label: 'Email',
      value: business.emails.leads,
      href: `mailto:${business.emails.leads}`,
      context: 'For hiring conversations · same-day acknowledgement',
    },
    {
      label: 'General inbox',
      value: business.emails.general,
      href: `mailto:${business.emails.general}`,
      context: 'For press, partnerships, anything not a sales conversation',
    },
    {
      label: 'LinkedIn',
      value: business.founder.name,
      href: business.social.linkedin,
      context: 'DM open · best for short follow-ups',
      external: true,
    },
    {
      label: 'Office',
      value: (
        <address className="not-italic">
          {business.address.street}
          {' · '}
          {business.address.city}, {business.address.region}{' '}
          {business.address.postalCode}
        </address>
      ),
      context: 'By appointment only · no walk-ins',
    },
  ]

  return (
    <SectionRail tone="surface" id="channels">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Direct channels
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Pick one. They all reach the same person.
          </h2>
          <p className="mt-6 text-ink-700">
            No SDR queue, no routing form, no &ldquo;assistant to the
            founder.&rdquo; The five channels below all land in front of
            Artur within the same business day.
          </p>
        </div>

        <ul className="md:col-span-8">
          {rows.map((row, i) => {
            const labelMono = (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-500">
                {(i + 1).toString().padStart(2, '0')}
              </span>
            )

            const valueClass =
              'font-display text-xl font-semibold text-ink-900 transition-colors duration-200 group-hover:text-brand-600 sm:text-2xl'

            return (
              <li key={row.label} className="border-t border-rule last:border-b">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 py-5 sm:grid-cols-[auto_140px_1fr] sm:gap-x-6">
                  <div className="pt-1.5">{labelMono}</div>

                  <p className="self-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 sm:pt-2">
                    {row.label}
                  </p>

                  <div className="col-span-2 sm:col-span-1">
                    {row.href ? (
                      <Link
                        href={row.href}
                        target={row.external ? '_blank' : undefined}
                        rel={row.external ? 'noopener noreferrer' : undefined}
                        className="group inline-flex flex-wrap items-baseline gap-x-2"
                      >
                        <span className={valueClass}>{row.value}</span>
                        <span aria-hidden className="text-ink-400 transition-colors duration-200 group-hover:text-brand-600">
                          →
                        </span>
                      </Link>
                    ) : (
                      <span className={valueClass.replace('group-hover:text-brand-600', '')}>
                        {row.value}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-ink-500">{row.context}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </SectionRail>
  )
}
