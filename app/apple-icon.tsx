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
          borderRadius: 36,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          padding: '0 24px 22px 24px',
          position: 'relative',
        }}
      >
        <span
          style={{
            color: '#fbfbfa',
            fontSize: 156,
            fontWeight: 900,
            letterSpacing: '-0.08em',
            lineHeight: 1,
            fontFamily: 'sans-serif',
          }}
        >
          s
        </span>
        <span
          style={{
            position: 'absolute',
            right: 28,
            bottom: 36,
            width: 34,
            height: 34,
            background: '#f97316',
            display: 'block',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
