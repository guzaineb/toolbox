
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpertiseArea } from '@prisma/client';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { ExpertFiltersDto } from './dto/expert-filters.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';
import { plainToClass } from 'class-transformer';
import { PublicExpertProfileDto } from './dto/public-expert-profile.dto';

@Injectable()
export class ExpertService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ExpertScoringService,
    private recommendationService: ExpertRecommendationService,
  ) {}

  async create(userId: string, dto: CreateExpertDto) {
    const existing = await this.findByUser(userId);
    if (existing) {
      throw new ConflictException('Un profil expert existe déjà pour cet utilisateur.');
    }

    const savedExpert = await this.prisma.expertProfile.create({
      data: {
        user_id: userId,
        headline: dto.headline,
        bio: dto.bio,
        organization: dto.organization,
        position: dto.position,
        years_of_experience: dto.years_of_experience,
        linkedin_url: dto.linkedin_url,
        availability_status: 'available',
      },
    });

    if (dto.expertiseAreaIds?.length) {
      await this.addExpertiseBatch(userId, dto.expertiseAreaIds);
    }

    return this.findById(savedExpert.id);
  }

  async findByUser(userId: string) {
    return this.prisma.expertProfile.findUnique({
      where: { user_id: userId },
      include: this.getDefaultInclude(),
    });
  }

  async findById(id: string) {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { id },
      include: this.getDefaultInclude(),
    });
    if (!profile) throw new NotFoundException(`Expert #${id} introuvable.`);
    return profile;
  }

  async findAll(filters?: ExpertFiltersDto) {
    const where: any = {};

    if (filters?.availability) {
      where.availability_status = filters.availability;
    }

    if (filters?.expertiseAreaId) {
      where.expertiseConnections = {
        some: { expertise_area_id: filters.expertiseAreaId },
      };
    }

    if (filters?.minYears) {
      where.years_of_experience = { gte: filters.minYears };
    }

    return this.prisma.expertProfile.findMany({
      where,
      include: this.getDefaultInclude(),
    });
  }

  async upsert(userId: string, dto: UpdateExpertDto) {
    const existing = await this.findByUser(userId);

    if (!existing) {
      if (!dto.headline) {
        throw new BadRequestException('Le champ headline est requis pour créer un profil expert.');
      }
      return this.create(userId, dto as CreateExpertDto);
    }

    await this.updateProfileFields(existing.id, dto);

    if (dto.expertiseAreaIds !== undefined) {
      await this.updateExpertiseAreas(existing.id, dto.expertiseAreaIds);
    }

    return this.findById(existing.id);
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.findByUserOrFail(userId);
    await this.prisma.expertProfileExpertiseArea.deleteMany({
      where: { expert_profile_id: profile.id },
    });
    await this.prisma.expertProfile.delete({ where: { id: profile.id } });
  }

  async getAllAreas() {
    return this.prisma.expertiseArea.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  async getAreasGroupedByCategory(): Promise<Record<string, ExpertiseArea[]>> {
    const areas = await this.getAllAreas();
    return areas.reduce((acc, area) => {
      const cat = area.category || 'Autres';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(area);
      return acc;
    }, {} as Record<string, ExpertiseArea[]>);
  }
async addExpertise(userId: string, dto: AddExpertiseDto) {
  const profile = await this.findByUserOrFail(userId);
  
  const area = await this.prisma.expertiseArea.findUnique({ where: { id: dto.expertiseAreaId } });
  if (!area) {
    throw new NotFoundException(`Domaine d'expertise #${dto.expertiseAreaId} introuvable.`);
  }
  
  const existingConnection = await this.prisma.expertProfileExpertiseArea.findFirst({
    where: {
      expert_profile_id: profile.id,
      expertise_area_id: area.id,
    },
  });

  if (existingConnection) {
    throw new ConflictException('Ce domaine d\'expertise est déjà associé au profil.');
  }
  
  return this.prisma.expertProfileExpertiseArea.create({
    data: {
      expert_profile_id: profile.id,
      expertise_area_id: area.id,
      level: dto.level !== undefined && dto.level !== null ? dto.level : 'intermediate',
      years_of_experience: dto.years_of_experience !== undefined && dto.years_of_experience !== null
        ? dto.years_of_experience
        : (profile.years_of_experience ?? 0),
    },
    include: { expertiseArea: true },
  });
}

async addMultipleExpertise(userId: string, expertiseList: AddExpertiseDto[]) {
  const results: any[] = [];
  const errors: string[] = [];
  
  for (const dto of expertiseList) {
    try {
      const result = await this.addExpertise(userId, dto);
      results.push(result);
    } catch (error) {
      if (error instanceof ConflictException) {
        errors.push(`Expertise ${dto.expertiseAreaId} existe déjà`);
        continue;
      }
      throw error;
    }
  }
  
  if (results.length === 0 && errors.length > 0) {
    throw new BadRequestException(`Aucune expertise n'a pu être ajoutée: ${errors.join(', ')}`);
  }
  
  return results;
}

async updateExpertiseAreas(profileId: string, areaIds: string[]): Promise<void> {
  if (!areaIds) return;

  if (areaIds.length > 0) {
    for (const areaId of areaIds) {
      const existing = await this.prisma.expertProfileExpertiseArea.findFirst({
        where: { expert_profile_id: profileId, expertise_area_id: areaId },
      });
      if (!existing) {
        await this.prisma.expertProfileExpertiseArea.create({
          data: {
            expert_profile_id: profileId,
            expertise_area_id: areaId,
            level: 'intermediate',
            years_of_experience: 0,
          },
        });
      }
    }
  }
}

async updateExpertiseLevel( userId: string, expertiseAreaId: string, level?: string, yearsOfExperience?: number) {
  const profile = await this.findByUserOrFail(userId);
  const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
    where: {
      expert_profile_id: profile.id,
      expertise_area_id: expertiseAreaId,
    },
    include: { expertiseArea: true },
  });

  if (!connection) {
    throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
  }

  return this.prisma.expertProfileExpertiseArea.update({
    where: { id: connection.id },
    data: {
      level: level ?? undefined,
      years_of_experience: yearsOfExperience ?? undefined,
    },
    include: { expertiseArea: true },
  });
}

  async removeExpertise(userId: string, expertiseAreaId: string): Promise<void> {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profile.id,
        expertise_area_id: expertiseAreaId,
      },
    });

    if (!connection) {
      throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
    }

    await this.prisma.expertProfileExpertiseArea.delete({ where: { id: connection.id } });
  }

  async getExpertiseWithDetails(userId: string) {
    const profile = await this.findByUserOrFail(userId);
    return this.prisma.expertProfileExpertiseArea.findMany({
      where: { expert_profile_id: profile.id },
      include: { expertiseArea: true },
      orderBy: [{ expertiseArea: { category: 'asc' } }, { expertiseArea: { name: 'asc' } }],
    });
  }

  async computeExpertScore(userId: string) {
    const profile = await this.findByUserOrFail(userId);
    const expertises = await this.getExpertiseWithDetails(userId);
    return this.scoringService.computeExpertScore(profile, expertises);
  }

  async matchWithProject(userId: string, requirements: { requiredAreas: string[]; minYearsExperience: number }) {
    const profile = await this.findByUserOrFail(userId);
    const expertises = await this.getExpertiseWithDetails(userId);
    return this.scoringService.matchWithProject(profile, expertises, requirements);
  }


async getPublicProfile(id: string) {
  const profile: any = await this.findById(id);
  
  return plainToClass(PublicExpertProfileDto, {
    id: profile.id,
    headline: profile.headline,
    bio: profile.bio,
    organization: profile.organization,
    position: profile.position,
    years_of_experience: profile.years_of_experience,
    linkedin_url: profile.linkedin_url,
    availability_status: profile.availability_status,
    user: profile.user ? {
      id: profile.user.id,
      email: profile.user.email,
      profile: profile.user.profile ? {
        first_name: profile.user.profile.first_name,
        last_name: profile.user.profile.last_name,
      } : undefined,
    } : undefined,
    expertiseAreas: profile.expertiseConnections?.map((conn: any) => ({
      id: conn.expertiseArea.id,
      name: conn.expertiseArea.name,
      category: conn.expertiseArea.category,
      level: conn.level,
      years_of_experience: conn.years_of_experience,
    })) || [],
  });
}

  async getTopExperts(options: { limit: number; sortBy: 'score' | 'experience' | 'availability' }) {
    return this.recommendationService.getTopExperts(options);
  }

  async getExpertiseStatistics(): Promise<any> {
    const stats = await this.prisma.expertProfileExpertiseArea.groupBy({
      by: ['expertise_area_id'],
      _count: { id: true },
      _avg: { years_of_experience: true },
    });

    const areas = await this.prisma.expertiseArea.findMany();
    const areaMap = new Map(areas.map(a => [a.id, a]));

    return stats.map(s => ({
      name: areaMap.get(s.expertise_area_id)?.name || '',
      category: areaMap.get(s.expertise_area_id)?.category || '',
      count: s._count.id,
      avgYears: s._avg.years_of_experience,
    })).sort((a, b) => b.count - a.count);
  }

  async recommendJuryForProject(projectId: string, limit: number = 3) {
    return this.recommendationService.recommendForProject(projectId, limit);
  }

  async recommendCoachsForCohort(cohortId: string, limit: number = 3, excludeIds: string[] = []) {
    return this.recommendationService.recommendCoachs(cohortId, limit, excludeIds);
  }
  private getDefaultInclude(): any {
    return {
      user: { include: { profile: true } },
      expertiseConnections: { include: { expertiseArea: true } },
    };
  }

  private async findByUserOrFail(userId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) {
      throw new NotFoundException('Profil expert introuvable. Créez d\'abord votre profil.');
    }
    return profile;
  }

  private async updateProfileFields(profileId: string, dto: UpdateExpertDto): Promise<void> {
    const updatableFields: (keyof UpdateExpertDto)[] = [
      'headline', 'bio', 'organization', 'position',
      'years_of_experience', 'linkedin_url', 'availability_status'
    ];

    const data: any = {};
    for (const field of updatableFields) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }

    await this.prisma.expertProfile.update({
      where: { id: profileId },
      data,
    });
  }

  
  private async addExpertiseBatch(userId: string, areaIds: string[]): Promise<void> {
    for (const areaId of areaIds) {
      await this.addExpertise(userId, {
        expertiseAreaId: areaId,
        level: 'intermediate',
        years_of_experience: 0,
      }).catch(() => null);
    }
  }

  private async validateArea(areaId: string) {
    const area = await this.prisma.expertiseArea.findUnique({ where: { id: areaId } });
    if (!area) {
      throw new NotFoundException(`Domaine d'expertise #${areaId} introuvable.`);
    }
    return area;
  }

  private async checkDuplicateExpertise(profileId: string, areaId: string): Promise<void> {
    const existing = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profileId,
        expertise_area_id: areaId,
      },
    });

    if (existing) {
      throw new ConflictException('Ce domaine d\'expertise est déjà associé au profil.');
    }
  }

  private async findExpertiseConnection(userId: string, expertiseAreaId: string) {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profile.id,
        expertise_area_id: expertiseAreaId,
      },
      include: { expertiseArea: true },
    });

    if (!connection) {
      throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
    }

    return connection;
  }
}
