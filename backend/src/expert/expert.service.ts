import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilityStatus,
  ExpertiseArea,
  CohortStatus,
  ParticipationStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';
import { plainToClass } from 'class-transformer';
import { PublicExpertProfileDto } from './dto/public-expert-profile.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

/**
 * Profil expert avec ses relations, tel que renvoyé par l'annuaire. Inclut le
 * compte `user` (identité seule) pour résoudre le nom de l'expert.
 */
type ExpertProfileWithRelations = Prisma.ExpertProfileGetPayload<{
  include: {
    user: { include: { profile: true } };
    expertiseConnections: { include: { expertiseArea: true } };
  };
}>;

@Injectable()
export class ExpertService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private scoringService: ExpertScoringService,
    private recommendationService: ExpertRecommendationService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(userId: string, dto: CreateExpertDto) {
    const existing = await this.findByUser(userId);
    if (existing) {
      throw new ConflictException(
        'Un profil expert existe déjà pour cet utilisateur.',
      );
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
        availability_status: 'AVAILABLE',
      },
    });

    if (dto.expertiseAreaIds?.length) {
      await this.addExpertiseBatch(userId, dto.expertiseAreaIds);
    }

    const expertProfile = await this.findById(savedExpert.id);

    const { title, message } = this.messageBuilder.newExpertProfile();
    this.eventEmitter.emit(NotificationEvent.NEW_EXPERT, {
      event: NotificationEvent.NEW_EXPERT,
      recipients: [{ userId }],
      title,
      message,
      senderId: userId,
      resourceType: 'USER',
      resourceId: expertProfile.id,
    } as NotificationPayload);

    return expertProfile;
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

  /**
   * Annuaire des experts inscrits sur la plateforme, consultable par les
   * incubateurs. Filtres : recherche plein texte (`q`), domaine d'expertise et
   * disponibilité. Réponse paginée.
   */
  async findAll(
    filters: {
      q?: string;
      expertiseAreaId?: string;
      availability?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit =
      filters.limit && filters.limit > 0 ? Math.min(50, filters.limit) : 12;

    const where: Prisma.ExpertProfileWhereInput = {};

    const availability =
      filters.availability &&
      (Object.values(AvailabilityStatus) as string[]).includes(
        filters.availability,
      )
        ? (filters.availability as AvailabilityStatus)
        : undefined;
    if (availability) where.availability_status = availability;

    if (filters.expertiseAreaId) {
      where.expertiseConnections = {
        some: { expertise_area_id: filters.expertiseAreaId },
      };
    }

    const q = filters.q?.trim();
    if (q) {
      where.OR = [
        { headline: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
        { position: { contains: q, mode: 'insensitive' } },
        {
          user: {
            is: {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                {
                  profile: {
                    is: {
                      OR: [
                        { first_name: { contains: q, mode: 'insensitive' } },
                        { last_name: { contains: q, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          expertiseConnections: {
            some: {
              expertiseArea: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.expertProfile.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          expertiseConnections: { include: { expertiseArea: true } },
        },
        orderBy: { availability_status: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expertProfile.count({ where }),
    ]);

    return {
      items: items.map((profile) => this.toPublicExpert(profile)),
      total,
      page,
      limit,
    };
  }

  /**
   * Vue publique d'un profil expert : n'expose jamais les champs sensibles du
   * compte (`password_hash`, jetons de vérification, de réinitialisation…).
   */
  private toPublicExpert(profile: ExpertProfileWithRelations) {
    return {
      id: profile.id,
      headline: profile.headline,
      bio: profile.bio,
      organization: profile.organization,
      position: profile.position,
      years_of_experience: profile.years_of_experience,
      linkedin_url: profile.linkedin_url,
      availability_status: profile.availability_status,
      user: profile.user
        ? {
            id: profile.user.id,
            email: profile.user.email,
            profile: profile.user.profile
              ? {
                  first_name: profile.user.profile.first_name,
                  last_name: profile.user.profile.last_name,
                }
              : undefined,
          }
        : undefined,
      expertiseConnections: (profile.expertiseConnections ?? []).map(
        (connection) => ({
          id: connection.id,
          level: connection.level,
          years_of_experience: connection.years_of_experience,
          expertiseArea: connection.expertiseArea
            ? {
                id: connection.expertiseArea.id,
                name: connection.expertiseArea.name,
                category: connection.expertiseArea.category,
              }
            : undefined,
        }),
      ),
    };
  }

  /**
   * Recherche d'utilisateurs experts pour l'autocomplétion (invitation d'un
   * expert dans une cohorte) : identité + profil expert, jamais le mot de passe.
   */
  async searchUsers(query: string, limit = 10) {
    const q = query?.trim();
    if (!q) return [];

    return this.prisma.user.findMany({
      where: {
        role: UserRole.EXPERT,
        expertProfile: { isNot: null },
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          {
            profile: {
              is: { first_name: { contains: q, mode: 'insensitive' } },
            },
          },
          {
            profile: {
              is: { last_name: { contains: q, mode: 'insensitive' } },
            },
          },
          {
            expertProfile: {
              is: { headline: { contains: q, mode: 'insensitive' } },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        profile: { select: { first_name: true, last_name: true } },
        expertProfile: {
          select: {
            id: true,
            headline: true,
            availability_status: true,
            expertiseConnections: {
              select: {
                id: true,
                level: true,
                expertiseArea: {
                  select: { id: true, name: true, category: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit > 0 ? Math.min(25, limit) : 10,
    });
  }

  async upsert(userId: string, dto: UpdateExpertDto) {
    const existing = await this.findByUser(userId);

    if (!existing) {
      if (!dto.headline) {
        throw new BadRequestException(
          'Le champ headline est requis pour créer un profil expert.',
        );
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
    return this.prisma.expertiseArea.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async getAreasGroupedByCategory(): Promise<Record<string, ExpertiseArea[]>> {
    const areas = await this.getAllAreas();
    return areas.reduce(
      (acc, area) => {
        const cat = area.category || 'Autres';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(area);
        return acc;
      },
      {} as Record<string, ExpertiseArea[]>,
    );
  }
  async addExpertise(userId: string, dto: AddExpertiseDto) {
    const profile = await this.findByUserOrFail(userId);

    const area = await this.prisma.expertiseArea.findUnique({
      where: { id: dto.expertiseAreaId },
    });
    if (!area) {
      throw new NotFoundException(
        `Domaine d'expertise #${dto.expertiseAreaId} introuvable.`,
      );
    }

    const existingConnection =
      await this.prisma.expertProfileExpertiseArea.findFirst({
        where: {
          expert_profile_id: profile.id,
          expertise_area_id: area.id,
        },
      });

    if (existingConnection) {
      throw new ConflictException(
        "Ce domaine d'expertise est déjà associé au profil.",
      );
    }

    return this.prisma.expertProfileExpertiseArea.create({
      data: {
        expert_profile_id: profile.id,
        expertise_area_id: area.id,
        level:
          dto.level !== undefined && dto.level !== null
            ? dto.level
            : 'intermediate',
        years_of_experience:
          dto.years_of_experience !== undefined &&
          dto.years_of_experience !== null
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
      throw new BadRequestException(
        `Aucune expertise n'a pu être ajoutée: ${errors.join(', ')}`,
      );
    }

    return results;
  }

  async updateExpertiseAreas(
    profileId: string,
    areaIds: string[],
  ): Promise<void> {
    if (!areaIds) return;

    if (areaIds.length > 0) {
      for (const areaId of areaIds) {
        const existing = await this.prisma.expertProfileExpertiseArea.findFirst(
          {
            where: { expert_profile_id: profileId, expertise_area_id: areaId },
          },
        );
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

  async updateExpertiseLevel(
    userId: string,
    expertiseAreaId: string,
    level?: string,
    yearsOfExperience?: number,
  ) {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profile.id,
        expertise_area_id: expertiseAreaId,
      },
      include: { expertiseArea: true },
    });

    if (!connection) {
      throw new NotFoundException(
        "Ce domaine d'expertise n'est pas associé au profil.",
      );
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

  async removeExpertise(
    userId: string,
    expertiseAreaId: string,
  ): Promise<void> {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profile.id,
        expertise_area_id: expertiseAreaId,
      },
    });

    if (!connection) {
      throw new NotFoundException(
        "Ce domaine d'expertise n'est pas associé au profil.",
      );
    }

    await this.prisma.expertProfileExpertiseArea.delete({
      where: { id: connection.id },
    });
  }

  async getExpertiseWithDetails(userId: string) {
    const profile = await this.findByUserOrFail(userId);
    return this.prisma.expertProfileExpertiseArea.findMany({
      where: { expert_profile_id: profile.id },
      include: { expertiseArea: true },
      orderBy: [
        { expertiseArea: { category: 'asc' } },
        { expertiseArea: { name: 'asc' } },
      ],
    });
  }

  async computeExpertScore(userId: string) {
    const profile = await this.findByUserOrFail(userId);
    const expertises = await this.getExpertiseWithDetails(userId);
    return this.scoringService.computeExpertScore(profile, expertises);
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
      user: profile.user
        ? {
            id: profile.user.id,
            email: profile.user.email,
            profile: profile.user.profile
              ? {
                  first_name: profile.user.profile.first_name,
                  last_name: profile.user.profile.last_name,
                }
              : undefined,
          }
        : undefined,
      expertiseAreas:
        profile.expertiseConnections?.map((conn: any) => ({
          id: conn.expertiseArea.id,
          name: conn.expertiseArea.name,
          category: conn.expertiseArea.category,
          level: conn.level,
          years_of_experience: conn.years_of_experience,
        })) || [],
    });
  }

  async recommendJuryForProject(projectId: string, limit: number = 3) {
    return this.recommendationService.recommendForProject(projectId, limit);
  }

  async recommendCoachsForCohort(
    cohortId: string,
    limit: number = 3,
    excludeIds: string[] = [],
  ) {
    return this.recommendationService.recommendCoachs(
      cohortId,
      limit,
      excludeIds,
    );
  }

  /**
   * Projets éligibles à une affectation d'expert (juré) : projets acceptés
   * dans une cohorte ouverte ou en cours. Renvoie une simple liste, sans
   * classement — la notation des experts face au projet est réalisée par
   * `ExpertRecommendationService` (score sémantique).
   */
  async findAssignableProjects(limit: number = 50) {
    const participations = await this.prisma.cohortParticipation.findMany({
      where: {
        status: ParticipationStatus.ACCEPTED,
        cohort: {
          status: { in: [CohortStatus.OPEN, CohortStatus.IN_PROGRESS] },
        },
      },
      include: {
        project: { select: { id: true, name: true, description: true } },
        cohort: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });

    const seen = new Set<string>();
    const results: Array<{
      project: { id: string; name: string; description: string | null };
      cohort: { id: string; name: string } | null;
    }> = [];

    for (const participation of participations) {
      if (seen.has(participation.project_id)) continue;
      seen.add(participation.project_id);

      results.push({
        project: {
          id: participation.project.id,
          name: participation.project.name,
          description: participation.project.description,
        },
        cohort: participation.cohort
          ? { id: participation.cohort.id, name: participation.cohort.name }
          : null,
      });

      if (results.length >= limit) break;
    }

    return results;
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
      throw new NotFoundException(
        "Profil expert introuvable. Créez d'abord votre profil.",
      );
    }
    return profile;
  }

  private async updateProfileFields(
    profileId: string,
    dto: UpdateExpertDto,
  ): Promise<void> {
    const updatableFields: (keyof UpdateExpertDto)[] = [
      'headline',
      'bio',
      'organization',
      'position',
      'years_of_experience',
      'linkedin_url',
      'availability_status',
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

  private async addExpertiseBatch(
    userId: string,
    areaIds: string[],
  ): Promise<void> {
    for (const areaId of areaIds) {
      await this.addExpertise(userId, {
        expertiseAreaId: areaId,
        level: 'intermediate',
        years_of_experience: 0,
      }).catch(() => null);
    }
  }

  private async validateArea(areaId: string) {
    const area = await this.prisma.expertiseArea.findUnique({
      where: { id: areaId },
    });
    if (!area) {
      throw new NotFoundException(
        `Domaine d'expertise #${areaId} introuvable.`,
      );
    }
    return area;
  }

  private async checkDuplicateExpertise(
    profileId: string,
    areaId: string,
  ): Promise<void> {
    const existing = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profileId,
        expertise_area_id: areaId,
      },
    });

    if (existing) {
      throw new ConflictException(
        "Ce domaine d'expertise est déjà associé au profil.",
      );
    }
  }

  private async findExpertiseConnection(
    userId: string,
    expertiseAreaId: string,
  ) {
    const profile = await this.findByUserOrFail(userId);
    const connection = await this.prisma.expertProfileExpertiseArea.findFirst({
      where: {
        expert_profile_id: profile.id,
        expertise_area_id: expertiseAreaId,
      },
      include: { expertiseArea: true },
    });

    if (!connection) {
      throw new NotFoundException(
        "Ce domaine d'expertise n'est pas associé au profil.",
      );
    }

    return connection;
  }
}
