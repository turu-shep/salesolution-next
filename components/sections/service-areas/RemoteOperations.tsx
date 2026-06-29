import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /service-areas/ § 4 — How remote delivery actually works.
 *
 * The honest version of &ldquo;we work everywhere.&rdquo; Four operating
 * principles that map the location question onto the delivery model.
 * Light tone; sits between the dark Primary Office band and the dark
 * FinalCTARail to keep the L-D-L-D rhythm intact.
 */

type Principle = {
  code: string
  title: string
  body: string
}

const PRINCIPLES: Principle[] = [
  {
    code: '01',
    title: 'One operator owns the engagement.',
    body:
      'No account-manager layer, no offshore handoff. The same person on the strategy call ships the schema. Location of the buyer matters less than calendar overlap.',
  },
  {
    code: '02',
    title: 'Eastern Time is the anchor.',
    body:
      'Standups, async reviews, and reporting cycles run on ET. Pacific and Mountain clients get late-afternoon slots; international clients get morning ET overlap.',
  },
  {
    code: '03',
    title: 'In-person on request, not by default.',
    body:
      'For multi-quarter retainers we travel to the client site for kickoff or a quarterly review — billed at cost. Most engagements run start-to-finish remote.',
  },
  {
    code: '04',
    title: 'Compliance and contracts are US-domiciled.',
    body:
      'Delaware C-corp, Florida office, US tax residency. EU/UK/CA clients sign a standard SOW with W-9 attached — no offshore entity routing.',
  },
]

export function RemoteOperations({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How remote delivery works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Distance isn&rsquo;t the constraint. Calendar overlap is.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          Four operating principles that make the &ldquo;where&rdquo;
          question less interesting than it looks.
        </p>
      </div>

      <ol className="mt-14 grid gap-x-10 gap-y-10 border-t border-rule pt-12 md:grid-cols-2">
        {PRINCIPLES.map((p, i) => (
          <li
            key={p.code}
            className={i % 2 === 1 ? 'md:border-l md:border-rule md:pl-10' : ''}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Principle &middot; {p.code}
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-ink-900 sm:text-2xl">
              {p.title}
            </h3>
            <p className="mt-3 text-ink-700">{p.body}</p>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
