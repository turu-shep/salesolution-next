'use client'

import Link from 'next/link'

import { useCallLog } from '@/components/sales/cockpit/useCallLog'
import type { CallLog } from '@/lib/sales/playbook'
import { outcomeDef } from '@/lib/sales/playbook'

import { useFollowupDone } from './useFollowupDone'

const SKIP = new Set(['booked-audit', 'booked-growth-call', 'booked-diagnostic', 'disqualified', 'wrong-number'])
const WARM = new Set(['interested-no-commit', 'callback-scheduled', 'drove-to-self-audit'])

type Bucket = 'overdue' | 'today' | 'warm' | 'upcoming'
const BUCKET_RANK: Record<Bucket, number> = { overdue: 0, today: 1, warm: 2, upcoming: 3 }
const BUCKET_STYLE: Record<Bucket, string> = {
  overdue: 'text-danger-500',
  today: 'text-accent-700',
  warm: 'text-ink-500',
  upcoming: 'text-ink-400',
}

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function isCandidate(l: CallLog): boolean {
  if (l.doNotCall) return false
  if (SKIP.has(l.outcome)) return false
  return Boolean(l.nextStepDue || l.nextStep || WARM.has(l.outcome))
}

function bucketOf(l: CallLog, today: string): Bucket {
  if (!l.nextStepDue) return 'warm'
  if (l.nextStepDue < today) return 'overdue'
  if (l.nextStepDue === today) return 'today'
  return 'upcoming'
}

export function FollowupsView() {
  const { logs } = useCallLog()
  const { done, toggle } = useFollowupDone()
  const today = todayStr()

  const items = logs
    .filter(isCandidate)
    .map((l) => ({ log: l, bucket: bucketOf(l, today), isDone: !!done[l.id] }))
    .sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1
      if (a.bucket !== b.bucket) return BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket]
      return (a.log.nextStepDue ?? '').localeCompare(b.log.nextStepDue ?? '')
    })

  const toWork = items.filter((i) => !i.isDone).length

  if (!items.length) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Follow-ups</h1>
        <div className="mt-6 rounded-lg border border-dashed border-rule-strong bg-surface-alt p-8 text-center text-sm text-ink-500">
          No follow-ups queued. They appear here from the next-steps and callbacks you log in the{' '}
          <Link href="/sales/playbook" className="text-accent-600 hover:underline">
            Cockpit
          </Link>
          .
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-900">Follow-up queue</h1>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">{toWork} to work</span>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        Work this before any fresh list — these are warmer than any cold number. Overdue and due-today first.
      </p>

      <ul className="mt-5 divide-y divide-rule rounded-lg border border-rule">
        {items.map(({ log: l, bucket, isDone }) => (
          <li key={l.id} className={`flex items-start gap-3 p-3 ${isDone ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              checked={isDone}
              onChange={() => toggle(l.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-accent-600"
              aria-label={`Mark follow-up for ${l.businessName || l.contact} handled`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-medium text-ink-800 ${isDone ? 'line-through' : ''}`}>
                  {l.businessName || l.contact || '—'}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-wide ${BUCKET_STYLE[bucket]}`}>
                  {bucket === 'warm' ? 'warm' : bucket === 'upcoming' ? (l.nextStepDue ?? 'upcoming') : bucket}
                </span>
                <span className="text-[12px] text-ink-400">{outcomeDef(l.outcome)?.label ?? l.outcome}</span>
              </div>
              {l.nextStep ? (
                <p className="mt-0.5 text-[13px] text-ink-600">
                  → {l.nextStep}
                  {l.nextStepDue ? <span className="text-ink-400"> ({l.nextStepDue})</span> : null}
                </p>
              ) : null}
              {l.notes ? <p className="mt-0.5 truncate text-[12px] text-ink-400">{l.notes}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
