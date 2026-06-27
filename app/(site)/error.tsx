'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Segment error boundary for the public site. Catches render-time crashes
 * (most likely in an interactive client component — a calculator, a tab) and
 * offers recovery instead of Next's unstyled 500. Mirrors not-found.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaced to the console now; wire to an error tracker here if one is added.
    console.error(error)
  }, [error])

  return (
    <main
      data-section-tone="light"
      className="relative flex min-h-[70vh] flex-col bg-paper"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          500 · Something broke
        </p>

        <h1 className="mt-5 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-7xl">
          <span className="block">Our end, not yours.</span>
          <span className="block text-ink-500">This page hit an error.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-700">
          Try again &mdash; it&rsquo;s often a one-off. If it keeps happening,{' '}
          <Link
            href="/contact-me/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            let us know
          </Link>{' '}
          and we&rsquo;ll fix it.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-brand-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
