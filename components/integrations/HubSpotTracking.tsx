import Script from 'next/script'

/**
 * HubSpot analytics tracking script. Only renders when
 * NEXT_PUBLIC_HUBSPOT_PORTAL_ID is set.
 *
 * HubSpot's tracker respects browser do-not-track headers but not Consent
 * Mode v2 natively. The ConsentBanner sets a `localStorage.ss_consent`
 * entry which HubSpot's `_hsq.push(['doNotTrack', {...}])` consumes — see
 * `lib/consent.ts` for the bridge.
 */
export function HubSpotTracking() {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
  if (!portalId) return null

  return (
    <Script
      id="hs-tracking"
      strategy="afterInteractive"
      src={`https://js.hs-scripts.com/${portalId}.js`}
    />
  )
}
