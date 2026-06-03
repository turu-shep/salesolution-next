import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § 5 — How it works, in four steps.
 *
 * Numbered grid: 1) intake, 2) pilot, 3) full processing, 4) delivery.
 * Each step is one short paragraph — no marketing fluff, no fictional
 * "we partner with you" language. The day-7 pilot batch is the trust
 * anchor and gets emphasis in step 2.
 */

type Step = {
  n: string
  title: string
  body: React.ReactNode
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'You send us your catalog and a voice sample.',
    body: (
      <>
        CSV or platform export of your products, plus 50 of your best
        existing descriptions so we can train the model on your tone.
        That&rsquo;s the entire intake.
      </>
    ),
  },
  {
    n: '02',
    title: 'We rewrite at AI scale, sample by hand, ship a pilot at day 7.',
    body: (
      <>
        First 500 SKUs land on day 7. You approve voice and quality before
        we touch the rest of the catalog. The pilot is the trust
        gate &mdash; everything else is downstream of you signing off here.
      </>
    ),
  },
  {
    n: '03',
    title: 'Full processing runs against your tier spec.',
    body: (
      <>
        Standard runs at ~2,000 SKUs/day. Pro at ~1,000/day (deeper content
        + manufacturer spec ingestion + FAQ generation). Enterprise runs
        continuously with your dedicated operator.
      </>
    ),
  },
  {
    n: '04',
    title: 'You get it in your platform’s import format.',
    body: (
      <>
        Shopify CSV, Magento XML, BigCommerce, custom &mdash; we map to
        your import. You upload, we verify, you&rsquo;re live. 30 days of
        post-delivery issue resolution at no charge.
      </>
    ),
  },
]

export function CatalogProcess({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Four steps. <span className="text-ink-500">The pilot is the trust gate.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Missing the day-7 pilot is the single most damaging failure mode
          in this work. We protect it on every engagement.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-2">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="flex flex-col border border-rule bg-paper p-6 md:p-8"
          >
            <p className="font-display text-5xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink-300">
              {step.n}
            </p>
            <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
              {step.title}
            </h3>
            <p className="mt-3 text-ink-700">{step.body}</p>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
