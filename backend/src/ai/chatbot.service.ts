import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { RagDocument, RagStatus } from './interfaces/ai.types';
import { ToolRegistry } from './tools/tool-registry';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './conversation/message.service';

const MAX_TOOL_ITERATIONS = 4;

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
    private readonly toolRegistry: ToolRegistry,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  async ask(
    projectId: string,
    userId: string,
    question: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[],
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

    const [ragOutcome, project, coachingContext] = await Promise.all([
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

    const systemMessage = {
      role: 'system' as const,
      content: `Tu es un assistant spécialiste en entrepreneuriat vert et durable. Tu aides les porteurs de projet à développer leur business model.

IDENTITÉ DU PROJET :
- Nom du projet : ${projectName}
- ID du projet : ${projectId}
L'utilisateur travaille sur CE projet. Tu connais déjà son ID et son nom.

Contexte du projet (documents RAG + données structurées + coaching) :
${contextBlock}
${ragNote}

Tu as accès à des outils internes pour récupérer des données spécifiques du projet. Utilise-les quand l'utilisateur demande des informations qui ne sont pas dans le contexte ci-dessus, ou quand tu as besoin de données plus détaillées sur un aspect précis.

RÈGLES CRITIQUES :
- NE DEMANDE JAMAIS le nom, l'identifiant (UUID) ou le nom du projet à l'utilisateur. Tu les connais déjà.
- Réponds UNIQUEMENT à partir du contexte fourni ou des résultats d'outils, sauf si la question est générale
- Si l'information n'est pas dans le contexte ni accessible via les outils, dis-le et propose des pistes générales
- Sois précis, pédagogique et encourageant
- Réponds en français
- Limite ta réponse à 500 mots maximum
- Si tu utilises le contexte ou un outil, cite-le`,
    };

    const messages: {
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string;
      toolCallId?: string;
      name?: string;
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
            role: 'assistant',
            content: response.content || '',
            toolCallId: toolCall.id,
            name: toolName,
          });

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
}
