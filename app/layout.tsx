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
        {/* Consent Mode v2 default-deny — must execute BEFORE any tracking tag.
            next/script `beforeInteractive` is always injected into <head> by
            Next regardless of where it's placed, so it lives in <body> here. */}
        <ConsentDefault />
        {/* Tracking — each component self-gates on its env var. */}
        <Analytics />
        <MetaPixel />
        <HubSpotTracking />

        {/* GA4 event dispatchers — fire client-side navigation page_view,
            outbound-link clicks, and primary-CTA clicks (anything carrying
            a `data-cta` attribute). All three consent-gate inside track(). */}
        <RouteChangeTracker />
        <OutboundLinkTracker />
        <CTAClickTracker />

        {children}

        {/* Consent banner — default-deny stays in force until visitor decides. */}
        <ConsentBanner />

        {/* Vercel-first-party telemetry. Cookie-free; safe under default-deny.
            Enable / disable per-project in Vercel → Project → Analytics. */}
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
