import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Blog index dark band — what the writing actually covers.
 *
 * Sits between the hero (paper) and the grid (paper) to enforce the
 * L-D-L-D tone rhythm. Three pillars, each with a mono eyebrow, a
 * display headline, and a one-sentence read on what the reader gets.
 * Accent orange tags the active edge — same vocabulary as the rest of
 * the rebuilt site.
 */

type Pillar = {
  index: string
  eyebrow: string
  title: string
  body: React.ReactNode
}

const PILLARS: Pillar[] = [
  {
    index: '01',
    eyebrow: 'GEO · AI search',
    title: 'How to be the source AI engines cite.',
    body: (
      <>
        Citation engineering, schema depth, AIO-readiness checklists, and
        the structural shifts behind why traffic from informational
        queries collapsed in 18 months.
      </>
    ),
  },
  {
    index: '02',
    eyebrow: 'Technical SEO',
    title: 'The mechanics under the rankings.',
    body: (
      <>
        Catalog architecture, crawl budgets, internal linking at
        industrial scale, Core Web Vitals on real PDP templates &mdash;
        not the homepage demo.
      </>
    ),
  },
  {
    index: '03',
    eyebrow: 'Conversion / lifecycle',
    title: 'What the traffic does once it lands.',
    body: (
      <>
        B2B e&#8209;commerce funnel mechanics, quote-cart vs cart logic,
        lead-magnet timing, and the email sequences that actually move
        pipeline.
      </>
    ),
  },
]

export function BlogPillars() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What we write about
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Three pillars. <span className="text-ink-400">No filler.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Every post lands in one of three buckets &mdash; the same three
          we build engagements around. If a topic doesn&rsquo;t move
          revenue or readiness, we don&rsquo;t publish on it.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <li
            key={p.index}
            className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              <span className="text-accent-500">§ {p.index}</span>{' '}
              <span className="text-ink-400">·</span>{' '}
              {p.eyebrow}
            </p>
            <h3 className="mt-5 font-display text-2xl font-semibold leading-snug tracking-[-0.015em] text-white">
              {p.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-ink-300">
              {p.body}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
