import type { SkillModule } from '@/sanity/lib/career-paths'
import { slugifyHeading } from '@/lib/slug'

type OrderedModule = SkillModule & { n: number }

/**
 * /career-paths/[slug]/ — the path as a numbered progression of skill modules,
 * grouped by seniority level (Entry → Mid → Senior). Replaces the older
 * essay-chapter body: the reader can see where a skill sits in the progression,
 * and each module surfaces the concrete things that make up proficiency — a
 * real in-the-field scenario, the edge cases, and a "proficient when" check.
 *
 * Receives the pre-ordered, globally-numbered list from the page (so the TOC
 * numbering matches). Level headers are emitted whenever the level changes;
 * `matrix` supplies the one-line focus under each level header when present.
 */
export function PathModules({
  ordered,
  matrix,
}: {
  ordered: OrderedModule[]
  matrix?: { level?: string; focus?: string; label?: string }[]
}) {
  if (ordered.length === 0) return null
  const rowFor = (level?: string) => matrix?.find((r) => r.level === level)
  const focusFor = (level?: string) => rowFor(level)?.focus
  const labelFor = (level?: string) => rowFor(level)?.label

  // Skill-number range per level (e.g. Entry = 01–03), for the stage header.
  const ranges = {} as Record<string, { first: number; last: number }>
  for (const m of ordered) {
    const lv = m.level ?? '—'
    if (!ranges[lv]) ranges[lv] = { first: m.n, last: m.n }
    ranges[lv].last = m.n
  }
  const pad = (x: number) => String(x).padStart(2, '0')

  return (
    <div className="space-y-12">
      {ordered.map((m, i) => {
        const newLevel = i === 0 || m.level !== ordered[i - 1].level
        const r = m.level ? ranges[m.level] : undefined
        return (
          <div key={m._key ?? m.n}>
            {newLevel && (
              <div className="mb-8 mt-4 border-t-2 border-ink-900 pt-5 first:mt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900 sm:text-3xl">
                    {m.level}
                    {labelFor(m.level) && (
                      <span className="text-ink-500"> — {labelFor(m.level)}</span>
                    )}
                  </h2>
                  {r && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                      {r.first === r.last
                        ? `Skill ${pad(r.first)}`
                        : `Skills ${pad(r.first)}–${pad(r.last)}`}
                    </span>
                  )}
                </div>
                {focusFor(m.level) && (
                  <p className="mt-3 max-w-2xl leading-relaxed text-ink-700 text-pretty">
                    {focusFor(m.level)}
                  </p>
                )}
              </div>
            )}

            <article
              id={slugifyHeading(m.title ?? '')}
              className="scroll-mt-24"
            >
              <div className="flex gap-4">
                <span className="mt-1 font-mono text-sm tabular-nums text-ink-400">
                  {String(m.n).padStart(2, '0')}
                </span>
                <div className="min-w-0 max-w-prose">
                  {weightLabel(m.weight) && (
                    <span className="mb-2 inline-block rounded-[3px] border border-rule px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                      {weightLabel(m.weight)}
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl">
                    {m.title}
                  </h3>
                  {m.skill && (
                    <p className="mt-2 text-lg leading-relaxed text-ink-800 text-pretty">
                      {m.skill}
                    </p>
                  )}

                  {m.why && <Part label="Why it matters">{m.why}</Part>}
                  {m.scenario && <Part label="In the field">{m.scenario}</Part>}

                  {m.edgeCases && m.edgeCases.length > 0 && (
                    <div className="mt-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Edge cases
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {m.edgeCases.map((e, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-ink-700 text-pretty"
                          >
                            <span
                              aria-hidden
                              className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-600"
                            />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.proficientWhen && (
                    <div className="mt-5 border-l-2 border-brand-600 bg-surface-tint-blue px-5 py-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Proficient when
                      </p>
                      <p className="mt-1.5 text-ink-800 text-pretty">
                        {m.proficientWhen}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        )
      })}
    </div>
  )
}

// Editorial weight tag (roadmap.sh's recommended/alternative/optional idea, as
// text not color). `core` is the default and shows no badge.
function weightLabel(weight?: string): string | null {
  if (weight === 'alternative') return 'Alternative · pick this or a core skill'
  if (weight === 'flexible') return 'Learn anytime'
  return null
}

function Part({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </p>
      <p className="mt-1.5 leading-relaxed text-ink-700 text-pretty">{children}</p>
    </div>
  )
}
