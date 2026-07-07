import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectOwnerDto } from './dto/create-project-owner.dto';
import { CreateSkillDto } from './dto/ceate-skill.dto';
import { CreateExperienceDto } from './dto/create.experience.dto';

@Injectable()
export class ProjectOwnerService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateProjectOwnerDto) {
    return this.prisma.projectOwnerProfile.create({
      data: {
        user_id: userId,
        ...dto,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.projectOwnerProfile.findUnique({
      where: { user_id: userId },
      include: { user: { include: { profile: true } }, skills: true, experiences: true },
    });
  }

  async findById(profileId: string) {
    const profile = await this.prisma.projectOwnerProfile.findUnique({
      where: { id: profileId },
      include: { user: { include: { profile: true } }, skills: true, experiences: true },
    });
    if (!profile) throw new NotFoundException('Profil porteur introuvable');
    return profile;
  }

  async upsert(userId: string, dto: CreateProjectOwnerDto) {
    const existing = await this.findByUser(userId);
    if (existing) {
      await this.prisma.projectOwnerProfile.update({
        where: { id: existing.id },
        data: dto as any,
      });
      return this.findByUser(userId);
    }
    return this.create(userId, dto);
  }

  // ─── Admin: list all ──────────────────────────────────────────────────────

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.projectOwnerProfile.findMany({
        include: { user: { include: { profile: true } }, skills: true, experiences: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.projectOwnerProfile.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Admin patch any profile by id
  async adminPatch(profileId: string, dto: CreateProjectOwnerDto) {
    const profile = await this.findById(profileId);
    await this.prisma.projectOwnerProfile.update({
      where: { id: profile.id },
      data: dto as any,
    });
    return this.findById(profileId);
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  async addSkill(userId: string, dto: CreateSkillDto) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Créez d\'abord votre profil porteur');
    return this.prisma.projectOwnerSkill.create({
      data: {
        skill_name: dto.skill_name,
        level: dto.level,
        project_owner_profile_id: profile.id,
      },
    });
  }

  async getSkills(userId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) return [];
    return this.prisma.projectOwnerSkill.findMany({
      where: { project_owner_profile_id: profile.id },
    });
  }

  async deleteSkill(userId: string, skillId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Profil introuvable');
    const skill = await this.prisma.projectOwnerSkill.findFirst({
      where: { id: skillId, project_owner_profile_id: profile.id },
    });
    if (!skill) throw new NotFoundException('Compétence introuvable');
    await this.prisma.projectOwnerSkill.delete({ where: { id: skillId } });
    return { deleted: true };
  }

  // ─── Experiences ──────────────────────────────────────────────────────────

  async addExperience(userId: string, dto: CreateExperienceDto) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Créez d\'abord votre profil porteur');
    return this.prisma.projectOwnerExperience.create({
      data: {
        title: dto.title,
        organization: dto.organization,
        description: dto.description,
        start_date: dto.start_date,
        end_date: dto.end_date,
        project_owner_profile_id: profile.id,
      },
    });
  }

  async getExperiences(userId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) return [];
    return this.prisma.projectOwnerExperience.findMany({
      where: { project_owner_profile_id: profile.id },
      orderBy: { start_date: 'desc' },
    });
  }

  async deleteExperience(userId: string, expId: string) {
    const profile = await this.findByUser(userId);
    if (!profile) throw new NotFoundException('Profil introuvable');
    const exp = await this.prisma.projectOwnerExperience.findFirst({
      where: { id: expId, project_owner_profile_id: profile.id },
    });
    if (!exp) throw new NotFoundException('Expérience introuvable');
    await this.prisma.projectOwnerExperience.delete({ where: { id: expId } });
    return { deleted: true };
  }
}
