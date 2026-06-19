import 'server-only'

import {
  allCaseStudiesQuery,
  allCaseStudySlugsQuery,
  allIndustriesQuery,
  caseStudiesByIndustryQuery,
  caseStudyBySlugQuery,
  industryBySlugQuery,
} from './queries'
import { sanityFetch } from './fetch'

export type CaseStudyServiceKey =
  | 'search'
  | 'catalog'
  | 'editorial'
  | 'dev'
  | 'outbound'
  | 'fullgrowth'

export type CaseStudyDisclosure = 'named' | 'anonymized' | 'composite'

export type CaseStudyEngagementRole = 'standalone' | 'anchor' | 'cut'

/** A vertical (or sub-niche) as resolved from a caseStudyClient reference. */
export type CaseStudyIndustryRef = {
  _id: string
  title: string
  shortLabel?: string
  slug: string
  /** Slug of the top-level vertical when this is a sub-niche. */
  parentSlug?: string
}

export type CaseStudyClient = {
  _id: string
  publicName?: string
  descriptor: string
  /** Deprecated freeform label; prefer industryRef. */
  industry?: string
  industryRef?: CaseStudyIndustryRef
  scale?: string
  region?: string
}

/** Top-level vertical, with a live count of case studies tagged to it. */
export type Industry = {
  _id: string
  title: string
  shortLabel?: string
  slug: string
  description?: string
  hubHref?: string
  accentColor?: string
  order?: number
  parentSlug?: string
  caseStudyCount: number
  subNiches?: { _id: string; title: string; shortLabel?: string; slug: string }[]
}

export type CaseStudyKeyMetric = {
  prefix?: string
  value: string
  unit?: string
  label: string
  sourceLine?: string
}

export type CaseStudyStat = {
  _key: string
  value: string
  label: string
}

export type CaseStudyChart = {
  title: string
  source: string
  points: { _key: string; label: string; value: number }[]
  annotations?: { _key?: string; pointLabel: string; note: string }[]
  yMin?: number
  yMax?: number
}

export type CaseStudyApproachPhase = {
  _key: string
  title: string
  detail: string
  timeframe?: string
}

export type CaseStudyQuote = {
  text: string
  name?: string
  role: string
}

export type CaseStudyMethodologyItem = {
  _key: string
  metric: string
  method: string
}

export type CaseStudyCard = {
  _id: string
  title: string
  titleMuted?: string
  slug: string
  summary: string
  primaryService: CaseStudyServiceKey
  supportingServices?: CaseStudyServiceKey[]
  engagementRole?: CaseStudyEngagementRole
  engagementWindow: string
  durationLabel: string
  disclosure: CaseStudyDisclosure
  keyMetric: CaseStudyKeyMetric
  stats: CaseStudyStat[]
  featured?: boolean
  publishedAt?: string
  client?: CaseStudyClient
}

export type CaseStudy = CaseStudyCard & {
  updatedAt?: string
  situation?: unknown[]
  constraint?: unknown[]
  approach: CaseStudyApproachPhase[]
  mechanism?: unknown[]
  resultsNarrative?: unknown[]
  chart?: CaseStudyChart
  quote?: CaseStudyQuote
  methodology: CaseStudyMethodologyItem[]
  disclosureNote?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { asset?: { url: string } }
    noindex?: boolean
    canonicalUrl?: string
  }
}

export async function getAllCaseStudies(): Promise<CaseStudyCard[]> {
  return sanityFetch<CaseStudyCard[]>({
    query: allCaseStudiesQuery,
    tags: ['caseStudy'],
  })
}

export async function getAllCaseStudySlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: allCaseStudySlugsQuery,
    tags: ['caseStudy'],
  })
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  return sanityFetch<CaseStudy | null>({
    query: caseStudyBySlugQuery,
    params: { slug },
    tags: ['caseStudy', `caseStudy:${slug}`],
  })
}

/** Top-level verticals (no sub-niches), each with its live case-study count. */
export async function getAllIndustries(): Promise<Industry[]> {
  return sanityFetch<Industry[]>({
    query: allIndustriesQuery,
    tags: ['industry', 'caseStudy'],
  })
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  return sanityFetch<Industry | null>({
    query: industryBySlugQuery,
    params: { slug },
    tags: ['industry', `industry:${slug}`],
  })
}

/** Case studies for a top-level vertical, including all its sub-niches. */
export async function getCaseStudiesByIndustry(slug: string): Promise<CaseStudyCard[]> {
  return sanityFetch<CaseStudyCard[]>({
    query: caseStudiesByIndustryQuery,
    params: { slug },
    tags: ['caseStudy', `industry:${slug}`],
  })
}
