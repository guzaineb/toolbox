import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpertScoringService } from './expert-scoring.service';
import { ProjectProfileBuilder } from './project-profile-builder.service';

@Injectable()
export class ExpertRecommendationService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ExpertScoringService,
    private profileBuilder: ProjectProfileBuilder,
  ) {}

  async recommendForProject(
    projectId: string,
    limit: number = 3,
    options?: { minScore?: number; excludeIds?: string[] },
  ) {
    const requirements =
      await this.profileBuilder.buildProjectRequirements(projectId);
    const experts = await this.getAvailableExperts(options?.excludeIds);

    const scored = await Promise.all(
      experts.map(async (expert) => {
        const expertises = expert.expertiseConnections || [];
        const match = this.scoringService.matchWithProject(
          expert,
          expertises,
          {
            requiredAreas: requirements.requiredAreas,
            minYearsExperience: requirements.minYearsExperience,
          },
        );
        return {
          expert,
          score: match.matchPercentage,
          skillsMatch: match.details.skillsMatch,
          experienceMatch: match.details.experienceMatch,
          availability: expert.availability_status,
          explanation: this.scoringService.buildMatchExplanation(match, expert),
        };
      }),
    );

    const filtered = options?.minScore
      ? scored.filter((s) => s.score >= options.minScore!)
      : scored;

    return filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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
    const requirements = await this.profileBuilder.deriveRequirementsFromText(
      [cohort?.name, cohort?.program, cohort?.description].filter(
        (v): v is string => !!v,
      ),
      undefined,
    );
    const experts = await this.getAvailableExperts(excludeIds);

    const scored = await Promise.all(
      experts.map(async (expert) => {
        const match = this.scoringService.matchWithProject(
          expert,
          expert.expertiseConnections || [],
          {
            requiredAreas: requirements.requiredAreas,
            minYearsExperience: requirements.minYearsExperience,
          },
        );
        return {
          expert,
          score: match.matchPercentage,
          skillsMatch: match.details.skillsMatch,
          experienceMatch: match.details.experienceMatch,
          availability: expert.availability_status,
          explanation: this.scoringService.buildMatchExplanation(match, expert),
        };
      }),
    );

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getTopExperts(options: {
    limit: number;
    sortBy: 'score' | 'experience' | 'availability';
  }): Promise<any[]> {
    const experts = await this.prisma.expertProfile.findMany({
      include: {
        user: { include: { profile: true } },
        expertiseConnections: { include: { expertiseArea: true } },
      },
    });

    const scored = await Promise.all(
      experts.map(async (expert) => {
        const expertises = expert.expertiseConnections || [];
        const { score } = this.scoringService.computeExpertScore(
          expert,
          expertises,
        );
        return {
          id: expert.id,
          headline: expert.headline,
          user: expert.user,
          score,
          years_of_experience: expert.years_of_experience,
          availability_status: expert.availability_status,
        };
      }),
    );

    const sortFunctions: any = {
      score: (a, b) => b.score - a.score,
      experience: (a, b) =>
        (b.years_of_experience || 0) - (a.years_of_experience || 0),
      availability: (a, b) => {
        const order: any = { AVAILABLE: 3, BUSY: 2, UNAVAILABLE: 1 };
        return order[b.availability_status] - order[a.availability_status];
      },
    };

    return scored.sort(sortFunctions[options.sortBy]).slice(0, options.limit);
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