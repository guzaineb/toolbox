import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CoachingAiService } from './coaching-ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ProjectContextBuilderService } from './project-context.service';
import { ModuleAccessService } from '../../common/services/module-access.service';

const VALID_BRIEF = {
  objective: 'Cadrer la stratégie de prix avant le lancement.',
  previousProgress: ['Business plan complété à 80%'],
  priorities: [
    {
      title: 'Valider le positionnement prix',
      priority: 'HIGH',
      detail: 'impacte la marge',
    },
    { title: 'Titre sans priorité valide', priority: 'CRITIQUE', detail: '' },
    { description: 'sans titre' },
  ],
  suggestedQuestions: ['Quel est votre coût unitaire ?'],
  pointsToDiscuss: ['Financement ADEME'],
};

const VALID_SUMMARY = {
  summary: 'Session productive : pricing cadré et objectifs fixés.',
  decisions: ['Passer au premium'],
  nextObjectives: ['Tester 3 paliers de prix'],
  improvements: ['Meilleure structure financière'],
  persistentRisks: ['Trésorerie tendue'],
};

describe('CoachingAiService', () => {
  let service: CoachingAiService;
  const prismaMock = {
    coachingSession: { findUnique: jest.fn() },
    aiAnalysis: { create: jest.fn(), update: jest.fn() },
  };
  const llmMock = { chat: jest.fn() };
  const contextMock = { build: jest.fn() };
  const accessMock = {
    assertCanManageProjectCoaching: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachingAiService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: ProjectContextBuilderService, useValue: contextMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();
    service = module.get<CoachingAiService>(CoachingAiService);

    contextMock.build.mockResolvedValue({
      projectName: 'ÉcoPot',
      contextText: 'Contexte projet',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateBrief', () => {
    it('should return null when the session does not exist', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue(null);
      await expect(service.generateBrief('s404', 'u1')).resolves.toBeNull();
      expect(llmMock.chat).not.toHaveBeenCalled();
    });

    it('should produce a normalized brief and persist a COMPLETED analysis', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's1',
        assignment: { project_id: 'p1' },
      });
      prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai1' });
      prismaMock.aiAnalysis.update.mockResolvedValue({});
      llmMock.chat.mockResolvedValue({ content: JSON.stringify(VALID_BRIEF) });

      const brief = await service.generateBrief('s1', 'u1');

      expect(brief).not.toBeNull();
      expect(brief!.objective).toContain('stratégie de prix');
      // priorité inconnue → MEDIUM ; item sans titre → filtré
      expect(brief!.priorities[0].priority).toBe('HIGH');
      expect(brief!.priorities[1].priority).toBe('MEDIUM');
      expect(brief!.priorities).toHaveLength(2);
      expect(prismaMock.aiAnalysis.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ai1' },
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });

    it('should mark the analysis FAILED when the LLM output stays invalid', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's2',
        assignment: { project_id: 'p1' },
      });
      prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai2' });
      prismaMock.aiAnalysis.update.mockResolvedValue({});
      llmMock.chat.mockResolvedValue({ content: 'réponse hors sujet' });

      const brief = await service.generateBrief('s2', 'u1');

      expect(brief).toBeNull();
      expect(prismaMock.aiAnalysis.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ai2' },
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('should propagate the error if the analysis record cannot be created', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's3',
        assignment: { project_id: 'p1' },
      });
      prismaMock.aiAnalysis.create.mockRejectedValue(new Error('db down'));

      await expect(service.generateBrief('s3', 'u1')).rejects.toThrow(
        'db down',
      );
    });

    it('should refuse the brief when the caller cannot manage project coaching', async () => {
      accessMock.assertCanManageProjectCoaching.mockRejectedValueOnce(
        new ForbiddenException('interdit'),
      );
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's6',
        assignment: { project_id: 'p1' },
      });

      await expect(service.generateBrief('s6', 'u2')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(llmMock.chat).not.toHaveBeenCalled();
    });
  });

  describe('summarizeSession', () => {
    it('should return null when the session does not exist', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue(null);
      await expect(service.summarizeSession('s404', 'u1')).resolves.toBeNull();
    });

    it('should summarize a completed session from notes, recommendations and actions', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's4',
        assignment: { project_id: 'p1' },
        objective: 'Faire le point sur le pricing',
        notes: 'Le porteur hésite entre 3 positionnements.',
        decisions: null,
        report: null,
        recommendations: [
          { title: 'Étude concurrence', content: '...', priority: 'HIGH' },
        ],
        actions: [
          {
            title: 'Rédiger le pricing',
            status: 'IN_PROGRESS',
            deadline: new Date(),
          },
        ],
      });
      llmMock.chat.mockResolvedValue({
        content: JSON.stringify(VALID_SUMMARY),
      });

      const summary = await service.summarizeSession('s4', 'u1');

      expect(summary).not.toBeNull();
      expect(summary!.summary).toContain('Session productive');
      expect(summary!.nextObjectives).toEqual(['Tester 3 paliers de prix']);
      // Le prompt doit inclure les notes et les actions
      const promptArg = llmMock.chat.mock.calls[0][0][1].content as string;
      expect(promptArg).toContain('Objectif de session');
      expect(promptArg).toContain('Rédiger le pricing');
    });

    it('should return null on invalid LLM output (no analysis record to mark)', async () => {
      prismaMock.coachingSession.findUnique.mockResolvedValue({
        id: 's5',
        assignment: { project_id: 'p1' },
        objective: null,
        notes: null,
        decisions: null,
        report: null,
        recommendations: [],
        actions: [],
      });
      llmMock.chat.mockResolvedValue({ content: 'toujours pas de json' });

      await expect(service.summarizeSession('s5', 'u1')).resolves.toBeNull();
      expect(prismaMock.aiAnalysis.create).not.toHaveBeenCalled();
    });
  });
});
