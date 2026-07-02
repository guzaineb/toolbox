export interface ImpactMeasure {
  kpis_environnementaux?: Record<string, any>
  kpis_sociaux?: Record<string, any>
  kpis_economiques?: Record<string, any>
  methode_mesure?: string
  periode_mesure?: string
  objectifs_impact?: Record<string, number>
  resultats_actuels?: Record<string, number>
  rapport_impact?: string
  ecart_objectif?: Record<string, number>
}

export interface ImpactProgress {
  total: number
  completed: number
  percentage: number
}
