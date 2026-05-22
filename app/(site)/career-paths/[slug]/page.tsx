import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { PathBody } from '@/components/sections/career-path-detail/PathBody'
import { PathHero } from '@/components/sections/career-path-detail/PathHero'
import { PathRelated } from '@/components/sections/career-path-detail/PathRelated'
import { PathTOC } from '@/components/sections/career-path-detail/PathTOC'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema } from '@/lib/schema'
import { business } from '@/lib/business'
import {
  getAllCareerPaths,
  getAllCareerPathSlugs,
  getCareerPathBySlug,
} from '@/sanity/lib/career-paths'

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

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Career paths', url: `${business.url}/career-paths/` },
          { name: path.title, url: `${business.url}/career-paths/${slug}/` },
        ])}
      />

      <PathHero path={path} />

      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 md:pb-28 md:pt-8 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <PathTOC body={path.body} />
              </div>
            </aside>

            <PathBody body={path.body} />
          </div>
        </div>
      </section>

      <PathRelated paths={siblings} />

      <FinalCTARail />
    </>
  )
}
