import 'server-only'

import {
  allGlossaryTermSlugsQuery,
  allGlossaryTermsQuery,
  glossaryTermBySlugQuery,
  glossaryTermCountQuery,
} from './queries'
import { sanityFetch } from './fetch'

// GLOSSARY_INDEX_THRESHOLD lives in lib/glossary-config.ts — a dependency-free
// module so app/sitemap.ts can import the threshold without pulling the Sanity
// client (and its env-or-throw module), which would break the sitemap's
// fail-soft behaviour.

export type GlossaryCluster =
  | 'ai-search-core'
  | 'measurement'
  | 'technical'
  | 'industrial-ecommerce'
  | 'roles'

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

/** Human labels + display order for the hub's cluster sections. */
export const GLOSSARY_CLUSTERS: { value: GlossaryCluster; label: string }[] = [
  { value: 'ai-search-core', label: 'AI search' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'technical', label: 'Technical & structural' },
  { value: 'industrial-ecommerce', label: 'Industrial e-commerce' },
  { value: 'roles', label: 'Roles' },
]

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
