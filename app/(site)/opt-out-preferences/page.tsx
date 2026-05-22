import type { Metadata } from 'next'

import { CookieConsentForm } from '@/components/sections/preferences/CookieConsentForm'
import { PreferenceGroup } from '@/components/sections/preferences/PreferenceGroup'
import { PreferencesHeader } from '@/components/sections/preferences/PreferencesHeader'
import { PreferencesShell } from '@/components/sections/preferences/PreferencesShell'

export const metadata: Metadata = {
  title: 'Opt-out preferences',
  description:
    'Manage cookies, tracking, and analytics consent on salesolution.net.',
  alternates: {
    canonical: 'https://salesolution.net/opt-out-preferences/',
  },
  robots: { index: false, follow: true },
}

/**
 * Cookie + privacy opt-out hub.
 *
 * The Cookie consent group is a live control surface — it reads/writes the
 * same localStorage key as ConsentBanner and emits the same gtag consent
 * signals. The other two groups (CCPA, marketing) are mailto-driven until
 * a self-serve flow exists.
 */
export default function OptOutPreferencesPage() {
  return (
    <PreferencesShell>
      <PreferencesHeader
        eyebrow="Privacy / Opt-out"
        title="Opt-out preferences"
        intro="Update what we and our partners are allowed to do with the data your visits generate. Functional cookies stay on so the site keeps working — everything else is your call."
      />

      <PreferenceGroup
        eyebrow="01 / Cookie consent"
        title="Choose what we measure"
        kicker={
          <p>
            Your selection is stored locally on this device and applied
            immediately. It overrides any earlier choice you made in the
            cookie banner.
          </p>
        }
      >
        <CookieConsentForm />
      </PreferenceGroup>

      <PreferenceGroup
        eyebrow="02 / CCPA"
        title="Do not sell or share my personal information"
        kicker={
          <>
            <p>
              California residents can ask us not to sell or share personal
              information. We respond within 15 business days.
            </p>
            <p className="mt-4">
              Email{' '}
              <a
                href="mailto:privacy@salesolution.net?subject=CCPA%20opt-out"
                className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
              >
                privacy@salesolution.net
              </a>{' '}
              with the subject line &ldquo;CCPA opt-out&rdquo;, or use the
              contact form and we&rsquo;ll route it from there.
            </p>
          </>
        }
      >
        <></>
      </PreferenceGroup>

      <PreferenceGroup
        eyebrow="03 / Marketing"
        title="Withdraw marketing consent"
        kicker={
          <>
            <p>
              To stop receiving marketing emails, use the unsubscribe link at
              the bottom of any of our emails or email{' '}
              <a
                href="mailto:unsubscribe@salesolution.net"
                className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
              >
                unsubscribe@salesolution.net
              </a>
              . Transactional messages tied to active engagements continue
              regardless.
            </p>
            <p className="mt-4">
              Fine-grained list controls live on the{' '}
              <a
                href="/communication-preferences/"
                className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
              >
                communication preferences
              </a>{' '}
              page.
            </p>
          </>
        }
      >
        <></>
      </PreferenceGroup>
    </PreferencesShell>
  )
}
