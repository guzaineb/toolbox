import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async generateSummary(
    projectId: string,
    stepKey: string,
    context: Record<string, any>,
  ): Promise<string> {
    const prompt = this.buildPrompt(stepKey, context);

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { owner_id: true },
      });

      const { title, message } = this.messageBuilder.aiResponseReady({
        label: 'Résumé IA',
      });
      this.eventEmitter.emit(NotificationEvent.AI_RESPONSE_READY, {
        event: NotificationEvent.AI_RESPONSE_READY,
        recipients: [{ userId: project?.owner_id || '' }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/documents`,
        senderId: project?.owner_id || '',
        resourceType: 'PROJECT',
        resourceId: projectId,
      } as NotificationPayload);

      return response.content;
    } catch (error) {
      this.logger.error(
        `AI generation failed for step ${stepKey}: ${error.message}`,
      );
      return this.fallbackSummary(stepKey, context);
    }
  }

  async detectInconsistencies(projectId: string): Promise<string[]> {
    const prompt = `Analyse les incohérences potentielles dans le GBM du projet ${projectId} (données non fournies ici). Retourne une liste JSON des incohérences détectées.`;

    try {
      const response = await this.llm.generate(prompt, {
        temperature: 0.7,
        maxTokens: 1000,
      });
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
        const {
          idea_sketch,
          problems_needs,
          pestel,
          objective,
          mission_vision,
        } = context;
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
        const {
          key_activities_resource,
          eco_design,
          eco_design_result,
          stakeholder,
          customer_segment,
          value_proposition,
        } = context;
        const stakeholders = Array.isArray(stakeholder)
          ? stakeholder.map((s: any) => s.name).join(', ')
          : 'Non renseigné';
        const segments = Array.isArray(customer_segment)
          ? customer_segment.map((c: any) => c.segment_name).join(', ')
          : 'Non renseigné';

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

      case 'bp_2.6': {
        const fmt = (v: any) => v || 'Non renseigné';
        const fmtList = (arr: any, label: (i: any) => string) =>
          Array.isArray(arr) && arr.length > 0
            ? arr.map(label).join('\n')
            : 'Non renseigné';
        const vp = context.value_proposition || {};
        const segments = context.customer_segment || [];
        const stakeholders = context.stakeholder || [];
        const costs = context.cost_structure || {};
        const revenues = context.revenue_stream || {};
        const mgmt = context.management_plan || {};
        const mkt = context.marketing_plan || {};
        const fin = context.financial_plan || {};
        const legal = context.legal_plan || {};
        const kpi = context.kpi || {};
        const eco = context.eco_design || {};
        const ecoResult = context.eco_design_result || {};
        const swot = context.swot_analysis || {};
        const impact = context.impact_measure || {};

        return `Tu es un conseiller expert en entrepreneuriat vert. Rédige le résumé analytique (executive summary) du projet « ${context.name || 'projet'} » destiné à des investisseurs.

Données réelles du projet (à utiliser telles quelles, ne rien inventer) :

=== IDÉE & CONTEXTE ===
Idée : ${fmt(context.idea_sketch?.idea_initial)}
Produit/Service : ${fmt(context.idea_sketch?.product_service)}
Défis environnementaux : ${fmt(context.problems_needs?.environmental_challenges)}
Besoins clients : ${fmt(context.problems_needs?.customer_needs)}
Contexte PESTEL (économie) : ${fmt(context.pestel?.economic_what)}
Contexte PESTEL (environnement) : ${fmt(context.pestel?.environmental_what)}

=== MISSION & OBJECTIFS ===
Mission : ${fmt(context.mission_vision?.mission)}
Vision : ${fmt(context.mission_vision?.vision)}
Objectifs environnementaux : ${fmt(context.objective?.environmental_objectives)}
Objectifs sociaux : ${fmt(context.objective?.social_objectives)}

=== CLIENTS & PROPOSITION DE VALEUR ===
${fmtList(segments, (s: any) => `- ${s.segment_name || 'Segment'}: ${s.description || ''} (douleurs: ${s.pains || ''}, gains: ${s.gains || ''})`)}
Valeur environnementale : ${fmt(vp.environmental_value)}
Valeur sociale : ${fmt(vp.social_value)}
Valeur ajoutée : ${fmt(vp.value_added)}
Innovation : ${fmt(vp.innovation_value)}
Canaux de distribution : ${fmt(context.customer_relations_channel?.channels)}

=== ÉQUIPE & PARTIES PRENANTES ===
${fmtList(stakeholders, (s: any) => `- ${s.name || ''} (${s.role || ''}): ${s.interest || ''}`)}
Activités clés : ${fmt(context.key_activities_resource?.key_activities)}
Ressources clés : ${fmt(context.key_activities_resource?.key_resources)}

=== ÉCOCONCEPTION & IMPACT ===
Vision durable : ${fmt(eco.vision_durable)}
Résultats éco-conception : ${fmt(ecoResult.eco_results)}
KPIs environnementaux (GBM) : ${fmt(context.indicator?.environmental_kpis)}
Résultats d'impact mesurés : ${fmt(impact.resultats_actuels)}

=== FINANCES ===
Coûts fixes : ${fmt(costs.fixed_costs)}
Coûts variables : ${fmt(costs.variable_costs)}
Sources de revenus : ${fmt(revenues.revenue_sources)}
Stratégie de prix : ${fmt(revenues.pricing_strategy)}
Point de départ (plan financier) : ${fmt(fin.point_depart)}
Capital : ${fmt(fin.capital)}
Seuil de rentabilité : ${fmt(fin.seuil_rentabilite)}

=== PLAN DE GESTION / MARKETING / JURIDIQUE / KPI ===
Gestion : ${fmt(mgmt.ressources_humaines)} — ${fmt(mgmt.production_fournisseurs)}
Marketing : ${fmt(mkt.clients_valeur)} — ${fmt(mkt.branding_positionnement)}
Juridique : ${fmt(legal.statut_juridique)} — ${fmt(legal.immatriculation)}
KPIs : ${fmt(kpi.kpis)}

=== SWOT (généré par IA à partir des données) ===
Forces : ${fmt(swot.strengths)}
Faiblesses : ${fmt(swot.weaknesses)}

Structure le résumé exécutif (600-800 mots) en 6 paragraphes :
1) L'opportunité : le problème résolu et le contexte de marché
2) La solution et la proposition de valeur (incluant les valeurs environnementales et sociales)
3) Le marché et les clients cibles
4) Le modèle économique et la stratégie de mise sur le marché
5) Les prévisions financières et le plan de financement
6) L'impact (environnemental, social, économique) et la vision à terme

Le résumé doit refléter UNIQUEMENT les données fournies ci-dessus. Si une donnée manque, ne pas l'inventer : la mentionner comme « à préciser ».`;
      }

      case 'impact_report': {
        const fmt = (v: any) => v || 'Non renseigné';
        const obj = context.objectifs_impact || {};
        const res = context.resultats_actuels || {};
        return `Tu es un expert en évaluation d'impact. Rédige un rapport d'impact narratif pour le projet « ${context.name || 'projet'} » à partir des données réelles suivantes.

OBJECTIFS D'IMPACT : ${fmt(context.objective?.environmental_objectives)} / ${fmt(context.objective?.social_objectives)}
KPIs ENVIRONNEMENTAUX (GBM) : ${fmt(context.indicator?.environmental_kpis)}
KPIs SOCIAUX (GBM) : ${fmt(context.indicator?.social_kpis)}
KPIs ÉCONOMIQUES (GBM) : ${fmt(context.indicator?.economic_kpis)}
RÉSULTATS ÉCOCONCEPTION : ${fmt(context.eco_design_result?.eco_results)}
OBJECTIFS CHIFFRÉS : ${JSON.stringify(obj)}
RÉSULTATS ACTUELS : ${JSON.stringify(res)}

Rédige un rapport structuré (500-700 mots) avec 4 sections :
1) Impact environnemental
2) Impact social
3) Impact économique
4) Écarts objectifs/résultats et recommandations

Le rapport doit refléter UNIQUEMENT les données fournies. Ne pas inventer de chiffres.`;
      }

      case 'bp_2.3.8':
        return `Génère un rapport financier de synthèse basé sur les données suivantes : ${JSON.stringify(context)}. Inclus l'analyse du compte de résultat, du cash-flow, du bilan et du seuil de rentabilité.`;

      default:
        return `Génère une analyse contextuelle pour l'étape ${stepKey} avec les données : ${JSON.stringify(context)}.`;
    }
  }

  private fallbackSummary(
    stepKey: string,
    context: Record<string, any>,
  ): string {
    return `Résumé généré automatiquement pour l'étape ${stepKey}. Les données seront enrichies lorsque le service IA sera configuré avec une clé API valide.`;
  }
}
