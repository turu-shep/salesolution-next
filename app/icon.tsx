import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.04em',
          position: 'relative',
        }}
      >
        s
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#2652ef',
            margin: '0 1px',
            transform: 'translateY(2px)',
          }}
        />
        s
        <div
          style={{
            position: 'absolute',
            top: 3,
            right: 4,
            fontSize: 8,
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
