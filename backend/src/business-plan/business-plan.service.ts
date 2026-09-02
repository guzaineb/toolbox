import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SectionStepService } from '../common/services/section-step.service';
import { ProgressService } from '../common/services/progress.service';
import { ProjectContextService } from '../common/services/project-context.service';
import { GbmService } from '../gbm/gbm.service';

@Injectable()
export class BusinessPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
    private readonly progress: ProgressService,
    private readonly ai: AiService,
    private readonly projectContext: ProjectContextService,
    private readonly gbm: GbmService,
  ) {}

  private async upsertModel(
    model: any,
    projectId: string,
    data: any,
    section: string,
    userId: string,
  ) {
    await this.sections.ensureOwnership(projectId, userId);
    return this.sections.saveSection(model, projectId, data, {
      stepKey: section,
    });
  }

  async getManagementPlan(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.managementPlan.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateManagementPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(
      this.prisma.managementPlan,
      projectId,
      data,
      'bp_2.1',
      userId,
    );
  }

  async getMarketingPlan(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.marketingPlan.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateMarketingPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(
      this.prisma.marketingPlan,
      projectId,
      data,
      'bp_2.2',
      userId,
    );
  }

  async getFinancialPlan(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.financialPlan.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateFinancialPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(
      this.prisma.financialPlan,
      projectId,
      data,
      'bp_2.3',
      userId,
    );
  }

  async getLegalPlan(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.legalPlan.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateLegalPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(
      this.prisma.legalPlan,
      projectId,
      data,
      'bp_2.4',
      userId,
    );
  }

  async getKpis(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.kpi.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateKpis(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.kpi, projectId, data, 'bp_2.5', userId);
  }

  async getExecutiveSummary(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.executiveSummary.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async updateExecutiveSummary(projectId: string, data: any, userId: string) {
    return this.upsertModel(
      this.prisma.executiveSummary,
      projectId,
      data,
      'bp_2.6',
      userId,
    );
  }

  async generateExecutiveSummary(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const context = await this.projectContext.getFullContext(projectId);

    const summary = await this.ai.generateSummary(projectId, 'bp_2.6', context);

    const record = await this.prisma.executiveSummary.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        resume_executif: summary,
        generated_by_ai: true,
      },
      update: { resume_executif: summary, generated_by_ai: true },
    });

    await this.prisma.aiInteraction.create({
      data: {
        project_id: projectId,
        step_key: 'bp_2.6',
        prompt: 'Generate executive summary',
        response: summary,
        model: 'gpt-4',
      },
    });

    await this.sections.markStepComplete(projectId, 'bp_2.6');

    return record;
  }

  async getProgress(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const stepKeys = [
      'bp_2.1',
      'bp_2.2',
      'bp_2.3',
      'bp_2.4',
      'bp_2.5',
      'bp_2.6',
    ];
    return this.progress.compute(projectId, stepKeys);
  }

  /**
   * État du gating GBM → Business Plan (D7) :
   * statut de finalisation, disponibilité GBM et liste des étapes manquantes.
   */
  async getFinalizationStatus(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { business_plan_status: true, business_plan_finalized_at: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    const missing = await this.gbm.getMissingRequiredSteps(projectId);
    return {
      status: project.business_plan_status ?? null,
      finalizedAt: project.business_plan_finalized_at ?? null,
      isGbmReady: missing.length === 0,
      missingSteps: missing.map(s => ({
        stepKey: s.stepKey,
        title: s.title,
      })),
    };
  }

  /**
   * Finalise le Business Plan. Interdit tant que le GBM est incomplet (D7).
   */
  async finalizeBusinessPlan(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const missing = await this.gbm.getMissingRequiredSteps(projectId);
    if (missing.length > 0) {
      throw new BadRequestException({
        message:
          'Le GBM doit être suffisamment complet avant de finaliser le Plan d’Affaires.',
        missingSteps: missing.map(s => ({ stepKey: s.stepKey, title: s.title })),
      });
    }

    const finalizeAt = new Date();
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        business_plan_status: 'FINAL',
        business_plan_finalized_at: finalizeAt,
      },
    });

    return {
      message: 'Plan d’Affaires finalisé',
      status: project.business_plan_status,
      finalized_at: project.business_plan_finalized_at,
    };
  }
}
