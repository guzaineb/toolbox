export interface FundingQuestion {
  id: number
  question: string
  key: string
}

export interface FundingAssessment {
  reponses_questionnaire?: Record<string, boolean>
  score_maturite?: number
  phase_maturite?: string
  opportunites_financement?: Record<string, any>
  opportunites_pays?: string
  strategie_levee_fonds?: string
  completed_at?: string
}

export const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  IDEATION:   { label: 'Idéation',      color: 'bg-blue-100 text-blue-700' },
  VALIDATION: { label: 'Validation',    color: 'bg-amber-100 text-amber-700' },
  EARLY_STAGE: { label: 'Early Stage',  color: 'bg-orange-100 text-orange-700' },
  GROWTH:     { label: 'Croissance',    color: 'bg-green-100 text-green-700' },
  SCALING:    { label: 'Scale-up',      color: 'bg-purple-100 text-purple-700' },
}
