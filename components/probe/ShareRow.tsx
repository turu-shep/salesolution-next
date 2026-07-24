'use client'

import { useState } from 'react'

/**
 * Share affordances for the report. The link is permanent (token = the URL),
 * so "send it to whoever owns the fix" is a real workflow: owner → marketer,
 * marketer → web vendor, peer → peer. LinkedIn is where this ICP shares.
 */
export function ShareRow() {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard denied — the URL bar still exists */
    }
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(window.location.href)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer,width=600,height=600',
    )
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        This report is a permanent link &mdash; send it to whoever owns the fix
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          data-cta="probe_share_copy__probe_report"
          data-cta-location="probe-report"
          className="inline-flex cursor-pointer items-center border border-rule-strong bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700 transition-colors duration-200 hover:border-ink-900 hover:text-ink-900"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={shareLinkedIn}
          data-cta="probe_share_linkedin__probe_report"
          data-cta-location="probe-report"
          className="inline-flex cursor-pointer items-center border border-rule-strong bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700 transition-colors duration-200 hover:border-ink-900 hover:text-ink-900"
        >
          Share on LinkedIn
        </button>
      </div>
    </div>
  )
}
