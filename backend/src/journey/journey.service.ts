import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectStep, StepStatus } from './project-step.entity';
import { UpdateStepDto } from './dto/update-step.dto';
import { ProgressService } from '../progress/progress.service';

export const JOURNEY_STEPS = [
  // Phase 1: Ébaucher et définir (steps 1-6)
  { step_number: 1, title: "Esquisser l'idée d'entreprise", description: "Nom provisoire, description, inspiration, secteur d'activité", sub_sections: ['nom_provisoire', 'description_idee', 'inspiration', 'secteur_activite'] },
  { step_number: 2, title: 'Identifier les problèmes et les besoins', description: 'Problème principal, besoins utilisateurs, douleur client, alternatives', sub_sections: ['probleme_principal', 'besoins_utilisateurs', 'douleur_client', 'alternatives_actuelles'] },
  { step_number: 3, title: 'Comprendre le contexte', description: 'SWOT, PESTEL, tendances marché, concurrence', sub_sections: ['swot_v2', 'pestel_v2', 'tendances_marche', 'environnement_concurrentiel'] },
  { step_number: 4, title: 'Définir les objectifs', description: 'Objectifs court/moyen/long terme, critères de succès', sub_sections: ['objectifs_court_terme', 'objectifs_moyen_terme', 'objectifs_long_terme', 'criteres_succes'] },
  { step_number: 5, title: 'Définir la mission et la vision', description: 'Mission, vision, valeurs, impact souhaité', sub_sections: ['mission', 'vision', 'valeurs', 'impact_souhaite'] },
  { step_number: 6, title: 'Résumé du contexte et des objectifs', description: 'Synthèse contexte, objectifs, cohérence globale', sub_sections: ['synthese_contexte', 'synthese_objectifs', 'coherence_globale'] },
  // Phase 2: Construire (steps 7-18)
  { step_number: 7, title: 'Identifier et cartographier les parties prenantes', description: 'Parties prenantes directes/indirectes, influence, intérêt, matrice pouvoir', sub_sections: ['parties_prenantes_directes', 'parties_prenantes_indirectes', 'influence_interet', 'carte_influence', 'carte_interet', 'matrice_pouvoir'] },
  { step_number: 8, title: 'Segments de clientèle', description: 'Segments principaux, profils acheteurs, early adopters, marché cible', sub_sections: ['segments_principaux', 'profils_acheteurs', 'early_adopters', 'marche_cible_v2'] },
  { step_number: 9, title: 'Proposition de valeur', description: 'Valeur fonctionnelle, émotionnelle, sociale, différenciation', sub_sections: ['valeur_fonctionnelle', 'valeur_emotionnelle', 'valeur_sociale', 'differenciation'] },
  { step_number: 10, title: 'Tester la proposition de valeur', description: 'Tests clients, feedbacks, ajustements', sub_sections: ['tests_clients', 'feedback_recolte', 'ajustements'] },
  { step_number: 11, title: "Faire évoluer la proposition de valeur", description: "Nécessité d'un pivot, nouvelle proposition, validation", sub_sections: ['pivot_necessite', 'nouvelle_proposition', 'validation_pivot'] },
  { step_number: 12, title: 'Relations clients, canaux et parcours client', description: 'Type relation, canaux acquisition/distribution/communication, parcours client', sub_sections: ['type_relation', 'canaux_acquisition', 'canaux_distribution', 'canaux_communication', 'parcours_decouverte', 'parcours_achat', 'parcours_fidelisation', 'points_contact'] },
  { step_number: 13, title: 'Activités clés et ressources clés', description: 'Activités clés, ressources, compétences, besoins technologiques', sub_sections: ['activites_cles', 'ressources_cles', 'competences_requises', 'besoins_technologiques'] },
  { step_number: 14, title: 'Écoconception et résultats environnementaux', description: 'Impact environnemental, écoconception, ACV, bilan carbone, plan', sub_sections: ['impact_environnemental', 'ecoconception_produit', 'analyse_cycle_vie', 'bilan_carbone', 'ameliorations_identifiees', 'plan_ecoconception'] },
  { step_number: 15, title: 'Résumé opérationnel', description: 'Synthèse activités, ressources, canaux', sub_sections: ['synthese_activites', 'synthese_ressources', 'synthese_canaux'] },
  { step_number: 16, title: 'Structure des coûts', description: 'Coûts fixes, variables, investissements, seuil rentabilité', sub_sections: ['couts_fixes', 'couts_variables', 'investissements_initial', 'seuil_rentabilite'] },
  { step_number: 17, title: 'Flux de revenus', description: 'Sources revenus, tarification, projection', sub_sections: ['sources_revenus', 'modele_tarification', 'projection_revenus'] },
  { step_number: 18, title: 'Résumé financier du modèle économique', description: 'Synthèse coûts, revenus, rentabilité', sub_sections: ['synthese_couts', 'synthese_revenus', 'rentabilite_previsionnelle'] },
  // Phase 3: Tester (step 19)
  { step_number: 19, title: 'Préparer et réaliser les tests terrain', description: 'Interviews, observations, questionnaires, validation hypothèses, fiches découverte', sub_sections: ['interviews_clients', 'observations_terrain', 'questionnaires_sondages', 'validation_hypotheses', 'fiches_decouverte'] },
  // Phase 4: Mettre en œuvre (step 20)
  { step_number: 20, title: 'Plans de mise en œuvre', description: 'Plan opérationnel, marketing, commercial, financier, financement, ressources', sub_sections: ['plan_operationnel', 'plan_marketing', 'plan_commercial', 'plan_financier', 'recherche_financement', 'gestion_ressources'] },
  // Phase 5: Mesurer et améliorer (step 21)
  { step_number: 21, title: 'Définition et suivi des indicateurs', description: 'KPI financiers, commerciaux, environnementaux, sociaux, impact', sub_sections: ['kpi_financiers', 'kpi_commerciaux', 'kpi_environnementaux', 'kpi_sociaux', 'kpi_impact'] },
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
    const completed = approved;
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
