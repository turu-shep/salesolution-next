'use client'

import { useEffect, useState } from 'react'

import {
  readConsent,
  toConsentState,
  updateGtagConsent,
  writeConsent,
  type SimpleConsent,
} from '@/lib/consent'

import { PreferenceRow } from './PreferenceRow'

/**
 * Full-page consent control. Same persistence path as ConsentBanner —
 * `readConsent` on mount, `writeConsent` + `updateGtagConsent` on save —
 * so the two surfaces never disagree.
 *
 * UI shape: hairline-separated rows + status line + brand-blue Save CTA +
 * Reject-all / Accept-all utility links. Functional row is locked (always
 * on) so visitors see the category exists even when they can't toggle it.
 *
 * The Save button briefly shows a "Saved" confirmation; we don't navigate
 * away so the visitor can re-toggle and re-save.
 */
export function CookieConsentForm() {
  const [pref, setPref] = useState<SimpleConsent>({
    analytics: false,
    marketing: false,
    decided: false,
  })
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPref(readConsent())
    setHydrated(true)
  }, [])

  function persist(next: SimpleConsent) {
    writeConsent(next)
    updateGtagConsent(toConsentState(next))
    setPref(next)
    setSavedAt(Date.now())
  }

  function save() {
    persist({ ...pref, decided: true })
  }
  function acceptAll() {
    persist({ analytics: true, marketing: true, decided: true })
  }
  function rejectAll() {
    persist({ analytics: false, marketing: false, decided: true })
  }

  return (
    <div className="mt-6">
      <fieldset>
        <legend className="sr-only">Cookie categories</legend>

        <div className="border-t border-rule">
          <PreferenceRow
            id="cookie-functional"
            label="Functional"
            description="Required for the site to work — page navigation, form submission, security. Cannot be switched off."
            checked
            disabled
            badge="Always on"
          />
          <PreferenceRow
            id="cookie-analytics"
            label="Analytics"
            description="GA4 measurement: which pages are visited, where visitors land, how long they stay. Used to measure campaigns and follow up with people who reach out — the privacy policy lists exactly what's shared."
            checked={pref.analytics}
            onChange={(v) => setPref({ ...pref, analytics: v })}
          />
          <PreferenceRow
            id="cookie-marketing"
            label="Marketing"
            description="Meta Pixel + Google Ads conversion tracking + HubSpot analytics. Used to measure ad campaigns and re-engage past visitors."
            checked={pref.marketing}
            onChange={(v) => setPref({ ...pref, marketing: v })}
          />
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <button
            type="button"
            onClick={rejectAll}
            className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="font-medium text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Accept all
          </button>
        </div>

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
