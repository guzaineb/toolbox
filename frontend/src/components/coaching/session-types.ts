import type { SessionBlocker, SessionObjectiveResult } from '@/types/coaching'

export type ObjectiveResultDraft = '' | SessionObjectiveResult

export interface SessionDraft {
  objective: string
  notes: string
  findings: string
  topicsDiscussed: string
  decisions: string
  summary: string
  nextObjectives: string
  objectiveResult: ObjectiveResultDraft
  objectiveResultReason: string
  blockers: SessionBlocker[]
}

export type SetSessionField = <K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) => void

export interface PreviousSessionStats {
  total: number
  completed: number
  inFlight: number
  submitted: number
  overdue: number
}