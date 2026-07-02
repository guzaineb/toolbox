import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { FundingPhase } from '@prisma/client';

const MATURITY_QUESTIONS = [
  'Problème marché clairement défini',
  'Solution clairement décrite',
  'Idée testée et validée avec clients/parties prenantes',
  'Segments clients définis selon ≥ 2 critères',
  'Métriques business établies et suivies',
  'Produit profitable déjà sur le marché',
  'Équilibre coûts/revenus et burn rate connus',
  'Entreprise déjà profitable',
  'Numéro d\'enregistrement officiel et statut légal',
  'Équipe complète et active',
  'Portfolio produits établi en vente',
  'Marchés d\'expansion futurs identifiés',
];

@Injectable()
export class FundingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  private async ensureProjectOwnership(projectId: string, userId: string) {
    return this.projects.findOwnedOrThrow(projectId, userId);
  }

  calculatePhase(score: number): FundingPhase {
    if (score <= 3) return 'IDEATION' as FundingPhase;
    if (score <= 6) return 'VALIDATION' as FundingPhase;
    if (score <= 9) return 'EARLY_STAGE' as FundingPhase;
    if (score <= 11) return 'GROWTH' as FundingPhase;
    return 'SCALING' as FundingPhase;
  }

  getQuestions() {
    return MATURITY_QUESTIONS.map((q, i) => ({
      id: i + 1,
      question: q,
      key: `q${i + 1}`,
    }));
  }

  async getAssessment(projectId: string, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);
    const record = await this.prisma.fundingAssessment.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async submitQuestionnaire(projectId: string, reponses: Record<string, boolean>, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const expectedKeys = Array.from({ length: 12 }, (_, i) => `q${i + 1}`);
    for (const key of expectedKeys) {
      if (reponses[key] === undefined) {
        throw new BadRequestException(`Missing answer for question ${key}`);
      }
    }

    const score = expectedKeys.filter(key => reponses[key] === true).length;
    const phase = this.calculatePhase(score);

    const record = await this.prisma.fundingAssessment.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        reponses_questionnaire: reponses as any,
        score_maturite: score,
        phase_maturite: phase,
        completed_at: new Date(),
      },
      update: {
        reponses_questionnaire: reponses as any,
        score_maturite: score,
        phase_maturite: phase,
        completed_at: new Date(),
      },
    });

    await this.prisma.stepProgress.upsert({
      where: { project_id_step_key: { project_id: projectId, step_key: 'funding' } },
      create: { project_id: projectId, step_key: 'funding', status: 'COMPLETED', completed_at: new Date() },
      update: { status: 'COMPLETED', completed_at: new Date() },
    });

    return record;
  }

  async updateAssessment(projectId: string, data: any, userId: string) {
    await this.ensureProjectOwnership(projectId, userId);

    const filteredData: any = {};
    const allowedFields = ['opportunites_financement', 'opportunites_pays', 'strategie_levee_fonds'];
    for (const key of Object.keys(data)) {
      if (allowedFields.includes(key)) filteredData[key] = data[key];
    }

    return this.prisma.fundingAssessment.upsert({
      where: { project_id: projectId },
      create: { project_id: projectId, ...filteredData },
      update: filteredData,
    });
  }
}
