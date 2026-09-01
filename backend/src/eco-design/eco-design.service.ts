import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectionStepService } from '../common/services/section-step.service';

const ECO_DESIGN_ALLOWED_FIELDS = [
  'equipe_eco', 'projet_eco', 'contexte_eco', 'vision_durable',
  'cycle_de_vie', 'performance_eco', 'strategies_eco', 'plan_action_eco',
];

@Injectable()
export class EcoDesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
  ) {}

  async get(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.ecoDesign.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async update(projectId: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    return this.sections.saveSection(
      this.prisma.ecoDesign,
      projectId,
      data,
      { allowedFields: ECO_DESIGN_ALLOWED_FIELDS, stepKey: 'eco_design' },
    );
  }

  async getProgress(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const fields = ECO_DESIGN_ALLOWED_FIELDS;
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
