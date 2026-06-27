import { ImageResponse } from 'next/og'

export const alt = 'Sale Solution Revenue Engine — answer every call, book the job, prove the revenue'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Open Graph image for the Revenue Engine cluster (/revenue-engine/*).
 * Next.js cascades this to the vertical pages (home-services, dentists,
 * medical, local-retail) unless they override it — so share + AI-preview
 * cards under a local-service page read local, not industrial.
 */
export default function RevenueEngineOGImage() {
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
          salesolution.net/revenue-engine
        </div>

        {/* Middle: wordmark + headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            sale
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#2652ef',
                margin: '0 6px',
                transform: 'translateY(22px)',
              }}
            />
            solution
          </div>

          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              maxWidth: 920,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
            }}
          >
            Answer every call. Book the job. Prove the revenue.
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
          Revenue Engine · Home services · Dental · Medical
        </div>
      </div>
    ),
    { ...size },
  )
}
