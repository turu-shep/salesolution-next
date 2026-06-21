/**
 * The measurement model + the per-call logger contract.
 *
 * This is the machine-readable form of docs/strategy/sales/08-metrics.md. The
 * cockpit logger (Phase 6) implements `CallLog` exactly; the funnel + outcome
 * definitions here are the single source of truth for what a call can be tagged.
 */
import type { Motion, SubScript } from './types'

/** The seven funnel stages (08 §1). A call reaches its furthest stage and stops. */
export type FunnelStage =
  | 'dial'
  | 'connect'
  | 'conversation'
  | 'pitch'
  | 'booked'
  | 'showed'
  | 'won'

export const FUNNEL_STAGES: { id: FunnelStage; label: string; countsWhen: string }[] = [
  { id: 'dial', label: 'Dial', countsWhen: 'I pressed call. Every attempt.' },
  { id: 'connect', label: 'Connect', countsWhen: 'A live human said words back.' },
  { id: 'conversation', label: 'Conversation', countsWhen: 'Reached the decision-maker and had at least one real back-and-forth.' },
  { id: 'pitch', label: 'Pitch', countsWhen: 'The whole offer landed in the air before they responded.' },
  { id: 'booked', label: 'Booked', countsWhen: 'A specific slot is on the calendar with a spoken yes.' },
  { id: 'showed', label: 'Showed', countsWhen: 'They were there at the booked time and we ran it.' },
  { id: 'won', label: 'Won', countsWhen: 'Signed.' },
]

export type Outcome =
  | 'no-answer'
  | 'voicemail-left'
  | 'wrong-number'
  | 'gatekeeper-wall'
  | 'bad-fit-on-call'
  | 'not-interested'
  | 'interested-no-commit'
  | 'callback-scheduled'
  | 'disqualified'
  | 'booked-audit'
  | 'drove-to-self-audit'
  | 'booked-growth-call'
  | 'booked-diagnostic'

export interface OutcomeDef {
  value: Outcome
  label: string
  /** Deterministic furthest-stage map (08 §2). The two branch cases carry the exact stage via a checkbox at log time. */
  furthestStage: FunnelStage
  /** Motion lock: 'both', or the only motion this outcome is legal for. */
  motion: Motion | 'both'
  /** Branch note for the two outcomes whose stage depends on when it surfaced. */
  stageNote?: string
}

export const OUTCOMES: OutcomeDef[] = [
  { value: 'no-answer', label: 'No answer', furthestStage: 'dial', motion: 'both' },
  { value: 'voicemail-left', label: 'Voicemail left', furthestStage: 'dial', motion: 'both' },
  { value: 'wrong-number', label: 'Wrong number', furthestStage: 'dial', motion: 'both' },
  { value: 'gatekeeper-wall', label: 'Gatekeeper wall', furthestStage: 'connect', motion: 'both' },
  { value: 'bad-fit-on-call', label: 'Bad fit (on call)', furthestStage: 'connect', motion: 'both' },
  { value: 'not-interested', label: 'Not interested', furthestStage: 'conversation', motion: 'both' },
  { value: 'interested-no-commit', label: 'Interested, no commit', furthestStage: 'conversation', motion: 'both' },
  {
    value: 'callback-scheduled',
    label: 'Callback scheduled',
    furthestStage: 'conversation',
    motion: 'both',
    stageNote: 'Pitch if the full offer landed before the callback was set.',
  },
  {
    value: 'disqualified',
    label: 'Disqualified (by me)',
    furthestStage: 'connect',
    motion: 'both',
    stageNote: 'Conversation if it surfaced once we were talking.',
  },
  { value: 'booked-audit', label: 'Booked — Revenue Leak Audit', furthestStage: 'booked', motion: 'revenue-engine' },
  { value: 'drove-to-self-audit', label: 'Drove to self-audit', furthestStage: 'conversation', motion: 'revenue-engine' },
  { value: 'booked-growth-call', label: 'Booked — Growth Call', furthestStage: 'booked', motion: 'industrial' },
  { value: 'booked-diagnostic', label: 'Booked — written diagnostic', furthestStage: 'booked', motion: 'industrial' },
]

/** Closed list so objections are countable, not prose (08 §2). */
export const OBJECTION_TAGS = [
  'been-burned',
  'no-time',
  'too-expensive',
  'just-tell-me-price',
  'lock-in-fear',
  'have-an-ads-guy',
  'already-have-someone',
  'not-the-buyer',
  'too-good-to-be-true',
  'under-5m',
  'send-me-info',
  'who-are-you',
] as const

export type ObjectionTag = (typeof OBJECTION_TAGS)[number]

/** Finer than SubScript — what the logger records as `track_detail` (08 §2). */
export type TrackDetail =
  | 'roofing'
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'dental'
  | 'distributor'
  | 'manufacturer'

/**
 * One logged call. Mirrors the field table in 08 §2. `furthestStage` is derived
 * from `outcome` (not hand-edited); a `revenue-engine` row must carry
 * `leakObserved` (the pre-dial leak gate, 08 §5).
 */
export interface CallLog {
  id: string
  /** ISO timestamp, set client-side when the call is logged. */
  dialAt: string
  contact: string
  businessName?: string
  motion: Motion
  subScript: SubScript
  trackDetail?: TrackDetail
  outcome: Outcome
  furthestStage: FunnelStage
  /** Suppression flag — separate from outcome so a DNC never erases the stage reached. */
  doNotCall: boolean
  objectionHit?: ObjectionTag
  /** Required when motion === 'revenue-engine' (the pre-dial leak gate). */
  leakObserved?: string
  /** Industrial equivalent of leakObserved. */
  gapObserved?: string
  nextStep?: string
  /** ISO date; drives the callback queue. */
  nextStepDue?: string
  notes?: string
}

/** Look up an outcome definition by value. */
export function outcomeDef(value: Outcome): OutcomeDef | undefined {
  return OUTCOMES.find((o) => o.value === value)
}

/** Outcomes legal for a given motion (booking outcomes are motion-locked). */
export function outcomesForMotion(motion: Motion): OutcomeDef[] {
  return OUTCOMES.filter((o) => o.motion === 'both' || o.motion === motion)
}
