import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressHistory } from './progress-history.entity';
import { ProjectStep, StepStatus } from '../journey/project-step.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ProgressHistory)
    private historyRepo: Repository<ProgressHistory>,
    @InjectRepository(ProjectStep)
    private stepRepo: Repository<ProjectStep>,
  ) {}

  async log(
    projectId: string,
    action: string,
    previousStatus: string | null,
    newStatus: string,
    userId: string,
    stepId?: string,
  ): Promise<ProgressHistory> {
    const entry = this.historyRepo.create({
      project_id: projectId,
      step_id: stepId || null,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      user_id: userId,
    } as any);
    return this.historyRepo.save(entry) as any;
  }

  async getHistory(projectId: string): Promise<ProgressHistory[]> {
    return this.historyRepo.find({
      where: { project_id: projectId },
      relations: ['user', 'user.profile'],
      order: { created_at: 'DESC' },
    });
  }

  async getProjectProgress(projectId: string): Promise<{
    percentage: number;
    completed: number;
    submitted: number;
    approved: number;
    rejected: number;
    in_progress: number;
    not_started: number;
    total: number;
    byStatus: Record<string, number>;
  }> {
    const steps = await this.stepRepo.find({ where: { project_id: projectId } });
    const total = steps.length;
    const byStatus: Record<string, number> = {};
    steps.forEach(s => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });
    const approved = steps.filter(s => s.status === 'approved').length;
    const submitted = steps.filter(s => s.status === 'submitted').length;
    const rejected = steps.filter(s => s.status === 'rejected').length;
    const in_progress = steps.filter(s => s.status === 'in_progress').length;
    const not_started = steps.filter(s => s.status === 'not_started').length;
    const completed = approved;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage, completed, submitted, approved, rejected, in_progress, not_started, total, byStatus };
  }

  async getDetailedProjectStats(projectId: string): Promise<{
    progress: any;
    history: ProgressHistory[];
    stepsStatus: { step_number: number; title: string; status: string; score: number | null }[];
  }> {
    const [progress, history, steps] = await Promise.all([
      this.getProjectProgress(projectId),
      this.getHistory(projectId),
      this.stepRepo.find({
        where: { project_id: projectId },
        order: { step_number: 'ASC' },
        select: ['step_number', 'title', 'status', 'score', 'validation_errors'],
      }),
    ]);

    return {
      progress,
      history,
      stepsStatus: steps.map(s => ({
        step_number: s.step_number,
        title: s.title,
        status: s.status,
        score: s.score,
      })),
    };
  }

  async getPorteurKPIs(userId: string): Promise<{
    total_projects: number;
    average_progress: number;
    total_documents: number;
    total_reviews: number;
    average_score: number;
  }> {
    const result = await this.stepRepo.query(`
      SELECT
        COUNT(DISTINCT p.id) as total_projects,
        COALESCE(AVG(
          CASE WHEN (SELECT COUNT(*) FROM project_steps ps2 WHERE ps2.project_id = p.id) > 0
            THEN (SELECT COUNT(*) FROM project_steps ps3 WHERE ps3.project_id = p.id AND ps3.status = 'approved')::float
                 / (SELECT COUNT(*) FROM project_steps ps4 WHERE ps4.project_id = p.id) * 100
            ELSE 0
          END
        ), 0) as average_progress,
        COALESCE((SELECT COUNT(*) FROM project_documents pd WHERE pd.project_id IN (SELECT id FROM projects WHERE user_id = $1)), 0) as total_documents,
        COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.project_id IN (SELECT id FROM projects WHERE user_id = $1)), 0) as total_reviews,
        COALESCE(AVG(
          CASE WHEN r.innovation_score IS NOT NULL
            THEN (r.innovation_score + r.faisability_score + r.market_score + r.team_score + r.business_model_score) / 5.0
            ELSE NULL
          END
        ), 0) as average_score
      FROM projects p
      LEFT JOIN reviews r ON r.project_id = p.id
      WHERE p.user_id = $1
    `, [userId]);

    return result[0] || {
      total_projects: 0,
      average_progress: 0,
      total_documents: 0,
      total_reviews: 0,
      average_score: 0,
    };
  }

  async getIncubateurKPIs(): Promise<{
    total_projects: number;
    average_progress: number;
    blocked_steps: number;
    ready_for_review: number;
  }> {
    const result = await this.stepRepo.query(`
      SELECT
        COUNT(DISTINCT p.id) as total_projects,
        COALESCE(AVG(
          CASE WHEN (SELECT COUNT(*) FROM project_steps ps2 WHERE ps2.project_id = p.id) > 0
            THEN (SELECT COUNT(*) FROM project_steps ps3 WHERE ps3.project_id = p.id AND ps3.status = 'approved')::float
                 / (SELECT COUNT(*) FROM project_steps ps4 WHERE ps4.project_id = p.id) * 100
            ELSE 0
          END
        ), 0) as average_progress,
        COALESCE((SELECT COUNT(*) FROM project_steps ps5 WHERE ps5.status = 'submitted'), 0) as blocked_steps,
        COALESCE((SELECT COUNT(*) FROM projects p2 WHERE p2.status = 'submitted'), 0) as ready_for_review
      FROM projects p
    `);

    return result[0] || {
      total_projects: 0,
      average_progress: 0,
      blocked_steps: 0,
      ready_for_review: 0,
    };
  }
}
