import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { FundingService } from './funding.service';
import { PrismaService } from '../prisma/prisma.service';
import { SectionStepService } from '../common/services/section-step.service';

describe('FundingService', () => {
  let service: FundingService;
  let sections: {
    ensureOwnership: jest.Mock;
    assertMissingAnswers: jest.Mock;
    saveSection: jest.Mock;
  };
  let prisma: {
    fundingAssessment: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sections = {
      ensureOwnership: jest.fn(),
      assertMissingAnswers: jest.fn(),
      saveSection: jest.fn().mockResolvedValue({ project_id: 'project-1' }),
    };
    prisma = {
      fundingAssessment: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundingService,
        { provide: PrismaService, useValue: prisma },
        { provide: SectionStepService, useValue: sections },
      ],
    }).compile();

    service = module.get<FundingService>(FundingService);
  });

  it('should block a non-owner from updating the funding assessment (403)', async () => {
    sections.ensureOwnership.mockRejectedValue(
      new ForbiddenException("Vous n'êtes pas le propriétaire de ce projet"),
    );

    await expect(
      service.updateAssessment(
        'project-1',
        { opportunites_pays: 'France' },
        'user-b',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(sections.saveSection).not.toHaveBeenCalled();
  });

  it('should allow the owner to update the funding assessment', async () => {
    sections.ensureOwnership.mockResolvedValue({
      id: 'project-1',
      owner_id: 'user-a',
    });
    prisma.fundingAssessment.findUnique.mockResolvedValue(null);

    const data = {
      opportunites_financement: { bail: true },
      opportunites_pays: 'France',
      strategie_levee_fonds: 'AMORTISSEMENT',
    };

    const result = await service.updateAssessment('project-1', data, 'user-a');

    expect(sections.ensureOwnership).toHaveBeenCalledWith(
      'project-1',
      'user-a',
    );
    expect(sections.saveSection).toHaveBeenCalledWith(
      prisma.fundingAssessment,
      'project-1',
      data,
      {
        allowedFields: [
          'opportunites_financement',
          'opportunites_pays',
          'strategie_levee_fonds',
        ],
      },
    );
    expect(result).toEqual({ project_id: 'project-1' });
  });
});