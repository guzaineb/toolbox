import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiAssistantService {
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('AI_API_KEY') || '';
  }

  async chat(projectId: string, stepNumber: number, message: string, context: any): Promise<{ response: string }> {
    try {
      const prompt = this.buildContextPrompt(context, stepNumber, message);
      const response = await this.callLLMOrFallback(prompt, this.fallbackResponse(stepNumber, message));
      return { response };
    } catch (error) {
      return { response: this.fallbackResponse(stepNumber, message) };
    }
  }

  async generateBusinessModelCanvas(projectId: string, stepContent: any): Promise<{ bmc: any }> {
    const prompt = `Génère un Business Model Canvas complet basé sur ces informations:\n${JSON.stringify(stepContent)}`;
    const response = await this.callLLMOrFallback(prompt, JSON.stringify(this.defaultBMC()));
    return { bmc: response ? JSON.parse(response) : this.defaultBMC() };
  }

  async generateBusinessPlan(projectId: string, allSteps: any[]): Promise<{ businessPlan: string }> {
    const context = allSteps.map(s => `Étape ${s.step_number}: ${s.title}\n${JSON.stringify(s.content)}`).join('\n\n');
    const prompt = `Génère un Business Plan structuré basé sur ces informations:\n${context}`;
    const response = await this.callLLMOrFallback(prompt, 'Business Plan généré automatiquement.');
    return { businessPlan: response };
  }

  async evaluateProject(projectId: string, allSteps: any[]): Promise<{
    score: number;
    coherence: number;
    maturity: number;
    completeness: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const steps = allSteps.filter(s => s.content && Object.keys(s.content).length > 0);
    const totalSteps = allSteps.length;
    const completeness = totalSteps > 0 ? Math.round((steps.length / totalSteps) * 100) : 0;
    const coherence = Math.min(85, 50 + steps.length * 3);
    const maturity = Math.min(90, 40 + steps.length * 4);

    const score = Math.round((coherence + maturity + completeness) / 3);

    const strengths = [
      'Projet bien structuré',
      'Démarche méthodologique solide',
      'Approche entrepreneuriale rigoureuse',
    ];

    const weaknesses = [
      steps.length < 5 ? 'Peu d\'étapes complétées, approfondir l\'analyse' : 'Continuer à détailler chaque section',
      'Prévoir une validation terrain plus poussée',
    ];

    const recommendations = [
      'Compléter les étapes restantes du parcours',
      'Solliciter des retours d\'experts',
      'Préparer les documents pour l\'évaluation finale',
    ];

    return { score, coherence, maturity, completeness, strengths, weaknesses, recommendations };
  }

  private buildContextPrompt(context: any, stepNumber: number, message: string): string {
    return `Contexte du projet: ${JSON.stringify(context)}\nÉtape: ${stepNumber}\nMessage: ${message}\n\nRéponds en français en tant qu'assistant entrepreneurial.`;
  }

  private async callLLM(prompt: string): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  private async callLLMOrFallback(prompt: string, fallback: string): Promise<string> {
    const result = await this.callLLM(prompt);
    return result || fallback;
  }

  private fallbackResponse(stepNumber: number, message: string): string {
    const responses: Record<number, string[]> = {
      1: ['Pour structurer votre idée, commencez par définir le problème que vous résolvez.', 'Quelle est la valeur ajoutée unique de votre solution ?'],
      2: ['L\'étude de marché est cruciale. Identifiez vos segments clients.', 'Analysez vos concurrents avec un SWOT.'],
      4: ['Le Business Model Canvas vous aide à visualiser votre modèle économique.', 'Identifiez vos sources de revenus principales.'],
      5: ['Le Business Plan est votre document de référence pour les investisseurs.', 'Structurez-le en executive summary, analyse marché, stratégie et finances.'],
    };

    const stepResponses = responses[stepNumber] || [
      'Continuez à remplir les informations de cette étape.',
      'Chaque détail compte pour structurer votre projet.',
      'N\'hésitez pas à être précis dans vos réponses.',
    ];

    return stepResponses[Math.floor(Math.random() * stepResponses.length)];
  }

  private defaultBMC() {
    return {
      value_proposition: '',
      customer_segments: '',
      channels: '',
      customer_relationships: '',
      revenue_streams: '',
      key_resources: '',
      key_activities: '',
      key_partnerships: '',
      cost_structure: '',
    };
  }
}
