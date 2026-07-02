import { Injectable, Logger } from '@nestjs/common';
import { DeepseekService } from './deepseek.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly deepseek: DeepseekService) {}

  async generateSummary(
    projectId: string,
    stepKey: string,
    context: Record<string, any>,
  ): Promise<string> {
    const prompt = this.buildPrompt(stepKey, context);

    try {
      const response = await this.callAi(prompt);
      return response;
    } catch (error) {
      this.logger.error(`AI generation failed for step ${stepKey}: ${error.message}`);
      return this.fallbackSummary(stepKey, context);
    }
  }

  async detectInconsistencies(projectId: string): Promise<string[]> {
    const prompt = `Analyse les incohérences potentielles dans le GBM du projet ${projectId} (données non fournies ici). Retourne une liste JSON des incohérences détectées.`;

    try {
      const response = await this.callAi(prompt);
      try {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed) ? parsed : [response];
      } catch {
        return [response];
      }
    } catch {
      return [];
    }
  }

  private async callAi(prompt: string): Promise<string> {
    if (process.env.DEEPSEEK_API_KEY) {
      const result = await this.deepseek.generate(prompt, { temperature: 0.7, maxTokens: 1000 });
      return result.content;
    }

    return this.callOpenAI(prompt);
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

  private async callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('No API key configured (neither DEEPSEEK_API_KEY nor OPENAI_API_KEY)');
      return this.simulateResponse(prompt);
    }

    const models = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4'];

    for (const model of models) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'Tu es un assistant expert en entrepreneuriat vert et en développement durable.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0]?.message?.content || '';
        }

        if (response.status === 404 || response.status === 401) {
          this.logger.warn(`OpenAI model ${model} not available (${response.status}), trying next`);
          continue;
        }

        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      } catch (error) {
        if (error.message?.includes('OpenAI API error')) throw error;
        this.logger.warn(`OpenAI model ${model} failed: ${error.message}, trying next`);
      }
    }

    throw new Error('All OpenAI models failed');
  }

  private simulateResponse(prompt: string): string {
    return `[Simulation IA] Résumé généré automatiquement. Prompt : ${prompt.substring(0, 100)}...`;
  }

  private fallbackSummary(stepKey: string, context: Record<string, any>): string {
    return `Résumé généré automatiquement pour l'étape ${stepKey}. Les données seront enrichies lorsque le service IA sera configuré avec une clé API valide.`;
  }
}
