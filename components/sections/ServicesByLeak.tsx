import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FULL_GROWTH, SERVICE_CLASSES, SERVICES, type ServiceKey } from '@/components/services/service-colors'

import { InView } from './InView'

/**
 * Home services section — OPTION A: "Two leaks → the fix."
 *
 * De-commoditizes the old six-tab menu by reframing on the buyer's problem-state
 * (a NEW axis vs FrameworkTimeline's phases above and EngagementModel's tiers
 * below): the two leaks that drain a distributor, then which work closes each.
 * Industrial lane only — WhoWeServe already routed local-service away, so zero
 * Revenue Engine language here. No outcome guarantee (industrial no-guarantee
 * stance); result claims use effort/mechanism verbs.
 *
 * All six service names + /services/* links render in static HTML (no tabs).
 */

type FixKey = Exclude<ServiceKey, 'composite'>

const LEAKS = [
  {
    id: '01',
    quote: 'The phone’s quieter and we’re getting fewer quotes.',
    line: 'Buyers ask Google’s AI and ChatGPT for the part now, and the answer names the manufacturer or Amazon — not you. You lose the buyer before he ever reaches your site.',
  },
  {
    id: '02',
    quote: 'Our website’s a parts dump nobody can search.',
    line: 'Your catalog was built for a web that’s gone: slow pages, no straight answers, quote-only pricing the AI can’t read. The buyers who do reach you bounce.',
  },
] as const

type Fix = { key: FixKey; lead: string }

const CLOSES_01: Fix[] = [
  { key: 'search', lead: 'Get named when a buyer asks ChatGPT or Google’s AI for the part.' },
  { key: 'editorial', lead: 'Be the source the AI quotes, not the brand you resell.' },
  { key: 'outbound', lead: 'Go get the right buyers who aren’t searching yet.' },
]
const CLOSES_02: Fix[] = [
  { key: 'catalog', lead: 'Every product page answers the buyer’s real question — across 1,000+ SKUs.' },
  { key: 'dev', lead: 'Fast pages and a quote request that doesn’t make a ready buyer bail. You own the code.' },
]

function FixCard({ fix }: { fix: Fix }) {
  const svc = SERVICES[fix.key]
  return (
    <Link
      href={svc.href}
      data-cta={`services-fix-${fix.key}`}
      data-cta-location="home-services-byleak"
      className="group flex items-start gap-3 border-t border-white/10 py-4 transition-colors hover:border-white/30"
    >
      <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SERVICE_CLASSES[fix.key].dot}`} />
      <span className="flex-1">
        <span className="block text-[15px] font-medium leading-snug text-white">{fix.lead}</span>
        <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
          {svc.name}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </span>
    </Link>
  )
}

export function ServicesByLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What we fix
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Two leaks drain a distributor. We close both.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-300">
          Most owners are bleeding on both sides at once. Here&rsquo;s each leak,
          and what closes it.
        </p>
      </div>

      {/* Layer 1 — the two leaks (not a pick-one fork) */}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {LEAKS.map((leak) => (
          <div key={leak.id} className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
              Leak {leak.id}
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              &ldquo;{leak.quote}&rdquo;
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-300">{leak.line}</p>
          </div>
        ))}
      </div>

      {/* Layer 2 — the fix: six services regrouped by the leak they close */}
      <InView className="mt-12">
        <p className="max-w-2xl text-lg leading-relaxed text-ink-200">
          We don&rsquo;t sell six line items. We run one set of work, and each
          piece closes one of the two leaks.
        </p>

        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Closes Leak 01 · get found, get chosen
            </p>
            <div className="mt-2">
              {CLOSES_01.map((fix) => (
                <FixCard key={fix.key} fix={fix} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Closes Leak 02 · make what you’ve got sell
            </p>
            <div className="mt-2">
              {CLOSES_02.map((fix) => (
                <FixCard key={fix.key} fix={fix} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-3xl space-y-3 text-[15px] leading-relaxed text-ink-300">
          <p>
            The AI-readiness work under Leak 01 also does the heavy lifting for
            Leak 02 &mdash; once your pages are clean enough for AI to read, both
            leaks start to close.
          </p>
          <p>
            We run these in the order three sections up: get AI-ready first,
            become the name buyers trust next, stay out front last. Each step has
            to pay off before the next. That&rsquo;s the discipline, not a promise
            on a number.
          </p>
          <p className="text-ink-400">
            No guarantee on a count of quotes. You get the work, run by one
            operator, and the truth about what&rsquo;s moving and what isn&rsquo;t.
          </p>
        </div>
      </InView>

      {/* Layer 3 — FGO as the destination, floors shown */}
      <div className="mt-14 overflow-hidden border border-white/10 bg-black/30 backdrop-blur">
        <div className="grid gap-6 px-6 py-7 md:grid-cols-12 md:items-center md:gap-8 md:px-8">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              The whole thing, run for you
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Run the six with us &mdash; or hand the lot to one operator.
            </h3>
            <p className="mt-3 max-w-2xl text-ink-300">
              Full Growth Ownership puts AI search, catalog, editorial, dev, and
              outbound under one accountable operator. Two shapes:
            </p>
            <ul className="mt-4 space-y-2 text-[15px] text-ink-200">
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="text-accent-500">·</span>
                One operator owns your growth, priced flat by company size.
              </li>
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="text-accent-500">·</span>
                Turn on the services you want, priced by how many.
              </li>
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
              Quoted after the qualifier · SOW in 48 hours · Leave on 90 days’ notice
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-5 md:items-end">
            <Link
              href={FULL_GROWTH.href}
              data-cta="full_growth_ownership__home_byleak"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-white/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white/5"
            >
              See Full Growth Ownership
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/book-growth-call/"
              data-cta="book_call__home_byleak"
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
