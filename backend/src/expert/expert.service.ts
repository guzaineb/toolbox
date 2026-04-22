import {Injectable,ConflictException,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { ExpertiseArea } from './expertise-area.entity';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(ExpertProfile)
    private expertRepo: Repository<ExpertProfile>,
    @InjectRepository(ExpertiseArea)
    private areaRepo: Repository<ExpertiseArea>,
  ) {}

  async create(userId: string, dto: CreateExpertDto): Promise<ExpertProfile> {
    const existing = await this.findByUser(userId);
    if (existing) {
      throw new ConflictException('Un profil expert existe déjà pour cet utilisateur.');
    }

    const expertiseAreas = dto.expertiseAreaIds?.length
      ? await this.resolveAreas(dto.expertiseAreaIds)
      : [];

    const expert = this.expertRepo.create({
      user: { id: userId },
      headline: dto.headline,
      bio: dto.bio,
      organization: dto.organization,
      position: dto.position,
      years_of_experience: dto.years_of_experience,
      linkedin_url: dto.linkedin_url,
      availability_status: 'available',
      expertiseAreas,
    });

    return this.expertRepo.save(expert);
  }

  async findByUser(userId: string): Promise<ExpertProfile | null> {
    return this.expertRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.profile', 'expertiseAreas'],
    });
  }

  async findById(id: string): Promise<ExpertProfile> {
    const profile = await this.expertRepo.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'expertiseAreas'],
    });
    if (!profile) throw new NotFoundException(`Expert #${id} introuvable.`);
    return profile;
  }

  async findAll(): Promise<ExpertProfile[]> {
    return this.expertRepo.find({
      relations: ['user', 'user.profile', 'expertiseAreas'],
      order: { headline: 'ASC' },
    });
  }

  async upsert(userId: string, dto: UpdateExpertDto): Promise<ExpertProfile> {
    const existing = await this.findByUser(userId);

    if (!existing) {
      // Crée avec les champs fournis (headline requis pour create)
      if (!dto.headline) {
        throw new BadRequestException('Le champ headline est requis pour créer un profil expert.');
      }
      return this.create(userId, dto as CreateExpertDto);
    }

    // Mise à jour partielle
    if (dto.headline !== undefined) existing.headline = dto.headline;
    if (dto.bio !== undefined) existing.bio = dto.bio;
    if (dto.organization !== undefined) existing.organization = dto.organization;
    if (dto.position !== undefined) existing.position = dto.position;
    if (dto.years_of_experience !== undefined) existing.years_of_experience = dto.years_of_experience;
    if (dto.linkedin_url !== undefined) existing.linkedin_url = dto.linkedin_url;
    if (dto.availability_status !== undefined) existing.availability_status = dto.availability_status;

    if (dto.expertiseAreaIds !== undefined) {
      existing.expertiseAreas = dto.expertiseAreaIds.length
        ? await this.resolveAreas(dto.expertiseAreaIds)
        : [];
    }

    return this.expertRepo.save(existing);
  }

  // ── Domaines d'expertise ───────────────────────────────────────────────────

  /**
   * Lister tous les domaines disponibles, triés par catégorie puis nom.
   */
  async getAllAreas(): Promise<ExpertiseArea[]> {
    return this.areaRepo.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  /**
   * Ajouter un domaine d'expertise au profil de l'utilisateur.
   */
  async addExpertise(userId: string, dto: AddExpertiseDto): Promise<ExpertProfile> {
    const profile = await this.findByUserOrFail(userId);
    const area = await this.areaRepo.findOne({ where: { id: dto.expertiseAreaId } });
    if (!area) throw new NotFoundException(`Domaine d'expertise #${dto.expertiseAreaId} introuvable.`);

    const alreadyAdded = profile.expertiseAreas.some((a) => a.id === area.id);
    if (alreadyAdded) {
      throw new ConflictException('Ce domaine d\'expertise est déjà associé au profil.');
    }

    profile.expertiseAreas = [...profile.expertiseAreas, area];
    return this.expertRepo.save(profile);
  }

  /**
   * Retirer un domaine d'expertise du profil de l'utilisateur.
   */
  async removeExpertise(userId: string, expertiseAreaId: string): Promise<ExpertProfile> {
    const profile = await this.findByUserOrFail(userId);

    const before = profile.expertiseAreas.length;
    profile.expertiseAreas = profile.expertiseAreas.filter((a) => a.id !== expertiseAreaId);

    if (profile.expertiseAreas.length === before) {
      throw new NotFoundException('Ce domaine d\'expertise n\'est pas associé au profil.');
    }

    return this.expertRepo.save(profile);
  }

  // ── Helpers privés ─────────────────────────────────────────────────────────

  private async findByUserOrFail(userId: string): Promise<ExpertProfile> {
    const profile = await this.findByUser(userId);
    if (!profile) {
      throw new NotFoundException('Profil expert introuvable. Créez d\'abord votre profil.');
    }
    return profile;
  }

  private async resolveAreas(ids: string[]): Promise<ExpertiseArea[]> {
    const areas = await this.areaRepo.findBy({ id: In(ids) });
    if (areas.length !== ids.length) {
      throw new BadRequestException('Certains domaines d\'expertise fournis sont invalides.');
    }
    return areas;
  }
}