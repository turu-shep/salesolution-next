import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /unlock-growth-audit/ § 3 — sample preview.
 *
 * Mock of the actual report layout. Lets the prospect see exactly what
 * arrives in their inbox. Six findings in a tight table, one of them
 * called out as "the constraint" — same opinionated voice used in the
 * /services/ai-seo comparison table.
 *
 * Two columns: left explains the report's logic, right is the report
 * mock. Light tone (surface) so it sits between two dark bands.
 */

type Finding = {
  area: string
  finding: string
  effort: 'Low' | 'Med' | 'High'
  lift: string
  flag?: 'constraint' | 'easy-win'
}

const FINDINGS: Finding[] = [
  {
    area: 'Schema',
    finding: 'Product schema missing GTIN + price-spec on 87% of SKUs',
    effort: 'Med',
    lift: '+12–18% AIO citation',
    flag: 'constraint',
  },
  {
    area: 'CRO',
    finding: 'Mobile checkout: 3 visible CTAs on cart, none priced inline',
    effort: 'Low',
    lift: '+4–7% CVR',
    flag: 'easy-win',
  },
  {
    area: 'GEO',
    finding: 'Top 50 commercial queries — cited in 6%, manufacturer in 41%',
    effort: 'High',
    lift: '6→25% citation share',
  },
  {
    area: 'Content',
    finding: 'No answer hubs for the 12 highest-intent engineering queries',
    effort: 'Med',
    lift: '+18% qualified inbounds',
  },
  {
    area: 'CWV',
    finding: 'LCP 3.8s on top category page — image weight, not server',
    effort: 'Low',
    lift: '+3–5% CVR',
    flag: 'easy-win',
  },
  {
    area: 'Internal links',
    finding: 'Orphan rate 22% on the SKU set that drives 41% of revenue',
    effort: 'Med',
    lift: 'Indexing depth fix',
  },
]

const effortStyle: Record<Finding['effort'], string> = {
  Low: 'bg-data-up/10 text-data-up',
  Med: 'bg-accent-500/10 text-accent-700',
  High: 'bg-data-down/10 text-data-down',
}

export function AuditPreview({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What the report looks like
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          One page. <span className="text-ink-500">Six findings. The constraint, named.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          We don&rsquo;t send a 40-slide deck. The audit is a single
          opinionated page: six findings ranked by revenue impact, the
          single constraint flagged in orange, every line tagged with
          effort and expected lift so you can move tomorrow.
        </p>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <div className="space-y-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                How it&rsquo;s ranked
              </p>
              <p className="mt-2 text-ink-700">
                By expected revenue impact, not severity score. A &ldquo;critical&rdquo;
                technical issue with no revenue tied to it ranks lower than a
                small CRO fix on your top category.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                The flag in orange
              </p>
              <p className="mt-2 text-ink-700">
                One finding per audit gets called out as the constraint. It&rsquo;s
                the one we&rsquo;d fix first if it were our store &mdash; and the
                one that explains the most of your current revenue gap.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                What&rsquo;s deliberately missing
              </p>
              <p className="mt-2 text-ink-700">
                No vanity rankings. No keyword volume dumps. No automated
                Lighthouse score copy-paste. The audit is opinionated by
                design.
              </p>
            </div>
          </div>
        </div>

        <figure className="md:col-span-8">
          <div className="overflow-hidden border border-rule bg-surface shadow-sm">
            {/* Mock report header — looks like a PDF preview */}
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 rounded-full bg-data-down/60" />
                <span aria-hidden className="h-2 w-2 rounded-full bg-accent-500/60" />
                <span aria-hidden className="h-2 w-2 rounded-full bg-data-up/60" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                growth-audit_yourstore.pdf
              </p>
              <span aria-hidden className="w-12" />
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Sale Solution &middot; Growth Audit &middot; sample
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.01em] text-ink-900 sm:text-3xl">
                Six findings ranked by revenue impact.
              </h3>
              <p className="mt-3 text-sm text-ink-700">
                Yourstore.com &middot; ~8,500 SKUs &middot; industrial
                hydraulics &middot; current MRR ~ $380k
              </p>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="border-b border-rule-strong pb-3 pr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Area
                      </th>
                      <th className="border-b border-rule-strong pb-3 pr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Finding
                      </th>
                      <th className="border-b border-rule-strong pb-3 pr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Effort
                      </th>
                      <th className="border-b border-rule-strong pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        Expected lift
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FINDINGS.map((f, i) => (
                      <tr key={i} className="align-top">
                        <td
                          className={
                            'border-b border-rule py-3 pr-3 font-mono text-[11px] uppercase tracking-[0.14em] ' +
                            (f.flag === 'constraint' ? 'text-accent-700' : 'text-ink-500')
                          }
                        >
                          {f.area}
                        </td>
                        <td className="border-b border-rule py-3 pr-3 text-sm text-ink-900">
                          <span className="flex flex-wrap items-baseline gap-2">
                            {f.flag === 'constraint' && (
                              <span className="inline-block rounded-[3px] bg-accent-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-accent-700">
                                The constraint
                              </span>
                            )}
                            {f.flag === 'easy-win' && (
                              <span className="inline-block rounded-[3px] bg-data-up/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-data-up">
                                Easy win
                              </span>
                            )}
                            <span>{f.finding}</span>
                          </span>
                        </td>
                        <td className="border-b border-rule py-3 pr-3">
                          <span
                            className={
                              'inline-block rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-semibold ' +
                              effortStyle[f.effort]
                            }
                          >
                            {f.effort}
                          </span>
                        </td>
                        <td className="border-b border-rule py-3 font-mono text-[11px] tabular-nums text-ink-700">
                          {f.lift}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 border-l-2 border-accent-500 pl-4 text-sm text-ink-700">
                <span className="font-semibold text-ink-900">If we were you:</span>{' '}
                fix the schema gap first. It unblocks the GEO citation
                ceiling and rolls into the answer-hub work in week three.
              </p>
            </div>
          </div>
          <figcaption className="mt-3 font-mono text-[11px] text-ink-400">
            Sample preview &middot; your audit replaces these findings with your own
          </figcaption>
        </figure>
      </div>
    </SectionRail>
  )
}
