import { SectionRail } from '@/components/layout/SectionRail'

import { SeamSchematic } from './SeamSchematic'

/**
 * Home § 02 — the wedge (belief-shift).
 *
 * "You've been sold pieces. We run the whole flow." The anti-menu belief beat:
 * the leak isn't in any one piece, it's in the seams between disconnected
 * vendors. No proof block, no CTA — the router (WhoWeServe) follows, and the
 * old two-leak proof (chart + stats) was parked on /drafts (components/drafts/
 * LeakProof.tsx) for relocation to a "why now" beat.
 *
 * The argument is drawn, not just stated: the copy sits left; SeamSchematic (a
 * forensic wiring diagram of the broken handoff vs. the whole flow) fills the
 * right. Copy is verbatim canon — only its typesetting changed.
 */
export function ProblemShift() {
  return (
    <SectionRail tone="dark" glow="strong">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-16">
        <div>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            You&rsquo;ve been sold pieces. We run the whole flow.
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-200">
            A website from one vendor. Ads from another. A CRM from a third.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-300">
            None of them ever saw the other two.
          </p>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-200">
            So customers fall into the seams. The ad bought a lead. The page
            wasn&rsquo;t built to convert it. Nobody followed up. The leak
            isn&rsquo;t in any one piece.{' '}
            <span
              className="font-semibold tracking-[0.01em] text-white"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--color-accent-500) 0 58%, transparent 0)',
                backgroundSize: '14px 2px',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: '0 100%',
                paddingBottom: '3px',
              }}
            >
              It&rsquo;s in the gaps.
            </span>{' '}
            We build and run the whole flow ourselves, so nothing falls through.
          </p>
        </div>

        <SeamSchematic />
      </div>
    </SectionRail>
  )
}
