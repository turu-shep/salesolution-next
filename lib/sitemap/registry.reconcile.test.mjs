import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

/**
 * Drift guard for the hand-maintained sitemap registry.
 *
 * The static side of the sitemap (lib/sitemap/registry.ts) is a hardcoded list.
 * Twice now an indexable page shipped without being added (/industries/,
 * /revenue-engine/medical/), so it never reached the served sitemap. This test
 * reconciles the route tree against the registry so that can't happen silently:
 * every indexable static route under app/(site)/ MUST be registered.
 *
 * A route is exempt when it is:
 *   - a dynamic route (path contains a `[...]` segment) — covered by the Sanity
 *     query in lib/sitemap/data.ts, not the static registry; or
 *   - noindex (its page.tsx declares `index: false`, conditionally or not) —
 *     intentionally kept out of the sitemap.
 *
 * Tests run under plain `node --test` (no TS loader), so we read the registry
 * source and extract its `u('<path>', …)` literals rather than importing the
 * TypeScript module.
 */

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const siteDir = join(repoRoot, 'app', '(site)')
const registrySrc = readFileSync(join(here, 'registry.ts'), 'utf8')

/** All paths registered via `u('/path/', …)` in the registry. */
const registeredPaths = new Set(
  [...registrySrc.matchAll(/\bu\('([^']+)'/g)].map((m) => m[1]),
)

/** Recursively collect every page.tsx under a directory. */
function findPages(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findPages(full))
    else if (entry.name === 'page.tsx') out.push(full)
  }
  return out
}

/** Map a page.tsx file to its public route path, with a trailing slash. */
function routeOf(pageFile) {
  const segments = relative(siteDir, dirname(pageFile))
    .split('/')
    .filter((s) => s.length > 0 && !/^\(.*\)$/.test(s)) // drop route groups
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`
}

const isDynamic = (route) => route.includes('[')
const isNoindex = (pageFile) => readFileSync(pageFile, 'utf8').includes('index: false')

test('every indexable static (site) route is in the sitemap registry', () => {
  const missing = []
  for (const pageFile of findPages(siteDir)) {
    const route = routeOf(pageFile)
    if (isDynamic(route)) continue
    if (isNoindex(pageFile)) continue
    if (!registeredPaths.has(route)) {
      missing.push(`${route}  (${relative(repoRoot, pageFile)})`)
    }
  }
  assert.deepEqual(
    missing,
    [],
    `Indexable pages missing from lib/sitemap/registry.ts — add a u('<path>', …) entry for each:\n  ${missing.join('\n  ')}`,
  )
})

test('the previously-dropped routes are registered', () => {
  // Regression pins for the two drift incidents this guard was written for.
  assert.ok(registeredPaths.has('/industries/'), '/industries/ must be registered')
  assert.ok(
    registeredPaths.has('/revenue-engine/medical/'),
    '/revenue-engine/medical/ must be registered',
  )
})
