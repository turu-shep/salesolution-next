/**
 * Shared slot model for the humanizer pass over careerPath + glossaryTerm docs.
 *
 * A "slot" is one editable piece of prose with a stable id. We only expose
 * prose blocks that are SAFE to rewrite: single-span blocks with NO markDefs
 * (so we never touch "Source:" / "Read the full path" attribution lines or any
 * inline links), plus callout bodies and the scalar/array text fields.
 *
 * extractSlots(doc)        -> { docId, type, label, slots: [{id, kind, current}] }
 * applyChanges(doc, chgs)  -> mutated deep-clone with new text set by slot id.
 *                             Throws if a slot id is unknown or its current text
 *                             no longer matches (guards against live drift).
 */

const isProseBlock = (b) =>
  b &&
  b._type === 'block' &&
  Array.isArray(b.children) &&
  b.children.length === 1 &&
  b.children[0]?._type === 'span' &&
  (!Array.isArray(b.markDefs) || b.markDefs.length === 0) &&
  (!Array.isArray(b.children[0].marks) || b.children[0].marks.length === 0)

export function extractSlots(doc) {
  const type = doc._type
  const slots = []
  const push = (id, kind, current) => {
    if (typeof current === 'string' && current.trim()) slots.push({ id, kind, current })
  }

  if (type === 'careerPath') {
    push('description', 'lede', doc.description)
    push('role', 'role-line', doc.role)
  } else if (type === 'glossaryTerm') {
    push('shortDefinition', 'short-definition', doc.shortDefinition)
  }

  // body[] — prose paragraphs, headings, callouts
  if (Array.isArray(doc.body)) {
    doc.body.forEach((b, i) => {
      if (b._type === 'callout' && typeof b.body === 'string') {
        push(`body.${i}.callout`, 'callout', b.body)
      } else if (isProseBlock(b)) {
        const style = b.style || 'normal'
        push(`body.${i}`, style === 'normal' ? 'paragraph' : style, b.children[0].text)
      }
    })
  }

  // buyerSection (careerPath only)
  const bs = doc.buyerSection
  if (bs) {
    push('buyer.whatTheyDo', 'paragraph', bs.whatTheyDo)
    push('buyer.costReality', 'paragraph', bs.costReality)
    if (Array.isArray(bs.signsYouNeedOne)) {
      bs.signsYouNeedOne.forEach((s, j) => push(`buyer.signs.${j}`, 'bullet', s))
    }
    if (Array.isArray(bs.inHouseVsAgency)) {
      bs.inHouseVsAgency.forEach((b, i) => {
        if (isProseBlock(b)) push(`buyer.iva.${i}`, 'paragraph', b.children[0].text)
      })
    }
  }

  const label =
    type === 'careerPath' ? `Career path: ${doc.title}` : `Glossary: ${doc.term}`
  return { docId: doc._id, type, label, slots }
}

const clone = (x) => JSON.parse(JSON.stringify(x))

// Light house-style normalize: straight apostrophe between letters -> curly.
// (Double quotes left to the editor; Source/link text is never routed here.)
const normalize = (s) =>
  String(s).replace(/(\p{L})'(\p{L})/gu, '$1’$2')

export function applyChanges(doc, changes) {
  const out = clone(doc)
  const slotMap = new Map(extractSlots(doc).slots.map((s) => [s.id, s.current]))
  const applied = []

  for (const { id, new: raw } of changes) {
    if (!slotMap.has(id)) throw new Error(`[${doc._id}] unknown slot id: ${id}`)
    const expected = slotMap.get(id)
    const next = normalize(raw)
    if (expected === next) continue // no-op change

    const parts = id.split('.')
    if (id === 'description') out.description = next
    else if (id === 'role') out.role = next
    else if (id === 'shortDefinition') {
      if (next.length > 480) throw new Error(`[${doc._id}] shortDefinition > 480 chars (${next.length})`)
      out.shortDefinition = next
    } else if (id === 'buyer.whatTheyDo') out.buyerSection.whatTheyDo = next
    else if (id === 'buyer.costReality') out.buyerSection.costReality = next
    else if (parts[0] === 'buyer' && parts[1] === 'signs') {
      out.buyerSection.signsYouNeedOne[Number(parts[2])] = next
    } else if (parts[0] === 'buyer' && parts[1] === 'iva') {
      out.buyerSection.inHouseVsAgency[Number(parts[2])].children[0].text = next
    } else if (parts[0] === 'body' && parts[2] === 'callout') {
      out.body[Number(parts[1])].body = next
    } else if (parts[0] === 'body') {
      out.body[Number(parts[1])].children[0].text = next
    } else {
      throw new Error(`[${doc._id}] unhandled slot id: ${id}`)
    }
    applied.push({ id, before: expected, after: next })
  }
  return { out, applied }
}
