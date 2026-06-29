import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

import { InView } from './InView'

/**
 * Home § — name the leak, meet the part.
 *
 * FrameworkTimeline (just above) shows the engine as three jobs. This is the
 * concrete follow-through: the owner names the outcome they want in their own
 * words, and we point them at the ONE cylinder that fixes it — its real
 * /services/ page when it's built, the product page when it's still Coming soon.
 *
 * Replaces the old two-door "Intent Index", which routed every goal to an
 * industrial-vs-revenue funnel — the two-funnel model the rebrand collapses.
 * One machine now; goals map to its parts, not to separate funnels.
 *
 * Distinct from WhoWeServe (3-card "who are you" industry router) and from
 * FrameworkTimeline (the engine as a process): this is a numbered ROW index of
 * "what do you want" → a named part. Rows-vs-cards is the anti-redundancy guard.
 *
 * Value-first: the headline stays in plain outcome language; "cylinder" never
 * appears as a word to decode — the parts are named only as the destinations.
 *
 * Static + server-rendered: every label and href is in the first response, so
 * crawlers and AI answers can read the goal → part map.
 */

type Cylinder = {
  /** the part's name — shown as the mono destination tag */
  name: string
  /** the job it fires, written as an owner-facing action */
  action: string
  /** built parts deep-link their /services page; the rest point at the product page */
  href: string
  built: boolean
}

type Goal = {
  id: string
  label: string
  stake: string
  cylinder: Cylinder
}

const GOALS: Goal[] = [
  {
    id: 'g1',
    label: 'I want to show up when people ask AI.',
    stake: 'A buyer asks ChatGPT or Google’s AI for what you sell, and your name never comes up.',
    cylinder: {
      name: 'AI Search & GEO',
      action: 'Get named in the AI answer',
      href: '/services/ai-seo/',
      built: true,
    },
  },
  {
    id: 'g2',
    label: 'I want to be the name buyers already trust.',
    stake: 'The people who’d buy from you have never heard of you, so they go with whoever they have heard of.',
    cylinder: {
      name: 'Editorial Authority',
      action: 'Earn the citations that build the name',
      href: '/services/editorial-authority/',
      built: true,
    },
  },
  {
    id: 'g3',
    label: 'I just want more work coming in.',
    stake: 'Not enough quotes, not enough booked jobs. The number you actually watch.',
    cylinder: {
      name: 'Outbound Email',
      action: 'Reach the buyers who never came inbound',
      href: '/services/outbound-email-marketing-services/',
      built: true,
    },
  },
  {
    id: 'g4',
    label: 'I want to stop losing buyers who land and leave.',
    stake: 'You pay for the visit, then a slow, hard-to-read site sends the quote request somewhere else.',
    cylinder: {
      name: 'Website Development',
      action: 'Fix the site buyers bounce off',
      href: '/services/website-development-design-services/',
      built: true,
    },
  },
  {
    id: 'g5',
    label: 'I want every call answered, even after hours.',
    stake: 'The phone rings while you’re on a roof or with a patient. The 9pm lead books with whoever picks up first.',
    cylinder: {
      name: 'Answer & Book',
      action: 'Answer every call, text back the missed ones',
      href: '/services/answer-and-book/',
      built: true,
    },
  },
  {
    id: 'g6',
    label: 'I want back the quotes and customers that went quiet.',
    stake: 'Cold estimates and dormant accounts are the cheapest revenue you have, and nobody is chasing them.',
    cylinder: {
      name: 'Recover & Reactivate',
      action: 'Chase cold quotes, win back the list',
      href: '/services/recover-reactivate/',
      built: true,
    },
  },
]

function GoalDestination({ goalId, cylinder }: { goalId: string; cylinder: Cylinder }) {
  return (
    <Link
      href={cylinder.href}
      data-cta={`goal-${goalId}-${cylinder.built ? 'part' : 'soon'}`}
      data-cta-location="home-intent-index"
      className="group/dest flex flex-col gap-y-1"
    >
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-700">
        <span aria-hidden className="h-1 w-1 rounded-full bg-brand-500" />
        {cylinder.name}
        {!cylinder.built && (
          <span className="rounded-full border border-rule px-1.5 py-px text-[9px] font-medium tracking-[0.1em] text-ink-400">
            Coming soon
          </span>
        )}
      </span>
      <span
        className={cn(
          'text-[15px] font-medium leading-snug text-ink-800 underline decoration-transparent underline-offset-[3px] transition-colors',
          'group-hover/dest:text-brand-700 group-hover/dest:decoration-brand-400',
        )}
      >
        {cylinder.action}
        <span aria-hidden className="ml-1 inline-block transition-transform group-hover/dest:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  )
}

export function GoalIndex({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Start with what you want
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Tell us the outcome. We&rsquo;ll point you to the fix.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Six things owners ask us for, in plain words. Each points to the part that
          fixes it. Run that one, or hand us all of them.
        </p>
      </div>

      <InView as="dl" className="mt-12">
        {GOALS.map((goal, i) => (
          <div
            key={goal.id}
            className="group grid grid-cols-1 gap-x-6 gap-y-4 border-t border-rule py-6 transition-colors last:border-b hover:bg-ink-900/[0.02] md:grid-cols-12 md:gap-x-8"
          >
            <span
              aria-hidden
              className="font-mono text-[13px] font-medium tabular-nums text-ink-400 transition-colors group-hover:text-ink-900 md:col-span-1"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <dt className="md:col-span-6">
              <p className="font-display text-xl font-semibold leading-snug text-ink-900">
                {goal.label}
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-600">{goal.stake}</p>
            </dt>
            <dd className="md:col-span-5">
              <GoalDestination goalId={goal.id} cylinder={goal.cylinder} />
            </dd>
          </div>
        ))}
      </InView>

      <p className="mt-8 text-sm leading-relaxed text-ink-500">
        Want the whole picture?{' '}
        <Link
          href="/services/"
          data-cta="goal-escape-services"
          data-cta-location="home-intent-index"
          className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink-900"
        >
          See every part of the engine
        </Link>{' '}
        ·{' '}
        <Link
          href="/revenue-engine/"
          data-cta="goal-escape-revenue"
          data-cta-location="home-intent-index"
          className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink-900"
        >
          or how the whole engine runs
        </Link>
        .
      </p>
    </SectionRail>
  )
}
