import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

const BENEFITS = [
  'Combine paid & organic AI signals to compound visibility',
  'Block competitor brand searches before they hit your funnel',
  'Pre-position for AI Overview citations on high-intent queries',
  'Tighten attribution across organic, paid, and CRM data',
  'Reclaim wasted ad spend on AI-cannibalised queries',
  'Find net-new conversational keywords your competitors miss',
  'Build first-party audiences AI surfaces preferentially serve',
  'Real-time bid + ad-copy adaptation for AI Overview placement',
]

export function GEOPPCBoost() {
  return (
    <Section tone="alt">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Eyebrow>Paid + organic, one team</Eyebrow>
          <h2 className="mt-3 text-balance">
            Unlock 25% higher returns with GEO-driven PPC &amp; SEO
          </h2>
          <p className="mt-5 text-lg text-ink-500">
            As a Google Premier Partner, our team blends paid &amp; organic AI
            optimization to raise brand visibility, leads, and sales — backed
            by a 93% client satisfaction score.
          </p>
          <Link
            href="/book-growth-call/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
          >
            Book a strategy call
          </Link>
        </div>

        <ul className="grid gap-3 md:col-span-7 md:grid-cols-2">
          {BENEFITS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-lg bg-surface p-4 ring-1 ring-ink-300/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="mt-0.5 shrink-0 text-brand-600"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-ink-700">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
