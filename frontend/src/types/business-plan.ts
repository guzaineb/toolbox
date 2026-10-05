export interface ManagementPlan {
  problemes_gestion?: string
  ressources_humaines?: string
  actifs_physiques?: string
  ressources_intellectuelles?: string
  production_fournisseurs?: string
}

export interface MarketingPlan {
  clients_valeur?: string
  analyse_marche?: string
  concurrents?: string
  offre_prix?: string
  branding_positionnement?: string
  canaux_communication?: string
  relation_client?: string
}

export interface FinancialPlan {
  point_depart?: string
  couts_configuration?: number
  capital?: number
  compte_resultat?: Record<string, any>
  cash_flow?: Record<string, any>
  bilan?: Record<string, any>
  seuil_rentabilite?: number
  revenus_3ans?: Record<string, any>
  autres_mesures?: string
  rapport_financier?: string
}

export interface LegalPlan {
  statut_juridique?: string
  immatriculation?: string
  contrats?: string
  assurances?: string
}

export interface Kpi {
  kpis?: Record<string, any>
  objectifs_mesure?: string
  revues_performance?: string
}

export interface ExecutiveSummary {
  resume_executif?: string
  generated_by_ai?: boolean
}

export interface BusinessPlanProgress {
  total: number
  completed: number
  percentage: number
  steps: { stepKey: string; status: string }[]
}

export const BP_STEP_LABELS: Record<string, string> = {
  bp_2_1: 'Plan de gestion & exploitation',
  bp_2_2: 'Plan de marketing',
  bp_2_3: 'Plan financier',
  bp_2_4: 'Plan juridique',
  bp_2_5: 'Mesure et attente (KPIs)',
  bp_2_6: 'Résumé analytique',
}

export type BusinessPlanFinalizationStatus = 'FINAL' | null

export interface BusinessPlanGatingStatus {
  status: BusinessPlanFinalizationStatus
  finalizedAt: string | null
  isGbmReady: boolean
  missingSteps: { stepKey: string; title: string }[]
}
