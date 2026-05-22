import { SectionRail } from '@/components/layout/SectionRail'
import { GuidesLibraryCard } from '@/components/sections/guides/GuidesLibraryCard'
import type { GuideCard as Guide } from '@/sanity/lib/guides'

/**
 * "Keep reading" block at the bottom of every guide detail.
 *
 * Reuses `GuidesLibraryCard` so the grid matches the hub exactly — the
 * idea is that a reader leaving a guide lands back into the same library
 * voice they came from. Editorial paper tone, hairline header.
 */
export function GuideRelated({
  guides,
  eyebrow = 'Keep reading',
  heading = 'Related guides',
  subhead,
}: {
  guides: Guide[]
  eyebrow?: string
  heading?: string
  subhead?: string
}) {
  if (!guides.length) return null

  return (
    <SectionRail tone="paper">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900 sm:text-4xl">
          {heading}
        </h2>
        {subhead && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-700">
            {subhead}
          </p>
        )}
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <li key={g._id} className="flex">
            <GuidesLibraryCard guide={g} />
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
