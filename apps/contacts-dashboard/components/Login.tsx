'use client'

import { useState } from 'react'

/**
 * The account wall. The root layout renders this in place of the app when a
 * request has no valid session — in place, not via a redirect, which is what
 * keeps the gate free of redirect loops. A plain form that only POSTs to
 * /api/login: it imports nothing from the data layer and reads no env.
 */
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        // Reload the URL the person actually asked for; the layout now lets it through.
        window.location.reload()
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Login failed.')
      setBusy(false)
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  return (
    <main>
      <form onSubmit={onSubmit} style={{ maxWidth: 320 }}>
        <h1>Contacts — private</h1>
        <p className="muted">Sign in with the credentials you were given.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="username"
          aria-label="Email"
          placeholder="Email"
          style={{ width: '100%', padding: '8px 10px', marginTop: 12 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Password"
          style={{ width: '100%', padding: '8px 10px', marginTop: 8 }}
        />
        {error ? <p style={{ color: 'var(--error)' }}>{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !email || !password}
          style={{ width: '100%', padding: '8px 10px', marginTop: 12 }}
        >
          {busy ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
