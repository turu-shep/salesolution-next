import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Analytics, ConsentDefault } from '@/components/integrations/Analytics'
import { ConsentBanner } from '@/components/integrations/ConsentBanner'
import { HubSpotTracking } from '@/components/integrations/HubSpotTracking'
import { MetaPixel } from '@/components/integrations/MetaPixel'
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
  title: {
    default: 'Sale Solution',
    template: '%s · Sale Solution',
  },
  description:
    'AI-engineered search for industrial e-commerce. Hydraulics, MRO, and technical distribution.',
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
      <head>
        {/* Consent Mode v2 default-deny — must execute BEFORE any tracking tag. */}
        <ConsentDefault />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink-700 font-sans">
        {/* Tracking — each component self-gates on its env var. */}
        <Analytics />
        <MetaPixel />
        <HubSpotTracking />

        {children}

        {/* Consent banner — default-deny stays in force until visitor decides. */}
        <ConsentBanner />
      </body>
    </html>
  )
}
