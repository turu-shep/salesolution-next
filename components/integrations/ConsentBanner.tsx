'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import {
  readConsent,
  toConsentState,
  updateGtagConsent,
  writeConsent,
  type SimpleConsent,
} from '@/lib/consent'

/**
 * Self-built consent banner. Default-deny on first visit; persists choice
 * to localStorage; emits Google Consent Mode v2 signals via gtag('consent',
 * 'update', …).
 *
 * Re-opens automatically when the visitor navigates to /opt-out-preferences/
 * (the link in the footer + the banner itself).
 *
 * If you'd rather use Cookiebot / Klaro later, replace this file with the
 * vendor's component — the consent-update signals are vendor-agnostic so
 * everything downstream keeps working.
 */
export function ConsentBanner() {
  const [decided, setDecided] = useState<boolean>(true)  // optimistic — hides until mount
  const [showCustom, setShowCustom] = useState(false)
  const [pref, setPref] = useState<SimpleConsent>({
    analytics: false,
    marketing: false,
    decided: false,
  })

  useEffect(() => {
    const existing = readConsent()
    setDecided(existing.decided)
    setPref(existing)
  }, [])

  function applyAndStore(next: SimpleConsent) {
    writeConsent(next)
    updateGtagConsent(toConsentState(next))
    setDecided(true)
    setPref(next)
  }

  function acceptAll() {
    applyAndStore({ analytics: true, marketing: true, decided: true })
  }
  function rejectAll() {
    applyAndStore({ analytics: false, marketing: false, decided: true })
  }
  function saveCustom() {
    applyAndStore({ ...pref, decided: true })
  }

  if (decided) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-300/20 bg-surface px-4 py-5 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 text-sm text-ink-700">
          <p className="font-display text-base font-semibold text-ink-900">
            We use cookies for analytics and ads
          </p>
          <p className="mt-1">
            Functional cookies (needed to operate the site) always on.
            Analytics + marketing cookies — your call. See our{' '}
            <a href="/privacy-policy/" className="underline hover:text-brand-600">
              privacy policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Customize
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
          >
            Accept all
          </button>
        </div>
      </div>

      {showCustom && (
        <div className="mx-auto mt-5 max-w-6xl border-t border-ink-300/15 pt-5">
          <fieldset className="space-y-3">
            <legend className="sr-only">Cookie categories</legend>

            <Row
              label="Functional"
              description="Required for the site to work — page navigation, form submission, security."
              checked
              disabled
            />
            <Row
              label="Analytics"
              description="GA4 measurement: which pages are visited, where visitors land, how long they stay. Aggregated; no personal data leaves the site."
              checked={pref.analytics}
              onChange={(v) => setPref({ ...pref, analytics: v })}
            />
            <Row
              label="Marketing"
              description="Meta Pixel + Google Ads conversion tracking + HubSpot analytics. Used to measure ad campaigns and re-engage past visitors."
              checked={pref.marketing}
              onChange={(v) => setPref({ ...pref, marketing: v })}
            />
          </fieldset>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="text-sm font-medium text-ink-500 hover:text-brand-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCustom}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
            >
              Save preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md p-3 transition',
        !disabled && 'hover:bg-surface-alt',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-ink-300 accent-brand-600"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink-900">
          {label}
          {disabled && <span className="ml-2 text-xs text-ink-500">(always on)</span>}
        </p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
    </label>
  )
}
