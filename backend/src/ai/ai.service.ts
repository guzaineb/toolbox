import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly llm: LlmService) {}

  async generateSummary(
    projectId: string,
    stepKey: string,
    context: Record<string, any>,
  ): Promise<string> {
    const prompt = this.buildPrompt(stepKey, context);

    try {
      const response = await this.llm.generate(prompt, { temperature: 0.7, maxTokens: 1000 });
      return response.content;
    } catch (error) {
      this.logger.error(`AI generation failed for step ${stepKey}: ${error.message}`);
      return this.fallbackSummary(stepKey, context);
    }
  }

  async detectInconsistencies(projectId: string): Promise<string[]> {
    const prompt = `Analyse les incohérences potentielles dans le GBM du projet ${projectId} (données non fournies ici). Retourne une liste JSON des incohérences détectées.`;

    try {
      const response = await this.llm.generate(prompt, { temperature: 0.7, maxTokens: 1000 });
      try {
        const parsed = JSON.parse(response.content);
        return Array.isArray(parsed) ? parsed : [response.content];
      } catch {
        return [response.content];
      }
    } catch {
      return [];
    }
  }

  private buildPrompt(stepKey: string, context: Record<string, any>): string {
    switch (stepKey) {
      case 'gbm_6':
        return `Génère un résumé de contexte et des objectifs pour un projet d'entrepreneuriat vert basé sur les données suivantes (idée, problèmes, PESTEL, objectifs, mission/vision) : ${JSON.stringify(context)}. Synthétise les éléments clés de manière concise et professionnelle.`;
      case 'gbm_15':
        return `Génère un résumé des activités clés et des ressources du projet basé sur les données suivantes (activités, ressources, écoconception) : ${JSON.stringify(context)}. Mets en avant les réalisations et les prochaines étapes.`;
      case 'gbm_18':
        return `Génère un résumé financier (coûts et revenus) basé sur les données suivantes : ${JSON.stringify(context)}. Inclus une analyse de la santé financière du projet.`;
      case 'bp_2.6':
        return `Génère un résumé analytique (executive summary) complet pour investisseurs basé sur les données suivantes : ${JSON.stringify(context)}. Inclus la proposition de valeur, le modèle d'affaires, les projections financières et l'impact environnemental.`;
      case 'impact_report':
        return `Génère un rapport d'impact narratif basé sur les KPIs suivants : ${JSON.stringify(context)}. Mets en évidence les progrès environnementaux, sociaux et économiques.`;
      case 'bp_2.3.8':
        return `Génère un rapport financier de synthèse basé sur les données suivantes : ${JSON.stringify(context)}. Inclus l'analyse du compte de résultat, du cash-flow, du bilan et du seuil de rentabilité.`;
      default:
        return `Génère une analyse contextuelle pour l'étape ${stepKey} avec les données : ${JSON.stringify(context)}.`;
    }
  }

  private fallbackSummary(stepKey: string, context: Record<string, any>): string {
    return `Résumé généré automatiquement pour l'étape ${stepKey}. Les données seront enrichies lorsque le service IA sera configuré avec une clé API valide.`;
  }
}
