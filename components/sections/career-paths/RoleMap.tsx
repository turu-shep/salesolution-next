import Link from 'next/link'

import { groupRolePathsByStage } from '@/lib/career-path-stages'
import type { CareerPathMapEntry } from '@/sanity/lib/career-paths'

/**
 * Role map (doc 11 §T7) — the career paths as three labelled stages
 * (Start here → Core roles → Specialize), each a column of cards. Static,
 * on-brand (matches the hub card look), fully responsive, no arrow spaghetti.
 * `highlightSlug` marks the current path on a path page. The detailed
 * relationships ("before this / where this leads") live in the path rails.
 */
export function RoleMap({
  entries,
  highlightSlug,
  className,
}: {
  entries: CareerPathMapEntry[]
  highlightSlug?: string
  className?: string
}) {
  if (!entries || entries.length < 2) return null
  const stages = groupRolePathsByStage(entries)

  return (
    <div className={className}>
      <ol className="grid gap-x-6 gap-y-10 md:grid-cols-3">
        {stages.map((stage, i) => (
          <li key={stage.key} className="relative">
            {/* progression chevron between columns (desktop only) */}
            {i > 0 && (
              <span
                aria-hidden
                className="absolute -left-4 top-1 hidden -translate-x-1/2 text-ink-300 md:block"
              >
                &rarr;
              </span>
            )}
            <div className="flex items-baseline gap-2 border-b border-rule pb-2.5">
              <span className="font-mono text-[11px] tabular-nums tracking-[0.18em] text-ink-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-800">
                {stage.label}
              </h3>
            </div>
            <p className="mt-2.5 text-sm text-ink-500">{stage.blurb}</p>

            <ul className="mt-4 space-y-3">
              {stage.paths.map((p) => (
                <PathChip key={p.slug} path={p} current={p.slug === highlightSlug} />
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
        Foundations <span className="text-ink-300">&rarr;</span> roles you hire{' '}
        <span className="text-ink-300">&rarr;</span> skills you buy as a project
      </p>
    </div>
  )
}

function PathChip({
  path,
  current,
}: {
  path: CareerPathMapEntry
  current: boolean
}) {
  const kindLabel = path.kind === 'specialization' ? 'Specialization' : 'Role'
  return (
    <li>
      <Link
        href={`/career-paths/${path.slug}/`}
        aria-current={current ? 'page' : undefined}
        className={
          'group block border p-4 transition-colors duration-200 ' +
          (current
            ? 'border-brand-600 bg-surface-tint-blue'
            : 'border-rule bg-surface hover:border-ink-900')
        }
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            {kindLabel}
          </span>
          {current && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-600">
              You&rsquo;re here
            </span>
          )}
        </div>
        <p className="mt-1.5 font-display text-base font-semibold tracking-[-0.01em] text-ink-900">
          {path.title}
        </p>
        {path.level && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {path.level}
          </p>
        )}
      </Link>
    </li>
  )
}
