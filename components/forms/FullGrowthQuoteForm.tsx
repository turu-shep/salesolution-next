'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Turnstile } from '@/components/integrations/Turnstile'
import {
  getGaClientId,
  setUserId,
  setUserProperties,
  sha256Hex,
  track,
} from '@/lib/analytics'
import { cn } from '@/lib/cn'
import {
  FGO_HEADCOUNT_RANGES,
  FGO_REVENUE_RANGES,
  FGO_SERVICES,
  FGO_SHAPES,
  FGO_SPEND_RANGES,
  fgoQuoteSchema,
  type FgoQuoteData,
} from '@/lib/lead-form/full-growth-quote-schema'
import { fgoLeadValue } from '@/lib/lead-form/full-growth-quote-value'
import { useTrackOnView } from '@/lib/use-track-on-view'

/**
 * Full Growth Ownership qualifier form.
 *
 * Three steps: (1) shape + services, (2) context, (3) contact. Submission
 * POSTs to /api/full-growth-quote/. On success, redirects to the
 * thank-you route. Voice and reassurance copy match the FGO landing page
 * — short qualifier, personal reply, no SDR loop.
 *
 * GA4 instrumentation mirrors LeadForm (see docs/strategy/ga4.md §3.2):
 *   - `form_view`              — once when the form enters viewport
 *   - `form_start`             — once on first focus into any field
 *   - `form_step_complete`     — when each step's validation passes
 *   - `form_submit`            — on `/api/full-growth-quote/` 2xx, pre-redirect
 *   - `generate_lead`          — canonical conversion (lead_type=full_growth)
 *   - `full_growth_quote_request` — page-specific echo carrying shape + count
 *   - `form_error`             — on each failure branch
 *
 * The `submissionId` UUID is sent server-side so the server Measurement
 * Protocol echo dedups against the client hit on `transaction_id`.
 */

const FORM_ID = 'full_growth_quote_form'
const FORM_NAME = 'Full Growth Ownership qualifier'

type Step = 1 | 2 | 3

const STEP_FIELDS: Record<Step, (keyof FgoQuoteData)[]> = {
  1: ['shape', 'services'],
  2: ['website', 'revenue', 'headcount', 'marketingSpend', 'notes'],
  3: ['fullName', 'email', 'phone', 'bestTime'],
}

const STEP_NAME: Record<Step, 'shape' | 'context' | 'contact'> = {
  1: 'shape',
  2: 'context',
  3: 'contact',
}

export function FullGrowthQuoteForm({
  thankYouHref = '/full-growth-quote/thank-you/',
  className,
}: {
  thankYouHref?: string
  className?: string
}) {
  const [step, setStep] = useState<Step>(1)
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
          form_id: FORM_ID,
          form_name: FORM_NAME,
          page_location: window.location.href,
        },
      })
    }, []),
  )

  const onFirstFocus = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    track({
      name: 'form_start',
      params: { form_id: FORM_ID, form_name: FORM_NAME, step: 1 },
    })
  }, [])

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FgoQuoteData>({
    resolver: zodResolver(fgoQuoteSchema),
    mode: 'onBlur',
    defaultValues: {
      shape: undefined,
      services: [],
      website: '',
      // revenue / headcount / marketingSpend are strict enums (no empty-string
      // member) — leave them unset so the placeholder <option value=""> shows.
      revenue: undefined,
      headcount: undefined,
      marketingSpend: undefined,
      notes: '',
      fullName: '',
      email: '',
      phone: '',
      bestTime: '',
    },
  })

  const next = useCallback(async () => {
    const ok = await trigger(STEP_FIELDS[step])
    if (!ok) return
    track({
      name: 'form_step_complete',
      params: { form_id: FORM_ID, step, step_name: STEP_NAME[step] },
    })
    setStep((s) => (Math.min(3, s + 1) as Step))
  }, [step, trigger])

  async function onSubmit(data: FgoQuoteData) {
    setSubmitError(null)
    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the bot check above.')
      track({
        name: 'form_error',
        params: { form_id: FORM_ID, error_type: 'turnstile' },
      })
      return
    }
    try {
      const submissionId = submissionIdRef.current
      const res = await fetch('/api/full-growth-quote/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
          pageSource: typeof window !== 'undefined' ? window.location.href : undefined,
          gaClientId: getGaClientId(),
          submissionId,
        }),
      })

      if (res.status === 429) {
        setSubmitError('Too many attempts. Try again in a few minutes.')
        track({
          name: 'form_error',
          params: { form_id: FORM_ID, error_type: 'rate_limit', status_code: 429 },
        })
        return
      }
      if (!res.ok) {
        setSubmitError(
          'We hit a snag submitting. Please email connect@salesolution.net directly.',
        )
        track({
          name: 'form_error',
          params: { form_id: FORM_ID, error_type: 'server', status_code: res.status },
        })
        return
      }

      // Success — fire all tracking BEFORE the redirect destroys the page.
      const value = fgoLeadValue(data.revenue)
      const serviceCount = data.services.filter((s) => s !== 'unsure').length

      // Identity: set user_id BEFORE the conversion event so it carries the id.
      try {
        const hashed = await sha256Hex(data.email.toLowerCase().trim())
        setUserId(hashed)
        setUserProperties({
          revenue_band: data.revenue,
          lead_type: 'full_growth',
          fgo_shape: data.shape,
          fgo_service_count: serviceCount,
          has_user_id: true,
        })
      } catch {
        // SubtleCrypto unavailable (very old browsers / non-HTTPS dev) — skip
        // identity rather than blocking the conversion event.
      }

      track({
        name: 'form_submit',
        params: { form_id: FORM_ID, form_name: FORM_NAME, submission_id: submissionId },
      })
      track({
        name: 'generate_lead',
        params: {
          value,
          currency: 'USD',
          lead_type: 'full_growth',
          submission_id: submissionId,
          form_id: FORM_ID,
          revenue_band: data.revenue,
          transaction_id: submissionId,
        },
      })
      track({
        name: 'full_growth_quote_request',
        params: {
          value,
          currency: 'USD',
          shape: data.shape,
          service_count: serviceCount,
          submission_id: submissionId,
          transaction_id: submissionId,
        },
      })

      window.location.href = thankYouHref
    } catch (err) {
      setSubmitError(
        'Network error. Please email connect@salesolution.net or try again.',
      )
      track({
        name: 'form_error',
        params: { form_id: FORM_ID, error_type: 'network' },
      })
      console.error('[FullGrowthQuoteForm] network error:', err)
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

      {step === 1 && (
        <fieldset className="mt-6 space-y-6">
          <legend className="sr-only">Shape and services</legend>

          <div>
            <p className="font-display text-base font-semibold text-ink-900">
              Which shape fits what you&rsquo;re trying to do?
            </p>
            <ul className="mt-3 space-y-2">
              {FGO_SHAPES.map((opt) => (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-rule bg-paper px-4 py-3 text-sm text-ink-700 hover:border-ink-900">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('shape')}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            {errors.shape && (
              <p className="mt-2 text-xs text-danger-500">{errors.shape.message}</p>
            )}
          </div>

          <div>
            <p className="font-display text-base font-semibold text-ink-900">
              Which services do you need? Pick all that apply.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {FGO_SERVICES.map((opt) => (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-rule bg-paper px-4 py-3 text-sm text-ink-700 hover:border-ink-900">
                    <input
                      type="checkbox"
                      value={opt.value}
                      {...register('services')}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            {errors.services && (
              <p className="mt-2 text-xs text-danger-500">{errors.services.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={next}
            className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            Continue
          </button>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="mt-6 space-y-4">
          <legend className="sr-only">About your business</legend>

          <Field id="website" label="Company website (optional)" error={errors.website?.message}>
            <input
              id="website"
              type="url"
              placeholder="https://yoursite.com"
              autoComplete="url"
              {...register('website')}
              className="input"
            />
          </Field>

          <Field id="revenue" label="Annual revenue range" error={errors.revenue?.message}>
            <select id="revenue" {...register('revenue')} className="input">
              <option value="">Choose a range…</option>
              {FGO_REVENUE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="headcount"
            label="Current marketing / growth headcount"
            error={errors.headcount?.message}
          >
            <select id="headcount" {...register('headcount')} className="input">
              <option value="">Choose a range…</option>
              {FGO_HEADCOUNT_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="marketingSpend"
            label="Current marketing / agency spend"
            error={errors.marketingSpend?.message}
          >
            <select id="marketingSpend" {...register('marketingSpend')} className="input">
              <option value="">Choose a range…</option>
              {FGO_SPEND_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="notes"
            label="Anything else we should know (optional)"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="input min-h-[80px]"
            />
          </Field>

          <StepNav onBack={() => setStep(1)} onNext={next} />
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="mt-6 space-y-4">
          <legend className="sr-only">Contact details</legend>

          <Field id="fullName" label="Full name" error={errors.fullName?.message}>
            <input id="fullName" autoComplete="name" {...register('fullName')} className="input" />
          </Field>

          <Field id="email" label="Work email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="input"
            />
          </Field>

          <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
            <input id="phone" type="tel" autoComplete="tel" {...register('phone')} className="input" />
          </Field>

          <Field id="bestTime" label="Best time to talk (optional)" error={errors.bestTime?.message}>
            <input
              id="bestTime"
              placeholder="e.g. weekday afternoons EST"
              {...register('bestTime')}
              className="input"
            />
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
              onClick={() => setStep(2)}
              className="cursor-pointer text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-brand-600"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSubmitSuccessful}
              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Send the qualifier'}
            </button>
          </div>
        </fieldset>
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-400">
        Artur replies personally within 24 business hours with a 1-page
        diagnostic and a suggested call time. No drip sequences, no SDR
        follow-up. By submitting you agree to our{' '}
        <Link href="/privacy-policy/" className="underline hover:text-brand-600">
          privacy policy
        </Link>
        .
      </p>
    </form>
  )
}

function StepNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-brand-600"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
      >
        Continue
      </button>
    </div>
  )
}

function Stepper({ current }: { current: Step }) {
  const labels: Record<Step, string> = { 1: 'Shape', 2: 'Context', 3: 'Contact' }
  return (
    <ol className="flex items-center gap-3 text-xs font-medium" aria-label="Form progress">
      {[1, 2, 3].map((n) => {
        const step = n as Step
        const active = current === step
        const past = current > step
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
            <span className={cn(active ? 'text-ink-900' : 'text-ink-500')}>{labels[step]}</span>
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
      <label htmlFor={id} className="block text-sm font-medium text-ink-900">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  )
}
