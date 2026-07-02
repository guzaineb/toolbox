import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class BusinessPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly ai: AiService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  private async upsertModel(model: any, projectId: string, data: any, section: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await model.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...data },
      update: data,
    });
    await this.updateProgress(projectId, section);
    return record;
  }

  private async updateProgress(projectId: string, stepKey: string) {
    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: stepKey } },
      create: { project_id: projectId, step_key: stepKey, status: 'COMPLETED', completed_at: new Date() },
      update: { status: 'COMPLETED', completed_at: new Date() },
    });
  }

  async getManagementPlan(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.managementPlan.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateManagementPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.managementPlan, projectId, data, 'bp_2.1', userId);
  }

  async getMarketingPlan(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.marketingPlan.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateMarketingPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.marketingPlan, projectId, data, 'bp_2.2', userId);
  }

  async getFinancialPlan(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.financialPlan.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateFinancialPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.financialPlan, projectId, data, 'bp_2.3', userId);
  }

  async getLegalPlan(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.legalPlan.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateLegalPlan(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.legalPlan, projectId, data, 'bp_2.4', userId);
  }

  async getKpis(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.kpi.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateKpis(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.kpi, projectId, data, 'bp_2.5', userId);
  }

  async getExecutiveSummary(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.executiveSummary.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async updateExecutiveSummary(projectId: string, data: any, userId: string) {
    return this.upsertModel(this.prisma.executiveSummary, projectId, data, 'bp_2.6', userId);
  }

  async generateExecutiveSummary(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const [mgmt, mkt, fin, legal, kpi] = await Promise.all([
      this.prisma.managementPlan.findUnique({ where: { project_id: projectId } }),
      this.prisma.marketingPlan.findUnique({ where: { project_id: projectId } }),
      this.prisma.financialPlan.findUnique({ where: { project_id: projectId } }),
      this.prisma.legalPlan.findUnique({ where: { project_id: projectId } }),
      this.prisma.kpi.findUnique({ where: { project_id: projectId } }),
    ]);

    const context = {
      management: mgmt || {},
      marketing: mkt || {},
      financial: fin || {},
      legal: legal || {},
      kpis: kpi || {},
    };

    const summary = await this.ai.generateSummary(projectId, 'bp_2.6', context);

    const record = await this.prisma.executiveSummary.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, resume_executif: summary, generated_by_ai: true },
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

    await this.updateProgress(projectId, 'bp_2.6');

    return record;
  }

  async getProgress(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const stepKeys = ['bp_2.1', 'bp_2.2', 'bp_2.3', 'bp_2.4', 'bp_2.5', 'bp_2.6'];
    const steps = await this.prisma.stepProgress.findMany({
      where: { project_id: projectId, step_key: { in: stepKeys } },
    });

    const total = stepKeys.length;
    const completed = steps.filter(s => s.status === 'COMPLETED').length;

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      steps: stepKeys.map(key => ({
        stepKey: key,
        status: steps.find(s => s.step_key === key)?.status || 'NOT_STARTED',
      })),
    };
  }
}
