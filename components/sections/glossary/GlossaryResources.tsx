import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { GlossaryTerm } from '@/sanity/lib/glossary'

type Resource = NonNullable<GlossaryTerm['relatedResources']>[number]

const KIND_LABEL: Record<string, string> = {
  'career-path': 'Career path',
  service: 'Service',
}

/**
 * /glossary/[term]/ — "Related paths & services" rail (the outbound funnel).
 *
 * The reverse of the inbound links: role/measurement terms point out to the
 * career paths and service pages they lead to, so authority circulates instead
 * of pooling in the glossary. Plain internal links (services are static pages;
 * career paths are Sanity docs, linked the same way for one consistent rail).
 * Renders nothing when a term has no resources.
 */
export function GlossaryResources({ resources }: { resources?: Resource[] }) {
  const items = (resources ?? []).filter((r) => r?.href && r?.label)
  if (items.length === 0) return null

  return (
    <SectionRail tone="surface" size="sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        Related paths &amp; services
      </p>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => (
          <li key={`${r.href}-${i}`}>
            <Link
              href={r.href}
              className="group flex h-full flex-col bg-surface p-5 transition-colors duration-200 hover:bg-paper"
            >
              {r.kind && (
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
                  {KIND_LABEL[r.kind] ?? r.kind}
                </span>
              )}
              <h3 className="mt-2 font-display text-base font-semibold tracking-[-0.01em] text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
                {r.label}
              </h3>
              {r.blurb && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">{r.blurb}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
