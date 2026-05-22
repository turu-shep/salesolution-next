/**
 * Page header for settings-style preference pages (opt-out, communication).
 *
 * Same anatomy as the other rebuilt pages: mono eyebrow → display H1 → short
 * explainer paragraph, sitting on paper with hairline separator beneath.
 *
 * Quieter than ServicesHero — these are utility pages, not sales pages — so
 * the H1 is one tier smaller and there are no CTAs.
 */
export function PreferencesHeader({
  eyebrow = 'Preferences',
  title,
  intro,
}: {
  eyebrow?: string
  title: string
  intro: string
}) {
  return (
    <header className="border-b border-rule pb-10 md:pb-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-700 md:text-lg">
        {intro}
      </p>
    </header>
  )
}
