#!/usr/bin/env node
/**
 * Rewrite internal markDef `href`s in post/guide bodies to the canonical URLs,
 * eliminating redirect chains and broken 404s that show up in Ahrefs audits.
 *
 * Rules applied (in order):
 *   1. https://salesolution.net/<path>   → /<path>    (strip absolute host on internal links)
 *   2. /guide/<rest>                     → /guides/<rest>   (singular → plural)
 *   3. /content-marketing-101-guide-2023 → /content-marketing-101    (stale slug)
 *   4. anything not ending in / and not having a #fragment or ?query gets a trailing /
 *
 * Idempotent: a doc whose internal links are already canonical is a no-op.
 *
 * Usage:
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/fix-body-links.mjs" --dry
 *   node --env-file=.env.local "…/fix-body-links.mjs"
 */

import { createClient } from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) { console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1) }
if (!DRY_RUN && !token) { console.error('Missing SANITY_API_WRITE_TOKEN (or pass --dry)'); process.exit(1) }

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: 'raw' })

const STALE_SLUG_REWRITES = new Map([
  ['content-marketing-101-guide-2023', 'content-marketing-101'],
])

/** Returns the canonical href, or null if no change needed. */
function canonicalise(href) {
  if (!href) return null

  // Strip our own absolute host on internal links so they become relative.
  let h = href.replace(/^https?:\/\/(?:www\.)?salesolution\.net/i, '')

  // External / non-http → leave alone.
  if (/^(https?:|mailto:|tel:|#)/.test(h)) return h === href ? null : h
  if (!h.startsWith('/')) return null

  // Singular `/guide/` → plural `/guides/`.
  if (h.startsWith('/guide/')) h = '/guides/' + h.slice('/guide/'.length)

  // Stale slug rewrites — first path segment after `/`.
  const segs = h.split(/[?#]/)[0].split('/').filter(Boolean)
  if (segs.length === 1 && STALE_SLUG_REWRITES.has(segs[0])) {
    h = '/' + STALE_SLUG_REWRITES.get(segs[0]) + h.slice(segs[0].length + 1)
  }

  // Ensure trailing slash on the path (before any ?query or #fragment).
  const m = h.match(/^([^?#]*)([?#].*)?$/)
  if (m) {
    const path = m[1]
    const rest = m[2] ?? ''
    if (path && !path.endsWith('/')) h = path + '/' + rest
  }

  return h === href ? null : h
}

const docs = await client.fetch(
  `*[_type in ["post","guide"] && defined(slug.current)]{_id,_type,"slug":slug.current,body}`,
)

console.log(`Fix body links — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\nDocs: ${docs.length}\n`)

let patched = 0, noop = 0, totalChanges = 0
for (const d of docs) {
  let changedDoc = false
  const changes = []
  const newBody = (d.body ?? []).map((b) => {
    if (b._type !== 'block' || !Array.isArray(b.markDefs) || b.markDefs.length === 0) return b
    let changedBlock = false
    const newMarkDefs = b.markDefs.map((m) => {
      if (m._type !== 'link') return m
      const next = canonicalise(m.href)
      if (next == null) return m
      changes.push({ from: m.href, to: next })
      changedBlock = true
      return { ...m, href: next }
    })
    if (changedBlock) {
      changedDoc = true
      return { ...b, markDefs: newMarkDefs }
    }
    return b
  })
  if (!changedDoc) { noop++; continue }
  console.log(`[${d._type}] ${d.slug}  (${changes.length} link${changes.length === 1 ? '' : 's'} rewritten)`)
  changes.slice(0, 6).forEach((c) => console.log(`   ${c.from}\n   → ${c.to}`))
  if (changes.length > 6) console.log(`   ...and ${changes.length - 6} more`)
  totalChanges += changes.length
  if (DRY_RUN) { patched++; continue }
  await client.patch(d._id).set({ body: newBody }).commit({ visibility: 'async' })
  patched++
}

console.log(`\nDone. patched=${patched}  noop=${noop}  total link rewrites=${totalChanges}`)
