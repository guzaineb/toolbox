import { z } from 'zod';

// ── Common input schema (projectId only, userId injected server-side) ──

export const ToolInputSchema = z.object({
  projectId: z.string().min(1).describe('UUID du projet à analyser'),
});

export type ToolInput = z.infer<typeof ToolInputSchema>;

// ── Output schemas ──

// 1. getProjectState
export const ProjectStateOutputSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  maturityLevel: z.string(),
  overallProgress: z.number(),
  completedSteps: z.array(
    z.object({
      stepKey: z.string(),
      title: z.string(),
      phase: z.number(),
      status: z.string(),
      hasData: z.boolean(),
    }),
  ),
  incompleteSteps: z.array(
    z.object({
      stepKey: z.string(),
      title: z.string(),
      phase: z.number(),
      status: z.string(),
      hasData: z.boolean(),
    }),
  ),
  missingInformation: z.array(z.string()),
  strengths: z.array(z.string()),
  weakAreas: z.array(z.string()),
  inconsistencies: z.array(
    z.object({
      area: z.string(),
      description: z.string(),
      severity: z.string(),
    }),
  ),
  healthScore: z.object({
    overall: z.number(),
    categories: z.array(
      z.object({
        label: z.string(),
        score: z.number(),
        maxScore: z.number(),
        weight: z.number(),
      }),
    ),
  }),
  priorities: z.array(
    z.object({
      level: z.string(),
      area: z.string(),
      description: z.string(),
      impact: z.number(),
    }),
  ),
  currentPriority: z
    .object({
      level: z.string(),
      area: z.string(),
      description: z.string(),
      impact: z.number(),
    })
    .nullable(),
  recommendedNextAction: z.string(),
});
export type ProjectStateOutput = z.infer<typeof ProjectStateOutputSchema>;

// 2. getProjectProgress
export const ProjectProgressOutputSchema = z.object({
  overallPercentage: z.number(),
  gbmPercentage: z.number(),
  bpPercentage: z.number(),
  completedCount: z.number(),
  totalCount: z.number(),
  modulePercentages: z.record(z.string(), z.number()),
});
export type ProjectProgressOutput = z.infer<typeof ProjectProgressOutputSchema>;

// 3. getGBM
export const GBMOutputSchema = z.object({
  ideaSketch: z.any().nullable(),
  problemsNeeds: z.any().nullable(),
  pestel: z.any().nullable(),
  objective: z.any().nullable(),
  missionVision: z.any().nullable(),
  contextSummary: z.any().nullable(),
  stakeholder: z.any().nullable(),
  stakeholderMap: z.any().nullable(),
  customerSegment: z.any().nullable(),
  valueProposition: z.any().nullable(),
  testDiscovery: z.any().nullable(),
  valuePropositionPivot: z.any().nullable(),
  customerRelationsChannel: z.any().nullable(),
  customerJourney: z.any().nullable(),
  keyActivitiesResource: z.any().nullable(),
  summaryActivity: z.any().nullable(),
  stepProgresses: z.array(
    z.object({ stepKey: z.string(), status: z.string() }),
  ),
});
export type GBMOutput = z.infer<typeof GBMOutputSchema>;

// 4. getBusinessPlan
export const BusinessPlanOutputSchema = z.object({
  financialPlan: z.any().nullable(),
  managementPlan: z.any().nullable(),
  marketingPlan: z.any().nullable(),
  legalPlan: z.any().nullable(),
  executiveSummary: z.any().nullable(),
  costRevenueSummary: z.any().nullable(),
  costStructure: z.any().nullable(),
  revenueStream: z.any().nullable(),
});
export type BusinessPlanOutput = z.infer<typeof BusinessPlanOutputSchema>;

// 5. getMarket
export const MarketOutputSchema = z.object({
  marketAccess: z.any().nullable(),
  marketingPlan: z.any().nullable(),
  customerSegment: z.any().nullable(),
  customerJourney: z.any().nullable(),
  pestel: z.any().nullable(),
});
export type MarketOutput = z.infer<typeof MarketOutputSchema>;

// 6. getFinancing
export const FinancingOutputSchema = z.object({
  costStructure: z.any().nullable(),
  revenueStream: z.any().nullable(),
  financialPlan: z.any().nullable(),
  fundingAssessment: z.any().nullable(),
  costRevenueSummary: z.any().nullable(),
});
export type FinancingOutput = z.infer<typeof FinancingOutputSchema>;

// 7. getImpact
export const ImpactOutputSchema = z.object({
  impactMeasure: z.any().nullable(),
  indicator: z.any().nullable(),
});
export type ImpactOutput = z.infer<typeof ImpactOutputSchema>;

// 8. getEcoDesign
export const EcoDesignOutputSchema = z.object({
  ecoDesign: z.any().nullable(),
  ecoDesignResult: z.any().nullable(),
});
export type EcoDesignOutput = z.infer<typeof EcoDesignOutputSchema>;

// 9. detectInconsistencies
export const InconsistenciesOutputSchema = z.object({
  inconsistencies: z.array(
    z.object({
      area: z.string(),
      description: z.string(),
      severity: z.string(),
    }),
  ),
  score: z.number(),
  totalChecks: z.number(),
  passedChecks: z.number(),
});
export type InconsistenciesOutput = z.infer<typeof InconsistenciesOutputSchema>;

// 10. calculateHealthScore
export const HealthScoreOutputSchema = z.object({
  overall: z.number(),
  completenessScore: z.number(),
  progressScore: z.number(),
  coherenceScore: z.number(),
  maturityScore: z.number(),
  strengths: z.array(z.string()),
  weakAreas: z.array(z.string()),
});
export type HealthScoreOutput = z.infer<typeof HealthScoreOutputSchema>;

// 11. getNextBestAction
export const NextBestActionOutputSchema = z.object({
  currentPriority: z
    .object({
      level: z.string(),
      area: z.string(),
      description: z.string(),
      impact: z.number(),
    })
    .nullable(),
  recommendedNextAction: z.string(),
  priorities: z.array(
    z.object({
      level: z.string(),
      area: z.string(),
      description: z.string(),
      impact: z.number(),
    }),
  ),
  incompleteSteps: z.array(
    z.object({
      stepKey: z.string(),
      title: z.string(),
      phase: z.number(),
      status: z.string(),
    }),
  ),
});
export type NextBestActionOutput = z.infer<typeof NextBestActionOutputSchema>;

// ── Tool definitions for Groq function calling ──

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'getProjectState',
      description:
        "Obtient l'état complet d'un projet : maturité, avancement, étapes complétées/incomplètes, informations manquantes, forces, faiblesses, incohérences, score de santé, priorités et prochaine action recommandée. Utilise quand l'utilisateur demande un aperçu global du projet.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getProjectProgress',
      description:
        "Obtient les pourcentages d'avancement du projet (global, GBM, Business Plan) et la liste des étapes avec leur statut. Utilise quand l'utilisateur demande l'avancement ou le pourcentage de complétion.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getGBM',
      description:
        "Obtient les données du Guide de Business Model : idée, problèmes/besoins, PESTEL, objectifs, mission/vision, parties prenantes, segments clientèle, proposition de valeur, tests, parcours client, activités/ressources. Utilise quand l'utilisateur pose une question sur le contenu d'une étape GBM spécifique.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getBusinessPlan',
      description:
        "Obtient les données du Business Plan : plan financier, gestion, marketing, légal, résumé exécutif, coûts/revenus. Utilise quand l'utilisateur pose une question sur le Business Plan ou une de ses sections.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getMarket',
      description:
        "Obtient les données marché : accès marché, plan marketing, segments clientèle, parcours client, PESTEL. Utilise quand l'utilisateur demande des informations sur le marché, la clientèle ou la concurrence.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getFinancing',
      description:
        "Obtient les données financières : coûts, revenus, plan financier, évaluation du financement, résumé coûts/revenus. Utilise quand l'utilisateur demande des informations sur les finances, le financement ou la viabilité économique.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getImpact',
      description:
        "Obtient les données d'impact : mesures d'impact (environnemental, social, économique) et indicateurs. Utilise quand l'utilisateur demande des informations sur l'impact ou les KPIs.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getEcoDesign',
      description:
        "Obtient les données d'écoconception : stratégie écologique, cycle de vie, résultats d'amélioration. Utilise quand l'utilisateur demande des informations sur l'écoconception ou la durabilité.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'detectInconsistencies',
      description:
        "Détecte les incohérences entre les données du projet (ex: coûts sans revenus, SWOT déséquilibré, données manquantes critiques). Utilise quand l'utilisateur demande de vérifier la cohérence du projet.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'calculateHealthScore',
      description:
        "Calcule le score de santé global du projet (0-100) avec décomposition par catégorie : complétude, avancement, cohérence, maturité. Utilise quand l'utilisateur veut une évaluation de la santé du projet.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getNextBestAction',
      description:
        "Identifie la priorité courante et la prochaine action recommandée pour faire avancer le projet. Utilise quand l'utilisateur demande quoi faire en priorité ou quelle est la prochaine étape.",
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid', description: 'UUID du projet' },
        },
        required: ['projectId'],
      },
    },
  },
];
