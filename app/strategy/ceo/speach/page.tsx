import Link from 'next/link'

type Doc = { href: string; name: string; desc: string }

const readFirst: Doc = {
  href: '/strategy/ceo/speach/how-and-why',
  name: 'How this works, and why',
  desc: 'Read this one first. The four problems this program targets, the four rules that fix them, and the full morning warm-up routine — everything else in this pack traces back to this page.',
}

const material: Doc[] = [
  {
    href: '/strategy/ceo/speach/blocks',
    name: 'The block library',
    desc: 'Roughly 30 pre-built spoken components — identity answers, client stories, explanations, sales-call openers and pitches, and opinions — each with a pre-decided landing line.',
  },
  {
    href: '/strategy/ceo/speach/roulette',
    name: 'Objection roulette',
    desc: 'The draw-blind deck of real objections for daily pressure training, each with the right response move and the door it should route to.',
  },
  {
    href: '/strategy/ceo/speach/cold-topics',
    name: 'Cold-topic bank',
    desc: '48 zero-prep prompts across six categories — explain, opine, tell a story, sell — for the daily cold-drill slot.',
  },
  {
    href: '/strategy/ceo/speach/pronunciation',
    name: 'Pronunciation & accent',
    desc: 'The sound layer, separate from structure: vowel reduction, corrected word stress, final-consonant devoicing, and the rest, ranked by how much each one actually affects being understood.',
  },
]

const runningIt: Doc[] = [
  {
    href: '/strategy/ceo/speach/runner',
    name: 'How a session runs',
    desc: 'The executable layer — the daily shape, and every command for running a session live with Claude or solo.',
  },
  {
    href: '/strategy/ceo/speach/calendar',
    name: 'Training calendar',
    desc: 'Weeks 3 through 6, day by day, plus the scoring template and the trajectory checkpoints to calibrate progress against.',
  },
  {
    href: '/strategy/ceo/speach/week-3',
    name: 'Week 3 session sheets',
    desc: 'The first week fully scripted — every take, every landing, prescribed day by day.',
  },
]

export const metadata = { title: 'Speaking program' }

export default function CeoSpeechHubPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Speaking program</span>
      </div>

      <h1 className="text-xl font-semibold text-ink-900">A 12-week speaking &amp; performance program</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        A personal training system, not customer-facing: fixing mid-sentence restarts, building a library of
        pre-assembled spoken material, and drilling the same objections and openers used on real cold calls.
        Started July 2026.
      </p>

      <div className="mt-8">
        <Link
          href={readFirst.href}
          className="block rounded-lg border border-accent-600/40 bg-accent-600/5 p-4 transition-colors hover:border-accent-600"
        >
          <span className="font-mono text-[11px] uppercase tracking-wide text-accent-600">Start here</span>
          <p className="mt-1 font-medium text-ink-800">{readFirst.name}</p>
          <p className="mt-1 text-sm text-ink-500">{readFirst.desc}</p>
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-400">The material</p>
          <ul className="space-y-3">
            {material.map((d) => (
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
        </section>

        <section>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-400">Running it</p>
          <ul className="space-y-3">
            {runningIt.map((d) => (
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
        </section>
      </div>

      <div className="mt-8 rounded-lg border border-rule bg-surface p-4 text-sm text-ink-500">
        <p className="font-medium text-ink-700">This material is sales-adjacent — read it that way.</p>
        <p className="mt-1">
          The block library and the roulette deck draw directly on the live cold-call scripts and objection
          library at <Link href="/sales/playbook" className="text-accent-600 hover:underline">/sales</Link>. The
          three guarantee/terms/audit-offer lines quoted here are drilled word-for-word and must never be
          improvised on a real call — see the block library for which ones are still pending sign-off before
          live use.
        </p>
      </div>

      <p className="mt-8 text-xs text-ink-400">
        Source docs live in <code className="font-mono">docs/personal/speaking/</code>. These pages are a
        narrative rewrite for readability, fidelity-checked against that source.
      </p>
    </div>
  )
}
