import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
import { ProjectsService } from '../src/projects/projects.service';
import { SectionStepService } from '../src/common/services/section-step.service';
import { DocumentsService } from '../src/documents/documents.service';
import { DocumentPromptsService } from '../src/documents/document-prompts.service';
import { LlmService } from '../src/ai/llm.service';
import { AiService } from '../src/ai/ai.service';
import { GbmService } from '../src/gbm/gbm.service';

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
  let documentsService: DocumentsService;
  let gbmService: GbmService;

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
    strangerUserId: '',
    assignmentId: '',
    sessionId: '',
    templateId: '',
    evalAssignmentId: '',
    evaluationId: '',
    jurySessionId: '',
    decisionId: '',
    conditionId: '',
    actionId: '',
    workflowSessionId: '',
    responsibleActionId: '',
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
        { provide: LlmService, useValue: { generate: jest.fn().mockResolvedValue({ content: 'ok', model: 'stub' }) } },
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
        ProjectsService,
        SectionStepService,
        DocumentPromptsService,
        DocumentsService,
        AiService,
        GbmService,
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
    documentsService = moduleFixture.get<DocumentsService>(DocumentsService);
    gbmService = moduleFixture.get<GbmService>(GbmService);

    await prisma.onModuleInit();

    const admin = await makeUser(`admin-${stamp}@e2e.test`, UserRole.ADMIN, 'Admin', 'Test');
    const coach = await makeUser(`coach-${stamp}@e2e.test`, UserRole.EXPERT, 'Coach', 'Test');
    const jury = await makeUser(`jury-${stamp}@e2e.test`, UserRole.EXPERT, 'Jur', 'Y');
    const owner = await makeUser(`owner-${stamp}@e2e.test`, UserRole.PROJECT_OWNER, 'Owner', 'Test');
    const stranger = await makeUser(`stranger-${stamp}@e2e.test`, UserRole.EXPERT, 'Stranger', 'Test');

    ids.adminUserId = admin.id;
    ids.coachUserId = coach.id;
    ids.juryUserId = jury.id;
    ids.ownerUserId = owner.id;
    ids.strangerUserId = stranger.id;

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
        status: CohortStatus.IN_PROGRESS,
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
      if (ids.workflowSessionId) {
        await prisma.coachingSession.deleteMany({ where: { id: ids.workflowSessionId } });
      }
      if (ids.actionId) {
        await prisma.coachingAction.deleteMany({ where: { id: ids.actionId } });
      }
      if (ids.responsibleActionId) {
        await prisma.coachingAction.deleteMany({ where: { id: ids.responsibleActionId } });
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

    const criteria = draft.template!.criteria;
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

  // ==================== LIVRABLES & RBAC (corrections F1/F2) ====================

  it('8. le coach consulte les livrables et la progression GBM du projet', async () => {
    const docs = await documentsService.getDocumentsList(ids.projectId, ids.coachUserId);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0]).toMatchObject({ key: expect.any(String), status: 'NOT_GENERATED' });

    const progress = await gbmService.getProgress(ids.projectId, ids.coachUserId);
    expect(typeof progress.percentage).toBe('number');
    expect(progress.phases).toHaveLength(5);

    const stepData = await gbmService.getStepData(ids.projectId, 'gbm_1', ids.coachUserId);
    expect(stepData).toBeDefined();
  });

  it('9. le jury consulte aussi les livrables', async () => {
    const docs = await documentsService.getDocumentsList(ids.projectId, ids.juryUserId);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('10. un expert non affecté est refusé sur les livrables', async () => {
    await expect(
      documentsService.getDocumentsList(ids.projectId, ids.strangerUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      gbmService.getProgress(ids.projectId, ids.strangerUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('11. la génération de livrables reste réservée au porteur', async () => {
    await expect(
      documentsService.generateDocument(ids.projectId, 'idea_sketch', ids.coachUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      gbmService.updateStep(ids.projectId, 'gbm_1', { idea_initial: 'x' }, ids.coachUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('12. le porteur ne peut pas auto-valider ses actions (F2)', async () => {
    const action = await coachingService.createAction(
      ids.projectId,
      { title: 'Préparer 10 interviews clients', priority: 'HIGH' },
      ids.coachUserId,
    );
    ids.actionId = action.id;

    await expect(
      coachingService.updateAction(action.id, { status: 'COMPLETED' }, ids.ownerUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const submitted = await coachingService.updateAction(
      action.id,
      { status: 'SUBMITTED' },
      ids.ownerUserId,
    );
    expect(submitted.status).toBe('SUBMITTED');

    const completed = await coachingService.updateAction(
      action.id,
      { status: 'COMPLETED' },
      ids.coachUserId,
    );
    expect(completed.status).toBe('COMPLETED');
  });

  it('13. une session clôturée ne peut plus être replanifiée (historique verrouillé)', async () => {
    // La session de l'étape 2 est COMPLETED : les champs de planification sont gelés,
    // seuls les champs de compte-rendu restent modifiables.
    await expect(
      coachingService.updateSession(
        ids.sessionId,
        { scheduledAt: new Date(Date.now() + 86400000).toISOString() },
        ids.coachUserId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    const report = await coachingService.updateSession(
      ids.sessionId,
      { report: 'Compte-rendu complété après coup.' },
      ids.coachUserId,
    );
    expect(report.status).toBe('COMPLETED');
    expect(report.report).toContain('après coup');
  });

  it('14. un autre jury ne peut pas ouvrir laffectation dun jury (403)', async () => {
    await expect(
      evaluationAssignmentsService.findOne(ids.evalAssignmentId, ids.strangerUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      evaluationAssignmentsService.findOne(ids.evalAssignmentId, ids.ownerUserId),
    ).resolves.toMatchObject({ id: ids.evalAssignmentId });

    const own = await evaluationAssignmentsService.findOne(
      ids.evalAssignmentId,
      ids.juryUserId,
    );
    expect(own.jury_user_id).toBe(ids.juryUserId);
    expect(own.evaluations.length).toBeGreaterThan(0);
  });

  // ==================== WORKFLOW DE SESSION COMPLET ====================

  it('15. déroule une session complète (constats, blocages, résultat d’objectif)', async () => {
    const session = await coachingService.createSession(
      ids.projectId,
      {
        title: 'Validation du BMC',
        objective: 'Valider le Business Model',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 90,
      },
      ids.coachUserId,
    );
    ids.workflowSessionId = session.id;
    expect(session.status).toBe('SCHEDULED');

    const started = await coachingService.startSession(session.id, ids.coachUserId);
    expect(started.status).toBe('IN_PROGRESS');
    expect(started.started_at).toBeInstanceOf(Date);

    // Déroulement : notes ≠ constats, points abordés, blocages
    const updated = await coachingService.updateSession(
      session.id,
      {
        notes: 'Le porteur souhaite vendre principalement via Instagram.',
        findings: 'Le canal de distribution n’est pas encore validé par des données terrain.',
        topicsDiscussed: 'Segmentation client\nProposition de valeur\nCanaux de distribution',
        blockers: [
          { title: 'Manque de données marché', detail: 'Aucune étude concurrentielle' },
          { title: 'Modèle financier incomplet', resolved: true },
        ],
      },
      ids.coachUserId,
    );
    expect(updated.findings).toContain('canal de distribution');
    expect(updated.topics_discussed).toContain('Segmentation client');
    const blockers = updated.blockers as Array<Record<string, unknown>>;
    expect(blockers).toHaveLength(2);
    expect(blockers[0]).toMatchObject({ title: 'Manque de données marché', resolved: false });
    expect(blockers[0].id).toEqual(expect.any(String));
    expect(blockers[1].resolved).toBe(true);
    expect(blockers[1].resolvedAt).toEqual(expect.any(String));

    // Décisions + résultat de l'objectif, puis clôture
    const completed = await coachingService.updateSession(
      session.id,
      {
        decisions: 'Le porteur réalisera 10 interviews avant la prochaine session.',
        objectiveResult: 'PARTIALLY_ACHIEVED',
        objectiveResultReason: 'Le modèle financier nécessite encore des données sur les coûts variables.',
        status: 'COMPLETED',
      },
      ids.coachUserId,
    );
    expect(completed.status).toBe('COMPLETED');
    expect(completed.objective_result).toBe('PARTIALLY_ACHIEVED');
    expect(completed.objective_result_reason).toContain('coûts variables');

    // Persistance après rechargement
    const reloaded = await coachingService.findSessionById(session.id, ids.coachUserId);
    expect(reloaded.notes).toContain('Instagram');
    expect((reloaded.blockers as unknown[])).toHaveLength(2);
    expect(reloaded.objective_result).toBe('PARTIALLY_ACHIEVED');
  });

  it('16. une action peut désigner un responsable et un livrable concerné', async () => {
    emitter.on('notification.coaching.action.assigned', capture('COACHING_ACTION_ASSIGNED'));

    const action = await coachingService.createAction(
      ids.projectId,
      {
        title: 'Réaliser 10 interviews clients',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
        sessionId: ids.workflowSessionId,
        responsibleUserId: ids.ownerUserId,
        relatedDocumentKey: 'value_proposition',
      },
      ids.coachUserId,
    );
    ids.responsibleActionId = action.id;

    expect(action.responsible_user_id).toBe(ids.ownerUserId);
    expect(action.related_document_key).toBe('value_proposition');
    expect(action.responsibleUser?.id).toBe(ids.ownerUserId);
    expect(emittedEvents.some((e) => e.event === 'COACHING_ACTION_ASSIGNED')).toBe(true);

    // Le porteur ne peut pas redéfinir le responsable ou le livrable (F2)
    await expect(
      coachingService.updateAction(action.id, { responsibleUserId: ids.juryUserId }, ids.ownerUserId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    // Le coach met à jour le statut et peut retirer le livrable
    const updated = await coachingService.updateAction(
      action.id,
      { status: 'IN_PROGRESS', relatedDocumentKey: null },
      ids.coachUserId,
    );
    expect(updated.status).toBe('IN_PROGRESS');
    expect(updated.related_document_key).toBeNull();
  });

  it('17. sur une session clôturée, le compte-rendu étendu reste modifiable', async () => {
    // Planification gelée…
    await expect(
      coachingService.updateSession(
        ids.workflowSessionId,
        { objective: 'Nouvel objectif' },
        ids.coachUserId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    // …mais compte-rendu (constats, blocages, résultat) toujours éditable
    const updated = await coachingService.updateSession(
      ids.workflowSessionId,
      {
        findings: 'Constat consolidé après la séance.',
        blockers: [{ title: 'Manque de données marché', detail: 'Aucune étude', resolved: true }],
      },
      ids.coachUserId,
    );
    expect(updated.findings).toContain('consolidé');
    expect((updated.blockers as Array<{ resolved: boolean }>)[0].resolved).toBe(true);
    expect(updated.objective_result).toBe('PARTIALLY_ACHIEVED');
  });
});
