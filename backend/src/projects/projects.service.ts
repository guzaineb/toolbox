import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { JourneyService } from '../journey/journey.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private journeyService: JourneyService,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      user_id: userId,
      status: ProjectStatus.DRAFT,
    });
    const saved = await this.projectRepo.save(project);

    await this.journeyService.generateJourney(saved.id);

    return this.findOne(saved.id, userId);
  }

  async findAll(userId: string, role?: string): Promise<Project[]> {
    if (role === 'admin' || role === 'expert' || role === 'incubator_membre') {
      return this.projectRepo.find({
        relations: ['user', 'user.profile', 'steps', 'documents'],
        order: { created_at: 'DESC' },
      });
    }
    return this.projectRepo.find({
      where: { user_id: userId },
      relations: ['steps', 'documents'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'steps', 'documents', 'reviews', 'reviews.user', 'reviews.user.profile'],
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto): Promise<Project> {
    await this.assertOwner(id, userId);
    const project = await this.findOne(id, userId);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async updateStatus(id: string, userId: string, dto: UpdateProjectStatusDto): Promise<Project> {
    await this.assertOwner(id, userId);
    const project = await this.findOne(id, userId);
    project.status = dto.status;
    return this.projectRepo.save(project);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.assertOwner(id, userId);
    const project = await this.findOne(id, userId);
    await this.projectRepo.remove(project);
    return { message: 'Projet supprimé' };
  }

  async getProgress(id: string, userId: string): Promise<{ percentage: number; completed: number; total: number }> {
    await this.assertOwner(id, userId);
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    const total = project.steps.length;
    const completed = project.steps.filter(s => s.status === 'approved').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage, completed, total };
  }

  private async assertOwner(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.user_id !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce projet');
    }
  }
}
