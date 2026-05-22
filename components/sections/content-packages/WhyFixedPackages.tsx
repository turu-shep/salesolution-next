import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Content packages § — why we publish fixed packages instead of "starting
 * at" pricing or per-project quotes.
 *
 * One-paragraph rationale plus three short supporting points so the
 * reader doesn't have to take the claim on faith. Sits between hero and
 * the packages grid as the dark beat in the L-D-L-D rhythm.
 */

type Beat = { label: string; body: string }

const BEATS: Beat[] = [
  {
    label: 'No discovery dance',
    body: 'You see the number on the page. We don’t need three calls to scope a content programme — the deliverables are locked, the price is locked.',
  },
  {
    label: 'Senior writers, no offshoring',
    body: 'Every tier ships work from named, technical-vertical writers. No interns, no offshore content mills hidden behind a markup.',
  },
  {
    label: 'SEO + GEO baked in',
    body: 'Topic research, schema-friendly structure, internal linking, and AIO-citation tracking come standard at every tier. Not an upcharge.',
  },
]

export function WhyFixedPackages({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Why fixed packages
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          You shouldn&rsquo;t need a sales call{' '}
          <span className="text-ink-400">to learn the price.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Most content agencies hide pricing behind a discovery call so they
          can size the quote to your budget. We do the opposite: every tier
          is a published number, the deliverables are written down, and the
          only conversation is which tier fits.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-10 border-t border-white/10 pt-12 md:grid-cols-3">
        {BEATS.map((b, i) => (
          <li
            key={b.label}
            className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
              0{i + 1}
            </p>
            <p className="mt-4 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
              {b.label}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-300">
              {b.body}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
