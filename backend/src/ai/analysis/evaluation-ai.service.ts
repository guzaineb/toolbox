import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ChromaService } from '../chroma.service';
import { EmbeddingsService } from '../embeddings.service';
import { ProjectContextBuilderService } from './project-context.service';
import { asNumber, asString, asStringArray, parseWithRetry } from './ai-json.util';
import { AiAnalysisType, Prisma } from '@prisma/client';
import { RagDocument } from '../interfaces/ai.types';

export interface AnalysisPoint {
  area: string;
  severity?: string;
  description: string;
  evidence?: string | null;
  confidence?: number | null;
}

export interface AnalysisRecommendation {
  title: string;
  priority: string;
  reason: string;
}

export interface EvaluationAnalysisPayload {
  summary: string;
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  risks: AnalysisPoint[];
  opportunities: AnalysisPoint[];
  recommendations: AnalysisRecommendation[];
  suggestedQuestions: string[];
}

const AREAS = [
  'impact', 'market', 'finance', 'team', 'product', 'customer_acquisition',
  'operations', 'legal', 'innovation', 'business_model', 'general',
];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

@Injectable()
export class EvaluationAiService {
  private readonly logger = new Logger(EvaluationAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly chroma: ChromaService,
    private readonly embeddings: EmbeddingsService,
    private readonly contextBuilder: ProjectContextBuilderService,
  ) {}

  async analyzeEvaluation(projectId: string, evaluationId: string, userId: string): Promise<EvaluationAnalysisPayload | null> {
    const analysis = await this.prisma.aiAnalysis.create({
      data: {
        project_id: projectId,
        type: AiAnalysisType.EVALUATION_ANALYSIS,
        evaluation_id: evaluationId,
        status: 'PENDING',
        created_by: userId,
      },
    });

    const started = Date.now();
    try {
      const context = await this.contextBuilder.build(projectId);
      const ragContext = await this.retrieveRagContext(projectId, context.contextText);

      const prompt = this.buildPrompt(context.projectName, context.contextText, ragContext);
      const result = await parseWithRetry<EvaluationAnalysisPayload>(
        (repair) =>
          repair
            ? this.llm.chat(
                [
                  { role: 'system', content: this.systemPrompt() },
                  { role: 'user', content: `${prompt}\n\n${repair}` },
                ],
                { temperature: 0.3, maxTokens: 2500 },
              ).then((r) => r.content)
            : this.llm.chat(
                [
                  { role: 'system', content: this.systemPrompt() },
                  { role: 'user', content: prompt },
                ],
                { temperature: 0.3, maxTokens: 2500 },
              ).then((r) => r.content),
        (parsed) => this.validatePayload(parsed),
      );

      const payload = result.data;
      if (!payload) {
        await this.prisma.aiAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: 'FAILED',
            error: 'Réponse IA invalide après retry',
            duration_ms: Date.now() - started,
          },
        });
        return null;
      }

      const updated = await this.prisma.aiAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'COMPLETED',
          payload: payload as unknown as Prisma.InputJsonValue,
          duration_ms: Date.now() - started,
        },
      });
      void updated;
      return payload;
    } catch (error) {
      this.logger.warn(`analyzeEvaluation failed: ${error.message}`);
      await this.prisma.aiAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          error: error.message?.slice(0, 500) ?? 'Erreur inconnue',
          duration_ms: Date.now() - started,
        },
      }).catch(() => undefined);
      return null;
    }
  }

  /**
   * RAG : uniquement si un contexte documentaire pertinent existe.
   * Échoue silencieusement (ChromaDB indisponible = analyse dégradée mais fonctionnelle).
   */
  private async retrieveRagContext(projectId: string, contextText: string): Promise<string> {
    try {
      const query = contextText.slice(0, 800);
      const [queryEmbedding] = await this.embeddings.generate([query]);
      if (!queryEmbedding) return '';
      const results: { documents: RagDocument[]; distances: number[] } = await this.chroma.query(
        projectId,
        queryEmbedding,
        4,
      );
      const relevant = results.documents
        .filter((_, i) => (results.distances[i] ?? 2) < 1.2)
        .slice(0, 3);
      if (relevant.length === 0) return '';
      return relevant.map((doc, i) => `[Doc ${i + 1}] ${doc.content.slice(0, 700)}`).join('\n');
    } catch {
      return '';
    }
  }

  private systemPrompt(): string {
    return `Tu es un analyste expert en accompagnement entrepreneurial vert. Tu analyses des projets de façon factuelle et structurée.
Règles absolues :
- Tu ne t'appuies QUE sur les données fournies. N'invente aucune information.
- Si une information manque, signale-le plutôt que de supposer.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.`;
  }

  private buildPrompt(projectName: string, contextText: string, ragContext: string): string {
    return `Analyse le projet « ${projectName} » à partir du contexte ci-dessous.

=== CONTEXTE PROJET ===
${contextText || '(aucune donnée disponible)'}
${ragContext ? `\n=== DOCUMENTS PERTINENTS (RAG) ===\n${ragContext}` : ''}

Produis une analyse au format JSON strict suivant cette structure exacte :
{
  "summary": "résumé global en 3-4 phrases",
  "strengths": [{ "area": "...", "description": "...", "confidence": 0.0 }],
  "weaknesses": [{ "area": "...", "severity": "LOW|MEDIUM|HIGH", "description": "...", "evidence": "élément des données qui justifie ce constat" }],
  "risks": [{ "area": "...", "severity": "LOW|MEDIUM|HIGH", "description": "...", "evidence": "..." }],
  "opportunities": [{ "area": "...", "description": "..." }],
  "recommendations": [{ "title": "...", "priority": "LOW|MEDIUM|HIGH", "reason": "..." }],
  "suggestedQuestions": ["question 1", "question 2"]
}

Contraintes :
- area ∈ ${JSON.stringify(AREAS)}
- 2 à 5 éléments par liste, listes vides acceptées si les données ne permettent rien de dire.
- Les recommandations doivent être actionnables par le porteur sous 2 à 4 semaines.
- confidence ∈ [0,1].`;
  }

  validatePayload(value: unknown): EvaluationAnalysisPayload | null {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    const summary = asString(obj.summary);
    if (!summary) return null;

    const points = this.validatePoints(obj);
    return {
      summary,
      strengths: points.strengths,
      weaknesses: points.weaknesses,
      risks: points.risks,
      opportunities: points.opportunities,
      recommendations: this.validateRecommendations(obj.recommendations),
      suggestedQuestions: asStringArray(obj.suggestedQuestions).slice(0, 8),
    };
  }

  private validatePoints(obj: Record<string, unknown>): {
    strengths: AnalysisPoint[];
    weaknesses: AnalysisPoint[];
    risks: AnalysisPoint[];
    opportunities: AnalysisPoint[];
  } {
    const mapPoint = (item: unknown, withSeverity: boolean): AnalysisPoint | null => {
      if (!item || typeof item !== 'object') return null;
      const p = item as Record<string, unknown>;
      const description = asString(p.description);
      if (!description) return null;
      const rawArea = (asString(p.area) ?? 'general').toLowerCase();
      return {
        area: AREAS.includes(rawArea) ? rawArea : 'general',
        description: description.slice(0, 600),
        severity:
          withSeverity && SEVERITIES.includes((asString(p.severity) ?? '').toUpperCase())
            ? (asString(p.severity) as string).toUpperCase()
            : undefined,
        evidence: asString(p.evidence),
        confidence: withSeverity ? undefined : clampConfidence(p.confidence),
      };
    };
    const mapList = (value: unknown, withSeverity: boolean): AnalysisPoint[] => {
      if (!Array.isArray(value)) return [];
      return value.map((i) => mapPoint(i, withSeverity)).filter((x): x is AnalysisPoint => x !== null).slice(0, 6);
    };
    const clampConfidence = (v: unknown): number | null => {
      const n = asNumber(v);
      if (n === null) return null;
      return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
    };

    return {
      strengths: mapList(obj.strengths, false),
      weaknesses: mapList(obj.weaknesses, true),
      risks: mapList(obj.risks, true),
      opportunities: mapList(obj.opportunities, false),
    };
  }

  private validateRecommendations(value: unknown): AnalysisRecommendation[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item): AnalysisRecommendation | null => {
        if (!item || typeof item !== 'object') return null;
        const r = item as Record<string, unknown>;
        const title = asString(r.title);
        if (!title) return null;
        const priority = (asString(r.priority) ?? 'MEDIUM').toUpperCase();
        return {
          title: title.slice(0, 200),
          priority: PRIORITIES.includes(priority) ? priority : 'MEDIUM',
          reason: asString(r.reason)?.slice(0, 500) ?? '',
        };
      })
      .filter((r): r is AnalysisRecommendation => r !== null)
      .slice(0, 6);
  }
}
