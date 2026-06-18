import 'server-only'

import {
  allCareerPathSlugsQuery,
  allCareerPathsQuery,
  careerPathBySlugQuery,
} from './queries'
import { sanityFetch } from './fetch'

export type CareerPathKind = 'role' | 'specialization'

export type CareerPathCard = {
  _id: string
  title: string
  slug: string
  description?: string
  kind?: CareerPathKind
  role?: string
  level?: 'Entry' | 'Mid' | 'Senior'
  duration?: string
  publishedAt?: string
}

export type SeniorityRow = {
  level?: 'Entry' | 'Mid' | 'Senior'
  label?: string
  focus?: string
  mustLearn?: string[]
}

export type SkillModule = {
  _key?: string
  level?: 'Entry' | 'Mid' | 'Senior'
  title?: string
  skill?: string
  why?: string
  scenario?: string
  edgeCases?: string[]
  proficientWhen?: string
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
  modules?: SkillModule[]
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

export const LEVEL_ORDER = ['Entry', 'Mid', 'Senior'] as const

/**
 * Flatten skill modules into a single ordered, globally-numbered list — Entry
 * first, then Mid, then Senior, preserving authoring order within each level.
 * Both the body renderer and the TOC consume this so numbering stays in sync.
 */
export function orderModules(
  modules: SkillModule[] = [],
): (SkillModule & { n: number })[] {
  const valid = modules.filter((m) => m?.title)
  const sorted = [...valid].sort(
    (a, b) =>
      LEVEL_ORDER.indexOf(a.level as (typeof LEVEL_ORDER)[number]) -
      LEVEL_ORDER.indexOf(b.level as (typeof LEVEL_ORDER)[number]),
  )
  return sorted.map((m, i) => ({ ...m, n: i + 1 }))
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
