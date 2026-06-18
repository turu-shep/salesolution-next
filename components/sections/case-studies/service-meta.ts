import {
  FULL_GROWTH,
  SERVICES,
  SERVICE_CLASSES,
} from '@/components/services/service-colors'
import type { CaseStudyServiceKey } from '@/sanity/lib/case-studies'

/**
 * Bridges the `primaryService` keys stored on caseStudy documents to the
 * shared service registry (names, hrefs, literal Tailwind classes).
 *
 * Full Growth Ownership has no single identity color — its accent moments
 * use ink-900 and its strip is rendered by CompositeBar at the page level.
 */
export type CaseStudyServiceMeta = {
  name: string
  href: string
  /** Literal class for the 1px/2px accent strip. */
  accentBar: string
  /** Literal class for the small identity dot (use on light bands). */
  dot: string
  /** Literal class for the dot on DARK bands — the dark 500-weights are
   *  camouflaged on navy, so we use the light 50-weight tints there. */
  dotLight: string
  /** Literal class for tinted micro-labels. */
  text700: string
}

export const CASE_STUDY_SERVICES: Record<CaseStudyServiceKey, CaseStudyServiceMeta> = {
  search: {
    name: SERVICES.search.name,
    href: SERVICES.search.href,
    accentBar: SERVICE_CLASSES.search.accentBar,
    dot: SERVICE_CLASSES.search.dot,
    dotLight: SERVICE_CLASSES.search.bg50,
    text700: SERVICE_CLASSES.search.text700,
  },
  catalog: {
    name: SERVICES.catalog.name,
    href: SERVICES.catalog.href,
    accentBar: SERVICE_CLASSES.catalog.accentBar,
    dot: SERVICE_CLASSES.catalog.dot,
    dotLight: SERVICE_CLASSES.catalog.bg50,
    text700: SERVICE_CLASSES.catalog.text700,
  },
  editorial: {
    name: SERVICES.editorial.name,
    href: SERVICES.editorial.href,
    accentBar: SERVICE_CLASSES.editorial.accentBar,
    dot: SERVICE_CLASSES.editorial.dot,
    dotLight: SERVICE_CLASSES.editorial.bg50,
    text700: SERVICE_CLASSES.editorial.text700,
  },
  dev: {
    name: SERVICES.dev.name,
    href: SERVICES.dev.href,
    accentBar: SERVICE_CLASSES.dev.accentBar,
    dot: SERVICE_CLASSES.dev.dot,
    dotLight: SERVICE_CLASSES.dev.bg50,
    text700: SERVICE_CLASSES.dev.text700,
  },
  outbound: {
    name: SERVICES.outbound.name,
    href: SERVICES.outbound.href,
    accentBar: SERVICE_CLASSES.outbound.accentBar,
    dot: SERVICE_CLASSES.outbound.dot,
    dotLight: SERVICE_CLASSES.outbound.bg50,
    text700: SERVICE_CLASSES.outbound.text700,
  },
  fullgrowth: {
    name: FULL_GROWTH.name,
    href: FULL_GROWTH.href,
    accentBar: 'h-1 w-full bg-ink-900',
    dot: 'bg-ink-900',
    dotLight: 'bg-white',
    text700: 'text-ink-700',
  },
}

export function serviceMeta(key: CaseStudyServiceKey | undefined): CaseStudyServiceMeta {
  return CASE_STUDY_SERVICES[key ?? 'search'] ?? CASE_STUDY_SERVICES.search
}

/**
 * Short disclosure badge for scan-level surfaces (cards). Surfaces the
 * honesty differentiator — named / anonymized / composite — without the
 * reader having to open the study.
 */
export function disclosureLabel(
  disclosure: 'named' | 'anonymized' | 'composite' | undefined,
): string {
  switch (disclosure) {
    case 'named':
      return 'Named · with consent'
    case 'composite':
      return 'Composite'
    case 'anonymized':
    default:
      return 'Anonymized · NDA'
  }
}

/**
 * Default disclosure copy per mode. `disclosureNote` on the document
 * overrides these. Anonymity framed with its reason + what stayed real —
 * that framing is what keeps an unnamed case study credible.
 */
export function disclosureCopy(
  disclosure: 'named' | 'anonymized' | 'composite',
  descriptor: string,
): string {
  switch (disclosure) {
    case 'named':
      return 'Published with the client’s sign-off. Metrics are as measured in the sources listed above.'
    case 'composite':
      return `Composite case study: figures are aggregated from multiple ${descriptor.toLowerCase()} engagements and do not describe a single client. Per-engagement references are available on request under NDA.`
    case 'anonymized':
    default:
      return `Client name withheld under NDA. Most industrial distributors prefer the case study without the logo. The vertical, scale, timeline, and every number are exactly as measured. Only the identifying details are removed. Reference calls available on request.`
  }
}
