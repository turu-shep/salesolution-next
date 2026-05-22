/**
 * Consent state + Google Consent Mode v2 helpers.
 *
 * Default-deny stance:
 *   - Until the visitor makes a choice, all marketing-grade signals are
 *     `denied`. Functionality + security signals stay `granted` (no banner
 *     should cripple basic page navigation).
 *   - Choice is persisted in localStorage so we don't re-prompt on every
 *     pageview.
 *
 * Why categories rather than per-vendor toggles: GDPR + EU Consent Mode v2
 * are category-driven (analytics_storage, ad_storage, etc.). All tags
 * downstream (GA4, Pixel, Google Ads, HubSpot) declare which category they
 * belong to.
 */

export type ConsentState = {
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  analytics_storage: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted'
}

export type SimpleConsent = {
  analytics: boolean
  marketing: boolean
  decided: boolean   // false = no choice made yet
}

const STORAGE_KEY = 'ss_consent'

export const DEFAULT_CONSENT: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
}

export const ALL_ACCEPTED: ConsentState = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
}

/**
 * Detect Global Privacy Control. Required to honor as an opt-out-of-sale/share
 * signal under CCPA/CPRA + Colorado CPA + Connecticut CTDPA. GPC scope is
 * narrowly "sale/share" — we map it to the `marketing` category. Analytics
 * (first-party measurement) is left to the user's stored choice / default-deny.
 *
 * Reference: https://globalprivacycontrol.org/
 */
function hasGPC(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.globalPrivacyControl === true
}

/** Read the persisted simple choice. SSR-safe — returns `undecided` on server.
 *  GPC, when active, forces `marketing: false` regardless of stored choice. */
export function readConsent(): SimpleConsent {
  if (typeof window === 'undefined') return { analytics: false, marketing: false, decided: false }
  const gpc = hasGPC()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // No prior choice. GPC implies an explicit opt-out of sale/share, so
      // we treat the visitor as "decided" — banner doesn't need to ask again.
      if (gpc) return { analytics: false, marketing: false, decided: true }
      return { analytics: false, marketing: false, decided: false }
    }
    const stored = JSON.parse(raw) as SimpleConsent
    // GPC overrides marketing even after an "accept all" choice, per CCPA.
    if (gpc) return { ...stored, marketing: false }
    return stored
  } catch {
    return { analytics: false, marketing: false, decided: false }
  }
}

export function writeConsent(c: SimpleConsent) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
}

/** Map our simple two-category UI to Google Consent Mode v2's seven signals. */
export function toConsentState(c: SimpleConsent): ConsentState {
  return {
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
    analytics_storage: c.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: c.analytics ? 'granted' : 'denied',
    security_storage: 'granted',
  }
}

/** Push gtag('consent', 'update', ...). Called after the banner choice. */
export function updateGtagConsent(state: ConsentState) {
  if (typeof window === 'undefined') return
  // window.gtag may not be defined yet if the user hasn't accepted anything —
  // we still push to dataLayer so the eventual tag manager picks it up.
  // `dataLayer` is declared as `unknown[]` on the global Window in
  // lib/analytics.ts; the casts below preserve the original push semantics.
  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  gtag('consent', 'update', state)
}
