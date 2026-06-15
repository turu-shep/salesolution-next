import type { CaseStudyChart } from '@/sanity/lib/case-studies'

/**
 * CMS-driven version of the Evidence.tsx LeadChart — same visual idiom
 * (mono figcaption with source line, hairline grid, dashed baseline at the
 * first data point, brand-600 line over an 8% area fill, hover tooltips),
 * generalized to arbitrary point series from the caseStudy `chart` object.
 */
export function MetricPathChart({
  chart,
  className = '',
}: {
  chart: CaseStudyChart
  className?: string
}) {
  const points = chart.points ?? []
  if (points.length < 2) return null

  const values = points.map((p) => p.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)

  // Tick step: a round number that yields 3–5 gridlines across the range.
  const span = Math.max(dataMax - dataMin, 1)
  const rawStep = span / 3
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= 4) ??
    10 * magnitude

  const yMin = chart.yMin ?? Math.floor(dataMin / step) * step
  const yMax = chart.yMax ?? Math.ceil(dataMax / step) * step
  const yTicks: number[] = []
  for (let v = yMin; v <= yMax + step / 1e6; v += step) {
    yTicks.push(Math.round(v * 1e6) / 1e6)
  }

  const W = 560
  const H = 240
  const PAD_L = 44
  const PAD_R = 24
  const PAD_T = 24
  const PAD_B = 36

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const baseline = points[0].value
  const last = points[points.length - 1].value
  const xAt = (i: number) => PAD_L + (i / (points.length - 1)) * plotW
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L ${xAt(points.length - 1).toFixed(1)} ${(H - PAD_B).toFixed(1)} L ${xAt(0).toFixed(1)} ${(H - PAD_B).toFixed(1)} Z`

  return (
    <figure
      className={`border border-rule bg-surface p-5 shadow-[0_24px_60px_-34px_rgba(15,20,30,0.30)] ${className}`}
    >
      <figcaption className="mb-4 font-mono text-[11px] text-ink-500">
        <span className="uppercase tracking-[0.18em]">{chart.title}</span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-400">
          Source: {chart.source}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={`${chart.title}: from ${baseline.toLocaleString()} (${points[0].label}) to ${last.toLocaleString()} (${points[points.length - 1].label}).`}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="var(--color-rule)" strokeWidth="1" />
            <text
              x={PAD_L - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-ink-500)"
            >
              {v.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Baseline marker — the actual first data point, not a round number */}
        <line
          x1={PAD_L}
          y1={yAt(baseline)}
          x2={W - PAD_R}
          y2={yAt(baseline)}
          stroke="var(--color-rule-strong)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        <path d={areaPath} fill="var(--color-brand-600)" fillOpacity="0.08" />
        <path d={linePath} stroke="var(--color-brand-600)" strokeWidth="2" fill="none" />

        {points.map((p, i) => {
          const delta = p.value - baseline
          const sign = delta >= 0 ? '+' : ''
          return (
            <g key={p._key ?? i}>
              <circle
                cx={xAt(i)}
                cy={yAt(p.value)}
                r={i === points.length - 1 ? 5 : 2.5}
                fill={i === points.length - 1 ? 'var(--color-accent-500)' : 'var(--color-brand-600)'}
              />
              <circle cx={xAt(i)} cy={yAt(p.value)} r="12" fill="transparent" className="cursor-help">
                <title>{`${p.label} · ${p.value.toLocaleString()} · ${sign}${delta.toLocaleString()} from baseline`}</title>
              </circle>
            </g>
          )
        })}

        {points.map((p, i) => (
          <text
            key={p._key ?? i}
            x={xAt(i)}
            y={H - 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill="var(--color-ink-400)"
          >
            {p.label}
          </text>
        ))}

        <text
          x={xAt(points.length - 1)}
          y={yAt(last) - 12}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="13"
          fontWeight="600"
          fill="var(--color-accent-500)"
        >
          {last.toLocaleString()}
        </text>
      </svg>
    </figure>
  )
}
