import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SectionStepService } from './section-step.service';

/**
 * Interfaces publiques du contexte projet.
 */
export interface PrefillField {
  value: any;
  /** Nom technique de la source (ex: KeyActivitiesResource) */
  sourceModule: string;
  /** Libellé lisible de la source (ex: "Activités et ressources") */
  sourceLabel: string;
  /** Aperçu court de la donnée source */
  preview: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  status: 'ok' | 'missing';
  /** Provenance du statut (d'où provient la donnée qui comble le besoin) */
  sourceLabel?: string;
}

export interface PrefillResult {
  module: string;
  fields: Record<string, PrefillField>;
  /** Informations importantes encore absentes du projet */
  missing?: ChecklistItem[];
  /** Liste complète des contrôles (✅ / ⚠️) pour l'affichage */
  checklist: ChecklistItem[];
  /** Calculs déterministes côté backend (jamais inventés par l'IA) */
  computed?: Record<string, any>;
  /** Réponses suggérées au questionnaire de financement (déterministes) */
  suggestions?: Record<string, { value: boolean; reason: string }>;
}

const CONTEXT_INCLUDE = {
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
  test_discovery: true,
  value_proposition_pivot: true,
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
} as const;

const METADATA_KEYS = new Set([
  'id',
  'project_id',
  'created_at',
  'updated_at',
  'completed_at',
  'generated_at',
]);

/**
 * Service de contexte projet : unique point d'entrée qui agrège toutes les
 * informations d'un projet et alimente le préremplissage intelligent des modules.
 *
 * Principe : une information a UNE seule source principale. Les modules
 * réutilisent cette source plutôt que de la ressaisir.
 */
@Injectable()
export class ProjectContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sections: SectionStepService,
  ) {}

  /**
   * Récupère le contexte complet d'un projet en une seule requête.
   * Les métadonnées techniques (id, timestamps…) sont retirées.
   */
  async getFullContext(projectId: string): Promise<Record<string, any>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: CONTEXT_INCLUDE,
    });

    if (!project) {
      throw new BadRequestException(`Projet introuvable: ${projectId}`);
    }

    return this.sanitize(project);
  }

  /**
   * Récupère le préremplissage intelligent pour un module donné.
   * @param module management | marketing | financial | eco-design | impact | market | funding
   */
  async getPrefill(
    projectId: string,
    module: string,
    userId: string,
  ): Promise<PrefillResult> {
    await this.sections.ensureOwnership(projectId, userId);
    const context = await this.getFullContext(projectId);

    const builders: Record<string, () => Omit<PrefillResult, 'module'>> = {
      management: () => this.buildManagement(context),
      marketing: () => this.buildMarketing(context),
      financial: () => this.buildFinancial(context),
      legal: () => this.buildLegal(context),
      kpis: () => this.buildKpi(context),
      'eco-design': () => this.buildEcoDesign(context),
      impact: () => this.buildImpact(context),
      market: () => this.buildMarket(context),
      funding: () => this.buildFunding(context),
    };

    const builder = builders[module];
    if (!builder) {
      throw new BadRequestException(
        `Module inconnu: ${module}. Modules disponibles: ${Object.keys(builders).join(', ')}`,
      );
    }

    const result = builder();
    const checklist = result.checklist ?? [];
    result.missing = checklist.filter((item) => item.status === 'missing');
    return { module, ...result };
  }

  // ============================================================
  // HELPERS DE FORMATAGE
  // ============================================================

  private sanitize(value: any): any {
    if (Array.isArray(value)) return value.map((v) => this.sanitize(v));
    if (value && typeof value === 'object') {
      const out: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        if (METADATA_KEYS.has(key)) continue;
        out[key] = this.sanitize(value[key]);
      }
      return out;
    }
    return value;
  }

  private has(record: any, keys: string[]): boolean {
    if (!record || typeof record !== 'object') return false;
    return keys.some((k) => {
      const v = record[k];
      return (
        v !== undefined &&
        v !== null &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0)
      );
    });
  }

  private join(...parts: Array<string | null | undefined>): string {
    return parts.filter((p) => p && String(p).trim()).join('\n\n');
  }

  private listToText(items: any[], fmt: (item: any) => string): string {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items
      .map((i) => fmt(i))
      .filter(Boolean)
      .join('\n');
  }

  private short(text: any, max = 140): string {
    if (text === null || text === undefined) return '';
    const s = typeof text === 'string' ? text : JSON.stringify(text);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  }

  private field(
    value: any,
    sourceModule: string,
    sourceLabel: string,
    previewText?: string,
  ): PrefillField {
    const preview = previewText ?? this.short(value);
    return { value, sourceModule, sourceLabel, preview };
  }

  private checklistFor(context: any, module: string): ChecklistItem[] {
    const { idea_sketch, problems_needs, objective, pestel } = context;
    const {
      customer_segment,
      value_proposition,
      key_activities_resource,
      stakeholder,
    } = context;
    const {
      cost_structure,
      revenue_stream,
      eco_design,
      eco_design_result,
      indicator,
    } = context;
    const { management_plan, financial_plan, legal_plan, kpi } = context;
    const { market_access, impact_measure } = context;

    const items: Array<{
      key: string;
      label: string;
      ok: boolean;
      sourceLabel?: string;
    }> = [];

    switch (module) {
      case 'management':
        items.push(
          {
            key: 'clients',
            label: 'Clients',
            ok:
              customer_segment.length > 0 ||
              this.has(idea_sketch, ['customers']),
            sourceLabel: 'Segments clients',
          },
          {
            key: 'proposition_valeur',
            label: 'Proposition de valeur',
            ok: this.has(value_proposition, [
              'environmental_value',
              'social_value',
              'value_added',
              'products_services',
            ]),
            sourceLabel: 'Proposition de valeur',
          },
          {
            key: 'activites',
            label: 'Activités',
            ok: this.has(key_activities_resource, ['key_activities']),
            sourceLabel: 'Activités et ressources',
          },
          {
            key: 'fournisseurs',
            label: 'Fournisseurs / partenaires',
            ok:
              this.has(key_activities_resource, ['strategic_partners']) ||
              stakeholder.length > 0,
            sourceLabel: 'Parties prenantes',
          },
          {
            key: 'ressources_humaines',
            label: 'Ressources humaines',
            ok:
              this.has(management_plan, ['ressources_humaines']) ||
              this.has(key_activities_resource, ['key_resources']) ||
              stakeholder.length > 0,
            sourceLabel: 'Activités et ressources',
          },
          {
            key: 'cout',
            label: 'Coûts',
            ok: this.has(cost_structure, ['fixed_costs', 'variable_costs']),
            sourceLabel: 'Structure des coûts',
          },
          {
            key: 'previsions_financieres',
            label: 'Prévisions financières',
            ok:
              this.has(financial_plan, ['point_depart', 'capital']) ||
              this.has(revenue_stream, ['revenue_projections']),
            sourceLabel: 'Plan financier',
          },
          {
            key: 'strategie_juridique',
            label: 'Stratégie juridique',
            ok: this.has(legal_plan, ['statut_juridique']),
            sourceLabel: 'Plan juridique',
          },
        );
        break;

      case 'marketing':
        items.push(
          {
            key: 'clients',
            label: 'Clients',
            ok: customer_segment.length > 0,
            sourceLabel: 'Segments clients',
          },
          {
            key: 'proposition_valeur',
            label: 'Proposition de valeur',
            ok: this.has(value_proposition, [
              'environmental_value',
              'social_value',
              'value_added',
              'products_services',
            ]),
            sourceLabel: 'Proposition de valeur',
          },
          {
            key: 'marche',
            label: 'Analyse du marché',
            ok: this.has(pestel, [
              'economic_what',
              'social_what',
              'technological_what',
            ]),
            sourceLabel: 'PESTEL',
          },
          {
            key: 'canaux',
            label: 'Canaux et distribution',
            ok: this.has(context.customer_relations_channel, [
              'channels',
              'distribution_strategy',
            ]),
            sourceLabel: 'Relations clients et canaux',
          },
          {
            key: 'parcours_client',
            label: 'Parcours client',
            ok: context.customer_journey.length > 0,
            sourceLabel: 'Parcours client',
          },
          {
            key: 'tests',
            label: 'Validation par les tests',
            ok: context.test_discovery.length > 0,
            sourceLabel: 'Test de la proposition de valeur',
          },
        );
        break;

      case 'financial':
        items.push(
          {
            key: 'cout',
            label: 'Coûts',
            ok: this.has(cost_structure, [
              'fixed_costs',
              'variable_costs',
              'cost_drivers',
            ]),
            sourceLabel: 'Structure des coûts',
          },
          {
            key: 'revenus',
            label: 'Revenus',
            ok: this.has(revenue_stream, [
              'revenue_sources',
              'pricing_strategy',
              'revenue_projections',
            ]),
            sourceLabel: 'Flux de revenus',
          },
          {
            key: 'activites',
            label: 'Activités',
            ok: this.has(key_activities_resource, ['key_activities']),
            sourceLabel: 'Activités et ressources',
          },
          {
            key: 'seuil_rentabilite',
            label: 'Seuil de rentabilité',
            ok:
              this.has(financial_plan, ['seuil_rentabilite', 'point_depart']) ||
              this.has(cost_structure, ['breakeven_analysis']),
            sourceLabel: 'Structure des coûts',
          },
          {
            key: 'impact_eco',
            label: 'Impact / éco-conception',
            ok:
              this.has(eco_design, ['vision_durable']) ||
              this.has(eco_design_result, ['eco_results']),
            sourceLabel: 'Éco-conception',
          },
        );
        break;

      case 'eco-design':
        items.push(
          {
            key: 'problemes_env',
            label: 'Problèmes environnementaux',
            ok:
              this.has(problems_needs, ['environmental_challenges']) ||
              this.has(objective, ['environmental_problems']),
            sourceLabel: 'Problèmes et besoins',
          },
          {
            key: 'objectifs_env',
            label: 'Objectifs environnementaux',
            ok: this.has(objective, ['environmental_objectives']),
            sourceLabel: 'Objectifs',
          },
          {
            key: 'proposition_valeur',
            label: 'Proposition de valeur',
            ok: this.has(value_proposition, [
              'environmental_value',
              'social_value',
            ]),
            sourceLabel: 'Proposition de valeur',
          },
          {
            key: 'activites',
            label: 'Activités et ressources',
            ok: this.has(key_activities_resource, [
              'key_activities',
              'key_resources',
            ]),
            sourceLabel: 'Activités et ressources',
          },
          {
            key: 'parties_prenantes',
            label: 'Parties prenantes',
            ok: stakeholder.length > 0,
            sourceLabel: 'Parties prenantes',
          },
          {
            key: 'cout',
            label: 'Coûts',
            ok: this.has(cost_structure, ['fixed_costs', 'variable_costs']),
            sourceLabel: 'Structure des coûts',
          },
          {
            key: 'vision_durable',
            label: 'Vision durable',
            ok: this.has(eco_design, ['vision_durable']),
            sourceLabel: 'Éco-conception',
          },
        );
        break;

      case 'impact':
        items.push(
          {
            key: 'objectifs',
            label: 'Objectifs',
            ok: this.has(objective, [
              'environmental_objectives',
              'social_objectives',
              'customer_objectives',
            ]),
            sourceLabel: 'Objectifs',
          },
          {
            key: 'kpis',
            label: 'KPIs / indicateurs',
            ok: this.has(indicator, [
              'environmental_kpis',
              'social_kpis',
              'economic_kpis',
            ]),
            sourceLabel: 'Indicateurs (GBM)',
          },
          {
            key: 'resultats_eco',
            label: 'Résultats éco-conception',
            ok: this.has(eco_design_result, ['eco_results', 'improvements']),
            sourceLabel: 'Résultats de l’éco-conception',
          },
          {
            key: 'mesure',
            label: 'Méthode de mesure',
            ok: this.has(impact_measure, ['methode_mesure']),
            sourceLabel: 'Mesure de l’impact',
          },
          {
            key: 'resultats_actuels',
            label: 'Résultats actuels',
            ok: this.has(impact_measure, ['resultats_actuels']),
            sourceLabel: 'Mesure de l’impact',
          },
        );
        break;

      case 'market':
        items.push(
          {
            key: 'clients',
            label: 'Clients',
            ok: customer_segment.length > 0,
            sourceLabel: 'Segments clients',
          },
          {
            key: 'proposition_valeur',
            label: 'Proposition de valeur',
            ok: this.has(value_proposition, [
              'environmental_value',
              'social_value',
              'innovation_value',
            ]),
            sourceLabel: 'Proposition de valeur',
          },
          {
            key: 'canaux',
            label: 'Canaux',
            ok: this.has(context.customer_relations_channel, [
              'channels',
              'distribution_strategy',
            ]),
            sourceLabel: 'Relations clients et canaux',
          },
          {
            key: 'eco',
            label: 'Avantages écologiques',
            ok:
              this.has(eco_design, ['vision_durable', 'performance_eco']) ||
              this.has(eco_design_result, ['eco_results']),
            sourceLabel: 'Éco-conception',
          },
          {
            key: 'partenaires',
            label: 'Partenaires potentiels',
            ok:
              this.has(key_activities_resource, ['strategic_partners']) ||
              stakeholder.length > 0,
            sourceLabel: 'Parties prenantes',
          },
          {
            key: 'positionnement',
            label: 'Positionnement',
            ok: this.has(market_access, ['positionnement']),
            sourceLabel: 'Accès au marché',
          },
        );
        break;

      case 'funding':
        items.push(
          {
            key: 'probleme',
            label: 'Problème marché défini',
            ok: this.has(problems_needs, ['customer_needs']),
            sourceLabel: 'Problèmes et besoins',
          },
          {
            key: 'solution',
            label: 'Solution décrite',
            ok: this.has(value_proposition, [
              'products_services',
              'value_added',
            ]),
            sourceLabel: 'Proposition de valeur',
          },
          {
            key: 'tests',
            label: 'Idée testée',
            ok: context.test_discovery.length > 0,
            sourceLabel: 'Tests',
          },
          {
            key: 'segments',
            label: 'Segments clients',
            ok: customer_segment.length >= 2,
            sourceLabel: 'Segments clients',
          },
          {
            key: 'maturite_financiere',
            label: 'Maturité financière',
            ok:
              this.has(cost_structure, ['fixed_costs', 'variable_costs']) &&
              this.has(revenue_stream, ['revenue_sources']),
            sourceLabel: 'Structure des coûts / revenus',
          },
          {
            key: 'statut_legal',
            label: 'Statut légal',
            ok: this.has(legal_plan, ['statut_juridique', 'immatriculation']),
            sourceLabel: 'Plan juridique',
          },
          {
            key: 'equipe',
            label: 'Équipe',
            ok: stakeholder.length >= 2,
            sourceLabel: 'Parties prenantes',
          },
          {
            key: 'kpi',
            label: 'KPIs suivis',
            ok:
              this.has(indicator, [
                'environmental_kpis',
                'social_kpis',
                'economic_kpis',
              ]) || this.has(kpi, ['kpis']),
            sourceLabel: 'Indicateurs / KPIs',
          },
          {
            key: 'plan_financier',
            label: 'Plan financier',
            ok: this.has(financial_plan, ['point_depart', 'capital']),
            sourceLabel: 'Plan financier',
          },
          {
            key: 'impact',
            label: 'Impact mesuré',
            ok:
              this.has(impact_measure, [
                'objectifs_impact',
                'resultats_actuels',
              ]) || this.has(eco_design_result, ['eco_results']),
            sourceLabel: 'Mesure de l’impact',
          },
        );
        break;

      case 'legal':
        items.push(
          {
            key: 'statut_juridique',
            label: 'Statut juridique / aspects légaux',
            ok: this.has(pestel, ['legal_what', 'legal_how']),
            sourceLabel: 'PESTEL',
          },
          {
            key: 'contrats',
            label: 'Contrats / partenaires',
            ok:
              this.has(key_activities_resource, ['strategic_partners']) ||
              this.has(idea_sketch, ['partners']),
            sourceLabel: 'Activités et ressources',
          },
        );
        break;

      case 'kpis':
        items.push(
          {
            key: 'kpis',
            label: 'Indicateurs de performance (KPIs)',
            ok: this.has(indicator, [
              'environmental_kpis',
              'social_kpis',
              'economic_kpis',
            ]),
            sourceLabel: 'Indicateurs (GBM)',
          },
          {
            key: 'objectifs_mesure',
            label: 'Objectifs de mesure',
            ok: this.has(objective, [
              'environmental_objectives',
              'social_objectives',
              'customer_objectives',
              'team_objectives',
            ]),
            sourceLabel: 'Objectifs',
          },
          {
            key: 'revues_performance',
            label: 'Revues de performance',
            ok: this.has(indicator, ['measurement_method', 'review_frequency']),
            sourceLabel: 'Indicateurs (GBM)',
          },
        );
        break;

      default:
        break;
    }

    return items.map(({ key, label, ok, sourceLabel }) => ({
      key,
      label,
      status: ok ? 'ok' : 'missing',
      sourceLabel: ok ? sourceLabel : undefined,
    }));
  }

  // ============================================================
  // BUILDERS PAR MODULE
  // ============================================================

  private buildManagement(context: any): Omit<PrefillResult, 'module'> {
    const {
      key_activities_resource,
      stakeholder,
      stakeholder_map,
      eco_design,
      problems_needs,
      mission_vision,
    } = context;
    const fields: Record<string, PrefillField> = {};

    const team = this.join(
      key_activities_resource?.key_resources || null,
      this.listToText(stakeholder, (s: any) =>
        s.name ? `- ${s.name}${s.role ? ` (${s.role})` : ''}` : '',
      ),
    );
    if (team) {
      fields.ressources_humaines = this.field(
        team,
        'KeyActivitiesResource',
        'Activités et ressources',
        team,
      );
    }

    if (key_activities_resource?.key_resources) {
      fields.actifs_physiques = this.field(
        key_activities_resource.key_resources,
        'KeyActivitiesResource',
        'Activités et ressources',
      );
      fields.ressources_intellectuelles = this.field(
        key_activities_resource.key_resources,
        'KeyActivitiesResource',
        'Activités et ressources',
      );
    }

    const production = this.join(
      key_activities_resource?.key_activities
        ? `Activités clés :\n${key_activities_resource.key_activities}`
        : null,
      key_activities_resource?.strategic_partners
        ? `Partenaires stratégiques :\n${key_activities_resource.strategic_partners}`
        : null,
      this.listToText(stakeholder_map, (m: any) =>
        m.stakeholder_name
          ? `- ${m.stakeholder_name}${m.contribution ? ` (contribue : ${m.contribution})` : ''}`
          : '',
      ),
      eco_design?.plan_action_eco
        ? `Plan d'action éco-conception :\n${this.plain(eco_design.plan_action_eco)}`
        : null,
    );
    if (production) {
      fields.production_fournisseurs = this.field(
        production,
        'Stakeholder',
        'Parties prenantes',
        production,
      );
    }

    const gestion = this.join(
      problems_needs?.team_motivations,
      mission_vision?.values
        ? `Valeurs de l'équipe :\n${mission_vision.values}`
        : null,
    );
    if (gestion) {
      fields.problemes_gestion = this.field(
        gestion,
        problems_needs?.team_motivations ? 'ProblemsNeeds' : 'MissionVision',
        problems_needs?.team_motivations
          ? 'Problèmes et besoins'
          : 'Mission et vision',
        this.short(problems_needs?.team_motivations) ||
          this.short(mission_vision?.values),
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'management'),
    };
  }

  private buildMarketing(context: any): Omit<PrefillResult, 'module'> {
    const {
      customer_segment,
      value_proposition,
      pestel,
      idea_sketch,
      test_discovery,
      customer_relations_channel,
      customer_journey,
      mission_vision,
      revenue_stream,
      swot_analysis,
    } = context;
    const fields: Record<string, PrefillField> = {};

    const segments = this.listToText(customer_segment, (c: any) =>
      [
        c.segment_name ? `- ${c.segment_name}` : '',
        c.description ? `  Description : ${c.description}` : '',
        c.pains ? `  Douleurs : ${c.pains}` : '',
        c.gains ? `  Gains : ${c.gains}` : '',
        c.functions ? `  Fonctions : ${c.functions}` : '',
      ].join('\n'),
    );
    const clientsValeur = this.join(
      segments,
      value_proposition
        ? this.describeValueProposition(value_proposition)
        : null,
    );
    if (clientsValeur) {
      fields.clients_valeur = this.field(
        clientsValeur,
        'CustomerSegment',
        'Segments clients',
        segments || this.short(value_proposition),
      );
    }

    const marche = this.join(
      pestel ? this.describePestel(pestel) : null,
      idea_sketch?.customers
        ? `Clients ciblés (idée) : ${idea_sketch.customers}`
        : null,
      this.listToText(test_discovery, (t: any) =>
        t.hypothesis
          ? `- Test : ${t.hypothesis}${t.results ? ` → ${t.results}` : ''}`
          : '',
      ),
    );
    if (marche) {
      fields.analyse_marche = this.field(
        marche,
        'Pestel',
        'PESTEL',
        this.short(pestel?.economic_what) || this.short(pestel?.social_what),
      );
    }

    if (pestel?.economic_what || swot_analysis?.threats) {
      fields.concurrents = this.field(
        this.join(
          pestel?.economic_what
            ? `Contexte économique (PESTEL) : ${pestel.economic_what}`
            : null,
          swot_analysis?.threats
            ? `Menaces identifiées (SWOT) :\n${swot_analysis.threats}`
            : null,
        ),
        'SwotAnalysis',
        'Analyse SWOT',
        this.short(pestel?.economic_what) || this.short(swot_analysis?.threats),
      );
    }

    const offrePrix = this.join(
      value_proposition?.products_services
        ? `Produits / services : ${value_proposition.products_services}`
        : null,
      value_proposition?.value_added
        ? `Valeur ajoutée : ${value_proposition.value_added}`
        : null,
      revenue_stream?.pricing_strategy
        ? `Stratégie de prix : ${revenue_stream.pricing_strategy}`
        : null,
    );
    if (offrePrix) {
      fields.offre_prix = this.field(
        offrePrix,
        'ValueProposition',
        'Proposition de valeur',
        this.short(value_proposition?.products_services),
      );
    }

    if (mission_vision?.mission || mission_vision?.vision) {
      fields.branding_positionnement = this.field(
        this.join(
          mission_vision?.mission
            ? `Mission : ${mission_vision.mission}`
            : null,
          mission_vision?.vision ? `Vision : ${mission_vision.vision}` : null,
          mission_vision?.values ? `Valeurs : ${mission_vision.values}` : null,
          value_proposition?.innovation_value
            ? `Innovation : ${value_proposition.innovation_value}`
            : null,
        ),
        'MissionVision',
        'Mission et vision',
        this.short(mission_vision?.mission),
      );
    }

    const journeyText = this.listToText(customer_journey, (j: any) =>
      j.stage_name
        ? `- Étape « ${j.stage_name} » : ${j.touchpoints || ''}`
        : '',
    );

    if (
      customer_relations_channel?.channels ||
      customer_relations_channel?.distribution_strategy
    ) {
      fields.canaux_communication = this.field(
        this.join(
          customer_relations_channel?.channels
            ? `Canaux : ${customer_relations_channel.channels}`
            : null,
          customer_relations_channel?.distribution_strategy
            ? `Stratégie de distribution : ${customer_relations_channel.distribution_strategy}`
            : null,
          journeyText,
        ),
        'CustomerRelationsChannel',
        'Relations clients et canaux',
        this.short(customer_relations_channel?.channels),
      );
    } else if (journeyText) {
      fields.canaux_communication = this.field(
        journeyText,
        'CustomerJourney',
        'Parcours client',
      );
    }

    if (customer_relations_channel?.customer_relationships) {
      fields.relation_client = this.field(
        customer_relations_channel.customer_relationships,
        'CustomerRelationsChannel',
        'Relations clients et canaux',
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'marketing'),
    };
  }

  private buildFinancial(context: any): Omit<PrefillResult, 'module'> {
    const { cost_structure, revenue_stream } = context;
    const fields: Record<string, PrefillField> = {};
    const computed = this.computeFinancialEstimates(context);

    const pointDepart = this.join(
      cost_structure ? this.describeCosts(cost_structure) : null,
      revenue_stream ? this.describeRevenues(revenue_stream) : null,
      computed.summary,
    );
    if (pointDepart) {
      fields.point_depart = this.field(
        pointDepart,
        'CostStructure',
        'Structure des coûts',
        this.short(cost_structure?.fixed_costs),
      );
    }

    if (computed.fixedCosts !== null) {
      fields.couts_configuration = this.field(
        computed.fixedCosts,
        'CostStructure',
        'Structure des coûts',
        `Estimation déterministe : ${computed.fixedCosts}`,
      );
    }

    if (computed.breakeven !== null) {
      fields.seuil_rentabilite = this.field(
        computed.breakeven,
        'CostStructure',
        'Structure des coûts',
        `Estimation déterministe : ${computed.breakeven}`,
      );
    }

    if (computed.summary) {
      fields.autres_mesures = this.field(
        computed.summary,
        'CostStructure',
        'Structure des coûts',
        computed.summary,
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'financial'),
      computed: { financial: computed },
    };
  }

  private buildLegal(context: any): Omit<PrefillResult, 'module'> {
    const { pestel, idea_sketch, key_activities_resource } = context;
    const fields: Record<string, PrefillField> = {};

    const legal = this.join(
      pestel?.legal_what
        ? `Aspects légaux (PESTEL) : ${pestel.legal_what}`
        : null,
      pestel?.legal_how
        ? `Actions prévues (PESTEL) : ${pestel.legal_how}`
        : null,
    );
    if (legal) {
      fields.statut_juridique = this.field(
        legal,
        'Pestel',
        'PESTEL',
        this.short(pestel?.legal_what),
      );
    }

    const contrats = this.join(
      key_activities_resource?.strategic_partners
        ? `Partenaires stratégiques (à formaliser par contrat) :\n${key_activities_resource.strategic_partners}`
        : null,
      idea_sketch?.partners
        ? `Partenaires (idée) : ${idea_sketch.partners}`
        : null,
    );
    if (contrats) {
      fields.contrats = this.field(
        contrats,
        'KeyActivitiesResource',
        'Activités et ressources',
        this.short(key_activities_resource?.strategic_partners) ||
          this.short(idea_sketch?.partners),
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'legal'),
    };
  }

  private buildKpi(context: any): Omit<PrefillResult, 'module'> {
    const { indicator, objective } = context;
    const fields: Record<string, PrefillField> = {};

    const kpisJson = this.toJsonText({
      'KPIs environnementaux': this.splitLines(indicator?.environmental_kpis),
      'KPIs sociaux': this.splitLines(indicator?.social_kpis),
      'KPIs économiques': this.splitLines(indicator?.economic_kpis),
    });
    if (
      indicator?.environmental_kpis ||
      indicator?.social_kpis ||
      indicator?.economic_kpis
    ) {
      fields.kpis = this.field(
        kpisJson,
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator?.environmental_kpis) ||
          this.short(indicator?.social_kpis) ||
          this.short(indicator?.economic_kpis),
      );
    }

    const objectifs = this.toJsonText({
      'Objectifs environnementaux': this.splitLines(
        objective?.environmental_objectives,
      ),
      'Objectifs sociaux': this.splitLines(objective?.social_objectives),
      'Objectifs clients': this.splitLines(objective?.customer_objectives),
      'Objectifs équipe': this.splitLines(objective?.team_objectives),
    });
    if (
      objective?.environmental_objectives ||
      objective?.social_objectives ||
      objective?.customer_objectives ||
      objective?.team_objectives
    ) {
      fields.objectifs_mesure = this.field(
        objectifs,
        'Objective',
        'Objectifs',
        this.short(objective?.environmental_objectives) ||
          this.short(objective?.customer_objectives),
      );
    }

    const revues = this.join(
      indicator?.measurement_method
        ? `Méthode de mesure :\n${indicator.measurement_method}`
        : null,
      indicator?.review_frequency
        ? `Fréquence de revue :\n${indicator.review_frequency}`
        : null,
    );
    if (revues) {
      fields.revues_performance = this.field(
        revues,
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator?.measurement_method) ||
          this.short(indicator?.review_frequency),
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'kpis'),
    };
  }

  private buildEcoDesign(context: any): Omit<PrefillResult, 'module'> {
    const {
      stakeholder,
      key_activities_resource,
      idea_sketch,
      value_proposition,
      problems_needs,
      objective,
      pestel,
      mission_vision,
      eco_design_result,
    } = context;
    const fields: Record<string, PrefillField> = {};

    const equipe = this.join(
      key_activities_resource?.key_resources || null,
      this.listToText(stakeholder, (s: any) =>
        s.name ? `- ${s.name}${s.role ? ` (${s.role})` : ''}` : '',
      ),
    );
    if (equipe) {
      fields.equipe_eco = this.field(
        equipe,
        'KeyActivitiesResource',
        'Activités et ressources',
        this.short(equipe),
      );
    }

    const projet = this.join(
      idea_sketch?.product_service
        ? `Produit / service : ${idea_sketch.product_service}`
        : null,
      value_proposition?.products_services
        ? `Produits / services (valeur) : ${value_proposition.products_services}`
        : null,
      value_proposition?.environmental_value
        ? `Valeur environnementale : ${value_proposition.environmental_value}`
        : null,
    );
    if (projet) {
      fields.projet_eco = this.field(
        projet,
        'ValueProposition',
        'Proposition de valeur',
        this.short(idea_sketch?.product_service),
      );
    }

    const contexte = this.join(
      problems_needs?.environmental_challenges
        ? `Défis environnementaux :\n${problems_needs.environmental_challenges}`
        : null,
      problems_needs?.social_challenges
        ? `Défis sociaux :\n${problems_needs.social_challenges}`
        : null,
      objective?.environmental_problems
        ? `Problèmes environnementaux (objectifs) :\n${objective.environmental_problems}`
        : null,
      pestel?.environmental_what
        ? `Contexte environnemental (PESTEL) :\n${pestel.environmental_what}${pestel.environmental_how ? ` — ${pestel.environmental_how}` : ''}`
        : null,
      pestel?.legal_what
        ? `Contexte réglementaire (PESTEL) :\n${pestel.legal_what}`
        : null,
    );
    if (contexte) {
      fields.contexte_eco = this.field(
        contexte,
        'ProblemsNeeds',
        'Problèmes et besoins',
        this.short(problems_needs?.environmental_challenges),
      );
    }

    const vision = this.join(
      mission_vision?.mission ? `Mission : ${mission_vision.mission}` : null,
      mission_vision?.vision ? `Vision : ${mission_vision.vision}` : null,
      mission_vision?.values ? `Valeurs : ${mission_vision.values}` : null,
      objective?.environmental_objectives
        ? `Objectifs environnementaux :\n${objective.environmental_objectives}`
        : null,
      objective?.social_objectives
        ? `Objectifs sociaux :\n${objective.social_objectives}`
        : null,
    );
    if (vision) {
      fields.vision_durable = this.field(
        vision,
        'MissionVision',
        'Mission et vision',
        this.short(mission_vision?.mission),
      );
    }

    if (eco_design_result?.eco_results) {
      fields.performance_eco = this.field(
        this.join(
          eco_design_result.eco_results,
          eco_design_result.performance_analysis,
        ),
        'EcoDesignResult',
        'Résultats de l’éco-conception',
      );
      fields.strategies_eco = this.field(
        this.join(
          eco_design_result.eco_results,
          eco_design_result.improvements,
        ),
        'EcoDesignResult',
        'Résultats de l’éco-conception',
      );
      fields.plan_action_eco = this.field(
        this.join(
          eco_design_result.eco_results,
          eco_design_result.improvements,
        ),
        'EcoDesignResult',
        'Résultats de l’éco-conception',
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'eco-design'),
    };
  }

  private buildImpact(context: any): Omit<PrefillResult, 'module'> {
    const { indicator, objective, eco_design_result, impact_measure } = context;
    const fields: Record<string, PrefillField> = {};

    const kpisEnv = this.join(
      indicator?.environmental_kpis
        ? `Indicateurs (GBM) :\n${indicator.environmental_kpis}`
        : null,
      objective?.environmental_objectives
        ? `Objectifs environnementaux :\n${objective.environmental_objectives}`
        : null,
    );
    if (kpisEnv) {
      fields.kpis_environnementaux = this.field(
        this.toJsonText({
          'KPIs environnementaux': this.splitLines(
            indicator?.environmental_kpis,
          ),
          'Objectifs environnementaux': this.splitLines(
            objective?.environmental_objectives,
          ),
        }),
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator?.environmental_kpis) ||
          this.short(objective?.environmental_objectives),
      );
    }

    const kpisSoc = this.join(
      indicator?.social_kpis
        ? `Indicateurs (GBM) :\n${indicator.social_kpis}`
        : null,
      objective?.social_objectives
        ? `Objectifs sociaux :\n${objective.social_objectives}`
        : null,
    );
    if (kpisSoc) {
      fields.kpis_sociaux = this.field(
        this.toJsonText({
          'KPIs sociaux': this.splitLines(indicator?.social_kpis),
          'Objectifs sociaux': this.splitLines(objective?.social_objectives),
        }),
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator?.social_kpis) ||
          this.short(objective?.social_objectives),
      );
    }

    const kpisEco = this.join(
      indicator?.economic_kpis
        ? `Indicateurs (GBM) :\n${indicator.economic_kpis}`
        : null,
      objective?.customer_objectives
        ? `Objectifs clients :\n${objective.customer_objectives}`
        : null,
      objective?.team_objectives
        ? `Objectifs équipe :\n${objective.team_objectives}`
        : null,
    );
    if (kpisEco) {
      fields.kpis_economiques = this.field(
        this.toJsonText({
          'KPIs économiques': this.splitLines(indicator?.economic_kpis),
          'Objectifs clients': this.splitLines(objective?.customer_objectives),
          'Objectifs équipe': this.splitLines(objective?.team_objectives),
        }),
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator?.economic_kpis) ||
          this.short(objective?.customer_objectives),
      );
    }

    const objectifsImpact = this.join(
      objective?.environmental_objectives,
      objective?.social_objectives,
      objective?.customer_objectives,
      eco_design_result?.eco_results,
    );
    if (objectifsImpact) {
      fields.objectifs_impact = this.field(
        this.toJsonText({
          'Objectifs environnementaux': this.splitLines(
            objective?.environmental_objectives,
          ),
          'Objectifs sociaux': this.splitLines(objective?.social_objectives),
          'Objectifs clients': this.splitLines(objective?.customer_objectives),
          'Résultats éco-conception': this.splitLines(
            eco_design_result?.eco_results,
          ),
        }),
        'Objective',
        'Objectifs',
        this.short(objective?.environmental_objectives) ||
          this.short(objective?.social_objectives),
      );
    }

    if (indicator?.measurement_method) {
      fields.methode_mesure = this.field(
        indicator.measurement_method,
        'Indicator',
        'Indicateurs (GBM)',
      );
    }

    if (indicator?.review_frequency) {
      fields.periode_mesure = this.field(
        this.mapPeriod(indicator.review_frequency),
        'Indicator',
        'Indicateurs (GBM)',
        this.short(indicator.review_frequency),
      );
    }

    if (impact_measure?.objectifs_impact) {
      // L'utilisateur a déjà ses propres objectifs → on les conserve (source prioritaire)
      fields.objectifs_impact = this.field(
        JSON.stringify(impact_measure.objectifs_impact),
        'ImpactMeasure',
        'Mesure de l’impact',
        this.short(impact_measure.objectifs_impact),
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'impact'),
    };
  }

  private buildMarket(context: any): Omit<PrefillResult, 'module'> {
    const {
      mission_vision,
      value_proposition,
      objective,
      eco_design,
      eco_design_result,
      customer_segment,
      customer_relations_channel,
      stakeholder,
      key_activities_resource,
      problems_needs,
      idea_sketch,
    } = context;
    const fields: Record<string, PrefillField> = {};

    if (mission_vision?.mission || mission_vision?.vision) {
      fields.essence_marque = this.field(
        this.join(
          mission_vision?.mission
            ? `Mission : ${mission_vision.mission}`
            : null,
          mission_vision?.vision ? `Vision : ${mission_vision.vision}` : null,
          mission_vision?.values ? `Valeurs : ${mission_vision.values}` : null,
          value_proposition?.value_added
            ? `Valeur ajoutée : ${value_proposition.value_added}`
            : null,
          value_proposition?.innovation_value
            ? `Innovation : ${value_proposition.innovation_value}`
            : null,
        ),
        'MissionVision',
        'Mission et vision',
        this.short(mission_vision?.mission),
      );
    }

    const alignement = this.join(
      objective?.environmental_objectives
        ? `Objectifs environnementaux :\n${objective.environmental_objectives}`
        : null,
      objective?.social_objectives
        ? `Objectifs sociaux :\n${objective.social_objectives}`
        : null,
      eco_design?.vision_durable
        ? `Vision durable :\n${eco_design.vision_durable}`
        : null,
      eco_design_result?.eco_results
        ? `Résultats éco-conception :\n${eco_design_result.eco_results}`
        : null,
    );
    if (alignement) {
      fields.alignement_objectifs = this.field(
        alignement,
        'Objective',
        'Objectifs',
        this.short(objective?.environmental_objectives),
      );
    }

    const segments = this.listToText(customer_segment, (c: any) =>
      [
        c.segment_name ? `- ${c.segment_name}` : '',
        c.pains ? `  Douleurs : ${c.pains}` : '',
        c.gains ? `  Gains : ${c.gains}` : '',
      ].join('\n'),
    );
    const positionnement = this.join(
      segments ? `Clients ciblés :\n${segments}` : null,
      value_proposition
        ? `Proposition de valeur :\n${this.describeValueProposition(value_proposition)}`
        : null,
      eco_design?.performance_eco
        ? `Performance écologique :\n${this.plain(eco_design.performance_eco)}`
        : null,
      eco_design_result?.eco_results
        ? `Différenciation environnementale :\n${eco_design_result.eco_results}`
        : null,
    );
    if (positionnement) {
      fields.positionnement = this.field(
        positionnement,
        'CustomerSegment',
        'Segments clients',
        this.short(customer_segment[0]?.segment_name),
      );
    }

    const narration = this.join(
      idea_sketch?.idea_initial
        ? `Idée initiale : ${idea_sketch?.idea_initial}`
        : null,
      problems_needs?.customer_needs
        ? `Besoins clients :\n${problems_needs.customer_needs}`
        : null,
      problems_needs?.team_motivations
        ? `Motivations de l'équipe :\n${problems_needs.team_motivations}`
        : null,
      mission_vision?.vision ? `Vision : ${mission_vision.vision}` : null,
    );
    if (narration) {
      fields.narration = this.field(
        narration,
        'ProblemsNeeds',
        'Problèmes et besoins',
        this.short(problems_needs?.customer_needs),
      );
    }

    const messages = this.toJsonText({
      'Valeur environnementale': this.splitLines(
        value_proposition?.environmental_value,
      ),
      'Valeur sociale': this.splitLines(value_proposition?.social_value),
      'Valeur ajoutée': this.splitLines(value_proposition?.value_added),
    });
    if (
      value_proposition?.environmental_value ||
      value_proposition?.social_value
    ) {
      fields.messages_cles = this.field(
        messages,
        'ValueProposition',
        'Proposition de valeur',
        this.short(value_proposition?.environmental_value),
      );
    }

    const canaux = this.toJsonText({
      Canaux: this.splitLines(customer_relations_channel?.channels),
      'Stratégie de distribution': this.splitLines(
        customer_relations_channel?.distribution_strategy,
      ),
    });
    if (customer_relations_channel?.channels) {
      fields.canaux_marketing = this.field(
        canaux,
        'CustomerRelationsChannel',
        'Relations clients et canaux',
        this.short(customer_relations_channel.channels),
      );
    }

    const partenaires = this.toJsonText({
      'Partenaires stratégiques': this.splitLines(
        key_activities_resource?.strategic_partners,
      ),
      'Parties prenantes': this.listToText(stakeholder, (s: any) =>
        s.name ? `${s.name}${s.role ? ` (${s.role})` : ''}` : '',
      ).split('\n'),
    });
    if (key_activities_resource?.strategic_partners || stakeholder.length > 0) {
      fields.partenariats_market = this.field(
        partenaires,
        'Stakeholder',
        'Parties prenantes',
        this.short(key_activities_resource?.strategic_partners),
      );
    }

    return {
      fields,
      checklist: this.checklistFor(context, 'market'),
    };
  }

  private buildFunding(context: any): Omit<PrefillResult, 'module'> {
    return {
      fields: {},
      checklist: this.checklistFor(context, 'funding'),
      suggestions: this.suggestMaturity(context),
    };
  }

  // ============================================================
  // CALCULS DÉTERMINISTES (finances)
  // ============================================================

  /**
   * Extraction déterministe de montants depuis un texte libre.
   * Retourne null si aucun montant fiable n'est trouvé.
   */
  private extractLargestAmount(text: any): number | null {
    if (!text) return null;
    const s = String(text);
    const matches = s.match(/\d[\d\s\u00A0']*(?:[.,]\d+)?/g);
    if (!matches) return null;

    let largest: number | null = null;
    for (const raw of matches) {
      const n = this.parseAmount(raw);
      if (n !== null && (largest === null || n > largest)) largest = n;
    }
    return largest;
  }

  private parseAmount(raw: string): number | null {
    let s = raw.replace(/[\s\u00A0']/g, '');
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    if (hasComma && hasDot) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      const parts = s.split(',');
      if (parts.length === 2 && parts[1].length !== 3) s = s.replace(',', '.');
      else s = s.replace(/,/g, '');
    }
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  private computeFinancialEstimates(context: any): Record<string, any> {
    const { cost_structure, revenue_stream } = context;
    const fixed = this.extractLargestAmount(cost_structure?.fixed_costs);
    const variable = this.extractLargestAmount(cost_structure?.variable_costs);
    const breakevenRaw = this.extractLargestAmount(
      cost_structure?.breakeven_analysis,
    );
    const revenue = this.extractLargestAmount(revenue_stream?.revenue_sources);
    const projections = this.extractLargestAmount(
      revenue_stream?.revenue_projections,
    );
    const breakeven =
      breakevenRaw ??
      (fixed !== null && revenue !== null
        ? Math.ceil(fixed / (revenue - (variable ?? 0)))
        : null);

    const lines: string[] = [];
    if (fixed !== null)
      lines.push(`Coûts fixes estimés (données GBM) : ${fixed}`);
    if (variable !== null)
      lines.push(`Coûts variables estimés (données GBM) : ${variable}`);
    if (revenue !== null)
      lines.push(`Revenus estimés (données GBM) : ${revenue}`);
    if (projections !== null)
      lines.push(`Projections de revenus (données GBM) : ${projections}`);
    if (breakeven !== null)
      lines.push(`Seuil de rentabilité estimé : ${breakeven}`);

    const summary =
      lines.length > 0
        ? `Synthèse automatique (calculs déterministes, à confirmer) :\n${lines.join('\n')}`
        : '';

    return {
      fixedCosts: fixed,
      variableCosts: variable,
      revenue: revenue ?? projections,
      breakeven,
      summary,
      source: 'CostStructure / RevenueStream',
    };
  }

  /**
   * Suggestions déterministes pour le questionnaire de maturité
   * (Accès au financement) basées sur les données déjà saisies.
   */
  private suggestMaturity(
    context: any,
  ): Record<string, { value: boolean; reason: string }> {
    const {
      problems_needs,
      idea_sketch,
      value_proposition,
      test_discovery,
      customer_segment,
    } = context;
    const {
      indicator,
      cost_structure,
      revenue_stream,
      legal_plan,
      stakeholder,
      pestel,
    } = context;

    const has = (r: any, keys: string[]) => this.has(r, keys);
    const any = (list: any) => Array.isArray(list) && list.length > 0;

    return {
      q1: {
        value:
          has(problems_needs, ['customer_needs']) ||
          has(idea_sketch, ['customers']),
        reason: has(problems_needs, ['customer_needs'])
          ? 'Basé sur "Problèmes et besoins" (besoins clients).'
          : 'Basé sur "Idée" (clients ciblés).',
      },
      q2: {
        value:
          has(value_proposition, ['products_services', 'value_added']) ||
          has(idea_sketch, ['product_service']),
        reason: has(value_proposition, ['products_services'])
          ? 'Basé sur "Proposition de valeur".'
          : 'Basé sur "Idée" (produit/service).',
      },
      q3: {
        value:
          any(test_discovery) &&
          test_discovery.some((t: any) => t.validated === true),
        reason: any(test_discovery)
          ? 'Basé sur les tests de découverte enregistrés dans le GBM.'
          : 'Aucun test enregistré.',
      },
      q4: {
        value: customer_segment.length >= 2,
        reason:
          customer_segment.length >= 2
            ? `Basé sur les ${customer_segment.length} segments clients définis.`
            : 'Moins de 2 segments clients définis.',
      },
      q5: {
        value: has(indicator, [
          'environmental_kpis',
          'social_kpis',
          'economic_kpis',
        ]),
        reason: has(indicator, ['environmental_kpis'])
          ? 'Basé sur les indicateurs définis (étape 20 du GBM).'
          : 'Aucun indicateur défini.',
      },
      q6: {
        value: false,
        reason:
          'À confirmer : la profitabilité ne peut pas être déduite des données saisies.',
      },
      q7: {
        value:
          has(cost_structure, ['fixed_costs', 'variable_costs']) &&
          has(revenue_stream, ['revenue_sources']),
        reason:
          has(cost_structure, ['fixed_costs']) &&
          has(revenue_stream, ['revenue_sources'])
            ? 'Basé sur "Structure des coûts" et "Flux de revenus".'
            : 'Coûts et/ou revenus incomplets.',
      },
      q8: {
        value: false,
        reason:
          'À confirmer : la profitabilité ne peut pas être déduite des données saisies.',
      },
      q9: {
        value: has(legal_plan, ['statut_juridique', 'immatriculation']),
        reason: has(legal_plan, ['statut_juridique'])
          ? 'Basé sur le "Plan juridique".'
          : 'Statut légal non renseigné.',
      },
      q10: {
        value: stakeholder.length >= 2,
        reason:
          stakeholder.length >= 2
            ? `Basé sur les ${stakeholder.length} parties prenantes identifiées.`
            : 'Moins de 2 parties prenantes identifiées.',
      },
      q11: {
        value: false,
        reason:
          'À confirmer : le portfolio produits ne peut pas être déduit des données saisies.',
      },
      q12: {
        value:
          has(pestel, ['economic_what', 'economic_how', 'social_what']) ||
          has(idea_sketch, ['partners']),
        reason: has(pestel, ['economic_what'])
          ? "Basé sur l'analyse PESTEL (marché / expansion)."
          : "Aucune donnée d'expansion identifiée.",
      },
    };
  }

  // ============================================================
  // FORMATAGE DE TEXTE
  // ============================================================

  private describeValueProposition(vp: any): string {
    const lines = [
      vp?.environmental_value
        ? `Valeur environnementale : ${vp.environmental_value}`
        : '',
      vp?.social_value ? `Valeur sociale : ${vp.social_value}` : '',
      vp?.value_added ? `Valeur ajoutée : ${vp.value_added}` : '',
      vp?.innovation_value ? `Innovation : ${vp.innovation_value}` : '',
      vp?.products_services
        ? `Produits / services : ${vp.products_services}`
        : '',
      vp?.pain_relievers ? `Réducteurs de douleurs : ${vp.pain_relievers}` : '',
      vp?.gain_creators ? `Créateurs de gains : ${vp.gain_creators}` : '',
    ].filter(Boolean);
    return lines.length > 0 ? lines.join('\n') : '';
  }

  private describePestel(pestel: any): string {
    const lines = [
      pestel?.political_what ? `Politique : ${pestel.political_what}` : '',
      pestel?.economic_what ? `Économique : ${pestel.economic_what}` : '',
      pestel?.social_what ? `Social : ${pestel.social_what}` : '',
      pestel?.technological_what
        ? `Technologique : ${pestel.technological_what}`
        : '',
      pestel?.environmental_what
        ? `Environnemental : ${pestel.environmental_what}`
        : '',
      pestel?.legal_what ? `Légal : ${pestel.legal_what}` : '',
    ].filter(Boolean);
    return lines.length > 0 ? `Analyse PESTEL :\n${lines.join('\n')}` : '';
  }

  private describeCosts(cs: any): string {
    const lines = [
      cs?.fixed_costs ? `Coûts fixes : ${cs.fixed_costs}` : '',
      cs?.variable_costs ? `Coûts variables : ${cs.variable_costs}` : '',
      cs?.cost_drivers ? `Facteurs de coûts : ${cs.cost_drivers}` : '',
      cs?.breakeven_analysis
        ? `Seuil de rentabilité : ${cs.breakeven_analysis}`
        : '',
    ].filter(Boolean);
    return lines.length > 0
      ? `Structure des coûts (GBM) :\n${lines.join('\n')}`
      : '';
  }

  private describeRevenues(rs: any): string {
    const lines = [
      rs?.revenue_sources ? `Sources de revenus : ${rs.revenue_sources}` : '',
      rs?.pricing_strategy ? `Stratégie de prix : ${rs.pricing_strategy}` : '',
      rs?.revenue_projections
        ? `Projections de revenus : ${rs.revenue_projections}`
        : '',
    ].filter(Boolean);
    return lines.length > 0
      ? `Flux de revenus (GBM) :\n${lines.join('\n')}`
      : '';
  }

  private splitLines(text: any): string[] {
    if (!text) return [];
    return String(text)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  private toJsonText(obj: Record<string, string[]>): string {
    const cleaned: Record<string, string[]> = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] && obj[key].length > 0) cleaned[key] = obj[key];
    }
    return JSON.stringify(cleaned, null, 2);
  }

  private mapPeriod(text: string): string {
    const t = String(text).toLowerCase();
    if (t.includes('mensuel') || t.includes('mois')) return 'MONTHLY';
    if (t.includes('trimestre') || t.includes('trimestriel'))
      return 'QUARTERLY';
    if (t.includes('annuel') || t.includes('an')) return 'YEARLY';
    return String(text);
  }

  private plain(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value))
      return value
        .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
        .join('\n');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
}
