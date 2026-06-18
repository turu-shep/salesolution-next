import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FULL_GROWTH, SERVICE_CLASSES, SERVICES, type ServiceKey } from '@/components/services/service-colors'

import { InView } from './InView'

/**
 * Home services section — OPTION B: "The Answer Engine" (named product system).
 *
 * Productizes the industrial side into a named system with its own mechanism
 * (Read → Trust → Reach), mirroring how the Revenue Engine is a product, not a
 * menu. The six services become the engine's components. Industrial lane only;
 * no Revenue Engine language. No outcome guarantee — effort/mechanism verbs.
 *
 * CAVEAT (flag for owner): this introduces a second 3-step model adjacent to
 * FrameworkTimeline's Foundation → Amplify → Lead above. If this option wins,
 * the two should be reconciled (merge, or differentiate the axes explicitly).
 *
 * All five service names + /services/* links render in static HTML.
 */

type StageKey = Exclude<ServiceKey, 'composite'>

type Stage = {
  n: string
  label: string
  question: string
  body: string
  services: StageKey[]
}

const STAGES: Stage[] = [
  {
    n: '01',
    label: 'Read',
    question: 'Can the AI read you?',
    body: 'Clean, fast pages and product data a machine can actually parse. If the AI can’t read it, it can’t hand it back to a buyer.',
    services: ['catalog', 'dev'],
  },
  {
    n: '02',
    label: 'Trust',
    question: 'Does it name you over the brand?',
    body: 'Become the source worth quoting, ahead of the manufacturer’s own site — the depth and answers the AI leans on when a buyer asks.',
    services: ['search', 'editorial'],
  },
  {
    n: '03',
    label: 'Reach',
    question: 'Do you catch the rest?',
    body: 'Not every buyer is searching yet. Go get the right ones directly, with outreach that actually lands.',
    services: ['outbound'],
  },
]

function ServiceLink({ k }: { k: StageKey }) {
  const svc = SERVICES[k]
  return (
    <Link
      href={svc.href}
      data-cta={`answer-engine-${k}`}
      data-cta-location="home-services-system"
      className="group flex items-center gap-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:text-white"
    >
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${SERVICE_CLASSES[k].dot}`} />
      {svc.name}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  )
}

export function ServicesSystem({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" glow="strong" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The industrial engine
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The Answer Engine.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-300">
          When a buyer asks AI for a part, three things decide whether your name
          comes up. The Answer Engine works all three &mdash; built and run by one
          operator, not handed to five vendors.
        </p>
      </div>

      {/* The mechanism — three stages, the six services as components */}
      <InView className="mt-12 grid gap-5 md:grid-cols-3">
        {STAGES.map((stage, i) => (
          <div key={stage.n} className="relative flex flex-col border border-white/10 bg-white/[0.02] p-6">
            {/* connector arrow between stages on desktop */}
            {i < STAGES.length - 1 && (
              <span
                aria-hidden
                className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 font-mono text-lg text-brand-400 md:block"
              >
                →
              </span>
            )}
            <div className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="text-brand-300">{stage.n}</span>
              <span className="text-ink-400">/</span>
              <span className="text-white">{stage.label}</span>
            </div>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              {stage.question}
            </p>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-300">
              {stage.body}
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              {stage.services.map((k) => (
                <ServiceLink key={k} k={k} />
              ))}
            </div>
          </div>
        ))}
      </InView>

      <div className="mt-8 max-w-3xl space-y-3 text-[15px] leading-relaxed text-ink-300">
        <p>
          Each stage feeds the next. We don&rsquo;t chase Reach until Read and
          Trust have started to pay off &mdash; that&rsquo;s the order, not a
          promise on a number.
        </p>
        <p className="text-ink-400">
          No guarantee on a count of quotes. One operator runs the engine, and you
          see what&rsquo;s moving and what isn&rsquo;t.
        </p>
      </div>

      {/* FGO — run the engine yourself with us, or hand it over. Floors shown. */}
      <div className="mt-14 overflow-hidden border border-white/10 bg-black/30 backdrop-blur">
        <div className="grid gap-6 px-6 py-7 md:grid-cols-12 md:items-center md:gap-8 md:px-8">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Run it, or hand it over
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Run the engine with us &mdash; or hand the whole thing to one operator.
            </h3>
            <p className="mt-3 max-w-2xl text-ink-300">
              Full Growth Ownership runs the entire Answer Engine under one
              accountable operator. Two shapes:
            </p>
            <ul className="mt-4 space-y-2 text-[15px] text-ink-200">
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="text-brand-400">·</span>
                One operator owns your growth, priced flat by company size &mdash;
                from <span className="font-semibold text-white">$20K/mo</span>.
              </li>
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="text-brand-400">·</span>
                Turn on the parts you want, priced by how many &mdash; from{' '}
                <span className="font-semibold text-white">$12K/mo</span>.
              </li>
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
              Published prices · SOW in 48 hours · Leave on 90 days’ notice
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-5 md:items-end">
            <Link
              href={FULL_GROWTH.href}
              data-cta="full_growth_ownership__home_system"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-white/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white/5"
            >
              See Full Growth Ownership
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/book-growth-call/"
              data-cta="book_call__home_system"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-300 transition-colors duration-200 hover:text-white"
            >
              Book a Growth Call
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
