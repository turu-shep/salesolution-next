import Link from 'next/link'

import type { CaseStudy } from '@/sanity/lib/case-studies'

import { serviceMeta } from './service-meta'

/**
 * Case-study detail hero. Follows the detail-page hero grammar (custom
 * paper section, mono breadcrumb, two-tone display headline) and adds the
 * two elements buyers scan for first: a fact snapshot strip (who, scale,
 * services, window) and a results-at-a-glance grid. Everything above the
 * fold answers "who is this about and what happened" without reading prose.
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

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          <Link href="/case-studies/" className="transition-colors hover:text-ink-900">
            Case studies
          </Link>
          <span aria-hidden className="mx-2 text-ink-300">/</span>
          <span>{study.client?.descriptor ?? clientLabel}</span>
        </nav>

        <h1 className="mt-5 max-w-4xl font-display text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-6xl">
          {study.title}
          {study.titleMuted && (
            <>
              {' '}
              <span className="text-ink-500">{study.titleMuted}</span>
            </>
          )}
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          {study.summary}
        </p>

        {/* Fact snapshot — the strip a buying committee screenshots */}
        <dl className="mt-12 grid grid-cols-1 gap-y-4 border-y border-rule py-5 sm:grid-cols-2 sm:gap-y-5 lg:grid-cols-4 lg:divide-x lg:divide-rule lg:gap-y-0">
          {snapshot.map((cell, i) => (
            <div key={cell.label} className={i > 0 ? 'lg:pl-6' : ''}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
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
                  {stat.value}
                </p>
                <p className="text-sm leading-snug text-ink-500">{stat.label}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
