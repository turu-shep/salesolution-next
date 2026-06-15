import type { Metadata } from 'next'
import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export const metadata: Metadata = {
  title: 'Quote requested',
  alternates: { canonical: 'https://salesolution.net/full-growth-quote/thank-you/' },
  robots: { index: false, follow: false },
}

export default function FullGrowthQuoteThankYouPage() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
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
        <Eyebrow className="mt-6">Qualifier received</Eyebrow>
        <h1 className="mt-3 font-display">Artur is reading it now</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
          You&rsquo;ll get a personal reply within 24 business hours with a
          1-page diagnostic and a suggested call time. No SDR loop, no drip
          sequence. If you don&rsquo;t see anything, check spam &mdash; and
          reply on the thread so we know.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-tint-blue p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Day 0–1
            </p>
            <p className="mt-2 text-sm text-ink-700">
              Written diagnostic + suggested call time in your inbox.
            </p>
          </div>
          <div className="rounded-lg bg-surface-tint-cool p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Day 1–3
            </p>
            <p className="mt-2 text-sm text-ink-700">
              Written SOW &mdash; shape, scope, price, exit terms.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/services/full-growth-ownership/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Re-read the Full Growth Ownership page
          </Link>
          <Link
            href="/category/blog/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Read recent insights
          </Link>
        </div>
      </div>
    </Section>
  )
}
