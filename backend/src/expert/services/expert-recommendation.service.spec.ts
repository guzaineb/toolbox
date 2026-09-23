import { Test, TestingModule } from '@nestjs/testing';
import { ExpertRecommendationService } from './expert-recommendation.service';
import { ExpertScoringService } from './expert-scoring.service';
import { ProjectProfileBuilder } from './project-profile-builder.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ExpertRecommendationService', () => {
  let service: ExpertRecommendationService;

  const areas = [
    { id: 'a1', name: 'Stratégie', category: 'Management' },
    { id: 'a2', name: 'Finance', category: 'Comptabilité' },
    { id: 'a3', name: 'Marketing', category: 'Croissance' },
  ];

  const expertA = {
    id: 'expert-a',
    headline: 'Expert finance et marketing',
    years_of_experience: 8,
    availability_status: 'AVAILABLE',
    user: { id: 'user-a' },
    expertiseConnections: [
      { expertiseArea: { id: 'a2' } },
      { expertiseArea: { id: 'a3' } },
    ],
  };

  const expertB = {
    id: 'expert-b',
    headline: 'Expert stratégie',
    years_of_experience: 3,
    availability_status: 'BUSY',
    user: { id: 'user-b' },
    expertiseConnections: [{ expertiseArea: { id: 'a1' } }],
  };

  const prisma = {
    expertiseArea: { findMany: jest.fn() },
    expertProfile: { findMany: jest.fn() },
    project: { findUnique: jest.fn() },
    cohort: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.expertiseArea.findMany.mockResolvedValue(areas);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertRecommendationService,
        ExpertScoringService,
        ProjectProfileBuilder,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ExpertRecommendationService>(
      ExpertRecommendationService,
    );
  });

  it('recommande les experts par alignement réel avec les exigences du projet', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      name: 'Projet fintech',
      description: 'solution de finance et de marketing digital',
      context_summary: { summary_text: null },
      idea_sketch: null,
      problems_needs: null,
      funding_assessment: { phase_maturite: 'VALIDATION' },
    });
    prisma.expertProfile.findMany.mockResolvedValue([expertA, expertB]);

    const results = await service.recommendForProject('p1', 3);

    expect(results).toHaveLength(2);
    expect(results[0].expert.id).toBe('expert-a');
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[0].skillsMatch).toEqual({
      matched: 2,
      required: 2,
      score: 60,
    });
    expect(results[0].experienceMatch.required).toBe(3);
    expect(results[0].availability).toBe('AVAILABLE');
    expect(results[0].explanation).toContain(
      'Expertise fortement alignée avec les besoins du projet',
    );
  });

  it('sans domaine requis détecté, aucun score NaN et classement stable', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      name: 'Projet',
      description: 'description générique sans domaine clair',
      context_summary: { summary_text: null },
      idea_sketch: null,
      problems_needs: null,
      funding_assessment: null,
    });
    prisma.expertProfile.findMany.mockResolvedValue([expertA]);

    const results = await service.recommendForProject('p1', 3);

    expect(results).toHaveLength(1);
    expect(Number.isNaN(results[0].score)).toBe(false);
    expect(results[0].skillsMatch.required).toBe(0);
  });

  it('recommande des coachs à partir des exigences dérivées de la cohorte', async () => {
    prisma.cohort.findUnique.mockResolvedValue({
      name: 'Cohorte finance verte',
      program: 'Accélérateur finance',
      description: null,
    });
    prisma.expertProfile.findMany.mockResolvedValue([expertA, expertB]);

    const results = await service.recommendCoachs('c1', 3, []);

    expect(results).toHaveLength(2);
    expect(results[0].expert.id).toBe('expert-a');
    expect(results[0].explanation).toBeDefined();
  });
});