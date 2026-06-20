import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectStep, StepStatus } from './project-step.entity';
import { UpdateStepDto } from './dto/update-step.dto';
import { ProgressService } from '../progress/progress.service';

export const JOURNEY_STEPS = [
  // Phase 1: Ébaucher et définir (steps 1-6)
  { step_number: 1, title: "Esquissez votre idée d'entreprise", description: "Idée initiale, produit/service, clients, partenaires", sub_sections: ['nom_provisoire', 'description_idee', 'inspiration', 'secteur_activite', 'clients_partenaires'] },
  { step_number: 2, title: 'Identifier les problèmes et les besoins', description: 'Défis environnementaux, défis sociaux, besoins clients, motivations équipe', sub_sections: ['defis_environnementaux', 'defis_sociaux', 'besoins_clients', 'motivations_equipe'] },
  { step_number: 3, title: 'Comprendre le contexte (PESTEL)', description: 'Analyse PESTEL: Politique, Économique, Socioculturel, Technologique, Environnemental, Légal', sub_sections: ['pestel_v2'] },
  { step_number: 4, title: 'Fixez vos objectifs', description: 'Objectifs environnementaux, sociaux, clients, équipe', sub_sections: ['objectifs_environnementaux', 'objectifs_sociaux', 'objectifs_clients', 'objectifs_equipe'] },
  { step_number: 5, title: 'Synthétiser une mission et une vision', description: 'Mission, vision, impact souhaité', sub_sections: ['mission', 'vision', 'impact_souhaite'] },
  { step_number: 6, title: 'Résumé du contexte et des objectifs', description: 'Synthèse visuelle de tout ce qui précède', sub_sections: ['synthese_contexte', 'synthese_objectifs', 'coherence_globale'] },
  // Phase 2: Construire (steps 7-18)
  { step_number: 7, title: 'Identifier et cartographier les parties prenantes', description: 'Matrice Influence/Impact, tableau par objectif, carte donnant-donnant', sub_sections: ['stakeholder_matrix', 'stakeholder_map'] },
  { step_number: 8, title: 'Segments de clientèle', description: 'Customer Cards: gains, souffrances, fonctions', sub_sections: ['customer_segments'] },
  { step_number: 9, title: 'Canevas de propositions de valeur', description: 'Valeur environnementale, sociale, pain relievers, gain creators, produits', sub_sections: ['value_proposition_canvas'] },
  { step_number: 10, title: 'Tester la proposition de valeur', description: 'Fiches de découverte (interview/observation)', sub_sections: ['discovery_cards'] },
  { step_number: 11, title: 'Pivoter la proposition de valeur', description: 'Ajustements basés sur les tests', sub_sections: ['pivot_necessite', 'nouvelle_proposition', 'validation_pivot'] },
  { step_number: 12, title: 'Relations clients, canaux et parcours client', description: 'Type relation, canaux, parcours client', sub_sections: ['type_relation', 'canaux_acquisition', 'canaux_distribution', 'canaux_communication', 'parcours_client'] },
  { step_number: 13, title: 'Principales activités et ressources', description: 'Activités clés, ressources, compétences', sub_sections: ['activites_cles', 'ressources_cles', 'competences_requises'] },
  { step_number: 14, title: 'Écoconception de votre entreprise', description: 'Impact environnemental, écoconception, plan', sub_sections: ['impact_environnemental', 'ecoconception_produit', 'plan_ecoconception'] },
  { step_number: 15, title: 'Résumé', description: 'Synthèse opérationnelle', sub_sections: ['synthese_activites', 'synthese_ressources', 'synthese_canaux'] },
  { step_number: 16, title: 'Structure des coûts', description: 'Coûts fixes, variables, investissements, seuil rentabilité', sub_sections: ['couts_fixes', 'couts_variables', 'investissements_initial', 'seuil_rentabilite'] },
  { step_number: 17, title: 'Flux de revenus', description: 'Sources revenus, tarification, projection', sub_sections: ['sources_revenus', 'modele_tarification', 'projection_revenus'] },
  { step_number: 18, title: 'Résumé financier', description: 'Synthèse coûts, revenus, rentabilité', sub_sections: ['synthese_couts', 'synthese_revenus', 'rentabilite_previsionnelle'] },
  // Phase 3: Tester (step 19)
  { step_number: 19, title: 'Préparez le test !', description: 'Interviews, observations, questionnaires, fiches découverte', sub_sections: ['preparation_test', 'interviews_clients', 'observations_terrain', 'questionnaires_sondages'] },
  // Phase 4: Mesurer et améliorer (step 20)
  { step_number: 20, title: 'Indicateurs (KPIs)', description: 'KPI financiers, clients, environnementaux, sociaux', sub_sections: ['kpi_financiers', 'kpi_clients', 'kpi_environnementaux', 'kpi_sociaux'] },
];

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(ProjectStep)
    private stepRepo: Repository<ProjectStep>,
    private progressService: ProgressService,
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
      step.content = { ...(step.content || {}), ...dto.content };
    }
    if (dto.sub_sections) {
      step.sub_sections = { ...(step.sub_sections || {}), ...dto.sub_sections };
    }
    if (dto.status) {
      this.assertValidTransition(step.status, dto.status);
      step.status = dto.status;
    }

    const saved = await this.stepRepo.save(step);

    await this.progressService.log(
      projectId,
      step.status === StepStatus.IN_PROGRESS ? 'step_updated' : 'step_status_changed',
      step.status, saved.status, userId, saved.id,
    );

    return saved;
  }

  async submitStep(projectId: string, stepNumber: number, userId: string): Promise<ProjectStep> {
    const step = await this.getStep(projectId, stepNumber);

    if (step.status === StepStatus.APPROVED) {
      throw new BadRequestException('Cette étape est déjà approuvée');
    }
    if (step.status === StepStatus.SUBMITTED) {
      throw new BadRequestException('Cette étape est déjà soumise');
    }

    const validationErrors = await this.validateStepContent(step);
    if (validationErrors.length > 0) {
      step.validation_errors = validationErrors;
      await this.stepRepo.save(step);
      throw new BadRequestException(validationErrors.join('; '));
    }

    step.status = StepStatus.SUBMITTED;
    step.submitted_at = new Date();
    step.validation_errors = [];
    const saved = await this.stepRepo.save(step);

    await this.progressService.log(projectId, 'step_submitted', StepStatus.IN_PROGRESS, StepStatus.SUBMITTED, userId, saved.id);

    return saved;
  }

  async getProgress(projectId: string): Promise<{ percentage: number; completed: number; submitted: number; approved: number; rejected: number; total: number; byStatus: Record<string, number> }> {
    const steps = await this.stepRepo.find({ where: { project_id: projectId } });
    const total = steps.length;
    const byStatus: Record<string, number> = {};
    steps.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });
    const approved = steps.filter(s => s.status === 'approved').length;
    const submitted = steps.filter(s => s.status === 'submitted').length;
    const rejected = steps.filter(s => s.status === 'rejected').length;
    const completed = submitted + approved;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage, completed, submitted, approved, rejected, total, byStatus };
  }

  async getStepScore(projectId: string, stepNumber: number): Promise<{ score: number | null; validation_errors: string[] | null }> {
    const step = await this.getStep(projectId, stepNumber);
    return { score: step.score, validation_errors: step.validation_errors };
  }

  async validateStepContent(step: ProjectStep): Promise<string[]> {
    const errors: string[] = [];
    if (!step.content || Object.keys(step.content).length === 0) {
      errors.push('Le contenu de l\'étape est vide. Veuillez remplir au moins une section.');
      return errors;
    }

    const emptySections: string[] = [];
    for (const [key, value] of Object.entries(step.content)) {
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
        emptySections.push(key);
      } else if (typeof value === 'object') {
        const allEmpty = Object.values(value).every(v => !v || v === '');
        if (allEmpty) emptySections.push(key);
      }
    }

    if (emptySections.length > 0) {
      errors.push(`Les sections suivantes sont vides : ${emptySections.join(', ')}`);
    }

    return errors;
  }

  private assertValidTransition(current: StepStatus, next: StepStatus): void {
    const allowed: Record<string, StepStatus[]> = {
      [StepStatus.NOT_STARTED]: [StepStatus.IN_PROGRESS, StepStatus.SUBMITTED],
      [StepStatus.IN_PROGRESS]: [StepStatus.SUBMITTED, StepStatus.NOT_STARTED],
      [StepStatus.SUBMITTED]: [StepStatus.APPROVED, StepStatus.REJECTED, StepStatus.IN_PROGRESS],
      [StepStatus.APPROVED]: [StepStatus.IN_PROGRESS, StepStatus.REJECTED],
      [StepStatus.REJECTED]: [StepStatus.IN_PROGRESS, StepStatus.SUBMITTED],
    };

    if (!allowed[current]?.includes(next)) {
      throw new BadRequestException(`Transition de statut invalide: ${current} -> ${next}`);
    }
  }
}
