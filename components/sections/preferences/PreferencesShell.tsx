/**
 * Page shell for preferences pages — paper background, max-w-3xl reading
 * column, header + groups composed by the caller.
 *
 * Intentionally narrower than the marketing sections (max-w-6xl on
 * SectionRail) because preferences pages are document-feel: long single
 * column, no two-column layouts, controls inline with the copy.
 */
export function PreferencesShell({ children }: { children: React.ReactNode }) {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:px-8">
        {children}
      </div>
    </section>
  )
}
