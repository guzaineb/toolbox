import type { PriorityModule } from '@/types/coach'

const MODULE_BASE_ROUTES: Record<PriorityModule, string> = {
  GBM: 'gbm',
  BUSINESS_PLAN: 'business-plan',
  MARKET: 'market',
  FUNDING: 'funding',
  IMPACT: 'impact',
  ECO_DESIGN: 'eco-design',
  EVALUATION: 'evaluations',
  COACHING: 'coachings',
  GENERAL: '',
}

const AREA_TO_MODULE: Record<string, PriorityModule> = {
  GBM: 'GBM',
  SWOT: 'GBM',
  Avancement: 'GBM',
  'Éco-conception': 'ECO_DESIGN',
  'Écoconception': 'ECO_DESIGN',
  Clients: 'MARKET',
  Marché: 'MARKET',
  Finances: 'GBM',
  'Business Plan': 'BUSINESS_PLAN',
  Cohérence: 'GENERAL',
  Impact: 'IMPACT',
  Financement: 'FUNDING',
  Évaluation: 'EVALUATION',
  Coaching: 'COACHING',
  'Données manquantes': 'GENERAL',
  Maturité: 'GENERAL',
}

export function resolveModuleRoute(
  projectId: string,
  module?: PriorityModule | string | null,
  stepKey?: string,
): string | null {
  const base = '/dashboard/project-owner/projects'

  let resolvedModule: PriorityModule

  if (module && module in MODULE_BASE_ROUTES) {
    resolvedModule = module as PriorityModule
  } else if (module && module in AREA_TO_MODULE) {
    resolvedModule = AREA_TO_MODULE[module]
  } else {
    return `${base}/${projectId}`
  }

  const segment = MODULE_BASE_ROUTES[resolvedModule]

  if (resolvedModule === 'GBM' && stepKey) {
    return `${base}/${projectId}/${segment}?step=${stepKey}`
  }

  if (segment) {
    return `${base}/${projectId}/${segment}`
  }

  return `${base}/${projectId}`
}
