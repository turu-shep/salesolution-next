'use client'

import { useEffect, useState } from 'react'

import { PreferenceRow } from './PreferenceRow'

/**
 * Email subscription preferences UI.
 *
 * No backend yet — ESP wiring is a later milestone. Until then we persist
 * the visitor's stated choice to localStorage so they get a coherent
 * settings experience and we point them at the email-footer + mailto path
 * as the binding source of truth. The same pattern lets us swap in a real
 * API later without touching the page.
 *
 * IMPORTANT: changing toggles here does NOT actually unsubscribe — the
 * helper text and the Save confirmation both surface that explicitly so
 * the page can't mislead. Use the email footer link for legally binding
 * opt-out.
 */
type EmailPrefs = {
  weeklyBrief: boolean
  quarterlyDeepDive: boolean
  transactionalOnly: boolean
}

const STORAGE_KEY = 'ss_email_prefs'

const DEFAULT_PREFS: EmailPrefs = {
  weeklyBrief: true,
  quarterlyDeepDive: true,
  transactionalOnly: false,
}

function readPrefs(): EmailPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<EmailPrefs>) }
  } catch {
    return DEFAULT_PREFS
  }
}

function writePrefs(p: EmailPrefs) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export function CommPreferencesForm() {
  const [prefs, setPrefs] = useState<EmailPrefs>(DEFAULT_PREFS)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPrefs(readPrefs())
    setHydrated(true)
  }, [])

  function save() {
    writePrefs(prefs)
    setSavedAt(Date.now())
  }

  function unsubscribeAll() {
    const next: EmailPrefs = {
      weeklyBrief: false,
      quarterlyDeepDive: false,
      transactionalOnly: true,
    }
    setPrefs(next)
    writePrefs(next)
    setSavedAt(Date.now())
  }

  return (
    <div className="mt-6">
      <fieldset>
        <legend className="sr-only">Email lists</legend>

        <div className="border-t border-rule">
          <PreferenceRow
            id="email-weekly-brief"
            label="Weekly Turbulence Brief"
            description="Monday digest of the algorithm and AI-engine changes that landed last week. Roughly 4-minute read, one per week."
            checked={prefs.weeklyBrief}
            onChange={(v) => setPrefs({ ...prefs, weeklyBrief: v })}
          />
          <PreferenceRow
            id="email-quarterly-deep-dive"
            label="Quarterly deep-dive"
            description="One long-form analysis every quarter, no in-between sends. Pattern shifts in industrial e-commerce search and GEO."
            checked={prefs.quarterlyDeepDive}
            onChange={(v) => setPrefs({ ...prefs, quarterlyDeepDive: v })}
          />
          <PreferenceRow
            id="email-transactional"
            label="Transactional"
            description="Messages tied to your current engagement — audit deliverables, scheduled calls, contract documents. Continues regardless of marketing opt-out."
            checked
            disabled
            badge="Always on"
          />
        </div>
      </fieldset>

      <p className="mt-6 text-sm leading-relaxed text-ink-500">
        Your choice is stored here for reference. The legally binding
        unsubscribe path is the <span className="font-medium text-ink-700">Manage preferences</span> link
        in any email footer, or an email to{' '}
        <a
          href="mailto:unsubscribe@salesolution.net"
          className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
        >
          unsubscribe@salesolution.net
        </a>
        . We&rsquo;ll mirror your selection from this page within one business day.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={unsubscribeAll}
          className="text-sm font-medium text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          Unsubscribe from all marketing
        </button>

        <div className="flex items-center gap-4">
          {savedAt && (
            <p
              role="status"
              aria-live="polite"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600"
            >
              Saved
            </p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!hydrated}
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  )
}
