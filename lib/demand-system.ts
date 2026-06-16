/**
 * Demand-system diagram data — drives the homepage <DemandSystem /> section.
 *
 * The model, stated plainly: a customer can be anywhere on the web, AND at any
 * stage of awareness when they arrive. So channels don't all dump into the top
 * of the funnel — each one enters where the buyer actually is:
 *
 *   TOFU  cold / interruption / passive discovery  (they weren't looking for you)
 *   MOFU  actively researching & comparing          (problem-aware, weighing options)
 *   BOFU  high intent, warm, ready to act            (product-aware, on the verge)
 *
 * After the decision, existing customers don't start over — they loop back in
 * via retention/lifecycle and re-enter near the buy decision. That loop is the
 * RETENTION node, drawn below the decision as a secondary arrow.
 *
 * Every node carries an editable `note`. Sources show it on hover/focus; funnel
 * stages render it inline. Reassign a channel by changing its `stage`. Kept
 * hardcoded on purpose — the homepage is static and its data lives in lib/*.ts.
 */

/** Channel families — drive a subtle accent tint + the legend.
 *  earned = organic / AI / community reach we *earn*
 *  paid   = budget-driven acquisition we *buy*
 *  owned  = audiences we already *own* (lists, past customers) */
export type SourceGroup = 'earned' | 'paid' | 'owned'

/** Which stage of the funnel a channel feeds the buyer into. */
export type FunnelStageId = 'tofu' | 'mofu' | 'bofu'

export type DemandSource = {
  id: string
  /** Short chip label. Keep it tight — the full story goes in `note`. */
  label: string
  group: SourceGroup
  /** Entry point: where this channel's traffic meets your buyer. Editable. */
  stage: FunnelStageId
  /** Surfaced on hover/focus. One or two sentences. Editable. */
  note: string
}

/** Every place a customer can already be sitting — routed to the stage where
 *  that channel's traffic actually arrives. Order within a stage = display order. */
export const DEMAND_SOURCES: DemandSource[] = [
  // ── TOFU · cold / interruption / passive discovery ──────────────────────
  {
    id: 'ai-search',
    label: 'AI search & chat',
    group: 'earned',
    stage: 'tofu',
    note: 'ChatGPT, Perplexity, Gemini and Google AI Overviews intercept research at the very start. We engineer your pages into the answer they cite.',
  },
  {
    id: 'social',
    label: 'Social media',
    group: 'owned',
    stage: 'tofu',
    note: 'LinkedIn, YouTube, Instagram, TikTok — passive discovery in the feeds your buyer scrolls between tasks, long before they’re shopping.',
  },
  {
    id: 'social-ads',
    label: 'Social ads',
    group: 'paid',
    stage: 'tofu',
    note: 'In-feed interruption aimed at your exact audience — creating demand among people who weren’t yet looking for you.',
  },
  {
    id: 'cold-email',
    label: 'Cold email',
    group: 'paid',
    stage: 'tofu',
    note: 'Targeted outbound to the named accounts that fit your ICP — a first contact with buyers who didn’t come looking.',
  },
  {
    id: 'more',
    label: '+ other sources',
    group: 'earned',
    stage: 'tofu',
    note: 'PR, podcasts, partnerships, marketplaces — wherever a stranger first runs into your name, we route it in too.',
  },

  // ── MOFU · actively researching & comparing ─────────────────────────────
  {
    id: 'organic',
    label: 'Google / Bing organic',
    group: 'earned',
    stage: 'mofu',
    note: 'Commercial-investigation search — “best”, “vs”, “how to choose”. They’re comparing, and we rank the pages that win the comparison.',
  },
  {
    id: 'communities',
    label: 'Reddit / Quora',
    group: 'earned',
    stage: 'mofu',
    note: 'Buyers asking peers instead of vendors — solution-aware and shortlisting. We earn the mention that gets you in the running.',
  },

  // ── BOFU · high intent, warm, ready to act ──────────────────────────────
  {
    id: 'search-ads',
    label: 'Search ads',
    group: 'paid',
    stage: 'bofu',
    note: 'Bottom-of-market, transactional keywords — “buy”, “near me”, branded terms. Paid coverage you can’t afford to cede at the moment of intent.',
  },
  {
    id: 'retargeting',
    label: 'Retargeting',
    group: 'paid',
    stage: 'bofu',
    note: 'The visitors who already engaged and left — brought back warm, at the moment they’re ready to take the final step.',
  },
]

export const SOURCE_GROUP_META: Record<
  SourceGroup,
  { label: string; dot: string; chip: string; text: string }
> = {
  earned: {
    label: 'Earned & organic',
    dot: 'bg-brand-500',
    chip: 'border-brand-500/40 hover:border-brand-500/80',
    text: 'text-brand-500',
  },
  paid: {
    label: 'Paid acquisition',
    dot: 'bg-accent-500',
    chip: 'border-accent-500/40 hover:border-accent-500/80',
    text: 'text-accent-500',
  },
  owned: {
    label: 'Owned audience',
    dot: 'bg-ink-200',
    chip: 'border-white/25 hover:border-white/60',
    text: 'text-ink-200',
  },
}

export type FunnelStage = {
  id: FunnelStageId
  acronym: string
  /** Spelled-out funnel position. */
  label: string
  /** The kind of buyer who enters at this stage — labels the intake above the band. */
  entryLabel: string
  /** Stage of awareness (the "what"). */
  phase: string
  /** Plain-English job to be done at this stage (the "how"). */
  action: string
  /** Rendered inline under the stage. Editable. */
  note: string
  /** Relative width of the stage band, 0–1, for the narrowing funnel look. */
  width: number
}

/** The funnel itself — three narrowing stages. TOFU/MOFU/BOFU acronyms paired
 *  with the brand’s plain-English phase + action. */
export const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: 'tofu',
    acronym: 'TOFU',
    label: 'Top of funnel',
    entryLabel: 'They arrive cold — not looking for you yet',
    phase: 'Awareness',
    action: 'get found',
    note: 'A stranger meets you for the first time. The job here is reach and a reason to keep paying attention.',
    width: 0.86,
  },
  {
    id: 'mofu',
    acronym: 'MOFU',
    label: 'Middle of funnel',
    entryLabel: 'They arrive researching — comparing options',
    phase: 'Consideration',
    action: 'get trusted',
    note: 'They’re weighing you against the alternatives. Proof, answers and follow-up move them from “interesting” to “this is the one.”',
    width: 0.66,
  },
  {
    id: 'bofu',
    acronym: 'BOFU',
    label: 'Bottom of funnel',
    entryLabel: 'They arrive ready — high intent',
    phase: 'Decision',
    action: 'get booked',
    note: 'On the verge of acting. Every point of friction removed so the obvious next step is to book, buy or call.',
    width: 0.46,
  },
]

/** The terminal node — the whole point of the system. */
export const DEMAND_DECISION = {
  id: 'decision',
  label: 'Decision',
  sub: 'A booked, ready-to-buy customer',
  note: 'Attention turned into a person ready to spend — handed to your team, or closed by ours.',
}

/** Secondary loop: existing customers don’t re-run the whole funnel. Retention
 *  cycles them back in near the buy decision for the next purchase. */
export const RETENTION = {
  id: 'returning',
  label: 'Returning-customer email',
  group: 'owned' as SourceGroup,
  note: 'Lifecycle, win-back and recall campaigns to the list you already own — the cheapest revenue you have. Existing customers skip the top and re-enter ready to buy again.',
  loopLabel: 'Repeat · retention · win-back',
}
