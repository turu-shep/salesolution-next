import type { SeniorityRow } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — "At each level" matrix.
 *
 * Renders what the role does and must learn at Entry / Mid / Senior. The
 * concept's core promise ("how roles improve, what they need at different
 * seniority levels") lives here. Portable text has no table block in this
 * project, so the matrix is a structured field rendered as a column-per-level
 * grid (stacked on mobile). `id` is fixed by the page so the TOC can anchor it.
 */
export function PathSeniority({
  matrix,
  id,
}: {
  matrix: SeniorityRow[]
  id: string
}) {
  const rows = matrix.filter((r) => r?.level)
  if (rows.length === 0) return null

  return (
    <section className="mb-16 md:mb-20">
      <h2
        id={id}
        className="scroll-mt-24 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900 sm:text-3xl"
      >
        At each level
      </h2>

      <div className="mt-6 grid gap-px overflow-hidden border-y border-rule bg-rule md:grid-cols-3">
        {rows.map((r) => (
          <div key={r.level} className="flex flex-col bg-surface p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              {r.level}
            </p>
            {r.focus && (
              <p className="mt-3 text-ink-800">{r.focus}</p>
            )}
            {r.mustLearn && r.mustLearn.length > 0 && (
              <>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Must learn
                </p>
                <ul className="mt-2 space-y-2">
                  {r.mustLearn.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                      <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
