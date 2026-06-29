import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /book-growth-call/ § 3 — Who actually books these calls.
 *
 * One-line personas in voice — the words a real founder/CMO would use
 * when self-diagnosing why they're on this page. Helps the buyer find
 * themselves in the list (or recognise they're not the fit, which is
 * also a useful outcome).
 */

type Persona = {
  role: string
  context: string
  quote: string
}

const PERSONAS: Persona[] = [
  {
    role: 'Founder / CEO',
    context: 'Industrial e-com · $5–25M ARR',
    quote: '"Organic traffic is down 20% and rankings haven\'t moved. Something structural broke."',
  },
  {
    role: 'Head of Growth',
    context: 'Technical distribution · $10M+ ARR',
    quote: '"We\'ve outgrown the generalist agency. Need someone who knows GEO at depth."',
  },
  {
    role: 'CMO',
    context: 'Hydraulics / fluid power · $20M+ ARR',
    quote: '"Three sub-agencies, four reports, no unified scoreboard. Need one operator."',
  },
  {
    role: 'E-commerce Director',
    context: 'Spec-heavy B2B · headless stack',
    quote: '"Schema is a mess. Product catalog is 8k SKUs. In-house can\'t prioritise."',
  },
]

export function WhoBooks() {
  return (
    <SectionRail tone="surface">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Who books these
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Find yourself in one line.
          </h2>
          <p className="mt-6 text-ink-700">
            Recent calls, paraphrased. If none of these sound like you,
            you&rsquo;re probably better off with a different agency &mdash;
            and we&rsquo;ll tell you so on the call.
          </p>
        </div>

        <ul className="md:col-span-8">
          {PERSONAS.map((p, i) => (
            <li
              key={p.role}
              className="border-t border-rule py-6 last:border-b md:py-7"
            >
              <div className="grid gap-4 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                    {(i + 1).toString().padStart(2, '0')} &middot; {p.context}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold text-ink-900">
                    {p.role}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <p className="text-balance text-lg leading-snug text-ink-700">
                    <span aria-hidden className="mr-1 font-display text-2xl text-ink-300">&ldquo;</span>
                    {p.quote.replace(/^"|"$/g, '')}
                    <span aria-hidden className="ml-0.5 font-display text-2xl text-ink-300">&rdquo;</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 max-w-2xl text-sm text-ink-500">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          Honest threshold &middot;{' '}
        </span>
        We do our best work above $200k/month e-commerce revenue. Below
        that, the engagement math doesn&rsquo;t hold &mdash; and we&rsquo;ll
        say so on the call.
      </div>
    </SectionRail>
  )
}
