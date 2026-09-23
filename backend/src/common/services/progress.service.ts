import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface StepProgressResult {
  total: number;
  completed: number;
  percentage: number;
  steps: { stepKey: string; status: string }[];
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async compute(projectId: string, stepKeys: string[]): Promise<StepProgressResult> {
    const steps = await this.prisma.stepProgress.findMany({
      where: { project_id: projectId, step_key: { in: stepKeys } },
    });

    const total = stepKeys.length;
    const completed = steps.filter(s => s.status === 'COMPLETED').length;

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      steps: stepKeys.map(key => ({
        stepKey: key,
        status: steps.find(s => s.step_key === key)?.status || 'NOT_STARTED',
      })),
    };
  }
}
