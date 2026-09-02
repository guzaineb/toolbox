import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DocumentPromptConfig {
  key: string;
  title: string;
  sourceModels: string[];
  buildPrompt: (project: any) => string;
}

@Injectable()
export class DocumentPromptsService {
  private readonly logger = new Logger(DocumentPromptsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProjectData(projectId: string) {
    return (this.prisma as any).project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
        context_summary: true,
        stakeholder: true,
        stakeholder_map: true,
        customer_segment: true,
        value_proposition: true,
        value_proposition_pivot: true,
        test_discovery: true,
        customer_relations_channel: true,
        customer_journey: true,
        key_activities_resource: true,
        eco_design: true,
        eco_design_result: true,
        summary_activity: true,
        cost_structure: true,
        revenue_stream: true,
        cost_revenue_summary: true,
        test_preparation: true,
        indicator: true,
        management_plan: true,
        marketing_plan: true,
        financial_plan: true,
        legal_plan: true,
        kpi: true,
        executive_summary: true,
        funding_assessment: true,
        market_access: true,
        impact_measure: true,
        swot_analysis: true,
      },
    });
  }

  private fmt(val: any): string {
    return val || 'Non renseigné';
  }

  getDocumentConfigs(): DocumentPromptConfig[] {
    return [
      {
        key: 'idea_sketch',
        title: "Fiche d'idée",
        sourceModels: ['idea_sketch'],
        buildPrompt: (
          p,
        ) => `Rédige une fiche d'idée d'entreprise structurée et professionnelle pour le projet "${p.name}".

IDÉE INITIALE: ${this.fmt(p.idea_sketch?.idea_initial)}
PRODUIT/SERVICE: ${this.fmt(p.idea_sketch?.product_service)}
CLIENTS CIBLES: ${this.fmt(p.idea_sketch?.customers)}
PARTENAIRES: ${this.fmt(p.idea_sketch?.partners)}

Formate le document avec des sections claires : Description du projet, Produit/Service, Marché cible, Partenaires potentiels. 200-300 mots.`,
      },
      {
        key: 'problems_needs',
        title: 'Analyse des problèmes et besoins',
        sourceModels: ['problems_needs'],
        buildPrompt: (
          p,
        ) => `Rédige une analyse structurée des problèmes et besoins pour le projet "${p.name}".

DÉFIS ENVIRONNEMENTAUX: ${this.fmt(p.problems_needs?.environmental_challenges)}
DÉFIS SOCIAUX: ${this.fmt(p.problems_needs?.social_challenges)}
BESOINS CLIENTS: ${this.fmt(p.problems_needs?.customer_needs)}
MOTIVATIONS: ${this.fmt(p.problems_needs?.team_motivations)}

Document structuré avec sections : Contexte environnemental, Enjeux sociaux, Besoins du marché, Motivation de l'équipe. 200-300 mots.`,
      },
      {
        key: 'pestel',
        title: 'Rapport PESTEL',
        sourceModels: ['pestel'],
        buildPrompt: (
          p,
        ) => `Rédige un rapport PESTEL complet pour le projet "${p.name}".

Politique: ${this.fmt(p.pestel?.political_what)} — ${this.fmt(p.pestel?.political_how)}
Économique: ${this.fmt(p.pestel?.economic_what)} — ${this.fmt(p.pestel?.economic_how)}
Social: ${this.fmt(p.pestel?.social_what)} — ${this.fmt(p.pestel?.social_how)}
Technologique: ${this.fmt(p.pestel?.technological_what)} — ${this.fmt(p.pestel?.technological_how)}
Environnemental: ${this.fmt(p.pestel?.environmental_what)} — ${this.fmt(p.pestel?.environmental_how)}
Légal: ${this.fmt(p.pestel?.legal_what)} — ${this.fmt(p.pestel?.legal_how)}

Pour chaque facteur, présente l'analyse et les implications pour le projet. 300-400 mots.`,
      },
      {
        key: 'swot',
        title: 'Analyse SWOT',
        sourceModels: ['swot_analysis'],
        buildPrompt: (p) => {
          const swot = p.swot_analysis;
          if (!swot)
            return `Présente l'analyse SWOT du projet "${p.name}" en te basant sur les données disponibles. Structure : Forces, Faiblesses, Opportunités, Menaces.`;
          return `Présente l'analyse SWOT du projet "${p.name}".

FORCES: ${this.fmt(swot.strengths)}
FAIBLESSES: ${this.fmt(swot.weaknesses)}
OPPORTUNITÉS: ${this.fmt(swot.opportunities)}
MENACES: ${this.fmt(swot.threats)}

Mets en forme ce document de manière professionnelle avec des sections claires. 300-400 mots.`;
        },
      },
      {
        key: 'mission_vision',
        title: 'Mission, Vision et Valeurs',
        sourceModels: ['mission_vision'],
        buildPrompt: (
          p,
        ) => `Rédige un document structuré Mission, Vision et Valeurs pour le projet "${p.name}".

MISSION: ${this.fmt(p.mission_vision?.mission)}
VISION: ${this.fmt(p.mission_vision?.vision)}
VALEURS: ${this.fmt(p.mission_vision?.values)}

Formate de manière professionnelle. 150-250 mots.`,
      },
      {
        key: 'stakeholders',
        title: 'Cartographie des parties prenantes',
        sourceModels: ['stakeholder', 'stakeholder_map'],
        buildPrompt: (p) => {
          const stakeholders =
            p.stakeholder
              ?.map(
                (s: any) =>
                  `- ${s.name} (${s.role}): Intérêt=${this.fmt(s.interest)}, Influence=${this.fmt(s.influence)}, Stratégie=${this.fmt(s.engagement_strategy)}`,
              )
              .join('\n') || 'Aucune partie prenante définie';
          const maps =
            p.stakeholder_map
              ?.map(
                (m: any) =>
                  `- ${m.stakeholder_name}: Donne=${this.fmt(m.contribution)}, Reçoit=${this.fmt(m.reward)}`,
              )
              .join('\n') || '';
          return `Rédige une cartographie des parties prenantes pour le projet "${p.name}".

PARTIES PRENANTES:
${stakeholders}

${maps ? `RELATIONS DE DONNANT-DONNANT:\n${maps}` : ''}

Formate de manière professionnelle avec un tableau ou une liste structurée. 200-300 mots.`;
        },
      },
      {
        key: 'customer_segments',
        title: 'Analyse des segments clients',
        sourceModels: ['customer_segment'],
        buildPrompt: (p) => {
          const segments =
            p.customer_segment
              ?.map(
                (c: any) =>
                  `- Segment "${c.segment_name}": ${this.fmt(c.description)} | Douleurs: ${this.fmt(c.pains)} | Gains: ${this.fmt(c.gains)} | Besoins: ${this.fmt(c.functions)}`,
              )
              .join('\n\n') || 'Aucun segment défini';
          return `Rédige une analyse détaillée des segments clients pour le projet "${p.name}".

SEGMENTS:
${segments}

Formate de manière professionnelle. 200-300 mots.`;
        },
      },
      {
        key: 'value_proposition',
        title: 'Proposition de valeur',
        sourceModels: ['value_proposition', 'value_proposition_pivot'],
        buildPrompt: (p) => {
          const vp = p.value_proposition;
          const pivot = p.value_proposition_pivot;
          return `Rédige une proposition de valeur détaillée pour le projet "${p.name}".

VALEUR ENVIRONNEMENTALE: ${this.fmt(vp?.environmental_value)}
VALEUR SOCIALE: ${this.fmt(vp?.social_value)}
SOULAGEMENT DES DOULEURS: ${this.fmt(vp?.pain_relievers)}
CRÉATEURS DE GAINS: ${this.fmt(vp?.gain_creators)}
PRODUITS/SERVICES: ${this.fmt(vp?.products_services)}
VALEUR AJOUTÉE: ${this.fmt(vp?.value_added)}
INNOVATION: ${this.fmt(vp?.innovation_value)}
${pivot?.new_value_proposition ? `\nNOUVELLE PROPOSITION (PIVOT): ${this.fmt(pivot.new_value_proposition)}` : ''}

Formate de manière professionnelle. 200-300 mots.`;
        },
      },
      {
        key: 'test_reports',
        title: 'Rapport des tests terrain',
        sourceModels: ['test_discovery'],
        buildPrompt: (p) => {
          const tests =
            p.test_discovery
              ?.map(
                (t: any) =>
                  `- Hypothèse: ${this.fmt(t.hypothesis)}\n  Méthode: ${this.fmt(t.test_method)}\n  Résultats: ${this.fmt(t.results)}\n  Apprentissages: ${this.fmt(t.learnings)}\n  Validé: ${t.validated ? 'Oui' : 'Non'}`,
              )
              .join('\n\n') || 'Aucun test effectué';
          return `Rédige un rapport des tests terrain pour le projet "${p.name}".

TESTS EFFECTUÉS:
${tests}

Synthétise les apprentissages clés et recommandations. 200-300 mots.`;
        },
      },
      {
        key: 'customer_journey',
        title: 'Cartographie du parcours client',
        sourceModels: ['customer_journey', 'customer_relations_channel'],
        buildPrompt: (p) => {
          const journey =
            p.customer_journey
              ?.map(
                (j: any) =>
                  `- Étape "${j.stage_name}": Contact=${this.fmt(j.touchpoints)}, Émotion=${this.fmt(j.customer_emotions)}, Amélioration=${this.fmt(j.improvement_ideas)}`,
              )
              .join('\n') || 'Aucun parcours défini';
          const crc = p.customer_relations_channel;
          return `Rédige une cartographie du parcours client pour le projet "${p.name}".

RELATIONS CLIENTS: ${this.fmt(crc?.customer_relationships)}
CANAUX: ${this.fmt(crc?.channels)}
DISTRIBUTION: ${this.fmt(crc?.distribution_strategy)}

PARCOURS CLIENT:
${journey}

Formate de manière professionnelle. 200-300 mots.`;
        },
      },
      {
        key: 'gbm_canvas',
        title: 'Green Business Model Canvas final',
        sourceModels: [
          'idea_sketch',
          'value_proposition',
          'customer_segment',
          'cost_structure',
          'revenue_stream',
          'key_activities_resource',
          'stakeholder',
        ],
        buildPrompt: (
          p,
        ) => `Rédige un Green Business Model Canvas synthétique pour le projet "${p.name}".

SEGMENTS CLIENTS: ${p.customer_segment?.map((c: any) => c.segment_name).join(', ') || this.fmt(p.idea_sketch?.customers)}
PROPOSITION DE VALEUR: ${this.fmt(p.value_proposition?.value_added)}
CANAUX: ${this.fmt(p.customer_relations_channel?.channels)}
RELATIONS CLIENTS: ${this.fmt(p.customer_relations_channel?.customer_relationships)}
SOURCES DE REVENUS: ${this.fmt(p.revenue_stream?.revenue_sources)}
ACTIVITÉS CLÉS: ${this.fmt(p.key_activities_resource?.key_activities)}
RESSOURCES CLÉS: ${this.fmt(p.key_activities_resource?.key_resources)}
PARTENAIRES: ${p.stakeholder?.map((s: any) => s.name).join(', ') || this.fmt(p.key_activities_resource?.strategic_partners)}
COÛTS FIXES: ${this.fmt(p.cost_structure?.fixed_costs)}
COÛTS VARIABLES: ${this.fmt(p.cost_structure?.variable_costs)}

Présente le canevas complet avec les 9 blocs. 300-400 mots.`,
      },
      {
        key: 'management_plan',
        title: 'Plan de gestion',
        sourceModels: ['management_plan'],
        buildPrompt: (p) => {
          const mp = p.management_plan;
          if (!mp)
            return `Rédige un plan de gestion pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un plan de gestion structuré pour le projet "${p.name}".

PROBLÈMES DE GESTION: ${this.fmt(mp.problemes_gestion)}
RESSOURCES HUMAINES: ${this.fmt(mp.ressources_humaines)}
ACTIFS PHYSIQUES: ${this.fmt(mp.actifs_physiques)}
RESSOURCES INTELLECTUELLES: ${this.fmt(mp.ressources_intellectuelles)}
PRODUCTION & FOURNISSEURS: ${this.fmt(mp.production_fournisseurs)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'marketing_plan',
        title: 'Plan marketing',
        sourceModels: ['marketing_plan'],
        buildPrompt: (p) => {
          const mp = p.marketing_plan;
          if (!mp)
            return `Rédige un plan marketing pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un plan marketing structuré pour le projet "${p.name}".

CLIENTS & VALEUR: ${this.fmt(mp.clients_valeur)}
ANALYSE MARCHÉ: ${this.fmt(mp.analyse_marche)}
CONCURRENTS: ${this.fmt(mp.concurrents)}
OFFRE & PRIX: ${this.fmt(mp.offre_prix)}
BRANDING & POSITIONNEMENT: ${this.fmt(mp.branding_positionnement)}
CANAUX DE COMMUNICATION: ${this.fmt(mp.canaux_communication)}
RELATION CLIENT: ${this.fmt(mp.relation_client)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'financial_plan',
        title: 'Plan financier',
        sourceModels: ['financial_plan'],
        buildPrompt: (p) => {
          const fp = p.financial_plan;
          if (!fp)
            return `Rédige un plan financier pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un plan financier structuré pour le projet "${p.name}".

POINT DE DÉPART: ${this.fmt(fp.point_depart)}
COÛTS DE CONFIGURATION: ${fp.couts_configuration || 'Non défini'}
CAPITAL: ${fp.capital || 'Non défini'}
SEUIL DE RENTABILITÉ: ${fp.seuil_rentabilite || 'Non défini'}
AUTRES MESURES: ${this.fmt(fp.autres_mesures)}
RAPPORT FINANCIER: ${this.fmt(fp.rapport_financier)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'legal_plan',
        title: 'Plan juridique',
        sourceModels: ['legal_plan'],
        buildPrompt: (p) => {
          const lp = p.legal_plan;
          if (!lp)
            return `Rédige un plan juridique pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un plan juridique structuré pour le projet "${p.name}".

STATUT JURIDIQUE: ${this.fmt(lp.statut_juridique)}
IMMATRICULATION: ${this.fmt(lp.immatriculation)}
CONTRATS: ${this.fmt(lp.contrats)}
ASSURANCES: ${this.fmt(lp.assurances)}

Formate de manière professionnelle. 200-300 mots.`;
        },
      },
      {
        key: 'kpi_plan',
        title: 'Plan des KPIs',
        sourceModels: ['kpi'],
        buildPrompt: (p) => {
          const kpi = p.kpi;
          if (!kpi)
            return `Rédige un plan de KPIs pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un plan de KPIs structuré pour le projet "${p.name}".

KPIs: ${typeof kpi.kpis === 'object' ? JSON.stringify(kpi.kpis) : this.fmt(kpi.kpis)}
OBJECTIFS DE MESURE: ${this.fmt(kpi.objectifs_mesure)}
REVUES DE PERFORMANCE: ${this.fmt(kpi.revues_performance)}

Formate de manière professionnelle. 200-300 mots.`;
        },
      },
      {
        key: 'executive_summary',
        title: 'Résumé exécutif',
        sourceModels: [
          'executive_summary',
          'context_summary',
          'mission_vision',
          'cost_revenue_summary',
          'impact_measure',
        ],
        buildPrompt: (p) => {
          const es = p.executive_summary;
          if (es?.resume_executif)
            return `Mets en forme le résumé exécutif du projet "${p.name}" :\n\n${es.resume_executif}\n\nFormate de manière professionnelle pour des investisseurs.`;
          return `Rédige un résumé exécutif (executive summary) pour investisseurs pour le projet "${p.name}".

CONTEXTE: ${this.fmt(p.context_summary?.summary_text)}
MISSION: ${this.fmt(p.mission_vision?.mission)}
VALEUR AJOUTÉE: ${this.fmt(p.value_proposition?.value_added)}
RÉSUMÉ FINANCIER: ${this.fmt(p.cost_revenue_summary?.cost_summary)}
SANTÉ FINANCIÈRE: ${this.fmt(p.cost_revenue_summary?.financial_health)}
IMPACT: ${this.fmt(p.impact_measure?.rapport_impact)}

Rédige un executive summary professionnel de 400-500 mots pour des investisseurs.`;
        },
      },
      {
        key: 'eco_design_report',
        title: "Rapport d'éco-conception",
        sourceModels: ['eco_design', 'eco_design_result'],
        buildPrompt: (p) => {
          const ed = p.eco_design;
          const edr = p.eco_design_result;
          if (!ed && !edr)
            return `Rédige un rapport d'éco-conception pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un rapport d'éco-conception détaillé pour le projet "${p.name}".

ÉQUIPE ÉCO-CONCEPTION: ${this.fmt(ed?.equipe_eco)}
PROJET (CYCLE DE VIE): ${this.fmt(ed?.projet_eco)}
CONTEXTE ENVIRONNEMENTAL: ${this.fmt(ed?.contexte_eco)}
VISION DURABLE: ${this.fmt(ed?.vision_durable)}
RÉSULTATS: ${this.fmt(edr?.eco_results)}
ANALYSE DE PERFORMANCE: ${this.fmt(edr?.performance_analysis)}
AMÉLIORATIONS: ${this.fmt(edr?.improvements)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'funding_dossier',
        title: 'Dossier de financement',
        sourceModels: ['funding_assessment'],
        buildPrompt: (p) => {
          const fa = p.funding_assessment;
          if (!fa)
            return `Rédige un dossier de financement pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un dossier de financement structuré pour le projet "${p.name}".

SCORE DE MATURITÉ: ${fa.score_maturite || 'Non évalué'}
PHASE DE MATURITÉ: ${fa.phase_maturite || 'Non définie'}
OPPORTUNITÉS DE FINANCEMENT: ${typeof fa.opportunites_financement === 'object' ? JSON.stringify(fa.opportunites_financement) : this.fmt(fa.opportunites_financement)}
OPPORTUNITÉS PAR PAYS: ${this.fmt(fa.opportunites_pays)}
STRATÉGIE DE LEVÉE DE FONDS: ${this.fmt(fa.strategie_levee_fonds)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'market_strategy',
        title: "Stratégie d'accès au marché",
        sourceModels: ['market_access'],
        buildPrompt: (p) => {
          const ma = p.market_access;
          if (!ma)
            return `Rédige une stratégie d'accès au marché pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige une stratégie d'accès au marché structurée pour le projet "${p.name}".

ESSENCE DE LA MARQUE: ${this.fmt(ma.essence_marque)}
ALIGNEMENT DES OBJECTIFS: ${this.fmt(ma.alignement_objectifs)}
POSITIONNEMENT: ${this.fmt(ma.positionnement)}
IDENTITÉ VISUELLE: ${this.fmt(ma.identite_visuelle)}
NARRATION: ${this.fmt(ma.narration)}
MESSAGES CLÉS: ${typeof ma.messages_cles === 'object' ? JSON.stringify(ma.messages_cles) : this.fmt(ma.messages_cles)}
CANAUX MARKETING: ${typeof ma.canaux_marketing === 'object' ? JSON.stringify(ma.canaux_marketing) : this.fmt(ma.canaux_marketing)}
PARTENARIATS: ${typeof ma.partenariats_market === 'object' ? JSON.stringify(ma.partenariats_market) : this.fmt(ma.partenariats_market)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
      {
        key: 'impact_report',
        title: "Rapport d'impact durable",
        sourceModels: ['impact_measure'],
        buildPrompt: (p) => {
          const im = p.impact_measure;
          if (!im)
            return `Rédige un rapport d'impact durable pour le projet "${p.name}" en te basant sur les données disponibles.`;
          return `Rédige un rapport d'impact durable structuré pour le projet "${p.name}".

KPIs ENVIRONNEMENTAUX: ${typeof im.kpis_environnementaux === 'object' ? JSON.stringify(im.kpis_environnementaux) : this.fmt(im.kpis_environnementaux)}
KPIs SOCIAUX: ${typeof im.kpis_sociaux === 'object' ? JSON.stringify(im.kpis_sociaux) : this.fmt(im.kpis_sociaux)}
KPIs ÉCONOMIQUES: ${typeof im.kpis_economiques === 'object' ? JSON.stringify(im.kpis_economiques) : this.fmt(im.kpis_economiques)}
MÉTHODE DE MESURE: ${this.fmt(im.methode_mesure)}
PÉRIODE: ${im.periode_mesure || 'Non définie'}
OBJECTIFS D'IMPACT: ${typeof im.objectifs_impact === 'object' ? JSON.stringify(im.objectifs_impact) : this.fmt(im.objectifs_impact)}
RÉSULTATS ACTUELS: ${typeof im.resultats_actuels === 'object' ? JSON.stringify(im.resultats_actuels) : this.fmt(im.resultats_actuels)}
RAPPORT: ${this.fmt(im.rapport_impact)}

Formate de manière professionnelle. 300-400 mots.`;
        },
      },
    ];
  }

  getDocumentConfig(key: string): DocumentPromptConfig | undefined {
    return this.getDocumentConfigs().find((c) => c.key === key);
  }
}
