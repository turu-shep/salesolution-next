'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Turnstile } from '@/components/integrations/Turnstile'
import {
  getGaClientId,
  setUserId,
  setUserProperties,
  sha256Hex,
  track,
  type FormId,
  type LeadType,
} from '@/lib/analytics'
import { cn } from '@/lib/cn'
import {
  FRUSTRATIONS,
  PLATFORMS,
  REVENUE_RANGES,
} from '@/lib/lead-form-config'
import { leadSchema, type LeadFormData } from '@/lib/lead-form/schema'
import { useTrackOnView } from '@/lib/use-track-on-view'

const STEP_FIELDS: Record<1 | 2, (keyof LeadFormData)[]> = {
  1: ['fullName', 'email', 'phone'],
  2: ['website', 'revenue', 'platform', 'frustration'],
}

/**
 * Reusable multi-step lead form.
 *
 * Submission flow:
 *   client → POST /api/lead → server validates → HubSpot + Resend (env-gated)
 *
 * If neither HubSpot nor Resend are configured the server returns 200 and
 * the form still redirects to the thank-you page — useful in dev. See
 * lib/lead-form/submit.ts for the channel orchestration.
 *
 * GA4 instrumentation (see [docs/strategy/ga4.md §3.2 + §5.4]):
 *   - `form_view`           — fires once when the form root enters viewport
 *   - `form_start`          — fires once on the first focus into any field
 *   - `form_step_complete`  — fires when step 1 validation passes
 *   - `form_submit`         — fires on `/api/lead/` 2xx, before redirect
 *   - `generate_lead`       — canonical conversion, fires alongside `form_submit`
 *   - `audit_request` / `constraint_sprint_apply` / `book_growth_call`
 *                           — page-specific echo of `generate_lead`
 *   - `form_error`          — fires on each failure branch (validation,
 *                             rate_limit, server, network, turnstile)
 *
 * The same `submission_id` (UUID generated once per form instance) is sent
 * to the server inside the POST body so the server-side Measurement
 * Protocol hit dedups against the client hit via `transaction_id`.
 */
export function LeadForm({
  formId,
  formName,
  leadType,
  submitLabel = 'Submit',
  thankYouHref,
  className,
}: {
  formId: FormId
  formName: string
  leadType: LeadType
  submitLabel?: string
  thankYouHref: string
  className?: string
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const rootRef = useRef<HTMLFormElement>(null)
  const startedRef = useRef(false)
  const submissionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )

  useTrackOnView(
    rootRef,
    useCallback(() => {
      track({
        name: 'form_view',
        params: {
          form_id: formId,
          form_name: formName,
          page_location: window.location.href,
        },
      })
    }, [formId, formName]),
  )

  const onFirstFocus = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    track({
      name: 'form_start',
      params: { form_id: formId, form_name: formName, step: 1 },
    })
  }, [formId, formName])

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      website: '',
      revenue: '',
      platform: '',
      frustration: '',
    },
  })

  async function next() {
    const ok = await trigger(STEP_FIELDS[1])
    if (ok) {
      track({
        name: 'form_step_complete',
        params: { form_id: formId, step: 1, step_name: 'contact' },
      })
      setStep(2)
    }
  }

  async function onSubmit(data: LeadFormData) {
    setSubmitError(null)
    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the bot check above.')
      track({
        name: 'form_error',
        params: { form_id: formId, error_type: 'turnstile' },
      })
      return
    }
    try {
      const clientId = getGaClientId()
      const submissionId = submissionIdRef.current
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
          pageSource: typeof window !== 'undefined' ? window.location.href : undefined,
          gaClientId: clientId,
          submissionId,
        }),
      })

      if (res.status === 429) {
        setSubmitError('Too many attempts. Try again in a few minutes.')
        track({
          name: 'form_error',
          params: {
            form_id: formId,
            error_type: 'rate_limit',
            status_code: 429,
          },
        })
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setSubmitError(
          'We hit a snag submitting. Please email leads@salesolution.net directly.',
        )
        track({
          name: 'form_error',
          params: {
            form_id: formId,
            error_type: 'server',
            status_code: res.status,
          },
        })
        // eslint-disable-next-line no-console
        console.error('[LeadForm] /api/lead failed:', res.status, body)
        return
      }

      // Success path — fire all tracking BEFORE the redirect destroys the page.
      const value = computeLeadValue(leadType, data.revenue)
      const industryBand = deriveIndustryBand(data.platform, data.frustration)

      // Identity: set user_id BEFORE the conversion event so it carries the id.
      try {
        const hashed = await sha256Hex(data.email.toLowerCase().trim())
        setUserId(hashed)
        setUserProperties({
          industry_band: industryBand,
          revenue_band: data.revenue,
          platform: data.platform,
          primary_frustration: data.frustration,
          lead_type: leadType,
          has_user_id: true,
        })
      } catch {
        // SubtleCrypto unavailable (very old browsers / non-HTTPS dev) — skip
        // identity rather than blocking the conversion event.
      }

      track({
        name: 'form_submit',
        params: {
          form_id: formId,
          form_name: formName,
          submission_id: submissionId,
        },
      })
      track({
        name: 'generate_lead',
        params: {
          value,
          currency: 'USD',
          lead_type: leadType,
          submission_id: submissionId,
          form_id: formId,
          industry_band: industryBand,
          revenue_band: data.revenue,
          transaction_id: submissionId,
        },
      })

      // Page-specific echoes (per §3.3) — additive to `generate_lead`.
      if (leadType === 'audit') {
        track({
          name: 'audit_request',
          params: {
            value,
            currency: 'USD',
            submission_id: submissionId,
            transaction_id: submissionId,
          },
        })
      } else if (leadType === 'sprint') {
        track({
          name: 'constraint_sprint_apply',
          params: {
            value,
            currency: 'USD',
            submission_id: submissionId,
            transaction_id: submissionId,
          },
        })
      } else if (leadType === 'strategy_call') {
        track({
          name: 'book_growth_call',
          params: {
            value,
            currency: 'USD',
            booking_source: 'form',
            submission_id: submissionId,
            transaction_id: submissionId,
          },
        })
      }

      window.location.href = thankYouHref
    } catch (err) {
      setSubmitError(
        'Network error. Please email leads@salesolution.net or try again.',
      )
      track({
        name: 'form_error',
        params: { form_id: formId, error_type: 'network' },
      })
      // eslint-disable-next-line no-console
      console.error('[LeadForm] network error:', err)
    }
  }

  return (
    <form
      ref={rootRef}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onFocus={onFirstFocus}
      className={cn(
        'rounded-xl bg-surface p-6 shadow-md ring-1 ring-ink-300/15 sm:p-8',
        className,
      )}
    >
      <Stepper current={step} />

      {step === 1 ? (
        <fieldset className="mt-6 space-y-4">
          <legend className="sr-only">Your contact details</legend>

          <Field id="fullName" label="Full name" error={errors.fullName?.message}>
            <input id="fullName" autoComplete="name" {...register('fullName')} className="input" />
          </Field>

          <Field id="email" label="Work email" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" {...register('email')} className="input" />
          </Field>

          <Field id="phone" label="Phone" error={errors.phone?.message}>
            <input id="phone" type="tel" autoComplete="tel" {...register('phone')} className="input" />
          </Field>

          <button
            type="button"
            onClick={next}
            className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            Continue
          </button>
        </fieldset>
      ) : (
        <fieldset className="mt-6 space-y-4">
          <legend className="sr-only">Your business details</legend>

          <Field id="website" label="Website (optional)" error={errors.website?.message}>
            <input
              id="website"
              type="url"
              placeholder="https://yoursite.com"
              autoComplete="url"
              {...register('website')}
              className="input"
            />
          </Field>

          <Field id="revenue" label="Monthly revenue" error={errors.revenue?.message}>
            <select id="revenue" {...register('revenue')} className="input">
              <option value="">Choose a range…</option>
              {REVENUE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="platform" label="E-commerce platform" error={errors.platform?.message}>
            <select id="platform" {...register('platform')} className="input">
              <option value="">Choose a platform…</option>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="frustration"
            label="Biggest frustration right now"
            error={errors.frustration?.message}
          >
            <select id="frustration" {...register('frustration')} className="input">
              <option value="">Pick the one that stings most…</option>
              {FRUSTRATIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>

          {turnstileRequired && (
            <div className="pt-1">
              <Turnstile onToken={setTurnstileToken} />
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="rounded-md bg-danger-50 px-3 py-2.5 text-sm text-danger-500"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="cursor-pointer text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-brand-600"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSubmitSuccessful}
              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : submitLabel}
            </button>
          </div>
        </fieldset>
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-400">
        We reply personally within 24 hours. No drip sequences, no SDR
        follow-up loops. By submitting you agree to our{' '}
        <a href="/privacy-policy/" className="underline hover:text-brand-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  )
}

function Stepper({ current }: { current: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3 text-xs font-medium" aria-label="Form progress">
      {[1, 2].map((n) => {
        const active = current === n
        const past = current > n
        return (
          <li key={n} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                active && 'bg-brand-600 text-white',
                past && 'bg-brand-100 text-brand-700',
                !active && !past && 'bg-surface-alt text-ink-500',
              )}
            >
              {n}
            </span>
            <span className={cn(active ? 'text-ink-900' : 'text-ink-500')}>
              {n === 1 ? 'Contact' : 'Business'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Lead-value lookup per [docs/strategy/ga4.md §3.2]. Powers the `value`
 * param on `generate_lead`, which Google Ads uses for value-based bidding.
 *
 * The revenue-band strings here are the `value` field on REVENUE_RANGES
 * in [lib/lead-form-config.ts] — keep the two in sync.
 *
 * The doc's revenue brackets (`<$50k`, `$50k–$250k`, `$250k–$1M`, `$1M+`)
 * don't line up 1:1 with the seven REVENUE_RANGES brackets, so this maps
 * each form-level bracket to the nearest doc-level audit value.
 */
function computeLeadValue(leadType: LeadType, revenueBand: string): number {
  // Bucket the seven config-level revenue ranges into the four doc-level
  // brackets. Anything unknown falls back to the lowest tier.
  const auditValue =
    revenueBand === 'under-100k'
      ? 80
      : revenueBand === '100k-250k'
        ? 220
        : revenueBand === '250k-500k' || revenueBand === '500k-1m'
          ? 500
          : revenueBand === '1m-2m' ||
              revenueBand === '2m-5m' ||
              revenueBand === '5m-plus'
            ? 900
            : 80

  switch (leadType) {
    case 'audit':
      return auditValue
    case 'strategy_call':
      // §3.2: 1.2× the audit value for the same revenue band.
      return Math.round(auditValue * 1.2)
    case 'sprint':
      // §3.2: flat 2,400 (10% of avg sprint price, conservative).
      return 2400
    case 'contact':
      // §3.2: flat 50.
      return 50
  }
}

/**
 * Derive a coarse `industry_band` user property from the platform +
 * frustration selects. Used for cohort analysis in GA4 Explore.
 *
 * TODO(ga4): the existing FRUSTRATIONS + PLATFORMS values don't carry
 * vertical signal (hydraulics / MRO / technical-distribution), so every
 * lead currently buckets to `'other'`. Refine this once the form picks
 * up an explicit "industry vertical" field, or once HubSpot enrichment
 * back-fills the dimension server-side. See [docs/strategy/ga4.md §3.7].
 */
function deriveIndustryBand(_platform: string, _frustration: string): string {
  return 'other'
}
