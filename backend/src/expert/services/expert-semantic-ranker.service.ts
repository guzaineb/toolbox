import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingsService } from '../../ai/embeddings.service';
import { LlmService } from '../../ai/llm.service';
import { extractJson } from '../../ai/analysis/ai-json.util';

/** Profil expert minimal exploité par le classement sémantique. */
export interface RankableExpertProfile {
  id: string;
  headline?: string | null;
  bio?: string | null;
  organization?: string | null;
  position?: string | null;
  years_of_experience?: number | null;
  availability_status?: string | null;
  user?: {
    profile?: {
      first_name?: string | null;
      last_name?: string | null;
    } | null;
  } | null;
  expertiseConnections?: Array<{
    level?: string | null;
    years_of_experience?: number | null;
    expertiseArea?: {
      name?: string | null;
      category?: string | null;
    } | null;
  }> | null;
}

/** Expert candidat prêt à être vectorisé. */
export interface RankableExpertInput {
  id: string;
  /** Texte de référence du profil (voir `buildExpertText`). */
  text: string;
}

/** Faits ancrant la rédaction de l'explication par le LLM. */
export interface ExplanationCandidate {
  id: string;
  label: string;
  areas: string[];
  years?: number | null;
  /** Score de similarité sémantique (0-100). */
  score: number;
}

/** Texte de remplacement quand un profil expert est vide (embedding non trivial). */
export const EMPTY_EXPERT_TEXT = 'Profil expert sans description renseignée.';

const MAX_CONTEXT_CHARS = 4000;
const MAX_EXPLANATION_LENGTH = 400;

/**
 * Similarité cosine entre deux vecteurs. Les embeddings produits par
 * `EmbeddingsService` sont déjà normalisés : le produit scalaire suffit, mais
 * la normalisation est recalculée ici pour rester correct avec tout vecteur.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Convertit une similarité cosine (-1..1) en score affichable 0-100. */
export function semanticScoreFromCosine(cosine: number): number {
  if (!Number.isFinite(cosine)) return 0;
  return Math.round(Math.min(1, Math.max(0, cosine)) * 100);
}

/**
 * Classement des experts par apprentissage automatique.
 *
 * - Le score provient de la similarité sémantique (embeddings du modèle local
 *   `all-MiniLM-L6-v2` via `EmbeddingsService`) entre le texte du contexte
 *   (projet ou cohorte) et le texte du profil expert.
 * - L'explication est rédigée par le `LlmService` à partir des faits calculés.
 * - Toute indisponibilité (modèle absent, quota LLM, réponse non exploitable)
 *   renvoie `null` / une map vide : l'appelant retombe alors sur le scoring
 *   par règles, sans jamais échouer.
 */
@Injectable()
export class ExpertSemanticRanker {
  private readonly logger = new Logger(ExpertSemanticRanker.name);

  private readonly LEVEL_LABELS: Record<string, string> = {
    junior: 'niveau junior',
    intermediate: 'niveau confirmé',
    senior: 'niveau senior',
    expert: 'niveau expert',
  };

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly llm: LlmService,
  ) {}

  /** Texte de référence d'un profil expert (support de l'embedding). */
  buildExpertText(expert: RankableExpertProfile): string {
    const areas = (expert.expertiseConnections ?? [])
      .map((connection) => {
        const name = connection.expertiseArea?.name;
        if (!name) return null;

        const level = connection.level
          ? this.LEVEL_LABELS[connection.level]
          : undefined;
        return [name, connection.expertiseArea?.category, level]
          .filter(Boolean)
          .join(' — ');
      })
      .filter((value): value is string => !!value);

    const identity = [expert.position, expert.organization]
      .filter(Boolean)
      .join(' chez ');

    return [
      expert.headline,
      identity || null,
      expert.bio,
      areas.length ? `Domaines d'expertise : ${areas.join(' ; ')}` : null,
      expert.years_of_experience
        ? `${expert.years_of_experience} ans d'expérience`
        : null,
    ]
      .filter((value): value is string => !!value)
      .join('\n');
  }

  /** Nom affichable d'un expert (pour le prompt et les explications). */
  expertLabel(expert: RankableExpertProfile): string {
    const profile = expert.user?.profile;
    const fullName = profile
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
      : '';
    return fullName || expert.headline || 'Expert';
  }

  /**
   * Score de similarité sémantique (0-100) pour chaque expert, ou `null` si le
   * fournisseur d'embeddings n'est pas exploitable.
   */
  async scoreBatch(
    contextText: string,
    experts: RankableExpertInput[],
  ): Promise<Map<string, number> | null> {
    if (experts.length === 0) return new Map();
    if (!contextText || !contextText.trim()) return null;

    try {
      const vectors = await this.embeddings.generate([
        contextText,
        ...experts.map((expert) => expert.text?.trim() || EMPTY_EXPERT_TEXT),
      ]);

      if (vectors.length !== experts.length + 1) {
        this.logger.warn(
          `Embeddings incomplets (${vectors.length} vecteurs pour ${
            experts.length + 1
          } textes) — repli sur le scoring par règles.`,
        );
        return null;
      }

      const [contextVector, ...expertVectors] = vectors;
      const scores = new Map<string, number>();

      experts.forEach((expert, index) => {
        scores.set(
          expert.id,
          semanticScoreFromCosine(
            cosineSimilarity(contextVector, expertVectors[index]),
          ),
        );
      });

      this.logger.log(
        `Similarité sémantique calculée pour ${experts.length} expert(s).`,
      );
      return scores;
    } catch (error) {
      this.logger.warn(
        `Embeddings indisponibles — repli sur le scoring par règles : ${this.describeError(
          error,
        )}`,
      );
      return null;
    }
  }

  /**
   * Explications en langage naturel des experts retenus, générées par le LLM.
   * Renvoie une map vide si le LLM est indisponible ou non exploitable.
   */
  async explainBatch(
    contextText: string,
    candidates: ExplanationCandidate[],
  ): Promise<Map<string, string>> {
    const explanations = new Map<string, string>();
    if (candidates.length === 0) return explanations;

    try {
      const response = await this.llm.generate(
        this.buildExplanationPrompt(contextText, candidates),
        { temperature: 0.3, maxTokens: 700 },
      );

      const list = this.extractExplanationList(extractJson(response.content));
      if (list.length === 0) {
        this.logger.warn(
          "Réponse LLM sans tableau d'explications — repli sur les explications par règles.",
        );
        return explanations;
      }

      candidates.forEach((candidate, index) => {
        const value = list[index];
        if (typeof value !== 'string') return;

        const cleaned = value.trim().slice(0, MAX_EXPLANATION_LENGTH);
        if (cleaned) explanations.set(candidate.id, cleaned);
      });

      return explanations;
    } catch (error) {
      this.logger.warn(
        `Génération LLM des explications indisponible — repli sur les règles : ${this.describeError(
          error,
        )}`,
      );
      return explanations;
    }
  }

  private buildExplanationPrompt(
    contextText: string,
    candidates: ExplanationCandidate[],
  ): string {
    const context = contextText.trim().slice(0, MAX_CONTEXT_CHARS);

    const lines = candidates.map((candidate, index) => {
      const facts = [
        candidate.areas.length
          ? `domaines : ${candidate.areas.join(', ')}`
          : 'domaines non renseignés',
        candidate.years ? `${candidate.years} ans d'expérience` : null,
        `similarité sémantique : ${candidate.score}%`,
      ].filter(Boolean);

      return `${index + 1}. ${candidate.label} | ${facts.join(' | ')}`;
    });

    return [
      'Contexte du besoin :',
      context,
      '',
      'Experts candidats :',
      ...lines,
      '',
      `Rédige en français, pour chacun des ${candidates.length} candidats, une explication de 1 à 2 phrases (240 caractères maximum) justifiant la recommandation à partir des informations ci-dessus.`,
      "N'invente aucune compétence, aucun diplôme ni aucune référence non listés.",
      'Réponds STRICTEMENT avec un objet JSON de la forme {"explanations":["...","..."]} et rien d\'autre.',
    ].join('\n');
  }

  private extractExplanationList(parsed: unknown): unknown[] {
    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === 'object') {
      const value = (parsed as Record<string, unknown>).explanations;
      if (Array.isArray(value)) return value;
    }

    return [];
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
