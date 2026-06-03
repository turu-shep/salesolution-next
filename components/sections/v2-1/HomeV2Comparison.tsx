'use client'

import { useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /v2-1/ — Compressed agency comparison. 4 rows, mobile-collapsible.
 *
 * Desktop: 3-column grid (label / us / them) always visible.
 * Mobile: only Salesolution column shown by default. "Show comparison"
 * button reveals the agency column inline below each row.
 *
 * Client component because the mobile toggle needs state. The desktop
 * grid is the same markup — the mobile rendering branches off a media
 * query at render time.
 */

type Row = {
  label: string
  us: string
  them: string
}

const ROWS: Row[] = [
  {
    label: 'Pricing transparency',
    us: 'Published per-SKU and per-month rates',
    them: 'Always "request a quote"',
  },
  {
    label: 'AI-readiness baked in',
    us: 'Schema, FAQ, citation engineering by default',
    them: 'Sold as a separate phase',
  },
  {
    label: 'Operator access',
    us: 'Direct Slack to the person doing the work',
    them: 'PM in the middle, junior team executing',
  },
  {
    label: 'Exit clause',
    us: '30-day exit on retainers, no 12-month contracts',
    them: '12-month minimums, autorenewal',
  },
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function HomeV2Comparison() {
  const [mobileExpanded, setMobileExpanded] = useState(false)

  return (
    <SectionRail tone="paper" size="sm">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Why us
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Why us vs. typical industrial-marketing agency.
        </h2>
      </div>

      {/* Mobile toggle — only visible on small screens */}
      <div className="mt-8 md:hidden">
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-expanded={mobileExpanded}
          className="inline-flex items-center gap-2 rounded-[4px] border border-ink-300 bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700 transition-colors duration-200 hover:border-ink-900"
        >
          {mobileExpanded ? 'Hide comparison' : 'Show comparison'}
          <span aria-hidden>{mobileExpanded ? '−' : '+'}</span>
        </button>
      </div>

      {/* Desktop column headers */}
      <div className="mt-10 hidden grid-cols-12 gap-6 border-b border-rule pb-4 md:grid">
        <div className="col-span-5" />
        <p className="col-span-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-900">
          Salesolution
        </p>
        <p className="col-span-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
          Typical agency
        </p>
      </div>

      <ul className="md:mt-0 mt-8">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-1 gap-3 border-t border-rule py-5 md:grid-cols-12 md:gap-6"
          >
            <p className="font-display text-lg font-semibold text-ink-900 md:col-span-5">
              {row.label}
            </p>
            <div className="flex items-start gap-2 text-ink-700 md:col-span-3">
              <CheckIcon className="mt-1 text-data-up" />
              <span className="text-sm leading-relaxed">{row.us}</span>
            </div>
            <div
              className={cn(
                'flex items-start gap-2 text-ink-400 md:col-span-4',
                !mobileExpanded && 'hidden md:flex',
              )}
            >
              <XIcon className="mt-1 text-ink-400" />
              <span className="text-sm leading-relaxed">{row.them}</span>
            </div>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
