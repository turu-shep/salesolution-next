import { Fragment } from 'react'

/**
 * Renders a metric value string, tinting any directional operator (→) in the
 * accent color. A "0.31 → 0.02" ratio reads as a change, so the arrow is the
 * prefix-equivalent of a "+" or "×" — keeping the "accent = the symbol of
 * change" rule while stopping prefix-less metrics from looking dead.
 */
export function MetricValue({ value }: { value?: string }) {
  // A draft/preview document can carry a metric object whose `value` was never
  // filled (Sanity does not block saving on required-field validation), which
  // would throw on `.includes` below. Render nothing rather than crash the page.
  if (!value) return null
  if (!value.includes('→')) return <>{value}</>
  const parts = value.split('→')
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-accent-500">→</span>}
          {part}
        </Fragment>
      ))}
    </>
  )
}
