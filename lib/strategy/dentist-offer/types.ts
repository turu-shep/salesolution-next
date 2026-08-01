/**
 * Type contract for the dentist offer sheet rendered at /strategy/offers/dentist/
 * (gated, noindex, no runtime fs, per the /sales docs convention).
 *
 * This replaces the old markdown wall (lib/strategy/docs/dentist-offer-sheet.ts).
 * Same content, structured: every sentence of the sheet lands in a typed field so
 * the page can be laid out instead of dumped. Nothing here is generated — it is
 * hand-maintained prose under a schema.
 *
 * Register is deliberate: neutral product description, no second person, no actor
 * instructions. The outreach motion — cadence, approved copy, compliance rails,
 * objections — lives in ../docs/dentist-outreach-manual.ts and renders one level
 * deeper.
 *
 * Every value figure traces to docs/strategy/offer-research/06-deliverable-value-ledger.md,
 * which is the only source for numbers on this page. Offer facts trace to
 * docs/strategy/offer-research/ (medical-dental-offer-spec.md, 00-offer-architecture.md,
 * 04-signoff-sheet.md, 05-dental-fd7-tier2-draft.md), docs/strategy/sales/, the live
 * dental page, and lib/strategy/niches/briefs.generated.ts. Content canaries live in
 * ../docs/dentist-offer.test.mjs — the guarantee sentence, the published floor, the
 * never-name rules, and the drafts gate are test-enforced. Re-verify against the
 * source files before editing any quoted block.
 */

/** The five stages, in fixed order. Never renamed, never merged. */
export type Stage = 'CAPTURE' | 'RESPOND' | 'BOOK' | 'RECOVER' | 'PROVE'

/**
 * How much a figure can be leaned on, straight from the ledger's own labels:
 *  - `verified`    — the ledger's verified half (wage data, writing rates, build costs)
 *  - `directional` — the row says "roughly" / "directional" / vendor-blog sourcing
 *  - `claimReady`  — proposed, not signed; nothing faces a prospect until its
 *                    claims row signs into docs/strategy/sales/_claims-library.md
 *  - `reserved`    — research in flight, counted as zero in the reconciliation
 *  - `none`        — published prices, benchmarks, citations: no tier label needed
 */
export type ValueTier = 'verified' | 'directional' | 'claimReady' | 'reserved' | 'none'

/**
 * One line of the Value block, split out of the source paragraph.
 * `figure` is a pull-out of the leading amount only — `figure` and `detail`
 * concatenate back into the original sentence, so nothing is restated or lost.
 * `source` holds the parenthetical attribution that trailed the sentence.
 */
export interface ValueRow {
  label: string
  figure?: string
  detail: string
  source?: string
  tier: ValueTier
  /** VC-gated: internal until the claims row signs. */
  gated?: boolean
}

export interface Deliverable {
  name: string
  what: string
  whyItMatters: string
  value: ValueRow[]
}

export interface Category {
  number: string
  name: string
  stages: Stage[]
  purpose: string
  deliverables: Deliverable[]
}

export interface TierRow {
  tier: string
  profile: string
  recovery: string
  fit: string
}

export interface TimelineStep {
  when: string
  what: string
  /** The guarantee settlement — the one step the stepper accents. */
  settles?: boolean
}

export interface FactTile {
  label: string
  value: string
}

export interface PricingBlock {
  label: string
  body: string
}

export interface ValueStackBar {
  label: string
  amount: string
  low: number
  high: number
}

export interface ProposedAddition {
  name: string
  what: string
}

export interface SectionMeta {
  id: string
  number: string
  title: string
  note: string
}

export interface DentistOffer {
  title: string
  updated: string
  eyebrow: string
  sourceNote: string
  /** Header lede. Joins with `whatItIs` to reproduce the opening paragraph. */
  definition: string
  facts: FactTile[]

  whatItIs: string
  promiseIntro: string
  promiseQuote: string
  stagesLine: string
  guaranteeIntro: string
  guarantee: string
  guaranteeRules: string[]

  tiers: TierRow[];
  whoDecides: string
  notFitIntro: string
  notFit: string[]

  deliverablesIntro: string
  valueNotes: string
  categories: Category[]

  timeline: TimelineStep[]
  notInInstall: string[]

  pricing: {
    publicLineIntro: string
    publicLine: string
    publicLineNote: string
    internalLabel: string
    fee: PricingBlock
    terms: PricingBlock
    month4: PricingBlock
    optionNames: { label: string; names: string[] }
    paymentTerms: PricingBlock
    orderRule: PricingBlock
  }

  valueStack: {
    proposalLine: string
    corroboration: string
    honesty: string
    ledgerLine: string
    scaleMax: number
    bars: ValueStackBar[]
  }

  proposedAdditions: {
    heading: string
    gate: string
    intro: string
    items: ProposedAddition[]
    signOff: string
  }

  footer: {
    lead: string
    outreachHref: string
    outreachTail: string
    ledgerLabel: string
    ledgerPath: string
  }
}
