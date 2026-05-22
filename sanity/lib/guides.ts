import 'server-only'

import {
  allGuideSlugsQuery,
  allGuidesQuery,
  guideBySlugQuery,
  guidesByCategoryQuery,
  guidesInSeriesQuery,
} from './queries'
import { sanityFetch } from './fetch'

export type Series = {
  name?: string
  part?: number
  totalParts?: number
}

export type GuideCard = {
  _id: string
  title: string
  slug: string
  description?: string
  publishedAt?: string
  readTimeMinutes?: number
  category?: string
  tags?: string[]
  series?: Series
  coverImage?: {
    asset?: { _id: string; url: string; metadata?: { dimensions?: { width: number; height: number } } }
    alt?: string
  }
}

export type Guide = GuideCard & {
  updatedAt?: string
  body?: unknown[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { asset?: { url: string } }
    noindex?: boolean
    canonicalUrl?: string
  }
}

export type GuideInSeriesEntry = {
  _id: string
  title: string
  slug: string
  series?: Series
}

export async function getAllGuides(): Promise<GuideCard[]> {
  return sanityFetch<GuideCard[]>({ query: allGuidesQuery, tags: ['guide'] })
}

export async function getAllGuideSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({ query: allGuideSlugsQuery, tags: ['guide'] })
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  return sanityFetch<Guide | null>({
    query: guideBySlugQuery,
    params: { slug },
    tags: ['guide', `guide:${slug}`],
  })
}

export async function getGuidesByCategory(category: string): Promise<GuideCard[]> {
  return sanityFetch<GuideCard[]>({
    query: guidesByCategoryQuery,
    params: { category },
    tags: ['guide', `guide-category:${category}`],
  })
}

export async function getGuidesInSeries(name: string): Promise<GuideInSeriesEntry[]> {
  return sanityFetch<GuideInSeriesEntry[]>({
    query: guidesInSeriesQuery,
    params: { name },
    tags: ['guide', `guide-series:${name}`],
  })
}
