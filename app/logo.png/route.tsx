import { ImageResponse } from 'next/og'

export const runtime = 'edge'

/**
 * Serves /logo.png — a 512×512 PNG of the brand wordmark on a dark plate.
 * Used by JSON-LD (Organization + LocalBusiness schemas) per Google's
 * recommendation that logos be at least 112×112 and crawlable as an image.
 *
 * Generated at request time via ImageResponse — no static asset to maintain.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#050c23',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 96,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.04em',
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
            margin: '0 4px',
            transform: 'translateY(20px)',
          }}
        />
        solution
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 110,
            fontSize: 36,
            color: '#f97316',
            fontWeight: 700,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          [1]
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
