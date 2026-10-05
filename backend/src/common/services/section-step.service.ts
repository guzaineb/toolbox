import { Injectable, BadRequestException } from '@nestjs/common';
import { StepStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { filterAllowedFields } from '../utils/filter-allowed-fields';

@Injectable()
export class SectionStepService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async ensureOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  async markStepProgress(
    projectId: string,
    stepKey: string,
    status: StepStatus = 'COMPLETED',
  ) {
    await this.prisma.stepProgress.upsert({
      where: {
        project_id_step_key: { project_id: projectId, step_key: stepKey },
      },
      create: {
        project_id: projectId,
        step_key: stepKey,
        status,
        completed_at: status === 'COMPLETED' ? new Date() : null,
      },
      update: {
        status,
        completed_at: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  async markStepComplete(projectId: string, stepKey: string) {
    await this.markStepProgress(projectId, stepKey, 'COMPLETED');
  }

  async saveSection(
    model: { upsert: (args: any) => Promise<any> },
    projectId: string,
    data: any,
    options: {
      allowedFields?: string[];
      stepKey?: string;
      stepStatus?: StepStatus;
    } = {},
  ) {
    if (options.allowedFields) {
      data = filterAllowedFields(data, options.allowedFields);
    }

    const record = await model.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...data },
      update: data,
    });

    if (options.stepKey) {
      await this.markStepProgress(
        projectId,
        options.stepKey,
        options.stepStatus ?? 'COMPLETED',
      );
    }

    return record;
  }

  assertMissingAnswers(
    reponses: Record<string, boolean>,
    expectedKeys: string[],
  ) {
    for (const key of expectedKeys) {
      if (reponses[key] === undefined) {
        throw new BadRequestException(`Missing answer for question ${key}`);
      }
    }
  }
}
