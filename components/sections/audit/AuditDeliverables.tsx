import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /unlock-growth-audit/ § 2 — what lands in the inbox.
 *
 * Dark band so the deliverable list reads as the substance of the offer,
 * not soft marketing. Two columns: three lenses on the left (technical /
 * CRO / AI-search), the line-itemed deliverable list on the right with the
 * bonus checklist flagged in accent orange.
 */

type Lens = {
  k: string
  title: string
  body: string
}

type Deliverable = {
  title: string
  body: string
  badge: string
  accent?: boolean
}

const LENSES: Lens[] = [
  {
    k: 'Lens 01',
    title: 'Technical deep-dive',
    body: '60-point crawl. Indexing, schema, internal links, Core Web Vitals — prioritised by revenue impact, not severity score.',
  },
  {
    k: 'Lens 02',
    title: 'CRO & UX heatmap',
    body: 'Top 5 revenue pages reviewed against a 30-checkpoint conversion framework. Each friction tagged with effort + expected lift.',
  },
  {
    k: 'Lens 03',
    title: 'AI-search readiness',
    body: 'How AI Overviews see you today. Citation gaps vs your top 3 competitors. The three highest-leverage fixes.',
  },
]

const DELIVERABLES: Deliverable[] = [
  {
    title: '60-point technical SEO crawl',
    body: 'Prioritised by revenue impact. Each issue tagged with effort and expected lift — so you can pick the top three and go.',
    badge: 'Day 1',
  },
  {
    title: 'CRO & UX heatmap analysis',
    body: 'Your top 5 revenue pages reviewed against the 30-checkpoint conversion framework we use with $50M+ clients.',
    badge: 'Day 1',
  },
  {
    title: 'AI-Search readiness scorecard',
    body: 'Where AI engines surface you today. Where competitors out-cite you. The three structural changes that close the gap.',
    badge: 'Day 1',
  },
  {
    title: '$2k Implementation Checklist',
    body: 'A 30-day plan tied to your actual constraint. Ready to hand to your developer or agency. Yours to keep either way.',
    badge: 'Bonus',
    accent: true,
  },
]

export function AuditDeliverables({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What you get
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Three lenses. <span className="text-ink-400">One report. 24 hours.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Most &ldquo;free audits&rdquo; are automated scans wrapped in a
          slide deck. This is a written, opinionated diagnosis by a senior
          operator who has lived in technical e&#8209;commerce for a decade.
        </p>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-16">
        <ul className="md:col-span-5 md:space-y-10 space-y-8">
          {LENSES.map((lens) => (
            <li key={lens.k}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                {lens.k}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                {lens.title}
              </h3>
              <p className="mt-2 text-ink-300">{lens.body}</p>
            </li>
          ))}
        </ul>

        <ol className="md:col-span-7 space-y-px">
          <li className="border-t border-white/15 pb-2 pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              In your inbox within 24 hours
            </p>
          </li>
          {DELIVERABLES.map((d, i) => (
            <li
              key={d.title}
              className="border-t border-white/15 py-6 first:border-t-0"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {d.title}
                    </h3>
                    <span
                      className={
                        d.accent
                          ? 'inline-block rounded-[3px] bg-accent-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500'
                          : 'inline-block rounded-[3px] border border-white/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-300'
                      }
                    >
                      {d.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-ink-300">{d.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionRail>
  )
}
