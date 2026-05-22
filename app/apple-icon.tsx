import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.04em',
          position: 'relative',
        }}
      >
        s
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#2652ef',
            margin: '0 4px',
            transform: 'translateY(12px)',
          }}
        />
        s
        <div
          style={{
            position: 'absolute',
            top: 22,
            right: 28,
            fontSize: 40,
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
    { ...size },
  )
}
