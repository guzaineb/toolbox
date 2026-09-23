import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { SummaryController } from './summary.controller';
import { SummaryService } from '../summary.service';

describe('SummaryController (sécurité BOLA / IDOR)', () => {
  let controller: SummaryController;
  const accessMock = { assertCanAccessProject: jest.fn() };
  const summaryMock = {
    generateContextSummary: jest.fn(),
    generateActivitySummary: jest.fn(),
    generateCostRevenueSummary: jest.fn(),
    generateExecutiveSummary: jest.fn(),
  };
  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });
  const PID = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        { provide: SummaryService, useValue: summaryMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();
    controller = module.get<SummaryController>(SummaryController);
  });

  it('should be défini', () => {
    expect(controller).toBeDefined();
  });

  const endpoints: Array<{
    name: string;
    invoke: () => Promise<unknown>;
    service: jest.Mock;
  }> = [
    {
      name: 'context',
      invoke: () =>
        controller.generateContextSummary(
          { projectId: PID } as any,
          req('user-1'),
        ),
      service: summaryMock.generateContextSummary,
    },
    {
      name: 'activity',
      invoke: () =>
        controller.generateActivitySummary(
          { projectId: PID } as any,
          req('user-1'),
        ),
      service: summaryMock.generateActivitySummary,
    },
    {
      name: 'cost-revenue',
      invoke: () =>
        controller.generateCostRevenueSummary(
          { projectId: PID } as any,
          req('user-1'),
        ),
      service: summaryMock.generateCostRevenueSummary,
    },
    {
      name: 'executive',
      invoke: () =>
        controller.generateExecutiveSummary(
          { projectId: PID } as any,
          req('user-1'),
        ),
      service: summaryMock.generateExecutiveSummary,
    },
  ];

  for (const ep of endpoints) {
    it(`propriétaire autorisé : ${ep.name} vérifie l’accès puis délègue`, async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      ep.service.mockResolvedValue({ summaryText: 'ok' });

      await ep.invoke();

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        PID,
        'user-1',
      );
      expect(ep.service).toHaveBeenCalledWith(PID);
    });

    it(`utilisateur d’un autre projet : ${ep.name} rejeté 403, service non appelé`, async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      await expect(ep.invoke()).rejects.toThrow(ForbiddenException);
      expect(ep.service).not.toHaveBeenCalled();
    });
  }
});
