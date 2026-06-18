import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import type { BuyerSection, CareerPathKind } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — buyer section (the only revenue-touching surface in
 * the learning hub). Visually distinct from the reading walk — a bordered
 * panel on tinted ground — so a buyer skimming the page lands on it. `id` is
 * fixed by the page for the TOC anchor.
 *
 * The framing shifts by `kind`:
 * - **role** — a profession you can hire full-time: "Hiring this role?",
 *   weighing in-house vs agency vs fractional (the MarketerHire pattern).
 * - **specialization** — a skill you rarely keep on staff: "Need this done?",
 *   leaning toward buying it as a project or retainer. The copy itself
 *   (authored in Sanity) carries that lean; this component sets the framing.
 */
export function PathBuyer({
  section,
  id,
  kind = 'role',
}: {
  section: BuyerSection
  id: string
  kind?: CareerPathKind
}) {
  const { whatTheyDo, signsYouNeedOne, inHouseVsAgency, costReality } = section
  const hasContent =
    whatTheyDo ||
    (signsYouNeedOne && signsYouNeedOne.length > 0) ||
    (Array.isArray(inHouseVsAgency) && inHouseVsAgency.length > 0) ||
    costReality
  if (!hasContent) return null

  const isSpecialization = kind === 'specialization'
  const heading = isSpecialization ? 'Need this done?' : 'Hiring this role?'
  const signsLabel = isSpecialization
    ? 'Signs you need this work'
    : 'Signs your business needs one'

  return (
    <section className="mt-14 max-w-prose border-l-2 border-brand-600 bg-surface-tint-blue p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        For buyers
      </p>
      <h2
        id={id}
        className="mt-3 scroll-mt-24 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900 sm:text-3xl"
      >
        {heading}
      </h2>

      {whatTheyDo && (
        <p className="mt-5 text-ink-800 text-pretty">{whatTheyDo}</p>
      )}

      {signsYouNeedOne && signsYouNeedOne.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            {signsLabel}
          </p>
          <ul className="mt-3 space-y-2">
            {signsYouNeedOne.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-ink-700">
                <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(inHouseVsAgency) && inHouseVsAgency.length > 0 && (
        <div className="mt-6">
          <PortableTextRenderer value={inHouseVsAgency} />
        </div>
      )}

      {costReality && (
        <div className="mt-6 border-t border-rule pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Cost reality
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{costReality}</p>
        </div>
      )}
    </section>
  )
}
