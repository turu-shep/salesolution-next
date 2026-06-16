import 'server-only'

import {
  allCaseStudiesQuery,
  allCaseStudySlugsQuery,
  caseStudyBySlugQuery,
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

export type CaseStudyClient = {
  _id: string
  publicName?: string
  descriptor: string
  industry?: string
  scale?: string
  region?: string
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
