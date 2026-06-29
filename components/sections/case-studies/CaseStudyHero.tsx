import Link from 'next/link'

import type { CaseStudy } from '@/sanity/lib/case-studies'

import { MetricValue } from './MetricValue'
import { disclosureLabel, serviceMeta } from './service-meta'

/**
 * Case-study detail hero. Follows the detail-page hero grammar (custom paper
 * section, mono breadcrumb, two-tone display headline) and adds the elements
 * buyers scan for first: a disclosure badge (trust, up front), a fact-snapshot
 * strip (who/scale/services/window), the results-at-a-glance grid, and an
 * "on this page" anchor nav so a skimmer or a committee member can jump
 * straight to the chart or the methodology on a long page.
 */
export function CaseStudyHero({ study }: { study: CaseStudy }) {
  const primary = serviceMeta(study.primaryService)
  const supporting = (study.supportingServices ?? []).map(serviceMeta)
  const clientLabel =
    study.disclosure === 'named' && study.client?.publicName
      ? study.client.publicName
      : (study.client?.descriptor ?? 'Client')

  const snapshot: { label: string; value: React.ReactNode }[] = [
    { label: 'Client', value: clientLabel },
    ...(study.client?.scale ? [{ label: 'Scale', value: study.client.scale }] : []),
    {
      label: 'Services',
      value: (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {[primary, ...supporting].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600"
            >
              <span aria-hidden className={`inline-block h-2 w-2 ${s.dot}`} />
              {s.name}
            </Link>
          ))}
        </span>
      ),
    },
    {
      label: 'Engagement',
      value: `${study.engagementWindow} · ${study.durationLabel}`,
    },
  ]

  // "On this page" jump nav — only the sections that actually render.
  const jumps = [
    { label: 'Situation', href: '#situation' },
    { label: 'The work', href: '#approach' },
    { label: 'Results', href: '#results' },
    { label: 'The proof', href: '#proof' },
    { label: 'How we measured it', href: '#measurement' },
  ]

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        {/* Breadcrumb + disclosure badge */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            <Link href="/case-studies/" className="transition-colors hover:text-ink-900">
              Case studies
            </Link>
            <span aria-hidden className="mx-2 text-ink-300">/</span>
            <span>{study.client?.descriptor ?? clientLabel}</span>
          </nav>
          <span className="inline-flex items-center rounded-[3px] border border-rule bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
            {disclosureLabel(study.disclosure)}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-6xl">
          {study.title}
          {study.titleMuted && (
            <span className="block">{study.titleMuted}</span>
          )}
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-snug text-ink-700 md:text-xl">
          {study.summary}
        </p>

        {/* Fact snapshot — the strip a buying committee screenshots */}
        <dl className="mt-12 grid grid-cols-2 gap-y-4 border-y border-rule py-5 sm:gap-y-5 lg:grid-cols-4 lg:divide-x lg:divide-rule lg:gap-y-0">
          {snapshot.map((cell, i) => (
            <div key={cell.label} className={i > 0 ? 'lg:pl-6' : ''}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {cell.label}
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-ink-900">{cell.value}</dd>
            </div>
          ))}
        </dl>

        {/* Results at a glance */}
        {study.stats?.length > 0 && (
          <ul className="mt-10 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {study.stats.map((stat) => (
              <li key={stat._key} className="flex flex-col gap-2 bg-surface p-6">
                <p className="font-display text-4xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink-900">
                  <MetricValue value={stat.value} />
                </p>
                <p className="text-sm leading-snug text-ink-500">{stat.label}</p>
              </li>
            ))}
          </ul>
        )}

        {/* On this page — jump nav for the long-form story */}
        <nav
          aria-label="On this page"
          className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400"
        >
          <span className="mr-2 text-ink-500">On this page</span>
          {jumps.map((j, i) => (
            <span key={j.href} className="inline-flex items-center">
              {i > 0 && <span aria-hidden className="mx-2 text-ink-300">/</span>}
              <a
                href={j.href}
                className="font-display text-sm font-semibold normal-case tracking-normal text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors hover:text-brand-600 hover:decoration-brand-600"
              >
                {j.label}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </section>
  )
}
