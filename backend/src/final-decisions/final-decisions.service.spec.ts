import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConditionStatus, FinalDecisionType } from '@prisma/client';
import { FinalDecisionsService } from './final-decisions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('FinalDecisionsService', () => {
  let service: FinalDecisionsService;
  let prisma: {
    finalDecision: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    finalDecisionCondition: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    project: { findUnique: jest.Mock };
    incubatorMember: { findUnique: jest.Mock };
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
    finalDecisionMade: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
    reevaluationRequested: jest
      .fn()
      .mockReturnValue({ title: 'T', message: 'M' }),
    finalDecisionUpdated: jest
      .fn()
      .mockReturnValue({ title: 'T', message: 'M' }),
    finalDecisionConditionsAdded: jest
      .fn()
      .mockReturnValue({ title: 'T', message: 'M' }),
    conditionValidated: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      finalDecision: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      finalDecisionCondition: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      project: { findUnique: jest.fn() },
      incubatorMember: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalDecisionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModuleAccessService, useValue: access },
        { provide: AuditService, useValue: audit },
        { provide: NotificationMessageBuilder, useValue: messageBuilder },
      ],
    }).compile();

    service = module.get<FinalDecisionsService>(FinalDecisionsService);
  });

  it('should require at least one condition for a CONDITIONAL decision', async () => {
    access.assertProjectExists.mockResolvedValue(undefined);
    access.assertCanManageCohort.mockResolvedValue(undefined);

    await expect(
      service.makeDecision(
        'project-1',
        { decision: FinalDecisionType.CONDITIONAL },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.finalDecision.create).not.toHaveBeenCalled();
    expect(prisma.finalDecision.update).not.toHaveBeenCalled();
  });

  it('should validate a condition and notify the project owner', async () => {
    const condition = {
      id: 'cond-1',
      description: 'Fournir un plan de trésorerie',
      status: ConditionStatus.PENDING,
      decision: {
        cohort_id: 'cohort-1',
        project: { id: 'project-1', name: 'Projet A', owner_id: 'owner-1' },
      },
    };
    const validated = { id: 'cond-1', status: ConditionStatus.COMPLETED };
    prisma.finalDecisionCondition.findUnique.mockResolvedValue(condition);
    prisma.finalDecisionCondition.update.mockResolvedValue(validated);
    access.assertCanManageCohort.mockResolvedValue(undefined);

    const result = await service.validateCondition('cond-1', 'admin-1');

    expect(result).toEqual(validated);
    expect(prisma.finalDecisionCondition.update).toHaveBeenCalledWith({
      where: { id: 'cond-1' },
      data: {
        status: ConditionStatus.COMPLETED,
        validated_by: 'admin-1',
        validated_at: expect.any(Date),
      },
      include: { decision: true },
    });
    expect(access.notify).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: [{ userId: 'owner-1' }] }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CONDITION_VALIDATE' }),
    );
  });
});
