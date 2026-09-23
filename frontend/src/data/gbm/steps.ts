import {
  Award,
  Brain,
  Calculator,
  Compass,
  Flag,
  FlaskConical,
  Gauge,
  Hammer,
  Handshake,
  Heart,
  Leaf,
  Lightbulb,
  Radio,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Target,
  TestTube2,
  TrendingUp,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type GbmFieldType = 'text' | 'textarea' | 'select' | 'checkbox'

export interface GbmFieldConfig {
  key: string
  label: string
  type: GbmFieldType
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface GbmStepMeta {
  key: string
  phase: number
  phaseName: string
  title: string
  subtitle: string
  relation: 'one-to-one' | 'one-to-many'
  aiGenerated?: boolean
  icon: LucideIcon
  color: string
  fields: GbmFieldConfig[]
}

export interface GbmPhaseMeta {
  phase: number
  name: string
  color: string
}

export const GBM_PHASES: GbmPhaseMeta[] = [
  { phase: 1, name: 'Ébaucher & Définir', color: '#2d7a52' },
  { phase: 2, name: 'Construire', color: '#c9a84c' },
  { phase: 3, name: 'Tester', color: '#4a7db5' },
  { phase: 4, name: 'Mesurer & Améliorer', color: '#8b5cf6' },
  { phase: 5, name: 'Synthèse', color: '#e11d48' },
]

const phaseName = (n: number) => GBM_PHASES.find(p => p.phase === n)!.name

export const GBM_STEPS: GbmStepMeta[] = [
  {
    key: 'gbm_1',
    phase: 1,
    phaseName: phaseName(1),
    title: "Esquissez votre idée d'entreprise",
    subtitle: "Étape 1 — Esquissez votre idée d'entreprise",
    relation: 'one-to-one',
    icon: Lightbulb,
    color: '#2d7a52',
    fields: [
      { key: 'idea_initial', label: "Quelle est votre idée d'entreprise initiale ?", type: 'textarea', placeholder: "Décrivez votre idée en quelques phrases : ce que vous voulez créer, pour qui, et pourquoi." },
      { key: 'product_service', label: "Qu'allez-vous offrir (produit, service) ?", type: 'textarea', placeholder: 'Produit physique, service, plateforme, solution numérique…' },
      { key: 'customers', label: 'Qui peuvent être vos clients ?', type: 'textarea', placeholder: 'Décrivez les personnes ou organisations que vous souhaitez servir.' },
      { key: 'partners', label: 'Qui peuvent être vos partenaires ?', type: 'textarea', placeholder: 'Fournisseurs, distributeurs, institutions, associations…' },
    ],
  },
  {
    key: 'gbm_2',
    phase: 1,
    phaseName: phaseName(1),
    title: 'Identifier les problèmes et les besoins',
    subtitle: 'Étape 2 — Identifier les problèmes et les besoins',
    relation: 'one-to-one',
    icon: Search,
    color: '#2d7a52',
    fields: [
      { key: 'environmental_challenges', label: "Votre idée s'attaque-t-elle à de réels défis environnementaux ? Lesquels ?", type: 'textarea', placeholder: 'Pollution, émissions carbone, déchets, perte de biodiversité…' },
      { key: 'social_challenges', label: "Votre idée s'attaque-t-elle à de véritables défis sociaux ? Lesquels ?", type: 'textarea', placeholder: 'Exclusion, inégalités, accès aux services, emploi local…' },
      { key: 'customer_needs', label: 'Quels sont les principaux besoins de vos clients potentiels ?', type: 'textarea', placeholder: 'Besoins fonctionnels, émotionnels, économiques, de statut…' },
      { key: 'team_motivations', label: "Quels sont les facteurs personnels ou professionnels qui sous-tendent l'idée d'entreprise ?", type: 'textarea', placeholder: "Votre expertise, vos valeurs, une expérience vécue, une conviction…" },
    ],
  },
  {
    key: 'gbm_3',
    phase: 1,
    phaseName: phaseName(1),
    title: 'Comprendre le contexte (PESTEL)',
    subtitle: 'Étape 3 — Comprendre le contexte (PESTEL)',
    relation: 'one-to-one',
    icon: Compass,
    color: '#2d7a52',
    fields: [
      { key: 'political_what', label: 'Politique — Quels aspects politiques peuvent influer sur votre entreprise ?', type: 'textarea' },
      { key: 'political_how', label: 'Politique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'economic_what', label: 'Économique — Quels aspects économiques peuvent influer ?', type: 'textarea' },
      { key: 'economic_how', label: 'Économique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'social_what', label: 'Social — Quels aspects sociaux peuvent influer ?', type: 'textarea' },
      { key: 'social_how', label: 'Social — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'technological_what', label: 'Technologique — Quels aspects technologiques peuvent influer ?', type: 'textarea' },
      { key: 'technological_how', label: 'Technologique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'environmental_what', label: 'Environnemental — Quels aspects environnementaux peuvent influer ?', type: 'textarea' },
      { key: 'environmental_how', label: 'Environnemental — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'legal_what', label: 'Légal — Quels aspects légaux peuvent influer ?', type: 'textarea' },
      { key: 'legal_how', label: 'Légal — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_4',
    phase: 1,
    phaseName: phaseName(1),
    title: 'Fixez vos objectifs',
    subtitle: 'Étape 4 — Fixez vos objectifs',
    relation: 'one-to-one',
    icon: Target,
    color: '#2d7a52',
    fields: [
      { key: 'environmental_problems', label: 'Défis environnementaux — Quels problèmes votre projet aborde-t-il ?', type: 'textarea' },
      { key: 'environmental_objectives', label: 'Objectifs environnementaux — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'social_problems', label: 'Défis sociaux — Quels problèmes votre projet aborde-t-il ?', type: 'textarea' },
      { key: 'social_objectives', label: 'Objectifs sociaux — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'customer_problems', label: 'Besoins clients — Quels besoins votre projet satisfait-il ?', type: 'textarea' },
      { key: 'customer_objectives', label: 'Objectifs clients — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'team_problems', label: "Motivations d'équipe — Quels facteurs personnels/professionnels ?", type: 'textarea' },
      { key: 'team_objectives', label: "Objectifs d'équipe — Que voulez-vous accomplir ?", type: 'textarea' },
    ],
  },
  {
    key: 'gbm_5',
    phase: 1,
    phaseName: phaseName(1),
    title: 'Synthétiser une mission et une vision',
    subtitle: 'Étape 5 — Synthétiser une mission et une vision',
    relation: 'one-to-one',
    icon: Flag,
    color: '#2d7a52',
    fields: [
      { key: 'mission', label: 'Mission — Synthétisez vos objectifs en une phrase globale', type: 'textarea', placeholder: "Ex. : « Réduire le gaspillage alimentaire en valorisant les invendus des restaurants. »" },
      { key: 'vision', label: 'Vision — Envisagez vos réalisations à moyen-long terme', type: 'textarea', placeholder: 'Où voulez-vous être dans 5 à 10 ans ? Quel impact ?' },
      { key: 'values', label: 'Valeurs — Quelles sont les valeurs fondamentales de votre entreprise ?', type: 'textarea', placeholder: 'Transparence, durabilité, impact local, équité…' },
    ],
  },
  {
    key: 'gbm_6',
    phase: 1,
    phaseName: phaseName(1),
    title: 'Résumé du contexte et des objectifs',
    subtitle: 'Étape 6 — Résumé du contexte et des objectifs',
    relation: 'one-to-one',
    aiGenerated: true,
    icon: Sparkles,
    color: '#2d7a52',
    fields: [
      { key: 'summary_text', label: 'Résumé du contexte et des objectifs', type: 'textarea', placeholder: 'Résumé généré par l’IA à partir des étapes 1 à 5, ou rédigé par vos soins.' },
    ],
  },
  {
    key: 'gbm_7a',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Parties prenantes',
    subtitle: 'Étape 7a — Identifier et cartographier les parties prenantes',
    relation: 'one-to-many',
    icon: Users,
    color: '#c9a84c',
    fields: [
      { key: 'name', label: 'Nom de la partie prenante', type: 'text', placeholder: 'Ex. : Mairie, fournisseur local, association…' },
      { key: 'role', label: 'Rôle', type: 'text', placeholder: 'Partenaire, financeur, régulateur, client…' },
      { key: 'interest', label: 'Intérêt dans le projet', type: 'text' },
      { key: 'influence', label: "Degré d'influence (faible/moyen/fort)", type: 'select', options: [
        { value: 'faible', label: 'Faible' },
        { value: 'moyen', label: 'Moyen' },
        { value: 'fort', label: 'Fort' },
      ] },
      { key: 'engagement_strategy', label: "Stratégie d'engagement", type: 'text', placeholder: 'Informer, consulter, impliquer, co-construire…' },
    ],
  },
  {
    key: 'gbm_7b',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Cartes des parties prenantes',
    subtitle: 'Étape 7b — Cartes des parties prenantes (donnant-donnant)',
    relation: 'one-to-many',
    icon: Handshake,
    color: '#c9a84c',
    fields: [
      { key: 'stakeholder_name', label: 'Partie prenante', type: 'text' },
      { key: 'contribution', label: 'Contribution (donnant)', type: 'text', placeholder: "Ce que la partie prenante apporte à votre projet" },
      { key: 'reward', label: 'Récompense (donnant)', type: 'text', placeholder: "Ce que votre projet apporte en retour" },
    ],
  },
  {
    key: 'gbm_8',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Segments de clientèle',
    subtitle: 'Étape 8 — Segments de clientèle',
    relation: 'one-to-many',
    icon: UserRound,
    color: '#c9a84c',
    fields: [
      { key: 'segment_name', label: 'Nom du segment', type: 'text', placeholder: 'Ex. : jeunes parents urbains, PME locales…' },
      { key: 'description', label: 'Description générique', type: 'text' },
      { key: 'pains', label: 'Souffrances — Que craint votre client ? (coût, temps, frustrations, risques)', type: 'textarea' },
      { key: 'gains', label: "Gains — Qu'attend votre client ? (économies, qualité, statut, rêves)", type: 'textarea' },
      { key: 'functions', label: 'Fonctions — De quoi a besoin votre client ? (besoins fonctionnels, sociaux, émotionnels)', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_9',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Proposition de valeur',
    subtitle: 'Étape 9 — Canevas de propositions de valeur',
    relation: 'one-to-one',
    icon: Heart,
    color: '#c9a84c',
    fields: [
      { key: 'environmental_value', label: 'Valeur environnementale — Quels défis environnementaux votre proposition adresse-t-elle ?', type: 'textarea' },
      { key: 'social_value', label: 'Valeur sociale — Quels besoins sociaux votre proposition couvre-t-elle ?', type: 'textarea' },
      { key: 'pain_relievers', label: 'Soulagement des douleurs — Comment votre solution répond-elle aux douleurs des clients ?', type: 'textarea' },
      { key: 'gain_creators', label: 'Créateurs de gains — Comment votre solution crée-t-elle les gains attendus ?', type: 'textarea' },
      { key: 'products_services', label: 'Produits et services — Que fait votre produit/service pour le client ?', type: 'textarea' },
      { key: 'value_added', label: 'Valeur ajoutée — Quelle différence par rapport aux alternatives existantes ?', type: 'textarea' },
      { key: 'innovation_value', label: "Valeur d'innovation — Quelles sont les opportunités de marché ?", type: 'textarea' },
    ],
  },
  {
    key: 'gbm_10',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Test de la proposition',
    subtitle: 'Étape 10 — Tester la proposition de valeur',
    relation: 'one-to-many',
    icon: FlaskConical,
    color: '#c9a84c',
    fields: [
      { key: 'hypothesis', label: 'Hypothèse', type: 'textarea', placeholder: "Ce que vous pensez être vrai : « Mes clients paieront X pour Y »" },
      { key: 'test_method', label: 'Méthode de test', type: 'text', placeholder: 'Entretien, landing page, prototype, précommande…' },
      { key: 'results', label: 'Résultats', type: 'textarea' },
      { key: 'learnings', label: 'Apprentissages', type: 'textarea' },
      { key: 'validated', label: 'Hypothèse validée ?', type: 'checkbox' },
    ],
  },
  {
    key: 'gbm_11',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Pivot de la proposition de valeur',
    subtitle: 'Étape 11 — Pivoter la proposition de valeur',
    relation: 'one-to-one',
    icon: RefreshCw,
    color: '#c9a84c',
    fields: [
      { key: 'initial_assumptions', label: 'Hypothèses initiales', type: 'textarea' },
      { key: 'test_results', label: 'Résultats des tests', type: 'textarea' },
      { key: 'pivot_decision', label: 'Décision de pivot', type: 'textarea', placeholder: 'Pivoter, persévérer ou abandonner ? Sur quoi ?' },
      { key: 'new_value_proposition', label: 'Nouvelle proposition de valeur', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_12a',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Relations clients & canaux',
    subtitle: 'Étape 12a — Relations avec les clients et canaux',
    relation: 'one-to-one',
    icon: Radio,
    color: '#c9a84c',
    fields: [
      { key: 'customer_relationships', label: 'Relations clients', type: 'textarea', placeholder: 'Assistance, automatisation, communauté, co-création…' },
      { key: 'channels', label: 'Canaux', type: 'textarea', placeholder: 'Site web, boutique, réseaux sociaux, partenaires…' },
      { key: 'distribution_strategy', label: 'Stratégie de distribution', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_12b',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Parcours du client',
    subtitle: 'Étape 12b — Parcours du client',
    relation: 'one-to-many',
    icon: Route,
    color: '#c9a84c',
    fields: [
      { key: 'stage_name', label: "Nom de l'étape", type: 'text', placeholder: 'Découverte, évaluation, achat, usage, fidélisation…' },
      { key: 'touchpoints', label: 'Points de contact', type: 'text' },
      { key: 'customer_emotions', label: 'Émotions client', type: 'text' },
      { key: 'improvement_ideas', label: "Idées d'amélioration", type: 'text' },
    ],
  },
  {
    key: 'gbm_13',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Activités et ressources',
    subtitle: 'Étape 13 — Principales activités et ressources',
    relation: 'one-to-one',
    icon: Hammer,
    color: '#c9a84c',
    fields: [
      { key: 'key_activities', label: 'Activités clés', type: 'textarea', placeholder: 'Production, R&D, commercial, logistique…' },
      { key: 'key_resources', label: 'Ressources clés', type: 'textarea', placeholder: 'Humaines, financières, techniques, physiques…' },
      { key: 'strategic_partners', label: 'Partenaires stratégiques', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_14a',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Écoconception',
    subtitle: 'Étape 14a — Écoconception de votre entreprise',
    relation: 'one-to-one',
    icon: Leaf,
    color: '#c9a84c',
    fields: [
      { key: 'equipe_eco', label: 'Équipe éco-conception', type: 'textarea', placeholder: 'Qui pilote la démarche d’écoconception ?' },
      { key: 'projet_eco', label: 'Projet — cycle de vie et impact', type: 'textarea', placeholder: 'Analysez l’impact sur l’ensemble du cycle de vie (matières, fabrication, usage, fin de vie).' },
      { key: 'contexte_eco', label: 'Contexte environnemental', type: 'textarea' },
      { key: 'vision_durable', label: 'Vision durable', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_14b',
    phase: 2,
    phaseName: phaseName(2),
    title: "Résultats de l'écoconception",
    subtitle: "Étape 14b — Résultats de l'écoconception",
    relation: 'one-to-one',
    icon: Award,
    color: '#c9a84c',
    fields: [
      { key: 'eco_results', label: "Résultats de l'écoconception", type: 'textarea' },
      { key: 'performance_analysis', label: 'Analyse de la performance environnementale', type: 'textarea' },
      { key: 'improvements', label: "Pistes d'amélioration", type: 'textarea' },
    ],
  },
  {
    key: 'gbm_15',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Résumé des activités et ressources',
    subtitle: 'Étape 15 — Résumé des activités et ressources',
    relation: 'one-to-one',
    aiGenerated: true,
    icon: Sparkles,
    color: '#c9a84c',
    fields: [
      { key: 'activities_summary', label: "Résumé d'activités et ressources", type: 'textarea' },
      { key: 'key_achievements', label: 'Réalisations clés', type: 'textarea' },
      { key: 'next_steps', label: 'Prochaines étapes', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_16',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Structure des coûts',
    subtitle: 'Étape 16 — Structure des coûts',
    relation: 'one-to-one',
    icon: Calculator,
    color: '#c9a84c',
    fields: [
      { key: 'fixed_costs', label: 'Coûts fixes', type: 'textarea', placeholder: 'Loyers, salaires, abonnements, assurances…' },
      { key: 'variable_costs', label: 'Coûts variables', type: 'textarea', placeholder: 'Matières, transport, commissions…' },
      { key: 'cost_drivers', label: 'Facteurs de coûts', type: 'textarea' },
      { key: 'breakeven_analysis', label: 'Analyse du seuil de rentabilité', type: 'textarea', placeholder: 'À partir de quel volume couvrez-vous vos coûts ?' },
    ],
  },
  {
    key: 'gbm_17',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Flux de revenus',
    subtitle: 'Étape 17 — Flux de revenus',
    relation: 'one-to-one',
    icon: TrendingUp,
    color: '#c9a84c',
    fields: [
      { key: 'revenue_sources', label: 'Sources de revenus', type: 'textarea', placeholder: 'Vente, abonnement, location, commission, subvention…' },
      { key: 'pricing_strategy', label: 'Stratégie de prix', type: 'textarea' },
      { key: 'revenue_projections', label: 'Projections de revenus', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_18',
    phase: 2,
    phaseName: phaseName(2),
    title: 'Résumé des coûts et recettes',
    subtitle: 'Étape 18 — Résumé des coûts et flux de recettes',
    relation: 'one-to-one',
    aiGenerated: true,
    icon: Sparkles,
    color: '#c9a84c',
    fields: [
      { key: 'cost_summary', label: 'Résumé des coûts', type: 'textarea' },
      { key: 'revenue_summary', label: 'Résumé des revenus', type: 'textarea' },
      { key: 'financial_health', label: 'Santé financière', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_19',
    phase: 3,
    phaseName: phaseName(3),
    title: 'Préparez le test !',
    subtitle: 'Étape 19 — Préparez le test !',
    relation: 'one-to-one',
    icon: TestTube2,
    color: '#4a7db5',
    fields: [
      { key: 'test_objectives', label: 'Objectifs du test', type: 'textarea' },
      { key: 'test_method', label: 'Méthode de test', type: 'textarea' },
      { key: 'success_criteria', label: 'Critères de succès', type: 'textarea' },
      { key: 'resources_needed', label: 'Ressources nécessaires', type: 'textarea' },
      { key: 'timeline', label: 'Calendrier / échéancier', type: 'textarea' },
    ],
  },
  {
    key: 'gbm_20',
    phase: 4,
    phaseName: phaseName(4),
    title: 'Indicateurs',
    subtitle: 'Étape 20 — Indicateurs',
    relation: 'one-to-one',
    icon: Gauge,
    color: '#8b5cf6',
    fields: [
      { key: 'environmental_kpis', label: "KPIs environnementaux — Indicateurs d'impact écologique", type: 'textarea' },
      { key: 'social_kpis', label: 'KPIs sociaux — Indicateurs de progrès social', type: 'textarea' },
      { key: 'economic_kpis', label: 'KPIs économiques — Indicateurs de performance économique', type: 'textarea' },
      { key: 'measurement_method', label: 'Méthode de mesure — Comment seront collectées les données ?', type: 'textarea' },
      { key: 'review_frequency', label: 'Fréquence de révision — Mensuelle, trimestrielle, annuelle ?', type: 'select', options: [
        { value: 'mensuelle', label: 'Mensuelle' },
        { value: 'trimestrielle', label: 'Trimestrielle' },
        { value: 'annuelle', label: 'Annuelle' },
      ] },
    ],
  },
  {
    key: 'gbm_21',
    phase: 5,
    phaseName: phaseName(5),
    title: 'Analyse SWOT',
    subtitle: 'Étape 21 — Analyse SWOT',
    relation: 'one-to-one',
    aiGenerated: true,
    icon: Brain,
    color: '#e11d48',
    fields: [
      { key: 'strengths', label: "Forces — Points forts du projet identifiés par l'IA", type: 'textarea' },
      { key: 'weaknesses', label: "Faiblesses — Points de vigilance identifiés par l'IA", type: 'textarea' },
      { key: 'opportunities', label: "Opportunités — Leviers de croissance identifiés par l'IA", type: 'textarea' },
      { key: 'threats', label: "Menaces — Risques identifiés par l'IA", type: 'textarea' },
    ],
  },
]

export const ONE_TO_MANY_STEP_KEYS = GBM_STEPS.filter(s => s.relation === 'one-to-many').map(s => s.key)

/**
 * Règles de validité minimale d'un élément des étapes GBM one-to-many (D3).
 * Miroir frontal de `backend/src/gbm/step-validation.ts` : une étape est complétée
 * si elle contient ≥1 élément valide.
 */
export interface OneToManyStepRule {
  stepKey: string
  /** Champ identifiant (obligatoire). */
  idField?: string
  /** Tous ces champs doivent être renseignés. */
  allOf?: string[]
  /** Au moins un de ces champs doit être renseigné. */
  anyOf?: string[]
}

export const ONE_TO_MANY_RULES: Record<string, OneToManyStepRule> = {
  gbm_7a: { stepKey: 'gbm_7a', idField: 'name', anyOf: ['role', 'interest', 'influence', 'engagement_strategy'] },
  gbm_7b: { stepKey: 'gbm_7b', idField: 'stakeholder_name', allOf: ['contribution', 'reward'] },
  gbm_8: { stepKey: 'gbm_8', idField: 'segment_name', anyOf: ['pains', 'gains', 'functions'] },
  gbm_10: { stepKey: 'gbm_10', idField: 'hypothesis', anyOf: ['test_method', 'results', 'learnings'] },
  gbm_12b: { stepKey: 'gbm_12b', idField: 'stage_name', anyOf: ['touchpoints', 'customer_emotions', 'improvement_ideas'] },
}

export function getOneToManyRule(stepKey: string): OneToManyStepRule | undefined {
  return ONE_TO_MANY_RULES[stepKey]
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

function fieldLabel(stepKey: string, fieldKey: string): string {
  const meta = getStepMeta(stepKey)
  return meta?.fields.find(f => f.key === fieldKey)?.label ?? fieldKey
}

/** Champs requis manquants d'un élément. Liste vide = élément valide. */
export function missingOneToManyFields(stepKey: string, item: Record<string, unknown>): string[] {
  const rule = getOneToManyRule(stepKey)
  if (!rule) return []

  const missing: string[] = []
  if (rule.idField && isBlank(item[rule.idField])) {
    missing.push(fieldLabel(stepKey, rule.idField))
  }

  for (const key of rule.allOf ?? []) {
    if (isBlank(item[key])) missing.push(fieldLabel(stepKey, key))
  }

  const anyOf = rule.anyOf ?? []
  if (anyOf.length > 0 && !anyOf.some(key => !isBlank(item[key]))) {
    missing.push(anyOf.map(key => fieldLabel(stepKey, key)).join(' ou '))
  }

  return missing
}

export function isValidOneToManyItem(stepKey: string, item: Record<string, unknown>): boolean {
  return missingOneToManyFields(stepKey, item).length === 0
}

export function countValidOneToManyItems(stepKey: string, items: Record<string, unknown>[]): number {
  return items.filter(item => isValidOneToManyItem(stepKey, item)).length
}

export function getStepMeta(key: string): GbmStepMeta | undefined {
  return GBM_STEPS.find(s => s.key === key)
}

export function getStepIndex(key: string): number {
  return GBM_STEPS.findIndex(s => s.key === key)
}

export function isOneToMany(key: string): boolean {
  return ONE_TO_MANY_STEP_KEYS.includes(key)
}

export function isAiStep(key: string): boolean {
  return Boolean(getStepMeta(key)?.aiGenerated)
}
