/**
 * Off-page domain strength for the AI-Readiness Probe, via DataForSEO's
 * backlinks summary (rank 0–1000, backlinks, referring domains).
 *
 * On-page markup says nothing about whether a domain can WIN citations — a
 * weak domain with perfect schema still loses. This is the fourth scored
 * category. Results are cached for 24h per apex domain (unstable_cache) so
 * repeat probes don't re-bill the API (~cents per fresh domain).
 *
 * Fails soft: missing credentials, timeout, or API error → null, and the
 * probe scores on-page categories only.
 */
import { unstable_cache } from 'next/cache'

import { incrCounter } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'

export type DomainMetrics = {
  rank: number
  backlinks: number
  referringDomains: number
}

async function fetchSummary(target: string): Promise<DomainMetrics | null> {
  // PF-6: accept both env spellings, prefer DATAFORSEO_*. `||` not `??` so a
  // declared-but-blank DATAFORSEO_* still falls back to the legacy DFS_* name.
  const login = process.env.DATAFORSEO_USERNAME || process.env.DFS_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD || process.env.DFS_PASSWORD
  if (!login || !password) return null
  try {
    const res = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        { target, include_subdomains: true, exclude_internal_backlinks: true },
      ]),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      tasks?: Array<{
        status_code?: number
        result?: Array<{
          rank?: number
          backlinks?: number
          referring_main_domains?: number
          referring_domains?: number
        } | null>
      }>
    }
    const task = json.tasks?.[0]
    if (task?.status_code !== 20000) return null
    const r = task.result?.[0]
    if (!r) return null
    return {
      rank: r.rank ?? 0,
      backlinks: r.backlinks ?? 0,
      referringDomains: r.referring_main_domains ?? r.referring_domains ?? 0,
    }
  } catch {
    return null
  }
}

/**
 * Cached layer. Runs ONLY on a cache miss, so this is where the global
 * DataForSEO spend ledger is consumed — cached hits are free. Failures and
 * budget denials THROW so unstable_cache never stores a transient null for
 * 24 hours; the wrapper below converts them to null per-request.
 */
const cachedFetchSummary = unstable_cache(
  async (target: string): Promise<DomainMetrics> => {
    const budget = await consume('dfs', 'shared', incrCounter)
    if (!budget.ok) throw new Error('dfs-budget-exhausted')
    const metrics = await fetchSummary(target)
    if (!metrics) throw new Error('dfs-lookup-failed')
    return metrics
  },
  ['probe-domain-v1'],
  { revalidate: 86400 },
)

/** 24h-cached lookup, keyed by apex domain (www. and trailing dot stripped). */
export async function getDomainMetrics(hostname: string): Promise<DomainMetrics | null> {
  // PF-6: accept both env spellings, prefer DATAFORSEO_*. `||` not `??` so a
  // declared-but-blank DATAFORSEO_* still falls back to the legacy DFS_* name.
  const login = process.env.DATAFORSEO_USERNAME || process.env.DFS_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD || process.env.DFS_PASSWORD
  if (!login || !password) return null
  const target = hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '')
  try {
    return await cachedFetchSummary(target)
  } catch {
    return null
  }
}
