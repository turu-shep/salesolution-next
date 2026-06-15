import { Fragment } from 'react'

/**
 * Renders a metric value string, tinting any directional operator (→) in the
 * accent color. A "0.31 → 0.02" ratio reads as a change, so the arrow is the
 * prefix-equivalent of a "+" or "×" — keeping the "accent = the symbol of
 * change" rule while stopping prefix-less metrics from looking dead.
 */
export function MetricValue({ value }: { value: string }) {
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
