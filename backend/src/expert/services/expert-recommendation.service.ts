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
        const match = this.scoringService.matchWithProject(expert, expertises, {
          requiredAreas: requirements.requiredAreas,
          minYearsExperience: requirements.minYearsExperience,
        });
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

    return filtered.sort((a, b) => b.score - a.score).slice(0, limit);
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

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
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
