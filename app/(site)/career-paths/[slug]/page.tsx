import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { PathBody } from '@/components/sections/career-path-detail/PathBody'
import { PathBuyer } from '@/components/sections/career-path-detail/PathBuyer'
import { PathHero } from '@/components/sections/career-path-detail/PathHero'
import { PathEnrichments } from '@/components/sections/career-path-detail/PathEnrichments'
import { PathModules } from '@/components/sections/career-path-detail/PathModules'
import { PathPrereqs } from '@/components/sections/career-path-detail/PathPrereqs'
import { PathRelated } from '@/components/sections/career-path-detail/PathRelated'
import { PathSeniority } from '@/components/sections/career-path-detail/PathSeniority'
import { PathTerms } from '@/components/sections/career-path-detail/PathTerms'
import { PathTOC } from '@/components/sections/career-path-detail/PathTOC'
import { RoleMap } from '@/components/sections/career-paths/RoleMap'
import { SectionRail } from '@/components/layout/SectionRail'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, careerPathSchema } from '@/lib/schema'
import { business } from '@/lib/business'
import {
  getAllCareerPaths,
  getAllCareerPathSlugs,
  getCareerPathBySlug,
  getCareerPathsForMap,
  orderModules,
} from '@/sanity/lib/career-paths'
import { slugifyHeading } from '@/lib/slug'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllCareerPathSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const path = await getCareerPathBySlug(slug).catch(() => null)
  if (!path) return { title: 'Not found' }

  return {
    title: path.seo?.metaTitle ?? path.title,
    description: path.seo?.metaDescription ?? path.description,
    alternates: { canonical: `${business.url}/career-paths/${slug}/` },
    robots: path.seo?.noindex ? { index: false, follow: false } : undefined,
  }
}

export const revalidate = 3600

export default async function CareerPathPage({ params }: Props) {
  const { slug } = await params

  let path
  try {
    path = await getCareerPathBySlug(slug)
  } catch (err) {
    console.warn('[career path page] Sanity fetch failed:', err)
    notFound()
  }

  if (!path) notFound()

  // Sibling paths for the "Keep reading" rail. Failures degrade silently —
  // the rail renders nothing if the list is empty, so a Sanity hiccup at
  // the bottom of the page never blocks the article above it.
  let siblings = await getAllCareerPaths().catch(() => [])
  siblings = siblings.filter((p) => p.slug !== slug)

  const mapEntries = await getCareerPathsForMap().catch(() => [])

  const MATRIX_ID = 'at-each-level'
  const BUYER_ID = 'hiring-this-role'
  const kind = path.kind ?? 'role'
  const buyerHeading =
    kind === 'specialization' ? 'Need this done?' : 'Hiring this role?'
  const ordered = orderModules(path.modules ?? [])
  const hasModules = ordered.length > 0
  const moduleToc = ordered.map((m) => ({
    text: `${String(m.n).padStart(2, '0')} · ${m.title}`,
    id: slugifyHeading(m.title ?? ''),
    group: m.level,
  }))
  const bodyHasContent = Array.isArray(path.body) && path.body.length > 0
  const hasMatrix = (path.seniorityMatrix ?? []).some((r) => r?.level)
  const b = path.buyerSection
  const hasBuyer = Boolean(
    b &&
      (b.whatTheyDo ||
        (b.signsYouNeedOne && b.signsYouNeedOne.length > 0) ||
        (Array.isArray(b.inHouseVsAgency) && b.inHouseVsAgency.length > 0) ||
        b.costReality),
  )

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Career paths', url: `${business.url}/career-paths/` },
          { name: path.title, url: `${business.url}/career-paths/${slug}/` },
        ])}
      />
      {hasModules && (
        <JsonLd
          data={careerPathSchema({
            title: path.title,
            slug,
            description: path.description,
            kind,
            modules: ordered.map((m) => ({ n: m.n, title: m.title, skill: m.skill })),
          })}
        />
      )}

      <PathHero path={path} />

      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 md:pb-16 md:pt-8 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <PathTOC
                  body={path.body}
                  items={hasModules ? moduleToc : undefined}
                  topAnchor={!hasModules && hasMatrix ? { text: 'At each level', id: MATRIX_ID } : undefined}
                  bottomAnchor={hasBuyer ? { text: buyerHeading, id: BUYER_ID } : undefined}
                />
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-8 md:hidden">
                <PathTOC
                  body={path.body}
                  items={hasModules ? moduleToc : undefined}
                  topAnchor={!hasModules && hasMatrix ? { text: 'At each level', id: MATRIX_ID } : undefined}
                  bottomAnchor={hasBuyer ? { text: buyerHeading, id: BUYER_ID } : undefined}
                  mobile
                />
              </div>
              {path.lastReviewed && (
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Reviewed {formatReviewed(path.lastReviewed)}
                </p>
              )}
              <PathPrereqs paths={path.prerequisites} />
              <PathEnrichments enrichments={path.enrichments} placement="top" />
              {hasModules ? (
                <>
                  {bodyHasContent && <PathBody body={path.body} />}
                  <PathModules ordered={ordered} matrix={path.seniorityMatrix} />
                </>
              ) : (
                <>
                  {hasMatrix && (
                    <PathSeniority matrix={path.seniorityMatrix!} id={MATRIX_ID} />
                  )}
                  <PathBody body={path.body} />
                </>
              )}
              <PathEnrichments enrichments={path.enrichments} placement="after-modules" />
              <PathEnrichments enrichments={path.enrichments} placement="buyer" />
              {hasBuyer && <PathBuyer section={b!} id={BUYER_ID} kind={kind} />}
            </div>
          </div>
        </div>
      </section>

      {mapEntries.length > 1 && (
        <SectionRail tone="paper" id="map">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Where this sits
            </p>
            <h2 className="mt-3 font-display text-balance text-2xl font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900 sm:text-3xl">
              {path.title} in the map.
            </h2>
            <p className="mt-4 leading-relaxed text-ink-700">
              The three stages of the hub, with this path marked. The exact paths
              before and after it are in the rails above.
            </p>
          </div>
          <RoleMap entries={mapEntries} highlightSlug={slug} className="mt-8" />
        </SectionRail>
      )}

      <PathTerms terms={path.relatedTerms} />

      {path.leadsTo && path.leadsTo.length > 0 ? (
        <PathRelated
          paths={path.leadsTo}
          eyebrow="What's next"
          heading="Where this leads"
          headingMuted="next."
        />
      ) : (
        <PathRelated paths={siblings} />
      )}

      <FinalCTARail />
    </>
  )
}

function formatReviewed(date: string): string {
  const [year, month] = date.split('-')
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const name = months[Number(month) - 1]
  return name ? `${name} ${year}` : year
}
