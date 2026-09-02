import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GbmService, GbmStepIssue } from './gbm.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SectionStepService } from '../common/services/section-step.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

interface GbmReviewError {
  response: { message: string; missingSteps: GbmStepIssue[] };
}

async function captureReviewError(
  fn: () => Promise<unknown>,
): Promise<GbmReviewError | undefined> {
  try {
    await fn();
    return undefined;
  } catch (e) {
    return e as GbmReviewError;
  }
}

const ONE_TO_ONE_MODELS = [
  'ideaSketch',
  'problemsNeeds',
  'pestel',
  'objective',
  'missionVision',
  'valueProposition',
  'valuePropositionPivot',
  'customerRelationsChannel',
  'keyActivitiesResource',
  'ecoDesign',
  'ecoDesignResult',
  'costStructure',
  'revenueStream',
  'testPreparation',
  'indicator',
];

const FIELD_BY_MODEL: Record<string, string> = {
  ideaSketch: 'idea_initial',
  problemsNeeds: 'environmental_challenges',
  pestel: 'political_what',
  objective: 'environmental_problems',
  missionVision: 'mission',
  valueProposition: 'environmental_value',
  valuePropositionPivot: 'initial_assumptions',
  customerRelationsChannel: 'customer_relationships',
  keyActivitiesResource: 'key_activities',
  ecoDesign: 'equipe_eco',
  ecoDesignResult: 'eco_results',
  costStructure: 'fixed_costs',
  revenueStream: 'revenue_sources',
  testPreparation: 'test_objectives',
  indicator: 'environmental_kpis',
};

const ONE_TO_MANY_MODELS = [
  'stakeholder',
  'stakeholderMap',
  'customerSegment',
  'testDiscovery',
  'customerJourney',
];

const VALID_MANY_ITEMS: Record<string, Record<string, unknown>[]> = {
  stakeholder: [{ id: '1', name: 'Mairie', role: 'Régulateur' }],
  stakeholderMap: [
    {
      id: '1',
      stakeholder_name: 'Mairie',
      contribution: 'Terrain',
      reward: 'Image',
    },
  ],
  customerSegment: [{ id: '1', segment_name: 'PME', pains: 'Coûts' }],
  testDiscovery: [{ id: '1', hypothesis: 'H', test_method: 'Entretien' }],
  customerJourney: [{ id: '1', stage_name: 'Achat', touchpoints: 'Boutique' }],
};

type MockModel = {
  findUnique: jest.Mock;
  findMany: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
};

describe('GbmService — D3 (one-to-many cohérent lors de la review)', () => {
  let service: GbmService;
  const svc = () =>
    service as unknown as {
      syncStepStatus(projectId: string, stepKey: string): Promise<void>;
    };
  let prisma: Record<string, MockModel> & { project: { update: jest.Mock } };
  let sections: {
    markStepProgress: jest.Mock;
    markStepComplete: jest.Mock;
    ensureOwnership: jest.Mock;
  };

  const model = (key: string) => prisma[key];

  beforeEach(async () => {
    prisma = {} as typeof prisma;
    for (const key of [
      ...ONE_TO_ONE_MODELS,
      ...ONE_TO_MANY_MODELS,
      'contextSummary',
      'summaryActivity',
      'costRevenueSummary',
      'swotAnalysis',
    ]) {
      prisma[key] = {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };
    }
    prisma.project = { update: jest.fn().mockResolvedValue({ id: 'proj' }) };

    // Baseline : toutes les étapes one-to-one valides, one-to-many vides.
    for (const key of ONE_TO_ONE_MODELS) {
      model(key).findUnique.mockResolvedValue({
        [FIELD_BY_MODEL[key]]: 'contenu',
      });
    }
    for (const key of ONE_TO_MANY_MODELS) {
      model(key).findMany.mockResolvedValue([]);
    }

    sections = {
      markStepProgress: jest.fn(),
      markStepComplete: jest.fn(),
      ensureOwnership: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GbmService,
        { provide: PrismaService, useValue: prisma },
        { provide: SectionStepService, useValue: sections },
        {
          provide: ModuleAccessService,
          useValue: { assertCanAccessProject: jest.fn() },
        },
        { provide: AiService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: NotificationMessageBuilder,
          useValue: {
            stepCompleted: jest
              .fn()
              .mockReturnValue({ title: 'Titre', message: 'Message' }),
          },
        },
      ],
    }).compile();

    service = module.get<GbmService>(GbmService);
  });

  describe('getMissingRequiredSteps', () => {
    it('signale les 5 étapes one-to-many quand elles sont vides', async () => {
      const missing = await service.getMissingRequiredSteps('proj');
      const keys = missing.map((s) => s.stepKey).sort();
      expect(keys).toEqual(
        ['gbm_10', 'gbm_12b', 'gbm_7a', 'gbm_7b', 'gbm_8'].sort(),
      );
    });

    it('retire une étape one-to-many dès qu’un élément valide existe', async () => {
      model('stakeholder').findMany.mockResolvedValue(
        VALID_MANY_ITEMS.stakeholder,
      );
      const missing = await service.getMissingRequiredSteps('proj');
      expect(missing.some((s) => s.stepKey === 'gbm_7a')).toBe(false);
      expect(missing).toHaveLength(4);
    });

    it('considère manquante une étape one-to-many avec éléments tous incomplets', async () => {
      model('stakeholder').findMany.mockResolvedValue([
        { id: '1', name: 'Mairie' },
      ]);
      const missing = await service.getMissingRequiredSteps('proj');
      const gbm7a = missing.find((s) => s.stepKey === 'gbm_7a');
      expect(gbm7a).toBeTruthy();
    });

    it('considère manquante une étape one-to-one sans contenu réel (record creux)', async () => {
      model('ideaSketch').findUnique.mockResolvedValue({
        idea_initial: '   ',
        product_service: '',
      });
      const missing = await service.getMissingRequiredSteps('proj');
      expect(missing.some((s) => s.stepKey === 'gbm_1')).toBe(true);
    });

    it('retourne [] quand toutes les étapes requises sont valides', async () => {
      for (const key of ONE_TO_MANY_MODELS) {
        model(key).findMany.mockResolvedValue(VALID_MANY_ITEMS[key]);
      }
      await expect(service.getMissingRequiredSteps('proj')).resolves.toEqual(
        [],
      );
    });
  });

  describe('reviewGbm', () => {
    it('valide la révision quand toutes les étapes sont complètes', async () => {
      for (const key of ONE_TO_MANY_MODELS) {
        model(key).findMany.mockResolvedValue(VALID_MANY_ITEMS[key]);
      }
      const result = await service.reviewGbm('proj', 'user');
      expect(prisma.project.update).toHaveBeenCalledTimes(1);
      const updateArgs = (
        prisma.project.update.mock.calls as unknown as {
          where: { id: string };
          data: { gbm_reviewed_at: Date; is_gbm_reviewed: boolean };
        }[][]
      )[0][0];
      expect(updateArgs.where).toEqual({ id: 'proj' });
      expect(updateArgs.data.is_gbm_reviewed).toBe(true);
      expect(updateArgs.data.gbm_reviewed_at).toBeInstanceOf(Date);
      expect(result).toMatchObject({ message: 'GBM review completed' });
      expect(
        (result as { gbm_reviewed_at?: Date }).gbm_reviewed_at,
      ).toBeInstanceOf(Date);
    });

    it('bloque la révision avec un diagnostic détaillé quand les one-to-many sont vides', async () => {
      const error = await captureReviewError(() =>
        service.reviewGbm('proj', 'user'),
      );
      expect(error).toBeInstanceOf(BadRequestException);
      const issues = error!.response.missingSteps;
      expect(issues).toHaveLength(5);
      expect(issues[0]).toMatchObject({
        relation: 'one-to-many',
        status: 'EMPTY',
        items: 0,
      });
      expect(
        issues.every(
          (i) => typeof i.title === 'string' && typeof i.detail === 'string',
        ),
      ).toBe(true);
      expect(prisma.project.update).not.toHaveBeenCalled();
    });

    it('distingue une étape INCOMPLETE (éléments présents mais aucun valide)', async () => {
      model('stakeholder').findMany.mockResolvedValue([
        { id: '1', name: 'Mairie' },
      ]);
      for (const key of ONE_TO_MANY_MODELS.filter((k) => k !== 'stakeholder')) {
        model(key).findMany.mockResolvedValue(VALID_MANY_ITEMS[key]);
      }
      const error = await captureReviewError(() =>
        service.reviewGbm('proj', 'user'),
      );
      const gbm7a = error!.response.missingSteps.find(
        (i) => i.stepKey === 'gbm_7a',
      );
      expect(gbm7a).toMatchObject({
        status: 'INCOMPLETE',
        items: 1,
        relation: 'one-to-many',
      });
      expect(gbm7a!.requiredFields).toContain('Nom de la partie prenante');
    });

    it('signale une étape one-to-one vide', async () => {
      model('ideaSketch').findUnique.mockResolvedValue(null);
      for (const key of ONE_TO_MANY_MODELS) {
        model(key).findMany.mockResolvedValue(VALID_MANY_ITEMS[key]);
      }
      const error = await captureReviewError(() =>
        service.reviewGbm('proj', 'user'),
      );
      expect(error!.response.missingSteps).toEqual([
        expect.objectContaining({
          stepKey: 'gbm_1',
          relation: 'one-to-one',
          status: 'EMPTY',
        }),
      ]);
    });
  });

  describe('syncStepStatus', () => {
    it('one-to-many sans élément → NOT_STARTED', async () => {
      await svc().syncStepStatus('proj', 'gbm_7a');
      expect(sections.markStepProgress).toHaveBeenCalledWith(
        'proj',
        'gbm_7a',
        'NOT_STARTED',
      );
      expect(sections.markStepComplete).not.toHaveBeenCalled();
    });

    it('one-to-many avec éléments incomplets → IN_PROGRESS', async () => {
      model('stakeholder').findMany.mockResolvedValue([
        { id: '1', name: 'Mairie' },
      ]);
      await svc().syncStepStatus('proj', 'gbm_7a');
      expect(sections.markStepProgress).toHaveBeenCalledWith(
        'proj',
        'gbm_7a',
        'IN_PROGRESS',
      );
    });

    it('one-to-many avec ≥1 élément valide → COMPLETED', async () => {
      model('stakeholder').findMany.mockResolvedValue(
        VALID_MANY_ITEMS.stakeholder,
      );
      await svc().syncStepStatus('proj', 'gbm_7a');
      expect(sections.markStepComplete).toHaveBeenCalledWith('proj', 'gbm_7a');
    });

    it('one-to-one sans enregistrement → NOT_STARTED (régression)', async () => {
      model('ideaSketch').findMany.mockResolvedValue([]);
      model('ideaSketch').count.mockResolvedValue(0);
      await svc().syncStepStatus('proj', 'gbm_1');
      expect(sections.markStepProgress).toHaveBeenCalledWith(
        'proj',
        'gbm_1',
        'NOT_STARTED',
      );
    });

    it('one-to-one avec enregistrement → COMPLETED (régression)', async () => {
      model('ideaSketch').count.mockResolvedValue(1);
      await svc().syncStepStatus('proj', 'gbm_1');
      expect(sections.markStepComplete).toHaveBeenCalledWith('proj', 'gbm_1');
    });
  });

  describe('addStepItem', () => {
    it('crée l’élément puis synchronise le statut selon la validité (complet)', async () => {
      model('stakeholder').create.mockResolvedValue({
        id: '1',
        name: 'Mairie',
        role: 'Régulateur',
      });
      model('stakeholder').findMany.mockResolvedValue([
        { id: '1', name: 'Mairie', role: 'Régulateur' },
      ]);

      await service.addStepItem(
        'proj',
        'gbm_7a',
        { name: 'Mairie', role: 'Régulateur', unknown_field: 'x' },
        'user',
      );

      expect(model('stakeholder').create).toHaveBeenCalledWith({
        data: { project_id: 'proj', name: 'Mairie', role: 'Régulateur' },
      });
      expect(sections.markStepComplete).toHaveBeenCalledWith('proj', 'gbm_7a');
    });

    it('crée l’élément puis marque IN_PROGRESS s’il reste incomplet (brouillon autorisé)', async () => {
      model('stakeholder').create.mockResolvedValue({
        id: '1',
        name: 'Mairie',
      });
      model('stakeholder').findMany.mockResolvedValue([
        { id: '1', name: 'Mairie' },
      ]);

      await service.addStepItem('proj', 'gbm_7a', { name: 'Mairie' }, 'user');

      expect(sections.markStepProgress).toHaveBeenCalledWith(
        'proj',
        'gbm_7a',
        'IN_PROGRESS',
      );
    });
  });
});
