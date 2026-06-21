'use client'

import Link from 'next/link'

import { useCallLog } from '@/components/sales/cockpit/useCallLog'
import { pct, summarize } from '@/lib/sales/metrics-summary'

const WEEKLY_REVIEW = [
  'Did I hit my dial floor? If not, stop — nothing else this week is diagnostic.',
  "Where's the funnel narrowest vs my own trailing average? That's this week's one bottleneck.",
  'Gate problem or close problem? Low Reached-DM → list / timing / gatekeeper. Low Conv→Booked → the script or the leak.',
  'Is the leak actually landing? Compare the leaks on booked rows vs not-interested rows.',
  'Which objection keeps killing me? Fix the script, not the list.',
]

function Card({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? 'border-accent-600 bg-accent-50' : 'border-rule bg-surface'}`}>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? 'text-accent-700' : 'text-ink-900'}`}>{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p> : null}
    </div>
  )
}

export function MetricsView() {
  const { logs } = useCallLog()
  const m = summarize(logs)
  const max = Math.max(1, m.dials)

  if (!logs.length) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Metrics</h1>
        <div className="mt-6 rounded-lg border border-dashed border-rule-strong bg-surface-alt p-8 text-center text-sm text-ink-500">
          No calls logged yet. Log outcomes in the{' '}
          <Link href="/sales/playbook" className="text-accent-600 hover:underline">
            Cockpit
          </Link>{' '}
          and your funnel and rates show up here.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Metrics</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Your trailing numbers from the call log. Until ~200 dials, compare only to your own past — there&apos;s no
          external benchmark worth trusting.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card label="Dials" value={m.dials} />
        <Card label="Connect rate" value={pct(m.connectRate)} hint="connects / dials" />
        <Card label="Reached-DM rate" value={pct(m.reachedDmRate)} hint="conversations / connects" />
        <Card label="Conv → Booked" value={pct(m.convToBookedRate)} hint="booked / conversations" />
        <Card label="Booked" value={m.booked} accent />
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">The funnel</h2>
        <div className="space-y-1.5">
          {m.byStage.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-ink-700">{s.label}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-surface-alt">
                <div className="h-full rounded bg-accent-600/70" style={{ width: `${(s.reached / max) * 100}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-sm text-ink-700">{s.reached}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-ink-400">
          Each bar = how many calls reached at least that stage. Fix the funnel left to right; volume is the last lever.
        </p>
      </section>

      {m.objections.length ? (
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink-900">Objections that came up</h2>
          <ul className="flex flex-wrap gap-2">
            {m.objections.map((o) => (
              <li key={o.tag} className="rounded bg-surface-alt px-2.5 py-1 text-[13px] text-ink-700">
                <span className="font-mono text-ink-900">{o.count}×</span> {o.tag}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {m.dnc ? (
        <p className="text-[13px] text-ink-500">
          <span className="font-mono text-danger-500">{m.dnc}</span> contact{m.dnc === 1 ? '' : 's'} flagged do-not-call (suppressed).
        </p>
      ) : null}

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Weekly review — five questions</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-ink-700">
          {WEEKLY_REVIEW.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
