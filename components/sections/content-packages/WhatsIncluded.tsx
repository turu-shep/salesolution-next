import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Content packages § — what every tier includes by default.
 *
 * Eight commitments that don't change between tiers, written as a grid
 * of two-line statements. Sits after the pricing grid so the buyer
 * understands what the price actually buys — and what they don't have
 * to ask for.
 */

type Inclusion = { label: string; body: string }

const INCLUSIONS: Inclusion[] = [
  {
    label: 'Senior writer ownership',
    body: 'A named writer with vertical experience drafts every piece. No junior pool, no offshore handoff.',
  },
  {
    label: 'Topic + keyword research',
    body: 'Monthly research lands first. We write into briefs that target real commercial intent, not a content calendar pulled from thin air.',
  },
  {
    label: 'AIO + citation engineering',
    body: 'Every article is structured for AI Overviews and ChatGPT retrieval. We track which queries cite you and which competitors win.',
  },
  {
    label: 'Editorial style guide',
    body: 'Built once, applied every piece. Your tone, your spec conventions, your product terminology — locked into a living guide.',
  },
  {
    label: 'Schema + internal linking',
    body: 'Article schema, FAQ schema where it earns its keep, and cluster-aware internal linking shipped with every published piece.',
  },
  {
    label: 'Revisions included',
    body: 'Two revision passes per article come standard. Outside the trial tier — there the count is one, and we tell you upfront.',
  },
  {
    label: 'Monthly outcome reporting',
    body: 'Citation coverage, query mix, organic + AIO traffic, and a written commentary. Not a Looker dashboard you’ll never open.',
  },
  {
    label: '5% / 15% volume discounts',
    body: '5% off for a 6-month commitment, 15% off for 12 months. Discounts stack on the listed tier prices, applied for the term.',
  },
]

export function WhatsIncluded({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          In every package
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          What every tier ships,{' '}
          <span className="text-ink-400">without asking.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          The volume scales by tier. Everything below stays constant &mdash;
          it&rsquo;s the floor, not the ceiling, of what your retainer buys.
        </p>
      </div>

      <ul className="mt-14 grid gap-x-10 gap-y-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {INCLUSIONS.map((item, i) => (
          <li key={item.label} className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
              {(i + 1).toString().padStart(2, '0')}
            </p>
            <p className="font-display text-lg font-semibold leading-snug text-white">
              {item.label}
            </p>
            <p className="text-sm leading-relaxed text-ink-300">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-ink-300">
          Need something outside this list &mdash; multilingual, white-label,
          editorial-only, or a different volume mix? We send a written quote
          within 24 hours.
        </p>
        <Link
          href="/contact-me/"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition hover:text-accent-500 hover:decoration-accent-500"
        >
          Request a custom quote <span aria-hidden>→</span>
        </Link>
      </div>
    </SectionRail>
  )
}
