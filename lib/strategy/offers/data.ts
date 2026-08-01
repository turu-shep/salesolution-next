/**
 * Accessors for the three-stage offer dashboard rendered at /strategy/offers.
 * Same idiom as lib/strategy/niches: types -> *.generated -> these accessors.
 * Stages 2 and 3 are null until their passes have run.
 */

import { drift } from './drift.generated'
import { mirror } from './mirror.generated'
import { perception } from './perception.generated'
import type { DriftData, MirrorData, PerceptionData } from './types'

export function getMirror(): MirrorData {
  return mirror
}

export function getDrift(): DriftData | null {
  return drift
}

export function getPerception(): PerceptionData | null {
  return perception
}

export type {
  AlignmentRow,
  Confidence,
  CoverageRow,
  DoorAuditRow,
  DriftData,
  EvidenceRef,
  Finding,
  FindingSeverity,
  FunnelStage,
  Grade,
  GradeRow,
  MirrorData,
  MismatchClass,
  MismatchRow,
  OpenQuestion,
  PerceptionData,
  PerceptionRecord,
  RouteRecord,
  UClaim,
  VerticalBrief,
  VoiceViolation,
} from './types'
