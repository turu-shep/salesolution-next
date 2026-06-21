'use client'

import { useState } from 'react'

import type { CallLog, ObjectionTag, Outcome, Track, TrackDetail } from '@/lib/sales/playbook'
import { OBJECTION_TAGS, outcomeDef, outcomesForMotion } from '@/lib/sales/playbook'

import { useCallLog } from './useCallLog'

const DETAIL_LABEL: Record<TrackDetail, string> = {
  roofing: 'Roofing',
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  dental: 'Dental',
  distributor: 'Distributor',
  manufacturer: 'Manufacturer',
}

function detailOptions(track: Track): TrackDetail[] {
  if (track.subScript === 'roofing') return ['roofing', 'hvac', 'plumbing', 'electrical']
  if (track.subScript === 'dental') return ['dental']
  return ['distributor', 'manufacturer']
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `c_${Date.now()}_${Math.round(Math.random() * 1e6)}`
  }
}

const CSV_FIELDS: (keyof CallLog)[] = [
  'id', 'dialAt', 'contact', 'businessName', 'motion', 'subScript', 'trackDetail',
  'outcome', 'furthestStage', 'doNotCall', 'objectionHit', 'leakObserved',
  'gapObserved', 'nextStep', 'nextStepDue', 'notes',
]

function toCsv(rows: CallLog[]): string {
  const esc = (v: unknown) => `"${(v === undefined || v === null ? '' : String(v)).replace(/"/g, '""')}"`
  const header = CSV_FIELDS.join(',')
  const body = rows.map((r) => CSV_FIELDS.map((f) => esc(r[f])).join(',')).join('\n')
  return `${header}\n${body}\n`
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const labelCls = 'block font-mono text-[10px] uppercase tracking-wide text-ink-400'
const inputCls =
  'mt-1 w-full rounded-md border border-rule bg-surface px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-accent-600'

/** The outcome-capture form for one call. Remounted per track (key) so defaults reset. */
function CallLogForm({ track, onLog }: { track: Track; onLog: (log: CallLog) => void }) {
  const details = detailOptions(track)
  const [contact, setContact] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [trackDetail, setTrackDetail] = useState<TrackDetail>(details[0])
  const [outcome, setOutcome] = useState<Outcome | ''>('')
  const [objectionHit, setObjectionHit] = useState<ObjectionTag | ''>('')
  const [leakObserved, setLeakObserved] = useState('')
  const [gapObserved, setGapObserved] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [nextStepDue, setNextStepDue] = useState('')
  const [notes, setNotes] = useState('')
  const [doNotCall, setDoNotCall] = useState(false)

  const isRevenueEngine = track.motion === 'revenue-engine'
  const leakMissing = isRevenueEngine && !leakObserved.trim()
  const canLog = !!contact.trim() && !!outcome && !leakMissing

  function submit() {
    if (!outcome || !canLog) return
    onLog({
      id: newId(),
      dialAt: new Date().toISOString(),
      contact: contact.trim(),
      businessName: businessName.trim() || undefined,
      motion: track.motion,
      subScript: track.subScript,
      trackDetail,
      outcome,
      furthestStage: outcomeDef(outcome)?.furthestStage ?? 'dial',
      doNotCall,
      objectionHit: objectionHit || undefined,
      leakObserved: isRevenueEngine ? leakObserved.trim() : undefined,
      gapObserved: !isRevenueEngine ? gapObserved.trim() || undefined : undefined,
      nextStep: nextStep.trim() || undefined,
      nextStepDue: nextStepDue || undefined,
      notes: notes.trim() || undefined,
    })
    setContact('')
    setBusinessName('')
    setOutcome('')
    setObjectionHit('')
    setLeakObserved('')
    setGapObserved('')
    setNextStep('')
    setNextStepDue('')
    setNotes('')
    setDoNotCall(false)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Contact</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} placeholder="Owner name" />
        </div>
        <div>
          <label className={labelCls}>Business</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} placeholder="Company" />
        </div>
        {details.length > 1 ? (
          <div>
            <label className={labelCls}>Trade</label>
            <select value={trackDetail} onChange={(e) => setTrackDetail(e.target.value as TrackDetail)} className={inputCls}>
              {details.map((d) => (
                <option key={d} value={d}>{DETAIL_LABEL[d]}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className={labelCls}>Outcome</label>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} className={inputCls}>
            <option value="">— select —</option>
            {outcomesForMotion(track.motion).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isRevenueEngine ? (
        <div>
          <label className={labelCls}>Leak observed (required)</label>
          <input
            value={leakObserved}
            onChange={(e) => setLeakObserved(e.target.value)}
            className={inputCls}
            placeholder="VM after 5 rings, GBP missing hours, no text-back"
          />
          {leakMissing ? (
            <p className="mt-1 text-[11px] text-danger-500">A Revenue Engine call can&apos;t be logged without the leak you found (08 §5).</p>
          ) : null}
        </div>
      ) : (
        <div>
          <label className={labelCls}>Gap observed</label>
          <input
            value={gapObserved}
            onChange={(e) => setGapObserved(e.target.value)}
            className={inputCls}
            placeholder="Catalog quote-only, ChatGPT names the manufacturer not them"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Objection hit</label>
          <select value={objectionHit} onChange={(e) => setObjectionHit(e.target.value as ObjectionTag)} className={inputCls}>
            <option value="">— none —</option>
            {OBJECTION_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Next step</label>
            <input value={nextStep} onChange={(e) => setNextStep(e.target.value)} className={inputCls} placeholder="Callback Tue 4pm" />
          </div>
          <div>
            <label className={labelCls}>Due</label>
            <input type="date" value={nextStepDue} onChange={(e) => setNextStepDue(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="Anything you'll want next dial" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={doNotCall} onChange={(e) => setDoNotCall(e.target.checked)} className="h-4 w-4 accent-danger-500" />
          Do not call (suppress)
        </label>
        <button
          onClick={submit}
          disabled={!canLog}
          className="rounded-md bg-accent-600 px-4 py-1.5 text-sm font-medium text-ink-inverse transition-colors hover:bg-accent-700 disabled:opacity-40"
        >
          Log call
        </button>
      </div>
    </div>
  )
}

/**
 * The per-call logger: a collapsible panel with the outcome-capture form, the running
 * (localStorage-persisted) call list, and CSV/JSON export for Apollo. Lives at the
 * bottom of the cockpit and persists across track switches.
 */
export function CallLogger({ track }: { track: Track }) {
  const { logs, add, remove, clear } = useCallLog()
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-lg border border-rule bg-surface">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-sm font-semibold text-ink-800">
          Call log {logs.length ? <span className="font-normal text-ink-400">· {logs.length} logged</span> : null}
        </span>
        <span className="text-ink-300">{open ? '▾' : '▸'}</span>
      </button>

      {open ? (
        <div className="space-y-5 border-t border-rule px-4 py-4">
          <CallLogForm key={track.slug} track={track} onLog={add} />

          {logs.length ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-400">Logged ({logs.length})</span>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => download('sales-calls.csv', toCsv(logs), 'text/csv')} className="text-accent-600 hover:underline">
                    Export CSV
                  </button>
                  <button
                    onClick={() => download('sales-calls.json', JSON.stringify(logs, null, 2), 'application/json')}
                    className="text-accent-600 hover:underline"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear all logged calls? Export first if you need them.')) clear()
                    }}
                    className="text-ink-400 hover:text-danger-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-rule rounded-md border border-rule">
                {logs.slice(0, 12).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium text-ink-800">{l.businessName || l.contact || '—'}</span>
                      <span className="text-ink-400"> · {outcomeDef(l.outcome)?.label ?? l.outcome}</span>
                      {l.doNotCall ? <span className="ml-1 font-mono text-[10px] uppercase text-danger-500">DNC</span> : null}
                      {l.nextStep ? <span className="block truncate text-[12px] text-ink-400">→ {l.nextStep}{l.nextStepDue ? ` (${l.nextStepDue})` : ''}</span> : null}
                    </div>
                    <button onClick={() => remove(l.id)} className="shrink-0 text-ink-300 hover:text-danger-500" aria-label="Delete entry">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              {logs.length > 12 ? <p className="mt-1 text-[11px] text-ink-400">+ {logs.length - 12} more — export to see all.</p> : null}
            </div>
          ) : (
            <p className="text-[13px] text-ink-400">No calls logged yet. Log the outcome the moment you hang up.</p>
          )}
        </div>
      ) : null}
    </section>
  )
}
