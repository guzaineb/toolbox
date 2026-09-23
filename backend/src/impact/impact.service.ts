import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SectionStepService } from '../common/services/section-step.service';
import { ProjectContextService } from '../common/services/project-context.service';

const IMPACT_ALLOWED_FIELDS = [
  'kpis_environnementaux',
  'kpis_sociaux',
  'kpis_economiques',
  'methode_mesure',
  'periode_mesure',
  'objectifs_impact',
  'resultats_actuels',
  'rapport_impact',
];

@Injectable()
export class ImpactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
    private readonly ai: AiService,
    private readonly projectContext: ProjectContextService,
  ) {}

  async get(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.impactMeasure.findUnique({
      where: { project_id: projectId },
    });

    if (!record) return {};

    const ecarts = this.calculateEcart(record);
    return { ...record, ecart_objectif: ecarts };
  }

  async update(projectId: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    const record = await this.sections.saveSection(
      this.prisma.impactMeasure,
      projectId,
      data,
      {
        allowedFields: IMPACT_ALLOWED_FIELDS,
        stepKey: 'impact',
        stepStatus: 'IN_PROGRESS',
      },
    );

    return { ...record, ecart_objectif: this.calculateEcart(record) };
  }

  async generateReport(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.impactMeasure.findUnique({
      where: { project_id: projectId },
    });

    if (!record) throw new NotFoundException('No impact data found');

    const context = await this.projectContext.getFullContext(projectId);

    const rapport = await this.ai.generateSummary(
      projectId,
      'impact_report',
      context,
    );

    const updated = await this.prisma.impactMeasure.update({
      where: { id: record.id },
      data: { rapport_impact: rapport },
    });

    await this.prisma.aiInteraction.create({
      data: {
        project_id: projectId,
        step_key: 'impact_report',
        prompt: 'Generate impact report',
        response: rapport,
        model: 'gpt-4',
      },
    });

    await this.sections.markStepComplete(projectId, 'impact');

    return { ...updated, ecart_objectif: this.calculateEcart(updated) };
  }

  private calculateEcart(record: any): Record<string, any> {
    const ecarts: Record<string, any> = {};

    if (record.objectifs_impact && record.resultats_actuels) {
      const objectifs = record.objectifs_impact as Record<string, number>;
      const resultats = record.resultats_actuels as Record<string, number>;

      for (const key of Object.keys(objectifs)) {
        if (resultats[key] !== undefined && objectifs[key] !== undefined) {
          ecarts[key] = resultats[key] - objectifs[key];
          ecarts[`${key}_percentage`] =
            objectifs[key] !== 0
              ? Math.round((resultats[key] / objectifs[key]) * 100)
              : 0;
        }
      }
    }

    return ecarts;
  }

  async getProgress(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const fields = [
      'kpis_environnementaux',
      'kpis_sociaux',
      'kpis_economiques',
      'methode_mesure',
      'periode_mesure',
      'objectifs_impact',
      'resultats_actuels',
    ];
    const record = await this.prisma.impactMeasure.findUnique({
      where: { project_id: projectId },
    });

    if (!record) {
      return { total: fields.length, completed: 0, percentage: 0 };
    }

    const completed = fields.filter((f) => (record as any)[f] != null).length;
    return {
      total: fields.length,
      completed,
      percentage: Math.round((completed / fields.length) * 100),
    };
  }
}
