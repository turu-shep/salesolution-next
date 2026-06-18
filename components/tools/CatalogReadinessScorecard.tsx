'use client'

import { useState } from 'react'

import { READINESS_ITEMS, scoreCatalog } from '@/lib/tools/catalog-readiness.mjs'

/**
 * Embeddable "Is your catalog AI-ready?" scorecard (toolKey:
 * "catalog-readiness-scorecard"). Check what's true of your catalog today; the
 * weighted score + the heaviest gaps come back. Logic + weights + tests live in
 * lib/tools/catalog-readiness (pure). Client island: computes in the browser,
 * persists nothing. Illustrative self-assessment, not an audit. Rendered by the
 * enrichment wrapper, which supplies the title/intro/source.
 */
export function CatalogReadinessScorecard() {
  const [checked, setChecked] = useState<string[]>([])
  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const r = scoreCatalog(checked)

  return (
    <div className="not-prose border border-rule bg-surface p-5 md:p-6">
      {/* Score header — stacks on mobile so the verdict never wraps mid-phrase */}
      <div className="flex flex-col gap-1.5 border-b border-rule pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Readiness score
          </span>
          <span className="mt-1 block font-display text-5xl font-semibold leading-none tabular-nums text-ink-900">
            {r.score}
            <span className="text-2xl text-ink-400">/100</span>
          </span>
        </div>
        {/* Verdict — a colored text label, not a button (blue stays for links/CTA) */}
        <span className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600 sm:pb-1.5">
          {r.band}
        </span>
      </div>

      {/* Checklist */}
      <ul className="mt-3 space-y-1">
        {READINESS_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 py-1.5">
              <input
                type="checkbox"
                checked={checked.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-0.5 h-4 w-4 flex-none accent-brand-600"
              />
              <span className="text-sm leading-relaxed text-ink-700">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {/* Heaviest gaps */}
      {r.topFixes.length > 0 && (
        <div className="mt-5 border-t border-rule pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Fix these first
          </span>
          <ul className="mt-2.5 space-y-2.5">
            {r.topFixes.map((f) => (
              <li key={f.id} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-600"
                />
                <span>
                  <span className="font-semibold text-ink-900">{f.label}.</span> {f.fix}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        Check what&rsquo;s true today. The score is weighted by how much each item affects whether
        AI engines can read and cite your catalog &mdash; illustrative, not a full audit.
      </p>
    </div>
  )
}
