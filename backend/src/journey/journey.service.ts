import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectStep, StepStatus } from './project-step.entity';
import { UpdateStepDto } from './dto/update-step.dto';

const JOURNEY_STEPS = [
  { step_number: 1, title: 'Identification de l\'idée', description: 'Nom, présentation, problème, solution, valeur ajoutée, objectifs', sub_sections: ['nom', 'presentation', 'probleme', 'solution', 'valeur_ajoutee', 'objectifs'] },
  { step_number: 2, title: 'Étude de Marché', description: 'Marché cible, segmentation, clients, SWOT, PESTEL, concurrence', sub_sections: ['marche_cible', 'segmentation', 'clients', 'swot', 'pestel', 'concurrence'] },
  { step_number: 3, title: 'Validation de l\'idée', description: 'Questionnaires, interviews, MVP testing, validation terrain', sub_sections: ['questionnaires', 'interviews', 'mvp_testing', 'validation_terrain'] },
  { step_number: 4, title: 'Business Model', description: 'Revenus, coûts, partenaires, ressources clés, activités clés', sub_sections: ['revenus', 'couts', 'partenaires', 'ressources_cles', 'activites_cles'] },
  { step_number: 5, title: 'Business Plan', description: 'Executive summary, marché, stratégie, marketing, finances', sub_sections: ['executive_summary', 'marche', 'strategie', 'marketing', 'finances'] },
  { step_number: 6, title: 'Équipe', description: 'Membres, compétences, organigramme, besoins recrutement', sub_sections: ['membres', 'competences', 'organigramme', 'besoins_recrutement'] },
  { step_number: 7, title: 'Statut Juridique', description: 'Forme juridique, documents, obligations légales', sub_sections: ['forme_juridique', 'documents', 'obligations_legales'] },
  { step_number: 8, title: 'Financement', description: 'Besoin financier, investisseurs, subventions, sources', sub_sections: ['besoin_financier', 'investisseurs', 'subventions', 'sources'] },
  { step_number: 9, title: 'Développement Produit', description: 'MVP, fonctionnalités, roadmap technique', sub_sections: ['mvp', 'fonctionnalites', 'roadmap_technique'] },
  { step_number: 10, title: 'Marketing', description: 'Branding, personas, stratégie d\'acquisition', sub_sections: ['branding', 'personas', 'strategie_acquisition'] },
  { step_number: 11, title: 'Lancement', description: 'Go To Market, premiers clients', sub_sections: ['go_to_market', 'premiers_clients'] },
  { step_number: 12, title: 'Suivi et Amélioration', description: 'KPI, feedbacks, améliorations continues', sub_sections: ['kpi', 'feedbacks', 'ameliorations_continues'] },
  { step_number: 13, title: 'Croissance', description: 'Scalabilité, expansion, levées de fonds', sub_sections: ['scalabilite', 'expansion', 'levees_de_fonds'] },
];

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(ProjectStep)
    private stepRepo: Repository<ProjectStep>,
  ) {}

  async generateJourney(projectId: string): Promise<ProjectStep[]> {
    const steps = JOURNEY_STEPS.map(step => {
      return this.stepRepo.create({
        project_id: projectId,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
        sub_sections: { items: step.sub_sections },
        status: StepStatus.NOT_STARTED,
        content: {},
      });
    });
    return this.stepRepo.save(steps);
  }

  async getSteps(projectId: string): Promise<ProjectStep[]> {
    return this.stepRepo.find({
      where: { project_id: projectId },
      order: { step_number: 'ASC' },
    });
  }

  async getStep(projectId: string, stepNumber: number): Promise<ProjectStep> {
    const step = await this.stepRepo.findOne({
      where: { project_id: projectId, step_number: stepNumber },
    });
    if (!step) throw new NotFoundException('Étape introuvable');
    return step;
  }

  async updateStep(projectId: string, stepNumber: number, dto: UpdateStepDto, userId: string): Promise<ProjectStep> {
    const step = await this.getStep(projectId, stepNumber);

    if (dto.content) {
      step.content = { ...step.content, ...dto.content };
    }
    if (dto.sub_sections) {
      step.sub_sections = { ...step.sub_sections, ...dto.sub_sections };
    }
    if (dto.status) {
      if (step.status === StepStatus.APPROVED && dto.status !== StepStatus.APPROVED) {
        // Allow changing from approved
      }
      step.status = dto.status;
    }

    return this.stepRepo.save(step);
  }

  async submitStep(projectId: string, stepNumber: number, userId: string): Promise<ProjectStep> {
    const step = await this.getStep(projectId, stepNumber);
    step.status = StepStatus.SUBMITTED;
    return this.stepRepo.save(step);
  }

  async getProgress(projectId: string): Promise<{ percentage: number; completed: number; total: number }> {
    const steps = await this.stepRepo.find({ where: { project_id: projectId } });
    const total = steps.length;
    const completed = steps.filter(s => s.status === 'approved').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage, completed, total };
  }
}
