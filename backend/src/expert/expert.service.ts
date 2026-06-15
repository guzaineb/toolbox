
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { Repository,In } from 'typeorm';
import { ExpertiseArea } from './expertise-area.entity';
import { ExpertProfileExpertiseArea } from './expert-profile-expertise-area.entity';
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
    @InjectRepository(ExpertProfile)
    private expertRepo: Repository<ExpertProfile>,
    @InjectRepository(ExpertiseArea)
    private areaRepo: Repository<ExpertiseArea>,
    @InjectRepository(ExpertProfileExpertiseArea)
    private expertiseConnRepo: Repository<ExpertProfileExpertiseArea>,
    private scoringService: ExpertScoringService,
    private recommendationService: ExpertRecommendationService,
  ) {}

  async create(userId: string, dto: CreateExpertDto): Promise<ExpertProfile> {
    const existing = await this.findByUser(userId);
    if (existing) {
      throw new ConflictException('Un profil expert existe déjà pour cet utilisateur.');
    }

    const expert = this.expertRepo.create({
      user: { id: userId },
      headline: dto.headline,
      bio: dto.bio,
      organization: dto.organization,
      position: dto.position,
      years_of_experience: dto.years_of_experience,
      linkedin_url: dto.linkedin_url,
      availability_status: 'available',
    });

    const savedExpert = await this.expertRepo.save(expert);

    if (dto.expertiseAreaIds?.length) {
      await this.addExpertiseBatch(userId, dto.expertiseAreaIds);
    }

    return this.findById(savedExpert.id);
  }

  async findByUser(userId: string): Promise<ExpertProfile | null> {
    return this.expertRepo.findOne({
      where: { user: { id: userId } },
      relations: this.getDefaultRelations(),
    });
  }

  async findById(id: string): Promise<ExpertProfile> {
    const profile = await this.expertRepo.findOne({
      where: { id },
      relations: this.getDefaultRelations(),
    });
    if (!profile) throw new NotFoundException(`Expert #${id} introuvable.`);
    return profile;
  }

  async findAll(filters?: ExpertFiltersDto): Promise<ExpertProfile[]> {
    const query = this.expertRepo
      .createQueryBuilder('expert')
      .leftJoinAndSelect('expert.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('expert.expertiseConnections', 'connections')
      .leftJoinAndSelect('connections.expertiseArea', 'expertiseArea');

    if (filters?.availability) {
      query.andWhere('expert.availability_status = :availability', {
        availability: filters.availability,
      });
    }

    if (filters?.expertiseAreaId) {
      query.andWhere('expertiseArea.id = :areaId', {
        areaId: filters.expertiseAreaId,
      });
    }

    if (filters?.minYears) {
      query.andWhere('expert.years_of_experience >= :minYears', {
        minYears: filters.minYears,
      });
    }

    return query.getMany();
  }

  async upsert(userId: string, dto: UpdateExpertDto): Promise<ExpertProfile> {
    const existing = await this.findByUser(userId);

    if (!existing) {
      if (!dto.headline) {
        throw new BadRequestException('Le champ headline est requis pour créer un profil expert.');
      }
      return this.create(userId, dto as CreateExpertDto);
    }

    await this.updateProfileFields(existing, dto);

    if (dto.expertiseAreaIds !== undefined) {
      await this.updateExpertiseAreas(existing.id, dto.expertiseAreaIds);
    }

    return this.findById(existing.id);
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.findByUserOrFail(userId);
    await this.expertiseConnRepo.delete({ expertProfile: { id: profile.id } });
    await this.expertRepo.remove(profile);
  }

  async getAllAreas(): Promise<ExpertiseArea[]> {
    return this.areaRepo.find({ order: { category: 'ASC', name: 'ASC' } });
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
async addExpertise(userId: string, dto: AddExpertiseDto): Promise<ExpertProfileExpertiseArea> {
  const profile = await this.findByUserOrFail(userId);
  
  const area = await this.areaRepo.findOne({ 
    where: { id: dto.expertiseAreaId } 
  });
  
  if (!area) {
    throw new NotFoundException(`Domaine d'expertise #${dto.expertiseAreaId} introuvable.`);
  }
  
  const existingConnection = await this.expertiseConnRepo.findOne({
    where: {
      expertProfile: { id: profile.id },
      expertiseArea: { id: area.id }
    }
  });

  if (existingConnection) {
    throw new ConflictException('Ce domaine d\'expertise est déjà associé au profil.');
  }
  
  const connection = new ExpertProfileExpertiseArea();
  connection.expertProfile = profile;
  connection.expertiseArea = area;
  
  // CORRECTION 1: Valeurs par défaut si non fournies
  connection.level = dto.level !== undefined && dto.level !== null 
    ? dto.level 
    : 'intermediate';
  
  // CORRECTION 2: Permettre la valeur 0
  connection.years_of_experience = dto.years_of_experience !== undefined && dto.years_of_experience !== null
    ? dto.years_of_experience
    : (profile.years_of_experience !== undefined && profile.years_of_experience !== null
        ? profile.years_of_experience
        : 0);

  return this.expertiseConnRepo.save(connection);
}

async addMultipleExpertise(userId: string, expertiseList: AddExpertiseDto[]): Promise<ExpertProfileExpertiseArea[]> {
  const results: ExpertProfileExpertiseArea[] = [];
  const errors: string[] = [];
  
  for (const dto of expertiseList) {
    try {
      const result = await this.addExpertise(userId, dto);
      results.push(result);
    } catch (error) {
      if (error instanceof ConflictException) {
        console.log(`Expertise ${dto.expertiseAreaId} already exists, skipping...`);
        errors.push(`Expertise ${dto.expertiseAreaId} existe déjà`);
        continue;
      }
      console.error(`Erreur lors de l'ajout de l'expertise ${dto.expertiseAreaId}:`, error);
      throw error;
    }
  }
  
  // CORRECTION 3: Retourner une erreur si aucune expertise n'a été ajoutée
  if (results.length === 0 && errors.length > 0) {
    throw new BadRequestException(`Aucune expertise n'a pu être ajoutée: ${errors.join(', ')}`);
  }
  
  return results;
}

async updateExpertiseAreas(profileId: string, areaIds: string[]): Promise<void> {
  // CORRECTION 4: Ne rien faire si areaIds est undefined ou null
  if (!areaIds) {
    return;
  }
  
  if (areaIds.length > 0) {
    const areas = await this.areaRepo.findBy({ id: In(areaIds) });
    
    for (const area of areas) {
      const connection = new ExpertProfileExpertiseArea();
      connection.expertProfile = { id: profileId } as ExpertProfile;
      connection.expertiseArea = area;
      connection.level = 'intermediate';
      connection.years_of_experience = 0;
      
      await this.expertiseConnRepo.save(connection);
    }
  }
}

async updateExpertiseLevel( userId: string, expertiseAreaId: string,level?: string,yearsOfExperience?: number): Promise<ExpertProfileExpertiseArea> {
  const profile = await this.findByUserOrFail(userId);
  const connection = await this.expertiseConnRepo.findOne({
    where: {
      expertProfile: { id: profile.id },
      expertiseArea: { id: expertiseAreaId },
    },
    relations: ['expertiseArea'],
  });

  if (!connection) {
    throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
  }
    if (level !== undefined && level !== null) {
    connection.level = level;
  }
  
  if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
    connection.years_of_experience = yearsOfExperience;
  }

  return this.expertiseConnRepo.save(connection);
}

  async removeExpertise(userId: string, expertiseAreaId: string): Promise<void> {
    const profile = await this.findByUserOrFail(userId);
    const result = await this.expertiseConnRepo.delete({
      expertProfile: { id: profile.id },
      expertiseArea: { id: expertiseAreaId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
    }
  }

  async getExpertiseWithDetails(userId: string): Promise<ExpertProfileExpertiseArea[]> {
    const profile = await this.findByUserOrFail(userId);
    return this.expertiseConnRepo.find({
      where: { expertProfile: { id: profile.id } },
      relations: ['expertiseArea'],
      order: { expertiseArea: { category: 'ASC', name: 'ASC' } } as any,
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


async getPublicProfile(id: string): Promise<PublicExpertProfileDto> {
  const profile = await this.findById(id);
  
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
    expertiseAreas: profile.expertiseConnections?.map(conn => ({
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
    return this.expertiseConnRepo
      .createQueryBuilder('conn')
      .leftJoin('conn.expertiseArea', 'area')
      .select('area.name', 'name')
      .addSelect('area.category', 'category')
      .addSelect('COUNT(conn.id)', 'count')
      .addSelect('AVG(conn.years_of_experience)', 'avgYears')
      .groupBy('area.id')
      .addGroupBy('area.name')
      .addGroupBy('area.category')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async recommendJuryForProject(projectId: string, limit: number = 3) {
    return this.recommendationService.recommendForProject(projectId, limit);
  }

  async recommendCoachsForCohort(cohortId: string, limit: number = 3, excludeIds: string[] = []) {
    return this.recommendationService.recommendCoachs(cohortId, limit, excludeIds);
  }
  private getDefaultRelations(): string[] {
    return ['user', 'user.profile', 'expertiseConnections', 'expertiseConnections.expertiseArea'];
  }

  private async findByUserOrFail(userId: string): Promise<ExpertProfile> {
    const profile = await this.findByUser(userId);
    if (!profile) {
      throw new NotFoundException('Profil expert introuvable. Créez d\'abord votre profil.');
    }
    return profile;
  }

  private async updateProfileFields(profile: ExpertProfile, dto: UpdateExpertDto): Promise<void> {
    const updatableFields: (keyof UpdateExpertDto)[] = [
      'headline', 'bio', 'organization', 'position',
      'years_of_experience', 'linkedin_url', 'availability_status'
    ];

    for (const field of updatableFields) {
      if (dto[field] !== undefined) {
        (profile as any)[field] = dto[field];
      }
    }

    await this.expertRepo.save(profile);
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

  private async validateArea(areaId: string): Promise<ExpertiseArea> {
    const area = await this.areaRepo.findOne({ where: { id: areaId } });
    if (!area) {
      throw new NotFoundException(`Domaine d'expertise #${areaId} introuvable.`);
    }
    return area;
  }

  private async checkDuplicateExpertise(profileId: string, areaId: string): Promise<void> {
    const existing = await this.expertiseConnRepo.findOne({
      where: {
        expertProfile: { id: profileId },
        expertiseArea: { id: areaId },
      },
    });

    if (existing) {
      throw new ConflictException('Ce domaine d\'expertise est déjà associé au profil.');
    }
  }

  private async findExpertiseConnection(userId: string, expertiseAreaId: string): Promise<ExpertProfileExpertiseArea> {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.expertiseConnRepo.findOne({
      where: {
        expertProfile: { id: profile.id },
        expertiseArea: { id: expertiseAreaId },
      },
      relations: ['expertiseArea'],
    });

    if (!connection) {
      throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
    }

    return connection;
  }
}