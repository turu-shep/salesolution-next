import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § vertical router — sits right under the hero.
 *
 * If a visitor already knows their trade, send them straight to the page
 * built for it (pricing, proof, the engine applied). Everyone else keeps
 * scrolling. Each card reserves a PROOF-SLOT for a first-cohort case study
 * once real data exists — no fabricated proof until then.
 */

const VERTICALS = [
  {
    href: '/industries/home-services/',
    kicker: 'Roofing · HVAC · plumbing · electrical',
    title: 'Home services',
    body: 'Answer every storm-season call, book the estimate, and chase the quote that went cold — built for crews who are on a roof, not at a desk.',
    cta: 'See the home-services playbook',
  },
  {
    href: '/revenue-engine/dentists/',
    kicker: 'Group & single-location practices',
    title: 'Dental practices',
    body: 'Catch the calls your front desk can’t during chair time, book new patients, and follow up on treatment plans and recall — HIPAA-compliant by default.',
    cta: 'See the dental playbook',
  },
]

export function VerticalFork({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Find your playbook
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Straight to your playbook.{' '}
          Built for how you work.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Each page applies the engine to your trade &mdash; your pricing,
          your proof, your workflow. New to this? The big picture is right
          below.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {VERTICALS.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="group flex flex-col overflow-hidden rounded-[4px] border border-rule-strong bg-surface transition-colors duration-200 hover:border-ink-900"
          >
            <div aria-hidden className="h-1 bg-brand-600" />
            <div className="flex flex-1 flex-col p-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
                {v.kicker}
              </span>
              <span className="mt-3 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                {v.title}
              </span>
              <span className="mt-3 text-ink-700">{v.body}</span>
              {/* PROOF-SLOT: first-cohort case study (link / logo / outcome) once data exists */}
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                {v.cta}
                <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SectionRail>
  )
}
