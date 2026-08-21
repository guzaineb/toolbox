import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ImprovementPlanStatus } from '@prisma/client';

class UpdatePlanDto {
  @IsOptional()
  @IsString()
  status?: ImprovementPlanStatus;
}

class UpdateObjectiveDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  progress?: number;
}

type RequestUser = { user: { id: string } };

/**
 * Plan d'amélioration : consultation (équipe projet) et validation par le coach.
 * Le plan généré par l'IA reste en DRAFT tant que le coach ne l'a pas activé.
 */
@UseGuards(JwtAuthGuard)
@Controller()
export class ImprovementPlanController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
  ) {}

  @Get('projects/:projectId/improvement-plans')
  async list(@Param('projectId') projectId: string, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const plans = await this.prisma.improvementPlan.findMany({
      where: { project_id: projectId },
      include: { objectives: { orderBy: { created_at: 'asc' } } },
      orderBy: { created_at: 'desc' },
    });
    return plans;
  }

  /** Validation du coach : DRAFT → ACTIVE (human-in-the-loop). */
  @Patch('improvement-plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto, @Req() req: RequestUser) {
    const plan = await this.prisma.improvementPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan introuvable');

    await this.access.assertCanManageProjectCoaching(plan.project_id, req.user.id);

    if (!dto.status) throw new BadRequestException('Aucune modification fournie');

    const allowed = ['ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
    if (!allowed.includes(dto.status as (typeof allowed)[number])) {
      throw new BadRequestException('Statut de plan invalide');
    }
    if (plan.status === ImprovementPlanStatus.DRAFT && dto.status !== 'ACTIVE') {
      throw new BadRequestException(
        "Un brouillon doit d'abord être activé avant d'être clôturé ou archivé",
      );
    }

    return this.prisma.improvementPlan.update({
      where: { id },
      data: {
        status: dto.status as ImprovementPlanStatus,
        validated_by:
          plan.status === ImprovementPlanStatus.DRAFT ? req.user.id : plan.validated_by,
        validated_at:
          plan.status === ImprovementPlanStatus.DRAFT ? new Date() : plan.validated_at,
        progress:
          dto.status === 'COMPLETED' ? 100 : plan.progress,
      },
      include: { objectives: true },
    });
  }

  /** Suivi d'un objectif par le porteur ou le coach. */
  @Patch('improvement-objectives/:id')
  async updateObjective(
    @Param('id') id: string,
    @Body() dto: UpdateObjectiveDto,
    @Req() req: RequestUser,
  ) {
    const objective = await this.prisma.improvementObjective.findUnique({
      where: { id },
      include: { plan: { select: { project_id: true, status: true } } },
    });
    if (!objective) throw new NotFoundException('Objectif introuvable');
    if (objective.plan.status !== ImprovementPlanStatus.ACTIVE) {
      throw new BadRequestException("Le plan n'est pas actif");
    }

    // Porteur ou coach : les deux peuvent faire progresser un objectif
    const project = await this.prisma.project.findUnique({
      where: { id: objective.plan.project_id },
      select: { owner_id: true },
    });
    const isOwner = project?.owner_id === req.user.id;
    try {
      await this.access.assertCanManageProjectCoaching(objective.plan.project_id, req.user.id);
    } catch {
      if (!isOwner) {
        throw new ForbiddenException('Accès refusé à cet objectif');
      }
    }

    const statusValues = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (dto.status && !statusValues.includes(dto.status)) {
      throw new BadRequestException('Statut invalide');
    }
    const progress =
      dto.progress !== undefined
        ? Math.max(0, Math.min(100, Math.round(dto.progress)))
        : dto.status === 'COMPLETED'
          ? 100
          : undefined;

    const updated = await this.prisma.improvementObjective.update({
      where: { id },
      data: {
        status: (dto.status as never) ?? objective.status,
        ...(progress !== undefined ? { progress } : {}),
      },
    });

    // Recalcule la progression globale du plan
    const objectives = await this.prisma.improvementObjective.findMany({
      where: { plan_id: objective.plan_id },
    });
    const avg = Math.round(
      objectives.reduce((sum, o) => sum + o.progress, 0) / Math.max(1, objectives.length),
    );
    await this.prisma.improvementPlan.update({
      where: { id: objective.plan_id },
      data: { progress: avg },
    });

    void updated;
    return this.prisma.improvementObjective.findUnique({ where: { id } });
  }
}
