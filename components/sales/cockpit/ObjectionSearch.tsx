'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Motion } from '@/lib/sales/playbook'
import { searchObjections } from '@/lib/sales/playbook'

import { ObjectionCard } from './ObjectionCard'

/**
 * Mid-call objection lookup. A button + a "/" hotkey open a command-palette modal
 * over the shared objection library, scoped to the active motion ('both' cards
 * included). Type what the prospect said, arrow/enter or click to open the card.
 */
export function ObjectionSearch({ motion }: { motion: Motion }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const openPalette = useCallback(() => {
    setQuery('')
    setSelectedId(null)
    setHighlight(0)
    setOpen(true)
  }, [])

  // "/" opens the palette (unless you're typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (e.key === '/' && !open && !typing) {
        e.preventDefault()
        openPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, openPalette])

  // Focus the input when the palette opens (DOM sync only).
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const results = useMemo(() => searchObjections(query, motion), [query, motion])
  const selected = selectedId ? (results.find((o) => o.id === selectedId) ?? null) : null

  function onPanelKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (selected) setSelectedId(null)
      else setOpen(false)
      return
    }
    if (selected) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[highlight]
      if (r) setSelectedId(r.id)
    }
  }

  return (
    <>
      <button
        onClick={openPalette}
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-rule bg-surface px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-rule-strong"
      >
        Objections
        <kbd className="rounded bg-surface-alt px-1.5 font-mono text-[11px] text-ink-400">/</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div
            onKeyDown={onPanelKey}
            className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-rule bg-surface shadow-xl"
          >
            <div className="border-b border-rule p-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedId(null)
                  setHighlight(0)
                }}
                placeholder={'What did they say? — e.g. "too expensive", "send me an email", "who is this"'}
                className="w-full bg-transparent px-1 text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {selected ? (
                <div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="mb-3 text-xs text-accent-600 hover:underline"
                  >
                    ← back to results
                  </button>
                  <ObjectionCard objection={selected} />
                </div>
              ) : results.length === 0 ? (
                <p className="px-1 py-6 text-center text-sm text-ink-400">
                  No objection matches &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((o, i) => (
                    <li key={o.id}>
                      <button
                        onClick={() => setSelectedId(o.id)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left ${
                          i === highlight ? 'bg-surface-alt' : ''
                        }`}
                      >
                        <span className="shrink-0 font-mono text-[11px] text-ink-400">{o.id}</span>
                        <span className="text-sm text-ink-800">{o.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-rule px-3 py-2 text-[11px] text-ink-400">
              <span>
                {results.length} card{results.length === 1 ? '' : 's'} ·{' '}
                {motion === 'revenue-engine' ? 'Revenue Engine' : 'Industrial'}
              </span>
              <span>
                <kbd className="font-mono">↑↓</kbd> move · <kbd className="font-mono">↵</kbd> open ·{' '}
                <kbd className="font-mono">esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
