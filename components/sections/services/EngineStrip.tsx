import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CYLINDER_GROUPS } from '@/lib/revenue-engine'

/**
 * Engine-framing band for a cylinder (/services/*) page. Names the cylinder as
 * one part of the Revenue Engine and links the cylinders it runs next to (its
 * pillar siblings), plus the whole engine and the full library. Auto-derived
 * from CYLINDER_GROUPS by slug, so it stays in sync as the catalog changes.
 *
 * Drop in near the end of a cylinder page (after the main content, before the
 * FAQ/close): `<EngineStrip currentSlug="ai-seo" />`.
 */
export function EngineStrip({ currentSlug, id }: { currentSlug: string; id?: string }) {
  const group = CYLINDER_GROUPS.find((g) =>
    g.cylinders.some((c) => c.slug === currentSlug),
  )
  if (!group) return null

  const current = group.cylinders.find((c) => c.slug === currentSlug)
  if (!current) return null

  const siblings = group.cylinders.filter((c) => c.slug !== currentSlug)
  if (siblings.length === 0) return null

  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Part of the Revenue Engine
        </p>
        <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900 sm:text-4xl">
          Where {current.name} fits in the engine.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-700">
          {current.name} is a {group.pillar} cylinder. It runs on its own, and it
          compounds with the parts next to it:
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {siblings.map((c) => {
          const inner = (
            <>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">
                <span aria-hidden className="h-1 w-1 rounded-full bg-brand-500" />
                {c.name}
                {!c.slug && (
                  <span className="ml-auto rounded-full border border-rule px-1.5 py-px text-[9px] font-medium tracking-[0.1em] text-ink-500">
                    Coming soon
                  </span>
                )}
              </span>
              <p className="mt-3 flex-1 leading-relaxed text-ink-700">{c.fires}</p>
              {c.slug && (
                <span
                  aria-hidden
                  className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-ink-900 transition-transform group-hover:translate-x-0.5"
                >
                  See {c.name} →
                </span>
              )}
            </>
          )
          return c.slug ? (
            <Link
              key={c.name}
              href={`/services/${c.slug}/`}
              data-cta={`engine-strip-${c.slug}`}
              data-cta-location={`cylinder-engine-${currentSlug}`}
              className="group flex h-full flex-col rounded-[4px] border border-rule bg-surface p-6 transition-colors hover:border-ink-900"
            >
              {inner}
            </Link>
          ) : (
            <div key={c.name} className="flex h-full flex-col rounded-[4px] border border-dashed border-rule bg-surface/50 p-6">
              {inner}
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-base leading-relaxed text-ink-600">
        <Link
          href="/revenue-engine/"
          data-cta="engine-strip-whole-engine"
          data-cta-location={`cylinder-engine-${currentSlug}`}
          className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
        >
          See how the whole engine runs
        </Link>{' '}
        ·{' '}
        <Link
          href="/services/"
          data-cta="engine-strip-all-cylinders"
          data-cta-location={`cylinder-engine-${currentSlug}`}
          className="font-medium text-ink-900 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-brand-700"
        >
          all the cylinders
        </Link>
        .
      </p>
    </SectionRail>
  )
}
