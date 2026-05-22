'use client'

import Script from 'next/script'
import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement | string,
        opts: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        },
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

/**
 * Cloudflare Turnstile widget. Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is unset (dev mode). The token is passed to LeadForm via the onToken callback;
 * the form includes it in /api/lead so submit.ts can verify with the secret key.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const stableId = useId()

  useEffect(() => {
    if (!siteKey || !ref.current) return

    const tryRender = () => {
      if (!window.turnstile || !ref.current) return false
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onToken,
        theme: 'light',
      })
      return true
    }

    if (!tryRender()) {
      // Script may not be ready yet — poll briefly.
      const interval = window.setInterval(() => {
        if (tryRender()) window.clearInterval(interval)
      }, 100)
      return () => {
        window.clearInterval(interval)
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
        }
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey, onToken])

  if (!siteKey) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div ref={ref} id={`turnstile-${stableId}`} />
    </>
  )
}
