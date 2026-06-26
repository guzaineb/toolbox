import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { JourneyService } from '../journey/journey.service';
import { Sector } from '../sectors/sector.entity';
import { DevelopmentPhase } from '../development-phases/development-phase.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Sector)
    private sectorRepo: Repository<Sector>,
    @InjectRepository(DevelopmentPhase)
    private phaseRepo: Repository<DevelopmentPhase>,
    private journeyService: JourneyService,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    if (dto.sector_id) {
      const sector = await this.sectorRepo.findOneBy({ id: dto.sector_id });
      if (!sector) throw new BadRequestException('Secteur introuvable');
    }
    if (dto.development_phase_id) {
      const phase = await this.phaseRepo.findOneBy({ id: dto.development_phase_id });
      if (!phase) throw new BadRequestException('Phase de développement introuvable');
    }

    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      sector: dto.sector_id ? { id: dto.sector_id } as Sector : undefined,
      developmentPhase: dto.development_phase_id ? { id: dto.development_phase_id } as DevelopmentPhase : undefined,
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

    if (dto.sector_id) {
      const sector = await this.sectorRepo.findOneBy({ id: dto.sector_id });
      if (!sector) throw new BadRequestException('Secteur introuvable');
    }
    if (dto.development_phase_id) {
      const phase = await this.phaseRepo.findOneBy({ id: dto.development_phase_id });
      if (!phase) throw new BadRequestException('Phase de développement introuvable');
    }

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

  async getProgress(id: string, userId: string): Promise<{
    percentage: number; completed: number; submitted: number; approved: number;
    rejected: number; in_progress: number; not_started: number; total: number;
    byStatus: Record<string, number>; toolProgress: Record<string, number>;
  }> {
    await this.assertOwner(id, userId);
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    const steps = project.steps;
    const total = steps.length;
    const byStatus: Record<string, number> = {};
    steps.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });
    const approved = steps.filter(s => s.status === 'approved').length;
    const submitted = steps.filter(s => s.status === 'submitted').length;
    const completed = submitted + approved;
    const rejected = steps.filter(s => s.status === 'rejected').length;
    const in_progress = steps.filter(s => s.status === 'in_progress').length;
    const not_started = steps.filter(s => s.status === 'not_started').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const toolProgress = this.calculateToolProgress(steps);
    return { percentage, completed, submitted, approved, rejected, in_progress, not_started, total, byStatus, toolProgress };
  }

  private calculateToolProgress(steps: any[]): Record<string, number> {
    const TOOL_STEP_MAPPING: Record<string, number[]> = {
      modele_affaires_vert: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      plan_affaires_vert: [15, 16, 17, 18],
      eco_conception: [14],
      acces_financement: [16, 17],
      acces_marche: [7, 8, 9, 12],
      mesure_impact: [20],
    };
    const result: Record<string, number> = {};
    const stepMap = new Map(steps.map(s => [s.step_number, s]));
    for (const [key, stepNumbers] of Object.entries(TOOL_STEP_MAPPING)) {
      const relevant = stepNumbers.filter(n => stepMap.has(n));
      if (relevant.length === 0) { result[key] = 0; continue; }
      const done = relevant.filter(n => {
        const s = stepMap.get(n);
        return s && (s.status === 'submitted' || s.status === 'approved');
      }).length;
      result[key] = Math.round((done / relevant.length) * 100);
    }
    return result;
  }

  private async assertOwner(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.user_id !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce projet');
    }
  }
}
