import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Home § 02 — the wedge (belief-shift).
 *
 * "You've been sold pieces. We run the whole flow." The anti-menu belief beat:
 * the leak isn't in any one piece, it's in the seams between disconnected
 * vendors. No proof block, no CTA — the router (WhoWeServe) follows, and the
 * old two-leak proof (chart + stats) was parked on /drafts (components/drafts/
 * LeakProof.tsx) for relocation to a "why now" beat.
 */
export function ProblemShift() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-2xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          You&rsquo;ve been sold pieces. We run the whole flow.
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-200">
          A website from one vendor. Ads from another. A CRM from a third. None of
          them ever saw the other two.
        </p>
        <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-200">
          So customers fall into the seams. The ad bought a lead. The page
          wasn&rsquo;t built to convert it. Nobody followed up. The leak isn&rsquo;t
          in any one piece. <span className="font-medium text-white">It&rsquo;s in
          the gaps.</span> We build and run the whole flow ourselves, so nothing
          falls through.
        </p>
      </div>
    </SectionRail>
  )
}
