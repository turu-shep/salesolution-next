'use client'

import { useEffect } from 'react'

/**
 * Root error boundary. Only fires when the root layout itself throws, so it
 * replaces <html>/<body> and can't rely on globals.css or the font variables —
 * styles are inlined. Everyday page crashes are handled by app/(site)/error.tsx.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7f7f5',
          color: '#111317',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6b7280',
              margin: 0,
            }}
          >
            500 · Something broke
          </p>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '16px 0 0',
            }}
          >
            Our end, not yours.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: '#374151', margin: '20px 0 0' }}>
            The site hit an unexpected error. Try again, or head back to the homepage.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              marginTop: 28,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#111317',
                color: '#f7f7f5',
                border: 0,
                borderRadius: 12,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* Intentional hard navigation: the root layout has crashed, so the
                router context isn't reliable — a full reload is the safe recovery. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{ fontSize: 14, fontWeight: 600, color: '#111317', alignSelf: 'center' }}
            >
              Back to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
