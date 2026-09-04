import { resolveModuleRoute } from './resolve-module-route'

describe('resolveModuleRoute', () => {
  const projectId = 'test-project-123'

  it('returns project root for undefined module', () => {
    expect(resolveModuleRoute(projectId)).toBe(
      '/dashboard/project-owner/projects/test-project-123',
    )
  })

  it('returns project root for GENERAL module', () => {
    expect(resolveModuleRoute(projectId, 'GENERAL')).toBe(
      '/dashboard/project-owner/projects/test-project-123',
    )
  })

  it('routes GBM without stepKey to gbm page', () => {
    expect(resolveModuleRoute(projectId, 'GBM')).toBe(
      '/dashboard/project-owner/projects/test-project-123/gbm',
    )
  })

  it('routes GBM with stepKey to specific step', () => {
    expect(resolveModuleRoute(projectId, 'GBM', 'gbm_5')).toBe(
      '/dashboard/project-owner/projects/test-project-123/gbm?step=gbm_5',
    )
  })

  it('routes BUSINESS_PLAN to business-plan page', () => {
    expect(resolveModuleRoute(projectId, 'BUSINESS_PLAN')).toBe(
      '/dashboard/project-owner/projects/test-project-123/business-plan',
    )
  })

  it('routes MARKET to market page', () => {
    expect(resolveModuleRoute(projectId, 'MARKET')).toBe(
      '/dashboard/project-owner/projects/test-project-123/market',
    )
  })

  it('routes FUNDING to funding page', () => {
    expect(resolveModuleRoute(projectId, 'FUNDING')).toBe(
      '/dashboard/project-owner/projects/test-project-123/funding',
    )
  })

  it('routes IMPACT to impact page', () => {
    expect(resolveModuleRoute(projectId, 'IMPACT')).toBe(
      '/dashboard/project-owner/projects/test-project-123/impact',
    )
  })

  it('routes ECO_DESIGN to eco-design page', () => {
    expect(resolveModuleRoute(projectId, 'ECO_DESIGN')).toBe(
      '/dashboard/project-owner/projects/test-project-123/eco-design',
    )
  })

  it('routes EVALUATION to evaluations page', () => {
    expect(resolveModuleRoute(projectId, 'EVALUATION')).toBe(
      '/dashboard/project-owner/projects/test-project-123/evaluations',
    )
  })

  it('routes COACHING to coachings page', () => {
    expect(resolveModuleRoute(projectId, 'COACHING')).toBe(
      '/dashboard/project-owner/projects/test-project-123/coachings',
    )
  })

  describe('area string resolution', () => {
    it('resolves "GBM" area to GBM module', () => {
      expect(resolveModuleRoute(projectId, 'GBM')).toBe(
        '/dashboard/project-owner/projects/test-project-123/gbm',
      )
    })

    it('resolves "SWOT" area to GBM module', () => {
      expect(resolveModuleRoute(projectId, 'SWOT')).toBe(
        '/dashboard/project-owner/projects/test-project-123/gbm',
      )
    })

    it('resolves "Finances" area to GBM module', () => {
      expect(resolveModuleRoute(projectId, 'Finances')).toBe(
        '/dashboard/project-owner/projects/test-project-123/gbm',
      )
    })

    it('resolves "Business Plan" area to business-plan', () => {
      expect(resolveModuleRoute(projectId, 'Business Plan')).toBe(
        '/dashboard/project-owner/projects/test-project-123/business-plan',
      )
    })

    it('resolves "Marché" area to market', () => {
      expect(resolveModuleRoute(projectId, 'Marché')).toBe(
        '/dashboard/project-owner/projects/test-project-123/market',
      )
    })

    it('resolves "Clients" area to market', () => {
      expect(resolveModuleRoute(projectId, 'Clients')).toBe(
        '/dashboard/project-owner/projects/test-project-123/market',
      )
    })

    it('resolves "Financement" area to funding', () => {
      expect(resolveModuleRoute(projectId, 'Financement')).toBe(
        '/dashboard/project-owner/projects/test-project-123/funding',
      )
    })

    it('resolves "Impact" area to impact', () => {
      expect(resolveModuleRoute(projectId, 'Impact')).toBe(
        '/dashboard/project-owner/projects/test-project-123/impact',
      )
    })

    it('resolves "Éco-conception" area to eco-design', () => {
      expect(resolveModuleRoute(projectId, 'Éco-conception')).toBe(
        '/dashboard/project-owner/projects/test-project-123/eco-design',
      )
    })

    it('resolves "Cohérence" area to project root', () => {
      expect(resolveModuleRoute(projectId, 'Cohérence')).toBe(
        '/dashboard/project-owner/projects/test-project-123',
      )
    })

    it('resolves "Données manquantes" area to project root', () => {
      expect(resolveModuleRoute(projectId, 'Données manquantes')).toBe(
        '/dashboard/project-owner/projects/test-project-123',
      )
    })

    it('resolves unknown area to project root', () => {
      expect(resolveModuleRoute(projectId, 'UnknownArea')).toBe(
        '/dashboard/project-owner/projects/test-project-123',
      )
    })
  })

  describe('GBM stepKey ignores stepKey for non-GBM modules', () => {
    it('ignores stepKey for BUSINESS_PLAN', () => {
      expect(resolveModuleRoute(projectId, 'BUSINESS_PLAN', 'gbm_5')).toBe(
        '/dashboard/project-owner/projects/test-project-123/business-plan',
      )
    })

    it('ignores stepKey for MARKET', () => {
      expect(resolveModuleRoute(projectId, 'MARKET', 'gbm_8')).toBe(
        '/dashboard/project-owner/projects/test-project-123/market',
      )
    })
  })
})
