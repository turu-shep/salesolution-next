/**
 * Types for the per-industry copy-angle briefs rendered under /strategy/niche/{slug}.
 * Shape mirrors the BRIEF_SCHEMA produced by the revenue-engine-niche-copy-briefs
 * workflow. Each brief maps section-by-section to a live Revenue Engine landing page.
 */

export type HeadingOption = { title: string; accent: string; why: string }
export type LeakPoint = { pillar: string; label: string; copy: string; stat: string; source: string }
export type PlanStep = { key: string; what: string; metric: string }
export type PlanPillar = { pillar: string; outcome: string; steps: PlanStep[] }
export type ReassuranceBullet = { title: string; copy: string }
export type FaqItem = { q: string; a: string }
export type KeyStat = { label: string; value: string; source: string }

export type VerifyStatus = 'confirmed' | 'plausible' | 'unsupported' | 'wrong'
export type VerifyCheck = {
  stat: string
  status: VerifyStatus
  note?: string
  correction?: string
}
export type Verify = {
  slug: string
  verdict: 'solid' | 'mostly-solid' | 'risky'
  checked: VerifyCheck[]
  summary: string
}

export type NicheBrief = {
  industry: string
  slug: string
  /** Which live landing page this niche maps to: home-services | dentists | medical | local-retail */
  landingPage: string
  oneLine: string
  language: { theirWords: string[]; wordsToUse: string[]; wordsToAvoid: string[] }
  heading: { eyebrow: string; options: HeadingOption[]; lede: string }
  leak: {
    eyebrow: string
    headlineA: string
    headlineB: string
    intro: string
    points: LeakPoint[]
    closer: string
  }
  plan: {
    leadPillar: string
    note?: string
    pillars: PlanPillar[]
    prove: { what: string; metric: string }
  }
  difference: {
    eyebrow?: string
    headlineA: string
    headlineB: string
    intro?: string
    lost: string[]
    won: string[]
  }
  reassurance: { kind: string; sectionTitle: string; intro?: string; bullets: ReassuranceBullet[] }
  faq: FaqItem[]
  keyStats: KeyStat[]
  sources: string[]
  _verify?: Verify
}

/** Display labels + ordering for the landing pages the niches group under. */
export const LANDING_PAGES: { key: string; label: string; href: string }[] = [
  { key: 'home-services', label: 'Home services', href: '/revenue-engine/home-services/' },
  { key: 'dentists', label: 'Dental', href: '/revenue-engine/dentists/' },
  { key: 'medical', label: 'Medical & aesthetics', href: '/revenue-engine/medical/' },
  { key: 'local-retail', label: 'Local retail', href: '/revenue-engine/local-retail/' },
]
