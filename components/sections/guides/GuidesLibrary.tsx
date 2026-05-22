'use client'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/cn'
import type { GuideCard as Guide } from '@/sanity/lib/guides'

import { GuidesLibraryCard } from './GuidesLibraryCard'

const ALL = '__all'

/**
 * The full library grid for the /guides/ hub.
 *
 * Editorial card grid with a row of mono filter pills. Filters by category
 * client-side — no URL state because the grid is small enough that deep-link
 * filtering would add complexity without much SEO upside (each category also
 * has its own URL under /guides/[category]/).
 *
 * Replaces the older `GuideGrid` (kept for category subpages still using it).
 */
export function GuidesLibrary({
  guides,
  excludeIds,
}: {
  guides: Guide[]
  excludeIds?: string[]
}) {
  const [selected, setSelected] = useState<string>(ALL)

  const visible = useMemo(
    () =>
      excludeIds && excludeIds.length > 0
        ? guides.filter((g) => !excludeIds.includes(g._id))
        : guides,
    [guides, excludeIds],
  )

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const g of visible) if (g.category) seen.add(g.category)
    return [...seen].sort()
  }, [visible])

  const filtered = useMemo(
    () =>
      selected === ALL
        ? visible
        : visible.filter((g) => g.category === selected),
    [visible, selected],
  )

  if (visible.length === 0) {
    return (
      <div className="border border-rule bg-paper p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Empty library
        </p>
        <p className="mt-3 font-display text-xl font-semibold text-ink-900">
          No guides yet
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">
          New deep-dives are queued. Check back &mdash; or get the audit and
          we&rsquo;ll send the relevant ones direct.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-rule pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Filter · topic
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FilterChip
              label="All"
              count={visible.length}
              active={selected === ALL}
              onClick={() => setSelected(ALL)}
            />
            {categories.map((c) => {
              const count = visible.filter((g) => g.category === c).length
              return (
                <FilterChip
                  key={c}
                  label={c.replace(/-/g, ' ')}
                  count={count}
                  active={selected === c}
                  onClick={() => setSelected(c)}
                />
              )
            })}
          </div>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <li key={g._id} className="flex">
            <GuidesLibraryCard guide={g} />
          </li>
        ))}
      </ul>
    </>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-rule-strong bg-paper text-ink-700 hover:border-ink-900 hover:text-ink-900',
      )}
      aria-pressed={active}
      aria-label={`Filter by ${label} (${count} ${count === 1 ? 'entry' : 'entries'})`}
    >
      <span className="capitalize">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          active ? 'text-white/80' : 'text-ink-500',
        )}
      >
        {count}
      </span>
    </button>
  )
}
