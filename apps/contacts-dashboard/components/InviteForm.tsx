'use client'

import { useState } from 'react'

/**
 * The invite form on /admin. Client component for the same reason as Login:
 * it POSTs JSON and must render the response — above all the ONE-TIME
 * password display. On success it deliberately does NOT reload: the password
 * exists only in this response, so the screen holds it until the owner says
 * they copied it. No data-layer imports, no env reads, and the password is
 * never logged anywhere — state here, then gone.
 */
export function InviteForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string; password?: string } | null
      if (res.ok && data?.password) {
        setCreated({ email: email.trim().toLowerCase(), password: data.password })
        setBusy(false)
        return
      }
      setError(data?.error ?? 'Invite failed.')
      setBusy(false)
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  async function copyPassword() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.password)
      setCopied(true)
    } catch {
      // Clipboard refused (permissions) — the password is on screen; select it by hand.
    }
  }

  if (created) {
    return (
      <div style={{ border: '1px solid var(--rule)', padding: '12px 16px', maxWidth: 560, marginBottom: 20 }}>
        <p style={{ margin: '0 0 8px' }}>
          Account created for <strong>{created.email}</strong>. Their password:
        </p>
        <p style={{ margin: '0 0 8px' }}>
          <code style={{ fontSize: 15, background: 'var(--surface-alt)', padding: '4px 8px' }}>{created.password}</code>{' '}
          <button
            type="button"
            onClick={copyPassword}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', font: 'inherit' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </p>
        <p className="muted" style={{ margin: '0 0 10px' }}>
          Copy it now — it is not stored and will not be shown again. Deliver it out-of-band.
        </p>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: '6px 10px' }}>
          Done — refresh the list
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Name"
        placeholder="Name"
        style={{ padding: '6px 10px', width: 180 }}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
        aria-label="Email"
        placeholder="Email"
        style={{ padding: '6px 10px', width: 240 }}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" style={{ padding: '6px 10px' }}>
        <option value="viewer">Viewer</option>
        <option value="owner">Owner</option>
      </select>
      <button type="submit" disabled={busy || !name.trim() || !email.trim()} style={{ padding: '6px 12px' }}>
        {busy ? 'Inviting…' : 'Invite'}
      </button>
      {error ? <span style={{ color: '#b42318' }}>{error}</span> : null}
    </form>
  )
}
