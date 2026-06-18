import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

import { InView } from './InView'

/**
 * Home § — "The Intent Index" (cross-vertical goal picker).
 *
 * Replaces the old industrial six-service menu (moved to the industrial hub).
 * The buyer starts with the OUTCOME they want, not our deliverables. Six
 * owner-voice "I want to ___" rows; each routes to ONE funnel per click — never
 * co-locating the two doors, so the funnels stay separate.
 *
 * Distinct from WhoWeServe on purpose: that's a 3-CARD vertical splitter ("who
 * are you"); this is a flat ROW list ("what do you want"). Different axis,
 * different format — the rows-vs-cards contrast is the anti-redundancy guard.
 *
 * Static + server-rendered: every label and href is in the first response (no
 * JS gating), so crawlers and AI answers can read the goal → solution map.
 * Industrial links are brand-blue, Revenue Engine links accent-orange (the
 * funnel coloring reused from ProblemShift/WhoWeServe); the link's qualifier
 * text carries the funnel too, for colorblind users and crawlers.
 */

type Funnel = 'industrial' | 'revenue'

type GoalLink = {
  href: string
  text: string
  funnel: Funnel
  vertical?: 'homeservices' | 'dental'
  secondary?: boolean
}

type Goal = {
  id: string
  label: string
  stake: string
  links: GoalLink[]
}

const TONE: Record<Funnel, { text: string; decoration: string; dot: string }> = {
  industrial: {
    text: 'text-brand-700',
    decoration: 'decoration-brand-500/40 group-hover:decoration-brand-600',
    dot: 'bg-brand-500',
  },
  revenue: {
    text: 'text-accent-700',
    decoration: 'decoration-accent-500/40 group-hover:decoration-accent-600',
    dot: 'bg-accent-500',
  },
}

const GOALS: Goal[] = [
  {
    id: 'g1',
    label: 'I want to show up when people ask AI.',
    stake: 'A buyer asks ChatGPT or Google’s AI for what you sell, and your name never comes up.',
    links: [
      { href: '/services/ai-seo/', text: 'See who AI names for your products', funnel: 'industrial' },
      { href: '/revenue-engine/', text: 'Run a local shop? Get found in your area', funnel: 'revenue', secondary: true },
    ],
  },
  {
    id: 'g2',
    label: 'I want more people to know my company.',
    stake: 'People who’d buy from you have never heard your name.',
    links: [
      { href: '/services/editorial-authority/', text: 'Become the name buyers and AI keep citing', funnel: 'industrial' },
      { href: '/revenue-engine/', text: 'Local business? Win the reviews that get you picked', funnel: 'revenue' },
    ],
  },
  {
    id: 'g3',
    label: 'I want more work coming in.',
    stake: 'Not enough quotes. Not enough booked jobs. The number you watch.',
    links: [
      { href: '/industries/industrial-distribution/', text: 'Distributor or manufacturer? See the industrial playbook', funnel: 'industrial' },
      { href: '/revenue-engine/', text: 'Roofer, HVAC, or dental? See the Revenue Engine', funnel: 'revenue' },
    ],
  },
  {
    id: 'g4',
    label: 'I want to stop losing the quotes and calls I already pay for.',
    stake: 'The work arrives and slips away: buyers bounce off a slow site, calls get missed, estimates go cold.',
    links: [
      { href: '/services/website-development-design-services/', text: 'Fix the site and quote form buyers bounce off', funnel: 'industrial' },
      { href: '/revenue-engine/', text: 'Answer every call, reply in seconds, book the job', funnel: 'revenue' },
    ],
  },
  {
    id: 'g5',
    label: 'I want every call answered, even after hours.',
    stake: 'The phone rings while you’re on a roof or with a patient. The 9pm lead books with whoever picks up first.',
    links: [
      { href: '/revenue-engine/home-services/', text: 'Roofer, HVAC, plumbing, electrical', funnel: 'revenue', vertical: 'homeservices' },
      { href: '/revenue-engine/dentists/', text: 'Dental practice', funnel: 'revenue', vertical: 'dental' },
    ],
  },
  {
    id: 'g6',
    label: 'I want to keep my customers, and win back the ones who went quiet.',
    stake: 'Repeat buyers and revived accounts are the cheapest revenue you’ve got.',
    links: [
      { href: '/services/outbound-email-marketing-services/', text: 'Win-back email to the list you already own', funnel: 'industrial' },
      { href: '/revenue-engine/', text: 'Chase cold quotes and bring customers back', funnel: 'revenue' },
    ],
  },
]

function GoalDestination({ goalId, link }: { goalId: string; link: GoalLink }) {
  const t = TONE[link.funnel]
  const cta = `goal-${goalId}-${link.funnel}${link.vertical ? `-${link.vertical}` : ''}`
  return (
    <Link
      href={link.href}
      data-cta={cta}
      data-cta-location="home-intent-index"
      className={cn(
        'group inline-flex items-center gap-2 font-mono uppercase underline underline-offset-[6px] transition-colors',
        link.secondary ? 'text-[11px] tracking-[0.12em] opacity-80' : 'text-[12px] tracking-[0.16em]',
        t.text,
        t.decoration,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', t.dot, link.secondary && 'opacity-70')} />
      {link.text}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
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
          Six things owners ask us for, in plain words. Pick yours and go straight
          to it &mdash; no service menu to wade through.
        </p>
      </div>

      <InView as="dl" className="mt-12">
        {GOALS.map((goal) => (
          <div
            key={goal.id}
            className="grid gap-4 border-t border-rule py-6 last:border-b md:grid-cols-12 md:gap-8"
          >
            <dt className="md:col-span-6">
              <p className="font-display text-xl font-semibold leading-snug text-ink-900 sm:text-2xl">
                {goal.label}
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-600">{goal.stake}</p>
            </dt>
            <dd className="flex flex-col gap-2.5 md:col-span-6 md:items-start">
              {goal.links.map((link) => (
                <GoalDestination key={link.href + link.text} goalId={goal.id} link={link} />
              ))}
            </dd>
          </div>
        ))}
      </InView>

      <p className="mt-8 text-sm leading-relaxed text-ink-500">
        Not sure which?{' '}
        <Link
          href="/services/"
          data-cta="goal-escape-industrial"
          data-cta-location="home-intent-index"
          className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink-900"
        >
          See everything for distributors
        </Link>{' '}
        ·{' '}
        <Link
          href="/revenue-engine/"
          data-cta="goal-escape-revenue"
          data-cta-location="home-intent-index"
          className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink-900"
        >
          or for local service
        </Link>
        .
      </p>
    </SectionRail>
  )
}
