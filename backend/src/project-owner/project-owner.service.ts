import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';
import { ProjectOwnerSkill } from './project-owner-skill.entity';
import { ProjectOwnerExperience } from './project-owner-experience.entity';
import { CreateProjectOwnerDto } from './dto/create-project-owner.dto';
import { CreateSkillDto } from './dto/ceate-skill.dto';
import { CreateExperienceDto } from './dto/create.experience.dto';

@Injectable()
export class ProjectOwnerService {
  constructor(
    @InjectRepository(ProjectOwnerProfile)
    private repo: Repository<ProjectOwnerProfile>,
    @InjectRepository(ProjectOwnerSkill)
    private skillRepo: Repository<ProjectOwnerSkill>,
    @InjectRepository(ProjectOwnerExperience)
    private experienceRepo: Repository<ProjectOwnerExperience>,
  ) {}

  async create(userId: string, dto: CreateProjectOwnerDto) {
    const profile = this.repo.create({ user: { id: userId }, ...dto });
    return this.repo.save(profile);
  }

  async findByUser(userId: string) {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.profile', 'skills', 'experiences'],
    });
  }

  async findById(profileId: string) {
    const profile = await this.repo.findOne({
      where: { id: profileId },
      relations: ['user', 'user.profile', 'skills', 'experiences'],
    });
    if (!profile) throw new NotFoundException('Profil porteur introuvable');
    return profile;
  }

  async upsert(userId: string, dto: CreateProjectOwnerDto) {
    const existing = await this.findByUser(userId);
    if (existing) {
      await this.repo.update({ id: existing.id }, dto);
      return this.findByUser(userId);
    }
    return this.create(userId, dto);
  }

  // ─── Admin: list all ──────────────────────────────────────────────────────

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['user', 'user.profile', 'skills', 'experiences'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Admin patch any profile by id
  async adminPatch(profileId: string, dto: CreateProjectOwnerDto) {
    const profile = await this.findById(profileId);
    await this.repo.update({ id: profile.id }, dto);
    return this.findById(profileId);
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  async addSkill(userId: string, dto: CreateSkillDto) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Créez d\'abord votre profil porteur');
    const skill = this.skillRepo.create({ ...dto, profile });
    return this.skillRepo.save(skill);
  }

  async getSkills(userId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) return [];
    return this.skillRepo.find({ where: { profile: { id: profile.id } } });
  }

  async deleteSkill(userId: string, skillId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Profil introuvable');
    const skill = await this.skillRepo.findOne({
      where: { id: skillId, profile: { id: profile.id } },
    });
    if (!skill) throw new NotFoundException('Compétence introuvable');
    await this.skillRepo.remove(skill);
    return { deleted: true };
  }

  // ─── Experiences ──────────────────────────────────────────────────────────

  async addExperience(userId: string, dto: CreateExperienceDto) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Créez d\'abord votre profil porteur');
    const exp = this.experienceRepo.create({ ...dto, profile });
    return this.experienceRepo.save(exp);
  }

  async getExperiences(userId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) return [];
    return this.experienceRepo.find({
      where: { profile: { id: profile.id } },
      order: { start_date: 'DESC' },
    });
  }

  async deleteExperience(userId: string, expId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Profil introuvable');
    const exp = await this.experienceRepo.findOne({
      where: { id: expId, profile: { id: profile.id } },
    });
    if (!exp) throw new NotFoundException('Expérience introuvable');
    await this.experienceRepo.remove(exp);
    return { deleted: true };
  }
}
