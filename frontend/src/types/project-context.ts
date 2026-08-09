export interface PrefillField {
  value: any
  sourceModule: string
  sourceLabel: string
  preview: string
}

export interface ChecklistItem {
  key: string
  label: string
  status: 'ok' | 'missing'
  sourceLabel?: string
}

export interface FundingSuggestion {
  value: boolean
  reason: string
}

export interface ModulePrefill {
  module: string
  fields: Record<string, PrefillField>
  missing: ChecklistItem[]
  checklist: ChecklistItem[]
  computed?: Record<string, any>
  suggestions?: Record<string, FundingSuggestion>
}

export interface ProjectContext {
  name?: string
  description?: string
  idea_sketch?: Record<string, any>
  problems_needs?: Record<string, any>
  pestel?: Record<string, any>
  objective?: Record<string, any>
  mission_vision?: Record<string, any>
  stakeholder?: any[]
  stakeholder_map?: any[]
  customer_segment?: any[]
  value_proposition?: Record<string, any>
  test_discovery?: any[]
  customer_relations_channel?: Record<string, any>
  customer_journey?: any[]
  key_activities_resource?: Record<string, any>
  eco_design?: Record<string, any>
  eco_design_result?: Record<string, any>
  cost_structure?: Record<string, any>
  revenue_stream?: Record<string, any>
  indicator?: Record<string, any>
  management_plan?: Record<string, any>
  marketing_plan?: Record<string, any>
  financial_plan?: Record<string, any>
  legal_plan?: Record<string, any>
  kpi?: Record<string, any>
  swot_analysis?: Record<string, any>
  funding_assessment?: Record<string, any>
  market_access?: Record<string, any>
  impact_measure?: Record<string, any>
}
