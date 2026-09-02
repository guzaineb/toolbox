import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { RagDocument, RagStatus } from './interfaces/ai.types';

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
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly rag: RagPipelineService,
    private readonly contextBuilder: ProjectContextBuilderService,
  ) {}

  async ask(
    projectId: string,
    question: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<ChatbotAskResult> {
    const [ragOutcome, project, coachingContext] = await Promise.all([
      this.rag.query(projectId, question, 5).catch((error) => {
        // Une erreur du pipeline est un échec explicite, pas un "vide" silencieux.
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
      // Contexte coaching & évaluation (sessions, actions, évaluations, plan d'amélioration)
      this.contextBuilder.build(projectId).catch(() => null),
    ]);

    const contextParts: string[] = [];
    let ragUsed = false;

    // Contexte RAG — seulement si vraiment disponible.
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

    // État explicite du RAG dans le prompt (jamais un échec silencieux).
    const ragNote =
      ragOutcome.status === 'RAG_UNAVAILABLE'
        ? `\n[NOTE] Le système de recherche de documents (RAG) est actuellement indisponible. Réponds avec les autres données structurées du projet, et signale que la recherche documentaire n'a pas pu être consultée. (Motif : ${ragOutcome.reason ?? 'indisponible'})`
        : ragOutcome.status === 'NO_RELEVANT_CONTEXT'
          ? "\n[NOTE] Aucun document pertinent n'a été trouvé pour cette question. Réponds à partir des autres données structurées ou de connaissances générales, en l'indiquant."
          : '';

    const contextBlock = hasContext
      ? contextParts.join('\n\n')
      : 'Aucun contexte spécifique trouvé pour ce projet.';

    const messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[] = [
      {
        role: 'system',
        content: `Tu es un assistant spécialiste en entrepreneuriat vert et durable. Tu aides les porteurs de projet à développer leur business model.

Contexte du projet (documents RAG + données structurées + coaching) :
${contextBlock}
${ragNote}

Règles :
- Réponds UNIQUEMENT à partir du contexte fourni, sauf si la question est générale
- Si l'information n'est pas dans le contexte, dis-le et propose des pistes générales
- Sois précis, pédagogique et encourageant
- Réponds en français
- Limite ta réponse à 500 mots maximum
- Si tu utilises le contexte, cite-le`,
      },
    ];

    if (conversationHistory) {
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: question });

    const response = await this.llm.chat(messages, {
      temperature: 0.5,
      maxTokens: 1000,
    });

    return {
      answer: response.content,
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
