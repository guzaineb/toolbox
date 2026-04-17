// src/project-owner/project-owner.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';
import { CreateProjectOwnerDto } from './dto/create-project-owner.dto';

@Injectable()
export class ProjectOwnerService {
  constructor(
    @InjectRepository(ProjectOwnerProfile)
    private repo: Repository<ProjectOwnerProfile>,
  ) {}

  async create(userId: string, dto: CreateProjectOwnerDto) {
    const profile = this.repo.create({ user: { id: userId }, ...dto });
    return this.repo.save(profile);
  }

  async findByUser(userId: string) {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // ✅ AJOUT : upsert — crée si inexistant, met à jour sinon
  async upsert(userId: string, dto: CreateProjectOwnerDto) {
    const existing = await this.findByUser(userId);
    if (existing) {
      await this.repo.update({ id: existing.id }, dto);
      return this.findByUser(userId);
    }
    return this.create(userId, dto);
  }
}