import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CohortExpertRole,
  CohortStatus,
  MemberRole,
  ParticipationOrigin,
  ParticipationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { ModuleAccessService } from '../src/common/services/module-access.service';
import { AuditService } from '../src/audit/audit.service';
import { NotificationMessageBuilder } from '../src/events/notification-message-builder';
import { AssignmentsService } from '../src/assignments/assignments.service';
import { LlmService } from '../src/ai/llm.service';
import { ExpertScoringService } from '../src/expert/services/expert-scoring.service';
import { ProjectProfileBuilder } from '../src/expert/services/project-profile-builder.service';
import { ExpertRecommendationService } from '../src/expert/services/expert-recommendation.service';

/**
 * Scénario E2E « projet → recommandations » contre une vraie base PostgreSQL :
 * un projet porteur avec évaluation de maturité et texte métier (Finance /
 * Marketing) est chargé avec ses exigences réelles, puis les experts
 * disponibles sont recommandés et scorés (P2). Termine par le contrôle
 * anti-conflit coach/jury sur les affectations (P6).
 */
describe('Recommandations projet (e2e)', () => {
  let prisma: PrismaService;
  let profileBuilder: ProjectProfileBuilder;
  let recommendationsService: ExpertRecommendationService;
  let assignmentsService: AssignmentsService;

  const ids = {
    users: [] as string[],
    profiles: [] as string[],
    areaIds: [] as string[],
    incubatorId: '',
    incubatorMemberId: '',
    cohortId: '',
    projectId: '',
    adminUserId: '',
    coachUserId: '',
    juryUserId: '',
    assignmentId: '',
  };

  const makeUser = async (
    email: string,
    role: UserRole,
    first: string,
    last: string,
  ) => {
    const profile = await prisma.userProfile.create({
      data: { first_name: first, last_name: last },
    });
    ids.profiles.push(profile.id);
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: bcrypt.hashSync('password123', 10),
        role,
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    ids.users.push(user.id);
    return user;
  };

  const makeExpertProfile = async (
    userId: string,
    headline: string,
    years: number,
    areaNames: string[],
  ) => {
    const created = await prisma.expertProfile.create({
      data: {
        user_id: userId,
        headline,
        years_of_experience: years,
        availability_status: 'AVAILABLE',
      },
    });
    for (const name of areaNames) {
      const area = await prisma.expertiseArea.findFirst({ where: { name } });
      if (area) {
        await prisma.expertProfileExpertiseArea.create({
          data: {
            expert_profile_id: created.id,
            expertise_area_id: area.id,
            level: 'senior',
            years_of_experience: years,
          },
        });
      }
    }
    return created;
  };

  beforeAll(async () => {
    const stamp = Date.now();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: EventEmitter2, useValue: new EventEmitter2() },
        {
          provide: LlmService,
          useValue: {
            generate: jest
              .fn()
              .mockResolvedValue({ content: 'ok', model: 'stub' }),
          },
        },
        ModuleAccessService,
        AuditService,
        NotificationMessageBuilder,
        AssignmentsService,
        ExpertScoringService,
        ProjectProfileBuilder,
        ExpertRecommendationService,
      ],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    profileBuilder = moduleFixture.get<ProjectProfileBuilder>(
      ProjectProfileBuilder,
    );
    recommendationsService = moduleFixture.get<ExpertRecommendationService>(
      ExpertRecommendationService,
    );
    assignmentsService =
      moduleFixture.get<AssignmentsService>(AssignmentsService);

    await prisma.onModuleInit();

    // Crée les domaines d'expertise réels (réutilise l'existant pour ne pas
    // dupliquer sur re-exécution).
    for (const { name, category } of [
      { name: 'Finance', category: 'Comptabilité' },
      { name: 'Marketing', category: 'Croissance' },
      { name: 'Stratégie', category: 'Management' },
    ]) {
      const existing = await prisma.expertiseArea.findFirst({ where: { name } });
      if (!existing) {
        const created = await prisma.expertiseArea.create({
          data: { name, category },
        });
        ids.areaIds.push(created.id);
      }
    }

    const admin = await makeUser(
      `admin-reco-${stamp}@e2e.test`,
      UserRole.INCUBATOR_MEMBER,
      'Admin',
      'Reco',
    );
    const coachUser = await makeUser(
      `coach-reco-${stamp}@e2e.test`,
      UserRole.EXPERT,
      'Coach',
      'Reco',
    );
    const juryUser = await makeUser(
      `jury-reco-${stamp}@e2e.test`,
      UserRole.EXPERT,
      'Jur',
      'Reco',
    );
    const owner = await makeUser(
      `owner-reco-${stamp}@e2e.test`,
      UserRole.PROJECT_OWNER,
      'Owner',
      'Reco',
    );

    ids.adminUserId = admin.id;
    ids.coachUserId = coachUser.id;
    ids.juryUserId = juryUser.id;

    await makeExpertProfile(coachUser.id, 'Expert finance & marketing', 8, [
      'Finance',
      'Marketing',
    ]);
    await makeExpertProfile(juryUser.id, 'Expert stratégie', 3, ['Stratégie']);

    const incubator = await prisma.incubator.create({
      data: {
        name: `Incubateur Reco E2E ${stamp}`,
        slug: `incubateur-reco-e2e-${stamp}`,
        created_by_user_id: admin.id,
      },
    });
    ids.incubatorId = incubator.id;

    const member = await prisma.incubatorMember.create({
      data: {
        user_id: admin.id,
        incubator_id: incubator.id,
        role: MemberRole.ADMIN,
        can_manage_cohorts: true,
      },
    });
    ids.incubatorMemberId = member.id;

    const cohort = await prisma.cohort.create({
      data: {
        name: `Cohorte Reco E2E ${stamp}`,
        status: CohortStatus.IN_PROGRESS,
        incubator_id: incubator.id,
      },
    });
    ids.cohortId = cohort.id;

    const project = await prisma.project.create({
      data: {
        name: `Projet finance verte ${stamp}`,
        description:
          'Une solution de financement de projets et de marketing durable : ' +
          'stratégie marketing, financement participatif et levée de fonds pour les porteurs.',
        owner_id: owner.id,
      },
    });
    ids.projectId = project.id;

    await prisma.fundingAssessment.create({
      data: {
        project_id: project.id,
        score_maturite: 6,
        phase_maturite: 'VALIDATION',
        reponses_questionnaire: {},
      },
    });

    await prisma.cohortParticipation.create({
      data: {
        cohort_id: cohort.id,
        project_id: project.id,
        status: ParticipationStatus.ACCEPTED,
        origin: ParticipationOrigin.APPLICATION,
      },
    });
  });

  afterAll(async () => {
    try {
      if (ids.assignmentId) {
        await prisma.projectExpertAssignment.deleteMany({
          where: { id: ids.assignmentId },
        });
      }
      await prisma.expertProfileExpertiseArea.deleteMany({
        where: { expertProfile: { user_id: { in: ids.users } } },
      });
      await prisma.expertProfile.deleteMany({
        where: { user_id: { in: ids.users } },
      });
      await prisma.fundingAssessment.deleteMany({
        where: { project_id: ids.projectId },
      });
      await prisma.cohortParticipation.deleteMany({
        where: { project_id: ids.projectId },
      });
      if (ids.projectId) {
        await prisma.project.deleteMany({ where: { id: ids.projectId } });
      }
      if (ids.cohortId) {
        await prisma.cohort.deleteMany({ where: { id: ids.cohortId } });
      }
      if (ids.incubatorMemberId) {
        await prisma.incubatorMember.deleteMany({
          where: { id: ids.incubatorMemberId },
        });
      }
      if (ids.incubatorId) {
        await prisma.incubator.deleteMany({ where: { id: ids.incubatorId } });
      }
      if (ids.areaIds.length) {
        await prisma.expertiseArea.deleteMany({
          where: { id: { in: ids.areaIds } },
        });
      }
      await prisma.auditLog.deleteMany({
        where: { actor_id: { in: ids.users } },
      });
      await prisma.user.deleteMany({ where: { id: { in: ids.users } } });
      await prisma.userProfile.deleteMany({
        where: { id: { in: ids.profiles } },
      });
    } finally {
      await prisma.onModuleDestroy();
    }
  });

  it('1. recommande les experts disponibles avec des exigences réelles du projet', async () => {
    const results = await recommendationsService.recommendForProject(
      ids.projectId,
      3,
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      score: expect.any(Number),
      availability: 'AVAILABLE',
    });
    expect(results[0].expert).toMatchObject({
      user: expect.any(Object),
      expertiseConnections: expect.any(Array),
    });
    expect(results[0].skillsMatch).toMatchObject({
      matched: expect.any(Number),
      required: expect.any(Number),
    });
    expect(typeof results[0].explanation).toBe('string');
    expect(results[0].explanation.length).toBeGreaterThan(10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it("2. l'exigence d'expérience vient de la maturité (VALIDATION → 3 ans)", async () => {
    const requirements = await profileBuilder.buildProjectRequirements(
      ids.projectId,
    );

    expect(requirements.minYearsExperience).toBe(3);
    expect(requirements.requiredAreas.length).toBeGreaterThan(0);
    expect(requirements.requiredAreaNames).toEqual(
      expect.arrayContaining([
        expect.stringContaining('nance'),
        expect.stringContaining('arketing'),
      ]),
    );
  });

  it("3. recommande des coachs sur le profil d'une cohorte", async () => {
    const results = await recommendationsService.recommendCoachs(
      ids.cohortId,
      3,
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toEqual(expect.any(Number));
  });

  it("4. refuse d'affecter un expert déjà coach du même projet comme jury", async () => {
    const coachAssignment = await assignmentsService.assign(
      ids.projectId,
      { expertUserId: ids.coachUserId, role: CohortExpertRole.COACH },
      ids.adminUserId,
    );
    ids.assignmentId = coachAssignment.id;
    expect(coachAssignment.status).toBe('ACTIVE');

    await expect(
      assignmentsService.assign(
        ids.projectId,
        { expertUserId: ids.coachUserId, role: CohortExpertRole.JURY },
        ids.adminUserId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});