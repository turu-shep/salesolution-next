'use client'

import { useState } from 'react'

/**
 * One row's action buttons on /admin. A tiny client component (same
 * sanctioning as LogoutButton: the API answers JSON, so a bare form POST
 * would land the browser on `{ ok: true }`). The server decides WHICH actions
 * a row offers (lib/admin.mjs rowActions) — the props carry an email and
 * action names, never account data. No data-layer imports, no env reads.
 */

const LABELS: Record<string, string> = {
  revoke: 'Revoke',
  reactivate: 'Reactivate',
  promote: 'Make owner',
}

export function AdminActions({ email, actions }: { email: string; actions: string[] }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: string) {
    if (action === 'revoke' && !window.confirm(`Revoke access for ${email}? Their next request signs them out.`)) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, action }),
      })
      if (res.ok) {
        window.location.reload()
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Update failed.')
      setBusy(false)
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  if (actions.length === 0) return null
  return (
    <span className="row-actions">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className={action === 'revoke' ? 'btn btn-danger btn-sm' : 'btn btn-quiet btn-sm'}
          onClick={() => run(action)}
          disabled={busy}
        >
          {LABELS[action] ?? action}
        </button>
      ))}
      {error ? <span className="form-error small" style={{ margin: 0 }}>{error}</span> : null}
    </span>
  )
}
