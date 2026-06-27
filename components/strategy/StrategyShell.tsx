import Link from 'next/link'

/**
 * Minimal internal shell for the private /strategy area — no public site nav, no
 * footer mega-menu. Rendered by app/strategy/layout.tsx once a request is past
 * the gate (or on localhost). Mirror of components/sales/SalesShell.tsx; the root
 * layout already provides fonts + the <body>.
 */
export function StrategyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/strategy" className="font-mono text-sm font-semibold text-ink-900">
              Strategy
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-400">
              private
            </span>
          </div>
          <form action="/api/strategy/logout" method="post" className="contents">
            <button
              type="submit"
              className="font-mono text-xs text-ink-400 transition-colors hover:text-ink-700"
            >
              Lock
            </button>
          </form>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  )
}
