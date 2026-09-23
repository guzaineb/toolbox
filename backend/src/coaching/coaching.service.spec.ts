import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { CoachingService } from './coaching.service';

const empty = () => jest.fn();

describe("CoachingService — politique d'accès aux sessions", () => {
  let service: CoachingService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let access: {
    assertProjectExists: jest.Mock;
    hasActiveAssignment: jest.Mock;
    getAcceptedCohortsForProject: jest.Mock;
    isCohortCoachOfProject: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      project: { findUnique: empty() },
      coachingSession: { findMany: empty(), findUnique: empty() },
      incubatorMember: { findUnique: empty() },
    };
    access = {
      assertProjectExists: jest.fn().mockResolvedValue(undefined),
      hasActiveAssignment: jest.fn().mockResolvedValue(false),
      getAcceptedCohortsForProject: jest.fn().mockResolvedValue([]),
      isCohortCoachOfProject: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachingService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModuleAccessService, useValue: access },
        { provide: AuditService, useValue: {} },
        { provide: NotificationMessageBuilder, useValue: {} },
      ],
    }).compile();

    service = module.get(CoachingService);
  });

  describe('findMyCoachingSessions (VUE EXPERT — agenda expert)', () => {
    it('filtre côté serveur sur expert_user_id + rôle COACH', async () => {
      prisma.coachingSession.findMany.mockResolvedValue([{ id: 's-1' }]);

      const result = await service.findMyCoachingSessions('u-exp');

      expect(prisma.coachingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignment: expect.objectContaining({
              expert_user_id: 'u-exp',
              role: 'COACH',
            }),
          }),
          orderBy: { scheduled_at: 'desc' },
        }),
      );
      expect(result).toEqual([{ id: 's-1' }]);
    });

    it("ne révèle jamais les sessions d'un autre expert", async () => {
      prisma.coachingSession.findMany.mockResolvedValue([]);

      const result = await service.findMyCoachingSessions('u-exp');

      expect(result).toEqual([]);
      expect(prisma.coachingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignment: expect.objectContaining({
              expert_user_id: 'u-exp',
              role: 'COACH',
            }),
          }),
        }),
      );
    });
  });

  describe('findSessionsByProject (agenda porteur)', () => {
    it('refuse un utilisateur sans droit (ni porteur, ni coach, ni membre incubateur)', async () => {
      prisma.project.findUnique.mockResolvedValue({ owner_id: 'u-owner' });
      prisma.coachingSession.findMany.mockResolvedValue([]);

      await expect(service.findSessionsByProject('p-1', 'u-outside')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.coachingSession.findMany).not.toHaveBeenCalled();
    });

    it('autorise le porteur du projet et ne retourne que les sessions de ce projet', async () => {
      prisma.project.findUnique.mockResolvedValue({ owner_id: 'u-owner' });
      prisma.coachingSession.findMany.mockResolvedValue([{ id: 's-1' }]);

      const result = await service.findSessionsByProject('p-1', 'u-owner');

      expect(prisma.coachingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assignment: { project_id: 'p-1' } },
        }),
      );
      expect(result).toEqual([{ id: 's-1' }]);
    });
  });
});