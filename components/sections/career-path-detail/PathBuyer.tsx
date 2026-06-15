import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import type { BuyerSection } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — "Hiring this role?" section.
 *
 * The only revenue-touching surface in the learning hub: it speaks to the
 * distributor deciding whether to hire the role, use an agency, or go
 * fractional (the MarketerHire pattern). Visually distinct from the reading
 * walk — a bordered panel on tinted ground — so a buyer skimming the page
 * lands on it. `id` is fixed by the page for the TOC anchor.
 */
export function PathBuyer({
  section,
  id,
}: {
  section: BuyerSection
  id: string
}) {
  const { whatTheyDo, signsYouNeedOne, inHouseVsAgency, costReality } = section
  const hasContent =
    whatTheyDo ||
    (signsYouNeedOne && signsYouNeedOne.length > 0) ||
    (Array.isArray(inHouseVsAgency) && inHouseVsAgency.length > 0) ||
    costReality
  if (!hasContent) return null

  return (
    <section className="mt-14 border border-rule bg-surface-tint-blue p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        For buyers
      </p>
      <h2
        id={id}
        className="mt-3 scroll-mt-24 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-3xl"
      >
        Hiring this role?
      </h2>

      {whatTheyDo && (
        <p className="mt-5 max-w-2xl text-ink-800">{whatTheyDo}</p>
      )}

      {signsYouNeedOne && signsYouNeedOne.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Signs your business needs one
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
        <div className="mt-6 max-w-2xl">
          <PortableTextRenderer value={inHouseVsAgency} />
        </div>
      )}

      {costReality && (
        <p className="mt-6 border-t border-rule pt-5 text-sm leading-relaxed text-ink-600">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Cost reality
          </span>
          <br />
          {costReality}
        </p>
      )}
    </section>
  )
}
