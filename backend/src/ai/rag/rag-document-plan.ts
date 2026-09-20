import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Un document source indexable du projet. */
export interface RagDocumentSource {
  /** Clé stable et déterministe (ex: gbm1.idea_initial). */
  key: string;
  module: string;
  section: string;
  source: string;
  language: string;
  /** Numéro de page/étape éventuel (facultatif). */
  page?: number;
  /** Contenu brut à découper en chunks. */
  content: string;
}

interface ProjectWithRag {
  id: string;
  idea_sketch: Record<string, any> | null;
  problems_needs: Record<string, any> | null;
  pestel: Record<string, any> | null;
  objective: Record<string, any> | null;
  mission_vision: Record<string, any> | null;
  context_summary: Record<string, any> | null;
  value_proposition: Record<string, any> | null;
  key_activities_resource: Record<string, any> | null;
  eco_design: Record<string, any> | null;
  cost_structure: Record<string, any> | null;
  revenue_stream: Record<string, any> | null;
  cost_revenue_summary: Record<string, any> | null;
  summary_activity: Record<string, any> | null;
  executive_summary: Record<string, any> | null;
  impact_measure: Record<string, any> | null;
  swot_analysis: Record<string, any> | null;
  management_plan: Record<string, any> | null;
  marketing_plan: Record<string, any> | null;
  financial_plan: Record<string, any> | null;
  generated_documents: {
    document_key: string;
    title: string;
    content: string | null;
  }[];
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

/**
 * Construit le plan de documents RAG d'un projet : l'ensemble des sections
 * textuelles indexables, chacune avec ses métadonnées (module/section/source).
 * Complète les données structurées (ProjectContextBuilder) — ne les remplace pas.
 */
@Injectable()
export class RagDocumentPlanBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async build(
    projectId: string,
  ): Promise<{ projectId: string; sources: RagDocumentSource[] }> {
    const project = (await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea_sketch: true,
        problems_needs: true,
        pestel: true,
        objective: true,
        mission_vision: true,
        context_summary: true,
        value_proposition: true,
        key_activities_resource: true,
        eco_design: true,
        cost_structure: true,
        revenue_stream: true,
        cost_revenue_summary: true,
        summary_activity: true,
        executive_summary: true,
        impact_measure: true,
        swot_analysis: true,
        management_plan: true,
        marketing_plan: true,
        financial_plan: true,
        generated_documents: {
          select: { document_key: true, title: true, content: true },
        },
      },
    })) as unknown as ProjectWithRag | null;

    if (!project) {
      return { projectId, sources: [] };
    }

    const gbm = project.idea_sketch ?? {};
    const sources: RagDocumentSource[] = [];
    const add = (
      key: string,
      module: string,
      section: string,
      source: string,
      content: string,
      page?: number,
    ) => {
      const clean = (content ?? '').trim();
      if (clean.length < 10) return;
      sources.push({
        key,
        module,
        section,
        source,
        language: 'fr',
        ...(page !== undefined ? { page } : {}),
        content: clean,
      });
    };

    // ————— GBM — Phase 1 : le porteur, son idée, sa problématique —————
    add(
      'gbm1.idea_initial',
      'gbm',
      'idée initiale',
      'idea_sketch',
      str(gbm.idea_initial),
      1,
    );
    add(
      'gbm1.product_service',
      'gbm',
      'produit/service',
      'idea_sketch',
      str(gbm.product_service),
      1,
    );
    add(
      'gbm1.customers',
      'gbm',
      'clients cibles',
      'idea_sketch',
      str(gbm.customers),
      1,
    );
    add(
      'gbm1.partners',
      'gbm',
      'partenaires',
      'idea_sketch',
      str(gbm.partners),
      1,
    );

    const pn = project.problems_needs ?? {};
    add(
      'gbm2.environmental',
      'gbm',
      'défis environnementaux',
      'problems_needs',
      str(pn.environmental_challenges),
      2,
    );
    add(
      'gbm2.social',
      'gbm',
      'défis sociaux',
      'problems_needs',
      str(pn.social_challenges),
      2,
    );
    add(
      'gbm2.needs',
      'gbm',
      'besoins clients',
      'problems_needs',
      str(pn.customer_needs),
      2,
    );
    add(
      'gbm2.team',
      'gbm',
      'motivations équipe',
      'problems_needs',
      str(pn.team_motivations),
      2,
    );

    const pestel = project.pestel ?? {};
    const pestelSections: [string, string][] = [
      ['political', 'Politique'],
      ['economic', 'Économique'],
      ['social', 'Social'],
      ['technological', 'Technologique'],
      ['environmental', 'Environnemental'],
      ['legal', 'Légal'],
    ];
    for (const [axis, label] of pestelSections) {
      const what = str((pestel as any)[`${axis}_what`]);
      const how = str((pestel as any)[`${axis}_how`]);
      if (what || how) {
        add(
          `gbm3.${axis}`,
          'gbm',
          `PESTEL ${label}`,
          'pestel',
          `Facteur ${label} : ${what} ${how}`,
          3,
        );
      }
    }

    const obj = project.objective ?? {};
    add(
      'gbm4.env_objectives',
      'gbm',
      'objectifs environnementaux',
      'objective',
      str(obj.environmental_objectives),
      4,
    );
    add(
      'gbm4.env_problems',
      'gbm',
      'problèmes environnementaux',
      'objective',
      str(obj.environmental_problems),
      4,
    );
    add(
      'gbm4.social_objectives',
      'gbm',
      'objectifs sociaux',
      'objective',
      str(obj.social_objectives),
      4,
    );
    add(
      'gbm4.social_problems',
      'gbm',
      'problèmes sociaux',
      'objective',
      str(obj.social_problems),
      4,
    );
    add(
      'gbm4.customer_objectives',
      'gbm',
      'objectifs clients',
      'objective',
      str(obj.customer_objectives),
      4,
    );
    add(
      'gbm4.team_objectives',
      'gbm',
      'objectifs équipe',
      'objective',
      str(obj.team_objectives),
      4,
    );

    const mv = project.mission_vision ?? {};
    add('gbm5.mission', 'gbm', 'mission', 'mission_vision', str(mv.mission), 5);
    add('gbm5.vision', 'gbm', 'vision', 'mission_vision', str(mv.vision), 5);
    add('gbm5.values', 'gbm', 'valeurs', 'mission_vision', str(mv.values), 5);

    const cs = project.context_summary ?? {};
    add(
      'gbm6.context',
      'gbm',
      'résumé du contexte',
      'context_summary',
      str(cs.summary_text),
      6,
    );

    const vp = project.value_proposition ?? {};
    add(
      'gbm7.value_added',
      'gbm',
      'proposition de valeur',
      'value_proposition',
      str(vp.value_added),
      7,
    );
    add(
      'gbm7.environmental_value',
      'gbm',
      'valeur environnementale',
      'value_proposition',
      str(vp.environmental_value),
      7,
    );
    add(
      'gbm7.social_value',
      'gbm',
      'valeur sociale',
      'value_proposition',
      str(vp.social_value),
      7,
    );
    add(
      'gbm7.innovation',
      'gbm',
      "valeur d'innovation",
      'value_proposition',
      str(vp.innovation_value),
      7,
    );

    const kar = project.key_activities_resource ?? {};
    add(
      'gbm8.key_activities',
      'gbm',
      'activités clés',
      'key_activities_resource',
      str(kar.key_activities),
      8,
    );
    add(
      'gbm8.key_resources',
      'gbm',
      'ressources clés',
      'key_activities_resource',
      str(kar.key_resources),
      8,
    );
    add(
      'gbm8.strategic_partners',
      'gbm',
      'partenaires stratégiques',
      'key_activities_resource',
      str(kar.strategic_partners),
      8,
    );

    const eco = project.eco_design ?? {};
    add(
      'gbm9.eco_design',
      'gbm',
      'écoconception du projet',
      'eco_design',
      str(eco.projet_eco),
      9,
    );
    add(
      'gbm9.eco_team',
      'gbm',
      'équipe écoconception',
      'eco_design',
      str(eco.equipe_eco),
      9,
    );
    add(
      'gbm9.eco_contexte',
      'gbm',
      'contexte écoconception',
      'eco_design',
      str(eco.contexte_eco),
      9,
    );
    add(
      'gbm9.vision_durable',
      'gbm',
      'vision durable',
      'eco_design',
      str(eco.vision_durable),
      9,
    );

    const cost = project.cost_structure ?? {};
    add(
      'gbm10.fixed_costs',
      'gbm',
      'coûts fixes',
      'cost_structure',
      str(cost.fixed_costs),
      10,
    );
    add(
      'gbm10.variable_costs',
      'gbm',
      'coûts variables',
      'cost_structure',
      str(cost.variable_costs),
      10,
    );
    add(
      'gbm10.cost_drivers',
      'gbm',
      'facteurs de coûts',
      'cost_structure',
      str(cost.cost_drivers),
      10,
    );
    add(
      'gbm10.breakeven',
      'gbm',
      'point mort',
      'cost_structure',
      str(cost.breakeven_analysis),
      10,
    );

    const rev = project.revenue_stream ?? {};
    add(
      'gbm11.revenue_sources',
      'gbm',
      'sources de revenus',
      'revenue_stream',
      str(rev.revenue_sources),
      11,
    );
    add(
      'gbm11.pricing',
      'gbm',
      'stratégie de prix',
      'revenue_stream',
      str(rev.pricing_strategy),
      11,
    );
    add(
      'gbm11.revenue_projections',
      'gbm',
      'projections de revenus',
      'revenue_stream',
      str(rev.revenue_projections),
      11,
    );

    const summary = project.summary_activity ?? {};
    add(
      'gbm12.activities',
      'gbm',
      'résumé des activités',
      'summary_activity',
      str(summary.activities_summary),
      12,
    );
    add(
      'gbm12.achievements',
      'gbm',
      'réalisations clés',
      'summary_activity',
      str(summary.key_achievements),
      12,
    );
    add(
      'gbm12.next_steps',
      'gbm',
      'prochaines étapes',
      'summary_activity',
      str(summary.next_steps),
      12,
    );

    const crs = project.cost_revenue_summary ?? {};
    add(
      'gbm13.cost_summary',
      'gbm',
      'résumé des coûts',
      'cost_revenue_summary',
      str(crs.cost_summary),
      13,
    );
    add(
      'gbm13.revenue_summary',
      'gbm',
      'résumé des revenus',
      'cost_revenue_summary',
      str(crs.revenue_summary),
      13,
    );
    add(
      'gbm13.health',
      'gbm',
      'santé financière',
      'cost_revenue_summary',
      str(crs.financial_health),
      13,
    );

    // ————— Business Plan —————
    const mgmt = project.management_plan ?? {};
    add(
      'bp.management',
      'business_plan',
      'plan de gestion',
      'management_plan',
      str(mgmt.ressources_humaines),
      14,
    );

    const mkt = project.marketing_plan ?? {};
    add(
      'bp.market_analysis',
      'business_plan',
      'analyse de marché',
      'marketing_plan',
      str(mkt.analyse_marche),
      15,
    );
    add(
      'bp.competition',
      'business_plan',
      'concurrents',
      'marketing_plan',
      str(mkt.concurrents),
      15,
    );
    add(
      'bp.offer_price',
      'business_plan',
      'offre et prix',
      'marketing_plan',
      str(mkt.offre_prix),
      15,
    );

    const fin = project.financial_plan ?? {};
    add(
      'bp.financial',
      'business_plan',
      'plan financier',
      'financial_plan',
      str(fin.rapport_financier),
      16,
    );

    const exe = project.executive_summary ?? {};
    add(
      'bp.executive',
      'business_plan',
      'résumé exécutif',
      'executive_summary',
      str(exe.resume_executif),
      1,
    );

    const impact = project.impact_measure ?? {};
    add(
      'impact.report',
      'impact',
      "rapport d'impact",
      'impact_measure',
      str(impact.rapport_impact),
      1,
    );
    add(
      'impact.method',
      'impact',
      'méthode de mesure',
      'impact_measure',
      str(impact.methode_mesure),
      1,
    );
    add(
      'impact.kpis_env',
      'impact',
      'KPIs environnementaux',
      'impact_measure',
      str(impact.kpis_environnementaux || impact.kpis_sociaux),
      1,
    );

    const swot = project.swot_analysis ?? {};
    add(
      'swot.strengths',
      'swot',
      'forces',
      'swot_analysis',
      str(swot.strengths),
      1,
    );
    add(
      'swot.weaknesses',
      'swot',
      'faiblesses',
      'swot_analysis',
      str(swot.weaknesses),
      1,
    );
    add(
      'swot.opportunities',
      'swot',
      'opportunités',
      'swot_analysis',
      str(swot.opportunities),
      1,
    );
    add(
      'swot.threats',
      'swot',
      'menaces',
      'swot_analysis',
      str(swot.threats),
      1,
    );

    // ————— Documents générés —————
    for (const doc of project.generated_documents ?? []) {
      if (doc?.content) {
        add(
          `generated.${doc.document_key}`,
          'documents',
          doc.title || doc.document_key,
          'generated_documents',
          doc.content,
        );
      }
    }

    return { projectId, sources };
  }
}
