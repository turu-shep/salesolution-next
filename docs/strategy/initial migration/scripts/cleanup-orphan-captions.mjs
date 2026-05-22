#!/usr/bin/env node
/**
 * Drop orphaned "Image Source: X" captions across all post/guide bodies.
 *
 * Re-extraction kept WordPress-style caption blocks ("Image Source: SlideTeam")
 * even when the image they referred to couldn't be uploaded (expired Azure SAS
 * URLs, theme chrome). With no image above them, the captions read as
 * orphaned links to nowhere.
 *
 * Rule: a `normal` block whose text matches `^Image Source\s*[:—–-]` is a
 * caption. If the *immediately preceding* block is not an `image` block, the
 * caption is orphaned — drop it. Captions still attached to a real image are
 * left alone.
 *
 * Usage:
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/cleanup-orphan-captions.mjs" --dry
 *   node --env-file=.env.local "…/cleanup-orphan-captions.mjs"
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

// Strictly the caption pattern, not body sentences that happen to start with "Source".
const CAPTION_RE = /^\s*(image|photo)\s+(source|credit)\s*[:—–-]/i

function blockText(b) {
  if (b?._type !== 'block') return ''
  return (b.children ?? []).map((c) => c.text ?? '').join('').trim()
}

const docs = await client.fetch(
  `*[_type in ["post","guide"] && defined(slug.current)]{_id,_type,"slug":slug.current,body}`,
)

console.log(`Cleanup orphan captions — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
console.log(`Docs: ${docs.length}\n`)

let patched = 0, noop = 0
for (const d of docs) {
  const drops = []
  for (let i = 0; i < d.body.length; i++) {
    const b = d.body[i]
    if (b._type !== 'block') continue
    const t = blockText(b)
    if (!CAPTION_RE.test(t)) continue
    if (t.length > 200) continue
    const prev = d.body[i - 1]
    if (prev?._type === 'image') continue
    drops.push({ i, text: t.slice(0, 90) })
  }
  if (drops.length === 0) { noop++; continue }
  console.log(`[${d._type}] ${d.slug}`)
  drops.forEach((d) => console.log(`   drop block ${d.i}: ${d.text}`))
  if (DRY_RUN) { patched++; continue }
  const dropIdx = new Set(drops.map((d) => d.i))
  const newBody = d.body.filter((_, i) => !dropIdx.has(i))
  await client.patch(d._id).set({ body: newBody }).commit({ visibility: 'async' })
  patched++
}

console.log(`\nDone. patched=${patched}  noop=${noop}`)
