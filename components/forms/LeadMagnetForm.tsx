'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { FormSuccess } from '@/components/forms/FormSuccess'
import { Turnstile } from '@/components/integrations/Turnstile'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import {
  ORGANIC_PERCENTAGES,
  REVENUE_RANGES,
  TIMELINES,
  TRAFFIC_TYPES,
} from '@/lib/lead-form-config'
import {
  leadMagnetSchema,
  type LeadMagnetData,
} from '@/lib/lead-form/lead-magnet-schema'
import { useTrackOnView } from '@/lib/use-track-on-view'

const FORM_ID = 'lead_magnet_form'
const FORM_NAME = 'AI Search Survival Checklist'
/** Flat 50, same as `contact` — an email address and four answers, no revenue commitment. */
const LEAD_VALUE = 50

// Stable per-submission id, computed once. Kept out of render so the impure
// Date.now/Math.random fallback can't re-run (same guard as RevenueLeakAuditForm).
function makeSubmissionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Single-page quiz form for the AI Search Survival Checklist funnel.
 * Different shape from LeadForm — no name/phone, just email plus four
 * qualifying answers.
 *
 * Submission flow (F-02, wired 2026-07-27 — this was a console.log stub that
 * redirected to another funnel's thank-you page and delivered nothing):
 *   client → POST /api/lead-magnet → HubSpot + Resend capture → the checklist
 *   link is emailed to the submitter, gated on the capture succeeding.
 *
 * Success is an inline state, not a redirect: the page already explains the
 * offer, and a thank-you page that says "check your spam folder" while nothing
 * was ever sent is the exact failure this rewrite closes.
 *
 * GA4 instrumentation matches the sibling forms (see docs/strategy/ga4.md):
 * `form_view`, `form_start`, `form_submit`, `generate_lead`, `form_error`.
 * No page-specific echo — this door has no dedicated conversion event.
 */
export function LeadMagnetForm({ className }: { className?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const rootRef = useRef<HTMLFormElement>(null)
  const startedRef = useRef(false)
  const [submissionId] = useState(makeSubmissionId)

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
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetData>({
    resolver: zodResolver(leadMagnetSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      revenue: '',
      organicShare: '',
      trafficType: '',
      timeline: '',
    },
  })

  async function onSubmit(data: LeadMagnetData) {
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
      const res = await fetch('/api/lead-magnet/', {
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
        track({
          name: 'form_error',
          params: { form_id: FORM_ID, error_type: 'rate_limit', status_code: 429 },
        })
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setSubmitError(
          'We hit a snag sending the checklist. Email connect@salesolution.net and I’ll send it by hand.',
        )
        track({
          name: 'form_error',
          params: { form_id: FORM_ID, error_type: 'server', status_code: res.status },
        })
        console.error('[LeadMagnetForm] /api/lead-magnet failed:', res.status, body)
        return
      }

      track({
        name: 'form_submit',
        params: {
          form_id: FORM_ID,
          form_name: FORM_NAME,
          submission_id: submissionId,
        },
      })
      track({
        name: 'generate_lead',
        params: {
          value: LEAD_VALUE,
          currency: 'USD',
          lead_type: 'lead_magnet',
          submission_id: submissionId,
          form_id: FORM_ID,
          revenue_band: data.revenue,
          transaction_id: submissionId,
        },
      })

      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        'Network hiccup. Try again, or email connect@salesolution.net and I’ll send it by hand.',
      )
      track({
        name: 'form_error',
        params: { form_id: FORM_ID, error_type: 'network' },
      })
      console.error('[LeadMagnetForm] network error:', err)
    }
  }

  if (submitted) {
    return (
      <FormSuccess
        className={className}
        heading="Check your inbox — the checklist just landed."
        body={
          <>
            Sixty checks, four sections, and the scoring sheet at the end. The
            email comes from connect@salesolution.net.
          </>
        }
        footnote={
          <>
            Nothing after a few minutes? Check spam, then email{' '}
            <a
              href="mailto:connect@salesolution.net"
              className="font-medium text-brand-600 underline underline-offset-4"
            >
              connect@salesolution.net
            </a>{' '}
            and I&rsquo;ll send it by hand.
          </>
        }
      />
    )
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
      <h3 className="font-display text-xl font-semibold text-ink-900">
        Get the survival checklist
      </h3>
      <p className="mt-2 text-sm text-ink-500">
        Your email and four quick questions, so we know who&rsquo;s asking.
        The checklist lands in your inbox about a minute later.
      </p>

      <div className="mt-6 space-y-4">
        <Field id="email" label="Work email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="input"
          />
        </Field>

        <Field id="revenue" label="Annual revenue" error={errors.revenue?.message}>
          <select id="revenue" {...register('revenue')} className="input">
            <option value="">Choose…</option>
            {REVENUE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label.replace(' / month', ' × 12')}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="organicShare"
          label="Share of revenue from organic search"
          error={errors.organicShare?.message}
        >
          <select id="organicShare" {...register('organicShare')} className="input">
            <option value="">Choose…</option>
            {ORGANIC_PERCENTAGES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="trafficType"
          label="Type of traffic that matters"
          error={errors.trafficType?.message}
        >
          <select id="trafficType" {...register('trafficType')} className="input">
            <option value="">Choose…</option>
            {TRAFFIC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="timeline" label="When you want to act" error={errors.timeline?.message}>
          <select id="timeline" {...register('timeline')} className="input">
            <option value="">Choose…</option>
            {TIMELINES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {turnstileRequired && (
        <div className="mt-5">
          <Turnstile onToken={setTurnstileToken} />
        </div>
      )}

      {submitError && (
        <div
          role="alert"
          className="mt-5 rounded-md bg-danger-50 px-3 py-2.5 text-sm text-danger-500"
        >
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send me the checklist'}
      </button>
      <p className="mt-3 text-xs text-ink-400">
        The checklist arrives by email. You&rsquo;ll also get the occasional
        note worth reading &mdash; one click to unsubscribe.
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
