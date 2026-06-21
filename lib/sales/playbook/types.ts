/**
 * The cold-call cockpit content model.
 *
 * The playbook is content-as-typed-data: the finished scripts in
 * docs/strategy/sales/ are encoded against these types, and one renderer (Phase 3+)
 * walks them. The prose docs stay the human source of truth; this is their
 * machine-readable shape. Design rationale lives in
 * docs/strategy/sales/00-build-and-cockpit-design.md §3–4.
 */

/** The two sales motions. Never blurred — different buyer, list, and CTA. */
export type Motion = 'revenue-engine' | 'industrial'

/** Sub-script within a motion. Revenue Engine splits; Industrial is a single script. */
export type SubScript = 'roofing' | 'dental' | null

/** The live-call stages the cockpit walks, in order. (Voicemail + cadence live in the docs, not here.) */
export type StageId = 'open' | 'hook' | 'discovery' | 'pitch' | 'close'

export const STAGE_ORDER: StageId[] = ['open', 'hook', 'discovery', 'pitch', 'close']

/** A spoken line (read aloud) or a stage direction (what to do / listen for, shown de-emphasized). */
export type Line = { say: string } | { note: string }

/** Visual/behavioral role of a segment, so the renderer can style it without parsing. */
export type SegmentRole =
  | 'primary' // the main talk track for the stage
  | 'variant' // an opener variant ("straight to voicemail")
  | 'branch' // a conditional response ("if 'who is this?'")
  | 'question' // a discovery question with answer-reads
  | 'callout' // a framed block ("What I don't do", "The guarantee")

/**
 * A labeled chunk of a stage. One uniform shape covers the main talk track, opener
 * variants, branches, discovery questions, and callouts — the renderer switches on
 * `role` for presentation, not on shape.
 */
export interface Segment {
  /** Stable id, unique within its track (used for keys + branch targets). */
  id: string
  role: SegmentRole
  /** Heading chip: "Variant A — straight to voicemail", "If 'who is this?'", "Q3", "What I don't do". */
  label?: string
  /** When to use it / extra guidance, shown under the label. */
  when?: string
  /** The script, in order. */
  lines: Line[]
  /** Branch only: jump to this stage once the branch resolves. */
  goto?: StageId
  /** Question only: how to read the answer. */
  reads?: { good?: string; borderline?: string; disqualifying?: string }
}

export interface Stage {
  id: StageId
  title: string
  /** One-line purpose, shown under the title. */
  goal?: string
  segments: Segment[]
}

/** A pre-call research/leak-proof step. The finding feeds the opener. */
export interface PrecallItem {
  /** What to do: "Call their main line first." */
  action: string
  /** Why / what to look for. */
  detail?: string
  /** The opener line this finding feeds. */
  openerFuel?: string
}

/** A full call script for one motion (and sub-script). */
export interface Track {
  /** Selection key: 'revenue-engine-roofing' | 'revenue-engine-dental' | 'industrial'. */
  slug: string
  motion: Motion
  subScript: SubScript
  /** Display label: "Revenue Engine — Roofing & home services". */
  label: string
  /** Short who's-on-the-line note. */
  persona: string
  /** The one next-step this call books. */
  goal: string
  /** The conversion door for this motion. */
  cta: { label: string; href: string }
  precall: { title: string; note?: string; items: PrecallItem[] }
  stages: Stage[]
}

export type ObjectionCategory =
  | 'gatekeeper'
  | 'brush-off'
  | 'price'
  | 'trust'
  | 'timing'
  | 'competitor'
  | 'fit'
  | 'hygiene'

/** A motion-scoped variant of an objection response ("Say (RE)" vs "Say (IND)"). */
export interface ObjectionResponse {
  /** Scope label shown on the card: "RE", "IND", "Dental". Omit when there's a single response. */
  label?: string
  motions?: Motion[]
  lines: Line[]
}

/** A battle-card in the shared objection library (the cockpit's search index). */
export interface Objection {
  /** Library id: "G1", "RE3", "P2". */
  id: string
  /** The objection in a phrase. */
  label: string
  /** What the prospect actually says — feeds the fuzzy search. */
  triggers: string[]
  category: ObjectionCategory
  /** Which motions this applies to. */
  motions: Motion[]
  /** Optional finer scope (e.g. dental-only). */
  subScripts?: SubScript[]
  /** One or more responses (RE vs IND variants). */
  responses: ObjectionResponse[]
  /** "If they hold the line" — one re-ask, then the door. */
  hold?: Line[]
  /** What to send / do next if it persists. */
  sendAfter?: string
  /** Why it lands (operator note, not said aloud). */
  why?: string
}
