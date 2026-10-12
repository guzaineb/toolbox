import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaClient, StepStatus } from '@prisma/client';
import { ALL_STEPS } from '../../src/gbm/step-registry';
import { computeWeightedScore } from '../../src/evaluations/score.util';
import { resolveAppLink } from '../../src/notifications/notification-link.util';
import {
  DEMO_COHORTS,
  DEMO_CRITERIA,
  DEMO_INCUBATORS,
  DEMO_PROJECTS,
  DEMO_USERS,
  DemoProjectSpec,
  DemoStepStatus,
  GbmTheme,
} from './demo-content';

const PASSWORD = 'password123';
const T = (iso: string) => new Date(iso);

function did(kind: string, key: string): string {
  const h = createHash('sha256')
    .update(`projectstruct:demo:${kind}:${key}`)
    .digest('hex');
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    `4${h.slice(13, 16)}`,
    `8${h.slice(17, 20)}`,
    h.slice(20, 32),
  ].join('-');
}

const userId = (key: string) => did('user', key);
const projectId = (key: string) => did('project', key);
const cohortId = (key: string) => did('cohort', key);
const incubatorId = (key: string) => did('incubator', key);
const templateId = (cohortKey: string) => did('template', cohortKey);
const criterionId = (cohortKey: string, index: number) =>
  did('criterion', `${cohortKey}:${index}`);

function demoNotificationLink(
  link?: string,
  resourceKey?: string,
): string | null {
  if (!link) return null;

  let value = link;

  value = value.replace(
    /^\/project-owner\/projects\/([^/]+)/,
    (_match, key: string) =>
      `/project-owner/projects/${
        DEMO_PROJECTS.some((p) => p.key === key) ? projectId(key) : key
      }`,
  );

  const resourceCohort = DEMO_COHORTS.find((c) => c.key === resourceKey);
  const resourceIncubator = DEMO_INCUBATORS.find((i) => i.key === resourceKey);
  const incubatorKey = resourceCohort
    ? resourceCohort.incubatorKey
    : resourceIncubator
      ? resourceIncubator.key
      : 'atlas';

  if (
    value === '/incubator/cohorts' ||
    value === '/incubator/settings' ||
    value === '/incubator/members'
  ) {
    value = `/incubator/${incubatorId(incubatorKey)}${value.slice('/incubator'.length)}`;
  }

  return resolveAppLink(value) ?? null;
}

type AnyModel = {
  upsert: (args: any) => Promise<any>;
  deleteMany?: (args: any) => Promise<any>;
  createMany?: (args: any) => Promise<any>;
};

async function upsertOne(
  model: AnyModel,
  projectIdValue: string,
  data: Record<string, unknown>,
) {
  await model.upsert({
    where: { project_id: projectIdValue },
    create: { project_id: projectIdValue, ...data },
    update: data,
  });
}

async function replaceMany(
  model: AnyModel,
  projectIdValue: string,
  rows: Record<string, unknown>[],
) {
  await model.deleteMany!({ where: { project_id: projectIdValue } });
  if (rows.length > 0) {
    await model.createMany!({
      data: rows.map((row) => ({ project_id: projectIdValue, ...row })),
    });
  }
}

const COACH_ASSIGNMENTS: { project: string; coaches: string[] }[] = [
  { project: 'biocare', coaches: ['coach.business', 'coach.green'] },
  { project: 'agrismart', coaches: ['coach.business', 'coach.finance'] },
  { project: 'ecopack', coaches: ['coach.green', 'coach.marketing'] },
  { project: 'medconnect', coaches: ['coach.business'] },
  { project: 'foodwaste', coaches: ['coach.marketing'] },
];

interface SessionSpec {
  key: string;
  project: string;
  coach: string;
  title: string;
  objective: string;
  sessionType: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED' | 'RESCHEDULED';
  agenda?: string;
  notes?: string;
  findings?: string;
  topics?: string;
  decisions?: string;
  report?: string;
  summary?: string;
  nextObjectives?: string;
  objectiveResult?: 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED';
  objectiveReason?: string;
  startedAt?: string;
  completedAt?: string;
}

const SESSIONS: SessionSpec[] = [
  {
    key: 'biocare-1',
    project: 'biocare',
    coach: 'coach.business',
    title: 'Cadrage du pilote coopérative',
    objective: "Valider le périmètre du pilote et le plan de déploiement sur 12 parcelles.",
    sessionType: 'Cadrage',
    scheduledAt: '2026-09-15T09:00:00.000Z',
    duration: 90,
    status: 'COMPLETED',
    agenda: 'Périmètre du pilote, indicateurs de réussite, répartition des rôles, calendrier de la campagne blé.',
    notes: 'Le bureau de la coopérative est disponible pour la formation des adhérents.',
    findings: 'Les adhérents confondent encore fertilité et humidité : le support pédagogique doit distinguer clairement les deux mesures.',
    topics: 'Définition des indicateurs, calendrier de déploiement, budget de formation.',
    decisions: 'Retenir 12 parcelles témoins, une formation en présentiel par groupe et un point hebdomadaire.',
    report: "Session de cadrage concluante. Le périmètre du pilote est arrêté à 12 parcelles réparties sur trois coopératives. Le plan de déploiement est jugé réaliste et le budget de formation est validé par le bureau.",
    summary: "Périmètre validé et calendrier fixé pour la campagne blé.",
    nextObjectives: 'Installer les capteurs avant le 30 septembre et former les référents.',
    objectiveResult: 'ACHIEVED',
    objectiveReason: 'Tous les livrables de cadrage ont été produits et validés par le bureau de la coopérative.',
    startedAt: '2026-09-15T09:02:00.000Z',
    completedAt: '2026-09-15T10:35:00.000Z',
  },
  {
    key: 'biocare-2',
    project: 'biocare',
    coach: 'coach.business',
    title: 'Revue du modèle d’abonnement',
    objective: 'Sécuriser le prix par hectare et le seuil de rentabilité.',
    sessionType: 'Suivi',
    scheduledAt: '2026-10-01T14:00:00.000Z',
    duration: 60,
    status: 'COMPLETED',
    agenda: 'Analyse du coût par hectare, test de sensibilité du prix, effet de la remise volume.',
    notes: 'Le coût logistique est 18 % supérieur à l’hypothèse initiale sur les zones reculées.',
    findings: 'À 48 TND/ha la marge est de 61 % mais elle tombe à 44 % au-delà de 40 km de l’atelier.',
    topics: 'Structure de prix, politique de remise, renouvellement.',
    decisions: 'Maintenir 48 TND/ha et introduire une indemnité kilométrique au-delà de 40 km.',
    report: 'Le modèle d’abonnement tient. La sensibilité au coût logistique est le principal risque identifié. Une politique de remise progressive est préparée pour la rentrée.',
    summary: 'Prix maintenu, logistique réajustée.',
    nextObjectives: 'Préparer le dossier de subvention du programme national.',
    objectiveResult: 'PARTIALLY_ACHIEVED',
    objectiveReason: 'Le prix est arbitré mais le dossier de subvention reste à finaliser.',
    startedAt: '2026-10-01T14:00:00.000Z',
    completedAt: '2026-10-01T15:10:00.000Z',
  },
  {
    key: 'biocare-3',
    project: 'biocare',
    coach: 'coach.green',
    title: 'Revue de l’empreinte du capteur v2',
    objective: "Valider les gains d'éco-conception du capteur v2.",
    sessionType: 'Expertise',
    scheduledAt: '2026-10-20T10:00:00.000Z',
    duration: 60,
    status: 'SCHEDULED',
    agenda: 'Bilan du passage en ABS recyclé, bilan carbone du capteur, stratégie de reprise en fin de vie.',
  },
  {
    key: 'biocare-4',
    project: 'biocare',
    coach: 'coach.green',
    title: 'Atelier impact et indicateurs',
    objective: 'Ancrer les indicateurs d’impact dans le reporting mensuel.',
    sessionType: 'Expertise',
    scheduledAt: '2026-09-24T11:00:00.000Z',
    duration: 75,
    status: 'COMPLETED',
    agenda: 'Choix des indicateurs d’impact, sources de donnée, fréquence de revue.',
    findings: 'Les indicateurs sociaux ne sont pas encore instrumentés : l’enquête semestrielle doit être formalisée.',
    decisions: 'Générer automatiquement le rapport d’impact à partir de la plateforme.',
    report: "Les indicateurs environnementaux sont instrumentés nativement. Les indicateurs sociaux nécessitent une enquête semestrielle formalisée, dont le questionnaire est rédigé.",
    summary: 'Tableau de bord impact arrêté.',
    nextObjectives: 'Déployer l’enquête semestrielle auprès des 12 coopératives.',
    objectiveResult: 'ACHIEVED',
    objectiveReason: "Les indicateurs environnementaux sont instrumentés et la méthode d'enquête est rédigée.",
    startedAt: '2026-09-24T11:00:00.000Z',
    completedAt: '2026-09-24T12:20:00.000Z',
  },
  {
    key: 'agrismart-1',
    project: 'agrismart',
    coach: 'coach.business',
    title: 'Sécurisation de l’approvisionnement en résidus',
    objective: "Contractualiser 8 000 tonnes de résidus par an.",
    sessionType: 'Cadrage',
    scheduledAt: '2026-09-08T09:00:00.000Z',
    duration: 90,
    status: 'COMPLETED',
    agenda: 'Inventaire des gisements, négociation avec les unités de transformation, calendrier de collecte.',
    findings: 'Les trois conventions signées couvrent 5 400 tonnes sur les 8 000 visées.',
    decisions: 'Ouvrir la négociation avec deux unités supplémentaires avant décembre.',
    report: "L'approvisionnement est partiellement sécurisé. Deux unités supplémentaires doivent être signées pour atteindre les 8 000 tonnes, sans quoi le seuil de rentabilité sera décalé d'une saison.",
    summary: '5 400 tonnes sécurisées sur 8 000.',
    nextObjectives: 'Signer deux conventions complémentaires.',
    objectiveResult: 'PARTIALLY_ACHIEVED',
    objectiveReason: '5 400 tonnes engagées sur les 8 000 tonnes visées.',
    startedAt: '2026-09-08T09:00:00.000Z',
    completedAt: '2026-09-08T10:40:00.000Z',
  },
  {
    key: 'agrismart-2',
    project: 'agrismart',
    coach: 'coach.finance',
    title: 'Structure de coûts et seuil de rentabilité',
    objective: "Valider le seuil de rentabilité à 5 200 tonnes.",
    sessionType: 'Suivi',
    scheduledAt: '2026-10-14T15:00:00.000Z',
    duration: 60,
    status: 'IN_PROGRESS',
    agenda: 'Revue du coût par tonne, hypothèses de prix, besoin en fonds de roulement saisonnier.',
  },
  {
    key: 'ecopack-1',
    project: 'ecopack',
    coach: 'coach.green',
    title: 'Revue de formulation du matériau',
    objective: "Atteindre une tenue de 24 heures en chambre froide.",
    sessionType: 'Expertise',
    scheduledAt: '2026-09-18T13:00:00.000Z',
    duration: 60,
    status: 'COMPLETED',
    agenda: 'Épaisseur, barrière à l’humidité, additifs autorisés.',
    findings: 'L’épaisseur de 0,4 mm est insuffisante pour les sauces liquides.',
    decisions: "Passer à 0,5 mm pour les coupelles et maintenir 0,4 mm pour les films.",
    report: "La formulation à trois couches atteint l'objectif de 24 heures en épaisseur 0,5 mm. Le conservateur de synthèse doit être remplacé avant toute industrialisation.",
    summary: 'Épaisseur portée à 0,5 mm pour les coupelles.',
    nextObjectives: 'Lancer le test comparatif sur trois cuisines centrales.',
    objectiveResult: 'ACHIEVED',
    objectiveReason: 'La formulation cible est atteinte et documentée.',
    startedAt: '2026-09-18T13:00:00.000Z',
    completedAt: '2026-09-18T14:05:00.000Z',
  },
  {
    key: 'ecopack-2',
    project: 'ecopack',
    coach: 'coach.marketing',
    title: 'Cadrage du marché restauration collective',
    objective: 'Identifier 10 cuisines centrales pilotes.',
    sessionType: 'Cadrage',
    scheduledAt: '2026-09-30T09:00:00.000Z',
    duration: 60,
    status: 'MISSED',
    agenda: 'Cartographie des cuisines centrales, argumentaire de conformité réglementaire.',
  },
  {
    key: 'medconnect-1',
    project: 'medconnect',
    coach: 'coach.business',
    title: 'Parcours de certification du dispositif',
    objective: "Planifier l'obtention du marquage CE classe IIa.",
    sessionType: 'Cadrage',
    scheduledAt: '2026-11-12T10:00:00.000Z',
    duration: 90,
    status: 'SCHEDULED',
    agenda: 'Dossier technique, essais cliniques, hébergement HDS, calendrier réglementaire.',
  },
  {
    key: 'foodwaste-1',
    project: 'foodwaste',
    coach: 'coach.marketing',
    title: 'Atelier proposition de valeur',
    objective: "Clarifier l'offre adressée aux grossistes.",
    sessionType: 'Cadrage',
    scheduledAt: '2026-09-11T14:00:00.000Z',
    duration: 60,
    status: 'CANCELLED',
    agenda: 'Segmentation des grossistes, preuve de don, modèle de revenus.',
  },
];

interface ActionSpec {
  key: string;
  project: string;
  session?: string;
  coach: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'OVERDUE' | 'REJECTED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  completedAt?: string;
  relatedDocumentKey?: string;
  evidence?: {
    type: 'LINK' | 'TEXT' | 'DOCUMENT' | 'RESULT';
    title: string;
    content: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string;
  };
}

const ACTIONS: ActionSpec[] = [
  {
    key: 'biocare-a1',
    project: 'biocare',
    session: 'biocare-1',
    coach: 'coach.business',
    title: 'Finaliser le plan de déploiement des 12 parcelles pilotes',
    description: 'Planifier l’installation, la formation des référents et le calendrier de relevé hebdomadaire.',
    status: 'COMPLETED',
    priority: 'HIGH',
    deadline: '2026-09-30',
    completedAt: '2026-09-28',
    evidence: {
      type: 'DOCUMENT',
      title: 'Plan de déploiement signé',
      content:
        'Plan de déploiement validé le 28/09/2026 : installation sur 12 parcelles, 3 sessions de formation, relevés hebdomadaires jusqu’à fin de campagne.',
      reviewStatus: 'APPROVED',
      comment: 'Document complet et cohérent avec le calendrier de la campagne blé.',
    },
  },
  {
    key: 'biocare-a2',
    project: 'biocare',
    session: 'biocare-2',
    coach: 'coach.business',
    title: 'Constituer le dossier du programme national d’irrigation intelligente',
    description: "Rassembler les pièces administratives, le prévisionnel et le rapport d'impact pour le dépôt.",
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: '2026-10-31',
    relatedDocumentKey: 'funding_dossier',
    evidence: {
      type: 'TEXT',
      title: 'Liste des pièces réunies',
      content: 'Registre de commerce, états financiers 2024-2025, rapport d’impact pilote et convention INRAT sont réunis.',
      reviewStatus: 'PENDING',
    },
  },
  {
    key: 'biocare-a3',
    project: 'biocare',
    session: 'biocare-4',
    coach: 'coach.green',
    title: 'Formaliser l’enquête semestrielle d’impact social',
    description: 'Rédiger le questionnaire, la méthodologie de terrain et le plan d’analyse.',
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    deadline: '2026-10-15',
    evidence: {
      type: 'DOCUMENT',
      title: 'Questionnaire d’enquête semestrielle',
      content:
        'Questionnaire de 24 questions couvrant les pratiques d’irrigation, la perception du rendement et la part des femmes bénéficiaires.',
      reviewStatus: 'PENDING',
    },
  },
  {
    key: 'biocare-a4',
    project: 'biocare',
    coach: 'coach.business',
    title: 'Préparer la participation au salon SIAG',
    description: "Réserver l'espace, produire le support de démonstration et planifier les rendez-vous.",
    status: 'PENDING',
    priority: 'LOW',
    deadline: '2026-11-20',
  },
  {
    key: 'biocare-a5',
    project: 'biocare',
    session: 'biocare-2',
    coach: 'coach.business',
    title: 'Mettre à jour le prévisionnel financier sur 24 mois',
    description: 'Intégrer l’effet de l’indemnité kilométrique et la remise volume dans le modèle.',
    status: 'OVERDUE',
    priority: 'HIGH',
    deadline: '2026-10-03',
    relatedDocumentKey: 'financial_plan',
  },
  {
    key: 'agrismart-a1',
    project: 'agrismart',
    session: 'agrismart-1',
    coach: 'coach.business',
    title: 'Signer deux conventions d’approvisionnement complémentaires',
    description: "Négocier l'enlèvement des résidus avec deux unités de transformation supplémentaires.",
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: '2026-12-15',
  },
  {
    key: 'agrismart-a2',
    project: 'agrismart',
    session: 'agrismart-1',
    coach: 'coach.business',
    title: 'Obtenir la certification biologique du substrat',
    description: 'Lancer les analyses de conformité et constituer le dossier de certification.',
    status: 'PENDING',
    priority: 'MEDIUM',
    deadline: '2027-01-30',
  },
  {
    key: 'agrismart-a3',
    project: 'agrismart',
    session: 'agrismart-2',
    coach: 'coach.finance',
    title: 'Formaliser le plan de trésorerie saisonnier',
    description: 'Modéliser le besoin en fonds de roulement lié à la campagne de collecte estivale.',
    status: 'PENDING',
    priority: 'HIGH',
    deadline: '2026-11-10',
  },
  {
    key: 'ecopack-a1',
    project: 'ecopack',
    session: 'ecopack-1',
    coach: 'coach.green',
    title: 'Remplacer le conservateur de synthèse',
    description: 'Formuler un conservateur d’origine naturelle sans dégrader la barrière à l’humidité.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: '2026-12-01',
  },
  {
    key: 'ecopack-a2',
    project: 'ecopack',
    coach: 'coach.marketing',
    title: 'Cartographier 10 cuisines centrales pilotes',
    description: 'Identifier les structures, leurs volumes et leurs contacts décisionnels.',
    status: 'OVERDUE',
    priority: 'MEDIUM',
    deadline: '2026-10-01',
  },
  {
    key: 'medconnect-a1',
    project: 'medconnect',
    coach: 'coach.business',
    title: 'Rédiger le plan d’étude clinique',
    description: "Définir le protocole, les critères d'évaluation et le partenariat avec le CHU.",
    status: 'PENDING',
    priority: 'HIGH',
    deadline: '2026-12-15',
  },
  {
    key: 'foodwaste-a1',
    project: 'foodwaste',
    coach: 'coach.marketing',
    title: 'Sécuriser un partenaire logistique pour la chaîne du froid',
    description: "Identifier un transporteur agréé pour les enlèvements réfrigérés.",
    status: 'PENDING',
    priority: 'HIGH',
    deadline: '2026-11-30',
  },
];

interface RecommendationSpec {
  key: string;
  project: string;
  session?: string;
  author: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  source: 'COACH' | 'AI';
  aiAnalysisKey?: string;
}

const RECOMMENDATIONS: RecommendationSpec[] = [
  {
    key: 'biocare-r1',
    project: 'biocare',
    session: 'biocare-2',
    author: 'coach.business',
    title: 'Sécuriser une seconde source logistique avant l’expansion',
    content:
      'Le coût logistique est le principal risque de marge identifié. Deux dépôts relais mutualisés avec les distributeurs d’intrants réduiraient le coût de livraison de 14 % et l’indemnité kilométrique pourrait être supprimée.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    source: 'COACH',
  },
  {
    key: 'biocare-r2',
    project: 'biocare',
    session: 'biocare-4',
    author: 'coach.green',
    title: 'Publier la méthodologie d’impact pour renforcer l’opposabilité',
    content:
      "Rendre public le protocole de mesure d'impact (sources, fréquences, calculs) renforce la confiance des bailleurs et facilite le renouvellement des coopératives.",
    priority: 'MEDIUM',
    status: 'OPEN',
    source: 'COACH',
  },
  {
    key: 'biocare-r3',
    project: 'biocare',
    author: 'coach.green',
    title: 'Prioriser les deux risques de la cartographie SWOT',
    content:
      "Analyse IA validée par le coach : la dépendance au réseau LoRaWAN en zones reculées et la concentration de l'équipe commerciale sur un seul interlocuteur constituent les deux risques les plus probables. Un mode hors-ligne du boîtier et un second chargé de déploiement sont les actions correctives recommandées.",
    priority: 'HIGH',
    status: 'OPEN',
    source: 'AI',
    aiAnalysisKey: 'biocare-risk',
  },
  {
    key: 'agrismart-r1',
    project: 'agrismart',
    session: 'agrismart-1',
    author: 'coach.business',
    title: 'Diversifier les gisements avant la campagne de collecte estivale',
    content:
      "Sécuriser deux unités supplémentaires et ouvrir un lot de paille avec les coopératives céréalières afin de lisser l'approvisionnement sur toute l'année.",
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    source: 'COACH',
  },
  {
    key: 'agrismart-r2',
    project: 'agrismart',
    session: 'agrismart-2',
    author: 'coach.finance',
    title: 'Adosser le besoin en fonds de roulement à une facilité dédiée',
    content:
      'La saisonnalité de la collecte impose un BFR de 300 kTND sur trois mois. Une facilité de trésorerie dédiée évite de mobiliser le financement d’équipement.',
    priority: 'MEDIUM',
    status: 'OPEN',
    source: 'COACH',
  },
  {
    key: 'ecopack-r1',
    project: 'ecopack',
    session: 'ecopack-1',
    author: 'coach.green',
    title: "Ne pas industrialiser avant le remplacement du conservateur",
    content:
      "Tant que le conservateur de synthèse n'est pas remplacé, le positionnement circulaire du produit est fragilisé et les appels d'offres publics sont compromis.",
    priority: 'HIGH',
    status: 'OPEN',
    source: 'COACH',
  },
];

const EVALUATION_SPECS: {
  project: string;
  cohort: string;
  jury: string;
  status: 'DRAFT' | 'SUBMITTED';
  scores: number[];
  submittedAt?: string;
  comment?: string;
  recommendation?: string;
}[] = [
  {
    project: 'biocare',
    cohort: 'green',
    jury: 'jury.strategy',
    status: 'SUBMITTED',
    scores: [4, 4, 4, 3, 4, 4, 3, 4],
    submittedAt: '2026-10-02T09:30:00.000Z',
    comment:
      'Le problème est documenté par des mesures de terrain et la solution est validée sur une campagne complète. Le positionnement est clair face aux offres importées. La complémentarité de l’équipe est convaincante mais la fonction commerciale reste sous-dimensionnée.',
    recommendation: 'Accepter le projet pour une sortie d’accélération en 2027.',
  },
  {
    project: 'biocare',
    cohort: 'green',
    jury: 'jury.finance',
    status: 'SUBMITTED',
    scores: [4, 3, 4, 4, 4, 4, 4, 3],
    submittedAt: '2026-10-02T16:10:00.000Z',
    comment:
      'Le modèle d’abonnement sans investissement initial est une vraie force d’adoption. Les prévisions de trésorerie sont prudentes et le seuil de rentabilité est crédible. La stratégie de financement reste à consolider sur la part de fonds propres.',
    recommendation: 'Valider sous réserve d’un plan de trésorerie mensualisé sur 24 mois.',
  },
  {
    project: 'biocare',
    cohort: 'green',
    jury: 'jury.market',
    status: 'SUBMITTED',
    scores: [3, 4, 3, 4, 5, 4, 3, 4],
    submittedAt: '2026-10-03T11:00:00.000Z',
    comment:
      'Le marché adressable est bien ciblé et l’avantage concurrentiel tient au réseau de terrain. L’impact mesuré est un atout différenciant fort. Le plan marketing repose trop sur le bouche-à-oreille pour une montée en charge.',
    recommendation: 'Accepter et recommander un renforcement des canaux payants.',
  },
  {
    project: 'ecopack',
    cohort: 'green',
    jury: 'jury.strategy',
    status: 'SUBMITTED',
    scores: [2, 2, 2, 2, 3, 3, 2, 2],
    submittedAt: '2026-10-02T14:20:00.000Z',
    comment:
      "Le besoin réglementaire est réel mais la solution n'est pas encore validée en conditions industrielles. Le pivot vers la restauration collective est pertinent. L'équipe est technique et manque d'expérience commerciale.",
    recommendation: 'Demander une réévaluation après validation sur trois cuisines centrales.',
  },
  {
    project: 'ecopack',
    cohort: 'green',
    jury: 'jury.finance',
    status: 'SUBMITTED',
    scores: [2, 2, 3, 2, 2, 3, 2, 2],
    submittedAt: '2026-10-03T15:45:00.000Z',
    comment:
      "Le plan financier reste très jeune : le seuil de rentabilité à 1,8 million d'unités suppose une capacité de production non encore investie. Le besoin en fonds de rounement n'est pas modélisé.",
    recommendation: 'Reprogrammer une évaluation après la levée de la ligne pilote.',
  },
  {
    project: 'ecopack',
    cohort: 'green',
    jury: 'jury.market',
    status: 'DRAFT',
    scores: [3, 3, 3],
    comment: 'Évaluation en cours de saisie.',
  },
  {
    project: 'agrismart',
    cohort: 'agritech',
    jury: 'jury.strategy',
    status: 'SUBMITTED',
    scores: [3, 3, 3, 3, 3, 4, 3, 3],
    submittedAt: '2026-10-01T10:00:00.000Z',
    comment:
      "Le gisement de résidus est identifié et le procédé est technologiquement maîtrisé. La qualité à l'échelle reste à démontrer. L'impact environnemental est démontré sur deux cycles.",
    recommendation: 'Accepter avec conditions sur la sécurisation de l’approvisionnement.',
  },
  {
    project: 'agrismart',
    cohort: 'agritech',
    jury: 'jury.finance',
    status: 'SUBMITTED',
    scores: [3, 3, 3, 3, 3, 3, 3, 3],
    submittedAt: '2026-10-01T17:30:00.000Z',
    comment:
      'Le modèle est cohérent et le seuil de rentabilité à 5 200 tonnes est réaliste. Le besoin en fonds de roulement saisonnier reste insuffisamment sécurisé.',
    recommendation: 'Accepter sous réserve d’une ligne de trésorerie dédiée.',
  },
  {
    project: 'foodwaste',
    cohort: 'agritech',
    jury: 'jury.strategy',
    status: 'SUBMITTED',
    scores: [2, 2, 2, 1, 2, 3, 2, 2],
    submittedAt: '2026-10-01T12:00:00.000Z',
    comment:
      'Le besoin social est réel mais le projet reste à l’état d’idée : aucun pilote, aucun partenaire logistique et une équipe incomplète. La proposition de valeur n’est pas encore testée.',
    recommendation: 'Refuser la présente session et encourager une candidature après constitution d’un pilote.',
  },
];

const JURY_SESSION_SPECS: {
  key: string;
  project: string;
  cohort: string;
  title: string;
  status: 'DRAFT' | 'OPEN' | 'DELIBERATION' | 'CLOSED';
  observations?: string;
  closedAt?: string;
  members: string[];
}[] = [
  {
    key: 'biocare',
    project: 'biocare',
    cohort: 'green',
    title: 'Délibération finale — BioCare Tunisia',
    status: 'CLOSED',
    observations:
      'Les trois évaluations convergent sur un dossier solide. Le point de vigilance partagé est la fonction commerciale. La commission valide la sortie d’accélération avec un suivi trimestriel sur la montée en charge.',
    closedAt: '2026-10-05T16:00:00.000Z',
    members: ['jury.strategy', 'jury.finance', 'jury.market'],
  },
  {
    key: 'ecopack',
    project: 'ecopack',
    cohort: 'green',
    title: 'Délibération — EcoPack',
    status: 'DELIBERATION',
    observations:
      "Deux évaluations soumises et une en cours. La commission s'interroge sur la capacité de production : sans ligne pilote, aucun scénario industriel n'est crédible.",
    members: ['jury.strategy', 'jury.finance', 'jury.market'],
  },
  {
    key: 'agrismart',
    project: 'agrismart',
    cohort: 'agritech',
    title: 'Délibération — AgriSmart',
    status: 'OPEN',
    observations:
      "Les évaluations sont reçues. La commission souhaite vérifier l'état des négociations d'approvisionnement avant décision.",
    members: ['jury.strategy', 'jury.finance'],
  },
  {
    key: 'foodwaste',
    project: 'foodwaste',
    cohort: 'agritech',
    title: 'Délibération — FoodWaste',
    status: 'CLOSED',
    observations:
      "Dossier jugé trop en amont pour cette session. La commission encourage une nouvelle candidature après constitution d'un pilote et d'un partenaire logistique.",
    closedAt: '2026-10-02T11:00:00.000Z',
    members: ['jury.strategy', 'jury.finance'],
  },
  {
    key: 'medconnect',
    project: 'medconnect',
    cohort: 'health',
    title: 'Jury — MedConnect',
    status: 'DRAFT',
    members: ['jury.market', 'jury.strategy'],
  },
];

const DECISION_SPECS: {
  project: string;
  cohort: string;
  decision: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL' | 'EXTENDED' | 'REEVALUATION_REQUIRED';
  justification: string;
  newEndDate?: string;
  conditions?: { description: string; deadline: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }[];
}[] = [
  {
    project: 'biocare',
    cohort: 'green',
    decision: 'ACCEPTED',
    justification:
      "Dossier le plus abouti de la cohorte : pilote validé sur 12 coopératives, 22 % d'économie d'eau mesurés, modèle sans investissement initial et plan financier cohérent. Le jury valide la sortie d'accélération avec un suivi trimestriel de la montée en charge.",
  },
  {
    project: 'ecopack',
    cohort: 'green',
    decision: 'REEVALUATION_REQUIRED',
    justification:
      "Le besoin réglementaire est réel et la formulation progresse, mais ni la capacité de production ni le marché n'ont été validés à l'échelle. Une réévaluation est requise après démonstration sur trois cuisines centrales et sécurisation de la ligne pilote.",
  },
  {
    project: 'agrismart',
    cohort: 'agritech',
    decision: 'CONDITIONAL',
    justification:
      "Le projet présente un procédé maîtrisé et un impact environnemental démontré. L'acceptation est subordonnée à la sécurisation de l'approvisionnement et au financement du besoin en fonds de roulement.",
    conditions: [
      {
        description: 'Signer deux conventions d’approvisionnement portant le volume contractuel à 8 000 tonnes par an.',
        deadline: '2026-12-15',
        status: 'IN_PROGRESS',
      },
      {
        description: 'Obtenir une ligne de trésorerie dédiée couvrant le besoin en fonds de roulement de la campagne estivale.',
        deadline: '2026-11-30',
        status: 'PENDING',
      },
      {
        description: 'Transmettre le plan de trésorerie saisonnier validé par le coach financier.',
        deadline: '2026-10-10',
        status: 'COMPLETED',
      },
    ],
  },
  {
    project: 'foodwaste',
    cohort: 'agritech',
    decision: 'REJECTED',
    justification:
      "Le dossier est jugé trop en amont : aucun pilote réalisé, aucune sécurisation logistique et une équipe incomplète. Le jury encourage une nouvelle candidature après constitution d'une preuve de concept terrain.",
  },
];

const NOTIFICATION_SPECS: {
  key: string;
  user: string;
  sender?: string;
  title: string;
  message: string;
  type: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resourceType?: string;
  resourceId?: string;
  link?: string;
  read?: boolean;
  createdAt: string;
}[] = [
  { key: 'n1', user: 'jury.strategy', sender: 'manager', title: 'Vous êtes désigné membre du jury', message: 'Vous avez été assigné comme jury de la cohorte Green Startups Acceleration 2026.', type: 'ASSIGNED_AS_JURY', priority: 'HIGH', resourceType: 'COHORT', resourceId: 'green', link: '/expert/evaluations', createdAt: '2026-09-05T09:00:00.000Z', read: true },
  { key: 'n2', user: 'jury.finance', sender: 'manager', title: 'Vous êtes désigné membre du jury', message: 'Vous avez été assigné comme jury des cohortes Green Startups et AgriTech 2026.', type: 'ASSIGNED_AS_JURY', priority: 'HIGH', resourceType: 'COHORT', resourceId: 'green', link: '/expert/evaluations', createdAt: '2026-09-05T09:05:00.000Z', read: true },
  { key: 'n3', user: 'jury.market', sender: 'manager', title: 'Vous êtes désigné membre du jury', message: 'Vous avez été assigné comme jury de la cohorte Green Startups Acceleration 2026.', type: 'ASSIGNED_AS_JURY', priority: 'HIGH', resourceType: 'COHORT', resourceId: 'green', link: '/expert/evaluations', createdAt: '2026-09-05T09:10:00.000Z', read: false },
  { key: 'n4', user: 'coach.business', sender: 'admin', title: 'Vous avez été affecté comme coach', message: 'Vous accompagnez BioCare Tunisia, AgriSmart et MedConnect dans le cadre des cohortes 2026.', type: 'ASSIGNED_AS_COACH', priority: 'HIGH', resourceType: 'PROJECT', resourceId: 'biocare', link: '/expert/projects', createdAt: '2026-09-06T10:00:00.000Z', read: true },
  { key: 'n5', user: 'coach.green', sender: 'admin', title: 'Vous avez été affecté comme coach', message: 'Vous accompagnez BioCare Tunisia et EcoPack.', type: 'ASSIGNED_AS_COACH', priority: 'HIGH', resourceType: 'PROJECT', resourceId: 'biocare', link: '/expert/projects', createdAt: '2026-09-06T10:05:00.000Z', read: true },
  { key: 'n6', user: 'owner.biocare', sender: 'coach.business', title: 'Session de coaching planifiée', message: 'Session « Cadrage du pilote coopérative » prévue le 15 septembre 2026 à 09:00.', type: 'COACHING_SESSION_SCHEDULED', priority: 'MEDIUM', resourceType: 'COACHING', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-09-10T08:00:00.000Z', read: true },
  { key: 'n7', user: 'owner.biocare', sender: 'coach.business', title: 'Action à réaliser', message: 'Action « Finaliser le plan de déploiement des 12 parcelles pilotes » à réaliser avant le 30 septembre.', type: 'COACHING_ACTION_ASSIGNED', priority: 'HIGH', resourceType: 'COACHING', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-09-15T11:00:00.000Z', read: true },
  { key: 'n8', user: 'owner.biocare', sender: 'coach.business', title: 'Action en retard', message: 'L’action « Mettre à jour le prévisionnel financier sur 24 mois » a dépassé son échéance du 3 octobre.', type: 'COACHING_ACTION_OVERDUE', priority: 'HIGH', resourceType: 'COACHING', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-10-04T07:00:00.000Z', read: false },
  { key: 'n9', user: 'owner.biocare', sender: 'jury.strategy', title: 'Nouvelle évaluation disponible', message: 'Une évaluation de votre projet a été soumise par un membre du jury.', type: 'NEW_EVALUATION', priority: 'MEDIUM', resourceType: 'EVALUATION', resourceId: 'biocare', link: '/project-owner/projects/biocare/evaluations', createdAt: '2026-10-02T09:45:00.000Z', read: true },
  { key: 'n10', user: 'owner.biocare', sender: 'admin', title: 'Décision finale : accepté', message: 'Votre projet BioCare Tunisia a été accepté par le jury de la cohorte Green Startups Acceleration 2026.', type: 'FINAL_DECISION_MADE', priority: 'CRITICAL', resourceType: 'PROJECT', resourceId: 'biocare', link: '/project-owner/projects/biocare/evaluations', createdAt: '2026-10-05T16:15:00.000Z', read: false },
  { key: 'n11', user: 'owner.ecopack', sender: 'admin', title: 'Décision finale : réévaluation requise', message: 'Votre projet EcoPack nécessite une réévaluation après démonstration sur trois cuisines centrales.', type: 'FINAL_DECISION_MADE', priority: 'HIGH', resourceType: 'PROJECT', resourceId: 'ecopack', link: '/project-owner/projects/ecopack/evaluations', createdAt: '2026-10-05T16:20:00.000Z', read: false },
  { key: 'n12', user: 'owner.agrismart', sender: 'admin', title: 'Décision finale : accepté avec conditions', message: 'Votre projet AgriSmart est accepté sous réserve de trois conditions à valider avant le 15 décembre 2026.', type: 'FINAL_DECISION_MADE', priority: 'HIGH', resourceType: 'PROJECT', resourceId: 'agrismart', link: '/project-owner/projects/agrismart/evaluations', createdAt: '2026-10-06T09:00:00.000Z', read: false },
  { key: 'n13', user: 'owner.foodwaste', sender: 'admin', title: 'Décision finale : refusé', message: 'Votre projet FoodWaste n’a pas été retenu pour cette session. Le jury vous invite à reposer votre candidature après un pilote.', type: 'FINAL_DECISION_MADE', priority: 'HIGH', resourceType: 'PROJECT', resourceId: 'foodwaste', link: '/project-owner/projects/foodwaste/evaluations', createdAt: '2026-10-02T11:15:00.000Z', read: true },
  { key: 'n14', user: 'admin', sender: 'manager', title: 'Nouvelle demande de vérification', message: 'Un justificatif de domicile a été téléversé par le compte incubateur et attend une décision.', type: 'DOCUMENT_VERIFIED', priority: 'MEDIUM', resourceType: 'INCUBATOR', resourceId: 'atlas', link: '/incubator/settings', createdAt: '2026-09-28T14:00:00.000Z', read: false },
  { key: 'n15', user: 'admin', sender: 'incubator', title: 'Document rejeté', message: 'Le justificatif de domicile a été rejeté : scan tronqué sur la marge droite.', type: 'DOCUMENT_PENDING', priority: 'MEDIUM', resourceType: 'INCUBATOR', resourceId: 'atlas', link: '/incubator/settings', createdAt: '2026-09-29T10:30:00.000Z', read: true },
  { key: 'n16', user: 'incubator', sender: 'admin', title: 'Nouvelle cohorte créée', message: 'La cohorte Green Startups Acceleration 2026 est ouverte et rattachée à Atlas Impact Hub.', type: 'COHORT_CREATED', priority: 'MEDIUM', resourceType: 'COHORT', resourceId: 'green', link: '/incubator/cohorts', createdAt: '2026-08-20T09:00:00.000Z', read: true },
  { key: 'n17', user: 'manager', sender: 'admin', title: 'Grille d’évaluation publiée', message: 'La grille « Grille finale — Green Startups 2026 » est publiée et verrouillée.', type: 'EVALUATION_TEMPLATE_CREATED', priority: 'MEDIUM', resourceType: 'EVALUATION', resourceId: 'green', link: '/incubator/cohorts', createdAt: '2026-09-12T11:00:00.000Z', read: true },
  { key: 'n18', user: 'coach.business', sender: 'owner.biocare', title: 'Preuve soumise', message: 'Une preuve a été déposée sur l’action « Constituer le dossier du programme national ».', type: 'COACHING_ACTION_SUBMITTED', priority: 'MEDIUM', resourceType: 'COACHING', resourceId: 'biocare', link: '/expert/projects', createdAt: '2026-10-06T15:00:00.000Z', read: false },
  { key: 'n19', user: 'owner.biocare', sender: 'coach.green', title: 'Recommandation ajoutée', message: 'Une recommandation prioritaire a été ajoutée : sécuriser une seconde source logistique.', type: 'COACHING_RECOMMENDATION_ADDED', priority: 'MEDIUM', resourceType: 'COACHING', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-10-01T15:30:00.000Z', read: true },
  { key: 'n20', user: 'owner.biocare', sender: 'coach.business', title: 'Commentaire ajouté', message: 'Votre coach a commenté l’action « Mettre à jour le prévisionnel financier ».', type: 'COACHING_COMMENT_ADDED', priority: 'LOW', resourceType: 'COACHING', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-10-06T09:20:00.000Z', read: false },
  { key: 'n21', user: 'jury.strategy', sender: 'manager', title: 'Évaluation demandée', message: 'Une évaluation du projet EcoPack vous est assignée, à rendre avant le 10 octobre.', type: 'EVALUATION_REQUESTED', priority: 'HIGH', resourceType: 'EVALUATION', resourceId: 'ecopack', link: '/expert/evaluations', createdAt: '2026-09-25T09:00:00.000Z', read: true },
  { key: 'n22', user: 'jury.market', sender: 'manager', title: 'Évaluation en cours de saisie', message: 'Votre évaluation du projet EcoPack est en brouillon et reste à compléter.', type: 'EVALUATION_AVAILABLE', priority: 'MEDIUM', resourceType: 'EVALUATION', resourceId: 'ecopack', link: '/expert/evaluations', createdAt: '2026-10-04T09:00:00.000Z', read: false },
  { key: 'n23', user: 'owner.medconnect', sender: 'incubator', title: 'Candidature acceptée', message: 'Votre projet MedConnect est accepté dans la cohorte Digital Health & Impact 2026.', type: 'APPLICATION_ACCEPTED', priority: 'HIGH', resourceType: 'COHORT', resourceId: 'health', link: '/project-owner/projects', createdAt: '2026-09-22T10:00:00.000Z', read: true },
  { key: 'n24', user: 'owner.biocare', sender: 'manager', title: 'Document généré', message: 'Le résumé exécutif de votre projet a été généré.', type: 'DOCUMENT_GENERATED', priority: 'LOW', resourceType: 'DOCUMENT', resourceId: 'biocare', link: '/project-owner/projects/biocare/documents', createdAt: '2026-09-30T17:00:00.000Z', read: true },
  { key: 'n25', user: 'owner.biocare', sender: 'coach.green', title: 'Analyse IA disponible', message: 'L’analyse des risques de votre projet est disponible.', type: 'AI_ANALYSIS_READY', priority: 'MEDIUM', resourceType: 'PROJECT', resourceId: 'biocare', link: '/project-owner/projects/biocare/coaching', createdAt: '2026-10-04T12:00:00.000Z', read: false },
  { key: 'n26', user: 'manager', sender: 'admin', title: 'Cohorte à ouvrir', message: 'La cohorte Digital Health & Impact 2026 ouvre ses candidatures jusqu’au 25 octobre.', type: 'APPLICATION_OPEN', priority: 'MEDIUM', resourceType: 'COHORT', resourceId: 'health', link: '/incubator/cohorts', createdAt: '2026-09-20T08:00:00.000Z', read: true },
  { key: 'n27', user: 'coach.finance', sender: 'admin', title: 'Vous avez été affecté comme coach', message: 'Vous accompagnez AgriSmart sur le volet financier.', type: 'ASSIGNED_AS_COACH', priority: 'MEDIUM', resourceType: 'PROJECT', resourceId: 'agrismart', link: '/expert/projects', createdAt: '2026-09-07T10:00:00.000Z', read: true },
  { key: 'n28', user: 'owner.agrismart', sender: 'coach.finance', title: 'Session de coaching en cours', message: 'La session « Structure de coûts et seuil de rentabilité » a démarré.', type: 'COACHING_SESSION_UPDATED', priority: 'MEDIUM', resourceType: 'COACHING', resourceId: 'agrismart', link: '/project-owner/projects/agrismart/coaching', createdAt: '2026-10-14T15:05:00.000Z', read: false },
  { key: 'n29', user: 'owner.ecopack', sender: 'coach.marketing', title: 'Session manquée', message: 'La session « Cadrage du marché restauration collective » du 30 septembre n’a pas eu lieu.', type: 'COACHING_SESSION_CANCELLED', priority: 'MEDIUM', resourceType: 'COACHING', resourceId: 'ecopack', link: '/project-owner/projects/ecopack/coaching', createdAt: '2026-09-30T10:00:00.000Z', read: true },
  { key: 'n30', user: 'admin', sender: 'incubator', title: 'Nouvel expert inscrit', message: 'Un nouveau profil expert a été créé sur la plateforme.', type: 'NEW_EXPERT', priority: 'LOW', resourceType: 'USER', resourceId: 'jury.strategy', link: '/incubator/members', createdAt: '2026-09-04T12:00:00.000Z', read: true },
];

function stepStatusMap(spec: DemoProjectSpec): Record<string, DemoStepStatus> {
  const map: Record<string, DemoStepStatus> = {};
  for (const step of ALL_STEPS) {
    map[step.stepKey] = 'NOT_STARTED';
  }
  for (const key of spec.completedSteps) map[key] = 'COMPLETED';
  for (const key of spec.inProgressSteps) map[key] = 'IN_PROGRESS';
  return map;
}

function fundingPhase(score: number): string {
  if (score <= 3) return 'IDEATION';
  if (score <= 6) return 'VALIDATION';
  if (score <= 9) return 'EARLY_STAGE';
  if (score <= 11) return 'GROWTH';
  return 'SCALING';
}

async function seedGbmContent(
  prisma: PrismaClient,
  project: DemoProjectSpec,
  projectKey: string,
  statuses: Record<string, DemoStepStatus>,
) {
  const pid = projectId(projectKey);
  const gbm: GbmTheme = project.gbm;
  const done = (key: string) => statuses[key] === 'COMPLETED';
  const started = (key: string) => statuses[key] !== 'NOT_STARTED';

  if (started('gbm_1') && gbm.idea) await upsertOne(prisma.ideaSketch, pid, gbm.idea);
  if (started('gbm_2') && gbm.problems) await upsertOne(prisma.problemsNeeds, pid, gbm.problems);
  if (started('gbm_3') && gbm.pestel) await upsertOne(prisma.pestel, pid, gbm.pestel);
  if (started('gbm_4') && gbm.objective) await upsertOne(prisma.objective, pid, gbm.objective);
  if (started('gbm_5') && gbm.missionVision)
    await upsertOne(prisma.missionVision, pid, gbm.missionVision);
  if (started('gbm_6') && gbm.contextSummary)
    await upsertOne(prisma.contextSummary, pid, {
      summary_text: gbm.contextSummary,
      generated_by_ai: true,
    });

  if (started('gbm_7a') && gbm.stakeholders)
    await replaceMany(prisma.stakeholder, pid, gbm.stakeholders as any);
  if (started('gbm_7b') && gbm.stakeholderMaps)
    await replaceMany(prisma.stakeholderMap, pid, gbm.stakeholderMaps as any);
  if (started('gbm_8') && gbm.segments)
    await replaceMany(prisma.customerSegment, pid, gbm.segments as any);
  if (started('gbm_9') && gbm.valueProposition)
    await upsertOne(prisma.valueProposition, pid, gbm.valueProposition);
  if (started('gbm_10') && gbm.tests)
    await replaceMany(prisma.testDiscovery, pid, gbm.tests as any);
  if (started('gbm_11') && gbm.pivot) await upsertOne(prisma.valuePropositionPivot, pid, gbm.pivot);
  if (started('gbm_12a') && gbm.relations)
    await upsertOne(prisma.customerRelationsChannel, pid, gbm.relations);
  if (started('gbm_12b') && gbm.journeys)
    await replaceMany(prisma.customerJourney, pid, gbm.journeys as any);
  if (started('gbm_13') && gbm.keyActivities)
    await upsertOne(prisma.keyActivitiesResource, pid, gbm.keyActivities);

  const ecoDesignPayload = gbm.ecoDesign ?? {};
  if (started('gbm_14a') || started('eco_design')) {
    if (Object.keys(ecoDesignPayload).length > 0) {
      await upsertOne(prisma.ecoDesign, pid, ecoDesignPayload);
    }
  }
  if (started('gbm_14b') && gbm.ecoDesignResult)
    await upsertOne(prisma.ecoDesignResult, pid, gbm.ecoDesignResult);
  if (started('gbm_15') && gbm.summaryActivity)
    await upsertOne(prisma.summaryActivity, pid, gbm.summaryActivity);
  if (started('gbm_16') && gbm.costStructure)
    await upsertOne(prisma.costStructure, pid, gbm.costStructure);
  if (started('gbm_17') && gbm.revenueStream)
    await upsertOne(prisma.revenueStream, pid, gbm.revenueStream);
  if (started('gbm_18') && gbm.costRevenueSummary)
    await upsertOne(prisma.costRevenueSummary, pid, gbm.costRevenueSummary);
  if (started('gbm_19') && gbm.testPreparation)
    await upsertOne(prisma.testPreparation, pid, gbm.testPreparation);
  if (started('gbm_20') && gbm.indicator) await upsertOne(prisma.indicator, pid, gbm.indicator);
  if (started('gbm_21') && gbm.swot) await upsertOne(prisma.swotAnalysis, pid, gbm.swot);

  if (started('bp_2.1') && gbm.managementPlan)
    await upsertOne(prisma.managementPlan, pid, gbm.managementPlan);
  if (started('bp_2.2') && gbm.marketingPlan)
    await upsertOne(prisma.marketingPlan, pid, gbm.marketingPlan);
  if (started('bp_2.3') && gbm.financialPlan)
    await upsertOne(prisma.financialPlan, pid, gbm.financialPlan);
  if (started('bp_2.4') && gbm.legalPlan) await upsertOne(prisma.legalPlan, pid, gbm.legalPlan);
  if (started('bp_2.5') && gbm.kpi) await upsertOne(prisma.kpi, pid, gbm.kpi);
  if (started('bp_2.6') && gbm.executiveSummary)
    await upsertOne(prisma.executiveSummary, pid, gbm.executiveSummary);

  if (started('funding') && gbm.funding) {
    const answers = gbm.funding.answers;
    const score = Object.values(answers).filter(Boolean).length;
    await upsertOne(prisma.fundingAssessment, pid, {
      reponses_questionnaire: answers,
      score_maturite: score,
      phase_maturite: fundingPhase(score),
      opportunites_financement: (gbm.funding.opportunites_financement ?? undefined) as any,
      opportunites_pays: gbm.funding.opportunites_pays,
      strategie_levee_fonds: gbm.funding.strategie_levee_fonds,
      completed_at: T('2026-09-26T10:00:00.000Z'),
    });
  }
  if (started('market') && gbm.market) await upsertOne(prisma.marketAccess, pid, gbm.market);
  if (started('impact') && gbm.impact) await upsertOne(prisma.impactMeasure, pid, gbm.impact);

  if (done('eco_design') && Object.keys(ecoDesignPayload).length > 0) {
    await upsertOne(prisma.ecoDesign, pid, ecoDesignPayload);
  }
}

export async function seedDemoScenario(prisma: PrismaClient): Promise<void> {
  console.log('  ⏳ Scénario de démonstration ProjectStruct…');

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const areaNames = [
    'Business Model',
    'Stratégie Go-to-Market',
    'Lean Startup',
    'Finance & Comptabilité',
    'Fundraising & Investissement',
    'M&A / Fusion-Acquisition',
    'Marketing Digital',
    'Branding & Communication',
    'Ventes B2B',
    'SEO / SEA',
    'Développement Durable',
    'Impact Social',
    'Agri-Tech',
    'Med-Tech / Santé',
    'Product Marketing',
  ];
  for (const name of areaNames) {
    const existing = await prisma.expertiseArea.findFirst({ where: { name } });
    if (!existing) {
      await prisma.expertiseArea.create({
        data: { id: did('area', name), name, category: 'Démo ProjectStruct' },
      });
    }
  }

  for (const spec of DEMO_USERS) {
    const profileId = did('profile', spec.key);
    await prisma.userProfile.upsert({
      where: { id: profileId },
      create: {
        id: profileId,
        first_name: spec.firstName,
        last_name: spec.lastName,
        bio: spec.bio,
        country: spec.country,
        city: spec.city,
        preferred_language: 'FR',
      },
      update: {
        first_name: spec.firstName,
        last_name: spec.lastName,
        bio: spec.bio,
        country: spec.country,
        city: spec.city,
      },
    });

    const uid = userId(spec.key);
    await prisma.user.upsert({
      where: { email: spec.email },
      create: {
        id: uid,
        email: spec.email,
        password_hash: passwordHash,
        role: spec.role,
        is_verified: true,
        is_active: true,
        profile_id: profileId,
      },
      update: {
        password_hash: passwordHash,
        role: spec.role,
        is_verified: true,
        is_active: true,
        profile_id: profileId,
      },
    });

    if (spec.expert) {
      const expertProfileId = did('expert', spec.key);
      await prisma.expertProfile.upsert({
        where: { user_id: uid },
        create: {
          id: expertProfileId,
          user_id: uid,
          headline: spec.expert.headline,
          bio: spec.bio,
          organization: spec.expert.organization,
          position: spec.expert.position,
          years_of_experience: spec.expert.years,
          availability_status: 'AVAILABLE',
        },
        update: {
          headline: spec.expert.headline,
          bio: spec.bio,
          organization: spec.expert.organization,
          position: spec.expert.position,
          years_of_experience: spec.expert.years,
          availability_status: 'AVAILABLE',
        },
      });

      for (const areaName of spec.expert.expertise) {
        const area = await prisma.expertiseArea.findFirst({ where: { name: areaName } });
        if (!area) continue;
        await prisma.expertProfileExpertiseArea.upsert({
          where: {
            expert_profile_id_expertise_area_id: {
              expert_profile_id: expertProfileId,
              expertise_area_id: area.id,
            },
          },
          create: {
            id: did('exparea', `${spec.key}:${areaName}`),
            expert_profile_id: expertProfileId,
            expertise_area_id: area.id,
            level: 'expert',
          },
          update: {},
        });
      }
    }

    if (spec.owner) {
      const ownerProfileId = did('ownerprofile', spec.key);
      await prisma.projectOwnerProfile.upsert({
        where: { user_id: uid },
        create: {
          id: ownerProfileId,
          user_id: uid,
          current_status: spec.owner.currentStatus,
          education_level: spec.owner.educationLevel,
          field_of_study: spec.owner.fieldOfStudy,
          occupation: spec.owner.occupation,
          entrepreneurial_experience_level: spec.owner.experienceLevel,
          has_previous_startup: spec.owner.hasPreviousStartup,
        },
        update: {
          current_status: spec.owner.currentStatus,
          education_level: spec.owner.educationLevel,
          field_of_study: spec.owner.fieldOfStudy,
          occupation: spec.owner.occupation,
          entrepreneurial_experience_level: spec.owner.experienceLevel,
          has_previous_startup: spec.owner.hasPreviousStartup,
        },
      });

      for (const [index, skill] of spec.owner.skills.entries()) {
        await prisma.projectOwnerSkill.upsert({
          where: { id: did('skill', `${spec.key}:${index}`) },
          create: {
            id: did('skill', `${spec.key}:${index}`),
            skill_name: skill.name,
            level: skill.level,
            project_owner_profile_id: ownerProfileId,
          },
          update: { level: skill.level },
        });
      }

      for (const [index, exp] of spec.owner.experiences.entries()) {
        await prisma.projectOwnerExperience.upsert({
          where: { id: did('exp', `${spec.key}:${index}`) },
          create: {
            id: did('exp', `${spec.key}:${index}`),
            title: exp.title,
            organization: exp.organization,
            description: exp.description,
            start_date: T(exp.start),
            end_date: exp.end ? T(exp.end) : null,
            project_owner_profile_id: ownerProfileId,
          },
          update: {
            title: exp.title,
            organization: exp.organization,
            description: exp.description,
            start_date: T(exp.start),
            end_date: exp.end ? T(exp.end) : null,
          },
        });
      }
    }
  }
  console.log(`    ✅ ${DEMO_USERS.length} comptes de démonstration`);

  const adminId = userId('admin');
  for (const spec of DEMO_INCUBATORS) {
    const iid = incubatorId(spec.key);
    await prisma.incubator.upsert({
      where: { slug: spec.slug },
      create: {
        id: iid,
        name: spec.name,
        slug: spec.slug,
        description: spec.description,
        email: spec.email,
        country: spec.country,
        city: spec.city,
        website_url: spec.website,
        foundation_date: T(spec.foundation),
        verification_status: 'APPROVED',
        status: 'ACTIVE',
        created_by_user_id: userId(spec.members[0].userKey),
      },
      update: {
        name: spec.name,
        description: spec.description,
        email: spec.email,
        country: spec.country,
        city: spec.city,
        website_url: spec.website,
        foundation_date: T(spec.foundation),
        verification_status: 'APPROVED',
        status: 'ACTIVE',
      },
    });

    for (const member of spec.members) {
      await prisma.incubatorMember.upsert({
        where: {
          user_id_incubator_id: { user_id: userId(member.userKey), incubator_id: iid },
        },
        create: {
          id: did('member', `${spec.key}:${member.userKey}`),
          user_id: userId(member.userKey),
          incubator_id: iid,
          role: member.role,
          job_title: member.jobTitle,
          status: 'ACTIVE',
          is_primary_contact: member.primary ?? false,
          can_manage_programs: member.canManagePrograms ?? false,
          can_manage_cohorts: member.canManageCohorts ?? false,
          can_manage_members: member.canManageMembers ?? false,
        },
        update: {
          role: member.role,
          job_title: member.jobTitle,
          status: 'ACTIVE',
          is_primary_contact: member.primary ?? false,
          can_manage_programs: member.canManagePrograms ?? false,
          can_manage_cohorts: member.canManageCohorts ?? false,
          can_manage_members: member.canManageMembers ?? false,
        },
      });
    }

    for (const [index, doc] of spec.documents.entries()) {
      const docId = did('incdoc', `${spec.key}:${index}`);
      await prisma.incubatorDocument.upsert({
        where: { id: docId },
        create: {
          id: docId,
          incubator_id: iid,
          document_type: doc.type,
          file_url: `/uploads/incubators/${spec.slug}/${doc.type}.pdf`,
          verification_status: doc.status,
          rejection_reason: doc.reason ?? null,
          uploaded_by_user_id: userId(doc.uploadedBy),
          uploaded_at: T('2026-09-15T10:00:00.000Z'),
        },
        update: {
          verification_status: doc.status,
          rejection_reason: doc.reason ?? null,
        },
      });
    }
  }
  console.log(`    ✅ ${DEMO_INCUBATORS.length} incubateurs`);

  for (const spec of DEMO_COHORTS) {
    const cid = cohortId(spec.key);
    await prisma.cohort.upsert({
      where: { id: cid },
      create: {
        id: cid,
        name: spec.name,
        program: spec.program,
        description: spec.description,
        capacity: spec.capacity,
        status: spec.status,
        incubator_id: incubatorId(spec.incubatorKey),
        application_deadline: T(spec.applicationDeadline),
        start_date: T(spec.startDate),
        end_date: T(spec.endDate),
      },
      update: {
        name: spec.name,
        program: spec.program,
        description: spec.description,
        capacity: spec.capacity,
        status: spec.status,
        incubator_id: incubatorId(spec.incubatorKey),
        application_deadline: T(spec.applicationDeadline),
        start_date: T(spec.startDate),
        end_date: T(spec.endDate),
      },
    });

    for (const coachKey of spec.coaches) {
      await prisma.cohortExpert.upsert({
        where: {
          cohort_id_expert_user_id_role: {
            cohort_id: cid,
            expert_user_id: userId(coachKey),
            role: 'COACH',
          },
        },
        create: {
          id: did('cohortexpert', `${spec.key}:COACH:${coachKey}`),
          cohort_id: cid,
          expert_user_id: userId(coachKey),
          role: 'COACH',
          status: 'ACTIVE',
          assigned_by: adminId,
          assigned_at: T('2026-08-22T09:00:00.000Z'),
          responded_at: T('2026-08-23T09:00:00.000Z'),
        },
        update: { status: 'ACTIVE' },
      });
    }

    for (const juryKey of spec.juries) {
      await prisma.cohortExpert.upsert({
        where: {
          cohort_id_expert_user_id_role: {
            cohort_id: cid,
            expert_user_id: userId(juryKey),
            role: 'JURY',
          },
        },
        create: {
          id: did('cohortexpert', `${spec.key}:JURY:${juryKey}`),
          cohort_id: cid,
          expert_user_id: userId(juryKey),
          role: 'JURY',
          status: 'ACTIVE',
          assigned_by: adminId,
          assigned_at: T('2026-09-05T09:00:00.000Z'),
          responded_at: T('2026-09-05T12:00:00.000Z'),
        },
        update: { status: 'ACTIVE' },
      });
    }
  }
  console.log(`    ✅ ${DEMO_COHORTS.length} cohortes`);

  for (const spec of DEMO_PROJECTS) {
    const pid = projectId(spec.key);
    await prisma.project.upsert({
      where: { id: pid },
      create: {
        id: pid,
        name: spec.name,
        description: spec.description,
        owner_id: userId(
          DEMO_USERS.find((u) => u.email === spec.ownerEmail)?.key ?? '',
        ),
        is_gbm_reviewed: spec.isGbmReviewed ?? false,
        gbm_reviewed_at: spec.isGbmReviewed ? T('2026-09-27T14:00:00.000Z') : null,
        business_plan_status: spec.businessPlanFinal ? 'FINAL' : null,
        business_plan_finalized_at: spec.businessPlanFinal
          ? T('2026-09-29T10:00:00.000Z')
          : null,
      },
      update: {
        name: spec.name,
        description: spec.description,
        owner_id: userId(
          DEMO_USERS.find((u) => u.email === spec.ownerEmail)?.key ?? '',
        ),
        is_gbm_reviewed: spec.isGbmReviewed ?? false,
        gbm_reviewed_at: spec.isGbmReviewed ? T('2026-09-27T14:00:00.000Z') : null,
        business_plan_status: spec.businessPlanFinal ? 'FINAL' : null,
        business_plan_finalized_at: spec.businessPlanFinal
          ? T('2026-09-29T10:00:00.000Z')
          : null,
      },
    });

    const cid = cohortId(spec.cohortKey);
    await prisma.cohortParticipation.upsert({
      where: { cohort_id_project_id: { cohort_id: cid, project_id: pid } },
      create: {
        id: did('participation', `${spec.cohortKey}:${spec.key}`),
        cohort_id: cid,
        project_id: pid,
        status: 'ACCEPTED',
        origin: 'APPLICATION',
        applied_at: T('2026-08-10T09:00:00.000Z'),
        responded_at: T('2026-08-24T09:00:00.000Z'),
      },
      update: { status: 'ACCEPTED', origin: 'APPLICATION' },
    });
  }
  console.log(`    ✅ ${DEMO_PROJECTS.length} projets`);

  for (const spec of DEMO_COHORTS) {
    const cid = cohortId(spec.key);
    const count = await prisma.cohortParticipation.count({
      where: { cohort_id: cid, status: 'ACCEPTED' },
    });
    await prisma.cohort.update({
      where: { id: cid },
      data: { current_participants: count },
    });
  }

  for (const spec of DEMO_PROJECTS) {
    const pid = projectId(spec.key);
    const statuses = stepStatusMap(spec);
    for (const [key, status] of Object.entries(statuses)) {
      await prisma.stepProgress.upsert({
        where: { project_id_step_key: { project_id: pid, step_key: key } },
        create: {
          project_id: pid,
          step_key: key,
          status: status as StepStatus,
          completed_at: status === 'COMPLETED' ? T('2026-09-27T14:00:00.000Z') : null,
        },
        update: {
          status: status as StepStatus,
          completed_at: status === 'COMPLETED' ? T('2026-09-27T14:00:00.000Z') : null,
        },
      });
    }
    await seedGbmContent(prisma, spec, spec.key, statuses);
  }
  console.log('    ✅ Progression GBM et contenus de module');

  for (const spec of COACH_ASSIGNMENTS) {
    const pid = projectId(spec.project);
    for (const coachKey of spec.coaches) {
      await prisma.projectExpertAssignment.upsert({
        where: {
          project_id_expert_user_id_role: {
            project_id: pid,
            expert_user_id: userId(coachKey),
            role: 'COACH',
          },
        },
        create: {
          id: did('assignment', `${spec.project}:${coachKey}`),
          project_id: pid,
          expert_user_id: userId(coachKey),
          role: 'COACH',
          status: 'ACTIVE',
          assigned_by: adminId,
          assigned_at: T('2026-09-06T10:00:00.000Z'),
        },
        update: { status: 'ACTIVE' },
      });
    }
  }

  for (const spec of SESSIONS) {
    const sid = did('session', spec.key);
    await prisma.coachingSession.upsert({
      where: { id: sid },
      create: {
        id: sid,
        assignment_id: did('assignment', `${spec.project}:${spec.coach}`),
        title: spec.title,
        objective: spec.objective,
        session_type: spec.sessionType,
        scheduled_at: T(spec.scheduledAt),
        duration_minutes: spec.duration,
        status: spec.status,
        agenda: spec.agenda ?? null,
        notes: spec.notes ?? null,
        findings: spec.findings ?? null,
        topics_discussed: spec.topics ?? null,
        decisions: spec.decisions ?? null,
        report: spec.report ?? null,
        summary: spec.summary ?? null,
        next_objectives: spec.nextObjectives ?? null,
        objective_result: spec.objectiveResult ?? null,
        objective_result_reason: spec.objectiveReason ?? null,
        created_by: userId(spec.coach),
        created_at: T('2026-09-10T08:00:00.000Z'),
        started_at: spec.startedAt ? T(spec.startedAt) : null,
        completed_at: spec.completedAt ? T(spec.completedAt) : null,
      },
      update: {
        title: spec.title,
        objective: spec.objective,
        session_type: spec.sessionType,
        scheduled_at: T(spec.scheduledAt),
        duration_minutes: spec.duration,
        status: spec.status,
        agenda: spec.agenda ?? null,
        notes: spec.notes ?? null,
        findings: spec.findings ?? null,
        topics_discussed: spec.topics ?? null,
        decisions: spec.decisions ?? null,
        report: spec.report ?? null,
        summary: spec.summary ?? null,
        next_objectives: spec.nextObjectives ?? null,
        objective_result: spec.objectiveResult ?? null,
        objective_result_reason: spec.objectiveReason ?? null,
        started_at: spec.startedAt ? T(spec.startedAt) : null,
        completed_at: spec.completedAt ? T(spec.completedAt) : null,
      },
    });
  }

  for (const spec of ACTIONS) {
    const aid = did('action', spec.key);
    await prisma.coachingAction.upsert({
      where: { id: aid },
      create: {
        id: aid,
        project_id: projectId(spec.project),
        session_id: spec.session ? did('session', spec.session) : null,
        assignment_id: did('assignment', `${spec.project}:${spec.coach}`),
        title: spec.title,
        description: spec.description,
        status: spec.status,
        priority: spec.priority,
        deadline: T(`${spec.deadline}T17:00:00.000Z`),
        completed_at: spec.completedAt ? T(`${spec.completedAt}T17:00:00.000Z`) : null,
        related_document_key: spec.relatedDocumentKey ?? null,
        responsible_user_id: projectId(spec.project)
          ? userId(
              DEMO_USERS.find((u) => u.email === DEMO_PROJECTS.find((p) => p.key === spec.project)?.ownerEmail)?.key ?? '',
            )
          : null,
        created_by: userId(spec.coach),
        created_at: T('2026-09-15T11:00:00.000Z'),
      },
      update: {
        title: spec.title,
        description: spec.description,
        status: spec.status,
        priority: spec.priority,
        deadline: T(`${spec.deadline}T17:00:00.000Z`),
        completed_at: spec.completedAt ? T(`${spec.completedAt}T17:00:00.000Z`) : null,
        related_document_key: spec.relatedDocumentKey ?? null,
      },
    });

    if (spec.evidence) {
      const eid = did('evidence', spec.key);
      await prisma.actionEvidence.upsert({
        where: { id: eid },
        create: {
          id: eid,
          action_id: aid,
          type: spec.evidence.type,
          title: spec.evidence.title,
          content: spec.evidence.content,
          url: spec.evidence.type === 'LINK' ? spec.evidence.content : null,
          review_status: spec.evidence.reviewStatus,
          coach_comment: spec.evidence.comment ?? null,
          reviewed_by:
            spec.evidence.reviewStatus === 'PENDING' ? null : userId(spec.coach),
          reviewed_at:
            spec.evidence.reviewStatus === 'PENDING'
              ? null
              : T('2026-10-05T10:00:00.000Z'),
          submitted_by: userId(
            DEMO_USERS.find(
              (u) =>
                u.email ===
                DEMO_PROJECTS.find((p) => p.key === spec.project)?.ownerEmail,
            )?.key ?? '',
          ),
          created_at: T('2026-10-06T15:00:00.000Z'),
        },
        update: {
          review_status: spec.evidence.reviewStatus,
          coach_comment: spec.evidence.comment ?? null,
          reviewed_by:
            spec.evidence.reviewStatus === 'PENDING' ? null : userId(spec.coach),
          reviewed_at:
            spec.evidence.reviewStatus === 'PENDING'
              ? null
              : T('2026-10-05T10:00:00.000Z'),
        },
      });
    }
  }

  for (const spec of RECOMMENDATIONS) {
    const rid = did('reco', spec.key);
    await prisma.coachingRecommendation.upsert({
      where: { id: rid },
      create: {
        id: rid,
        session_id: spec.session ? did('session', spec.session) : null,
        project_id: projectId(spec.project),
        author_id: userId(spec.author),
        title: spec.title,
        content: spec.content,
        priority: spec.priority,
        status: spec.status,
        source: spec.source,
        created_at: T('2026-10-01T15:30:00.000Z'),
      },
      update: {
        title: spec.title,
        content: spec.content,
        priority: spec.priority,
        status: spec.status,
        source: spec.source,
      },
    });
  }

  const COMMENTS: { key: string; action?: string; session?: string; author: string; content: string; createdAt: string }[] = [
    { key: 'c1', action: 'biocare-a2', author: 'coach.business', content: 'Pensez à joindre la convention INRAT, elle est explicitement demandée dans le dossier.', createdAt: '2026-10-06T09:20:00.000Z' },
    { key: 'c2', action: 'biocare-a5', author: 'coach.business', content: "L'échéance est dépassée, faisons un point téléphonique demain pour débloquer le prévisionnel.", createdAt: '2026-10-06T09:25:00.000Z' },
    { key: 'c3', session: 'biocare-2', author: 'coach.business', content: 'Bonne tenue de la session : l’arbitrage prix a été rapide et documenté.', createdAt: '2026-10-01T15:40:00.000Z' },
    { key: 'c4', action: 'agrismart-a1', author: 'coach.business', content: 'Deux unités restent à convaincre, je prépare les courriers de relance.', createdAt: '2026-10-06T11:00:00.000Z' },
    { key: 'c5', action: 'ecopack-a1', author: 'coach.green', content: 'Privilegier un conservateur déjà autorisé pour les denrées à taux d’eau élevé.', createdAt: '2026-10-03T14:00:00.000Z' },
  ];
  for (const spec of COMMENTS) {
    const cid = did('comment', spec.key);
    await prisma.coachingComment.upsert({
      where: { id: cid },
      create: {
        id: cid,
        action_id: spec.action ? did('action', spec.action) : null,
        session_id: spec.session ? did('session', spec.session) : null,
        author_id: userId(spec.author),
        content: spec.content,
        resource_type: spec.action ? 'COACHING' : null,
        resource_id: spec.action ? projectId(
          ACTIONS.find((a) => a.key === spec.action)?.project ?? '',
        ) : null,
        created_at: T(spec.createdAt),
      },
      update: { content: spec.content },
    });
  }
  console.log('    ✅ Affectations, sessions, actions, recommandations');

  for (const spec of DEMO_COHORTS) {
    const tid = templateId(spec.key);
    await prisma.evaluationTemplate.upsert({
      where: { id: tid },
      create: {
        id: tid,
        cohort_id: cohortId(spec.key),
        name: `Grille finale — ${spec.name}`,
        description:
          'Grille d’évaluation finale pondérée sur 100 points, huit critères couvrant la faisabilité, l’impact et l’accès au financement.',
        stage: 'FINAL',
        published: true,
        locked_at: T('2026-09-12T11:00:00.000Z'),
        created_by: adminId,
        created_at: T('2026-09-10T09:00:00.000Z'),
      },
      update: {
        name: `Grille finale — ${spec.name}`,
        published: true,
        locked_at: T('2026-09-12T11:00:00.000Z'),
      },
    });

    for (const [index, criterion] of DEMO_CRITERIA.entries()) {
      const critId = criterionId(spec.key, index);
      await prisma.evaluationCriterion.upsert({
        where: { id: critId },
        create: {
          id: critId,
          template_id: tid,
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight,
          max_score: criterion.maxScore,
          sort_order: index,
        },
        update: {
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight,
          max_score: criterion.maxScore,
          sort_order: index,
        },
      });
    }
  }

  for (const spec of EVALUATION_SPECS) {
    const pid = projectId(spec.project);
    const cid = cohortId(spec.cohort);
    const jid = userId(spec.jury);
    await prisma.evaluationAssignment.upsert({
      where: {
        cohort_id_project_id_jury_user_id: {
          cohort_id: cid,
          project_id: pid,
          jury_user_id: jid,
        },
      },
      create: {
        id: did('evalassign', `${spec.cohort}:${spec.project}:${spec.jury}`),
        cohort_id: cid,
        project_id: pid,
        jury_user_id: jid,
        assigned_by: adminId,
        created_at: T('2026-09-25T09:00:00.000Z'),
        deadline: T('2026-10-10T17:00:00.000Z'),
      },
      update: { deadline: T('2026-10-10T17:00:00.000Z') },
    });

    const criteria = DEMO_CRITERIA.map((c, i) => ({
      id: criterionId(spec.cohort, i),
      weight: c.weight,
      max_score: c.maxScore,
    }));
    const scores = spec.scores.map((score, i) => ({
      criterion_id: criterionId(spec.cohort, i),
      score,
    }));
    const computation = computeWeightedScore(criteria, scores as any);

    const eid = did('evaluation', `${spec.project}:${spec.jury}`);
    await prisma.evaluation.upsert({
      where: { id: eid },
      create: {
        id: eid,
        project_id: pid,
        jury_user_id: jid,
        template_id: templateId(spec.cohort),
        status: spec.status,
        version: 1,
        score: spec.status === 'SUBMITTED' ? computation.total20 : null,
        comment: spec.comment ?? null,
        recommendation: spec.recommendation ?? null,
        submitted_at: spec.submittedAt ? T(spec.submittedAt) : null,
        created_at: T('2026-09-26T10:00:00.000Z'),
      },
      update: {
        status: spec.status,
        score: spec.status === 'SUBMITTED' ? computation.total20 : null,
        comment: spec.comment ?? null,
        recommendation: spec.recommendation ?? null,
        submitted_at: spec.submittedAt ? T(spec.submittedAt) : null,
      },
    });

    for (const [index, score] of spec.scores.entries()) {
      const sid = did('score', `${spec.project}:${spec.jury}:${index}`);
      await prisma.evaluationScore.upsert({
        where: {
          evaluation_id_criterion_id: {
            evaluation_id: eid,
            criterion_id: criterionId(spec.cohort, index),
          },
        },
        create: {
          id: sid,
          evaluation_id: eid,
          criterion_id: criterionId(spec.cohort, index),
          score,
          comment: null,
        },
        update: { score },
      });
    }
  }
  console.log('    ✅ Grilles, affectations et évaluations de jury');

  for (const spec of JURY_SESSION_SPECS) {
    const jid = did('jurysession', spec.key);
    await prisma.jurySession.upsert({
      where: { id: jid },
      create: {
        id: jid,
        project_id: projectId(spec.project),
        cohort_id: cohortId(spec.cohort),
        title: spec.title,
        status: spec.status,
        observations: spec.observations ?? null,
        closed_at: spec.closedAt ? T(spec.closedAt) : null,
        created_by: adminId,
        created_at: T('2026-10-01T09:00:00.000Z'),
      },
      update: {
        title: spec.title,
        status: spec.status,
        observations: spec.observations ?? null,
        closed_at: spec.closedAt ? T(spec.closedAt) : null,
      },
    });

    for (const memberKey of spec.members) {
      await prisma.jurySessionMember.upsert({
        where: {
          jury_session_id_member_user_id: {
            jury_session_id: jid,
            member_user_id: userId(memberKey),
          },
        },
        create: {
          id: did('jurymember', `${spec.key}:${memberKey}`),
          jury_session_id: jid,
          member_user_id: userId(memberKey),
          created_at: T('2026-10-01T09:05:00.000Z'),
        },
        update: {},
      });
    }
  }

  for (const spec of DECISION_SPECS) {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        project_id: projectId(spec.project),
        status: 'SUBMITTED',
        template_id: templateId(spec.cohort),
      },
      include: { template: { include: { criteria: true } }, scores: true },
    });
    const totals = evaluations
      .filter((e) => e.template)
      .map((e) => computeWeightedScore(e.template!.criteria, e.scores).total20);
    const finalScore =
      totals.length > 0
        ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 100) / 100
        : null;

    const didId = did('decision', `${spec.project}:${spec.cohort}`);
    await prisma.finalDecision.upsert({
      where: { id: didId },
      create: {
        id: didId,
        project_id: projectId(spec.project),
        cohort_id: cohortId(spec.cohort),
        decision: spec.decision,
        final_score: finalScore,
        justification: spec.justification,
        new_end_date: spec.newEndDate ? T(spec.newEndDate) : null,
        decided_by: adminId,
        decided_at: T('2026-10-05T16:15:00.000Z'),
        created_at: T('2026-10-05T16:15:00.000Z'),
      },
      update: {
        decision: spec.decision,
        final_score: finalScore,
        justification: spec.justification,
        new_end_date: spec.newEndDate ? T(spec.newEndDate) : null,
      },
    });

    for (const [index, condition] of (spec.conditions ?? []).entries()) {
      const conId = did('condition', `${spec.project}:${index}`);
      await prisma.finalDecisionCondition.upsert({
        where: { id: conId },
        create: {
          id: conId,
          decision_id: didId,
          description: condition.description,
          deadline: T(`${condition.deadline}T17:00:00.000Z`),
          status: condition.status,
          validated_by:
            condition.status === 'COMPLETED' ? adminId : null,
          validated_at:
            condition.status === 'COMPLETED'
              ? T('2026-10-06T10:00:00.000Z')
              : null,
          created_at: T('2026-10-05T16:15:00.000Z'),
        },
        update: {
          description: condition.description,
          deadline: T(`${condition.deadline}T17:00:00.000Z`),
          status: condition.status,
          validated_by: condition.status === 'COMPLETED' ? adminId : null,
          validated_at:
            condition.status === 'COMPLETED'
              ? T('2026-10-06T10:00:00.000Z')
              : null,
        },
      });
    }
  }
  console.log('    ✅ Sessions de jury et décisions finales');

  for (const spec of DEMO_PROJECTS) {
    const pid = projectId(spec.key);
    for (const doc of spec.documents) {
      await prisma.generatedDocument.upsert({
        where: {
          project_id_document_key: {
            project_id: pid,
            document_key: doc.key,
          },
        },
        create: {
          id: did('doc', `${spec.key}:${doc.key}`),
          project_id: pid,
          document_key: doc.key,
          title: doc.title,
          status: 'GENERATED',
          content: doc.content,
          generated_at: T('2026-09-30T17:00:00.000Z'),
          updated_at: T('2026-09-30T17:00:00.000Z'),
        },
        update: {
          title: doc.title,
          status: 'GENERATED',
          content: doc.content,
          generated_at: T('2026-09-30T17:00:00.000Z'),
          updated_at: T('2026-09-30T17:00:00.000Z'),
        },
      });
    }
  }
  console.log('    ✅ Documents générés');

  const AI_ANALYSES: {
    key: string;
    project: string;
    type: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    session?: string;
    createdBy: string;
    payload?: Record<string, unknown>;
    createdAt: string;
  }[] = [
    {
      key: 'biocare-brief',
      project: 'biocare',
      type: 'SESSION_BRIEF',
      status: 'COMPLETED',
      session: 'biocare-3',
      createdBy: 'coach.green',
      payload: {
        titre: 'Brief de session — Revue de l’empreinte du capteur v2',
        points: [
          'Bilan du passage en ABS recyclé : -31 % de masse plastique.',
          'Empreinte carbone estimée à 14 kg CO2e par capteur.',
          'Stratégie de reprise en fin de vie à contractualiser.',
        ],
        question_prioritaire: 'Le gain d’éco-conception est-il suffisamment opposable pour le dossier de subvention ?',
      },
      createdAt: '2026-10-19T09:00:00.000Z',
    },
    {
      key: 'biocare-summary',
      project: 'biocare',
      type: 'SESSION_SUMMARY',
      status: 'COMPLETED',
      session: 'biocare-2',
      createdBy: 'coach.business',
      payload: {
        synthese: "Le prix est maintenu à 48 TND/ha avec une indemnité kilométrique au-delà de 40 km.",
        decisions: ['Prix maintenu', 'Indemnité kilométrique introduite', 'Dossier de subvention à finaliser'],
        suite: 'Point sur le dossier de subvention avant le 31 octobre.',
      },
      createdAt: '2026-10-01T15:15:00.000Z',
    },
    {
      key: 'biocare-risk',
      project: 'biocare',
      type: 'RISK_ANALYSIS',
      status: 'COMPLETED',
      createdBy: 'coach.green',
      payload: {
        risques: [
          { niveau: 'élevé', libelle: 'Dépendance au réseau LoRaWAN en zones reculées', atténuation: 'Mode hors-ligne du boîtier et double passerelle.' },
          { niveau: 'moyen', libelle: 'Concentration commerciale sur un seul interlocuteur', atténuation: 'Recruter un second chargé de déploiement.' },
          { niveau: 'faible', libelle: 'Hausse du coût des composants électroniques', atténuation: 'Double sourcing contractuel.' },
        ],
        score_global: 62,
      },
      createdAt: '2026-10-04T12:00:00.000Z',
    },
    {
      key: 'ecopack-eval',
      project: 'ecopack',
      type: 'EVALUATION_ANALYSIS',
      status: 'COMPLETED',
      createdBy: adminId,
      payload: {
        moyenne: 9.6,
        points_forts: ['Cadre réglementaire favorable', 'Formulation propriétaire'],
        points_faibles: ['Capacité de production non investie', 'Marché non validé', 'Équipe sans expérience commerciale'],
        recommandation: 'Réévaluation après démonstration sur trois cuisines centrales.',
      },
      createdAt: '2026-10-04T14:00:00.000Z',
    },
    {
      key: 'agrismart-progress',
      project: 'agrismart',
      type: 'PROGRESS_ANALYSIS',
      status: 'PENDING',
      createdBy: 'coach.business',
      createdAt: '2026-10-06T08:00:00.000Z',
    },
  ];
  for (const spec of AI_ANALYSES) {
    const aid = did('aianalysis', spec.key);
    await prisma.aiAnalysis.upsert({
      where: { id: aid },
      create: {
        id: aid,
        project_id: projectId(spec.project),
        type: spec.type as any,
        status: spec.status,
        session_id: spec.session ? did('session', spec.session) : null,
        payload: (spec.payload ?? undefined) as any,
        model: 'demo-seed',
        created_by: spec.createdBy === adminId ? adminId : userId(spec.createdBy),
        created_at: T(spec.createdAt),
      },
      update: {
        type: spec.type as any,
        status: spec.status,
        payload: (spec.payload ?? undefined) as any,
      },
    });
  }

  for (const spec of RECOMMENDATIONS) {
    if (!spec.aiAnalysisKey) continue;
    await prisma.coachingRecommendation.update({
      where: { id: did('reco', spec.key) },
      data: { ai_analysis_id: did('aianalysis', spec.aiAnalysisKey) },
    });
  }

  const IMPROVEMENT_PLANS: {
    key: string;
    project: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    progress: number;
    createdBy: string;
    deadline: string;
    objectives: {
      title: string;
      description: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      progress: number;
      currentScore?: number;
      targetScore?: number;
      deadline: string;
    }[];
  }[] = [
    {
      key: 'biocare-plan',
      project: 'biocare',
      title: 'Plan d’amélioration — sortie d’accélération 2027',
      description:
        'Plan dérivé des recommandations du jury pour préparer la montée en charge : fonction commerciale, robustesse réseau et reporting d’impact.',
      status: 'ACTIVE',
      progress: 45,
      createdBy: 'coach.business',
      deadline: '2027-01-31',
      objectives: [
        {
          title: 'Structurer la fonction commerciale',
          description: 'Recruter un second chargé de déploiement et déployer un argumentaire commercial standardisé.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          progress: 60,
          currentScore: 2,
          targetScore: 4,
          deadline: '2026-12-31',
        },
        {
          title: 'Sécuriser la connectivité en zones reculées',
          description: "Développer le mode hors-ligne du boîtier et contractualiser une seconde passerelle.",
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          progress: 35,
          currentScore: 2,
          targetScore: 4,
          deadline: '2027-01-31',
        },
        {
          title: 'Publier la méthodologie d’impact',
          description: 'Rendre public le protocole de mesure et les calculs d’indicateurs.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          progress: 100,
          currentScore: 3,
          targetScore: 4,
          deadline: '2026-10-15',
        },
      ],
    },
    {
      key: 'ecopack-plan',
      project: 'ecopack',
      title: 'Plan de démonstration avant réévaluation',
      description:
        'Actions requises par le jury avant toute nouvelle évaluation : preuve terrain, capacité de production et modèle économique.',
      status: 'ACTIVE',
      progress: 25,
      createdBy: adminId,
      deadline: '2027-03-31',
      objectives: [
        {
          title: 'Démontrer le produit sur trois cuisines centrales',
          description: 'Un mois d’usage continu avec relevés de tenue et retours cuisiniers.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          progress: 30,
          currentScore: 1,
          targetScore: 4,
          deadline: '2027-01-31',
        },
        {
          title: 'Sécuriser la ligne pilote',
          description: 'Obtenir le financement de la ligne de séchage de 50 000 unités par mois.',
          priority: 'HIGH',
          status: 'PENDING',
          progress: 0,
          currentScore: 1,
          targetScore: 4,
          deadline: '2027-03-31',
        },
        {
          title: 'Remplacer le conservateur de synthèse',
          description: 'Formulation naturelle validée sans perte de barrière à l’humidité.',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          progress: 45,
          currentScore: 2,
          targetScore: 4,
          deadline: '2026-12-01',
        },
      ],
    },
  ];
  for (const spec of IMPROVEMENT_PLANS) {
    const planId = did('plan', spec.key);
    await prisma.improvementPlan.upsert({
      where: { id: planId },
      create: {
        id: planId,
        project_id: projectId(spec.project),
        title: spec.title,
        description: spec.description,
        status: spec.status,
        progress: spec.progress,
        deadline: T(`${spec.deadline}T17:00:00.000Z`),
        created_by: spec.createdBy === adminId ? adminId : userId(spec.createdBy),
        created_at: T('2026-10-05T17:00:00.000Z'),
      },
      update: {
        title: spec.title,
        description: spec.description,
        status: spec.status,
        progress: spec.progress,
        deadline: T(`${spec.deadline}T17:00:00.000Z`),
      },
    });

    for (const [index, objective] of spec.objectives.entries()) {
      const objectiveId = did('objective', `${spec.key}:${index}`);
      await prisma.improvementObjective.upsert({
        where: { id: objectiveId },
        create: {
          id: objectiveId,
          plan_id: planId,
          title: objective.title,
          description: objective.description,
          priority: objective.priority,
          status: objective.status,
          progress: objective.progress,
          current_score: objective.currentScore ?? null,
          target_score: objective.targetScore ?? null,
          deadline: T(`${objective.deadline}T17:00:00.000Z`),
          created_at: T('2026-10-05T17:00:00.000Z'),
        },
        update: {
          title: objective.title,
          description: objective.description,
          priority: objective.priority,
          status: objective.status,
          progress: objective.progress,
          current_score: objective.currentScore ?? null,
          target_score: objective.targetScore ?? null,
          deadline: T(`${objective.deadline}T17:00:00.000Z`),
        },
      });
    }
  }

  const CONVERSATIONS: {
    key: string;
    project: string;
    title: string;
    messages: { role: string; content: string; sources?: Record<string, unknown>[] }[];
  }[] = [
    {
      key: 'biocare-1',
      project: 'biocare',
      title: 'Préparation du dossier de subvention',
      messages: [
        {
          role: 'user',
          content: 'Quels sont les points forts de mon dossier pour le programme national d’irrigation intelligente ?',
        },
        {
          role: 'assistant',
          content:
            "Votre dossier repose sur trois atouts : 22 % d’économie d’eau mesurés sur la campagne blé, un taux de renouvellement de 92 % et une méthode de mesure validée avec l’INRAT. Le point à renforcer est la projection financière sur 24 mois, qui conditionne l’arbitrage du comité.",
          sources: [
            { type: 'document', cle: 'funding_dossier', titre: 'Dossier de financement' },
            { type: 'section', cle: 'funding', titre: 'Accès au Financement' },
          ],
        },
        { role: 'user', content: 'Peux-tu me proposer un plan de trésorerie mensuel type ?' },
        {
          role: 'assistant',
          content:
            'Sur la base de votre prévisionnel : encaissements d’abonnement concentrés en juillet-août, décaissements de production répartis. Je recommande une facilité de 180 kTND sur trois mois et un affacturage à 45 jours sur les grands comptes.',
          sources: [
            { type: 'section', cle: 'bp_2.3', titre: 'Plan financier' },
            { type: 'section', cle: 'gbm_18', titre: 'Résumé des coûts et flux de recettes' },
          ],
        },
      ],
    },
    {
      key: 'biocare-2',
      project: 'biocare',
      title: 'Analyse SWOT du projet',
      messages: [
        {
          role: 'user',
          content: "Quel est le risque le plus élevé dans mon analyse SWOT ?",
        },
        {
          role: 'assistant',
          content:
            'La dépendance au réseau LoRaWAN en zones reculées est le risque le plus probable : elle peut immobiliser des parcelles entières pendant une campagne. La mise en cache locale des mesures et une seconde passerelle en sont les correctifs directs.',
          sources: [{ type: 'section', cle: 'gbm_21', titre: 'Analyse SWOT' }],
        },
      ],
    },
    {
      key: 'ecopack-1',
      project: 'ecopack',
      title: 'Préparation de la réévaluation',
      messages: [
        {
          role: 'user',
          content: 'Que me demande le jury avant de réévaluer EcoPack ?',
        },
        {
          role: 'assistant',
          content:
            "Le jury attend deux preuves : une démonstration d'un mois sur trois cuisines centrales et un financement sécurisé de la ligne pilote. Sans ces deux éléments, aucune réévaluation ne sera programmée.",
          sources: [
            { type: 'decision', cle: 'ecopack', titre: 'Décision : réévaluation requise' },
          ],
        },
      ],
    },
  ];
  for (const spec of CONVERSATIONS) {
    const convId = did('conversation', spec.key);
    const ownerProject = DEMO_PROJECTS.find((p) => p.key === spec.project)!;
    await prisma.conversation.upsert({
      where: { id: convId },
      create: {
        id: convId,
        project_id: projectId(spec.project),
        owner_id: userId(
          DEMO_USERS.find((u) => u.email === ownerProject.ownerEmail)!.key,
        ),
        title: spec.title,
        created_at: T('2026-10-04T11:00:00.000Z'),
      },
      update: { title: spec.title },
    });

    await prisma.message.deleteMany({ where: { conversation_id: convId } });
    await prisma.message.createMany({
      data: spec.messages.map((message, index) => ({
        id: did('message', `${spec.key}:${index}`),
        conversation_id: convId,
        role: message.role,
        content: message.content,
        sources: (message.sources ?? undefined) as any,
        context_used: !!message.sources,
        created_at: T(`2026-10-04T11:0${index}:00.000Z`),
      })),
    });
  }

  const INTERACTIONS: { key: string; project: string; step: string; prompt: string; response: string }[] = [
    {
      key: 'i1',
      project: 'biocare',
      step: 'gbm_6',
      prompt: 'Résume le contexte et les objectifs de BioCare en trois points.',
      response:
        '1) Des sols qui se dégradent plus vite qu’ils ne se régénèrent. 2) Des coopératives privées de données fiables. 3) Une fenêtre réglementaire favorable grâce au programme national d’irrigation intelligente.',
    },
    {
      key: 'i2',
      project: 'biocare',
      step: 'gbm_21',
      prompt: 'Quelles sont les principales menaces de la SWOT ?',
      response:
        'La dépendance au réseau LoRaWAN en zones reculées, l’entrée potentielle d’un concurrent disposant d’un réseau de distribution existant et la hausse du coût des composants électroniques.',
    },
    {
      key: 'i3',
      project: 'agrismart',
      step: 'gbm_18',
      prompt: 'Comment améliorer la santé financière d’AgriSmart ?',
      response:
        'Augmenter la part du conditionnement qui porte une marge de 47 % contre 25 % en vrac, et sécuriser une facilité de trésorerie de 300 kTND pour absorber la saisonnalité de la collecte.',
    },
  ];
  for (const spec of INTERACTIONS) {
    const iid = did('aiinteraction', spec.key);
    await prisma.aiInteraction.upsert({
      where: { id: iid },
      create: {
        id: iid,
        project_id: projectId(spec.project),
        step_key: spec.step,
        prompt: spec.prompt,
        response: spec.response,
        model: 'demo-seed',
        tokens_used: 320,
        duration_ms: 840,
        created_at: T('2026-10-04T11:30:00.000Z'),
      },
      update: { prompt: spec.prompt, response: spec.response },
    });
  }
  console.log('    ✅ Analyses IA, plans d’amélioration et conversations');

  for (const spec of NOTIFICATION_SPECS) {
    const nid = did('notification', spec.key);
    await prisma.notification.upsert({
      where: { id: nid },
      create: {
        id: nid,
        user_id: userId(spec.user),
        sender_id: spec.sender
          ? spec.sender === 'admin'
            ? adminId
            : userId(spec.sender)
          : null,
        title: spec.title,
        message: spec.message,
        type: spec.type as any,
        priority: (spec.priority ?? 'MEDIUM') as any,
        resource_type: (spec.resourceType as any) ?? null,
        resource_id: spec.resourceId
          ? COACH_ASSIGNMENTS.some((c) => c.project === spec.resourceId) ||
            DEMO_PROJECTS.some((p) => p.key === spec.resourceId)
            ? projectId(spec.resourceId)
            : DEMO_COHORTS.some((c) => c.key === spec.resourceId)
              ? cohortId(spec.resourceId)
              : DEMO_INCUBATORS.some((i) => i.key === spec.resourceId)
                ? incubatorId(spec.resourceId)
                : null
          : null,
        link: demoNotificationLink(spec.link, spec.resourceId),
        is_read: spec.read ?? false,
        read_at: spec.read ? T(spec.createdAt) : null,
        created_at: T(spec.createdAt),
      },
      update: {
        title: spec.title,
        message: spec.message,
        link: demoNotificationLink(spec.link, spec.resourceId),
        is_read: spec.read ?? false,
        read_at: spec.read ? T(spec.createdAt) : null,
      },
    });
  }
  console.log(`    ✅ ${NOTIFICATION_SPECS.length} notifications`);

  console.log('    ✅ Scénario de démonstration terminé');
}
