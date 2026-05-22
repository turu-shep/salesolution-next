import type { Metadata } from 'next'
import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export const metadata: Metadata = {
  title: 'Application received',
  alternates: { canonical: 'https://salesolution.net/constraint-sprint/thank-you/' },
  robots: { index: false, follow: false },
}

export default function ConstraintSprintThankYouPage() {
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
        <Eyebrow className="mt-6">Application received</Eyebrow>
        <h1 className="mt-3 font-display">We&rsquo;ll be in touch within 24 hours</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
          We review every sprint application personally. Within 24 hours
          you&rsquo;ll get one of two emails: a calendar link to scope the
          sprint, or a candid note about why now isn&rsquo;t the right time —
          with a referral to someone who is.
        </p>

        <div className="mt-10">
          <Link
            href="/category/blog/"
            className="inline-flex items-center justify-center rounded-md border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Read recent insights while you wait
          </Link>
        </div>
      </div>
    </Section>
  )
}
