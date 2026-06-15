import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Project } from '../projects/project.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async create(projectId: string, userId: string, dto: CreateReviewDto): Promise<Review> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Projet introuvable');

    const review = this.reviewRepo.create({
      project_id: projectId,
      user_id: userId,
      content: dto.content,
      step_id: dto.step_id || null,
      document_id: dto.document_id || null,
      innovation_score: dto.innovation_score || null,
      faisability_score: dto.faisability_score || null,
      market_score: dto.market_score || null,
      team_score: dto.team_score || null,
      business_model_score: dto.business_model_score || null,
    } as any);

    return this.reviewRepo.save(review) as any;
  }

  async findByProject(projectId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { project_id: projectId },
      relations: ['user', 'user.profile'],
      order: { created_at: 'DESC' },
    });
  }

  async findByStep(projectId: string, stepId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { project_id: projectId, step_id: stepId },
      relations: ['user', 'user.profile'],
      order: { created_at: 'DESC' },
    });
  }

  async getAverageScore(projectId: string): Promise<{ average: number; criteria: Record<string, number> }> {
    const reviews = await this.reviewRepo.find({ where: { project_id: projectId } });
    const scored = reviews.filter(r => r.innovation_score != null);

    if (scored.length === 0) {
      return { average: 0, criteria: { innovation: 0, faisability: 0, market: 0, team: 0, business_model: 0 } };
    }

    const sum = (field: keyof Review) =>
      scored.reduce((acc, r) => acc + (r[field] as number || 0), 0);

    const avg = (field: keyof Review) => Math.round(sum(field) / scored.length);

    const innovation = avg('innovation_score');
    const faisability = avg('faisability_score');
    const market = avg('market_score');
    const team = avg('team_score');
    const business_model = avg('business_model_score');

    return {
      average: Math.round((innovation + faisability + market + team + business_model) / 5),
      criteria: { innovation, faisability, market, team, business_model },
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw new NotFoundException('Commentaire introuvable');
    await this.reviewRepo.remove(review);
    return { message: 'Commentaire supprimé' };
  }
}
