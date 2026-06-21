/**
 * Shared content for the four "Bring -> Sell -> Retain" intro-block concepts,
 * shown side by side on /revenue-engine/flow-concepts/ for a pick-the-winner
 * review. This block is the reframed engine-vs-fuel beat: it widens the old
 * "ads are fuel, I convert them" frame to the whole flow we optimize. Ads are
 * one input into Bring, not the engine.
 *
 * Each pillar then gets its own deeper block below this on the real page.
 */

export type Pillar = {
  n: string
  verb: string
  outcome: string
  body: string
  leak: string
  fix: string
}

export const PILLARS: Pillar[] = [
  {
    n: '01',
    verb: 'Bring',
    outcome: 'Get found when they’re looking',
    body: 'Show up where buyers already search — Google, Maps, and AI answers — so they find you, not a competitor. New demand, brought to your door.',
    leak: 'They search and find a competitor.',
    fix: 'Get found in search, Maps, and AI answers.',
  },
  {
    n: '02',
    verb: 'Sell',
    outcome: 'Close the ones who reach you',
    body: 'Answer every call and message in seconds, book the job, and chase the quotes that stall. The demand you already have, turned into revenue.',
    leak: 'They reach you and slip through.',
    fix: 'Answer in seconds, book the job, chase the stalls.',
  },
  {
    n: '03',
    verb: 'Retain',
    outcome: 'Bring them back',
    body: 'Win back the ones who looked and left, and sell again to the customers you already have. The cheapest growth there is.',
    leak: 'They buy once and never come back.',
    fix: 'Win back the lapsed, re-sell the ones you have.',
  },
]

export const HEADLINE_WEDGE =
  'Most will sell you one piece — a website, a CRM, an ad campaign. I run and optimize the whole flow.'

/** What the buyer has been sold before, piece by piece — used in Concept 2. */
export const ONE_PIECE: string[] = [
  'A new website',
  'An SEO retainer',
  'Another CRM',
  'An ad campaign',
  'A reviews app',
]
