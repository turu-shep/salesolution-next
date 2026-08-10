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
      <div className="card password-card">
        <p style={{ margin: '0 0 8px' }}>
          Account created for <strong>{created.email}</strong>. Their password:
        </p>
        <p style={{ margin: '0 0 8px' }}>
          <code className="well">{created.password}</code>{' '}
          <button type="button" className="btn-link" onClick={copyPassword}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </p>
        <p className="muted small" style={{ margin: '0 0 12px' }}>
          Copy it now — it is not stored and will not be shown again. Deliver it out-of-band.
        </p>
        <button type="button" className="btn btn-quiet" onClick={() => window.location.reload()}>
          Done — refresh the list
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h2 className="card-title">Invite someone</h2>
      <div className="form-row">
        <div className="field">
          <label htmlFor="inv-name">Name</label>
          <input
            id="inv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: 180 }}
          />
        </div>
        <div className="field">
          <label htmlFor="inv-email">Email</label>
          <input
            id="inv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            style={{ width: 240 }}
          />
        </div>
        <div className="field">
          <label htmlFor="inv-role">Role</label>
          <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim() || !email.trim()}>
          {busy ? 'Inviting…' : 'Invite'}
        </button>
        {error ? <span className="form-error" style={{ margin: 0 }}>{error}</span> : null}
      </div>
    </form>
  )
}
