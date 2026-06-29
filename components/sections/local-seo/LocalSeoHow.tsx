import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/local-seo-maps/ § — how it works.
 *
 * The four moves that win the map pack: fix the Google Business Profile, build
 * the local pages, win the reviews, and clean up citations. Numbered steps on
 * paper, operator voice.
 */

type Step = {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Fix your Google Business Profile',
    body: 'The profile is what Google ranks on the map. We fill in every field, set the right categories, add real photos and services, and keep your hours and details accurate, so Google trusts it enough to show it.',
  },
  {
    n: '02',
    title: 'Build the local pages',
    body: 'A real page for each service and area you cover, written the way people actually search. That is how you rank for “roofer in [your town],” not only your home city.',
  },
  {
    n: '03',
    title: 'Win the reviews that rank',
    body: 'A simple, automatic ask after every job turns happy customers into the review count and rating that lift you in the pack and close the next caller. Real reviews only. Fake ones break the rules and backfire.',
  },
  {
    n: '04',
    title: 'Get the citations right',
    body: 'Your name, address, and phone, identical everywhere Google checks. It is the unglamorous signal that quietly decides who the map trusts.',
  },
]

export function LocalSeoHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Four moves that put you on the map.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Local search rewards the business that sets the basics up properly and
          keeps them current. We do that work and keep doing it.
        </p>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="bg-paper p-7 sm:p-8">
            <span className="font-mono text-[13px] font-medium tabular-nums text-accent-600">
              {s.n}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink-900">
              {s.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-700">{s.body}</p>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
