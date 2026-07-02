import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  async get(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.marketAccess.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async update(projectId: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const allowedFields = [
      'essence_marque', 'alignement_objectifs', 'positionnement',
      'identite_visuelle', 'narration', 'messages_cles',
      'canaux_marketing', 'partenariats_market',
    ];
    const filteredData: any = {};
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) filteredData[key] = data[key];
    }

    const record = await this.prisma.marketAccess.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...filteredData },
      update: filteredData,
    });

    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: 'market' } },
      create: { project_id: projectId, step_key: 'market', status: 'COMPLETED', completed_at: new Date() },
      update: { status: 'COMPLETED', completed_at: new Date() },
    });

    return record;
  }

  async getProgress(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const sections = ['essence_marque', 'alignement_objectifs', 'positionnement', 'identite_visuelle', 'narration', 'messages_cles', 'canaux_marketing', 'partenariats_market'];
    const record = await this.prisma.marketAccess.findUnique({ where: { project_id: projectId } });

    if (!record) {
      return { total: sections.length, completed: 0, percentage: 0 };
    }

    const completed = sections.filter(s => (record as any)[s] != null).length;
    return {
      total: sections.length,
      completed,
      percentage: Math.round((completed / sections.length) * 100),
    };
  }
}
