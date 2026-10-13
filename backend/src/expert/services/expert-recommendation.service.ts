import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpertScoringService } from './expert-scoring.service';
import {
  ProjectProfileBuilder,
  ProjectRequirements,
} from './project-profile-builder.service';
import {
  ExpertSemanticRanker,
  RankableExpertProfile,
} from './expert-semantic-ranker.service';

/** Moteur de score réellement utilisé pour classer les experts. */
export type RecommendationScoringMethod = 'SEMANTIC' | 'RULES';

export interface RankedExpert {
  expert: RankableExpertProfile;
  score: number;
  scoringMethod: RecommendationScoringMethod;
  skillsMatch: { matched: number; required: number; score: number };
  experienceMatch: { years: number; required: number; score: number };
  availability: string | null;
  explanation: string;
}

/**
 * Recommandation d'experts (jurés de projet, coachs de cohorte).
 *
 * Le classement est un classement par apprentissage automatique : similarité
 * sémantique (embeddings) entre le contexte et le profil expert, puis
 * explication rédigée par le LLM. Si les embeddings sont indisponibles, le
 * service retombe automatiquement sur le scoring par règles
 * (`ExpertScoringService`) et le signale via `scoringMethod = 'RULES'`.
 */
@Injectable()
export class ExpertRecommendationService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ExpertScoringService,
    private profileBuilder: ProjectProfileBuilder,
    private ranker: ExpertSemanticRanker,
  ) {}

  async recommendForProject(
    projectId: string,
    limit: number = 3,
    options?: { minScore?: number; excludeIds?: string[] },
  ) {
    const { requirements, text } =
      await this.profileBuilder.loadProjectContext(projectId);
    const experts = await this.getAvailableExperts(options?.excludeIds);

    return this.rank(text, requirements, experts, limit, options);
  }

  async recommendCoachs(
    cohortId: string,
    limit: number = 3,
    excludeIds: string[] = [],
  ) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { name: true, program: true, description: true },
    });

    const segments = [
      cohort?.name,
      cohort?.program,
      cohort?.description,
    ].filter((value): value is string => !!value);
    const requirements = await this.profileBuilder.deriveRequirementsFromText(
      segments,
      undefined,
    );
    const experts = await this.getAvailableExperts(excludeIds);

    return this.rank(segments.join('\n'), requirements, experts, limit);
  }

  /**
   * Calcule le score de chaque candidat (sémantique si les embeddings sont
   * disponibles, sinon règles), trie, tronque, puis rédige les explications.
   */
  private async rank(
    contextText: string,
    requirements: ProjectRequirements,
    experts: any[],
    limit: number,
    options?: { minScore?: number },
  ): Promise<RankedExpert[]> {
    const ruleResults = experts.map((expert) => {
      const match = this.scoringService.matchWithProject(
        expert,
        expert.expertiseConnections || [],
        {
          requiredAreas: requirements.requiredAreas,
          minYearsExperience: requirements.minYearsExperience,
        },
      );

      return {
        expert: expert as RankableExpertProfile,
        match,
        ruleScore: match.matchPercentage,
        ruleExplanation: this.scoringService.buildMatchExplanation(
          match,
          expert,
        ),
      };
    });

    const semanticScores = await this.ranker.scoreBatch(
      contextText,
      ruleResults.map((entry) => ({
        id: entry.expert.id,
        text: this.ranker.buildExpertText(entry.expert),
      })),
    );

    const scoringMethod: RecommendationScoringMethod = semanticScores
      ? 'SEMANTIC'
      : 'RULES';

    const scored: RankedExpert[] = ruleResults.map((entry) => ({
      expert: entry.expert,
      score: semanticScores
        ? (semanticScores.get(entry.expert.id) ?? entry.ruleScore)
        : entry.ruleScore,
      scoringMethod,
      skillsMatch: entry.match.details.skillsMatch,
      experienceMatch: entry.match.details.experienceMatch,
      availability: entry.expert.availability_status ?? null,
      explanation: entry.ruleExplanation,
    }));

    const filtered = options?.minScore
      ? scored.filter((entry) => entry.score >= options.minScore!)
      : scored;

    const ranked = filtered.sort((a, b) => b.score - a.score).slice(0, limit);

    if (scoringMethod === 'SEMANTIC' && ranked.length > 0) {
      const explanations = await this.ranker.explainBatch(
        contextText,
        ranked.map((entry) => ({
          id: entry.expert.id,
          label: this.ranker.expertLabel(entry.expert),
          areas: this.expertAreaNames(entry.expert),
          years: entry.expert.years_of_experience ?? null,
          score: entry.score,
        })),
      );

      for (const entry of ranked) {
        const explanation = explanations.get(entry.expert.id);
        if (explanation) entry.explanation = explanation;
      }
    }

    return ranked;
  }

  private expertAreaNames(expert: RankableExpertProfile): string[] {
    return (expert.expertiseConnections ?? [])
      .map((connection) => connection.expertiseArea?.name)
      .filter((name): name is string => !!name)
      .slice(0, 5);
  }

  private async getAvailableExperts(excludeIds?: string[]) {
    const where: any = { availability_status: 'AVAILABLE' };
    if (excludeIds?.length) {
      where.id = { notIn: excludeIds };
    }

    return this.prisma.expertProfile.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        expertiseConnections: { include: { expertiseArea: true } },
      },
    });
  }
}
