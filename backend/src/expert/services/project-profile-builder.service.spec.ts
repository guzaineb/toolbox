import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectProfileBuilder } from './project-profile-builder.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjectProfileBuilder', () => {
  let builder: ProjectProfileBuilder;

  const areas = [
    { id: 'a1', name: 'Stratégie', category: 'Management' },
    { id: 'a2', name: 'Finance', category: 'Comptabilité' },
    { id: 'a3', name: 'Marketing', category: 'Croissance' },
    { id: 'a4', name: 'Technologie', category: 'Innovation' },
  ];

  const prisma = {
    expertiseArea: { findMany: jest.fn() },
    project: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.expertiseArea.findMany.mockResolvedValue(areas);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectProfileBuilder,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    builder = module.get<ProjectProfileBuilder>(ProjectProfileBuilder);
  });

  it('dérive les domaines requis à partir du texte du projet', async () => {
    const requirements = await builder.deriveRequirementsFromText([
      'Notre solution de finance couvre aussi le marketing digital.',
    ]);

    expect(requirements.requiredAreas).toContain('a2');
    expect(requirements.requiredAreas).toContain('a3');
    expect(requirements.requiredAreaNames).toEqual(
      expect.arrayContaining(['Finance', 'Marketing']),
    );
    expect(requirements.minYearsExperience).toBe(2);
  });

  it('renvoie une liste vide sans exigence minimale quand aucun domaine ne correspond', async () => {
    const requirements = await builder.deriveRequirementsFromText([
      'Bilan et compte de résultat trimestriel uniquement.',
    ]);

    expect(requirements.requiredAreas).toHaveLength(0);
    expect(requirements.minYearsExperience).toBe(2);
  });

  it('dérive les années minimales depuis la phase de maturité du projet', async () => {
    const requirements = await builder.deriveRequirementsFromText(
      ['marketing'],
      undefined,
    );
    expect(requirements.requiredAreas).toEqual(['a3']);
  });

  it('utilise la phase de maturité pour le minYears d’un projet chargé', async () => {
    const requirements = await builder.deriveProjectRequirements({
      id: 'p1',
      name: 'Projet Green',
      description: 'growth marketing pour la finance verte',
      context_summary: { summary_text: null },
      idea_sketch: {
        idea_initial: null,
        product_service: null,
        customers: null,
        partners: null,
      },
      problems_needs: {
        environmental_challenges: null,
        social_challenges: null,
      },
      funding_assessment: { phase_maturite: 'GROWTH' },
    });

    expect(requirements.minYearsExperience).toBe(5);
    expect(requirements.requiredAreas).toEqual(
      expect.arrayContaining(['a2', 'a3']),
    );
  });

  it('charge le projet puis dérive ses exigences', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      name: 'Projet fintech',
      description: null,
      context_summary: { summary_text: 'finance' },
      idea_sketch: null,
      problems_needs: null,
      funding_assessment: null,
    });

    const requirements = await builder.buildProjectRequirements('p1');

    expect(requirements.requiredAreas).toContain('a2');
    expect(requirements.minYearsExperience).toBe(2);
  });

  it('lève NotFoundException sur un projet inconnu', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(builder.buildProjectRequirements('p-unknown')).rejects.toThrow(
      NotFoundException,
    );
  });
});