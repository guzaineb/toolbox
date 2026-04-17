import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { ExpertiseArea } from './expertise-area.entity';
import { CreateExpertDto } from './dto/create-expert.dto';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(ExpertProfile)
    private expertRepo: Repository<ExpertProfile>,
    @InjectRepository(ExpertiseArea)
    private areaRepo: Repository<ExpertiseArea>,
  ) {}

  async create(userId: string, dto: CreateExpertDto) {
    const expertiseAreas = dto.expertiseAreaIds?.length
      ? await this.areaRepo.findBy({ id: In(dto.expertiseAreaIds) })
      : [];

    const expert = this.expertRepo.create({
      user: { id: userId },
      headline: dto.headline,
      bio: dto.bio,
      organization: dto.organization,
      position: dto.position,
      years_of_experience: dto.years_of_experience,
      linkedin_url: dto.linkedin_url,
      expertiseAreas,
    });
    return this.expertRepo.save(expert);
  }

  async findByUser(userId: string) {
    return this.expertRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'expertiseAreas'],
    });
  }

  // ✅ AJOUT : upsert
  async upsert(userId: string, dto: CreateExpertDto) {
    const existing = await this.findByUser(userId);

    const expertiseAreas = dto.expertiseAreaIds?.length
      ? await this.areaRepo.findBy({ id: In(dto.expertiseAreaIds) })
      : [];

    if (existing) {
      existing.headline = dto.headline ?? existing.headline;
      existing.bio = dto.bio ?? existing.bio;
      existing.organization = dto.organization ?? existing.organization;
      existing.position = dto.position ?? existing.position;
      existing.years_of_experience = dto.years_of_experience ?? existing.years_of_experience;
      existing.linkedin_url = dto.linkedin_url ?? existing.linkedin_url;
      if (dto.expertiseAreaIds) existing.expertiseAreas = expertiseAreas;
      return this.expertRepo.save(existing);
    }
    return this.create(userId, dto);
  }

  // ✅ AJOUT : liste toutes les areas disponibles
  async getAllAreas() {
    return this.areaRepo.find({ order: { category: 'ASC', name: 'ASC' } });
  }
}