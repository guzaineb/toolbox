import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ProjectContextBuilderService } from './project-context.service';
import { asString, asStringArray, parseWithRetry } from './ai-json.util';
import { AiAnalysisType } from '@prisma/client';
import { ModuleAccessService } from '../../common/services/module-access.service';

export interface CoachingBriefPayload {
  objective: string;
  previousProgress: string[];
  priorities: Array<{ title: string; priority: string; detail: string }>;
  suggestedQuestions: string[];
  pointsToDiscuss: string[];
}

export interface SessionSummaryPayload {
  summary: string;
  decisions: string[];
  nextObjectives: string[];
  improvements: string[];
  persistentRisks: string[];
}

@Injectable()
export class CoachingAiService {
  private readonly logger = new Logger(CoachingAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly contextBuilder: ProjectContextBuilderService,
    private readonly access: ModuleAccessService,
  ) {}

  // ==================== BRIEF AVANT SESSION ====================

  async generateBrief(sessionId: string, userId: string): Promise<CoachingBriefPayload | null> {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id: sessionId },
      include: { assignment: { select: { project_id: true } } },
    });
    if (!session) return null;

    // Seul le coach (ou le gestionnaire) prépare le brief de sa session
    await this.access.assertCanManageProjectCoaching(
      session.assignment.project_id,
      userId,
    );

    const analysis = await this.prisma.aiAnalysis.create({
      data: {
        project_id: session.assignment.project_id,
        type: AiAnalysisType.SESSION_BRIEF,
        session_id: sessionId,
        status: 'PENDING',
        created_by: userId,
      },
    });

    try {
      const context = await this.contextBuilder.build(session.assignment.project_id);
      const prompt = `Prépare le brief de coaching pour la prochaine session du projet « ${context.projectName} ».

=== CONTEXTE PROJET ===
${context.contextText || '(aucune donnée disponible)'}

Produis UNIQUEMENT un JSON strict :
{
  "objective": "objectif principal proposé pour la session (1 phrase)",
  "previousProgress": ["progrès constatés depuis les données"],
  "priorities": [{ "title": "...", "priority": "HIGH|MEDIUM|LOW", "detail": "pourquoi maintenant" }],
  "suggestedQuestions": ["questions à poser au porteur"],
  "pointsToDiscuss": ["points à aborder absolument"]
}
Contraintes : 2 à 5 éléments par liste ; appuie-toi uniquement sur les données fournies.`;

      const result = await parseWithRetry<CoachingBriefPayload>(
        () =>
          this.llm.chat(
            [
              { role: 'system', content: this.systemPrompt() },
              { role: 'user', content: prompt },
            ],
            { temperature: 0.3, maxTokens: 1800 },
          ).then((r) => r.content),
        (parsed) => this.validateBrief(parsed),
      );

      if (!result.data) {
        await this.markFailed(analysis.id);
        return null;
      }
      await this.prisma.aiAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'COMPLETED',
          payload: result.data as unknown as Prisma.InputJsonValue,
          model: 'groq',
        },
      });
      return result.data;
    } catch (error) {
      this.logger.warn(`generateBrief failed: ${error.message}`);
      await this.markFailed(analysis.id);
      return null;
    }
  }

  // ==================== RÉSUMÉ DE FIN DE SESSION ====================

  async summarizeSession(sessionId: string, userId: string): Promise<SessionSummaryPayload | null> {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id: sessionId },
      include: {
        assignment: { select: { project_id: true } },
        recommendations: { select: { title: true, content: true, priority: true } },
        actions: { select: { title: true, status: true, deadline: true } },
      },
    });
    if (!session) return null;

    // Seul le coach (ou le gestionnaire) demande le résumé de sa session
    await this.access.assertCanManageProjectCoaching(
      session.assignment.project_id,
      userId,
    );

    const context = await this.contextBuilder.build(session.assignment.project_id);

    const notesBlock = [
      session.objective ? `Objectif de session : ${session.objective}` : '',
      session.notes ? `Notes du coach :\n${session.notes}` : '',
      session.decisions ? `Décisions prises :\n${session.decisions}` : '',
      session.report ? `Compte-rendu : ${session.report}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Génère le résumé de la session de coaching terminée du projet « ${context.projectName} ».

=== CONTENU DE LA SESSION ===
${notesBlock || '(aucune note saisie)'}

=== RECOMMANDATIONS ÉMISES ===
${session.recommendations.map((r) => `- [${r.priority}] ${r.title ?? r.content}`).join('\n') || '(aucune)'}

=== ACTIONS CRÉÉES ===
${session.actions.map((a) => `- ${a.title} (${a.status})`).join('\n') || '(aucune)'}

Produis UNIQUEMENT un JSON strict :
{
  "summary": "résumé de session en 3-5 phrases",
  "decisions": ["décisions clés"],
  "nextObjectives": ["objectifs jusqu'à la prochaine session"],
  "improvements": ["améliorations observées par rapport aux sessions précédentes"],
  "persistentRisks": ["risques toujours présents"]
}
N'invente rien : si une information est absente des notes, omets-la.`;

    const result = await parseWithRetry<SessionSummaryPayload>(
      () =>
        this.llm.chat(
          [
            { role: 'system', content: this.systemPrompt() },
            { role: 'user', content: prompt },
          ],
          { temperature: 0.3, maxTokens: 1500 },
        ).then((r) => r.content),
      (parsed) => this.validateSummary(parsed),
    );

    if (!result.data) return null;
    return result.data;
  }

  // ==================== VALIDATION ====================

  private systemPrompt(): string {
    return `Tu es un assistant de coach en entrepreneuriat vert. Tu prépares et résumes des séances d'accompagnement.
Règles : t'appuyer uniquement sur les données fournies, ne jamais inventer, répondre UNIQUEMENT avec l'objet JSON demandé.`;
  }

  private validateBrief(value: unknown): CoachingBriefPayload | null {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    const objective = asString(obj.objective);
    if (!objective) return null;
    const priorities = Array.isArray(obj.priorities)
      ? obj.priorities
          .map((p): { title: string; priority: string; detail: string } | null => {
            if (!p || typeof p !== 'object') return null;
            const item = p as Record<string, unknown>;
            const title = asString(item.title);
            if (!title) return null;
            const priority = (asString(item.priority) ?? 'MEDIUM').toUpperCase();
            return {
              title: title.slice(0, 200),
              priority: ['LOW', 'MEDIUM', 'HIGH'].includes(priority) ? priority : 'MEDIUM',
              detail: asString(item.detail)?.slice(0, 400) ?? '',
            };
          })
          .filter((x): x is { title: string; priority: string; detail: string } => x !== null)
          .slice(0, 5)
      : [];
    return {
      objective: objective.slice(0, 300),
      previousProgress: asStringArray(obj.previousProgress).slice(0, 6),
      priorities,
      suggestedQuestions: asStringArray(obj.suggestedQuestions).slice(0, 8),
      pointsToDiscuss: asStringArray(obj.pointsToDiscuss).slice(0, 6),
    };
  }

  private validateSummary(value: unknown): SessionSummaryPayload | null {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    const summary = asString(obj.summary);
    if (!summary) return null;
    return {
      summary: summary.slice(0, 1500),
      decisions: asStringArray(obj.decisions).slice(0, 8),
      nextObjectives: asStringArray(obj.nextObjectives).slice(0, 6),
      improvements: asStringArray(obj.improvements).slice(0, 6),
      persistentRisks: asStringArray(obj.persistentRisks).slice(0, 6),
    };
  }

  private async markFailed(analysisId: string): Promise<void> {
    await this.prisma.aiAnalysis
      .update({ where: { id: analysisId }, data: { status: 'FAILED', error: 'Réponse IA invalide' } })
      .catch(() => undefined);
  }
}
