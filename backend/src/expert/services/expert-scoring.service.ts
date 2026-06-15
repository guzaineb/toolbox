// services/expert-scoring.service.ts
import { Injectable } from '@nestjs/common';
import { ExpertProfile } from '../expert-profile.entity';
import { ExpertProfileExpertiseArea } from '../expert-profile-expertise-area.entity';
import { ExpertScore, ScoreDetails } from '../interfaces/score-details.interface';
import { ProjectMatch, MatchDetails } from '../interfaces/match-details.interface';

@Injectable()
export class ExpertScoringService {
  private readonly LEVEL_MAP: Record<string, number> = {
    junior: 1,
    intermediate: 2,
    senior: 3,
    expert: 4,
  };

  private readonly AVAILABILITY_SCORES: Record<string, number> = {
    available: 20,
    busy: 10,
    unavailable: 0,
  };

  private readonly WEIGHTS = {
    EXPERIENCE: 30,
    DIVERSITY: 20,
    LEVELS: 30,
    AVAILABILITY: 20,
    MATCH_SKILLS: 60,
    MATCH_EXPERIENCE: 40,
    AVAILABILITY_BONUS: 10,
    COACH_PEDAGOGY: 25,
    COACH_SENIORITY_10: 25,
    COACH_SENIORITY_5: 15,
    COACH_AVAILABILITY: 30,
    COACH_DIVERSITY_MAX: 20,
  };

  // ==================== SCORES AVEC DÉTAILS ====================

  computeExpertScore(
    profile: ExpertProfile,
    expertises: ExpertProfileExpertiseArea[]
  ): ExpertScore {
    const experienceScore = this.computeExperienceScore(profile.years_of_experience || 0);
    const diversityScore = this.computeDiversityScore(expertises.length);
    const levelsScore = this.computeLevelsScore(expertises);
    const availabilityScore = this.computeAvailabilityScore(profile.availability_status);

    const totalScore = experienceScore.score + diversityScore.score + levelsScore.score + availabilityScore.score;

    return {
      score: Math.min(Math.floor(totalScore), 100),
      details: {
        experience: experienceScore,
        diversity: diversityScore,
        levels: levelsScore,
        availability: availabilityScore,
      },
    };
  }

  matchWithProject(
    profile: ExpertProfile,
    expertises: ExpertProfileExpertiseArea[],
    requirements: { requiredAreas: string[]; minYearsExperience: number }
  ): ProjectMatch {
    const skillsMatch = this.computeSkillsMatch(expertises, requirements.requiredAreas);
    const experienceMatch = this.computeExperienceMatch(
      profile.years_of_experience || 0,
      requirements.minYearsExperience
    );

    let matchScore = skillsMatch.score + experienceMatch.score;

    const details: MatchDetails = {
      skillsMatch,
      experienceMatch,
    };

    if (profile.availability_status === 'available') {
      matchScore = Math.min(matchScore + this.WEIGHTS.AVAILABILITY_BONUS, 100);
      details.availabilityBonus = this.WEIGHTS.AVAILABILITY_BONUS;
    }

    return {
      matchPercentage: Math.floor(matchScore),
      details,
    };
  }

  computeCoachScore(profile: ExpertProfile): number {
    const pedagogyScore = this.computePedagogyScore(profile.bio);
    const seniorityScore = this.computeSeniorityScore(profile.years_of_experience || 0);
    const availabilityScore = this.getRawAvailabilityScore(profile.availability_status);
    const diversityScore = Math.min((profile.expertiseConnections?.length || 0) * 5, this.WEIGHTS.COACH_DIVERSITY_MAX);

    const totalScore = pedagogyScore + seniorityScore + availabilityScore + diversityScore;

    return Math.min(totalScore, 100);
  }

  // ==================== MÉTHODES PRIVÉES AVEC DÉTAILS ====================

  private computeExperienceScore(years: number): { years: number; score: number } {
    const score = Math.min(years / 20, 1) * this.WEIGHTS.EXPERIENCE;
    return { years, score };
  }

  private computeDiversityScore(count: number): { count: number; score: number } {
    const score = Math.min(count / 5, 1) * this.WEIGHTS.DIVERSITY;
    return { count, score };
  }

  private computeLevelsScore(expertises: ExpertProfileExpertiseArea[]): {
    average: number;
    score: number;
  } {
    if (expertises.length === 0) {
      return { average: 0, score: 0 };
    }

    const totalLevelScore = expertises.reduce((sum, exp) => {
      const levelValue = this.LEVEL_MAP[exp.level] || 0;
      return sum + (levelValue / 4) * this.WEIGHTS.LEVELS;
    }, 0);

    const avgScore = totalLevelScore / expertises.length;
    const avgLevel = (avgScore / this.WEIGHTS.LEVELS) * 4;

    return { average: avgLevel, score: avgScore };
  }

  private computeAvailabilityScore(status: string): { status: string; score: number } {
    const score = this.AVAILABILITY_SCORES[status] || 0;
    return { status, score };
  }

  private computeSkillsMatch(
    expertises: ExpertProfileExpertiseArea[],
    requiredAreas: string[]
  ): { matched: number; required: number; score: number } {
    const expertAreaIds = new Set(expertises.map(e => e.expertiseArea.id));
    const matched = requiredAreas.filter(id => expertAreaIds.has(id)).length;
    const score = (matched / requiredAreas.length) * this.WEIGHTS.MATCH_SKILLS;

    return { matched, required: requiredAreas.length, score };
  }

  private computeExperienceMatch(
    years: number,
    required: number
  ): { years: number; required: number; score: number } {
    let score: number;
    if (years >= required) {
      score = this.WEIGHTS.MATCH_EXPERIENCE;
    } else if (years >= required * 0.7) {
      score = this.WEIGHTS.MATCH_EXPERIENCE * 0.5;
    } else {
      score = this.WEIGHTS.MATCH_EXPERIENCE * 0.25;
    }

    return { years, required, score };
  }

  // ==================== MÉTHODES POUR COACH ====================

  private getRawAvailabilityScore(status: string): number {
    return this.AVAILABILITY_SCORES[status] || 0;
  }

  private computePedagogyScore(bio?: string): number {
    if (!bio) return 0;
    const pedagogyKeywords = ['formation', 'mentor', 'coach', 'pédagogie', 'enseignement'];
    const hasPedagogy = pedagogyKeywords.some(keyword =>
      bio.toLowerCase().includes(keyword)
    );
    return hasPedagogy ? this.WEIGHTS.COACH_PEDAGOGY : 0;
  }

  private computeSeniorityScore(years: number): number {
    if (years >= 10) return this.WEIGHTS.COACH_SENIORITY_10;
    if (years >= 5) return this.WEIGHTS.COACH_SENIORITY_5;
    return 0;
  }
}