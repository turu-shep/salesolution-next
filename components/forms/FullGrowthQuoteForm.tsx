'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Turnstile } from '@/components/integrations/Turnstile'
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

/**
 * Full Growth Ownership qualifier form.
 *
 * Three steps: (1) shape + services, (2) context, (3) contact. Submission
 * POSTs to /api/full-growth-quote/. On success, redirects to the
 * thank-you route. Voice and reassurance copy match the FGO landing page
 * — short qualifier, personal reply, no SDR loop.
 *
 * GA4 instrumentation deliberately omitted for the first pass: the FGO
 * conversion model (manual diagnostic → SOW within 48h → first invoice)
 * doesn't fit the productized `generate_lead` value model cleanly, and
 * sending bad data is worse than sending none until the model is right.
 * See /api/full-growth-quote/route.ts.
 */

type Step = 1 | 2 | 3

const STEP_FIELDS: Record<Step, (keyof FgoQuoteData)[]> = {
  1: ['shape', 'services'],
  2: ['website', 'revenue', 'headcount', 'marketingSpend', 'notes'],
  3: ['fullName', 'email', 'phone', 'bestTime'],
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

  const submissionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )

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
      revenue: '',
      headcount: '',
      marketingSpend: '',
      notes: '',
      fullName: '',
      email: '',
      phone: '',
      bestTime: '',
    },
  })

  const next = useCallback(async () => {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) setStep((s) => (Math.min(3, s + 1) as Step))
  }, [step, trigger])

  async function onSubmit(data: FgoQuoteData) {
    setSubmitError(null)
    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the bot check above.')
      return
    }
    try {
      const res = await fetch('/api/full-growth-quote/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
          pageSource: typeof window !== 'undefined' ? window.location.href : undefined,
          submissionId: submissionIdRef.current,
        }),
      })

      if (res.status === 429) {
        setSubmitError('Too many attempts. Try again in a few minutes.')
        return
      }
      if (!res.ok) {
        setSubmitError(
          'We hit a snag submitting. Please email leads@salesolution.net directly.',
        )
        return
      }

      window.location.href = thankYouHref
    } catch (err) {
      setSubmitError(
        'Network error. Please email leads@salesolution.net or try again.',
      )
      console.error('[FullGrowthQuoteForm] network error:', err)
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
