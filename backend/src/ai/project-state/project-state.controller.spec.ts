import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ProjectStateController } from './project-state.controller';
import { ProjectStateService } from './project-state.service';

describe('ProjectStateController (sécurité BOLA / IDOR)', () => {
  let controller: ProjectStateController;
  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };
  const projectStateMock = {
    getProjectState: jest.fn(),
  };

  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectStateController],
      providers: [
        { provide: ProjectStateService, useValue: projectStateMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();

    controller = module.get<ProjectStateController>(ProjectStateController);
  });

  it('should be défini', () => {
    expect(controller).toBeDefined();
  });

  it('est protégé par JwtAuthGuard (utilisateur non authentifié rejeté au niveau garde)', () => {
    const guards = Reflect.getMetadata('__guards__', ProjectStateController) as
      | Array<{ name?: string } | (new (...args: any[]) => unknown)>
      | undefined;
    expect(guards).toBeDefined();
    expect(guards?.some((g) => (g as any) === JwtAuthGuard)).toBe(true);
  });

  describe('GET /ai/project-state/:projectId', () => {
    it('propriétaire autorisé : vérifie l\'accès puis délègue au service', async () => {
      const mockState = {
        projectId: '11111111-1111-1111-1111-111111111111',
        projectName: 'Mon projet',
        maturityLevel: 'DEVELOPING',
        overallProgress: 45,
        completedSteps: [],
        incompleteSteps: [],
        missingInformation: [],
        strengths: [],
        weakAreas: [],
        inconsistencies: [],
        healthScore: { overall: 60, categories: [] },
        priorities: [],
        currentPriority: null,
        recommendedNextAction: 'Continuer',
      };
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      projectStateMock.getProjectState.mockResolvedValue(mockState);

      const result = await controller.getProjectState(
        '11111111-1111-1111-1111-111111111111',
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
      );
      expect(projectStateMock.getProjectState).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
      );
      expect(result).toEqual({ data: mockState });
    });

    it('l\'identité vient de req.user, jamais d\'un userId envoyé par le client', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      projectStateMock.getProjectState.mockResolvedValue({ projectId: 'x' });

      await controller.getProjectState(
        '11111111-1111-1111-1111-111111111111',
        req('real-user'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'real-user',
      );
    });

    it('utilisateur non propriétaire / sans accès : rejeté 403, le service n\'est pas appelé', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      await expect(
        controller.getProjectState(
          '22222222-2222-2222-2222-222222222222',
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(projectStateMock.getProjectState).not.toHaveBeenCalled();
    });

    it('projectId inexistant : rejeté 404 (NotFound du check d\'accès)', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new NotFoundException('Projet introuvable'),
      );

      await expect(
        controller.getProjectState(
          '33333333-3333-3333-3333-333333333333',
          req('user-1'),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(projectStateMock.getProjectState).not.toHaveBeenCalled();
    });

    it('coach affecté au projet : autorisé via assertCanAccessProject', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      projectStateMock.getProjectState.mockResolvedValue({ projectId: 'x' });

      const result = await controller.getProjectState(
        '11111111-1111-1111-1111-111111111111',
        req('coach-user'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'coach-user',
      );
      expect(result).toEqual({ data: { projectId: 'x' } });
    });

    it('membre d\'un incubateur : autorisé via assertCanAccessProject', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      projectStateMock.getProjectState.mockResolvedValue({ projectId: 'x' });

      const result = await controller.getProjectState(
        '11111111-1111-1111-1111-111111111111',
        req('incubator-member'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'incubator-member',
      );
      expect(result).toEqual({ data: { projectId: 'x' } });
    });
  });
});
