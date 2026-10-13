import { Test, TestingModule } from '@nestjs/testing';
import { ExpertRecommendationService } from './expert-recommendation.service';
import { ExpertScoringService } from './expert-scoring.service';
import { ProjectProfileBuilder } from './project-profile-builder.service';
import { ExpertSemanticRanker } from './expert-semantic-ranker.service';
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

  // `scoreBatch` renvoie null par défaut : les tests existants valident le
  // repli par règles. Les cas sémantiques surchargent explicitement le mock.
  const ranker = {
    scoreBatch: jest.fn(),
    explainBatch: jest.fn(),
    buildExpertText: jest.fn(),
    expertLabel: jest.fn(),
  };

  const projectFixture = (overrides: Record<string, unknown> = {}) => ({
    id: 'p1',
    name: 'Projet fintech',
    description: 'solution de finance et de marketing digital',
    context_summary: { summary_text: null },
    idea_sketch: null,
    problems_needs: null,
    funding_assessment: { phase_maturite: 'VALIDATION' },
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.expertiseArea.findMany.mockResolvedValue(areas);
    ranker.scoreBatch.mockResolvedValue(null);
    ranker.explainBatch.mockResolvedValue(new Map());
    ranker.buildExpertText.mockReturnValue('texte du profil expert');
    ranker.expertLabel.mockReturnValue('Expert Test');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertRecommendationService,
        ExpertScoringService,
        ProjectProfileBuilder,
        { provide: ExpertSemanticRanker, useValue: ranker },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ExpertRecommendationService>(
      ExpertRecommendationService,
    );
  });

  it('recommande les experts par alignement réel avec les exigences du projet', async () => {
    prisma.project.findUnique.mockResolvedValue(projectFixture());
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
    prisma.project.findUnique.mockResolvedValue(
      projectFixture({
        name: 'Projet',
        description: 'description générique sans domaine clair',
        funding_assessment: null,
      }),
    );
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

  it('classe par similarité sémantique et rédige les explications avec le LLM', async () => {
    prisma.project.findUnique.mockResolvedValue(projectFixture());
    prisma.expertProfile.findMany.mockResolvedValue([expertA, expertB]);
    ranker.scoreBatch.mockResolvedValue(
      new Map([
        ['expert-a', 30],
        ['expert-b', 82],
      ]),
    );
    ranker.explainBatch.mockResolvedValue(
      new Map([['expert-b', 'Profil très proche du besoin exprimé.']]),
    );

    const results = await service.recommendForProject('p1', 3);

    expect(ranker.scoreBatch).toHaveBeenCalledTimes(1);
    expect(results.map((entry) => entry.expert.id)).toEqual([
      'expert-b',
      'expert-a',
    ]);
    expect(results[0].score).toBe(82);
    expect(results[0].scoringMethod).toBe('SEMANTIC');
    expect(results[0].explanation).toBe(
      'Profil très proche du besoin exprimé.',
    );
    // L'expert sans explication LLM conserve l'explication par règles.
    expect(results[1].explanation).toContain(
      'Expertise fortement alignée avec les besoins du projet',
    );
  });

  it('retombe sur les règles (sans appel LLM) quand les embeddings sont indisponibles', async () => {
    prisma.project.findUnique.mockResolvedValue(projectFixture());
    prisma.expertProfile.findMany.mockResolvedValue([expertA, expertB]);
    ranker.scoreBatch.mockResolvedValue(null);

    const results = await service.recommendForProject('p1', 3);

    expect(results[0].scoringMethod).toBe('RULES');
    expect(results[0].explanation).toContain(
      'Expertise fortement alignée avec les besoins du projet',
    );
    expect(ranker.explainBatch).not.toHaveBeenCalled();
  });

  it('applique le seuil minScore au classement retenu', async () => {
    prisma.project.findUnique.mockResolvedValue(projectFixture());
    prisma.expertProfile.findMany.mockResolvedValue([expertA, expertB]);
    ranker.scoreBatch.mockResolvedValue(
      new Map([
        ['expert-a', 30],
        ['expert-b', 82],
      ]),
    );

    const results = await service.recommendForProject('p1', 3, {
      minScore: 50,
    });

    expect(results).toHaveLength(1);
    expect(results[0].expert.id).toBe('expert-b');
  });
});
