import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectionStepService } from '../common/services/section-step.service';

const MARKET_ALLOWED_FIELDS = [
  'essence_marque', 'alignement_objectifs', 'positionnement',
  'identite_visuelle', 'narration', 'messages_cles',
  'canaux_marketing', 'partenariats_market',
];

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
  ) {}

  async get(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.marketAccess.findUnique({ where: { project_id: projectId } });
    return record || {};
  }

  async update(projectId: string, data: any, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);

    return this.sections.saveSection(
      this.prisma.marketAccess,
      projectId,
      data,
      { allowedFields: MARKET_ALLOWED_FIELDS, stepKey: 'market' },
    );
  }

  async getProgress(projectId: string, userId: string) {
    await this.sections.ensureOwnership(projectId, userId);
    const sections = MARKET_ALLOWED_FIELDS;
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
