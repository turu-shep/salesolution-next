/**
 * Add inline glossary termLinks (`glossaryRef`) into a published glossary term's
 * body — the manual precursor to the M3 auto-linker (see
 * docs/strategy/glossary/tech-task.md). Splits the matched span in place and adds
 * a glossaryRef markDef, preserving every other block, key, and markDef.
 *
 *   node scripts/glossary-add-inline-links.mjs            # dry run (prints diff)
 *   node scripts/glossary-add-inline-links.mjs --write    # commit via patch
 *
 * Idempotent: skips a block that already links the target. Edits the PUBLISHED
 * doc so the live page renders the preview. Re-run M3 after any humanizer-draft
 * publish to re-apply links.
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'published',
})

const WRITE = process.argv.includes('--write')

// ── What to link ─────────────────────────────────────────────────────────────
// Each job: in the term `slug`, find the FIRST `normal` block containing
// `blockMatch`, optionally `prepend` a sentence to it, then wrap the first
// occurrence of `phrase` in a glossaryRef to `target`.
const JOBS = [
  {
    slug: 'ai-share-of-voice',
    edits: [
      {
        blockMatch: 'Pick the 30 prompts',
        prepend: 'AI share of voice turns AI visibility into a number you can track against rivals. ',
        phrase: 'AI visibility',
        target: 'ai-visibility',
      },
      {
        blockMatch: 'Define a stable prompt set',
        phrase: 'citation',
        target: 'llm-citation',
      },
    ],
  },
]

let _k = 0
const mkKey = () => `il${(_k++).toString(36)}${Date.now().toString(36).slice(-3)}`

function blockText(b) {
  return (b.children ?? []).map((c) => c.text ?? '').join('')
}

function applyEdit(block, edit) {
  block.markDefs = block.markDefs ?? []
  const refId = `glossary-${edit.target}`
  if (block.markDefs.some((m) => m._type === 'glossaryRef' && m._ref === refId)) {
    return { skipped: true, reason: 'already linked' }
  }
  // Optional prepend → merge into the first span so the phrase can live in it.
  if (edit.prepend) {
    const first = block.children?.[0]
    if (first && typeof first.text === 'string' && !first.text.startsWith(edit.prepend)) {
      first.text = edit.prepend + first.text
    }
  }
  // Find the first span containing the phrase.
  const idx = (block.children ?? []).findIndex(
    (c) => typeof c.text === 'string' && c.text.includes(edit.phrase),
  )
  if (idx === -1) return { skipped: true, reason: `phrase not found: "${edit.phrase}"` }

  const span = block.children[idx]
  const at = span.text.indexOf(edit.phrase)
  const before = span.text.slice(0, at)
  const after = span.text.slice(at + edit.phrase.length)
  const markKey = mkKey()
  const baseMarks = span.marks ?? []

  const newSpans = []
  if (before) newSpans.push({ _type: 'span', _key: mkKey(), text: before, marks: [...baseMarks] })
  newSpans.push({ _type: 'span', _key: mkKey(), text: edit.phrase, marks: [...baseMarks, markKey] })
  if (after) newSpans.push({ _type: 'span', _key: mkKey(), text: after, marks: [...baseMarks] })

  block.children.splice(idx, 1, ...newSpans)
  block.markDefs.push({ _key: markKey, _type: 'glossaryRef', _ref: refId })
  return { skipped: false }
}

for (const job of JOBS) {
  const doc = await client.fetch(
    `*[_type=="glossaryTerm" && slug.current==$s][0]{ _id, body }`,
    { s: job.slug },
  )
  if (!doc?._id) {
    console.error(`! ${job.slug}: not found (published)`)
    continue
  }
  const body = doc.body ?? []
  console.log(`\n=== ${job.slug} (${doc._id}) ===`)
  let changed = false
  for (const edit of job.edits) {
    const block = body.find((b) => b.style === 'normal' && blockText(b).includes(edit.blockMatch))
    if (!block) {
      console.log(`  - skip "${edit.phrase}" → ${edit.target}: block not found`)
      continue
    }
    const res = applyEdit(block, edit)
    if (res.skipped) {
      console.log(`  - skip "${edit.phrase}" → ${edit.target}: ${res.reason}`)
    } else {
      changed = true
      console.log(`  ✓ link "${edit.phrase}" → ${edit.target}`)
      console.log(`      now: ${blockText(block)}`)
    }
  }
  if (!changed) {
    console.log('  (no changes)')
    continue
  }
  if (WRITE) {
    await client.patch(doc._id).set({ body }).commit()
    console.log('  → written')
  } else {
    console.log('  (dry run — re-run with --write to commit)')
  }
}

console.log('\nDone.')
