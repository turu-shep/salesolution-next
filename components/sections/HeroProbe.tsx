'use client'

import Link from 'next/link'
import { useState } from 'react'

import { cn } from '@/lib/cn'

import { AIOverviewMockup } from './AIOverviewMockup'
import { LogoMarquee } from './LogoMarquee'

/**
 * Home hero — v4 (cross-vertical front door).
 *
 * - No §0X rail. The section announces itself with the H1.
 * - Universal promise headline ("win the customers you already pay for"); the
 *   subhead names both leaks (discovery + response) and the CTAs fork into the
 *   two funnels: industrial → /industries/industrial-distribution/, local-service
 *   → /revenue-engine/. Do not merge the funnels.
 * - The AI-answer mockup + probe are the discovery-side proof (any site can be
 *   scored, but the framing leans GEO). Probe is wired to /api/probe/ — see
 *   app/api/probe/route.ts.
 */

type ProbeState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'result'; scores: ProbeResult }
  | { kind: 'error'; message: string }

type ProbeResult = {
  schema: number
  readable: number
  authority: number
  overall: number
}

export function HeroProbe() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<ProbeState>({ kind: 'idle' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const hasScheme = /^https?:\/\//i.test(trimmed)
    const fullUrl = hasScheme ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/probe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      })
      if (!res.ok) {
        let message = 'Could not reach that URL.'
        try {
          const body = (await res.json()) as { error?: string }
          if (typeof body?.error === 'string' && body.error.length > 0) {
            message = body.error
          }
        } catch {
          /* keep default */
        }
        setState({ kind: 'error', message })
        return
      }
      const scores = (await res.json()) as ProbeResult
      setState({ kind: 'result', scores })
    } catch {
      setState({ kind: 'error', message: 'Could not reach that URL.' })
    }
  }

  return (
    <>
      {/* Hero — split: the message in a column it fills (a short headline
          stranded in a full-width band reads as small), the AI answer (our
          proof) beside it and on the first screen. */}
      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-20">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-900 sm:text-5xl lg:text-[4.25rem]">
              <span className="block">Win the customers</span>
              <span className="block">you already pay for.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
              You pay to get found and to make the phone ring. Then you lose them
              in the gap &mdash; buyers get their answer from AI before they reach
              you, and the ones who do reach you wait too long for a reply. We
              close both, without more ad spend.
            </p>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Which are you?
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Link
                  href="/industries/industrial-distribution/"
                  data-cta="lane-industrial__hero"
                  data-cta-location="hero"
                  className="inline-flex items-center gap-1.5 rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
                >
                  Industrial &amp; technical B2B
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/revenue-engine/"
                  data-cta="lane-local-service__hero"
                  data-cta-location="hero"
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-rule-strong bg-surface px-6 py-3.5 text-base font-semibold text-ink-900 transition-colors duration-200 hover:border-ink-900"
                >
                  Home services &amp; dental
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* The proof, beside the message — min-w-0 stops the long-URL chrome
              from blowing out the grid track on mobile. */}
          <div className="min-w-0 lg:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                What it looks like when we&rsquo;ve done the work
              </p>
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 sm:block">
                Real query · Real citation · Real client
              </p>
            </div>
            <AIOverviewMockup />
          </div>
        </div>
      </section>

      {/* Try it on your own page — the interactive probe earns its own moment
          instead of being squeezed beside the mockup. */}
      <section data-section-tone="light" className="relative border-t border-rule bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Try it on your own page
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              Score a page the way AI reads it.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-700">
              Paste a product or category URL. In about two seconds you&rsquo;ll
              see how ready it is to be cited &mdash; schema, AI-readability, and
              authority &mdash; with no email required.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="relative border border-ink-300/30 bg-surface shadow-[0_30px_80px_-30px_rgba(15,20,30,0.20)]">
              <div className="flex items-center justify-between border-b border-rule px-5 py-4">
                <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                  </span>
                  AI-Readiness Probe
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  live
                </span>
              </div>

              <form onSubmit={onSubmit} className="p-5">
                <label
                  htmlFor="probe-url"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500"
                >
                  Your product or category URL
                </label>
                <div className="mt-2 flex items-stretch border border-rule-strong focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <span className="flex items-center border-r border-rule px-3 font-mono text-xs text-ink-400">
                    https://
                  </span>
                  <input
                    id="probe-url"
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="yourdomain.com/category"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={state.kind === 'loading'}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.kind === 'loading' || !url.trim()}
                  className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {state.kind === 'loading' ? 'Scoring…' : 'Score this page →'}
                </button>
              </form>

              <ProbeResultPanel state={state} />

              <div className="border-t border-rule px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Deterministic · No data stored
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated marquee logo wall — closes out the hero, opens the page */}
      <LogoMarquee />
    </>
  )
}

function ProbeResultPanel({ state }: { state: ProbeState }) {
  if (state.kind === 'idle') {
    return (
      <div className="space-y-3 border-t border-rule bg-surface-alt/60 px-5 py-5">
        <SkeletonRow label="Schema" />
        <SkeletonRow label="AI-readable" />
        <SkeletonRow label="E-E-A-T" />
        <p className="pt-1 font-mono text-[11px] text-ink-400">
          Awaiting URL · Results in ~2s
        </p>
      </div>
    )
  }

  if (state.kind === 'loading') {
    return (
      <div className="space-y-3 border-t border-rule px-5 py-5">
        <ScoreRow label="Schema" value={null} />
        <ScoreRow label="AI-readable" value={null} />
        <ScoreRow label="E-E-A-T" value={null} />
        <p className="pt-1 font-mono text-[11px] text-ink-500">
          Fetching · Parsing JSON-LD · Running heuristics…
        </p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="border-t border-rule px-5 py-5">
        <p className="font-mono text-xs text-data-down">{state.message}</p>
      </div>
    )
  }

  const { scores } = state
  const tier =
    scores.overall >= 70 ? 'clear' : scores.overall >= 40 ? 'gaps' : 'risk'
  const tierStyle = {
    clear: { pill: 'bg-data-up/10 text-data-up ring-data-up/30', label: 'On track' },
    gaps:  { pill: 'bg-accent-50 text-accent-700 ring-accent-500/30', label: 'Gaps' },
    risk:  { pill: 'bg-danger-50 text-data-down ring-data-down/30', label: 'At risk' },
  }[tier]

  return (
    <div className="border-t border-rule px-5 py-5">
      <div className="space-y-4">
        <ScoreRow label="Schema" value={scores.schema} />
        <ScoreRow label="AI-readable" value={scores.readable} />
        <ScoreRow label="E-E-A-T" value={scores.authority} />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Overall
        </span>
        <span className="flex items-center gap-3">
          <span className="font-display text-4xl font-semibold tabular-nums leading-none text-ink-900">
            {scores.overall}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
              tierStyle.pill,
            )}
          >
            {tierStyle.label}
          </span>
        </span>
      </div>
      <Link
        href="/unlock-growth-audit/"
        data-cta="audit__hero_probe_result"
        data-cta-location="hero"
        className="mt-4 inline-flex w-full items-center justify-center border border-ink-900/10 bg-mark px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-900 transition-colors duration-200 hover:bg-ink-900 hover:text-white"
      >
        Get the full audit →
      </Link>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number | null }) {
  const pct = value ?? 0
  const tone =
    value === null
      ? 'bg-ink-300/30'
      : pct >= 70
        ? 'bg-data-up'
        : pct >= 50
          ? 'bg-brand-600'
          : 'bg-data-down'

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden bg-surface-alt">
        <div
          className={cn(
            'h-full transition-[width] duration-700 ease-out',
            tone,
            value === null && 'animate-pulse',
          )}
          style={{ width: value === null ? '40%' : `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs tabular-nums text-ink-700">
        {value === null ? '—' : pct}
      </span>
    </div>
  )
}

function SkeletonRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </span>
      <div className="h-2.5 flex-1 bg-rule" />
      <span className="w-8 text-right font-mono text-xs text-ink-300">—</span>
    </div>
  )
}
