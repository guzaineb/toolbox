import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { StepStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { SectionStepService } from '../common/services/section-step.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { GBM_STEPS, getStepConfig, StepConfig } from './step-config';
import { ALL_STEPS } from './step-registry';

@Injectable()
export class GbmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
    private readonly access: ModuleAccessService,
    private readonly ai: AiService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  private getModel(config: StepConfig) {
    const model = (this.prisma as any)[config.model];
    if (!model) throw new BadRequestException(`Unknown model: ${config.model}`);
    return model;
  }

  async getStepData(projectId: string, stepKey: string, userId: string) {
    await this.access.assertCanAccessProject(projectId, userId);
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
    await this.sections.ensureOwnership(projectId, userId);
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

    const hasContent = Object.values(filteredData).some(
      (value) => value !== undefined && value !== null && value !== '',
    );
    if (hasContent) {
      await this.sections.markStepComplete(projectId, stepKey);
    } else {
      await this.sections.markStepProgress(projectId, stepKey, 'NOT_STARTED');
    }

    if (config.aiGenerated) {
      await this.generateAiSummary(projectId, stepKey, record);
    }

    return record;
  }

  async addStepItem(projectId: string, stepKey: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);
    if (config.relation !== 'one-to-many') {
      throw new BadRequestException(`Step ${stepKey} is one-to-one. Use PATCH to update.`);
    }

    const model = this.getModel(config);
    const filteredData = this.filterStepFields(config, data);
    const item = await model.create({
      data: { project_id: projectId, ...filteredData },
    });

    await this.sections.markStepComplete(projectId, stepKey);

    return item;
  }

  async listStepItems(projectId: string, stepKey: string, userId: string) {
    await this.access.assertCanAccessProject(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);

    return this.getMany(projectId, config);
  }

  async updateStepItem(projectId: string, stepKey: string, itemId: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const config = getStepConfig(stepKey);
    if (!config) throw new BadRequestException(`Invalid step: ${stepKey}`);
    if (config.relation !== 'one-to-many') {
      throw new BadRequestException(`Step ${stepKey} is one-to-one. Use PATCH to update.`);
    }

    const model = this.getModel(config);
    const item = await model.findFirst({
      where: { id: itemId, project_id: projectId },
    });
    if (!item) throw new NotFoundException('Item not found');

    const filteredData = this.filterStepFields(config, data);
    const updated = await model.update({
      where: { id: itemId },
      data: filteredData,
    });

    await this.syncStepStatus(projectId, stepKey);

    return updated;
  }

  async deleteStepItem(projectId: string, stepKey: string, itemId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
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

    await this.syncStepStatus(projectId, stepKey);

    return { deleted: true };
  }

  private async syncStepStatus(projectId: string, stepKey: string) {
    const config = getStepConfig(stepKey);
    if (!config) return;

    const model = this.getModel(config);
    const count = await model.count({ where: { project_id: projectId } });

    if (count === 0) {
      await this.sections.markStepProgress(projectId, stepKey, 'NOT_STARTED');
    } else {
      await this.sections.markStepComplete(projectId, stepKey);
    }
  }

  /**
   * Étapes GBM obligatoires pour considérer le GBM « suffisamment complet »
   * (les 15 étapes one-to-one non générées par IA — aligné avec reviewGbm).
   * Réutilisé par le gating Business Plan (D7).
   */
  async getMissingRequiredSteps(projectId: string): Promise<StepConfig[]> {
    const required = GBM_STEPS.filter(s => s.relation === 'one-to-one' && !s.aiGenerated);
    const missing: StepConfig[] = [];
    for (const step of required) {
      const model = this.getModel(step);
      const record = await model.findUnique({ where: { project_id: projectId } });
      if (!record) missing.push(step);
    }
    return missing;
  }

  /** Vrai si toutes les étapes GBM obligatoires sont remplies (D7). */
  async isGbmReady(projectId: string): Promise<boolean> {
    return (await this.getMissingRequiredSteps(projectId)).length === 0;
  }

  async reviewGbm(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const missingSteps = (await this.getMissingRequiredSteps(projectId)).map(s => s.title);

    if (missingSteps.length > 0) {
      throw new BadRequestException({
        message: 'Complete all GBM steps before review',
        missingSteps,
      });
    }

    const reviewedAt = new Date();
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        gbm_reviewed_at: reviewedAt,
        is_gbm_reviewed: true,
      },
    });

    const { title, message } = this.messageBuilder.stepCompleted();
    this.eventEmitter.emit(
      NotificationEvent.STEP_COMPLETED,
      {
        event: NotificationEvent.STEP_COMPLETED,
        recipients: [{ userId }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/gbm`,
        senderId: userId,
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload,
    );

    return { message: 'GBM review completed', gbm_reviewed_at: reviewedAt };
  }

  async getProgress(projectId: string, userId: string) {
    await this.access.assertCanAccessProject(projectId, userId);

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

    const phaseBreakdown = [1, 2, 3, 4, 5].map(phase => {
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
    await this.sections.ensureOwnership(projectId, userId);

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

      // Phase 5
      swotAnalysis: ['strengths', 'weaknesses', 'opportunities', 'threats'],
    };
    return fieldMap[modelName] || [];
  }

  private async generateAiSummary(projectId: string, stepKey: string, record: any) {
    try {
      const context = await this.buildAiContext(projectId, stepKey);
      const summary = await this.ai.generateSummary(projectId, stepKey, context);

      const config = getStepConfig(stepKey);
      if (!config) return;

      const model = this.getModel(config);
      await model.update({
        where: { id: record.id },
        data: this.buildSummaryData(stepKey, summary),
      });

      await this.prisma.aiInteraction.create({
        data: {
          project_id: projectId,
          step_key: stepKey,
          prompt: `Génération du résumé pour ${stepKey} avec les données complètes du projet`,
          response: summary,
          model: 'gpt-4',
        },
      });
    } catch (error) {
      // AI generation is non-blocking; log and continue
    }
  }

  private async buildAiContext(projectId: string, stepKey: string): Promise<Record<string, any>> {
    const base = { project_id: projectId };

    switch (stepKey) {
      case 'gbm_6': {
        const data = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            idea_sketch: true,
            problems_needs: true,
            pestel: true,
            objective: true,
            mission_vision: true,
          },
        });
        return {
          ...base,
          idea_sketch: data?.idea_sketch || {},
          problems_needs: data?.problems_needs || {},
          pestel: data?.pestel || {},
          objective: data?.objective || {},
          mission_vision: data?.mission_vision || {},
        };
      }

      case 'gbm_15': {
        const data = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            key_activities_resource: true,
            eco_design: true,
            eco_design_result: true,
            stakeholder: true,
            customer_segment: true,
            value_proposition: true,
          },
        });
        return {
          ...base,
          key_activities_resource: data?.key_activities_resource || {},
          eco_design: data?.eco_design || {},
          eco_design_result: data?.eco_design_result || {},
          stakeholder: data?.stakeholder || [],
          customer_segment: data?.customer_segment || [],
          value_proposition: data?.value_proposition || {},
        };
      }

      case 'gbm_18': {
        const data = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            cost_structure: true,
            revenue_stream: true,
          },
        });
        return {
          ...base,
          cost_structure: data?.cost_structure || {},
          revenue_stream: data?.revenue_stream || {},
        };
      }

      case 'gbm_21': {
        const data = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            idea_sketch: true,
            problems_needs: true,
            pestel: true,
            objective: true,
            mission_vision: true,
            stakeholder: true,
            customer_segment: true,
            value_proposition: true,
            test_discovery: true,
            key_activities_resource: true,
            eco_design: true,
            cost_structure: true,
            revenue_stream: true,
          },
        });
        return {
          ...base,
          idea_sketch: data?.idea_sketch || {},
          problems_needs: data?.problems_needs || {},
          pestel: data?.pestel || {},
          objective: data?.objective || {},
          mission_vision: data?.mission_vision || {},
          stakeholder: data?.stakeholder || [],
          customer_segment: data?.customer_segment || [],
          value_proposition: data?.value_proposition || {},
          test_discovery: data?.test_discovery || [],
          key_activities_resource: data?.key_activities_resource || {},
          eco_design: data?.eco_design || {},
          cost_structure: data?.cost_structure || {},
          revenue_stream: data?.revenue_stream || {},
        };
      }

      default:
        return base;
    }
  }

  private tryParseJson(text: string): Record<string, any> | null {
    if (!text) return null;
    const trimmed = text.trim();
    const match = trimmed.match(/\{[\s\S]*\}/);
    const candidate = match ? match[0] : trimmed;
    try {
      const parsed = JSON.parse(candidate);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  private buildSummaryData(stepKey: string, summary: string): any {
    const base = { generated_by_ai: true };
    switch (stepKey) {
      case 'gbm_6':
        return { ...base, summary_text: summary };
      case 'gbm_15':
      case 'gbm_18': {
        const allowed =
          stepKey === 'gbm_15'
            ? ['activities_summary', 'key_achievements', 'next_steps']
            : ['cost_summary', 'revenue_summary', 'financial_health'];
        const parsed = this.tryParseJson(summary);
        if (parsed) {
          const data: Record<string, any> = { ...base };
          for (const key of allowed) {
            if (parsed[key] !== undefined) data[key] = String(parsed[key]);
          }
          if (Object.keys(data).length > 1) return data;
        }
        return stepKey === 'gbm_15'
          ? { ...base, activities_summary: summary }
          : { ...base, cost_summary: summary };
      }
      case 'gbm_21': {
        const allowed = ['strengths', 'weaknesses', 'opportunities', 'threats'];
        const parsed = this.tryParseJson(summary);
        if (parsed) {
          const data: Record<string, any> = {};
          for (const key of allowed) {
            if (parsed[key] !== undefined) data[key] = String(parsed[key]);
          }
          if (Object.keys(data).length > 0) return data;
        }
        return { strengths: summary };
      }
      default:
        return {};
    }
  }
}
