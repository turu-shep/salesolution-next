'use client'

import Link from 'next/link'
import { useState } from 'react'

import { CYLINDER_GROUPS } from '@/lib/revenue-engine'

type BizKey = 'industrial' | 'home-services' | 'medical' | 'consumer'

const BUSINESSES: { key: BizKey; label: string; sub: string }[] = [
  {
    key: 'industrial',
    label: 'Industrial / distribution',
    sub: 'Distributors & manufacturers, B2B parts',
  },
  {
    key: 'home-services',
    label: 'Home services',
    sub: 'Roofing, HVAC, plumbing, electrical',
  },
  {
    key: 'medical',
    label: 'Medical & dental',
    sub: 'Practices, dental offices, clinics',
  },
  {
    key: 'consumer',
    label: 'Consumer & DTC',
    sub: 'E-commerce, retail, direct-to-consumer',
  },
]

type Problem = { key: string; label: string; cylinders: string[] }

const PROBLEMS: Record<BizKey, Problem[]> = {
  industrial: [
    {
      key: 'visibility',
      label: "Buyers can't find our parts — Google and AI skip right over us",
      cylinders: ['AI Search & GEO', 'Catalog AI', 'Editorial Authority'],
    },
    {
      key: 'catalog',
      label: "Our catalog is a dump — customers can't find what they need and give up",
      cylinders: ['Catalog AI', 'Website Development', 'AI Search & GEO'],
    },
    {
      key: 'quotes',
      label: "Quotes go out and nobody follows up — we just wait and hope",
      cylinders: ['Outbound Email', 'Recover & Reactivate'],
    },
    {
      key: 'ads',
      label: "We spend on paid ads but have no idea if they're actually working",
      cylinders: ['Paid Acquisition', 'AI Search & GEO'],
    },
    {
      key: 'system',
      label: "Our marketing doesn't feel like a system — everything is disconnected",
      cylinders: ['Full Growth Ownership', 'AI Search & GEO', 'Editorial Authority'],
    },
  ],
  'home-services': [
    {
      key: 'calls',
      label: "We miss calls on the job — by the time we call back, they've moved on",
      cylinders: ['Answer & Book', 'Local SEO & Maps'],
    },
    {
      key: 'estimates',
      label: "Estimates go out and we never hear back — cold quotes just die",
      cylinders: ['Answer & Book', 'Recover & Reactivate'],
    },
    {
      key: 'referrals',
      label: "We're too dependent on referrals — no reliable lead source outside word of mouth",
      cylinders: ['Local SEO & Maps', 'Paid Acquisition'],
    },
    {
      key: 'ads',
      label: "Paid ads aren't delivering — expensive leads, wrong jobs, can't tell what's working",
      cylinders: ['Paid Acquisition', 'Local SEO & Maps', 'Reviews & Reputation'],
    },
    {
      key: 'slow-season',
      label: "Slow season kills us — we need work when the phones go quiet",
      cylinders: ['Recover & Reactivate', 'Outbound Email', 'Reviews & Reputation'],
    },
  ],
  medical: [
    {
      key: 'findability',
      label: "New patients can't find us when they search nearby — competitors outrank us",
      cylinders: ['Local SEO & Maps', 'Editorial Authority'],
    },
    {
      key: 'calls',
      label: "Calls go unanswered during our busiest hours — patients just call someone else",
      cylinders: ['Answer & Book', 'Local SEO & Maps'],
    },
    {
      key: 'recall',
      label: "Patients book a consult or treatment plan and then disappear before they start",
      cylinders: ['Recover & Reactivate', 'Answer & Book'],
    },
    {
      key: 'reputation',
      label: "Our online reviews and reputation are holding back new patient growth",
      cylinders: ['Reviews & Reputation', 'Local SEO & Maps'],
    },
    {
      key: 'new-service',
      label: "We want to grow a new service line but don't know how to reach the right patients",
      cylinders: ['Editorial Authority', 'Paid Acquisition', 'Local SEO & Maps'],
    },
  ],
  consumer: [
    {
      key: 'ai',
      label: "We're invisible in AI search — ChatGPT and Google AI don't mention us",
      cylinders: ['AI Search & GEO', 'Editorial Authority'],
    },
    {
      key: 'ads',
      label: "Paid ads (Meta, Google) are getting more expensive and delivering less",
      cylinders: ['AI Search & GEO', 'Editorial Authority', 'Paid Acquisition'],
    },
    {
      key: 'conversion',
      label: "Traffic lands on the site but doesn't buy — something's breaking in the middle",
      cylinders: ['Website Development', 'Conversion & CRO'],
    },
    {
      key: 'organic',
      label: "We're too dependent on paid ads — need something that compounds without spend",
      cylinders: ['AI Search & GEO', 'Editorial Authority'],
    },
    {
      key: 'retention',
      label: "Past customers don't come back — no system pulling them in after the first sale",
      cylinders: ['Recover & Reactivate', 'Reviews & Reputation'],
    },
  ],
}

function getCylinder(name: string) {
  for (const group of CYLINDER_GROUPS) {
    const cyl = group.cylinders.find((c) => c.name === name)
    if (cyl) return { ...cyl, pillar: group.pillar }
  }
  return null
}

type Step = 'business' | 'problem' | 'result'

export function LeakFinder() {
  const [step, setStep] = useState<Step>('business')
  const [biz, setBiz] = useState<BizKey | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)

  function pickBusiness(key: BizKey) {
    setBiz(key)
    setProblem(null)
    setStep('problem')
  }

  function pickProblem(p: Problem) {
    setProblem(p)
    setStep('result')
  }

  function reset() {
    setBiz(null)
    setProblem(null)
    setStep('business')
  }

  const bizLabel = BUSINESSES.find((b) => b.key === biz)?.label ?? ''
  const bookingHref =
    biz && problem
      ? `/book-growth-call/?biz=${biz}&problem=${problem.key}`
      : '/book-growth-call/'

  return (
    <div className="mt-9 rounded-[8px] border border-ink-200 bg-surface">
      <div className="border-b border-rule px-6 py-4 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {step === 'business' && 'Step 1 of 2'}
          {step === 'problem' && 'Step 2 of 2'}
          {step === 'result' && 'Your starting point'}
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-7">
        {/* Step 1: Business type */}
        {step === 'business' && (
          <div>
            <p className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
              What type of business are you?
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {BUSINESSES.map((b) => (
                <button
                  key={b.key}
                  onClick={() => pickBusiness(b.key)}
                  className="flex flex-col items-start rounded-[4px] border border-rule bg-paper px-4 py-4 text-left transition-colors duration-150 hover:border-ink-900 hover:bg-white"
                >
                  <span className="font-display text-base font-semibold text-ink-900">
                    {b.label}
                  </span>
                  <span className="mt-0.5 text-sm text-ink-500">{b.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Problem */}
        {step === 'problem' && biz && (
          <div>
            <button
              onClick={reset}
              className="mb-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink-900"
            >
              <span aria-hidden>←</span>
              {bizLabel}
            </button>
            <p className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
              What&rsquo;s the biggest problem right now?
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {PROBLEMS[biz].map((p) => (
                <button
                  key={p.key}
                  onClick={() => pickProblem(p)}
                  className="flex items-center justify-between rounded-[4px] border border-rule bg-paper px-4 py-3 text-left transition-colors duration-150 hover:border-ink-900 hover:bg-white"
                >
                  <span className="text-base text-ink-900">{p.label}</span>
                  <span aria-hidden className="ml-4 shrink-0 text-ink-400">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && biz && problem && (
          <div>
            <button
              onClick={() => setStep('problem')}
              className="mb-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink-900"
            >
              <span aria-hidden>←</span>
              Back
            </button>
            <p className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
              The cylinders that fix this leak.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {problem.cylinders.map((name) => {
                const cyl = getCylinder(name)
                if (!cyl) return null
                return (
                  <div
                    key={name}
                    className="flex flex-col rounded-[4px] border border-rule bg-paper px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-display text-base font-semibold text-ink-900">
                        {cyl.name}
                      </p>
                      <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-500">
                        {cyl.pillar}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                      {cyl.fires}
                    </p>
                    <div className="mt-3">
                      {cyl.slug ? (
                        <Link
                          href={`/services/${cyl.slug}/`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[4px] transition-colors hover:text-brand-600 hover:decoration-brand-600"
                        >
                          See {cyl.name}
                          <span aria-hidden>→</span>
                        </Link>
                      ) : (
                        <span className="inline-flex rounded-[3px] border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-rule pt-6">
              <Link
                href={bookingHref}
                data-cta="book_call__leak_finder"
                data-cta-location="leak_finder_result"
                className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
              >
                Book a Growth Call about this
              </Link>
              <button
                onClick={reset}
                className="text-sm font-semibold text-ink-600 underline decoration-rule-strong underline-offset-[4px] transition-colors hover:text-ink-900"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
