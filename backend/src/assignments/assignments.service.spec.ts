import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let prisma: {
    user: { findUnique: jest.Mock };
    projectExpertAssignment: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  const access = {
    assertProjectExists: jest.fn(),
    assertProjectAcceptedInCohort: jest.fn().mockResolvedValue('cohort-1'),
    assertCanManageCohort: jest.fn(),
    getAcceptedCohortForProject: jest.fn(),
    canEvaluateProject: jest.fn(),
    notify: jest.fn(),
  };
  const audit = { log: jest.fn() };
  const messageBuilder = {
    coachAssigned: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
    evaluationAvailable: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
    coachRemoved: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: { findUnique: jest.fn() },
      projectExpertAssignment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModuleAccessService, useValue: access },
        { provide: AuditService, useValue: audit },
        { provide: NotificationMessageBuilder, useValue: messageBuilder },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  it('should reject assigning a non-expert user', async () => {
    access.assertProjectExists.mockResolvedValue(undefined);
    access.assertCanManageCohort.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'PROJECT_OWNER',
    });

    await expect(
      service.assign('project-1', { expertUserId: 'user-1', role: 'COACH' }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.projectExpertAssignment.create).not.toHaveBeenCalled();
  });

  it('should reject a duplicate assignment for the same expert/role', async () => {
    access.assertProjectExists.mockResolvedValue(undefined);
    access.assertCanManageCohort.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue({ id: 'expert-1', role: 'EXPERT' });
    prisma.projectExpertAssignment.findUnique.mockResolvedValue({
      id: 'existing-1',
    });

    await expect(
      service.assign('project-1', { expertUserId: 'expert-1', role: 'COACH' }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.projectExpertAssignment.create).not.toHaveBeenCalled();
  });
});
