import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Editorial Authority § 06 — what every retainer includes.
 *
 * Answers the implicit "what differs between Focused at $4K and Standard
 * at $7.5K?" question. Same baseline on every tier; volume scales by
 * tier. 4×2 grid on lg, 2×4 on md.
 */

type Inclusion = { title: string; body: string }

const INCLUSIONS: Inclusion[] = [
  {
    title: 'Senior writer ownership',
    body: 'A named writer with vertical experience drafts every piece. No junior pool, no offshore handoff.',
  },
  {
    title: 'Topic + keyword research monthly',
    body: '15–20 candidate topics ranked by AIO citation gap, commercial intent, and competitor weakness. You greenlight what ships.',
  },
  {
    title: 'AIO + citation engineering on every piece',
    body: 'Structured for AI Overviews and ChatGPT retrieval. Tracked monthly so you know which queries cite you.',
  },
  {
    title: 'Editorial style guide',
    body: 'Built once, applied every piece. Your tone, spec conventions, and product terminology locked into a living guide.',
  },
  {
    title: 'Schema + internal linking standard',
    body: 'Article, FAQ, and HowTo schema where it earns its keep. Cluster-aware internal linking on every published piece.',
  },
  {
    title: '2 revisions per article',
    body: 'Two revision passes per article come standard on every retainer tier. Outside the trial — there the count is one, and we say so upfront.',
  },
  {
    title: 'Monthly outcome reporting',
    body: 'Citation coverage, query mix, organic + AIO traffic, written commentary. Not a Looker dashboard you&rsquo;ll never open.',
  },
  {
    title: 'Volume discounts (5% / 15%)',
    body: '5% off for a 6-month commitment, 15% off for 12 months. Stacks on the listed tier prices for the term.',
  },
]

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function EditorialIncluded({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" size="sm" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          In every retainer
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What every retainer ships{' '}
          &mdash; without asking.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          Answers the implicit objection: &ldquo;what does Focused at $4K
          include vs. Standard at $7.5K?&rdquo; Same baseline. Just
          different volume.
        </p>
      </div>

      <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {INCLUSIONS.map((item) => (
          <li key={item.title} className="flex flex-col gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-service-editorial-50 text-service-editorial-700">
              <Check className="h-3.5 w-3.5" />
            </span>
            <p className="font-display text-base font-semibold leading-snug text-ink-900">
              {item.title}
            </p>
            <p
              className="text-sm leading-relaxed text-ink-700"
              dangerouslySetInnerHTML={{ __html: item.body }}
            />
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
