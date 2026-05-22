'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * /future-proof-your-seo/ hero — mirrors the homepage HeroProbe pattern:
 * a bold two-tone claim on the left, an interactive widget on the right.
 *
 * The widget is a "Revenue-at-Risk" calculator: the reader picks monthly
 * revenue, organic share, and AIO exposure tier — we compute the displaced
 * pipeline and then offer the checklist as the next step. No data is sent
 * anywhere; the calc is deterministic client-side so the page loads with
 * a working tool, not a stub.
 *
 * The "Get the checklist" CTA scrolls to the email-capture form below.
 */

const REVENUE_OPTIONS = [
  { value: 100_000,   label: '$100k / mo' },
  { value: 250_000,   label: '$250k / mo' },
  { value: 500_000,   label: '$500k / mo' },
  { value: 1_000_000, label: '$1M / mo' },
  { value: 2_000_000, label: '$2M / mo' },
  { value: 5_000_000, label: '$5M+ / mo' },
] as const

const ORGANIC_SHARE = [
  { value: 0.20, label: '20%' },
  { value: 0.35, label: '35%' },
  { value: 0.50, label: '50%' },
  { value: 0.70, label: '70%' },
] as const

const EXPOSURE = [
  {
    value: 'low',
    label: 'Mostly transactional',
    rate: 0.10,
    blurb: 'Product / category queries — AIO bites less.',
  },
  {
    value: 'mixed',
    label: 'Mixed traffic',
    rate: 0.22,
    blurb: 'A blend — typical for technical e-commerce.',
  },
  {
    value: 'high',
    label: 'Mostly informational',
    rate: 0.40,
    blurb: 'Spec pages, guides, comparisons — AIO eats first.',
  },
] as const

type Exposure = (typeof EXPOSURE)[number]

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

export function FutureProofHero() {
  const [revenue, setRevenue] = useState<number>(500_000)
  const [share, setShare] = useState<number>(0.35)
  const [exposure, setExposure] = useState<Exposure>(EXPOSURE[1])

  const result = useMemo(() => {
    const monthlyOrganic = revenue * share
    const monthlyAtRisk = monthlyOrganic * exposure.rate
    const annualAtRisk = monthlyAtRisk * 12
    return {
      monthlyOrganic,
      monthlyAtRisk,
      annualAtRisk,
      percentDrop: exposure.rate,
    }
  }, [revenue, share, exposure])

  const tier =
    result.percentDrop >= 0.35 ? 'risk'
    : result.percentDrop >= 0.20 ? 'gaps'
    : 'watch'

  const tierStyle = {
    watch: { pill: 'bg-data-up/10 text-data-up ring-data-up/30', label: 'Manageable' },
    gaps:  { pill: 'bg-accent-50 text-accent-700 ring-accent-500/30', label: 'Material risk' },
    risk:  { pill: 'bg-danger-50 text-data-down ring-data-down/30', label: 'Severe risk' },
  }[tier]

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          AI Search Survival · Checklist + risk score
        </p>

        {/* Big two-tone H1 — homepage rhythm */}
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[6rem]">
          <span className="block">AI search is erasing</span>
          <span className="block text-ink-500">1 in 3 of your clicks.</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          Ahrefs research shows a 34% drop in CTR on pages with AI Overviews.
          For spec-heavy industrial stores it&rsquo;s already 40&ndash;60%.
          Audit yourself with the 10-minute survival checklist &mdash;
          before the next rollout cycle.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="#get-the-checklist"
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            Get the checklist
          </Link>
          <Link
            href="#whats-inside"
            className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            See what&rsquo;s inside
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Two-column proof: copy + calculator widget — mirrors HeroProbe */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12 md:mt-24">
          {/* Left: framing copy */}
          <div className="lg:col-span-6">
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                What this checklist covers
              </p>
            </div>
            <ul className="space-y-5">
              {[
                {
                  k: '01',
                  h: 'Schema depth audit',
                  b: 'Product, FAQ, HowTo, BreadcrumbList — the JSON-LD that AI engines actually parse, not the SEO-plugin defaults.',
                },
                {
                  k: '02',
                  h: 'AI-readable content tests',
                  b: 'Heading hierarchy, answer-first paragraphs, citation-worthy structuring. Run on any page in under 5 minutes.',
                },
                {
                  k: '03',
                  h: 'Citation-share tracking',
                  b: 'Where you appear inside AI summaries vs. competitors — across the 50 queries that matter most.',
                },
                {
                  k: '04',
                  h: 'Brand-mention monitoring',
                  b: 'AI engines weight entity authority. Track unlinked mentions, knowledge-panel signals, and category co-occurrence.',
                },
              ].map((row) => (
                <li key={row.k} className="flex items-baseline gap-4 border-t border-rule pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                    {row.k}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {row.h}
                    </h3>
                    <p className="mt-1.5 text-ink-700">{row.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Revenue-at-Risk calculator */}
          <div className="lg:col-span-6">
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Try the calculator before you opt in
              </p>
            </div>
            <div className="relative border border-ink-300/30 bg-surface shadow-[0_30px_80px_-30px_rgba(15,20,30,0.20)]">
              <div className="flex items-center justify-between border-b border-rule px-5 py-4">
                <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                  </span>
                  Revenue-at-Risk
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  live
                </span>
              </div>

              <div className="space-y-5 p-5">
                <Field label="Monthly revenue">
                  <SegmentedNumeric
                    ariaLabel="Monthly revenue"
                    options={REVENUE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    value={revenue}
                    onChange={setRevenue}
                  />
                </Field>

                <Field label="Share of revenue from organic">
                  <SegmentedNumeric
                    ariaLabel="Share of revenue from organic"
                    options={ORGANIC_SHARE.map((o) => ({ value: o.value, label: o.label }))}
                    value={share}
                    onChange={setShare}
                  />
                </Field>

                <Field label="Traffic mix">
                  <div role="radiogroup" aria-label="Traffic mix" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {EXPOSURE.map((opt) => {
                      const active = exposure.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setExposure(opt)}
                          className={cn(
                            'cursor-pointer border px-3 py-2.5 text-left transition-colors duration-150',
                            active
                              ? 'border-ink-900 bg-ink-900 text-white'
                              : 'border-rule-strong bg-surface text-ink-700 hover:border-ink-700',
                          )}
                        >
                          <span className="block font-display text-sm font-semibold">
                            {opt.label}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 block text-[11px] leading-snug',
                              active ? 'text-white/70' : 'text-ink-500',
                            )}
                          >
                            {opt.blurb}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>

              {/* Result band */}
              <div className="border-t border-rule bg-surface-alt/60 px-5 py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                    Annual pipeline at risk
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
                      tierStyle.pill,
                    )}
                  >
                    {tierStyle.label}
                  </span>
                </div>
                <p className="mt-3 font-display text-5xl font-semibold tabular-nums leading-none text-ink-900">
                  <span className="text-accent-500">−</span>
                  {formatCurrency(result.annualAtRisk)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">
                  Roughly {formatCurrency(result.monthlyAtRisk)}/mo displaced &mdash;
                  the share of your {formatCurrency(result.monthlyOrganic)} organic
                  revenue most exposed to AI Overviews at current coverage rates.
                </p>
              </div>

              <div className="border-t border-rule px-5 py-4">
                <Link
                  href="#get-the-checklist"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
                >
                  Get the survival checklist
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="border-t border-rule px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Deterministic · No data stored · Industry rates from Ahrefs / Pew
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </p>
      {children}
    </div>
  )
}

function SegmentedNumeric({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  ariaLabel: string
  options: { value: number; label: string }[]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'cursor-pointer border px-3 py-2 font-mono text-xs tabular-nums transition-colors duration-150',
              active
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-rule-strong bg-surface text-ink-700 hover:border-ink-700',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
