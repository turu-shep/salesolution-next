import { cn } from '@/lib/cn'

/**
 * Inline confirmation panel — what a form renders in place of itself once the
 * submission is in.
 *
 * F-02: several doors redirected to /unlock-growth-audit/thank-you/, which told
 * contact and call-request submitters their "audit is being prepared". Nothing
 * of the kind was being prepared. Confirming in place keeps the promise tied to
 * the door the prospect actually walked through, and keeps that copy sitting
 * next to the form that made it.
 *
 * Same box as the form it replaces (rounded surface + ring) so the section
 * doesn't reflow on success. Pass the form's own `className` through whenever
 * the form overrides its container.
 */
export function FormSuccess({
  heading,
  body,
  footnote,
  className,
}: {
  heading: string
  body: React.ReactNode
  /** Escape hatch under the confirmation — phone, mailto, whatever fits. */
  footnote?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-xl bg-surface p-6 shadow-md ring-1 ring-ink-300/15 sm:p-8',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">
        {heading}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{body}</p>
      {footnote ? <p className="mt-4 text-sm text-ink-500">{footnote}</p> : null}
    </div>
  )
}
