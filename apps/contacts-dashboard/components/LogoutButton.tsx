'use client'

import { useState } from 'react'

/**
 * The header's logout control. A tiny client component (sanctioned by the
 * Task 5R brief) because /api/logout answers JSON, not a redirect — a bare
 * form POST would land the browser on `{ ok: true }`. No data-layer imports,
 * no env reads.
 */
export function LogoutButton() {
  const [busy, setBusy] = useState(false)

  async function onClick() {
    setBusy(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } finally {
      // Cookie gone (or never there) — either way the layout re-decides.
      window.location.reload()
    }
  }

  return (
    <button type="button" className="btn-link" onClick={onClick} disabled={busy}>
      {busy ? 'Signing out…' : 'Log out'}
    </button>
  )
}
