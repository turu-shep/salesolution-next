import 'server-only'

import {
  CLUSTER_INDEX_THRESHOLD,
  GLOSSARY_CLUSTERS,
  GLOSSARY_INDEX_THRESHOLD,
} from '@/lib/glossary-config'

import {
  BASE,
  BLOG_HUBS,
  CAREER_HUBS,
  CASE_STUDIES_HUB,
  CORE_PAGES,
  GUIDE_HUBS,
  LANDING_PAGES,
  TOOLS_HUB,
  TOOL_URLS,
  type ChildId,
  type SitemapUrl,
} from './registry'

/**
 * Cache tags on the sitemap's Sanity fetch. The five content-type tags match
 * what the /api/revalidate webhook busts by `_type` (so publishing a doc in
 * Studio updates the sitemap within seconds — no redeploy), and the shared
 * `sitemap` tag is what the daily cron busts. Keeping both means the sitemap
 * never goes stale between deploys.
 *
 * NOTE: for caseStudy + glossaryTerm to bust on publish, the Sanity webhook's
 * GROQ filter must include them — see app/api/revalidate/route.ts.
 */
export const SITEMAP_TAGS = [
  'post',
  'guide',
  'careerPath',
  'caseStudy',
  'glossaryTerm',
  'sitemap',
]

type DynamicType = 'post' | 'guide' | 'careerPath' | 'caseStudy' | 'glossaryTerm'

type DynamicDoc = {
  _type: DynamicType
  slug: { current: string }
  updatedAt?: string
  publishedAt?: string
  _updatedAt?: string
  cluster?: string
  noindex?: boolean
}

const PATH_PREFIX: Record<DynamicType, string> = {
  post: '',
  guide: '/guides',
  careerPath: '/career-paths',
  caseStudy: '/case-studies',
  glossaryTerm: '/glossary',
}

const PRIORITY: Record<DynamicType, number> = {
  post: 0.7,
  caseStudy: 0.7,
  guide: 0.6,
  careerPath: 0.6,
  glossaryTerm: 0.5,
}

const SECTION_OF: Record<DynamicType, ChildId> = {
  post: 'blog',
  guide: 'guides',
  careerPath: 'career-paths',
  caseStudy: 'case-studies',
  glossaryTerm: 'glossary',
}

function lastModOf(d: DynamicDoc): Date | undefined {
  const v = d.updatedAt ?? d.publishedAt ?? d._updatedAt
  return v ? new Date(v) : undefined
}

async function fetchDynamicDocs(): Promise<DynamicDoc[]> {
  // Lazy import — sanity/env.ts throws at module load when env vars are missing,
  // so the import must live inside the try to keep the sitemap fail-soft (a
  // Sanity outage or unconfigured env still yields a valid static-only sitemap).
  try {
    const { sanityClient } = await import('@/sanity/lib/client')
    return await sanityClient.fetch<DynamicDoc[]>(
      `*[_type in ["post","guide","careerPath","caseStudy","glossaryTerm"] && defined(slug.current)]{
         _type, slug, updatedAt, publishedAt, _updatedAt, cluster, "noindex": seo.noindex
       }`,
      {},
      { next: { tags: SITEMAP_TAGS, revalidate: 86400 } },
    )
  } catch (err) {
    console.warn('[sitemap] Sanity fetch failed, returning static-only:', err)
    return []
  }
}

export type Section = { id: ChildId; urls: SitemapUrl[] }

/**
 * Builds every child section in one pass — a single Sanity query shared by the
 * index route and the child route. Static sections need no fetch; the dynamic
 * ones merge published docs onto their section hub, applying the glossary
 * indexing gates so the sitemap never lists a noindexed hub/cluster page.
 */
export async function getSections(): Promise<Section[]> {
  // Drop per-doc noindex (seo.noindex) — those pages opt out of indexing.
  const docs = (await fetchDynamicDocs()).filter((d) => d.noindex !== true)

  const dynamicBySection: Record<ChildId, SitemapUrl[]> = {
    pages: [],
    'landing-pages': [],
    blog: [],
    guides: [],
    glossary: [],
    'career-paths': [],
    tools: [],
    'case-studies': [],
  }
  const clusterCounts: Record<string, number> = {}
  let glossaryTermCount = 0

  for (const d of docs) {
    if (d._type === 'glossaryTerm') {
      glossaryTermCount += 1
      if (d.cluster) clusterCounts[d.cluster] = (clusterCounts[d.cluster] ?? 0) + 1
    }
    dynamicBySection[SECTION_OF[d._type]].push({
      loc: `${BASE}${PATH_PREFIX[d._type]}/${d.slug.current}/`,
      lastmod: lastModOf(d),
      changefreq: 'monthly',
      priority: PRIORITY[d._type],
    })
  }

  // Glossary hub + cluster pages are gated on published-term counts — the same
  // thresholds the hub/cluster routes apply before they self-noindex, so the
  // sitemap and the pages never disagree.
  const hubLive = glossaryTermCount >= GLOSSARY_INDEX_THRESHOLD
  const glossaryHub: SitemapUrl[] = hubLive
    ? [{ loc: `${BASE}/glossary/`, changefreq: 'weekly', priority: 0.6 }]
    : []
  const clusterPages: SitemapUrl[] = hubLive
    ? GLOSSARY_CLUSTERS.filter(
        (c) => (clusterCounts[c.value] ?? 0) >= CLUSTER_INDEX_THRESHOLD,
      ).map((c) => ({
        loc: `${BASE}/glossary/cluster/${c.value}/`,
        changefreq: 'monthly' as const,
        priority: 0.5,
      }))
    : []

  return [
    { id: 'pages', urls: CORE_PAGES },
    { id: 'landing-pages', urls: LANDING_PAGES },
    { id: 'blog', urls: [...BLOG_HUBS, ...dynamicBySection.blog] },
    { id: 'guides', urls: [...GUIDE_HUBS, ...dynamicBySection.guides] },
    {
      id: 'glossary',
      urls: [...glossaryHub, ...clusterPages, ...dynamicBySection.glossary],
    },
    { id: 'career-paths', urls: [...CAREER_HUBS, ...dynamicBySection['career-paths']] },
    { id: 'tools', urls: [...TOOLS_HUB, ...TOOL_URLS] },
    { id: 'case-studies', urls: [...CASE_STUDIES_HUB, ...dynamicBySection['case-studies']] },
  ]
}
