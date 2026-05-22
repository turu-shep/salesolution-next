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

/** Read the persisted simple choice. SSR-safe — returns `undecided` on server. */
export function readConsent(): SimpleConsent {
  if (typeof window === 'undefined') return { analytics: false, marketing: false, decided: false }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { analytics: false, marketing: false, decided: false }
    return JSON.parse(raw) as SimpleConsent
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
  // @ts-expect-error window.dataLayer is typed loosely
  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) {
    // @ts-expect-error implicit-any push API
    window.dataLayer.push(args)
  }
  gtag('consent', 'update', state)
}
