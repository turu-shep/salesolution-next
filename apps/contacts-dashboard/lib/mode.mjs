/**
 * mode — read once, at module scope, from the server environment.
 *
 * Nothing in a request may influence either value: not a query string, not a
 * header, not a cookie, not a body. This is no longer containing anything (there
 * is no client), but it costs nothing, and an env var that decides what a
 * deployment shows should not be reachable from the internet.
 *
 * DASHBOARD_PROJECT is DEFAULT-VIEW ROUTING: it decides which saved view the
 * deployment opens on. A deployment pinned to a project that does not exist
 * fails loudly rather than opening somewhere random.
 */
export function readMode(env) {
  const e = env || {}
  const mode = e.DASHBOARD_MODE
  if (!mode) {
    throw new Error('DASHBOARD_MODE is not set. Set DASHBOARD_MODE=internal — an unset mode that defaults to "show everything" is the kind of implicit that bites later.')
  }
  if (mode !== 'internal') {
    throw new Error(`DASHBOARD_MODE must be "internal" (got "${mode}"). Client mode was dissolved on 2026-08-07 — all three deployments are internal.`)
  }
  return { mode, project: e.DASHBOARD_PROJECT ? String(e.DASHBOARD_PROJECT) : null }
}
