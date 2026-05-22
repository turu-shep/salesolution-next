import Link from 'next/link'

import type { CareerPath } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — editorial hero.
 *
 * Mirrors the language established by the hub (`CareerPathsGrid` featured
 * card) and the services routes (`ServicesHero`): mono breadcrumb, mono
 * eyebrow, large two-tone H1 (title + lede tail), lede paragraph, mono
 * metadata strip (For / Level / Duration).
 *
 * Why we don't reuse `ServicesHero` directly: the metadata strip is the
 * load-bearing element of a learning path. A reader scans Level + Duration
 * before they invest in the body. Services hero has CTAs in that position;
 * we don't (the only CTA on a path is "read the body below").
 *
 * The accent-orange "Start here" badge appears when the path is flagged as
 * the recommended entry point — for now that means `level === 'Entry'`.
 * The hub uses the same heuristic (featured = first/newest), so the
 * editorial signal stays consistent.
 */
export function PathHero({ path }: { path: CareerPath }) {
  const isEntryPoint = path.level === 'Entry'

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 md:pb-10 md:pt-12 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500"
        >
          <Link
            href="/career-paths/"
            className="transition-colors duration-200 hover:text-brand-600"
          >
            Career paths
          </Link>
          <span aria-hidden className="mx-2 text-ink-300">
            /
          </span>
          <span className="text-ink-700">
            {path.level ? `${path.level} path` : 'Path'}
          </span>
        </nav>

        {isEntryPoint && (
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500"
            />
            Start here
          </p>
        )}

        <h1
          className={
            'font-display font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900 text-balance ' +
            'text-3xl sm:text-4xl md:text-5xl ' +
            (isEntryPoint ? 'mt-3' : 'mt-5')
          }
        >
          {path.title}
        </h1>

        {path.description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
            {path.description}
          </p>
        )}

        {/* Metadata strip — three columns on desktop, hairline-divided */}
        <dl className="mt-8 grid grid-cols-1 gap-px border-y border-rule sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-rule">
          <MetaCell label="For">
            {path.role ? (
              <span className="text-ink-900">{path.role}</span>
            ) : (
              <span className="text-ink-500">All roles</span>
            )}
          </MetaCell>
          <MetaCell label="Level">
            {path.level ? (
              <span className="text-ink-900">{path.level}</span>
            ) : (
              <span className="text-ink-500">—</span>
            )}
          </MetaCell>
          <MetaCell label="Duration">
            {path.duration ? (
              <span className="text-ink-900">{path.duration}</span>
            ) : (
              <span className="text-ink-500">Self-paced</span>
            )}
          </MetaCell>
        </dl>
      </div>
    </section>
  )
}

function MetaCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-5 sm:flex-col sm:items-start sm:justify-start sm:gap-3 sm:px-6 sm:py-6 sm:first:pl-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </dt>
      <dd className="font-mono text-sm normal-case tracking-[0.02em]">
        {children}
      </dd>
    </div>
  )
}
