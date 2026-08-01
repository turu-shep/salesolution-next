'use client'

import Link from 'next/link'
import { useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * The AI read — the gated layer of the AI-readiness report.
 *
 * States: intro → loading → result, with three gate detours: email form
 * (free run spent), exhausted (all runs spent → audit door), rate-limited /
 * unavailable. The server enforces everything; this component just renders
 * what /api/probe/ai and /api/probe/unlock say.
 */

type AiRead = {
  verdict: string
  engineSummary: string
  citeQuery: string
  fixes: { title: string; why: string }[]
}

type PanelState =
  | { kind: 'intro' }
  | { kind: 'loading' }
  | { kind: 'result'; read: AiRead; runsLeft: number }
  | { kind: 'email' }
  | { kind: 'unlocking' }
  | { kind: 'exhausted' }
  | { kind: 'limited' }
  | { kind: 'unavailable' }
  | { kind: 'unreachable' }

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cta="probe_ai_retry__probe_report"
      data-cta-location="probe-report"
      className="mt-4 inline-flex cursor-pointer items-center border border-rule-strong bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700 transition-colors duration-200 hover:border-ink-900 hover:text-ink-900"
    >
      Try again →
    </button>
  )
}

export function AIReadPanel({ pageUrl, auditHref }: { pageUrl: string; auditHref: string }) {
  const [state, setState] = useState<PanelState>({ kind: 'intro' })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  async function runRead() {
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/probe/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pageUrl }),
      })
      if (res.ok) {
        const data = (await res.json()) as { read: AiRead; runsLeft: number }
        setState({ kind: 'result', read: data.read, runsLeft: data.runsLeft })
        return
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (body.error === 'email_required') setState({ kind: 'email' })
      else if (body.error === 'exhausted') setState({ kind: 'exhausted' })
      else if (res.status === 429) setState({ kind: 'limited' })
      else if (res.status === 502) setState({ kind: 'unreachable' })
      else setState({ kind: 'unavailable' })
    } catch {
      setState({ kind: 'unavailable' })
    }
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(null)
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(trimmed)) {
      setEmailError('That email doesn’t look complete.')
      return
    }
    setState({ kind: 'unlocking' })
    try {
      const res = await fetch('/api/probe/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, scoredUrl: pageUrl }),
      })
      if (!res.ok) {
        setState({ kind: 'email' })
        setEmailError(
          res.status === 429
            ? 'Too many tries from your network. Give it an hour.'
            : 'That didn’t go through. Check the email and try again.',
        )
        return
      }
      await runRead()
    } catch {
      setState({ kind: 'email' })
      setEmailError('That didn’t go through. Check the email and try again.')
    }
  }

  return (
    <div className="border border-ink-300/30 bg-surface">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-600 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
          The AI read
        </span>
        {state.kind === 'result' && state.runsLeft > 0 ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            {state.runsLeft} run{state.runsLeft === 1 ? '' : 's'} left
          </span>
        ) : null}
      </div>

      <div
        className="px-5 py-5"
        aria-live="polite"
        aria-busy={state.kind === 'loading' || state.kind === 'unlocking'}
      >
        {state.kind === 'intro' && (
          <>
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">
              The scores above measure the page. This reads it &mdash; Claude
              takes the same crawl an answer engine gets and reports back: what
              the engine thinks you are, the query you&rsquo;re closest to
              winning, and the three fixes that move it. First run is free.
            </p>
            <button
              type="button"
              onClick={runRead}
              data-cta="probe_ai_run__probe_report"
              data-cta-location="probe-report"
              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-800"
            >
              Run the AI read &rarr;
            </button>
          </>
        )}

        {(state.kind === 'loading' || state.kind === 'unlocking') && (
          <p className="font-mono text-xs text-ink-500">
            Fetching the page &middot; Reading it like an engine &middot; Writing the verdict&hellip;
          </p>
        )}

        {state.kind === 'result' && (
          <div className="space-y-5">
            <p className="border-l-2 border-ink-900 pl-4 font-display text-lg font-semibold leading-snug text-ink-900">
              {state.read.verdict}
            </p>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                What the engine sees
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-800">{state.read.engineSummary}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                The query you&rsquo;re closest to winning
              </p>
              <p className="mt-1.5 text-sm font-semibold text-ink-900">
                &ldquo;{state.read.citeQuery}&rdquo;
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Move the needle
              </p>
              <ol className="mt-2 space-y-3">
                {state.read.fixes.map((f, i) => (
                  <li key={f.title} className="flex gap-3">
                    <span className="font-mono text-xs text-ink-400">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{f.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-700">{f.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {state.kind === 'email' && (
          <form onSubmit={unlock} noValidate>
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">
              That was the free run. Leave an email and you get five more reads
              &mdash; enough to check your money pages and a competitor&rsquo;s.
            </p>
            <div className="mt-4 flex max-w-md items-stretch border border-rule-strong focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Work email"
                aria-invalid={emailError ? true : undefined}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
              />
              <button
                type="submit"
                data-cta="probe_ai_unlock__probe_report"
                data-cta-location="probe-report"
                className="cursor-pointer bg-ink-900 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-800"
              >
                Unlock
              </button>
            </div>
            {emailError ? <p className="mt-2 font-mono text-xs text-data-down">{emailError}</p> : null}
            <p className="mt-3 max-w-md text-xs leading-relaxed text-ink-500">
              Your reads land by email &mdash; plus the occasional note worth
              reading. One click to unsubscribe.
            </p>
          </form>
        )}

        {state.kind === 'exhausted' && (
          <>
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">
              You&rsquo;ve used all six reads. Past this point the useful next
              step isn&rsquo;t another scan &mdash; it&rsquo;s a person going
              through the site and naming the one constraint. That&rsquo;s the
              audit, and it&rsquo;s free.
            </p>
            <Link
              href={auditHref}
              data-cta="audit__probe_ai_exhausted"
              data-cta-location="probe-report"
              className="mt-4 inline-flex items-center justify-center rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-800"
            >
              Get the full audit &rarr;
            </Link>
          </>
        )}

        {state.kind === 'limited' && (
          <p className={cn('max-w-xl text-sm leading-relaxed text-ink-700')}>
            Too many reads from your network in the last hour. The scores above
            stay live &mdash; come back for the read in a bit.
          </p>
        )}

        {state.kind === 'unavailable' && (
          <>
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">
              The AI read is offline right now. The scores above are live; try
              the read again in a few minutes.
            </p>
            <RetryButton onClick={runRead} />
          </>
        )}

        {state.kind === 'unreachable' && (
          <>
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">
              The site stopped answering mid-read. Give it a moment, then try
              again.
            </p>
            <RetryButton onClick={runRead} />
          </>
        )}
      </div>
    </div>
  )
}
