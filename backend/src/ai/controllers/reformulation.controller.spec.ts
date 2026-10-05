import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ReformulationController } from './reformulation.controller';
import { ReformulationService } from '../reformulation.service';

describe('ReformulationController (sécurité BOLA / IDOR)', () => {
  let controller: ReformulationController;
  const accessMock = { assertCanAccessProject: jest.fn() };
  const reformulationMock = {
    reformulateStep: jest.fn(),
    reformulateText: jest.fn(),
  };
  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });
  const PID = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReformulationController],
      providers: [
        { provide: ReformulationService, useValue: reformulationMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();
    controller = module.get<ReformulationController>(ReformulationController);
  });

  it('should be défini', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /ai/reformulation/step', () => {
    it('propriétaire autorisé : vérifie l’accès puis reformule', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      reformulationMock.reformulateStep.mockResolvedValue({
        reformulated: 'x',
      });

      await controller.reformulateStep(
        { projectId: PID, stepKey: 'gbm_1', audience: 'avance' },
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        PID,
        'user-1',
      );
      expect(reformulationMock.reformulateStep).toHaveBeenCalledWith(
        PID,
        'gbm_1',
        'avance',
      );
    });

    it('projet d’autrui : rejeté 403, service non appelé', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      await expect(
        controller.reformulateStep(
          { projectId: PID, stepKey: 'gbm_1' },
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(reformulationMock.reformulateStep).not.toHaveBeenCalled();
    });
  });

  describe('POST /ai/reformulation/text', () => {
    it('sans projectId : reste accessible aux utilisateurs authentifiés', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      reformulationMock.reformulateText.mockResolvedValue({
        reformulated: 'x',
      });

      await controller.reformulateText({
        text: 'bonjour',
        stepConcept: 'idée',
      });

      expect(accessMock.assertCanAccessProject).not.toHaveBeenCalled();
      expect(reformulationMock.reformulateText).toHaveBeenCalledWith(
        'bonjour',
        'idée',
        undefined,
      );
    });
  });
});
