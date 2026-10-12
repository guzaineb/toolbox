export type DemoStepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface DemoUserSpec {
  key: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EXPERT' | 'PROJECT_OWNER' | 'INCUBATOR_MEMBER';
  bio: string;
  country: string;
  city: string;
  expert?: {
    headline: string;
    organization: string;
    position: string;
    years: number;
    expertise: string[];
  };
  owner?: {
    currentStatus: string;
    educationLevel: string;
    fieldOfStudy: string;
    occupation: string;
    experienceLevel: number;
    hasPreviousStartup: boolean;
    skills: { name: string; level: string }[];
    experiences: {
      title: string;
      organization: string;
      description: string;
      start: string;
      end?: string;
    }[];
  };
}

export const DEMO_USERS: DemoUserSpec[] = [
  {
    key: 'admin',
    email: 'admin@projectstruct.demo',
    firstName: 'Nadia',
    lastName: 'Ben Salah',
    role: 'INCUBATOR_MEMBER',
    bio: "Administratrice d'Atlas Impact Hub. Douze ans d'accompagnement de startups vertes et sociales en Tunisie.",
    country: 'Tunisie',
    city: 'Tunis',
  },
  {
    key: 'incubator',
    email: 'incubator@projectstruct.demo',
    firstName: 'Karim',
    lastName: 'Haddad',
    role: 'INCUBATOR_MEMBER',
    bio: "Responsable de programme d'incubation. Pilote l'accueil, le matching expert-projet et le suivi des cohortes.",
    country: 'Tunisie',
    city: 'Tunis',
  },
  {
    key: 'manager',
    email: 'manager@projectstruct.demo',
    firstName: 'Leïla',
    lastName: 'Trabelsi',
    role: 'INCUBATOR_MEMBER',
    bio: 'Gérante de cohortes. Organise les jurys, publie les grilles d’évaluation et suit les décisions finales.',
    country: 'Tunisie',
    city: 'Tunis',
  },
  {
    key: 'coach.business',
    email: 'coach.business@projectstruct.demo',
    firstName: 'Sofiane',
    lastName: 'Mansour',
    role: 'EXPERT',
    bio: 'Coach en stratégie et modèle économique. Accompagne les équipes sur la structuration de l’offre et la rentabilité.',
    country: 'Tunisie',
    city: 'Tunis',
    expert: {
      headline: 'Coach stratégie & modèle économique',
      organization: 'Tunis Business Angels',
      position: 'Senior Advisor',
      years: 14,
      expertise: ['Business Model', 'Stratégie Go-to-Market', 'Lean Startup', 'Finance & Comptabilité'],
    },
  },
  {
    key: 'coach.marketing',
    email: 'coach.marketing@projectstruct.demo',
    firstName: 'Amel',
    lastName: 'Gharbi',
    role: 'EXPERT',
    bio: 'Coach marketing et acquisition. Aide les porteurs à tester leur marché et à construire leur marque.',
    country: 'Tunisie',
    city: 'Sfax',
    expert: {
      headline: 'Coach marketing & acquisition',
      organization: 'Digital Growth Collective',
      position: 'Consultante senior',
      years: 11,
      expertise: ['Marketing Digital', 'Branding & Communication', 'Ventes B2B', 'SEO / SEA'],
    },
  },
  {
    key: 'coach.finance',
    email: 'coach.finance@projectstruct.demo',
    firstName: 'Mehdi',
    lastName: 'Chebbi',
    role: 'EXPERT',
    bio: 'Coach financier. Spécialiste des prévisions, du seuil de rentabilité et des dossiers de financement.',
    country: 'Tunisie',
    city: 'Sousse',
    expert: {
      headline: 'Coach finance & levée de fonds',
      organization: 'Cabinet Chebbi Advisory',
      position: 'Associé',
      years: 16,
      expertise: ['Finance & Comptabilité', 'Fundraising & Investissement', 'M&A / Fusion-Acquisition'],
    },
  },
  {
    key: 'coach.green',
    email: 'coach.green@projectstruct.demo',
    firstName: 'Rim',
    lastName: 'Jelassi',
    role: 'EXPERT',
    bio: 'Coach en éco-conception et économie circulaire. Accompagne les projets sur leur impact environnemental mesurable.',
    country: 'Tunisie',
    city: 'Sousse',
    expert: {
      headline: 'Coach éco-conception & impact durable',
      organization: 'GreenLab Maghreb',
      position: 'Directrice programmes',
      years: 12,
      expertise: ['Développement Durable', 'Impact Social', 'Agri-Tech'],
    },
  },
  {
    key: 'jury.strategy',
    email: 'jury.strategy@projectstruct.demo',
    firstName: 'Hatem',
    lastName: 'Ayari',
    role: 'EXPERT',
    bio: 'Jury expert en stratégie. Évalue la solidité du problème, de la solution et de la position concurrentielle.',
    country: 'Tunisie',
    city: 'Tunis',
    expert: {
      headline: 'Jury — stratégie & marché',
      organization: 'Carthage Ventures',
      position: 'Investisseur associé',
      years: 15,
      expertise: ['Business Model', 'Stratégie Go-to-Market', 'Product Marketing'],
    },
  },
  {
    key: 'jury.finance',
    email: 'jury.finance@projectstruct.demo',
    firstName: 'Salma',
    lastName: 'Kouki',
    role: 'EXPERT',
    bio: 'Jury experte en finance. Analyse la faisabilité financière et la crédibilité du plan de financement.',
    country: 'Tunisie',
    city: 'Sfax',
    expert: {
      headline: 'Jury — finance & financement',
      organization: 'PME Finance Partners',
      position: 'Directrice financière',
      years: 13,
      expertise: ['Finance & Comptabilité', 'Fundraising & Investissement'],
    },
  },
  {
    key: 'jury.market',
    email: 'jury.market@projectstruct.demo',
    firstName: 'Youssef',
    lastName: 'Ben Amor',
    role: 'EXPERT',
    bio: 'Jury expert en marchés à impact. Mesure l’adoption client et le potentiel de déploiement territorial.',
    country: 'Tunisie',
    city: 'Sousse',
    expert: {
      headline: 'Jury — marché & impact',
      organization: 'Impact Hub Tunis',
      position: 'Responsable ventures',
      years: 10,
      expertise: ['Impact Social', 'Agri-Tech', 'Med-Tech / Santé'],
    },
  },
  {
    key: 'owner.biocare',
    email: 'owner.biocare@projectstruct.demo',
    firstName: 'Meriem',
    lastName: 'Ferchichi',
    role: 'PROJECT_OWNER',
    bio: 'Cofondatrice de BioCare Tunisia. Ingénieure en agronomie, convaincue que la donnée peut régénérer les sols.',
    country: 'Tunisie',
    city: 'Kairouan',
    owner: {
      currentStatus: 'entrepreneur',
      educationLevel: 'bac+5',
      fieldOfStudy: 'Agronomie & systèmes d’information',
      occupation: 'Cofondatrice & CEO',
      experienceLevel: 2,
      hasPreviousStartup: true,
      skills: [
        { name: 'Agronomie de précision', level: 'expert' },
        { name: 'IoT industriel', level: 'intermediate' },
        { name: 'Business Model Canvas', level: 'advanced' },
        { name: 'Gestion de projet', level: 'advanced' },
      ],
      experiences: [
        {
          title: 'Cofondatrice & CEO',
          organization: 'BioCare Tunisia',
          description: 'Déploiement de capteurs de sol auprès de 12 coopératives pilotes.',
          start: '2024-03-01',
        },
        {
          title: 'Ingénieure agronome',
          organization: 'Groupement des Coopératives de Kairouan',
          description: 'Pilotage des plans de fertilisation de 3 000 hectares de céréales.',
          start: '2018-09-01',
          end: '2024-02-29',
        },
      ],
    },
  },
  {
    key: 'owner.agrismart',
    email: 'owner.agrismart@projectstruct.demo',
    firstName: 'Oussama',
    lastName: 'Ben Youssef',
    role: 'PROJECT_OWNER',
    bio: 'Fondateur d’AgriSmart. Transforme les résidus de cultures en substrats agricoles haute performance.',
    country: 'Tunisie',
    city: 'Sfax',
    owner: {
      currentStatus: 'entrepreneur',
      educationLevel: 'bac+5',
      fieldOfStudy: 'Biotechnologies végétales',
      occupation: 'Fondateur & directeur général',
      experienceLevel: 3,
      hasPreviousStartup: true,
      skills: [
        { name: 'Économie circulaire', level: 'expert' },
        { name: 'Procédés industriels', level: 'advanced' },
        { name: 'Business Model Canvas', level: 'intermediate' },
      ],
      experiences: [
        {
          title: 'Fondateur',
          organization: 'AgriSmart',
          description: 'Industrialisation du compostage de résidus agricoles.',
          start: '2022-05-01',
        },
        {
          title: 'Chef de production',
          organization: 'Sotuver Engrais',
          description: 'Conduite d’une unité de conditionnement d’engrais organiques.',
          start: '2016-01-01',
          end: '2022-04-30',
        },
      ],
    },
  },
  {
    key: 'owner.ecopack',
    email: 'owner.ecopack@projectstruct.demo',
    firstName: 'Ines',
    lastName: 'Bouzid',
    role: 'PROJECT_OWNER',
    bio: 'Fondatrice d’EcoPack. Conçoit des emballages comestibles à base d’algues pour la restauration collective.',
    country: 'Tunisie',
    city: 'Sousse',
    owner: {
      currentStatus: 'entrepreneur',
      educationLevel: 'bac+5',
      fieldOfStudy: 'Génie des matériaux',
      occupation: 'Fondatrice & directrice technique',
      experienceLevel: 1,
      hasPreviousStartup: false,
      skills: [
        { name: 'Éco-conception', level: 'expert' },
        { name: 'Science des matériaux', level: 'expert' },
        { name: 'Marketing Digital', level: 'beginner' },
      ],
      experiences: [
        {
          title: 'Fondatrice',
          organization: 'EcoPack',
          description: 'Première formulation d’emballage comestible à base d’algues locales.',
          start: '2025-02-01',
        },
        {
          title: 'Ingénieure R&D',
          organization: 'Institut Supérieur des Industries Alimentaires',
          description: 'Développement de biomatériaux pour l’emballage alimentaire.',
          start: '2021-10-01',
          end: '2025-01-31',
        },
      ],
    },
  },
  {
    key: 'owner.medconnect',
    email: 'owner.medconnect@projectstruct.demo',
    firstName: 'Aziz',
    lastName: 'Romdhani',
    role: 'PROJECT_OWNER',
    bio: 'Fondateur de MedConnect. Développe une télémonitoring cardiaque pour les patients ruraux.',
    country: 'Tunisie',
    city: 'Nabeul',
    owner: {
      currentStatus: 'salarié',
      educationLevel: 'bac+8',
      fieldOfStudy: 'Biomédical',
      occupation: 'Cofondateur & CTO',
      experienceLevel: 1,
      hasPreviousStartup: false,
      skills: [
        { name: 'Dispositifs médicaux', level: 'expert' },
        { name: 'Développement Mobile', level: 'advanced' },
        { name: 'Cybersécurité', level: 'intermediate' },
      ],
      experiences: [
        {
          title: 'Cofondateur & CTO',
          organization: 'MedConnect',
          description: 'Prototype de suivi ECG à distance certifié conformité.',
          start: '2025-06-01',
        },
        {
          title: 'Ingénieur biomédical',
          organization: 'CHU Habib Bourguiba',
          description: 'Maintenance et intégration des équipements de cardiologie.',
          start: '2020-03-01',
          end: '2025-05-31',
        },
      ],
    },
  },
  {
    key: 'owner.foodwaste',
    email: 'owner.foodwaste@projectstruct.demo',
    firstName: 'Sarra',
    lastName: 'Louhichi',
    role: 'PROJECT_OWNER',
    bio: 'Fondatrice de FoodWaste. Marketplace de revente des invendus alimentaires entre grossistes et associations.',
    country: 'Tunisie',
    city: 'Ariana',
    owner: {
      currentStatus: 'entrepreneur',
      educationLevel: 'bac+3',
      fieldOfStudy: 'Commerce & logistique',
      occupation: 'Fondatrice',
      experienceLevel: 1,
      hasPreviousStartup: false,
      skills: [
        { name: 'Ventes B2B', level: 'advanced' },
        { name: 'Logistique', level: 'intermediate' },
        { name: 'Marketing Digital', level: 'intermediate' },
      ],
      experiences: [
        {
          title: 'Fondatrice',
          organization: 'FoodWaste',
          description: 'Mise en relation de 18 grossistes avec 6 associations solidaires.',
          start: '2025-09-01',
        },
        {
          title: 'Chargée de clientèle',
          organization: 'Grossiste Delice Sud',
          description: 'Suivi des commandes et animation du portefeuille restauration.',
          start: '2022-06-01',
          end: '2025-08-31',
        },
      ],
    },
  },
];

export interface DemoIncubatorSpec {
  key: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  country: string;
  city: string;
  website: string;
  foundation: string;
  members: {
    userKey: string;
    role: 'ADMIN' | 'PROGRAM_MANAGER' | 'COHORT_MANAGER' | 'MEMBER';
    jobTitle: string;
    primary?: boolean;
    canManagePrograms?: boolean;
    canManageCohorts?: boolean;
    canManageMembers?: boolean;
  }[];
  documents: {
    type: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    reason?: string;
    uploadedBy: string;
  }[];
}

export const DEMO_INCUBATORS: DemoIncubatorSpec[] = [
  {
    key: 'atlas',
    name: 'Atlas Impact Hub',
    slug: 'atlas-impact-hub',
    description:
      'Incubateur tunisien dédié aux startups à impact environnemental et social. Accompagne les projets de l’ébauche du GBM jusqu’au dossier de financement.',
    email: 'contact@atlasimpact.tn',
    country: 'Tunisie',
    city: 'Tunis',
    website: 'https://atlasimpact.tn',
    foundation: '2021-04-12',
    members: [
      { userKey: 'admin', role: 'ADMIN', jobTitle: 'Directrice générale', primary: true, canManagePrograms: true, canManageCohorts: true, canManageMembers: true },
      { userKey: 'incubator', role: 'PROGRAM_MANAGER', jobTitle: 'Responsable de programme', canManagePrograms: true, canManageMembers: true },
      { userKey: 'manager', role: 'COHORT_MANAGER', jobTitle: 'Gérante de cohortes', canManageCohorts: true },
    ],
    documents: [
      { type: 'registre_de_commerce', status: 'APPROVED', uploadedBy: 'admin' },
      { type: 'attestation_fiscale', status: 'PENDING', uploadedBy: 'incubator' },
      { type: 'justificatif_domicile', status: 'REJECTED', reason: 'Document illisible : le scan est tronqué sur la marge droite. Merci de téléverser une copie complète.', uploadedBy: 'admin' },
    ],
  },
  {
    key: 'carthage',
    name: 'Carthage Green Lab',
    slug: 'carthage-green-lab',
    description:
      'Laboratoire d’incubation orienté agritech et économie circulaire, adossé à l’université de Sfax. Il héberge les programmes de transformation des résidus agricoles.',
    email: 'hello@carthagegreenlab.tn',
    country: 'Tunisie',
    city: 'Sfax',
    website: 'https://carthagegreenlab.tn',
    foundation: '2020-09-01',
    members: [
      { userKey: 'incubator', role: 'ADMIN', jobTitle: 'Directeur de programme', primary: true, canManagePrograms: true, canManageCohorts: true, canManageMembers: true },
      { userKey: 'manager', role: 'MEMBER', jobTitle: 'Coordinatrice cohortes' },
    ],
    documents: [{ type: 'registre_de_commerce', status: 'APPROVED', uploadedBy: 'incubator' }],
  },
  {
    key: 'med',
    name: 'Med & Health Startup Hub',
    slug: 'med-health-startup-hub',
    description:
      'Hub d’innovation en santé digitale rattaché à un pôle hospitalier universitaire. Soutient les dispositifs médicaux connectés et la télémédecine de proximité.',
    email: 'contact@medhealthhub.tn',
    country: 'Tunisie',
    city: 'Sousse',
    website: 'https://medhealthhub.tn',
    foundation: '2022-01-20',
    members: [
      { userKey: 'manager', role: 'ADMIN', jobTitle: 'Responsable du hub', primary: true, canManagePrograms: true, canManageCohorts: true, canManageMembers: true },
      { userKey: 'incubator', role: 'PROGRAM_MANAGER', jobTitle: 'Chargé de programme', canManagePrograms: true },
    ],
    documents: [{ type: 'attestation_fiscale', status: 'APPROVED', uploadedBy: 'manager' }],
  },
];

export interface DemoCohortSpec {
  key: string;
  name: string;
  program: string;
  description: string;
  capacity: number;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
  incubatorKey: string;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  coaches: string[];
  juries: string[];
}

export const DEMO_COHORTS: DemoCohortSpec[] = [
  {
    key: 'green',
    name: 'Green Startups Acceleration 2026',
    program: 'Accélération vert',
    description:
      'Programme de 16 semaines dédié aux startups réduisant l’empreinte environnementale des filières agricoles et industrielles tunisiennes. Il couvre le GBM, le plan d’affaires et l’accès au financement.',
    capacity: 15,
    status: 'IN_PROGRESS',
    incubatorKey: 'atlas',
    applicationDeadline: '2026-08-15T23:59:00.000Z',
    startDate: '2026-09-01T08:00:00.000Z',
    endDate: '2026-12-15T17:00:00.000Z',
    coaches: ['coach.business', 'coach.green', 'coach.marketing'],
    juries: ['jury.strategy', 'jury.finance', 'jury.market'],
  },
  {
    key: 'agritech',
    name: 'AgriTech & Food Innovation 2026',
    program: 'Agroalimentaire circulaire',
    description:
      'Programme d’incubation ciblant les solutions de valorisation des résidus, de traçabilité alimentaire et d’agriculture de précision, en partenariat avec les coopératives du Sahel.',
    capacity: 12,
    status: 'IN_PROGRESS',
    incubatorKey: 'carthage',
    applicationDeadline: '2026-08-10T23:59:00.000Z',
    startDate: '2026-08-25T08:00:00.000Z',
    endDate: '2026-11-28T17:00:00.000Z',
    coaches: ['coach.business', 'coach.finance'],
    juries: ['jury.strategy', 'jury.finance'],
  },
  {
    key: 'health',
    name: 'Digital Health & Impact 2026',
    program: 'Santé digitale',
    description:
      'Programme dédié aux dispositifs médicaux connectés et aux outils de suivi à distance. Il inclut un volet réglementaire, cybersécurité et financement public.',
    capacity: 10,
    status: 'OPEN',
    incubatorKey: 'med',
    applicationDeadline: '2026-10-25T23:59:00.000Z',
    startDate: '2026-11-05T08:00:00.000Z',
    endDate: '2027-02-20T17:00:00.000Z',
    coaches: ['coach.business'],
    juries: ['jury.market', 'jury.strategy'],
  },
  {
    key: 'fintech',
    name: 'Impact Fintech Acceleration 2027',
    program: 'Inclusion financière',
    description:
      'Programme d’accélération dédié aux solutions financières inclusives : crédit agricole digital, assurance paramétrique et paiement pour les micro-entreprises.',
    capacity: 10,
    status: 'OPEN',
    incubatorKey: 'atlas',
    applicationDeadline: '2026-11-30T23:59:00.000Z',
    startDate: '2027-01-12T08:00:00.000Z',
    endDate: '2027-04-16T17:00:00.000Z',
    coaches: ['coach.business', 'coach.finance'],
    juries: ['jury.strategy', 'jury.finance'],
  },
];

export interface DemoEvaluationCriteriaSpec {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export const DEMO_CRITERIA: DemoEvaluationCriteriaSpec[] = [
  { name: 'Problème & besoin client', description: 'Qualité de l’identification du problème, preuves de sa réalité et intensité du besoin.', weight: 15, maxScore: 5 },
  { name: 'Solution & proposition de valeur', description: 'Clarté, différenciation et crédibilité technique de la solution proposée.', weight: 15, maxScore: 5 },
  { name: 'Modèle économique & revenus', description: 'Logique de création de valeur, sources de revenus et cohérence des prix.', weight: 15, maxScore: 5 },
  { name: 'Équipe & capacité d’exécution', description: 'Complémentarités, expérience pertinente et capacité à délivrer.', weight: 10, maxScore: 5 },
  { name: 'Marché & positionnement', description: 'Taille du marché, segments ciblés et avantage concurrentiel défendable.', weight: 10, maxScore: 5 },
  { name: 'Impact environnemental & social', description: 'Contribution mesurable à la transition écologique et sociale.', weight: 15, maxScore: 5 },
  { name: 'Faisabilité financière', description: 'Structure de coûts, seuil de rentabilité et besoins de trésorerie.', weight: 10, maxScore: 5 },
  { name: 'Stratégie de financement', description: 'Dossier de financement, ambition de levée et crédibilité des hypothèses.', weight: 10, maxScore: 5 },
];

export interface GbmTheme {
  idea?: {
    idea_initial: string;
    product_service: string;
    customers: string;
    partners: string;
  };
  problems?: {
    environmental_challenges: string;
    social_challenges: string;
    customer_needs: string;
    team_motivations: string;
  };
  pestel?: Record<string, string>;
  objective?: Record<string, string>;
  missionVision?: { mission: string; vision: string; values: string };
  contextSummary?: string;
  stakeholders?: { name: string; role: string; interest: string; influence: string; engagement_strategy: string }[];
  stakeholderMaps?: { stakeholder_name: string; contribution: string; reward: string }[];
  segments?: { segment_name: string; description: string; pains: string; gains: string; functions: string }[];
  valueProposition?: Record<string, string>;
  tests?: { hypothesis: string; test_method: string; results: string; learnings: string; validated: boolean }[];
  pivot?: Record<string, string>;
  relations?: Record<string, string>;
  journeys?: { stage_name: string; touchpoints: string; customer_emotions: string; improvement_ideas: string }[];
  keyActivities?: Record<string, string>;
  ecoDesign?: Record<string, unknown>;
  ecoDesignResult?: Record<string, string>;
  summaryActivity?: Record<string, unknown>;
  costStructure?: Record<string, string>;
  revenueStream?: Record<string, string>;
  costRevenueSummary?: Record<string, unknown>;
  testPreparation?: Record<string, string>;
  indicator?: Record<string, string>;
  swot?: { strengths: string; weaknesses: string; opportunities: string; threats: string };
  managementPlan?: Record<string, string>;
  marketingPlan?: Record<string, string>;
  financialPlan?: Record<string, unknown>;
  legalPlan?: Record<string, string>;
  kpi?: Record<string, unknown>;
  executiveSummary?: { resume_executif: string; generated_by_ai: boolean };
  funding?: {
    answers: Record<string, boolean>;
    opportunites_financement?: unknown;
    opportunites_pays?: string;
    strategie_levee_fonds?: string;
  };
  market?: Record<string, unknown>;
  impact?: Record<string, unknown>;
}

export interface DemoProjectSpec {
  key: string;
  name: string;
  description: string;
  ownerEmail: string;
  cohortKey: string;
  completedSteps: string[];
  inProgressSteps: string[];
  isGbmReviewed?: boolean;
  businessPlanFinal?: boolean;
  gbm: GbmTheme;
  documents: { key: string; title: string; content: string }[];
}

const BI_CARE: GbmTheme = {
  idea: {
    idea_initial:
      'Les sols agricoles tunisiens se dégradent faute de données fiables : les coopératives n’ont ni mesure de la fertilité, ni suivi de l’humidité, ni diagnostic de contamination. BioCare propose un réseau de capteurs solaires low-cost installés dans les parcelles, couplé à une plateforme SaaS qui transforme les mesures brutes en recommandations d’irrigation, de fertilisation et de rotation des cultures.',
    product_service:
      '1) Capteurs solaires étanches mesurant température, humidité, pH, conductivité et matière organique estimée ; 2) passerelle LoRaWAN de collecte ; 3) plateforme web et mobile avec tableau de bord par parcelle, alertes et recommandations agronomiques ; 4) abonnement annuel par hectare suivi ; 5) service de diagnostic agronomique à la demande.',
    customers:
      'Coopératives agricoles de 40 à 800 adhérents, groupements de producteurs, grands exploitants céréaliers et maraîchers sous serre, sociétés de conseil en agriculture de précision et ONG de développement rural.',
    partners:
      'Institut National de Recherche Agronomique de Tunisie, Laboratoire d’électronique de l’Université de Gabès, opérateur national LoRaWAN, distributeurs de matériel agricole et ministère de l’Agriculture (programme d’irrigation intelligente).',
  },
  problems: {
    environmental_challenges:
      'Prélèvements agricoles représentant près de 90 % des usages de l’eau, salinisation accélérée des sols du centre et du sud, perte de 40 % de matière organique sur trente ans et effondrement de la biodiversité des sols.',
    social_challenges:
      'Vieillissement des exploitants, exode rural, inégalité d’accès à l’information agronomique et précarité des petits coopératifs qui ne peuvent financer des analyses de laboratoire.',
    customer_needs:
      'Savoir quand irriguer et combien, détecter les carences avant l’apparition des symptômes visibles, tracer les pratiques pour prouver leur durabilité sur les marchés export et auprès des financeurs.',
    team_motivations:
      'Trois fondateurs issus du monde agricole tunisien : réduire le gaspillage d’eau tout en augmentant les revenus des coopératives, et rendre l’agronomie de précision accessible aux petites structures.',
  },
  pestel: {
    political_what: 'Plan national d’irrigation intelligente et subventions à la modernisation des exploitations.',
    political_how: 'Adosser le déploiement aux programmes publics et aux coopératives déjà soutenues.',
    economic_what: 'Hausse du coût de l’énergie d’irrigation et pression sur les marges des céréaliers.',
    economic_how: 'Rentabilité du capteur en moins de deux saisons grâce aux économies d’eau et d’engrais.',
    social_what: 'Attente forte des jeunes exploitants pour des outils numériques simples.',
    social_how: 'Interface mobile en arabe et français, formation en présentiel dans les maisons de la coopérative.',
    technological_what: 'essor des réseaux LoRaWAN et des capteurs de sol à bas coût.',
    technological_how: 'Architecture modulaire permettant d’ajouter des capteurs sans changer de passerelle.',
    environmental_what: 'Pression réglementaire sur les rejets et les usages de l’eau.',
    environmental_how: 'Le produit produit un rapport d’impact directement exploitable pour les certifications.',
    legal_what: 'Loi 2010-1 relative à la protection de l’environnement et normes sur les données agricoles.',
    legal_how: 'Hébergement des données en Tunisie et clause de propriété des données attribuée à la coopérative.',
  },
  objective: {
    environmental_problems: 'Surconsommation d’eau d’irrigation et compactage des sols.',
    environmental_objectives: 'Réduire de 25 % le volume d’irrigation et augmenter de 15 % la matière organique en trois ans.',
    social_problems: 'Difficulté d’accès au conseil agronomique pour les petites coopératives.',
    social_objectives: 'Équiper 120 coopératives et former 600 agriculteurs en trois ans.',
    customer_problems: 'Décisions d’engrais prises à l’aveugle et pertes de rendement.',
    customer_objectives: 'Améliorer le rendement moyen de 12 % dès la première campagne.',
    team_problems: 'Manque d’expérience industrielle sur la fabrication des capteurs.',
    team_objectives: 'Sourcer un partenaire de fabrication tunisien avant le premier déploiement massif.',
  },
  missionVision: {
    mission: 'Donner à chaque exploitant tunisien la capacité de régénérer son sol avec des données fiables et accessibles.',
    vision: 'Un million d’hectares suivis durablement en Tunisie d’ici 2032, avec des coopératives qui revendiquent leurs sols comme un actif stratégique.',
    values: 'Rigueur agronomique, sobriété technologique, transparence des données, proximité de terrain.',
  },
  contextSummary:
    'BioCare répond à une double tension : des sols qui se dégradent plus vite qu’ils ne se régénèrent et des coopératives privées d’outils de décision faute de données. Le contexte réglementaire et les programmes publics d’irrigation intelligente créent une fenêtre d’adoption favorable, tandis que l’abaissement du coût des capteurs rend le modèle économiquement viable. Les objectifs retenus articulent impact environnemental (25 % d’eau économisée), impact social (600 agriculteurs formés) et performance agronomique (+12 % de rendement), ce qui structure l’ensemble des choix techniques et commerciaux du projet.',
  stakeholders: [
    { name: 'Coopératives agricoles membres', role: 'Client et utilisateur final', interest: 'Réduire les coûts d’irrigation et sécuriser les rendements', influence: 'Élevée : elles décident de l’adoption par leurs adhérents', engagement_strategy: 'Pilotes gratuits sur une campagne, comité de suivi trimestriel, formation sur site' },
    { name: 'Ministère de l’Agriculture', role: 'Autorité et financeur', interest: 'Atteindre les objectifs nationaux d’économie d’eau', influence: 'Très élevée : conditionne les subventions et les appels d’offres', engagement_strategy: 'Reporting d’impact standardisé et participation aux programmes pilotes' },
    { name: 'INRAT', role: 'Partenaire scientifique', interest: 'Valider la fiabilité des modèles agronomiques', influence: 'Élevée : crédibilise les recommandations', engagement_strategy: 'Protocole de validation conjoint et publication des résultats' },
    { name: 'Coopératives de distribution d’intrants', role: 'Partenaire commercial', interest: 'Augmenter les ventes d’engrais dosés', influence: 'Moyenne : accélère la distribution', engagement_strategy: 'Programme de vente croisée avec commission sur les volumes évités' },
    { name: 'Agriculteurs adhérents', role: 'Utilisateur quotidien', interest: 'Simplicité et gain de temps immédiat', influence: 'Moyenne mais décisive pour la rétention', engagement_strategy: 'Application mobile légère, assistance téléphonique en arabe' },
  ],
  stakeholderMaps: [
    { stakeholder_name: 'Coopératives agricoles membres', contribution: 'Accès aux parcelles, données agricoles historiques et relais de formation', reward: 'Tableaux de bord, recommandations et rapport d’impact valorisable' },
    { stakeholder_name: 'Ministère de l’Agriculture', contribution: 'Subventions, cadres réglementaires et label officiel', reward: 'Indicateurs nationaux d’économie d’eau documentés' },
    { stakeholder_name: 'INRAT', contribution: 'Protocoles agronomiques et laboratoire d’analyse', reward: 'Publication scientifique et donnée brute de terrain' },
    { stakeholder_name: 'Distributeurs d’intrants', contribution: 'Réseau commercial et logistique de proximité', reward: 'Volume de ventes ciblées et fidélisation des coopératives' },
  ],
  segments: [
    { segment_name: 'Coopératives céréalières du centre', description: 'Structures de 150 à 800 adhérents sur 300 à 2 000 ha de blé et d’orge.', pains: 'Fertilisation uniforme à l’aveugle, salinisation non détectée, coût de l’irrigation en hausse.', gains: 'Économie d’eau démontrée, fertilisation au plus juste, rapport d’impact pour les bailleurs.', functions: 'Suivi de parcelle, alertes, recommandation de dose, historique de campagne.' },
    { segment_name: 'Maraîchers sous serre', description: 'Exploitants intensifs de 5 à 60 ha, très sensibles à la qualité du substrat.', pains: 'Conductivité trop élevée, ravages précoces, perte de rendement hivernal.', gains: 'Alertes précoces, dosage d’irrigation fin, sécurisation de la récolte.', functions: 'Alertes, courbes de tendance, comparaison entre parcelles.' },
    { segment_name: 'ONG et programmes de développement', description: 'Programmes financés cherchant des indicateurs vérifiables de durabilité.', pains: 'Difficulté à mesurer et prouver l’impact sur le terrain.', gains: 'Indicateurs exportables, traçabilité par parcelle, rapports d’impact.', functions: 'Export des données, rapports PDF, indicateurs par périmètre.' },
  ],
  valueProposition: {
    environmental_value: 'Réduction mesurable de l’eau d’irrigation et reconstitution de la matière organique des sols.',
    social_value: 'Rendre l’agronomie de précision accessible aux coopératives de petite taille.',
    pain_relievers: 'Supprime l’arbitrage à l’aveugle sur l’irrigation et la fertilisation, et détecte les dérives avant les symptômes visibles.',
    gain_creators: 'Rapport d’impact opposable, historique de campagne et recommandations validées par l’INRAT.',
    products_services: 'Capteurs solaires, passerelle LoRaWAN, plateforme SaaS et diagnostic agronomique à la demande.',
    value_added: 'Moins de 400 TND par hectare et par an, soit un retour sur investissement en une campagne.',
    innovation_value: 'Modèle d’estimation de la matière organique par conductivité et retour d’expérience agronomique terrain.',
  },
  tests: [
    { hypothesis: 'Les coopératives paient un abonnement annuel dès lors que l’économie d’eau est prouvée sur une campagne.', test_method: 'Pilote gratuit sur 12 parcelles pendant la campagne blé 2025-2026 avec relevés hebdomadaires.', results: '11 des 12 coopératives ont renouvelé ; économie moyenne constatée de 22 % du volume d’irrigation.', learnings: 'Le seuil de déclenchement d’achat n’est pas le gain financier mais le rapport d’impact opposable devant le programme public.', validated: true },
    { hypothesis: 'Un capteur low-cost donne des mesures suffisamment fiables pour piloter la fertilisation.', test_method: 'Comparaison pendant 8 semaines avec des analyses de laboratoire sur échantillons prélevés.', results: 'Écart moyen de 6 % sur la conductivité, 9 % sur l’humidité à 20 cm.', learnings: 'La fréquence de calibration trimestrielle suffit ; un capteur sur cinq nécessite un remplacement prématuré.', validated: true },
    { hypothesis: 'La formation en présentiel est indispensable à l’adoption.', test_method: 'Deux groupes : un formé en présentiel, un formé uniquement par tutoriels vidéo.', results: 'Taux d’utilisation hebdomadaire de 78 % contre 41 % après six semaines.', learnings: 'La formation initiale en maison de coopérative reste un facteur déterminant de rétention.', validated: true },
  ],
  pivot: {
    initial_assumptions: 'Vendre des capteurs en matériel + un logiciel en licence annuelle, avec un panier moyen élevé.',
    test_results: 'Les coopératives refusent l’investissement initial et exigent un modèle à l’hectare suivi sans engagement long.',
    pivot_decision: 'Passer à un modèle d’abonnement pur, capteurs déposés en prêt, sans investissement initial.',
    new_value_proposition: 'Aucun investissement initial, un abonnement annuel par hectare suivi, matériel remplacé par nos soins.',
  },
  relations: {
    customer_relationships: 'Relation de proximité : un chargé de déploiement par gouvernorat, support téléphonique en arabe et réunion semestrielle avec le bureau de la coopérative.',
    channels: 'Vente directe auprès des bureaux de coopératives, salons agricoles (SIAG, Comité des Foires), presse spécialisée agricole et recommandation entre pairs.',
    distribution_strategy: 'Déploiement vallée par vallée pour concentrer la logistique et créer un effet de démonstration local.',
  },
  journeys: [
    { stage_name: 'Découverte', touchpoints: 'Salon agricole, recommandation d’une coopérative voisine, article de presse spécialisée', customer_emotions: 'Curiosité mêlée de scepticisme face à la technologie', improvement_ideas: 'Prévoir une démonstration sur parcelle pendant les salons' },
    { stage_name: 'Évaluation', touchpoints: 'Visite de pilote en fonctionnement, échange avec un pair déjà équipé, chiffrage personnalisé', customer_emotions: 'Intérêt croissant mais inquiétude sur la fiabilité des mesures', improvement_ideas: 'Publier les protocoles de validation INRAT et les résultats de campagne' },
    { stage_name: 'Adoption', touchpoints: 'Signature, installation en une demi-journée, formation des référents', customer_emotions: 'Soulagement d’un déploiement rapide, appréhension de la formation', improvement_ideas: 'Standardiser le kit d’installation et fournir une fiche de démarrage illustrée' },
    { stage_name: 'Usage', touchpoints: 'Tableau de bord hebdomadaire, alertes SMS, point mensuel avec le chargé de déploiement', customer_emotions: 'Confiance progressive, frustration lors des coupures réseau', improvement_ideas: 'Ajouter un mode hors-ligne et un résumé SMS hebdomadaire' },
    { stage_name: 'Fidélisation', touchpoints: 'Rapport de campagne annuel, remise sur le renouvellement, mise en avant lors des prix de la coopérative', customer_emotions: 'Fierté et sentiment d’avoir une longueur d’avance', improvement_ideas: 'Générer automatiquement le dossier de subvention à partir des données' },
  ],
  keyActivities: {
    key_activities: 'Conception et maintenance des capteurs, collecte et modélisation des données, accompagnement de déploiement, formation des agronomes, édition des rapports d’impact.',
    key_resources: 'Équipe d’ingénieurs agronomes et IoT, parc de capteurs déployés, plateforme SaaS, protocoles de validation INRAT, réseau de chargés de déploiement.',
    strategic_partners: 'INRAT pour la validation scientifique, opérateur LoRaWAN pour la connectivité, distributeurs d’intrants pour la force commerciale.',
  },
  ecoDesign: {
    equipe_eco: 'Une référente éco-conception nommée dans l’équipe produit, avec un point trimestriel de revue de cycle de vie.',
    projet_eco: 'Allonger la durée de vie des capteurs de 3 à 6 ans et réduire l’empreinte carbone du déploiement.',
    contexte_eco: 'Les capteurs sont déployés en champ ouvert : ils doivent résister à la chaleur, aux UV et aux eaux de pluie tout en restant réparables.',
    vision_durable: 'Un objet industriel sobre, réparable et recyclable, dont l’usage justifie largement son empreinte.',
    cycle_de_vie: {
      materiel_amont: 'Carte électronique assemblée à Tunis, boîtier en ABS recyclé, panneau solaire monocristallin.',
      fabrication: 'Assemblage semi-automatisé, tests de vieillissement accéléré de 200 heures.',
      distribution: 'Colis groupés par gouvernorat, transport mutualisé avec les distributeurs d’intrants.',
      utilisation: '6 ans en champ, calibration trimestrielle, remplacement du seul module de mesure si besoin.',
      fin_de_vie: 'Reprise des capteurs, dépose des batteries et refonte de la carte électronique.',
    } as Record<string, unknown>,
    performance_eco: 'Empreinte carbone estimée à 14 kg CO2e par capteur, amortie en 5 mois d’économies d’énergie d’irrigation.',
    strategies_eco: [
      'Conception modulaire : seul le module défaillant est remplacé.',
      'Boîtiers en plastique recyclé et emballage sans plastique.',
      'Réparation en atelier local plutôt que remplacement à l’unité.',
      'Reprise en fin de vie systématique contractuellement.',
    ] as unknown[],
    plan_action_eco: [
      { action: 'Audit de cycle de vie du capteur v2', echelle: 'Semestre 1', responsable: 'Référente éco-conception', avancement: 'Terminé' },
      { action: 'Passage du boîtier en ABS recyclé', echelle: 'Semestre 2', responsable: 'Responsable industriel', avancement: 'En cours' },
      { action: 'Atelier de reconditionnement dans chaque gouvernorat', echelle: 'Année 2', responsable: 'Directeur des opérations', avancement: 'Planifié' },
    ] as unknown[],
  },
  ecoDesignResult: {
    eco_results: 'Réduction de 31 % de la masse de plastique par capteur et division par deux des pièces non remplaçables.',
    performance_analysis: 'Le capteur v2 tient désormais 6 ans en conditions réelles, contre 3 ans pour la première génération.',
    improvements: 'Démontage sans outil, standardisation des connecteurs et récupération des batteries au lithium.',
  },
  summaryActivity: {
    activities_summary:
      'La phase de conception a été bouclée avec le capteur v2, 12 coopératives pilotes équipées et trois cycles de validation agronomique menés avec l’INRAT.',
    key_achievements: '• 22 % d’économie d’irrigation constatés\n• 11 coopératives sur 12 renouvelées\n• Protocole de validation publié avec l’INRAT',
    next_steps: '• Industrialiser le capteur v2\n• Étendre le déploiement à 30 coopératives\n• Constituer le dossier de subvention du programme national',
    generated_by_ai: true,
  } as Record<string, unknown>,
  costStructure: {
    fixed_costs: 'Salaires de l’équipe (7 ETP), loyer de l’atelier, abonnement plateforme cloud, assurance et maintenance de parc.',
    variable_costs: 'Composants électroniques, boîtiers, piles, transport de déploiement, frais de calibration.',
    cost_drivers: 'Le nombre de capteurs déployés et le taux de rotation du parc ; la logistique de terrain représente 18 % du coût variable.',
    breakeven_analysis: 'Seuil de rentabilité atteint à 2 400 hectares suivis, soit environ 34 coopératives de taille moyenne.',
  },
  revenueStream: {
    revenue_sources: 'Abonnement annuel par hectare suivi, service de diagnostic agronomique à la demande, vente de rapports d’impact aux bailleurs.',
    pricing_strategy: '48 TND par hectare et par an en tarif coopérative, 72 TND pour les grands exploitants, diagnostic à 900 TND la mission.',
    revenue_projections: 'Année 1 : 340 kTND ; année 2 : 1,1 M TND ; année 3 : 2,6 M TND sur la base d’un parc de 8 000 hectares.',
  },
  costRevenueSummary: {
    cost_summary: 'Coût complet de 38 TND par hectare et par an à 3 000 hectares suivi, en baisse de 27 % par rapport au pilote.',
    revenue_summary: 'Marge brute de 61 % sur l’abonnement, portée par l’amortissement du parc de capteurs sur six ans.',
    financial_health: 'Trésorerie positive dès le 14e mois à condition d’atteindre 2 400 hectares avant la fin du deuxième exercice.',
    generated_by_ai: true,
  } as Record<string, unknown>,
  testPreparation: {
    test_objectives: 'Valider la fiabilité du capteur v2 sur une campagne complète et mesurer l’impact sur le rendement.',
    test_method: 'Expérimentation conduite sur 24 parcelles réparties en trois gouvernorats, avec témoins non équipés.',
    success_criteria: 'Écart de mesure inférieur à 8 % par rapport au laboratoire et rendement supérieur de 10 % sur les parcelles équipées.',
    resources_needed: '48 capteurs, 3 techniciens de terrain, analyses de laboratoire trimestrielles, logiciel de statistique.',
    timeline: 'Préparation en 3 semaines, campagne de 16 semaines, restitution et rapport en 3 semaines.',
  },
  indicator: {
    environmental_kpis: 'Volume d’irrigation par hectare (m3/ha), taux de matière organique (%), conductivité électrique du sol (dS/m), kg CO2e évités.',
    social_kpis: 'Nombre d’agriculteurs formés, part de femmes parmi les bénéficiaires, nombre de coopératives équipées.',
    economic_kpis: 'Rendement moyen (q/ha), coût d’irrigation par quintal, taux de renouvellement des abonnements, marge brute.',
    measurement_method: 'Collecte automatisée par les capteurs, enquêtes semestrielles auprès des coopératives et analyses de laboratoire trimestrielles.',
    review_frequency: 'Revue mensuelle des indicateurs opérationnels et revue semestrielle du comité de pilotage.',
  },
  swot: {
    strengths: 'Protocoles agronomiques validés par l’INRAT, modèle sans investissement initial, économies d’eau mesurées et témoignages de coopératives renouvelantes.',
    weaknesses: 'Dépendance au réseau LoRaWAN en zones reculées, équipe commerciale encore réduite, besoin en fonds de roulement lié au stock de capteurs.',
    opportunities: 'Programme national d’irrigation intelligente, exigences croissantes de traçabilité à l’export, extension possible à l’agriculture maraîchère sous serre.',
    threats: 'Entrée d’un concurrent disposant d’un réseau de distribution existant, hausse du coût des composants électroniques, coupures réseau prolongées pendant les campagnes.',
  },
  managementPlan: {
    problemes_gestion: 'Coordonner la production de capteurs, le déploiement terrain et le support sans diluer la responsabilité agronomique.',
    ressources_humaines: '7 ETP aujourd’hui : 2 ingénieurs IoT, 2 agronomes, 1 responsable déploiement, 1 commercial, 1 administrateur. Recrutement de 3 chargés de déploiement en année 2.',
    actifs_physiques: 'Atelier d’assemblage de 180 m2 à Kairouan, parc de 400 capteurs déployés, véhicule utilitaire mutualisé.',
    ressources_intellectuelles: 'Modèles de recommandation agronomique, base de données de campagnes, marques déposées sur l’algorithme d’estimation.',
    production_fournisseurs: 'Assemblage interne, sourcing de deux fournisseurs alternatifs pour les cartes électroniques et contractualisation d’un réparateur local.',
  },
  marketingPlan: {
    clients_valeur: 'Coopératives céréalières et maraîchers sous serre cherchant à sécuriser leurs rendements et à prouver leur durabilité.',
    analyse_marche: '840 coopératives actives en Tunisie, dont 320 sur des zones éligibles au programme national d’irrigation intelligente.',
    concurrents: 'Deux acteurs importés au modèle cher, un prestataire de conseil sans capteur et aucun acteur local sur l’abonnement.',
    offre_prix: '48 TND/ha/an, diagnostic à 900 TND, remise de 15 % au-delà de 200 hectares.',
    branding_positionnement: 'Le partenaire de terrain des coopératives, ni purement technologique ni purement agronomique.',
    canaux_communication: 'Salons agricoles, presse coopérative, bouche-à-oreille entre coopératives et partenariats avec les distributeurs d’intrants.',
    relation_client: 'Chargé de déploiement dédié par gouvernorat, point semestriel avec le bureau et canal téléphonique en arabe.',
  },
  financialPlan: {
    point_depart: 'Amorçage de 480 kTND (300 kTND fonds propres, 180 kTND subvention) et 12 coopératives pilotes.',
    couts_configuration: 480000,
    capital: 300000,
    compte_resultat: [
      { annee: 'Année 1', chiffre_affaires: 340000, charges: 410000, resultat: -70000 },
      { annee: 'Année 2', chiffre_affaires: 1100000, charges: 860000, resultat: 240000 },
      { annee: 'Année 3', chiffre_affaires: 2600000, charges: 1780000, resultat: 820000 },
    ] as unknown[],
    cash_flow: [
      { mois: 'M6', cumule: -180000 },
      { mois: 'M12', cumule: -245000 },
      { mois: 'M18', cumule: -90000 },
      { mois: 'M24', cumule: 130000 },
    ] as unknown[],
    bilan: { actif: { immobilisations: 380000, stocks: 210000, tresorerie: 145000 }, passif: { capital: 300000, emprunts: 180000, reserves: -120000 } },
    seuil_rentabilite: 2400,
    revenus_3ans: [
      { annee: 1, montant: 340000 },
      { annee: 2, montant: 1100000 },
      { annee: 3, montant: 2600000 },
    ] as unknown[],
    autres_mesures: 'Affacturage sur 45 jours pour absorber la saisonnalité des renouvellements (juillet-août).',
    rapport_financier: 'Prévisionnel mensuel glissant sur 24 mois, revue par le comité de suivi chaque trimestre.',
  } as Record<string, unknown>,
  legalPlan: {
    statut_juridique: 'SARL au capital de 300 000 TND, à associé unique, avec pacte d’associés encadrant la cession.',
    immatriculation: 'Immatriculation au RC de Kairouan, affiliation à la CNSS et déclaration fiscale initiale effectuées.',
    contrats: 'Contrat de prestation avec la coopérative, contrat de dépôt de matériel, accord de confidentialité avec l’INRAT.',
    assurances: 'Assurance responsabilité civile professionnelle et assurance du parc de capteurs déployés.',
  },
  kpi: {
    kpis: [
      { nom: 'Hectares suivis', cible: '3 000', perimetre: 'Commercial' },
      { nom: 'Taux de renouvellement', cible: '90 %', perimetre: 'Rétention' },
      { nom: 'Économie d’eau moyenne', cible: '25 %', perimetre: 'Impact' },
      { nom: 'Agriculteurs formés', cible: '600', perimetre: 'Impact social' },
      { nom: 'Disponibilité de la plateforme', cible: '99,5 %', perimetre: 'Technique' },
    ] as unknown[],
    objectifs_mesure: 'Chaque indicateur est rattaché à un responsable, une source de donnée et une fréquence de revue.',
    revues_performance: 'Point hebdomadaire opérationnel, revue mensuelle du comité de direction, revue semestrielle du conseil.',
  } as Record<string, unknown>,
  executiveSummary: {
    resume_executif:
      'BioCare Tunisia équipe les coopératives agricoles tunisiennes de capteurs solaires connectés et d’une plateforme d’analyse qui traduit les mesures de sol en recommandations d’irrigation et de fertilisation. Après douze coopératives pilotes, l’entreprise constate 22 % d’économie d’eau, un taux de renouvellement de 92 % et un retour sur investissement en moins d’une campagne. Le modèle repose sur un abonnement annuel par hectare suivi, sans investissement initial pour la coopérative, ce qui lève le principal obstacle à l’adoption. BioCare sollicite 1,2 M TND pour industrialiser le capteur v2, étendre le déploiement à 30 coopératives et structurer la force commerciale sur trois gouvernorats supplémentaires. Le plan prévoit l’équilibre au 14e mois et une marge brute de 61 % à trois ans.',
    generated_by_ai: false,
  },
  funding: {
    answers: {
      q1: true, q2: true, q3: true, q4: true, q5: true, q6: false,
      q7: false, q8: false, q9: true, q10: true, q11: false, q12: false,
    },
    opportunites_financement: [
      { source: 'Programme national d’irrigation intelligente', type: 'Subvention', montant_estime: 450000, statut: 'Dossier en préparation' },
      { source: 'Fonds vert Maghreb', type: 'Prêt concessionnel', montant_estime: 700000, statut: 'Pré-qualification obtenue' },
      { source: 'Love money & business angels tunisiens', type: 'Equity', montant_estime: 500000, statut: 'Discussion en cours' },
    ] as unknown[],
    opportunites_pays: 'Tunisie d’abord, puis Algérie et Maroc sur les filières céréalières, et Jordanie pour l’irrigation sous serre.',
    strategie_levee_fonds:
      'Trois temps : une subvention publique pour financer l’industrialisation du capteur v2, un prêt à taux bonifié pour le stock de départ, puis une levée en capital de 1,2 M TND au 18e mois pour accélérer l’expansion commerciale.',
  },
  market: {
    essence_marque: 'Le partenaire de terrain qui rend la donnée agronomique utile, compréhensible et opposable.',
    alignement_objectifs: 'Chaque prise de parole doit démontrer une économie d’eau réelle et une progression de matière organique.',
    positionnement: 'Ni purement technologique, ni purement agronomique : l’interface entre les deux, au service des coopératives.',
    identite_visuelle: 'Un vert profond et une terre ocre, typographie sobre, pictogrammes de parcelles, sobriété assumée.',
    narration: '« Le sol se souvient de ce qu’on lui donne. Rendons-lui la parole. »',
    messages_cles: [
      { cible: 'Coopératives', message: 'Aucun investissement initial, des économies d’eau prouvées à la première campagne.' },
      { cible: 'Bailleurs', message: 'Des indicateurs d’impact traçables parcelle par parcelle.' },
      { cible: 'Distributeurs', message: 'Une vente d’intrants mieux ciblée et moins risquée.' },
    ] as unknown[],
    canaux_marketing: [
      { canal: 'Salons agricoles', part: '35 %', role: 'Démonstration terrain' },
      { canal: 'Presse coopérative', part: '20 %', role: 'Crédibilité' },
      { canal: 'Recommandation entre pairs', part: '30 %', role: 'Conversion' },
      { canal: 'Partenariats distributeurs', part: '15 %', role: 'Distribution' },
    ] as unknown[],
    partenariats_market: ['Distributeurs d’intrants sur 3 gouvernorats', 'Maison de la Coopérative de Kairouan', 'Programme public d’irrigation intelligente'],
  } as Record<string, unknown>,
  impact: {
    kpis_environnementaux: [
      { nom: 'Volume d’irrigation évité', unite: 'm3/ha', cible: '-25 %' },
      { nom: 'Matière organique du sol', unite: '%', cible: '+15 % en 3 ans' },
      { nom: 'Émissions évitées', unite: 'kg CO2e', cible: '1 200 t/an' },
    ] as unknown[],
    kpis_sociaux: [
      { nom: 'Agriculteurs formés', unite: 'personnes', cible: '600' },
      { nom: 'Coopératives équipées', unite: 'structures', cible: '120' },
      { nom: 'Part de femmes bénéficiaires', unite: '%', cible: '30 %' },
    ] as unknown[],
    kpis_economiques: [
      { nom: 'Rendement moyen', unite: 'q/ha', cible: '+12 %' },
      { nom: 'Coût d’irrigation par quintal', unite: 'TND', cible: '-18 %' },
    ] as unknown[],
    methode_mesure: 'Collecte automatisée par les capteurs, enquêtes semestrielles auprès des coopératives et analyses de laboratoire trimestrielles.',
    periode_mesure: 'QUARTERLY',
    objectifs_impact: [
      { horizon: '2027', cible: '3 000 hectares suivis' },
      { horizon: '2029', cible: '8 000 hectares suivis' },
      { horizon: '2032', cible: '1 million d’hectares suivis' },
    ] as unknown[],
    resultats_actuels: { annee: '2026', hectares: 1240, agriculteurs_formes: 187, economie_eau: '22 %' },
    rapport_impact: 'Rapport annuel publié avec l’INRAT, méthodologie ouverte et données agrégées disponibles sur demande.',
  } as Record<string, unknown>,
};

const AGRI_SMART: GbmTheme = {
  idea: {
    idea_initial:
      'Chaque année, les filières céréalières et maraîchères produisent des résidus agricoles enfouis ou brûlés. AgriSmart les transforme en substrats compostés haute performance, conditionnés en sacs et vendus aux coopératives, pépiniéristes et grands exploitants.',
    product_service:
      '1) Collecte et tri des résidus de paille, coques d’amandes et marc de tomate ; 2) compostage en andains avec contrôle de température ; 3) substrat conditionné de 20 et 40 litres ; 4) service de conseil en amendement organique.',
    customers:
      'Pépiniéristes, maraîchers sous serre, pépiniéristes forestiers, collectivités locales pour les plantations urbaines et coopératives d’amendements.',
    partners:
      'Chambres de l’agriculture de Sfax, unités de transformation de la tomate, coopératives de paille et service régional des forêts.',
  },
  problems: {
    environmental_challenges:
      'Enfouissement et brûlage de 300 000 tonnes de résidus par an, émissions de méthane, appauvrissement des sols en matière organique et dépendance aux engrais importés.',
    social_challenges:
      'Perte de valeur pour les agriculteurs, emplois non qualifiés dans le tri et pollution atmosphérique saisonnière liée aux brûlages.',
    customer_needs:
      'Disposer d’un substrat stable, exempt de graines de mauvaises herbes et à un prix inférieur à celui du terreau importé.',
    team_motivations:
      'Transformer un déchet coûteux en un produit agronomique utile et créer des emplois locaux en zone rurale.',
  },
  pestel: {
    political_what: 'Interdiction progressive des brûlages et incitations au recyclage des biomasses.',
    political_how: 'Se positionner comme opérateur agréé de valorisation des résidus.',
    economic_what: 'Hausse du prix des engrais importés et pression sur les coûts de production.',
    economic_how: 'Proposer un substrat 30 % moins cher que le terreau importé.',
    social_what: 'Demande croissante d’agriculture biologique et de traçabilité.',
    social_how: 'Certification biologique du substrat et traçabilité par lot.',
    technological_what: 'Maturité des procédés de compostage en andains contrôlés.',
    technological_how: 'Pilotage par capteurs de température et sondes d’humidité.',
    environmental_what: 'Objectifs nationaux de réduction des gaz à effet de serre agricoles.',
    environmental_how: 'Chaque tonne compostée évite l’enfouissement et substitue un engrais importé.',
    legal_what: 'Réglementation sur les déchets organiques et normes de compost.',
    legal_how: 'Obtenir l’agrément de valorisation et la certification NF Compost.',
  },
  objective: {
    environmental_problems: 'Brûlage et enfouissement des résidus agricoles.',
    environmental_objectives: 'Valoriser 8 000 tonnes de résidus par an et éviter 1 400 tonnes de CO2e.',
    social_problems: 'Perte de valeur pour les filières locales.',
    social_objectives: 'Créer 12 emplois directs et intégrer 60 agriculteurs fournisseurs.',
    customer_problems: 'Substrats importés chers et irréguliers en qualité.',
    customer_objectives: 'Livrer un substrat standardisé à moins de 30 % du prix du terreau importé.',
    team_problems: 'Maîtrise encore partielle du procédé à grande échelle.',
    team_objectives: 'Stabiliser le rendement de l’unité à 92 % de sa capacité nominale.',
  },
  missionVision: {
    mission: 'Faire du résidu agricole une ressource agronomique locale, fiable et accessible.',
    vision: 'La référence maghrébine de la valorisation des biomasses résiduelles en amendements organiques.',
    values: 'Sobriété procédé, excellence agronomique, circuit court, équité envers les agriculteurs fournisseurs.',
  },
  contextSummary:
    'AgriSmart s’inscrit dans un contexte où les résidus agricoles sont massivement brûlés ou enfouis alors que la demande en amendements organiques croît avec le prix des engrais importés. La réglementation sur les brûlages et les objectifs climatiques nationaux créent un levier réglementaire favorable. Le projet tire parti d’un gisement local identifié et d’un procédé technologiquement maîtrisé, tout en devant stabiliser sa qualité à l’échelle industrielle.',
  stakeholders: [
    { name: 'Unités de transformation de la tomate', role: 'Fournisseur de résidus', interest: 'Se débarrasser d’un déchet coûteux à évacuer', influence: 'Élevée : elles conditionnent le volume d’entrée', engagement_strategy: 'Contrat d’enlèvement gratuit annuel avec traçabilité' },
    { name: 'Coopératives de maraîchers', role: 'Client final', interest: 'Réduire le coût d’amendement', influence: 'Élevée : elles valident ou non le produit', engagement_strategy: 'Essais gratuits sur une saison et garantie de résultat' },
    { name: 'Service régional des forêts', role: 'Acheteur public', interest: 'Trouver un substrat pour les pépinières forestières', influence: 'Moyenne : commande publique significative', engagement_strategy: 'Répondre aux appels d’offres avec un produit certifié' },
    { name: 'Chambre de l’agriculture de Sfax', role: 'Facilitateur', interest: 'Développer les bonnes pratiques de valorisation', influence: 'Moyenne : apporte la crédibilité locale', engagement_strategy: 'Co-organisation de journées de démonstration' },
  ],
  stakeholderMaps: [
    { stakeholder_name: 'Unités de transformation de la tomate', contribution: 'Marc et pépins en volume, accès au site', reward: 'Évacuation gratuite et certificat de valorisation' },
    { stakeholder_name: 'Coopératives de maraîchers', contribution: 'Commandes récurrentes et retour terrain', reward: 'Substrat à prix contenu et conseil en amendement' },
    { stakeholder_name: 'Service régional des forêts', contribution: 'Commande publique et pépinière d’essai', reward: 'Substrat local tracé et plan de plantation sécurisé' },
  ],
  segments: [
    { segment_name: 'Maraîchers sous serre', description: 'Exploitants de 3 à 40 ha recherchant un substrat stable pour les cycles courts.', pains: 'Prix élevé du terreau importé, mauvaises herbes et maladies du substrat.', gains: 'Prix maîtrisé, qualité constante, conseil agronomique inclus.', functions: 'Conditionnement 20 et 40 litres, livraison, diagnostic de sol.' },
    { segment_name: 'Pépiniéristes forestiers', description: 'Structures publiques et privées produisant des plants destinés aux reboisements.', pains: 'Rareté d’un substrat conforme aux cahiers des charges de plantation.', gains: 'Produit certifié, disponibilité garantie, traçabilité par lot.', functions: 'Livraison en vrac, fiche technique par lot.' },
  ],
  valueProposition: {
    environmental_value: 'Substitution d’un engrais importé et valorisation de résidus autrefois brûlés.',
    social_value: 'Emplois ruraux non délocalisables et rémunération des agriculteurs fournisseurs.',
    pain_relievers: 'Supprime le coût d’évacuation des résidus pour le transformateur et l’incertitude de qualité pour le maraîcher.',
    gain_creators: 'Substrat tracé, fiche d’analyse par lot et conseil agronomique inclus.',
    products_services: 'Substrat composté conditionné, service de conseil, diagnostic de sol.',
    value_added: '30 % moins cher que le terreau importé avec une conductivité maîtrisée.',
    innovation_value: 'Procédé de compostage en andains piloté par sonde avec inoculant sélectionné.',
  },
  tests: [
    { hypothesis: 'Le maraîcher accepte un substrat issu de résidus de tomate sur son cycle court.', test_method: 'Essai comparatif sur 6 serres pendant deux cycles, avec témoin en terreau importé.', results: 'Rendements équivalents à ±3 % et absence de maladies supplémentaires.', learnings: 'La réticence initiale disparaît dès la première récolte comparée.', validated: true },
    { hypothesis: 'La collecte gratuite des résidus est suffisante pour sécuriser le volume.', test_method: 'Conventions avec trois unités de transformation sur une campagne.', results: '7 200 tonnes engagées pour 5 400 réellement collectées.', learnings: 'Il faut contractualiser avec cinq unités pour sécuriser 8 000 tonnes.', validated: false },
  ],
  pivot: {
    initial_assumptions: 'Vendre du compost en vrac aux coopératives uniquement.',
    test_results: 'Le vrac impose des volumes importants et une logistique lourde ; les pépiniéristes demandent des conditionnements unitaires.',
    pivot_decision: 'Compléter le vrac par un conditionnement 20 et 40 litres destiné aux pépiniéristes et maraîchers.',
    new_value_proposition: 'Deux formats, une qualité unique, un prix au kilogramme compétitif.',
  },
  relations: {
    customer_relationships: 'Vente directe avec essai sur parcelle, suivi agronomique saisonnier et réunion technique semestrielle.',
    channels: 'Réseau des coopératives, distributeurs d’intrants, appels d’offres publics et salon SIAG.',
    distribution_strategy: 'Dépôt central à Sfax et livraison groupée hebdomadaire sur trois gouvernorats.',
  },
  journeys: [
    { stage_name: 'Prise de contact', touchpoints: 'Salon SIAG, recommandation d’un pair, visite de l’unité', customer_emotions: 'Curiosité teintée de méfiance sur l’origine des résidus', improvement_ideas: 'Organiser des journées portes ouvertes de l’unité' },
    { stage_name: 'Essai', touchpoints: 'Lot gratuit de 20 sacs, fiche d’analyse, suivi agronomique', customer_emotions: 'Volonté de comparer objectivement', improvement_ideas: 'Fournir un dispositif d’essai comparatif prêt à installer' },
    { stage_name: 'Adoption', touchpoints: 'Commande saisonnière, contrat d’approvisionnement annuel', customer_emotions: 'Confiance consolidée', improvement_ideas: 'Proposer un tarif dégressif par volume engagé' },
  ],
  keyActivities: {
    key_activities: 'Collecte et tri des résidus, compostage contrôlé, contrôle qualité par lot, conditionnement, conseil agronomique.',
    key_resources: 'Site de compostage de 1,2 hectare, trieur, tracteur et andineuse, laboratoire de contrôle, équipe de 12 personnes.',
    strategic_partners: 'Unités de transformation pour l’approvisionnement, Chambre d’agriculture pour la démonstration.',
  },
  costStructure: {
    fixed_costs: 'Salaires de 12 ETP, location du site, maintenance des machines, assurance, amortissements.',
    variable_costs: 'Collecte des résidus, énergie de l’andineuse, emballages, transport de livraison.',
    cost_drivers: 'Le taux de remplissage de l’unité et le prix du conditionnement ; la collecte pèse 22 % du coût variable.',
    breakeven_analysis: 'Seuil de rentabilité à 5 200 tonnes traitées par an, soit 65 % de la capacité nominale.',
  },
  revenueStream: {
    revenue_sources: 'Vente de substrat en vrac et en sac, service de diagnostic de sol, prestations de conseil en amendement.',
    pricing_strategy: '0,95 TND/kg en vrac, 1,35 TND/kg en sac de 20 litres, diagnostic à 600 TND.',
    revenue_projections: 'Année 1 : 780 kTND ; année 2 : 1,6 M TND ; année 3 : 2,4 M TND.',
  },
  costRevenueSummary: {
    cost_summary: 'Coût complet de 0,71 TND/kg à 5 200 tonnes, en baisse de 19 % par rapport au lot pilote.',
    revenue_summary: 'Marge brute de 25 % en vrac et 47 % en conditionnement.',
    financial_health: 'Le conditionnement constitue le relais de marge principal et doit représenter 40 % du volume dès la deuxième année.',
    generated_by_ai: true,
  } as Record<string, unknown>,
  indicator: {
    environmental_kpis: 'Tonnes de résidus valorisées, tonnes de CO2e évitées, part de substitution aux engrais importés.',
    social_kpis: 'Emplois directs créés, agriculteurs fournisseurs rémunérés, journées de démonstration organisées.',
    economic_kpis: 'Tonnes produites, marge par tonne, taux de remplissage de l’unité, encours moyen des commandes.',
    measurement_method: 'Pesée à l’entrée et à la sortie, bilan carbone simplifié et registre des commandes.',
    review_frequency: 'Revue hebdomadaire de production et revue mensuelle de performance commerciale.',
  },
  swot: {
    strengths: 'Gisement de résidus sécurisé, procédé maîtrisé, coût de revient inférieur au concurrent importé et ancrage local fort.',
    weaknesses: 'Qualité à stabiliser à l’échelle, besoin en fonds de roulement lié à la saisonnalité et dépendance à la collecte.',
    opportunities: 'Hausse du prix des engrais importés, interdiction des brûlages et commande publique de reboisement.',
    threats: 'Entrée d’un acteur agricole déjà équipé, aléas climatiques sur la disponibilité des résidus et concurrence du compost de déchets verts.',
  },
  managementPlan: {
    problemes_gestion: 'Concilier saisonnalité de la collecte et continuité de la production tout en maintenant la qualité.',
    ressources_humaines: '12 ETP : 1 responsable d’unité, 2 opérateurs, 3 ouvriers de collecte, 1 agronome, 1 qualité, 2 commerciaux, 2 administratifs.',
    actifs_physiques: 'Site de compostage de 1,2 ha, andineuse, trieur, chargeuse, 2 véhicules utilitaires et silo de conditionnement.',
    ressources_intellectuelles: 'Recette d’inoculant, protocole de contrôle qualité par lot et base de données agronomiques.',
    production_fournisseurs: 'Deux fournisseurs d’emballages et un atelier de maintenance mécanique sous contrat.',
  },
  marketingPlan: {
    clients_valeur: 'Maraîchers sous serre et pépiniéristes cherchant un substrat fiable à prix maîtrisé.',
    analyse_marche: '1 100 maraîchers sous serre et 38 pépiniéristes dans les trois gouvernorats ciblés.',
    concurrents: 'Terreau importé, compost de déchets verts communal et produits de la petite industrie locale.',
    offre_prix: '0,95 TND/kg en vrac et 1,35 TND/kg en sac, avec remise fidélité de 8 % au-delà de 5 tonnes.',
    branding_positionnement: 'Le substrat local tracé, fabriqué à partir de ce que la région jette.',
    canaux_communication: 'Salons agricoles, démonstrations sur parcelle, presse spécialisée et réseau des coopératives.',
    relation_client: 'Agronome référent par zone, visites de suivi deux fois par saison.',
  },
  financialPlan: {
    point_depart: 'Unité pilote de 800 tonnes et commande ferme d’une pépinière forestière.',
    couts_configuration: 950000,
    capital: 600000,
    compte_resultat: [
      { annee: 'Année 1', chiffre_affaires: 780000, charges: 830000, resultat: -50000 },
      { annee: 'Année 2', chiffre_affaires: 1600000, charges: 1340000, resultat: 260000 },
      { annee: 'Année 3', chiffre_affaires: 2400000, charges: 1950000, resultat: 450000 },
    ] as unknown[],
    seuil_rentabilite: 5200,
    revenus_3ans: [
      { annee: 1, montant: 780000 },
      { annee: 2, montant: 1600000 },
      { annee: 3, montant: 2400000 },
    ] as unknown[],
    autres_mesures: 'Facilité de trésorerie de 300 kTND pour absorber la campagne de collecte estivale.',
    rapport_financier: 'Suivi mensuel du coût par tonne et revue trimestrielle du seuil de rentabilité.',
  } as Record<string, unknown>,
  legalPlan: {
    statut_juridique: 'SARL au capital de 600 000 TND, deux associés, avec clause de préemption mutuelle.',
    immatriculation: 'Immatriculation au RC de Sfax et inscription au registre des exploitants de déchets.',
    contrats: 'Convention d’enlèvement avec les unités de transformation et contrat d’approvisionnement annuel avec les coopératives.',
    assurances: 'Assurance responsabilité civile professionnelle et assurance des stocks de compost.',
  },
  kpi: {
    kpis: [
      { nom: 'Tonnes valorisées', cible: '8 000', perimetre: 'Production' },
      { nom: 'Taux de remplissage', cible: '92 %', perimetre: 'Production' },
      { nom: 'Marge brute par tonne', cible: '0,24 TND', perimetre: 'Commercial' },
      { nom: 'CO2e évité', cible: '1 400 t', perimetre: 'Impact' },
    ] as unknown[],
    objectifs_mesure: 'Chaque indicateur est rattaché à une pesée ou à un registre de commande.',
    revues_performance: 'Point de production hebdomadaire et revue de direction mensuelle.',
  } as Record<string, unknown>,
  executiveSummary: {
    resume_executif:
      'AgriSmart transforme les résidus agricoles de la région de Sfax en substrats compostés haute performance. L’unité sécurise son approvisionnement par conventions avec cinq unités de transformation et s’appuie sur un procédé de compostage piloté par sondes, validé sur deux cycles comparatifs. Le modèle combine la vente en vrac aux coopératives et un conditionnement unitaire à forte marge destiné aux pépiniéristes. Le plan prévoit un chiffre d’affaires de 780 kTND la première année et l’équilibre à 5 200 tonnes traitées, avec une levée de 950 kTND pour porter la capacité à 8 000 tonnes.',
    generated_by_ai: false,
  },
  funding: {
    answers: {
      q1: true, q2: true, q3: true, q4: false, q5: true, q6: false,
      q7: true, q8: false, q9: true, q10: true, q11: true, q12: false,
    },
    opportunites_financement: [
      { source: 'Fonds de développement agricole', type: 'Subvention', montant_estime: 380000, statut: 'Dossier déposé' },
      { source: 'Banque de développement (prêt vert)', type: 'Prêt', montant_estime: 600000, statut: 'Étude de dossier' },
    ] as unknown[],
    opportunites_pays: 'Tunisie, puis Algérie sur les filières tomate et huile d’olive.',
    strategie_levee_fonds:
      'Subvention publique pour l’équipement de collecte, prêt bancaire pour le site puis augmentation de capital ciblant un investisseur industriel agroalimentaire.',
  },
  market: {
    essence_marque: 'La valeur qui sort du champ et y retourne.',
    alignement_objectifs: 'Prouver que le déchet local vaut mieux que l’intrant importé.',
    positionnement: 'Substrat tracé de proximité, à prix contenu, pour les filières exigeantes.',
    identite_visuelle: 'Ambre et vert feuille, typographie industrielle, motifs de résidus agricoles.',
    narration: '« Ce que la terre donne, elle le reçoit. »',
    messages_cles: [
      { cible: 'Maraîchers', message: '30 % moins cher que le terreau importé, qualité analysée à chaque lot.' },
      { cible: 'Transformateurs', message: 'Votre déchet devient un certificat de valorisation.' },
    ] as unknown[],
    canaux_marketing: [
      { canal: 'Salons agricoles', part: '40 %', role: 'Démonstration' },
      { canal: 'Coopératives', part: '35 %', role: 'Distribution' },
      { canal: 'Appels d’offres', part: '25 %', role: 'Volume' },
    ] as unknown[],
    partenariats_market: ['Chambre de l’agriculture de Sfax', 'Unités de transformation de la tomate', 'Service régional des forêts'],
  } as Record<string, unknown>,
};

const ECO_PACK: GbmTheme = {
  idea: {
    idea_initial:
      'Les emballages alimentaires jetables génèrent des centaines de tonnes de déchets chaque année dans la restauration collective. EcoPack conçoit des emballages comestibles à base d’algues récoltées sur le littoral tunisien, destinés aux portions individuelles et aux sauces.',
    product_service:
      '1) Films et coupelles comestibles à base d’algues ; 2) conditionnement sous vide ; 3) service de substitution progressive des plastiques dans les cuisines centrales.',
    customers: 'Cuisines centrales, traiteurs, collectivités et producteurs de plats prêts à consommer.',
    partners: 'Coopératives de pêche du Sahel, institut de chimie des algues et cuisines centrales pilotes.',
  },
  problems: {
    environmental_challenges: 'Plastiques à usage unique dans la restauration, microplastiques dans les déchets organiques et empreinte carbone des emballages importés.',
    social_challenges: 'Exposition des travailleurs de la restauration aux déchets plastiques et dépendance aux filières d’importation.',
    customer_needs: 'Remplacer le plastique sans allonger le temps de préparation ni dégrader la tenue du produit.',
    team_motivations: 'Faire de la filière algues tunisienne un gisement de biomatériaux plutôt qu’une ressource exportée brute.',
  },
  pestel: {
    political_what: 'Feuille de route nationale de réduction des plastiques à usage unique.',
    political_how: 'Positionner le produit comme solution conforme anticipée à la réglementation.',
    economic_what: 'Coût croissant des plastiques importés et pression sur les marges des cuisines centrales.',
    economic_how: 'Viser un prix par unité équivalent au plastique à trois ans d’échelle.',
    social_what: 'Attente des usagers pour des emballages perçus comme naturels.',
    social_how: 'Mettre en avant l’origine algues et la comestibilité.',
    technological_what: 'Progrès des films d’alginate et de la barrière à l’humidité.',
    technological_how: 'Formulation à trois couches et séchage maîtrisé.',
    environmental_what: 'Objectifs de circularité et de gestion des déchets organiques.',
    environmental_how: 'Un emballage comestible rejoint directement la filière de collecte.',
    legal_what: 'Réglementation sanitaire sur les matériaux au contact des denrées.',
    legal_how: 'Certification alimentaire obligatoire avant toute mise sur le marché.',
  },
  objective: {
    environmental_problems: 'Plastiques à usage unique dans la restauration collective.',
    environmental_objectives: 'Substituer 40 tonnes de plastique par an dès la deuxième année.',
    social_problems: 'Dépendance aux emballages importés.',
    social_objectives: 'Créer 8 emplois locaux et intégrer 15 coopératives de pêche.',
    customer_problems: 'Emballages comestibles perçus comme fragiles.',
    customer_objectives: 'Atteindre une tenue de 24 heures en chambre froide sans déformation.',
    team_problems: 'Passage du laboratoire au pilote industriel.',
    team_objectives: 'Disposer d’une ligne pilote de 50 000 unités par mois.',
  },
  missionVision: {
    mission: 'Remplacer le plastique de la restauration par des matériaux issus de la mer et du littoral tunisien.',
    vision: 'Une restauration collective où aucun emballage individuel ne devient un déchet.',
    values: 'Innovation matière, sobriété industrielle, transparence sur les composants.',
  },
  contextSummary:
    'EcoPack s’inscrit dans une dynamique réglementaire de réduction des plastiques à usage unique et dans une demande des cuisines centrales de disposer d’alternatives conformes. La ressource algues est disponible localement mais encore peu valorisée, ce qui constitue à la fois une opportunité de coût et une contrainte de maîtrise procédé. Le projet doit démontrer la tenue réelle du matériau en conditions de restauration avant d’industrialiser.',
  stakeholders: [
    { name: 'Cuisines centrales', role: 'Client pilote', interest: 'Conformité réglementaire et image', influence: 'Très élevée : elles arbitrent l’achat', engagement_strategy: 'Essais gratuits et accompagnement à la substitution' },
    { name: 'Coopératives de pêche', role: 'Fournisseur de matière première', interest: 'Valoriser une ressource aujourd’hui sous-exploitée', influence: 'Élevée : elles sécurisent l’approvisionnement', engagement_strategy: 'Contrat d’achat pluriannuel à prix garanti' },
    { name: 'Institut de chimie des algues', role: 'Partenaire R&D', interest: 'Publier et transférer des formulations', influence: 'Élevée : conditionne la performance matière', engagement_strategy: 'Convention de recherche et co-brevet éventuel' },
  ],
  stakeholderMaps: [
    { stakeholder_name: 'Cuisines centrales', contribution: 'Conditions réelles d’usage et volume de démonstration', reward: 'Substitution progressive sans surcoût initial' },
    { stakeholder_name: 'Coopératives de pêche', contribution: 'Algues fraîches et logistique de débarquement', reward: 'Achats contractuels à prix garanti' },
    { stakeholder_name: 'Institut de chimie des algues', contribution: 'Formulations et caractérisation', reward: 'Données de terrain et valorisation scientifique' },
  ],
  segments: [
    { segment_name: 'Cuisines centrales de restauration collective', description: 'Structures produisant 500 à 5 000 repas par jour.', pains: 'Interdiction prochaine du plastique, surcoût des alternatives importées.', gains: 'Conformité anticipée, coût maîtrisé, argumentaire auprès des donneurs d’ordre.', functions: 'Emballage individuel, conditionnement de sauces, portion individuelle.' },
    { segment_name: 'Producteurs de plats prêts', description: 'PME agroalimentaires conditionnant des repas frais.', pains: 'Microplastiques détectés dans les déchets organiques et image dégradée.', gains: 'Emballage valorisable en compostage et différenciation commerciale.', functions: 'Film de couverture et coupelle individuelle.' },
  ],
  valueProposition: {
    environmental_value: 'Emballage comestible issu d’algues locales qui disparaît de la filière déchets.',
    social_value: 'Emplois de transformation sur le littoral et débouché pour les coopératives de pêche.',
    pain_relievers: 'Supprime l’interdiction réglementaire et le coût croissant du plastique.',
    gain_creators: 'Argumentaire de conformité, coût unitaire prévisible et image renforcée.',
    products_services: 'Films et coupelles comestibles, accompagnement à la substitution.',
    value_added: 'Coût unitaire 20 % inférieur à celui des alternatives importées à volume égal.',
    innovation_value: 'Formulation d’alginate à trois couches offrant une barrière à l’humidité de 24 heures.',
  },
  tests: [
    { hypothesis: 'La coupelle tient 24 heures en chambre froide sans déformation.', test_method: 'Test de vieillissement sur 72 unités à 4 °C et 90 % d’humidité.', results: 'Déformation acceptable sur 68 unités sur 72 après 24 heures.', learnings: 'L’épaissez doit être portée de 0,4 à 0,5 mm pour les sauces liquides.', validated: true },
    { hypothesis: 'Le personnel de cuisine accepte un emballage comestible sans formation.', test_method: 'Observation de 12 cuisiniers pendant une semaine de substitution.', results: 'Deux refus initiaux, aucun incident de manipulation signalé.', learnings: 'Une fiche d’usage en une page suffit à lever les réticences.', validated: true },
  ],
  pivot: {
    initial_assumptions: 'Vendre des emballages individuels grand public.',
    test_results: 'Le grand public achète peu et juge le prix unitaire trop élevé.',
    pivot_decision: 'Se concentrer sur la restauration collective et les cuisines centrales, marchés à volume contractuel.',
    new_value_proposition: 'Un contrat de substitution progressive pour les cuisines centrales, avec un coût maîtrisé.',
  },
  relations: {
    customer_relationships: 'Accompagnement projet : diagnostic des usages, plan de substitution sur trois mois et revue de performance.',
    channels: 'Vente directe aux cuisines centrales, salon professionnel de l’alimentation et presse spécialisée.',
    distribution_strategy: 'Livraison depuis un dépôt unique avec tournées hebdomadaires sur trois régions.',
  },
  journeys: [
    { stage_name: 'Sensibilisation', touchpoints: 'Article réglementaire, salon professionnel, contact commercial', customer_emotions: 'Inquiétude face à l’échéance réglementaire', improvement_ideas: 'Publier un calendrier clair de conformité' },
    { stage_name: 'Essai', touchpoints: 'Échantillons, test en cuisine pendant une semaine, fiche technique', customer_emotions: 'Prudence mêlée à l’envie de se conformer tôt', improvement_ideas: 'Fournir un kit d’essai complet prêt à l’emploi' },
    { stage_name: 'Déploiement', touchpoints: 'Contrat de substitution, livraison régulière, revue mensuelle', customer_emotions: 'Soulagement d’avoir anticipé', improvement_ideas: 'Automatiser la commande au vu des volumes de repas' },
  ],
  keyActivities: {
    key_activities: 'Formulation des biomatériaux, séchage et découpe, contrôle qualité, accompagnement à la substitution.',
    key_resources: 'Laboratoire de formulation, ligne pilote de séchage, stock d’algues, équipe de chimie et de production.',
    strategic_partners: 'Institut de chimie des algues pour la R&D et coopératives de pêche pour la matière première.',
  },
  ecoDesign: {
    equipe_eco: 'Responsable matière nommé, avec un binôme production pour la revue des formulations.',
    projet_eco: 'Passer d’un emballage comestible à un emballage réellement circulaire, sans additif de synthèse.',
    contexte_eco: 'Le produit est destiné au contact alimentaire et doit rester stable en chambre froide.',
    vision_durable: 'Un matériau qui disparaît sans laisser de trace et dont la production ne consomme pas d’eau douce.',
    cycle_de_vie: {
      materiel_amont: 'Algues récoltées à la main sur le littoral, eau de mer pour la préparation.',
      fabrication: 'Extrusion et séchage à basse température, consommation électrique du séchoir.',
      distribution: 'Conditionnement en carton, livraison groupée hebdomadaire.',
      utilisation: 'Utilisation unique en restauration, comestible ou compostable.',
      fin_de_vie: 'Compostage industriel ou ingestion si le client le prévoit.',
    } as unknown,
    performance_eco: 'Substitution de 1,9 tonne de plastique par tonne de produit et réduction de 62 % de l’empreinte carbone.',
    strategies_eco: ['Additifs uniquement d’origine naturelle', 'Séchage par chaleur récupérée', 'Emballage logistique en carton recyclé'] as unknown[],
    plan_action_eco: [
      { action: 'Remplacer le conservateur de synthèse', echelle: 'Trimestre 1', responsable: 'Responsable matière', avancement: 'En cours' },
      { action: 'Recupération de chaleur sur le séchoir', echelle: 'Trimestre 3', responsable: 'Responsable production', avancement: 'Planifié' },
    ] as unknown,
  },
  ecoDesignResult: {
    eco_results: '62 % d’empreinte carbone en moins et aucun plastique résiduel après usage.',
    performance_analysis: 'Le séchage basse température conserve les propriétés barrières tout en réduisant la consommation.',
    improvements: 'Passage à un additif de conservation naturel et suppression du film intermédiaire de protection.',
  },
  swot: {
    strengths: 'Formulation propriétaire, ressource algues locale et alignement parfait avec la réglementation à venir.',
    weaknesses: 'Capacité de production limitée, dépendance à la saisonnalité des récoltes d’algues et coût unitaire encore élevé.',
    opportunities: 'Interdiction des plastiques à usage unique, demande des cuisines centrales et appels d’offres publics.',
    threats: 'Entrée d’un grand acteur de l’emballage, altérations de qualité en chaîne du froid et concurrence des alternatives en carton.',
  },
  funding: {
    answers: {
      q1: true, q2: true, q3: true, q4: false, q5: false, q6: false,
      q7: false, q8: false, q9: false, q10: false, q11: false, q12: false,
    },
    opportunites_financement: [
      { source: 'Programme d’innovation circulaire', type: 'Subvention', montant_estime: 300000, statut: 'À déposer' },
    ] as unknown[],
    opportunites_pays: 'Tunisie d’abord, Grèce et Italie pour les filières algues.',
    strategie_levee_fonds: 'Subvention publique pour la ligne pilote puis amorçage auprès d’investisseurs à impact.',
  },
  indicator: {
    environmental_kpis: 'Tonnes de plastique substituées, kg CO2e évités, part de matière première locale.',
    social_kpis: 'Emplois créés, coopératives de pêche intégrées, cuisines accompagnées.',
    economic_kpis: 'Unités produites, coût unitaire, taux de conformité qualité, nombre de cuisines sous contrat.',
    measurement_method: 'Pesées de production, analyses qualité par lot et registre des contrats.',
    review_frequency: 'Revue hebdomadaire de production et revue commerciale mensuelle.',
  },
  costStructure: {
    fixed_costs: 'Salaires de l’atelier, loyer du laboratoire, amortissement de la ligne pilote, certifications.',
    variable_costs: 'Algues fraîches, énergie de séchage, emballage de transport, contrôle qualité.',
    cost_drivers: 'Le prix des algues et le rendement du séchoir ; la matière première pèse 41 % du coût variable.',
    breakeven_analysis: 'Seuil de rentabilité à 1,8 million d’unités produites par an.',
  },
  revenueStream: {
    revenue_sources: 'Vente d’unités comestibles à volume contractuel et prestation d’accompagnement à la substitution.',
    pricing_strategy: '0,42 TND l’unité pour la coupelle et 0,18 TND le film, avec remise au-delà de 500 000 unités.',
    revenue_projections: 'Année 1 : 310 kTND ; année 2 : 940 kTND ; année 3 : 2,1 M TND.',
  },
  testPreparation: {
    test_objectives: 'Valider la tenue en chaîne du froid et l’acceptation par les cuisiniers.',
    test_method: 'Test comparatif sur trois cuisines centrales pendant un mois.',
    success_criteria: 'Aucun incident de manipulation et conformité à 95 % après 24 heures.',
    resources_needed: '2 000 unités, un technicien qualité et trois cuisines pilotes.',
    timeline: 'Préparation en 2 semaines, test de 4 semaines, analyse et rapport en 2 semaines.',
  },
};

const MED_CONNECT: GbmTheme = {
  idea: {
    idea_initial:
      'Les patients cardiaques des zones rurales ne bénéficient pas de suivi régulier faute de cardiologues à proximité. MedConnect développe un boîtier d’ECG connecté et une application permettant au médecin de ville de suivre ses patients à distance et d’alerter en cas d’anomalie.',
    product_service:
      '1) Boîtier d’ECG deux dérivations rechargeable ; 2) application mobile patient ; 3) tableau de bord médecin ; 4) alertes automatiques et téléconsultation intégrée.',
    customers: 'Cabinets de médecine générale, cliniques rurales, mutuelles et caisses de sécurité sociale.',
    partners: 'CHU de Nabeul, ordre des médecins et opérateur télécom national.',
  },
  problems: {
    environmental_challenges: 'Aucun impact environnemental majeur, mais consommation électrique faible recherchée pour les zones à réseau instable.',
    social_challenges: 'Déserts médicaux en cardiologie, mortalité cardiovasculaire élevée et déplacements longs pour les patients.',
    customer_needs: 'Détecter les troubles du rythme avant l’hospitalisation et réduire les déplacements inutiles.',
    team_motivations: 'Ramener le suivi cardiaque au plus près du domicile, là où le risque est le plus souvent ignoré.',
  },
  pestel: {
    political_what: 'Programme national de télémédecine et extension du dossier médical numérique.',
    political_how: 'S’aligner sur les référentiels nationaux d’interopérabilité.',
    economic_what: 'Coût croissant des hospitalisations cardiaques évitables.',
    economic_how: 'Positionner le produit comme levier d’économies pour les mutuelles.',
    social_what: ' Vieillissement de la population et attente de proximité médicale.',
    social_how: 'Cibler prioritairement les communes rurales.',
    technological_what: 'Miniaturisation des capteurs ECG et généralisation du 4G.',
    technological_how: 'Boîtier autonome avec transmission automatique.',
    environmental_what: 'Contraintes faibles mais sobriété énergétique recherchée.',
    environmental_how: 'Autonomie de 10 jours sur une charge.',
    legal_what: 'Réglementation sur les dispositifs médicaux et le secret médical.',
    legal_how: 'Marquage CE dispositif médical classe IIa et hébergement HDS.',
  },
  objective: {
    environmental_problems: 'Faible : allongement de la durée de vie des boîtiers.',
    environmental_objectives: 'Garantir 5 ans d’usage par boîtier et 100 % de reprise en fin de vie.',
    social_problems: 'Inégalité d’accès au cardiologue en zone rurale.',
    social_objectives: 'Équiper 40 cabinets ruraux et suivre 3 000 patients en deux ans.',
    customer_problems: 'Surcharge des consultations et hospitalisations tardives.',
    customer_objectives: 'Réduire de 25 % les hospitalisations pour troubles du rythme détectés tôt.',
    team_problems: 'Certification réglementaire non encore obtenue.',
    team_objectives: 'Obtenir le marquage CE avant la fin du deuxième trimestre.',
  },
  missionVision: {
    mission: 'Rapprocher le suivi cardiaque du domicile des patients, partout en Tunisie.',
    vision: 'Un suivi cardiaque continu, accessible depuis n’importe quel cabinet de médecine générale.',
    values: 'Sécurité clinique, sobriété technologique, respect du secret médical.',
  },
  contextSummary:
    'MedConnect répond à une inégalité d’accès au suivi cardiaque en zone rurale, dans un contexte de développement de la télémédecine et de pression économique sur les hospitalisations évitables. Le projet bénéficie d’un environnement réglementaire favorable mais doit franchir l’étape du marquage réglementaire avant toute diffusion large.',
  stakeholders: [
    { name: 'Cabinets de médecine générale', role: 'Utilisateur prescripteur', interest: 'Suivre ses patients sans surcharge', influence: 'Très élevée : ils décident de l’usage', engagement_strategy: 'Formation courte et abonnement cabinet' },
    { name: 'Mutuelles et caisses', role: 'Financeur', interest: 'Réduire les hospitalisations coûteuses', influence: 'Élevée : ils conditionnent le remboursement', engagement_strategy: 'Dossier médico-économique et étude d’économies' },
    { name: 'CHU de référence', role: 'Partenaire clinique', interest: 'Valider la pertinence clinique', influence: 'Très élevée : crédibilise le dispositif', engagement_strategy: 'Étude clinique conjointe' },
  ],
  stakeholderMaps: [
    { stakeholder_name: 'Cabinets de médecine générale', contribution: 'Prescription, recueil des mesures et retour clinique', reward: 'Suivi de patients structuré et rémunération de la téléconsultation' },
    { stakeholder_name: 'Mutuelles et caisses', contribution: 'Financement et extension du périmètre', reward: 'Hospitalisations évitées mesurées' },
    { stakeholder_name: 'CHU de référence', contribution: 'Protocole d’étude et expertise cardiologique', reward: 'Données cliniques et publication' },
  ],
  segments: [
    { segment_name: 'Cabinets ruraux', description: 'Médecins généralistes exerçant en zone rurale sans cardiologue de proximité.', pains: 'Patients suivis sans ECG, urgences détectées trop tard.', gains: 'ECG disponible en cabinet et alerte automatique.', functions: 'Acquisition ECG, alerte, historique patient.' },
    { segment_name: 'Mutuelles de santé', description: 'Organismes prenant en charge les dépenses de leurs adhérents.', pains: 'Coût des hospitalisations cardiaques tardives.', gains: 'Démonstration chiffrée d’économies évitées.', functions: 'Tableau de bord agrégé et indicateurs d’économies.' },
  ],
  valueProposition: {
    environmental_value: 'Boîtier durable et reprise en fin de vie.',
    social_value: 'Accès au suivi cardiaque pour les populations rurales.',
    pain_relievers: 'Supprime l’absence d’ECG en cabinet et les délais d’orientation.',
    gain_creators: 'Alerte automatique, historique exploitable et démonstration d’économies.',
    products_services: 'Boîtier d’ECG, application patient, tableau de bord médecin.',
    value_added: 'Moins de 60 TND par patient et par mois, couvert par la mutuelle.',
    innovation_value: 'Détection automatique des troubles du rythme sur deux dérivations.',
  },
  tests: [
    { hypothesis: 'Le médecin généraliste utilise l’ECG au moins trois fois par semaine.', test_method: 'Déploiement dans 6 cabinets pendant 8 semaines avec journal d’usage.', results: 'Utilisation moyenne de 4,2 fois par semaine.', learnings: 'L’usage explose quand l’alerte s’affiche directement dans le dossier du patient.', validated: true },
  ],
  costStructure: {
    fixed_costs: 'Salaires de l’équipe technique, conformité réglementaire, hébergement certifié et support clinique.',
    variable_costs: 'Composants du boîtier, assemblage, transport et remplacement sous garantie.',
    cost_drivers: 'Le coût du boîtier et le taux de remplacement ; l’hébergement pèse 9 % du coût variable.',
    breakeven_analysis: 'Seuil de rentabilité à 1 800 patients suivis en abonnement.',
  },
  revenueStream: {
    revenue_sources: 'Abonnement mensuel par patient suivi, licence cabinet et prestation d’étude pour les mutuelles.',
    pricing_strategy: '59 TND par patient et par mois, 290 TND par cabinet et par mois en licence.',
    revenue_projections: 'Année 1 : 260 kTND ; année 2 : 890 kTND ; année 3 : 2,2 M TND.',
  },
};

const FOOD_WASTE: GbmTheme = {
  idea: {
    idea_initial:
      'Les grossistes alimentaires jettent chaque jour des produits proches de la date limite alors que des associations réclament des dons. FoodWaste met en relation ces deux parties via une plateforme qui valorise les invendus avant qu’ils ne deviennent des déchets.',
    product_service:
      '1) Plateforme de mise en relation grossistes-associations ; 2) planification des enlèvements ; 3) preuve de don et bilan d’impact.',
    customers: 'Grossistes alimentaires, hôtels, associations caritivas et collectivités.',
    partners: 'Fédération des grossistes alimentaires et réseau d’associations solidaires.',
  },
  problems: {
    environmental_challenges: 'Gaspillage alimentaire en fin de chaîne et émissions associées à la destruction des invendus.',
    social_challenges: 'Insécurité alimentaire dans les quartiers populaires et perte de valeur pour les grossistes.',
    customer_needs: 'Évacuer vite les invendus sans coût logistique et obtenir une preuve de don.',
    team_motivations: 'Créer un lien direct entre l’abondance des grossistes et le besoin des associations.',
  },
  pestel: {
    political_what: 'Loi encadrant la lutte contre le gaspillage alimentaire.',
    political_how: 'Utiliser la loi comme argument d’adoption auprès des grossistes.',
    economic_what: 'Coût de destruction croissant des invendus.',
    economic_how: 'Transformer une charge en don déductible.',
    social_what: 'Fort besoin alimentaire associatif.',
    social_how: 'Répondre à une demande déjà structurée.',
    technological_what: 'Simplicité attendue, sans application lourde.',
    technological_how: 'Interface web et notifications SMS.',
    environmental_what: 'Objectifs nationaux de réduction du gaspillage.',
    environmental_how: 'Chaque don évité du encombrant produit un indicateur chiffré.',
    legal_what: 'Responsabilité sanitaire des denrées donées.',
    legal_how: 'Contrainte de chaîne du froid et traçabilité par lot.',
  },
  objective: {
    environmental_problems: 'Destruction des invendus alimentaires.',
    environmental_objectives: 'Redistribuer 300 tonnes d’invendus par an.',
    social_problems: 'Insécurité alimentaire locale.',
    social_objectives: 'Équiper 40 associations et couvrir 12 communes.',
    customer_problems: 'Coût et complexité de l’évacuation des invendus.',
    customer_objectives: 'Réduire de 80 % le coût d’évacuation des grossistes partenaires.',
    team_problems: 'Expérience limitée en logistique du froid.',
    team_objectives: 'Sécuriser un partenaire logistique avant le lancement.',
  },
  missionVision: {
    mission: 'Redistribuer ce qui allait être détruit, simplement et traçablement.',
    vision: 'Une ville où aucun invendus consommable ne termine en décharge.',
    values: 'Rapidité, fiabilité, dignité des bénéficiaires.',
  },
  contextSummary:
    'FoodWaste s’inscrit dans un cadre réglementaire favorable à la lutte contre le gaspillage alimentaire et dans un besoin social réel. Le projet reste très en amont : la solution est un prototype et l’équipe n’a pas encore sécurisé de logistique du froid, ce qui constitue le point de vigilance principal du dossier.',
  swot: {
    strengths: 'Besoins sociaux clairement exprimés, modèle léger et coût de mise en œuvre faible.',
    weaknesses: 'Équipe incomplète, logistique du froid non sécurisée et modèle économique non validé.',
    opportunities: 'Cadre législatif favorable et engagements RSE des grossistes.',
    threats: 'Concurrence des applications de dons existantes et contraintes sanitaires strictes.',
  },
  funding: {
    answers: {
      q1: true, q2: true, q3: false, q4: false, q5: false, q6: false,
      q7: false, q8: false, q9: false, q10: false, q11: false, q12: false,
    },
    opportunites_financement: [{ source: 'Fonds social communal', type: 'Subvention', montant_estime: 80000, statut: 'À contacter' }] as unknown[],
    opportunites_pays: 'Tunisie uniquement, à titre expérimental.',
    strategie_levee_fonds: 'Amorçage public modeste avant toute levée privée.',
  },
};

export const DEMO_PROJECTS: DemoProjectSpec[] = [
  {
    key: 'biocare',
    name: 'BioCare Tunisia',
    description:
      'Réseau de capteurs solaires de sol et plateforme SaaS de recommandations agronomiques pour les coopératives tunisiennes.',
    ownerEmail: 'owner.biocare@projectstruct.demo',
    cohortKey: 'green',
    isGbmReviewed: true,
    businessPlanFinal: true,
    completedSteps: [
      'gbm_1', 'gbm_2', 'gbm_3', 'gbm_4', 'gbm_5', 'gbm_6',
      'gbm_7a', 'gbm_7b', 'gbm_8', 'gbm_9', 'gbm_10', 'gbm_11',
      'gbm_12a', 'gbm_12b', 'gbm_13', 'gbm_14a', 'gbm_14b', 'gbm_15',
      'gbm_16', 'gbm_17', 'gbm_18', 'gbm_19', 'gbm_20', 'gbm_21',
      'eco_design', 'funding', 'market', 'impact',
      'bp_2.1', 'bp_2.2', 'bp_2.3', 'bp_2.4', 'bp_2.5', 'bp_2.6',
    ],
    inProgressSteps: [],
    gbm: BI_CARE,
    documents: [
      {
        key: 'idea_sketch',
        title: "Fiche d'idée",
        content:
          '# Fiche d’idée — BioCare Tunisia\n\n**Problème** : les sols agricoles tunisiens se dégradent faute de données fiables de fertilité et d’humidité.\n\n**Solution** : capteurs solaires connectés et plateforme SaaS traduisant les mesures en recommandations d’irrigation et de fertilisation.\n\n**Clients** : coopératives agricoles, groupements de producteurs, ONG de développement rural.\n\n**Partenaires** : INRAT, Université de Gabès, opérateur LoRaWAN, ministère de l’Agriculture.',
      },
      {
        key: 'problems_needs',
        title: 'Analyse des problèmes et besoins',
        content:
          '# Analyse des problèmes et besoins\n\n**Défis environnementaux** : 90 % des prélèvements d’eau sont agricoles, salinisation des sols, perte de 40 % de matière organique en trente ans.\n\n**Défis sociaux** : vieillissement des exploitants, inégalité d’accès au conseil agronomique.\n\n**Besoins clients** : savoir quand irriguer et combien, détecter les carences précocement, tracer les pratiques pour l’export.\n\n**Motivations équipe** : rendre l’agronomie de précision accessible aux petites coopératives.',
      },
      {
        key: 'pestel',
        title: 'Rapport PESTEL',
        content:
          '# Rapport PESTEL — BioCare\n\n**Politique** : plan national d’irrigation intelligente et subventions à la modernisation.\n**Économique** : hausse du coût de l’énergie d’irrigation pressant les marges céréalières.\n**Social** : attente forte des jeunes exploitants pour des outils numériques simples.\n**Technologique** : abaissement du coût des capteurs et essor du LoRaWAN.\n**Environnemental** : pression réglementaire sur les usages de l’eau.\n**Légal** : loi 2010-1 et hébergement des données en Tunisie.',
      },
      {
        key: 'value_proposition',
        title: 'Proposition de valeur',
        content:
          '# Proposition de valeur\n\nRéduire de 25 % l’irrigation et augmenter de 15 % la matière organique, sans investissement initial pour la coopérative.\n\n**Différenciation** : modèle d’abonnement par hectare suivi, recommandations validées par l’INRAT, rapport d’impact opposable.',
      },
      {
        key: 'gbm_canvas',
        title: 'Green Business Model Canvas final',
        content:
          '# GBM Canvas — BioCare Tunisia\n\n**Partenaires clés** : INRAT, opérateur LoRaWAN, distributeurs d’intrants.\n**Activités clés** : conception des capteurs, modélisation agronomique, déploiement, formation.\n**Proposition de valeur** : agronomie de précision sans investissement initial.\n**Segments clients** : coopératives céréalières, maraîchers sous serre, ONG.\n**Relations client** : chargé de déploiement dédié, support en arabe.\n**Canaux** : salons agricoles, presse coopérative, recommandation entre pairs.\n**Structure de coûts** : 38 TND/ha/an à 3 000 hectares.\n**Flux de revenus** : abonnement 48 TND/ha/an, diagnostics, rapports d’impact.\n**Ressources clés** : parc de capteurs, base de données de campagnes, protocoles INRAT.',
      },
      {
        key: 'management_plan',
        title: 'Plan de gestion',
        content:
          '# Plan de gestion\n\n**Équipe** : 7 ETP (2 ingénieurs IoT, 2 agronomes, 1 responsable déploiement, 1 commercial, 1 administratif).\n**Recrutements** : 3 chargés de déploiement en année 2.\n**Actifs** : atelier de 180 m² à Kairouan, parc de 400 capteurs.\n**Ressources intellectuelles** : modèles de recommandation et base de campagnes.\n**Production** : assemblage interne, deux fournisseurs alternatifs de cartes électroniques.',
      },
      {
        key: 'marketing_plan',
        title: 'Plan marketing',
        content:
          '# Plan marketing\n\n**Marché** : 840 coopératives actives, dont 320 sur zones éligibles au programme national.\n**Positionnement** : le partenaire de terrain entre technologie et agronomie.\n**Prix** : 48 TND/ha/an, diagnostic 900 TND.\n**Canaux** : salons, presse coopérative, recommandation entre pairs, distributeurs d’intrants.',
      },
      {
        key: 'financial_plan',
        title: 'Plan financier',
        content:
          '# Plan financier\n\n**Amorçage** : 480 kTND (300 kTND fonds propres, 180 kTND subvention).\n**CA prévisionnel** : 340 kTND (A1), 1,1 M TND (A2), 2,6 M TND (A3).\n**Seuil de rentabilité** : 2 400 hectares suivis.\n**Trésorerie** : positive dès le 14e mois.',
      },
      {
        key: 'legal_plan',
        title: 'Plan juridique',
        content:
          '# Plan juridique\n\nSARL au capital de 300 000 TND, pacte d’associés, contrats de prestation et de dépôt de matériel, accord de confidentialité avec l’INRAT, assurance RC professionnelle.',
      },
      {
        key: 'kpi_plan',
        title: 'Plan des KPIs',
        content:
          '# Plan des KPIs\n\n| Indicateur | Cible | Périmètre |\n|---|---|---|\n| Hectares suivis | 3 000 | Commercial |\n| Taux de renouvellement | 90 % | Rétention |\n| Économie d’eau | 25 % | Impact |\n| Agriculteurs formés | 600 | Impact social |\n| Disponibilité plateforme | 99,5 % | Technique |',
      },
      {
        key: 'executive_summary',
        title: 'Résumé exécutif',
        content:
          '# Résumé exécutif\n\nBioCare équipe les coopératives tunisiennes de capteurs de sol connectés et d’une plateforme de recommandations agronomiques. Après 12 coopératives pilotes : 22 % d’économie d’eau, 92 % de renouvellement, retour sur investissement en moins d’une campagne. Modèle d’abonnement par hectare, sans investissement initial. Demande de 1,2 M TND pour industrialiser le capteur v2 et étendre le déploiement à 30 coopératives.',
      },
      {
        key: 'funding_dossier',
        title: 'Dossier de financement',
        content:
          '# Dossier de financement\n\n**Phase de maturité** : EARLY_STAGE (7/12).\n**Levée** : 1,2 M TND au 18e mois.\n**Sources** : programme national d’irrigation intelligente (450 kTND), fonds vert Maghreb (700 kTND), love money (500 kTND).',
      },
      {
        key: 'impact_report',
        title: "Rapport d'impact durable",
        content:
          "# Rapport d'impact durable\n\n**Environnement** : 22 % d’économie d’eau constatée, 1 240 hectares suivis, 187 agriculteurs formés.\n**Social** : 30 % de femmes parmi les bénéficiaires, emploi local créé.\n**Mesure** : collecte automatisée, enquêtes semestrielles, analyses de laboratoire trimestrielles.",
      },
    ],
  },
  {
    key: 'agrismart',
    name: 'AgriSmart',
    description:
      'Valorisation des résidus agricoles en substrats compostés haute performance, conditionnés pour les coopératives et pépiniéristes.',
    ownerEmail: 'owner.agrismart@projectstruct.demo',
    cohortKey: 'agritech',
    isGbmReviewed: false,
    businessPlanFinal: false,
    completedSteps: [
      'gbm_1', 'gbm_2', 'gbm_3', 'gbm_4', 'gbm_5', 'gbm_6',
      'gbm_7a', 'gbm_7b', 'gbm_8', 'gbm_9', 'gbm_10', 'gbm_11',
      'gbm_12a', 'gbm_12b', 'gbm_13', 'gbm_16', 'gbm_17', 'gbm_18',
      'gbm_20', 'gbm_21', 'funding', 'market', 'bp_2.1', 'bp_2.2',
    ],
    inProgressSteps: ['gbm_14a', 'bp_2.3'],
    gbm: AGRI_SMART,
    documents: [
      {
        key: 'idea_sketch',
        title: "Fiche d'idée",
        content:
          '# Fiche d’idée — AgriSmart\n\n**Problème** : 300 000 tonnes de résidus agricoles brûlées ou enfouies chaque année.\n**Solution** : compostage en andains piloté par sondes, substrat conditionné.\n**Clients** : pépiniéristes, maraîchers sous serre, collectivités.',
      },
      {
        key: 'value_proposition',
        title: 'Proposition de valeur',
        content: 'Substituer le terreau importé par un substrat local tracé, 30 % moins cher, issu de résidus valorisés.',
      },
      {
        key: 'gbm_canvas',
        title: 'Green Business Model Canvas final',
        content:
          '# GBM Canvas — AgriSmart\n\n**Partenaires** : unités de transformation de la tomate, Chambre de l’agriculture, Service des forêts.\n**Activités** : collecte, compostage, contrôle qualité, conditionnement.\n**Proposition de valeur** : substrat local tracé à prix contenu.\n**Segments** : maraîchers sous serre, pépiniéristes.\n**Revenus** : 0,95 TND/kg en vrac, 1,35 TND/kg en sac.',
      },
      {
        key: 'executive_summary',
        title: 'Résumé exécutif',
        content:
          '# Résumé exécutif — AgriSmart\n\nValorisation de 8 000 tonnes de résidus par an en substrats compostés. Procédé validé sur deux cycles comparatifs. CA prévisionnel 780 kTND (A1) à 2,4 M TND (A3), seuil de rentabilité à 5 200 tonnes. Levée de 950 kTND.',
      },
    ],
  },
  {
    key: 'ecopack',
    name: 'EcoPack',
    description:
      'Emballages alimentaires comestibles à base d’algues locales pour la restauration collective et l’agroalimentaire.',
    ownerEmail: 'owner.ecopack@projectstruct.demo',
    cohortKey: 'green',
    isGbmReviewed: false,
    businessPlanFinal: undefined,
    completedSteps: [
      'gbm_1', 'gbm_2', 'gbm_3', 'gbm_4', 'gbm_5', 'gbm_6',
      'gbm_7a', 'gbm_7b', 'gbm_8', 'gbm_9', 'gbm_10', 'funding',
    ],
    inProgressSteps: ['gbm_11', 'gbm_12a'],
    gbm: ECO_PACK,
    documents: [
      {
        key: 'idea_sketch',
        title: "Fiche d'idée",
        content:
          '# Fiche d’idée — EcoPack\n\n**Problème** : plastiques à usage unique dans la restauration collective.\n**Solution** : films et coupelles comestibles à base d’algues.\n**Clients** : cuisines centrales, producteurs de plats prêts.',
      },
      {
        key: 'value_proposition',
        title: 'Proposition de valeur',
        content: 'Remplacer le plastique sans surcoût à trois ans d’échelle, avec un matériau issu du littoral tunisien.',
      },
    ],
  },
  {
    key: 'medconnect',
    name: 'MedConnect',
    description:
      'Boîtier d’ECG connecté et plateforme de télémonitoring cardiaque pour les cabinets de médecine générale en zone rurale.',
    ownerEmail: 'owner.medconnect@projectstruct.demo',
    cohortKey: 'health',
    isGbmReviewed: false,
    businessPlanFinal: undefined,
    completedSteps: ['gbm_1', 'gbm_2', 'gbm_3', 'gbm_4', 'gbm_5'],
    inProgressSteps: ['gbm_6'],
    gbm: MED_CONNECT,
    documents: [],
  },
  {
    key: 'foodwaste',
    name: 'FoodWaste',
    description:
      'Plateforme de mise en relation entre grossistes alimentaires et associations pour valoriser les invendus consommables.',
    ownerEmail: 'owner.foodwaste@projectstruct.demo',
    cohortKey: 'agritech',
    isGbmReviewed: false,
    businessPlanFinal: undefined,
    completedSteps: ['gbm_1', 'gbm_2'],
    inProgressSteps: ['gbm_3'],
    gbm: FOOD_WASTE,
    documents: [],
  },
];
