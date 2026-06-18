import Link from 'next/link'

import type { CareerPathCard } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — compact "Before this path" line at the top of the
 * content column. Renders the path's `prerequisites` (other paths a reader
 * should know first, e.g. SEO Specialist before GEO Specialist), making the
 * dependency between paths visible without a graph. Renders nothing when empty.
 */
export function PathPrereqs({ paths }: { paths?: CareerPathCard[] }) {
  if (!paths || paths.length === 0) return null

  return (
    <div className="mb-8 border-l-2 border-rule-strong bg-surface px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        Before this path
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
        Know this first:{' '}
        {paths.map((p, i) => (
          <span key={p._id}>
            <Link
              href={`/career-paths/${p.slug}/`}
              className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-2 transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              {p.title}
            </Link>
            {i < paths.length - 1 ? ', ' : ''}
          </span>
        ))}
        .
      </p>
    </div>
  )
}
