import 'server-only'

import {
  allCareerPathSlugsQuery,
  allCareerPathsQuery,
  careerPathBySlugQuery,
} from './queries'
import { sanityFetch } from './fetch'

export type CareerPathCard = {
  _id: string
  title: string
  slug: string
  description?: string
  role?: string
  level?: 'Entry' | 'Mid' | 'Senior'
  duration?: string
  publishedAt?: string
}

export type CareerPath = CareerPathCard & {
  body?: unknown[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    noindex?: boolean
    canonicalUrl?: string
  }
}

export async function getAllCareerPaths(): Promise<CareerPathCard[]> {
  return sanityFetch<CareerPathCard[]>({
    query: allCareerPathsQuery,
    tags: ['careerPath'],
  })
}

export async function getAllCareerPathSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: allCareerPathSlugsQuery,
    tags: ['careerPath'],
  })
}

export async function getCareerPathBySlug(slug: string): Promise<CareerPath | null> {
  return sanityFetch<CareerPath | null>({
    query: careerPathBySlugQuery,
    params: { slug },
    tags: ['careerPath', `careerPath:${slug}`],
  })
}
