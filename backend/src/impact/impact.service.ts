import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ImpactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly ai: AiService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  async get(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.impactMeasure.findUnique({
      where: { project_id: projectId },
    });

    if (!record) return {};

    const ecarts = this.calculateEcart(record);
    return { ...record, ecart_objectif: ecarts };
  }

  async update(projectId: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const allowedFields = [
      'kpis_environnementaux', 'kpis_sociaux', 'kpis_economiques',
      'methode_mesure', 'periode_mesure', 'objectifs_impact', 'resultats_actuels',
    ];
    const filteredData: any = {};
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) filteredData[key] = data[key];
    }

    const record = await this.prisma.impactMeasure.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...filteredData },
      update: filteredData,
    });

    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: 'impact' } },
      create: { project_id: projectId, step_key: 'impact', status: 'IN_PROGRESS' },
      update: { status: 'IN_PROGRESS' },
    });

    return { ...record, ecart_objectif: this.calculateEcart(record) };
  }

  async generateReport(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.impactMeasure.findUnique({
      where: { project_id: projectId },
    });

    if (!record) throw new NotFoundException('No impact data found');

    const context = {
      kpis_environnementaux: record.kpis_environnementaux,
      kpis_sociaux: record.kpis_sociaux,
      kpis_economiques: record.kpis_economiques,
      objectifs_impact: record.objectifs_impact,
      resultats_actuels: record.resultats_actuels,
    };

    const rapport = await this.ai.generateSummary(projectId, 'impact_report', context);

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

    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: 'impact' } },
      create: { project_id: projectId, step_key: 'impact', status: 'COMPLETED', completed_at: new Date() },
      update: { status: 'COMPLETED', completed_at: new Date() },
    });

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
          ecarts[`${key}_percentage`] = objectifs[key] !== 0
            ? Math.round((resultats[key] / objectifs[key]) * 100)
            : 0;
        }
      }
    }

    return ecarts;
  }

  async getProgress(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const fields = ['kpis_environnementaux', 'kpis_sociaux', 'kpis_economiques', 'methode_mesure', 'periode_mesure', 'objectifs_impact', 'resultats_actuels'];
    const record = await this.prisma.impactMeasure.findUnique({ where: { project_id: projectId } });

    if (!record) {
      return { total: fields.length, completed: 0, percentage: 0 };
    }

    const completed = fields.filter(f => (record as any)[f] != null).length;
    return { total: fields.length, completed, percentage: Math.round((completed / fields.length) * 100) };
  }
}
