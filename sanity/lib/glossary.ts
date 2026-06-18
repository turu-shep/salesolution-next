import 'server-only'

import type { GlossaryCluster } from '@/lib/glossary-config'
import {
  allGlossaryTermSlugsQuery,
  allGlossaryTermsQuery,
  glossaryTermBySlugQuery,
  glossaryTermCountQuery,
} from './queries'
import { sanityFetch } from './fetch'

// Cluster metadata + index thresholds live in lib/glossary-config.ts — a
// dependency-free module so app/sitemap.ts and the cluster routes can import
// them without pulling the Sanity client (its env-or-throw module would break
// the sitemap's fail-soft behaviour). Re-exported here for component imports.
export { GLOSSARY_CLUSTERS } from '@/lib/glossary-config'
export type { GlossaryCluster } from '@/lib/glossary-config'

export type GlossaryTermCard = {
  _id: string
  term: string
  slug: string
  shortDefinition: string
  cluster: GlossaryCluster
  aliases?: string[]
}

export type GlossaryTerm = GlossaryTermCard & {
  body?: unknown[]
  lastReviewed?: string
  publishedAt?: string
  relatedTerms?: Pick<
    GlossaryTermCard,
    '_id' | 'term' | 'slug' | 'shortDefinition' | 'cluster'
  >[]
  relatedResources?: {
    label: string
    href: string
    kind?: 'career-path' | 'service'
    blurb?: string
  }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    noindex?: boolean
    canonicalUrl?: string
  }
}

export async function getAllGlossaryTerms(): Promise<GlossaryTermCard[]> {
  return sanityFetch<GlossaryTermCard[]>({
    query: allGlossaryTermsQuery,
    tags: ['glossaryTerm'],
  })
}

export async function getAllGlossaryTermSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: allGlossaryTermSlugsQuery,
    tags: ['glossaryTerm'],
  })
}

export async function getGlossaryTermBySlug(
  slug: string,
): Promise<GlossaryTerm | null> {
  return sanityFetch<GlossaryTerm | null>({
    query: glossaryTermBySlugQuery,
    params: { slug },
    tags: ['glossaryTerm', `glossaryTerm:${slug}`],
  })
}

export async function getGlossaryTermCount(): Promise<number> {
  return sanityFetch<number>({
    query: glossaryTermCountQuery,
    tags: ['glossaryTerm'],
  })
}
