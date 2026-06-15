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

export type SeniorityRow = {
  level?: 'Entry' | 'Mid' | 'Senior'
  focus?: string
  mustLearn?: string[]
}

export type BuyerSection = {
  whatTheyDo?: string
  signsYouNeedOne?: string[]
  inHouseVsAgency?: unknown[]
  costReality?: string
}

export type RelatedTermCard = {
  _id: string
  term: string
  slug: string
  shortDefinition: string
  cluster?: string
}

export type CareerPath = CareerPathCard & {
  aliases?: string[]
  status?: 'drafting' | 'published' | 'archived'
  seniorityMatrix?: SeniorityRow[]
  body?: unknown[]
  buyerSection?: BuyerSection
  relatedTerms?: RelatedTermCard[]
  lastReviewed?: string
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
