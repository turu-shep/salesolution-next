import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { CareerPathCard } from '@/sanity/lib/career-paths'

/**
 * /career-paths/ — Card grid.
 *
 * Pure presentational component. Receives the list from the page server
 * component (which owns the Sanity fetch + error handling) and renders
 * each path as an editorial card: hairline border on paper, mono
 * metadata bar, two-line title, lede, hover lift to brand-blue.
 *
 * Grouping: paths split into **Roles** (hireable professions with a career
 * ladder) and **Specializations** (skills usually bought as a project or held
 * inside a role). Each group is its own labelled block, so a reader sees the
 * two kinds as distinct shelves rather than one flat list. Within the Roles
 * group the first card runs featured ("Read first"); specializations flow as a
 * plain 2-up grid. A group with no items is skipped.
 *
 * Why featured-first instead of letting Sanity tag a featured flag:
 * the publishedAt order already encodes editorial weight (newest = most
 * promoted). Adding a feature flag is premature until there are enough
 * paths to warrant manual curation.
 */

export function CareerPathsGrid({
  paths,
  id,
}: {
  paths: CareerPathCard[]
  id?: string
}) {
  if (paths.length === 0) {
    return (
      <SectionRail tone="paper" id={id}>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            The library
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Paths in progress.{' '}
            <span className="text-ink-500">First two land this quarter.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            The SEO Specialist and Content Strategy Specialist tracks are
            being written by the same operator who runs client engagements
            &mdash; no ghost-written affiliate content, no chapter padding.
          </p>
        </div>

        <div className="mt-14 border border-rule bg-surface p-8 md:p-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Status &middot; drafting
          </p>
          <ul className="mt-6 divide-y divide-rule">
            {[
              {
                title: 'SEO Specialist',
                meta: 'Entry · ~12 hours of reading',
                desc:
                  'From query intent to AI-Overview citation engineering. Built for the working analyst.',
              },
              {
                title: 'Content Strategy Specialist',
                meta: 'Mid · ~14 hours of reading',
                desc:
                  'Pillar maps, topic clusters, editorial calendars for technical B2B.',
              },
            ].map((p) => (
              <li
                key={p.title}
                className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:justify-between"
              >
                <div className="md:max-w-xl">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-ink-700">{p.desc}</p>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {p.meta}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </SectionRail>
    )
  }

  const roles = paths.filter((p) => (p.kind ?? 'role') === 'role')
  const specializations = paths.filter((p) => p.kind === 'specialization')

  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The library
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {paths.length === 1 ? 'One path.' : `${paths.length} paths.`}{' '}
          <span className="text-ink-500">All free, all self-paced.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Each path is a numbered run of skill modules &mdash; a real scenario,
          the edge cases, and a check-yourself prompt at every step. No video
          lock-ins, no email-gate, no upsell ladder.
        </p>
      </div>

      {roles.length > 0 && (
        <PathGroup
          label="Roles"
          blurb="Professions you can hire for full-time, each with a career ladder from entry to senior."
          paths={roles}
          featureFirst
        />
      )}

      {specializations.length > 0 && (
        <PathGroup
          label="Specializations"
          blurb="Skills you usually buy as a project or keep inside a role, not a constant full-time hire."
          paths={specializations}
        />
      )}
    </SectionRail>
  )
}

function PathGroup({
  label,
  blurb,
  paths,
  featureFirst = false,
}: {
  label: string
  blurb: string
  paths: CareerPathCard[]
  featureFirst?: boolean
}) {
  const [first, ...rest] = paths

  return (
    <div className="mt-16 first:mt-14">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-4">
        <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900 sm:text-3xl">
          {label}
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {paths.length} {paths.length === 1 ? 'path' : 'paths'}
        </p>
      </div>
      <p className="mt-4 max-w-2xl text-ink-700">{blurb}</p>

      <ol className="mt-8 grid gap-6 md:grid-cols-2">
        {featureFirst ? (
          <>
            <PathCard path={first} featured />
            {rest.map((p) => (
              <PathCard key={p._id} path={p} />
            ))}
          </>
        ) : (
          paths.map((p) => <PathCard key={p._id} path={p} />)
        )}
      </ol>
    </div>
  )
}

function PathCard({
  path,
  featured = false,
}: {
  path: CareerPathCard
  featured?: boolean
}) {
  const meta = [path.level, path.duration ?? 'self-paced'].filter(Boolean)

  return (
    <li className={featured ? 'group relative md:col-span-2' : 'group relative'}>
      <Link
        href={`/career-paths/${path.slug}/`}
        className={`block h-full border bg-surface p-6 transition-colors duration-200 hover:border-ink-900 md:p-8 ${
          featured
            ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.20)]'
            : 'border-rule'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {meta.join(' · ')}
          </p>
          {featured && (
            <span className="inline-block rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Read first
            </span>
          )}
        </div>

        <h3
          className={`font-display font-semibold tracking-[-0.01em] text-ink-900 ${
            featured ? 'mt-4 text-3xl sm:text-4xl' : 'mt-3 text-xl sm:text-2xl'
          }`}
        >
          {path.title}
        </h3>

        {path.role && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            For &middot; {path.role}
          </p>
        )}

        {path.description && (
          <p
            className={`mt-4 max-w-2xl text-ink-700 ${featured ? 'text-lg leading-relaxed' : ''}`}
          >
            {path.description}
          </p>
        )}

        <p className="mt-6 inline-flex items-center gap-1.5 border-t border-rule pt-4 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
          Open the path
          <span aria-hidden>→</span>
        </p>
      </Link>
    </li>
  )
}
