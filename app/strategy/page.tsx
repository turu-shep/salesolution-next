import Link from 'next/link'

type Doc = { href: string; name: string; desc: string }

const docs: Doc[] = [
  {
    href: '/strategy/niche',
    name: 'Niche copy-angle briefs',
    desc: 'Per-industry research for each landing page — heading, the leak, the plan, the difference, the reassurance section, and the FAQ, in the buyer’s own language. Roofing, HVAC, plumbing, electrical, dental, med spa, plastic surgery, local retail.',
  },
  {
    href: '/strategy/niche-research',
    name: 'Revenue Engine — niche research',
    desc: '15 niches + 14 discovery candidates, source-cited. Which verticals to build next, the per-niche economics, and the calculator presets. High-ticket / high-margin / recurring filter.',
  },
  {
    href: '/strategy/offers',
    name: 'Offer Mirror',
    desc: 'What the site actually sells, evidence-first: blind scan → grades → drift → outside-in.',
  },
  {
    href: '/strategy/ceo/speach',
    name: 'CEO — speaking program',
    desc: 'Personal, not customer-facing: a 12-week speaking & performance program — the block library, objection-roulette deck, training calendar, and pronunciation work.',
  },
  {
    href: '/strategy/offers/dentist/',
    name: 'Dentist offer',
    desc: 'The dentist Revenue Engine offer sheet: deliverables by category with the value of each. Outreach manual linked inside.',
  },
]

export default function StrategyHubPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Strategy</h1>
      <p className="mt-1 text-sm text-ink-500">Private strategy docs. Not customer-facing.</p>

      <ul className="mt-6 space-y-3">
        {docs.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="block rounded-lg border border-rule bg-surface p-4 transition-colors hover:border-rule-strong"
            >
              <span className="font-medium text-ink-800">{d.name}</span>
              <p className="mt-1 text-sm text-ink-500">{d.desc}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-ink-400">
        Source docs live in <code className="font-mono">docs/strategy/</code>.
      </p>
    </div>
  )
}
