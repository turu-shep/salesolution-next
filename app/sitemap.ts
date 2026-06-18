import type { MetadataRoute } from 'next'

import { business } from '@/lib/business'
import { TOOL_PAGES } from '@/lib/tools/pages'
import {
  CLUSTER_INDEX_THRESHOLD,
  GLOSSARY_CLUSTERS,
  GLOSSARY_INDEX_THRESHOLD,
} from '@/lib/glossary-config'

/**
 * Generates /sitemap.xml. Replaces the Rank Math `sitemap_index.xml` from the
 * WordPress site with a single sitemap (well under the 50k-URL limit).
 *
 * Composition:
 *   - Static marketing routes (this file)
 *   - Dynamic content from Sanity (posts, guides, career paths) — added once
 *     the CMS has entries. The fetch is wrapped in try/catch so a Sanity outage
 *     or unconfigured env still produces a valid sitemap.
 *
 * Excludes: /studio/*, /api/*, /dev/*, and the thank-you pages (those are
 * noindex per their own metadata exports).
 */

type Entry = {
  url: string
  lastModified?: string | Date
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}

const BASE = business.url

// Static marketing routes — sourced from docs/strategy/02-information-architecture.md.
const STATIC_ROUTES: Entry[] = [
  { url: `${BASE}/`,                                      changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE}/services/`,                             changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE}/services/ai-seo/`,                      changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/services/catalog-ai/`,                  changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/services/editorial-authority/`,         changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/services/full-growth-ownership/`,       changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/services/website-development-design-services/`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/services/outbound-email-marketing-services/`,   changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/contact-me/`,                           changeFrequency: 'yearly',  priority: 0.7 },
  { url: `${BASE}/about/`,                                 changeFrequency: 'yearly',  priority: 0.6 },
  { url: `${BASE}/unlock-growth-audit/`,                  changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/future-proof-your-seo/`,                changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/book-growth-call/`,                     changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/constraint-sprint/`,                    changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/catalog-snapshot/`,                     changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/case-studies/`,                         changeFrequency: 'monthly', priority: 0.8 },
  // Free tools — standalone link-magnet surfaces (detail pages added below).
  { url: `${BASE}/tools/`,                                changeFrequency: 'monthly', priority: 0.8 },
  // Industry hub — the proof-led entry for the industrial vertical.
  { url: `${BASE}/industries/industrial-distribution/`,   changeFrequency: 'monthly', priority: 0.8 },
  // Revenue Engine cluster — surfaced in nav ("Who We Serve"), so it leaves the
  // orphan stage and must be indexable.
  { url: `${BASE}/revenue-engine/`,                       changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/revenue-engine/home-services/`,         changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/revenue-engine/dentists/`,              changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/guides/`,                               changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE}/guides/seo-guides/`,                    changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/guides/website-development-and-design-guides/`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/guides/email-marketing-guides/`,        changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/category/blog/`,                        changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE}/career-paths/`,                         changeFrequency: 'monthly', priority: 0.6 },
  // NOTE: /glossary/ is added conditionally in sitemap() below — it stays out
  // until the published-term count clears GLOSSARY_INDEX_THRESHOLD, matching the
  // hub route's own noindex gate. Listing it unconditionally while the hub is
  // noindexed triggers a "submitted URL marked noindex" warning in GSC.
  { url: `${BASE}/service-areas/`,                        changeFrequency: 'monthly', priority: 0.5 },
  // Legal — low priority but indexable.
  { url: `${BASE}/privacy-policy/`,                       changeFrequency: 'yearly',  priority: 0.2 },
  { url: `${BASE}/terms-of-service/`,                     changeFrequency: 'yearly',  priority: 0.2 },
  { url: `${BASE}/disclaimer/`,                           changeFrequency: 'yearly',  priority: 0.2 },
  { url: `${BASE}/opt-out-preferences/`,                  changeFrequency: 'yearly',  priority: 0.2 },
]

async function fetchSanityRoutes(): Promise<{
  entries: Entry[]
  clusterCounts: Record<string, number>
}> {
  // Lazy import — fail soft if Sanity isn't configured (env missing in CI etc.)
  try {
    const { sanityClient } = await import('@/sanity/lib/client')
    const docs = await sanityClient.fetch<
      {
        _type: 'post' | 'guide' | 'careerPath' | 'caseStudy' | 'glossaryTerm'
        slug: { current: string }
        updatedAt?: string
        publishedAt?: string
        cluster?: string
      }[]
    >(
      `*[_type in ["post","guide","careerPath","caseStudy","glossaryTerm"] && defined(slug.current)]{
         _type, slug, updatedAt, publishedAt, cluster
       }`,
    )

    // Per-cluster published-term counts drive which /glossary/cluster/<slug>/
    // pages are indexable + listed (the cluster route applies the same gate).
    const clusterCounts: Record<string, number> = {}
    for (const d of docs) {
      if (d._type === 'glossaryTerm' && d.cluster) {
        clusterCounts[d.cluster] = (clusterCounts[d.cluster] ?? 0) + 1
      }
    }

    // Glossary term pages are individually indexable as soon as they publish;
    // the /glossary/ hub itself is held out of the sitemap (and noindexed by
    // its own route) until it clears the term threshold — see that route.
    const PATH_PREFIX: Record<string, string> = {
      post: '',
      guide: '/guides',
      careerPath: '/career-paths',
      caseStudy: '/case-studies',
      glossaryTerm: '/glossary',
    }

    const PRIORITY: Record<string, number> = {
      post: 0.7,
      caseStudy: 0.7,
      guide: 0.6,
      careerPath: 0.6,
      glossaryTerm: 0.5,
    }

    const entries: Entry[] = docs.map((d) => {
      const lastMod = d.updatedAt ?? d.publishedAt
      return {
        url: `${BASE}${PATH_PREFIX[d._type] ?? ''}/${d.slug.current}/`,
        lastModified: lastMod ? new Date(lastMod) : undefined,
        changeFrequency: 'monthly',
        priority: PRIORITY[d._type] ?? 0.6,
      }
    })
    return { entries, clusterCounts }
  } catch (err) {
    console.warn('[sitemap] Sanity fetch failed, returning static-only:', err)
    return { entries: [], clusterCounts: {} }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { entries: dynamic, clusterCounts } = await fetchSanityRoutes()

  // Add the /glossary/ hub only once it carries enough published terms — the
  // same gate the hub route applies via GLOSSARY_INDEX_THRESHOLD before it
  // self-noindexes. Counting the per-term pages already in `dynamic` avoids a
  // second query and keeps the sitemap fail-soft (no terms fetched → hub omitted
  // rather than listed-but-noindexed).
  const glossaryTermCount = dynamic.filter((e) =>
    e.url.startsWith(`${BASE}/glossary/`),
  ).length
  const hubLive = glossaryTermCount >= GLOSSARY_INDEX_THRESHOLD
  const conditional: Entry[] = hubLive
    ? [{ url: `${BASE}/glossary/`, changeFrequency: 'weekly', priority: 0.6 }]
    : []

  // Cluster pages: listed only when the hub is live AND the cluster clears its
  // own term threshold (matches each cluster route's noindex gate, so the
  // sitemap never lists a noindexed cluster page).
  const clusterEntries: Entry[] = hubLive
    ? GLOSSARY_CLUSTERS.filter(
        (c) => (clusterCounts[c.value] ?? 0) >= CLUSTER_INDEX_THRESHOLD,
      ).map((c) => ({
        url: `${BASE}/glossary/cluster/${c.value}/`,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
    : []

  // Standalone tool detail pages — always live (no Sanity dependency).
  const toolRoutes: Entry[] = TOOL_PAGES.map((t) => ({
    url: `${BASE}/tools/${t.slug}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...[...STATIC_ROUTES, ...conditional, ...clusterEntries, ...toolRoutes].map((r) => ({
      ...r,
      lastModified: r.lastModified ?? new Date(),
    })),
    ...dynamic,
  ]
}
