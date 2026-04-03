import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const expertiseAreas = await this.areaRepo.findByIds(dto.expertiseAreaIds);
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
}