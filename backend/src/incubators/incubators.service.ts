import {Injectable,ForbiddenException,NotFoundException,BadRequestException,} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { UpdateIncubatorDto } from './dto/update-incubator.dto';
import { UpdateStatusDto, UpdateVerificationDto } from './dto/update-status.dto';

@Injectable()
export class IncubatorsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateIncubatorDto) {
    const existing = await this.prisma.incubator.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Ce slug est déjà utilisé');

    const saved = await this.prisma.incubator.create({
      data: {
        ...dto,
        created_by_user_id: userId,
      },
    });

    await this.prisma.incubatorMember.create({
      data: {
        user_id: userId,
        incubator_id: saved.id,
        role: 'admin',
        is_primary_contact: true,
        can_manage_members: true,
        can_manage_programs: true,
        can_manage_cohorts: true,
        status: 'active',
      },
    });

    return saved;
  }

  async findAll() {
    return this.prisma.incubator.findMany({
      include: { members: true, documents: true },
    });
  }

  async findOne(id: string) {
    const incubator = await this.prisma.incubator.findUnique({
      where: { id },
      include: {
        members: { include: { user: { include: { profile: true } } } },
        documents: true,
      },
    });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');
    return incubator;
  }

  async findByUser(userId: string) {
    const members = await this.prisma.incubatorMember.findMany({
      where: { user_id: userId },
      include: {
        incubator: { include: { members: true, documents: true } },
      },
    });
    return members.map((m) => m.incubator).filter(Boolean);
  }

  async update( id: string, dto: UpdateIncubatorDto, userId: string,) {
    await this.assertAdmin(id, userId);

    if (dto.slug) {
      const existing = await this.prisma.incubator.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw new BadRequestException('Ce slug est déjà utilisé');
    }

    return this.prisma.incubator.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.assertAdmin(id, userId);
    await this.prisma.incubator.delete({ where: { id } });
    return { message: 'Incubateur supprimé' };
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string,) {
    await this.assertAdmin(id, userId);
    return this.prisma.incubator.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateVerification(id: string, dto: UpdateVerificationDto, userId: string,) {
    await this.assertAdmin(id, userId);
    return this.prisma.incubator.update({
      where: { id },
      data: { verification_status: dto.verification_status },
    });
  }

  async getDashboard(incubatorId: string, userId: string) {
    await this.assertCanAccessDashboard(incubatorId, userId);

    const now = new Date();

    const [cohorts, allParticipations, cohortExperts, evaluations, coachings] =
      await Promise.all([
        this.prisma.cohort.findMany({
          where: { incubator_id: incubatorId },
          select: {
            id: true,
            status: true,
            capacity: true,
            current_participants: true,
          },
        }),
        this.prisma.cohortParticipation.findMany({
          where: { cohort: { incubator_id: incubatorId } },
          select: {
            status: true,
            applied_at: true,
            responded_at: true,
            project_id: true,
          },
        }),
        this.prisma.cohortExpert.findMany({
          where: { cohort: { incubator_id: incubatorId }, status: 'ACTIVE' },
          select: { expert_user_id: true, role: true },
        }),
        this.prisma.evaluation.findMany({
          where: {
            project: {
              cohort_participations: {
                some: { cohort: { incubator_id: incubatorId } },
              },
            },
          },
          select: { id: true },
        }),
        this.prisma.coaching.findMany({
          where: {
            project: {
              cohort_participations: {
                some: { cohort: { incubator_id: incubatorId } },
              },
            },
          },
          select: { id: true },
        }),
      ]);

    const totalCohorts = cohorts.length;
    const cohortsByStatus = {
      open: cohorts.filter((c) => c.status === 'OPEN').length,
      in_progress: cohorts.filter((c) => c.status === 'IN_PROGRESS').length,
      archived: cohorts.filter((c) => c.status === 'ARCHIVED').length,
    };

    const cohortsWithCapacity = cohorts.filter((c) => c.capacity);
    const averageFillRate =
      cohortsWithCapacity.length > 0
        ? Math.round(
            cohortsWithCapacity.reduce(
              (sum, c) => sum + c.current_participants / c.capacity!,
              0,
            ) / cohortsWithCapacity.length * 100,
          )
        : 0;

    const totalParticipations = allParticipations.length;
    const participationStatusCounts = {
      PENDING: allParticipations.filter((p) => p.status === 'PENDING').length,
      ACCEPTED: allParticipations.filter((p) => p.status === 'ACCEPTED').length,
      REJECTED: allParticipations.filter((p) => p.status === 'REJECTED').length,
      WITHDRAWN: allParticipations.filter((p) => p.status === 'WITHDRAWN').length,
    };
    const acceptanceRate =
      participationStatusCounts.ACCEPTED + participationStatusCounts.REJECTED > 0
        ? Math.round(
            (participationStatusCounts.ACCEPTED /
              (participationStatusCounts.ACCEPTED + participationStatusCounts.REJECTED)) *
              100,
          )
        : 0;

    const uniqueExperts = new Set(
      cohortExperts.map((e) => e.expert_user_id),
    ).size;
    const juryCount = cohortExperts.filter((e) => e.role === 'JURY').length;
    const coachCount = cohortExperts.filter((e) => e.role === 'COACH').length;

    const respondedParticipations = allParticipations.filter(
      (p) => p.responded_at && p.applied_at,
    );
    const averageDecisionDelay =
      respondedParticipations.length > 0
        ? Math.round(
            respondedParticipations.reduce(
              (sum, p) =>
                sum +
                (new Date(p.responded_at!).getTime() -
                  new Date(p.applied_at).getTime()),
              0,
            ) / respondedParticipations.length /
              (1000 * 60 * 60 * 24),
          )
        : 0;

    const activeProjectIds = new Set(
      allParticipations
        .filter((p) => p.status === 'ACCEPTED')
        .map((p) => p.project_id),
    );

    return {
      cohorts: {
        total: totalCohorts,
        ...cohortsByStatus,
        averageFillRate,
      },
      participations: {
        total: totalParticipations,
        acceptanceRate,
        statusCounts: participationStatusCounts,
      },
      experts: {
        total: uniqueExperts,
        jury: juryCount,
        coach: coachCount,
      },
      averageDecisionDelay,
      activeProjects: activeProjectIds.size,
      evaluations: evaluations.length,
      coachings: coachings.length,
    };
  }

  private async assertAdmin(incubatorId: string, userId: string): Promise<void> {
    const member = await this.prisma.incubatorMember.findFirst({
      where: { incubator_id: incubatorId, user_id: userId, role: 'admin' },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas administrateur de cet incubateur");
    }
  }

  private async assertCanAccessDashboard(
    incubatorId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
      },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de cet incubateur");
    }
    if (member.role !== 'admin' && !member.can_manage_cohorts) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour accéder au dashboard',
      );
    }
  }
}
