'use client'

import { useState } from 'react'

/**
 * Password gate for the private /sales area. The layout renders this in place of
 * the page when a production request has no valid session cookie. Posts to
 * /api/sales/login; on success the cookie is set and we reload into the area.
 */
export function SalesLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/sales/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.assign('/sales')
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Wrong password.')
      setBusy(false)
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-400">Sale Solution</p>
        <h1 className="mt-2 text-lg font-medium text-ink-900">Sales — private</h1>
        <p className="mt-1 text-sm text-ink-500">Enter the password to continue.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-label="Password"
          className="mt-5 w-full rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 outline-none focus:border-accent-600"
        />

        {error ? <p className="mt-2 text-sm text-danger-500">{error}</p> : null}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-ink-inverse transition-colors hover:bg-accent-700 disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  )
}
