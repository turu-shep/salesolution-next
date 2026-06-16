import { ImageResponse } from 'next/og'

import { disclosureLabel } from '@/components/sections/case-studies/service-meta'
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '@/sanity/lib/case-studies'

export const alt = 'Case study — Sale Solution'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  try {
    const slugs = await getAllCaseStudySlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

/**
 * Per-study Open Graph card. Echoes the proof band — the headline metric set
 * huge in orange-on-navy — so a case study shared into a buying committee
 * leads with the number, not the generic site card.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug).catch(() => null)

  const metric = study?.keyMetric
  const descriptor = study?.client?.descriptor ?? 'Industrial distribution & technical B2B'
  const label = metric?.label ?? 'Measured results from a real engagement'
  const window = [study?.engagementWindow, study?.durationLabel].filter(Boolean).join(' · ')

  // Scale the metric to its length so range values ("0.31 → 0.02") fit on one
  // line instead of wrapping into the label.
  const mlen =
    (metric?.prefix?.length ?? 0) + (metric?.value?.length ?? 0) + (metric?.unit?.length ?? 0)
  const metricSize = mlen <= 6 ? 210 : mlen <= 9 ? 156 : 120

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#050c23',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* Top: eyebrow + disclosure badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'monospace',
            fontSize: 21,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#9ca3af',
          }}
        >
          <div style={{ display: 'flex' }}>Case study · {descriptor}</div>
          <div
            style={{
              display: 'flex',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 4,
              padding: '8px 14px',
              fontSize: 17,
              letterSpacing: '0.14em',
            }}
          >
            {disclosureLabel(study?.disclosure)}
          </div>
        </div>

        {/* Middle: the metric + label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {metric && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                fontSize: metricSize,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {metric.prefix && <span style={{ color: '#f97316' }}>{metric.prefix}</span>}
              <span>{metric.value}</span>
              {metric.unit && <span style={{ color: '#6b7689' }}>{metric.unit}</span>}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 600,
              maxWidth: 1000,
              color: '#e5e7eb',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </div>
        </div>

        {/* Bottom: wordmark + accent rule with the engagement window */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em' }}>
            sale
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#2652ef', margin: '0 4px', transform: 'translateY(10px)' }} />
            solution
            <div style={{ display: 'flex', fontSize: 16, color: '#f97316', fontFamily: 'monospace', marginLeft: 3, transform: 'translateY(-16px)' }}>
              [1]
            </div>
          </div>
          {window && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#9ca3af',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ width: 32, height: 2, background: '#f97316' }} />
              {window}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  )
}
