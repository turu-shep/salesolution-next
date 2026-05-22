/**
 * One preference group on a settings page.
 *
 * Each group is its own H2-led block separated from the next by a hairline
 * rule. `eyebrow` is the mono uppercase tag above the heading; `kicker` is
 * the short paragraph that follows. The actual controls (or just copy) go
 * in `children`.
 */
export function PreferenceGroup({
  eyebrow,
  title,
  kicker,
  children,
}: {
  eyebrow: string
  title: string
  kicker?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-rule py-12 last:border-b-0 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-ink-900 sm:text-3xl">
        {title}
      </h2>
      {kicker && (
        <div className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700">
          {kicker}
        </div>
      )}
      {children}
    </section>
  )
}
