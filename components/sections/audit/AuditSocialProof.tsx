import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /unlock-growth-audit/ § 4 — what the audit is, on dark.
 *
 * No stat row and no testimonials: the page makes no proof claim it can't
 * stand behind yet. This band states what the report covers, who it's for,
 * and the you-keep-it promise — the honest version of "why trust it."
 */

type Cover = {
  k: string
  v: string
}

const COVERS: Cover[] = [
  {
    k: 'What it covers',
    v: 'Three lenses, one report: what’s technically broken, where conversion leaks, and whether AI answers can quote you. The biggest leak gets named first.',
  },
  {
    k: 'Who it’s for',
    v: '$200k+/month stores with a technical or industrial catalog, growth flat for the last two to four quarters.',
  },
  {
    k: 'Yours to keep',
    v: 'The report is yours whether or not we ever work together. No pitch, no drip sequence, no follow-up loop.',
  },
]

export function AuditSocialProof({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What the audit is
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          A diagnosis, not a pitch.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          You get the single biggest leak named, with the evidence behind it.
          Hand it to whoever ships the fix, us or your own team.
        </p>
      </div>

      <dl className="mt-14 grid gap-8 border-t border-white/15 pt-10 sm:grid-cols-3 sm:gap-10">
        {COVERS.map((c) => (
          <div key={c.k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              {c.k}
            </dt>
            <dd className="mt-3 text-sm leading-relaxed text-ink-300">{c.v}</dd>
          </div>
        ))}
      </dl>
    </SectionRail>
  )
}
