import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JurySessionStatus } from '@prisma/client';
import { JuriesService } from './juries.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('JuriesService', () => {
  let service: JuriesService;
  let prisma: {
    user: { findUnique: jest.Mock };
    cohortExpert: { findFirst: jest.Mock };
    projectExpertAssignment: { findFirst: jest.Mock };
    jurySession: { create: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock; update: jest.Mock };
    incubatorMember: { findUnique: jest.Mock };
    project: { findUnique: jest.Mock };
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
    juryAssigned: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: { findUnique: jest.fn() },
      cohortExpert: { findFirst: jest.fn() },
      projectExpertAssignment: { findFirst: jest.fn() },
      jurySession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      incubatorMember: { findUnique: jest.fn() },
      project: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JuriesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModuleAccessService, useValue: access },
        { provide: AuditService, useValue: audit },
        { provide: NotificationMessageBuilder, useValue: messageBuilder },
      ],
    }).compile();

    service = module.get<JuriesService>(JuriesService);
  });

  it('should reject an invalid status transition (CLOSED → OPEN)', async () => {
    prisma.jurySession.findUnique.mockResolvedValue({
      id: 'session-1',
      project_id: 'project-1',
      cohort_id: 'cohort-1',
      status: JurySessionStatus.CLOSED,
      reevaluation_requested: false,
    });
    access.assertCanManageCohort.mockResolvedValue(undefined);

    await expect(
      service.update('session-1', { status: JurySessionStatus.OPEN }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.jurySession.update).not.toHaveBeenCalled();
  });

  it('should reject creating a session with a member who is not an active jury', async () => {
    access.assertProjectExists.mockResolvedValue(undefined);
    access.assertCanManageCohort.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue({ id: 'expert-1', role: 'EXPERT' });
    prisma.cohortExpert.findFirst.mockResolvedValue(null);
    prisma.projectExpertAssignment.findFirst.mockResolvedValue(null);

    await expect(
      service.create('project-1', { title: 'Délibération', memberUserIds: ['expert-1'] }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.jurySession.create).not.toHaveBeenCalled();
  });
});
