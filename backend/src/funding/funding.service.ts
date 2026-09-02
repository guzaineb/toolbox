import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundingPhase } from '@prisma/client';
import { SectionStepService } from '../common/services/section-step.service';

const MATURITY_QUESTIONS = [
  'Problème marché clairement défini',
  'Solution clairement décrite',
  'Idée testée et validée avec clients/parties prenantes',
  'Segments clients définis selon ≥ 2 critères',
  'Métriques business établies et suivies',
  'Produit profitable déjà sur le marché',
  'Équilibre coûts/revenus et burn rate connus',
  'Entreprise déjà profitable',
  "Numéro d'enregistrement officiel et statut légal",
  'Équipe complète et active',
  'Portfolio produits établi en vente',
  "Marchés d'expansion futurs identifiés",
];

const FUNDING_ALLOWED_FIELDS = [
  'opportunites_financement',
  'opportunites_pays',
  'strategie_levee_fonds',
];

@Injectable()
export class FundingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
  ) {}

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
    await this.sections.ensureOwnership(projectId, userId);
    const record = await this.prisma.fundingAssessment.findUnique({
      where: { project_id: projectId },
    });
    return record || {};
  }

  async submitQuestionnaire(
    projectId: string,
    reponses: Record<string, boolean>,
    userId: string,
  ) {
    await this.sections.ensureOwnership(projectId, userId);

    const expectedKeys = Array.from({ length: 12 }, (_, i) => `q${i + 1}`);
    this.sections.assertMissingAnswers(reponses, expectedKeys);

    const score = expectedKeys.filter((key) => reponses[key] === true).length;
    const phase = this.calculatePhase(score);

    return this.sections.saveSection(
      this.prisma.fundingAssessment,
      projectId,
      {
        reponses_questionnaire: reponses as any,
        score_maturite: score,
        phase_maturite: phase,
        completed_at: new Date(),
      },
      { stepKey: 'funding' },
    );
  }

  async updateAssessment(projectId: string, data: any, userId: string) {
    return this.sections.saveSection(
      this.prisma.fundingAssessment,
      projectId,
      data,
      { allowedFields: FUNDING_ALLOWED_FIELDS },
    );
  }
}
