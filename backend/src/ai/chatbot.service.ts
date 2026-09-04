import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { ProjectStateService } from './project-state/project-state.service';
import { RagDocument, RagStatus } from './interfaces/ai.types';
import { ToolRegistry } from './tools/tool-registry';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './conversation/message.service';
import { ProjectState } from './project-state/project-state.types';

const MAX_TOOL_ITERATIONS = 4;

export interface ModuleContext {
  module?: string;
  section?: string;
  step?: string;
  context?: string;
}

export interface ChatbotAskResult {
  answer: string;
  sources: RagDocument[];
  sourcesUsed: {
    id: string;
    documentKey: string;
    module: string;
    section: string;
    page?: number;
  }[];
  ragStatus: RagStatus;
  ragReason?: string;
  contextUsed: boolean;
  toolsUsed: string[];
  conversationId: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly rag: RagPipelineService,
    private readonly contextBuilder: ProjectContextBuilderService,
    private readonly projectStateService: ProjectStateService,
    private readonly toolRegistry: ToolRegistry,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  async ask(
    projectId: string,
    userId: string,
    question: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[],
    moduleContext?: ModuleContext,
  ): Promise<ChatbotAskResult> {
    if (!projectId || !projectId.trim()) {
      throw new Error('projectId is required');
    }

    const conversation = await this.conversationService.getOrCreateActive(
      projectId,
      userId,
    );

    const historyFromDb = await this.messageService.getHistory(
      conversation.id,
      projectId,
      userId,
      6,
    );

    const effectiveHistory =
      historyFromDb.length > 0
        ? historyFromDb
        : (conversationHistory ?? []);

    await this.messageService.addMessage(
      conversation.id,
      projectId,
      userId,
      'user',
      question,
    );

    const [ragOutcome, project, coachingContext, projectState] = await Promise.all([
      this.rag.query(projectId, question, 5).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `RAG query failed pour le projet ${projectId}: ${message}`,
        );
        return {
          status: 'RAG_UNAVAILABLE' as RagStatus,
          documents: [] as RagDocument[],
          distances: [] as number[],
          sources: [] as never[],
          reason: message,
        };
      }),
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          context_summary: true,
          summary_activity: true,
          executive_summary: true,
          mission_vision: true,
          value_proposition: true,
        },
      }),
      this.contextBuilder.build(projectId).catch(() => null),
      this.projectStateService.getProjectState(projectId).catch(() => null),
    ]);

    const contextParts: string[] = [];
    let ragUsed = false;

    if (
      ragOutcome.status === 'RAG_AVAILABLE' &&
      ragOutcome.documents.length > 0
    ) {
      contextParts.push('--- DOCUMENTS PERTINENTS (de votre projet) ---');
      ragOutcome.documents.forEach((doc, i) => {
        contextParts.push(`[${i + 1}] ${doc.content}`);
      });
      ragUsed = true;
    }

    if (project) {
      if (project.context_summary?.summary_text) {
        contextParts.push(
          `\n--- RÉSUMÉ DE CONTEXTE ---\n${project.context_summary.summary_text}`,
        );
      }
      if (project.summary_activity?.activities_summary) {
        contextParts.push(
          `\n--- RÉSUMÉ DES ACTIVITÉS ---\n${project.summary_activity.activities_summary}`,
        );
      }
      if (project.executive_summary?.resume_executif) {
        contextParts.push(
          `\n--- EXECUTIVE SUMMARY ---\n${project.executive_summary.resume_executif}`,
        );
      }
      if (project.mission_vision?.mission) {
        contextParts.push(
          `\n--- MISSION ---\n${project.mission_vision.mission}`,
        );
      }
    }

    if (coachingContext?.contextText) {
      contextParts.push(
        `\n--- COACHING & ÉVALUATIONS ---\n${coachingContext.contextText}`,
      );
    }

    const hasContext = contextParts.length > 0;

    const ragNote =
      ragOutcome.status === 'RAG_UNAVAILABLE'
        ? `\n[NOTE] Le système de recherche de documents (RAG) est actuellement indisponible. Réponds avec les autres données structurées du projet, et signale que la recherche documentaire n'a pas pu être consultée. (Motif : ${ragOutcome.reason ?? 'indisponible'})`
        : ragOutcome.status === 'NO_RELEVANT_CONTEXT'
          ? "\n[NOTE] Aucun document pertinent n'a été trouvé pour cette question. Réponds à partir des autres données structurées ou de connaissances générales, en l'indiquant."
          : '';

    const contextBlock = hasContext
      ? contextParts.join('\n\n')
      : 'Aucun contexte spécifique trouvé pour ce projet.';

    const toolsAvailable = this.toolRegistry.getToolsForPrompt();
    const toolsUsed: string[] = [];

    const projectName = project?.name ?? coachingContext?.projectName ?? 'Projet';

    const moduleContextBlock = moduleContext?.module
      ? `\nCONTEXTE MODULE :
- Module actuel : ${moduleContext.module}
${moduleContext.section ? `- Section : ${moduleContext.section}` : ''}
${moduleContext.step ? `- Étape : ${moduleContext.step}` : ''}
${moduleContext.context ? `\nDonnées du formulaire en cours :\n${moduleContext.context}` : ''}
L'utilisateur travaille ACTUELLEMENT sur ce module. Concentre ta réponse sur cette section.
Pour les actions suggérées, propose des actions adaptées à ce module (expliquer, identifier les informations manquantes, détecter les incohérences, suggérer des améliorations, analyser la réponse, indiquer la prochaine étape).`
      : '';

    const deterministicBlock = this.buildDeterministicAnalysisBlock(projectState);

    const systemMessage = {
      role: 'system' as const,
      content: `Tu es un assistant spécialiste en entrepreneuriat vert et durable. Tu aides les porteurs de projet à développer leur business model.

IDENTITÉ DU PROJET :
- Nom du projet : ${projectName}
- ID du projet : ${projectId}
L'utilisateur travaille sur CE projet. Tu connais déjà son ID et son nom.
${moduleContextBlock}
Contexte du projet (documents RAG + données structurées + coaching) :
${contextBlock}
${ragNote}
${deterministicBlock}

Tu as accès à des outils internes pour récupérer des données spécifiques du projet. Utilise-les quand l'utilisateur demande des informations qui ne sont pas dans le contexte ci-dessus, ou quand tu as besoin de données plus détaillées sur un aspect précis.

RÈGLES CRITIQUES :
- NE DEMANDE JAMAIS le nom, l'identifiant (UUID) ou le nom du projet à l'utilisateur. Tu les connais déjà.
- Réponds UNIQUEMENT à partir du contexte fourni ou des résultats d'outils, sauf si la question est générale
- Si l'information n'est pas dans le contexte ni accessible via les outils, dis-le et propose des pistes générales
- Sois précis, pédagogique et encourageant
- Réponds en français
- Limite ta réponse à 500 mots maximum
- Si tu utilises le contexte ou un outil, cite-le

RÈGLES POUR LES EXPLICATIONS (quand l'utilisateur demande conseil, analyse ou recommandation) :
- Les priorités, sévérités et scores viennent de l'analyse déterministe ci-dessus. NE JAMAIS en inventer.
- Quand tu expliques une recommandation, suis cette structure :
  1. Observation : constat factuel issu de l'analyse
  2. Pourquoi c'est important : conséquence concrète pour le projet
  3. Action recommandée : quoi faire exactement
  4. Comment faire : étapes pratiques
  5. Étape suivante : quoi faire ensuite
- Reste concis. Pas de généralités hors sujet.
- Si l'analyse déterministe est indisponible, indique-le et réponds à partir du contexte disponible.`,
    };

    const messages: {
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string;
      toolCallId?: string;
      name?: string;
      toolCalls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
    }[] = [systemMessage];

    for (const msg of effectiveHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: 'user', content: question });

    let finalAnswer = '';

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const response = await this.llm.chat(messages, {
        temperature: 0.5,
        maxTokens: 1000,
        tools: toolsAvailable.length > 0 ? toolsAvailable : undefined,
        toolChoice: toolsAvailable.length > 0 ? 'auto' : undefined,
      });

      if (response.toolCalls && response.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: response.content || '',
          toolCalls: response.toolCalls,
        });

        for (const toolCall of response.toolCalls) {
          const toolName = toolCall.function.name;
          toolsUsed.push(toolName);

          this.logger.log(
            `Tool call: ${toolName} (iteration ${iteration + 1}/${MAX_TOOL_ITERATIONS})`,
          );

          const result = await this.toolRegistry.execute(
            toolName,
            toolCall.function.arguments,
            userId,
          );

          messages.push({
            role: 'tool',
            content: result,
            toolCallId: toolCall.id,
            name: toolName,
          });
        }
      } else {
        finalAnswer = response.content;
        break;
      }
    }

    if (!finalAnswer) {
      finalAnswer =
        "J'ai consulté les données du projet mais je n'ai pas pu générer de réponse finale. Pourriez-vous reformuler votre question ?";
    }

    await this.messageService.addMessage(
      conversation.id,
      projectId,
      userId,
      'assistant',
      finalAnswer,
      ragOutcome.documents.map((d) => ({
        id: d.id,
        documentKey: d.metadata?.document_key,
        module: d.metadata?.module,
        section: d.metadata?.section,
      })),
      hasContext || ragUsed,
    );

    return {
      answer: finalAnswer,
      sources: ragOutcome.documents,
      sourcesUsed:
        ragOutcome.sources?.map((s) => ({
          id: s.id,
          documentKey: s.documentKey,
          module: s.module,
          section: s.section,
          page: s.page,
        })) ?? [],
      ragStatus: ragOutcome.status,
      ragReason: ragOutcome.reason,
      contextUsed: hasContext || ragUsed,
      toolsUsed,
      conversationId: conversation.id,
    };
  }

  /** Indexe (indexation incrémentale) le projet via le pipeline RAG. */
  async indexProject(projectId: string): Promise<{ documentsIndexed: number }> {
    const result = await this.rag.indexProject(projectId);
    this.logger.log(
      `Index project ${projectId}: +${result.added} ~${result.updated} -${result.removed} =${result.unchanged}`,
    );
    return { documentsIndexed: result.total };
  }

  private buildDeterministicAnalysisBlock(
    state: ProjectState | null,
  ): string {
    if (!state) {
      return '\n[NOTE] L\'analyse déterministe du projet est temporairement indisponible. Réponds à partir du contexte disponible.';
    }

    const parts: string[] = [
      '\n--- ANALYSE DÉTERMINISTE DU PROJET ---',
      `Niveau de maturité : ${state.maturityLevel}`,
      `Progression globale : ${state.overallProgress}%`,
      `Score de santé : ${state.healthScore.overall}/100`,
    ];

    if (state.strengths.length > 0) {
      parts.push(`Forces : ${state.strengths.join(', ')}`);
    }

    if (state.weakAreas.length > 0) {
      parts.push(`Points faibles : ${state.weakAreas.join(', ')}`);
    }

    if (state.inconsistencies.length > 0) {
      const inconsistencyLines = state.inconsistencies.map(
        (inc) => `  - [${inc.severity}] ${inc.area} : ${inc.description}`,
      );
      parts.push(`Incohérences détectées :\n${inconsistencyLines.join('\n')}`);
    }

    if (state.priorities.length > 0) {
      const priorityLines = state.priorities.map(
        (p) => `  - [${p.level}] ${p.area} (impact ${p.impact}/100) : ${p.description}${p.module ? ` → module ${p.module}` : ''}`,
      );
      parts.push(`Priorités :\n${priorityLines.join('\n')}`);
    }

    if (state.currentPriority) {
      parts.push(
        `Priorité courante : [${state.currentPriority.level}] ${state.currentPriority.area} — ${state.currentPriority.description}`,
      );
    }

    parts.push(`Recommandation : ${state.recommendedNextAction}`);

    if (state.incompleteSteps.length > 0) {
      const nextSteps = state.incompleteSteps
        .slice(0, 5)
        .map((s) => `  - ${s.title} (${s.stepKey}) [${s.status}]`);
      parts.push(`Étapes incomplètes :\n${nextSteps.join('\n')}`);
    }

    if (state.missingInformation.length > 0) {
      parts.push(
        `Informations manquantes (${state.missingInformation.length}) : ${state.missingInformation.slice(0, 5).join(', ')}${state.missingInformation.length > 5 ? '...' : ''}`,
      );
    }

    parts.push('--- FIN ANALYSE DÉTERMINISTE ---');

    return parts.join('\n');
  }
}
