'use client'

import { useState } from 'react'

import { Lines } from '@/components/sales/cockpit/Lines'
import { buildDeck, DECKS, type DeckId, type DrillCard } from '@/lib/sales/drill'
import type { Motion } from '@/lib/sales/playbook'

import { useMastered } from './useMastered'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const MOTIONS: { id: Motion | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'revenue-engine', label: 'Revenue Engine' },
  { id: 'industrial', label: 'Industrial' },
]

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'border-accent-600 bg-accent-50 text-accent-700' : 'border-rule bg-surface text-ink-700 hover:border-rule-strong'
      }`}
    >
      {children}
    </button>
  )
}

export function DrillApp() {
  const { mastered, mark, reset } = useMastered()
  const [deck, setDeck] = useState<DeckId>('objections')
  const [motion, setMotion] = useState<Motion | 'all'>('all')
  const [queue, setQueue] = useState<DrillCard[] | null>(null)
  const [revealed, setRevealed] = useState(false)

  const filter = motion === 'all' ? undefined : motion
  const all = buildDeck(deck, filter)
  const remaining = all.filter((c) => !mastered[c.id])

  function start() {
    setQueue(shuffle(remaining))
    setRevealed(false)
  }
  function gotIt() {
    if (!queue) return
    mark(queue[0].id)
    setQueue((q) => (q ? q.slice(1) : q))
    setRevealed(false)
  }
  function shaky() {
    setQueue((q) => (q && q.length ? [...q.slice(1), q[0]] : q))
    setRevealed(false)
  }

  // ── Setup ────────────────────────────────────────────────────────────────
  if (queue === null) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Drill</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Cover-and-say practice. See the cue, say the line out loud from memory, then check yourself.
            &ldquo;Got it&rdquo; retires a card; &ldquo;Shaky&rdquo; sends it to the back of the deck.
          </p>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-400">Deck</p>
          <div className="flex flex-wrap gap-2">
            {DECKS.map((d) => (
              <Pill key={d.id} active={deck === d.id} onClick={() => setDeck(d.id)}>
                {d.label}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-400">Motion</p>
          <div className="flex flex-wrap gap-2">
            {MOTIONS.map((mo) => (
              <Pill key={mo.id} active={motion === mo.id} onClick={() => setMotion(mo.id)}>
                {mo.label}
              </Pill>
            ))}
          </div>
        </div>

        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-800">{remaining.length}</span> card{remaining.length === 1 ? '' : 's'} to drill
          {all.length - remaining.length > 0 ? ` · ${all.length - remaining.length} mastered` : ''}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={start}
            disabled={!remaining.length}
            className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-ink-inverse transition-colors hover:bg-accent-700 disabled:opacity-40"
          >
            {remaining.length ? 'Start drilling' : 'All mastered'}
          </button>
          {all.length - remaining.length > 0 ? (
            <button onClick={reset} className="text-xs text-ink-400 hover:text-danger-500">
              Reset mastery
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  // ── Deck clear ───────────────────────────────────────────────────────────
  if (!queue.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-ink-900">Deck clear</h1>
        <p className="text-sm text-ink-500">Every card mastered for this filter. Drill another deck, or reset to run them again.</p>
        <button
          onClick={() => setQueue(null)}
          className="rounded-md border border-rule px-3 py-1.5 text-sm text-ink-700 hover:border-rule-strong"
        >
          ← Back to decks
        </button>
      </div>
    )
  }

  // ── Card ─────────────────────────────────────────────────────────────────
  const card = queue[0]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setQueue(null)} className="text-sm text-ink-400 hover:text-ink-700">
          ← decks
        </button>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">{queue.length} left</span>
      </div>

      <div className="rounded-xl border border-rule bg-surface p-6">
        {card.context ? (
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-400">{card.context}</p>
        ) : null}
        <p className="mt-1 text-lg font-medium text-ink-900">
          {deck === 'objections' ? `They say: "${card.front}"` : card.front}
        </p>

        {revealed ? (
          <div className="mt-4 border-t border-rule pt-4">
            <Lines lines={card.back} />
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-md border border-rule px-3 py-1.5 text-sm text-ink-700 hover:border-rule-strong"
          >
            Show answer
          </button>
        )}
      </div>

      {revealed ? (
        <div className="flex gap-3">
          <button
            onClick={shaky}
            className="flex-1 rounded-md border border-rule px-3 py-2 text-sm font-medium text-ink-700 hover:border-rule-strong"
          >
            Shaky — say it again
          </button>
          <button
            onClick={gotIt}
            className="flex-1 rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-ink-inverse hover:bg-accent-700"
          >
            Got it
          </button>
        </div>
      ) : null}
    </div>
  )
}
