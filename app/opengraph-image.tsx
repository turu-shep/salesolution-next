import { ImageResponse } from 'next/og'

export const alt = 'Sale Solution — AI-engineered search for industrial e-commerce'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Default Open Graph image for the site — served at /opengraph-image.
 * Next.js auto-wires this into metadata for every route that doesn't override
 * `openGraph.images`. Pages can still set their own (blog posts/guides use
 * Sanity-stored cover images).
 */
export default function OGImage() {
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
          padding: '72px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top: mono eyebrow */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9ca3af',
          }}
        >
          salesolution.net
        </div>

        {/* Middle: brand mark + headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Wordmark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 108,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            sale
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#2652ef',
                margin: '0 6px',
                transform: 'translateY(24px)',
              }}
            />
            solution
            <div
              style={{
                fontSize: 36,
                color: '#f97316',
                fontWeight: 700,
                fontFamily: 'monospace',
                marginLeft: 6,
                transform: 'translateY(-44px)',
              }}
            >
              [1]
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              maxWidth: 880,
              color: '#d1d5db',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            AI-engineered search for industrial e-commerce.
          </div>
        </div>

        {/* Bottom: accent rule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#9ca3af',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 36, height: 2, background: '#f97316' }} />
          Hydraulics · MRO · Technical distribution
        </div>
      </div>
    ),
    { ...size },
  )
}
