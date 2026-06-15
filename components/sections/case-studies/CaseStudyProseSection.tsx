import { SectionRail } from '@/components/layout/SectionRail'
import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'

export type ProseBlock = {
  eyebrow: string
  heading: string
  headingMuted?: string
  body: unknown
}

/**
 * Labeled long-form blocks for the case-study narrative arc (situation,
 * constraint, mechanism). Label column left, `.article-body` prose right —
 * the structure stays scannable even when the prose runs long.
 */
export function CaseStudyProseSection({
  tone = 'surface',
  id,
  blocks,
}: {
  tone?: 'paper' | 'surface'
  id?: string
  blocks: ProseBlock[]
}) {
  const rendered = blocks.filter((b) => Array.isArray(b.body) && (b.body as unknown[]).length > 0)
  if (rendered.length === 0) return null

  return (
    <SectionRail tone={tone} id={id} size="sm">
      <div className="space-y-16 md:space-y-20">
        {rendered.map((block) => (
          <div key={block.eyebrow} className="grid gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {block.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
                {block.heading}
                {block.headingMuted && (
                  <>
                    {' '}
                    <span className="text-ink-500">{block.headingMuted}</span>
                  </>
                )}
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-7">
              <PortableTextRenderer value={block.body} />
            </div>
          </div>
        ))}
      </div>
    </SectionRail>
  )
}
