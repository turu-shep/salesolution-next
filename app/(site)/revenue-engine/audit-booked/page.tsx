import type { Metadata } from 'next'
import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { business } from '@/lib/business'

/**
 * Revenue Leak Audit confirmation — the conversion endpoint for the local-service
 * funnel (the page RE-203 calls for). noindex. Any Revenue Engine audit form
 * (the LPs, and the on-site AuditCTA once wired) redirects here on success, so
 * it's the single place a conversion fires.
 */
export const metadata: Metadata = {
  title: 'Audit booked',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://salesolution.net/revenue-engine/audit-booked/' },
}

export default function AuditBookedPage() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <Eyebrow className="mt-6">Got it</Eyebrow>
        <h1 className="mt-3 font-display">Your Revenue Leak Audit is in motion</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
          I&rsquo;ve got your details. I&rsquo;ll pull your numbers and get back to
          you within one business day &mdash; no pitch, just what I find. If
          it&rsquo;s urgent, call or text me at{' '}
          <a href={`tel:${business.phone}`} className="font-medium text-ink-800 underline hover:text-accent-600">
            {business.phoneDisplay}
          </a>
          .
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-alt p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              Step 1 · Today
            </p>
            <p className="mt-2 text-sm text-ink-700">
              I check your missed calls, response time, Google profile, and the
              follow-up gap on your estimates.
            </p>
          </div>
          <div className="rounded-lg bg-surface-alt p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              Step 2 · Within one business day
            </p>
            <p className="mt-2 text-sm text-ink-700">
              You get the dollar figure leaking out and the one fix with the
              highest payback. Yours to keep either way.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/revenue-engine/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-accent-600 hover:text-accent-600"
          >
            See how the Revenue Engine works
          </Link>
        </div>
      </div>
    </Section>
  )
}
