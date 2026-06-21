'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Turnstile } from '@/components/integrations/Turnstile'
import { getGaClientId, track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import {
  LEAKS,
  revenueLeakAuditSchema,
  type RevenueLeakAuditData,
  TRADES,
} from '@/lib/lead-form/revenue-leak-audit-schema'
import { useTrackOnView } from '@/lib/use-track-on-view'

const FORM_ID = 'revenue_leak_audit_form'
const FORM_NAME = 'Revenue Leak Audit'
const LEAD_VALUE = 220

/**
 * Single-step native lead form for the Revenue Leak Audit (local-service funnel).
 * Roofer/dental-appropriate fields — NOT the industrial e-commerce schema. One
 * step on purpose: paid traffic converts better with no "continue" gate.
 *
 * client → POST /api/revenue-leak-audit → Turnstile + HubSpot + Resend (env-gated)
 * → redirect to thankYouHref. Fires the standard GA4 form_view/start/submit +
 * generate_lead + audit_request events (see docs/strategy/ga4.md).
 */
export function RevenueLeakAuditForm({
  thankYouHref = '/revenue-engine/audit-booked/',
  className,
}: {
  thankYouHref?: string
  className?: string
}) {
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
        params: { form_id: FORM_ID, form_name: FORM_NAME, page_location: window.location.href },
      })
    }, []),
  )

  const onFirstFocus = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    track({ name: 'form_start', params: { form_id: FORM_ID, form_name: FORM_NAME, step: 1 } })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RevenueLeakAuditData>({
    resolver: zodResolver(revenueLeakAuditSchema),
    mode: 'onBlur',
    defaultValues: { fullName: '', phone: '', company: '', email: '', website: '', trade: '', leak: '' },
  })

  async function onSubmit(data: RevenueLeakAuditData) {
    setSubmitError(null)
    if (turnstileRequired && !turnstileToken) {
      setSubmitError('Please complete the bot check above.')
      track({ name: 'form_error', params: { form_id: FORM_ID, error_type: 'turnstile' } })
      return
    }
    try {
      const submissionId = submissionIdRef.current
      const res = await fetch('/api/revenue-leak-audit/', {
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
        track({ name: 'form_error', params: { form_id: FORM_ID, error_type: 'rate_limit', status_code: 429 } })
        return
      }
      if (!res.ok) {
        setSubmitError('We hit a snag. Please call or text 561-531-4339 directly.')
        track({ name: 'form_error', params: { form_id: FORM_ID, error_type: 'server', status_code: res.status } })
        return
      }

      track({ name: 'form_submit', params: { form_id: FORM_ID, form_name: FORM_NAME, submission_id: submissionId } })
      track({
        name: 'generate_lead',
        params: {
          value: LEAD_VALUE,
          currency: 'USD',
          lead_type: 'audit',
          submission_id: submissionId,
          form_id: FORM_ID,
          transaction_id: submissionId,
        },
      })
      track({
        name: 'audit_request',
        params: { value: LEAD_VALUE, currency: 'USD', submission_id: submissionId, transaction_id: submissionId },
      })

      window.location.href = thankYouHref
    } catch {
      setSubmitError('Network error. Please call or text 561-531-4339, or try again.')
      track({ name: 'form_error', params: { form_id: FORM_ID, error_type: 'network' } })
    }
  }

  return (
    <form
      ref={rootRef}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onFocus={onFirstFocus}
      className={cn('rounded-xl bg-surface p-6 shadow-md ring-1 ring-ink-300/15 sm:p-7', className)}
    >
      <p className="font-display text-xl font-semibold text-ink-900">Get your free Revenue Leak Audit</p>
      <p className="mt-1.5 text-sm text-ink-500">
        Takes a minute. I&rsquo;ll come back with your own numbers within one business day.
      </p>

      <div className="mt-5 space-y-4">
        <Field id="fullName" label="Your name" error={errors.fullName?.message}>
          <input id="fullName" autoComplete="name" {...register('fullName')} className="input" />
        </Field>
        <Field id="phone" label="Mobile" error={errors.phone?.message}>
          <input id="phone" type="tel" autoComplete="tel" {...register('phone')} className="input" />
        </Field>
        <Field id="company" label="Business name" error={errors.company?.message}>
          <input id="company" autoComplete="organization" {...register('company')} className="input" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="trade" label="Trade" error={errors.trade?.message}>
            <select id="trade" {...register('trade')} className="input">
              <option value="">Choose…</option>
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field id="leak" label="Where it hurts most" error={errors.leak?.message}>
            <select id="leak" {...register('leak')} className="input">
              <option value="">Pick one…</option>
              {LEAKS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="email" label="Email (optional)" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" {...register('email')} className="input" />
        </Field>
        <Field id="website" label="Website (optional)" error={errors.website?.message}>
          <input id="website" type="url" placeholder="https://yoursite.com" autoComplete="url" {...register('website')} className="input" />
        </Field>

        {turnstileRequired && (
          <div className="pt-1">
            <Turnstile onToken={setTurnstileToken} />
          </div>
        )}

        {submitError && (
          <div role="alert" className="rounded-md bg-danger-50 px-3 py-2.5 text-sm text-danger-500">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isSubmitSuccessful}
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-accent-500 px-5 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Show me the leak →'}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        No pitch, no obligation. Your numbers are yours to keep. By submitting you agree to our{' '}
        <a href="/privacy-policy/" className="underline hover:text-accent-600">privacy policy</a>.
      </p>
    </form>
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
