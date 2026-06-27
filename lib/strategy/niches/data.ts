import type { NicheBrief } from './types'

import { NICHE_BRIEFS_DATA } from './briefs.generated'

/**
 * The per-industry copy-angle briefs. The data itself lives in
 * `briefs.generated.ts` (emitted from the revenue-engine-niche-copy-briefs
 * workflow output — regenerate it, don't hand-edit). This module is the typed
 * access layer.
 */
export const NICHE_BRIEFS: NicheBrief[] = NICHE_BRIEFS_DATA

export function getBrief(slug: string): NicheBrief | undefined {
  return NICHE_BRIEFS.find((b) => b.slug === slug)
}

export function briefSlugs(): string[] {
  return NICHE_BRIEFS.map((b) => b.slug)
}

export function briefsByLandingPage(landingPage: string): NicheBrief[] {
  return NICHE_BRIEFS.filter((b) => b.landingPage === landingPage)
}
