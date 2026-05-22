import type { Metadata } from 'next'
import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export const metadata: Metadata = {
  title: 'Audit booked',
  alternates: { canonical: 'https://salesolution.net/unlock-growth-audit/thank-you/' },
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
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
        <Eyebrow className="mt-6">You&rsquo;re on the list</Eyebrow>
        <h1 className="mt-3 font-display">Audit is being prepared</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
          We received your details. Expect the written diagnosis in your inbox
          within 24 hours. If you don&rsquo;t see it, check your spam folder —
          and reply to this thread so we know.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-tint-blue p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Step 1 · Today
            </p>
            <p className="mt-2 text-sm text-ink-700">
              We crawl your store and build the diagnostic deck.
            </p>
          </div>
          <div className="rounded-lg bg-surface-tint-cool p-6 text-left ring-1 ring-ink-300/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Step 2 · Within 24h
            </p>
            <p className="mt-2 text-sm text-ink-700">
              Written audit + recommendations land in your inbox.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/category/blog/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Read recent insights
          </Link>
          <Link
            href="/guides/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Browse guides
          </Link>
        </div>
      </div>
    </Section>
  )
}
