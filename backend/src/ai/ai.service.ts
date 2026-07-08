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
      case 'gbm_6': {
        const { idea_sketch, problems_needs, pestel, objective, mission_vision } = context;
        return `Génère un résumé de contexte et des objectifs pour un projet d'entrepreneuriat vert.

Voici les données du projet :

IDÉE INITIALE : ${idea_sketch?.idea_initial || 'Non renseigné'}
PRODUIT/SERVICE : ${idea_sketch?.product_service || 'Non renseigné'}
CLIENTS CIBLÉS : ${idea_sketch?.customers || 'Non renseigné'}
PARTENAIRES VISÉS : ${idea_sketch?.partners || 'Non renseigné'}

DÉFIS ENVIRONNEMENTAUX IDENTIFIÉS : ${problems_needs?.environmental_challenges || 'Non renseigné'}
DÉFIS SOCIAUX IDENTIFIÉS : ${problems_needs?.social_challenges || 'Non renseigné'}
BESOINS CLIENTS : ${problems_needs?.customer_needs || 'Non renseigné'}
MOTIVATIONS DE L'ÉQUIPE : ${problems_needs?.team_motivations || 'Non renseigné'}

CONTEXTE PESTEL :
- Politique : ${pestel?.political_what || 'N/A'} — ${pestel?.political_how || ''}
- Économique : ${pestel?.economic_what || 'N/A'} — ${pestel?.economic_how || ''}
- Social : ${pestel?.social_what || 'N/A'} — ${pestel?.social_how || ''}
- Technologique : ${pestel?.technological_what || 'N/A'} — ${pestel?.technological_how || ''}
- Environnemental : ${pestel?.environmental_what || 'N/A'} — ${pestel?.environmental_how || ''}
- Légal : ${pestel?.legal_what || 'N/A'} — ${pestel?.legal_how || ''}

OBJECTIFS ENVIRONNEMENTAUX : ${objective?.environmental_objectives || 'Non renseigné'}
OBJECTIFS SOCIAUX : ${objective?.social_objectives || 'Non renseigné'}
OBJECTIFS CLIENTS : ${objective?.customer_objectives || 'Non renseigné'}

MISSION : ${mission_vision?.mission || 'Non renseigné'}
VISION : ${mission_vision?.vision || 'Non renseigné'}
VALEURS : ${mission_vision?.values || 'Non renseigné'}

Rédige un résumé de contexte professionnel et concis (300-400 mots) qui synthétise le projet, son environnement, ses objectifs et sa vision. Structure le texte en 3 paragraphes :
1) Contexte et problématique (présente le projet, les défis environnementaux/sociaux identifiés et le contexte PESTEL)
2) Objectifs et stratégie (détaille les objectifs environnementaux, sociaux et clients)
3) Mission et vision (décris la mission, la vision et les valeurs qui guident le projet)

Le résumé doit être personnalisé et refléter UNIQUEMENT les données fournies ci-dessus, sans contenu générique.`;
      }

      case 'gbm_15': {
        const { key_activities_resource, eco_design, eco_design_result, stakeholder, customer_segment, value_proposition } = context;
        const stakeholders = Array.isArray(stakeholder) ? stakeholder.map((s: any) => s.name).join(', ') : 'Non renseigné';
        const segments = Array.isArray(customer_segment) ? customer_segment.map((c: any) => c.segment_name).join(', ') : 'Non renseigné';

        return `Génère un résumé des activités clés et des ressources du projet.

ACTIVITÉS CLÉS : ${key_activities_resource?.key_activities || 'Non renseigné'}
RESSOURCES CLÉS : ${key_activities_resource?.key_resources || 'Non renseigné'}
PARTENAIRES STRATÉGIQUES : ${key_activities_resource?.strategic_partners || 'Non renseigné'}

ÉCOCONCEPTION — Projet : ${eco_design?.projet_eco || 'Non renseigné'}
ÉCOCONCEPTION — Contexte : ${eco_design?.contexte_eco || 'Non renseigné'}
ÉCOCONCEPTION — Vision durable : ${eco_design?.vision_durable || 'Non renseigné'}
RÉSULTATS ÉCOCONCEPTION : ${eco_design_result?.eco_results || 'Non renseigné'}
ANALYSE DE PERFORMANCE : ${eco_design_result?.performance_analysis || 'Non renseigné'}

PARTIES PRENANTES : ${stakeholders}
SEGMENTS DE CLIENTÈLE : ${segments}
PROPOSITION DE VALEUR AJOUTÉE : ${value_proposition?.value_added || 'Non renseigné'}

Rédige un résumé structuré avec 3 sections :
1) Résumé des activités et ressources déployées
2) Principales réalisations et points forts
3) Prochaines étapes recommandées

Retourne UNIQUEMENT un objet JSON valide avec les clés : activities_summary, key_achievements, next_steps.`;
      }

      case 'gbm_18': {
        const { cost_structure, revenue_stream } = context;
        return `Génère un résumé financier pour le projet.

STRUCTURE DES COÛTS :
- Coûts fixes : ${cost_structure?.fixed_costs || 'Non renseigné'}
- Coûts variables : ${cost_structure?.variable_costs || 'Non renseigné'}
- Facteurs de coûts : ${cost_structure?.cost_drivers || 'Non renseigné'}
- Seuil de rentabilité : ${cost_structure?.breakeven_analysis || 'Non renseigné'}

STRUCTURE DES REVENUS :
- Sources de revenus : ${revenue_stream?.revenue_sources || 'Non renseigné'}
- Stratégie de prix : ${revenue_stream?.pricing_strategy || 'Non renseigné'}
- Projections financières : ${revenue_stream?.revenue_projections || 'Non renseigné'}

Retourne UNIQUEMENT un objet JSON valide avec les clés : cost_summary, revenue_summary, financial_health.`;
      }

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
