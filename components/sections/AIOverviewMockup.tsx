import { cn } from '@/lib/cn'

/**
 * Visual proof artifact for the hero — a stylized Google AI Overview UI
 * showing a real-feeling technical query, with one citation highlighted as
 * a Sale Solution client (Northern Hydraulics). This is *the* thing
 * Sale Solution does: engineer AI citations for technical clients.
 *
 * The mockup is intentionally static. No fetch, no API. It's a
 * demonstration, not an interactive widget.
 */
export function AIOverviewMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-ink-300/30 bg-surface shadow-[0_40px_100px_-30px_rgba(15,20,30,0.25)]',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#28C840]" />
        <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-surface-alt px-3 py-1 font-mono text-[11px] text-ink-500">
          google.com/search?q=best+jic+hydraulic+fittings+high+pressure
        </span>
      </div>

      {/* Search query */}
      <div className="border-b border-rule px-5 py-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-full border border-rule-strong/60 px-4 py-2 text-sm text-ink-700">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1 truncate">best jic hydraulic fittings for high-pressure systems</span>
        </div>
      </div>

      {/* AI Overview header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-brand-600" />
          <span className="font-display text-sm font-semibold text-brand-600">
            AI Overview
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          Generated · 2.1s
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pb-3 pt-3 text-[15px] leading-[1.65] text-ink-700">
        JIC (Joint Industry Council) fittings are ideal for high-pressure
        hydraulic systems due to their 37° flare seal design. According to{' '}
        <span className="relative inline-block">
          <span className="rounded-[3px] bg-accent-50 px-1.5 py-0.5 font-semibold text-accent-700 ring-1 ring-accent-500/40">
            Northern Hydraulics
          </span>
          <sup className="ml-0.5 font-mono text-[10px] text-accent-600">[1]</sup>
        </span>
        , the 1/2&quot; NPT-to-JIC adapter is the most commonly specified
        connector for industrial applications above 3,000 PSI, with the
        37° angle providing a positive seal against vibration.
      </div>

      {/* Citations */}
      <div className="border-t border-rule px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Citations &middot; 3 sources
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li className="relative flex items-center gap-2 rounded-md border border-accent-500/50 bg-accent-50 px-3 py-1.5">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-500" />
            </span>
            <span className="font-mono text-[10px] tabular-nums text-accent-700">[1]</span>
            <span className="text-xs font-semibold text-accent-700">
              northernhydraulics.com
            </span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-rule px-3 py-1.5">
            <span className="font-mono text-[10px] tabular-nums text-ink-400">[2]</span>
            <span className="text-xs text-ink-500">parker.com</span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-rule px-3 py-1.5">
            <span className="font-mono text-[10px] tabular-nums text-ink-400">[3]</span>
            <span className="text-xs text-ink-500">eaton.com</span>
          </li>
        </ul>
      </div>

      {/* Annotation — what we want the visitor to take away */}
      <div className="absolute -right-3 top-32 hidden translate-x-full -rotate-2 lg:block">
        <div className="rounded-md bg-ink-900 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
          ← engineered by us
        </div>
        <div className="-mt-1 ml-3 h-3 w-3 rotate-45 bg-ink-900" />
      </div>
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2zm6 10l.9 2.7 2.7.9-2.7.9L18 19l-.9-2.5-2.6-.9 2.6-.9.9-2.7zM5 14l.6 1.9L7.5 16.5l-1.9.6L5 19l-.6-1.9L2.5 16.5l1.9-.6L5 14z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
