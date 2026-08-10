import type { Metadata } from 'next'

import { Login } from '@/components/Login'
import { LogoutButton } from '@/components/LogoutButton'
import { getAccount } from '@/lib/auth-server'

import './globals.css'

/**
 * The gate. Not middleware, deliberately: a server-component layout that
 * renders the login form IN PLACE when the request carries no active account —
 * no redirect, no separate login page, no redirect loop to grow. Route
 * handlers (which have no form) answer 401 via requireAccount().
 */

/** The gate must run on every request, so this subtree is never static. */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contacts',
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccount()

  return (
    <html lang="en">
      <body>
        {account ? (
          <>
            <header className="topbar">
              <strong className="brand">Contacts</strong>
              <span className="account">{account.name}</span>
              <LogoutButton />
            </header>
            {children}
          </>
        ) : (
          <Login />
        )}
      </body>
    </html>
  )
}
