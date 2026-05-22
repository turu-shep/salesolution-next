'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Turnstile } from '@/components/integrations/Turnstile'
import { cn } from '@/lib/cn'
import {
  FRUSTRATIONS,
  PLATFORMS,
  REVENUE_RANGES,
} from '@/lib/lead-form-config'
import { leadSchema, type LeadFormData } from '@/lib/lead-form/schema'

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
 */
export function LeadForm({
  submitLabel = 'Submit',
  thankYouHref,
  className,
}: {
  submitLabel?: string
  thankYouHref: string
  className?: string
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

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
    if (ok) setStep(2)
  }

  async function onSubmit(data: LeadFormData) {
    setSubmitError(null)
    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the bot check above.')
      return
    }
    try {
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
          pageSource: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      })

      if (res.status === 429) {
        setSubmitError('Too many attempts. Try again in a few minutes.')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setSubmitError(
          'We hit a snag submitting. Please email leads@salesolution.net directly.',
        )
        // eslint-disable-next-line no-console
        console.error('[LeadForm] /api/lead failed:', res.status, body)
        return
      }

      window.location.href = thankYouHref
    } catch (err) {
      setSubmitError(
        'Network error. Please email leads@salesolution.net or try again.',
      )
      // eslint-disable-next-line no-console
      console.error('[LeadForm] network error:', err)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
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
