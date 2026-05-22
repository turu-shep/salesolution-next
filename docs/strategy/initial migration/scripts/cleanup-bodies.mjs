#!/usr/bin/env node
/**
 * Strip WordPress chrome from imported post/guide bodies.
 *
 * The migration walked everything inside `<article>` on the WordPress source,
 * which on this theme included the comment form, the comment-form fields, and
 * the related-posts / footer widgets — all imported as body blocks. This
 * script finds the marker "Leave a Comment" / "Leave a Reply" / "Cancel
 * reply" / "Cancel Reply" in each body and truncates everything from that
 * block onward.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/cleanup-bodies.mjs" --dry
 *   node --env-file=.env.local "docs/strategy/initial migration/scripts/cleanup-bodies.mjs"
 *   node --env-file=.env.local "…/cleanup-bodies.mjs" --slug=content-marketing-101
 *
 * Idempotent: a doc whose body no longer matches the marker is a no-op.
 */

import { createClient } from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry')
const ONLY_TYPE = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1]
const ONLY_SLUG = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID.')
  process.exit(1)
}
if (!DRY_RUN && !token) {
  console.error('Missing SANITY_API_WRITE_TOKEN (or pass --dry).')
  process.exit(1)
}

const client = createClient({
  projectId, dataset, apiVersion, token,
  useCdn: false, perspective: 'raw',
})

// Any block whose text content matches one of these patterns marks the start
// of the WordPress chrome tail. We truncate at the FIRST hit. Order matters
// only if we ever wanted to log which marker matched — truncation behavior
// is identical for any of them.
const CHROME_MARKERS = [
  /^\s*leave a (comment|reply)\b/i,
  /^\s*cancel reply\s*$/i,
]

function blockText(b) {
  if (b?._type !== 'block') return ''
  return (b.children ?? []).map((c) => c.text ?? '').join('').trim()
}

function findChromeStart(body) {
  for (let i = 0; i < body.length; i++) {
    const t = blockText(body[i])
    if (!t) continue
    if (CHROME_MARKERS.some((rx) => rx.test(t))) return i
  }
  return -1
}

const typeFilter = ONLY_TYPE ? `_type == "${ONLY_TYPE}"` : `_type in ["post", "guide"]`
const slugFilter = ONLY_SLUG ? `&& slug.current == "${ONLY_SLUG}"` : ''

const docs = await client.fetch(
  `*[${typeFilter} && defined(slug.current) ${slugFilter}]{
    _id, _type, "slug": slug.current, body
  }`,
)

console.log(
  `Cleanup — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n` +
    `Target: ${projectId}/${dataset}\n` +
    `Docs:   ${docs.length}\n`,
)

let patched = 0, noop = 0, failed = 0
for (const doc of docs) {
  const cutAt = findChromeStart(doc.body ?? [])
  if (cutAt < 0) {
    console.log(`[${doc._type}] ${doc.slug}  (no marker — already clean)`)
    noop++
    continue
  }
  const removed = doc.body.length - cutAt
  console.log(`[${doc._type}] ${doc.slug}  cut at block ${cutAt} → removing ${removed} chrome blocks`)
  if (DRY_RUN) { patched++; continue }

  try {
    const newBody = doc.body.slice(0, cutAt)
    await client.patch(doc._id).set({ body: newBody }).commit({ visibility: 'async' })
    patched++
  } catch (err) {
    console.error(`   ✗ patch failed: ${err.message}`)
    failed++
  }
}

console.log(`\n────────────────────────────────────────`)
console.log(`Done. patched=${patched}  noop=${noop}  failed=${failed}`)
