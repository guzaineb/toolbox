import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CohortExpertRole,
  CohortExpertStatus,
  CohortStatus,
  ParticipationOrigin,
  ParticipationStatus,
  UserRole,
  MemberRole,
} from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { ModuleAccessService } from '../src/common/services/module-access.service';
import { AuditService } from '../src/audit/audit.service';
import { NotificationMessageBuilder } from '../src/events/notification-message-builder';
import { AssignmentsService } from '../src/assignments/assignments.service';
import { CoachingService } from '../src/coaching/coaching.service';
import { EvaluationTemplatesService } from '../src/evaluations/evaluation-templates.service';
import { EvaluationAssignmentsService } from '../src/evaluations/evaluation-assignments.service';
import { EvaluationsService } from '../src/evaluations/evaluations.service';
import { JuriesService } from '../src/juries/juries.service';
import { FinalDecisionsService } from '../src/final-decisions/final-decisions.service';

/**
 * Scénario E2E du module Coaching & Évaluation.
 *
 * Parcourt l'ensemble du flux métier contre une vraie base PostgreSQL :
 * affectation COACH → session de coaching → clôture → grille d'évaluation →
 * publication → affectation jury → notation → soumission → synthèse →
 * session de jury → décision finale conditionnelle → validation de condition.
 * Les contrôles d'accès (RBAC), les notifications et l'audit sont réels.
 */
describe('Coaching & Évaluation (e2e)', () => {
  let prisma: PrismaService;
  let emitter: EventEmitter2;
  let assignmentsService: AssignmentsService;
  let coachingService: CoachingService;
  let templatesService: EvaluationTemplatesService;
  let evaluationAssignmentsService: EvaluationAssignmentsService;
  let evaluationsService: EvaluationsService;
  let juriesService: JuriesService;
  let finalDecisionsService: FinalDecisionsService;

  const ids = {
    users: [] as string[],
    profiles: [] as string[],
    incubatorId: '',
    incubatorMemberId: '',
    cohortId: '',
    projectId: '',
    coachUserId: '',
    juryUserId: '',
    ownerUserId: '',
    adminUserId: '',
    assignmentId: '',
    sessionId: '',
    templateId: '',
    evalAssignmentId: '',
    evaluationId: '',
    jurySessionId: '',
    decisionId: '',
    conditionId: '',
    cohortExpertIds: [] as string[],
  };

  let emittedEvents: Array<{ event: string; payload: any }> = [];

  const capture = (event: string) => (payload: any) => {
    emittedEvents.push({ event, payload });
  };

  const makeUser = async (email: string, role: UserRole, first: string, last: string) => {
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

  beforeAll(async () => {
    const stamp = Date.now();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: EventEmitter2, useValue: new EventEmitter2() },
        ModuleAccessService,
        AuditService,
        NotificationMessageBuilder,
        AssignmentsService,
        CoachingService,
        EvaluationTemplatesService,
        EvaluationAssignmentsService,
        EvaluationsService,
        JuriesService,
        FinalDecisionsService,
      ],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    emitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
    assignmentsService = moduleFixture.get<AssignmentsService>(AssignmentsService);
    coachingService = moduleFixture.get<CoachingService>(CoachingService);
    templatesService = moduleFixture.get<EvaluationTemplatesService>(EvaluationTemplatesService);
    evaluationAssignmentsService = moduleFixture.get<EvaluationAssignmentsService>(EvaluationAssignmentsService);
    evaluationsService = moduleFixture.get<EvaluationsService>(EvaluationsService);
    juriesService = moduleFixture.get<JuriesService>(JuriesService);
    finalDecisionsService = moduleFixture.get<FinalDecisionsService>(FinalDecisionsService);

    await prisma.onModuleInit();

    const admin = await makeUser(`admin-${stamp}@e2e.test`, UserRole.ADMIN, 'Admin', 'Test');
    const coach = await makeUser(`coach-${stamp}@e2e.test`, UserRole.EXPERT, 'Coach', 'Test');
    const jury = await makeUser(`jury-${stamp}@e2e.test`, UserRole.EXPERT, 'Jur', 'Y');
    const owner = await makeUser(`owner-${stamp}@e2e.test`, UserRole.PROJECT_OWNER, 'Owner', 'Test');

    ids.adminUserId = admin.id;
    ids.coachUserId = coach.id;
    ids.juryUserId = jury.id;
    ids.ownerUserId = owner.id;

    const incubator = await prisma.incubator.create({
      data: {
        name: `Incubateur E2E ${stamp}`,
        slug: `incubateur-e2e-${stamp}`,
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
        name: `Cohorte E2E ${stamp}`,
        status: CohortStatus.ACTIVE,
        incubator_id: incubator.id,
      },
    });
    ids.cohortId = cohort.id;

    const project = await prisma.project.create({
      data: { name: `Projet E2E ${stamp}`, owner_id: owner.id },
    });
    ids.projectId = project.id;

    await prisma.cohortParticipation.create({
      data: {
        cohort_id: cohort.id,
        project_id: project.id,
        status: ParticipationStatus.ACCEPTED,
        origin: ParticipationOrigin.APPLICATION,
      },
    });

    for (const { role, userId } of [
      { role: CohortExpertRole.COACH, userId: coach.id },
      { role: CohortExpertRole.JURY, userId: jury.id },
    ]) {
      const ce = await prisma.cohortExpert.create({
        data: {
          cohort_id: cohort.id,
          expert_user_id: userId,
          role,
          status: CohortExpertStatus.ACTIVE,
          assigned_by: admin.id,
        },
      });
      ids.cohortExpertIds.push(ce.id);
    }
  });

  afterAll(async () => {
    try {
      if (ids.conditionId) {
        await prisma.finalDecisionCondition.deleteMany({ where: { id: ids.conditionId } });
      }
      if (ids.decisionId) {
        await prisma.finalDecision.deleteMany({ where: { id: ids.decisionId } });
      }
      if (ids.jurySessionId) {
        await prisma.jurySession.deleteMany({ where: { id: ids.jurySessionId } });
      }
      if (ids.sessionId) {
        await prisma.coachingSession.deleteMany({ where: { id: ids.sessionId } });
      }
      if (ids.assignmentId) {
        await prisma.projectExpertAssignment.deleteMany({ where: { id: ids.assignmentId } });
      }
      if (ids.evaluationId) {
        await prisma.evaluation.deleteMany({ where: { id: ids.evaluationId } });
      }
      if (ids.evalAssignmentId) {
        await prisma.evaluationAssignment.deleteMany({ where: { id: ids.evalAssignmentId } });
      }
      if (ids.templateId) {
        await prisma.evaluationTemplate.deleteMany({ where: { id: ids.templateId } });
      }
      await prisma.cohortExpert.deleteMany({ where: { id: { in: ids.cohortExpertIds } } });
      await prisma.cohortParticipation.deleteMany({ where: { project_id: ids.projectId } });
      if (ids.projectId) {
        await prisma.project.deleteMany({ where: { id: ids.projectId } });
      }
      if (ids.cohortId) {
        await prisma.cohort.deleteMany({ where: { id: ids.cohortId } });
      }
      if (ids.incubatorMemberId) {
        await prisma.incubatorMember.deleteMany({ where: { id: ids.incubatorMemberId } });
      }
      if (ids.incubatorId) {
        await prisma.incubator.deleteMany({ where: { id: ids.incubatorId } });
      }
      await prisma.auditLog.deleteMany({ where: { actor_id: { in: ids.users } } });
      await prisma.user.deleteMany({ where: { id: { in: ids.users } } });
      await prisma.userProfile.deleteMany({ where: { id: { in: ids.profiles } } });
    } finally {
      await prisma.onModuleDestroy();
    }
  });

  it('1. affecte un expert COACH au projet accepté', async () => {
    const assignment = await assignmentsService.assign(
      ids.projectId,
      { expertUserId: ids.coachUserId, role: 'COACH' },
      ids.adminUserId,
    );
    ids.assignmentId = assignment.id;

    expect(assignment).toMatchObject({
      project_id: ids.projectId,
      expert_user_id: ids.coachUserId,
      role: 'COACH',
      status: 'ACTIVE',
    });
  });

  it('2. le coach crée puis clôture une session de coaching', async () => {
    emitter.on('notification.coaching.session.scheduled', capture('COACHING_SESSION_SCHEDULED'));
    emitter.on('notification.coaching.session.completed', capture('COACHING_SESSION_COMPLETED'));

    const session = await coachingService.createSession(
      ids.projectId,
      { title: 'Session de cadrage', scheduledAt: new Date().toISOString(), durationMinutes: 60 },
      ids.coachUserId,
    );
    ids.sessionId = session.id;
    expect(session.status).toBe('SCHEDULED');

    const completed = await coachingService.completeSession(
      session.id,
      { report: 'Objectifs et plan d’action définis.' },
      ids.coachUserId,
    );
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completed_at).toBeInstanceOf(Date);
    expect(emittedEvents.some((e) => e.event === 'COACHING_SESSION_COMPLETED')).toBe(true);
  });

  it('3. crée et publie une grille d’évaluation (poids = 100)', async () => {
    const template = await templatesService.create(
      ids.cohortId,
      {
        name: 'Grille finale E2E',
        stage: 'FINAL',
        criteria: [
          { name: 'Impact', weight: 60, max_score: 5, sort_order: 0 },
          { name: 'Faisabilité', weight: 40, max_score: 10, sort_order: 1 },
        ],
      },
      ids.adminUserId,
    );
    ids.templateId = template.id;

    const published = await templatesService.publish(template.id, ids.adminUserId);
    expect(published.published).toBe(true);
    expect(published.locked_at).toBeInstanceOf(Date);
  });

  it('4. affecte un membre du jury et soumet une évaluation notée (score pondéré)', async () => {
    emitter.on('notification.evaluation.submitted', capture('EVALUATION_SUBMITTED'));

    const result = await evaluationAssignmentsService.assign(
      ids.cohortId,
      {
        templateId: ids.templateId,
        assignments: [{ projectId: ids.projectId, juryUserIds: [ids.juryUserId] }],
      },
      ids.adminUserId,
    );
    expect(result.created).toBe(1);
    expect(result.assignments).toHaveLength(1);
    ids.evalAssignmentId = result.assignments[0].id;

    const draft = await evaluationsService.createDraft(ids.evalAssignmentId, ids.juryUserId);
    ids.evaluationId = draft.id;
    expect(draft.status).toBe('DRAFT');

    const criteria = draft.template.criteria;
    const saved = await evaluationsService.saveScores(
      draft.id,
      {
        scores: [
          { criterionId: criteria[0].id, score: 5, comment: 'Impact fort' },
          { criterionId: criteria[1].id, score: 8 },
        ],
      },
      ids.juryUserId,
    );
    expect(saved.scores).toHaveLength(2);

    const submitted = await evaluationsService.submit(draft.id, ids.juryUserId);
    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.total).toBe(92); // 100% × 60 + 80% × 40
    expect(submitted.total20).toBe(18.4);
    expect(emittedEvents.some((e) => e.event === 'EVALUATION_SUBMITTED')).toBe(true);
  });

  it('5. le porteur consulte la synthèse des évaluations', async () => {
    const summary = await evaluationsService.getProjectSummary(ids.projectId, ids.ownerUserId);

    expect(summary.submitted).toBe(1);
    expect(summary.average20).toBe(18.4);
    expect(summary.min20).toBe(18.4);
    expect(summary.max20).toBe(18.4);
    expect(summary.byEvaluator[0].juryMember.id).toBe(ids.juryUserId);
    expect(summary.byCriterion).toHaveLength(2);
  });

  it('6. crée une session de jury avec des membres validés', async () => {
    const session = await juriesService.create(
      ids.projectId,
      { title: 'Délibération finale', memberUserIds: [ids.juryUserId] },
      ids.adminUserId,
    );
    ids.jurySessionId = session.id;

    expect(session.status).toBe('DRAFT');
    expect(session.members).toHaveLength(1);
    expect(session.members[0].member.id).toBe(ids.juryUserId);
  });

  it('7. rend une décision conditionnelle puis valide une condition', async () => {
    emitter.on('notification.final_decision.made', capture('FINAL_DECISION_MADE'));
    emitter.on('notification.condition.validated', capture('CONDITION_VALIDATED'));

    const decision = await finalDecisionsService.makeDecision(
      ids.projectId,
      {
        decision: 'CONDITIONAL',
        final_score: 15.5,
        justification: 'Projet prometteur, des ajustements restent nécessaires.',
        conditions: [{ description: 'Fournir un plan de trésorerie', deadline: new Date().toISOString() }],
      },
      ids.adminUserId,
    );
    ids.decisionId = decision.id;
    expect(decision.decision).toBe('CONDITIONAL');
    expect(decision.conditions).toHaveLength(1);
    expect(decision.conditions[0].status).toBe('PENDING');
    expect(emittedEvents.some((e) => e.event === 'FINAL_DECISION_MADE')).toBe(true);

    const validated = await finalDecisionsService.validateCondition(
      decision.conditions[0].id,
      ids.adminUserId,
    );
    ids.conditionId = validated.id;
    expect(validated.status).toBe('COMPLETED');
    expect(validated.validated_by).toBe(ids.adminUserId);
    expect(validated.validated_at).toBeInstanceOf(Date);
    expect(emittedEvents.some((e) => e.event === 'CONDITION_VALIDATED')).toBe(true);
  });
});
