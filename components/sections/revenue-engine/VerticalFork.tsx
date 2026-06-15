import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 6 — vertical fork.
 *
 * Two cards routing to the vertical pages (built in Phase 2). Each names
 * the skin features from spec §1.4. Links resolve once the vertical pages
 * ship; the cluster is orphan-stage until then.
 */

const VERTICALS = [
  {
    href: '/revenue-engine/home-services/',
    eyebrow: 'For home services',
    title: 'Roofing, HVAC, plumbing, electrical',
    body: 'Instant quote widget, storm-season campaign templates, estimate-recovery follow-up, and a dispute-proof lead log where every call is recorded and classified.',
  },
  {
    href: '/revenue-engine/dentists/',
    eyebrow: 'For dental practices',
    title: 'Group and single-location practices',
    body: 'A HIPAA-compliant stack with BAAs on every tool, patient-financing framing, treatment-plan and recall follow-up, and a monthly front-desk scoring report.',
  },
]

export function VerticalFork({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Built for your trade
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          One engine.{' '}
          <span className="text-ink-500">Two skins.</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {VERTICALS.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="group flex flex-col rounded-[4px] border border-rule-strong bg-surface p-7 transition-colors duration-200 hover:border-ink-900"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
              {v.eyebrow}
            </span>
            <span className="mt-3 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
              {v.title}
            </span>
            <span className="mt-3 text-ink-700">{v.body}</span>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
              See how it works for you
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </SectionRail>
  )
}
