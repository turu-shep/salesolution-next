'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'
import { useTrackOnView } from '@/lib/use-track-on-view'

type Props = {
  url: string
  /** Inline widget min-height in px. Calendly needs ~700px for the calendar grid. */
  minHeight?: number
  className?: string
}

/**
 * Estimated value for a Calendly-sourced strategy-call booking. ~1.2× the
 * mid-tier audit value per the lead-value model in docs/strategy/ga4.md §3.2.
 */
const AUDIT_VALUE_FOR_BOOKING = 240

/**
 * Inline Calendly widget. Loads Calendly's external widget script once
 * (`afterInteractive`), then renders a div Calendly auto-fills with the
 * scheduling iframe.
 *
 * GA4 bridge (see docs/strategy/ga4.md §3.4 and §5.5):
 *   - `calendly_widget_view` fires once when the widget enters the viewport
 *   - `calendly_booking_started` fires on Calendly's `date_and_time_selected`
 *   - `calendly_booking_completed` + `book_growth_call` fire on `event_scheduled`
 *
 * Pass `url` directly or read from env: `process.env.NEXT_PUBLIC_CALENDLY_URL`.
 * If `url` is empty/undefined, render nothing (caller decides the fallback).
 */
export function CalendlyEmbed({ url, minHeight = 700, className = '' }: Props) {
  // Hooks must run unconditionally — the `if (!url) return null` early-return
  // happens AFTER all hooks below.
  const wrapperRef = useRef<HTMLDivElement>(null)

  useTrackOnView(wrapperRef, () => {
    track({
      name: 'calendly_widget_view',
      params: { page_location: window.location.href, calendly_url: url },
    })
  })

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Belt-and-suspenders: gate on BOTH origin and event-namespace. Calendly
      // uses multiple subdomains so we accept anything ending in calendly.com.
      // Without this, a malicious iframe on the page could postMessage a
      // synthetic `{ event: 'calendly.event_scheduled' }` and forge a booking.
      if (!e.origin || !e.origin.endsWith('calendly.com')) return
      if (typeof e.data !== 'object' || e.data === null) return
      if (!('event' in e.data) || typeof e.data.event !== 'string') return
      if (!e.data.event.startsWith('calendly.')) return

      const eventUri = (e.data as { payload?: { event?: { uri?: string } } })
        ?.payload?.event?.uri

      switch (e.data.event) {
        case 'calendly.date_and_time_selected':
          track({
            name: 'calendly_booking_started',
            params: {
              page_location: window.location.href,
              calendly_url: url,
            },
          })
          break
        case 'calendly.event_scheduled':
          track({
            name: 'calendly_booking_completed',
            params: {
              page_location: window.location.href,
              calendly_url: url,
              event_uri: eventUri,
              value: AUDIT_VALUE_FOR_BOOKING,
              currency: 'USD',
            },
          })
          track({
            name: 'book_growth_call',
            params: {
              value: AUDIT_VALUE_FOR_BOOKING,
              currency: 'USD',
              booking_source: 'calendly',
            },
          })
          break
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [url])

  if (!url) return null

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <div
        ref={wrapperRef}
        className={`calendly-inline-widget ${className}`}
        data-url={url}
        style={{ minWidth: '320px', height: `${minHeight}px` }}
      />
    </>
  )
}
