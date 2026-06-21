import Link from 'next/link'

type Tool = { href: string; name: string; desc: string }

const groups: { title: string; tools: Tool[] }[] = [
  {
    title: 'Build the skill',
    tools: [
      {
        href: '/sales/learn',
        name: 'Learn & Train',
        desc: 'Step-by-step path from zero to your first booked calls, plus a skills dashboard you track from "not started" to "instinct." Start here.',
      },
      {
        href: '/sales/drill',
        name: 'Drill',
        desc: 'Cover-and-say flashcards for the openers and objections — say the line from memory, mark it got-it or shaky.',
      },
      {
        href: '/sales/psychology',
        name: 'Sales Psychology',
        desc: "The operator's manual — frames, push/pull, authority, reading people, closing. Read it until it's instinct.",
      },
    ],
  },
  {
    title: 'Work the calls',
    tools: [
      {
        href: '/sales/playbook',
        name: 'Cold-Call Cockpit',
        desc: 'Branching call scripts, objection battle-cards, and the per-call logger. Both motions — Revenue Engine and Industrial.',
      },
      {
        href: '/sales/followups',
        name: 'Follow-ups',
        desc: "Your callback queue — what's due today, built from the next-steps you log. Work it before any fresh list.",
      },
      {
        href: '/sales/metrics',
        name: 'Metrics',
        desc: 'The funnel and your three steering rates from the call log: dialing enough, getting through, booking.',
      },
    ],
  },
  {
    title: 'Reference',
    tools: [
      {
        href: '/sales/cadence',
        name: 'Cadence & templates',
        desc: 'Voicemail scripts, the cold-email / SMS templates, and the outcome→next-touch map.',
      },
      {
        href: '/sales/compliance',
        name: 'Compliance',
        desc: 'TCPA, DNC, call-recording — the SAFE-DEFAULTS card to keep by the dialer.',
      },
    ],
  },
]

export default function SalesHubPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Sales HQ</h1>
      <p className="mt-1 text-sm text-ink-500">Private workspace for selling the services. Not customer-facing.</p>

      <div className="mt-6 space-y-8">
        {groups.map((g) => (
          <section key={g.title}>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-400">{g.title}</p>
            <ul className="space-y-3">
              {g.tools.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="block rounded-lg border border-rule bg-surface p-4 transition-colors hover:border-rule-strong"
                  >
                    <span className="font-medium text-ink-800">{t.name}</span>
                    <p className="mt-1 text-sm text-ink-500">{t.desc}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-400">
        Strategy &amp; scripts live in <code className="font-mono">docs/strategy/sales/</code>.
      </p>
    </div>
  )
}
