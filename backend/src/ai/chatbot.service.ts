import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { ChromaService } from './chroma.service';
import { EmbeddingsService } from './embeddings.service';
import { RagDocument } from './interfaces/ai.types';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly chroma: ChromaService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async ask(
    projectId: string,
    question: string,
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<{ answer: string; sources: RagDocument[]; contextUsed: boolean }> {
    const [queryEmbedding, project] = await Promise.all([
      this.embeddings.generate([question]).then(e => e[0]).catch(() => null),
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          context_summary: true,
          summary_activity: true,
          cost_revenue_summary: true,
          executive_summary: true,
          mission_vision: true,
          value_proposition: true,
        },
      }),
    ]);

    let ragResults: { documents: RagDocument[]; distances: number[] } = { documents: [], distances: [] };

    if (queryEmbedding) {
      ragResults = await this.chroma.query(projectId, queryEmbedding, 5).catch(() => ({ documents: [], distances: [] }));
    }

    const contextParts: string[] = [];

    if (ragResults.documents.length > 0) {
      const relevantDocs = ragResults.documents
        .filter((_, i) => ragResults.distances[i] < 1.5)
        .slice(0, 3);

      if (relevantDocs.length > 0) {
        contextParts.push('--- DOCUMENTS PERTINENTS (de votre projet) ---');
        relevantDocs.forEach((doc, i) => {
          contextParts.push(`[${i + 1}] ${doc.content}`);
        });
      }
    }

    if (project) {
      if (project.context_summary?.summary_text) {
        contextParts.push(`\n--- RÉSUMÉ DE CONTEXTE ---\n${project.context_summary.summary_text}`);
      }
      if (project.summary_activity?.activities_summary) {
        contextParts.push(`\n--- RÉSUMÉ DES ACTIVITÉS ---\n${project.summary_activity.activities_summary}`);
      }
      if (project.executive_summary?.resume_executif) {
        contextParts.push(`\n--- EXECUTIVE SUMMARY ---\n${project.executive_summary.resume_executif}`);
      }
      if (project.mission_vision?.mission) {
        contextParts.push(`\n--- MISSION ---\n${project.mission_vision.mission}`);
      }
    }

    const hasContext = contextParts.length > 0;
    const contextBlock = hasContext ? contextParts.join('\n\n') : 'Aucun contexte spécifique trouvé pour ce projet.';

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: `Tu es un assistant spécialiste en entrepreneuriat vert et durable. Tu aides les porteurs de projet à développer leur business model.

Contexte du projet (RAG + données structurées) :
${contextBlock}

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

    const response = await this.llm.chat(messages, { temperature: 0.5, maxTokens: 1000 });

    return {
      answer: response.content,
      sources: ragResults.documents,
      contextUsed: hasContext,
    };
  }

  async indexProject(projectId: string): Promise<{ documentsIndexed: number }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
        context_summary: true,
        value_proposition: true,
        key_activities_resource: true,
        eco_design: true,
        cost_structure: true,
        revenue_stream: true,
        cost_revenue_summary: true,
        summary_activity: true,
        executive_summary: true,
        impact_measure: true,
      },
    });

    if (!project) throw new Error(`Project ${projectId} not found`);

    const documents: RagDocument[] = [];
    let docIndex = 0;

    const addDoc = (content: string | null | undefined, stepKey: string, label: string) => {
      if (!content || content.trim().length < 10) return;
      documents.push({
        id: `${projectId}_${stepKey}_${docIndex++}`,
        content: `[${label}] ${content}`,
        metadata: { project_id: projectId, step_key: stepKey, label },
      });
    };

    addDoc(project.idea_sketch?.idea_initial, 'gbm_1', 'Idée initiale');
    addDoc(project.idea_sketch?.product_service, 'gbm_1', 'Produit/Service');
    addDoc(project.idea_sketch?.customers, 'gbm_1', 'Clients cibles');
    addDoc(project.problems_needs?.environmental_challenges, 'gbm_2', 'Défis environnementaux');
    addDoc(project.problems_needs?.social_challenges, 'gbm_2', 'Défis sociaux');
    addDoc(project.problems_needs?.customer_needs, 'gbm_2', 'Besoins clients');
    addDoc(project.objective?.environmental_objectives, 'gbm_4', 'Objectifs environnementaux');
    addDoc(project.objective?.social_objectives, 'gbm_4', 'Objectifs sociaux');
    addDoc(project.mission_vision?.mission, 'gbm_5', 'Mission');
    addDoc(project.mission_vision?.vision, 'gbm_5', 'Vision');
    addDoc(project.mission_vision?.values, 'gbm_5', 'Valeurs');
    addDoc(project.context_summary?.summary_text, 'gbm_6', 'Résumé contexte');
    addDoc(project.value_proposition?.value_added, 'gbm_9', 'Proposition de valeur');
    addDoc(project.key_activities_resource?.key_activities, 'gbm_13', 'Activités clés');
    addDoc(project.key_activities_resource?.key_resources, 'gbm_13', 'Ressources clés');
    addDoc(project.eco_design?.projet_eco, 'gbm_14', 'Écoconception');
    addDoc(project.cost_structure?.fixed_costs, 'gbm_16', 'Coûts fixes');
    addDoc(project.cost_structure?.variable_costs, 'gbm_16', 'Coûts variables');
    addDoc(project.revenue_stream?.revenue_sources, 'gbm_17', 'Sources de revenus');
    addDoc(project.cost_revenue_summary?.cost_summary, 'gbm_18', 'Résumé coûts');
    addDoc(project.cost_revenue_summary?.financial_health, 'gbm_18', 'Santé financière');
    addDoc(project.summary_activity?.activities_summary, 'gbm_15', 'Résumé activités');
    addDoc(project.executive_summary?.resume_executif, 'bp_exec', 'Executive summary');
    addDoc(project.impact_measure?.rapport_impact, 'impact', "Rapport d'impact");

    if (documents.length === 0) {
      throw new Error(`Aucune donnée à indexer pour le projet ${projectId}`);
    }

    const texts = documents.map(d => d.content);
    const embeddings = await this.embeddings.generate(texts);

    await this.chroma.deleteProjectCollection(projectId).catch(() => {});
    await this.chroma.addDocuments(projectId, documents, embeddings);

    this.logger.log(`Indexed ${documents.length} documents for project ${projectId}`);
    return { documentsIndexed: documents.length };
  }
}
