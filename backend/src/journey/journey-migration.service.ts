import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { ProjectStep, StepStatus } from './project-step.entity';
import { JOURNEY_STEPS } from './journey.service';

@Injectable()
export class JourneyMigrationService {
  private readonly logger = new Logger(JourneyMigrationService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectStep)
    private stepRepo: Repository<ProjectStep>,
  ) {}

  async migrateAllProjects(): Promise<{ migrated: number; details: string[] }> {
    const projects = await this.projectRepo.find();
    const details: string[] = [];
    let migrated = 0;

    for (const project of projects) {
      const result = await this.migrateProject(project.id);
      if (result.added > 0) {
        migrated++;
        details.push(`Projet "${project.name}" (${project.id}): ${result.added} étape(s) ajoutée(s)`);
        this.logger.log(`Migration: ${result.added} étape(s) ajoutée(s) au projet "${project.name}"`);
      }
    }

    return { migrated, details };
  }

  async migrateProject(projectId: string): Promise<{ added: number }> {
    const existingSteps = await this.stepRepo.find({
      where: { project_id: projectId },
      order: { step_number: 'ASC' },
    });

    const existingNumbers = new Set(existingSteps.map(s => s.step_number));
    const missingSteps = JOURNEY_STEPS.filter(s => !existingNumbers.has(s.step_number));

    if (missingSteps.length === 0) return { added: 0 };

    const newSteps = missingSteps.map(step =>
      this.stepRepo.create({
        project_id: projectId,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
        sub_sections: { items: step.sub_sections },
        status: StepStatus.NOT_STARTED,
        content: {},
      }),
    );

    await this.stepRepo.save(newSteps);
    return { added: newSteps.length };
  }
}
