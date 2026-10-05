import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EvaluationTemplatesService } from './evaluation-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('EvaluationTemplatesService', () => {
  let service: EvaluationTemplatesService;
  let prisma: {
    evaluationTemplate: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    cohort: { findUnique: jest.Mock };
    incubatorMember: { findMany: jest.Mock };
  };

  const access = {
    assertCanManageCohort: jest.fn(),
    notify: jest.fn(),
  };
  const audit = { log: jest.fn() };
  const messageBuilder = {
    templatePublished: jest.fn().mockReturnValue({ title: 'T', message: 'M' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      evaluationTemplate: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      cohort: { findUnique: jest.fn() },
      incubatorMember: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationTemplatesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ModuleAccessService, useValue: access },
        { provide: AuditService, useValue: audit },
        { provide: NotificationMessageBuilder, useValue: messageBuilder },
      ],
    }).compile();

    service = module.get<EvaluationTemplatesService>(
      EvaluationTemplatesService,
    );
  });

  it('should refuse to publish a template whose weights do not sum to 100', async () => {
    prisma.evaluationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
      cohort_id: 'cohort-1',
      criteria: [
        { id: 'c1', weight: 50 },
        { id: 'c2', weight: 40 },
      ],
    });
    access.assertCanManageCohort.mockResolvedValue(undefined);

    await expect(service.publish('template-1', 'admin-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(prisma.evaluationTemplate.update).not.toHaveBeenCalled();
  });

  it('should publish a template whose weights sum to 100', async () => {
    prisma.evaluationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
      cohort_id: 'cohort-1',
      criteria: [
        { id: 'c1', weight: 60 },
        { id: 'c2', weight: 40 },
      ],
    });
    prisma.evaluationTemplate.update.mockResolvedValue({
      id: 'template-1',
      published: true,
      locked_at: new Date(),
    });
    access.assertCanManageCohort.mockResolvedValue(undefined);

    const result = await service.publish('template-1', 'admin-1');

    expect(result.published).toBe(true);
    expect(prisma.evaluationTemplate.update).toHaveBeenCalledWith({
      where: { id: 'template-1' },
      data: { published: true, locked_at: expect.any(Date) },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'EVALUATION_TEMPLATE_PUBLISH' }),
    );
  });
});
