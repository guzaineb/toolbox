import * as bcrypt from 'bcrypt';
import { PrismaClient, StepStatus } from '@prisma/client';

const prisma = new PrismaClient();
const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deterministicUuid(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-0000-4000-8000-${Date.now().toString(16).slice(0, 12)}`;
}

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERTISE AREA LOOKUP (must match user-seed.ts names exactly)
// ═══════════════════════════════════════════════════════════════════════════════

const EXPERTISE_NAMES = [
  'Développement Web',
  'Développement Mobile',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Cloud & DevOps',
  'Blockchain',
  'IoT',
  'Business Model',
  'Stratégie Go-to-Market',
  'Fundraising & Investissement',
  'Finance & Comptabilité',
  'Lean Startup',
  'M&A / Fusion-Acquisition',
  'Marketing Digital',
  'Growth Hacking',
  'Branding & Communication',
  'Ventes B2B',
  'SEO / SEA',
  'Product Marketing',
  'Leadership & Management',
  'Recrutement & Talent',
  "Culture d'entreprise",
  'Coaching & Mentoring',
  'Product Management',
  'UX / UI Design',
  'Design Thinking',
  'Droit des Startups',
  'Propriété intellectuelle',
  'RGPD & Conformité',
  'Impact Social',
  'Développement Durable',
  'Agri-Tech',
  'Med-Tech / Santé',
  'Ed-Tech',
  'Fintech',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 30 PROJECT OWNERS ───────────────────────────────────────────────────────

interface OwnerDef {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  country: string;
  city: string;
  status: string;
  education: string;
  fieldOfStudy: string;
  occupation: string;
  expLevel: number;
  hasPrevStartup: boolean;
  skills: { name: string; level: string }[];
  experiences: { title: string; org: string; desc: string; start: string; end?: string }[];
}

const PROJECT_OWNERS: OwnerDef[] = [
  // Group 1 — FinTech (owners 1-4)
  {
    email: 'owner.fintech1@test.com', firstName: 'Amine', lastName: 'Ben Salah',
    bio: 'Entrepreneur fintech spécialisé dans les solutions de paiement digital pour les PME tunisiennes.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Finance', occupation: 'CEO', expLevel: 3, hasPrevStartup: true,
    skills: [{ name: 'Finance', level: 'advanced' }, { name: 'Business Model', level: 'intermediate' }, { name: 'Gestion de projet', level: 'advanced' }],
    experiences: [{ title: 'CEO', org: 'FinPay Solutions', desc: 'Création plateforme paiement digital', start: '2022-01-01' }],
  },
  {
    email: 'owner.fintech2@test.com', firstName: 'Youssef', lastName: 'Khlifi',
    bio: 'Développeur full-stack passionné par la fintech et les solutions SaaS de gestion financière.',
    country: 'Tunisia', city: 'Sfax', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Informatique', occupation: 'CTO & Co-fondateur', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'Développement Web', level: 'expert' }, { name: 'Architecture', level: 'advanced' }],
    experiences: [{ title: 'Lead Developer', org: 'TechCorp', desc: 'Développement applications web', start: '2020-06-01', end: '2022-12-31' }],
  },
  {
    email: 'owner.fintech3@test.com', firstName: 'Ines', lastName: 'Trabelsi',
    bio: 'Spécialiste en mobile wallet et services financiers mobiles pour les marchés émergents.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Finance Digitale', occupation: 'Fondatrice', expLevel: 4, hasPrevStartup: true,
    skills: [{ name: 'Finance', level: 'expert' }, { name: 'Mobile', level: 'intermediate' }, { name: 'Business Model', level: 'advanced' }],
    experiences: [{ title: 'Fondatrice', org: 'MobileWallet TN', desc: 'Service de mobile money', start: '2021-03-01' }],
  },
  {
    email: 'owner.fintech4@test.com', firstName: 'Karim', lastName: 'Mansour',
    bio: 'Expert en financement participatif et solutions de facturation pour les entreprises.',
    country: 'Morocco', city: 'Casablanca', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Économie', occupation: 'Directeur', expLevel: 5, hasPrevStartup: true,
    skills: [{ name: 'Finance', level: 'expert' }, { name: 'Fundraising', level: 'advanced' }, { name: 'Business Model', level: 'advanced' }],
    experiences: [{ title: 'Directeur', org: 'InvoicePro', desc: 'Plateforme de facturation et financement', start: '2019-01-01' }],
  },
  // Group 2 — EdTech (owners 5-7)
  {
    email: 'owner.edtech1@test.com', firstName: 'Sara', lastName: 'Ben Ali',
    bio: 'Enseignante-chercheuse passionnée par l\'éducation adaptive et les technologies d\'apprentissage.',
    country: 'Tunisia', city: 'Tunis', status: 'chercheuse', education: 'doctorat',
    fieldOfStudy: 'Sciences de l\'Éducation', occupation: 'Professeure', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Éducation', level: 'expert' }, { name: 'Recherche', level: 'advanced' }],
    experiences: [{ title: 'Professeure', org: 'Université de Tunis', desc: 'Recherche en éducation adaptive', start: '2018-09-01' }],
  },
  {
    email: 'owner.edtech2@test.com', firstName: 'Mohamed', lastName: 'Gharbi',
    bio: 'Développeur full-stack spécialisé dans les plateformes e-learning et les systèmes adaptatifs.',
    country: 'Tunisia', city: 'Sousse', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Informatique', occupation: 'CTO', expLevel: 3, hasPrevStartup: true,
    skills: [{ name: 'Développement Web', level: 'expert' }, { name: 'Intelligence Artificielle', level: 'intermediate' }],
    experiences: [{ title: 'CTO', org: 'EduLearn', desc: 'Plateforme e-learning adaptive', start: '2021-06-01' }],
  },
  {
    email: 'owner.edtech3@test.com', firstName: 'Fatma', lastName: 'Bouazizi',
    bio: 'Spécialiste en pédagogie numérique et formation professionnelle en ligne.',
    country: 'Tunisia', city: 'Bizerte', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Pédagogie', occupation: 'Fondatrice', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'Éducation', level: 'advanced' }, { name: 'Formation', level: 'advanced' }],
    experiences: [{ title: 'Fondatrice', org: 'SkillUp TN', desc: 'Plateforme de formation professionnelle', start: '2023-01-01' }],
  },
  // Group 3 — AgriTech (owners 8-10)
  {
    email: 'owner.agritech1@test.com', firstName: 'Rachid', lastName: 'Bouzid',
    bio: 'Ingénieur agronome spécialisé dans l\'IoT agricole et l\'irrigation intelligente.',
    country: 'Tunisia', city: 'Sfax', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Agronomie', occupation: 'Fondateur', expLevel: 4, hasPrevStartup: true,
    skills: [{ name: 'IoT', level: 'advanced' }, { name: 'Agriculture', level: 'expert' }],
    experiences: [{ title: 'Fondateur', org: 'SmartFarm TN', desc: 'IoT pour irrigation intelligente', start: '2020-03-01' }],
  },
  {
    email: 'owner.agritech2@test.com', firstName: 'Nabil', lastName: 'Cherif',
    bio: 'Data scientist appliqué à l\'agriculture de précision et au monitoring des cultures.',
    country: 'Tunisia', city: 'Kairouan', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Data Science', occupation: 'CEO', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Data Science', level: 'advanced' }, { name: 'Agriculture', level: 'intermediate' }],
    experiences: [{ title: 'CEO', org: 'CropMonitor', desc: 'Monitoring culture par drone et satellite', start: '2022-01-01' }],
  },
  {
    email: 'owner.agritech3@test.com', firstName: 'Leila', lastName: 'Mabrouki',
    bio: 'Entrepreneuse dans la marketplace agricole et la logistique du dernier kilomètre.',
    country: 'Tunisia', city: 'Nabeul', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Commerce', occupation: 'Fondatrice', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'E-commerce', level: 'advanced' }, { name: 'Logistique', level: 'intermediate' }],
    experiences: [{ title: 'Fondatrice', org: 'AgriMarket TN', desc: 'Marketplace producteurs-consommateurs', start: '2023-06-01' }],
  },
  // Group 4 — HealthTech (owners 11-13)
  {
    email: 'owner.healthtech1@test.com', firstName: 'Aymen', lastName: 'Rejeb',
    bio: 'Médecin informaticien développeur de solutions e-santé et télémédecine.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'doctorat',
    fieldOfStudy: 'Médecine & Informatique', occupation: 'Co-fondateur', expLevel: 4, hasPrevStartup: true,
    skills: [{ name: 'Santé', level: 'expert' }, { name: 'Développement Web', level: 'advanced' }],
    experiences: [{ title: 'Co-fondateur', org: 'MedConnect', desc: 'Plateforme de télémédecine', start: '2021-01-01' }],
  },
  {
    email: 'owner.healthtech2@test.com', firstName: 'Mariem', lastName: 'Sfaxi',
    bio: 'Spécialiste en IA appliquée au diagnostic médical et imagerie médicale.',
    country: 'Tunisia', city: 'Tunis', status: 'chercheuse', education: 'doctorat',
    fieldOfStudy: 'IA Médicale', occupation: 'Chercheuse', expLevel: 5, hasPrevStartup: false,
    skills: [{ name: 'Intelligence Artificielle', level: 'expert' }, { name: 'Santé', level: 'advanced' }],
    experiences: [{ title: 'Chercheuse', org: 'CRNS', desc: 'IA pour diagnostic médical', start: '2018-01-01' }],
  },
  {
    email: 'owner.healthtech3@test.com', firstName: 'Omar', lastName: 'Ben Fraj',
    bio: 'Développeur mobile spécialisé dans les applications de bien-être et santé mentale.',
    country: 'Tunisia', city: 'Monastir', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Informatique Mobile', occupation: 'Fondateur', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'Développement Mobile', level: 'advanced' }, { name: 'Santé', level: 'intermediate' }],
    experiences: [{ title: 'Fondateur', org: 'MindWell', desc: 'App de bien-être mental', start: '2023-03-01' }],
  },
  // Group 5 — GreenTech (owners 14-16)
  {
    email: 'owner.greentech1@test.com', firstName: 'Hatem', lastName: 'Jaziri',
    bio: 'Ingénieur environnemental spécialisé dans les solutions d\'énergie renouvelable et développement durable.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Génie Environnemental', occupation: 'Fondateur', expLevel: 6, hasPrevStartup: true,
    skills: [{ name: 'Développement Durable', level: 'expert' }, { name: 'Énergie', level: 'advanced' }],
    experiences: [{ title: 'Fondateur', org: 'GreenPower TN', desc: 'Solutions solaires pour entreprises', start: '2018-01-01' }],
  },
  {
    email: 'owner.greentech2@test.com', firstName: 'Amira', lastName: 'Boucheham',
    bio: 'Experte en économie circulaire et gestion des déchets avec solutions technologiques.',
    country: 'Tunisia', city: 'Sousse', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Environnement', occupation: 'Directrice', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Développement Durable', level: 'advanced' }, { name: 'Business Model', level: 'intermediate' }],
    experiences: [{ title: 'Directrice', org: 'EcoCycle', desc: 'Gestion intelligente des déchets', start: '2022-06-01' }],
  },
  {
    email: 'owner.greentech3@test.com', firstName: 'Walid', lastName: 'Dhieb',
    bio: 'DéveloppeurIoT pour le monitoring environnemental et la qualité de l\'air.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Électronique', occupation: 'CTO', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'IoT', level: 'advanced' }, { name: 'Environnement', level: 'intermediate' }],
    experiences: [{ title: 'CTO', org: 'AirWatch TN', desc: 'Capteurs IoT qualité de l\'air', start: '2023-01-01' }],
  },
  // Group 6 — SaaS / Logistics (owners 17-19)
  {
    email: 'owner.saas1@test.com', firstName: 'Tarek', lastName: 'Omri',
    bio: 'Développeur full-stack SaaS B2B spécialisé dans la gestion de projet et la productivité.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Informatique', occupation: 'CEO', expLevel: 4, hasPrevStartup: true,
    skills: [{ name: 'Développement Web', level: 'expert' }, { name: 'Product Management', level: 'advanced' }],
    experiences: [{ title: 'CEO', org: 'TaskFlow', desc: 'SaaS gestion de projet', start: '2020-01-01' }],
  },
  {
    email: 'owner.logistics1@test.com', firstName: 'Sami', lastName: 'Bouallegue',
    bio: 'Logisticien entrepreneur dans la livraison du dernier kilomètre et supply chain digitale.',
    country: 'Tunisia', city: 'Sfax', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Logistique', occupation: 'Fondateur', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Logistique', level: 'advanced' }, { name: 'Gestion de projet', level: 'intermediate' }],
    experiences: [{ title: 'Fondateur', org: 'DeliverNow', desc: 'Livraison dernier kilomètre', start: '2022-03-01' }],
  },
  {
    email: 'owner.tourism1@test.com', firstName: 'Nour', lastName: 'Hadded',
    bio: 'Experte en tourisme digital et plateforme de réservation pour l\'artisanat tunisien.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Tourisme', occupation: 'Fondatrice', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'Tourisme', level: 'advanced' }, { name: 'E-commerce', level: 'intermediate' }],
    experiences: [{ title: 'Fondatrice', org: 'TuniCraft', desc: 'Marketplace artisanat tunisien', start: '2023-09-01' }],
  },
  // Group 7 — Cybersecurity / AI (owners 20-22)
  {
    email: 'owner.cyber1@test.com', firstName: 'Malek', lastName: 'Zouari',
    bio: 'Expert cybersécurité spécialisé dans la protection des données financières et la conformité.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Cybersécurité', occupation: 'CTO', expLevel: 7, hasPrevStartup: true,
    skills: [{ name: 'Cybersécurité', level: 'expert' }, { name: 'RGPD', level: 'advanced' }],
    experiences: [{ title: 'CTO', org: 'SecureData TN', desc: 'Cybersécurité pour banques', start: '2017-01-01' }],
  },
  {
    email: 'owner.ai1@test.com', firstName: 'Yasmine', lastName: 'Miled',
    bio: 'Data scientist spécialisée dans le NLP et les systèmes de recommendation.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'doctorat',
    fieldOfStudy: 'Intelligence Artificielle', occupation: 'Co-fondatrice', expLevel: 4, hasPrevStartup: false,
    skills: [{ name: 'Intelligence Artificielle', level: 'expert' }, { name: 'Data Science', level: 'expert' }],
    experiences: [{ title: 'Co-fondatrice', org: 'AI Solutions TN', desc: 'Systèmes de recommendation', start: '2021-06-01' }],
  },
  {
    email: 'owner.marketing1@test.com', firstName: 'Imen', lastName: 'Khelifi',
    bio: 'Growth hacker et experte en marketing digital pour startups.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Marketing', occupation: 'Fondatrice', expLevel: 3, hasPrevStartup: true,
    skills: [{ name: 'Marketing Digital', level: 'expert' }, { name: 'Growth Hacking', level: 'advanced' }],
    experiences: [{ title: 'Fondatrice', org: 'GrowthLab TN', desc: 'Acceleration marketing pour startups', start: '2021-01-01' }],
  },
  // Group 8 — IoT / Blockchain (owners 23-25)
  {
    email: 'owner.iot1@test.com', firstName: 'Ahmed', lastName: 'Bouchama',
    bio: 'Ingénieur IoT spécialisé dans les villes intelligentes et les capteurs industriels.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Électronique & IoT', occupation: 'Fondateur', expLevel: 5, hasPrevStartup: true,
    skills: [{ name: 'IoT', level: 'expert' }, { name: 'Cloud & DevOps', level: 'advanced' }],
    experiences: [{ title: 'Fondateur', org: 'SmartCity TN', desc: 'Solutions IoT villes intelligentes', start: '2019-01-01' }],
  },
  {
    email: 'owner.blockchain1@test.com', firstName: 'Rim', lastName: 'Sellami',
    bio: 'Experte blockchain appliquée à la traçabilité agricole et alimentaire.',
    country: 'Tunisia', city: 'Sousse', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Informatique', occupation: 'CTO', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Blockchain', level: 'advanced' }, { name: 'Agriculture', level: 'intermediate' }],
    experiences: [{ title: 'CTO', org: 'AgriChain', desc: 'Traçabilité blockchain agriculture', start: '2022-06-01' }],
  },
  {
    email: 'owner.foodtech1@test.com', firstName: 'Ons', lastName: 'Guerfali',
    bio: 'Ingénieure alimentaire et entrepreneuse dans la foodtech et la nutrition personnalisée.',
    country: 'Tunisia', city: 'Tunis', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Génie Alimentaire', occupation: 'Fondatrice', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'FoodTech', level: 'advanced' }, { name: 'IA', level: 'intermediate' }],
    experiences: [{ title: 'Fondatrice', org: 'NutriMatch', desc: 'Application nutrition personnalisée', start: '2023-01-01' }],
  },
  // Group 9 — Edge cases / incomplete (owners 26-30)
  {
    email: 'owner.edge1@test.com', firstName: 'Hichem', lastName: 'Tlatli',
    bio: 'Entrepreneur en phase d\'idée, sans expérience technique ni sectorielle spécifique.',
    country: 'Tunisia', city: 'Tunis', status: 'débutant', education: 'bac+3',
    fieldOfStudy: 'Gestion', occupation: 'Étudiant', expLevel: 0, hasPrevStartup: false,
    skills: [],
    experiences: [],
  },
  {
    email: 'owner.edge2@test.com', firstName: 'Raoudha', lastName: 'Kacem',
    bio: 'Avocate spécialisée en droit des affaires, en transition vers l\'entrepreneuriat tech.',
    country: 'Tunisia', city: 'Tunis', status: 'transition', education: 'bac+5',
    fieldOfStudy: 'Droit', occupation: 'Avocate', expLevel: 1, hasPrevStartup: false,
    skills: [{ name: 'Droit', level: 'expert' }],
    experiences: [{ title: 'Avocate', org: 'Cabinet Kacem', desc: 'Droit des affaires', start: '2019-01-01', end: '2023-12-31' }],
  },
  {
    email: 'owner.edge3@test.com', firstName: 'Bilel', lastName: 'Haj Ali',
    bio: 'Développeur freelance sans projet défini, explore différentes opportunités.',
    country: 'Tunisia', city: 'Sfax', status: 'exploration', education: 'bac+5',
    fieldOfStudy: 'Informatique', occupation: 'Freelance', expLevel: 2, hasPrevStartup: false,
    skills: [{ name: 'Développement Web', level: 'intermediate' }],
    experiences: [{ title: 'Freelance', org: 'Indépendant', desc: 'Projets web divers', start: '2021-01-01' }],
  },
  {
    email: 'owner.edge4@test.com', firstName: 'Hanen', lastName: 'Ben Moussa',
    bio: 'Projet dans un domaine très niche sans expertise correspondante disponible.',
    country: 'Tunisia', city: 'Gabès', status: 'entrepreneur', education: 'bac+5',
    fieldOfStudy: 'Chimie', occupation: 'Chercheuse', expLevel: 3, hasPrevStartup: false,
    skills: [{ name: 'Chimie', level: 'expert' }, { name: 'Recherche', level: 'advanced' }],
    experiences: [{ title: 'Chercheuse', org: 'CRNS Gabès', desc: 'Recherche chimie verte', start: '2020-01-01' }],
  },
  {
    email: 'owner.edge5@test.com', firstName: 'Khaled', lastName: 'Mejri',
    bio: 'Projet mobility avec très peu d\'informations fournies.',
    country: 'Tunisia', city: 'Tunis', status: 'idéation', education: 'bac+3',
    fieldOfStudy: 'Transport', occupation: 'Salarié', expLevel: 1, hasPrevStartup: false,
    skills: [],
    experiences: [],
  },
];

// ─── 20 EXPERTS ──────────────────────────────────────────────────────────────

interface ExpertDef {
  email: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  organization: string;
  position: string;
  yearsOfExperience: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  expertiseAreas: { name: string; level: string; years: number }[];
}

const EXPERTS: ExpertDef[] = [
  // Expert 1 — Strong FinTech match
  {
    email: 'expert.fintech@test.com', firstName: 'Sophie', lastName: 'Martin',
    headline: 'Experte Fintech & Cybersecurity',
    bio: '15 ans d\'expérience en cybersécurité financière et systèmes de paiement. Mentor et coach pour startups fintech.',
    organization: 'FinSecure Consulting', position: 'Directrice', yearsOfExperience: 15,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Fintech', level: 'expert', years: 12 },
      { name: 'Cybersécurité', level: 'expert', years: 15 },
      { name: 'Fundraising & Investissement', level: 'senior', years: 8 },
      { name: 'Cloud & DevOps', level: 'senior', years: 6 },
    ],
  },
  // Expert 2 — Partial FinTech match (missing cybersecurity)
  {
    email: 'expert.fintech2@test.com', firstName: 'Marc', lastName: 'Dupont',
    headline: 'Expert Finance & Business Model',
    bio: 'Spécialiste en finance d\'entreprise et modèles économiques pour startups. Formation en pédagogie.',
    organization: 'FinanceAccel', position: 'Partner', yearsOfExperience: 10,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Finance & Comptabilité', level: 'expert', years: 10 },
      { name: 'Business Model', level: 'senior', years: 8 },
      { name: 'Fundraising & Investissement', level: 'senior', years: 7 },
    ],
  },
  // Expert 3 — AI specialist (for HealthTech, EdTech, AgriTech)
  {
    email: 'expert.ai@test.com', firstName: 'Pierre', lastName: 'Lefebvre',
    headline: 'Expert Intelligence Artificielle & Data Science',
    bio: 'Spécialiste en IA, machine learning et data science. Expérience dans le médical et l\'éducation. Formation mentorat.',
    organization: 'AI Solutions Lab', position: 'CTO', yearsOfExperience: 12,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Intelligence Artificielle', level: 'expert', years: 12 },
      { name: 'Data Science', level: 'expert', years: 10 },
      { name: 'Cloud & DevOps', level: 'senior', years: 6 },
      { name: 'Développement Web', level: 'senior', years: 8 },
    ],
  },
  // Expert 4 — IoT specialist
  {
    email: 'expert.iot@test.com', firstName: 'Julien', lastName: 'Bernard',
    headline: 'Expert IoT & Cloud Computing',
    bio: 'Ingénieur IoT avec 10 ans d\'expérience en systèmes embarqués, capteurs et cloud. Disponible pour coaching.',
    organization: 'IoT Connect', position: 'Lead Engineer', yearsOfExperience: 10,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'IoT', level: 'expert', years: 10 },
      { name: 'Cloud & DevOps', level: 'senior', years: 7 },
      { name: 'Développement Web', level: 'intermediate', years: 4 },
    ],
  },
  // Expert 5 — UX/UI specialist
  {
    email: 'expert.ux@test.com', firstName: 'Claire', lastName: 'Moreau',
    headline: 'Experte UX/UI Design & Product Management',
    bio: 'Designer UX/UI avec 8 ans d\'expérience. Passionnée par la conception centrée utilisateur. Enseignement et formation.',
    organization: 'DesignFirst', position: 'UX Director', yearsOfExperience: 8,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'UX / UI Design', level: 'expert', years: 8 },
      { name: 'Product Management', level: 'senior', years: 6 },
      { name: 'Design Thinking', level: 'expert', years: 7 },
      { name: 'Branding & Communication', level: 'intermediate', years: 3 },
    ],
  },
  // Expert 6 — Marketing specialist
  {
    email: 'expert.marketing@test.com', firstName: 'Thomas', lastName: 'Rousseau',
    headline: 'Expert Marketing Digital & Growth',
    bio: 'Growth hacker avec 6 ans d\'expérience en marketing digital et acquisition. Coach pour startups.',
    organization: 'GrowthMasters', position: 'Head of Growth', yearsOfExperience: 6,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Marketing Digital', level: 'expert', years: 6 },
      { name: 'Growth Hacking', level: 'expert', years: 5 },
      { name: 'SEO / SEA', level: 'senior', years: 4 },
      { name: 'Branding & Communication', level: 'intermediate', years: 3 },
    ],
  },
  // Expert 7 — Legal specialist
  {
    email: 'expert.legal@test.com', firstName: 'Marie', lastName: 'Laurent',
    headline: 'Experte Droit des Startups & Conformité',
    bio: 'Avocate spécialisée en droit des startups, propriété intellectuelle et RGPD. Conseil juridique pour entrepreneurs.',
    organization: 'LegalTech Advisory', position: 'Associée', yearsOfExperience: 12,
    availability: 'BUSY',
    expertiseAreas: [
      { name: 'Droit des Startups', level: 'expert', years: 12 },
      { name: 'Propriété intellectuelle', level: 'expert', years: 10 },
      { name: 'RGPD & Conformité', level: 'senior', years: 8 },
    ],
  },
  // Expert 8 — Business Strategy
  {
    email: 'expert.strategy@test.com', firstName: 'Philippe', lastName: 'Garcia',
    headline: 'Expert Stratégie & Business Development',
    bio: 'Stratège d\'entreprise avec 20 ans d\'expérience en développement commercial et business development. Mentor certifié.',
    organization: 'StratEdge Consulting', position: 'Senior Partner', yearsOfExperience: 20,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Business Model', level: 'expert', years: 18 },
      { name: 'Stratégie Go-to-Market', level: 'expert', years: 15 },
      { name: 'Ventes B2B', level: 'senior', years: 12 },
      { name: 'Leadership & Management', level: 'senior', years: 10 },
    ],
  },
  // Expert 9 — Sustainable / Green
  {
    email: 'expert.green@test.com', firstName: 'Emma', lastName: 'Petit',
    headline: 'Experte Développement Durable & Économie Circulaire',
    bio: 'Spécialiste en développement durable et impact social. 8 ans d\'expérience en conseil RSE. Formatrice certifiée.',
    organization: 'GreenFuture', position: 'Consultante Senior', yearsOfExperience: 8,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Développement Durable', level: 'expert', years: 8 },
      { name: 'Impact Social', level: 'senior', years: 6 },
      { name: 'Business Model', level: 'intermediate', years: 3 },
      { name: 'Coaching & Mentoring', level: 'senior', years: 5 },
    ],
  },
  // Expert 10 — Mobile specialist
  {
    email: 'expert.mobile@test.com', firstName: 'Lucas', lastName: 'Bernard',
    headline: 'Expert Développement Mobile',
    bio: 'Développeur mobile expert React Native et Flutter. 7 ans d\'expérience. Disponible pour coaching technique.',
    organization: 'MobileFirst Dev', position: 'Lead Developer', yearsOfExperience: 7,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Développement Mobile', level: 'expert', years: 7 },
      { name: 'Développement Web', level: 'senior', years: 5 },
      { name: 'UX / UI Design', level: 'intermediate', years: 3 },
    ],
  },
  // Expert 11 — EdTech specialist
  {
    email: 'expert.edtech@test.com', firstName: 'Isabelle', lastName: 'Moreau',
    headline: 'Experte EdTech & Pédagogie Numérique',
    bio: 'Spécialiste en pédagogie numérique et technologies éducatives. 10 ans d\'expérience en formation et e-learning. Mentor.',
    organization: 'EduTech Academy', position: 'Directrice Pédagogique', yearsOfExperience: 10,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Ed-Tech', level: 'expert', years: 10 },
      { name: 'Product Management', level: 'senior', years: 6 },
      { name: 'UX / UI Design', level: 'intermediate', years: 4 },
      { name: 'Coaching & Mentoring', level: 'senior', years: 7 },
    ],
  },
  // Expert 12 — Sales specialist
  {
    email: 'expert.sales@test.com', firstName: 'Nicolas', lastName: 'Dubois',
    headline: 'Expert Ventes B2B & Business Development',
    bio: 'Expert en ventes B2B et développement commercial. 9 ans d\'expérience dans l\'acquisition enterprise.',
    organization: 'SalesForce Pro', position: 'VP Sales', yearsOfExperience: 9,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Ventes B2B', level: 'expert', years: 9 },
      { name: 'Stratégie Go-to-Market', level: 'senior', years: 7 },
      { name: 'Business Model', level: 'intermediate', years: 4 },
    ],
  },
  // Expert 13 — DevOps/Cloud
  {
    email: 'expert.devops@test.com', firstName: 'Antoine', lastName: 'Leroy',
    headline: 'Expert Cloud & DevOps',
    bio: 'Architecte cloud AWS/Azure avec 11 ans d\'expérience. Spécialiste en infrastructure scalable et DevOps.',
    organization: 'CloudScale', position: 'Cloud Architect', yearsOfExperience: 11,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Cloud & DevOps', level: 'expert', years: 11 },
      { name: 'Cybersécurité', level: 'senior', years: 5 },
      { name: 'Développement Web', level: 'intermediate', years: 4 },
    ],
  },
  // Expert 14 — Product Design
  {
    email: 'expert.product@test.com', firstName: 'Camille', lastName: 'Dubois',
    headline: 'Experte Product Management & Design',
    bio: 'Product manager avec 9 ans d\'expérience en conception de produits digitaux. Spécialiste Design Thinking.',
    organization: 'ProductLab', position: 'Head of Product', yearsOfExperience: 9,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Product Management', level: 'expert', years: 9 },
      { name: 'Design Thinking', level: 'expert', years: 7 },
      { name: 'UX / UI Design', level: 'senior', years: 6 },
      { name: 'Lean Startup', level: 'senior', years: 5 },
    ],
  },
  // Expert 15 — MedTech / Health
  {
    email: 'expert.health@test.com', firstName: 'Dr. Julien', lastName: 'Sanchez',
    headline: 'Expert MedTech & Santé Digitale',
    bio: 'Médecin et ingénieur biomédical. Spécialiste des systèmes d\'information hospitaliers et e-santé.',
    organization: 'HealthInnov', position: 'Directeur Médical', yearsOfExperience: 14,
    availability: 'BUSY',
    expertiseAreas: [
      { name: 'Med-Tech / Santé', level: 'expert', years: 14 },
      { name: 'Intelligence Artificielle', level: 'senior', years: 6 },
      { name: 'Développement Web', level: 'intermediate', years: 3 },
    ],
  },
  // Expert 16 — Blockchain
  {
    email: 'expert.blockchain@test.com', firstName: 'Thomas', lastName: 'Petit',
    headline: 'Expert Blockchain & Sécurité',
    bio: 'Développeur blockchain et expert en sécurité des systèmes distribués. 8 ans d\'expérience.',
    organization: 'ChainSecure', position: 'CTO', yearsOfExperience: 8,
    availability: 'UNAVAILABLE',
    expertiseAreas: [
      { name: 'Blockchain', level: 'expert', years: 8 },
      { name: 'Cybersécurité', level: 'senior', years: 6 },
      { name: 'Développement Web', level: 'senior', years: 5 },
    ],
  },
  // Expert 17 — Lean Startup / Agile
  {
    email: 'expert.lean@test.com', firstName: 'Nathalie', lastName: 'Petit',
    headline: 'Experte Lean Startup & Agile',
    bio: 'Coach certifiée en Lean Startup et méthodologies agiles. 12 ans d\'expérience en transformation digitale.',
    organization: 'AgileCoaching', position: 'Senior Coach', yearsOfExperience: 12,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Lean Startup', level: 'expert', years: 12 },
      { name: 'Product Management', level: 'senior', years: 8 },
      { name: 'Coaching & Mentoring', level: 'expert', years: 10 },
      { name: 'Leadership & Management', level: 'senior', years: 7 },
    ],
  },
  // Expert 18 — Data Analytics
  {
    email: 'expert.data@test.com', firstName: 'Claude', lastName: 'Lefèvre',
    headline: 'Expert Data Analytics & Business Intelligence',
    bio: 'Data analyst senior avec 10 ans d\'expérience en Business Intelligence et visualisation de données.',
    organization: 'DataInsight', position: 'Lead Data Analyst', yearsOfExperience: 10,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Data Science', level: 'expert', years: 10 },
      { name: 'Intelligence Artificielle', level: 'senior', years: 6 },
      { name: 'Finance & Comptabilité', level: 'intermediate', years: 3 },
    ],
  },
  // Expert 19 — HR / Recruitment
  {
    email: 'expert.hr@test.com', firstName: 'Valérie', lastName: 'Garnier',
    headline: 'Experte RH & Recrutement Digital',
    bio: 'Experte en ressources humaines et recrutement digital. 9 ans d\'expérience en startup.',
    organization: 'TalentHub', position: 'HR Director', yearsOfExperience: 9,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Recrutement & Talent', level: 'expert', years: 9 },
      { name: 'Leadership & Management', level: 'senior', years: 7 },
      { name: "Culture d'entreprise", level: 'senior', years: 6 },
      { name: 'Coaching & Mentoring', level: 'intermediate', years: 4 },
    ],
  },
  // Expert 20 — AgriTech
  {
    email: 'expert.agritech@test.com', firstName: 'François', lastName: 'Duval',
    headline: 'Expert AgriTech & Développement Durable',
    bio: 'Ingénieur agronome spécialisé en agriculture de précision et IoT agricole. 7 ans d\'expérience.',
    organization: 'AgriInnov', position: 'CTO', yearsOfExperience: 7,
    availability: 'AVAILABLE',
    expertiseAreas: [
      { name: 'Agri-Tech', level: 'expert', years: 7 },
      { name: 'IoT', level: 'senior', years: 5 },
      { name: 'Data Science', level: 'intermediate', years: 3 },
      { name: 'Développement Durable', level: 'intermediate', years: 3 },
    ],
  },
];

// ─── 10 INCUBATOR MEMBERS ────────────────────────────────────────────────────

interface MemberDef {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  country: string;
  city: string;
}

const INCUBATOR_MEMBERS: MemberDef[] = [
  { email: 'incub.admin1@test.com', firstName: 'Ahmed', lastName: 'Bouzid', bio: 'Directeur de programme d\'incubation.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.admin2@test.com', firstName: 'Sami', lastName: 'Cherif', bio: 'Chef de programme incubation startups tech.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.pm1@test.com', firstName: 'Leila', lastName: 'Ben Ahmed', bio: 'Program manager spécialisée en cohortes fintech.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.pm2@test.com', firstName: 'Youssef', lastName: 'Ghorbel', bio: 'Program manager pour les programmes green et agritech.', country: 'Tunisia', city: 'Sousse' },
  { email: 'incub.cm1@test.com', firstName: 'Fatma', lastName: 'Zouari', bio: 'Cohort manager pour la cohorte EdTech et IA.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.cm2@test.com', firstName: 'Mohamed', lastName: 'Sassi', bio: 'Cohort manager digital entrepreneurship.', country: 'Tunisia', city: 'Sfax' },
  { email: 'incub.rm1@test.com', firstName: 'Ines', lastName: 'Mansour', bio: 'Review manager pour les évaluations de projets.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.rm2@test.com', firstName: 'Khaled', lastName: 'Brahimi', bio: 'Review manager et jury coordination.', country: 'Morocco', city: 'Casablanca' },
  { email: 'incub.m1@test.com', firstName: 'Nour', lastName: 'Hfaiedh', bio: 'Membre de l\'équipe incubateur.', country: 'Tunisia', city: 'Tunis' },
  { email: 'incub.m2@test.com', firstName: 'Ali', lastName: 'Trabelsi', bio: 'Assistant programme et suivi des cohortes.', country: 'Tunisia', city: 'Monastir' },
];

// ─── 40 PROJECTS with GBM data ──────────────────────────────────────────────

interface ProjectDef {
  name: string;
  description: string;
  ownerIndex: number;
  fundingPhase: string;
  ideaSketch: {
    ideaInitial: string;
    productService: string;
    customers: string;
    partners: string;
  };
  contextSummary: string;
  problemsNeeds: {
    environmentalChallenges: string;
    socialChallenges: string;
    customerNeeds: string;
  };
}

const PROJECTS: ProjectDef[] = [
  // ═══ GROUP 1 — FINTECH (Projects 1-4, similar) ═══
  {
    name: 'FinPay TN',
    description: 'Plateforme de paiement digital pour les PME tunisiennes',
    ownerIndex: 0,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Paiement digital mobile pour commerçants tunisiens',
      productService: 'Application de paiement mobile et terminal NFC',
      customers: 'Commerçants PME marchés tunisiens',
      partners: 'Banques partenaires opérateurs télécoms',
    },
    contextSummary: 'Solution fintech de paiement digital ciblant les PME tunisiennes avec terminal NFC et application mobile. Besoin de conformité bancaire cybersécurité et stratégie go-to-market.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction des transactions en espèches',
      socialChallenges: 'Inclusion financière des petits commerçants',
      customerNeeds: 'Paiement simple rapide sécurisé sans frais excessifs',
    },
  },
  {
    name: 'SME Finance Hub',
    description: 'SaaS de gestion financière pour PME nord-africaines',
    ownerIndex: 1,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Outil SaaS de gestion financière automatisée pour PME',
      productService: 'Plateforme cloud de comptabilité et reporting financier',
      customers: 'PME 10-100 employés Tunisie Maroc Algérie',
      partners: 'Experts-comptables organismes bancaires',
    },
    contextSummary: 'Solution SaaS de gestion financière automatisée pour PME. Intégration comptabilité reporting fiscal et prévisionnel. Développement web backend robuste cloud infrastructure.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation des processus comptables',
      socialChallenges: 'Accès à la gestion financière pour PME',
      customerNeeds: 'Automatisation comptabilité reporting conformité fiscale',
    },
  },
  {
    name: 'WalletPlus',
    description: 'Portefeuille mobile multi-services pour marchés émergents',
    ownerIndex: 2,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'Mobile wallet multi-services Afrique du Nord',
      productService: 'Application mobile de transfert argent paiement factures',
      customers: 'Particuliers et petits commerçants marchés émergents',
      partners: 'Opérateurs télécoms banques microfinance',
    },
    contextSummary: 'Portefeuille mobile multi-services pour marchés émergents. Transfert argent paiement factures micro-épargne. Mobile money inclusion financière Afrique du Nord.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction empreinte carbone transactions physiques',
      socialChallenges: 'Inclusion financière populations non bancarisées',
      customerNeeds: 'Services financiers accessibles via smartphone',
    },
  },
  {
    name: 'InvoiceFlow',
    description: 'Plateforme de financement de factures pour entreprises',
    ownerIndex: 3,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Financement participatif de facturations entreprise',
      productService: 'Plateforme de factoring digital et affacturage',
      customers: 'PME fournisseurs gros comptes',
      partners: 'Banques investisseurs factorig companies',
    },
    contextSummary: 'Plateforme de financement de factures et affacturage digital. Matching PME fournisseurs avec investisseurs. Blockchain traçabilitésmart contracts.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation processus financiers',
      socialChallenges: 'Accès au financement pour PME',
      customerNeeds: 'Trésorerie rapide sans recours bancaire traditionnel',
    },
  },
  // ═══ GROUP 2 — EDTECH (Projects 5-8, similar) ═══
  {
    name: 'EduAdapt',
    description: 'Plateforme d\'apprentissage adaptive pour universités',
    ownerIndex: 4,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Plateforme éducation adaptive université',
      productService: 'Système d\'apprentissage adaptatif IA personnalisé',
      customers: 'Universités étudiants chercheurs',
      partners: 'Éditeurs contenu institutions éducatives',
    },
    contextSummary: 'Plateforme ed-tech d\'apprentissage adaptive utilisant l\'IA pour personnaliser le parcours étudiant. Système de recommandation de contenu éducatif. UX/UI pédagogie.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction papier éducation',
      socialChallenges: 'Accès éducation de qualité tous étudiants',
      customerNeeds: 'Parcours personnalisé évaluation adaptative',
    },
  },
  {
    name: 'TutorConnect',
    description: 'Plateforme de tutorat en ligne avec matching intelligent',
    ownerIndex: 5,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Tutorat en ligne matching élève tuteur',
      productService: 'Plateforme vidéo interactive avec matching IA',
      customers: 'Éludes parents tuteurs indépendants',
      partners: 'Écoles universités centres de formation',
    },
    contextSummary: 'Plateforme de tutorat en ligne avec matching intelligent tuteur-élève. Vidéo interactive tableaux blancs numériques. Système de recommandation basé sur compétences.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction déplacements physiques',
      socialChallenges: 'Accès tuteur qualité pour tous',
      customerNeeds: 'Tuteur compétent disponible flexible',
    },
  },
  {
    name: 'ExamPrep AI',
    description: 'Application IA de préparation aux examens',
    ownerIndex: 6,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'App préparation examens intelligence artificielle',
      productService: 'Application mobile IA quiz adaptatif',
      customers: 'Étudiants lycéens préparation concours',
      partners: 'Éditeurs manuels écoles',
    },
    contextSummary: 'Application mobile utilisant l\'IA pour la préparation aux examens. Quiz adaptatif flashcards intelligentes. Apprentissage mobile gamification.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction livres physiques',
      socialChallenges: 'Égalité accès préparation examens',
      customerNeeds: 'Préparation efficace personnalisée examens',
    },
  },
  {
    name: 'UniManager',
    description: 'Système de gestion universitaire intégré',
    ownerIndex: 4,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'Logiciel gestion universitaire SaaS',
      productService: 'Plateforme gestion inscriptions emplois du temps notes',
      customers: 'Universités administration enseignants',
      partners: 'Fournisseurs ERP éducation',
    },
    contextSummary: 'Système de gestion universitaire intégré SaaS. Gestion inscriptions emplois du temps évaluation administration. Développement web cloud multi-tenant.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation processus universitaires',
      socialChallenges: 'Efficacité administrative éducation',
      customerNeeds: 'Gestion centralisée automatisée processus',
    },
  },
  // ═══ GROUP 3 — AGRITECH (Projects 9-12, similar) ═══
  {
    name: 'SmartFarm TN',
    description: 'IoT pour irrigation intelligente agriculture durable',
    ownerIndex: 7,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'IoT irrigation intelligente agriculture',
      productService: 'Capteurs sol ambiantaux système irrigation automatisé',
      customers: 'Agriculteurs exploitation maraîchère viticole',
      partners: 'Fournisseurs capteurs institutions agricoles',
    },
    contextSummary: 'Système IoT d\'irrigation intelligente pour agriculture durable. Capteurs sol données météo algorithme optimisation eau. Agriculture précision développement durable.',
    problemsNeeds: {
      environmentalChallenges: 'Économie eau agriculture durable réduction gaspillage',
      socialChallenges: 'Aide agriculteurs optimiser production',
      customerNeeds: 'Irrigation optimisée basée données temps réel',
    },
  },
  {
    name: 'CropVision',
    description: 'Monitoring culture par drone et intelligence artificielle',
    ownerIndex: 8,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Monitoring cultures drone IA',
      productService: 'Analyse images drone détection maladies rendement',
      customers: 'Agricultes grande culture coopératives',
      partners: 'Fournisseurs drones instituts recherche agronomique',
    },
    contextSummary: 'Système de monitoring cultures par drone et analyse IA. Détection précoce maladies estimation rendement optimisation traitements. Data science agriculture précision.',
    problemsNeeds: {
      environmentalChallenges: 'Optimisation traitements réduction produits phytosanitaires',
      socialChallenges: 'Amélioration rendements agriculture durable',
      customerNeeds: 'Suivi cultures temps réel détection problèmes',
    },
  },
  {
    name: 'AgriMarket TN',
    description: 'Marketplace agricole producteurs-consommateurs',
    ownerIndex: 9,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Marketplace direct producteurs consommateurs agriculture',
      productService: 'Application mobile e-commerce produits frais',
      customers: 'Producteurs agricoles consommateurs urbains',
      partners: 'Coopératives agricles livraison dernière mile',
    },
    contextSummary: 'Marketplace connectant directement producteurs agricoles et consommateurs urbains. E-commerce fresh food logistique dernière mile. Réduction intermédiaires.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction gaspillage alimentaire circuits courts',
      socialChallenges: 'Revenu juste producteurs accès alimentaire saine',
      customerNeeds: 'Accès produits frais locaux prix juste',
    },
  },
  {
    name: 'FarmOS',
    description: 'SaaS de gestion d\'exploitation agricole',
    ownerIndex: 7,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'Logiciel gestion exploitation agricole',
      productService: 'Plateforme cloud gestion planning trésorerie agricole',
      customers: 'Exploitants agricoles cooperatives',
      partners: 'Fournisseurs intrants banques agricoles',
    },
    contextSummary: 'SaaS de gestion complète exploitation agricole. Planning cultures gestion financière traçabilité conformité. Cloud multi-utilisateurs mobile.',
    problemsNeeds: {
      environmentalChallenges: 'Gestion durable ressources agricoles',
      socialChallenges: 'Modernisation agriculture familiale',
      customerNeeds: 'Outil gestion simple complet agriculture',
    },
  },
  // ═══ GROUP 4 — HEALTHTECH (Projects 13-15) ═══
  {
    name: 'MedConnect',
    description: 'Plateforme de télémédecine pour zones rurales',
    ownerIndex: 10,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Télémédecine accès soins zones rurales',
      productService: 'Plateforme vidéo consultation médicale',
      customers: 'Patients zones rurales médecins généralistes',
      partners: 'Hôpitaux centres santé assureurs',
    },
    contextSummary: 'Plateforme de télémédecine pour améliorer l\'accès aux soins dans les zones rurales. Consultation vidéo prescription numérique dossiers médicaux. Santé digitale.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction déplacements médicaux',
      socialChallenges: 'Accès soins santé zones rurales',
      customerNeeds: 'Consultation médicale à distance fiable',
    },
  },
  {
    name: 'DiagnosAI',
    description: 'IA pour assistance au diagnostic médical',
    ownerIndex: 11,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'IA diagnostic médical imagerie',
      productService: 'Algorithme deep learning analyse images médicales',
      customers: 'Hôpitaux cliniques radiologues',
      partners: 'Fournisseurs équipements médicaux instituts recherche',
    },
    contextSummary: 'Système d\'IA pour assistance au diagnostic médical par analyse d\'imagerie. Deep learning computer vision santé. Qualité diagnostic rapidité.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction gaspillage ressources médicales',
      socialChallenges: 'Amélioration diagnostic précocité',
      customerNeeds: 'Aide diagnostic fiable rapide intégrable',
    },
  },
  {
    name: 'MindWell',
    description: 'Application de bien-être et santé mentale',
    ownerIndex: 12,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Application bien-être santé mentale',
      productService: 'App mobile méditation suivi humeur coaching',
      customers: 'Particuliers entreprises bien-être',
      partners: 'Psychologues entreprises RSE',
    },
    contextSummary: 'Application mobile de bien-être et santé mentale. Méditation guidée suivi humeur coaching personnalisé. Gamification bien-être mental.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction stress impact environnement',
      socialChallenges: 'Accès santé mentale tous',
      customerNeeds: 'Outil bien-être simple efficace quotidien',
    },
  },
  // ═══ GROUP 5 — GREENTECH (Projects 16-18) ═══
  {
    name: 'GreenPower TN',
    description: 'Solutions solaires intelligentes pour entreprises',
    ownerIndex: 13,
    fundingPhase: 'GROWTH',
    ideaSketch: {
      ideaInitial: 'Énergie solaire entreprises intelligent',
      productService: 'Installation monitoring panneaux solaires IoT',
      customers: 'Entreprises industrielles commerces',
      partners: 'Installateurs solaires banques financement vert',
    },
    contextSummary: 'Solutions d\'énergie solaire intelligente pour entreprises. Installation monitoring IoT optimisation production. Finance verte investissement durable.',
    problemsNeeds: {
      environmentalChallenges: 'Transition énergétique réduction émissions carbone',
      socialChallenges: 'Accès énergie renouvelable entreprises',
      customerNeeds: 'Solution solaire clé en main rentable',
    },
  },
  {
    name: 'EcoCycle',
    description: 'Gestion intelligente des déchets et économie circulaire',
    ownerIndex: 14,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Gestion intelligente déchets circulaire',
      productService: 'Capteurs IoT poubelles optimisation collecte',
      customers: 'Villes entreprises collectivités',
      partners: 'Entreprises recyclage collectivités',
    },
    contextSummary: 'Système de gestion intelligente des déchets par IoT. Optimisation collecte tri sélectif économie circulaire. Développement durable villes intelligentes.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction déchets optimisation recyclage',
      socialChallenges: 'Sensibilisation économie circulaire',
      customerNeeds: 'Gestion déchets efficace traçable',
    },
  },
  {
    name: 'AirWatch TN',
    description: 'Capteurs IoT pour monitoring qualité de l\'air',
    ownerIndex: 15,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Monitoring qualité air IoT capteurs',
      productService: 'Réseau capteurs IoT mesure pollution temps réel',
      customers: 'Villes industries citoyens',
      partners: 'Institutions environnementales chercheurs',
    },
    contextSummary: 'Réseau de capteurs IoT pour monitoring qualité de l\'air en temps réel. Données pollution alertes recommandations. Villes intelligentes développement durable.',
    problemsNeeds: {
      environmentalChallenges: 'Surveillance pollution amélioration qualité air',
      socialChallenges: 'Information citoyens santé publique',
      customerNeeds: 'Données qualité air fiables temps réel',
    },
  },
  // ═══ GROUP 6 — SAAS / LOGISTICS (Projects 19-21) ═══
  {
    name: 'TaskFlow Pro',
    description: 'SaaS B2B de gestion de projet et productivité',
    ownerIndex: 16,
    fundingPhase: 'GROWTH',
    ideaSketch: {
      ideaInitial: 'SaaS gestion projet productivité équipe',
      productService: 'Application web Kanban planning collaboration',
      customers: 'PME équipes projet remote',
      partners: 'Intégrateurs Slack Notion outils productivity',
    },
    contextSummary: 'SaaS B2B de gestion de projet et productivité d\'équipe. Kanban planning collaboration temps réel. API intégrations tiers multi-tenant cloud.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation processus projet',
      socialChallenges: 'Collaboration équipes distantes',
      customerNeeds: 'Outil gestion projet intuitif intégrable',
    },
  },
  {
    name: 'DeliverNow',
    description: 'Logistique du dernier kilomètre et livraison express',
    ownerIndex: 17,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Livraison dernière mile express',
      productService: 'Application mobile matching livreur client',
      customers: 'Commerces e-commerce restaurants',
      partners: 'Transporteurs livreurs indépendants',
    },
    contextSummary: 'Plateforme de livraison dernière kilomètre et express. Matching dynamique livreur client optimisation itinéraires. Logistique mobile geolocalisation.',
    problemsNeeds: {
      environmentalChallenges: 'Optimisation itinéraires réduction émissions',
      socialChallenges: 'Emploi flexible livreurs',
      customerNeeds: 'Livraison rapide fiable traçable',
    },
  },
  {
    name: 'TuniCraft',
    description: 'Marketplace artisanat tunisien et tourisme expérientiel',
    ownerIndex: 18,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Marketplace artisanat tunisien tourisme',
      productService: 'Plateforme e-commerce artisanat expériences',
      customers: 'Touristes collectionneurs acheteurs internationaux',
      partners: 'Artisans guides touristiques hôtels',
    },
    contextSummary: 'Marketplace en ligne d\'artisanat tunisien avec expériences touristiques. E-commerce produits artisanaux réservation ateliers. Tourism digitale cultural.',
    problemsNeeds: {
      environmentalChallenges: 'Promotion artisanat durable produits locaux',
      socialChallenges: 'Soutien artisans traditionnels communautés',
      customerNeeds: 'Accès artisanat authenticité garantie',
    },
  },
  // ═══ GROUP 7 — CYBERSECURITY / AI (Projects 22-24) ═══
  {
    name: 'SecureBank',
    description: 'Cybersécurité bancaire et protection données financières',
    ownerIndex: 19,
    fundingPhase: 'GROWTH',
    ideaSketch: {
      ideaInitial: 'Cybersécurité données bancaires financières',
      productService: 'Plateforme protection fraude détection menaces',
      customers: 'Banques assurances institutions financières',
      partners: 'Fournisseurs sécurité régulateurs financiers',
    },
    contextSummary: 'Solutions de cybersécurité pour institutions financières. Détection fraude protection données conformité réglementaire. Sécurité bancaire RGPD.',
    problemsNeeds: {
      environmentalChallenges: 'Protection ressources numériques',
      socialChallenges: 'Sécurisation données financières citoyens',
      customerNeeds: 'Protection fraude conforme réglementation',
    },
  },
  {
    name: 'RecSys Pro',
    description: 'Système de recommandation IA pour e-commerce',
    ownerIndex: 20,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Système recommandation e-commerce IA',
      productService: 'API recommandation personnalisée comportement achat',
      customers: 'E-commerces marketplaces plateformes',
      partners: 'Plateformes e-commerce data providers',
    },
    contextSummary: 'Système de recommandation IA pour e-commerce. Analyse comportementale personalisation offres. Machine learning deep learning NLP.',
    problemsNeeds: {
      environmentalChallenges: 'Optimisation stock réduction gaspillage',
      socialChallenges: 'Expérience utilisateur personnalisée',
      customerNeeds: 'Recommandations pertinentes taux conversion',
    },
  },
  {
    name: 'GrowthLab',
    description: 'Acceleration marketing pour startups',
    ownerIndex: 21,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Acceleration marketing startup',
      productService: 'Plateforme growth hacking analytics marketing',
      customers: 'Startups PME croissance rapide',
      partners: 'Agences marketing plateformes publicitaires',
    },
    contextSummary: 'Plateforme d\'accélération marketing pour startups. Growth hacking analytics automatisation campagnes. Marketing digital acquisition conversion.',
    problemsNeeds: {
      environmentalChallenges: 'Marketing durable responsable',
      socialChallenges: 'Accès outils marketing startups',
      customerNeeds: 'Croissance rapide mesurable optimisée',
    },
  },
  // ═══ GROUP 8 — IOT / BLOCKCHAIN / FOODTECH (Projects 25-27) ═══
  {
    name: 'SmartCity TN',
    description: 'Solutions IoT pour villes intelligentes',
    ownerIndex: 22,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'IoT villes intelligentes urbanisme',
      productService: 'Plateforme capteurs IoT gestion urbaine',
      customers: 'Municipalités villes urbanistes',
      partners: 'Fournisseurs IoT opérateurs télécoms',
    },
    contextSummary: 'Solutions IoT complètes pour villes intelligentes. Gestion trafic parking énergie déchets. Infrastructure cloud scalable capteurs connectés.',
    problemsNeeds: {
      environmentalChallenges: 'Optimisation ressources urbaines énergie',
      socialChallenges: 'Qualité vie citoyens villes intelligentes',
      customerNeeds: 'Système IoT intégré efficace scalable',
    },
  },
  {
    name: 'AgriChain',
    description: 'Traçabilité blockchain pour agriculture et alimentaire',
    ownerIndex: 23,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Traçabilité blockchain agriculture alimentaire',
      productService: 'Plateforme blockchain traçabilité chaîne alimentaire',
      customers: 'Producteurs agricoles distributeurs',
      partners: 'Institutions agriculture blockchain networks',
    },
    contextSummary: 'Plateforme blockchain pour traçabilité agricole et alimentaire. Smart contracts suivi chaîne alimentaire. Confiance transparence qualité.',
    problemsNeeds: {
      environmentalChallenges: 'Traçabilité durable produits agricoles',
      socialChallenges: 'Confiance consommateur origine produits',
      customerNeeds: 'Traçabilité fiable transparente blockchain',
    },
  },
  {
    name: 'NutriMatch',
    description: 'Application IA de nutrition personnalisée',
    ownerIndex: 24,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Nutrition personnalisée IA application',
      productService: 'App mobile plan repas personnalisé IA',
      customers: 'Particuliers diabétiques sportifs',
      partners: 'Nutritionnistes diététiciens fournisseurs alimentaires',
    },
    contextSummary: 'Application mobile de nutrition personnalisée par IA. Analyse profil alimentaire recommandations repas. Mobile IA santé bien-être.',
    problemsNeeds: {
      environmentalChallenges: 'Alimentation durable locale',
      socialChallenges: 'Accès nutrition personnalisée',
      customerNeeds: 'Plan repas adapté objectifs santé',
    },
  },
  // ═══ EDGE CASE PROJECTS (Projects 28-32) ═══
  {
    name: 'IdeaProject',
    description: 'Projet en phase d\'idée très early stage sans détails',
    ownerIndex: 25,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Idée de business vague',
      productService: '',
      customers: '',
      partners: '',
    },
    contextSummary: '',
    problemsNeeds: {
      environmentalChallenges: '',
      socialChallenges: '',
      customerNeeds: '',
    },
  },
  {
    name: 'LegalStartup',
    description: 'Plateforme juridique pour startups et TPE',
    ownerIndex: 26,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Plateforme juridique automatisée startups',
      productService: 'SaaS de conformité juridique et contrats',
      customers: 'Startups TPE entrepreneurs',
      partners: 'Cabinets avocats notaires',
    },
    contextSummary: 'Plateforme juridique pour startups automatisant conformité contrats et veille réglementaire. Droit des startups propriété intellectuelle RGPD.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation processus juridiques',
      socialChallenges: 'Accès droit qualité pour startups',
      customerNeeds: 'Conformité juridique simple automatisée',
    },
  },
  {
    name: 'FreelanceHub',
    description: 'Marketplace de freelances et services digitaux',
    ownerIndex: 27,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Marketplace freelances services digitaux',
      productService: 'Plateforme mise en relation freelances clients',
      customers: 'Freelances PME clients projets',
      partners: 'Communautés freelances plateformes paiement',
    },
    contextSummary: 'Marketplace de freelances et services digitaux. Matching compétences projets paiement sécurisé. Développement web mobile.',
    problemsNeeds: {
      environmentalChallenges: 'Travail à distance réduction déplacements',
      socialChallenges: 'Emploi flexible freelances',
      customerNeeds: 'Freelance compétent disponible projet',
    },
  },
  {
    name: 'ChemLab Green',
    description: 'Recherche chimie verte et matériaux biosourcés',
    ownerIndex: 28,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Chimie verte matériaux biosourcés',
      productService: 'Laboratoire R&D matériaux durables',
      customers: 'Industries chimiques cosmétiques',
      partners: 'Universités laboratoires recherche',
    },
    contextSummary: 'Projet de R&D en chimie verte pour développement de matériaux biosourcés durables. Recherche scientifique innovation chimique.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction produits chimiques synthétiques',
      socialChallenges: 'Innovation chimie durable',
      customerNeeds: 'Matériaux biosourcés performants',
    },
  },
  {
    name: 'MobilityTN',
    description: 'Solution de mobilité urbaine et transports partagés',
    ownerIndex: 29,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Mobilité urbaine transports partagés',
      productService: '',
      customers: 'Villes usagers urbains',
      partners: '',
    },
    contextSummary: 'Solution de mobilité urbaine pour covoiturage et transports partagés. Très peu de détails fournis.',
    problemsNeeds: {
      environmentalChallenges: 'Réduction trafic pollutions urbaines',
      socialChallenges: 'Mobilité accessible tous',
      customerNeeds: 'Transport pratique abordable',
    },
  },
  // ═══ ADDITIONAL PROJECTS FOR SIMILARITY TESTING (Projects 33-40) ═══
  {
    name: 'PayGate',
    description: 'Passerelle de paiement pour e-commerce africain',
    ownerIndex: 0,
    fundingPhase: 'EARLY_STAGE',
    ideaSketch: {
      ideaInitial: 'Passerale paiement e-commerce Afrique',
      productService: 'API paiement multi-modes mobile money carte',
      customers: 'E-commerces marketplaces Afrique',
      partners: 'Opérateurs mobile money banques',
    },
    contextSummary: 'Passerale de paiement pour e-commerce africain. API intégration multi-modes paiement mobile money carte bancaire. Fintech paiement.',
    problemsNeeds: {
      environmentalChallenges: 'Dématérialisation paiements',
      socialChallenges: 'Inclusion financière e-commerce',
      customerNeeds: 'Paiement fiable multiple Afrique',
    },
  },
  {
    name: 'LearnPlay',
    description: 'Plateforme de learning par le jeu pour enfants',
    ownerIndex: 5,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Éducation ludique enfants plateforme jeu',
      productService: 'Application mobile jeux éducatifs adaptatifs',
      customers: 'Enfants 6-12 ans parents écoles',
      partners: 'Éditeurs jeux écoles',
    },
    contextSummary: 'Plateforme éducative ludique pour enfants. Jeux interactifs apprentissage adaptatif gamification. EdTech enfant.',
    problemsNeeds: {
      environmentalChallenges: 'Éducation durable sans matériel physique',
      socialChallenges: 'Éducation ludique accessible tous enfants',
      customerNeeds: 'Apprentissage amusant efficace adapté',
    },
  },
  {
    name: 'GreenLogistics',
    description: 'Logistique verte et livraison zéro carbone',
    ownerIndex: 14,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Logistique verte livraison zéro carbone',
      productService: 'Service livraison vélos électriques optimisation',
      customers: 'Commerces e-commerce villes',
      partners: 'Vélos électriques bornes recharge',
    },
    contextSummary: 'Service de logistique verte et livraison zéro carbone. Vélos électriques optimisation itinéraires urbains. Développement durable mobilité.',
    problemsNeeds: {
      environmentalChallenges: 'Zéro émission carbone livraison',
      socialChallenges: 'Emploi vert mobilité durable',
      customerNeeds: 'Livraison écologique fiable',
    },
  },
  {
    name: 'FinLearn',
    description: 'Éducation financière interactive et gamifiée',
    ownerIndex: 3,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Éducation financière gamifiée interactive',
      productService: 'Application mobile cours finance personnalises',
      customers: 'Jeunes adultes étudiants',
      partners: 'Institutions financières écoles',
    },
    contextSummary: 'Plateforme d\'éducation financière interactive et gamifiée. Cours personnalisés simulations investissement. Fintech edtech crossover.',
    problemsNeeds: {
      environmentalChallenges: 'Éducation financière sans support papier',
      socialChallenges: 'Inclusion financière éducation',
      customerNeeds: 'Comprendre finance personnelles simplement',
    },
  },
  {
    name: 'CloudAgri',
    description: 'Plateforme cloud pour données agricoles',
    ownerIndex: 8,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Cloud données agricoles big data',
      productService: 'Plateforme agrégation données agricoles',
      customers: 'Agriculteurs institutions agricoles',
      partners: 'Fournisseurs données météo sol satellites',
    },
    contextSummary: 'Plateforme cloud d\'agrégation et analyse de données agricoles. Big data agriculture précision prévisions. IoT data science cloud.',
    problemsNeeds: {
      environmentalChallenges: 'Optimisation ressources agricoles données',
      socialChallenges: 'Aide décision agriculteurs',
      customerNeeds: 'Données agricoles fiables exploitables',
    },
  },
  {
    name: 'CyberGuard',
    description: 'Protection cyber pour PME et startups',
    ownerIndex: 19,
    fundingPhase: 'VALIDATION',
    ideaSketch: {
      ideaInitial: 'Cybersécurité PME startups accessible',
      productService: 'SaaS protection menace audit sécurité',
      customers: 'PME startups entreprises digitales',
      partners: 'Fournisseurs sécurité auditeurs',
    },
    contextSummary: 'Solution SaaS de cybersécurité accessible pour PME et startups. Audit protection menace formation équipes. Sécurité digitale RGPD.',
    problemsNeeds: {
      environmentalChallenges: 'Protection infrastructure numérique',
      socialChallenges: 'Sécurité accessible PME',
      customerNeeds: 'Protection cyber simple efficace abordable',
    },
  },
  {
    name: 'EduFinance',
    description: 'Microfinance éducation et prêts étudiants',
    ownerIndex: 6,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Microfinance éducation prêts étudiants',
      productService: 'Plateforme prêts éducatifs microfinance',
      customers: 'Étudiants familles établissements',
      partners: 'Banques microfinance institutions éducation',
    },
    contextSummary: 'Plateforme de microfinance éducative pour prêts étudiants. Évaluation crédit scoring alternatif. Fintech education inclusion.',
    problemsNeeds: {
      environmentalChallenges: 'Investissement capital humain durable',
      socialChallenges: 'Accès financement éducation',
      customerNeeds: 'Financement études simple accessible',
    },
  },
  {
    name: 'HealthTrack',
    description: 'Suivi médical connecté et prévention',
    ownerIndex: 11,
    fundingPhase: 'IDEATION',
    ideaSketch: {
      ideaInitial: 'Suivi médical connecté prévention',
      productService: 'Montre connectée application santé prédictive',
      customers: 'Patients assureurs entreprises',
      partners: 'Fabricants objets connectés médecins',
    },
    contextSummary: 'Système de suivi médical connecté et prévention. Objets connectés données santé IA prédictive. MedTech santé préventive.',
    problemsNeeds: {
      environmentalChallenges: 'Prévention réduction consommation ressources santé',
      socialChallenges: 'Prévention santé accessible',
      customerNeeds: 'Suivi santé simple prédictif',
    },
  },
];

// ─── 4 COHORTS ──────────────────────────────────────────────────────────────

interface CohortDef {
  name: string;
  program: string;
  description: string;
  status: string;
  capacity: number;
}

const COHORTS: CohortDef[] = [
  {
    name: 'FinTech & Digital Services',
    program: 'Accélération Fintech',
    description: 'Cohorte dédiée aux startups fintech et services financiers digitaux. Paiement mobile gestion financière blockchain.',
    status: 'IN_PROGRESS',
    capacity: 12,
  },
  {
    name: 'AI & Data Innovation',
    program: 'Programme Intelligence Artificielle',
    description: 'Cohorte pour startups travaillant sur l\'IA data science machine learning deep learning.',
    status: 'OPEN',
    capacity: 10,
  },
  {
    name: 'GreenTech & Sustainability',
    program: 'Accélération Verte',
    description: 'Cohorte dédiée aux solutions technologiques durables énergie renouvelable économie circulaire.',
    status: 'OPEN',
    capacity: 10,
  },
  {
    name: 'Digital Entrepreneurship',
    program: 'Programme entrepreneuriat digital',
    description: 'Cohorte généraliste pour startups digitales de tous secteurs. Accompagnement business complet.',
    status: 'DRAFT',
    capacity: 15,
  },
];

// ─── COHORT PROJECT MAPPINGS ────────────────────────────────────────────────

// cohort index → project indices (0-based in PROJECTS array)
const COHORT_PROJECTS: Record<number, number[]> = {
  0: [0, 1, 2, 3, 32, 33], // FinTech cohort
  1: [4, 5, 6, 7, 21, 37], // AI & Data cohort
  2: [8, 9, 10, 11, 15, 16, 17, 34], // GreenTech cohort
  3: [18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 35, 36, 38, 39], // Digital Entrepreneurship
};

// ─── COHORT EXPERT MAPPINGS ─────────────────────────────────────────────────

// cohort index → expert indices (0-based in EXPERTS array)
const COHORT_EXPERTS: Record<number, { expertIndex: number; role: string }[]> = {
  0: [ // FinTech cohort
    { expertIndex: 0, role: 'COACH' },
    { expertIndex: 1, role: 'COACH' },
    { expertIndex: 7, role: 'JURY' },
  ],
  1: [ // AI & Data cohort
    { expertIndex: 2, role: 'COACH' },
    { expertIndex: 17, role: 'COACH' },
    { expertIndex: 5, role: 'JURY' },
  ],
  2: [ // GreenTech cohort
    { expertIndex: 8, role: 'COACH' },
    { expertIndex: 19, role: 'COACH' },
    { expertIndex: 13, role: 'JURY' },
  ],
  3: [ // Digital Entrepreneurship
    { expertIndex: 16, role: 'COACH' },
    { expertIndex: 7, role: 'COACH' },
    { expertIndex: 11, role: 'JURY' },
  ],
};

// ─── EVALUATIONS ─────────────────────────────────────────────────────────────

interface EvaluationDef {
  projectIndex: number;
  expertIndex: number;
  score: number;
  comment: string;
  recommendation: string;
  status: string;
}

const EVALUATIONS: EvaluationDef[] = [
  // Strong evaluations
  { projectIndex: 0, expertIndex: 0, score: 4.5, comment: 'Excellent alignement technique et sectoriel.', recommendation: 'Forte recommandation pour financement.', status: 'SUBMITTED' },
  { projectIndex: 4, expertIndex: 10, score: 4.2, comment: 'Projet edtech prometteur avec vision claire.', recommendation: 'Recommandé pour accélération.', status: 'SUBMITTED' },
  { projectIndex: 8, expertIndex: 19, score: 4.0, comment: 'Bonne approche IoT agricole durable.', recommendation: 'Recommandé avec accompagnement technique.', status: 'SUBMITTED' },
  { projectIndex: 15, expertIndex: 8, score: 4.8, comment: 'Excellente solution solaire innovante.', recommendation: 'Fortement recommandé.', status: 'SUBMITTED' },
  // Average evaluations
  { projectIndex: 1, expertIndex: 1, score: 3.2, comment: 'Concept intéressant mais manque de détails techniques.', recommendation: 'Recommandé avec conditions.', status: 'SUBMITTED' },
  { projectIndex: 5, expertIndex: 10, score: 3.0, comment: 'Bonne idée mais concurrence forte.', recommendation: 'Recommandé après amélioration proposition.', status: 'SUBMITTED' },
  { projectIndex: 18, expertIndex: 7, score: 3.5, comment: 'SaaS solide mais marché competitif.', recommendation: 'Recommandé avec stratégie différenciation.', status: 'SUBMITTED' },
  { projectIndex: 22, expertIndex: 0, score: 3.8, comment: 'Cybersécurité pertinentes besoins réels.', recommendation: 'Recommandé avec validation marché.', status: 'SUBMITTED' },
  // Weak evaluations
  { projectIndex: 27, expertIndex: 7, score: 2.0, comment: 'Projet trop peu défini pour évaluation.', recommendation: 'Non recommandé dans l\'état actuel.', status: 'SUBMITTED' },
  { projectIndex: 29, expertIndex: 8, score: 2.5, comment: 'Domaine chimie verte hors de notre expertise.', recommendation: 'Réorientation suggérée.', status: 'SUBMITTED' },
  { projectIndex: 31, expertIndex: 16, score: 2.2, comment: 'Projet mobility sans vision claire.', recommendation: 'Non recommandé.', status: 'SUBMITTED' },
  // Draft evaluations
  { projectIndex: 10, expertIndex: 2, score: 3.5, comment: 'Bonne approche télémédecine.', recommendation: 'À compléter.', status: 'DRAFT' },
  { projectIndex: 21, expertIndex: 2, score: 3.0, comment: 'Recommandation IA pertinente.', recommendation: 'À finaliser.', status: 'DRAFT' },
];

// ─── COACHING SESSIONS ──────────────────────────────────────────────────────

interface CoachingSessionDef {
  projectIndex: number;
  expertIndex: number;
  title: string;
  objective: string;
  sessionType: string;
  status: string;
  summary?: string;
  findings?: string;
  objectiveResult?: string;
  recommendations: { title: string; content: string; priority: string }[];
}

const COACHING_SESSIONS: CoachingSessionDef[] = [
  {
    projectIndex: 0, expertIndex: 0,
    title: 'Session kick-off FinPay TN',
    objective: 'Valider l\'architecture technique et la stratégie de sécurité',
    sessionType: 'initial_assessment',
    status: 'COMPLETED',
    summary: 'Architecture validée. Besoin renforcé sur cybersécurité paiement.',
    findings: 'Fort besoin en conformité PCI-DSS et sécurité transactions.',
    objectiveResult: 'ACHIEVED',
    recommendations: [
      { title: 'Audit sécurité initial', content: 'Réaliser un audit de sécurité avant lancement.', priority: 'HIGH' },
      { title: 'Formation équipe cybersécurité', content: 'Former l\'équipe aux bonnes pratiques sécurité.', priority: 'MEDIUM' },
    ],
  },
  {
    projectIndex: 4, expertIndex: 10,
    title: 'Session stratégie EduAdapt',
    objective: 'Définir la stratégie produit et UX/UI',
    sessionType: 'strategy',
    status: 'COMPLETED',
    summary: 'Stratégie produit définie. Focus UX étudiant.',
    findings: 'Le système adaptatif nécessite data science approfondie.',
    objectiveResult: 'PARTIALLY_ACHIEVED',
    recommendations: [
      { title: 'Prototype MVP rapide', content: 'Créer un prototype testable en 4 semaines.', priority: 'HIGH' },
    ],
  },
  {
    projectIndex: 8, expertIndex: 19,
    title: 'Session technique SmartFarm',
    objective: 'Valider architecture IoT et choix technologiques',
    sessionType: 'technical_review',
    status: 'COMPLETED',
    summary: 'Architecture IoT validée avec capteurs LoRaWAN.',
    findings: 'Coûts capteurs à optimiser. Connectivité zones rurales défi.',
    objectiveResult: 'ACHIEVED',
    recommendations: [
      { title: 'Pilote champ réduit', content: 'Lancer pilote sur 5 hectares avant généralisation.', priority: 'HIGH' },
      { title: 'Partenariat fournisseur capteurs', content: 'Négocier tarif préférentiel capteurs.', priority: 'MEDIUM' },
    ],
  },
  {
    projectIndex: 15, expertIndex: 8,
    title: 'Session impact GreenPower',
    objective: 'Mesurer impact environnemental et stratégie RSE',
    sessionType: 'impact_assessment',
    status: 'COMPLETED',
    summary: 'Impact environnemental positif confirmé.',
    findings: 'Potentiel réduction CO2 significatif pour clients entreprises.',
    objectiveResult: 'ACHIEVED',
    recommendations: [
      { title: 'Certification environnementale', content: 'Obtenir certifications environnementales produits.', priority: 'MEDIUM' },
    ],
  },
  {
    projectIndex: 18, expertIndex: 7,
    title: 'Session scaling TaskFlow',
    objective: 'Stratégie de scaling et levée de fonds',
    sessionType: 'business_strategy',
    status: 'IN_PROGRESS',
    summary: undefined,
    findings: undefined,
    recommendations: [],
  },
  {
    projectIndex: 22, expertIndex: 0,
    title: 'Session cybersécurité SecureBank',
    objective: 'Revue architecture sécurité et conformité',
    sessionType: 'security_review',
    status: 'SCHEDULED',
    summary: undefined,
    findings: undefined,
    recommendations: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function seedMatchingTestData(): Promise<void> {
  console.log('\n🧪 Matching Test Data Seed');
  console.log('===========================\n');

  // Check if matching test data already exists
  const existingOwners = await prisma.user.count({
    where: { email: { contains: '@test.com' } },
  });
  if (existingOwners > 0) {
    console.log('  ⏩ Matching test data already exists. Skipping.');
    return;
  }

  // ── Step 1: Create Users ──────────────────────────────────────────────────
  console.log('📦 Step 1/7: Creating users...');

  // PROJECT OWNERS
  const ownerUserIds: string[] = [];
  const ownerProfileIds: string[] = [];
  for (const owner of PROJECT_OWNERS) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: owner.firstName,
        last_name: owner.lastName,
        bio: owner.bio,
        country: owner.country,
        city: owner.city,
        preferred_language: 'FR',
      },
    });
    ownerProfileIds.push(profile.id);

    const user = await prisma.user.create({
      data: {
        email: owner.email,
        password_hash: PASSWORD_HASH,
        role: 'PROJECT_OWNER',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    ownerUserIds.push(user.id);

    // Create project owner profile
    const poProfile = await prisma.projectOwnerProfile.create({
      data: {
        user_id: user.id,
        current_status: owner.status,
        education_level: owner.education,
        field_of_study: owner.fieldOfStudy,
        occupation: owner.occupation,
        entrepreneurial_experience_level: owner.expLevel,
        has_previous_startup: owner.hasPrevStartup,
      },
    });

    // Create skills
    for (const skill of owner.skills) {
      await prisma.projectOwnerSkill.create({
        data: {
          skill_name: skill.name,
          level: skill.level,
          project_owner_profile_id: poProfile.id,
        },
      });
    }

    // Create experiences
    for (const exp of owner.experiences) {
      await prisma.projectOwnerExperience.create({
        data: {
          title: exp.title,
          organization: exp.org,
          description: exp.desc,
          start_date: new Date(exp.start),
          end_date: exp.end ? new Date(exp.end) : undefined,
          project_owner_profile_id: poProfile.id,
        },
      });
    }
  }
  console.log(`  ✅ ${ownerUserIds.length} project owners created`);

  // EXPERTS
  const expertUserIds: string[] = [];
  const expertProfileIds: string[] = [];
  const expertiseAreaMap = new Map<string, string>(); // name → id

  // Load existing expertise areas
  const existingAreas = await prisma.expertiseArea.findMany();
  for (const area of existingAreas) {
    expertiseAreaMap.set(area.name, area.id);
  }

  for (const expert of EXPERTS) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: expert.firstName,
        last_name: expert.lastName,
        bio: expert.bio,
        preferred_language: 'FR',
      },
    });

    const user = await prisma.user.create({
      data: {
        email: expert.email,
        password_hash: PASSWORD_HASH,
        role: 'EXPERT',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    expertUserIds.push(user.id);

    const expProfile = await prisma.expertProfile.create({
      data: {
        user_id: user.id,
        headline: expert.headline,
        bio: expert.bio,
        organization: expert.organization,
        position: expert.position,
        years_of_experience: expert.yearsOfExperience,
        availability_status: expert.availability,
      },
    });
    expertProfileIds.push(expProfile.id);

    // Connect expertise areas
    for (const ea of expert.expertiseAreas) {
      const areaId = expertiseAreaMap.get(ea.name);
      if (areaId) {
        await prisma.expertProfileExpertiseArea.create({
          data: {
            expert_profile_id: expProfile.id,
            expertise_area_id: areaId,
            level: ea.level,
            years_of_experience: ea.years,
          },
        });
      }
    }
  }
  console.log(`  ✅ ${expertUserIds.length} experts created`);

  // INCUBATOR MEMBERS
  const memberUserIds: string[] = [];
  for (const member of INCUBATOR_MEMBERS) {
    const profile = await prisma.userProfile.create({
      data: {
        first_name: member.firstName,
        last_name: member.lastName,
        bio: member.bio,
        country: member.country,
        city: member.city,
        preferred_language: 'FR',
      },
    });

    const user = await prisma.user.create({
      data: {
        email: member.email,
        password_hash: PASSWORD_HASH,
        role: 'INCUBATOR_MEMBER',
        is_verified: true,
        is_active: true,
        profile_id: profile.id,
      },
    });
    memberUserIds.push(user.id);
  }
  console.log(`  ✅ ${memberUserIds.length} incubator members created`);

  // ── Step 2: Create Incubator ─────────────────────────────────────────────
  console.log('\n📦 Step 2/7: Creating incubator and memberships...');

  const incubator = await prisma.incubator.create({
    data: {
      name: 'Test Incubator',
      slug: 'test-incubator',
      description: 'Incubateur de test pour validation matching',
      email: 'test@incubator.com',
      country: 'Tunisia',
      city: 'Tunis',
      verification_status: 'APPROVED',
      status: 'ACTIVE',
      created_by_user_id: memberUserIds[0],
    },
  });

  for (let i = 0; i < memberUserIds.length; i++) {
    const roles = ['ADMIN', 'PROGRAM_MANAGER', 'COHORT_MANAGER', 'REVIEW_MANAGER', 'MEMBER', 'MEMBER', 'MEMBER', 'MEMBER', 'MEMBER', 'MEMBER'];
    await prisma.incubatorMember.create({
      data: {
        user_id: memberUserIds[i],
        incubator_id: incubator.id,
        role: roles[i] as any,
        status: 'ACTIVE',
        can_manage_cohorts: i < 4,
        can_manage_programs: i < 2,
        is_primary_contact: i === 0,
      },
    });
  }
  console.log(`  ✅ Incubator + ${memberUserIds.length} memberships created`);

  // ── Step 3: Create Projects ──────────────────────────────────────────────
  console.log('\n📦 Step 3/7: Creating projects with GBM data...');

  const projectIds: string[] = [];
  for (const proj of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        description: proj.description,
        owner_id: ownerUserIds[proj.ownerIndex],
      },
    });
    projectIds.push(project.id);

    // Create IdeaSketch
    if (proj.ideaSketch.ideaInitial || proj.ideaSketch.productService || proj.ideaSketch.customers || proj.ideaSketch.partners) {
      await prisma.ideaSketch.create({
        data: {
          project_id: project.id,
          idea_initial: proj.ideaSketch.ideaInitial || undefined,
          product_service: proj.ideaSketch.productService || undefined,
          customers: proj.ideaSketch.customers || undefined,
          partners: proj.ideaSketch.partners || undefined,
        },
      });
    }

    // Create ContextSummary
    if (proj.contextSummary) {
      await prisma.contextSummary.create({
        data: {
          project_id: project.id,
          summary_text: proj.contextSummary,
          generated_by_ai: false,
        },
      });
    }

    // Create ProblemsNeeds
    if (proj.problemsNeeds.environmentalChallenges || proj.problemsNeeds.socialChallenges || proj.problemsNeeds.customerNeeds) {
      await prisma.problemsNeeds.create({
        data: {
          project_id: project.id,
          environmental_challenges: proj.problemsNeeds.environmentalChallenges || undefined,
          social_challenges: proj.problemsNeeds.socialChallenges || undefined,
          customer_needs: proj.problemsNeeds.customerNeeds || undefined,
        },
      });
    }

    // Create FundingAssessment
    await prisma.fundingAssessment.create({
      data: {
        project_id: project.id,
        score_maturite: proj.fundingPhase === 'IDEATION' ? 1 : proj.fundingPhase === 'VALIDATION' ? 3 : proj.fundingPhase === 'EARLY_STAGE' ? 5 : proj.fundingPhase === 'GROWTH' ? 7 : 9,
        phase_maturite: proj.fundingPhase as any,
        reponses_questionnaire: {},
      },
    });
  }
  console.log(`  ✅ ${projectIds.length} projects created with GBM data`);

  // ── Step 4: Create Cohorts ───────────────────────────────────────────────
  console.log('\n📦 Step 4/7: Creating cohorts and memberships...');

  const cohortIds: string[] = [];
  for (const cohortDef of COHORTS) {
    const cohort = await prisma.cohort.create({
      data: {
        name: cohortDef.name,
        program: cohortDef.program,
        description: cohortDef.description,
        status: cohortDef.status as any,
        capacity: cohortDef.capacity,
        incubator_id: incubator.id,
      },
    });
    cohortIds.push(cohort.id);

    // Add projects to cohort
    const projectIndices = COHORT_PROJECTS[cohortIds.length - 1] || [];
    let participantCount = 0;
    for (const pIdx of projectIndices) {
      if (pIdx < projectIds.length) {
        try {
          await prisma.cohortParticipation.create({
            data: {
              cohort_id: cohort.id,
              project_id: projectIds[pIdx],
              status: 'ACCEPTED',
              origin: 'APPLICATION',
            },
          });
          participantCount++;
        } catch (e) {
          // Skip if duplicate
        }
      }
    }

    // Update participant count
    await prisma.cohort.update({
      where: { id: cohort.id },
      data: { current_participants: participantCount },
    });

    // Add experts to cohort
    const expertMappings = COHORT_EXPERTS[cohortIds.length - 1] || [];
    for (const mapping of expertMappings) {
      if (mapping.expertIndex < expertUserIds.length) {
        try {
          await prisma.cohortExpert.create({
            data: {
              cohort_id: cohort.id,
              expert_user_id: expertUserIds[mapping.expertIndex],
              role: mapping.role as any,
              status: 'ACTIVE',
              assigned_by: memberUserIds[0],
            },
          });
        } catch (e) {
          // Skip if duplicate
        }
      }
    }
  }
  console.log(`  ✅ ${cohortIds.length} cohorts created with participations and experts`);

  // ── Step 5: Create Evaluations ───────────────────────────────────────────
  console.log('\n📦 Step 5/7: Creating evaluations...');

  for (const evalDef of EVALUATIONS) {
    if (evalDef.projectIndex < projectIds.length && evalDef.expertIndex < expertUserIds.length) {
      try {
        await prisma.evaluation.create({
          data: {
            project_id: projectIds[evalDef.projectIndex],
            jury_user_id: expertUserIds[evalDef.expertIndex],
            score: evalDef.score,
            comment: evalDef.comment,
            recommendation: evalDef.recommendation,
            status: evalDef.status as any,
            submitted_at: evalDef.status === 'SUBMITTED' ? new Date() : undefined,
          },
        });
      } catch (e) {
        // Skip if duplicate constraint
      }
    }
  }
  console.log(`  ✅ ${EVALUATIONS.length} evaluations created`);

  // ── Step 6: Create Coaching Sessions ─────────────────────────────────────
  console.log('\n📦 Step 6/7: Creating coaching sessions and recommendations...');

  for (const sessionDef of COACHING_SESSIONS) {
    if (sessionDef.projectIndex < projectIds.length && sessionDef.expertIndex < expertUserIds.length) {
      // Create assignment
      const assignment = await prisma.projectExpertAssignment.create({
        data: {
          project_id: projectIds[sessionDef.projectIndex],
          expert_user_id: expertUserIds[sessionDef.expertIndex],
          role: 'COACH',
          status: 'ACTIVE',
          assigned_by: memberUserIds[0],
        },
      });

      // Create session
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - 30);

      const session = await prisma.coachingSession.create({
        data: {
          assignment_id: assignment.id,
          title: sessionDef.title,
          objective: sessionDef.objective,
          session_type: sessionDef.sessionType,
          scheduled_at: scheduledDate,
          duration_minutes: 60,
          status: sessionDef.status as any,
          summary: sessionDef.summary,
          findings: sessionDef.findings,
          objective_result: sessionDef.objectiveResult as any,
          created_by: expertUserIds[sessionDef.expertIndex],
          started_at: sessionDef.status !== 'SCHEDULED' ? scheduledDate : undefined,
          completed_at: sessionDef.status === 'COMPLETED' ? new Date() : undefined,
        },
      });

      // Create recommendations
      for (const rec of sessionDef.recommendations) {
        await prisma.coachingRecommendation.create({
          data: {
            session_id: session.id,
            project_id: projectIds[sessionDef.projectIndex],
            author_id: expertUserIds[sessionDef.expertIndex],
            title: rec.title,
            content: rec.content,
            priority: rec.priority as any,
            status: 'OPEN',
            source: 'COACH',
          },
        });
      }
    }
  }
  console.log(`  ✅ ${COACHING_SESSIONS.length} coaching sessions created`);

  // ── Step 7: Verification ─────────────────────────────────────────────────
  console.log('\n📦 Step 7/7: Verifying data...');

  const counts = {
    users: await prisma.user.count({ where: { email: { contains: '@test.com' } } }),
    expertProfiles: await prisma.expertProfile.count(),
    projects: await prisma.project.count(),
    cohorts: await prisma.cohort.count(),
    participations: await prisma.cohortParticipation.count(),
    cohortExperts: await prisma.cohortExpert.count(),
    evaluations: await prisma.evaluation.count(),
    coachingSessions: await prisma.coachingSession.count(),
    recommendations: await prisma.coachingRecommendation.count(),
    assignments: await prisma.projectExpertAssignment.count(),
    ideaSketches: await prisma.ideaSketch.count(),
    contextSummaries: await prisma.contextSummary.count(),
    problemsNeeds: await prisma.problemsNeeds.count(),
    fundingAssessments: await prisma.fundingAssessment.count(),
  };

  console.log('\n📊 Data Summary:');
  console.log(`  Users: ${counts.users}`);
  console.log(`  Expert Profiles: ${counts.expertProfiles}`);
  console.log(`  Projects: ${counts.projects}`);
  console.log(`  Cohorts: ${counts.cohorts}`);
  console.log(`  Cohort Participations: ${counts.participations}`);
  console.log(`  Cohort Experts: ${counts.cohortExperts}`);
  console.log(`  Evaluations: ${counts.evaluations}`);
  console.log(`  Coaching Sessions: ${counts.coachingSessions}`);
  console.log(`  Recommendations: ${counts.recommendations}`);
  console.log(`  Assignments: ${counts.assignments}`);
  console.log(`  Idea Sketches: ${counts.ideaSketches}`);
  console.log(`  Context Summaries: ${counts.contextSummaries}`);
  console.log(`  Problems/Needs: ${counts.problemsNeeds}`);
  console.log(`  Funding Assessments: ${counts.fundingAssessments}`);

  console.log('\n========================================');
  console.log('✅ Matching test data seed completed!\n');
}

// Run if executed directly
if (require.main === module) {
  seedMatchingTestData()
    .catch((e) => {
      console.error('❌ Matching test data seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
