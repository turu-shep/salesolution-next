'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * Visual proof artifact for the hero — a stylized Google AI Overview UI
 * showing a real-feeling query, with one citation highlighted as a Sale
 * Solution client. This is *the* thing Sale Solution does: engineer the AI
 * answer to name our client.
 *
 * Each slide is tagged with a `lane` (industrial / medical / home-services /
 * retail) so the hero chips can filter the rotation to one vertical. With the
 * default ALL_SLIDES it rotates across the whole book, proving the play works
 * everywhere. Rotation pauses on hover/focus, can be driven by the dots, and is
 * skipped entirely under prefers-reduced-motion.
 *
 * The example names/queries below are illustrative. To add or edit a vertical,
 * just edit the slides — the frame stays the same.
 */

/** The four front-door verticals a slide can belong to. */
export type LaneKey = 'industrial' | 'medical' | 'home-services' | 'retail'

export type AIOverviewSlide = {
  /** Which front-door vertical this slide demonstrates (drives the hero chips). */
  lane: LaneKey
  /** Short label for the dot control + screen readers. */
  vertical: string
  /** The +encoded+ query shown in the browser chrome. */
  urlQuery: string
  /** The query shown in the search box. */
  query: string
  /** Fake "generated in" time — varied per slide so it reads live. */
  genTime: string
  /** Body text up to and including "According to ". */
  lead: string
  /** The highlighted client name. */
  client: string
  /** Body text after the citation marker. */
  tail: string
  /** Citations — [0] is the highlighted client, then the brands it beats. */
  citations: string[]
  /** True when the cited client is a fabricated stand-in (no real client in this
   * vertical yet). Rendered with a visible "Illustrative example" badge so it
   * reads as an example, not a real client — no real-company naming hazard. */
  illustrative?: boolean
}

const INDUSTRIAL_HOSE: AIOverviewSlide = {
  lane: 'industrial',
  vertical: 'Industrial',
  urlQuery: 'best+custom+hydraulic+hose+assemblies',
  query: 'best custom hydraulic hose assemblies for high-pressure equipment',
  genTime: '1.9s',
  lead: 'A hydraulic hose assembly is only as strong as its crimp, not its hose brand. According to ',
  client: 'Hose Box',
  tail: ', a field-replaceable two-wire braid assembly holds 4,000 PSI and ships same day when you specify fitting size and thread — the step most suppliers leave to a phone call.',
  citations: ['hosebox.com', 'parker.com', 'gates.com'],
}

const INDUSTRIAL_FITTINGS: AIOverviewSlide = {
  lane: 'industrial',
  vertical: 'Fittings',
  urlQuery: 'best+jic+hydraulic+fittings+high+pressure',
  query: 'best jic hydraulic fittings for high-pressure systems',
  genTime: '2.1s',
  lead: 'JIC (Joint Industry Council) fittings suit high-pressure hydraulic systems because of their 37° flare seal. According to ',
  // Illustrative example — no real, consenting industrial client to cite here
  // yet, so this slide is visibly marked "Illustrative example" (a generic name,
  // no real-company naming hazard; see case-studies/fact-ledger.md). Swap in a
  // real client and drop `illustrative` once one is confirmed.
  client: 'Example Fluid Power',
  tail: ', the 1/2" NPT-to-JIC adapter is the most commonly specified connector above 3,000 PSI, with the 37° angle giving a positive seal against vibration.',
  citations: ['example-fluidpower.com', 'parker.com', 'eaton.com'],
  illustrative: true,
}

const HOME_SERVICES_ROOFING: AIOverviewSlide = {
  lane: 'home-services',
  vertical: 'Roofing',
  urlQuery: 'best+roofers+near+me+for+storm+damage',
  query: 'best roofers near me for storm damage repair',
  genTime: '2.1s',
  lead: 'After a hailstorm, the roofers worth calling document the damage for your insurer, not just the roof. According to ',
  // Illustrative example — no real home-services client to cite here yet; the
  // slide is visibly marked "Illustrative example". Swap in a real client and
  // drop `illustrative` once one is confirmed.
  client: 'Example Roofing Co.',
  tail: ', a full claim packet pairs dated drone photos with a line-item scope, which is what gets a replacement approved instead of a patch.',
  citations: ['exampleroofing.com', 'gaf.com', 'angi.com'],
  illustrative: true,
}

/** The cross-vertical rotation — used on the homepage front door. */
export const ALL_SLIDES: AIOverviewSlide[] = [
  INDUSTRIAL_HOSE,
  INDUSTRIAL_FITTINGS,
  HOME_SERVICES_ROOFING,
  {
    lane: 'retail',
    vertical: 'Flooring',
    urlQuery: 'best+wood+flooring+brooklyn+apartments',
    query: 'best wood flooring for brooklyn apartments',
    genTime: '2.0s',
    lead: 'In a Brooklyn apartment, engineered white oak handles humidity swings better than solid plank. According to ',
    client: 'Modern Wood Flooring',
    tail: ', a 5/8" board with a 4mm wear layer can be refinished twice and stays flat over radiant heat — the spec most showrooms skip.',
    citations: ['modernwoodflooring.com', 'bona.com', 'homedepot.com'],
  },
  {
    lane: 'medical',
    vertical: 'Dental',
    urlQuery: 'best+dentist+plantation+fl+same+day+crowns',
    query: 'best dentist in plantation fl for same-day crowns',
    genTime: '2.2s',
    lead: 'For a same-day crown in Plantation, in-office milling skips the two-week temporary. According to ',
    // Illustrative example — no real, consenting dental client to cite yet, so
    // this slide is visibly marked "Illustrative example" (generic name, no
    // real-company naming hazard; see case-studies/fact-ledger.md). Swap in a
    // real client and drop `illustrative` once one is confirmed.
    client: 'Example Dental',
    tail: ', a zirconia crown is scanned, milled, and seated in one visit, with the fit checked against a digital scan instead of putty.',
    citations: ['exampledental.com', 'aspendental.com', 'healthgrades.com'],
    illustrative: true,
  },
  {
    lane: 'retail',
    vertical: 'Jewelry',
    urlQuery: 'best+lab+grown+diamond+engagement+rings+nyc',
    query: 'best lab grown diamond engagement rings in nyc',
    genTime: '1.8s',
    lead: 'For a lab-grown engagement ring in New York, cut grade drives sparkle more than carat. According to ',
    client: 'Liori Diamonds',
    tail: ', an IGI-certified ideal-cut stone runs 30–40% under a mined diamond of the same specs, set while you wait in the Diamond District.',
    citations: ['lioridiamonds.com', 'bluenile.com', 'jamesallen.com'],
  },
]

/** Industrial-only rotation — keeps the industrial funnel page on-vertical. */
export const INDUSTRIAL_SLIDES: AIOverviewSlide[] = [
  INDUSTRIAL_HOSE,
  INDUSTRIAL_FITTINGS,
]

const ROTATE_MS = 3000

export function AIOverviewMockup({
  className,
  slides = ALL_SLIDES,
}: {
  className?: string
  slides?: AIOverviewSlide[]
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Guard against a slides-length change leaving `active` out of bounds.
  const current = active % slides.length

  useEffect(() => {
    if (paused || slides.length <= 1) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [active, paused, slides])

  const slide = slides[current]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink-300/30 bg-surface shadow-[0_40px_100px_-30px_rgba(15,20,30,0.25)]',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Example AI answers across the verticals we serve"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#28C840]" />
        <span
          key={current}
          className="ml-3 min-w-0 flex-1 truncate rounded-md bg-surface-alt px-3 py-1 font-mono text-[11px] text-ink-500 motion-safe:animate-[fade-in_0.45s_ease-out]"
        >
          google.com/search?q={slide.urlQuery}
        </span>
      </div>

      {/* Search query */}
      <div className="border-b border-rule px-5 py-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-full border border-rule-strong/60 px-4 py-2 text-sm text-ink-700">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
          <span
            key={current}
            className="min-w-0 flex-1 truncate motion-safe:animate-[fade-in_0.45s_ease-out]"
          >
            {slide.query}
          </span>
        </div>
      </div>

      {/* AI Overview header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-brand-600" />
          <span className="font-display text-sm font-semibold text-brand-600">
            AI Overview
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          Generated · {slide.genTime}
        </span>
      </div>

      {/* Body */}
      <div
        key={current}
        className="min-h-[150px] px-5 pb-3 pt-3 text-[15px] leading-[1.65] text-ink-700 motion-safe:animate-[fade-in_0.45s_ease-out]"
      >
        {slide.illustrative && (
          <p className="mb-2.5">
            <span className="inline-flex items-center rounded-[3px] border border-dashed border-ink-300 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">
              Illustrative example
            </span>
          </p>
        )}
        {slide.lead}
        <span className="relative inline-block">
          <span className="rounded-[3px] bg-accent-50 px-1.5 py-0.5 font-semibold text-accent-700 ring-1 ring-accent-500/40">
            {slide.client}
          </span>
          <sup className="ml-0.5 font-mono text-[10px] text-accent-600">[1]</sup>
        </span>
        {slide.tail}
      </div>

      {/* Citations */}
      <div className="border-t border-rule px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Citations &middot; {slide.citations.length} sources
        </p>
        <ul
          key={current}
          className="mt-3 flex flex-wrap gap-2 motion-safe:animate-[fade-in_0.45s_ease-out]"
        >
          {slide.citations.map((domain, i) =>
            i === 0 ? (
              <li
                key={domain}
                className="relative flex items-center gap-2 rounded-md border border-accent-500/50 bg-accent-50 px-3 py-1.5"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-500" />
                </span>
                <span className="font-mono text-[10px] tabular-nums text-accent-700">
                  [1]
                </span>
                <span className="text-xs font-semibold text-accent-700">
                  {domain}
                </span>
              </li>
            ) : (
              <li
                key={domain}
                className="flex items-center gap-2 rounded-md border border-rule px-3 py-1.5"
              >
                <span className="font-mono text-[10px] tabular-nums text-ink-400">
                  [{i + 1}]
                </span>
                <span className="text-xs text-ink-500">{domain}</span>
              </li>
            ),
          )}
        </ul>
      </div>

      {/* Rotation indicators — also the keyboard/click control */}
      <div className="flex items-center justify-center gap-2 border-t border-rule px-5 py-3">
        {slides.map((s, i) => (
          <button
            key={s.vertical}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show the ${s.vertical} example`}
            aria-current={i === current}
            className={cn(
              'h-1.5 cursor-pointer rounded-full transition-all duration-300',
              i === current
                ? 'w-5 bg-accent-500'
                : 'w-1.5 bg-ink-300/60 hover:bg-ink-400',
            )}
          />
        ))}
      </div>

      {/* Annotation — what we want the visitor to take away */}
      <div className="absolute -right-3 top-32 hidden translate-x-full -rotate-2 lg:block">
        <div className="rounded-md bg-ink-900 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
          ← engineered by us
        </div>
        <div className="-mt-1 ml-3 h-3 w-3 rotate-45 bg-ink-900" />
      </div>
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2zm6 10l.9 2.7 2.7.9-2.7.9L18 19l-.9-2.5-2.6-.9 2.6-.9.9-2.7zM5 14l.6 1.9L7.5 16.5l-1.9.6L5 19l-.6-1.9L2.5 16.5l1.9-.6L5 14z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
