'use client'

import { useMemo, useState } from 'react'

import { GuideCard } from './GuideCard'
import { cn } from '@/lib/cn'
import type { GuideCard as Guide } from '@/sanity/lib/guides'

const ALL = '__all'

export function GuideGrid({ guides }: { guides: Guide[] }) {
  const [selected, setSelected] = useState<string>(ALL)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const g of guides) if (g.category) seen.add(g.category)
    return [...seen].sort()
  }, [guides])

  const filtered = useMemo(
    () => (selected === ALL ? guides : guides.filter((g) => g.category === selected)),
    [guides, selected],
  )

  if (guides.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-surface-tint-cool p-10 text-center ring-1 ring-ink-300/10">
        <p className="font-display text-xl font-semibold text-ink-900">No guides yet</p>
        <p className="mt-3 text-sm text-ink-500">
          Once the guide migration runs, the 9 existing checklists + new pieces
          will live here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelected(ALL)}
          className={cn(
            'rounded-pill px-4 py-1.5 text-sm font-medium transition',
            selected === ALL
              ? 'bg-brand-600 text-white'
              : 'bg-surface-alt text-ink-700 hover:bg-brand-100',
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelected(c)}
            className={cn(
              'rounded-pill px-4 py-1.5 text-sm font-medium capitalize transition',
              selected === c
                ? 'bg-brand-600 text-white'
                : 'bg-surface-alt text-ink-700 hover:bg-brand-100',
            )}
          >
            {c.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <GuideCard key={g._id} guide={g} />
        ))}
      </div>
    </>
  )
}
