import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectVersion } from './project-version.entity';
import { JourneyService } from '../journey/journey.service';

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(ProjectVersion)
    private versionRepo: Repository<ProjectVersion>,
    private journeyService: JourneyService,
  ) {}

  async createVersion(projectId: string, userId: string, label?: string): Promise<ProjectVersion> {
    const steps = await this.journeyService.getSteps(projectId);
    if (!steps.length) {
      throw new BadRequestException('Aucune étape trouvée pour ce projet');
    }

    const snapshot: Record<string, any> = {};
    for (const step of steps) {
      snapshot[`step_${step.step_number}`] = {
        title: step.title,
        content: step.content,
        sub_sections: step.sub_sections,
        status: step.status,
      };
    }

    const currentVersion = await this.versionRepo.findOne({
      where: { project_id: projectId, is_current: true },
      order: { created_at: 'DESC' },
    });

    let versionNumber: string;
    if (currentVersion) {
      const parts = currentVersion.version_number.split('.').map(Number);
      versionNumber = `${parts[0]}.${parts[1] + 1}`;
    } else {
      versionNumber = '1.0';
    }

    await this.versionRepo.update(
      { project_id: projectId, is_current: true },
      { is_current: false },
    );

    const version = this.versionRepo.create({
      project_id: projectId,
      version_number: versionNumber,
      label: label || undefined,
      snapshot,
      created_by: userId,
      is_current: true,
    });

    return this.versionRepo.save(version);
  }

  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    return this.versionRepo.find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
      relations: ['author'],
    });
  }

  async getVersion(versionId: string): Promise<ProjectVersion> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId },
      relations: ['author'],
    });
    if (!version) throw new NotFoundException('Version introuvable');
    return version;
  }

  async restoreVersion(versionId: string, userId: string): Promise<ProjectVersion> {
    const version = await this.getVersion(versionId);
    if (!version.snapshot) {
      throw new BadRequestException('Cette version ne contient pas de données à restaurer');
    }

    const steps = await this.journeyService.getSteps(version.project_id);

    for (const step of steps) {
      const stepKey = `step_${step.step_number}`;
      const stepData = version.snapshot[stepKey];
      if (stepData) {
        step.content = stepData.content || {};
        step.sub_sections = stepData.sub_sections || {};
        if (stepData.status) {
          step.status = stepData.status;
        }
      }
    }

    for (const step of steps) {
      await this.journeyService.updateStep(version.project_id, step.step_number, {
        content: step.content,
        sub_sections: step.sub_sections,
        status: step.status,
      }, userId);
    }

    return this.createVersion(version.project_id, userId, `Restauration de la version ${version.version_number}`);
  }

  async getCurrentVersion(projectId: string): Promise<ProjectVersion | null> {
    return this.versionRepo.findOne({
      where: { project_id: projectId, is_current: true },
      relations: ['author'],
    });
  }

  async compareVersions(versionId1: string, versionId2: string): Promise<{
    version1: ProjectVersion;
    version2: ProjectVersion;
    differences: Record<string, { field: string; old: any; new: any }[]>;
  }> {
    const [v1, v2] = await Promise.all([this.getVersion(versionId1), this.getVersion(versionId2)]);

    const differences: Record<string, { field: string; old: any; new: any }[]> = {};

    const allKeys = new Set([...Object.keys(v1.snapshot || {}), ...Object.keys(v2.snapshot || {})]);

    for (const key of allKeys) {
      const oldData = v1.snapshot?.[key];
      const newData = v2.snapshot?.[key];

      if (!oldData) {
        differences[key] = [{ field: 'content', old: null, new: newData }];
        continue;
      }
      if (!newData) {
        differences[key] = [{ field: 'content', old: oldData, new: null }];
        continue;
      }

      const stepDiffs: { field: string; old: any; new: any }[] = [];

      if (JSON.stringify(oldData.content) !== JSON.stringify(newData.content)) {
        stepDiffs.push({ field: 'content', old: oldData.content, new: newData.content });
      }
      if (JSON.stringify(oldData.sub_sections) !== JSON.stringify(newData.sub_sections)) {
        stepDiffs.push({ field: 'sub_sections', old: oldData.sub_sections, new: newData.sub_sections });
      }
      if (oldData.status !== newData.status) {
        stepDiffs.push({ field: 'status', old: oldData.status, new: newData.status });
      }

      if (stepDiffs.length) {
        differences[key] = stepDiffs;
      }
    }

    return { version1: v1, version2: v2, differences };
  }
}
