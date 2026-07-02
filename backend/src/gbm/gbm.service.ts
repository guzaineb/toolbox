import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { StepStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AiService } from '../ai/ai.service';
import { GBM_STEPS, getStepConfig, StepConfig } from './step-config';
import { ALL_STEPS } from './step-registry';

@Injectable()
export class GbmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly ai: AiService,
  ) {}

  async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  private getModel(config: StepConfig) {
    const model = (this.prisma as any)[config.model];
    if (!model) throw new BadRequestException(`Unknown model: ${config.model}`);
    return model;
  }

  async getStepData(projectId: string, stepKey: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);

    if (config.relation === 'one-to-many') {
      return this.getMany(projectId, config);
    }
    return this.getOne(projectId, config);
  }

  private async getOne(projectId: string, config: StepConfig) {
    const model = this.getModel(config);
    const record = await model.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  private async getMany(projectId: string, config: StepConfig) {
    const model = this.getModel(config);
    return model.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'asc' },
    });
  }

  async updateStep(projectId: string, stepKey: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);
    if (config.relation !== 'one-to-one') {
      throw new BadRequestException(`Step ${stepKey} is one-to-many. Use add/list/delete endpoints.`);
    }

    const model = this.getModel(config);
    const filteredData = this.filterStepFields(config, data);

    const record = await model.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...filteredData },
      update: filteredData,
    });

    await this.updateStepProgress(projectId, stepKey, 'COMPLETED');

    if (config.aiGenerated) {
      await this.generateAiSummary(projectId, stepKey, record);
    }

    return record;
  }

  async addStepItem(projectId: string, stepKey: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);
    if (config.relation !== 'one-to-many') {
      throw new BadRequestException(`Step ${stepKey} is one-to-one. Use PATCH to update.`);
    }

    const model = this.getModel(config);
    const item = await model.create({
      data: { project_id: projectId, ...data },
    });

    await this.updateStepProgress(projectId, stepKey, 'IN_PROGRESS');

    return item;
  }

  async listStepItems(projectId: string, stepKey: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);

    return this.getMany(projectId, config);
  }

  async deleteStepItem(projectId: string, stepKey: string, itemId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);
    if (config.relation !== 'one-to-many') {
      throw new BadRequestException(`Cannot delete from a one-to-one step`);
    }

    const model = this.getModel(config);
    const item = await model.findFirst({
      where: { id: itemId, project_id: projectId },
    });
    if (!item) throw new NotFoundException('Item not found');

    await model.delete({ where: { id: itemId } });

    const remaining = await model.count({ where: { project_id: projectId } });
    if (remaining === 0) {
      await this.updateStepProgress(projectId, stepKey, 'NOT_STARTED');
    }

    return { deleted: true };
  }

  async reviewGbm(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const missingSteps: string[] = [];
    const oneToOneModels = GBM_STEPS.filter(s => s.relation === 'one-to-one' && !s.aiGenerated);

    for (const step of oneToOneModels) {
      const model = this.getModel(step);
      const record = await model.findUnique({ where: { project_id: projectId } });
      if (!record) {
        missingSteps.push(step.title);
      }
    }

    if (missingSteps.length > 0) {
      throw new BadRequestException({
        message: 'Complete all GBM steps before review',
        missingSteps,
      });
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        gbm_reviewed_at: new Date(),
        is_gbm_reviewed: true,
      },
    });

    return { message: 'GBM review completed', gbm_reviewed_at: new Date() };
  }

  async getProgress(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const steps = await this.prisma.stepProgress.findMany({
      where: { project_id: projectId },
      select: { step_key: true, status: true },
    });

    const gbmSteps = GBM_STEPS.map(s => s.stepKey);
    const projectSteps = steps.filter(s => gbmSteps.includes(s.step_key));

    const total = gbmSteps.length;
    const completed = projectSteps.filter(s => s.status === 'COMPLETED').length;
    const inProgress = projectSteps.filter(s => s.status === 'IN_PROGRESS').length;
    const blocked = projectSteps.filter(s => s.status === 'BLOCKED').length;
    const notStarted = projectSteps.filter(s => s.status === 'NOT_STARTED' || !s.status).length;

    const phaseBreakdown = [1, 2, 3, 4].map(phase => {
      const phaseStepKeys = GBM_STEPS.filter(s => s.phase === phase).map(s => s.stepKey);
      const phaseSteps = projectSteps.filter(s => phaseStepKeys.includes(s.step_key));
      const phaseTotal = phaseStepKeys.length;
      const phaseCompleted = phaseSteps.filter(s => s.status === 'COMPLETED').length;
      return {
        phase,
        total: phaseTotal,
        completed: phaseCompleted,
        percentage: phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0,
      };
    });

    return {
      total,
      completed,
      inProgress,
      blocked,
      notStarted,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      phases: phaseBreakdown,
      steps: projectSteps.filter(s => gbmSteps.includes(s.step_key)),
    };
  }

  async initializeProjectSteps(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const operations = ALL_STEPS.map(step =>
      this.prisma.stepProgress.upsert({
        where: {
          project_id_step_key: { project_id: projectId, step_key: step.stepKey },
        },
        create: {
          project_id: projectId,
          step_key: step.stepKey,
          status: StepStatus.NOT_STARTED,
        },
        update: {},
      }),
    );

    await this.prisma.$transaction(operations);
    return { initialized: true, count: ALL_STEPS.length };
  }

  private async updateStepProgress(projectId: string, stepKey: string, status: string) {
    await this.prisma.stepProgress.upsert({
      where: {
        project_id_step_key: { project_id: projectId, step_key: stepKey },
      },
      create: {
        project_id: projectId,
        step_key: stepKey,
        status: status as any,
        completed_at: status === 'COMPLETED' ? new Date() : null,
      },
      update: {
        status: status as any,
        completed_at: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  private filterStepFields(config: StepConfig, data: any): any {
    const allowedFields = this.getAllowedFields(config.model);
    const filtered: any = {};
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  private getAllowedFields(modelName: string): string[] {
    const fieldMap: Record<string, string[]> = {
      // Phase 1
      ideaSketch: ['idea_initial', 'product_service', 'customers', 'partners'],
      problemsNeeds: ['environmental_challenges', 'social_challenges', 'customer_needs', 'team_motivations'],
      pestel: ['political_what', 'political_how', 'economic_what', 'economic_how', 'social_what', 'social_how', 'technological_what', 'technological_how', 'environmental_what', 'environmental_how', 'legal_what', 'legal_how'],
      objective: ['environmental_problems', 'environmental_objectives', 'social_problems', 'social_objectives', 'customer_problems', 'customer_objectives', 'team_problems', 'team_objectives'],
      missionVision: ['mission', 'vision', 'values'],
      contextSummary: ['summary_text', 'generated_by_ai'],

      // Phase 2
      stakeholder: ['name', 'role', 'interest', 'influence', 'engagement_strategy'],
      stakeholderMap: ['stakeholder_name', 'contribution', 'reward'],
      customerSegment: ['segment_name', 'description', 'pains', 'gains', 'functions'],
      valueProposition: ['environmental_value', 'social_value', 'pain_relievers', 'gain_creators', 'products_services', 'value_added', 'innovation_value'],
      testDiscovery: ['hypothesis', 'test_method', 'results', 'learnings', 'validated'],
      valuePropositionPivot: ['initial_assumptions', 'test_results', 'pivot_decision', 'new_value_proposition'],
      customerRelationsChannel: ['customer_relationships', 'channels', 'distribution_strategy'],
      customerJourney: ['stage_name', 'touchpoints', 'customer_emotions', 'improvement_ideas'],
      keyActivitiesResource: ['key_activities', 'key_resources', 'strategic_partners'],
      ecoDesign: ['equipe_eco', 'projet_eco', 'contexte_eco', 'vision_durable', 'cycle_de_vie', 'performance_eco', 'strategies_eco', 'plan_action_eco'],
      ecoDesignResult: ['eco_results', 'performance_analysis', 'improvements'],
      summaryActivity: ['activities_summary', 'key_achievements', 'next_steps', 'generated_by_ai'],
      costStructure: ['fixed_costs', 'variable_costs', 'cost_drivers', 'breakeven_analysis'],
      revenueStream: ['revenue_sources', 'pricing_strategy', 'revenue_projections'],
      costRevenueSummary: ['cost_summary', 'revenue_summary', 'financial_health', 'generated_by_ai'],

      // Phase 3
      testPreparation: ['test_objectives', 'test_method', 'success_criteria', 'resources_needed', 'timeline'],

      // Phase 4
      indicator: ['environmental_kpis', 'social_kpis', 'economic_kpis', 'measurement_method', 'review_frequency'],
    };
    return fieldMap[modelName] || [];
  }

  private async generateAiSummary(projectId: string, stepKey: string, record: any) {
    try {
      const summary = await this.ai.generateSummary(projectId, stepKey, record);

      const config = getStepConfig(stepKey);
      if (!config) return;

      const model = this.getModel(config);
      await model.update({
        where: { id: record.id },
        data: this.getSummaryField(stepKey, summary),
      });

      await this.prisma.aiInteraction.create({
        data: {
          project_id: projectId,
          step_key: stepKey,
          prompt: `Generate ${stepKey} summary`,
          response: summary,
          model: 'gpt-4',
        },
      });
    } catch (error) {
      // AI generation is non-blocking; log and continue
    }
  }

  private getSummaryField(stepKey: string, summary: string): any {
    switch (stepKey) {
      case 'gbm_6':  return { summary_text: summary, generated_by_ai: true };
      case 'gbm_15': return { activities_summary: summary, generated_by_ai: true };
      case 'gbm_18': return { cost_summary: summary, generated_by_ai: true };
      default: return {};
    }
  }
}
