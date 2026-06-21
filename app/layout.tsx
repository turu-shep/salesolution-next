import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { Analytics, ConsentDefault } from '@/components/integrations/Analytics'
import { ConsentBanner } from '@/components/integrations/ConsentBanner'
import { CTAClickTracker } from '@/components/integrations/CTAClickTracker'
import { HubSpotTracking } from '@/components/integrations/HubSpotTracking'
import { MetaPixel } from '@/components/integrations/MetaPixel'
import { OutboundLinkTracker } from '@/components/integrations/OutboundLinkTracker'
import { PublicOnly } from '@/components/integrations/PublicOnly'
import { RouteChangeTracker } from '@/components/integrations/RouteChangeTracker'
import './globals.css'

// Geist — Vercel's open-source family. Sharper and more distinctive than the
// Manrope / Inter pairing every other Tailwind B2B site uses. Variable axis,
// so we get every weight without extra requests.
const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// Google Search Console site-verification token. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
// (the value from GSC's "HTML tag" verification method) to render the meta tag and verify the
// property via tag. Alternatively verify by DNS and leave this unset. See docs/strategy/ga4.md.
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL('https://salesolution.net'),
  title: {
    default: 'Sale Solution',
    template: '%s · Sale Solution',
  },
  description:
    'AI-engineered search for industrial e-commerce. Hydraulics, MRO, and technical distribution.',
  openGraph: {
    type: 'website',
    siteName: 'Sale Solution',
    locale: 'en_US',
    url: 'https://salesolution.net',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ArturShepel',
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (Grammarly, ClickUp, …)
          inject attributes/classes onto <body> before React hydrates, which
          otherwise trips a spurious hydration-mismatch warning. This only
          suppresses warnings for <body>'s own attributes, not its subtree. */}
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-surface text-ink-700 font-sans"
      >
        {/* Dev-only service-worker eviction. A previous PWA app on localhost:3000
            can leave a service worker registered against this origin; it then
            serves that dead app's cached `/_next/static/chunks/*.js` (dev chunk
            names are stable, not hashed) over this site, producing cryptic
            `ReactCurrentDispatcher` / `createContext is not a function` errors
            for files that don't exist here. This inline script runs from the
            freshly-served HTML — before the foreign chunk — so it executes even
            when that chunk is broken. It unregisters any SW + clears caches, then
            reloads once (sessionStorage guard avoids a reload loop). Not emitted
            in production, and localhost-gated, so it never touches a real PWA. */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var h=location.hostname;if(h!=="localhost"&&h!=="127.0.0.1"&&h!=="[::1]")return;if(!("serviceWorker"in navigator))return;navigator.serviceWorker.getRegistrations().then(function(rs){if(!rs.length)return;Promise.all(rs.map(function(r){return r.unregister()})).then(function(){var c=("caches"in self)?caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}):Promise.resolve();c.then(function(){if(!sessionStorage.getItem("__sw_evicted")){sessionStorage.setItem("__sw_evicted","1");location.reload()}})})})})();`,
            }}
          />
        )}
        {/* Consent Mode v2 default-deny — must execute BEFORE any tracking tag.
            next/script `beforeInteractive` is always injected into <head> by
            Next regardless of where it's placed, so it lives in <body> here. */}
        <ConsentDefault />
        {/* Tracking + chat — customer-facing only. Route-gated out of the internal
            /sales workspace (see docs/strategy/sales/07-compliance.md). Each also
            self-gates on its env var. */}
        <PublicOnly>
          <Analytics />
          <MetaPixel />
          <HubSpotTracking />

          {/* GA4 event dispatchers — fire client-side navigation page_view,
              outbound-link clicks, and primary-CTA clicks (anything carrying
              a `data-cta` attribute). All three consent-gate inside track(). */}
          <RouteChangeTracker />
          <OutboundLinkTracker />
          <CTAClickTracker />
        </PublicOnly>

        {children}

        {/* Consent banner — default-deny stays in force until visitor decides.
            Not shown in the internal /sales workspace. */}
        <PublicOnly>
          <ConsentBanner />
        </PublicOnly>

        {/* Vercel-first-party telemetry. Cookie-free; safe under default-deny.
            Enable / disable per-project in Vercel → Project → Analytics. */}
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
