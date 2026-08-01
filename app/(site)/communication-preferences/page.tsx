import type { Metadata } from 'next'

import { CommPreferencesForm } from '@/components/sections/preferences/CommPreferencesForm'
import { PreferenceGroup } from '@/components/sections/preferences/PreferenceGroup'
import { PreferencesHeader } from '@/components/sections/preferences/PreferencesHeader'
import { PreferencesShell } from '@/components/sections/preferences/PreferencesShell'

export const metadata: Metadata = {
  title: 'Communication preferences',
  description: 'Manage which Sale Solution emails and updates you receive.',
  alternates: {
    canonical: 'https://salesolution.net/communication-preferences/',
  },
  robots: { index: false, follow: true },
}

/**
 * Email-subscription preferences hub.
 *
 * Self-serve list toggles persist locally for reference until the ESP
 * webhook lands; the email-footer / mailto path is still the legally
 * binding opt-out mechanism and the page surfaces that explicitly.
 */
export default function CommunicationPreferencesPage() {
  return (
    <PreferencesShell>
      <PreferencesHeader
        eyebrow="Email / Subscriptions"
        title="Communication preferences"
        intro="One place to choose exactly what lands in your inbox from us. Transactional messages stay on so we can deliver what you asked for."
      />

      <PreferenceGroup
        eyebrow="01 / Lists"
        title="Lists you can be on"
        kicker={
          <p>
            Two newsletter cadences and one transactional channel. Pick any
            combination, then save. Toggles update your local preference;
            the next email footer link confirms the change with the sender.
          </p>
        }
      >
        <CommPreferencesForm />
      </PreferenceGroup>

      <PreferenceGroup
        eyebrow="02 / Changes by email"
        title="Prefer to handle this by email?"
        kicker={
          <>
            <p>
              Click the &ldquo;Manage preferences&rdquo; link in the footer
              of any of our emails &mdash; that goes straight to the sender
              with your address pre-attached.
            </p>
            <p className="mt-4">
              Or write to{' '}
              <a
                href="mailto:connect@salesolution.net?subject=Communication%20preferences"
                className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
              >
                connect@salesolution.net
              </a>{' '}
              with the change you&rsquo;d like and we&rsquo;ll mirror it
              within one business day.
            </p>
          </>
        }
      >
        <></>
      </PreferenceGroup>

      <PreferenceGroup
        eyebrow="03 / Unsubscribe"
        title="Stop all marketing"
        kicker={
          <>
            <p>
              The unsubscribe link in any email footer removes you from every
              marketing list with one click. Transactional emails &mdash; the
              ones tied to your engagement, an audit you booked, or a call you
              scheduled &mdash; continue regardless.
            </p>
            <p className="mt-4">
              For data-deletion or cookie consent controls, see{' '}
              <a
                href="/opt-out-preferences/"
                className="font-medium text-ink-800 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
              >
                opt-out preferences
              </a>
              .
            </p>
          </>
        }
      >
        <></>
      </PreferenceGroup>
    </PreferencesShell>
  )
}
