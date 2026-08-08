/**
 * admin — the pure helpers behind the owner /admin screen.
 *
 * Same discipline as rows.mjs: everything the admin UI receives passes through
 * toAdminAccount() ON THE SERVER first, and the mapping builds a fresh
 * whitelist object — password_hash (or anything else a wider read could ever
 * carry) cannot survive it. The role/status guards live here as data-in
 * data-out functions so the last-owner-lockout rule and the owner gate are
 * provable offline, without a request in sight.
 */
import { DEFAULT_VIEW } from './columns.mjs'

/**
 * The ONE owner predicate. The /admin page's flight-guard, requireOwner() in
 * auth-server.ts, and the Nav's Admin-link flag all ask this — one boolean,
 * three surfaces, so they cannot disagree about who an owner is.
 */
export function isOwner(account) {
  return Boolean(account) && typeof account === 'object' && account.role === 'owner'
}

// ── date formatting: UTC, minute precision at most ──────────────────────────

function utcParts(value) {
  if (typeof value !== 'string' || value === '') return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n) => String(n).padStart(2, '0')
  return {
    day: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  }
}

/** 'YYYY-MM-DD' (UTC) or null — the admin table's created column. Never throws. */
export function formatDay(value) {
  return utcParts(value)?.day ?? null
}

/** 'YYYY-MM-DD HH:MM' (UTC) or null — the admin table's last-seen column. Never throws. */
export function formatWhen(value) {
  const p = utcParts(value)
  return p ? `${p.day} ${p.time}` : null
}

// ── the stats serialization boundary ────────────────────────────────────────

/**
 * An account_activity_stats() row -> the row the /admin table renders: nine
 * named fields, dates collapsed to UTC day/minute here at the boundary,
 * counts coerced to numbers. Built fresh — never a spread of the input — so
 * nothing the RPC (or a widened future read) carries can ride along.
 */
export function toAdminAccount(row) {
  const r = row ?? {}
  const n = (v) => Number(v ?? 0)
  return {
    email: String(r.email ?? ''),
    name: String(r.name ?? ''),
    role: String(r.role ?? ''),
    status: String(r.status ?? ''),
    createdAt: formatDay(r.created_at),
    lastSeen: formatWhen(r.last_seen),
    visits7d: n(r.visits_7d),
    visits30d: n(r.visits_30d),
    exportsTotal: n(r.exports_total),
  }
}

/** The RPC already orders by created_at asc; the mapping keeps that order. Empty-safe. */
export function toAdminAccounts(rows) {
  return (rows ?? []).map(toAdminAccount)
}

// ── invite + action guards ──────────────────────────────────────────────────

/** The CLI's own email-shape check (scripts/accounts.mjs normalizeEmail) — one regex, two doors. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const INVITE_ROLES = ['viewer', 'owner']

/**
 * The invite route's input boundary. Body -> { ok, name, email, role } or
 * { ok: false, error }: name nonempty after trimming, email lowercased and
 * shape-checked, role one of viewer|owner defaulting to viewer. An unknown
 * role is a refusal, not a fallback — a surprise value on an ACCOUNT WRITE is
 * a bug or someone probing, and both deserve a 400.
 */
export function validateInvite(body) {
  const b = body && typeof body === 'object' ? body : {}
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  if (name === '') return { ok: false, error: 'Name is required.' }
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  if (!EMAIL_SHAPE.test(email)) return { ok: false, error: 'That does not look like an email address.' }
  const role = b.role === undefined || b.role === null ? 'viewer' : b.role
  if (!INVITE_ROLES.includes(role)) return { ok: false, error: "Role must be 'viewer' or 'owner'." }
  return { ok: true, name, email, role }
}

/**
 * One admin action -> the exact accounts patch it means, or a refusal. The
 * self-guard is the point: an owner revoking (or any future demotion of)
 * THEMSELVES is the last-owner-lockout footgun, so a target matching the
 * actor refuses before any DB write exists to make the mistake real.
 * Reactivate and promote on self stay allowed — both are idempotent no-ops
 * for a signed-in owner, not lockouts.
 */
export function adminActionPatch(action, targetEmail, actorEmail) {
  const email = typeof targetEmail === 'string' ? targetEmail.trim().toLowerCase() : ''
  if (!EMAIL_SHAPE.test(email)) return { ok: false, error: 'That does not look like an email address.' }
  const self = email === String(actorEmail ?? '').trim().toLowerCase()
  switch (action) {
    case 'revoke':
      if (self) return { ok: false, error: 'You cannot revoke your own access.' }
      return { ok: true, email, patch: { status: 'revoked' } }
    case 'reactivate':
      return { ok: true, email, patch: { status: 'active' } }
    case 'promote':
      return { ok: true, email, patch: { role: 'owner' } }
    default:
      return { ok: false, error: 'Unknown action.' }
  }
}

/**
 * Which actions a row offers, decided SERVER-SIDE so the client component
 * serializes nothing but an email and the action names. The self row never
 * offers revoke — the API refuses it anyway; not rendering the button is the
 * honest UI for the same rule. A revoked row offers reactivate only: promote
 * on a dead account is a decision nobody has actually made.
 */
export function rowActions(account, selfEmail) {
  const a = account ?? {}
  if (a.status !== 'active') return ['reactivate']
  const actions = []
  if (a.role !== 'owner') actions.push('promote')
  if (String(a.email ?? '').toLowerCase() !== String(selfEmail ?? '').toLowerCase()) actions.push('revoke')
  return actions
}

// ── activity detail ─────────────────────────────────────────────────────────

/**
 * The activity detail for a sheet render: '/' on the default lens, else the
 * lens-qualified path — mirrors the Nav's own home href, so the usage trail
 * reads like the URL bar did. (/sources logs its literal path; this helper is
 * only for the lensed sheet.)
 */
export function pageDetail(view) {
  return view === DEFAULT_VIEW ? '/' : `/?view=${view}`
}
