import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class EcoDesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  async get(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.ecoDesign.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async update(projectId: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const filteredData: any = {};
    const allowedFields = [
      'equipe_eco', 'projet_eco', 'contexte_eco', 'vision_durable',
      'cycle_de_vie', 'performance_eco', 'strategies_eco', 'plan_action_eco',
    ];
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) filteredData[key] = data[key];
    }

    const record = await this.prisma.ecoDesign.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...filteredData },
      update: filteredData,
    });

    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: 'eco_design' } },
      create: { project_id: projectId, step_key: 'eco_design', status: 'COMPLETED', completed_at: new Date() },
      update: { status: 'COMPLETED', completed_at: new Date() },
    });

    return record;
  }

  async getProgress(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const fields = ['equipe_eco', 'projet_eco', 'contexte_eco', 'vision_durable', 'cycle_de_vie', 'performance_eco', 'strategies_eco', 'plan_action_eco'];
    const record = await this.prisma.ecoDesign.findUnique({ where: { project_id: projectId } });

    if (!record) {
      return { total: fields.length, completed: 0, percentage: 0, phases: [] };
    }

    const phases = [
      { name: 'Préparer la valise', fields: ['equipe_eco', 'projet_eco', 'contexte_eco', 'vision_durable'], completed: 0 },
      { name: 'Configurer le cycle de vie', fields: ['cycle_de_vie'], completed: 0 },
      { name: 'Évaluer la performance', fields: ['performance_eco'], completed: 0 },
      { name: 'Choix & évaluation stratégie', fields: ['strategies_eco'], completed: 0 },
      { name: 'Plan d\'action', fields: ['plan_action_eco'], completed: 0 },
    ];

    for (const phase of phases) {
      phase.completed = phase.fields.filter((f: string) => (record as any)[f] != null).length;
    }

    const completed = phases.reduce((sum: number, p: any) => sum + p.completed, 0);
    const total = fields.length;

    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
      phases,
    };
  }
}
