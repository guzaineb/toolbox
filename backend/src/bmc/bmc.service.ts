import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BmcSnapshot } from './bmc-snapshot.entity';
import { JourneyService } from '../journey/journey.service';
import { VersionsService } from '../versions/versions.service';

@Injectable()
export class BmcService {
  constructor(
    @InjectRepository(BmcSnapshot)
    private bmcRepo: Repository<BmcSnapshot>,
    private journeyService: JourneyService,
    private versionsService: VersionsService,
  ) {}

  // Mapping des étapes du nouveau parcours (21 étapes) vers les blocs BMC
  private readonly BMC_STEP_MAPPING = {
    customer_segments: [8],
    value_proposition: [9, 10, 11],
    channels: [12],
    customer_relations: [12],
    revenue_streams: [17],
    key_resources: [13],
    key_activities: [13],
    key_partners: [7],
    cost_structure: [16],
    environmental_impact: [14],
    social_impact: [5, 14],
    circular_economy: [14],
    sdg_goals: [14],
  };

  async generateBmc(projectId: string, userId: string, isGreen = false): Promise<BmcSnapshot> {
    const steps = await this.journeyService.getSteps(projectId);
    if (!steps.length) {
      throw new BadRequestException('Aucune étape trouvée pour ce projet');
    }

    const stepContent = (stepNumber: number): string => {
      const step = steps.find(s => s.step_number === stepNumber);
      if (!step || !step.content) return '';
      return Object.entries(step.content)
        .filter(([_, v]) => v)
        .map(([k, v]) => {
          if (typeof v === 'string') return `${k}: ${v}`;
          if (typeof v === 'object') {
            return Object.entries(v)
              .filter(([_, val]) => val && val !== '')
              .map(([qk, qv]) => `${qk}: ${qv}`)
              .join('\n');
          }
          return `${k}: ${v}`;
        })
        .join('\n\n');
    };

    const getStepsContent = (numbers: number[]): string => {
      return numbers.map(n => stepContent(n)).filter(Boolean).join('\n\n---\n\n');
    };

    const blocks: any = {};
    for (const [block, stepNumbers] of Object.entries(this.BMC_STEP_MAPPING)) {
      if (!isGreen && ['environmental_impact', 'circular_economy', 'sdg_goals'].includes(block)) continue;
      blocks[block] = getStepsContent(stepNumbers as number[]);
    }

    const currentVersion = await this.versionsService.getCurrentVersion(projectId);

    const snapshot = this.bmcRepo.create({
      project_id: projectId,
      version_id: currentVersion?.id || undefined,
      blocks,
      is_green: isGreen,
      is_auto_generated: true,
    });

    return this.bmcRepo.save(snapshot) as Promise<BmcSnapshot>;
  }

  async getBmc(projectId: string): Promise<BmcSnapshot | null> {
    return this.bmcRepo.findOne({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
    });
  }

  async getBmcHistory(projectId: string): Promise<BmcSnapshot[]> {
    return this.bmcRepo.find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
    });
  }

  async updateBmc(projectId: string, blocks: any, isGreen?: boolean): Promise<BmcSnapshot> {
    const existing = await this.getBmc(projectId);
    const currentVersion = await this.versionsService.getCurrentVersion(projectId);

    const data = {
      project_id: projectId,
      version_id: currentVersion?.id || undefined,
      blocks: existing ? { ...existing.blocks, ...blocks } : blocks,
      is_green: isGreen ?? existing?.is_green ?? false,
      is_auto_generated: false,
    };

    if (existing) {
      await this.bmcRepo.update(existing.id, data);
      return this.bmcRepo.findOneBy({ id: existing.id }) as Promise<BmcSnapshot>;
    }

    const snapshot = this.bmcRepo.create(data);
    return this.bmcRepo.save(snapshot) as Promise<BmcSnapshot>;
  }
}
