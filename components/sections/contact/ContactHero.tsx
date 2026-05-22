/**
 * Contact hero — deliberately quiet.
 *
 * No CTAs, no marketing copy, no anchor strip. The buyer arrived here to
 * reach someone; we don't need to sell them anything else above the fold.
 * Two-tone H1, one short lede, a single mono response-time pill. That's it.
 */
export function ContactHero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Contact
        </p>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[6rem]">
          <span className="block">Reach the operator,</span>
          <span className="block text-ink-500">not a contact form farm.</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          One person answers everything that comes through this page. Phone,
          email, LinkedIn, the form below &mdash; whichever is easiest.
          You&rsquo;ll hear back within one business day.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Reply window
          </span>
          <span aria-hidden className="text-ink-300">/</span>
          <span className="font-display text-sm font-semibold text-ink-700">
            Within 24 business hours
          </span>
          <span aria-hidden className="text-ink-300">/</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Mon&ndash;Fri &middot; 9am&ndash;6pm ET
          </span>
        </div>
      </div>
    </section>
  )
}
