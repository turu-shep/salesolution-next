import Script from 'next/script'

/**
 * Consent-Mode-aware analytics loader. Three paths:
 *
 *   1. If NEXT_PUBLIC_GTM_ID is set     → load Google Tag Manager. GTM
 *                                          container should host GA4 +
 *                                          Google Ads + Meta Pixel inside.
 *   2. Else if NEXT_PUBLIC_GA4_ID is set → load GA4 directly via gtag.
 *   3. Else                              → render nothing (dev mode).
 *
 * Google Ads conversion tag (NEXT_PUBLIC_GOOGLE_ADS_ID) is loaded in path 2
 * since GTM would otherwise own it.
 *
 * The default-deny consent state is set BEFORE any tracking script via
 * `<ConsentDefault />` higher in the tree (see app/layout.tsx).
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

  if (gtmId) {
    return (
      <>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="gtm-noscript"
          />
        </noscript>
      </>
    )
  }

  if (!ga4Id && !adsId) return null

  // Standalone gtag — covers GA4 measurement and (optionally) Google Ads conversion.
  const idsToConfig = [ga4Id, adsId].filter(Boolean) as string[]
  // The src for `gtag/js` only needs ONE id; subsequent gtag('config', …) calls cover others.
  const src = `https://www.googletagmanager.com/gtag/js?id=${idsToConfig[0]}`

  return (
    <>
      <Script src={src} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          ${idsToConfig.map((id) => `gtag('config', '${id}', { send_page_view: true });`).join('\n')}
        `}
      </Script>
    </>
  )
}

/**
 * Inline `<script>` that runs BEFORE any tracking tag to set Consent Mode v2
 * defaults. Must be rendered as high in the document as possible — we use
 * `strategy="beforeInteractive"` so Next.js injects it into the document head.
 */
export function ConsentDefault() {
  return (
    <Script id="consent-default" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'granted',
          'personalization_storage': 'denied',
          'security_storage': 'granted',
          'wait_for_update': 500
        });
      `}
    </Script>
  )
}
