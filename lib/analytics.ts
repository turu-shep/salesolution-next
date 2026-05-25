/**
 * Client-side GA4 tracking helper.
 *
 * Single entry point for every event the site dispatches to GA4. Three
 * guarantees this module provides on every call:
 *
 *   1. **Consent gating** — `readConsent()` is the same source the cookie
 *      banner writes to. If analytics_storage is denied, `track()` is a
 *      no-op. (Consent Mode v2 also suppresses storage at gtag's level;
 *      this is belt-and-suspenders so we never push to dataLayer either.)
 *   2. **PII stripping** — a defensive deny-list (`email`, `phone`,
 *      `fullName`, etc.) prevents future maintainers from accidentally
 *      sending personal data through a `track()` call. Hashing happens
 *      explicitly at the call site (see `setUserId`), not implicitly here.
 *   3. **Dev-time visibility** — in non-production, events echo to
 *      console.debug for QA against GA4 DebugView.
 *
 * The `TrackEvent` discriminated union forces correct param shapes at
 * the call site. Adding a new event = adding a new union member; the
 * compiler will catch every place that needs an update.
 *
 * See [docs/strategy/ga4.md](../docs/strategy/ga4.md) for the full taxonomy.
 */
import { readConsent } from '@/lib/consent'

type LeadType = 'audit' | 'sprint' | 'strategy_call' | 'contact' | 'catalog_snapshot'
type FormId =
  | 'audit_lead_form'
  | 'sprint_lead_form'
  | 'contact_lead_form'
  | 'strategy_call_form'
  | 'catalog_snapshot_form'
type ErrorType = 'validation' | 'rate_limit' | 'server' | 'network' | 'turnstile'
type ServiceCategory = 'seo' | 'content' | 'web' | 'email' | 'catalog'

export type { LeadType, FormId, ErrorType, ServiceCategory }

export type TrackEvent =
  | {
      name: 'page_view'
      params: { page_location: string; page_title: string; page_referrer?: string }
    }
  | {
      name: 'form_view'
      params: { form_id: FormId; form_name: string; page_location: string }
    }
  | {
      name: 'form_start'
      params: { form_id: FormId; form_name: string; step: 1 | 2 }
    }
  | {
      name: 'form_step_complete'
      params: {
        form_id: FormId
        step: 1 | 2
        step_name: 'contact' | 'business'
      }
    }
  | {
      name: 'form_field_complete'
      params: { form_id: FormId; field_name: string; step: 1 | 2 }
    }
  | {
      name: 'form_submit'
      params: { form_id: FormId; form_name: string; submission_id: string }
    }
  | {
      name: 'form_error'
      params: { form_id: FormId; error_type: ErrorType; status_code?: number }
    }
  | {
      name: 'generate_lead'
      params: {
        value: number
        currency: 'USD'
        lead_type: LeadType
        submission_id: string
        form_id: FormId
        industry_band?: string
        revenue_band?: string
        /** GA4 reserved — dedupes against server-side Measurement Protocol hit. */
        transaction_id?: string
      }
    }
  | {
      name: 'audit_request'
      params: {
        value: number
        currency: 'USD'
        submission_id: string
        transaction_id?: string
      }
    }
  | {
      name: 'catalog_snapshot_request'
      params: {
        value: number
        currency: 'USD'
        submission_id: string
        transaction_id?: string
      }
    }
  | {
      name: 'book_growth_call'
      params: {
        value: number
        currency: 'USD'
        booking_source: 'form' | 'calendly'
        submission_id?: string
        transaction_id?: string
      }
    }
  | {
      name: 'constraint_sprint_apply'
      params: {
        value: number
        currency: 'USD'
        submission_id: string
        transaction_id?: string
      }
    }
  | {
      name: 'calendly_widget_view'
      params: { page_location: string; calendly_url: string }
    }
  | {
      name: 'calendly_booking_started'
      params: { page_location: string; calendly_url: string }
    }
  | {
      name: 'calendly_booking_completed'
      params: {
        page_location: string
        calendly_url: string
        event_uri?: string
        value: number
        currency: 'USD'
      }
    }
  | {
      name: 'service_view'
      params: { service_name: string; service_category: ServiceCategory }
    }
  | {
      name: 'pricing_tier_view'
      params: { tier_name: string; tier_price: number; tier_currency: 'USD' }
    }
  | {
      name: 'outbound_click'
      params: {
        link_url: string
        link_domain: string
        link_text: string
        outbound_category: string
      }
    }
  | {
      name: 'download'
      params: { file_name: string; file_extension: string; asset_id: string }
    }
  | {
      name: 'cta_click'
      params: { cta_id: string; cta_location: string; destination: string }
    }

/**
 * Keys we strip defensively before sending to gtag. The taxonomy never
 * sends these — this catches accidental future regressions.
 */
const PII_KEYS = new Set([
  'email',
  'phone',
  'full_name',
  'fullName',
  'name',
  'address',
  'first_name',
  'last_name',
])

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Dispatch a typed GA4 event. No-op in three situations:
 *   - SSR / non-browser environment
 *   - gtag.js hasn't loaded yet (no analytics ID configured, or pre-consent)
 *   - The user denied analytics consent
 */
export function track<E extends TrackEvent>(event: E): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return

  const consent = readConsent()
  if (!consent.analytics) return

  const cleanParams: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(event.params as Record<string, unknown>)) {
    if (PII_KEYS.has(k)) continue
    if (v === undefined || v === null) continue
    cleanParams[k] = v
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[track]', event.name, cleanParams)
  }

  window.gtag('event', event.name, cleanParams)
}

/**
 * Set user-level properties on the GA4 visitor (cohort dimensions).
 * Call once per visit on `generate_lead` success.
 */
export function setUserProperties(
  props: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const consent = readConsent()
  if (!consent.analytics) return
  window.gtag('set', 'user_properties', props)
}

/**
 * Set the GA4 user_id (hashed email) for cross-session identity.
 * Run BEFORE the conversion event so it carries the user_id.
 *
 * Note: a second `gtag('config', id, …)` call would re-fire `page_view`
 * on the property. `send_page_view: false` suppresses that, so this call
 * only updates the user_id without inflating page-view counts.
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const consent = readConsent()
  if (!consent.analytics) return
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  if (ga4Id) {
    window.gtag('config', ga4Id, {
      user_id: userId,
      send_page_view: false,
    })
  }
}

/**
 * Read the GA4 client_id from the `_ga` cookie. Format:
 * `_ga=GA1.1.<client_id>` where `<client_id>` is `<random>.<timestamp>`.
 * Returns undefined if the cookie is absent (e.g. consent denied,
 * first-page visit before gtag wrote it).
 */
export function getGaClientId(): string | undefined {
  if (typeof document === 'undefined') return
  const m = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/)
  return m?.[1]
}

/**
 * SHA-256 hex digest using SubtleCrypto. Used to hash email before passing
 * as user_id, so the value is identical to what HubSpot computes server-side
 * (enabling join-by-hash without sharing raw emails).
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
