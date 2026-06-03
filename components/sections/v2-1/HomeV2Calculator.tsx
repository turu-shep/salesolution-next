'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /v2-1/ — Interactive SKU price calculator.
 *
 * This is the highest-value component on the v2-1 page. Buyers who scan-bail
 * before they find pricing on the canonical homepage get an interactive
 * answer here, instantly, without booking a call.
 *
 * Pricing rules below mirror the Catalog AI page exactly. This component is
 * an interactive view of the same table — NOT a source of truth. If you
 * update tier rates here, update `/services/catalog-ai/` first.
 */

type TierKey = 'standard' | 'pro' | 'enterprise'

type TierPrice =
  | { initial: number; monthly: number; rate: number; cadence: 'per-sku' }
  | { initial: number; monthly: number; cadence: 'retainer' }

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('en-US')

function priceForTier(sku: number, tier: TierKey): TierPrice | null {
  if (tier === 'standard') {
    const rate = sku >= 50000 ? 2.0 : sku >= 10000 ? 2.5 : 3.0
    // Maintenance: roughly $1/SKU per quarter — divide by 3 for monthly.
    return { initial: sku * rate, monthly: (sku * 1.0) / 3, rate, cadence: 'per-sku' }
  }
  if (tier === 'pro') {
    const rate = sku >= 50000 ? 5.0 : sku >= 10000 ? 6.0 : 7.0
    return { initial: sku * rate, monthly: (sku * 2.5) / 3, rate, cadence: 'per-sku' }
  }
  // Enterprise only unlocks at 50K+ SKUs.
  if (sku < 50000) return null
  const monthly = sku >= 250000 ? 50000 : sku >= 100000 ? 25000 : 15000
  const initial = sku * (sku >= 100000 ? 4.0 : 5.0)
  return { initial, monthly, cadence: 'retainer' }
}

const MIN_SKU = 500
const MAX_SKU = 250000
const DEFAULT_SKU = 5000

export function HomeV2Calculator() {
  const [sku, setSku] = useState<number>(DEFAULT_SKU)

  const standard = useMemo(() => priceForTier(sku, 'standard'), [sku])
  const pro = useMemo(() => priceForTier(sku, 'pro'), [sku])
  const enterprise = useMemo(() => priceForTier(sku, 'enterprise'), [sku])

  // Summary line under the input — gives the user instant confirmation that
  // the number they typed actually drives the cards.
  const summaryMonthly = standard
    ? USD.format(Math.round(standard.monthly))
    : '$0'

  return (
    <SectionRail tone="paper" id="calculator">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-service-catalog-700">
          Live pricing
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What does your catalog cost?{' '}
          <span className="text-ink-500">Calculate now.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Drag the slider to your SKU count. See your Standard vs Pro vs
          Enterprise pricing instantly.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Input column — 40% on desktop */}
        <div className="lg:col-span-5">
          <div className="border border-rule bg-surface p-6">
            <label
              htmlFor="sku-count"
              className="block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500"
            >
              Your SKU count
            </label>

            <input
              id="sku-count"
              type="number"
              inputMode="numeric"
              min={MIN_SKU}
              max={MAX_SKU}
              step={100}
              value={sku}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isNaN(next)) return
                setSku(Math.min(MAX_SKU, Math.max(MIN_SKU, Math.round(next))))
              }}
              className="mt-2 w-full bg-transparent font-display text-5xl font-semibold tabular-nums text-ink-900 focus:outline-none"
            />

            <input
              type="range"
              min={MIN_SKU}
              max={MAX_SKU}
              step={100}
              value={sku}
              onChange={(e) => setSku(Number(e.target.value))}
              aria-label="SKU count slider"
              className="mt-4 h-2 w-full cursor-pointer touch-manipulation appearance-none rounded-full bg-rule accent-service-catalog-500"
            />

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
              <span>{NUM.format(MIN_SKU)}</span>
              <span>{NUM.format(MAX_SKU)}+</span>
            </div>

            <div className="mt-6 border-t border-rule pt-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                You selected
              </p>
              <p className="mt-2 text-sm text-ink-700">
                <span className="font-display text-base font-semibold text-ink-900">
                  {NUM.format(sku)} SKUs
                </span>{' '}
                &middot; ~{summaryMonthly}/mo ongoing on Standard
              </p>
            </div>
          </div>
        </div>

        {/* Tier cards column — 60% on desktop */}
        <div className="grid gap-5 lg:col-span-7 md:grid-cols-3">
          <TierCard
            tierKey="standard"
            name="Standard"
            label="Per-SKU"
            price={standard}
            summary="AI-rewritten descriptions, Product + Offer schema, brand-voice trained, 5% manual QA, CRM-format delivery."
          />
          <TierCard
            tierKey="pro"
            name="Pro"
            label="Per-SKU"
            featured
            price={pro}
            summary="100% editor review on every SKU. Manufacturer spec ingestion, 4–6 FAQ pairs, comparison content, AIO citation engineering."
          />
          <TierCard
            tierKey="enterprise"
            name="Enterprise"
            label="Managed service"
            price={enterprise}
            summary="50K+ SKUs only. Dedicated operator, programmatic SEO build, category page rewrites, monthly outcome reviews."
            disabledReason={
              sku < 50000
                ? 'Enterprise unlocks at 50,000+ SKUs. Below that, Standard or Pro is the better fit.'
                : undefined
            }
          />
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        These are starting prices from the published pricing table. Real quote
        is sent within 24 hours of the free snapshot &mdash; no calls required.
      </p>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href="/catalog-snapshot/"
          data-cta="catalog_snapshot__v2_calculator"
          data-cta-location="mid_body"
          className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
        >
          Get exact quote &mdash; free snapshot
        </Link>
        <p className="text-sm text-ink-500">
          Pricing matches the{' '}
          <Link
            href="/services/catalog-ai/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Catalog AI page
          </Link>{' '}
          exactly &mdash; this is just an interactive view.
        </p>
      </div>
    </SectionRail>
  )
}

function TierCard({
  tierKey,
  name,
  label,
  price,
  summary,
  featured = false,
  disabledReason,
}: {
  tierKey: TierKey
  name: string
  label: string
  price: TierPrice | null
  summary: string
  featured?: boolean
  disabledReason?: string
}) {
  const isDisabled = !price && Boolean(disabledReason)

  return (
    <div
      className={cn(
        'relative flex flex-col border bg-surface',
        featured
          ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
          : 'border-rule',
        isDisabled && 'opacity-60',
      )}
    >
      <div className="h-1.5 w-full bg-service-catalog-500" aria-hidden />

      {featured && (
        <span className="absolute -top-3 left-5 inline-flex items-center rounded-[3px] bg-service-catalog-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          Most common
        </span>
      )}

      <div className="border-b border-rule px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {label}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
          {name}
        </h3>
      </div>

      <div className="flex-1 px-5 py-5">
        {isDisabled ? (
          <p className="text-sm text-ink-500">{disabledReason}</p>
        ) : price ? (
          <>
            {price.cadence === 'per-sku' ? (
              <>
                <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                  {USD.format(Math.round(price.initial))}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                  Initial project &middot; ${price.rate.toFixed(2)} / SKU
                </p>
                <p className="mt-3 text-sm text-ink-700">
                  + ~{USD.format(Math.round(price.monthly))} / mo ongoing
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                  {USD.format(price.monthly)}
                  <span className="ml-1 text-sm font-medium text-ink-500">
                    / mo
                  </span>
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                  Monthly retainer &middot; 6-mo minimum
                </p>
                <p className="mt-3 text-sm text-ink-700">
                  + {USD.format(Math.round(price.initial))} initial build
                </p>
              </>
            )}
            <p className="mt-4 border-t border-rule pt-4 text-sm leading-relaxed text-ink-700">
              {summary}
            </p>
          </>
        ) : null}
      </div>

      <div className="border-t border-rule px-5 py-3">
        {isDisabled ? (
          <span className="inline-flex w-full items-center justify-center rounded-[4px] border border-rule px-4 py-2 text-sm font-semibold text-ink-400">
            Not available at this size
          </span>
        ) : (
          <Link
            href={`/catalog-snapshot/?tier=${tierKey}`}
            data-cta={`calculator_${tierKey}__v2_calculator`}
            data-cta-location="mid_body"
            className={cn(
              'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-4 py-2 text-sm font-semibold transition-colors duration-200',
              featured
                ? 'bg-ink-900 text-white hover:bg-brand-600'
                : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
            )}
          >
            Scope this <span aria-hidden>&rarr;</span>
          </Link>
        )}
      </div>
    </div>
  )
}
