'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/cn'
import {
  ORGANIC_PERCENTAGES,
  REVENUE_RANGES,
  TIMELINES,
  TRAFFIC_TYPES,
} from '@/lib/lead-form-config'

const schema = z.object({
  email: z.string().email('Use a real email — we send the checklist instantly'),
  revenue: z.string().min(1, 'Pick a range'),
  organicShare: z.string().min(1, 'Pick a share'),
  trafficType: z.string().min(1, 'Pick a traffic type'),
  timeline: z.string().min(1, 'Pick a timeframe'),
})

type LeadMagnetData = z.infer<typeof schema>

/**
 * Single-page risk-quiz form for the AI Search Survival Checklist funnel.
 * Different shape from LeadForm — no name/phone, just a 5-field quiz
 * that personalises the downloadable PDF.
 */
export function LeadMagnetForm({
  thankYouHref,
  className,
}: {
  thankYouHref: string
  className?: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetData>({
    resolver: zodResolver(schema),
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
    // eslint-disable-next-line no-console
    console.log('[LeadMagnetForm] submit (stub):', data)
    await new Promise((r) => setTimeout(r, 600))
    window.location.href = thankYouHref
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
      <h3 className="font-display text-xl font-semibold text-ink-900">
        Calculate your AI Search risk
      </h3>
      <p className="mt-2 text-sm text-ink-500">
        Five questions. We send the survival checklist + a personalised risk
        score within 60 seconds.
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Get my protection plan'}
      </button>
      <p className="mt-3 text-xs text-ink-400">
        We send the checklist instantly + the Weekly Turbulence Brief.
        Unsubscribe any time.
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
